# HyperFrames renderer (v3)

A second renderer for paper-reels. A video is a set of HTML scenes animated with GSAP and captured frame by frame by HyperFrames (headless Chrome). It replaces template cards with bespoke motion design: a camera that moves through each scene, kinetic type, SVG line drawing, real crops of the paper read on camera, and sound effects placed on spoken words. The canvas engine (`engine/`) still works and is still validated the same way.

Pick it per episode with `"renderer": "hyperframes"` in `storyboard.json`. The first episode built with it is `episodes/_deepswe-hf/` (a remake of the posted DeepSWE video, kept in a scratch folder because it reuses the live item id). `episodes/dreamRSI/` is the first new paper made with it end to end, with STE narration and a Qwen3-TTS voice.

## Pipeline

    node hf/bin/ste.mjs <episodeDir>            # narration against the STE profile (0 hard findings to go on)
    node hf/bin/hf.mjs <episodeDir> voice       # one wav per line (voice preset from storyboard.voice)
    node hf/bin/hf.mjs <episodeDir> words       # time every spoken word (whisper anchors + script words)
    node hf/bin/hf.mjs <episodeDir> evidence    # crop the paper passages listed in evidence.json
    node hf/bin/hf.mjs <episodeDir> build       # assemble out/hf/project/ (index.html, scenes, kit, data.js)
    node hf/bin/hf.mjs <episodeDir> check       # HyperFrames lint, runtime, layout and contrast audit
    node hf/bin/hf.mjs <episodeDir> snap 3.2 9.5 --name=sheet   # contact sheet of exact times, for review
    node hf/bin/hf.mjs <episodeDir> render      # out/hf/silent.mp4 (locked, temp file, CRF 20)
    node hf/bin/hf.mjs <episodeDir> audio       # out/hf/audio.m4a (same mixer as the canvas engine)
    node hf/bin/hf.mjs <episodeDir> mux         # out/hf/final.mp4
    node hf/bin/hf.mjs <episodeDir> thumb       # out/thumb.png (also what `reels thumb` and the validator use)
    node hf/bin/hf.mjs <episodeDir> audition [preset ...] [--text="..."]   # voice samples + out/hf/voices/index.html

Then register and validate as before: `reels episode <id> 9x16 <dir>/out/hf/final.mp4`, `reels thumb <id>`, `node bin/validate.mjs <id>`. Run every step in the foreground. The steps that write video or audio take a lock per episode.

A full 75 s episode renders in about 2.5 minutes on the M5 (capture about 70 s, encode about 60 s) and comes out near 45 MB.

## Episode folder

| File | Content |
|---|---|
| `storyboard.json` | `renderer: "hyperframes"`, `voice`, `ste` (names, terms, allowed exceptions), `scenes` (transition per scene), `lines` (`id`, `scene`, `say`, `text`, `data`, `sfx`). |
| `scenes/<scene>.html` | One bare `<template>` per scene. Consecutive lines with the same `scene` play in one scene. |
| `scenes/thumb-hero.html` | Optional drawing for the thumbnail (HTML or SVG, no script). |
| `evidence.json` | Paper passages to show as receipts: page, text fragments to highlight, words to circle. |
| `facts.json` | Every number on screen, with its source. `evidence_incidental` lists numbers that are only visible inside a crop. |
| `qa.mjs`, `thumbnail.mjs` | Two-line wrappers around `hf/bin/qa.mjs` and `hf/lib/thumb.mjs`. Copy them. |
| `audio/` | Voice wavs, `voice.json` (what each wav was made from), `words.json` (word timing). |
| `out/hf/` | Generated: project, renders, snapshots, validation report. |

### storyboard.json

    { "item": "2607.07946", "name": "DeepSWE", "renderer": "hyperframes", "authors": [...],
      "voice": { "preset": "heart", "speed": 1.2 },
      "scenes": { "hook": { "transition": "zoom" }, "leak": { "transition": "whip" }, ... },
      "lines": [ { "id": "l01", "scene": "hook",
                   "say": "Top agent setups now pass seventy four percent of Deep S W E.",
                   "text": "Top agent setups now pass 74% of DeepSWE.",
                   "data": { "title": "DeepSWE", "value": "74%" },
                   "sfx": [ { "cue": "seventy", "kind": "riser", "offset": -1.1 }, { "cue": "seventy", "kind": "impact" } ] } ] }

