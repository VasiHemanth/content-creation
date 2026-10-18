// node --test paper-reels/post/tests/audit-browser.test.mjs
// The measuring half of the audit, in the real headless Chrome (the one HyperFrames uses): what the page shows for slides
// built from the kit, and for slides that break the rules. About a second per page.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { build } from '../lib/build.mjs';
import { judgeAudit, measureSlides } from '../lib/audit.mjs';
import { rm, tmp, writePost } from './helpers.mjs';

// tests exercise the gate itself, so they switch it on whatever hf/ste.json says
import { PROFILE as STE_PROFILE } from '../../hf/bin/ste.mjs';
STE_PROFILE.enforce = true;
const tpl = (id, inner, style = '') => `<template id="${id}-template">${style ? `\n  <style>${style}</style>` : ''}
  <div id="root" data-composition-id="${id}" data-width="1080" data-height="1350">
    <div class="pk-page">
${inner}
    </div>
  </div>
</template>
`;

/** Build a post from the given slide specs, optionally edit the built compositions, measure in Chrome, judge. */
function audit(specs, { edit } = {}) {
  const slides = specs.map((s) => ({ id: s.id, kind: 'image', data: s.data, html: tpl(s.id, s.inner, s.style) }));
  const fx = writePost({ slides });
  const out = path.join(tmp('post-audit-test-'), 'project');
  try {
    const { P, post } = build(fx.dir, out);
    if (edit) for (const [id, fn] of Object.entries(edit)) { const f = path.join(P, 'compositions', `${id}.html`); fs.writeFileSync(f, fn(fs.readFileSync(f, 'utf8'))); }
    const m = measureSlides(P, post);
    return { m, by: Object.fromEntries(judgeAudit(post, m).map((r) => [r.id, r])) };
  } finally { rm(fx.dir); rm(path.dirname(out)); }
}

const ok = (by) => Object.values(by).filter((r) => !r.ok).map((r) => `${r.id}: ${r.detail}`);
const s1 = { id: 's01', data: { hook: 'Plain words give clear steps', sub: 'One idea in each sentence.' }, inner: '<h1 class="pk-h1" data-bind="s01.hook"></h1><div class="pk-body" data-bind="s01.sub"></div>' };
const s2 = { id: 's02', data: { a: 'The operator edits the file.' }, inner: '<div class="pk-body" data-bind="s02.a"></div>' };

test('slides built from the kit pass every rule, and the measurements are real boxes', () => {
  const { m, by } = audit([s1, s2]);
  assert.deepEqual(ok(by), []);
  const h = m[0].texts.find((t) => t.bind === 's01.hook');
  assert.equal(h.heading, true); assert.ok(h.fs >= 72);
  assert.ok(h.rect.x >= 69 && h.rect.y >= 69, `box ${JSON.stringify(h.rect)}`);
  assert.equal(m[0].root.w, 1080); assert.equal(m[0].root.h, 1350);
});

test('typed text and digits are found; so are generated text, a changed bound text and small text', () => {
  const typed = audit([{ ...s1, inner: `${s1.inner}<div class="pk-body">Typed 42</div>` }, s2]);
  assert.equal(typed.by['copy.typed'].ok, false);
  assert.match(typed.by['copy.typed'].detail, /Typed 42/);
  const gen = audit([s1, s2], { edit: { s02: (h) => h.replace('</style>', '.pk-body::before{content:"Hello"}</style>').replace('<style>#root', '<style>.pk-body::before{content:"Hello"}#root') } });
  assert.equal(gen.by['copy.typed'].ok, false);
  const small = audit([s1, { ...s2, inner: '<div class="pk-body" style="font-size:30px" data-bind="s02.a"></div>' }]);
  assert.equal(small.by['text.size'].ok, false);
  const head = audit([{ ...s1, inner: '<h1 class="pk-h1" style="font-size:60px" data-bind="s01.hook"></h1><div class="pk-body" data-bind="s01.sub"></div>' }, s2]);
  assert.match(head.by['text.size'].detail, /minimum 72 \(heading\)/);
});

