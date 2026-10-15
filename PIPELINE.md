# Reel pipeline

One link in, one validated video out, posted only after a human says yes (rule recorded in `llm-wiki/AGENTS.md`).

    link -> reel-director -> cold-viewer -> reel-producer -> cold-viewer -> reel-validator -> retention-critic -> publish policy
                  ^    FAIL     |                ^   FAIL      |                 |                  |
                  +-------------+                +-------------+------ FAIL -----+------ FAIL ------+

    formats: `paper` (arXiv, 60 to 80 s) and `system-design` (engineering article, 120 to 170 s, draft). See `paper-reels/formats/`.

    publish policy: autopublish off (default) = ask the human; on = `reels autopublish <id>` posts only if every gate holds

Run it with `/make-reel <url>` from a Claude Code session started in this folder, so `.claude/agents/` loads.

After a paper reel is live, `reels publish` also lists the paper on the public Notion Research Paper Vault page. A failure there does not affect the post. See `ARCHITECTURE.md` (Credentials) for retry and settings.

## Renderers
- **HyperFrames (v3, default for new episodes).** Each scene is an HTML composition animated with GSAP and captured by HyperFrames: a moving camera, kinetic type, line drawing, paper receipts read on camera, sound effects on spoken words. Length per format: 60 to 80 s for `paper`, 120 to 170 s for `system-design`. Set `"renderer": "hyperframes"` in `storyboard.json`. Guide: `paper-reels/hf/README.md`. First episode: `paper-reels/episodes/_deepswe-hf/` (scratch remake of DeepSWE, never registered in the live database).
- **Canvas engine (v2).** `paper-reels/engine/`, styles `paper`, `blueprint`, `chalkboard`, `terminal`. Still supported and validated the same way.
- Voices: presets in `paper-reels/hf/voices.json`, all local. Kokoro (`heart` and 13 more, `.venv`), Qwen3-TTS 1.7B (`ryan`, `aiden`) and Chatterbox Turbo (`turbo`), the last two through Apple MLX in `.venv-qwen`. `hf.mjs <dir> audition` writes samples of every preset and a page to compare them. Dream-RSI uses `aiden`.
- Narration: an ASD-STE100 profile (`paper-reels/hf/ste.json`). Run `node paper-reels/hf/bin/ste.mjs <dir>` before synthesizing the voice; episode QA fails on any hard finding. Details: "Narration (STE)" in `paper-reels/hf/README.md`.

## Gates (enforced in code, not in prompts)
- `paper-reels/bin/validate.mjs <id>` checks the files registered in the database: frame count against the storyboard timeline, video and audio stream lengths, full decode, freezes, loudness, frames decoded from the MP4 against what the renderer draws (canvas stills or HyperFrames snapshots), thumbnail against the database hook, facts and branding. It writes `validation.json` with sha256 hashes of the video and thumbnail.
- `reels publish` refuses unless `validation.json` says PASS and both hashes still match the files it is about to upload. There is no bypass flag.
- `reels publish` and `reels publish-post` also refuse without `approval.json`, the human's recorded yes for the same files and platforms. The orchestrator writes it with `reels approve <id> [--post] --platforms ... --quote "..."` after the human says yes in chat; the publisher agents only check it (`--dry-run` first). `autopublish` does not need it.
- The renderer holds a lock per episode and style and writes through a temp file, so two renders can no longer corrupt one output.

## Why there is a cold viewer
The first Scion reels (2026-10) were accurate and busy, and a viewer with no software background could not follow them: they used CI, checkout, tree, blob and daemon without explaining any of them, and listed conclusions instead of a chain of steps. A KodeKloud reel on the same article (`paper-reels/reference/kodekloud-scion.md`) explained every term before it used it and followed one file through the whole story. Now:
- `paper-reels/formats/explain.md` sets the explanation chain for every format: the newcomer's questions in order, describe then name, one new term a line, one protagonist object.
- `ste.jargon` in the storyboard declares where each term enters. `hf/bin/ste.mjs` fails a term used early (and, in `system-design`, two new terms in one line).
- `cold-viewer` gets only the spoken lines, with no tools and no files, and must explain each term and the main idea back. It runs on the treatment and again on the storyboard, before any voice. Its frontmatter names only `ToolSearch`, because Claude Code refuses to spawn an agent with zero tools (`tools: none` fails); `ToolSearch` gives it nothing to read. Outside an agent harness the same check runs as `claude -p --model sonnet --tools "" --system-prompt-file <agent body>` with the lines on stdin.

