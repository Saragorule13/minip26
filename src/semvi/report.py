from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

from semvi.models import Finding, SEVERITY_ORDER


def sort_findings(findings: list[Finding]) -> list[Finding]:
    return sorted(
        findings,
        key=lambda item: (
            -SEVERITY_ORDER[item.severity],
            item.path,
            item.line or 0,
            item.title,
        ),
    )


def summarize(findings: list[Finding]) -> dict:
    severity_counts = Counter(finding.severity for finding in findings)
    lane_counts = Counter(finding.lane for finding in findings)
    changed_introductions = sum(1 for finding in findings if finding.newly_introduced)
    owner_counts = Counter(
        owner for finding in findings for owner in (finding.owners or ["unassigned"])
    )
    return {
        "total_findings": len(findings),
        "severity_counts": dict(severity_counts),
        "lane_counts": dict(lane_counts),
        "newly_introduced_findings": changed_introductions,
        "top_owners": owner_counts.most_common(5),
    }


def _format_finding(finding: Finding) -> str:
    owner_text = ", ".join(finding.owners) if finding.owners else "unassigned"
    location = f"{finding.path}:{finding.line}" if finding.line else finding.path
    change_tag = "new on this push" if finding.newly_introduced else "pre-existing"
    snippet_block = ""
    if finding.snippet:
        snippet_block = f"  suspicious code:\n```text\n{finding.snippet}\n```\n"
    return (
        f"- [{finding.severity.upper()}] {finding.title} in `{location}`\n"
        f"  lane: `{finding.lane}` | owners: `{owner_text}` | scope: `{finding.scope}` | {change_tag}\n"
        f"  why it matters: {finding.summary}\n"
        f"  evidence: {finding.evidence or 'n/a'}\n"
        f"  fix: {finding.remediation}\n"
        f"{snippet_block}"
    )


def render_markdown(report_title: str, findings: list[Finding]) -> str:
    sorted_findings = sort_findings(findings)
    summary = summarize(sorted_findings)
    hotspot_text = ", ".join(
        f"{owner} ({count})" for owner, count in summary["top_owners"]
    ) or "No owner data available"
    lines = [
        f"# {report_title}",
        "",
        "## Signal",
        f"- Total findings: {summary['total_findings']}",
        f"- Newly introduced on this push: {summary['newly_introduced_findings']}",
        f"- Severity counts: {summary['severity_counts']}",
        f"- Response lanes: {summary['lane_counts']}",
        f"- Hotspot owners: {hotspot_text}",
        "",
        "## Standout Features In This Digest",
        "- Change-aware prioritization highlights issues introduced in the current push.",
        "- CODEOWNERS routing shows who should own remediation first.",
        "- Memory artifact detection catches logs, heap dumps, sessions, and transcript-style leaks.",
        "- Supply-chain enrichment checks lockfiles against OSV when network access is available.",
        "- Malicious-code reporting includes the suspicious code excerpt directly in the digest.",
        "",
        "## Findings",
    ]
    if not sorted_findings:
        lines.append("- No findings detected.")
    else:
        for finding in sorted_findings:
            lines.append(_format_finding(finding))
    return "\n".join(lines) + "\n"


def write_outputs(report_dir: str, report_title: str, findings: list[Finding]) -> tuple[str, str]:
    output_dir = Path(report_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    markdown_path = output_dir / "semvi-report.md"
    json_path = output_dir / "semvi-summary.json"
    markdown_path.write_text(render_markdown(report_title, findings), encoding="utf-8")
    json_path.write_text(
        json.dumps(
            {
                "summary": summarize(findings),
                "findings": [finding.as_dict() for finding in sort_findings(findings)],
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    return str(markdown_path), str(json_path)
