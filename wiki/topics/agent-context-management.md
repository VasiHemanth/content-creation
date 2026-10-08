---
type: Topic
title: Agent context management
description: How long-running agents decide what stays in their context window, who decides, and what it costs.
tags: [agents, context, memory]
generated: { by: claude/opus-5.5, at: 2026-10-08T08:25:00+05:30 }
status: draft
stale_after: 2027-01-01T00:00:00+05:30
---

# Agent context management

Papers on compaction, offloading, retrieval and model-controlled editing of an agent's context.

## Papers
- [Context Language Models](/wiki/papers/2609.37725.md): the model edits its context as a file and beats fixed compaction harnesses in the authors' runs.
- [ContextEvo](/wiki/papers/2609.34649.md): the harness learns its context policy from its own trajectories while the model stays fixed; on long terminal tasks this beat skills learned from the same runs (single runs, held-out results mixed).

Two answers to "who decides what the model sees": the model itself (Context Language Models) or a harness policy learned between runs (ContextEvo).

## Open questions
- Does the FLOPs advantage hold up in measured latency and cost?
- How do editable contexts hold up against prompt injection?
- How much does it cost to learn a context policy, against the tokens it saves per run?
- A policy learned on one benchmark lowered scores on another (ContextEvo, Table 13). Can one policy serve many environments?
