// Episode thumbnail (used by `reels thumb` and bin/validate.mjs): the hook frame (robot with the hammer raised over
// the `build` folder, red HELD stamp) under the hook text from the database, with the handle on top.
import fs from 'node:fs';
import path from 'node:path';
import { ctx, cv, setBoil, bg, txt, tw, rectS, C } from '../../engine/core.mjs';
import { HANDLE } from '../../engine/brand.mjs';
import { hammer_ } from './scenes.mjs';

const HOOK_DATA = { cmd: 'rm -rf build', prompt: '$', folder: 'build', stamp: 'HELD' };

export default async function thumbnail(outPath, { item }) {
  setBoil(0); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  bg('paper');
  // the hook scene a moment after the stamp lands, scaled into the lower band (y ~700..1500)
  ctx.save(); ctx.translate(540, 795); ctx.scale(0.58, 0.58); ctx.translate(-540, -190);
  hammer_(5.3, HOOK_DATA, 6.105, { thumb: true });
  ctx.restore();
  // hook
  const lines = String(item.thumb_hook || '').split('\n'), sz = Math.min(130, ...lines.map((l) => 130 * 920 / tw(l, 'Brush', 130)));
  const h = lines.length * sz * 1.05 + 70;
  ctx.save(); ctx.translate(540, 440 + h / 2 - 20); ctx.rotate(-0.02);
  rectS(-500 + 14, -h / 2 + 14, 1000, h, { fill: C.red, col: null, lw: 0, seed: 1 });
  rectS(-500, -h / 2, 1000, h, { fill: C.ink, col: C.ink, lw: 6, seed: 2 });
  lines.forEach((l, i) => txt(l, 0, -h / 2 + 35 + (i + 0.78) * sz * 1.05, { font: 'Brush', size: sz, col: i === lines.length - 1 ? '#F2C94C' : C.paper }));
  ctx.restore();
  txt(HANDLE, 540, 385, { font: 'Brush', size: 72, rot: -0.02 });
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, cv.toBuffer('image/png'));
  return outPath;
}
