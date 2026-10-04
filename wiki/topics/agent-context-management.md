---
type: Topic
title: Agent context management
description: How long-running agents decide what stays in their context window, who decides, and what it costs.
tags: [agents, context, memory]
generated: { by: claude/sonnet-5.5, at: 2026-10-04T14:50:00+05:30 }
status: draft
stale_after: 2027-01-01T00:00:00+05:30
---

# Agent context management

Papers on compaction, offloading, retrieval and model-controlled editing of an agent's context.

## Papers
- [Context Language Models](/wiki/papers/2609.37725.md): the model edits its context as a file and beats fixed compaction harnesses in the authors' runs.

## Open questions
- Does the FLOPs advantage hold up in measured latency and cost?
- How do editable contexts hold up against prompt injection?
