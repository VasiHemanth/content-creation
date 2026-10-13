---
type: Topic
title: Agent infrastructure
description: How development infrastructure changes under agent workloads.
tags: [agents, source-control, infrastructure]
generated: { by: codex/gpt-6.1-sol, at: 2026-10-14T12:00:00+05:30 }
status: draft
stale_after: 2027-10-14T00:00:00+05:30
sources:
  - id: article
    resource: https://www.anthropic.com/engineering/redesigning-source-control
    title: Redesigning source control at Anthropic
    author: org:anthropic
---

# Agent infrastructure

- [Scion source-control architecture](/wiki/topics/scion-source-control.md): online clients, shared immutable object caches, server-side source-control APIs, and the limits of Anthropic's reported infrastructure comparison.
- [Claude Code](/wiki/topics/claude-code.md): agent developer tooling.

## Open questions

How do cache hit rates, tail latency, and fault recovery change at different repository sizes and concurrency levels? Which principles remain useful for teams that need offline work?
