// node --test paper-reels/post/tests/qa.test.mjs
// The source gates (qa.mjs) on scratch posts. The page measurement is replaced by a clean stand-in, so these tests cover the
// rest: structure, facts, STE, branding, the label, video sources, and "a gate that cannot run is not a pass".
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { CHECKS, checkBrand, checkVideoSources, runQa } from '../lib/qa.mjs';
import { describeData } from '../lib/data.mjs';
import { rm, tmp, writePost } from './helpers.mjs';

// tests exercise the gate itself, so they switch it on whatever hf/ste.json says
import { PROFILE as STE_PROFILE } from '../../hf/bin/ste.mjs';
STE_PROFILE.enforce = true;
function cleanMeasure(_P, post) {
  return post.slides.map((s) => {
    const leaves = describeData(s.data, s.id).leaves.filter((l) => !l.draw);
    return {
      id: s.id, error: null, root: { x: 0, y: 0, w: 1080, h: 1350 },
      texts: leaves.map((l, i) => ({ text: String(l.value), bind: `${s.id}.${l.key}`, tag: 'div', cls: 'pk-body', fs: 44, rect: { x: 70, y: 100 + i * 60, w: 600, h: 52 }, hidden: false, heading: false })),
      binds: leaves.map((l) => ({ bind: `${s.id}.${l.key}`, expected: String(l.value), actual: String(l.value), ok: true })),
      xs: leaves.filter((l) => l.example).map((l) => ({ bind: `${s.id}.${l.key}`, inBox: true, label: { text: 'Not STE', bind: 'x', visible: true, typed: false } })),
      pseudo: [], imgs: [], hl: [], boxes: [], pages: [],
    };
  });
}
const qa = (fx, opts = {}) => {
  const out = tmp('post-qa-');
  try { const r = runQa(fx.dir, { projectDir: path.join(out, 'project'), measure: cleanMeasure, ...opts }); return { ...r, by: Object.fromEntries(r.results.map((x) => [x.id, x])) }; } finally { rm(out); }
};
const withFx = (opts, fn) => { const fx = writePost(opts); try { fn(fx); } finally { rm(fx.dir); } };
const slides = (...d) => d.map((data, i) => ({ id: `s0${i + 1}`, kind: 'image', data }));
const GOOD = [{ hook: 'Plain words', label: 'Unofficial guide' }, { text: 'The operator edits the file.' }, { line: 'Plain steps.', handle: 'hemanth_with_ai' }];

test('a good post passes every source gate, and the report lists every check once', () => {
  withFx({ slides: slides(...GOOD) }, (fx) => {
    const r = qa(fx);
    assert.deepEqual(r.results.filter((x) => !x.ok).map((x) => `${x.id}: ${x.detail}`), []);
    assert.deepEqual(r.results.map((x) => x.id), CHECKS);
  });
});

test('an invalid post.json fails structure and SKIPS every other gate (a skipped gate is a failure, not a pass)', () => {
  const fx = writePost();
  try {
    fs.writeFileSync(fx.F.post, JSON.stringify({ kind: 'post', format: '4x5', item: 'x', name: 'x', slides: [] }));
    const r = qa(fx);
    assert.equal(r.by['post.structure'].ok, false);
    for (const id of CHECKS.filter((x) => x !== 'post.structure')) { assert.equal(r.by[id].skipped, true, id); assert.equal(r.by[id].ok, false, id); }
  } finally { rm(fx.dir); }
});

test('facts: a printed number that is not in facts.json fails, and a facts entry without a source fails', () => {
  withFx({ slides: slides(GOOD[0], { text: 'The file has 12 lines.' }, GOOD[2]) }, (fx) => {
    const r = qa(fx);
    assert.equal(r.by['copy.facts'].ok, false);
    assert.match(r.by['copy.facts'].detail, /s02\.text: 12/);
  });
  withFx({ slides: slides(GOOD[0], { text: 'The file has 12 lines.' }, GOOD[2]), facts: { numbers: { 12: 'counted in the file' } } }, (fx) => assert.equal(qa(fx).by['copy.facts'].ok, true));
  withFx({ slides: slides(...GOOD), facts: { numbers: { 12: '' } } }, (fx) => assert.equal(qa(fx).by['files.facts'].ok, false));
  withFx({ slides: slides(...GOOD), facts: { nope: 1 } }, (fx) => assert.equal(qa(fx).by['files.facts'].ok, false));
});

