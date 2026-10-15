// DOM audit: what each slide really shows, measured in the headless Chrome that HyperFrames renders with.
//
// hyperframes check reports clipped and overlapping text and low contrast. It does not say where the text boxes are, what
// size the text has, or whether a letter on the slide came from post.json. This module does: it loads each built slide
// (the same CSS, the same fonts, the same PK.bind) in a page of its own, walks every text node and reports its box, its
// font size and the element that holds it. judgeAudit() turns those measurements into checks. The two halves are separate
// so the rules can be tested without a browser.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { GRID_X0, GRID_X1, H, MARGIN, MIN_BODY_PX, MIN_HEAD_PX, W } from './constants.mjs';
import { dumpDom } from './chrome.mjs';
import { describeData } from './data.mjs';

const TOL = 1;                                            // px of slack on box edges (sub-pixel text metrics)

/** Runs in the page. Reads the slide and writes its report into <script id="pk-measure">. */
function pageScript(id) {
  return `(function () {
  var id = ${JSON.stringify(id)}, rep = { id: id, error: null, texts: [], binds: [], pseudo: [], xs: [], imgs: [], root: null, hl: [], boxes: [], pages: [] };
  function finish() { var s = document.createElement('script'); s.type = 'application/json'; s.id = 'pk-measure'; s.textContent = JSON.stringify(rep).replace(/</g, '\\\\u003c'); document.body.appendChild(s); }
  try { PK.bind(id); } catch (e) { rep.error = String(e && e.message || e); }
  document.fonts.ready.then(function () { setTimeout(function () {
    try {
      var root = document.querySelector('[data-composition-id="' + id + '"]');
      var rr = root.getBoundingClientRect(); rep.root = { x: rr.x, y: rr.y, w: rr.width, h: rr.height };
      var W = ${W}, H = ${H};
      function hiddenChain(el) {
        var o = 1; for (var e = el; e && e !== document.documentElement; e = e.parentElement) {
          var cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') return true; o *= parseFloat(cs.opacity); }
        return o < 0.05;
      }
      var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        var n = walker.currentNode, t = n.nodeValue; if (!t.trim()) continue;
        var el = n.parentElement; if (!el || /^(STYLE|SCRIPT|TITLE)$/.test(el.tagName)) continue;
        var r = document.createRange(); r.selectNodeContents(n); var b = r.getBoundingClientRect(), cs = getComputedStyle(el);
        // the box a reader sees is the line box: a range reports the font's content area, which for a display face like
        // Marker sticks out above and below the line. Recentre each line fragment on its line height (horizontal text).
        var lh = parseFloat(cs.lineHeight), horiz = cs.writingMode === 'horizontal-tb', x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
        Array.prototype.forEach.call(r.getClientRects(), function (q) {
          if (q.width < 1 || q.height < 1) return;
          var half = horiz && isFinite(lh) ? (q.height - lh) / 2 : 0;
          x0 = Math.min(x0, q.left); x1 = Math.max(x1, q.right); y0 = Math.min(y0, q.top + half); y1 = Math.max(y1, q.bottom - half);
        });
        if (x0 > x1) { x0 = b.left; x1 = b.right; y0 = b.top; y1 = b.bottom; }
        var bound = el.closest('[data-bind]');
        rep.texts.push({ text: t.trim(), bind: bound ? bound.getAttribute('data-bind') : null, tag: el.tagName.toLowerCase(), cls: String(el.getAttribute('class') || ''),
          fs: parseFloat(cs.fontSize), ff: cs.fontFamily, rect: { x: x0, y: y0, w: x1 - x0, h: y1 - y0 },
          hidden: hiddenChain(el) || b.width < 1 || b.height < 1 || b.right < 0 || b.bottom < 0 || b.left > W || b.top > H,
          heading: !!el.closest('h1,h2,h3,.pk-h1,.pk-h2') });
      }
      root.querySelectorAll('[data-bind]').forEach(function (el) {
        var ref = el.getAttribute('data-bind'), ok = true, expected = null;
        try { expected = String(PK.value(ref)); } catch (e) { ok = false; }
        rep.binds.push({ bind: ref, expected: expected, actual: el.textContent, ok: ok && el.textContent === expected });
        var x = ref.split('.').slice(1).some(function (k) { return k.indexOf('x_') === 0; });
        if (x) {
          var box = el.closest('.pk-x'), lab = box && box.querySelector('.pk-x-label');
          var lb = lab && lab.getBoundingClientRect();
          rep.xs.push({ bind: ref, inBox: !!box, label: lab ? { text: lab.textContent.trim(), bind: lab.getAttribute('data-bind'), visible: !hiddenChain(lab) && lb.width >= 1 && lb.height >= 1, typed: !lab.getAttribute('data-bind') } : null });
        }
      });
      root.querySelectorAll('[data-hl]').forEach(function (el) { rep.hl.push(el.getAttribute('data-hl')); });
      var all = [root].concat(Array.prototype.slice.call(root.querySelectorAll('*')));
      all.forEach(function (el) {
        ['::before', '::after'].forEach(function (p) {
          var c = getComputedStyle(el, p).content; if (c && c !== 'none' && c !== 'normal') rep.pseudo.push({ tag: el.tagName.toLowerCase(), cls: String(el.getAttribute('class') || ''), pseudo: p, content: c });
        });
      });
      // painted boxes (panels, bars, borders, images, drawings): content, not just text, stays inside the margin box
      function alpha(c) { var m = /rgba?\(([^)]+)\)/.exec(c); if (!m) return 0; var p = m[1].split(','); return p.length > 3 ? parseFloat(p[3]) : 1; }
      all.forEach(function (el) {
        if (el === root || el.closest('[data-bleed]')) return;
        var tag = el.tagName.toLowerCase(); if (el.closest('svg') && tag !== 'svg') return;
        var cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') return;
        var border = ['Top', 'Right', 'Bottom', 'Left'].some(function (s) { return parseFloat(cs['border' + s + 'Width']) > 0 && cs['border' + s + 'Style'] !== 'none' && alpha(cs['border' + s + 'Color']) > 0.02; });
        var painted = alpha(cs.backgroundColor) > 0.02 || cs.backgroundImage !== 'none' || border || tag === 'svg' || tag === 'img';
        if (!painted) return;
        var q = el.getBoundingClientRect(); if (q.width < 1 || q.height < 1) return;
        rep.boxes.push({ tag: tag, cls: String(el.getAttribute('class') || ''), rect: { x: q.x, y: q.y, w: q.width, h: q.height } });
      });
      root.querySelectorAll('.pk-page').forEach(function (p) { rep.pages.push({ scrollH: p.scrollHeight, clientH: p.clientHeight, scrollW: p.scrollWidth, clientW: p.clientWidth }); });
      root.querySelectorAll('img').forEach(function (im) { rep.imgs.push({ src: im.getAttribute('src'), ok: im.complete && im.naturalWidth > 0 }); });
    } catch (e) { rep.error = (rep.error ? rep.error + '; ' : '') + String(e && e.message || e); }
    finish();
  }, 80); });
})();`;
}

