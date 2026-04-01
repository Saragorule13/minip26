# Semvi

Semvi is a GitHub-native push scanner that can be dropped into a repository and immediately start looking for:

- memory and state leakage artifacts such as `.env`, heap dumps, sessions, logs, and transcript-style files
- risky code paths such as `eval`, unsafe deserialization, shell execution, permissive debug modes, and wildcard CORS
- malicious code and backdoor patterns such as remote download-and-exec chains, exfiltration, encoded payload execution, persistence hooks, and disabled security boundaries
- supply-chain CVEs using OSV when dependency lockfiles are present
- owner-aware remediation routes using `CODEOWNERS`

This is designed to be more operational than a generic scanner. It emphasizes what changed in the current push, who should care first, and how to notify maintainers through GitHub issues or external webhooks.

## Why it stands out

- Change-aware triage: findings introduced in the current push are surfaced separately from background debt.
- Memory leak lens: Semvi treats runtime-state artifacts and transcript files as first-class risks instead of focusing only on secrets.
- Backdoor lens: Semvi looks for common real-world malicious-code patterns and includes the suspicious code snippet in the report for fast triage.
- CODEOWNERS routing: each finding is assigned to probable maintainers from repo ownership rules.
- Exploit-path grouping: output is structured into response lanes (`fix-now`, `watch`, `knowledge`) so maintainers can act without parsing raw scanner output.
- GitHub-native install: a repo can use this as an action on `push` with one workflow file.

## Quick install into another repository

Add this workflow:

```yaml
name: Semvi

on:
  push:
    branches:
      - main
      - master

permissions:
  contents: read
  issues: write

jobs:
  semvi:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: your-org/semvi@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          webhook-url: ${{ secrets.SEMVI_WEBHOOK_URL }}
```

Add an optional `.semvi.yml` to tune thresholds and ignored paths:

```yaml
severity_threshold: medium
notify:
  github_issue: true
  webhook: true
ignore_paths:
  - fixtures/
  - docs/generated/
  - .semvi-out/
```

## Local usage

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e .
semvi scan --repo . --report-dir .semvi-out --notify
```

## Real-world feature roadmap

- Incremental baseline suppression so only newly introduced risks alert by default.
- SARIF export for GitHub code scanning.
- Branch protection hooks that can block pushes when a secret or critical CVE lands.
- Auto-remediation suggestions for dependency upgrades and risky defaults.
- Optional SMTP/email channel for orgs that need inbox delivery instead of webhook delivery.
