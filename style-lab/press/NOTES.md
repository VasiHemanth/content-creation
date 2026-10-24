# Press: why language models state false things with confidence

1080x1920, 30 fps, 48.4 s. Voice: Kokoro `af_heart`, speed 0.86 (local), generated per sentence so sentence starts are exact; words inside a sentence are split by syllable weight, so expect about 100 ms of drift on a word (not forced-aligned). Everything on screen is code (DOM, SVG filters, canvas). No stock, no external images, no AI images. Palette: newsprint `#e9e2cf`, ink `#1b1a17`, spot red `#c1272d` only on the kicker, stamps, the correction box border and rules.

Build chain: `tools/tts.py` -> `timing.json` -> `build.mjs` (writes `assets/timing.js`, `compositions/*`, `index.html`) -> `npx hyperframes render`. Code: `assets/press.js` (engine: PRNG, paper, ink filter, halftone, page shell, stamps, type helpers, entrances), `assets/pages.js` (the four page layouts and all copy), `src/scene{A..E}.html`, `src/captions.html`.

Fonts (all local woff2 from @fontsource): Libre Caslon Text (body), Playfair Display 700/900 (headlines), UnifrakturCook (masthead blackletter), Alfa Slab One (kicker, stamps), Special Elite (typewriter labels, captions). Every requested face loaded; no fallbacks.

## Per technique: built, failed, weakest, next

### 1. A real broadsheet grid
- Built: a 1500 x 2100 page (front) with a blackletter masthead "THE DAILY TOKEN", "VOL. 1, NO. 1", ears, a dateline strip, a red kicker with double rule, a three-line headline fitted to the width, an italic deck, then five 256 px columns with 1 px column rules, justified original body text (about 2,600 words across the four pages, on topic, no lorem ipsum), drop cap, byline, pull quote between red rules, ad boxes, a "word of the day" box, markets, letters, sports, weather, a colophon rule. Five text sizes or more: masthead 176, headline about 120, deck 30, body 19.5, captions 12.5, typewriter labels 12 to 25.
- Hyphenation: Chrome headless has no dictionary, so a small syllable splitter inserts soft hyphens; `hyphens: manual`. It breaks words in reasonable places but not always the right ones.
- Failed: first draft had a column of huge empty dashed ad boxes (copy too short) and the deck collided with the first text line. Fixed by writing about twice the copy, larger body type, and measuring column bottoms in a headless page (`dbg-front.html`) so every column ends within 60 px of the same line, with a small filler ad.
- Weakest: the inner pages (book, hallucination, look it up) are shorter than the front page (1700 and 1560 px tall) and use three or four wide columns, so they read as inserts. Justified narrow columns show rivers of white space in places.
- Next: real hyphenation dictionary; a second headline tier and a jump line ("Continued on page 3") that actually continues.

### 2. Paper
- Built once and cached: a 750 x 1050 canvas, two to three octaves of seeded value noise for blotchy yellowing, yellowed edges following a wobbly boundary, long thin curved fibres, ink specks, and a vertical and a horizontal fold crease each made of a light band, a dark band and a hairline. Stretched to 1500 x 2100 in CSS (so fibres are soft).
- Failed: first noise had a visible checker pattern (one coarse grid). Fixed with three octaves. The caption strip first showed fold creases and heavy yellowing; it now uses a flat variant.
- Weakest: the texture is 2x upscaled, so close zooms (2.4x) show a soft paper under crisp type. Real newsprint shows ink sitting in the paper tooth.
- Next: bake at full resolution and put the grain into the ink layer as a mask.

### 3. Ink
- Built: all text is in one layer under an SVG filter: `feMorphology` dilate 0.3 px, a 0.38 px blur, a 1.2 px displacement from fine noise for rough edges, a low-frequency density mask (uneven ink) and a sparse high-frequency void mask (broken letters).
- Weakest: the filter is applied to the whole 1500 x 2100 layer, which makes the render slow (about 1 s per frame) and the voids are tiny at overview scale; you only see them zoomed in. Halftone pictures and red marks sit outside the filter.
- Next: apply per text block, and vary dilation by font size (small body text should bleed more than the masthead).

