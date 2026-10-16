> HyperFrames episodes (`"renderer": "hyperframes"`) do not use the blocks below: see `../hf/README.md`. The v2 retention and pacing rules at the end of this file apply to both renderers, except the length target, which now depends on the format (`../formats/formats.json`: 60 to 80 s for a paper, 120 to 170 s for system design).

# Style and block contract (frozen)

An episode is a `storyboard.json`: lines of `{id, block, say, text, data}`. `say` is spoken (letters spelled out, no model names read aloud). `text` is the on-screen caption. `data` follows the block shape below. The generic renderer (`engine/render-episode.mjs`) owns timing, voice, captions, fades, audio and muxing. A style owns only how things look.

## A style module: `engine/styles/<name>.mjs`

```js
export default {
  name: 'blueprint',
  bg: '#0b2a4a',                       // hex used for dips between lines and as video fallback
  background(t, lineIndex) {},          // full-frame 1080x1920 background; t = seconds since line start
  caption(text, alpha) {},              // caption box. MUST sit inside y 1490..1586 and x 60..1020
  blocks: { hook, flow, bigstat, versus, bars, callout, checklist, endcard },  // each (t, d, dur) => void
  async thumbnail({ name, hook, arxivId }, outPath) {},   // 1080x1920 PNG, key content in y 420..1500
};
```

- Draw on the shared canvas from `../core.mjs` (`ctx`, `cv`, `W`=1080, `H`=1920, `setBoil(frame)` is called by the renderer). `core.mjs` is frozen. Its drawing helpers hardcode the paper/ink palette, so a style must take colors as parameters or draw with its own helpers on `ctx`. Never change `core.mjs`.
- `t` is local seconds since the line started; `dur` is the line length in seconds (voice plus padding). Pace reveals across `dur` so the last item is visible for at least 1.2 s before the line ends. Everything must be a pure function of `(t, d, dur)`: no `Math.random`, no wall clock. Use `boil` jitter or a seeded hash.
- Safe zones: top 140 px, bottom 330 px (captions live at y 1490..1586), and right edge x > 940 for y in 1000..1700 (platform buttons). Keep block content in y 160..1450.
- Only identity on screen: `HANDLE` from `./brand.mjs` (`hemanth_with_ai`), used on the end card and the thumbnail. No other names or handles.
- Use only text from `d`. Never add numbers, names or claims. Every digit shown must come from the storyboard.
- Fonts: register with `GlobalFonts.registerFromPath` from `engine/assets/` (validate each file with `file`, it must be a TrueType/OpenType font, not HTML). Existing: `Brush` (Caveat Brush), `Marker` (Permanent Marker), `Mono` (JetBrains Mono).
- A small robot mascot may appear in each style, drawn in that style's colors (do not call `core.robot`, it strokes in ink).

## Block data shapes

- `hook`: `{ lines: string[1..3], sub?: string }` big question text, optional small subtitle.
- `flow`: `{ title?: string, steps: [{label, sub?}] (3..4), flags?: [{step: stepIndex, text, at?: fraction}] }` vertical sequence with arrows; flags are callouts attached to step `step` (an index; the field used to be called `at` and was renamed because `at` now means a time fraction).
- `bigstat`: `{ items: [{value, label}] (1..3), foot?: string }` large numbers with labels.
- `versus`: `{ aTitle, bTitle, rows: [{label, a, b, aW, bW}] }` two series per row; `aW`/`bW` in 0..1 are bar lengths.
- `bars`: `{ title, subtitle?, unit: '%', axisMax, rows: [{label, tag?, value, err?, right?, hi?, at?}] }` horizontal bars, optional error whisker `err` (same unit), right-aligned label `right`, `hi` highlights the row. Up to 7 rows. `subtitle` is a version/date label: it must be fully visible, wrapped if long, and at least 30 px. Tags at least 26 px. `at` (0..1, optional) is the fraction of the line duration at which that row starts to appear, so a bar can wait for the voice.
- `callout`: `{ kind: 'warn'|'info', title, lines: string[] }` a caution card, lines revealed one by one.
- `checklist`: `{ title, items: [{text, mark: 'x'|'check'|'dash'}] }` items revealed one by one.
- `endcard`: `{ name, arxivId, tagline? }` plus authors from the storyboard root as `d.authors` (the renderer injects it). Show name, `arXiv <id>`, authors, tagline, and the handle `hemanth_with_ai`.

## Done means

`node engine/render-episode.mjs episodes/<id> stills --style=<name> ...` shows every block without overlap or clipping at 1080x1920, text readable at phone size, and `thumbnail()` writes a PNG.

## Review rules learned from the first review (apply to every style)

