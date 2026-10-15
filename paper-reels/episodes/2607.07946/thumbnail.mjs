// Episode thumbnail (used by `reels thumb` and bin/validate.mjs): the s1 gauge frame (blueprint sheet, needle at the
// board's best pass@1) under the hook text from the database, with the handle on top.
import fs from 'node:fs';
import path from 'node:path';
import { cv, setBoil } from '../../engine/core.mjs';
import { ctx, P, drawBg, text, layout, measure, rect } from '../../engine/styles/blueprint-lib.mjs';
import { HANDLE } from '../../engine/brand.mjs';
import { gauge_ } from './scenes.mjs';

const S1 = { title: 'DeepSWE', value: '74%', label: 'pass@1, best agent setups', src: 'live board v1.1', scratch: 'written from scratch' };

export default async function thumbnail(outPath, { item }) {
  setBoil(0); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  ctx.fillStyle = P.bg; ctx.fillRect(0, 0, 1080, 1920); drawBg();
  ctx.save(); ctx.translate(540, 1120); ctx.scale(0.85, 0.85); ctx.translate(-540, -1000);
  gauge_(6.0, S1, 6.894, { still: true });
  ctx.restore();
  // hook box
  const lines = String(item.thumb_hook || '').split('\n'), size = Math.min(130, ...lines.map((l) => layout(l, 'Marker', 880, 130).size));
  const h = lines.length * size * 1.1 + 70;
  ctx.fillStyle = '#020c18'; ctx.globalAlpha = 0.7; ctx.fillRect(60 + 12, 430 + 12, 960, h); ctx.globalAlpha = 1;
  ctx.fillStyle = P.deep; ctx.fillRect(60, 430, 960, h); rect(60, 430, 960, h, { col: P.amber, lw: 5, noGhost: true });
  lines.forEach((l, i) => text(l, 540, 430 + 35 + (i + 0.82) * size * 1.1, { font: 'Marker', size, col: i === lines.length - 1 ? P.amber : P.white, align: 'center' }));
  const hw = measure(HANDLE, 'Mono', 52) + 60;
  ctx.fillStyle = P.deep; ctx.fillRect(540 - hw / 2, 320, hw, 84); rect(540 - hw / 2, 320, hw, 84, { col: P.amber, lw: 3, noGhost: true });
  text(HANDLE, 540, 380, { font: 'Mono', size: 52, col: P.amber, align: 'center' });
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, cv.toBuffer('image/png'));
  return outPath;
}
