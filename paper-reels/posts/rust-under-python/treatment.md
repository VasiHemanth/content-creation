# Treatment: rust-under-python

Instagram carousel, 9 image slides, 4:5. No video slide. No render in this step.

## 1. The one idea

You still write the model in Python, and the new tools under that import run in Rust.

## 2. Hook options

Slide 1 uses option D. The key text sits in `pk-h1` and `pk-body` inside `pk-cover` / `pk-page`. That box starts at x = 70 and ends at x = 1010, inside the central 3:4 range (x 34 to 1046). Do not put the hook in a side rail.

| | Claim | Words | What is drawn |
|---|---|---|---|
| A | The notebook stays Python. The new tools are Rust. | 9 | An original notebook page on a horizontal bar. No logos and no copied artwork. |
| B | Rust sits under the import, not in the notebook. | 9 | Two bands: a notebook above, a bar below, one arrow between them. |
| C | You still write the model in Python. | 7 | A notebook page with a small model sketch. No second layer. |
| D | Why AI infrastructure moves to Rust. | 6 | The same notebook on a bar. The bar is the infrastructure under the page. |

The cover uses D, chosen 2026-10-17 after A failed the hook test in `paper-reels/post/SPEC.md`. A is true and hides the subject: a stranger cannot tell the post is about AI infrastructure. B and C have the same gap. D states the change. "moves" is the simple tense of the same line. "moving" fails the STE `-ing` rule, so it is not on the slide. The subline keeps the caveat: you still write the model in Python.

## 3. Slide plan

Nine slides. Kind is `image` on every row. Copy below is the STE text, already checked (0 hard, 0 soft) with the names in the block under the table. Alt strings were in that same check. `x_` strings were not, and must stay `x_` keys.

| Slide | One idea | Copy | Drawn | Alt | Counter-example |
|---|---|---|---|---|---|
| s01 | AI infrastructure moves to Rust, and you still write the model in Python. | Unofficial guide. Why AI infrastructure moves to Rust. You still write the model in Python. Next | `pk-page`, `pk-cover`, `pk-chip`, `pk-h1` (use `is-m` if the hook overflows at 112px), `pk-body`, `pk-hero` (original notebook on a bar), `pk-swipe` | Why AI infrastructure moves to Rust. You still write the model in Python. | none |
| s02 | What you write and what runs under the import are two layers. | Two layers. You write. The model, the notebook, and the script stay Python. Under the import. A Rust core does the fast work in new tools. | `pk-h2`, `pk-compare` with two `pk-cmp` (`is-good` on the Python layer), `pk-arrow`, `pk-x` | The model, the notebook, and the script stay Python. A Rust core does the fast work in new tools. | `x_wrong`: "Rust is replacing Python." Label text: Wrong claim. Why: rejected headline, and the word "replacing" is an `-ing` form. |
| s03 | Six tools you already call from Python run their fast part in Rust. | Tools you already call. You call each one from Python. Hugging Face tokenizers run in Rust. tiktoken is the OpenAI tokenizer in Rust. pydantic-core checks data in Rust. Polars runs table queries in Rust. Ruff checks Python code in Rust. uv is the package manager in Rust. | `pk-h2`, `pk-body`, six `pk-panel` in `pk-stack.is-tight`, title = name, `pk-panel-text.is-s` = job. No speeds. Do not add ty. If the six panels overflow, use two columns. Do not drop a name. | You call each one from Python. Hugging Face tokenizers, tiktoken, pydantic-core, Polars, Ruff, and uv run in Rust. | none |
| s04 | On Polars' own PDS-H at scale factor 10, pandas took 94.0 times as long. | Factor 94.0. Seconds on one Polars suite. PDS-H at scale factor 10. pandas 2.2.3. 365.71. polars streaming 1.30.0. 3.89. Pandas took 94.0 times as long. The machine had 96 vCPUs and 192 GB. Pandas did not run the larger scale. This is not every workload. | `pk-h2`, `pk-body`, `pk-bars`: pandas bar `is-coral`, polars bar `is-mint`. Draw-only `_pandas` 365.71, `_polars` 3.89, `_max` 365.71. Print the seconds in `pk-bar-val`. The polars fill is about 1% of the track. Do not stretch it. If the track fails a visual check, drop the track and keep both values. Then `pk-body` / `pk-foot` for the four sentences. | pandas 2.2.3 took 365.71 seconds on PDS-H at scale factor 10. The polars streaming 1.30.0 run took 3.89 seconds. This is not every workload, and pandas took 94.0 times as long. | none |
| s05 | Teams use Rust here for memory safety without a garbage collector, and for CPU threads the default GIL blocks. | Why the new tools use Rust. Rust has no garbage collector. The compiler checks memory safety. In the default build, the GIL blocks CPU-bound threads. Red Hat says a CUDA call releases the GIL. CPU-bound threads do not run together. Threads do overlap on an I/O wait. | `pk-h2`, one `pk-panel.is-mint` for the two Rust lines, one `pk-callout` for the GIL line, `pk-body` for the CUDA line, the CPU line, and the I/O line. Do not quote "blazingly fast" or "fearless concurrency". | Rust has no garbage collector. In the default build, the GIL blocks CPU-bound threads. Red Hat says a CUDA call releases the GIL. | none |
| s06 | NumPy and PyTorch did not move to Rust. | This core did not move. NumPy array math runs as C code. PyTorch tensor code is C++ and CUDA. Rust took new tools. It did not take this core. | `pk-h2`, two `pk-panel`, `pk-body`, `pk-x`. Do not call PyTorch a thin wrapper. Do not say NumPy has no Fortran. | NumPy array math runs as C code. PyTorch tensor code is C++ and CUDA. Rust took new tools, and it did not take this core. | `x_wrong`: "Rust replaced NumPy and PyTorch." Label text: Wrong claim. Why: the numeric core did not move. |
| s07 | Some programs are Rust, and Python is only the client. | Sometimes Rust is the program. Qdrant is a vector database in Rust. A Python client calls that database. LanceDB is Rust, with a Python client. Candle and Burn are optional Rust runtimes. They do not replace PyTorch. | `pk-h2`, two `pk-panel`, one `pk-callout` for Candle and Burn plus the PyTorch line. No latency, no "millions", no version number. | Qdrant is a vector database in Rust. LanceDB is Rust, with a Python client. Candle and Burn are optional Rust runtimes, and they do not replace PyTorch. | none |
| s08 | Default Python still has the GIL, free-threaded 3.14 is optional, and a vendor chart is not your run. | Before you rewrite. The default Python build still has the GIL. Free-threaded Python 3.14 is still optional. A vendor benchmark is not your workload. Do not rewrite the model in Rust. | `pk-h2`, four `pk-callout` (or four `pk-body` lines if the callouts overflow). This slide is before the last slide. Do not print `python3.14t`. Do not say Python is single-threaded. | The default Python build still has the GIL, and free-threaded Python 3.14 is still optional. A vendor benchmark is not your workload. Do not rewrite the model in Rust. | none |
| s09 | Keep the model in Python. Profile a hot CPU path, then a PyO3 extension. If you own the tool, Rust can be the program. | Keep Python for the model. Write the model in Python. Profile the slow CPU path. Then rewrite that path with PyO3. Red Hat describes this path. If you own the tool, Rust can be the program. hemanth_with_ai | `pk-h2`, three stacked `pk-panel` (no `pk-steps`, so the kit does not paint 1, 2, 3), `pk-body` for the Red Hat line, `pk-callout` for the last line, `pk-handle` for `hemanth_with_ai`. The handle is the only account name, and it is only on this slide. | Write the model in Python. Profile the slow CPU path, then rewrite that path with PyO3. If you own the tool, Rust can be the program. | none |

