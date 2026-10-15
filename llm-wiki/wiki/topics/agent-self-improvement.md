---
type: Topic
title: Agent self-improvement
description: Agents that improve their own search policies, harnesses or skills between runs, and how that improvement is measured.
tags: [agents, self-improvement, exploration]
generated: { by: claude/sonnet-5.5, at: 2026-10-11T00:35:00+05:30 }
status: draft
stale_after: 2027-10-07T00:00:00+05:30
---

# Agent self-improvement

Papers on agents that change their own exploration policies, code or skills from one run to the next.

## Papers
- [Dream-RSI](/wiki/papers/2609.14858.md): replays past discovery trees to test new exploration policies without new runs, and reports fewer agent calls for similar or better results in several tasks.
- [ContextEvo](/wiki/papers/2609.34649.md): harness evolution aimed at the context policy rather than skills; filed under [agent context management](/wiki/topics/agent-context-management.md).
- [Agent Plasticity](/wiki/papers/2610.08902.md): measures rather than builds. A protocol with frozen weights and a metric, held-out score gained per dollar of learning cost; in the authors' runs the model with the highest fitted score and the one with the highest estimated plasticity differ.

## Open questions
- How much compute does the self-improvement step use, compared with the compute it saves?
- Does a policy learned from one model's history work with a different model?
- Does plasticity measured on games predict how fast an agent improves on other tasks? The authors train separate lineages per task and do not test this.
