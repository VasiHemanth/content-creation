# Research: rust-under-python

Read 2026-10-17. Slide copy uses only the lines in `treatment.md`. This file records the pages, the figures that stay off the slides, and what was not verified.

X search was available. The Späti post below was fetched with the thread tool on this date. A low-engagement 16 Oct 2026 post (Nakshatra) that lists the same tools was not fetched and is not a source.

## What a slide may say

Python is still the language of the model, the notebook, and the script. A set of tools you import now run the fast part in Rust, in the seat a new project might once have given to C or C++. NumPy and PyTorch have not moved. The one number on the carousel is Polars' own PDS-H total at scale factor 10.

## Pages behind the slides

### Hugging Face tokenizers

https://pypi.org/project/tokenizers/ read 2026-10-17. The Python package describes itself as bindings over the Rust implementation. That sentence is the one caption quote: "Bindings over the Rust implementation." Version on the page that day was 0.23.3 (uploaded Oct 9, 2026). The same page has a speed line about tokenizing a GB of text in under 20 seconds. That number is not on a slide. Repo: https://github.com/huggingface/tokenizers. The Rust crate tree was not read line by line. The PyPI sentence is the cite.

### tiktoken

https://github.com/openai/tiktoken read 2026-10-17. The repo has `Cargo.toml` and `src/lib.rs`. `src/lib.rs` starts with `use std::collections::HashSet;` and a PyO3 import under the `python` feature. That is the Rust evidence. The README does not itself say "written in Rust."

README performance line, not used on a slide: tiktoken is between 3-6x faster than a comparable open-source tokeniser, measured on 1GB of text with the GPT-2 tokeniser, against `GPT2TokenizerFast` from `tokenizers==0.13.2` and `transformers==4.24.0`, and `tiktoken==0.2.0`. Old comparison. Leave it off the carousel. The slide line is only "tiktoken is the OpenAI tokenizer in Rust."

### pydantic-core

https://docs.pydantic.dev/latest/internals/architecture/ redirects. The page that loaded is https://pydantic.dev/docs/validation/latest/internals/architecture/ read 2026-10-17. From V2, part of the codebase is in Rust in a separate package, `pydantic-core`. Model definition stays in `pydantic`. Validation and serialization live in `pydantic-core`. The same page says a 5 to 20 performance increase compared with Pydantic V1.

https://pydantic.dev/articles/pydantic-v2-alpha (the blog URL redirects here), Samuel Colvin and Terrence Dorsey, 2023-04-03, with an August 2026 note that V2 is GA. They wrote that validation logic was rewritten in Rust and moved to `pydantic-core`, and that Pydantic V2 is 5-50x faster than Pydantic V1.

Neither multiplier is on a slide. The Polars row is the one number. The slide job line is "pydantic-core checks data in Rust." PyO3's user guide also lists pydantic-core as Rust. https://pyo3.rs/ showed guide v0.29.3 on this date.

### Polars, the number

https://github.com/pola-rs/polars read 2026-10-17. Polars is an analytical query engine for DataFrames, written in Rust, with a Python API (also Rust, Node.js, R, and SQL). Slide line: "Polars runs table queries in Rust."

https://pola.rs/posts/benchmarks re-read in full on 2026-10-17. "Updated PDS-H benchmark results (May 2025)", Ritchie Vink, Sun, 1 Jun 2025. PDS is derived from TPC-H, and the post says results from PDS are not comparable to published TPC-H results. Suite: https://github.com/pola-rs/polars-benchmark.

Hardware, quoted from the post: AWS c7a.24xlarge (96 vCPUs / 192 GB memory). OS as they wrote it: Ubuntu 22.02 LTS x86-64. The slide says vCPUs, not cores. The OS string is not on the slide.

Scale factor 10, `total_time` in seconds and their factor column:

| solution | total_time | factor |
|---|---|---|
| polars[streaming]-1.30.0 | 3.89 | 1.0 |
| duckdb-1.3.0 | 5.87 | 1.5 |
| polars[in-memory]-1.30.0 | 9.68 | 2.5 |
| dask-2025.5.1 | 46.02 | 11.8 |
| pyspark-4.0.0 | 120.11 | 30.9 |
| pandas-2.2.3 | 365.71 | 94.0 |

The slide uses only the streaming row and the pandas row. Headline factor 94.0 is their printed factor. 365.71 / 3.89 is about 94.01. Do not print 94.01, and do not print factor 1.0. Their words for the comparison direction, on the slide: "Pandas took 94.0 times as long."

