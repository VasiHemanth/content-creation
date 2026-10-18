// node --test paper-reels/post/tests/validate.test.mjs
// The validator's failure paths. HyperFrames, headless Chrome and the database are replaced by stand-ins (helpers.mjs), so
// these tests exercise the checks of validate.mjs itself: the files, the manifest, the verdict. The one rule they pin down
// hardest: a check that did not run is never a pass.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { EXPECTED, validatePost } from '../lib/validate.mjs';
import { buildManifest, manifestHash } from '../lib/manifest.mjs';
import { CHECKS } from '../lib/qa.mjs';
import { fakeJpeg, fakeMp4, fakePng, renderFake, rm, stubs, writePost } from './helpers.mjs';

// tests exercise the gate itself, so they switch it on whatever hf/ste.json says
import { PROFILE as STE_PROFILE } from '../../hf/bin/ste.mjs';
STE_PROFILE.enforce = true;
const status = (r, id) => r.report.checks.find((c) => c.id === id);
const failed = (r) => r.report.checks.filter((c) => !c.ok).map((c) => c.id);
const rewriteManifest = (fx) => fs.writeFileSync(fx.F.manifest, `${JSON.stringify(buildManifest(fx.dir), null, 2)}\n`);
const withFixture = (opts, fn) => { const fx = writePost(opts); try { fn(fx); } finally { rm(fx.dir); } };

test('a good post passes: every expected check appears once, none is skipped, the hash is the hash of the files', () => {
  withFixture({}, (fx) => {
    renderFake(fx);
    const r = validatePost(fx.dir, stubs(fx));
    assert.equal(r.report.verdict, 'PASS', JSON.stringify(r.report.checks.filter((c) => !c.ok)));
    assert.deepEqual(r.report.checks.map((c) => c.id), EXPECTED);
    assert.equal(new Set(EXPECTED).size, EXPECTED.length);
    assert.ok(r.report.checks.every((c) => c.ok && !c.skipped));
    assert.equal(r.report.manifest_sha256, buildManifest(fx.dir).manifest_sha256);
    assert.equal(r.report.manifest_sha256, manifestHash(JSON.parse(fs.readFileSync(fx.F.manifest, 'utf8')).slides));
    for (const id of CHECKS) assert.ok(status(r, id), `${id} is in the report`);
  });
});

test('no manifest: FAIL, the file checks are skipped (not passed), and there is no hash', () => {
  withFixture({}, (fx) => {
    fs.mkdirSync(fx.F.out, { recursive: true });
    const r = validatePost(fx.dir, stubs(fx));
    assert.equal(r.report.verdict, 'FAIL');
    assert.equal(status(r, 'manifest.files').ok, false);
    for (const id of ['slides.images', 'slides.blank', 'render.fresh']) assert.equal(status(r, id).skipped, true, `${id} must be skipped, not passed`);
    assert.equal(r.report.manifest_sha256, null);
  });
});

test('a changed file: the manifest check fails, and the verdict hash is the hash of the files as they are now', () => {
  withFixture({}, (fx) => {
    renderFake(fx);
    const before = buildManifest(fx.dir).manifest_sha256;
    fakeJpeg(fx.F.jpg('s02'), { seed: 7 });
    const r = validatePost(fx.dir, stubs(fx));
    assert.equal(r.report.verdict, 'FAIL');
    assert.equal(status(r, 'manifest.files').ok, false);
    assert.match(status(r, 'manifest.files').detail, /s02.*hash mismatch/);
    assert.notEqual(r.report.manifest_sha256, before, 'the report does not repeat the stale hash of the manifest file');
    assert.equal(r.report.manifest_sha256, buildManifest(fx.dir).manifest_sha256);
  });
});

test('an image that is not a good JPEG fails slides.images: wrong size, a PNG named .jpg, truncated, progressive, with a profile', () => {
  const cases = {
    'wrong size': (f) => fakeJpeg(f, { w: 1080, h: 1080 }),
    'a PNG named .jpg': (f) => fakePng(f),
    'truncated': (f) => { const b = fs.readFileSync(f); fs.writeFileSync(f, b.subarray(0, b.length - 400)); },
    'not baseline': (f) => { const b = fs.readFileSync(f); const i = b.indexOf(Buffer.from([0xff, 0xc0])); b[i + 1] = 0xc2; fs.writeFileSync(f, b); },
    'embedded profile': (f) => { const b = fs.readFileSync(f); const icc = Buffer.concat([Buffer.from([0xff, 0xe2, 0x00, 0x16]), Buffer.from('ICC_PROFILE\0'), Buffer.alloc(9)]); fs.writeFileSync(f, Buffer.concat([b.subarray(0, 2), icc, b.subarray(2)])); },
    'empty': (f) => fs.writeFileSync(f, ''),
  };
  for (const [name, bend] of Object.entries(cases)) {
    withFixture({}, (fx) => {
      renderFake(fx);
      bend(fx.F.jpg('s02'));
      rewriteManifest(fx);                                   // the hashes are right: only the content is wrong
      const r = validatePost(fx.dir, stubs(fx));
      assert.equal(status(r, 'manifest.files').ok, true, `${name}: the manifest is consistent`);
      assert.equal(status(r, 'slides.images').ok, false, `${name} must fail slides.images`);
      assert.equal(r.report.verdict, 'FAIL');
    });
  }
});

