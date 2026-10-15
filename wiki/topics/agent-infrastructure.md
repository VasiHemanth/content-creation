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
- Scion, third video (database item `anthropic-scion-v3`, format system-design, episode `paper-reels/episodes/scionV3/`). Source: [v3 read of the article](/raw/sources/anthropic-scion-blog-v3.md). It follows one file and one CI machine: Git sends every file and every past version so people can work offline; here the files alone are over 25 GB, and 25 million CI checkouts a day would mean over 600 PB if each took the full copy. CI jobs never work offline, so Scion keeps past versions on the server, the machine asks only for the files it reads, and a machine cache and a shared cache each answer over 99% of requests. Anthropic reports 200 times less CPU and memory than its old Git mirrors, and says the design fits only truly enormous monorepos.

## Open questions

How do cache hit rates, tail latency, and fault recovery change at different repository sizes and concurrency levels? Which principles remain useful for teams that need offline work?
