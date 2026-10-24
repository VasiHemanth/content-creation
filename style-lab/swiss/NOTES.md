# Swiss / Bauhaus: binary search

1080x1920, 30 fps, 50.27 s, 3.3 MB (no re-encode needed). Voice: Kokoro `af_heart`, speed 0.90, sentence-aligned (each sentence synthesised alone, words split by syllable weight inside it; expect about 100 ms drift on a word, not forced-aligned). All art is SVG and one canvas, drawn from code. One family (Inter Tight, local woff2), two weights (500, 800). No shadows, gradients, textures or noise.

Build: `tools/tts.py` -> `timing.json` -> `build.mjs` (writes `assets/timing.js`, `compositions/`, `index.html`) -> `npx hyperframes render`. Sources in `src/` (scenes S1 to S8, `captions`), shared code in `assets/swiss.js` (grid, optical text placement, field, bars). Audio: `tools/audio_swiss.py`.

## What I built, what failed, weakest part, next

### 1. The grid
- Built: 12 columns of 58 px with 24 px gutters and 60 px margins (column i starts at 60 + 82i), and a 20 px baseline unit. `G.text` shifts each string by its measured left bearing so the ink, not the advance box, sits on the column line. Thin grid lines flash on for 0.2 s at several cuts and at the final title.
- Checked in code (headless page, every scene file): 161 text items, all flush-left on a column line (or on the 24 px field module); every baseline y is a multiple of 20; 922 rects, all with a left or right edge on a column edge, the page centre (540) or the 24 px module. Captions: each group starts at x = 60, baseline 1720.
- Failed: first pass had baselines at 684 / 508 / 1132 and a superscript at x = 485 (off grid). Fixed, then re-checked (0 bad).
- Weakest: the check covers x and baseline only. It does not test vertical rhythm between blocks, and caption words after the first in a line are text flow, not grid cells.

### 2. The numbers, to scale
- 1,000 squares really are drawn (40 x 25, pitch 24, canvas), each = 1,000 names, labelled. Target is square 875 (index 874). The scan steps one square at a time, linear, with a counter 0 to 1,000, and the label "UP TO 1,000,000 CHECKS".
- Halving: the list becomes 40 bars of 25,000 names. Each halving is exactly 0.6 s: rule on the middle, 0.3 s of bars dropping out from the rule outward (stepped, linear), 0.3 s zoom (power3.inOut, no overshoot) so the kept half fills the same 960 px. 40 -> 20 -> 10 bars.
- Type scale (scene 5): 1,000,000 / 500,000 / 250,000 / 125,000 are fitted by measurement to exactly 960 / 480 / 240 / 120 px wide, each with a bar of 40 / 20 / 10 / 5 squares under it. "125,000" appears after the line ends, as the continuation of the series (it is not spoken).
- 20 circles fill top to bottom at 0.075 s each. "2^20 = 1,048,576" is fitted to 9 columns. The comparison bar is 960 px for 1,000,000 checks; 20 checks at the same scale is 0.02 px, drawn 2 px wide and labelled as such. The 21st circle is red, labelled "2,000,000 names", with "+1 check".
- Final chart: real values on a linear x axis, 1 to 2,000,000: in order = n, halving = ceil(log2 n), 240 sampled points each. A probe sweeps n and reads both values live (for example N = 1,328,684: in order 1,328,684, halving 21).
- Failed: the first clip of "1,000,000" hid most of the number (read as "1,000,"). Now fitted to 1,090 px so only half of the last zero is cut.
- Weakest: halving is shown with a 40-bar strip, not on the 1,000-square field (the field halves by rows would not zoom to the same width), so there is a cut in representation between scenes 2 and 3. At 2,000,000 the halving line sits 0.008 px above the axis, so the chart is honest but shows two lines on top of each other at the left.

### 3. Motion
- Linear or power3.inOut only; no overshoot anywhere; hard cuts at scene seams (no wipes were needed). Everything lands on a grid line.
- Weakest: static stretches. A few holds are 1.5 to 2 s with only the caption changing (end of scenes 3, 4, 8).

### 4. Captions
- One track, flush left on the margin, 44 px weight 500, current word in red. Below the 1560 safe line (y 1720) by design: they never touch the subject, but they sit where many players draw their UI.

### 5. Sound
- Seeded synthesis (`tools/audio_swiss.py`): a 60 bpm tick with a soft sub on the bar, ducked to 0.10 under the voice (volume lane from the line times), and 35 SFX: clicks on target and counter, a 50-tick scan roll (one file), halving rolls and slides, a 20-tick roll for the circles, thocks on big numbers and the title, a probe roll.
- Measured on the render: -17.8 LUFS integrated, -16.1 short-term max, true peak -1.2 dB (about 1.8 LU under the -16 target). Not heard by anyone.

## Constraint checks
- Palette: off-white, black, red, plus blue in scenes 2 to 5 (squares scanned, bar rows) and no yellow. Flat fills only.
- Deterministic: no Math.random or Date; the only seed is the fixed target index.
- `npx hyperframes check` was not used as a gate (it times out on other styles' heavy pages; for this one lint, snapshots, the grid script and the real render were run). Skill names in the brief (`hyperframes-core` and so on) do not exist in this version; I used `hyperframes`, `hyperframes-cli`, `hyperframes-registry`, `media-use`.
- The captions' red current word is a second use of red beyond the target and rules; I kept it as the one highlight.

## What to build next
1. Run the halving on the 1,000-square field itself, with the squares folding away by rows, so there is no change of representation.
2. A real vertical rhythm test (all block gaps are multiples of 20).
3. Replace the static holds with exact, information-carrying motion (for example the halving counter ticking while the voice speaks the numbers).
4. Listen to the audio and set levels by ear.
