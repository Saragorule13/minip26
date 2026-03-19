from __future__ import annotations

import re
from pathlib import Path

from semvi.codeowners import owners_for_path
from semvi.models import Finding, ScanContext


SECRET_PATTERNS: list[tuple[str, str, str, str]] = [
    ("secret.aws", "critical", r"AKIA[0-9A-Z]{16}", "Possible AWS access key committed."),
    (
        "secret.github",
        "high",
        r"github_pat_[A-Za-z0-9_]{20,}",
        "Possible GitHub personal access token committed.",
    ),
    (
        "secret.private_key",
        "critical",
        r"-----BEGIN (RSA|EC|OPENSSH|DSA|PRIVATE KEY)",
        "Private key material detected in repository content.",
    ),
    (
        "secret.jwt",
        "medium",
        r"eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9._-]+\.[A-Za-z0-9._-]+",
        "JWT-like token found in tracked content.",
    ),
]

RISK_PATTERNS: list[tuple[str, str, str, str, str]] = [
    (
        "risk.eval",
        "high",
        r"\beval\s*\(",
        "Dynamic evaluation present.",
        "Replace eval-style execution with explicit parsing or dispatch logic.",
    ),
    (
        "risk.exec",
        "high",
        r"\b(exec|system|popen|Runtime\.getRuntime\(\)\.exec)\b",
        "Shell execution primitive found.",
        "Validate inputs, constrain commands, and prefer parameterized APIs.",
    ),
    (
        "risk.deserialize",
        "high",
        r"\b(pickle\.loads|yaml\.load\(|ObjectInputStream|BinaryFormatter)\b",
        "Unsafe deserialization primitive present.",
        "Use safe loaders or signed payloads for serialized data.",
    ),
    (
        "risk.debug",
        "medium",
        r"\b(DEBUG\s*=\s*True|NODE_ENV\s*=\s*[\"']development[\"'])",
        "Debug configuration appears committed.",
        "Move non-production config out of tracked defaults.",
    ),
    (
        "risk.cors",
        "medium",
        r"Access-Control-Allow-Origin['\"]?\s*[:=]\s*['\"]\*['\"]",
        "Wildcard CORS policy detected.",
        "Restrict CORS to trusted origins only.",
    ),
]

MALICIOUS_PATTERNS: list[tuple[str, str, str, str, str]] = [
    (
        "malicious.remote_exec",
        "critical",
        r"(curl|wget).{0,120}(\||&&).{0,40}(sh|bash|zsh|python|node)\b",
        "Possible remote payload execution chain detected.",
        "Block the change, inspect commit provenance, and remove the download-and-execute path immediately.",
    ),
    (
        "malicious.dynamic_exec",
        "critical",
        r"(exec|eval)\s*\(\s*(base64\.(b64decode|decodebytes)|atob|Buffer\.from).{0,120}\)",
        "Encoded payload execution pattern detected.",
        "Treat this as a likely backdoor until proven otherwise and replace it with explicit safe logic.",
    ),
    (
        "malicious.exfiltration",
        "critical",
        r"(requests\.(post|get)|fetch|axios\.(post|get)|urllib\.request).{0,160}(token|secret|password|key|credential|cookie|session)",
        "Possible credential or session exfiltration path detected.",
        "Inspect outbound telemetry code and remove any path that can transmit secrets or session material.",
    ),
    (
        "malicious.persistence",
        "high",
        r"(/etc/cron|crontab|schtasks|launchctl|systemctl).{0,120}(curl|wget|powershell|cmd|bash|sh)",
        "Persistence-oriented execution pattern detected.",
        "Review for unauthorized persistence mechanisms and revert the change if not explicitly required.",
    ),
    (
        "malicious.disable_security",
        "high",
        r"(verify\s*=\s*False|sslopt\s*=\s*\{[^}]*CERT_NONE|StrictHostKeyChecking=no|setenforce\s+0)",
        "Code appears to disable a security boundary.",
        "Restore the security control and require an approved exception process for any temporary bypass.",
    ),
]


TEXT_EXTENSIONS = {
    ".py",
    ".js",
    ".ts",
    ".tsx",
    ".jsx",
    ".java",
    ".rb",
    ".go",
    ".rs",
    ".php",
    ".env",
    ".json",
    ".yaml",
    ".yml",
    ".toml",
    ".ini",
    ".conf",
    ".txt",
    ".md",
}


def should_ignore(path: str, config: dict) -> bool:
    return any(path.startswith(prefix) for prefix in config.get("ignore_paths", []))


