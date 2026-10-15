---
type: Source Record
title: datacurve-ai/deep-swe README
description: Repository README for the DeepSWE benchmark, accessed 2026-10-03.
resource: https://github.com/datacurve-ai/deep-swe
tags: [github, deepswe, harbor, pier]
generated: { by: claude/sonnet-5.5, at: 2026-10-03T11:00:00+05:30 }
status: draft
stale_after: 2026-11-02T00:00:00+05:30
sources:
  - id: readme
    resource: https://github.com/datacurve-ai/deep-swe
    title: deep-swe repository
    author: team:datacurve
---

# Source identity

Accessed 2026-10-03. Capture mode: page summary through a fetch tool, so treat wording as secondary; the paper and leaderboard records are primary.

# What it says

- 113 tasks across TypeScript, Go, Python, JavaScript and Rust, in the Harbor task format: metadata, instructions, isolated Docker environment, verifier tests, reference solution.
- Since v1.1, grading uses separate verifier environments (needs Pier 0.3.0 or later): agents work in isolation and commit, a hook extracts commits as patches, and patches are applied and graded in pristine containers.
- Run with Pier, the Harbor-compatible framework; the example uses `mini-swe-agent`. License Apache-2.0.
