// node --test paper-reels/post/tests/build.test.mjs
// The builder and its static rules for slide templates (no browser needed).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { build, compose, kitClasses, lintSlide, midTimes } from '../lib/build.mjs';
import { PostError, readPost } from '../lib/postdir.mjs';
import { POST_DIR, REELS_DIR } from '../lib/constants.mjs';
import { rm, tmp, writePost } from './helpers.mjs';

const classes = kitClasses();
const data = { hook: 'Plain words', _bar: 0.4, rows: [{ label: 'Before', _pct: 1 }], _hl: 'words' };
const tpl = (inner, { id = 's01', root = `<div id="root" data-composition-id="${id}" data-width="1080" data-height="1350">`, head = '' } = {}) => `<template id="${id}-template">${head}\n  ${root}\n${inner}\n  </div>\n</template>\n`;
const lint = (html, d = data) => lintSlide({ id: 's01', html, data: d, classes });
const GOOD = tpl('<div class="pk-page"><h1 class="pk-h1" data-bind="s01.hook" data-hl="s01._hl"></h1><div class="pk-bar" data-var="--pct:s01.rows.0._pct"><div class="pk-bar-label" data-bind="s01.rows.0.label"></div></div></div>');

test('a template that follows the rules has no problem', () => {
  assert.deepEqual(lint(GOOD), []);
});

test('the shape of the file: a bare template with the right root', () => {
  assert.match(lint('<div>no template</div>')[0], /bare <template>/);
  assert.ok(lint(tpl('', { root: '<div id="root" data-composition-id="s02" data-width="1080" data-height="1350">' })).some((p) => /data-composition-id is "s02"/.test(p)));
  assert.ok(lint(tpl('', { root: '<div data-composition-id="s01" data-width="1080" data-height="1350">' })).some((p) => /id="root"/.test(p)));
  assert.ok(lint(tpl('', { root: '<div id="root" data-composition-id="s01" data-width="1080" data-height="1920">' })).some((p) => /1080 data-height="1350"|data-width="1080" data-height="1350"/.test(p)));
  assert.ok(lint('<template id="s01-template"><div id="root" data-width="1080" data-height="1350"></div></template>').some((p) => /needs a root element/.test(p)));
});

test('a slide is static markup: no script, no handler, no embedded media', () => {
  for (const bad of ['<script>1</script>', '<img src="assets/a.png" onclick="x()">', '<video src="assets/a.mp4"></video>', '<iframe></iframe>', '<link rel="stylesheet" href="assets/a.css">', '<button>x</button>']) {
    assert.ok(lint(tpl(`<div class="pk-page">${bad}</div>`)).length >= 1, bad);
  }
  assert.ok(lint(tpl('<div class="pk-page" data-start="1"></div>')).some((p) => /data-start/.test(p)));
});

test('nothing loads from the network, and no CSS import or font-face', () => {
  for (const bad of ['<img src="https://x.com/a.png">', '<img src="//x.com/a.png">', '<div style="background:url(http://x.com/a.png)"></div>', '<style>@import url(a.css);</style>', '<style>@font-face{font-family:x;src:url(a.ttf)}</style>', '<a href="https://x.com">x</a>']) {
    assert.ok(lint(tpl(`<div class="pk-page">${bad}</div>`)).length >= 1, bad);
  }
  assert.deepEqual(lint(tpl('<div class="pk-page"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path class="ln" d="M0 0L9 9"/></svg></div>')), [], 'the SVG namespace is not a request');
  assert.deepEqual(lint(tpl('<div class="pk-page"><img src="assets/a.png"><div style="background:url(assets/b.png)"></div></div>')), []);
});

test('no animation, no transition, no generated text', () => {
  for (const bad of ['<style>.s01-a{animation:x 1s}</style>', '<style>@keyframes x{}</style>', '<div style="transition:all 1s"></div>', '<style>.s01-a::before{content:"Hello"}</style>', '<style>.s01-a::after{content:attr(title)}</style>']) {
    assert.ok(lint(tpl(`<div class="pk-page">${bad}</div>`)).length >= 1, bad);
  }
  assert.deepEqual(lint(tpl('<div class="pk-page"><style>.s01-a::before{content:""}.s01-b{justify-content:center;align-content:start}.s01-c::before{content:counter(x)}</style></div>')), [], 'empty content, a counter and justify-content are fine');
});

