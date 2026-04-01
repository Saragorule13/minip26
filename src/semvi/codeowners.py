from __future__ import annotations

from pathlib import Path
from typing import Iterable


def load_codeowners(repo_path: str) -> list[tuple[str, list[str]]]:
    candidates = [
        Path(repo_path) / "CODEOWNERS",
        Path(repo_path) / ".github" / "CODEOWNERS",
        Path(repo_path) / "docs" / "CODEOWNERS",
    ]
    for candidate in candidates:
        if candidate.exists():
            return _parse_codeowners(candidate.read_text(encoding="utf-8"))
    return []


def _parse_codeowners(content: str) -> list[tuple[str, list[str]]]:
    rules: list[tuple[str, list[str]]] = []
    for raw_line in content.splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        parts = line.split()
        if len(parts) < 2:
            continue
        rules.append((parts[0], parts[1:]))
    return rules


def owners_for_path(path: str, rules: Iterable[tuple[str, list[str]]]) -> list[str]:
    owners: list[str] = []
    for pattern, assigned in rules:
        normalized = pattern.lstrip("/")
        if normalized.endswith("*"):
            normalized = normalized[:-1]
        if not normalized or path.startswith(normalized):
            owners = assigned
        elif path == normalized:
            owners = assigned
    return owners
