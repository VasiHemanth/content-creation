# content-creation

Short-form video and carousel pipeline for @hemanth_with_ai. Read `README.md` for the layout, `PIPELINE.md` for the reel pipeline and gates, `ARCHITECTURE.md` for details, and `llm-wiki/AGENTS.md` for wiki rules.

## Agents and skills
- Source of truth for agents and skills: `.claude/agents/*.md` and `.claude/skills/`. Do not edit `.opencode/agents/`, `.codex/agents/`, `.agents/agents/` or `.agents/skills/` by hand. After a change, run `node scripts/sync-agents.mjs`.
- Models for OpenCode, Codex and Antigravity: `agents.models.json`. Antigravity takes only `pro`, `flash` or `inherit`.
- Skills: `.claude/skills/make-reel` and `.claude/skills/make-post` hold the pipeline steps. Follow them in order.
- Reel formats: `paper` (arXiv paper, 60 to 80 s) and `system-design` (engineering article, 120 to 170 s, draft). Each episode declares one in `storyboard.json` (`format`; none means `paper`). Rules per format: `paper-reels/formats/` (`explain.md` applies to all). Limits that code enforces: `paper-reels/formats/formats.json`.
- Subagent order for a reel: reel-director, cold-viewer (on the treatment script), reel-producer, cold-viewer (on the storyboard), reel-validator, retention-critic, then publish policy. For a post: post-director, post-producer, post-validator, post-publisher. For a Threads thread: `/make-thread` (scripts/thread-prep.mjs, thread-writer, thread-checker, then uploader/scripts/post_thread.js). `/make-reel` runs it by itself once the Instagram reel is live. In harnesses that spawn subagents only on request (Codex), or through a tool such as `invoke_subagent` (Antigravity), spawn each one by name.

## Rules
- Never skip validation. A producer never judges its own output.
- Every script must pass the cold-viewer check: a viewer with no background, given only the spoken lines, explains each term and the main idea back.
- Post only after a human approves, unless `settings.autopublish` is on.
- Credentials stay in `uploader/.env` and the token files. Never print them.
