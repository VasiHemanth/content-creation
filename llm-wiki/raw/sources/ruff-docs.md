---
type: Source Record
title: Ruff docs
description: Astral Ruff documentation, read 2026-10-17. Language claim and an unused speed line.
resource: https://docs.astral.sh/ruff/
tags: [python, rust, ruff]
generated: { by: grok/post-producer, at: 2026-10-17T12:00:00+05:30 }
status: draft
stale_after: 2027-10-17T00:00:00+05:30
sources:
  - id: docs
    resource: https://docs.astral.sh/ruff/
    title: Ruff
    author: org:astral
---

# Source identity

Read 2026-10-17. https://docs.astral.sh/ruff/. The chart SVG was not read for bar values.

# What it says

- "An extremely fast Python linter and code formatter, written in Rust."
- Their bullet: "10-100x faster than existing linters (like Flake8) and formatters (like Black)."
- Chart caption on that page: "Linting the CPython codebase from scratch."
- Testimonials on the same page (about 1000x versus pylint, about 150-200x versus flake8) are third-party quotes, not Astral's 10-100x line.
- None of the speed figures are used in the guide. 100-300x and 389x were not on the page that was read.
