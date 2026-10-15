---
type: Topic
title: Claude Code
description: Features of Claude Code covered in videos, starting with mods and the Blast Radius sample mod.
tags: [claude-code, mods, agents, safety]
generated: { by: claude/opus-5.5, at: 2026-10-05T10:10:00+05:30 }
status: draft
stale_after: 2027-01-05T00:00:00+05:30
sources:
  - id: docs
    resource: https://code.claude.com/docs/en/plugins/mods/overview
    title: Mods overview
    author: org:anthropic
  - id: readme
    resource: https://github.com/anthropics/claude-code-playground/blob/main/claude-code/mods/blast-radius/README.md
    title: Blast Radius README
    author: org:anthropic
---

# Claude Code

Product features rather than papers. The first item is database item `claude-code-mods` (kind `topic`).

## Mods, with Blast Radius as the example (item `claude-code-mods`)

Sources: [mods docs](/raw/sources/claude-code-mods-docs.md), [announcement](/raw/sources/claude-code-mods-blog.md), [Blast Radius README](/raw/sources/blast-radius-readme.md).

1. **Identity.** Claude Code mods, announced 2026-10-01. Example: Blast Radius, a sample mod in `anthropics/claude-code-playground`, shared as is with no support.
2. **Problem.** An agent can run a destructive shell command (`rm -rf`, `git reset --hard`, a force push) before the user sees what it will touch.
3. **Mechanism.** A mod is JavaScript or TypeScript event handlers inside a plugin. Blast Radius hooks `tool.call`. For a risky Bash command it holds the call, measures what the command would touch, and draws a pane with Proceed and Cancel. Cancel has focus, so Enter refuses. Claude gets the refusal and the reason.
4. **Evidence.** The README's demo shows `rm -rf build` held, with Cancel keeping the files and Proceed deleting them. That was tested in a live session before the review fixes. The fixes have unit tests but were not re-run live. No independent evaluation exists.
5. **What it does not do.** It reads the command text only, so `bash -c`, aliases, `eval`, `$(...)` and scripts can slip past. It watches Bash only. It is a safety net, not a permission system. Mods in general are not sandboxed and run with your permissions.
6. **A test of the claim.** Run a fixed list of destructive commands, plain and wrapped, through a session with the mod. Count which are held, and compare the listed files with what was actually deleted after Proceed.
7. **Read next.** The mods events page (`/docs/en/plugins/mods/events`) on guarding tool calls, and the permissions docs for hard blocks.
8. **Teaching angle.** One concrete moment: the agent is about to delete a folder, the mod freezes it and shows the blast radius, and the user chooses. Then the honest limits.

Video: `paper-reels/episodes/claudeCodeMods/` (not for posting, per the request that made it).

## Open questions
- How often do real agent sessions issue wrapped destructive commands that a text-only check misses?
- Open question: the sources give no measurement of hold latency for large folder trees beyond "a few seconds".
