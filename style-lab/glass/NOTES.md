# Stained glass: how an image network builds a face from edges, layer by layer

1080x1920, 30 fps, 49.0 s. Voice: Kokoro `af_heart`, speed 0.86, sentence-aligned (words inside a sentence are split by syllable weight, so expect about 100 ms of drift per word). Everything on screen is code: SVG polygons, SVG filters, CSS. No images, no stock, no AI images.

Build chain: `tools/tts.py` -> `timing.json` -> `build.mjs` (writes `assets/timing.js`, `compositions/*`, `index.html`) -> `npx hyperframes render`. Sources: `src/sceneG1..G7.html`, `src/captions.html`; shared code in `assets/glass.js` (PRNG, Voronoi, the face, the real edge analysis, the four panes, texture bakes) and `assets/glass2.js` (window builder, nave, floor pools, rays, flood). Audio: `style-lab/tools/audio_glass.py`.

## Techniques: built, failed, weakest, next

### 1. The pane progression is computed, not drawn by hand
- Built: one original face (13 SVG path strings) is rasterised, blurred and run through a real Sobel filter. Pane 1: 285 Voronoi cells; each cell reads the structure tensor of the edges under it and lights only if it sees an edge, coloured by direction (horizontal edges ruby, vertical cobalt, diagonal amber). Pane 2: 80 bigger cells classify the spread of edge directions inside them: one direction = straight, two perpendicular = corner (violet, lead "L"), two neighbouring = curve (emerald, lead arc), many = texture (amber, lead hatching). Pane 3: Voronoi sites at the true positions of eyes, nose, mouth, brows with the part's own lead-line glyph. Pane 4: a rose window of 49 radial cells whose centre medallion is the assembled face.
- Failed: first pane-2 classifier called most cells "straight". The bin test needed a 20 percent energy threshold and an adjacency rule (bins 0 and 3 are neighbours).
- Weakest: pane 2 reads as a coloured mosaic with small glyphs; the corner and curve glyphs are only about 30 px, so on a phone the class is carried mostly by colour.
- Next: draw the glyph at the cell's real tensor orientation and scale it to fill the cell.

### 2. Glass construction
- Built: per cell a radial gradient (lighter core, darker rim, so colour varies toward the edge), one baked hammered/streaked texture multiplied in (feTurbulence + feDiffuseLighting + bubble rings), one baked specular layer from feSpecularLighting screened on, and lead came baked from every unique cell edge with a seeded width of 5 to 9 px, an uneven edge (feDisplacementMap), a light inner edge and solder dots at some joints. A faint face is also projected behind pane 1 and bent by a displacement filter (refraction).
- Failed: lead lines leaked outside the arch as a mesh. Fixed by clipping the lead to the window shape; the outline stays separate and heavier.
- Weakest: the glass texture is one image reused on every pane, so the hammering repeats; cells never pick up their own streak direction.
- Next: per-cell texture offset and a second, finer texture for the clear glass.

### 3. Light
- Built: bloom is the lit-glass group drawn again through a Gaussian blur with `mix-blend-mode: screen` (a live `<use>`, so it follows every cell tween); a second tight blur adds halation. Colour pools on the floor are the same lit group projected through a CSS perspective plane, blurred, screen-blended and sliding slowly; earlier panes keep their colour on the floor, so pane 1 and pane 2 overlap under pane 3. Soft coloured shafts start at the sill.
- Failed: first rays crossed the glass as grey columns, then had hard clipped edges (blur applied before the clip-path). Fixed with a blurred wrapper around a clipped inner element and a start at the sill.
- Weakest: the floor pools are strongly blurred and a little pastel; they read as light but not as an image of the window. The shafts are still wedge-like.
- Next: a true projection of the lit glass onto the floor with a second, sharper layer.

### 4. Transitions and camera
- Built: every seam is a push through the glass: the camera scales 1.04 to 2.6 with power3.in while a radial colour flood (colour of the outgoing pane) rises to full, and the next nave starts at full flood and clears. No fades otherwise. Slow dolly in each nave.
- Weakest: the flood is a plain radial gradient; real glass would show the lead shadow crossing the lens.

### 5. Training montage and procession
- Built: scene 6 puts all four panes in a 2x2 grid, flares the eye cells, then wobbles each pane and re-colours it with a stepped `hue-rotate` sequence before a spring settle on "right". Scene 7 lays the four windows along a wall under one CSS perspective transform, lights them in turn with a travelling colour beam between each, then carves "LAYER BY LAYER" into a stone slab (clip reveal with a glowing chisel point, engraved text-shadow).
- Failed: scene 6 first scaled about the window centre so the right column left the frame; fixed by placing boxes by centre. The title first overflowed its slab (94 px); now 70 px.
- Weakest: hue-rotate recolours the whole pane uniformly; real training would shift different cells differently. The procession is one flat plane in perspective, not separate windows with depth.

### 6. Type
- Cinzel (engraved capitals) for the title and pane labels; Cormorant Garamond in a dark stone plaque with a brass edge for captions (deliberately not glass). One caption track, word by word, spoken word in amber.
- Brief note: captions sit at y 1596 to 1746, below the 220 to 1560 safe box.

### 7. Sound
- Synthesised in code (`audio_glass.py`, seeded numpy): a slow stone-and-air drone bed (no pitched dings, per the sound guide) and 83 SFX: glass ticks, shimmer bursts for cells lighting, whooshes for each push-through, a thud at each flood peak, lead scrapes for glyphs, chisel ticks for the title. Bed is ducked under the voice with a volume lane from the word times.
- Measured on the final file: -16.2 LUFS integrated, true peak -1.3 dB. The raw render read -19.3 LUFS, so the audio track was loudness-normalised (ffmpeg `loudnorm`, video stream copied) and the file re-encoded (crf 28, 6 Mbit/s cap) to stay small for git.
- Not verified: the audio was measured, not heard.

## Constraint checks
- Deterministic: `mulberry32`/`hash01` only, no `Math.random`, `Date` or `repeat: -1`. One paused GSAP timeline per scene; every cell state is a tween of time. Scenes are sub-compositions.
- `npx hyperframes check` times out on this page (about 3,000 SVG nodes), so lint, snapshots and the real render were the gates. A "GSAP target undefined" console line appears in the runtime and did not come from page code.
- Skills: the brief names hyperframes-core, -animation, -creative and -audio; this package version ships `hyperframes`, `hyperframes-cli`, `hyperframes-registry`, `media-use`, which I read instead.
- Failure modes checked: flat colour with no glass depth (texture, gradient, bloom), constant lead weight (5 to 9 px, uneven), no floor spill (pools present in every nave), bloom losing edges (bloom held to 0.5 to 0.65 except the final face), progression unclear (computed from the same face and labelled by lit glyphs).

## What to build next (ranked)
1. Cell-specific recolouring in the training montage.
2. Larger, tensor-oriented glyphs in pane 2.
3. A sharper floor projection and a lens-crossing lead shadow in the flood.
4. Listen to the audio and rebalance.
