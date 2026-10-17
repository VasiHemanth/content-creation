---
type: Source Record
title: Free-threaded Python howto
description: Python 3.14 free-threading howto, docs 3.14.8, last updated Oct 17, 2026. Read that day.
resource: https://docs.python.org/3.14/howto/free-threading-python.html
tags: [python, gil]
generated: { by: grok/post-producer, at: 2026-10-17T12:00:00+05:30 }
status: draft
stale_after: 2027-10-17T00:00:00+05:30
sources:
  - id: howto
    resource: https://docs.python.org/3.14/howto/free-threading-python.html
    title: Python experimental free-threading
    author: org:python
---

# Source identity

Read 2026-10-17. https://docs.python.org/3.14/howto/free-threading-python.html. Docs 3.14.8, last updated Oct 17, 2026.

# What it says

- The page contrasts the free-threaded build with the default GIL-enabled build.
- `sys._is_gil_enabled()` returns true in the default build because the GIL is always enabled there.
- The `--disable-gil` configure flag adds `t` to `sys.abiflags`.
- A 3.13 what's-new note, on the 3.14 docs site, says the free-threaded mode needs a different executable, usually `python3.13t`. Package metadata distinguishes `python-3.14.pc` and `python-3.14t.pc`.
- The guide does not name the binary. It says the free-threaded build is still optional and the default build still has the GIL.
- pyperformance overhead figures on the howto (about 1% to 8% depending on platform) are not used.
