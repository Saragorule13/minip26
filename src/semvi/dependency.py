from __future__ import annotations

import json
import re
import tomllib
import urllib.error
import urllib.request
from pathlib import Path

from semvi.models import Finding


def collect_dependencies(repo_path: str) -> list[dict[str, str]]:
    dependencies: list[dict[str, str]] = []
    root = Path(repo_path)

    package_lock = root / "package-lock.json"
    if package_lock.exists():
        try:
            payload = json.loads(package_lock.read_text(encoding="utf-8"))
            packages = payload.get("packages", {})
            for package_path, meta in packages.items():
                if not package_path or "version" not in meta or "name" not in meta:
                    continue
                dependencies.append(
                    {
                        "ecosystem": "npm",
                        "name": meta["name"],
                        "version": str(meta["version"]),
                        "source": "package-lock.json",
                    }
                )
        except json.JSONDecodeError:
            pass

    requirements = root / "requirements.txt"
    if requirements.exists():
        for line in requirements.read_text(encoding="utf-8").splitlines():
            stripped = line.strip()
            if not stripped or stripped.startswith("#") or "==" not in stripped:
                continue
            name, version = stripped.split("==", 1)
            dependencies.append(
                {
                    "ecosystem": "PyPI",
                    "name": name.strip(),
                    "version": version.strip(),
                    "source": "requirements.txt",
                }
            )

    poetry_lock = root / "poetry.lock"
    if poetry_lock.exists():
        content = poetry_lock.read_text(encoding="utf-8")
        package_blocks = re.findall(
            r'\[\[package\]\]\s+name = "([^"]+)"\s+version = "([^"]+)"',
            content,
            flags=re.MULTILINE,
        )
        for name, version in package_blocks:
            dependencies.append(
                {
                    "ecosystem": "PyPI",
                    "name": name,
                    "version": version,
                    "source": "poetry.lock",
                }
                )
    pipfile_lock = root / "Pipfile.lock"
    if pipfile_lock.exists():
        try:
            payload = json.loads(pipfile_lock.read_text(encoding="utf-8"))
            for section in ("default", "develop"):
                for name, meta in payload.get(section, {}).items():
                    version = str(meta.get("version", "")).lstrip("=")
                    if version:
                        dependencies.append(
                            {
                                "ecosystem": "PyPI",
                                "name": name,
                                "version": version,
                                "source": "Pipfile.lock",
                            }
                        )
        except json.JSONDecodeError:
            pass

    cargo_lock = root / "Cargo.lock"
    if cargo_lock.exists():
        try:
            payload = tomllib.loads(cargo_lock.read_text(encoding="utf-8"))
            for package in payload.get("package", []):
                name = package.get("name")
                version = package.get("version")
                if name and version:
                    dependencies.append(
                        {
                            "ecosystem": "crates.io",
                            "name": name,
                            "version": str(version),
                            "source": "Cargo.lock",
                        }
                    )
        except tomllib.TOMLDecodeError:
            pass

    go_sum = root / "go.sum"
    if go_sum.exists():
        seen_go: set[tuple[str, str]] = set()
        for line in go_sum.read_text(encoding="utf-8").splitlines():
            parts = line.split()
            if len(parts) < 2:
                continue
            name = parts[0]
            version = parts[1]
            if version.endswith("/go.mod"):
                version = version[:-7]
            key = (name, version)
            if key in seen_go:
                continue
            seen_go.add(key)
            dependencies.append(
                {
                    "ecosystem": "Go",
                    "name": name,
                    "version": version,
                    "source": "go.sum",
                }
            )
    return dependencies


def osv_severity(vuln: dict) -> str:
    severity_entries = vuln.get("severity", [])
    for entry in severity_entries:
        if entry.get("type") != "CVSS_V3":
            continue
        score_text = entry.get("score", "")
        match = re.search(r"CVSS:3\.[01]/AV:[A-Z]/AC:[A-Z]/PR:[A-Z]/UI:[A-Z]/S:[A-Z]/C:[A-Z]/I:[A-Z]/A:[A-Z].*?/([0-9.]+)$", score_text)
        if match:
            score = float(match.group(1))
        else:
            try:
                score = float(score_text)
            except ValueError:
                continue
        if score >= 9.0:
            return "critical"
        if score >= 7.0:
            return "high"
        if score >= 4.0:
            return "medium"
        return "low"
    return "high"


def osv_query(dependencies: list[dict[str, str]]) -> list[dict]:
    if not dependencies:
        return []
    payload = {
        "queries": [
            {
                "package": {"name": dep["name"], "ecosystem": dep["ecosystem"]},
                "version": dep["version"],
            }
            for dep in dependencies
        ]
    }
    request = urllib.request.Request(
        "https://api.osv.dev/v1/querybatch",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            return json.loads(response.read().decode("utf-8")).get("results", [])
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError):
        return []


def dependency_findings(repo_path: str, changed_files: set[str]) -> list[Finding]:
    dependencies = collect_dependencies(repo_path)
    results = osv_query(dependencies)
    findings: list[Finding] = []
    if not results:
        return findings

    for dep, result in zip(dependencies, results):
        vulns = result.get("vulns", [])
        for vuln in vulns:
            aliases = vuln.get("aliases", [])
            vuln_id = aliases[0] if aliases else vuln.get("id", "OSV")
            severity = osv_severity(vuln)
            summary = vuln.get("summary") or "Known vulnerable dependency version detected."
            findings.append(
                Finding(
                    kind="cve",
                    title=f"Dependency vulnerability in {dep['name']}@{dep['version']}",
                    severity=severity,
                    path=dep["source"],
                    line=None,
                    summary=summary,
                    remediation="Upgrade to a patched dependency version and redeploy affected services.",
                    evidence=f"{vuln_id} affecting {dep['name']}@{dep['version']}",
                    snippet=f"{dep['source']}: {dep['name']}=={dep['version']}",
                    rule_id="dependency.osv",
                    confidence="high",
                    tags=["dependency", dep["ecosystem"].lower()],
                    lane="fix-now" if severity in {"critical", "high"} else "watch",
                    scope="supply-chain",
                    newly_introduced=dep["source"] in changed_files,
                )
            )
    return findings
