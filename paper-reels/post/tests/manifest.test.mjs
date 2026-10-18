// node --test paper-reels/post/tests/manifest.test.mjs
// out/manifest.json and its hash: the contract between the renderer and the registry/uploader.
import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { buildManifest, manifestHash, verifyManifest } from '../lib/manifest.mjs';
import { fakeJpeg, fakeMp4, renderFake, rm, writePost } from './helpers.mjs';

// tests exercise the gate itself, so they switch it on whatever hf/ste.json says
import { PROFILE as STE_PROFILE } from '../../hf/bin/ste.mjs';
STE_PROFILE.enforce = true;
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const video = [{ id: 's01', kind: 'image', data: { hook: 'Plain words', label: 'Unofficial guide' } },
  { id: 's02', kind: 'video', source: { item: 'x', from: 0, to: 2 }, data: { title: 'A reel', handle: 'hemanth_with_ai' } }];

test('manifest_sha256 is the sha256 of JSON.stringify of [idx, kind, sha256] per slide, exactly as the SPEC says', () => {
  const slides = [{ idx: 0, id: 'a', kind: 'image', sha256: 'aa', path: 'out/a.jpg' }, { idx: 1, id: 'b', kind: 'video', sha256: 'bb', path: 'out/b.mp4', alt: 'ignored' }];
  const expect = sha('[[0,"image","aa"],[1,"video","bb"]]');
  assert.equal(manifestHash(slides), expect);
  assert.equal(manifestHash([...slides].reverse()), sha('[[1,"video","bb"],[0,"image","aa"]]'), 'order is part of the hash');
  assert.notEqual(manifestHash(slides), manifestHash([{ ...slides[0], kind: 'video' }, slides[1]]), 'kind is part of the hash');
  assert.notEqual(manifestHash(slides), manifestHash([{ ...slides[0], sha256: 'ab' }, slides[1]]), 'content is part of the hash');
  assert.equal(manifestHash(slides), manifestHash(slides.map((s) => ({ ...s, alt: 'other', path: 'elsewhere' }))), 'alt and path are not');
});

test('buildManifest: the SPEC shape, relative paths, real hashes, ffprobe duration, no timestamps', () => {
  const fx = writePost({ slides: video });
  try {
    renderFake(fx);
    const m = buildManifest(fx.dir);
    assert.deepEqual(Object.keys(m), ['item', 'format', 'w', 'h', 'slides', 'manifest_sha256']);
    assert.equal(m.format, '4x5'); assert.equal(m.w, 1080); assert.equal(m.h, 1350);
    assert.deepEqual(m.slides.map((s) => [s.idx, s.id, s.kind, s.path]), [[0, 's01', 'image', 'out/s01.jpg'], [1, 's02', 'video', 'out/s02.mp4']]);
    assert.deepEqual(Object.keys(m.slides[0]), ['idx', 'id', 'kind', 'path', 'alt', 'sha256']);
    assert.deepEqual(Object.keys(m.slides[1]), ['idx', 'id', 'kind', 'path', 'alt', 'duration_s', 'sha256']);
    assert.equal(m.slides[0].sha256, sha(fs.readFileSync(fx.F.jpg('s01'))));
    assert.equal(m.slides[1].sha256, sha(fs.readFileSync(fx.F.mp4('s02'))));
    assert.ok(Math.abs(m.slides[1].duration_s - 2) < 0.1, `duration from ffprobe, got ${m.slides[1].duration_s}`);
    assert.equal(m.manifest_sha256, manifestHash(m.slides));
    assert.equal(JSON.stringify(m), JSON.stringify(buildManifest(fx.dir)), 'the same files give the same manifest');
    assert.ok(!/\d{4}-\d{2}-\d{2}T/.test(JSON.stringify(m)), 'no timestamp');
  } finally { rm(fx.dir); }
});

test('buildManifest fails loudly, naming each missing file', () => {
  const fx = writePost({ slides: video });
  try {
    fs.mkdirSync(fx.F.out, { recursive: true });
    fakeJpeg(fx.F.jpg('s01'));
    assert.throws(() => buildManifest(fx.dir), /out\/s02\.mp4 is missing/);
    rm(fx.F.out);
    assert.throws(() => buildManifest(fx.dir), (e) => /out\/s01\.jpg is missing/.test(e.message) && /out\/s02\.mp4 is missing/.test(e.message));
  } finally { rm(fx.dir); }
});

