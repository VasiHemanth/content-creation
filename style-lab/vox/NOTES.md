# Vox style: "the three things that made neural networks work"

1080x1920, 30 fps, 55.67 s. Voice: Kokoro `af_heart` (local, speed 1.0). Word timings are **estimated** (each sentence is synthesised separately, words are split by syllable-weighted length), not forced-aligned; expect up to about 100 ms of drift on a word. Everything is code: no stock, no images, no external fonts (Anton, Archivo Black, Inter Tight are vendored in `assets/fonts`). The sandbox browser cannot reach CDNs, so GSAP is vendored too.

Files: `out/final.mp4`, `out/contact-sheet.png`, `NOTES.md`. Source: `src/` (templates; scenes are generated from `tools_src/`), `compositions/` (built), `build.mjs`, `assets/vox.js` (all helpers), `../tools/audio_vox.py` (music and SFX).

## Verify before posting
Every number on screen. None other was added (the counters tick through intermediate values for about half a second; those are animation, not claims).
- 1958 (first neural network built)
- 2009, ImageNet released; "1,000,000+" = "more than a million labeled photos" (ImageNet over 1 million labeled images)
- 2012, AlexNet, two GPUs ("x2", "TWO GPUS")
- top-5 error 15.3 percent (AlexNet) versus 26.2 percent (runner-up); the voice says "15 percent" and "26" as scripted
- 2017, the transformer paper
- 2020, GPT-3, 175 billion parameters
- Also on screen: "TOP-5" (part of the error metric name), the section numerals 1, 2, 3, "x2"
- The log-scale chart is **illustrative**: only GPT-3 carries a value. Heights of the 1958 and 2012 points show order of magnitude only and have no axis numbers. Say so, or cut the chart, if you want zero implied data.
- "NOW" in the cold open counter (1958 to 2020) is a decoration.

## Techniques
Format of each entry: what I built / what failed / weakest part / build next.

1. **Hard cuts, one scene per sentence-group, push-in on every scene.** Nine sub-compositions (`sceneV1..V9`), each with an inner `cam` wrapper scaling 1.0 to 1.05-1.07. Beats inside a scene are full-frame colour blocks cut with visibility sets (a visual change every 1.2 to 2.5 s). Failed: first pass kept all content in the top 60% of the frame; fixed with a per-beat vertical offset. Weakest: V3 beat A and V6 beat A (slabs) are static for about a second. Next: a second whip-pan cut between sections (only title whips exist now).
2. **Title whip with ghost trail.** Heavy condensed caps enter from the side with 3 clones fading over 3 frames. Failed: first frame of the cold open was half off-screen at scale 1.5; now 1.22. Weakest: it is a fake blur (copies), not true motion blur. Next: `data-motion-blur`, or a horizontal-only SVG blur on the clone.
3. **Slab slams.** Numbered colour slabs hit with a power3.in approach (0.15 s), 3.5 percent rebound, and a seeded 6 px shake for 4 frames on the camera wrapper. Failed: the first ease (a delayed back-ease) left the slab dark and half-faded at the word; the hit also started before the scene when the word was near a seam (clamped). Weakest: the hit and thud are timed to the estimated word start.
4. **Highlighter, scribble, circle, arrow.** Ragged tilted polygons wiped with a clip, wobbly seeded paths drawn with stroke-dashoffset (arrow head drawn as its own path after the shaft). Failed: SVG dashing restarts per sub-path, so the first arrow head appeared before its shaft; and one highlight was painted over its own text (z-order). Weakest: stroke width is constant, so the marks look more like a pen than a marker. Next: double-pass strokes with varied width (the helper exists, `V.scribble`, but is used for two underlines only).
5. **Halftone cut-outs** (neuron graph, chip, trophy, document, transformer block, cat/car/cup/plane tiles). Code-drawn grey art, then a 45 degree dot grid sized by darkness, a thin off-white outline from a dilated silhouette, a hard offset shadow, 1 to 2 degrees of rotation, rendered once into canvases. Failed: the cup tile reads as a blob and the cat as a bear at 250 px; chip cores are muddy at cell 10. Weakest: object recognisability. Next: bigger cell on tiles, hand-tuned silhouettes, add the missing detail strokes as solid dark lines.
6. **Count-ups with a flash.** Years count up from 0 and flash on the final value; `1,000,000+` and `175 BILLION` count in their own formats. Weakest: the counts pass through arbitrary numbers, which is fine as motion but would read as data if paused.
7. **The spine.** One timeline function (`V.spine`), nearly flat from 1958 to 2009 then convex; linear in time, so 2009 to 2020 fills the last 18 percent of the width. Appears in the cold open, the "fifty years" crawl (ticks scroll under a head dot) and the finale with three pins (DATA, COMPUTE, DESIGN). Weakest: the three finale pins are crowded because the three years sit within 8 years of a 62-year axis; staggered heights hide it. Next: break the axis or zoom the camera in on the steep part.
8. **Charts.** Bar race (26.2 grey vs 15.3 yellow) to scale with a pink bracket, arrow and "WIDE MARGIN"; log-scale chart with three points. Failed: first layout left the bottom 40 percent empty; labels sat on the line. Weakest: the arrow on the bar chart is decorative.
9. **Captions.** One track, black lower-third bar (now to the bottom edge), white condensed caps, current word in a yellow ragged box. Weakest: the bar is a full-width band at y 1620+, which is below the 1560 content limit on purpose.
10. **Audio.** Synthesised (numpy, seeded): a 104 bpm kick/hat/bass bed ducked to about 0.1 under the voice, and about 215 SFX (whoosh, thud, tick, marker squeak, stamp). Mixed with the HyperFrames audio graph. **Measured, not heard**: nobody listened to it. The bed is generic; it was not tuned by ear.

## Critique log (what I changed, by round)
Round 1 (first full build): 1. content all in the upper 60 percent; 2. cold-open frame 0 cropped; 3. slabs invisible at their start (ease and seam clamp); 4. 1958 overlapped "BUILT IN"; 5. year text too wide at 4 digits; 6. caption bar left a coloured strip below it; 7. highlight painted over "MARGIN" and over "INGREDIENTS."; 8. arrow heads detached; 9. bar chart tiny; 10. chips crowded the heading.
Round 2: 11. spine hidden under the caption bar after the vertical offset; 12. log-chart pill covered the axis and labels sat on the line; 13. PERCEPTRON label clipped at the left edge; 14. handle line under the caption bar; 15. empty black frames at a seam (V7 D start). Not fixed: items 5 of Techniques 5, 7, 8 above.

## Known gaps
- `npx hyperframes check` times out on this page in the layout pass; lint, snapshots and the render are the gates. Contrast and overlap were checked by eye only.
- Motion is not tested at 360 px phone width beyond the contact sheet.

## Render facts
`out/final.mp4`: h264 + aac, 1080x1920, 30 fps, 55.7 s, 56 MB (too large to commit casually; upload it or use Git LFS). `hyperframes audio` on the rendered file: integrated -18 LUFS, short-term max -15.4 LUFS, true peak -2 dBTP, no clipping. Louder than the -16 to -14 social target by about 2 LU; raise the master if the platform does not normalise. Measured, not heard.
