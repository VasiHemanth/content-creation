# Risograph: overfitting, memorizing versus learning

1080x1920, 30 fps, 48.9 s. Voice: Kokoro `af_heart`, speed 0.9 (local). Word times are sentence-aligned, then split inside each sentence by syllable weight (not forced-aligned, expect about 100 ms drift on a word). Everything on screen is code: canvas 2D drawing into ink channels, no images, no stock, no AI art.

Build chain: `tools/tts.py` -> `timing.json` -> `mk.py` (writes `src/scene S1..S7`) -> `build.mjs` (writes `assets/timing.js`, `compositions/*`, `index.html`) -> `npx hyperframes render`. Engine in `assets/riso.js`, charts in `assets/plots.js`, the real numbers in `assets/data.js`, sound in `tools/audio_riso.py`.

## Real data (nothing is hand-drawn)
- 12 seeded pink points on a gentle trend with seeded Gaussian noise (sigma 0.07, clipped at 2 sigma); 8 seeded blue test points from the same trend.
- The wiggly curve is the exact degree-11 interpolating polynomial through the 12 pink points (barycentric Lagrange form). Train error is exactly 0.00.
- The smooth line is a degree-3 least-squares fit (Chebyshev basis, normal equations with partial pivoting).
- Error metric on screen: mean absolute miss x 100 (a unit-less score). Wiggly: train 0.00, test 28.2. Simple fit: train 4.09, test 4.69. Counters count up to those computed values; error bars are drawn to scale.
- The complexity chart is a real simulation: degrees 1 to 11, 160 seeded datasets of 12 points, each fit tested on 60 fresh points, RMSE averaged. Train falls to exactly 0 at degree 11. Test falls to its minimum at degree 3 (0.078), then rises: 0.38 at degree 9, 1.08 at degree 10, 4.92 at degree 11. The y axis ends at 0.42, so degrees 10 and 11 leave the chart with arrows labelled with their true values.

## Techniques: built, failed, weakest, next

### 1. Ink channels and overprint
- Built: each ink is drawn as coverage into the R (pink), G (blue) or B (yellow) channel of one canvas using additive compositing, so every ink has its own misregistration offset and overlaps are exact. A compositor turns coverage into colour per pixel with a trilinear lookup of the eight ink combinations on paper (none, pink, blue, yellow, pink+blue purple #6b3fa0, pink+yellow orange, blue+yellow green, all three dark).
- Deviation: a plain multiply of #ff48b0 and #0078bf gives dark navy (0, 34, 134), not the purple the brief names, because the blue has no red. I used the lookup so overprint reads purple as specified. No black ink anywhere.
- Weakest: the overprint colours for orange and green are my picks, not measured from a real print.

### 2. Print material
- Built: coverage is blurred 0.9 px, then thresholded against a wandering per-ink edge noise, so ink bloats and edges are soft and uneven; seeded voids (a jittered grid, evenly spread like blue noise) plus single-pixel pits; roller streaks (a slow stripe pattern per ink); density varies per pixel. Paper has fibres, mottling, specks and darker, yellower edges.
- Failed: the first dots filled solid at tone 0.85 and read as flat discs. Lowered to tone 0.7 and a 6.5 px screen, so the halftone shows inside each dot.
- Weakest: the voids are a jittered grid, not true void-and-cluster blue noise.
- Next: real void-and-cluster; fibre-direction streaks in the ink density.

### 3. Halftone and angles
- Built: tints and dots are dot screens at the ink's own angle: pink 15, blue 75, yellow 0 degrees. Registration targets, crop marks and a colour bar with solid, screened and overprint chips frame every page.
- Weakest: yellow at 0 degrees prints as a plain grid; fine, but few yellow tints appear, so its angle is rarely visible.

### 4. Misregistration
- Built: every ink has its own offset (1 to 3 px) with its own slow drift, seeded per scene. It snaps shut around emphasis moments (the 12th dot, "Zero error", the blue dots, the end of the bars, the best-complexity circle) and stays locked from "judge a model only on data it has not seen" to the end, so the last frame is in perfect register.
- Weakest: the drift is a sum of two sines, so it is smooth; a real press jitters sheet to sheet.

### 5. Page flip transitions
- Built: each new page prints yellow, then pink, then blue, 6 frames each, with the offset starting about 4x larger and settling. Hard cut at the seam.
- Weakest: during the first 0.6 s a page is mostly bare paper with a few yellow marks; three of the 24 contact-sheet samples land on those blank frames. They fall in the silent gaps between lines, so nothing is missed, but they are visually thin.

### 6. Type and captions
- Built: Archivo Black for headings, Space Mono for labels and captions (local woff2). Each heading is a single ink so overprint reads. One caption track: mono caps in blue with a pink block behind the current word (multiply blend, so the word reads navy where they overlap).
- Brief conflict: the caption band is y 1660 to 1720, below the 220 to 1560 safe box (it never covers the plot).

### 7. Sound
- Built in code (`tools/audio_riso.py`, seeded numpy): a quiet 96 bpm bass-and-hat bed ducked under the voice with a volume lane, 120 sound effects on visible actions (dot stamps, drum chunks per ink at each page flip, drum whir while a curve draws, counter ticks, stamp thuds).
- Measured on the final file: -16.4 LUFS integrated, -15.0 LUFS short-term max, true peak -1.1 dB. Not verified: the audio was measured, not heard.

## Constraint checks
- Deterministic: only `mulberry32` and sine-hash; no `Math.random`, `Date` or `repeat:-1`. Each scene is a pure function of its timeline time (each frame is cached by frame number).
- `npx hyperframes check` was not used as a gate (it times out on heavy canvas pages in this environment); lint, snapshots at every beat plus frames 0, 15, 30 and 45, and the real render were.
- The brief's skill names (hyperframes-core, -animation, -creative, -audio) do not exist in this version; I used `hyperframes`, `hyperframes-cli`, `hyperframes-registry` and `media-use`.
- `final.mp4` was re-encoded (crf 28, 6 Mbit/s cap) from the 34 MB render for git.

## What to build next
1. Void-and-cluster blue noise and sheet-to-sheet jitter in the misregistration.
2. A second, rougher stamp style and a visible drum "ghost" band.
3. Fill the page-flip's bare 0.6 s with the previous page's ink fading out.
4. Listen to the audio.