`pk-x-label` text on s02 and s06 is the normal string `Wrong claim` (it passes STE). The rejected sentence is the only `x_` value.

Checker names to copy into `post.json` `ste.names`:

`streaming`, `tokenizers`, `tiktoken`, `pydantic-core`, `Polars`, `pandas`, `Ruff`, `uv`, `Qdrant`, `LanceDB`, `NumPy`, `PyTorch`, `CUDA`, `PyO3`, `GIL`, `Candle`, `Burn`, `PDS-H`, `Python`, `Rust`, `Hugging Face`, `OpenAI`, `Red Hat`, `hemanth_with_ai`, `C++`, `CPU-bound`, `I/O`, `vCPUs`

`ste.examples`:

- slide `s02`, key `x_wrong`, why: rejected headline. It is the claim this post refuses, and "replacing" is an `-ing` form.
- slide `s06`, key `x_wrong`, why: false claim that the numeric core moved.

Scratch check, 2026-10-17: `node paper-reels/hf/bin/ste.mjs /tmp/ste-rust-under-python` reported 0 hard and 0 soft on 66 lines. That run included the alt strings. It did not include the `x_` sentences.

Do not add to any slide: a second speed (Ruff, Pydantic, tiktoken, uv, ty), the Astral agreement, the Rust Foundation sum, DuckDB, DataFusion, safetensors, Rig, toy timings, or a call to "tell me which one you want."

## 4. Video slide

None. `sqlite3 data/content.sqlite "SELECT id, topic, status, one_liner FROM items"` on 2026-10-17 has no item for this topic and no registered reel to excerpt.

## 5. Numbers budget

Every printed number is from Polars' own table, except 3.14, which is the Python version. Nobody re-ran the suite. Do not replace 94.0 with 365.71 / 3.89 (that quotient is about 94.01). Polars printed 94.0.

