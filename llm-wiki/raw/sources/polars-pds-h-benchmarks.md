---
type: Source Record
title: Polars PDS-H benchmarks
description: Polars benchmark post by Ritchie Vink, dated 1 Jun 2025, read in full 2026-10-17. Owner-run PDS-H totals.
resource: https://pola.rs/posts/benchmarks
tags: [python, rust, polars, benchmark]
generated: { by: grok/post-producer, at: 2026-10-17T12:00:00+05:30 }
status: draft
stale_after: 2027-01-15T00:00:00+05:30
sources:
  - id: post
    resource: https://pola.rs/posts/benchmarks
    title: Updated PDS-H benchmark results (May 2025)
    author: human:ritchie-vink
---

# Source identity

Read in full 2026-10-17. "Updated PDS-H benchmark results (May 2025)", Ritchie Vink, Sun, 1 Jun 2025. https://pola.rs/posts/benchmarks. Suite: https://github.com/pola-rs/polars-benchmark. Not re-run here.

# What it says

- PDS is derived from TPC-H. Results from PDS are not comparable to published TPC-H results.
- Hardware, as written: AWS c7a.24xlarge (96 vCPUs / 192 GB memory). OS as written: Ubuntu 22.02 LTS x86-64.
- Scale factor 10, `total_time` in seconds and their factor column: polars[streaming]-1.30.0 3.89 (1.0), duckdb-1.3.0 5.87 (1.5), polars[in-memory]-1.30.0 9.68 (2.5), dask-2025.5.1 46.02 (11.8), pyspark-4.0.0 120.11 (30.9), pandas-2.2.3 365.71 (94.0).
- The guide uses only the streaming row and the pandas row, and the printed factor 94.0. 365.71 / 3.89 is about 94.01. The post prints 94.0.
- Scale factor 100: duckdb-1.3.0 19.65 (1.0), polars[streaming]-1.30.0 23.94 (1.2), polars[in-memory]-1.30.0 152.27 (7.7), pyspark-4.0.0 312.43 (15.9), dask-2025.5.1 548.52 (27.9). Pandas was not run at scale factor 100.
- The post says single-threaded execution and the lack of a query optimizer lead to a gap of about two orders of magnitude and OOM failures at higher scale factors. The guide says only that pandas did not run the larger scale.
- The post also says streaming can be up to 3-7x faster than their in-memory engine, and that mileage varies. That range is not used in the guide.
- Other rows (DuckDB, Dask, PySpark, the in-memory Polars row, factor 1.0) are not used in the guide.