def is_text_like(path: Path) -> bool:
    return path.suffix.lower() in TEXT_EXTENSIONS or path.name in {
        "Dockerfile",
        "Procfile",
        "requirements.txt",
    }


def lane_for_severity(severity: str) -> str:
    if severity in {"critical", "high"}:
        return "fix-now"
    if severity == "medium":
        return "watch"
    return "knowledge"


def line_number(content: str, offset: int) -> int:
    return content.count("\n", 0, offset) + 1


def extract_snippet(content: str, start: int, end: int, radius: int = 1) -> str:
    lines = content.splitlines()
    hit_line = line_number(content, start) - 1
    begin = max(0, hit_line - radius)
    finish = min(len(lines), hit_line + radius + 1)
    snippet_lines: list[str] = []
    for index in range(begin, finish):
        snippet_lines.append(f"{index + 1}: {lines[index][:220]}")
    return "\n".join(snippet_lines)


def scan_path(path: Path, context: ScanContext) -> list[Finding]:
    relative = path.relative_to(context.repo_path).as_posix()
    if should_ignore(relative, context.config):
        return []

    findings: list[Finding] = []
    owners = owners_for_path(relative, context.codeowners)
    new_file = relative in context.changed_files

    if any(marker in path.name.lower() for marker in context.config.get("memory_artifacts", [])):
        findings.append(
            Finding(
                kind="memory",
                title="Potential memory or state artifact committed",
                severity="high",
                path=relative,
                line=None,
                summary="The file name suggests cached secrets, runtime state, or user transcript data may be tracked.",
                remediation="Remove the artifact from version control, rotate exposed credentials, and add a gitignore rule.",
                rule_id="memory.artifact",
                confidence="medium",
                owners=owners,
                tags=["memory", "privacy"],
                lane="fix-now",
                scope="data-exposure",
                newly_introduced=new_file,
                snippet=path.name,
            )
        )

    if not is_text_like(path):
        return findings

    try:
        content = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return findings

    for rule_id, severity, pattern, summary in SECRET_PATTERNS:
        match = re.search(pattern, content, flags=re.MULTILINE)
        if not match:
            continue
        findings.append(
            Finding(
                kind="secret",
                title="Potential secret exposure",
                severity=severity,
                path=relative,
                line=line_number(content, match.start()),
                summary=summary,
                remediation="Move the secret to a secrets manager and rotate the credential immediately.",
                evidence=match.group(0)[:32],
                snippet=extract_snippet(content, match.start(), match.end()),
                rule_id=rule_id,
                confidence="high",
                owners=owners,
                tags=["secret", "credential"],
                lane=lane_for_severity(severity),
                scope="identity",
                newly_introduced=new_file,
            )
        )

    for rule_id, severity, pattern, summary, remediation in RISK_PATTERNS:
        for match in re.finditer(pattern, content, flags=re.MULTILINE):
            findings.append(
                Finding(
                    kind="risk",
                    title=summary,
                    severity=severity,
                    path=relative,
                    line=line_number(content, match.start()),
                    summary=summary,
                    remediation=remediation,
                    evidence=match.group(0)[:80],
                    snippet=extract_snippet(content, match.start(), match.end()),
                    rule_id=rule_id,
                    confidence="medium",
                    owners=owners,
                    tags=["code-risk"],
                    lane=lane_for_severity(severity),
                    scope="application",
                    newly_introduced=new_file,
                )
            )

    for rule_id, severity, pattern, summary, remediation in MALICIOUS_PATTERNS:
        for match in re.finditer(pattern, content, flags=re.MULTILINE | re.IGNORECASE):
            findings.append(
                Finding(
                    kind="malicious",
                    title=summary,
                    severity=severity,
                    path=relative,
                    line=line_number(content, match.start()),
                    summary=summary,
                    remediation=remediation,
                    evidence=match.group(0)[:160],
                    snippet=extract_snippet(content, match.start(), match.end(), radius=2),
                    rule_id=rule_id,
                    confidence="high",
                    owners=owners,
                    tags=["malicious-code", "backdoor"],
                    lane="fix-now",
                    scope="application",
                    newly_introduced=new_file,
                )
            )
    return findings


def scan_repository(context: ScanContext) -> list[Finding]:
    findings: list[Finding] = []
    for path in Path(context.repo_path).rglob("*"):
        if path.is_dir():
            continue
        findings.extend(scan_path(path, context))
    return findings
