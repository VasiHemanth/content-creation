// node --test paper-reels/tests/post-uploader.test.mjs
// The carousel uploader: uploader/src/meta.js uploadInstagramCarousel (axios replaced by a fake Graph API), uploader/src/carousel.js,
// uploader/post.js --dry-run (a child process that cannot reach the network and must not load any network code) and post.js's real-run
// logic (called in this process with fake hosting, fake Meta and a fake or throwaway tracker). Nothing here calls Meta or Cloudinary:
// every connection is blocked (helpers/no-network.cjs), uploader/src/config.js is replaced so uploader/.env is never read, and
// post.js is only ever started as a child process with --dry-run.
import { test, before, after, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import Module, { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { hasFfmpeg, makePost, makeJpeg, makePng, makeMp4, manifestHash, safeEnv, tmpdir } from './helpers/postfx.mjs';

const require = createRequire(import.meta.url);
require('./helpers/no-network.cjs');   // this process cannot open a connection either
const UPLOADER = path.resolve(import.meta.dirname, '..', '..', 'uploader');
const LIVE_DB = path.resolve(import.meta.dirname, '..', '..', 'data', 'content.sqlite');
const fromUploader = createRequire(path.join(UPLOADER, 'src', 'meta.js'));   // resolves 'axios' exactly as meta.js does, so the fake lands on the same object
const tmp = tmpdir('post-uploader-');
const env = safeEnv(tmp);
const TRACKER_DB = env.TRACKER_DB;
assert.ok(TRACKER_DB.startsWith(os.tmpdir()) && path.resolve(TRACKER_DB) !== LIVE_DB);
const fx = { skip: hasFfmpeg ? false : 'ffmpeg and ffprobe are needed to build slide fixtures' };

// uploader/src/config.js would read uploader/.env (real tokens). Put a stand-in in the module cache before anything loads it.
const cfgPath = fromUploader.resolve('./config.js');
const cfg = new Module(cfgPath);
cfg.filename = cfgPath; cfg.loaded = true; cfg.exports = { ROOT: UPLOADER, GRAPH_VERSION: 'v21.0', DB_PATH: TRACKER_DB };
require.cache[cfgPath] = cfg;
process.env.IG_ACCOUNT_ID = 'ig-test'; process.env.META_ACCESS_TOKEN = 'token-test';
delete process.env.META_GRAPH_VERSION; delete process.env.REELS_NO_PUBLISH;

const axios = fromUploader('axios');
axios.defaults.adapter = () => { throw new Error('a real HTTP request was attempted in a test'); };   // belt and braces: only the fakes below answer
const meta = fromUploader('./meta.js');
const carousel = fromUploader('./carousel.js');
const { run } = fromUploader('../post.js');
afterEach(() => mock.restoreAll());
after(() => fs.rmSync(tmp, { recursive: true, force: true }));

// ---- a fake Graph API

const graphError = (error) => Object.assign(new Error('Request failed with status code 400'), { response: { status: 400, data: { error } } });
function graph(h = {}) {
  const calls = [];
  let n = 0;
  const polled = {};
  const api = {
    calls,
    post: async (url, body, cfg2 = {}) => {
      calls.push({ method: 'POST', url, params: { ...cfg2.params }, body });
      if (url.endsWith('/media_publish')) return h.publish ? h.publish() : { data: { id: 'media-1' } };
      const id = `c${++n}`;
      if (h.create) h.create(id, cfg2.params);
      return { data: { id } };
    },
    get: async (url, cfg2 = {}) => {
      calls.push({ method: 'GET', url, params: { ...cfg2.params } });
      const id = url.split('/').pop();
      if (cfg2.params.fields === 'permalink') return h.permalink ? h.permalink() : { data: { permalink: `https://www.instagram.com/p/${id}/` } };
      polled[id] = (polled[id] || 0) + 1;
      const s = h.status ? h.status(id, polled[id]) : 'FINISHED';
      return { data: { status_code: s, status: s === 'ERROR' ? 'ERROR: Media upload has failed with error code 2207026' : s } };
    },
  };
  mock.method(axios, 'post', api.post);
  mock.method(axios, 'get', api.get);
  return api;
}
const short = (c) => `${c.method} ${c.url.replace('https://graph.facebook.com/v21.0/', '')}`;
const SLIDES = [{ kind: 'image', url: 'https://cdn.test/s01.jpg', alt: 'first' }, { kind: 'image', url: 'https://cdn.test/s02.jpg', alt: 'second' },
  { kind: 'video', url: 'https://cdn.test/s03.mp4', alt: 'a video' }, { kind: 'image', url: 'https://cdn.test/s04.jpg', alt: 'fourth' }];
const upload = (extra = {}) => meta.uploadInstagramCarousel({ items: SLIDES, caption: 'The caption\nwith two lines', pollMs: 0, ...extra });

// ---- uploadInstagramCarousel with axios mocked

test('carousel flow: children in slide order with is_carousel_item, video polled until FINISHED, CAROUSEL container, media_publish', async () => {
  const g = graph({ status: (id, n) => (id === 'c3' && n < 3 ? 'IN_PROGRESS' : 'FINISHED') });
  const url = await upload();
  assert.equal(url, 'https://www.instagram.com/p/media-1/');
  assert.deepEqual(g.calls.map(short), [
    'POST ig-test/media', 'POST ig-test/media', 'POST ig-test/media', 'POST ig-test/media',   // four children, in order
    'GET c3', 'GET c3', 'GET c3',                                                              // only the video child is polled: IN_PROGRESS twice, then FINISHED
    'POST ig-test/media',                                                                      // the CAROUSEL container
    'GET c5',                                                                                  // polled as well
    'POST ig-test/media_publish', 'GET media-1']);
  const [c1, c2, c3, c4, , , , car, , pub, perma] = g.calls;
  for (const c of [c1, c2, c3, c4]) { assert.equal(c.params.is_carousel_item, true); assert.equal(c.params.caption, undefined, 'no caption on a child'); assert.equal(c.params.media_type, c === c3 ? 'VIDEO' : undefined); }
  assert.equal(c1.params.image_url, SLIDES[0].url); assert.equal(c2.params.image_url, SLIDES[1].url); assert.equal(c4.params.image_url, SLIDES[3].url);
  assert.equal(c3.params.video_url, SLIDES[2].url); assert.equal(c3.params.image_url, undefined);
  assert.equal(c1.params.video_url, undefined);
  assert.equal(car.params.media_type, 'CAROUSEL'); assert.equal(car.params.children, 'c1,c2,c3,c4'); assert.equal(car.params.caption, 'The caption\nwith two lines');
  assert.equal(car.params.is_carousel_item, undefined);
  assert.equal(pub.params.creation_id, 'c5'); assert.equal(perma.params.fields, 'permalink');
  assert.ok(g.calls.every((c) => c.params.access_token === 'token-test'));
  assert.equal(g.calls.filter((c) => 'caption' in c.params).length, 1, 'only the carousel container carries the caption');
  assert.ok(g.calls.every((c) => !('alt_text' in c.params)), 'alt_text is off by default');
  assert.ok(g.calls.filter((c) => c.method === 'POST').every((c) => c.body === null), 'parameters go in the query string, as in the reel code');
});

test('carousel flow: alt_text only when asked, only on images, at most 1000 characters', async () => {
  let g = graph();
  await upload({ altText: true, items: SLIDES.map((s, i) => (i === 0 ? { ...s, alt: 'x'.repeat(1200) } : s)) });
  const kids = g.calls.slice(0, 4);
  assert.equal(kids[0].params.alt_text.length, 1000); assert.equal(kids[1].params.alt_text, 'second');
  assert.equal(kids[2].params.alt_text, undefined, 'a video child takes no alt_text'); assert.equal(kids[3].params.alt_text, 'fourth');
  mock.restoreAll();
  g = graph();
  await upload();
  assert.ok(g.calls.every((c) => !('alt_text' in c.params)));
});

test('carousel flow: a video child that ends in ERROR fails clearly and nothing is published', async () => {
  const g = graph({ status: (id) => (id === 'c3' ? 'ERROR' : 'FINISHED') });
  await assert.rejects(upload(), /carousel item 3 of 4 \(video, container c3\): Container ERROR: ERROR: Media upload has failed with error code 2207026/);
  assert.equal(g.calls.filter((c) => c.params.media_type === 'CAROUSEL').length, 0);
  assert.equal(g.calls.filter((c) => c.url.endsWith('/media_publish')).length, 0);
});

test('carousel flow: polling gives up after maxTries', async () => {
  const g = graph({ status: () => 'IN_PROGRESS' });
  await assert.rejects(upload({ maxTries: 3 }), /carousel item 3 of 4 \(video, container c3\): Timed out waiting for video processing/);
  assert.equal(g.calls.filter((c) => c.method === 'GET').length, 3);
  assert.equal(g.calls.filter((c) => c.params.media_type === 'CAROUSEL' || c.url.endsWith('/media_publish')).length, 0);
  mock.restoreAll();
  const e = graph({ status: () => 'EXPIRED' });   // EXPIRED fails too
  await assert.rejects(upload(), /Container EXPIRED/);
  assert.equal(e.calls.filter((c) => c.url.endsWith('/media_publish')).length, 0);
});

test('carousel flow: an API error on a child, on the carousel container or on media_publish is reported with the Graph error and stops the flow', async () => {
  const apiErr = { message: 'Invalid parameter', type: 'OAuthException', code: 100 };
  let g = graph({ create: (id, p) => { if (p.media_type === 'VIDEO') throw graphError(apiErr); } });
  await assert.rejects(upload(), /carousel item 3 of 4 \(video\): container not created: .*"code":100/);
  assert.equal(g.calls.length, 3, 'nothing after the failing child');
  mock.restoreAll();
  g = graph({ status: (id) => (id === 'c5' ? 'ERROR' : 'FINISHED') });
  await assert.rejects(upload(), /carousel container c5: Container ERROR/);
  assert.equal(g.calls.filter((c) => c.url.endsWith('/media_publish')).length, 0);
  mock.restoreAll();
  g = graph({ publish: () => { throw graphError(apiErr); } });
  await assert.rejects(upload(), (e) => /"code":100/.test(e.message) && !e.outcomeUnknown && !e.published);
  assert.equal(g.calls.filter((c) => c.params.fields === 'permalink').length, 0);
});

test('carousel flow: media_publish with no response may have posted; a permalink failure after publishing says the post is live', async () => {
  graph({ publish: () => { throw new Error('socket hang up'); } });
  await assert.rejects(upload(), (e) => e.outcomeUnknown === true && /may be live.*socket hang up/.test(e.message));
  mock.restoreAll();
  graph({ permalink: () => { throw new Error('boom'); } });
  await assert.rejects(upload(), (e) => e.published === true && e.mediaId === 'media-1' && /The carousel is live \(media id media-1\) but the permalink lookup failed: boom/.test(e.message));
});

test('carousel flow: bad input is refused before any call', async () => {
  const g = graph();
  const one = [SLIDES[0]], eleven = Array.from({ length: 11 }, (_, i) => ({ kind: 'image', url: `https://cdn.test/${i}.jpg` }));
  await assert.rejects(meta.uploadInstagramCarousel({ items: one, caption: 'x' }), /2 to 10 items/);
  await assert.rejects(meta.uploadInstagramCarousel({ items: eleven, caption: 'x' }), /2 to 10 items/);
  await assert.rejects(meta.uploadInstagramCarousel({ items: [SLIDES[0], { kind: 'gif', url: 'u' }], caption: 'x' }), /item 2 needs kind image or video/);
  await assert.rejects(meta.uploadInstagramCarousel({ items: [SLIDES[0], { kind: 'image' }], caption: 'x' }), /item 2 needs kind image or video and a public url/);
  const keep = process.env.IG_ACCOUNT_ID;
  delete process.env.IG_ACCOUNT_ID;
  try { await assert.rejects(upload(), /IG_ACCOUNT_ID \/ META_ACCESS_TOKEN not set/); } finally { process.env.IG_ACCOUNT_ID = keep; }
  assert.equal(g.calls.length, 0);
});

test('the dry-run plan lists the same calls, in the same order, as the real flow makes', async () => {
  const g = graph();
  const caption = 'The caption\nwith two lines';
  await upload({ caption });
  const plan = carousel.planCalls(SLIDES.map((s, i) => ({ ...s, path: `out/s0${i + 1}.${s.kind === 'video' ? 'mp4' : 'jpg'}` })), caption, { pollMs: 0, maxTries: 60 });
  // put names on what the real flow only knows by id and URL
  const ids = { c1: '<container 1>', c2: '<container 2>', c3: '<container 3>', c4: '<container 4>', c5: '<carousel container>', 'media-1': '<published media>' };
  const named = (s) => String(s).replace(/\bc[1-5]\b|media-1/g, (m) => ids[m]).replace(/ig-test/g, '<IG_ACCOUNT_ID>').replace(/https:\/\/cdn\.test\/(s0\d\.\w+)/g, (_, f) => `<hosted out/${f}>`);
  const real = g.calls.map((c) => {
    const params = Object.fromEntries(Object.entries(c.params).filter(([k]) => k !== 'access_token').map(([k, v]) => [k, k === 'caption' ? `<${[...v].length} characters>` : (typeof v === 'string' ? named(v) : v)]));
    return { method: c.method, url: named(c.url), params };
  });
  assert.deepEqual(real, plan.map(({ method, url, params }) => ({ method, url, params })));
  assert.ok(plan.filter((c) => c.note).length === 2, 'the video child and the carousel container are the polled ones');
});

// ---- carousel.js

test('carousel.js: the manifest hash is the formula in the spec, captions are counted in characters, file types are sniffed', () => {
  const slides = [{ idx: 0, kind: 'image', sha256: 'a'.repeat(64) }, { idx: 1, kind: 'video', sha256: 'b'.repeat(64) }];
  assert.equal(carousel.manifestHash(slides), manifestHash(slides));
  const lvl = (rs, msg) => rs.find((r) => r.msg.includes(msg)).level;
  assert.equal(lvl(carousel.checkCaption('😀'.repeat(2200)), 'at most 2200'), 'pass', 'characters, not UTF-16 units: 2200 emoji fit');
  assert.equal(lvl(carousel.checkCaption('a'.repeat(2200)), 'at most 2200'), 'pass');
  assert.equal(lvl(carousel.checkCaption('a'.repeat(2201)), 'at most 2200'), 'fail');
  assert.equal(lvl(carousel.checkCaption(Array.from({ length: 30 }, (_, i) => `#t${i}`).join(' ')), 'hashtags'), 'pass');
  assert.equal(lvl(carousel.checkCaption(Array.from({ length: 31 }, (_, i) => `#t${i}`).join(' ')), 'hashtags'), 'fail');
  assert.equal(lvl(carousel.checkCaption('C# and a lone # are not hashtags'), 'hashtags'), 'pass');
  assert.equal(lvl(carousel.checkCaption(Array.from({ length: 21 }, (_, i) => `@user${i}`).join(' ')), '@ tags'), 'fail');
  assert.equal(lvl(carousel.checkCaption('write to me@example.com or @one'), '@ tags'), 'pass', 'an email address is not an @ tag');
  assert.equal(lvl(carousel.checkCaption('   \n '), 'not empty'), 'fail');
  assert.equal(carousel.sniff(Buffer.from([0xff, 0xd8, 0xff, 0xe0])), 'JPEG');
  assert.equal(carousel.sniff(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), 'PNG');
  assert.equal(carousel.sniff(Buffer.from('RIFF\0\0\0\0WEBPVP8 ')), 'WebP');
  assert.equal(carousel.sniff(Buffer.from('\0\0\0\x18ftypheic')), 'HEIC or AVIF');
  assert.equal(carousel.sniff(Buffer.from('\0\0\0\x18ftypisom')), 'MP4 or MOV');
  assert.equal(carousel.sniff(Buffer.from('hello world, not an image')), 'unknown');
});

// ---- post.js --dry-run as a child process

let seq = 0;
const mk = (slides, item = 'up-item') => makePost(path.join(tmp, 'posts', `p${++seq}`), { item, slides });
const post = (args, extra = {}) => {
  const r = spawnSync('node', [path.join(UPLOADER, 'post.js'), ...args], { encoding: 'utf8', cwd: UPLOADER, env: { ...env, TRACKER_DB: path.join(tmp, 'must-not-exist.sqlite'), ...extra } });
  return { code: r.status, out: r.stdout + r.stderr };
};
const dryRun = (p, caption = 'A caption #one', args = [], extra = {}) => post(['--manifest', p.manifestPath, '--caption', caption, '--dry-run', ...args], extra);
const F = {};
before(() => {
  if (!hasFfmpeg) return;
  fs.mkdirSync(path.join(tmp, 'fixtures'), { recursive: true });
  const f = (name) => path.join(tmp, 'fixtures', name);
  makePng(F.png = f('disguised.png'));
  makeJpeg(F.square = f('square.jpg'), { w: 1080, h: 1080 });
  makeJpeg(F.big = f('big.jpg')); fs.appendFileSync(F.big, Buffer.alloc(8_100_000));   // a JPEG with 8.1 MB of padding after the image
  makeMp4(F.short = f('short.mp4'), { seconds: 2 });
  makeMp4(F.long = f('long.mp4'), { seconds: 31 });
  makeMp4(F.mpeg4 = f('mpeg4.mp4'), { vcodec: 'mpeg4' });
  makeMp4(F.slow = f('slow.mp4'), { fps: 15 });
  makeMp4(F.yuv444 = f('yuv444.mp4'), { pixfmt: 'yuv444p' });
  makeMp4(F.wide = f('wide.mp4'), { w: 1080, h: 1080 });
  makeMp4(F.silent = f('silent.mp4'), { audio: false });
  makeMp4(F.ac3 = f('ac3.mp4'), { acodec: 'ac3' });
  makeMp4(F.hirate = f('hirate.mp4'), { arate: 96000 });
});

test('post.js --dry-run: a good post passes every check and prints the calls it would make, with no network, no hosting and no database', fx, () => {
  const p = mk(['image', 'image', 'video', 'image']);
  const report = path.join(tmp, 'loaded.json');
  const r = dryRun(p, 'Line one #a #b\n\nLine two @someone', [], { NO_NETWORK_REPORT: report });
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /^DRY RUN post\.js up-item -> instagram_post: 4 slides, manifest /);
  assert.equal(r.out.split('\n').filter((l) => /^\s*FAIL/.test(l)).length, 0);
  assert.match(r.out, /PASS\s+slide 1 \(out\/s01\.jpg\): JPEG magic bytes/);
  assert.match(r.out, /PASS\s+slide 1 \(out\/s01\.jpg\): ratio 4:5\s+\(1080x1350\)/);
  assert.match(r.out, /PASS\s+slide 3 \(out\/s03\.mp4\): video codec h264/);
  assert.match(r.out, /PASS\s+slide 3 \(out\/s03\.mp4\): duration 3 to 30 s\s+\(4\.00 s\)/);
  assert.match(r.out, /PASS\s+first slide is an image/);
  assert.match(r.out, /\| Line one #a #b\n.*\| \n.*\| Line two @someone/s, 'the caption is printed as it would be sent');
  assert.equal(r.out.split('\n').filter((l) => /^\s*POST .*\/media\s+is_carousel_item=true/.test(l)).length, 4);
  assert.equal(r.out.split('\n').filter((l) => /media_type=VIDEO video_url=<hosted out\/s03\.mp4>/.test(l)).length, 1);
  assert.match(r.out, /POST .*\/media\s+media_type=CAROUSEL children=<container 1>,<container 2>,<container 3>,<container 4> caption=<\d+ characters>/);
  assert.match(r.out, /GET .*\/<container 3>\s+fields=status_code,status\s+\(repeat every 5 s until FINISHED/);
  assert.match(r.out, /POST .*\/media_publish\s+creation_id=<carousel container>/);
  assert.match(r.out, /Would host these files on Cloudinary/);
  assert.match(r.out, /Not checked in a dry run: credentials/);
  assert.equal(fs.existsSync(path.join(tmp, 'must-not-exist.sqlite')), false, 'a dry run opens no database');
  const loaded = JSON.parse(fs.readFileSync(report, 'utf8')).join('\n');
  assert.match(loaded, /src\/carousel\.js/);
  for (const bad of ['src/meta.js', 'src/host.js', 'src/tracker.js', 'src/config.js', 'node_modules/axios/', 'node_modules/cloudinary/', 'node_modules/sqlite3/', 'node_modules/dotenv/', 'node_modules/googleapis/'])
    assert.ok(!loaded.includes(bad), `a dry run must not load ${bad}`);
  // REELS_NO_PUBLISH only stops a real run: the dry run still reports
  assert.equal(dryRun(p, 'A caption', [], { REELS_NO_PUBLISH: '1' }).code, 0);
});

const CAUGHT = [
  ['a PNG disguised as .jpg', ['image', { kind: 'image', file: 'png' }, 'image'], /FAIL\s+slide 2 \(out\/s02\.jpg\): JPEG magic bytes\s+\(the file is PNG, not JPEG\)/],
  ['a 1:1 image', ['image', { kind: 'image', file: 'square' }, 'image'], /FAIL\s+slide 2 \(out\/s02\.jpg\): ratio 4:5\s+\(1080x1080\)/],
  ['an image over 8 MB', ['image', { kind: 'image', file: 'big' }, 'image'], /FAIL\s+slide 2 \(out\/s02\.jpg\): at most 8 MB \(8,000,000 bytes\)\s+\(8,1\d\d,\d{3} bytes\)/],
  ['a 2 s video', ['image', 'image', { kind: 'video', file: 'short' }], /FAIL\s+slide 3 \(out\/s03\.mp4\): duration 3 to 30 s\s+\(2\.0\d s\)/],
  ['a 31 s video', ['image', 'image', { kind: 'video', file: 'long' }], /FAIL\s+slide 3 \(out\/s03\.mp4\): duration 3 to 30 s\s+\(31\.\d+ s\)/],
  ['a video that is not H.264', ['image', 'image', { kind: 'video', file: 'mpeg4' }], /FAIL\s+slide 3 \(out\/s03\.mp4\): video codec h264\s+\(mpeg4\)/],
  ['a video at 15 fps', ['image', 'image', { kind: 'video', file: 'slow' }], /FAIL\s+slide 3 \(out\/s03\.mp4\): 23 to 60 fps\s+\(15\.00\)/],
  ['a video that is not yuv420p', ['image', 'image', { kind: 'video', file: 'yuv444' }], /FAIL\s+slide 3 \(out\/s03\.mp4\): pixel format yuv420p\s+\(yuv444p\)/],
  ['a 1:1 video', ['image', 'image', { kind: 'video', file: 'wide' }], /FAIL\s+slide 3 \(out\/s03\.mp4\): ratio 4:5\s+\(1080x1080\)/],
  ['a video with audio that is not AAC', ['image', 'image', { kind: 'video', file: 'ac3' }], /FAIL\s+slide 3 \(out\/s03\.mp4\): audio codec aac\s+\(ac3\)/],
  ['a video with 96 kHz audio', ['image', 'image', { kind: 'video', file: 'hirate' }], /FAIL\s+slide 3 \(out\/s03\.mp4\): audio at most 48 kHz, 2 channels\s+\(96000 Hz, 2 ch\)/],
  ['a video as the first slide', ['video', 'image'], /FAIL\s+first slide is an image\s+\(video\)/],
  ['a single slide', ['image'], /FAIL\s+2 to 10 slides\s+\(1 slides\)/],
  ['eleven slides', Array(11).fill('image'), /FAIL\s+2 to 10 slides\s+\(11 slides\)/],
];
for (const [name, slides, re] of CAUGHT) {
  test(`post.js --dry-run catches ${name}`, fx, () => {
    const p = mk(slides.map((s) => (typeof s === 'object' ? { ...s, file: F[s.file] } : s)));
    const r = dryRun(p);
    assert.equal(r.code, 3, r.out);
    assert.match(r.out, re);
    assert.match(r.out, /DRY RUN: \d+ check\(s\) failed\. A real run would refuse and upload nothing\./);
    assert.doesNotMatch(r.out, /Would call the Graph API/, 'no plan for a post that would be refused');
  });
}

test('post.js --dry-run catches a caption over 2200 characters, over 30 hashtags, over 20 @ tags, or empty', fx, () => {
  const p = mk(['image', 'image']);
  let r = dryRun(p, 'a'.repeat(2201));
  assert.equal(r.code, 3); assert.match(r.out, /FAIL\s+caption at most 2200 characters\s+\(2201 characters\)/);
  assert.equal(dryRun(p, 'a'.repeat(2200)).code, 0);
  r = dryRun(p, Array.from({ length: 31 }, (_, i) => `#t${i}`).join(' '));
  assert.equal(r.code, 3); assert.match(r.out, /FAIL\s+caption has at most 30 hashtags\s+\(31\)/);
  r = dryRun(p, Array.from({ length: 21 }, (_, i) => `@u${i}`).join(' '));
  assert.equal(r.code, 3); assert.match(r.out, /FAIL\s+caption has at most 20 @ tags\s+\(21\)/);
  r = dryRun(p, '');
  assert.equal(r.code, 3); assert.match(r.out, /FAIL\s+caption is not empty/);
  r = post(['--manifest', p.manifestPath, '--dry-run']);   // no --caption at all
  assert.equal(r.code, 3); assert.match(r.out, /FAIL\s+caption is not empty/);
});

test('post.js --dry-run catches a changed file, a hash the caller did not check, and a missing, failed or stale validation', fx, () => {
  const p = mk(['image', 'image', 'image']);
  assert.equal(dryRun(p).code, 0);
  const wrong = dryRun(p, 'c', ['--manifest-sha256', 'e'.repeat(64)]);
  assert.equal(wrong.code, 3); assert.match(wrong.out, /FAIL\s+files match the manifest hash the caller checked\s+\(expected eeeeeeeeeeee, files hash to \w{12}\)/);
  assert.equal(dryRun(p, 'c', ['--manifest-sha256', p.manifest.manifest_sha256]).code, 0);
  p.validate('FAIL');
  assert.match(dryRun(p).out, /FAIL\s+validation: Validation verdict is FAIL/);
  fs.rmSync(path.join(p.out, 'validation.json'));
  assert.match(dryRun(p).out, /FAIL\s+validation: Not validated\. Run: node paper-reels\/post\/bin\/validate-post\.mjs /);
  p.validate();
  fs.appendFileSync(path.join(p.dir, 'out', 's02.jpg'), 'x');
  const r = dryRun(p);
  assert.equal(r.code, 3);
  assert.match(r.out, /FAIL\s+slide 2 \(out\/s02\.jpg\): sha256 \w{12} differs from the manifest/);
  assert.match(r.out, /FAIL\s+validation: The files changed since validation/);
});

test('post.js --dry-run: a video without audio is a warning, not a failure', fx, () => {
  const r = dryRun(mk(['image', 'image', { kind: 'video', file: F.silent }]));
  assert.equal(r.code, 0, r.out); assert.match(r.out, /WARN\s+slide 3 \(out\/s03\.mp4\): no audio stream/);
});

test('post.js refuses a bad invocation before it looks at any file', fx, () => {
  const p = mk(['image', 'image']);
  let r = post([]);
  assert.equal(r.code, 1); assert.match(r.out, /Usage: node post\.js --manifest/);
  r = post(['--manifest', path.join(tmp, 'nope', 'out', 'manifest.json'), '--dry-run']);
  assert.equal(r.code, 1); assert.match(r.out, /cannot read/);
  r = dryRun(p, 'c', ['--platforms', 'threads_post']);
  assert.equal(r.code, 1); assert.match(r.out, /threads_post is reserved/);
  r = dryRun(p, 'c', ['--platforms', 'instagram']);
  assert.equal(r.code, 1); assert.match(r.out, /Unknown platform "instagram"\. Only instagram_post exists\./);
  r = dryRun(p, 'c', ['--label', 'another-item']);
  assert.equal(r.code, 1); assert.match(r.out, /--label another-item does not match the manifest item up-item/);
  fs.copyFileSync(p.manifestPath, path.join(p.dir, 'manifest.json'));   // not inside out/
  r = post(['--manifest', path.join(p.dir, 'manifest.json'), '--caption', 'c', '--dry-run']);
  assert.equal(r.code, 1); assert.match(r.out, /must be <postDir>\/out\/manifest\.json/);
  fs.writeFileSync(p.manifestPath, JSON.stringify({ ...p.manifest, slides: [p.slides[1], p.slides[0]] }));
  r = dryRun(p);
  assert.equal(r.code, 1); assert.match(r.out, /listed in order with idx 0 to n-1/);
  assert.equal(fs.existsSync(path.join(tmp, 'must-not-exist.sqlite')), false);
});

// ---- post.js real-run logic, called in this process with fakes (post.js itself is never started without --dry-run)

function fakes(over = {}) {
  const rec = { hosted: [], uploaded: [], records: [], logs: [], errs: [], inits: 0 };
  const deps = {
    log: (...a) => rec.logs.push(a.join(' ')), err: (...a) => rec.errs.push(a.join(' ')),
    tracker: { init: async () => { rec.inits++; }, alreadyPosted: async () => false, record: async (...a) => { rec.records.push(a); } },
    hostFile: async (file, o) => { rec.hosted.push({ name: path.basename(file), ...o }); return `https://cdn.test/${path.basename(file)}`; },
    uploadInstagramCarousel: async (a) => { rec.uploaded.push(a); return 'https://www.instagram.com/p/ABC/'; },
    ...over,
  };
  return { rec, deps };
}
const args = (p, more = []) => ['--manifest', p.manifestPath, '--caption', 'The caption', '--manifest-sha256', p.manifest.manifest_sha256, ...more];

test('post.js real run: hosts each file in order, creates the carousel, records SUCCESS under label and instagram_post', fx, async () => {
  const p = mk(['image', 'image', 'video', 'image']);
  const { rec, deps } = fakes();
  assert.equal(await run(args(p), deps), 0, rec.errs.join('\n'));
  assert.deepEqual(rec.hosted, [{ name: 's01.jpg', image: true }, { name: 's02.jpg', image: true }, { name: 's03.mp4', image: false }, { name: 's04.jpg', image: true }]);
  assert.equal(rec.uploaded.length, 1);
  assert.deepEqual(rec.uploaded[0].items.map((i) => [i.kind, i.url, i.alt]), p.slides.map((s) => [s.kind, `https://cdn.test/${path.basename(s.path)}`, s.alt]));
  assert.equal(rec.uploaded[0].caption, 'The caption'); assert.equal(rec.uploaded[0].altText, false);
  assert.deepEqual(rec.records, [['up-item', 'instagram_post', 'SUCCESS', 'https://www.instagram.com/p/ABC/', null]]);
  assert.equal(rec.inits, 1);
  const alt = fakes();
  assert.equal(await run(args(p, ['--alt-text']), alt.deps), 0);
  assert.equal(alt.rec.uploaded[0].altText, true);
});

test('post.js real run: a SUCCESS row skips the post unless --force; REELS_NO_PUBLISH stops it; a failed check hosts nothing', fx, async () => {
  const p = mk(['image', 'image']);
  let f = fakes({ tracker: { init: async () => {}, alreadyPosted: async (label, platform) => label === 'up-item' && platform === 'instagram_post', record: async () => { throw new Error('must not record'); } } });
  assert.equal(await run(args(p), f.deps), 0);
  assert.match(f.rec.logs.join('\n'), /already posted for "up-item", skipping \(use --force to repost\)/);
  assert.deepEqual([f.rec.hosted.length, f.rec.uploaded.length], [0, 0]);
  f = fakes({ tracker: { init: async () => {}, alreadyPosted: async () => true, record: async (...a) => f.rec.records.push(a) } });
  assert.equal(await run(args(p, ['--force']), f.deps), 0);
  assert.equal(f.rec.uploaded.length, 1); assert.equal(f.rec.records[0][2], 'SUCCESS');
  // REELS_NO_PUBLISH
  const keep = process.env.REELS_NO_PUBLISH;
  process.env.REELS_NO_PUBLISH = '1';
  try {
    f = fakes();
    assert.equal(await run(args(p), f.deps), 3);
    assert.match(f.rec.errs.join('\n'), /REELS_NO_PUBLISH=1/);
    assert.deepEqual([f.rec.inits, f.rec.hosted.length, f.rec.uploaded.length, f.rec.records.length], [0, 0, 0, 0]);
  } finally { if (keep === undefined) delete process.env.REELS_NO_PUBLISH; else process.env.REELS_NO_PUBLISH = keep; }
  // an unvalidated post
  fs.rmSync(path.join(p.out, 'validation.json'));
  f = fakes();
  assert.equal(await run(args(p), f.deps), 3);
  assert.match(f.rec.logs.join('\n'), /FAIL\s+validation: Not validated/); assert.match(f.rec.logs.join('\n'), /Refusing to upload: 1 check\(s\) failed\. Nothing was hosted\./);
  assert.deepEqual([f.rec.hosted.length, f.rec.uploaded.length, f.rec.records.length], [0, 0, 0]);
  // a PNG disguised as .jpg
  const q = mk(['image', { kind: 'image', file: F.png }]);
  f = fakes();
  assert.equal(await run(args(q), f.deps), 3);
  assert.match(f.rec.logs.join('\n'), /JPEG magic bytes/);
  assert.deepEqual([f.rec.hosted.length, f.rec.uploaded.length, f.rec.records.length], [0, 0, 0]);
});

test('post.js real run: a file that changes between the checks and its upload stops the run, and a failure is recorded as FAILED', fx, async () => {
  const p = mk(['image', 'image', 'image']);
  let f = fakes();
  f.deps.hostFile = async (file) => { f.rec.hosted.push(path.basename(file)); fs.appendFileSync(path.join(p.dir, 'out', 's02.jpg'), 'x'); return 'https://cdn.test/x'; };   // changes the next file while the first is hosted
  assert.equal(await run(args(p), f.deps), 1);
  assert.deepEqual(f.rec.hosted, ['s01.jpg'], 'the changed file is never hosted');
  assert.equal(f.rec.uploaded.length, 0);
  assert.equal(f.rec.records.length, 1);
  assert.deepEqual(f.rec.records[0].slice(0, 3), ['up-item', 'instagram_post', 'FAILED']);
  assert.match(f.rec.records[0][4], /slide 2 \(out\/s02\.jpg\) changed after the checks/);
  const q = mk(['image', 'image']);
  f = fakes({ hostFile: async () => { throw new Error('Cloudinary says no'); } });
  assert.equal(await run(args(q), f.deps), 1);
  assert.deepEqual(f.rec.records.map((r) => [r[2], r[4]]), [['FAILED', 'Cloudinary says no']]);
  f = fakes({ uploadInstagramCarousel: async () => { throw new Error('carousel item 3 of 4 (video, container c3): Container ERROR'); } });
  assert.equal(await run(args(q), f.deps), 1);
  assert.deepEqual(f.rec.records.map((r) => [r[2], r[3], r[4]]), [['FAILED', null, 'carousel item 3 of 4 (video, container c3): Container ERROR']]);
});

test('post.js real run: a post that is live but has no permalink is recorded as SUCCESS so it is not posted twice', fx, async () => {
  const p = mk(['image', 'image']);
  const live = Object.assign(new Error('The carousel is live (media id 17890) but the permalink lookup failed: boom'), { published: true, mediaId: '17890' });
  let f = fakes({ uploadInstagramCarousel: async () => { throw live; } });
  assert.equal(await run(args(p), f.deps), 0);
  assert.deepEqual(f.rec.records.map((r) => [r[2], r[3], r[4]]), [['SUCCESS', null, live.message]]);
  assert.match(f.rec.errs.join('\n'), /Recorded as SUCCESS without a URL/);
  // a post that went live and could not be recorded must at least say so loudly, with the URL
  f = fakes({ tracker: { init: async () => {}, alreadyPosted: async () => false, record: async () => { throw new Error('database is locked'); } } });
  assert.equal(await run(args(p), f.deps), 0);
  assert.match(f.rec.errs.join('\n'), /COULD NOT RECORD the SUCCESS result in the database \(database is locked\)\. The post is live: https:\/\/www\.instagram\.com\/p\/ABC\//);
});

test('post.js real run: the real tracker writes the posts row the registry reads, and skips a second run without --force', fx, async () => {
  assert.equal(spawnSync('node', [path.join(import.meta.dirname, '..', 'bin', 'reels.mjs'), 'settings'], { env, encoding: 'utf8' }).status, 0);   // creates the v3 schema in TRACKER_DB
  const tracker = fromUploader('./tracker.js');   // opens TRACKER_DB (the stand-in config points at it)
  // Read and write through the same SQLite build the tracker uses. Two builds (this one and node:sqlite) on one file inside one process
  // break SQLite's POSIX locking; in production they are always separate processes (reels.mjs starts post.js).
  const sqlite3 = fromUploader('sqlite3');
  const sqlOn = (method, query, params = []) => new Promise((resolve, reject) => {
    const d = new sqlite3.Database(TRACKER_DB);
    d[method](query, params, function done(e, r) { d.close(() => (e ? reject(e) : resolve(r))); });
  });
  const rowsNow = () => sqlOn('all', 'SELECT label, platform, status, url, error, text_revision FROM posts ORDER BY id');
  const p = mk(['image', 'image']);
  let f = fakes({ tracker });
  assert.equal(await run(args(p), f.deps), 0, f.rec.errs.join('\n'));
  assert.deepEqual((await rowsNow()).map((r) => ({ ...r })), [{ label: 'up-item', platform: 'instagram_post', status: 'SUCCESS', url: 'https://www.instagram.com/p/ABC/', error: null, text_revision: null }]);
  f = fakes({ tracker });
  assert.equal(await run(args(p), f.deps), 0);
  assert.match(f.rec.logs.join('\n'), /already posted for "up-item", skipping/);
  assert.equal(f.rec.uploaded.length, 0); assert.equal((await rowsNow()).length, 1);
  f = fakes({ tracker });
  assert.equal(await run(args(p, ['--force']), f.deps), 0);
  assert.equal((await rowsNow()).length, 2);
  f = fakes({ tracker, uploadInstagramCarousel: async () => { throw new Error('nope'); } });
  assert.equal(await run(args(p, ['--force']), f.deps), 1);
  assert.deepEqual((await rowsNow()).slice(-1).map((r) => [r.status, r.url, r.error]), [['FAILED', null, 'nope']]);
  // a reel's rows on the same label do not count as this post
  await sqlOn('run', "INSERT INTO posts (label, platform, status, url) VALUES ('other-item', 'instagram', 'SUCCESS', 'https://x')");
  const q = mk(['image', 'image'], 'other-item');
  f = fakes({ tracker });
  assert.equal(await run(args(q), f.deps), 0);
  assert.equal(f.rec.uploaded.length, 1, 'a SUCCESS on instagram (the reel) does not block instagram_post');
});