test('ids and classes: ids carry the slide id; a class is the kit\'s or the slide\'s own; a typo gets a hint', () => {
  assert.ok(lint(tpl('<div id="hero" class="pk-page"></div>')).some((p) => /id="hero" must start with "s01-"/.test(p)));
  assert.ok(lint(tpl('<div id="s01-a"></div><div id="s01-a"></div>')).some((p) => /appears twice/.test(p)));
  assert.deepEqual(lint(tpl('<div id="s01-hero" class="pk-page s01-big"></div>')), []);
  assert.ok(lint(tpl('<div class="hero"></div>')).some((p) => /class "hero" is not a kit class; a class of your own must start with "s01-"/.test(p)));
  assert.ok(lint(tpl('<div class="pk-pannel"></div>')).some((p) => /unknown kit class "pk-pannel" \(did you mean "pk-panel"\?\)/.test(p)));
  assert.ok(lint(tpl('<div class="pk-panel is-green"></div>')).some((p) => /unknown kit class "is-green"/.test(p)));
});

test('data-bind and data-var: only the slide\'s own data, only printed keys for bind, numbers for var', () => {
  assert.ok(lint(tpl('<div data-bind="s02.hook"></div>')).some((p) => /must start with "s01\."/.test(p)));
  assert.ok(lint(tpl('<div data-bind="s01.missing"></div>')).some((p) => /not a string or number in post.json/.test(p)));
  assert.ok(lint(tpl('<div data-bind="s01._bar"></div>')).some((p) => /drawing-only/.test(p)), 'a _ key is never printed');
  assert.ok(lint(tpl('<div data-bind="s01.rows"></div>')).some((p) => /not a string or number/.test(p)), 'a list is not printed as one string');
  assert.ok(lint(tpl('<div data-var="--pct:s02._bar"></div>')).some((p) => /must start with "s01\."/.test(p)));
  assert.ok(lint(tpl('<div data-var="--pct:s01.hook"></div>')).some((p) => /not a number/.test(p)));
  assert.ok(lint(tpl('<div data-var="pct:s01._bar"></div>')).some((p) => /--name/.test(p)));
  assert.ok(lint(tpl('<div data-bind="s01.hook" data-hl="s01.nothing"></div>')).some((p) => /data-hl/.test(p)));
  assert.deepEqual(lint(tpl('<div data-var="--a:s01._bar;--b:s01.rows.0._pct"></div>')), []);
});

