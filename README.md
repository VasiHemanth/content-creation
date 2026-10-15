# content-creation

Short-form video pipeline for @hemanth_with_ai (YouTube Shorts, Instagram Reels, Threads).

    llm-wiki/     knowledge: source records, paper dossiers, topics (Markdown, git). Rules in llm-wiki/AGENTS.md
    data/         content.sqlite: items, episodes, post text (revisioned), posts, comments. Not in git.
    lib/          shared database and wiki-log code
    uploader/     posts a video to YouTube, Instagram, Threads and records each attempt
    paper-reels/  arXiv paper to 9:16 explainer video (engine, episodes, CLI)

The database owns operational state and post text. The wiki owns knowledge. Code only appends to `llm-wiki/log.md`.

Back up the database with `node paper-reels/bin/reels.mjs backup <dir>` (uses `VACUUM INTO`, safe while the file is in use).
Credentials stay in `uploader/.env`, `uploader/client_secret.json` and `uploader/youtube_tokens.json`, all gitignored.
