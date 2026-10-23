# Papercut: how attention lets a model work out what "it" means

1080x1920, 30 fps, 51.8 s. Voice: Kokoro `af_heart`, speed 0.92 (local, free). Word times are sentence-aligned, then split inside each sentence by syllable weight, so expect about 100 ms of drift on a word (not forced-aligned). Everything on screen is code: SVG filters, CSS, SVG masks, canvas-free. No stock, no external images, no AI images.

Build chain: `tools/tts.py` -> `timing.json` -> `build.mjs` (writes `assets/timing.js`, `compositions/*`, `index.html`) -> `npx hyperframes render`. Sources live in `src/` (scene A to G, `wipes`, `captions`), shared code in `assets/paper.js` (PRNG, baking, eases, camera) and `assets/stage.js` (the set, ribbons, geometry).

## What the technique is, what failed, weakest part, next

### 1. Paper material (fibre grain, lit)
- Built: every piece is an SVG with one filter: `feTurbulence` fractalNoise 0.8 / 3 octaves -> `feDiffuseLighting` (distant light azimuth 225, elevation 48, upper left, always) -> remapped to a low-contrast multiply over the fill. Each piece is rasterised ONCE (SVG -> canvas -> PNG data URL, cached by key) and reused as a bitmap. Runs behind `window.__hf.buildReady` so the render waits for the bakes (about 18 s of page load).
- Failed: first pass multiplied the cream down to 77 percent brightness. The lit map mean is near 0, so the remap intercept had to be about 1.0. Fixed by measuring the render (mean 0.996 of fill).
- Weakest: at phone size the grain is almost invisible on the big blue panel. Big pieces are baked at 1.25x to 1.5x only; the fibre is uniform with no long fibres or cloudy density. A real sheet shows fibre direction and uneven pulp.
- Next: a second turbulence with stretched frequency for long fibres, and a per-piece tint variation.

### 2. Hand-cut edges and edge thickness
- Built: `feDisplacementMap` driven by low-frequency turbulence (scale 2 to 3.4 px, seed per piece from a string hash), plus a 1 px light rim on the upper-left edge and a 1 px dark rim on the lower-right edge built with `feOffset` + `feComposite out`. Outlines also get seeded vertex wobble (`cutRect`).
- Failed: very thin strips (about 3 px) lose the rim; they read as thread, not paper.
- Weakest: no real thickness. A true paper diorama shows a visible side wall and slight curl; here the rims are the only cue.
- Next: stack a second offset copy 1 to 2 px behind each piece for a real side wall; add a gentle per-piece curl by a skew.

### 3. Shadows
- Built: two stacked `drop-shadow` filters on an un-rotated wrapper (so light always falls lower right even on tilted pieces): contact 2 px alpha .35 and soft blur up to 28 px alpha .22, both driven by a `--h` lift variable that scenes tween when a piece rises toward camera (tags hop, cat folds up, end card lands).
- Failed: on the deep indigo wall the shadows vanished. Fixed by adding a lighter mid-blue backing panel behind the words.
- Weakest: shadow blur is set by `--h`, not by true layer depth, so a far layer and a near layer with the same lift cast the same blur. The soft shadow also has no colour (flat ink at 22 percent).
- Next: derive blur from layer depth and tint the soft shadow toward indigo.

### 4. Parallax camera
- Built: layers at depth d = 0.10 (wall, softened 1.4 px), 0.30 (hills), 0.62 (backing panel), 0.9 (curtains, apron), 1.0 (words, strips), 1.2 (paper grass), 1.55 (foreground leaves). Each layer is tweened by depth x camera offset and scale. Scene G pulls back 1.95x to 0.86x through the layers.
- Weakest: camera never rotates or changes height, so it is a pure dolly in a flat stack.
- Next: tiny camera roll and per-layer rotation for a rack-focus feel.

