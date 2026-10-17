---
type: Source Record
title: Pydantic architecture
description: Pydantic internals page on where V2 validation lives, read 2026-10-17. The docs.pydantic.dev URL redirects.
resource: https://pydantic.dev/docs/validation/latest/internals/architecture/
tags: [python, rust, pydantic]
generated: { by: grok/post-producer, at: 2026-10-17T12:00:00+05:30 }
status: draft
stale_after: 2027-10-17T00:00:00+05:30
sources:
  - id: arch
    resource: https://pydantic.dev/docs/validation/latest/internals/architecture/
    title: Pydantic architecture
    author: org:pydantic
---

# Source identity

Read 2026-10-17. https://docs.pydantic.dev/latest/internals/architecture/ redirects. The page that loaded is https://pydantic.dev/docs/validation/latest/internals/architecture/.

# What it says

- From V2, part of the codebase is in Rust in a separate package, `pydantic-core`.
- Model definition stays in `pydantic`. Validation and serialization live in `pydantic-core`.
- The same page says a 5 to 20 performance increase compared with Pydantic V1. That multiplier is not used in the guide.
- A separate article (Samuel Colvin and Terrence Dorsey, 2023-04-03, with an August 2026 note that V2 is GA) says validation logic was rewritten in Rust and moved to `pydantic-core`, and that Pydantic V2 is 5-50x faster than Pydantic V1. That range is not used in the guide. URL that loaded: https://pydantic.dev/articles/pydantic-v2-alpha.
