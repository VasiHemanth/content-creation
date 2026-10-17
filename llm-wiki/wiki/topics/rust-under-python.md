---
type: Topic
title: Rust under Python
description: Python stays the language of the model and the notebook, while a set of newer tools run their fast part in Rust.
tags: [python, rust, tools]
generated: { by: grok/post-producer, at: 2026-10-17T12:00:00+05:30 }
status: draft
stale_after: 2027-01-15T00:00:00+05:30
sources:
  - id: bench
    resource: https://pola.rs/posts/benchmarks
    title: Updated PDS-H benchmark results (May 2025)
    author: human:ritchie-vink
  - id: rust
    resource: https://rust-lang.org/
    title: Rust
    author: org:rust
  - id: redhat
    resource: https://developers.redhat.com/articles/2025/09/15/why-some-agentic-ai-developers-are-moving-code-python-rust
    title: Why some agentic AI developers are moving code from Python to Rust
    author: human:louis-imershein
---

# Rust under Python

Database item `rust-under-python` (kind `topic`). No paper. An unofficial guide: you still write the model in Python, and the new tools under that import run in Rust. NumPy and PyTorch did not move.

## What the pages support

1. **Tools called from Python whose fast part is Rust.** The tokenizers project describes its Python package as bindings over the Rust implementation.[^tokenizers] tiktoken's repository contains Rust (`Cargo.toml` and `src/lib.rs`, with a PyO3 import under the `python` feature). Its README does not itself say "written in Rust."[^tiktoken] From Pydantic V2, validation and serialization live in `pydantic-core` (Rust). Model definition stays in `pydantic`.[^pydantic] Polars is a DataFrame query engine written in Rust, with a Python API.[^polars] Ruff's docs call it a Python linter and code formatter written in Rust.[^ruff] uv's docs call it a Python package and project manager written in Rust.[^uv]

2. **One vendor number.** On Polars' own PDS-H at scale factor 10, the post prints pandas 2.2.3 `total_time` 365.71 seconds and polars streaming 1.30.0 `total_time` 3.89 seconds, and a factor of 94.0 for the pandas row. The machine is an AWS c7a.24xlarge with 96 vCPUs and 192 GB. Pandas was not run at scale factor 100. The post says PDS results are not comparable to published TPC-H results. This suite was not re-run here, and it is not every workload.[^bench]

3. **Why Rust shows up in the new tools.** The Rust homepage says the language has no runtime or garbage collector, and that the type system and ownership model guarantee memory safety and thread safety at compile time. The guide keeps two clauses: no garbage collector, and the compiler checks memory safety.[^rust] In the default Python build the GIL stays on, so CPU-bound threads do not run together. Threads can overlap while they wait on I/O. Louis Imershein (Red Hat, 15 Sep 2025) writes that a Python thread which sends work to a GPU via CUDA releases the GIL. That CUDA sentence is his. It was not confirmed on a PyTorch docs page.[^redhat] Free-threaded Python 3.14 is officially supported and still optional. It is not the default.[^py314] [^pep]

4. **What did not move.** NumPy's guide says an element-by-element operation runs as pre-compiled C code.[^numpy] The PyTorch C++ frontend is a C++17 library for CPU and GPU tensor computation, and `torch.cuda` runs CUDA operations.[^ptcpp] [^ptcuda] The PyTorch README says PyTorch is built to be integrated into Python, and that it is not a Python binding into a monolithic C++ framework. It does not say the core moved to Rust.[^ptreadme]

5. **When Rust is the program.** Qdrant is written in Rust and a Python client calls it.[^qdrant] Lance and LanceDB are written in Rust, with Python, JavaScript, and Rust clients.[^lance] Candle is a minimalist ML framework for Rust.[^candle] Burn is a tensor library and a deep learning framework in Rust.[^burn] Both are optional runtimes. They do not replace PyTorch.

6. **A path for code you own.** The Red Hat article describes a prototype in Python, a profile, a rewrite of the hot part, and PyO3 to expose it.[^redhat] PyO3 is Rust bindings for Python, including tools for native extension modules.[^pyo3] The default build still has the GIL. The free-threaded build is a different executable, not the default.[^howto]

## Left off on purpose

Speed lines on the tokenizers, tiktoken, Pydantic, Ruff, uv, and ty pages are not used.[^ty] The March 2026 Astral and OpenAI pages describe an agreement that had not closed.[^oai] [^astral] The Rust Foundation's 17 June 2026 release says OpenAI will contribute $600,000. That sum is support for the language. It is not evidence that a model was rewritten in Rust.[^foundation] DuckDB's own pages say the database is written in C++.[^duckdb] The safetensors README has a Rust crate and does not say the core is Rust.[^safe] None of those claims are in the guide.

## Open questions

- An independent re-run of the PDS-H scale factor 10 row, on a named machine, against the same pandas and Polars versions.
- An official PyTorch page for whether a CUDA call releases the GIL. The guide credits Red Hat for that sentence.

[^tokenizers]: [tokenizers on PyPI](/raw/sources/pypi-tokenizers.md)
[^tiktoken]: [tiktoken repository](/raw/sources/tiktoken-github.md)
[^pydantic]: [Pydantic architecture](/raw/sources/pydantic-architecture.md)
[^polars]: [Polars repository](/raw/sources/polars-github.md)
[^bench]: [Polars PDS-H benchmarks](/raw/sources/polars-pds-h-benchmarks.md)
[^ruff]: [Ruff docs](/raw/sources/ruff-docs.md)
[^uv]: [uv docs](/raw/sources/uv-docs.md)
[^rust]: [Rust homepage](/raw/sources/rust-lang-home.md)
[^redhat]: [Red Hat, Python to Rust](/raw/sources/redhat-python-to-rust.md)
[^py314]: [Python 3.14 what's new](/raw/sources/python-314-whatsnew.md)
[^pep]: [PEP 779](/raw/sources/pep-779.md)
[^numpy]: [What is NumPy](/raw/sources/numpy-whatis.md)
[^ptcpp]: [PyTorch C++ frontend](/raw/sources/pytorch-cpp-frontend.md)
[^ptcuda]: [PyTorch CUDA notes](/raw/sources/pytorch-cuda-notes.md)
[^ptreadme]: [PyTorch README](/raw/sources/pytorch-readme.md)
[^qdrant]: [Qdrant repository](/raw/sources/qdrant-github.md)
[^lance]: [LanceDB open-source FAQ](/raw/sources/lancedb-faq-oss.md)
[^candle]: [Candle docs](/raw/sources/candle-docs.md)
[^burn]: [Burn repository](/raw/sources/burn-github.md)
[^pyo3]: [PyO3](/raw/sources/pyo3-home.md)
[^howto]: [Free-threaded Python howto](/raw/sources/python-free-threading-howto.md)
[^ty]: [ty docs](/raw/sources/ty-docs.md)
[^oai]: [OpenAI announcement on Astral](/raw/sources/openai-astral-announcement.md)
[^astral]: [Astral post on joining OpenAI](/raw/sources/astral-openai-blog.md)
[^foundation]: [Rust Foundation on OpenAI](/raw/sources/rust-foundation-openai.md)
[^duckdb]: [DuckDB is C++](/raw/sources/duckdb-cpp.md)
[^safe]: [safetensors README](/raw/sources/safetensors-readme.md)