/** Measure every slide of a built project. Returns [{ id, error, texts, binds, pseudo, xs, imgs, root, hl }] in post order. */
export function measureSlides(projectDir, post) {
  const index = fs.readFileSync(path.join(projectDir, 'index.html'), 'utf8');
  const css = (index.match(/<style>([\s\S]*?)<\/style>/) || [])[1] || '';
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'post-audit-'));
  try {
    return post.slides.map((s) => {
      const comp = fs.readFileSync(path.join(projectDir, 'compositions', `${s.id}.html`), 'utf8');
      const inner = comp.replace(/^\s*<template[^>]*>/, '').replace(/<\/template>\s*$/, '');
      const styles = [...inner.matchAll(/<style[^>]*>[\s\S]*?<\/style>/g)].map((m) => m[0]).join('\n');
      const markup = inner.replace(/<style[^>]*>[\s\S]*?<\/style>/g, '').replace(/<script[\s\S]*?<\/script>/g, '');
      const page = `<!doctype html><html><head><meta charset="utf-8"><base href="${pathToFileURL(projectDir + path.sep).href}">
<style>${css}
html, body { margin: 0; width: ${W}px; height: ${H}px; overflow: hidden; background: #0b2a4a; }</style>${styles}
<script src="data.js"></script><script src="kit/post-kit.js"></script></head><body>${markup}<script>${pageScript(s.id)}</script></body></html>`;
      const file = path.join(tmp, `${s.id}.html`);
      fs.writeFileSync(file, page);
      const dom = dumpDom(file);
      const m = dom.match(/<script type="application\/json" id="pk-measure">([\s\S]*?)<\/script>/);
      if (!m) throw new Error(`audit: slide ${s.id} produced no measurement (the page did not finish loading)`);
      return JSON.parse(m[1]);
    });
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
}

