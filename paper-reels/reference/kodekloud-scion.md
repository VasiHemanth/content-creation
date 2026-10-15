# Reference: KodeKloud, "Anthropic moved away from Git" (Scion)

File: `a250062be4d34eddbdeceb1c45f9b31e.MP4`. Measured 2026-10-15 from the file itself (ffprobe, ebur128, frames at 1 fps and 4 fps, whisper `small.en`). It corrects some numbers in the earlier Gemini analysis.

## Facts
- 175.9 s, 720 x 1280, 30 fps, H.264, AAC stereo. Integrated loudness -14.2 LUFS, LRA 3.0 LU. (Gemini said 1080 x 1920 at 60 fps. It was wrong.)
- 590 spoken words, 3.4 words a second (about 204 a minute). No pause between words is longer than 0.25 s.
- One scene cut by ffmpeg scene detection (at 171.8 s, into the end card). Everything else changes inside one continuous frame.
- Visual changes at 4 fps: about 48 a minute. First change at 0.25 s. Longest gap 5.25 s (at 38.5 s, five idle CI machines while the voice defines "checkout"). Seven gaps over 3 s. The count is a little high because the watermark moves.
- No captions, no paper or blog screenshots, no caveat, no metaphor.

## Structure (from the transcript)
| Time | Act | What the picture does |
|---|---|---|
| 0 to 6 s | Claim: Anthropic left Git for Scion. "Why was Git not enough?" | Logo, Git icon cracks, arrow, Scion box, code window, speech bubble |
| 6 to 25 s | Scale: agents, 30,000 changes a day, tests, CI jobs | Agents above a codebase card, a counter, tests and production boxes, tests relabelled to CI JOBS |
| 25 to 50 s | Running example: one fix in `billing/tax.py` fans out to CI jobs, then 25 million checkouts a day | Folder tree, file highlighted, job pills, five CI machines, a grid of hundreds of machines |
| 50 to 85 s | Why Git fails: clone, 100 GB history, 25 GB trimmed, pack file, 600 PB a day | Zoom into one CI machine. Server above, clone arrow, size pills, a pack file icon that travels down the arrow, then the grid again |
| 85 to 108 s | Insight: workarounds still copy the repo. Laptops are offline, CI machines are always online | Three mirrors, laptop next to CI machine with OFFLINE and ALWAYS ONLINE tags, "Who changed tax.py?" bubble |
| 108 to 153 s | Hero: Scion. Root tree, fetch one folder, three cache tiers, content IDs | The same server box turns from red Git to purple Scion. Root tree, billing folder only, three machines, local cache, region cache, `tax.py #a3f9` then `#7c2e` |
| 153 to 170 s | Payoff: 99% cache hits, seconds instead of minutes, 25% CPU saved, 7 engineers in 5 months | 99% badges, two race bars (Scion seconds, Git minutes), CPU bar, seven people and Claude, "5 months" |
| 170 to 176 s | CTA | Blur, Subscribe and Follow buttons with a cursor, Instagram logo |

## What makes it work
1. **One protagonist object.** A single file (`tax.py` in `billing/`) and a single CI machine carry the whole video. Every number (30,000, 25 million, 100 GB, 600 PB) is shown as what happens to that one file or that one machine, then multiplied.
2. **Persistent actors that change state.** Boxes stay on screen and get relabelled instead of replaced: TESTS becomes CI JOBS, the Git server becomes the Scion server (same position, red to purple). The viewer never has to find the new thing.
3. **Build-up, not slides.** Each spoken clause adds one element to the existing diagram, and the group slides to make room. It resets only when it zooms into one element (one machine at 51 s) or zooms out to the multiplied scale (the machine grid).
4. **The hero comes late, on purpose.** Scion is named in the hook, then the video spends 100 s on the problem. The design rule ("CI machines are always online") arrives at 98 s, right before the solution, so the solution feels inevitable.
5. **Concrete example, not a metaphor.** There is no warehouse or library. The running example does the job a metaphor would do, using the real objects (folder, file, machine, server).
6. **Semantic color.** Red is Git and old, purple is Scion, cyan is CI machines, pink is the changed file, amber is cache. Color carries the argument.
7. **Typography.** Handwritten marker caps for labels, monospace for code and paths, big monospace numbers with a small marker caption under them.
8. **Layout.** All content sits in the upper two thirds. The bottom third stays empty for the platform UI because there are no captions.
9. **Voice with no gaps.** Pace is constant and fast. Pauses are under 0.25 s. The picture, not silence, gives the viewer time.

## What differs from our harness
- Length: 176 s against our 60 to 80 s target.
- No captions, no receipts, no caveat, no hedged numbers. Our validator would fail it on facts and on the missing caveat.
- One continuous build-up frame against our scene-per-composition model with transitions.
- Names the hero in the hook and explains it at 62% of the runtime. The Gemini rule "hero by 18 to 25 s" did not come from this video.
- The Gemini rules "0.35 s silence before big numbers" and "a physical metaphor is required" also did not come from this video.
