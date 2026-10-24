# wardrobe: one card, six looks, one take

A 23.2 s, 1920x1080, 30 fps film made on [onetake](https://github.com/feitangyuan/onetake) (Claude Agent Skill, PolyForm Noncommercial 1.0.0,
Required Notice: Copyright (c) 2026 Patrick). `out/final.mp4` is the film, `out/contact-sheet.png` 24 frames, `NOTES.md` the notes.

onetake's own files are not copied here (its licence forbids commercial use; check yours before using this commercially).
To rebuild, clone onetake next to this folder and:

```bash
OT=/path/to/onetake
cp $OT/lib/motion.js .                      # the move library, loaded by comp.html
python3 make_looks.py $OT comp.html         # all six looks + their faces -> looks.js
python3 score.py $OT                        # the sound -> sfx.wav
python3 $OT/scripts/render.py $PWD/comp.html --out out/final.mp4 --sfx sfx.wav   # shutter motion blur, 1080p30
python3 $OT/scripts/verify_promo.py out/final.mp4 --comp $PWD/comp.html --shots 0,4.14,6.7,10.34,12.2,15.1,16.74,18.1,19.6
python3 check_card_identity.py              # the card is at the same pixels in every world at each swap
```
Needs python3 + playwright (chromium), numpy, scipy, Pillow, fonttools, brotli, ffmpeg.