const hasWord = (t) => /[\p{L}\p{N}]/u.test(t);
const ALLOWED_CONTENT = /^(""|''|counters?\(.*\))$/;
const snip = (s, n = 40) => (String(s).length > n ? `${String(s).slice(0, n)}...` : String(s));
const list = (a, n = 4) => `${a.slice(0, n).join('; ')}${a.length > n ? `; and ${a.length - n} more` : ''}`;

/**
 * Judge the measurements. Returns [{ id, ok, msg, detail }]. `post` is post.json, `measures` from measureSlides().
 * Pure: the same input gives the same result.
 */
export function judgeAudit(post, measures) {
  const out = [], push = (id, ok, msg, detail = '') => out.push({ id, ok: !!ok, msg, detail });
  const vis = (m) => m.texts.filter((t) => !t.hidden);

  // page errors first: a slide whose script threw shows nothing the other checks can trust
  const errs = measures.filter((m) => m.error).map((m) => `${m.id}: ${m.error}`);
  push('audit.load', errs.length === 0 && measures.length === post.slides.length, 'every slide loads and binds its copy', errs.join('; '));

  // typed copy: any letter or digit that is not inside a data-bind element
  const typed = [];
  for (const m of measures) for (const t of m.texts) if (!t.bind && hasWord(t.text)) typed.push(`${m.id}: "${snip(t.text)}" in <${t.tag}${t.cls ? ` class="${snip(t.cls, 30)}"` : ''}>`);
  for (const m of measures) for (const p of m.pseudo) if (!ALLOWED_CONTENT.test(p.content.trim())) typed.push(`${m.id}: ${p.pseudo} content ${snip(p.content, 30)} on <${p.tag}>`);
  for (const m of measures) for (const b of m.binds) if (!b.ok) typed.push(`${m.id}: ${b.bind} shows "${snip(b.actual)}" but post.json says "${snip(b.expected)}"`);
  push('copy.typed', typed.length === 0, 'no copy typed into slide HTML (every letter and digit comes from post.json)', list(typed));

  // unused printed data: copy that is checked but never shown
  const unused = [];
  post.slides.forEach((s, i) => {
    const m = measures[i], bound = new Set((m ? m.binds : []).map((b) => b.bind));
    for (const l of describeData(s.data, s.id).leaves) if (!l.draw && !bound.has(`${s.id}.${l.key}`)) unused.push(`${s.id}.${l.key}`);
  });
  push('copy.unused', unused.length === 0, 'every printed data key is shown on its slide (a "_" key is for drawing only)', list(unused));

  // counter-examples: bound inside a .pk-x box that carries a visible, data-bound label
  const xBad = [];
  for (const m of measures) for (const x of m.xs) {
    if (!x.inBox) xBad.push(`${x.bind} is not inside a .pk-x box`);
    else if (!x.label) xBad.push(`${x.bind}: the .pk-x box has no .pk-x-label`);
    else if (x.label.typed || !x.label.text) xBad.push(`${x.bind}: the label is empty or typed (bind it to a string such as "Not STE")`);
    else if (!x.label.visible) xBad.push(`${x.bind}: the label "${x.label.text}" is not visible`);
  }
  push('copy.labels', xBad.length === 0, 'every x_ counter-example sits in a .pk-x box with a visible label', list(xBad));

  // hidden copy is copy nobody reads
  const hidden = [];
  for (const m of measures) for (const t of m.texts) if (t.hidden && t.bind && hasWord(t.text)) hidden.push(`${m.id}: "${snip(t.text)}"`);
  push('text.visible', hidden.length === 0, 'every printed string is visible on its slide', list(hidden));

  // size: body text 38 px or more, headings 72 px or more
  const small = [];
  for (const m of measures) for (const t of vis(m)) {
    const min = t.heading ? MIN_HEAD_PX : MIN_BODY_PX;
    if (t.fs + 0.01 < min) small.push(`${m.id}: "${snip(t.text, 28)}" is ${+t.fs.toFixed(1)} px, minimum ${min}${t.heading ? ' (heading)' : ''}`);
  }
  push('text.size', small.length === 0, `text is at least ${MIN_BODY_PX} px, headings at least ${MIN_HEAD_PX} px`, list(small));

  // margin: text stays inside 70 px of every edge
  const outside = [];
  for (const m of measures) for (const t of vis(m)) {
    const { x, y, w, h } = t.rect;
    if (x < MARGIN - TOL || y < MARGIN - TOL || x + w > W - MARGIN + TOL || y + h > H - MARGIN + TOL) outside.push(`${m.id}: "${snip(t.text, 28)}" at x ${Math.round(x)}..${Math.round(x + w)}, y ${Math.round(y)}..${Math.round(y + h)}`);
  }
  push('text.margin', outside.length === 0, `text stays inside the ${MARGIN} px margin (x ${MARGIN}..${W - MARGIN}, y ${MARGIN}..${H - MARGIN})`, list(outside));

  // content, not just text: every painted box (panel, bar, border, image, drawing) stays inside the margin box, and the
  // page container does not overflow. Decorative bleed (a frame line, a glow) is marked data-bleed in the slide.
  const spill = [];
  for (const m of measures) {
    for (const b of m.boxes || []) {
      const { x, y, w, h } = b.rect;
      if (x < MARGIN - TOL || y < MARGIN - TOL || x + w > W - MARGIN + TOL || y + h > H - MARGIN + TOL) spill.push(`${m.id}: <${b.tag}${b.cls ? ` class="${snip(b.cls, 28)}"` : ''}> at x ${Math.round(x)}..${Math.round(x + w)}, y ${Math.round(y)}..${Math.round(y + h)}`);
    }
    for (const p of m.pages || []) {
      if (p.scrollH > p.clientH + TOL) spill.push(`${m.id}: the content is ${p.scrollH - p.clientH} px taller than the ${p.clientH} px page box (cut copy or shrink a part)`);
      if (p.scrollW > p.clientW + TOL) spill.push(`${m.id}: the content is ${p.scrollW - p.clientW} px wider than the ${p.clientW} px page box`);
    }
  }
  push('content.margin', spill.length === 0, `boxes and drawings stay inside the ${MARGIN} px margin; the page does not overflow`, list(spill));

  // the cover is also a grid tile: Instagram crops the profile grid to the central 3:4
  const cover = measures[0], crop = [];
  if (cover) for (const t of vis(cover)) {
    const { x, w } = t.rect;
    if (x < GRID_X0 - TOL || x + w > GRID_X1 + TOL) crop.push(`"${snip(t.text, 28)}" at x ${Math.round(x)}..${Math.round(x + w)}`);
  }
  const coverText = cover ? vis(cover).filter((t) => t.bind).length : 0;
  push('cover.grid', !!cover && crop.length === 0 && coverText > 0, `slide 1: all key text sits inside the central 3:4 area (x ${GRID_X0}..${GRID_X1})`, crop.length ? list(crop) : coverText ? '' : 'slide 1 shows no text');

  const imgBad = [];
  for (const m of measures) for (const im of m.imgs) if (!im.ok || !/^assets\//.test(im.src || '')) imgBad.push(`${m.id}: ${im.src}`);
  push('assets.images', imgBad.length === 0, 'every image is a local file from slides/assets/ and loads', list(imgBad));

  const rootBad = measures.filter((m) => !m.root || Math.abs(m.root.w - W) > 0.5 || Math.abs(m.root.h - H) > 0.5).map((m) => m.id);
  push('audit.root', rootBad.length === 0, `every slide root is ${W}x${H}`, rootBad.join(', '));
  return out;
}
