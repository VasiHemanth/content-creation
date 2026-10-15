---
type: Source Record
title: DeepSWE leaderboard v1.1 snapshot
description: Snapshot of the benchmark owner's live leaderboard, Best view, updated 2026-09-22.
resource: https://deepswe.datacurve.ai/
tags: [leaderboard, deepswe, snapshot]
generated: { by: claude/sonnet-5.5, at: 2026-10-03T11:00:00+05:30 }
status: draft
stale_after: 2026-11-02T00:00:00+05:30
sources:
  - id: board
    resource: https://deepswe.datacurve.ai/
    title: DeepSWE leaderboard
    author: team:datacurve
---

# Source identity

- Owner: Datacurve. Version v1.1. Page states "113 tasks, updated September 22, 2026". Header counts: 113 tasks, 91 repos, 5 languages, 28 models.
- Accessed: 2026-10-03, from the page HTML. Mutable page: re-check before reuse.
- View captured: "Best", models 21 of 28 listed (filter default), configs 57 of 70. Harness: mini-swe-agent for all models.
- Version difference: the README says v1.1 grades in separate verifier environments (Pier 0.3.0 or later). These numbers are not directly comparable to the paper's v1 Figure 1. Example: gpt-5.5 [xhigh] is 70.0% in the paper (v1, May 2026) and 67% on this board (v1.1).
- Earlier snapshot: the AI Research wiki recorded this page on 2026-09-03 with muse-spark-1.2 [xhigh] at 55%, which matches today's row (see AI Research `raw/sources/muse-spark-1-3-independent-evaluations.md`).

# Rows (Pass@1 ± run interval, average cost per task, median output tokens, steps)

| Model [effort] | Pass@1 | Avg cost | Out tok | Steps |
|---|---|---|---|---|
| gpt-6-astra [xhigh] | 74% ± 3% | $4.43 | 30k | 29 |
| gemini-3.8-flash [high] | 74% ± 1% | $2.36 | 143k | 166 |
| claude-opus-5 [max] | 74% ± 4% | $11.84 | 118k | 99 |
| gpt-5.6-sol [max] | 73% ± 3% | $6.46 | 60k | 61 |
| claude-fable-5 [xhigh] | 70% ± 3% | $13.41 | 80k | 68 |
| glm-5.3 [max] | 69% ± 3% | $3.99 | 80k | 124 |
| kimi-k3 [max] | 69% ± 5% | $4.65 | 81k | 98 |
| grok-4.6 [medium] | 67% ± 2% | $3.45 | 50k | 70 |
| gpt-5.6-luna [max] | 67% ± 4% | $0.61 | 73k | 102 |
| gpt-5.5 [xhigh] | 67% ± 6% | $7.23 | 46k | 82 |
| gemini-3.7-flash [medium] | 65% ± 3% | $2.03 | 94k | 117 |
| glm-5.3-flash [max] | 63% ± 4% | $0.24 | 73k | 123 |
| deepseek-v4-pro [max] | 63% ± 6% | $1.67 | 106k | 155 |
| claude-opus-4.8 [max] | 59% ± 2% | $13.22 | 135k | 120 |
| qwen3.8-max [xhigh] | 57% ± 3% | $3.73 | 95k | 111 |
| muse-spark-1.2 [xhigh] | 55% ± 2% | $3.70 | 99k | 101 |
| claude-sonnet-5 [max] | 54% ± 4% | $26.40 | 214k | 268 |
| deepseek-v4-flash [max] | 53% ± 4% | $0.46 | 108k | 153 |
| gemini-3.6-flash [high] | 47% ± 4% | $2.21 | 96k | 117 |
| glm-5.2 [max] | 44% ± 2% | $3.92 | 78k | 129 |
| gemini-3.5-flash [high] | 36% ± 4% | $3.45 | 76k | 105 |