### 4. Halftone pictures
- Built: robot head, book with a blank cover and a question mark, speech bubble, magnifier, manicule hand, reference shelf. Each is drawn in grayscale gradients on a canvas, then converted to a 45 degree dot screen (cell 9 to 11 page px, radius by luminance). The speech-bubble dots are SVG circles so they can drift apart (seeded per-dot direction).
- Failed: the earliest cell size (about 6 px) read as a blur at overview scale; coarse cells (10 px) fixed it.
- Weakest: the hand and the magnifier are the least recognisable pictures; the shelf reads as a city skyline. Pictures have no tonal variation beyond the gradients.
- Next: draw with real shading shapes (hatching + highlights) before the screen.

### 5. Typewriter, tags, stamps
- Built: a stable-layout typewriter reveal (the hidden remainder keeps its place), the "likely" and "true" slips with tape, a red rule between them and a typed "NOT THE SAME" label, a typed catalog card with a punch hole and a red rule, rubber stamps with a rough edge and voids (`feTurbulence` displacement plus a threshold mask), 2 to 5 px page jolts on each hit.
- Weakest: the "NOT A REAL BOOK" stamp is flat red with no ink pooling at the edges; the stamp edge roughness is the same on every stamp (one seed).
- Next: per-stamp seed, edge pooling, and a double-strike offset on the second hit.

### 6. Transitions
- Spinning paper: the page spins 700 to 1080 degrees from a small scale to the final framing with `expo.out`, with four translucent trailing copies, then slams (jolt plus thud). Used at the open (A), the book page (B) and the return to the front page (E). Columns sliding in from above and below onto the grid (C). A page turn: the whole page rotates in on Y from the left edge with a shade that clears (D).
- Weakest: the trailing copies are blank pale sheets (not the real page), so they read as tissue. The page turn does not show the old page leaving.
- Next: render the outgoing page into the trail copies; fold the old page away.

### 7. Captions
- One caption track on a strip of newsprint with torn-looking edges, typewriter face, current word shown as a black bar with paper-coloured type (a "bar wipe", so red stays reserved). The strip sits at y 1640 to 1790, below the 220 to 1560 content box, so it never covers the subject.

### 8. Sound (built in code, not heard)
- `tools/audio_press.py` (seeded numpy): rotary press rumble, paper whoosh for each spin, stamp thuds on every hit, typewriter bursts matched to every typed line (headline, deck, catalog card, definition, correction), page turn, column scrapes, magnifier whoosh, dot-scatter ticks. A slow 78 bpm plucked bed enters after the press has landed; ducked under the voice by a `volume` lane taken from the line times; swells for the last 3.5 s.
- Measured on the delivered file: -16.7 LUFS integrated, -13.6 LUFS short-term max, true peak -1.4 dB. The raw render (89 MB, -18.7 LUFS) was re-encoded to 20 MB with crf 28, a 6 Mbit/s cap and a `loudnorm` pass (I=-16, TP=-1.5) to fit git and the loudness target. Not verified: no one has listened.

## Constraint checks and deviations
- Deterministic: `mulberry32` and a sin-fold hash only; no `Math.random`, no wall clock, no `repeat: -1`. One paused GSAP timeline per scene; scene state is built before the timeline is registered (`window.__hf.buildReady`).
- "Front page of the video": the first frame is a large tilted page already mid-spin (not black), a deliberate deviation from "black screen first" so the thumbnail is finished-looking. The rumble still starts on frame 0.
- The false-book example uses fictional names only: a title ("The Lanterns of Marrowfen"), an author ("Quist, Ondrel V."), a year. The page states they were invented. No real person, book or institution is named. The fix page names no real sources either ("a published report", "a record kept by an archive").
- The correction box uses a red double border and red "CORRECTION" lettering (treated as a stamp); its message is in ink.
- The masthead date line reads "VOL. 1, NO. 1" with no calendar date, as asked.
- `npx hyperframes check` times out on this page (very large DOM and a full-page SVG filter); lint, snapshots and the full render were the gates.
- The brief names hyperframes-core / -animation / -creative / -audio skills; this package version has `hyperframes`, `hyperframes-cli`, `hyperframes-registry`, `media-use`; I read those. Three.js was not needed for the spin (CSS affine transform with a trail).
- A "GSAP target undefined" console warning may print during render; it comes from the HyperFrames runtime, not from this page.

## What to build next (ranked)
1. Real outgoing page in the spin trail and a visible page-turn fold.
2. Full-resolution paper bake and ink-tooth mask.
3. Per-block ink bleed (faster render, correct for small text).
4. A real hyphenation dictionary.
5. Stamp ink pooling and double strike.
6. Listen to the audio and re-mix.
