// node --test paper-reels/post/tests/audit.test.mjs
// The DOM audit rules (judgeAudit) on hand-made measurements, so each rule is tested without a browser. The measuring half
// runs in headless Chrome and is exercised by the end-to-end test and by `post.mjs qa`.
import test from 'node:test';
import assert from 'node:assert/strict';
import { judgeAudit } from '../lib/audit.mjs';
import { describeData } from '../lib/data.mjs';

const mkPost = (...datas) => ({ slides: datas.map((data, i) => ({ id: `s0${i + 1}`, kind: 'image', alt: 'x', data })) });

/** A clean measurement of a slide: every printed leaf is bound, visible, 44 px and inside the margin. */
function clean(s) {
  const leaves = describeData(s.data, s.id).leaves.filter((l) => !l.draw);
  return {
    id: s.id, error: null, root: { x: 0, y: 0, w: 1080, h: 1350 },
    texts: leaves.map((l, i) => ({ text: String(l.value), bind: `${s.id}.${l.key}`, tag: 'div', cls: 'pk-body', fs: 44, rect: { x: 70, y: 100 + i * 60, w: 600, h: 52 }, hidden: false, heading: false })),
    binds: leaves.map((l) => ({ bind: `${s.id}.${l.key}`, expected: String(l.value), actual: String(l.value), ok: true })),
    pseudo: [], xs: [], imgs: [], hl: [], boxes: [], pages: [{ scrollH: 1210, clientH: 1210, scrollW: 940, clientW: 940 }],
  };
}
const run = (post, edit = () => {}) => {
  const m = post.slides.map(clean);
  edit(m);
  return Object.fromEntries(judgeAudit(post, m).map((r) => [r.id, r]));
};
const post = mkPost({ hook: 'Plain words' }, { a: 'One', b: 'Two' }, { end: 'Done' });

test('a clean measurement passes every rule', () => {
  const r = run(post);
  for (const c of Object.values(r)) assert.equal(c.ok, true, `${c.id}: ${c.detail}`);
});

test('copy.typed: a letter or digit outside a data-bind element fails; punctuation and symbols do not', () => {
  assert.equal(run(post, (m) => m[0].texts.push({ text: 'Typed words', bind: null, tag: 'div', cls: '', fs: 44, rect: { x: 70, y: 700, w: 100, h: 50 }, hidden: false }))['copy.typed'].ok, false);
  assert.equal(run(post, (m) => m[0].texts.push({ text: '42', bind: null, tag: 'span', cls: '', fs: 44, rect: { x: 70, y: 700, w: 100, h: 50 }, hidden: false }))['copy.typed'].ok, false);
  assert.equal(run(post, (m) => m[0].texts.push({ text: '→ · ×', bind: null, tag: 'span', cls: '', fs: 44, rect: { x: 70, y: 700, w: 100, h: 50 }, hidden: false }))['copy.typed'].ok, true);
});

test('copy.typed: generated content in CSS fails, a counter() does not; a bound element whose text changed fails', () => {
  assert.equal(run(post, (m) => m[1].pseudo.push({ tag: 'li', cls: 'x', pseudo: '::before', content: '"New!"' }))['copy.typed'].ok, false);
  assert.equal(run(post, (m) => m[1].pseudo.push({ tag: 'li', cls: 'x', pseudo: '::before', content: 'counter(pk-step)' }))['copy.typed'].ok, true);
  assert.equal(run(post, (m) => m[1].pseudo.push({ tag: 'li', cls: 'x', pseudo: '::before', content: '""' }))['copy.typed'].ok, true);
  assert.equal(run(post, (m) => { m[1].binds[0].ok = false; m[1].binds[0].actual = 'Other'; })['copy.typed'].ok, false);
});

test('copy.unused: printed data that no element shows fails; a _ key does not need to be shown', () => {
  const r = run(post, (m) => { m[1].binds = m[1].binds.slice(1); });
  assert.equal(r['copy.unused'].ok, false);
  assert.match(r['copy.unused'].detail, /s02\.a/);
  assert.equal(run(mkPost({ hook: 'Plain', _bar: 0.4 }, { a: 'x' }))['copy.unused'].ok, true);
});

test('text.size: body text under 38 px fails, a heading under 72 px fails, and the numbers are in the message', () => {
  const small = run(post, (m) => { m[1].texts[0].fs = 30; });
  assert.equal(small['text.size'].ok, false);
  assert.match(small['text.size'].detail, /30 px, minimum 38/);
  const head = run(post, (m) => { m[0].texts[0].heading = true; m[0].texts[0].fs = 60; });
  assert.match(head['text.size'].detail, /minimum 72 \(heading\)/);
  assert.equal(run(post, (m) => { m[0].texts[0].heading = true; m[0].texts[0].fs = 72; m[1].texts[0].fs = 38; })['text.size'].ok, true);
  assert.equal(run(post, (m) => { m[1].texts[0].fs = 30; m[1].texts[0].hidden = true; })['text.size'].ok, true, 'hidden text is judged by text.visible instead');
});

