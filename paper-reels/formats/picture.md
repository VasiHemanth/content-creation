# What the renderer can show (brief for planning)

The director plans with this page. The full scene rules for building are in `paper-reels/hf/README.md`; the director does not need them.

## Canvas and safe zones
1080 x 1920, 30 fps. Content lives in y 160 to 1450. Captions sit at y 1490 to 1586 (burned in, the active word turns amber). Keep x > 940 free for y 1000 to 1700 (platform buttons).

## Pacing (checked by code on the decoded MP4)
- A new visual event at least every 2.5 s. The gate fails a gap over 3.5 s, fewer than 30 events a minute, or no event in the first 1.5 s.
- A camera move on a spoken word counts as an event, but a scene where only the camera moves for 3 s still looks static to a viewer.
- Line timing: 0.25 s lead, the voice, 0.5 s tail (1.6 s after the last line).

## Building blocks
- **Scenes.** Lines with the same `scene` value play in one composition with one camera. A new scene enters with a transition: `whip` (new topic), `zoom` (into an object), `punch` (payoff), `rise`, `iris`, `blur` (wind-down), `glitch`, `cut` (inside a topic). Pick one main transition and one or two accents.
- **Reveals on words.** Any element can appear, move, count up, draw on or shake at the moment a word is spoken.
- **Receipts.** A real crop of the source PDF rises in; the camera dives to reading size and a highlighter follows the voice; a pen can circle one word. Text passages only: the checker cannot read numbers in figures. One phrase, about 2 s, then cut back to the scene's own picture. Every number visible in a crop must be in `facts.json`.
- **Board (system-design).** Persistent actors with role colours (old coral, new violet, compute cyan, protagonist pink, store amber); relabel or recolour in place; zoom into one and out to a grid of many; packets that travel between actors.
- **Drawings.** SVG line art with a hand-drawn edge, trees, a small robot, icons, charts drawn from storyboard values. Drawings add no number, name or claim.
- **Sound.** Effects land on spoken words: `whoosh`, `thud`, `pop`, `tick`, `chime`, `riser`, `impact`, `glitch`, `click`, `type`, `stamp`. Transitions add their own. A quiet music bed ducks under the voice.

## Rules that a plan must respect
- The first frame (0.0 s) shows the hook claim in big type. Never blank.
- All words and numbers on screen come from the storyboard; every number is in `facts.json` with its source section.
- The only on-screen identity is `hemanth_with_ai`.
- Colour on data marks (bars, counts) stays neutral unless the colour is the data.

## One example to look at
`paper-reels/episodes/_deepswe-hf/scenes/lock.html` (9 KB): one metaphor scene, reveals on spoken words, a moving camera. Read it once to see how a shot list line becomes motion. For `system-design`, read `paper-reels/reference/kodekloud-scion.md` instead.
