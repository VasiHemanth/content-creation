// Episode thumbnail (used by `reels thumb` and bin/validate.mjs when present): the loop desk, scissors on the desk
// versus the robot holding the eraser, with the hook from the database on top and the handle at the bottom.
import fs from 'node:fs';
import path from 'node:path';
import { ctx, cv, setBoil, bg, txt, tw, rectS, C } from '../../engine/core.mjs';
import { HANDLE } from '../../engine/brand.mjs';
import { loop } from './scenes.mjs';

export default async function thumbnail(outPath, { item }) {
  setBoil(0); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  bg('paper');
  // scene: robot with the raised eraser, scissors on the desk, the harness glove reaching in (no rule label)
  ctx.save(); ctx.translate(0, 230); ctx.translate(540, 960); ctx.scale(0.9, 0.9); ctx.translate(-540, -960);
  loop(1.75, { hand: 'harness' }, 5.114);
  ctx.restore();
  // hook
  const lines = String(item.thumb_hook || '').split('\n'), sz = Math.min(124, ...lines.map((l) => 124 * 940 / tw(l, 'Brush', 124)));
  const h = lines.length * sz * 1.05 + 70;
  ctx.save(); ctx.translate(540, 440 + h / 2); ctx.rotate(-0.02);
  rectS(-500 + 14, -h / 2 + 14, 1000, h, { fill: C.green, col: null, lw: 0, seed: 1 });
  rectS(-500, -h / 2, 1000, h, { fill: C.ink, col: C.ink, lw: 6, seed: 2 });
  lines.forEach((l, i) => txt(l, 0, -h / 2 + 35 + (i + 0.78) * sz * 1.05, { font: 'Brush', size: sz, col: i === lines.length - 1 ? '#F2C94C' : C.paper }));
  ctx.restore();
  txt(HANDLE, 540, 385, { font: 'Brush', size: 72, rot: -0.02 });
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, cv.toBuffer('image/png'));
  return outPath;
}