test('sources.json: a missing file, a bad URL and a missing date all fail', () => {
  for (const sources of [[{ url: 'ftp://x', supports: 'a', accessed: '2026-10-08' }], [{ url: 'https://x.org', supports: '', accessed: '2026-10-08' }], [{ url: 'https://x.org', supports: 'a' }], 'oops']) {
    withFx({ slides: slides(...GOOD), sources }, (fx) => assert.equal(qa(fx).by['files.sources'].ok, false, JSON.stringify(sources)));
  }
  withFx({ slides: slides(...GOOD), sources: [{ url: 'https://x.org/a', supports: 'a claim', accessed: '2026-10-08' }] }, (fx) => assert.equal(qa(fx).by['files.sources'].ok, true));
  withFx({ slides: slides(...GOOD) }, (fx) => { fs.rmSync(fx.F.sources); assert.equal(qa(fx).by['files.sources'].ok, false); });
});

test('STE: a hard finding fails copy.ste; an undeclared x_ example fails copy.examples', () => {
  withFx({ slides: slides(GOOD[0], { text: 'The file was edited by the operator.' }, GOOD[2]) }, (fx) => {
    const r = qa(fx);
    assert.equal(r.by['copy.ste'].ok, false);
    assert.match(r.by['copy.ste'].detail, /passive/);
  });
  withFx({ slides: slides(GOOD[0], { x_text: 'The file was edited by the operator.' }, GOOD[2]) }, (fx) => {
    const r = qa(fx);
    assert.equal(r.by['copy.examples'].ok, false);
    assert.match(r.by['copy.examples'].detail, /without a valid declaration/);
  });
  withFx({ slides: slides(GOOD[0], { x_text: 'The file was edited by the operator.' }, GOOD[2]), ste: { examples: [{ slide: 's02', key: 'x_text', why: 'passive voice, shown on purpose' }] } }, (fx) => {
    const r = qa(fx);
    assert.equal(r.by['copy.ste'].ok, true); assert.equal(r.by['copy.examples'].ok, true);
  });
});

test('branding: the handle on the last slide only, no other identity, no other mention', () => {
  const p = (...d) => ({ slides: d.map((data, i) => ({ id: `s0${i + 1}`, data })) });
  assert.deepEqual(checkBrand(p({ a: 'x' }, { b: 'y' }, { handle: 'hemanth_with_ai' })), []);
  assert.ok(checkBrand(p({ a: 'x' }, { b: 'y' }, { handle: 'someone' })).some((x) => /must print hemanth_with_ai/.test(x)));
  assert.ok(checkBrand(p({ handle: 'hemanth_with_ai' }, { b: 'y' }, { handle: 'hemanth_with_ai' })).some((x) => /last slide only/.test(x)));
  for (const bad of ['Follow on Instagram', 'my YouTube', 'see Threads', 'by hemanthvasi', 'ask @someone']) {
    assert.ok(checkBrand(p({ a: bad }, { b: 'y' }, { handle: 'hemanth_with_ai' })).length >= 1, bad);
  }
  assert.deepEqual(checkBrand(p({ a: 'x' }, { b: 'y' }, { handle: '@hemanth_with_ai' })), [], 'the handle may be written with an @');
  withFx({ slides: slides(GOOD[0], GOOD[1], { line: 'Plain steps.' }) }, (fx) => assert.equal(qa(fx).by['brand.identity'].ok, false));
});

test('the "unofficial guide" label has to be printed on some slide', () => {
  withFx({ slides: slides({ hook: 'Plain words' }, GOOD[1], GOOD[2]) }, (fx) => assert.equal(qa(fx).by['brand.label'].ok, false));
  withFx({ slides: slides({ hook: 'Plain words' }, { t: 'An Unofficial Guide to steps' }, GOOD[2]) }, (fx) => assert.equal(qa(fx).by['brand.label'].ok, true));
});

