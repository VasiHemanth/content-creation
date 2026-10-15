// Scratch test scene for the renderer: draws the callout data as a simple card with a wobbling icon.
import { W, C, ctx, bg, txt, rectS, circle, eo3, seg } from '../../engine/core.mjs';
export default {
  warnCard(t, d, dur) {
    bg('paper');
    const p = eo3(seg(t, 0.1, 0.6));
    rectS(100, 300, 880, 1000, { fill: C.paper, col: C.ink, lw: 8, seed: 3 });
    circle(540, 450, 80 + 6 * Math.sin(t * 6), { fill: C.red, col: C.ink, lw: 6 });
    txt('!', 540, 490, { font: 'Marker', size: 120, col: C.paper });
    txt(d.title, 540, 650, { font: 'Brush', size: 90, alpha: p });
    d.lines.forEach((l, i) => txt(l, 540, 820 + i * 150, { font: 'Mono', size: 30, alpha: eo3(seg(t, 0.8 + i * dur * 0.25, 1.3 + i * dur * 0.25)) }));
  },
};
