# Architecture: Reel Production System

Writing style: Simplified Technical English (ASD-STE100, Issue 9 rules, applied by hand).
This text was not checked with a certified STE checker.

## 1. Purpose

The system makes short videos from one arXiv paper link.
The video format is 9:16.
The system posts the video to YouTube Shorts, Instagram Reels and Threads.
A person must approve each post, unless the setting `autopublish` is `on`.

## 2. Definitions

| Term | Meaning |
|---|---|
| Item | One paper or one topic. The database row has an `id`. |
| Episode | The rendered video of one item, in one format. |
| Storyboard | The JSON file that lists the lines, scenes and timing of a video. |
| Treatment | The creative plan that comes before the storyboard. |
| Gate | A check in code. A gate can stop the pipeline. |
| Review | A recorded verdict (PASS or FAIL) tied to the hash of one video. |

## 3. System overview

    link
      |
      v
    reel-director --> treatment.md
      |
      v
    reel-producer --> wiki records, storyboard, facts, voice, MP4, thumbnail, post text
      |
      v
    reel-validator --> validation.json (PASS or FAIL)
      |
      v
    retention-critic --> critic review (score)
      |
      v
    publish policy --> human approval, or autopublish gates
      |
      v
    uploader --> YouTube, Instagram, Threads

If the validator or the critic returns FAIL, the producer fixes the episode.
The producer can do this two times at most.

## 4. Components

### 4.1 Folder map

| Folder | Function |
|---|---|
| `llm-wiki/` | Knowledge: source records, paper dossiers, topic pages. Markdown in git. |
| `data/` | `content.sqlite`: items, episodes, post text, posts, queue, reviews, settings. Not in git. |
| `lib/` | Shared code: database (`db.mjs`), notifications (`notify.mjs`), wiki log (`wikilog.mjs`). |
| `paper-reels/` | The video engine, the CLI and the episodes. |
| `uploader/` | Posts one video to the platforms and records each attempt. |
| `scheduler/` | The daily job (`run.sh`) and the launchd template. Not installed. |
| `.claude/agents/` | The agents of the pipeline. |
| `paper-reels/formats/` | The video formats (`paper`, `system-design`): rules in Markdown, limits in `formats.json`. |
| `.claude/skills/make-reel` | The `/make-reel <url>` command. |

### 4.2 Data ownership

- The database owns operational state and post text.
- The wiki owns knowledge.
- Code only appends to `llm-wiki/log.md`.
- Post text is revisioned. Each edit adds a new row.
- Back up the database with `reels backup <dir>`. The command uses `VACUUM INTO`. It is safe while the file is in use.

### 4.3 Agents

| Agent | Input | Output | Limit |
|---|---|---|---|
| `reel-director` | Paper text | `treatment.md`: hook options, one visual metaphor, shot list | Does not render. |
| `cold-viewer` | Spoken lines only (no tools, no files) | Say-back, term table, lost points, PASS or FAIL | Runs on the treatment and on the storyboard, before voice. Does not rewrite. |
| `reel-producer` | Treatment | Rendered and registered episode | Does not publish. Does not validate itself. |
| `reel-validator` | Registered MP4 | `validation.json` | Read-only. Does not fix. |
| `retention-critic` | Frames from the MP4 | Scores for hook, pacing, visuals, clarity, payoff | Advisory. |
| `reel-publisher` | Validated episode | Live posts | Starts only after PASS and human approval. |

### 4.4 Renderers

The system has two renderers. The storyboard selects one.

| Renderer | Selection | Use |
|---|---|---|
| HyperFrames (v3) | `"renderer": "hyperframes"` in `storyboard.json` | Default for new episodes. |
| Canvas engine (v2) | No `renderer` field | Older episodes. Use it only when a person asks for it. |

Both renderers use the same line timing (`engine/timing.mjs`), the same audio mixer (`engine/audio.mjs`) and the same validator.

### 4.5 HyperFrames renderer (`paper-reels/hf/`)

Each scene is an HTML composition. GSAP animates it. HyperFrames (a headless Chrome) captures each frame.