Scale factor 100, not on the slide:

| solution | total_time | factor |
|---|---|---|
| duckdb-1.3.0 | 19.65 | 1.0 |
| polars[streaming]-1.30.0 | 23.94 | 1.2 |
| polars[in-memory]-1.30.0 | 152.27 | 7.7 |
| pyspark-4.0.0 | 312.43 | 15.9 |
| dask-2025.5.1 | 548.52 | 27.9 |

Pandas was not run at SF-100. The post says single-threaded execution and the lack of a query optimizer lead to a gap of about two orders of magnitude and OOM failures at higher scale factors. The slide says only "Pandas did not run the larger scale." It does not say "out of memory" as a general claim.

This is Polars' own suite, one scale, one machine. It is not "Polars is 10-20x" and it is not "94x on your laptop." No independent re-run.

The post also says streaming can be up to 3-7x faster than their in-memory engine, and that mileage varies. That range is not on the slide.

### Ruff and uv, names only

https://docs.astral.sh/ruff/ read 2026-10-17. "An extremely fast Python linter and code formatter, written in Rust." Their bullet: "10-100x faster than existing linters (like Flake8) and formatters (like Black)." Chart caption on that page: "Linting the CPython codebase from scratch." The chart SVG was not read for bar values. Do not put 100-300x or 389x on a slide. Those figures were not seen. Testimonials on the same page (about 1000x versus pylint, about 150-200x versus flake8) are third-party quotes, not Astral's 10-100x line, and they are not on a slide.

https://docs.astral.sh/uv/ read 2026-10-17 (page date March 13, 2026). "An extremely fast Python package and project manager, written in Rust." The page also says 10-100x faster than pip. `BENCHMARKS.md` was not opened. No "seconds instead of minutes" number was taken. Slide line: "uv is the package manager in Rust."

https://docs.astral.sh/ty/ read 2026-10-17 (page date October 16, 2026). A Rust type checker. Their "10x-100x faster than mypy and Pyright" line is not on a slide. Do not add ty to the tools slide.

### Rust, the two properties on s05

https://rust-lang.org/ fetched 2026-10-17 (www.rust-lang.org redirects there). Homepage: Rust is memory-efficient, "with no runtime or garbage collector", and the type system and ownership model "guarantee memory-safety and thread-safety" at compile time. The slide paraphrases two clauses only: "Rust has no garbage collector." and "The compiler checks memory safety." The same homepage says "blazingly fast." That wording is not on a slide. "Fearless concurrency" was not on this page. The members directory linked from the homepage, https://foundation.rust-lang.org/members, was not opened.

### GIL, Red Hat, PyO3

https://developers.redhat.com/articles/2025/09/15/why-some-agentic-ai-developers-are-moving-code-python-rust Louis Imershein, 15 Sep 2025, read 2026-10-17.

Useful distinction, paraphrased on s05 and s09:

- In the default build, the GIL blocks CPU-bound threads. They do not run together.
- He writes that a Python thread which sends work to a GPU via CUDA releases the GIL. The slide attributes that mechanism to Red Hat: "Red Hat says a CUDA call releases the GIL." It was not confirmed on a PyTorch docs page.
- His I/O demo is the opposite case: threads overlap while they wait. The slide says "Threads do overlap on an I/O wait." His timings stay off the slide.
- His prime-sum demo is a toy on one Fedora machine (Python 2 threads slightly slower than 1; a Rust Rayon run faster than one Rust thread). Do not print those times, and do not say agents are Nx faster.
- The path he describes: prototype in Python, profile, rewrite the hot part, expose it with PyO3. s09 follows that path and names him.

https://pyo3.rs/ read 2026-10-17. Rust bindings for Python, including tools for native Python extension modules. Guide banner v0.29.3. Rig was not checked and is not on a slide.

### NumPy and PyTorch

https://numpy.org/doc/stable/user/whatisnumpy.html read 2026-10-17 (page title, NumPy v2.5 Manual). The guide says the element-by-element operation is executed by pre-compiled C code. Slide line: "NumPy array math runs as C code." The GitHub README (https://github.com/numpy/numpy) does not say "the core is C" in the opening. It does mention tools for integrating C, C++, and Fortran. Do not claim NumPy has no Fortran, and do not claim NumPy moved to Rust.

PyTorch, read 2026-10-17 from the official URLs (README and C++ page via page extracts, not a full HTML dump of every section):

