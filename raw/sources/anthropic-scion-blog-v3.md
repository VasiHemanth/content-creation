---
type: Source Record
title: Scion source-control article, re-read for the v3 explainer
description: Second full read of the saved Anthropic Scion article, with the exact sentences and print pages behind the anthropic-scion-v3 reel.
tags: [agents, source-control, infrastructure]
generated: { by: claude/opus-5.5, at: 2026-10-15T17:40:00+05:30 }
status: draft
stale_after: 2027-10-15T00:00:00+05:30
sources:
  - id: article
    resource: https://www.anthropic.com/engineering/redesigning-source-control
    title: Redesigning source control at Anthropic
    author: org:anthropic
---

# Scion source record (v3 read)

Same article and same saved files as [the first record](/raw/sources/anthropic-scion-blog.md): `/raw/assets/anthropic-scion/article-text.txt` (plain text, 3,826 words), `article-print-clean.pdf` (Chrome print, 18 pages) and `article-print-clean-text.txt` (its text with page marks). Published 2026-10-13. Read in full again on 2026-10-15 for database item `anthropic-scion-v3`. Nothing was downloaded again.

What the article says, with print pages:

- Git's design. "every clone is a complete, self-contained repository that can compute diffs, read history and blame, and check out any revision while fully offline. For the vast majority of repositories, this is the right design" (Growing our monorepo, p2 to p3).[^article]
- Size and load. "The history of our main branch alone is almost 100 GB, and a compressed working copy is over 25 GB. We perform on the order of 25 million code checkouts per day for CI, before counting developer environments, agent sandboxes, and research jobs. Fetched naively, that would be over 600 PB of git traffic per day." (p3). The 600 PB is a hypothetical: Anthropic used shallow and partial clones, sparse checkouts, several hundred internal mirrors and snapshots.[^article]
- The design rule. "nearly all of our clients were agents and jobs that are online by definition" (p3). Principles: "Clients are always online", with "a server that is always reachable", and clients "fetch data when they need it" (p4).[^article]
- No full copy anywhere. "there is no fully materialized copy of the repo anywhere, even on the server" (Principles).[^article]
- Fetch path. Starting from a root tree, the client requests missing trees recursively, then blobs. "Every request is for a specific object that never changes, so any cache can answer it." A per-node daemon, regional cache servers, then authoritative servers (Scaling Scion).[^article]
- Results, owner-reported. "Each tier of this system maintains a cache hit rate of over 99%" and "Our Scion infrastructure footprint is now 200x smaller than our previous git mirroring infrastructure in terms of CPU and memory requirements" (p8).[^article]
- Limit. "Scion is by no means a suitable replacement for git for general use. The concepts we've outlined here really only make sense for truly enormous monorepos" (p12).[^article]

Not used by the v3 reel, on purpose: the text's "two orders of magnitude faster" (the article's own performance figure shows about 8x for the CI checkout rows), the 25% CI CPU win, the merge counts, the team size and timeline.

[^article]: [Full original article](https://www.anthropic.com/engineering/redesigning-source-control), sections Growing our monorepo, Principles for agent-scale source control, Scaling Scion, Contributing to the wider ecosystem. Page numbers refer to `article-print-clean.pdf`.