## Why there is a director and a critic
Template videos (cards of text, 0.3 s fade between lines, 7 to 13 s per line) had 6 to 9 s stretches with no visual event and about a third of the motion of the hand-built SkillSeek video. The v1 rules and reviews only looked for defects, so each pass made the video flatter. Now:
- `reel-director` writes a treatment before any storyboard: hook options, one visual metaphor, a beat every 2.5 s or less, at most 4 numbers.
- The engine supports bespoke `scene` blocks, whip/punch transitions, a slow push-in, word-highlighted captions, sound effects and a ducked music bed (`engine/BLOCKS.md`, v2 section).
- `bin/validate.mjs` has an engagement gate (first event within 1.5 s, no gap over 3.5 s, 30 or more events a minute).
- Paper receipts (HyperFrames): real crops of the PDF, found by text search. QA fails if a crop shows a number that is not in `facts.json`.
- `retention-critic` scores hook, pacing, visuals, clarity and payoff from frames decoded from the MP4. Its score is advisory in interactive mode and required (`min_critic_score`) for autopublish.
- The producer is told what the critic and validator found and fixes it, at most two rounds.

## Rules
- Never run a render in the background. One render at a time per episode.
- The producer never validates itself. The validator never edits.
- Validate the MP4, never engine stills. A stills-only check approved a corrupt video once (2026-10-04).
- Post text lives in the database. The wiki holds knowledge only.

## Known limits
- Nobody checks the audio by ear. The validator measures loudness and silence only. A model voice can slur a word and no gate compares the whisper transcript with the script, so read the `words` output (Dream-RSI `l08` came out as "next stream" until the line got another seed).
- Styles share `out/audio.m4a` and `out/filter.txt`, so do not render two styles of one episode in parallel.

## Unattended mode
For runs without a human. Safe by default: setting `autopublish` is `off`, so every run ends at `needs_review` and waits for you. Details and launchd install steps: `scheduler/README.md` (the job is not installed).

- `reels queue add <url>` / `queue list` / `queue next` / `queue done|fail|retry <id>`: the link queue (database table `queue`).
- `reels review <id> --kind critic|validator|facts --verdict PASS|FAIL [--score N] [--notes "..."]` records a verdict tied to the sha256 of the registered video. Re-rendering invalidates every earlier review.
- `reels autopublish <id> [--dry-run]` posts through the same function as `reels publish` only if: autopublish is `on`; the validation gate passes; the latest critic review is PASS with score >= `min_critic_score` and the latest facts review is PASS, both for the current video hash; post text exists for every platform in `publish_platforms`; none of them already has a SUCCESS post. Otherwise it marks the queue row `needs_review`, prints each failed condition and notifies.
- `paper-reels/bin/pipeline.mjs [--url u] [--dry-run] [--timeout-min 60]` runs health, claims one link, runs `claude -p "/make-reel <url>"` headless with `REELS_NO_PUBLISH=1` (publish and settings changes refuse in that session), then runs autopublish itself. Logs: `data/logs/pipeline-<ts>.log`, `data/logs/notifications.log`.
- `paper-reels/bin/health.mjs [--backup] [--offline]` preflight table; non-zero exit when a critical check fails.
- `reels settings [set <key> <value>]`: `autopublish`, `min_critic_score`, `max_attempts`, `publish_platforms`.
- `reels mark-deleted <id> <platform>` after taking a post down. `posts.status` values: SUCCESS, FAILED, SKIPPED, DELETED. The uploader skips only on SUCCESS, so a DELETED post can be published again without `--force`.
- Tests: `node --test paper-reels/tests/autopublish.test.mjs` (temp database only).
