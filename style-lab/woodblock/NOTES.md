# Woodblock: how a diffusion model carves an image out of static

1080x1920, 30 fps, 49.5 s, `out/final.mp4`. Narration is the brief's script word for word (Kokoro `af_heart`, 0.88x; word times are syllable-weighted inside sentence-aligned spans, not forced-aligned). Everything on screen is code: canvas, SVG filters, CSS. No stock, no external images, no AI images. Every random choice is a seeded mulberry32 (one seed per element or per layer), so frames are identical on every render and when scrubbing.

How it is built: `assets/print.js` builds the whole print once (async, behind `window.__hf.buildReady`), then every scene reuses the baked canvases. Scenes are sub-compositions (`src/scene*.html` -> `compositions/`), `build.mjs` turns `timing.json` into `assets/timing.js` and `index.html`. Seven scenes, three wood-slab wipes, one caption track.

Palette is the brief's seven inks (washi #efe3c6, Prussian #0f3057, light indigo #5b86a8, pale grey-blue #b9cbd6, ochre #d9a441, vermilion #c8402a, key black #1a1410). Derived shades only come from overprinting those inks (wood block = ochre darkened with key black; static = key black and washi). Peel and drop shadows are neutral darkening.

## Techniques

### 1. Wood grain (anisotropic feTurbulence)
- Built: `feTurbulence baseFrequency="0.004 0.35"`, 3 octaves, rasterised once from an SVG data URL into a Uint8 array. Every ink layer multiplies its alpha by a thresholded grain value (`(g-0.26)/0.5`), so ink is uneven along the grain, plus small voids (g < 0.22) where paper shows. A second, slower grain (`0.003 0.22`) drives the sky and bottom bokashi. Strength is modulated by an isotropic mottle map so the streaks clump instead of being uniform. Sampling is mirrored, so there is no tile seam.
- Failed: first pass used one uniform strength, which read as a scan-line overlay. The sky was the worst. Also a seam at the wrap point of the grain image (fixed by mirroring).
- Weakest: it is still a full-frame grain applied per layer, not grain that belongs to a carved block with knots and a grain direction that follows the shapes. The horizontal streaks are very regular on the big Prussian wave body.
- Next: warp the grain along the wave contour, add knots and a few deeper gouge voids, and use a different grain direction on the key block than on colour blocks.

### 2. Original great-wave composition
- Built: a curling crest (spline back slope, hooked lip, concave front face), recursive seeded foam claws (`claw()`, depth 1 with forks, curl per finger) knocked out of the blues and outlined by the union of all claw shapes (stroke wide, punch the interior out), light-indigo bands and pale striations offset from the crest curve and clipped to the body, spray dots, foreground swells, a small ochre boat with three rowers, a distant pale mountain with a knocked-out snow cap, sun disc, title cartouche, cloud ribbons with scalloped lower edges. All coordinates are mine. It follows the tradition (curl, claws, boat, mountain, sun) but is not traced from any artwork.
- Failed: first claws were thin wires with overlapping outlines. Light-indigo bands multiplied over Prussian went darker instead of lighter, until the Prussian was knocked out under every band. A hard horizontal edge appeared where the sky layer ended.
- Weakest: the foam still reads like antlers or coral, not water. The wave body is a big flat dark mass at the bottom. The mountain is faint. No second wave.
- Next: foam that breaks into rows of dots and finer fingers, a second wave behind, calmer foreground, a human hand on the claw shapes (less symmetric).

### 3. Variable-width key-block lines
- Built: `strokePoly()` makes a filled polygon from a centerline with a swell-and-taper profile (`brushWidth`, seeded wobble) for the crest, the front face, hatching along the swell, mountain, sun ring, boat, swells and cartouche. Border is a double line with one deliberately missed corner at top right.
- Failed: hatch lines sometimes cross the crest (one long straight line is visible at about 610,790).
- Weakest: widths follow one profile shape, so the line work is tidy for a carver. Foam outlines are constant width (3.4 px).
- Next: pressure-like width noise per stroke and slightly broken, re-inked lines.

### 4. Bokashi
- Built: sky density graded from the top with wavy band edges and quantised steps (8 bands plus grain noise), so the banding is visible. Bottom Prussian bokashi is a separate plate that deepens toward the foot. Both are made by modulating ink density per pixel, not by a CSS gradient.
- Failed: the first sky plate also carried the wave bands, so bokashi killed them; split into sky, indigo, pale, mountain, ochre, Prussian, bottom, key plates.
- Weakest: sky bands are smooth; real bokashi has a hand-wiped streak.
- Next: wiping streaks following the brush direction.

### 5. Misregistration and paper
- Built: each plate offsets 1 to 3 px with a fixed seeded offset (indigo 1.6,-1.2; pale -2.1,1.4; ochre -1.3,-2.2; Prussian 1.1,2.4; vermilion 2.5,-1.0). Washi: mottle map, 1700 long thin curved fibres at very low opacity, edge darkening.
- Failed: offsets are barely visible at phone size, so the sheet can read as "too perfect".
- Weakest: the sun's vermilion overprint is the only place misregistration reads.
- Next: push offsets to the full 3 px on the pale plate, add one plate with a slight rotation.

