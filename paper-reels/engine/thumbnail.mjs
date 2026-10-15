// 1080x1920 cover for Reels and Shorts. Key content stays in the centre band so a 4:5 or 1:1 grid crop still reads.
import fs from 'node:fs';
import path from 'node:path';
import { W, H, C, ctx, cv, setBoil, bg, txt, tw, marker, robot, burst, eo3 } from './core.mjs';
import { HANDLE } from './brand.mjs';

/** @param {{name:string, hook:string, arxivId:string}} p  hook may contain "\n" for two lines */
export function renderThumbnail({ name, hook, arxivId }, outPath) {
  setBoil(0);
  bg('paper');
  const lines = hook.split('\n');
  lines.forEach((l, i) => {
    const sz = Math.min(130, 980 / (tw(l, 'Brush', 130) / 130));
    txt(l, 540, 470 + i * 135, { font: 'Brush', size: sz, rot: -0.015 });
  });
  const nsz = Math.min(190, 960 / (tw(name, 'Marker', 190) / 190));
  const y = 470 + lines.length * 135 + 130;
  marker(540 - tw(name, 'Marker', nsz) / 2 - 10, 540 + tw(name, 'Marker', nsz) / 2 + 10, y + 36, 62, 1, C.green, 0.5);
  txt(name, 540, y, { font: 'Marker', size: nsz });
  burst(540, 1160, 0.4, 1.2, 10, C.green, 300, 22);
  robot(540, 1380, 20, { eye: 'happy', up: 1, t: 0 });
  txt(`arXiv ${arxivId}`, 540, 1500, { font: 'Mono', size: 44 });
  txt(HANDLE, 540, 1610, { font: 'Brush', size: 70, rot: -0.02, alpha: 0.85 });
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, cv.toBuffer('image/png'));
  return outPath;
}
