# Clay: backpropagation as blame passed backwards

1080x1920, 30 fps, 52.3 s. Voice: Kokoro `af_heart`, speed 0.95 (local). Word times are sentence-aligned and split inside each sentence by syllable weight (not forced-aligned: expect about 100 ms drift on a word). All geometry, textures, text and sound are code. Three.js r160 (classic `three.min.js`, vendored: the render browser cannot reach CDNs).

Build chain: `tools/tts.py` -> `timing.json` -> `build.mjs` (writes `assets/timing.js`, `compositions/*`, `index.html`) -> `hyperframes render`. Code: `assets/clay.js` (noise, lumpy geometry, clay material), `assets/world.js` (set, cast, props, post pass), `assets/story.js` (the whole story as pure functions of time). Audio: `style-lab/tools/audio_clay.py`.

## Seek safety
`frame(t)` is the only thing that moves anything. It reads `e.detail.time` from `hf-seek`, derives every pose from `t` (characters and props from a 12 fps stepped clock `ts = floor(t*12)/12`, camera and post from the smooth clock), and renders. No rAF, no accumulated physics, no `Math.random` (seeded `mulberry32` and a stateless `hash01` for jitter). The scene registers a paused GSAP timeline only so the runtime has one; it animates nothing. Heavy setup (bump textures, lumpy geometry, title extrusions) sits behind `window.__hf.buildReady`.

## Per technique: built / failed / weakest / next

### 1. Clay material
- Built: `MeshPhysicalMaterial` (roughness .56, sheen, low clearcoat) plus an `onBeforeCompile` patch that adds a fresnel rim to emissive in a brighter, more saturated version of each character's colour (fake subsurface scattering), and a warm rim directional light. A per-seed procedural bump map: layered value noise, swirl fingerprint ridges, thumb dents, tool nicks. Seam rings around each body, dust specks stuck on the surface, bead eyes with clearcoat.
- Failed: the first pass had no bump and looked like glossy plastic; fixed by the fingerprint texture and a higher roughness.
- Weakest: the bump texture repeats once over each sphere so fingerprints read as soft smudges rather than distinct prints at 648 px internal width. No true translucency; the "SSS" is only a rim.
- Next: triplanar bump so prints do not stretch at the poles; a second normal-map pass for knife marks.

### 2. Lumpy geometry
- Built: every primitive (bodies, limbs, balls, lumps, title letters, tags) is displaced along its normal by seeded low-frequency 3D value noise, then re-smoothed with a weld-aware normal pass so seams close.
- Weakest: displacement is one noise per piece; clay pieces joined by a pinched seam would read better with a small crease along the join.

### 3. Lighting and tilt-shift
- Built: warm key from the upper left with a 1536 px PCF-soft shadow map, cool fill, warm back rim, hemisphere ambient, blob contact shadows under every body and ball. A custom post pass reads a multisampled depth texture: blur radius = depth distance from a focus point (rack-focused per camera key) plus a tilt-shift term that is strongest at the top and bottom of the frame, 24 golden-angle taps, vignette. Camera shake of +-0.3 px quantised to 12 fps.
- Failed: first version had one plain blur; the depth term makes the foreground hand and the background judge soften differently.
- Weakest: near objects bleed into far sharp ones at silhouettes (weighted but not perfect); the render is 648x1152 upscaled to 1080x1920, so fine detail is soft. This suits clay but is a quality trade, made to stay inside the render budget.

### 4. Stepped animation with squash and stretch
- Built: all character and prop motion reads a 12 fps stepped clock (2 to 3 frame holds), volume-preserving squash on every hop and landing, anticipation squash before takeoff, seeded 1 to 2 cm positional jitter and tilt per step, wobble when the workers worry, tick-pulse on each dial click.
- Weakest: arms are rigid capsules (only the high-five stretches them), so passes and tosses read more from the body squash than from the arms.

### 5. The story, to scale
- Numbers: number ball 0.30; dials 1.35, 0.80, 1.40 so the answer ball is 0.4536 against a truth ball of 0.30 (a bigger dial makes a bigger ball, visibly; worker 2 shrinks it). The loss wedge height is proportional to the difference. Blame shares come from each dial's influence (answer / dial): 27.4, 46.2, 26.4 percent. The red lump has volume 1; the three pinched pieces have radii cbrt(share) x lump radius, so they add up to the whole lump (a merge beat shows it). Dials turn by 0.30 x share, the replay ball arrives at 0.332 against 0.30 (wedge 0.154 down to 0.032). Montage loops use other example sizes and the loss bar shrinks to the computed values.
- Weakest: the dial needles are small; at phone size they read as a clock face, not a number. Tags carry the words (number, truth, LOSS, my fault?).

### 6. Transitions
- Built: a huge lilac clay hand sweeps across the lens twice (before the judge beat and before the replay), blurred by the depth pass; the other cuts are camera tilts and dollies down the table.
- Weakest: the hand sweep is short (1 s) and only barely covers the frame, so it reads as a passing blur rather than a wipe.

### 7. Title
- Built: "BACKPROP / AGATION" extruded from Helvetiker glyph outlines (vendored subset) with lumpy bevels, rising from the table letter by letter with overshoot and a squash. The brief's one-line title does not fit a 9:16 table, so it wraps after eight letters, which splits the word mid-syllable (deliberate deviation, noted below).

### 8. Sound
- Built in code (seeded numpy): clay squish, slap, pop, brass click, thud, whoosh, stretch, slide; 138 SFX on visible actions; a quiet 96 bpm marimba-like bed ducked under the voice with a volume lane from the word times.
- Not verified: audio was measured, not heard.

## Deviations and unverified
- The brief's "hyperframes-animation" skill does not exist in this package; I used `hyperframes/references/runtimes.md` for the seek protocol.
- One WebGL scene (one sub-composition, `world`) holds the whole set, so the physical objects persist across beats; captions are a second sub-composition. Not one composition per beat.
- Title is wrapped in two lines (see 7).
- `hyperframes check` times out on heavy pages; lint, snapshots and the real render were the gates.

## Final render (measured)
- `out/final.mp4`: 1080x1920, 30 fps, 52.27 s, h264 + aac. The raw `--quality looks` render was 25 MB; it was re-encoded (crf 28, 6 Mbit/s cap) to 6.6 MB for git. Render took about 13 minutes (capture 11.5 min, 648x1152 internal WebGL canvas) with other renders sharing the box.
- Audio: -17.9 LUFS integrated, -15.9 LUFS short-term max, sample peak -1.6 dB, true peak -1.4 dB. That is about 2 LU quieter than the -16 social target; measured, not heard.
- Critique rounds: four snapshot rounds (start of every beat plus frames 0, 15, 30, 45) at full size. Found and fixed: cameras far too close and workers filling the frame (pulled back, dolly paths moved off the line of workers), the judge beat blocked by worker 3 (camera moved to the left), worried brows drawn vertical and then angry (fixed to inner-end-up), hand covering worker 1's face, murky backdrop (unlit painted plane), title cropped and sinking into the table, title and caption strip overlapping, certificate text upside down, stamp beat out of frame. A fifth look at the real MP4's 24-frame sheet matched the stills.
- Still open: see the weakest-part notes above.