| File | Function |
|---|---|
| `bin/hf.mjs` | Entry point. Runs the steps `voice`, `words`, `evidence`, `build`, `check`, `snap`, `render`, `audio`, `mux`, `thumb`, `stills`, `audition`. |
| `lib/voice.mjs` | Makes one voice file for each line. Gets the time of each spoken word. |
| `lib/align.mjs` | Matches the words from speech recognition to the words of the script. |
| `lib/timeline.mjs` | Computes line times, scene times, captions and sound events. |
| `lib/project.mjs` | Writes the HyperFrames project to `out/hf/project/`. |
| `lib/thumb.mjs` | Makes the thumbnail. |
| `bin/qa.mjs` | Episode checks: facts, paper crops, copy, captions, narration style and the file specification. |
| `bin/ste.mjs`, `ste.json` | The STE narration checker and its profile (see 4.11). |
| `py/evidence.py` | Finds a passage in the paper PDF. Crops it. Records the highlight boxes. |
| `py/tts_kokoro.py` | Makes the voice files with Kokoro. |
| `py/tts_mlx.py` | Makes the voice files with Qwen3-TTS or Chatterbox (Apple MLX). |
| `kit/` | GSAP and its plugins, fonts, the blueprint style sheet and the shared animation helpers (`kit.js`). |
| `voices.json` | The voice presets. |
| `README.md` | The guide for authors of scenes. |

Features:
- A camera moves through each scene.
- Letters, lines and numbers move in on the spoken word.
- Real crops of the paper ("receipts") come into view. The camera follows the highlighter at reading size.
- Sound effects start on spoken words.
- The renderer does not use the network during a render. GSAP and the fonts are local files.

### 4.6 Canvas engine (`paper-reels/engine/`)

| File | Function |
|---|---|
| `render-episode.mjs` | Entry point. Runs the steps `voice`, `audio`, `video`, `mux`. |
| `core.mjs` | Drawing core. Uses `@napi-rs/canvas`. |
| `timing.mjs` | Computes the timeline from the storyboard. |
| `motion.mjs` | Transitions (`cut`, `whip`, `punch`) and the slow push-in. |
| `audio.mjs` | Voice track, sound effects and the music bed (ducked under voice). |
| `brand.mjs`, `endcard.mjs` | The identity `hemanth_with_ai` and the end card. |
| `thumbnail.mjs` | Thumbnail from the stored name and hook. |
| `styles/` | Looks: `paper` (default), `blueprint`, `chalkboard`, `terminal`, `stub`. |
| `BLOCKS.md` | List of block types and the v2 retention rules. |

Voice: Kokoro (`kokoro-onnx`) through the `.venv` and `npx hyperframes tts`.

### 4.7 Voices

- `hf/voices.json` contains the voice presets. Each preset names a provider.
- A storyboard selects a preset with the `voice` field. A line can select a different preset.

| Provider | Presets | Environment | Model | Licence |
|---|---|---|---|---|
| `kokoro` | `heart` (default) and 13 more | `.venv`, `py/tts_kokoro.py` | Kokoro 82M (onnx) | Apache 2.0 |
| `qwen3` | `ryan`, `aiden` | `.venv-qwen`, `py/tts_mlx.py` | Qwen3-TTS 1.7B CustomVoice, bf16 (4.2 GB) | Apache 2.0 |
| `chatterbox` | `turbo` | `.venv-qwen`, `py/tts_mlx.py` | Chatterbox Turbo, fp16 (2.8 GB), and S3TokenizerV2 (0.5 GB) | MIT |

- All providers operate on this computer. The `qwen3` and `chatterbox` providers use Apple MLX. They download their model weights one time, into `~/.cache/huggingface/`.
- The output of an MLX voice model changes at random. Each preset or line has a `seed`. The same text and the same seed give the same voice file.
- For `qwen3` and `chatterbox`, ffmpeg (`atempo`) applies the `speed` after synthesis. The pitch does not change.
- `audio/voice.json` keeps a hash of the inputs of each voice file. The `voice` step makes a new file only when the hash changes.
- `hf.mjs <dir> audition` makes a sample for each preset and a page to compare them.
- To add a new provider, add a branch in `hf/lib/voice.mjs`. The other steps use only the voice files.

### 4.8 Episode folder (`paper-reels/episodes/<name>/`)