- https://github.com/pytorch/pytorch/blob/main/README.md : a Python package for tensor computation, like NumPy, with GPU acceleration. The same README says PyTorch is not a Python binding into a monolithic C++ framework. It is built to be integrated into Python. Do not turn that sentence into "PyTorch is not C++" or "PyTorch is only a wrapper."
- https://docs.pytorch.org/docs/stable/cpp_index.html and https://pytorch.org/cppdocs/frontend.html : the C++ frontend is a C++17 library for CPU and GPU tensor computation.
- https://docs.pytorch.org/docs/stable/notes/cuda.html : `torch.cuda` runs CUDA operations.

Slide line: "PyTorch tensor code is C++ and CUDA." No official sentence was found that says "the core is not Rust." The evidence is the C++ and CUDA docs, plus the absence of a Rust core in those pages.

### Qdrant, LanceDB, Candle, Burn

https://github.com/qdrant/qdrant read 2026-10-17. "Qdrant is written in Rust." A Python client exists (`QdrantClient`). The slide says it is a vector database in Rust and that a Python client calls it. Do not add latency, "millions of embeddings", or their RAM-usage claim.

https://docs.lancedb.com/faq/faq-oss read 2026-10-17. "Why build in Rust?": Lance and LanceDB are written entirely in Rust, with Python, JavaScript, and Rust clients. The current GitHub README (https://github.com/lancedb/lancedb) does not use the older "core is written in Rust" sentence. Use the FAQ. Do not use README or FAQ marketing figures (1000x versus Parquet, milliseconds, billions of vectors, petabytes, under 20 ms).

https://huggingface.github.io/candle/ and https://github.com/huggingface/candle read 2026-10-17. Candle is a minimalist ML framework for Rust. The docs list CPU, CUDA, WASM, and serverless-on-CPU among the goals, and loading safetensors among the file formats. It is an optional runtime. It does not replace PyTorch. Do not count example models as "thousands of architectures."

https://github.com/tracel-ai/burn read 2026-10-17. Burn is a tensor library and a deep learning framework in Rust. The README describes dynamic shapes and graphs, then JIT kernel fusion, and backends that include CUDA, ROCm, Metal, Vulkan, WebGPU, CPU, and WebAssembly. The README discusses 0.22. That version is not on the slide. Do not call Burn the industry default, and do not use a compile-time claim.

### Free-threaded Python

https://peps.python.org/pep-0779/ read 2026-10-17. Status Final, Python-Version 3.14. Phase II: the free-threaded build is officially supported and still optional. Phase III, making it the default, is a later decision. Memory and overhead targets in the PEP are not on the slide.

https://docs.python.org/3.14/whatsnew/3.14.html read 2026-10-17. The free-threaded build is now supported and no longer experimental. This is the start of phase II: officially supported, still optional. Any move to phase III is still undecided. The same page says the single-thread penalty in free-threaded mode is roughly 5-10%. That percentage is not on the slide.

https://docs.python.org/3.14/howto/free-threading-python.html read 2026-10-17 (docs 3.14.8, last updated Oct 17, 2026). It contrasts the free-threaded build with the default GIL-enabled build. `sys._is_gil_enabled()` returns true in the default build because the GIL is always enabled there. The `--disable-gil` configure flag adds `t` to `sys.abiflags`. A 3.13 what's-new note, on the 3.14 docs site, says the free-threaded mode needs a different executable, usually `python3.13t`. Package metadata distinguishes `python-3.14.pc` and `python-3.14t.pc`. The exact string `python3.14t` was not on the 3.14 what's-new page. The slide does not name the binary. It says "Free-threaded Python 3.14 is still optional." and "The default Python build still has the GIL."

pyperformance overhead figures on the HOWTO (about 1% to 8% depending on platform) are not on the slide.

## Checked, then left off the slides

### Astral and OpenAI

https://openai.com/index/openai-to-acquire-astral/ 19 March 2026. OpenAI announced it will acquire Astral. Closing is subject to customary conditions, including regulatory approval. Until closing, the companies stay separate. Do not say "OpenAI acquired Astral" as a completed March fact. Codex growth figures on that page are unrelated.

https://astral.sh/blog/openai Charlie Marsh, 19 March 2026. An agreement to join OpenAI as part of the Codex team. Open-source tools continue to be supported after the deal closes. A downloads claim on that post is not a slide number.

