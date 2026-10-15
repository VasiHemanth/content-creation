---
type: Source Record
title: Blast Radius README (claude-code-playground)
description: README of the Blast Radius sample mod for Claude Code, accessed 2026-10-05.
resource: https://github.com/anthropics/claude-code-playground/blob/main/claude-code/mods/blast-radius/README.md
tags: [claude-code, mods, sample]
generated: { by: claude/opus-5.5, at: 2026-10-05T10:10:00+05:30 }
status: draft
stale_after: 2027-01-05T00:00:00+05:30
sources:
  - id: readme
    resource: https://github.com/anthropics/claude-code-playground/blob/main/claude-code/mods/blast-radius/README.md
    title: Blast Radius README
    author: org:anthropic
---

# Source identity

Fetched 2026-10-05 with `gh api repos/anthropics/claude-code-playground/contents/claude-code/mods/blast-radius/README.md`. Primary source, read in full.

# What it says

- A Claude Code mod that holds a risky shell command and shows what it would change before it runs. Shared as a small, complete example of a mod that pauses a tool call and asks the user to decide.
- When Claude calls Bash with a listed command, it stops the call, works out what the command would touch, and opens a pane with two buttons: Proceed runs the command, Cancel refuses it. Claude sees the refusal and the reason.
- Commands covered: `rm -r`, `rm -f`, `rm -rf` (the files it would delete, with the count and total size), `git reset --hard`, `git checkout -- .`, `git restore .`, `git clean`, `git push --force` and variants, and several migration tools. Every other command runs as normal.
- Pane keys: `1` for Proceed, `2` for Cancel. Cancel has the focus when the pane opens, so Enter refuses. No answer within 10 minutes, or an interrupt (Esc), refuses the command.
- In a narrow terminal the report goes in the band above the prompt.
- Demo: `rm -rf build` held; after Cancel, Claude reports nothing was deleted.
- Run for one session with `claude --plugin-dir ./blast-radius`. Requires a recent Claude Code where mods load by default (the README names the version).
- Limits: it reads the command text and does not parse shell fully (`$(...)`, aliases, `eval`, `bash -c`, `xargs rm`, `find -delete`, scripts that call `rm`, wrappers are not caught). It only watches the Bash tool. It holds a call but does not sandbox it. "This is a safety net, not a permission system. Use permission rules for a hard block."
- Built with Claude in Claude Code from one of ten mod ideas Claude wrote. Some fixes after review are covered by tests but not re-run in a live session.
- Shared as-is; not an official Anthropic product; no support or maintenance implied.