| File | Content |
|---|---|
| `treatment.md` | Plan from the director. |
| `storyboard.json` | Lines, scene blocks, transitions. The `item` field is the arXiv id. |
| `scenes/<scene>.html` | HyperFrames scenes. All text comes from the storyboard. |
| `scenes.mjs` | Canvas scene blocks (canvas engine only). All text comes from `data`. |
| `evidence.json`, `evidence/` | The paper passages to show, and their crops (HyperFrames only). |
| `thumbnail.mjs` | Makes the thumbnail of the episode. |
| `facts.json` | Every number on screen, with its source section in the paper. |
| `qa.mjs` | Episode checks. |
| `audio/`, `out/` | Voice files and render output (`final.mp4`). |
| `validation.json` | Gate result with sha256 hashes of the video and thumbnail. |

### 4.9 CLI (`paper-reels/bin/`)

| Command | Function |
|---|---|
| `reels.mjs` | Main CLI: `add`, `text`, `episode`, `thumb`, `publish`, `show`, `status`, `backup`, `queue`, `review`, `autopublish`, `settings`, `mark-deleted`, `notion-sync`. |
| `validate.mjs <id>` | The deterministic validation gate. |
| `pipeline.mjs` | Unattended run. Claims one link and runs the pipeline. |
| `health.mjs` | Preflight checks. Exits non-zero if a critical check fails. |

### 4.10 Uploader (`uploader/`)

- `src/youtube.js` uploads to YouTube. It uses OAuth with a loopback redirect.
- `src/meta.js` posts to Instagram and Threads. Both platforms get the video from a public URL, so the file goes to Cloudinary first.
- `src/tracker.js` writes each attempt to the `posts` table.
- A platform with a SUCCESS post is skipped, unless `--force` is set.
- Credentials stay in `uploader/.env`, `client_secret.json` and `youtube_tokens.json`. All are gitignored.
- Notion vault: after a paper reel is live, `reels publish` runs `lib/notion-vault.mjs add <id>`. It appends the paper to the public Research Paper Vault page with `NOTION_TOKEN` (in `uploader/.env`). Page id and topic-to-heading map: `lib/notion-vault.json`. The script reads the page first and skips a paper whose arXiv link is already there. A failure only sends a notification; `reels notion-sync [--dry-run]` adds every published paper that is missing. Set `NOTION_VAULT=0` to skip it.

### 4.11 Narration style (STE)

The narration of each HyperFrames episode follows a profile of ASD-STE100 (Issue 9). The profile contains only the rules that a program can measure.

`hf/ste.json` holds the limits and the word lists. `hf/bin/ste.mjs` checks the `text` field of each line. The `say` field has the same words, but with the numbers and acronyms in full.

| Rule | Hard (QA fails) | Soft (QA continues) |
|---|---|---|
| Sentence length | More than 20 words. | More than 15 words. |
| Words | A word in the `replace` list (hype words, filler, long words). | |
| Verbs | Phrasal verbs, `-ing` forms, passive voice, perfect tenses. | Contractions. |
| Terms | A second name for one concept. | |
| Structure | | More than 3 sentences in a line. Three or more clauses in a sentence. A possible noun cluster. |

- The checker does not apply the soft rules to the first and last lines.
- The `ste` field of the storyboard declares:
  - `names`: technical names. A technical name can end in -ing.
  - `terms`: one term for each concept, with the words to avoid.
  - `allow`: exceptions. Each exception must have a reason (`why`).
- An older episode can disable the check only with a reason: `"ste": { "enforce": false, "why": "..." }`.
- Tests: `node --test paper-reels/hf/tests/ste.test.mjs`.

## 5. Data model

Main tables in `content.sqlite`:

| Table | Content |
|---|---|
| `items` | One row per paper or topic. Status: `queued`, `scripted`, `rendered`, `published`. |
| `paper_meta` | Authors, abstract, category, arXiv version. |
| `episodes` | Video path, thumbnail path, duration. Key: item and format. |
| `post_texts` | Post text per platform. Append-only. |
| `posts` | One row per upload attempt. Status: `SUCCESS`, `FAILED`, `SKIPPED`, `DELETED`. |
| `queue` | Links that wait for a run. |
| `reviews` | Verdicts from the critic, validator and facts check. Each is tied to a video hash. |
| `notion_vault` | Items already listed on the Notion vault page. Created by `lib/notion-vault.mjs` on first use. |
| settings | `autopublish`, `min_critic_score`, `max_attempts`, `publish_platforms`. |

