from __future__ import annotations

import json
import subprocess
from pathlib import Path


def _git(repo_path: str, args: list[str]) -> str:
    process = subprocess.run(
        ["git", *args],
        cwd=repo_path,
        capture_output=True,
        text=True,
        check=False,
    )
    if process.returncode != 0:
        return ""
    return process.stdout.strip()


def load_changed_files(repo_path: str) -> set[str]:
    event_path = Path.cwd() / ".github-event-fallback"
    github_event_path = Path(
        __import__("os").environ.get("GITHUB_EVENT_PATH", str(event_path))
    )
    before = ""
    after = "HEAD"
    if github_event_path.exists():
        try:
            payload = json.loads(github_event_path.read_text(encoding="utf-8"))
            before = payload.get("before", "")
            after = payload.get("after", after)
        except json.JSONDecodeError:
            pass

    if before and after:
        diff_output = _git(repo_path, ["diff", "--name-only", before, after])
    else:
        diff_output = _git(repo_path, ["diff", "--name-only", "HEAD~1", "HEAD"])
    if not diff_output:
        diff_output = _git(repo_path, ["ls-files"])
    return {line for line in diff_output.splitlines() if line.strip()}
