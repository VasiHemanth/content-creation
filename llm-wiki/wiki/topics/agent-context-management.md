---
type: Topic
title: Agent context management
description: How long-running agents decide what stays in their context window, who decides, and what it costs.
tags: [agents, context, memory]
generated: { by: claude/opus-5.5, at: 2026-10-09T08:40:00+05:30 }
status: draft
stale_after: 2027-01-01T00:00:00+05:30
---

# Agent context management

Papers on compaction, offloading, retrieval and model-controlled editing of an agent's context.

## Papers
- [Context Language Models](/wiki/papers/2609.37725.md): the model edits its context as a file and beats fixed compaction harnesses in the authors' runs.
- [ContextEvo](/wiki/papers/2609.34649.md): the harness learns its context policy from its own trajectories while the model stays fixed; on long terminal tasks this beat skills learned from the same runs (single runs, held-out results mixed).

- [AutoCompact](/wiki/papers/2610.02163.md): a coding agent is trained (judge-corrected SFT, then one pass-or-fail RL reward) to choose when to compact, what to keep and how to continue; 30.4% to 39.6% on SWE-bench Verified with the same base model. Skipping its compact calls costs 19.9 points on a tight budget but only 1.9 at the largest.

- [Meta-Reasoning (Thinking Before Thinking)](/wiki/papers/2609.38147.md): a controller that only decides the next work keeps a compact state, leaves every output in persistent memory and picks which outputs each worker sees; it beat a matched direct-control agent (same workers, full history in one call) in all 12 main-budget comparisons, some by small margins. It changes who directs the run more than what the context holds.

- [Stateless Language Agents (SLA)](/wiki/papers/2610.07625.md): for research runs of up to a billion tokens, no agent keeps its conversation across invocations; the harness keeps candidates and scores and builds a fresh context per role, and a stateless Advisor assigns experiments to parallel Workers. Best final result on every task in the authors' runs; over 84% fewer tokens to match the strongest baseline on one kernel task (lower of two setups). Statelessness itself is not ablated.

Answers to "who decides what the model sees": the model itself (Context Language Models, and AutoCompact for the timing of compaction), a harness policy learned between runs (ContextEvo), or a separate controller inside the run (Meta-Reasoning), or the harness itself, with no agent keeping state (SLA).

## Open questions
- Does the FLOPs advantage hold up in measured latency and cost?
- How do editable contexts hold up against prompt injection?
- How much does it cost to learn a context policy, against the tokens it saves per run?
- When a trained agent compacts, how much of its gain comes from the compaction itself and how much from the training? AutoCompact has no matched RL control without `compact()`.
- A policy learned on one benchmark lowered scores on another (ContextEvo, Table 13). Can one policy serve many environments?
- Meta-Reasoning changes the compact state, the control stages and memory access together. Which of them carries the gain, and does it hold at equal tokens rather than equal calls?
- SLA's ablations keep every agent stateless. Does a Worker that keeps its conversation, with the same harness-built context on top, do worse over a full run?
