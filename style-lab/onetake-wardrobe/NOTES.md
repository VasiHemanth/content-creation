# wardrobe: what onetake can do for styling

## The idea (chosen from three)
onetake asks for three concepts that differ in their central picture, then a pick. Mine:
1. **Wardrobe (built).** One product card. A hand presses its button; each press carries the card into another of onetake's six looks, and each look arrives out of the card a different way. The card never leaves the frame; only its dress changes.
2. *Token river.* A camera flies down a river of the eight colour tokens, each look a bend. Pretty, but the card-as-subject (the thing that is "carried") is lost.
3. *Same sentence, six printers.* One headline set in each look with zoomThrough between. Reads as a type specimen; no cause.

## What it shows about onetake's styling
- **A look is eight colour tokens and three faces, nothing else.** Every look has the same token names, so one composition written against `var(--ground) ... var(--accent2)` and `var(--display|text|mono)` can switch look by name. `make_looks.py` (mine, 40 lines, built on onetake's `look.py`) bundles all six looks and their OFL faces (17 subset faces, 668 KB) into one `looks.js`, which `look.py apply` cannot do (it writes one look per comp).
- **Tokens are not themes.** The same card HTML restyled by tokens alone looks like a recolour. What makes the six read as six *worlds* is a little per-look dressing I wrote in CSS: paper = hairline and soft shadow; dusk = violet glow and a lattice of dots; tabletop = a physical shadow and a ball that rolls when the card lands; ultramarine = square corners, a hard offset shadow, disc shapes; riso = two ink layers (multiply) out of register, dot screens, registration marks and a colour bar; ember = a rising warm light. The final grid shows the tokens as eight swatches under each dressed card.
- **Six different carries, one per boundary** (the skill's rule: something survives every boundary and visibly moves): iris from the card (paper to dusk), the card hops and lands and rings leave it (dusk to tabletop; `hop`, `impact`, `ripple`), a whip pan with the card held centre and squashed along the move (tabletop to ultramarine; `whip`), two ink plates slide in out of register, snap into register under a swap and leave (ultramarine to riso), a light flood that rises out of the card and drains (riso to ember; `lightField`), then a burst of six hard cuts (the one place a bare cut is allowed) and the six dressed cards `gather` on arcs into a grid.
- **The cause is visible.** A hand drawn from one spline presses the button at each transition; the camera leans toward it ~0.5 s before every press and shakes on the landings.
- **Real shutter.** 696 frames, 2,760 captures (adaptive 4 to 48 per moving frame, sized by `__motion`), 180 degrees, averaged in linear light; 209 frames were holds and skipped it. The hop, the iris edge and the whip smear as a camera would.

## Checks
- `verify_promo.py` verdict **PASS**: cadence CV 0.38 (shot lengths 4.14 / 2.56 / 3.64 / 1.86 / 2.9 / 1.64 / 1.36 / 1.5 / 3.57 s), rest 0.468 with a 3.75 s dead-still stretch, burst, audio (peak -8.0 dBFS, no clipping), curves (peak 42 px/frame, soft curves 100 %), framing (card in frame 0 to 18 s, 503 samples).
- **First cut failed the cadence leg** (CV 0.23, six near-equal 3 s looks). Fixed by re-timing the presses to 4.0 / 2.0 / 4.2 / 1.6 / 2.8 / 2.0 s.
- **The continuity leg is not informative here.** I swap per-look DOM copies of the card, and probe.py identifies elements by DOM path, so in auto mode it flags two swaps (under the ink plates and under the flood) as "bare", although the card is at the same pixels. I supplied `__track` for the card, which gives "0 boundaries, score 1.00" (vacuous). My own check, `check_card_identity.py`, measures the card rect in every visible world at each swap: 0.000 px spread. To make the oracle see it for real, the card would have to be one DOM element restyled in place.
- Page errors: none. Loudness measured on the file: -19.0 LUFS integrated, -8 dBFS peak (onetake's palette peaks at -8 so music can sit on top; there is no music here).

## What failed or is weak
- First pass hid the card under the flood (the flood sat above the world); the flood now lives inside the ember worlds under the card. The burst showed the card over the name cards (visibility set before the world switched). The riso headline overflowed its card at 112 px.
- No music (the skill says to look for royalty-free tracks; I did not). Sound is onetake's five synthesised materials in one room, 65 events, measured not heard.
- The riso halftone is CSS radial-gradient dots, not a real screen; dusk and tabletop are static (kept still to leave rests). The tabletop world is the weakest: one ball and a shadow.
- Lint-style warnings: the looks' faces lack the glyphs in my code comments, not in text on screen.
- Draft quality only (1080p30). onetake's `--final` is 4K60 (about 8x the cost; I did not run it).

## What onetake could do next with styling
- `look.py from-shot` builds a look from a product's own screenshots: this film could be restyled in the user's brand in one command.
- `?lang=` plus `UIK.timeWarp` for the same film in other languages, and `vo_tools.py` for narration with Kokoro.
- UI rebuilt in HTML from screenshots (no screen recording), `OM.sim.*` soft bodies, silk gradients and the carousel belt.
- A seventh look made from tokens (eight colours, three faces) is the fastest way to add a world; shapes and textures stay the composer's job.

## Licence
onetake is PolyForm Noncommercial 1.0.0 (Required Notice: Copyright (c) 2026 Patrick). Personal and educational use is fine; commercial use is not, without onetake Pro. Its code (`lib/motion.js`, `looks/`) is not redistributed in this folder. The six looks' faces are SIL OFL 1.1.
