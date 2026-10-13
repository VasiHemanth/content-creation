---
type: Source Record
title: Scion source-control engineering article
description: Saved full Anthropic engineering article and genuine browser print for an unofficial architecture explainer.
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

# Scion source record

Published 2026-10-13. Accessed 2026-10-14. By Nick G. and Anthropic's source-control team. Engineering case study, not an independently reproduced benchmark.

Full HTML, extracted text, Chrome print PDF, and page-marked PDF text are in `/raw/assets/anthropic-scion/`. The reel uses the saved source version. SHA256 of saved HTML: `874f141ac18946af7a1fb48a8cc2f2abe2a70b616f7769bcfe7e143824d06997`.

The article reports around 2,500 daily merged changes in May and over 30,000 in September. Its Scaling Scion section describes immutable trees/blobs, shared per-node daemons, regional caches, and authoritative servers reading Spanner or cloud storage. It reports a 200 times smaller infrastructure CPU and memory requirement versus its prior Git mirroring infrastructure. That ratio does not measure all CI, speed, quality, or dollar costs.[^article]

Git already provides partial-clone and sparse tools. Scion targets Anthropic's enormous monorepo and online agents/jobs. No machine holds a fully materialized repository, including the server. The conclusion expressly rejects Scion as a general-purpose Git replacement.[^article]

[^article]: [Full original article](https://www.anthropic.com/engineering/redesigning-source-control), Opening, Growing our monorepo, Principles for agent-scale source control, Scaling Scion, and conclusion.
