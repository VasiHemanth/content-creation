# paper-reels

arXiv paper in, 9:16 explainer video out, posted to YouTube Shorts, Instagram Reels and Threads.

    node bin/reels.mjs add <arxiv url> --name X --topic slug --one-liner "..." --thumb-name X --thumb-hook "line1\nline2"
    node bin/reels.mjs text <id> youtube --title "..." --body "..."     # also instagram, threads; each call adds a revision
    # render episode (episodes/<id>/): node render.mjs audio && node render.mjs video && node render.mjs mux
    node bin/reels.mjs episode <id> 9x16 episodes/<id>/out/final.mp4
    node bin/reels.mjs thumb <id>
    node bin/reels.mjs publish <id> [--platforms youtube,instagram,threads]
    node bin/reels.mjs show <id> | status | backup

Layout: `engine/` drawing core and fonts, `episodes/<arxiv_id>/` scenes, script, voice audio, `src/` arXiv fetch.
The database, wiki and uploader are shared and live one level up (see `../README.md`). Post text is stored in the database only.

Voice: Kokoro via `.venv` (`kokoro-onnx`, `soundfile`) and `npx hyperframes tts` with `HYPERFRAMES_PYTHON=.venv/bin/python`. Python packages are pinned in `requirements.txt` (the HyperFrames renderer also needs `pypdfium2` and `pillow` for paper crops). The HyperFrames renderer can also use Qwen3-TTS and Chatterbox Turbo through Apple MLX in `.venv-qwen` (`requirements-mlx.txt`); presets and setup are in `hf/README.md`, "Voices".

Renderers: the canvas engine below, and the HyperFrames renderer in `hf/` (default for new episodes, see `hf/README.md`).

Not automated yet: writing scenes for a new paper. Each episode's `scenes.mjs` is hand-written.

Branding: the only on-screen identity is `hemanth_with_ai` (`engine/brand.mjs`). New episodes should end with
`endCard()` from `engine/endcard.mjs` and draw no corner signature. `2609.38822` was posted before this change and
still carries the old `hemanthvasi` signature and per-platform end card.