- `say` is what the voice reads (numbers and acronyms spelled out). `text` is the caption. `data` holds every word and number the scene shows.
- Keys that start with `_` in `data` are for drawing only (bar lengths, coin heights) and must never be printed. QA skips them.
- Transitions (between scenes): `whip`, `zoom`, `punch`, `rise`, `blur`, `iris`, `glitch`, `cut`. Pick one main one and one or two accents.
- Sound effects: `whoosh`, `thud`, `pop`, `tick`, `chime`, `riser` (ends on its cue when `offset` is minus its length, 1.1 s), `impact`, `glitch`, `click`, `type`, `stamp`. Transitions add their own whoosh or thud.
- Timing comes from `engine/timing.mjs`: each line lasts lead 0.25 s + voice + 0.5 s (1.6 s after the last line). The validator's frame count uses the same function.

## Narration (STE)

Narration follows a profile of ASD-STE100 (Issue 9): the rules a script can check without the STE dictionary. `hf/bin/ste.mjs` checks the `text` of every line (`say` mirrors it with numbers and acronyms spelled out). The profile is `hf/ste.json`.

| Rule | Hard (fails QA) | Soft (warning) |
|---|---|---|
| Sentence length | more than 20 words | more than 15 words |
| Words | hype and filler words, long words with a plain equivalent (`replace` map) | |
| Verbs | phrasal verbs, `-ing` forms, passive voice, perfect tenses | contractions |
| Terms | a second name for a declared term (`ste.terms[].avoid`) | |
| Structure | | more than 3 sentences in a line, 3 or more clauses in a sentence, a possible noun cluster |

The first and last lines skip the soft rules (the hook and the end line need some freedom). Per episode, `storyboard.json` declares (from `episodes/dreamRSI/`, shortened, plus an example `allow`):

    "ste": { "names": ["Dream-RSI", "dreaming", "coding", "AlphaEvolve", "Lasso", "GPU"],
             "terms": [ { "term": "replay simulator", "avoid": ["dream world", "sandbox", "replay world", "world model"] },
                        { "term": "attempts", "avoid": ["generations", "tries", "agent calls"] } ],
             "allow": [ { "line": "l03", "rule": "passive", "why": "quotes the paper, and the receipt shows the same words" } ] }

