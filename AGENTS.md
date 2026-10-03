# Content wiki operating contract

This wiki is the knowledge layer behind the short-form video channels (YouTube @hemanth_with_ai, Instagram @hemanth.with.ai, Threads @hemanth.with.ai). The human picks what deserves attention. The agent compiles sources into linked pages, keeps provenance, and writes the post text that goes with each video.

Pattern: Karpathy's LLM Wiki (raw sources, a compiled wiki, a schema file; ingest, query, lint). Page metadata follows Open Knowledge Format v0.2. Both were reviewed from `~/Documents/AI Research`, which stays untouched as the reference project.

## Two stores, one owner each

| Store | Owns | Never holds |
|---|---|---|
| `llm-wiki/` (Markdown, git) | dossiers, topics, concepts, raw source records, the log | post text, post URLs, statuses |
| `../data/content.sqlite` | items, episodes, post text (title, description, caption, with revisions), posts, comments | prose analysis |

Page statuses come from the database. Wiki pages are edited, never regenerated. The CLI only appends to `log.md`.

## Read order

1. `index.md`, then the `index.md` of the directory you need.
2. `log.md` for recent changes.
3. `rg -n "<query>" wiki raw` before creating a page. Reuse a topic before inventing one.

## Layers

- `raw/sources/`: one immutable record per source (paper, announcement). Records capture identity (URL, version, access date) and what the source says. Add records; never rewrite their claims.
- `wiki/papers/<arxiv-id>.md`: one dossier per paper we cover.
- `wiki/topics/<slug>.md`: one page per category, linking its papers and open questions.
- `wiki/concepts/`: ideas that span papers.
- `AGENTS.md`: this file. Change it together with the human.

## Frontmatter (OKF v0.2)

```yaml
---
type: Paper            # Paper | Topic | Concept | Source Record
title: SkillSeek
description: One-sentence routing summary.
tags: [agents, retrieval]
generated: { by: claude/sonnet-5.5, at: 2026-10-03T00:00:00+05:30 }
status: draft          # draft | stable | deprecated
stale_after: 2027-01-01T00:00:00+05:30
sources:
  - id: paper
    resource: https://arxiv.org/abs/2609.38822
    title: Paper title
    author: human:paper-authors
---
```

- `type`, `title`, `description`, `status` are required. `generated.at` changes only after a meaningful content edit.
- Omit `verified` until someone or some process checked the prose against the sources. A `human:<id>` verifier means human-reviewed, anything else machine-confirmed. Never store a numeric trust score.
- `stale_after` is an absolute date. Default is 90 days for claims that depend on a benchmark setup, one year otherwise.
- Give sources stable IDs and use matching footnotes for numbers and strong claims.
- Link with root-relative paths, e.g. `/wiki/papers/2609.38822.md`.

## Paper dossier contract

A paper gets a dossier before any post text is written. It answers:

1. Identity: title, authors, arXiv id, and the version the video was made from.
2. What problem does it address, in one sentence?
3. What is the method?
4. What is the evidence: benchmark, setup, headline numbers, and who produced them?
5. What does it not show (scope, harness, baselines)?
6. What is one experiment that would test the main claim?
7. What should be read next?
8. What is the sharpest teaching angle for a 60 second video?

Write `Open question` for anything the source does not state. Do not fill gaps from memory. Numbers must appear in the abstract or body of the source.

## Writing rules

Plain, specific prose. No hype words, no antithesis padding ("not just X, it's Y"), no em-dashes. Separate what the authors report from what we infer. Say "unofficial explainer" in post text.

## Workflows

**Ingest.** Add a dated record under `raw/sources/`. Search for overlap. Create or update the paper dossier and its topic page. Update `index.md`. Append `## [YYYY-MM-DD] ingest | <title>` to `log.md`. Run lint.

**Make a video.** `node paper-reels/bin/reels.mjs add <arxiv url>` creates the database item. Write the dossier. Draft script, scenes, thumbnail text. Store post text with `reels.mjs text`. Render, then publish.

**Query.** Start at `index.md`. Prefer human-reviewed over machine-confirmed over unverified pages. Re-open the source for stale or high-stakes claims. File durable new synthesis back into `wiki/concepts/` and log it.

**Comments and replies.** Draft from the paper's dossier and `one_liner`. Store drafts in the `comments` table. Only state facts the dossier sources.

**Lint.** `python3 scripts/lint_wiki.py . --db ../data/content.sqlite` and `python3 -m unittest discover -s tests`. Then read for contradictions, stale claims, duplicate concepts, orphans.

## Publishing

Post text lives in the database as numbered revisions. Each `posts` row records which revision went live. Editing a caption adds a revision; it never overwrites. Posting rules (approval gate, autonomy level) are set by the human and recorded here:

- Current rule: `OPEN QUESTION`. The earlier research wiki required explicit approval before every post; the reel pipeline is meant to run unattended. Decide which applies and write it here.

## Boundaries

- Always: keep source URLs, separate authors' claims from our inference, log every ingest and publish.
- Ask first: delete or deprecate a page, change the database schema, add dependencies, publish anything the human has not seen.
- Never: invent results, mark agent prose as human-reviewed, edit raw records, put post text or URLs in the wiki.
