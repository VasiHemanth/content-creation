---
type: Source Record
title: Claude Code mods announcement
description: Anthropic blog post announcing Claude Code mods, dated 2026-10-01, accessed 2026-10-05.
resource: https://claude.com/blog/claude-code-mods
tags: [claude-code, mods, announcement]
generated: { by: claude/opus-5.5, at: 2026-10-05T10:10:00+05:30 }
status: draft
stale_after: 2027-10-05T00:00:00+05:30
sources:
  - id: blog
    resource: https://claude.com/blog/claude-code-mods
    title: Claude Code mods
    author: org:anthropic
---

# Source identity

Fetched 2026-10-05 through a fetch tool that returned a summary with quotes, so treat the wording as secondary. The docs and README records are primary.

# What it says

- Announced 2026-10-01. Mods are "small TypeScript functions that change how Claude Code works"; they can rewrite a prompt, add UI, replace a built-in feature or add functionality.
- You can write a mod yourself or ask Claude Code to write one.
- `/diff` is a built-in mod.
- "Mods run with the same access to your machine as Claude Code itself. They aren't sandboxed, and you should only install mods from sources you trust."
- On enterprise plans a built-in `sec-default` mod loads first.
- The summary did not mention Blast Radius.