### 5. Stop-motion cadence
- Built: paper pieces use a 12 fps stepped ease (progress quantised to 1/12 s, hold 2.5 frames) and a seeded 12 fps position/rotation "boil" of about 1 px on every tag. Camera, captions and wipes stay smooth. Different materials get different curves: stiff card (quick, one overshoot), thin paper (soft), strips (tiny overshoot), hinge (anticipation then swing).
- Weakest: the boil is subtle; at 1 px it is easy to miss on a phone. Everything shares one 12 fps grid, so nothing is ever on a different rhythm.
- Next: 8 fps for large pieces, 12 for small, and a stronger boil on the shelves.

### 6. Type
- Built: Fredoka 700 (local woff2, no CDN). Every caption word is its own baked cream paper tag with a random -3 to 3 degree tilt, its own shadow, and a coral "current word" lift. One caption track, one sub-composition.
- Failed: the first caption groups overlapped by 0.3 s, so two groups showed at once. Fixed by hiding a group the moment the next one begins.
- Brief conflict: captions sit at y 1645 to 1735, below the 220 to 1560 safe box, so they never cover the subject, but they are inside the lower area many players cover with their UI.

### 7. Strips that unroll (the attention scores)
- Built: baked ribbon bitmap shown through an SVG `mask` whose dashed stroke is driven by progress, with a rolled-paper cap at the tip. Widths are score x 120 px; the scores sum to exactly 1 (animal .70, street .07, nine others .02 to .03), checked in code, and a ruler cutout fills with matching segments. Animal's strip is the straight, thick one (tiny overshoot); the others bow.
- Failed: the first animal strip ran over the word. Now ends below its tag.
- Weakest: ten hairlines over cream tags look like a tangle of thread, and the thin ones are about 2.5 px.
- Next: route thin strips through the gaps between words; give strips a visible lap-joint where they meet "it".

### 8. Blender, cat, wipes
- Blender: jar with handle, window cut by even-odd, paddle spun by a pure function of time, 24 saffron drops (12 through the thick strip), liquid level from drops landed, mixed colour poured onto "it". The jar sits above "it" and the words were re-laid into two columns for this scene (a deliberate departure from the brief's single stage).
- Cat: ink silhouette hinged at the tag top, swings up with anticipation and overshoot. One hinge only, not a multi-fold.
- Wipes: two torn sheets (jagged leading and trailing edge, lighter fibre core) crossing the frame in 1 s with a slight rotation, swapping scenes while they cover the frame. First bake at 0.5x had no visible grain; now 1x.

### 9. Sound
- Built in code (`tools/audio_papercut.py`, seeded numpy): a quiet 92 bpm plucked bed over a soft pad, and 143 SFX placed on visible actions (pops, ticks, flap, strips, drops, paddle whirr, pour, thuds, sheet sweeps). Music is ducked under the voice with a volume lane taken from the word times, drops to zero for 0.9 s on the quiet hold after "the meaning of animal", swells under the end card.
- Measured on the final file: -16.8 LUFS integrated, -12.4 LUFS short-term max, true peak -1.4 dB. `final.mp4` was re-encoded (crf 28, 6 Mbit/s cap) from the 43 MB render to keep it small for git. Not verified: the audio was measured (`hyperframes audio`), not heard. The synthesis is my weakest area; no one has judged whether the bed is pleasant.

## Constraint checks
- Deterministic: only `mulberry32`/`hash01`; no `Math.random`, `Date`, `repeat:-1`. One paused GSAP timeline per scene.
- Accent colours: scene B shows coral, teal and saffron together because the brief asks for the three tag colours; other scenes use two.
- `npx hyperframes check` times out on this page (about 5000 DOM nodes) so lint, snapshots and the real render were the gates. A "GSAP target undefined" console warning prints every frame; it did not come from page code and the output is correct.
- Skills: the brief names hyperframes-core / -animation / -creative / -audio skills; this package version ships `hyperframes`, `hyperframes-cli`, `hyperframes-registry`, `media-use`. I read those and the registry's `stop-motion-cadence` primitive.

## What to build next (ranked)
1. Real paper thickness and curl (side wall, slight skew).
2. Long fibres and pulp density in the grain.
3. Route thin strips through word gaps.
4. Multi-fold cat; an eye-blink on step 8 fps.
5. Listen to the audio and fix it.
