// 1080x1920 cover rendered by HyperFrames, so it matches the video's look. The hook text comes from the database
// (items.thumb_hook) and the name from items.thumb_name; an episode may add a hero drawing in scenes/thumb-hero.html
// (an HTML fragment, no scripts). bin/validate.mjs re-renders it through <episode>/thumbnail.mjs and compares.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { hfRun } from './hfcli.mjs';
import { HANDLE } from '../../engine/brand.mjs';

const HF = path.resolve(import.meta.dirname, '..');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function renderThumb(DIR, { item }, outPath) {
  const P = fs.mkdtempSync(path.join(os.tmpdir(), 'hf-thumb-'));
  fs.cpSync(path.join(HF, 'kit'), path.join(P, 'kit'), { recursive: true });
  const css = fs.readFileSync(path.join(HF, 'kit', 'blueprint.css'), 'utf8');
  // {{num l01.value}} in the hero is replaced by that storyboard value as a plain number, so drawn proportions follow the facts
  const sb = JSON.parse(fs.readFileSync(path.join(DIR, 'storyboard.json'), 'utf8')), data = Object.fromEntries(sb.lines.map((l) => [l.id, l.data || {}]));
  const heroF = path.join(DIR, 'scenes', 'thumb-hero.html');
  const hero = (fs.existsSync(heroF) ? fs.readFileSync(heroF, 'utf8') : '').replace(/\{\{num ([\w]+)\.([\w.]+)\}\}/g, (m, id, key) => {
    let v = data[id]; for (const k of key.split('.')) v = v == null ? v : v[k];
    const n = parseFloat(v); if (!Number.isFinite(n)) throw new Error(`thumb-hero: ${m} is not a number in the storyboard`); return String(n);
  });
  const lines = String(item.thumb_hook || '').split(/\\n|\n/).map((s) => s.trim()).filter(Boolean).slice(0, 3);
  const longest = Math.max(...lines.map((l) => l.length), 1), size = Math.min(170, Math.floor(1700 / longest));
  const name = item.thumb_name || item.short_name || item.id;
  const html = `<!doctype html>
<html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=1080, height=1920" />
<style>
${css}
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 1080px; height: 1920px; overflow: hidden; background: #061a30; }
#root { position: relative; width: 1080px; height: 1920px; overflow: hidden; }
#t-bg { position: absolute; inset: 0; background: radial-gradient(1300px 1500px at 50% 42%, #10406b 0%, #0b2a4a 55%, #061a30 100%); }
#t-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(127,196,238,.10) 1px, transparent 1px), linear-gradient(90deg, rgba(127,196,238,.10) 1px, transparent 1px),
  linear-gradient(rgba(159,216,244,.22) 1.4px, transparent 1.4px), linear-gradient(90deg, rgba(159,216,244,.22) 1.4px, transparent 1.4px);
  background-size: 40px 40px, 40px 40px, 200px 200px, 200px 200px; }
#t-frame { position: absolute; left: 34px; top: 34px; width: 1012px; height: 1852px; border: 2px solid rgba(168,220,242,.55); }
#t-handle { position: absolute; left: 0; top: 300px; width: 1080px; text-align: center; }
#t-handle span { display: inline-block; padding: 12px 30px; font: 700 50px "Mono", monospace; color: var(--amber); background: var(--deep); border: 4px solid var(--amber); }
#t-hook { position: absolute; left: 60px; top: 430px; width: 960px; text-align: center; font: 400 ${size}px/1.08 "Marker", sans-serif; color: var(--white); text-shadow: 10px 10px 0 rgba(2,12,24,.8); }
#t-hook div:last-child { color: var(--amber); }
#t-hero { position: absolute; left: 0; top: 820px; width: 1080px; height: 560px; }
#t-name { position: absolute; left: 0; top: 1390px; width: 1080px; text-align: center; }
#t-name span { display: inline-block; padding: 6px 34px; font: 400 104px/1.2 "Marker", sans-serif; color: var(--amber); background: var(--panel); border: 4px solid var(--amber); }
#t-id { position: absolute; left: 0; top: 1560px; width: 1080px; text-align: center; font: 600 40px "Mono", monospace; color: var(--cyan); }
</style></head><body>
<div id="root" data-composition-id="thumb" data-start="0" data-duration="1" data-width="1080" data-height="1920">
  <div id="t-bg"></div><div id="t-grid"></div><div id="t-frame"></div>
  <div id="t-handle"><span>${esc(HANDLE)}</span></div>
  <div id="t-hook">${lines.map((l) => `<div>${esc(l)}</div>`).join('')}</div>
  <div id="t-hero">${hero}</div>
  <div id="t-name"><span>${esc(name)}</span></div>
  <div id="t-id">${item.kind === 'paper' ? `arXiv ${esc(item.id)}` : ''}</div>
</div>
<script src="kit/vendor/gsap.min.js"></script>
<script>window.__timelines["thumb"] = gsap.timeline({ paused: true }).to({}, { duration: 1 });</script>
</body></html>`;
  fs.writeFileSync(path.join(P, 'index.html'), html);
  const snaps = path.join(P, 'snaps');
  hfRun(['snapshot', '--at', '0.5', '--no-end', '--describe', 'false', '-o', snaps], { cwd: P, quiet: true });
  const f = fs.readdirSync(snaps).find((x) => x.endsWith('.png'));
  if (!f) throw new Error('thumbnail snapshot failed');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.copyFileSync(path.join(snaps, f), outPath);
  fs.rmSync(P, { recursive: true, force: true });
  return outPath;
}
