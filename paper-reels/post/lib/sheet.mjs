// The contact sheet: every slide at 300 x 375 in one PNG, in order, each with its number, id and kind.
// Drawn by the same headless Chrome as the slides (this ffmpeg build has no drawtext), so the labels use the kit's font.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { HF_DIR } from './constants.mjs';
import { screenshot } from './chrome.mjs';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

/** items: [{ label, file }] (PNG or JPEG paths). Writes `out`. */
export function contactSheet(items, out, { cols = Math.min(5, items.length), tile = 300 } = {}) {
  const tw = tile, th = Math.round(tile * 1.25), gap = 18, pad = 24, cap = 40, rows = Math.ceil(items.length / cols);
  const w = pad * 2 + cols * tw + (cols - 1) * gap, h = pad * 2 + rows * (th + cap) + (rows - 1) * gap;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'post-sheet-'));
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: "Mono"; src: url("${pathToFileURL(path.join(HF_DIR, 'kit', 'fonts', 'mono.ttf')).href}"); font-weight: 100 800; }
* { margin: 0; box-sizing: border-box; } html, body { width: ${w}px; height: ${h}px; background: #1b1f24; }
.g { position: absolute; left: ${pad}px; top: ${pad}px; display: grid; grid-template-columns: repeat(${cols}, ${tw}px); gap: ${gap}px; }
figure { width: ${tw}px; } img { display: block; width: ${tw}px; height: ${th}px; background: #000; outline: 1px solid #3d4650; }
figcaption { height: ${cap}px; padding-top: 10px; font: 700 22px/1 "Mono", monospace; color: #cfd8e3; white-space: nowrap; }
</style></head><body><div class="g">${items.map((it) => `<figure><img src="${pathToFileURL(it.file).href}"><figcaption>${esc(it.label)}</figcaption></figure>`).join('')}</div></body></html>`;
  const page = path.join(dir, 'sheet.html');
  fs.writeFileSync(page, html);
  try { fs.mkdirSync(path.dirname(out), { recursive: true }); screenshot(page, out, w, h); } finally { fs.rmSync(dir, { recursive: true, force: true }); }
  return out;
}