test('text.margin: text outside the 70 px margin fails on every side', () => {
  for (const rect of [{ x: 60, y: 100, w: 100, h: 50 }, { x: 70, y: 60, w: 100, h: 50 }, { x: 950, y: 100, w: 100, h: 50 }, { x: 70, y: 1260, w: 100, h: 50 }]) {
    assert.equal(run(post, (m) => { m[1].texts[0].rect = rect; })['text.margin'].ok, false, JSON.stringify(rect));
  }
  assert.equal(run(post, (m) => { m[1].texts[0].rect = { x: 69.5, y: 70, w: 940.5, h: 100 }; })['text.margin'].ok, true, 'a pixel of slack for text metrics');
});

test('content.margin: a painted box outside the margin fails, and so does an overflowing page', () => {
  const spill = run(post, (m) => m[1].boxes.push({ tag: 'div', cls: 'pk-bar-track', rect: { x: 70, y: 1283, w: 940, h: 46 } }));
  assert.equal(spill['content.margin'].ok, false);
  assert.match(spill['content.margin'].detail, /pk-bar-track/);
  const over = run(post, (m) => { m[1].pages = [{ scrollH: 1259, clientH: 1210, scrollW: 940, clientW: 940 }]; });
  assert.match(over['content.margin'].detail, /49 px taller/);
  assert.equal(run(post, (m) => m[1].boxes.push({ tag: 'div', cls: 'ok', rect: { x: 70, y: 70, w: 940, h: 1210 } }))['content.margin'].ok, true);
});

test('cover.grid: slide 1 text must sit inside the central 3:4 area; other slides are not held to it', () => {
  assert.equal(run(post, (m) => { m[0].texts[0].rect = { x: 20, y: 100, w: 300, h: 60 }; })['cover.grid'].ok, false);
  assert.equal(run(post, (m) => { m[0].texts[0].rect = { x: 900, y: 100, w: 200, h: 60 }; })['cover.grid'].ok, false);
  assert.equal(run(post, (m) => { m[0].texts[0].rect = { x: 34, y: 100, w: 1012, h: 60 }; })['cover.grid'].ok, true);
  assert.equal(run(post, (m) => { m[1].texts[0].rect = { x: 20, y: 100, w: 300, h: 60 }; })['cover.grid'].ok, true);
  assert.equal(run(post, (m) => { m[0].texts = []; })['cover.grid'].ok, false, 'a cover with no text is not a readable cover');
});

const xpost = mkPost({ hook: 'Plain' }, { x_before: 'Long text', tag: 'Not STE' }, { end: 'Done' });
const x = (edit) => run(xpost, (m) => { m[1].xs = [{ bind: 's02.x_before', inBox: true, label: { text: 'Not STE', bind: 's02.tag', visible: true, typed: false } }]; edit(m[1].xs[0]); });

test('copy.labels: an x_ example needs a .pk-x box and a visible, bound, non-empty label', () => {
  assert.equal(x(() => {})['copy.labels'].ok, true);
  assert.equal(x((e) => { e.inBox = false; })['copy.labels'].ok, false);
  assert.equal(x((e) => { e.label = null; })['copy.labels'].ok, false);
  assert.equal(x((e) => { e.label.visible = false; })['copy.labels'].ok, false);
  assert.equal(x((e) => { e.label.typed = true; })['copy.labels'].ok, false);
  assert.equal(x((e) => { e.label.text = ''; })['copy.labels'].ok, false);
});

test('text.visible: printed text that is hidden fails', () => {
  assert.equal(run(post, (m) => { m[1].texts[0].hidden = true; })['text.visible'].ok, false);
});

test('audit.load, assets.images and audit.root report a page error, a missing image and a wrong root', () => {
  assert.equal(run(post, (m) => { m[1].error = 'PK: s02.zz is not in post.json'; })['audit.load'].ok, false);
  assert.equal(run(post, (m) => m[1].imgs.push({ src: 'assets/a.png', ok: false }))['assets.images'].ok, false);
  assert.equal(run(post, (m) => m[1].imgs.push({ src: 'https://x/a.png', ok: true }))['assets.images'].ok, false);
  assert.equal(run(post, (m) => m[1].imgs.push({ src: 'assets/a.png', ok: true }))['assets.images'].ok, true);
  assert.equal(run(post, (m) => { m[1].root.w = 1000; })['audit.root'].ok, false);
});