test('verifyManifest accepts a good manifest and finds every kind of change', () => {
  const fx = writePost({ slides: video });
  try {
    renderFake(fx);
    assert.deepEqual(verifyManifest(fx.dir).problems, []);
    const m = JSON.parse(fs.readFileSync(fx.F.manifest, 'utf8'));
    const write = (x) => fs.writeFileSync(fx.F.manifest, JSON.stringify(x));

    // a changed file
    const jpg = fs.readFileSync(fx.F.jpg('s01'));
    fs.writeFileSync(fx.F.jpg('s01'), Buffer.concat([jpg, Buffer.from([0])]));
    assert.ok(verifyManifest(fx.dir).problems.some((p) => /s01.*hash mismatch/.test(p)));
    fs.writeFileSync(fx.F.jpg('s01'), jpg);
    assert.equal(verifyManifest(fx.dir).ok, true);

    // a missing file
    fs.renameSync(fx.F.mp4('s02'), `${fx.F.mp4('s02')}.bak`);
    assert.ok(verifyManifest(fx.dir).problems.some((p) => /s02.*does not exist/.test(p)));
    fs.renameSync(`${fx.F.mp4('s02')}.bak`, fx.F.mp4('s02'));

    // an edited hash in the manifest
    write({ ...m, slides: m.slides.map((s, i) => (i ? { ...s, sha256: 'f'.repeat(64) } : s)) });
    assert.ok(verifyManifest(fx.dir).problems.some((p) => /hash mismatch/.test(p)));

    // slide hashes edited together with the file: manifest_sha256 still has to match what the slides say
    write({ ...m, manifest_sha256: '0'.repeat(64) });
    assert.ok(verifyManifest(fx.dir).problems.some((p) => /manifest_sha256 does not match/.test(p)));

    // out of date against post.json: alt text, order, count, item
    write({ ...m, slides: m.slides.map((s, i) => (i ? s : { ...s, alt: 'changed' })) });
    assert.ok(verifyManifest(fx.dir).problems.some((p) => /alt text differs/.test(p)));
    write({ ...m, slides: [m.slides[1], m.slides[0]] });
    assert.ok(verifyManifest(fx.dir).problems.length >= 2);
    write({ ...m, slides: m.slides.slice(0, 1) });
    assert.ok(verifyManifest(fx.dir).problems.some((p) => /lists 1 slide/.test(p)));
    write({ ...m, item: 'someone-else' });
    assert.ok(verifyManifest(fx.dir).problems.some((p) => /item/.test(p)));
    write({ ...m, w: 1080, h: 1080 });
    assert.ok(verifyManifest(fx.dir).problems.some((p) => /1080x1350/.test(p)));
  } finally { rm(fx.dir); }
});

test('verifyManifest refuses paths that leave out/ and files that are not the expected one', () => {
  const fx = writePost({ slides: video });
  try {
    renderFake(fx);
    const m = JSON.parse(fs.readFileSync(fx.F.manifest, 'utf8'));
    for (const bad of ['../post.json', '/etc/hosts', 'out/../post.json', 'out/other.jpg']) {
      fs.writeFileSync(fx.F.manifest, JSON.stringify({ ...m, slides: m.slides.map((s, i) => (i ? s : { ...s, path: bad })) }));
      assert.ok(verifyManifest(fx.dir).problems.length >= 1, `path ${bad} must be refused`);
    }
  } finally { rm(fx.dir); }
});

test('verifyManifest on a missing or broken manifest says so instead of throwing', () => {
  const fx = writePost({ slides: video });
  try {
    assert.match(verifyManifest(fx.dir).problems[0], /manifest.json is missing/);
    fs.mkdirSync(fx.F.out, { recursive: true });
    fs.writeFileSync(fx.F.manifest, '{ not json');
    assert.match(verifyManifest(fx.dir).problems[0], /not valid JSON/);
    fs.writeFileSync(fx.F.manifest, '{"slides": 5}');
    assert.match(verifyManifest(fx.dir).problems[0], /no slides array/);
  } finally { rm(fx.dir); }
});

test('fakeMp4 helper makes a spec video (guards the fixtures the validator tests rely on)', () => {
  const fx = writePost({ slides: video });
  try {
    fs.mkdirSync(fx.F.out, { recursive: true });
    fakeMp4(fx.F.mp4('s02'));
    assert.ok(fs.statSync(fx.F.mp4('s02')).size > 1000);
  } finally { rm(fx.dir); }
});
