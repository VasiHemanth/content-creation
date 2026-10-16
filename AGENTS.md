# content-creation

Short explainer reels and carousels for @hemanth_with_ai: AI research papers and system-design articles, made by agents, checked by code, posted only on a human's yes.

## Where things live
| Path | What |
|---|---|
| `.claude/skills/make-reel`, `make-post`, `make-thread` | The pipelines, step by step. Follow them in order. |
| `.claude/agents/*.md` | One file per agent (role, inputs, output). |
| `paper-reels/formats/` | Video formats (`paper`, `system-design`): `explain.md` for all, one file per format, `picture.md` for planning, `formats.json` for the limits code enforces. |
| `paper-reels/hf/README.md` | How to build scenes (for the build-phase producer). |
| `paper-reels/episodes/<name>/` | One reel: treatment, storyboard, facts, evidence, scenes, renders. |
| `llm-wiki/raw/assets/<id>/` | Source PDFs and text. The pipeline reads these. |
| `data/content.sqlite` | Items, episodes, post text, reviews, approvals, posts. Not in git. |
| `PIPELINE.md` | Gates and publishing rules. `ARCHITECTURE.md` is reference for people; agents do not need it. |

## Pipelines
- Reel: reel-director, cold-viewer, reel-producer (script phase), cold-viewer, reel-producer (build phase, a new spawn), reel-validator and retention-critic in parallel, then publish by the orchestrator. `/make-reel <url>`.
- Post: post-director, post-producer, post-validator, then publish by the orchestrator. `/make-post`.
- Thread (papers only, after the reel is live): thread-writer, thread-checker, then `uploader/scripts/post_thread.js`. `/make-thread`.
- In harnesses that spawn subagents only on request (Codex) or through a tool (Antigravity `invoke_subagent`), spawn each agent by name.

## Rules no code enforces
- A producer or writer never judges its own output. A checker never edits.
- Every reel script passes the cold-viewer check before any voice is made.
- Post only after the human says yes in chat for those exact files, recorded with `reels approve`. Never record a yes the human did not give.
- Read only the files your prompt names. Do not load docs "for context".
- Credentials stay in `uploader/.env` and the token files. Never print them.

The gates that code enforces (validation, length, size, STE, jargon order, approval record, render lock) are listed in `PIPELINE.md`.

## Editing agents
Source of truth: `.claude/agents/*.md` and `.claude/skills/`. Do not edit `.opencode/`, `.codex/`, `.agents/` by hand. After a change, run `node scripts/sync-agents.mjs`. Models for other harnesses: `agents.models.json` (Antigravity takes only `pro`, `flash` or `inherit`). A rule lives in one file; prompts cite `file#section` instead of repeating it.