test('an image over 8 MB fails slides.images', () => {
  withFixture({}, (fx) => {
    renderFake(fx);
    const b = fs.readFileSync(fx.F.jpg('s02')), com = Buffer.concat([Buffer.from([0xff, 0xfe, 0xff, 0xff]), Buffer.alloc(65533)]);
    fs.writeFileSync(fx.F.jpg('s02'), Buffer.concat([b.subarray(0, 2), ...Array(130).fill(com), b.subarray(2)]));
    rewriteManifest(fx);
    const r = validatePost(fx.dir, stubs(fx));
    assert.match(status(r, 'slides.images').detail, /MB is over the 8 MB limit/);
  });
});

test('a blank slide fails slides.blank', () => {
  withFixture({}, (fx) => {
    renderFake(fx);
    fakeJpeg(fx.F.jpg('s02'), { kind: 'blank' });
    rewriteManifest(fx);
    const r = validatePost(fx.dir, stubs(fx));
    assert.equal(status(r, 'slides.blank').ok, false);
    assert.match(status(r, 'slides.blank').detail, /s02 is blank/);
    assert.equal(status(r, 'slides.images').ok, true, 'it is a fine JPEG, just empty');
  });
});

test('slide count: one slide and eleven slides both fail', () => {
  const mk = (n) => Array.from({ length: n }, (_, i) => ({ id: `s${String(i + 1).padStart(2, '0')}`, kind: 'image', data: { a: `Text ${i}` } }));
  for (const n of [1, 11]) {
    withFixture({ slides: mk(n) }, (fx) => {
      renderFake(fx, { raw: true });
      const r = validatePost(fx.dir, stubs(fx));
      assert.equal(status(r, 'slides.count').ok, false, `${n} slide(s) must fail`);
      assert.equal(r.report.verdict, 'FAIL');
    });
  }
});

const vslides = [{ id: 's01', kind: 'image', data: { hook: 'Plain words', label: 'Unofficial guide' } },
  { id: 's02', kind: 'video', source: { item: 'x', from: 0, to: 2 }, data: { title: 'A reel', handle: 'hemanth_with_ai' } }];

test('a good video slide passes slides.videos and slides.blank', () => {
  withFixture({ slides: vslides }, (fx) => {
    renderFake(fx);
    const r = validatePost(fx.dir, stubs(fx));
    assert.equal(status(r, 'slides.videos').ok, true, status(r, 'slides.videos').detail);
    assert.equal(status(r, 'slides.blank').ok, true, status(r, 'slides.blank').detail);
  });
});

test('a video that breaks the spec fails slides.videos: ratio, audio, faststart, length, profile, frame rate, blank first frame', () => {
  const cases = {
    'ratio 9:16': [{ w: 1080, h: 1920 }, /1080x1920/],
    'mono audio': [{ channels: 1 }, /1 audio channel/],
    'sample rate': [{ sampleRate: 48000 }, /48000/],
    'frame rate': [{ fps: 25 }, /25\/1/],
    'no faststart': [{ faststart: false }, /faststart/],
    'baseline profile': [{ profile: 'baseline' }, /profile/i],
    'blank first frame': [{ blank: true }, /blank or black/],
  };
  for (const [name, [mod, re]] of Object.entries(cases)) {
    withFixture({ slides: vslides }, (fx) => {
      renderFake(fx, { videoMod: mod });
      const r = validatePost(fx.dir, stubs(fx));
      assert.equal(status(r, 'slides.videos').ok, false, `${name} must fail`);
      assert.match(status(r, 'slides.videos').detail, re, name);
    });
  }
  withFixture({ slides: vslides }, (fx) => {                  // 31 s: over the 30 s limit (flat colour keeps the encode quick)
    fs.mkdirSync(fx.F.out, { recursive: true });
    fakeJpeg(fx.F.jpg('s01'));
    fakeMp4(fx.F.mp4('s02'), { seconds: 31, mod: { blank: false } });
    rewriteManifest(fx);
    const r = validatePost(fx.dir, stubs(fx));
    assert.match(status(r, 'slides.videos').detail, /over the 30 s limit/);
  });
});

