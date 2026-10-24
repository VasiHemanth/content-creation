#!/usr/bin/env python3
"""score.py - the wardrobe film's sound, written on onetake's sfx_palette (air, wood, glass, sub, bubble in one room).
usage: python3 score.py <onetake checkout>  -> sfx.wav   (times are the comp's own constants)"""
import os, sys
sys.path.insert(0, os.path.join(sys.argv[1], "scripts"))
from sfx_palette import Score, air, glass, wood, sub, bubble, wobble, pan_of
import numpy as np
rng = np.random.default_rng(11)
s = Score(dur=23.2, T60=1.1); place = s.place
CLK = [4.00, 6.00, 10.20, 11.80, 14.60, 16.60]
for c in CLK:                                                    # the hand: down, up
    place(wood(240, 0.08), c + 0.02, 0.30, pan_of(1221), 0.2); place(wood(190, 0.07), c + 0.09, 0.20, pan_of(1221), 0.2)
place(sub(60, 0.5), 0.12, 0.20, 0.0, 0.3)                        # the card lands in paper
# paper -> dusk: iris opens from the card
place(air(0.7, 180, 2600, 1.2, 0.5), 4.10, 0.34, 0.0, 0.5); place(sub(55, 0.7), 4.22, 0.22, 0.0, 0.3)
# dusk -> tabletop: the card hops, lands, rings leave it
place(air(0.45, 300, 1800, 1.3, 0.4), 6.06, 0.22, 0.0, 0.4)
place(sub(62, 0.8), 6.62, 0.42, 0.0, 0.4)
for k, f in enumerate((523, 659, 784)): place(glass(f, 0.9, 0.6), 6.64 + k * 0.12, 0.13, 0.0, 0.5)
place(wobble(150, 0.5), 6.75, 0.26, pan_of(520), 0.3)             # the ball rolls aside
# tabletop -> ultramarine: a whip
place(air(0.6, 200, 3200, 1.2, 0.45), 10.30, 0.55, 0.5, 0.5, pan_to=-0.5); place(sub(68, 0.6), 10.94, 0.28, 0.0, 0.3)
# ultramarine -> riso: two plates slap on, snap into register, leave
place(wood(160, 0.12), 11.94, 0.42, -0.3, 0.2); place(wood(210, 0.12), 12.00, 0.38, 0.3, 0.2)
place(sub(70, 0.5), 12.34, 0.34, 0.0, 0.3); place(air(0.5, 2400, 300, 1.3, 0.3), 12.44, 0.30, 0.0, 0.4, pan_to=0.4)
# riso -> ember: light floods up, drains
place(air(0.55, 160, 2200, 1.1, 0.7), 14.72, 0.40, 0.0, 0.6); place(glass(392, 1.8, 0.5), 15.14, 0.16, 0.0, 0.7)
place(air(1.0, 2000, 200, 1.2, 0.3), 15.20, 0.22, 0.0, 0.5)
# the burst: six felt hits, one per look
for i, t in enumerate((16.74, 16.96, 17.18, 17.40, 17.62, 17.84)): place(sub(76 - i * 3, 0.45), t, 0.38, 0.0, 0.25)
# the fan-out: air on the arcs, a soft wood touch as each card lands
place(air(0.9, 250, 2600, 1.2, 0.5), 18.08, 0.34, 0.0, 0.5)
for i, t in enumerate(np.linspace(19.1, 19.5, 6)): place(wood(200 + 18 * i, 0.09), float(t), 0.20, pan_of([520, 960, 1400, 520, 960, 1400][i]), 0.3)
for i in range(6): place(bubble(480 + 40 * i, 0.2), 19.6 + i * 0.09, 0.12, pan_of([520, 960, 1400, 520, 960, 1400][i]), 0.3)
TXT = "eight colours · three faces · one take"
for i, ch in enumerate(TXT):
    if ch == ' ' or rng.uniform() < 0.4: continue
    place(wood(170 + rng.uniform(-20, 20), 0.08), 20.4 + i / 34, 0.08 * rng.uniform(0.7, 1.3), 0.0, 0.15)
place(sub(48, 1.2), 20.7, 0.30, 0.0, 0.4); place(glass(392, 1.8, 0.3), 20.74, 0.07, 0.0, 0.7)
s.write(os.path.join(os.path.dirname(os.path.abspath(__file__)), "sfx.wav"))
print("sfx.wav")