| Number | Where | What it is | Source |
|---|---|---|---|
| 94.0 | s04 headline and "Pandas took 94.0 times as long." | Polars' published factor, scale factor 10, pandas total time divided into their factor column. Not every workload. | Ritchie Vink, Polars, 1 Jun 2025, https://pola.rs/posts/benchmarks |
| 10 | s04 "PDS-H at scale factor 10." | The scale they ran for the pandas row. | Same post |
| 2.2.3 | s04 bar label | pandas version in that row | Same post |
| 365.71 | s04 bar value | pandas 2.2.3 `total_time` in seconds | Same post |
| 1.30.0 | s04 bar label | Polars version on the streaming row | Same post |
| 3.89 | s04 bar value | polars streaming 1.30.0 `total_time` in seconds | Same post |
| 96 | s04 | vCPUs on the AWS c7a.24xlarge they name. Not "cores". | Same post: "96 vCPUs / 192 GB memory" |
| 192 | s04 | GB of memory on that machine | Same post |
| 3.14 | s08 | Python version in which the free-threaded build is officially supported and still optional | https://docs.python.org/3.14/whatsnew/3.14.html and PEP 779 |

Draw-only keys `_pandas`, `_polars`, and `_max` are not copy and must not appear as text. No other digits.

## 6. Caveats

Slide s08, before s09:

- The default Python build still has the GIL. Free-threaded Python 3.14 is still optional. Do not say Python cannot use more than one core. asyncio and multiprocessing exist. The GIL limit on the slide is CPU-bound threads in the default build.
- GPU work is a different case. The CUDA line is attributed to Red Hat, not measured here.
- The 94.0 factor is one vendor suite at one scale, on a 96-vCPU machine. Pandas did not run the larger scale in that post.
- Do not rewrite the model in Rust. The last slide says to profile a hot CPU path before a PyO3 extension.

## 7. Caption

2186 characters, counted on the block below with no trailing newline. Do not add a word, a space, or a newline. The first 125 characters carry the hook, then "Unofficial guide." Four hashtags. One quote, the tokenizers line.

The caption is inside the limit, so a few slide sentences are compressed there and left whole on the slides. "CPU-bound threads do not run together" is carried by "the GIL blocks CPU-bound threads." "Write the model in Python" is carried by "The model, the notebook, and the script stay Python" and by "Do not rewrite the model in Rust." PEP 779 is not in the caption. The what's-new page is, and PEP 779 is in `research.md`. The PyTorch README is in `research.md`. The caption links the C++ and CUDA docs.

```
Why AI infrastructure moves to Rust.

Unofficial guide. The model, the notebook, and the script stay Python. A Rust core does the fast work in new tools.

Called from Python, each in Rust: Hugging Face tokenizers ("Bindings over the Rust implementation."), tiktoken (OpenAI tokenizer), pydantic-core (checks data), Polars (table queries), Ruff (checks Python code), uv (package manager).

PDS-H, scale factor 10, one Polars suite. pandas 2.2.3 took 365.71 seconds. polars streaming 1.30.0 took 3.89 seconds. Pandas took 94.0 times as long. 96 vCPUs and 192 GB. Pandas did not run the larger scale. This is not every workload.

Rust has no garbage collector. The compiler checks memory safety. In the default build, the GIL blocks CPU-bound threads. Threads do overlap on an I/O wait. Red Hat says a CUDA call releases the GIL.

NumPy array math runs as C code. PyTorch tensor code is C++ and CUDA. Rust took new tools. It did not take this core.

Qdrant is a vector database in Rust. LanceDB is Rust. A Python client calls each. Candle and Burn are optional Rust runtimes and do not replace PyTorch.

The default build still has the GIL. Free-threaded Python 3.14 is still optional. A vendor benchmark is not your workload. Do not rewrite the model in Rust.

Profile the slow CPU path. Then rewrite that path with PyO3. Red Hat describes this path. If you own the tool, Rust can be the program.

https://pypi.org/project/tokenizers/ https://github.com/openai/tiktoken https://docs.pydantic.dev/latest/internals/architecture/ https://github.com/pola-rs/polars https://pola.rs/posts/benchmarks https://docs.astral.sh/ruff/ https://docs.astral.sh/uv/ https://rust-lang.org/ https://developers.redhat.com/articles/2025/09/15/why-some-agentic-ai-developers-are-moving-code-python-rust https://numpy.org/doc/stable/user/whatisnumpy.html https://docs.pytorch.org/docs/stable/cpp_index.html https://docs.pytorch.org/docs/stable/notes/cuda.html https://github.com/qdrant/qdrant https://docs.lancedb.com/faq/faq-oss https://huggingface.github.io/candle/ https://github.com/tracel-ai/burn https://docs.python.org/3.14/whatsnew/3.14.html https://pyo3.rs/
#Python #Rust #MachineLearning #DataScience
```

## 8. Credit and rights

Paraphrase on the slides. The one quote, in the caption only, is "Bindings over the Rust implementation." from the tokenizers PyPI page. Do not copy layout, wording, or artwork from Polars' charts, Astral's charts, or anyone's diagrams. The hero is an original sketch. Naming a project is not an endorsement. The chip "Unofficial guide" is the unofficial-guide label.

This post does not explain a paper. There is no registered excerpt.
