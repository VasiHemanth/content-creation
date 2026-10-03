---
type: Topic
title: Coding agent benchmarks
description: How coding agents are measured, what each benchmark can and cannot show, and how scores get inflated.
tags: [benchmarks, coding-agents, evaluation]
generated: { by: claude/sonnet-5.5, at: 2026-10-03T11:30:00+05:30 }
status: draft
stale_after: 2026-12-31T00:00:00+05:30
---

# Coding agent benchmarks

## Papers
- [DeepSWE](/wiki/papers/2607.07946.md): original tasks and hand-written verifiers, with a judge audit against SWE-Bench Pro.

## Related material elsewhere
The research wiki at `~/Documents/AI Research` has benchmark dossiers (MMLU, GSM8K and others) and a Muse Spark 1.3 record that cites DeepSWE. It is not merged here yet.

## Open questions
- How much of the SWE-bench family's score gap between models is recall and test mismatch, and how much is capability?
- Do scores on DeepSWE hold up when run in each model's native harness?
