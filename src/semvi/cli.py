from __future__ import annotations

import argparse
import os
import sys

from semvi.codeowners import load_codeowners
from semvi.config import load_config
from semvi.dependency import dependency_findings
from semvi.detectors import scan_repository
from semvi.git_utils import load_changed_files
from semvi.models import SEVERITY_ORDER, ScanContext
from semvi.notify import notify_github_issue, notify_webhook
from semvi.report import render_markdown, write_outputs


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="semvi")
    subparsers = parser.add_subparsers(dest="command", required=True)

    scan = subparsers.add_parser("scan")
    scan.add_argument("--repo", default=".")
    scan.add_argument("--config", default=os.environ.get("SEMVI_CONFIG", ".semvi.yml"))
    scan.add_argument("--report-dir", default=".semvi-out")
    scan.add_argument("--notify", action="store_true")
    return parser


def severity_threshold(config: dict) -> str:
    return os.environ.get("SEMVI_SEVERITY_THRESHOLD", config["severity_threshold"])


def should_fail(findings: list, threshold: str) -> bool:
    limit = SEVERITY_ORDER.get(threshold, SEVERITY_ORDER["high"])
    return any(SEVERITY_ORDER[item.severity] >= limit for item in findings)


def run_scan(args: argparse.Namespace) -> int:
    config = load_config(args.config)
    changed_files = load_changed_files(args.repo)
    context = ScanContext(
        repo_path=args.repo,
        changed_files=changed_files,
        codeowners=load_codeowners(args.repo),
        config=config,
    )

    findings = scan_repository(context)
    findings.extend(dependency_findings(args.repo, changed_files))
    markdown_path, json_path = write_outputs(
        args.report_dir,
        config["report_title"],
        findings,
    )
    report_markdown = render_markdown(config["report_title"], findings)

    if args.notify:
        if config["notify"].get("github_issue", False):
            notify_github_issue(findings, report_markdown)
        if config["notify"].get("webhook", False):
            notify_webhook(
                findings,
                report_markdown,
                os.environ.get("SEMVI_WEBHOOK_URL", ""),
            )

    print(f"Semvi report written to {markdown_path}")
    print(f"Semvi summary written to {json_path}")
    return 1 if should_fail(findings, severity_threshold(config)) else 0


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    if args.command == "scan":
        return run_scan(args)
    return 0


if __name__ == "__main__":
    sys.exit(main())
