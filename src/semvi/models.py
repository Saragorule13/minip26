from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


SEVERITY_ORDER = {
    "critical": 4,
    "high": 3,
    "medium": 2,
    "low": 1,
    "info": 0,
}


@dataclass(slots=True)
class Finding:
    kind: str
    title: str
    severity: str
    path: str
    line: int | None
    summary: str
    remediation: str
    evidence: str = ""
    snippet: str = ""
    rule_id: str = ""
    confidence: str = "medium"
    owners: list[str] = field(default_factory=list)
    tags: list[str] = field(default_factory=list)
    lane: str = "watch"
    scope: str = "repository"
    newly_introduced: bool = False

    def as_dict(self) -> dict[str, Any]:
        return {
            "kind": self.kind,
            "title": self.title,
            "severity": self.severity,
            "path": self.path,
            "line": self.line,
            "summary": self.summary,
            "remediation": self.remediation,
            "evidence": self.evidence,
            "snippet": self.snippet,
            "rule_id": self.rule_id,
            "confidence": self.confidence,
            "owners": self.owners,
            "tags": self.tags,
            "lane": self.lane,
            "scope": self.scope,
            "newly_introduced": self.newly_introduced,
        }


@dataclass(slots=True)
class ScanContext:
    repo_path: str
    changed_files: set[str]
    codeowners: list[tuple[str, list[str]]]
    config: dict[str, Any]
