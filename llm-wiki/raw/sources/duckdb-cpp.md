---
type: Source Record
title: DuckDB is C++
description: Two DuckDB pages, read 2026-10-17 as search extracts. The core language is C++, so DuckDB is not in the Rust-tools list.
resource: https://duckdb.org/2024/03/22/dependency-management.html
tags: [duckdb, cpp]
generated: { by: grok/post-producer, at: 2026-10-17T12:00:00+05:30 }
status: draft
stale_after: 2027-10-17T00:00:00+05:30
sources:
  - id: deps
    resource: https://duckdb.org/2024/03/22/dependency-management.html
    title: DuckDB dependency management
    author: human:sam-ansmink
  - id: faq
    resource: https://duckdb.org/faq.html
    title: DuckDB FAQ
    author: org:duckdb
---

# Source identity

Read 2026-10-17 as search extracts of the official URLs, not as a full HTML dump. https://duckdb.org/2024/03/22/dependency-management.html (Sam Ansmink, 2024-03-22). https://duckdb.org/faq.html.

# What it says

- The dependency post says DuckDB is written in C++.
- The FAQ talks about writing their C++ code.
- A Rust client for DuckDB is not a Rust core. DuckDB is omitted from the guide rather than explained there.
- A 22 Feb 2026 post by Simon Späti (https://x.com/sspaeti/status/2025586402055053677) groups "DuckDB's internals" with Rust engines. Do not repeat that line. A reply on that thread says DuckDB is primarily written in C++.
