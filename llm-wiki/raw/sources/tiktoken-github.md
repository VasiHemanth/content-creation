---
type: Source Record
title: tiktoken repository
description: OpenAI tiktoken GitHub repository, read 2026-10-17. Rust evidence is the crate files, not a README sentence.
resource: https://github.com/openai/tiktoken
tags: [python, rust, tokenizers]
generated: { by: grok/post-producer, at: 2026-10-17T12:00:00+05:30 }
status: draft
stale_after: 2027-10-17T00:00:00+05:30
sources:
  - id: repo
    resource: https://github.com/openai/tiktoken
    title: tiktoken
    author: org:openai
---

# Source identity

Read 2026-10-17. https://github.com/openai/tiktoken.

# What it says

- The repository has `Cargo.toml` and `src/lib.rs`. `src/lib.rs` starts with `use std::collections::HashSet;` and a PyO3 import under the `python` feature.
- The README does not itself say "written in Rust."
- README performance line, not used in the guide: tiktoken is between 3-6x faster than a comparable open-source tokeniser, measured on 1GB of text with the GPT-2 tokeniser, against `GPT2TokenizerFast` from `tokenizers==0.13.2` and `transformers==4.24.0`, and `tiktoken==0.2.0`.
