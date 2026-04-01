from __future__ import annotations

import json
from pathlib import Path
from typing import Any

DEFAULT_CONFIG: dict[str, Any] = {
    "severity_threshold": "high",
    "report_title": "Semvi Repository Risk Digest",
    "notify": {
        "github_issue": True,
        "webhook": False,
    },
    "ignore_paths": [".git/", "node_modules/", ".venv/", "dist/", "build/", ".semvi-out/"],
    "memory_artifacts": [
        ".env",
        ".pem",
        ".p12",
        ".sqlite",
        ".db",
        ".log",
        "heapdump",
        "session",
        "transcript",
        "conversation",
    ],
}


def deep_merge(base: dict[str, Any], override: dict[str, Any]) -> dict[str, Any]:
    merged = dict(base)
    for key, value in override.items():
        if isinstance(value, dict) and isinstance(merged.get(key), dict):
            merged[key] = deep_merge(merged[key], value)
        else:
            merged[key] = value
    return merged


def load_config(config_path: str | None) -> dict[str, Any]:
    if not config_path:
        return DEFAULT_CONFIG

    path = Path(config_path)
    if not path.exists():
        return DEFAULT_CONFIG

    loaded = _load_structured_text(path.read_text(encoding="utf-8"))
    return deep_merge(DEFAULT_CONFIG, loaded)


def _coerce_scalar(value: str) -> Any:
    lowered = value.lower()
    if lowered == "true":
        return True
    if lowered == "false":
        return False
    if value.isdigit():
        return int(value)
    return value.strip("'\"")


def _load_structured_text(content: str) -> dict[str, Any]:
    stripped = content.strip()
    if not stripped:
        return {}
    if stripped.startswith("{"):
        return json.loads(stripped)

    root: dict[str, Any] = {}
    stack: list[tuple[int, dict[str, Any] | list[Any]]] = [(-1, root)]
    lines = content.splitlines()

    for index, raw_line in enumerate(lines):
        if not raw_line.strip() or raw_line.lstrip().startswith("#"):
            continue
        indent = len(raw_line) - len(raw_line.lstrip(" "))
        line = raw_line.strip()

        while len(stack) > 1 and indent <= stack[-1][0]:
            stack.pop()
        container = stack[-1][1]

        if line.startswith("- "):
            if not isinstance(container, list):
                continue
            container.append(_coerce_scalar(line[2:].strip()))
            continue

        if ":" not in line or not isinstance(container, dict):
            continue
        key, value = line.split(":", 1)
        key = key.strip()
        value = value.strip()
        if value:
            container[key] = _coerce_scalar(value)
            continue

        next_kind = "dict"
        for future in lines[index + 1 :]:
            if not future.strip() or future.lstrip().startswith("#"):
                continue
            future_indent = len(future) - len(future.lstrip(" "))
            if future_indent <= indent:
                break
            next_kind = "list" if future.strip().startswith("- ") else "dict"
            break

        if next_kind == "list":
            new_list: list[Any] = []
            container[key] = new_list
            stack.append((indent, new_list))
        else:
            new_dict: dict[str, Any] = {}
            container[key] = new_dict
            stack.append((indent, new_dict))
    return root