test('margins: text, a painted box, and a page that overflows are all caught; data-bleed is allowed', () => {
  const text = audit([s1, { ...s2, inner: '<div class="pk-body" style="position:absolute;left:-60px;top:0" data-bind="s02.a"></div>' }]);
  assert.equal(text.by['text.margin'].ok, false);
  const box = audit([s1, { ...s2, inner: `${s2.inner}<div style="position:absolute;left:0;top:1000px;width:300px;height:340px;background:#fff"></div>` }]);
  assert.equal(box.by['content.margin'].ok, false);
  assert.match(box.by['content.margin'].detail, /y 1070\.\.1410|y 1070/);
  const bleed = audit([s1, { ...s2, inner: `${s2.inner}<div data-bleed style="position:absolute;left:-70px;top:930px;width:1080px;height:420px;background:#fff"></div>` }]);
  assert.equal(bleed.by['content.margin'].ok, true, bleed.by['content.margin'].detail);
  const tall = audit([s1, { ...s2, inner: `${s2.inner}<div style="height:1300px"></div>` }]);
  assert.match(tall.by['content.margin'].detail, /taller than the 1210 px page box/);
});

test('the cover: text outside the central 3:4 area fails slide 1 only', () => {
  const wide = audit([{ ...s1, inner: `<div class="pk-body" style="position:absolute;left:-40px;top:0;width:500px" data-bind="s01.hook"></div><div class="pk-body" data-bind="s01.sub"></div>` }, s2]);
  assert.equal(wide.by['cover.grid'].ok, false);
  const other = audit([s1, { ...s2, inner: '<div class="pk-body" style="position:absolute;left:-40px;top:0" data-bind="s02.a"></div>' }]);
  assert.equal(other.by['cover.grid'].ok, true);
  assert.equal(other.by['text.margin'].ok, false, 'but the margin rule still applies on every slide');
});

test('counter-examples: the label is found when it is there and visible, and missing or hidden labels fail', () => {
  const x = { id: 's02', data: { x_a: 'The file was edited.', tag: 'Not STE' } };
  const good = audit([s1, { ...x, inner: '<div class="pk-x"><div class="pk-x-label" data-bind="s02.tag"></div><p class="pk-x-text" data-bind="s02.x_a"></p></div>' }]);
  assert.equal(good.by['copy.labels'].ok, true, good.by['copy.labels'].detail);
  const none = audit([s1, { ...x, data: { x_a: 'The file was edited.' }, inner: '<div class="pk-x"><p class="pk-x-text" data-bind="s02.x_a"></p></div>' }]);
  assert.equal(none.by['copy.labels'].ok, false);
  const out = audit([s1, { ...x, inner: '<div class="pk-body" data-bind="s02.tag"></div><p class="pk-x-text" data-bind="s02.x_a"></p>' }]);
  assert.match(out.by['copy.labels'].detail, /not inside a \.pk-x box/);
  const hidden = audit([s1, { ...x, inner: '<div class="pk-x"><div class="pk-x-label" style="display:none" data-bind="s02.tag"></div><p class="pk-x-text" data-bind="s02.x_a"></p></div>' }]);
  assert.equal(hidden.by['copy.labels'].ok, false);
  assert.equal(hidden.by['text.visible'].ok, false, 'a hidden printed string is reported too');
});

test('unused data is found; a _ key drives a bar through data-var and is never shown', () => {
  const unused = audit([s1, { id: 's02', data: { a: 'One', b: 'Two' }, inner: '<div class="pk-body" data-bind="s02.a"></div>' }]);
  assert.equal(unused.by['copy.unused'].ok, false);
  assert.match(unused.by['copy.unused'].detail, /s02\.b/);
  const bar = audit([s1, { id: 's02', data: { label: 'Before', _pct: 0.25 }, inner: '<div class="pk-bar" data-var="--pct:s02._pct"><div class="pk-bar-label" data-bind="s02.label"></div><div class="pk-bar-track"><i class="pk-bar-fill"></i></div></div>' }]);
  assert.deepEqual(ok(bar.by), []);
});

test('vertical text (the video slide gutters) is measured as a real box inside the margin', () => {
  const { m, by } = audit([s1, { id: 's02', data: { title: 'The same plain style' }, inner: '<div class="pk-vlabel pk-vleft" data-bind="s02.title"></div>' }]);
  const t = m[1].texts[0];
  assert.ok(t.rect.h > t.rect.w, `vertical text is taller than wide: ${JSON.stringify(t.rect)}`);
  assert.deepEqual(ok(by), []);
});

test('a script error in the page is reported, not swallowed', () => {
  const { by } = audit([s1, s2], { edit: { s02: (h) => h.replace('PK.bind("s02")', 'PK.bind("s02"); PK.value("s02.nothing")') } });
  assert.equal(by['audit.load'].ok, false);
});