test('a page audit that cannot run skips its checks; so does a static rule violation', () => {
  withFx({ slides: slides(...GOOD) }, (fx) => {
    const r = qa(fx, { measure: () => { throw new Error('chrome did not start'); } });
    for (const id of ['audit.load', 'copy.typed', 'text.size', 'content.margin', 'cover.grid']) { assert.equal(r.by[id].skipped, true, id); assert.match(r.by[id].detail, /chrome did not start/); }
    assert.equal(r.by['copy.ste'].ok, true, 'the gates that do not need the browser still ran');
  });
  withFx({ slides: slides(...GOOD) }, (fx) => {
    fs.writeFileSync(fx.F.slideHtml('s02'), fs.readFileSync(fx.F.slideHtml('s02'), 'utf8').replace('<div class="pk-page">', '<div class="pk-page"><script>alert(1)</script>'));
    const r = qa(fx);
    assert.equal(r.by['build.static'].ok, false);
    assert.equal(r.by['copy.typed'].skipped, true, 'nothing was built, so nothing was measured');
  });
});

// ---- video sources (database and reel timeline are injected) ----

const vpost = { slides: [{ id: 's01', kind: 'image', data: { a: 'x' } }, { id: 's02', kind: 'video', source: { item: '2609.14858', from: 31.23, to: 38.6 }, data: { title: 'T', handle: 'hemanth_with_ai' } }, { id: 's03', kind: 'image', data: { b: 'y' } }] };
const reel = (over = {}) => ({ epDir: '/x', total: 78, order: ['l05', 'l06', 'l09', 'l12'],
  scenes: { tree: { start: 23.9, dur: 15, lines: ['l05', 'l06'], transition: 'blur', tdur: 0.55 }, results: { start: 50.9, dur: 15.3, lines: ['l09'], transition: 'whip', tdur: 0.32 }, close: { start: 73.6, dur: 5, lines: ['l12'], transition: 'cut', tdur: 0 } },
  lines: { l05: { text: 'The tree grows.', data: { a: 'tree' } }, l06: { text: 'No new runs.', data: {} }, l09: { text: 'It used 317 attempts.', data: { value: '317' } }, l12: { text: 'Old work is not waste.', data: { handle: 'hemanth_with_ai', _hidden: '99' } } }, ...over });
const here = fs.existsSync(import.meta.filename) ? import.meta.filename : '';
const deps = (over = {}) => ({ episode: () => ({ video_path: here }), timeline: () => reel(), info: () => ({ duration: 78.6 }), ...over });
const vid = (post, table, d) => checkVideoSources(post, table, d);

test('video sources: a reel that is registered, long enough and shows nothing unlisted passes', () => {
  assert.deepEqual(vid(vpost, {}, deps()), []);
});

test('video sources: no registered reel, a missing file, an excerpt past the end, no timeline: each fails with a reason', () => {
  assert.match(vid(vpost, {}, deps({ episode: () => null }))[0], /no registered 9x16 episode/);
  assert.match(vid(vpost, {}, deps({ episode: () => ({ video_path: '/nope/final.mp4' }) }))[0], /does not exist/);
  assert.match(vid(vpost, {}, deps({ episode: () => { throw new Error('database not found: /x'); } }))[0], /database not found/);
  assert.match(vid({ slides: [vpost.slides[0], { ...vpost.slides[1], source: { item: 'a', from: 70, to: 90 } }, vpost.slides[2]] }, {}, deps())[0], /ends at 90 s, the reel is 78\.60 s/);
  assert.match(vid(vpost, {}, deps({ timeline: () => null }))[0], /cannot tell what the excerpt shows/);
});

test('video sources: numbers on screen in the excerpt must be in facts.json; the handle may not show unless the slide is last', () => {
  const late = { slides: [vpost.slides[0], { ...vpost.slides[1], source: { item: 'a', from: 51, to: 60 } }, vpost.slides[2]] };
  assert.match(vid(late, {}, deps())[0], /shows number 317 .*facts\.json/);
  assert.deepEqual(vid(late, { 317: 'Lasso, sec 4.1' }, deps()), []);
  const end = { slides: [vpost.slides[0], { ...vpost.slides[1], source: { item: 'a', from: 74, to: 78 } }, vpost.slides[2]] };
  assert.ok(vid(end, {}, deps()).some((x) => /handle .* last slide only/.test(x)), 'the end card in a middle slide');
  const last = { slides: [vpost.slides[0], vpost.slides[2], { ...vpost.slides[1], source: { item: 'a', from: 74, to: 78 } }] };
  assert.deepEqual(vid(last, {}, deps()), [], 'the end card on the last slide is the handle where it belongs; a _ key is not shown');
  const id = reel(); id.lines.l06.text = 'Follow on Instagram';
  assert.ok(vid(vpost, {}, deps({ timeline: () => id })).some((x) => /instagram/i.test(x)));
});
