from __future__ import annotations

import json
import os
import urllib.error
import urllib.request

from semvi.models import Finding
from semvi.report import summarize


def _request(url: str, payload: dict | None, headers: dict[str, str], method: str = "POST") -> dict | None:
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8") if payload is not None else None,
        headers=headers,
        method=method,
    )
    with urllib.request.urlopen(request, timeout=20) as response:
        body = response.read().decode("utf-8")
        return json.loads(body) if body else None


def notify_webhook(findings: list[Finding], report_markdown: str, webhook_url: str) -> bool:
    if not webhook_url:
        return False
    payload = {
        "text": "Semvi detected repository risk activity.",
        "summary": summarize(findings),
        "report": report_markdown,
    }
    try:
        _request(webhook_url, payload, {"Content-Type": "application/json"})
        return True
    except (urllib.error.URLError, TimeoutError):
        return False


def notify_github_issue(findings: list[Finding], report_markdown: str) -> bool:
    token = os.environ.get("SEMVI_GITHUB_TOKEN") or os.environ.get("GITHUB_TOKEN")
    repository = os.environ.get("GITHUB_REPOSITORY")
    if not token or not repository:
        return False

    title = "Semvi Risk Digest"
    summary = summarize(findings)
    payload = {
        "title": title,
        "body": (
            f"{report_markdown[:63000]}\n"
            f"\nMaintainer routing snapshot: `{summary['top_owners']}`\n"
            "\nThis issue is updated by Semvi on every push instead of creating alert spam."
        ),
    }
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
    }
    try:
        existing = _request(
            f"https://api.github.com/repos/{repository}/issues?state=open&per_page=100",
            None,
            headers,
            method="GET",
        )
        issue_number = next(
            (issue["number"] for issue in (existing or []) if issue.get("title") == title),
            None,
        )
        if issue_number is not None:
            _request(
                f"https://api.github.com/repos/{repository}/issues/{issue_number}",
                {"body": payload["body"]},
                headers,
                method="PATCH",
            )
            return True
        _request(f"https://api.github.com/repos/{repository}/issues", payload, headers)
        return True
    except (urllib.error.URLError, TimeoutError):
        return False