https://x.com/charliermarsh/status/2067280638994968657 17 June 2026. Marsh posted as @charliermarsh with an @OpenAI bio: a $600,000 commitment to the Rust Foundation, Platinum membership plus maintainer support. About 4.8k likes when fetched (4825). Posting with that bio is not a legal close document. A different, earlier sponsors figure (above $160,000) must not be merged with the $600,000.

https://rustfoundation.org/media/rust-foundation-welcomes-openai-as-platinum-member-announces-donation-to-rust-project/ 17 June 2026. OpenAI joined as a Platinum member and will contribute $600,000 in total through the Foundation. Predrag Gruevski, Member of Technical Staff at OpenAI, joins the board as OpenAI's representative. The sum is support for the language. It is not evidence that OpenAI rewrote its models in Rust. It is not on a slide. The members directory page was not opened. The press release is the cite.

### DuckDB, and a correction

Simon Späti, @sspaeti, 22 Feb 2026, https://x.com/sspaeti/status/2025586402055053677. Likes 255, reposts 29, replies 14, bookmarks 143, views 14610 when fetched. Paraphrase only, and not on a slide: "Will Rust kill Python in data engineering? No." He says Python remains the interface and Rust becomes the engine. He groups Polars, DataFusion, and "DuckDB's internals" as all Rust. Polars is Rust (verified above). DataFusion was not re-fetched and is not on a slide.

DuckDB's core is C++. https://duckdb.org/2024/03/22/dependency-management.html (Sam Ansmink, 2024-03-22) says DuckDB is written in C++. https://duckdb.org/faq.html talks about writing their C++ code. A reply on the Späti thread, @shinzui, 22 Feb 2026, says "DuckDB is primarily written in C++." Do not repeat Späti's DuckDB line. DuckDB is omitted from the slides rather than explained there. A Rust client for DuckDB is not a Rust core. Those two DuckDB pages were read as search extracts of the official URLs, not as a full HTML dump.

### safetensors

https://github.com/huggingface/safetensors resolves to the safetensors/safetensors README. Read 2026-10-17. It has a Rust crate and Python bindings, and building from source needs Rust. The README does not say the core is Rust. safetensors is not on a slide. Candle's docs may still mention the file format. That is not a claim about the safetensors implementation language. A BLOOM load-time anecdote on the README is not used.

### Other rejects

- YouTube links in the original brief are commentary. No number from a video is used.
- The Medium piece (Bianca Ionescu, Level Up Coding, 31 Aug 2026) was not fetched. It is not a source of facts and it is not in the caption.
- LanceDB, Qdrant, Ruff, uv, ty, tiktoken, and Pydantic speed lines listed above stay in this file so they are not "upgraded" onto a slide later.
- "Python is single-threaded" and "agents cannot scale in Python" are false for this post. The default GIL limits CPU-bound threads. I/O waiting can overlap. A CUDA call, on Red Hat's account, releases the GIL.
- "Fearless concurrency", "lightning-fast", "gigabyte Docker images", "starts in milliseconds", and "out of memory on large datasets" are not slide copy.

## What was not verified

- Ruff chart bar values. The 10-100x sentence and the CPython caption were visible. 100-300x and 389x were not on the page that was read.
- Rust Foundation members directory (the homepage links it). Platinum membership and the $600,000 come from the 17 June 2026 press release, not from that directory.
- The exact executable name `python3.14t` on a 3.14 what's-new page. The `t` ABI flag, `python-3.14t.pc`, and the 3.13 name `python3.13t` were seen. The slide does not use the binary name.
- DataFusion's README. Omitted.
- The Nakshatra post of 16 Oct 2026. Not retrieved.
- The Medium post. Not retrieved.
- uv `BENCHMARKS.md`. The 10-100x versus pip line is on the uv docs page and is unused.
- A full HTML read of the PyTorch README body and of the DuckDB blog. The sentences cited above are from those official URLs. DuckDB is omitted from the slides anyway.
- An official PyTorch page that says a CUDA call releases the GIL. The slide credits Red Hat for that sentence.
- An independent re-run of PDS-H, Ruff, Pydantic, or tiktoken.
- Any YouTube measurement.
- The Burn crates.io version badge. 0.22 is README discussion only and is not on a slide.
- A line-by-line read of the tokenizers Rust crate. The PyPI sentence is the cite.
- A legal close date for the Astral agreement. The March 2026 pages say the close had not happened. Marsh's June 2026 post shows him speaking as OpenAI. That is not a closing document.
