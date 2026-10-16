#!/usr/bin/env python3
"""Structural lint for the content wiki. Usage: lint_wiki.py <root> [--db path/to/content.sqlite]"""

from __future__ import annotations

import re
import sqlite3
import sys
from pathlib import Path
from urllib.parse import unquote

CONCEPT_ROOTS = ("raw", "wiki")
RESERVED = {"index.md", "log.md"}
REQUIRED = ("type", "title", "description", "status")
STATUSES = {"draft", "stable", "deprecated"}
LINK = re.compile(r"(?<!!)\[[^\]]+\]\(([^)]+)\)")


def parse_frontmatter(text: str) -> tuple[dict[str, str], str | None]:
    if not text.startswith("---\n"):
        return {}, "missing YAML frontmatter"
    end = text.find("\n---\n", 4)
    if end == -1:
        return {}, "frontmatter is not closed"
    fields: dict[str, str] = {}
    for line in text[4:end].splitlines():
        if line and not line[0].isspace() and ":" in line:
            key, value = line.split(":", 1)
            fields[key.strip()] = value.strip()
    return fields, None


def validate_page(path: Path, root: Path) -> list[str]:
    rel = path.relative_to(root)
    fields, err = parse_frontmatter(path.read_text(encoding="utf-8"))
    if err:
        return [f"{rel}: {err}"]
    errors = [f"{rel}: missing required '{k}'" for k in REQUIRED if not fields.get(k)]
    if fields.get("status") and fields["status"] not in STATUSES:
        errors.append(f"{rel}: invalid status '{fields['status']}'")
    return errors


def validate_links(path: Path, root: Path) -> list[str]:
    errors = []
    for m in LINK.finditer(path.read_text(encoding="utf-8")):
        target = unquote(m.group(1).split("#", 1)[0].strip())
        if not target or target.startswith(("http://", "https://", "mailto:")) or not target.endswith(".md"):
            continue
        dest = root / target.lstrip("/") if target.startswith("/") else path.parent / target
        if not dest.resolve().exists():
            errors.append(f"{path.relative_to(root)}: broken internal link '{m.group(1)}'")
    return errors


def validate_style(path: Path, root: Path) -> list[str]:
    """House style: no em-dashes in prose (code fences and frontmatter excluded)."""
    text = re.sub(r"```.*?```", "", path.read_text(encoding="utf-8"), flags=re.S)
    return [f"{path.relative_to(root)}: contains an em-dash"] if "—" in text else []


def validate_db(root: Path, db_path: Path) -> list[str]:
    """Every dossier has a database item. A paper item may have no dossier: since 2026-10-16 the reel and post
    pipelines work from raw/assets and the item's one_liner, and a dossier is written only on request."""
    if not db_path.exists():
        return [f"database not found: {db_path}"]
    con = sqlite3.connect(db_path)
    ids = {r[0] for r in con.execute("SELECT id FROM items WHERE kind = 'paper'")}
    pages = {p.stem for p in (root / "wiki" / "papers").glob("*.md") if p.name not in RESERVED}
    return [f"wiki/papers/{i}.md has no database item" for i in sorted(pages - ids)]


def lint_bundle(root: Path, db_path: Path | None = None) -> list[str]:
    errors: list[str] = []
    for path in sorted(root.rglob("*.md")):
        rel = path.relative_to(root)
        if rel.parts[0] in (".git", "tests", "scripts"):
            continue
        if rel.parts[0] in CONCEPT_ROOTS and path.name not in RESERVED:
            errors.extend(validate_page(path, root))
        errors.extend(validate_links(path, root))
        errors.extend(validate_style(path, root))
    if db_path:
        errors.extend(validate_db(root, db_path))
    return errors


def main(argv: list[str]) -> int:
    args = [a for a in argv[1:] if not a.startswith("--")]
    root = Path(args[0] if args else ".").resolve()
    db = Path(argv[argv.index("--db") + 1]).resolve() if "--db" in argv else None
    errors = lint_bundle(root, db)
    for e in errors:
        print(f"ERROR: {e}")
    if not errors:
        print("Wiki lint passed.")
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