- Minimum text size at 1080 px width: 28 px for any label, 30 px for version/date subtitles, 26 px for tags. Captions 40 px or more.
- Fill the content band. Center or scale each block inside y 160..1450 so no dead band taller than about 300 px sits between content and the caption. Scale charts up, do not leave them as a thin strip at the top.
- Content lower limit is y 1440, and flags or annotations attached to the last item must also end by then.
- Captions can be two lines but keep glyphs at least 10 px from the box edge; the renderer now keeps caption chunks to about 30 characters.
- The end card runs a caption too (y 1490..1586), so keep the end card mascot and handle out of that band.
- Break long author lists between names, never inside a name.

## Optional per-item timing: `at` (added after review round 2)

Reviewers flagged items appearing seconds before the voice says them. Storyboard data may now carry `at`, a fraction (0..1) of the line duration `dur` at which that item starts to appear, on: `flow.steps[i].at`, `flow.flags[i].at`, `bigstat.items[i].at`, `bigstat.footAt` (the foot text), and `bars.rows[i].at`. A style must not show the item before `dur * at`, and must clamp so it still has >= 1.9 s before the line ends (`min(dur*at, dur-1.9)`). Items without `at` keep the style's own pacing. A flag attached to a step never appears before its step.
Neutral semantics: a style must not add judgment the data does not carry (no red/green or warning glyph on a flag unless `kind` says so; no check or diff marks implying approval or replacement; panel tab labels come from data text, never from a block kind).

---

# v2 (2026-10-04): retention rules. These supersede anything above that conflicts.

Why: template videos (v1 blocks, 0.3 s dip between lines, 7-13 s lines) had stretches of 6-9 s with no visual event and a mean motion 1/3 of the hand-built SkillSeek video. Viewers leave in that gap. v1 rules were written to prevent defects (overlap, wrong numbers) and nothing measured attention, so each review made the video flatter. v2 keeps the fact rules and drops the rules that forbade illustration.

## What is relaxed
- v1 said "Use only text from `d`. Never add numbers, names or claims." Now: **every number, name and claim on screen still comes from `d`** (and so from `facts.json`). **Drawings, icons, mascot actions, motion and visual metaphors are allowed and encouraged**, as long as they add no number, name or claim. A metaphor must not imply a result the paper does not state (no "winner" crown, no red/green on data marks unless `kind` says so).
- Neutral colours apply to data marks only. Decoration may use the full palette.

## New per-line fields (all optional)
- `transition`: `"whip" | "punch" | "cut"`. How this line ends and the next begins (same meaning as `SCENES[3]` in `auction-video/render.mjs`: whip = slide left with streaks, ~5 frames; punch = zoom-in then zoom-out, ~6 frames; cut = hard cut, no dip). Default when absent: `"cut"`. The old 0.3 s dip-to-background is removed except into and out of the end card.
- `camera`: `false` to disable the slow push-in the renderer applies to every line (scale 1.00 to 1.04 over the line, centered). The caption is never scaled.
- `sfx`: `[{ at: 0..1, kind: "pop" | "whoosh" | "thud" | "tick" | "chime" }]`. The renderer also adds sound effects by itself: a whoosh on every whip, a thud on every punch, and a soft pop at `dur * at` for every `at` found in `data` (flow steps, flags, bigstat items, bars rows).

## New block: `scene`
`{ block: "scene", data: { scene: "<name>", ...anything the scene draws } }`. The renderer loads `episodes/<dir>/scenes.mjs` (default export is an object of functions, or named exports) and calls `scenes[name](t, d, dur)` on the shared 1080x1920 canvas, using helpers from `engine/core.mjs` and `engine/motion.mjs`. Rules: all text and numbers drawn come from `d`; content inside y 160..1440; deterministic (no `Math.random`, no wall clock); the scene is responsible for its own background (use `bg('paper')` in the paper style). Use `scene` for the hook, for one or two metaphor illustrations, and anywhere a standard block would be a card of text.

## Pacing rules (checked by `bin/validate.mjs`, the engagement gate)
- A visual event (an element appears or moves in, a scene change, a count-up step, a mascot action) at least every **2.5 s**. The gate fails a gap over **3.5 s** (the last 5 s end card excluded), fewer than **30 events a minute**, or no event in the first **1.5 s**. An event is a 0.25 s change of more than 3.0 mean grey levels outside the caption band, measured on the decoded MP4.
- Hook (line 1) must put a claim, a question with stakes or a surprise on screen and in the voice within 2 s. A topic label is not a hook.
- Length: see `../formats/formats.json` (paper 60 to 80 s). One central idea, at most 4 numbers on screen across the whole video. Lines of at most about 20 spoken words (about 6 s) unless the block schedules a new visual event every 2.5 s through `at`.
- Words in the caption should be highlighted as they are spoken (renderer, word timing estimated by character share).

## Motion kit: `engine/motion.mjs`
Shared, style-agnostic helpers: `countUp(t, t0, dur, from, to, fmt)`, `popIn(t, t0)` (overshoot scale), `typeOn(str, t, t0, cps)`, `wiggle(t, amp, hz)`, `pulse`, `slideIn(t, t0, from)`, `stagger(i, gap)`. Styles use them; episodes' `scenes.mjs` use them.
