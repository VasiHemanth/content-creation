// Plain-box style used to prove the pipeline before real styles exist. Not for publishing.
import { ctx, cv } from '../core.mjs';
import fs from 'node:fs';
const box = (x, y, w, h, s) => { ctx.strokeStyle = '#444'; ctx.lineWidth = 4; ctx.strokeRect(x, y, w, h); if (s) { ctx.fillStyle = '#222'; ctx.font = '40px Mono'; ctx.textAlign = 'center'; ctx.fillText(s, x + w / 2, y + h / 2 + 14); } };
const one = (name) => (t, d) => { box(100, 300, 880, 800, `${name}`); ctx.font = '30px Mono'; ctx.textAlign = 'center'; ctx.fillStyle = '#222'; ctx.fillText(JSON.stringify(d).slice(0, 60), 540, 1180); };
export default {
  name: 'stub', bg: '#f4f1ea',
  background() {},
  caption(text, a) { ctx.save(); ctx.globalAlpha = a; box(60, 1490, 960, 96); ctx.font = '40px Mono'; ctx.fillStyle = '#111'; ctx.textAlign = 'center'; ctx.fillText(text.slice(0, 40), 540, 1550); ctx.restore(); },
  blocks: Object.fromEntries(['hook', 'flow', 'bigstat', 'versus', 'bars', 'callout', 'checklist', 'endcard'].map((b) => [b, one(b)])),
  async thumbnail(p, out) { box(100, 400, 880, 1000, p.name); fs.writeFileSync(out, cv.toBuffer('image/png')); },
};