- `names`: technical names that may end in `-ing` (the paper's own word for its method, for example).
- `terms`: one name per concept. Pick the paper's word and list the synonyms to refuse.
- `allow`: an exception for one rule on one line. It needs a `why`, or it is ignored.
- `jargon`: where each technical term enters, `[ { "term": "checkout", "line": "l07" } ]`. The line describes the thing and names it ("We call this step a checkout"). `ste.mjs` fails a term used before its line or never said. Two new terms in one line are a soft finding for `paper` and a hard one for `system-design`. Declared jargon counts as a technical name for the `-ing` rule. See `paper-reels/formats/explain.md`.

`hf/bin/qa.mjs` (and so `validate.mjs`) fails on any hard finding. An episode written before the profile can opt out with `"ste": { "enforce": false, "why": "..." }`; QA records the reason. Run `ste.mjs` before `voice`: a rewrite after synthesis costs a new voice take and new word times.

## Writing a scene

A scene is a sub-composition. Its timeline starts at 0 when the scene starts. Copy `episodes/_deepswe-hf/scenes/lock.html` as a starting point.

    <template id="lock-template">
      <style> #root { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; overflow: hidden; } ... </style>
      <div id="root" data-composition-id="lock" data-width="1080" data-height="1920">
        <div id="lock-cam"> ... <div id="lock-tests" class="tag cyan" data-bind="l04.lock"></div> ... </div>
      </div>
      <script>
        (function () {
          const c = (w, n) => KIT.cue('l04', w, n);          // start of a spoken word, seconds into the scene
          KIT.bind('#lock-cam');                              // fills every data-bind from the storyboard
          const tl = gsap.timeline({ paused: true });
          KIT.rise(tl, '#lock-tests', c('tests'));
          ...
          window.__timelines["lock"] = tl;
        })();
      </script>
    </template>

Rules (`hf.mjs build` and `check` enforce most of them; the rest broke a render once):

- All copy comes from the storyboard through `data-bind` or `KIT.data(id)`. QA fails a scene that types words or digits into its HTML.
- Prefix every id with the scene name. Wrap the script in a function. Register exactly one paused timeline under the scene name.
- Keep content in y 160..1450 and clear of the caption band (y 1490..1586). Leave x > 940 free for y 1000..1700 (platform buttons).
- Deterministic only: no `Math.random`, no clocks. Use `KIT.rng(seed)`. GSAP's ScrambleText plugin uses `Math.random` and is not shipped.
- Animate each property of an element with one `fromTo`, then `to`. A second `fromTo` renders its start state at load and shows the element before its cue. For the same reason, the start state of a `fromTo` must be invisible when the element should not show before its cue (`KIT.sparks` once left a small cross at its origin for the whole scene).
- An entrance from off screen must also start at opacity 0, or a sliver shows at the frame edge.
- Do not animate full-frame noise or sub-pixel drifts: every changed pixel costs bitrate (animated grain made one render 193 MB).
- Split text with `{ type: 'words,chars' }` when it can wrap, or a word breaks across lines. Mark split characters that slam over each other with `data-layout-allow-overlap`.
- Drawn proportions (a gauge arc, a needle angle, a bar length) come from the storyboard value, never a literal: `parseFloat(KIT.data('l01').value)`. A copied scene with a hard-coded 74% would draw the old number next to the new one, and QA cannot see it. In `scenes/thumb-hero.html` use `{{num l01.value}}`.
- Put a visual event on screen at least every 2.5 s. Camera beats on spoken words are the cheapest way (`tl.to(cam, { scale, x, y, duration: 0.3 })`).

### The kit (`kit/kit.js`, global `KIT`)

| Helper | Use |
|---|---|
| `cue(line, word, nth)`, `cueEnd(...)` | Scene time of a spoken word. Also takes seconds, `"@0.4"` (fraction of the line) and `"end-1"`. Throws on a word that is not spoken. |
| `bind(scope)`, `data(line)`, `sceneDur(scene)` | Copy and timing from the storyboard. |
| `pop`, `rise`, `fade`, `slam`, `shake`, `glitch`, `sparks`, `grow`, `count`, `typeOn`, `draw` | Entrances and hits. `slam` returns the impact time; `draw` reveals dashed paths with a clip wipe so the dashes survive. |
| `read(tl, { cam, parent, hud, id, t, label, marks, circles, follow })` | A paper receipt: the page rises in, the camera dives to reading size and follows the highlighter. `marks` pins the highlighter to spoken words. `follow: 0` holds the camera at the start of each highlight instead (default 1 follows the marker). |
| `paper(...)`, `circle(tl, paper, word, t)` | A crop placed by hand, and a pen loop around one word. |
| `transition(...)`, `captions(tl)`, `ambient(tl, total)` | Used by the generated root page. |

Look and type live in `kit/blueprint.css` (palette, `.tag`, `.stamp`, `.plate`, `.ln` stroke classes, the `.sketch` hand-drawn filter, the caption box).

### Board helpers (`system-design` format)

A board is one long scene: give many consecutive lines the same `scene` value, and the scene keeps its elements and its camera for all of them. Actors stay on screen and change in place. Rules: `paper-reels/formats/system-design.md`.

| Helper or class | Use |
|---|---|
| `.actor` plus `old`, `new`, `compute`, `hero` or `store` | A box with a role colour (`--role-*` tokens in `blueprint.css`). Its border and text read `var(--role)`. `.sub` is a small mono line inside it; `.chip` is a filled label. |
| `recolor(tl, sel, t, 'new')` | Tween an actor's `--role` to another role (or a colour): the Git server turns into the new server where it stands. |
| `swap(tl, outSel, inSel, t)` | Relabel in place. Both labels exist in the markup with their own `data-bind`, stacked; `inSel` starts hidden. |
| `focus(tl, world, t, { px, py, s })` | The camera: zoom into one actor and back out. Wrap the board in one world element. |
| `travel(tl, parent, t, [x1, y1], [x2, y2], { dur })` | A `.packet` moves from one actor to another and fades. Returns the arrival time. |
| `multiply(tl, parent, t, { n, cols, cell, x, y, dur, seed })` | A grid of `n` `.cell` copies pops in, in a seeded order: one machine becomes many. Returns the time the last cell lands. |

## Paper receipts

`evidence.json` lists passages; `hf.mjs evidence` finds them in the PDF with pdfium, renders the page at scale 7, crops the text column between lines and writes `evidence/<id>.png` plus `manifest.json` (highlight boxes, circled words, and all text inside the crop). A fragment that is not found fails the step. QA then requires every number readable in a crop to be in `facts.json`, so a crop can never show a figure the video contradicts. Use text passages, not figures: the numbers inside a raster figure cannot be checked.

Text in a full-width crop is too small to read on a phone, so receipts are read on camera at about 3.4x with the highlighter synced to the voice. Pick passages that say what the narration says.

- Keep the first highlighted word and every circled word in frame while the camera holds. A highlight wider than the frame, centred, pushes its first words off the edge: the Dream-RSI Lasso crop hid the 317 it was there to prove. Left-align the start of the highlight with a margin, or pan with the highlighter, then `snap` the hold and look. With `KIT.read`, `follow: 0` and `fx` near 90 left-align the highlight; choose `zoom` so `rect.w * width * zoom` (from `evidence/manifest.json`) ends before x 1000.
- A receipt is never the only picture for more than about 2 s. Read one phrase, then cut back to the scene's own visual (the metaphor, the chart) while the narration finishes.

## Voices

`voices.json` maps preset names to a provider and voice. A storyboard picks a preset with `"voice": "aiden"` or `"voice": { "preset": "aiden", "speed": 1.12 }`; a line can override it (`line.voice`). Changing the voice re-synthesizes only what changed: `audio/voice.json` keeps a hash of every input that affects a take.

| Provider | Presets | Runs in | Model | Licence |
|---|---|---|---|---|
| `kokoro` | `heart` (default, voice of the posted episodes), `bella`, `michael`, `emma`, ... (14) | `.venv` (`py/tts_kokoro.py`, onnx) | Kokoro 82M | Apache 2.0 |
| `qwen3` | `ryan`, `aiden` | `.venv-qwen` (`py/tts_mlx.py`, Apple MLX) | `mlx-community/Qwen3-TTS-12Hz-1.7B-CustomVoice-bf16` (4.2 GB) | Apache 2.0 |
| `chatterbox` | `turbo` | `.venv-qwen` (`py/tts_mlx.py`, Apple MLX) | `mlx-community/chatterbox-turbo-fp16` (2.8 GB) plus `S3TokenizerV2` (0.5 GB) | MIT |
| `fish` | `s2pro` | `fish-tts-demo` environment (`py/tts_fish.py`, Apple MLX) | `fish-audio-s2-pro-8bit` (6.3 GB), in `fish-tts-demo/models/` | Fish Audio Research License (research / non-commercial) |

- Create `.venv-qwen` with the two commands at the top of `requirements-mlx.txt`. The weights download from Hugging Face on first use, into `~/.cache/huggingface/`; after that, synthesis is offline. MLX runs on Apple Silicon only.
- `qwen3` presets set a `speaker` and a style `instruct` ("a calm, clear documentary narrator ..."). `chatterbox` can clone a voice from a reference clip of 5 s or more (`ref_audio`); its output carries an inaudible watermark.
- `fish` is Fish Audio S2-Pro and runs in the verified `fish-tts-demo` environment (`~/Documents/Developer/experiments/fish-tts-demo`): its own `.venv` and `models/fish-audio-s2-pro-8bit` (6.3 GB). `FISH_HOME`, `FISH_PYTHON` and `FISH_MODEL` point somewhere else. `ref_audio` paths are relative to `hf/`.
- Every S2-Pro run casts a new random voice unless a reference is given, and this pipeline makes one wav per line, so a `fish` preset needs `ref_audio` + `ref_text` (the exact transcript). Clips live in `hf/voices/` (10-30 s, one voice); `s2pro` is cloned from the October 2026 experiment take. Per preset or per line, `tags` adds S2-Pro style cues (`"[warm, thoughtful narrator]"`): directions to the model, never spoken. `tts_fish.py` prefixes one `<|speaker:0|>` tag per paragraph, because the model truncates long tag-free text at about 47.5 s.
- `fish` loads its 6.3 GB model once per `voice` run (1-2 minutes, peak RAM 14-26 GB). Run one generation at a time.
- Licence: the S2-Pro weights are under the Fish Audio Research License (research / non-commercial). Do not publish monetized videos with `s2pro`; use another provider or a licensed Fish Audio model for that.
- MLX sampling is random, so each take is seeded (`seed`, per preset or per line). The same seed and text give the same wav. If whisper mishears a line in `words`, try another seed for that line before you rewrite it (Dream-RSI `l08` read "next stream" with seed 7 and "next dream" with seed 11).
- `speed` for `qwen3`, `chatterbox` and `fish` is applied after synthesis with ffmpeg `atempo` (pitch stays). The pace differs a lot between speakers: on the same two audition lines `ryan` took 19.4 s and `aiden` 10.7 s. Dream-RSI uses `aiden` at 1.12, about 3.1 spoken words per second.
- `hf.mjs audition [preset ...] [--text="..."] [--speed=1.1]` writes one sample per preset and `out/hf/voices/index.html` to compare them. Listen before you pick: the Kokoro grades in `voices.json` are a guide only.

To add a provider (for example a cloud TTS with an API key), add a branch in `lib/voice.mjs` `synth()` that writes `audio/<id>.wav`, and presets that use it. Everything downstream (word timing, captions, mixing, the validator) reads only the wavs.

### Prompting Fish S2-Pro (`s2pro`)

S2-Pro reads free-form direction tags in square brackets. Tags steer the delivery and are never spoken (checked with whisper: every script word anchors, no tag is heard). Source: the tested guide in `fish-tts-demo/TTS_HANDOFF_PROMPT.md`.

- Put tags in the line's `tts` field, never in `say`: `say` stays tag-free because word timing and captions align against it. QA fails a `tts` whose words differ from `say`. Only the `fish` provider accepts `tts`.
- **One tone tag at the start of a line**, matched to the beat: `[warm, curious narrator]` for the hook, `[thoughtful]` for the problem, `[confident]` for the idea, `[clear, steady]` for a mechanism step, `[excited]` once for the payoff, `[calm, honest]` for the caveat. Multi-word tags are fine. Do not change the tone on every line: a narrator who swings every 5 s sounds unstable.
- **`[emphasis]` right before the one word** the line turns on (the number, the new term). At most one per line.
- **`[short pause]` before a big number or a new term**, and `[pause]` before the payoff. These are the cheapest way to give the viewer a beat to read the screen.
- No sound tags (`[laugh]`, `[sigh]`) in an explainer. Never an unmatched `[`.
- Numbers and acronyms are already spelled out in `say`; keep the same words in `tts`.
- Speed: S2-Pro reads about 2.3 words a second at 1.0. Use `"voice": { "preset": "s2pro", "speed": 1.2 }` (about 2.7 words a second); a line that introduces a term can set 1.1. `speed` runs through ffmpeg `atempo`, so the pitch stays.
- The voice is locked by `ref_audio` in the preset. A line's own `seed` gives a different take of the same voice if whisper mishears it.
- One model load per `voice` run (about 30 s), then about 5 s per line on the M5. Run it once for all lines, not line by line.

Example line:

    { "id": "l05", "say": "It keeps twenty five past tries in memory.", "text": "It keeps 25 past tries in memory.",
      "tts": "[clear, steady] It keeps [emphasis] twenty five past tries [short pause] in memory." }

## Validation

`bin/validate.mjs` checks an HyperFrames episode with the same gates as a canvas one. The only difference: reference frames come from `hf.mjs stills` (HyperFrames snapshots of the built project) instead of the canvas engine. Thresholds, the negative control and the engagement gate are unchanged. If the project is rebuilt after the render, the comparison fails, which is the point.

## Files

    hf/bin/hf.mjs        CLI (all steps above)
    hf/bin/ste.mjs       STE narration checker (profile: hf/ste.json, tests: hf/tests/ste.test.mjs)
    hf/bin/qa.mjs        episode QA (facts, receipts, copy, captions, STE, file spec)
    hf/lib/timeline.mjs  line and scene timing, captions, sound events
    hf/lib/voice.mjs     presets, synthesis, word timing
    hf/lib/align.mjs     ASR tokens to script words
    hf/lib/project.mjs   builds the HyperFrames project
    hf/lib/thumb.mjs     thumbnail
    hf/lib/hfcli.mjs     the pinned HyperFrames CLI version (0.8.137)
    hf/py/               voice synthesis (tts_kokoro.py, tts_mlx.py, tts_fish.py), pdfium evidence crops
    hf/voices/           reference clips that lock a cloned voice (fish provider) + their transcripts
    hf/kit/              GSAP and plugins (vendored, no network at render), fonts, blueprint.css, kit.js