### 6. Carving, inking and printing (scene 1, 0 to 8 s)
- Built: a bench, a block built from ochre darkened with key black and the grain, a gouge that follows the crest first and then sweeps the rest in 20 stepped passes (12 fps rhythm), seeded ballistic chips, cut wood revealing the key block as raised lines, a roller that inks the lines, washi laid on with a thud, a baren disc whose rub path paints the impression mask, and a corner peel (`drawPeel`: reflected triangle, show-through, curl shading, cast shadow).
- Failed: first version had the gouge sitting on the sheet after the paper arrived; the cut-front shading was a blocky rectangle (edge band was too wide).
- Weakest: seven seconds is too tight for four actions; the impression on the sheet is only the key lines and mostly empty when the wipe starts. The peel flap edge shows hatch artefacts.
- Next: more time per action, colour blocks stamped one after another (indigo, then ochre) so the sheet visibly fills up.

### 7. Ordered-dither noising and denoising (scenes 2 to 5)
- Built: one engine (`Print.engine`) works on 2 px cells with a seeded threshold texture (8x8 Bayer blended with seeded noise) and four static banks (black and washi speckle) that cycle at 12 fps. Forward noising uses 5 stepped thresholds (0.1, 0.28, 0.5, 0.76, 1.0), each stamped with a carved numeral (一 to 五) on a vermilion seal. The reverse uses a per-pixel detail level map drawn alongside every shape (wave body 0.05, sky 0.16, mountain/sun 0.26, clouds 0.23, bands 0.38, foam 0.59, boat 0.77, key lines 0.92) so the wave mass appears first, then bands, foam, the boat, and the key lines snap in last. 20 visible steps, a counter in carved numerals (一 to 二十), a thin vermilion progress line running clockwise along the border.
- Failed: static is a 50/50 black and cream mix, which reads as mid grey on a phone; the coarse-to-fine order is right but steps 1 to 5 are almost invisible, which is correct for the brief but makes the first 3 s of scene 5 feel empty.
- Weakest: static has no structure; step edges are hard binary cells, no soft dot gain.
- Next: clumped (blue-noise) static, step-to-step crossfade of dots, ink-dot size instead of 2 px cells.

### 8. Guess the noise (scene 4)
- Built: noisy sheet at threshold 0.55, a faint indigo speckle layer drifting over it, a vermilion brush arrow (stroke-dashoffset draw with a rough-edge displacement filter) to a washi card showing the guessed noise, and a printed slip reading "guess the noise".
- Failed: the card swatch was too pale at first.
- Weakest: the arrow is a plain stroke; the card does not show it is the same noise as the speckle.
- Next: let the guess lift out of the sheet and subtract, visibly.

### 9. Prompt, vermilion sun, finale (scenes 6 and 7)
- Built: three vertical columns of brushed text (clip follows the brush, rough-edge filter) in the cartouche, four ink runs flowing down into the picture, the sun's vermilion plate blooming out from its centre (the plate has its own grain and misregistration). Finale: the sheet lifts by the corner (peel, shadow), lays flat, hanko seal stamped with a thud and ink bleed, cartouche reads @hemanth_with_ai, 1.5 s hold with a 3 percent push-in.
- Failed: ink runs first started inside the text and crossed the glyphs.
- Weakest: the "ink runs into the picture" is short vertical lines; it does not really run into the sun. The brief's fullwidth "＠" is written as ASCII "@" (Shippori Mincho has the ASCII glyph).
- Next: a continuous vermilion thread from the last stroke to the sun.

### 10. Transitions
- Built: wood-block cuts (a slab of printed grain sweeps across, edges stepping along 14 px grain rows) at 8.0, 27.0 and 44.4 s; dither dissolves through the mask at 14.0 and 21.1 s; the denoise-to-prompt seam at 39.0 s is a continuous frame. No fades.
- Weakest: the slab is flat dark; no carved relief.

### 11. Audio
- Built: `tools/audio_woodblock.py` writes a quiet koto-like pentatonic bed with a drone and 81 SFX (wood knock, gouge scrape, chips, roller, paper slap, baren rub, peel, wipe whooshes, static hiss, stamp thuds, brush swishes, ink drips, hanko thud) as procedural sound, laid on the visual events. Music is ducked under the voice by a volume lane.
- Measured on the rendered file: integrated -16.6 LUFS, peak -1.5 dBFS; `hyperframes audio` onsets land on the visual hits (for example the paper slap at 5.9 s, the first stamp at about 15.1 s). Unverified: nobody listened to it.

## Delivery
- `out/final.mp4` is 1080x1920, 30 fps, 49.5 s, H.264 crf 31 (maxrate 7 Mbit/s) + AAC, 24 MB. The raw `--quality looks` render was 285 MB because static is nearly incompressible; it was re-encoded and not kept.
- `out/contact-sheet.png`: 24 evenly spaced frames decoded from the final MP4 (6x4).
- A first render took 6.5 min with other renders running on the same 4 cores.

## Known gaps vs the brief
- Voice word timing is estimated, not forced-aligned.
- The seal numerals use Shippori Mincho (carved look comes from a displacement filter), not a real carved relief.
- `npx hyperframes check` times out on this page (the runtime layout pass); lint, snapshots and a full render are the gates used.
- Read the hyperframes skills that this package ships (`hyperframes`, `hyperframes-cli`, `hyperframes-registry`, `media-use`); the brief's `hyperframes-core/-animation/-creative/-audio` skills do not exist in this version.
