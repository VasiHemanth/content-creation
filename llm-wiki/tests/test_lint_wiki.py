import sqlite3
import tempfile
import unittest
from pathlib import Path

from scripts.lint_wiki import lint_bundle

PAGE = """---
type: Paper
title: Example
description: Example page.
status: draft
---

# Example
"""


class LintBundleTest(unittest.TestCase):
    def bundle(self) -> Path:
        d = tempfile.TemporaryDirectory()
        self.addCleanup(d.cleanup)
        root = Path(d.name)
        (root / "wiki" / "papers").mkdir(parents=True)
        (root / "wiki" / "papers" / "1.0001.md").write_text(PAGE, encoding="utf-8")
        return root

    def test_valid_bundle_passes(self):
        self.assertEqual(lint_bundle(self.bundle()), [])

    def test_missing_frontmatter_and_bad_status(self):
        root = self.bundle()
        (root / "wiki" / "bad.md").write_text("# no frontmatter\n", encoding="utf-8")
        (root / "wiki" / "bad2.md").write_text(PAGE.replace("draft", "weird"), encoding="utf-8")
        errors = lint_bundle(root)
        self.assertTrue(any("missing YAML" in e for e in errors))
        self.assertTrue(any("invalid status" in e for e in errors))

    def test_broken_link_and_em_dash(self):
        root = self.bundle()
        (root / "wiki" / "papers" / "1.0001.md").write_text(PAGE + "\nSee [x](/wiki/none.md) — here.\n", encoding="utf-8")
        errors = lint_bundle(root)
        self.assertTrue(any("broken internal link" in e for e in errors))
        self.assertTrue(any("em-dash" in e for e in errors))

    def test_db_agreement(self):
        root = self.bundle()
        db = root / "t.sqlite"
        con = sqlite3.connect(db)
        con.execute("CREATE TABLE items (id TEXT, kind TEXT)")
        con.execute("INSERT INTO items VALUES ('9.9999','paper')")
        con.commit()
        errors = lint_bundle(root, db)
        self.assertTrue(any("9.9999 has no wiki" in e for e in errors))
        self.assertTrue(any("1.0001.md has no database item" in e for e in errors))


if __name__ == "__main__":
    unittest.main()