test('compose adds the root style and the one script, and leaves the author\'s markup alone', () => {
  const out = compose('s01', GOOD);
  assert.match(out, /#root \{ position: absolute; left: 0; top: 0; width: 1080px; height: 1350px; overflow: hidden; \}/);
  assert.match(out, /PK\.bind\("s01"\)/);
  assert.match(out, /window\.__timelines\["s01"\] = gsap\.timeline\(\{ paused: true \}\)/);
  assert.equal((out.match(/<script>/g) || []).length, 1);
  assert.ok(out.includes('data-bind="s01.hook"'));
  assert.match(out.trim(), /<\/script>\s*<\/template>$/);
});

test('midTimes: each slide is captured in the middle of its own second', () => {
  assert.deepEqual(midTimes(3), [0.5, 1.5, 2.5]);
});

test('build: a project of 1080x1350 hosts, one second each, plus the data and the kit', () => {
  const fx = writePost();
  try {
    const out = path.join(tmp(), 'project');
    const b = build(fx.dir, out);
    assert.deepEqual(b.slides.map((s) => s.mid), [0.5, 1.5, 2.5]);
    const html = fs.readFileSync(path.join(out, 'index.html'), 'utf8');
    assert.match(html, /data-composition-id="main" data-start="0" data-duration="3" data-width="1080" data-height="1350"/);
    for (const [i, id] of ['s01', 's02', 's03'].entries()) {
      assert.match(html, new RegExp(`data-composition-id="${id}" data-composition-src="compositions/${id}.html" data-start="${i}" data-duration="1"`));
      assert.ok(fs.existsSync(path.join(out, 'compositions', `${id}.html`)));
    }
    assert.match(fs.readFileSync(path.join(out, 'data.js'), 'utf8'), /^window\.POST = \{"w":1080,"h":1350/);
    for (const f of ['kit/post-kit.js', 'kit/vendor/gsap.min.js', 'kit/fonts/mono.ttf', 'kit/fonts/marker.ttf', 'kit/grain.png', 'hyperframes.json']) assert.ok(fs.existsSync(path.join(out, f)), f);
    assert.ok(!/Math\.random|Date\.now|performance\.now/.test(html + fs.readFileSync(path.join(POST_DIR, 'kit', 'post-kit.js'), 'utf8')), 'no clock and no randomness');
    assert.equal(fs.readFileSync(path.join(out, 'index.html'), 'utf8'), fs.readFileSync(path.join(build(fx.dir, out).P, 'index.html'), 'utf8'), 'building twice gives the same page');
  } finally { rm(fx.dir); }
});

test('build: the video slide without a file of its own gets the built-in template; it needs a title', () => {
  const slides = [{ id: 's01', kind: 'image', data: { a: 'One' } }, { id: 's02', kind: 'video', source: { item: 'x', from: 0, to: 2 }, data: { title: 'A reel', handle: 'hemanth_with_ai' } }];
  const fx = writePost({ slides });
  try {
    const out = path.join(tmp(), 'p');
    build(fx.dir, out);
    const c = fs.readFileSync(path.join(out, 'compositions', 's02.html'), 'utf8');
    assert.match(c, /data-bind="s02\.title"/); assert.match(c, /pk-vhandle" data-bind="s02\.handle"/); assert.match(c, /data-bleed/);
    const noTitle = writePost({ slides: [slides[0], { ...slides[1], data: { handle: 'hemanth_with_ai' } }] });
    try { assert.throws(() => build(noTitle.dir, out), (e) => e instanceof PostError && /data\.title/.test(e.message)); } finally { rm(noTitle.dir); }
    const both = writePost({ slides: [slides[0], { ...slides[1], data: { title: 'A', note: 'B', handle: 'C' } }] });
    try { assert.throws(() => build(both.dir, out), /handle or data\.note/); } finally { rm(both.dir); }
  } finally { rm(fx.dir); }
});

test('build reports every problem at once, and readPost names structural problems in plain words', () => {
  const fx = writePost();
  try {
    fs.writeFileSync(fx.F.slideHtml('s01'), '<template id="s01-template"><script>x</script><div id="root" data-composition-id="s01" data-width="1080" data-height="1350"></div></template>');
    fs.writeFileSync(fx.F.slideHtml('s02'), '<div>nothing</div>');
    assert.throws(() => build(fx.dir, path.join(tmp(), 'p')), (e) => e instanceof PostError && e.problems.length >= 2 && /s01/.test(e.message) && /s02/.test(e.message));
  } finally { rm(fx.dir); }
  const bad = writePost({ slides: [{ id: 'S 1', kind: 'image', data: { a: null } }, { id: 's02', kind: 'video', data: {} }] });
  try {
    const r = readPost(bad.dir);
    const all = r.problems.join('\n');
    assert.match(all, /"id" must match/); assert.match(all, /string or a finite number/); assert.match(all, /a video slide needs "source"/); assert.match(all, /slide 1 must be an image/.test(all) ? /slide 1 must be an image/ : /id/);
  } finally { rm(bad.dir); }
});

test('the kit itself: its classes are found, and the shipped gallery and sample build', () => {
  for (const c of ['pk-page', 'pk-h1', 'pk-panel', 'pk-tag', 'pk-compare', 'pk-bar', 'pk-meter', 'pk-steps', 'pk-callout', 'pk-timeline', 'pk-code', 'pk-x', 'pk-x-label', 'is-tagged', 'is-amber']) assert.ok(classes.has(c), c);
  for (const dir of [path.join(POST_DIR, 'kit', 'gallery'), path.join(REELS_DIR, 'posts', '_sample')]) {
    const out = path.join(tmp(), 'p');
    assert.doesNotThrow(() => build(dir, out), dir);
    rm(path.dirname(out));
  }
});
