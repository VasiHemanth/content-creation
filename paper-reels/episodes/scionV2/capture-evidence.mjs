// Episode-local receipt capture for scionV2 (the shared `hf.mjs evidence` step reads PDFs only).
// Opens the live article in headless Chrome at viewport width 1280 and deviceScaleFactor 2, then:
//   - text receipts: finds each exact phrase in the DOM, takes the Range's client rects, pads 10 CSS px,
//     screenshots that clip, and paints over anything outside the phrase rects (so no neighbouring words show);
//   - figure receipt: screenshots the <figure> that holds the merges-per-day chart and crops the late-August to
//     Sep 9 strip (crop given as fractions of the figure, checked by eye on the 2x capture).
// Writes evidence/<id>.png and evidence/manifest.json in the shape KIT.paper/KIT.read expect.
// The figure's legible text is raster: its digits are typed into facts.json evidence_incidental by hand.
//
// usage: node paper-reels/episodes/scionV2/capture-evidence.mjs [--probe=<dir>]
//   PUPPETEER_CORE=<path to puppeteer-core>  CHROME=<path to chrome-headless-shell>   (defaults: the npx cache)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const D = import.meta.dirname, URL_ = 'https://www.anthropic.com/engineering/redesigning-source-control';
const npx = path.join(os.homedir(), '.npm', '_npx');
const PPT = process.env.PUPPETEER_CORE || fs.readdirSync(npx).map((d) => path.join(npx, d, 'node_modules', 'puppeteer-core')).find((p) => fs.existsSync(p));
const CHROME = process.env.CHROME || path.join(os.homedir(), '.cache/puppeteer/chrome-headless-shell/mac_arm-149.0.7827.22/chrome-headless-shell-mac-arm64/chrome-headless-shell');
const puppeteer = createRequire(import.meta.url)(PPT);
const probe = (process.argv.find((a) => a.startsWith('--probe=')) || '').slice(8);
const job = JSON.parse(fs.readFileSync(path.join(D, 'evidence.json'), 'utf8'));
const PAD = 10, DPR = 2;

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--hide-scrollbars'] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1600, deviceScaleFactor: DPR });
  await page.goto(URL_, { waitUntil: 'networkidle2', timeout: 90000 });
  // cookie banner: press "Reject all" (or any reject button) if it shows
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /reject all/i.test(x.textContent)); if (b) b.click(); });
  await new Promise((r) => setTimeout(r, 800));
  await page.evaluate(async () => { await document.fonts.ready; });
  // load every lazy image
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
    await Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; }))));
    window.scrollTo(0, 0);
  });

  // hide anything fixed or sticky (cookie banner, header, buttons) so no overlay can land on a crop
  await page.evaluate(() => { for (const el of document.querySelectorAll('body *')) { const p = getComputedStyle(el).position; if (p === 'fixed' || p === 'sticky') el.style.setProperty('display', 'none', 'important'); } });
  await new Promise((r) => setTimeout(r, 300));

  if (probe) {
    fs.mkdirSync(probe, { recursive: true });
    const figs = await page.evaluate(() => [...document.querySelectorAll('figure')].map((f, k) => { const r = f.getBoundingClientRect(); return { k, cap: (f.querySelector('figcaption') || {}).textContent || '', x: r.x + scrollX, y: r.y + scrollY, w: r.width, h: r.height, imgs: [...f.querySelectorAll('img')].map((i) => [i.currentSrc, i.naturalWidth, i.naturalHeight]) }; }));
    console.log(JSON.stringify(figs, null, 1));
    for (const f of figs) await page.screenshot({ path: path.join(probe, `fig${f.k}.png`), clip: { x: f.x, y: f.y, width: f.w, height: f.h }, captureBeyondViewport: true });
    process.exit(0);
  }

  const out = {};
  fs.mkdirSync(path.join(D, 'evidence'), { recursive: true });
  for (const it of job.items) {
    const file = path.join(D, 'evidence', `${it.id}.png`);
    if (it.figure) {
      // a figure: screenshot the <figure> whose caption matches, crop by fractions of the figure box
      const box = await page.evaluate((cap) => { const f = [...document.querySelectorAll('figure')].find((x) => (x.textContent || '').includes(cap)); if (!f) return null; f.scrollIntoView(); const r = f.querySelector('img') ? f.querySelector('img').getBoundingClientRect() : f.getBoundingClientRect(); return { x: r.x + scrollX, y: r.y + scrollY, w: r.width, h: r.height }; }, it.figure);
      if (!box) throw new Error(`figure "${it.figure}" not found`);
      const [fx0, fy0, fx1, fy1] = it.crop;
      const clip = { x: box.x + fx0 * box.w, y: box.y + fy0 * box.h, width: (fx1 - fx0) * box.w, height: (fy1 - fy0) * box.h };
      await page.screenshot({ path: file, clip, captureBeyondViewport: true });
      const [w, h] = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', file]).toString().trim().split(',').map(Number);
      // highlight box: the callout, given as fractions of the crop
      const rects = (it.rects || []).map(([x, y, rw, rh]) => ({ x, y, w: rw, h: rh }));
      out[it.id] = { img: `evidence/${it.id}.png`, w, h, page: 0, rects, circles: {}, text: it.text, source: { url: URL_, figure: it.figure, css_clip: clip, dpr: DPR } };
      continue;
    }
    // text phrases, stacked into one image when there are several (one highlight rect each)
    const parts = [];
    for (const phrase of it.find) {
      const r = await page.evaluate((phrase) => {
        const walker = document.createTreeWalker(document.querySelector('article') || document.body, NodeFilter.SHOW_TEXT);
        const nodes = []; let full = '';
        for (let n; (n = walker.nextNode());) { nodes.push([n, full.length]); full += n.textContent; }
        const i = full.indexOf(phrase); if (i < 0) return null;
        const at = (pos) => { for (let k = nodes.length - 1; k >= 0; k--) if (nodes[k][1] <= pos) return [nodes[k][0], pos - nodes[k][1]]; };
        const rg = document.createRange(); const [sn, so] = at(i), [en, eo] = at(i + phrase.length);
        rg.setStart(sn, so); rg.setEnd(en, eo);
        sn.parentElement.scrollIntoView({ block: 'center' });
        const rs = [...rg.getClientRects()].filter((q) => q.width > 1).map((q) => ({ x: q.x + scrollX, y: q.y + scrollY, w: q.width, h: q.height }));
        let el = sn.parentElement, bg = 'rgba(0, 0, 0, 0)'; while (el && /rgba\(0, 0, 0, 0\)|transparent/.test(bg = getComputedStyle(el).backgroundColor)) el = el.parentElement;
        const c = (bg.match(/\d+/g) || [255, 255, 255]).slice(0, 3).map((v) => (+v).toString(16).padStart(2, '0')).join('');
        return { rs, count: full.split(phrase).length - 1, bg: '0x' + c };
      }, phrase);
      if (!r) throw new Error(`${it.id}: phrase not found: ${phrase}`);
      if (r.count !== 1) throw new Error(`${it.id}: phrase found ${r.count} times: ${phrase}`);
      // one part per text line: a phrase that wraps becomes stacked line crops, each holding only its own words
      if (process.env.DEBUG) console.error(it.id, JSON.stringify(r.rs));
      const lines = [...new Set(r.rs.map((q) => Math.round(q.y)))].sort((a, b) => a - b);
      for (const ly of lines) {
        const rs = r.rs.filter((q) => Math.round(q.y) === ly);
        const u = { x: Math.min(...rs.map((q) => q.x)), y: Math.min(...rs.map((q) => q.y)), x1: Math.max(...rs.map((q) => q.x + q.w)), y1: Math.max(...rs.map((q) => q.y + q.h)) };
        const clip = { x: u.x - PAD, y: u.y - PAD, width: u.x1 - u.x + 2 * PAD, height: u.y1 - u.y + 2 * PAD };
        const tmp = path.join(os.tmpdir(), `scionV2-${it.id}-${parts.length}.png`);
        await page.screenshot({ path: tmp, clip, captureBeyondViewport: true });
        // paint the side pads white, so a neighbouring glyph edge cannot show
        const [W, H] = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', tmp]).toString().trim().split(',').map(Number), m = (PAD - 3) * DPR, mh = (PAD - 1) * DPR;
        execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', tmp, '-vf', [`drawbox=x=0:y=0:w=${mh}:h=${H}:color=${r.bg}:t=fill`, `drawbox=x=${W - mh}:y=0:w=${mh}:h=${H}:color=${r.bg}:t=fill`, `drawbox=x=0:y=0:w=${W}:h=${m}:color=${r.bg}:t=fill`, `drawbox=x=0:y=${H - m}:w=${W}:h=${m}:color=${r.bg}:t=fill`].join(','), tmp + '.m.png']);
        parts.push({ file: tmp + '.m.png', W, H, phrase, bg: r.bg });
      }
    }
    // parts are stacked (default) or set side by side on one line (it.row): a row keeps every highlight at one height,
    // so KIT.read never scrolls the card vertically between highlights
    const gap = it.gap ?? 24, row = !!it.row, m = (PAD - 3) * DPR;
    const Wt = row ? parts.reduce((a, p) => a + p.W, 0) + gap * (parts.length - 1) : Math.max(...parts.map((p) => p.W));
    const Ht = row ? Math.max(...parts.map((p) => p.H)) : parts.reduce((a, p) => a + p.H, 0) + gap * (parts.length - 1);
    const offs = []; let o = 0; for (const p of parts) { offs.push(o); o += (row ? p.W : p.H) + gap; }
    if (parts.length === 1) fs.copyFileSync(parts[0].file, file);
    else {
      const lay = offs.map((v) => (row ? `${v}_0` : `0_${v}`));
      const pad = (p) => (row ? `pad=${p.W}:${Ht}:0:0` : `pad=${Wt}:${p.H}:0:0`);
      execFileSync('ffmpeg', ['-v', 'error', '-y', ...parts.flatMap((p) => ['-i', p.file]), '-filter_complex',
        `${parts.map((p, k) => `[${k}:v]${pad(p)}:color=${p.bg}[p${k}]`).join(';')};${parts.map((_, k) => `[p${k}]`).join('')}xstack=inputs=${parts.length}:layout=${lay.join('|')}:fill=${parts[0].bg}`, '-frames:v', '1', file]);
    }
    const rects = parts.map((p, k) => (row
      ? { x: (offs[k] + m) / Wt, y: m / Ht, w: (p.W - 2 * m) / Wt, h: (p.H - 2 * m) / Ht }
      : { x: m / Wt, y: (offs[k] + m) / Ht, w: (p.W - 2 * m) / Wt, h: (p.H - 2 * m) / Ht }));
    out[it.id] = { img: `evidence/${it.id}.png`, w: Wt, h: Ht, page: 0, rects, circles: {}, text: it.find.join(' '), source: { url: URL_, phrases: it.find, dpr: DPR } };
  }
  fs.writeFileSync(path.join(D, 'evidence', 'manifest.json'), JSON.stringify(out, null, 1));
  console.log(Object.entries(out).map(([k, v]) => `${k} ${v.w}x${v.h} rects=${v.rects.length}`).join('\n'));
} finally { await browser.close(); }