## 6. Procedure: make one video

1. Add the link: `reels queue add <url>`, or run `/make-reel <url>`.
2. The director reads the full paper and writes `treatment.md`.
3. The producer registers the item: `reels add <url> --name ... --topic ... --thumb-name ... --thumb-hook ...`.
4. The producer saves the PDF and text in `llm-wiki/raw/assets/<id>/`.
5. The producer writes the source record, the dossier and the topic page. It runs `lint_wiki.py` and commits the wiki.
6. The producer writes `storyboard.json`, `facts.json`, `evidence.json` and the scenes (`scenes/<scene>.html`).
7. The producer runs `hf/bin/ste.mjs <dir>`. It corrects the narration until the checker finds no hard error.
8. The producer makes the voice, the word times and the paper crops, then builds the project: `hf.mjs <dir> voice`, `words`, `evidence`, `build`.
9. The producer runs `hf.mjs <dir> check` and examines the snapshots (`hf.mjs <dir> snap`).
10. The producer renders, one step at a time, in the foreground: `hf.mjs <dir> render`, `audio`, `mux`.
11. The producer registers the result: `reels episode <id> 9x16 <final.mp4>`, `reels thumb <id>`, `reels text <id> <platform> --body ...`.
12. The producer runs `validate.mjs <id>` and fixes the gaps that it reports.
13. The validator runs the gate on the real MP4. The critic scores the decoded frames.
14. The policy step decides how to post (see section 9).

For a canvas episode, steps 8 to 10 use `render-episode.mjs <dir> voice|audio|video|mux`.

Target length depends on the format (`storyboard.format`, see `paper-reels/formats/`):

| Format | Target | Gate |
|---|---|---|
| `paper` (default) | 60 to 80 seconds | 45 to 90 seconds |
| `system-design` (draft) | 120 to 170 seconds | 90 to 178 seconds |

The gate stays under 180 seconds, so the video stays a YouTube Short. The video file must be 100 MB or less, because the uploader sends it to Cloudinary with one plain upload.

## 7. Technical description: how the HyperFrames renderer makes a video

This section is for a person who changes the renderer. Section 4.5 lists the files. This section tells how the parts work together.