test('a manifest duration_s that is not the file duration fails', () => {
  withFixture({ slides: vslides }, (fx) => {
    renderFake(fx);
    const m = JSON.parse(fs.readFileSync(fx.F.manifest, 'utf8'));
    m.slides[1].duration_s = 9;
    fs.writeFileSync(fx.F.manifest, JSON.stringify(m));
    const r = validatePost(fx.dir, stubs(fx));
    assert.match(status(r, 'slides.videos').detail, /duration_s 9/);
  });
});

test('stale render: JPEGs that differ from a fresh render of the sources fail render.fresh', () => {
  withFixture({}, (fx) => {
    renderFake(fx);
    const other = stubs(fx, { snapshots: (P, times, outDir, ids) => { fs.mkdirSync(outDir, { recursive: true }); return ids.map((id, i) => { const d = `${outDir}/${id}.png`; fakePng(d, { seed: id === 's02' ? 5 : i }); return d; }); } });
    const r = validatePost(fx.dir, other);
    assert.equal(status(r, 'render.fresh').ok, false);
    assert.match(status(r, 'render.fresh').detail, /s02/);
    assert.equal(r.report.verdict, 'FAIL');
  });
});

test('a check that cannot run is a failure with skipped: true, never a pass', () => {
  withFixture({}, (fx) => {
    renderFake(fx);
    const r = validatePost(fx.dir, stubs(fx, { check: () => { throw new Error('chrome did not start'); } }));
    const c = status(r, 'hf.check');
    assert.equal(c.ok, false); assert.equal(c.skipped, true); assert.match(c.detail, /chrome did not start/);
    assert.equal(r.report.verdict, 'FAIL');
    assert.match(r.report.summary, /1 skipped/);
  });
});

test('a check the source gates forgot to report is added as skipped: the report always has every expected check', () => {
  withFixture({}, (fx) => {
    renderFake(fx);
    const s = stubs(fx);
    const r = validatePost(fx.dir, { ...s, qa: (dir, o) => { const q = s.qa(dir, o); return { ...q, results: q.results.filter((x) => x.id !== 'copy.ste') }; } });
    const c = status(r, 'copy.ste');
    assert.ok(c && c.skipped && !c.ok, 'copy.ste is reported as not run');
    assert.equal(r.report.verdict, 'FAIL');
    assert.deepEqual(r.report.checks.map((x) => x.id), EXPECTED);
  });
});

test('a failing source gate fails the verdict, and a failing HyperFrames check does too', () => {
  withFixture({}, (fx) => {
    renderFake(fx);
    const s = stubs(fx);
    const a = validatePost(fx.dir, { ...s, qa: (dir, o) => { const q = s.qa(dir, o); return { ...q, results: q.results.map((x) => (x.id === 'copy.facts' ? { ...x, ok: false, detail: 'not in facts.json: 99' } : x)) }; } });
    assert.deepEqual(failed(a), ['copy.facts']);
    const b = validatePost(fx.dir, { ...s, check: () => ({ ok: false, problems: ['layout: 1 error(s), 0 warning(s)'], findings: [{ area: 'layout', code: 'text_overflow', message: 'text is clipped', time: 1.5 }], stats: {} }) });
    assert.deepEqual(failed(b), ['hf.check']);
    assert.match(status(b, 'hf.check').detail, /text_overflow/);
  });
});

test('the source gates of an invalid post.json fail and skip the rest', () => {
  const fx = writePost();
  try {
    fs.writeFileSync(fx.F.post, '{ broken');
    const r = validatePost(fx.dir);                          // real qa: it stops at the structure and skips everything else
    assert.equal(r.report.verdict, 'FAIL');
    assert.equal(status(r, 'post.structure').ok, false);
    assert.equal(status(r, 'copy.ste').skipped, true);
    assert.equal(r.report.checks.length, EXPECTED.length);
  } finally { rm(fx.dir); }
});

test('the validator writes nothing into the post folder (validate-post.mjs writes validation.json)', () => {
  withFixture({}, (fx) => {
    renderFake(fx);
    const list = () => fs.readdirSync(fx.dir, { recursive: true }).sort().join('\n');
    const before = list();
    validatePost(fx.dir, stubs(fx));
    assert.equal(list(), before);
  });
});
