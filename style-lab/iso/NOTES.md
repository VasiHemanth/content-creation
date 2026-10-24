# Isometric 3D: how a cache protects a database

1080x1920, 30 fps, 49.1 s. Voice: Kokoro `af_heart`, speed 0.9 (local). Word times are sentence-aligned and then split by syllable weight inside each sentence (about 100 ms drift possible). Everything is code: Three.js geometry, canvas textures, HTML/SVG labels. No stock, no external images, no AI images. Three.js r160 and GSAP and Space Grotesk are vendored locally because the render browser cannot reach CDNs.

Build chain: `tools/tts.py` -> `timing.json` -> `build.mjs` (writes `assets/timing.js`, `assets/events.json`, `compositions/`, `index.html`) -> `tools/audio_iso.py` (audio plan from the same events) -> `npx hyperframes render`.

## Structure and one deviation from the brief
Three sub-compositions: `world` (the WebGL canvas, whole video), `hud` (labels, counters, board, dial, handle), `captions` (word by word, Space Grotesk 700 on dark pills). The brief asks for scenes as sub-compositions with one timeline each; a single continuous diorama cannot be cut into scenes without rebuilding the WebGL context, so beats are driven by one pure model (`assets/model.js`) that both `world` and `hud` read. Each sub-composition has one paused GSAP timeline whose single anchor tween calls `draw(tl.time())`, so every frame is a pure function of time. No `Math.random`, no wall clock, no accumulated physics; the only randomness is `mulberry32` (which 100 of the 1,000 requests are misses) and a sine hash for LED blinks and the database shake.

## Techniques: built, failed, weakest, next

### 1. Orthographic isometric camera
- Built: `OrthographicCamera` at elevation 35.264 degrees (axes land at 30 degrees on screen). Azimuth drifts at most 4.5 degrees on a slow sine. Screen position of any world point comes from the same function the camera uses (`ISO.proj`), so HUD labels stay glued to objects. Zoom (orthographic scale) changes but there is never perspective.
- Failed: portrait is a poor shape for a 15 x 5.5 tile; it only fills about 600 px of the 1920 px height. The first pass left a dead top third. Fixed with a title card on the first frame, a counter panel and a 1,000-dot board in the empty bands, and by re-centring the camera on what is left after the crowd slab sinks.
- Weakest: the empty band above the diorama in the middle of the video.
- Next: an L-shaped or stacked tile that uses the vertical space.

### 2. Rounded bevelled objects, one light, soft shadows
- Built: every box is an `ExtrudeGeometry` with a bevel (about 4 percent), one directional key light from the upper left with a 2048 `PCFSoftShadowMap`, a cool fill from the right so the +x faces are not black, hemisphere ambient, and baked-looking radial blob shadows under buildings for contact shadows. Light never moves, so shadows never change direction.
- Failed: the database read nearly black until the fill and ambient were raised.
- Weakest: no real ambient occlusion in corners; the blobs are only under whole buildings.
- Next: a baked AO pass or SSAO.

### 3. The cube crowd and exact counts
- 1,000 request cubes in one `InstancedMesh`, each a pure function of time: spawn schedule, constant belt speed 4 units/s, a slot in a 54-per-row heap on the crowd pad, then a release path. The queue sign reads the real count of cubes that have arrived minus those released (reaches 1,000, then 999 when the first request leaves).
- Counts: 100 misses and 900 hits come from a seeded shuffle; `tally()` reads them from the status table (900 / 100), the board draws all 1,000 dots from it, and the dial reads 100 -> 10 percent from misses / total. The 146 cubes that actually stream through the cache in beat 5 are real; the rest of the heap is recoloured (orange = will hit, cyan = miss) rather than drained, because a 1,000-cube drain at constant belt speed would take about 20 s.
- Weakest: beat 6 recolours the heap instead of replaying the flow, so the 900/100 is shown as a count, not as 1,000 cubes physically passing.
- Next: a second, faster lane so the full 1,000 can drain.

### 4. Belts, gate, cache building
- Chevron belts with texture offset at constant speed, a gate arm that lifts, a cache that drops in with a bounce and settles. The cache is a cutaway (low east wall, glass front wall, roof over the back half) so the shelf, the copy and the timer ring are visible. The golden core is a small gem on top of the cube (the cube is opaque).
- Failed: the first cache had a full roof and walls, and the shelf was invisible. Rebuilt as a cutaway.
- Weakest: hits pass behind the east wall, so they are small and only visible at the arches and on the out belt.

### 5. Stale copy
- A ring (RingGeometry draw range) runs down over 2.1 s, the copy lerps from gold to brown, a stale cube picks up the brown copy and a warning flag, the copy is discarded, the next cube is a miss and a fresh copy appears. The camera pushes in on the cache for this beat.

### 6. Labels and HUD
- HTML cards with thin leader lines in screen space, upright, projected each frame; counters and the 1,000-dot board are drawn from the model.

### 7. Sound
- Synthesized in code (`tools/audio_iso.py`): belt hum, extrusion whir, cube ticks, gate clunk, thuds, database whir, soft pops, ratchet for the dial, fuse ticks for the timer, a quiet 104 bpm bed. No musical chimes. Music ducked under the voice by a volume lane taken from the line times. The audio is measured, not heard.

## Constraint checks
- Orthographic camera only; scale is consistent (one belt speed, one cube size); counts match the script (1,000 requests, 900 hits, 100 misses).
- `npx hyperframes check` is slow on a WebGL page; lint, snapshots and the real render were the gates.
- Skills: the brief names hyperframes-core / -animation / -creative / -audio; this package ships `hyperframes`, `hyperframes-cli`, `hyperframes-registry`, `media-use`. I used those and the runtime notes (animation runtimes, buildReady).
- Handle is ASCII "@hemanth_with_ai".

## What to build next
1. Use the vertical space (stacked tiles).
2. A faster lane and a true 1,000-cube drain.
3. AO baking; thicker belt rails; arrows on the belts.
4. Listen to the audio.

## Delivery measurements
- `out/final.mp4`: 1080x1920, 30 fps, 49.07 s, h264 + aac. Rendered with `--quality looks` (13 min; Three.js with 1,000 instanced cubes and shadow maps rendered fine in software GL at about 0.5 s per frame), then re-encoded (crf 28, 6 Mbit/s cap) to 5 MB for git; the 33 MB master is not kept.
- Loudness of the delivered file (`hyperframes audio`): -17.4 LUFS integrated, -15.3 LUFS short-term max, sample and true peak -1.0 dB. That is about 1.5 LU under the -16 target. Measured, not heard.
- Critique passes: 5 rounds of stills at beat starts plus frames 0, 15, 30, 45 (first full build, then after each fix list). Fixed: dead first frame (added title card and a half-risen database), queue sign clipped at the right edge, near-black database, overlapping labels, a stuck "fresh copy" label at 0,0, board overlapping the database, an off-centre camera after the crowd slab sank, handle overlapping a counter, invisible shelf (cache rebuilt as a cutaway).
- Unverified: audio by ear; word-level sync beyond the estimate noted above.
