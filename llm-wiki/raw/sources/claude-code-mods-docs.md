---
type: Source Record
title: Claude Code docs, Mods overview and Create a mod
description: Official docs pages on Claude Code mods (overview, create), accessed 2026-10-05.
resource: https://code.claude.com/docs/en/plugins/mods/overview
tags: [claude-code, mods, docs]
generated: { by: claude/opus-5.5, at: 2026-10-05T10:10:00+05:30 }
status: draft
stale_after: 2027-01-05T00:00:00+05:30
sources:
  - id: overview
    resource: https://code.claude.com/docs/en/plugins/mods/overview
    title: Mods overview
    author: org:anthropic
  - id: create
    resource: https://code.claude.com/docs/en/plugins/mods/create
    title: Create a mod
    author: org:anthropic
---

# Source identity

Both pages fetched 2026-10-05 through a fetch tool that returned the page markdown. The docs warn that events and methods can change between releases.

# What it says

- A mod is a plugin made of JavaScript or TypeScript event handlers. Claude Code calls one when an event happens, such as a tool call, a submitted prompt, or a part of the interface being drawn. The handler can observe, rewrite or answer the event.
- Mods can draw a pane beside the transcript or a band above the prompt, with tabs, buttons and text fields; redraw parts of Claude Code's own interface (not the permission prompt); hold or answer a tool call; add commands.
- Example hook shape: `on('tool.call', async ($, e, next) => { ... return next(e) })`. Files: `.claude-plugin/plugin.json`, `hooks/hooks.json` (with `modules`), `hooks/register.js`.
- Making one: describe it in a Claude Code session and Claude writes it, using the built-in `plugin-authoring` skill; you approve hot reloading for the session.
- Load a directory for one session with `claude --plugin-dir <dir>`. `claude plugin validate` lists the hooks and calls a mod makes.
- Sample mods (token-weather, blast-radius, replay-theater) live in the claude-code-playground repo and are shared as they are, without support.
- Trust: a mod runs with your permissions (files, processes, network, secrets, session). "Mods aren't sandboxed." Install only from authors and marketplaces you trust.
- Mods require a recent Claude Code version (the page names it) and are on by default.
