---
type: Topic
title: Scion source-control architecture
description: How Anthropic serves immutable source-control objects through shared cache tiers for its online agent workload.
tags: [agents, source-control, infrastructure]
generated: { by: claude/opus-5.5, at: 2026-10-14T18:00:00+05:30 }
status: draft
stale_after: 2027-10-14T00:00:00+05:30
sources:
  - id: article
    resource: https://www.anthropic.com/engineering/redesigning-source-control
    title: Redesigning source control at Anthropic
    author: org:anthropic
---

# Scion

Database items `anthropic-scion` (first video) and `anthropic-scion-v2` (rebuild from a new treatment), both kind `topic`. Source: [immutable source record](/raw/sources/anthropic-scion-blog.md). The v2 receipts are phrase-only crops and one figure crop captured from the live article at 2x DPR (`paper-reels/episodes/scionV2/capture-evidence.mjs`).

1. **Identity.** Anthropic engineering article, published 2026-10-13, saved and read in full 2026-10-14. Nick G. and source-control team.
2. **Problem.** Anthropic's agent-driven merge and checkout workload strained its existing Git mirror infrastructure.[^article]
3. **Mechanism.** Scion moves history, commits and merges to servers. Clients request needed immutable trees and blobs. A node-wide daemon shares cached objects across jobs, requests missing objects from regional caches, and those caches request misses from authoritative servers, which read Spanner or cloud storage as needed. Scion distributes repository data rather than materializing the entire repo on any server.[^article]
4. **Evidence.** Anthropic reports around 2,500 merged code changes/day in May 2026 and over 30,000/day in September. It reports 200 times smaller source-control infrastructure CPU and memory requirements than its old Git mirroring infrastructure. These are owner-reported operational observations, not an independent benchmark.[^article] Further Anthropic-reported figures used by the v2 video: on the order of 25 million CI checkouts per day before developer environments, agent sandboxes and research jobs (Growing our monorepo); a peak of 30,401 changes merged on Sep 9 in the merges-per-day figure; a cache hit rate of over 99% on each tier (Scaling Scion); a median new agent worktree of 7.1 min with git against 5.1 s with scn (performance figure, Agent environments); and a Claude Mythos Preview rewrite of the git-to-Scion ingestion prototype that used 20x less memory (What we learned). The text's "two orders of magnitude faster (in seconds rather than minutes)" does not match the figure's CI rows (31 s to 3.5 s, 175 s to 22 s, both near 8x); only the new-worktree row is near 100x (x84).[^figures]
5. **Scope.** The metric does not mean 200 times faster checkouts, all-CI savings, or lower dollar costs. Git already supports partial clones and sparse tools. Scion assumes online clients, huge monorepos, and bespoke review/search/CI; the source explicitly says it is unsuitable as a general Git replacement.[^article]
6. **Test.** Compare matched checkout and metadata workloads with specified repository size, warm/cold caches, concurrency, and failure conditions, measuring CPU, memory, tail latency and backing-store traffic. Open question: the article does not publish a reproducible workload harness for the 200 times ratio.
7. **Read next.** The article's data structures and derived-data sections; linked Piper and Sapling prior art.
8. **Teaching angle.** Follow one cache miss upstream and the same immutable object downstream, then show a later job reusing the node's cached object. The warehouse is a conceptual namespace, never a complete repo per server.

[^article]: [Anthropic article](https://www.anthropic.com/engineering/redesigning-source-control), Opening; Growing our monorepo; Principles; Scaling Scion; conclusion. Receipt phrases appear in genuine print pages 4 and 7; the infrastructure ratio appears on page 8.
[^figures]: Article figures "Changes merged to our monorepo per day, from January to September 2026" and "Observed performance improvements on native Scion repos", read from the live page at 2x DPR on 2026-10-14; captures archived as [figure-merges-2x.png](/raw/assets/anthropic-scion/figure-merges-2x.png) and [figure-performance-2x.png](/raw/assets/anthropic-scion/figure-performance-2x.png).

## Third video (anthropic-scion-v3)

Database item `anthropic-scion-v3`, kind `topic`, format `system-design` (episode `paper-reels/episodes/scionV3/`). Source: [v3 read of the article](/raw/sources/anthropic-scion-blog-v3.md). It follows one file and one CI machine: Git sends every file and every past version so people can work offline, which is right for most projects; here the files alone are over 25 GB, and 25 million CI checkouts a day would mean over 600 PB if each took the full copy. CI jobs never work offline, so Scion keeps past versions on the server, the machine walks trees to the one file it needs, and content addresses let a machine cache and a shared cache answer over 99% of requests. Payoff: 200 times less CPU and memory than the old Git mirrors (Anthropic's figure). Limit: only for truly enormous monorepos.[^v3]

[^v3]: [Anthropic article](https://www.anthropic.com/engineering/redesigning-source-control), Growing our monorepo (p3), Principles (p4), Scaling Scion (p8), Contributing to the wider ecosystem (p12) of `article-print-clean.pdf`.