### 7.1 Data flow

    storyboard.json ─► voice ─► audio/<line>.wav ─► words ─► audio/words.json
                                                        │
    evidence.json + paper PDF ─► evidence ─► evidence/<id>.png + manifest.json
                                                        │
    scenes/*.html + kit/ + data ─► build ─► out/hf/project/ (index.html, compositions/, data.js)
                                                        │
                    project ─► render (HyperFrames: Chrome + ffmpeg) ─► out/hf/silent.mp4 (picture only)
          voice files + effects + bed ─► audio (ffmpeg filter graph) ─► out/hf/audio.m4a (sound only)
                                  silent.mp4 + audio.m4a ─► mux (ffmpeg, no re-encode) ─► out/hf/final.mp4

The picture and the sound are made separately. They use the same clock (section 7.2). The mux step joins them.

### 7.2 The clock

All times come from `engine/timing.mjs`. The validator uses the same file, so the frame count check is exact.

- Duration of a line: 0.25 s + voice duration + 0.5 s. For the last line: 0.25 s + voice duration + 1.6 s.
- `ffprobe` gives the voice duration of each `audio/<line>.wav`.
- The start of a line is the sum of the durations of the lines before it.
- The voice of a line starts 0.25 s after the start of the line.
- Total duration: the sum of all line durations. Frame count: total × 30, rounded.
- A scene is a sequence of lines with the same `scene` value. The scene starts at the start of its first line. Its duration is the sum of its line durations.
- A transition does not add time. The outgoing scene continues for the duration of the transition (`whip` 0.32 s, `punch` 0.36 s, `zoom` 0.45 s, `rise` 0.40 s, `iris` 0.50 s, `blur` 0.55 s, `glitch` 0.30 s, `cut` 0 s). The incoming scene starts at its own start time. Both scenes are visible during the overlap.

### 7.3 Word times and captions

1. `hyperframes transcribe` runs whisper.cpp (model `small.en`) on each voice file. It gives a list of recognized words with start and end times. Three files run at the same time.
2. `hf/lib/align.mjs` matches the recognized words to the script words (`say`). It uses dynamic programming. A match is one of these:
   - the same word,
   - a near word (one letter different, for words of four letters or more),
   - one recognized word for a sequence of script words (`llm` for "L L M", `deepswe` for "Deep S W E").
3. A script word without a match gets a time between its matched neighbors. The time is divided by the number of letters.
4. The result is `audio/words.json`: the start and end time of each spoken word.
5. Scenes use these times. `KIT.cue('l04', 'fail')` gives the time of the word "fail" in line `l04`. An animation that starts at this time starts on that word.
6. Captions use the caption text (`text`), not the spoken text. The caption text is divided at punctuation, then into parts of 30 characters or less. Each caption word gets a time from the same alignment against the spoken words. The current word becomes amber.

### 7.4 Project assembly (`hf.mjs build`)

The build step writes a complete HyperFrames project to `out/hf/project/`. It deletes the old project first.

| Path in the project | Content |
|---|---|
| `index.html` | The root composition `main`: 1080 × 1920 pixels, 30 fps, `data-duration` = total duration. |
| `compositions/<scene>.html` | A copy of each scene template from the episode. |
| `data.js` | `window.EP`: the times of each line, scene, word and caption, the storyboard data, and the evidence boxes. |
| `kit/` | GSAP 3.15 and its plugins (DrawSVG, SplitText, CustomEase, MotionPath, MorphSVG), the fonts, `blueprint.css`, `kit.js`, `grain.png`. |
| `evidence/` | The paper crops. |
| `hyperframes.json`, `meta.json` | Project settings for the HyperFrames CLI. |

The root composition contains these layers, from bottom to top:

1. An SVG filter (`#bp-sketch`). It gives the lines a hand-drawn edge.
2. The background clip: gradient, glow, grid and grain. It is visible for the full video.
3. One host element for each scene. Each host has `data-composition-src` (the scene file), `data-start` (scene start), `data-duration` (scene duration + transition overlap) and a z-index that increases with each scene.
4. The caption clip. It is above all scenes, at y 1490 to 1586.

The root timeline (one paused GSAP timeline, name `main`) controls:
- the slow drift of the grid (in steps of whole pixels) and the glow,
- the "boil" of the lines: the seed of the SVG turbulence filter changes 8 times each second,
- the captions: each caption part appears and disappears at a fixed time, and each word changes color at its time,
- the transitions: tweens on the scene host elements (position, scale, blur, opacity, clip path).

Each scene file contains one `<template>`. The template contains the styles, the elements and one script. The script makes one paused GSAP timeline and registers it under the scene name. Time 0 of this timeline is the start of the scene. All text comes from the storyboard (`data-bind` attributes and `KIT.data`).

### 7.5 Frame capture (`hf.mjs render`)

The wrapper runs this command in the project folder:

    npx --yes hyperframes@0.8.137 render --quality delivery --crf 20 --fps 30 --strict --output silent.partial.mp4

HyperFrames does these steps:

1. It compiles the project. It puts the content of each scene template into its host element. The result is one page.
2. It starts headless Chrome (chrome-headless-shell, GPU through ANGLE on Metal). It starts several workers. Each worker is one Chrome page. This computer uses 5 workers.
3. Each worker loads the page. It waits for the fonts, the images and the timeline registrations.
4. Each worker gets a set of frame numbers. For frame f, the time is t = f / 30. The runtime moves the root timeline to t. It moves each scene timeline to t − (scene start). It shows only the clips whose time window contains t.
5. The worker takes a screenshot of the 1080 × 1920 page.
6. ffmpeg encodes the frames in order: H.264, yuv420p, 30 fps, CRF 20. The file has no audio stream.

Then the wrapper checks the stream size (1080 × 1920) and renames `silent.partial.mp4` to `silent.mp4`. The wrapper holds the episode lock during the step.

Because each frame is a function of t only, the order of capture and the number of workers do not change the result. Section 7.10 lists the rules that make this true.

Measured on this computer (Apple M5, 32 GB) for the DeepSWE remake: 2,225 frames, capture approximately 70 s, encode 30 s to 90 s, file 45 MB.

The pipeline sets `HYPERFRAMES_NO_TELEMETRY=1` for each HyperFrames command (`hf/lib/hfcli.mjs`).

### 7.6 Sound (`hf.mjs audio`)

`engine/audio.mjs` (function `mixAudio`) makes one ffmpeg filter graph. It writes the graph to `out/hf/filter.txt`. The graph has these parts:

1. Voice bus. Each line file gets a gain of ×1.5 and a delay to (line start + 0.25 s). All lines mix into one signal.
2. Music bed. `engine/assets/sfx/bed.wav` is a synthesized loop (19.2 s, 100 BPM, chords C, Am, F, G). It repeats for the full duration. Its gain is (measured voice level − 13 dB). It fades in over 1.5 s and out over 2.5 s. A sidechain compressor uses the voice bus as its key. The bed becomes approximately 6 dB quieter when the voice speaks.
3. Sound effects. Each effect file is synthesized with ffmpeg (`whoosh`, `thud`, `pop`, `tick`, `chime`, `riser`, `impact`, `glitch`, `click`, `type`, `stamp`). Its gain is (measured voice level − 18 dB). The graph makes one copy for each event and delays it to the event time. The event times come from two sources:
   - the `sfx` list of each line: a spoken word (with `KIT.cue` time) or a time in seconds, plus an optional offset,
   - the transitions: `whoosh` for `whip`, `zoom`, `rise`, `iris` and `blur`, `thud` for `punch`, `glitch` for `glitch`.
4. Master. The voice, the bed and the effects mix together. Then: loudness normalization (EBU R128, target −14 LUFS, true peak −1.5 dB, LRA 7), a limiter, resample to 44.1 kHz, pad or cut to the exact total duration, AAC at 160 kbit/s.

The output is `out/hf/audio.m4a`. The step writes a temporary file first.

### 7.7 Stitch (`hf.mjs mux`)

ffmpeg joins the picture and the sound:

    ffmpeg -i silent.mp4 -i audio.m4a -map 0:v:0 -map 1:a:0 -c:v copy -c:a copy -shortest -movflags +faststart final.partial.mp4

- `-c:v copy -c:a copy`: no re-encode. The frames do not change.
- `-shortest`: the result stops at the end of the shorter stream. The two streams have the same clock, so the difference is less than one frame.
- `+faststart`: the index goes to the start of the file, so a platform can start playback before the full download.

Then the step renames `final.partial.mp4` to `final.mp4`.

### 7.8 Paper crops (`hf.mjs evidence`)

`hf/py/evidence.py` uses pdfium (`pypdfium2`):

1. It searches the text of the page for each fragment in `evidence.json`. If a fragment is not found, the step stops with an error.
2. It gets the box of each text run on the page. It groups the runs into lines. It finds the left and right edges of the text column.
3. It selects the matched lines and the context lines. It cuts between two lines, so no line is cut.
4. It renders the crop at scale 7 (504 dpi) to a PNG file.
5. It writes `manifest.json`: the image size, the highlight boxes, the boxes of the words to circle, and all text inside the crop. QA uses this text to find numbers that are not in `facts.json`.

### 7.9 Thumbnail and validation

- Thumbnail: `hf/lib/thumb.mjs` writes a second project with one page: the background, the handle, the hook text from the database, the hero drawing of the episode (values from the storyboard), the name and the arXiv id. `hyperframes snapshot --at 0.5` writes the PNG. The validator makes the thumbnail again and compares the two.
- Validation: `bin/validate.mjs` decodes two frames for each line from `final.mp4`. `hf.mjs stills` captures the same times from the project with `hyperframes snapshot --at`. The validator compares each pair in grey at 135 × 240 pixels. The mean difference must be 6 or less, and each frame must be nearer to its own reference than to the reference of a different line. If the project changes after the render, this check fails.

### 7.10 Rules that keep each frame reproducible

- Do not use random numbers without a seed. Use `KIT.rng(seed)`.
- Do not use the clock (`Date.now`, `performance.now`).
- Do not use the network during a render. GSAP, the plugins and the fonts are local files.
- Animate each property of an element with one `fromTo`, then `to`. A second `fromTo` shows its start state before its time.
- Use a finite number of repeats.
- Do not animate noise over the full frame. Each changed pixel costs bitrate. In a test with the same encoder settings (CRF 18), animated grain gave a 193 MB file and static grain gave 83 MB.

## 8. Gates

The code enforces these gates. A prompt cannot change them.

Validation (`validate.mjs`) checks:
- Frame count against the storyboard timeline.
- Video and audio stream lengths.
- Full decode of the file.
- Freezes and loudness.
- Frames decoded from the MP4 against what the renderer draws. For a HyperFrames episode, the reference frames are HyperFrames snapshots of the built project.
- Thumbnail against the hook in the database.
- Facts and branding.
- Paper crops: each number that a crop shows must be in `facts.json`.
- Narration (HyperFrames episodes): no hard error from the STE checker (see 4.11).
- Engagement: first event within 1.5 s, no gap longer than 3.5 s, 30 events or more each minute.

Publish gate: `reels publish` refuses to run unless `validation.json` says PASS. The sha256 hashes must match the files to upload. There is no bypass flag.

Render lock: each renderer holds one lock for each episode. It writes through a temporary file.

## 9. Publish policy

| `autopublish` | Result |
|---|---|
| `off` (default) | The run ends at `needs_review`. A person posts with `reels publish <id>`. |
| `on` | `reels autopublish <id>` posts only if all conditions below are true. |

Autopublish conditions:
1. The setting is `on`.
2. The validation gate is PASS and the hashes match.
3. The latest critic review is PASS, with a score at or above `min_critic_score`. It is for the current video hash.
4. The latest facts review is PASS, for the current video hash.
5. Post text exists for each platform in `publish_platforms`.
6. No platform in the list has a SUCCESS post.

If one condition is false, the queue row becomes `needs_review`. The system lists each failed condition and sends a notification.

## 10. Unattended mode

`scheduler/run.sh` runs once each day (launchd job, not installed):
1. `health.mjs --backup` writes a database backup and checks the tools and tokens.
2. `pipeline.mjs` claims the oldest queued link. It runs `claude -p "/make-reel <url>"` with `REELS_NO_PUBLISH=1`. This variable blocks publishing and settings changes in that session.
3. After the session ends, the runner calls `reels autopublish <id>` in a separate process.

Failure handling:
- Health fails: no link is claimed.
- Claude fails, times out (60 minutes) or registers no episode: the link returns to `queued`, or becomes `failed` after `max_attempts`.
- Autopublish refuses: the link is `needs_review`.
- Every failure sends a macOS notification. Logs are in `data/logs/`.

## 11. Rules

- Do not run a render in the background.
- Do not start two renders of one episode.
- The producer does not validate its own work. The validator does not edit.
- Validate the MP4. Do not validate engine stills only.
- Every number on screen must be in `facts.json`.
- Post text lives in the database. The wiki holds knowledge only.
- The only on-screen identity is `hemanth_with_ai`.

## 12. Known limits

- The `system-design` format is a draft. No episode passed it yet. The unattended runner stops a session after 60 minutes (`pipeline.mjs --timeout-min`), which can be too short for a 170-second episode.
- The `cold-viewer` agent is a model that acts as a newcomer. It can know a term and still claim that it does not. Its verdict is a strong signal, not proof.

- No person checks the audio by ear. The validator measures loudness and silence only.
- Canvas styles of one episode share `out/audio.m4a` and `out/filter.txt`. Do not render two styles in parallel.
- Scenes for a new paper are hand-written. The producer agent writes them. This step is not automatic.
- The validator cannot read numbers inside a picture. Use text passages for paper crops, not figures.
- The `qwen3` and `chatterbox` voices operate only on Apple Silicon (MLX).
- No gate compares the speech recognition text with the script. A model voice can say a word unclearly.
  Example: Dream-RSI line `l08` with seed 7 sounded like "next stream". Seed 11 gave "next dream".
- The STE checker does not contain the STE dictionary. It has no part-of-speech tagger. Thus its noun-cluster check is soft, and it can be wrong.
- A HyperFrames render takes approximately 2.5 minutes for a 75-second video on this computer.
- The YouTube OAuth consent screen is in Testing mode. The refresh token expires after 7 days.
- The Threads upload code is not tested against a live account.
