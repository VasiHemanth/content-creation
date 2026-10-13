---
type: Topic
title: Scion source-control architecture
description: How Anthropic serves immutable source-control objects through shared cache tiers for its online agent workload.
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

# Scion

Database item `anthropic-scion`, kind `topic`. Source: [immutable source record](/raw/sources/anthropic-scion-blog.md).

1. **Identity.** Anthropic engineering article, published 2026-10-13, saved and read in full 2026-10-14. Nick G. and source-control team.
2. **Problem.** Anthropic's agent-driven merge and checkout workload strained its existing Git mirror infrastructure.[^article]
3. **Mechanism.** Scion moves history, commits and merges to servers. Clients request needed immutable trees and blobs. A node-wide daemon shares cached objects across jobs, requests missing objects from regional caches, and those caches request misses from authoritative servers, which read Spanner or cloud storage as needed. Scion distributes repository data rather than materializing the entire repo on any server.[^article]
4. **Evidence.** Anthropic reports around 2,500 merged code changes/day in May 2026 and over 30,000/day in September. It reports 200 times smaller source-control infrastructure CPU and memory requirements than its old Git mirroring infrastructure. These are owner-reported operational observations, not an independent benchmark.[^article]
5. **Scope.** The metric does not mean 200 times faster checkouts, all-CI savings, or lower dollar costs. Git already supports partial clones and sparse tools. Scion assumes online clients, huge monorepos, and bespoke review/search/CI; the source explicitly says it is unsuitable as a general Git replacement.[^article]
6. **Test.** Compare matched checkout and metadata workloads with specified repository size, warm/cold caches, concurrency, and failure conditions, measuring CPU, memory, tail latency and backing-store traffic. Open question: the article does not publish a reproducible workload harness for the 200 times ratio.
7. **Read next.** The article's data structures and derived-data sections; linked Piper and Sapling prior art.
8. **Teaching angle.** Follow one cache miss upstream and the same immutable object downstream, then show a later job reusing the node's cached object. The warehouse is a conceptual namespace, never a complete repo per server.

[^article]: [Anthropic article](https://www.anthropic.com/engineering/redesigning-source-control), Opening; Growing our monorepo; Principles; Scaling Scion; conclusion. Receipt phrases appear in genuine print pages 4 and 7; the infrastructure ratio appears on page 8.
