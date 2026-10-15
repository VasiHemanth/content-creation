/**
 * Helpers for Instagram carousel posts. No network, no database, Node built-ins and ffprobe only.
 * post.js and paper-reels/bin/reels.mjs both use this file, so the publish gate and the uploader read a post the same way.
 *
 * A post is <postDir>/out/manifest.json (written by paper-reels/post, contract in paper-reels/post/SPEC.md):
 *   { item, format, w, h, slides: [{ idx, id, kind, path, alt, sha256, duration_s }], manifest_sha256 }
 * path is relative to <postDir>. manifest_sha256 = sha256(JSON.stringify(slides.map((s) => [s.idx, s.kind, s.sha256]))).
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

// Where each limit comes from (pages read 2026-10-08):
//   Meta   stated for carousels on developers.facebook.com (content-publishing, ig-user/media)
//   Ours   a rule of this project (paper-reels/post/SPEC.md)
//   Proxy  Meta publishes it only for story videos; the page has no limits for carousel video children
const LIMITS = {
  minSlides: 2, maxSlides: 10,                       // Meta: up to 10 items. Ours: at least 2.
  imageBytes: 8_000_000,                             // Ours: Meta says 8 MB; this is SI megabytes, like the renderer's own limit
  ratio: 4 / 5, ratioTolerance: 0.002,               // Ours. Meta crops every item to the ratio of the first one.
  videoSecondsMin: 3, videoSecondsMax: 30,           // min: Proxy (story video, 3 s). max: Ours (Meta's story limit is 60 s).
  videoBytes: 100 * 1024 * 1024,                     // Proxy (story video, 100 MB)
  fpsMin: 23, fpsMax: 60,                            // Proxy (story video, 23 to 60 FPS)
  captionChars: 2200, hashtags: 30, mentions: 20,    // Meta: caption parameter of ig-user/media
};
const DEFAULT_GRAPH_VERSION = 'v21.0';               // same default as src/config.js; a dry run does not read .env
const graphVersion = () => process.env.META_GRAPH_VERSION || DEFAULT_GRAPH_VERSION;

const sha256File = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const manifestHash = (slides) => crypto.createHash('sha256').update(JSON.stringify(slides.map((s) => [s.idx, s.kind, s.sha256]))).digest('hex');
const sha12 = (h) => String(h).slice(0, 12);

/** Read and structure-check <postDir>/out/manifest.json. Throws on anything that makes the slide list ambiguous. Does not touch the slide files. */
function readManifest(manifestPath) {
  const file = path.resolve(manifestPath);
  let manifest;
  try { manifest = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { throw new Error(`cannot read ${file}: ${e.message}`); }
  const outDir = path.dirname(file);
  if (path.basename(outDir) !== 'out') throw new Error(`${file}: the manifest must be <postDir>/out/manifest.json`);
  const postDir = path.dirname(outDir);
  if (!manifest || typeof manifest !== 'object' || !Array.isArray(manifest.slides) || !manifest.slides.length) throw new Error(`${file}: no slides`);
  const slides = manifest.slides.map((s, i) => {
    const tag = `${file}: slide entry ${i}`;
    if (!s || typeof s !== 'object') throw new Error(`${tag} is not an object`);
    if (s.idx !== i) throw new Error(`${tag} has idx ${s.idx}; slides must be listed in order with idx 0 to n-1`);
    if (s.kind !== 'image' && s.kind !== 'video') throw new Error(`${tag} has kind ${JSON.stringify(s.kind)}; expected image or video`);
    if (typeof s.path !== 'string' || !s.path || s.path.includes('\0') || path.isAbsolute(s.path) || s.path.split(/[\\/]/).includes('..'))
      throw new Error(`${tag} has path ${JSON.stringify(s.path)}; it must be a relative path inside the post folder`);
    if (!/^[0-9a-f]{64}$/.test(String(s.sha256))) throw new Error(`${tag} has no valid sha256`);
    if (s.duration_s != null && !(Number.isFinite(+s.duration_s) && +s.duration_s > 0)) throw new Error(`${tag} has duration_s ${JSON.stringify(s.duration_s)}`);
    return { idx: i, id: s.id ?? null, kind: s.kind, path: s.path, abs: path.join(postDir, s.path), alt: s.alt ?? null, sha256: s.sha256, duration_s: s.duration_s == null ? null : +s.duration_s };
  });
  return { file, manifest, postDir, slides };
}

/**
 * Hash every slide file and compare with the manifest. Returns { problems, filesHash }.
 * filesHash is the manifest hash recomputed from the bytes on disk (null when a file is missing).
 * `what` names the thing that holds the expected hashes in messages ('the manifest', or 'the registered post' for database rows).
 */
function verifyFiles(m, what = 'the manifest') {
  const problems = [];
  let realDir;
  try { realDir = fs.realpathSync(m.postDir); } catch { return { problems: [`post folder ${m.postDir} is missing`], filesHash: null }; }
  const actual = [];
  for (const s of m.slides) {
    const tag = `slide ${s.idx + 1} (${s.path})`;
    let real;
    try { real = fs.realpathSync(s.abs); } catch { problems.push(`${tag}: file is missing`); actual.push(null); continue; }
    if (!real.startsWith(realDir + path.sep)) { problems.push(`${tag}: resolves outside the post folder`); actual.push(null); continue; }
    if (!fs.statSync(real).isFile()) { problems.push(`${tag}: not a regular file`); actual.push(null); continue; }
    const h = sha256File(real);
    actual.push(h);
    if (h !== s.sha256) problems.push(`${tag}: sha256 ${sha12(h)} differs from ${what} (${sha12(s.sha256)})`);
  }
  const declared = manifestHash(m.slides);
  if (m.manifest.manifest_sha256 !== declared)
    problems.push(`${what}: manifest_sha256 ${sha12(m.manifest.manifest_sha256)} is not the hash of its slide list (${sha12(declared)})`);
  const filesHash = actual.every(Boolean) ? manifestHash(m.slides.map((s, i) => ({ ...s, sha256: actual[i] }))) : null;
  return { problems, filesHash };
}

/** The gate on out/validation.json. Returns null when it says PASS for exactly these files, else the reason. */
function validationProblem(postDir, filesHash, item) {
  const f = path.join(postDir, 'out', 'validation.json');
  const rel = path.relative(path.join(__dirname, '..', '..'), postDir);   // commands in messages run from content-creation/
  const fix = `Run: node paper-reels/post/bin/validate-post.mjs ${rel.startsWith('..') ? postDir : rel}`;
  if (!fs.existsSync(f)) return `Not validated. ${fix}`;
  let v;
  try { v = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return `out/validation.json is not valid JSON (${e.message}). ${fix}`; }
  if (v.verdict !== 'PASS') return `Validation verdict is ${v.verdict}. Fix the post, then ${fix.replace('Run', 'run')}`;
  if (v.item && item && v.item !== item) return `out/validation.json is for item ${v.item}, not ${item}`;
  if (typeof v.manifest_sha256 !== 'string') return `out/validation.json has no manifest_sha256. ${fix}`;
  if (!filesHash || v.manifest_sha256 !== filesHash)
    return `The files changed since validation (validated manifest ${sha12(v.manifest_sha256)}, files hash to ${filesHash ? sha12(filesHash) : 'nothing: a file is missing'}). ${fix}`;
  return null;
}

// ---- checks. Each result is { level: 'pass' | 'fail' | 'warn', msg, detail }.
const pass = (msg, detail = '') => ({ level: 'pass', msg, detail: String(detail) });
const fail = (msg, detail = '') => ({ level: 'fail', msg, detail: String(detail) });
const check = (ok, msg, detail = '') => (ok ? pass(msg, detail) : fail(msg, detail));
const warn = (msg, detail = '') => ({ level: 'warn', msg, detail: String(detail) });
const fmt = (r) => `${r.level.toUpperCase().padEnd(4)}  ${r.msg}${r.detail ? `  (${r.detail})` : ''}`;

function sniff(b) {   // what the first bytes say the file is
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'JPEG';
  if (b.length >= 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'PNG';
  if (b.subarray(0, 4).toString('latin1') === 'GIF8') return 'GIF';
  if (b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP') return 'WebP';
  if (b.subarray(4, 8).toString('latin1') === 'ftyp') return /^(heic|heix|hevc|mif1|avif)/.test(b.subarray(8, 12).toString('latin1')) ? 'HEIC or AVIF' : 'MP4 or MOV';
  return 'unknown';
}

function probe(file) {
  const r = spawnSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', file], { encoding: 'utf8', maxBuffer: 1 << 24 });
  if (r.error) throw new Error(`ffprobe could not run (${r.error.code === 'ENOENT' ? 'not installed' : r.error.message})`);
  if (r.status !== 0) return { error: (r.stderr || '').trim().split('\n').pop() || `exit ${r.status}` };
  try { return JSON.parse(r.stdout); } catch { return { error: 'unreadable ffprobe output' }; }
}
const ratioOk = (w, h) => w > 0 && h > 0 && Math.abs(w / h - LIMITS.ratio) <= LIMITS.ratioTolerance;
const fps = (s) => { const [a, b] = String(s || '0/1').split('/').map(Number); return b ? a / b : 0; };

function checkImage(s) {
  const tag = `slide ${s.idx + 1} (${s.path})`;
  const out = [];
  const size = fs.statSync(s.abs).size;
  const head = Buffer.alloc(16);
  const fd = fs.openSync(s.abs, 'r');
  try { fs.readSync(fd, head, 0, 16, 0); } finally { fs.closeSync(fd); }
  const type = sniff(head);
  out.push(check(type === 'JPEG', `${tag}: JPEG magic bytes`, type === 'JPEG' ? '' : `the file is ${type === 'unknown' ? `not a JPEG, first bytes ${head.subarray(0, 8).toString('hex')}` : `${type}, not JPEG`}`));
  out.push(check(/\.jpe?g$/i.test(s.path), `${tag}: .jpg or .jpeg name`));
  out.push(check(size <= LIMITS.imageBytes, `${tag}: at most 8 MB (8,000,000 bytes)`, `${size.toLocaleString('en-US')} bytes`));
  if (type !== 'JPEG') return out;
  const p = probe(s.abs);
  const v = p.streams && p.streams.find((x) => x.codec_type === 'video');
  if (!v) { out.push(fail(`${tag}: ffprobe reads it as an image`, p.error || 'no image stream')); return out; }
  out.push(check(v.codec_name === 'mjpeg', `${tag}: ffprobe codec is mjpeg`, v.codec_name));
  out.push(check(ratioOk(v.width, v.height), `${tag}: ratio 4:5`, `${v.width}x${v.height}`));
  if (ratioOk(v.width, v.height) && (v.width !== 1080 || v.height !== 1350)) out.push(warn(`${tag}: size is not 1080x1350`, `${v.width}x${v.height}`));
  return out;
}

function checkVideo(s) {
  const tag = `slide ${s.idx + 1} (${s.path})`;
  const out = [];
  const size = fs.statSync(s.abs).size;
  out.push(check(/\.mp4$/i.test(s.path), `${tag}: .mp4 name`));
  out.push(check(size <= LIMITS.videoBytes, `${tag}: at most 100 MB`, `${(size / 1048576).toFixed(2)} MB`));
  const p = probe(s.abs);
  const v = p.streams && p.streams.find((x) => x.codec_type === 'video');
  const a = p.streams && p.streams.find((x) => x.codec_type === 'audio');
  if (!v) { out.push(fail(`${tag}: ffprobe finds a video stream`, p.error || 'none')); return out; }
  out.push(check(/mp4/.test((p.format || {}).format_name || ''), `${tag}: MP4 container`, (p.format || {}).format_name));
  out.push(check(v.codec_name === 'h264', `${tag}: video codec h264`, v.codec_name));
  out.push(check(v.pix_fmt === 'yuv420p', `${tag}: pixel format yuv420p`, v.pix_fmt));
  out.push(check(ratioOk(v.width, v.height), `${tag}: ratio 4:5`, `${v.width}x${v.height}`));
  const rate = fps(v.avg_frame_rate);
  out.push(check(rate >= LIMITS.fpsMin && rate <= LIMITS.fpsMax, `${tag}: 23 to 60 fps`, rate.toFixed(2)));
  if (!a) out.push(warn(`${tag}: no audio stream`));
  else {
    out.push(check(a.codec_name === 'aac', `${tag}: audio codec aac`, a.codec_name));
    out.push(check(+a.sample_rate <= 48000 && a.channels <= 2, `${tag}: audio at most 48 kHz, 2 channels`, `${a.sample_rate} Hz, ${a.channels} ch`));
  }
  const dur = +((p.format || {}).duration || v.duration);
  out.push(check(dur >= LIMITS.videoSecondsMin - 0.05 && dur <= LIMITS.videoSecondsMax + 0.05, `${tag}: duration 3 to 30 s`, `${dur.toFixed(2)} s`));
  if (s.duration_s != null && Math.abs(s.duration_s - dur) > 0.5) out.push(warn(`${tag}: manifest says ${s.duration_s} s, ffprobe says ${dur.toFixed(2)} s`));
  return out;
}

function checkSet(slides) {
  return [
    check(slides.length >= LIMITS.minSlides && slides.length <= LIMITS.maxSlides, `${LIMITS.minSlides} to ${LIMITS.maxSlides} slides`, `${slides.length} slides`),
    check(slides.length > 0 && slides[0].kind === 'image', 'first slide is an image', slides.length ? slides[0].kind : 'none'),
  ];
}

function checkCaption(caption) {
  const text = String(caption ?? '');
  const chars = [...text].length;
  const tags = (text.match(/#[\p{L}\p{N}_]+/gu) || []).length;
  const mentions = (text.match(/(?<![\p{L}\p{N}_.@])@[A-Za-z0-9._]+/gu) || []).length;
  return [
    check(text.trim().length > 0, 'caption is not empty'),
    check(chars <= LIMITS.captionChars, 'caption at most 2200 characters', `${chars} characters`),
    check(tags <= LIMITS.hashtags, 'caption has at most 30 hashtags', `${tags}`),
    check(mentions <= LIMITS.mentions, 'caption has at most 20 @ tags', `${mentions}`),
  ];
}

/**
 * Manifest-level checks as results: the files match the manifest, the hash is the one the caller gated on (expectHash, optional),
 * and out/validation.json says PASS for these files. Returns { results, filesHash }.
 */
function checkManifest(m, { expectHash = null, item = null } = {}) {
  const { problems, filesHash } = verifyFiles(m);
  const results = problems.length ? problems.map((p) => fail(p)) : [pass('slide files match the sha256 values in the manifest', `manifest ${sha12(filesHash)}`)];
  if (expectHash) results.push(check(filesHash === expectHash, 'files match the manifest hash the caller checked', filesHash === expectHash ? '' : `expected ${sha12(expectHash)}, files hash to ${filesHash ? sha12(filesHash) : 'nothing'}`));
  const v = validationProblem(m.postDir, filesHash, item || m.manifest.item);
  results.push(v ? fail(`validation: ${v}`) : pass('out/validation.json says PASS for these files'));
  return { results, filesHash };
}

/** Every file-level check for the slides of a manifest that has been read. */
function checkSlides(slides) {
  const out = checkSet(slides);
  for (const s of slides) {
    try { out.push(...(s.kind === 'video' ? checkVideo(s) : checkImage(s))); }
    catch (e) { out.push(fail(`slide ${s.idx + 1} (${s.path}): could not be checked`, e.message)); }
  }
  return out;
}

/**
 * The Graph API calls uploadInstagramCarousel makes for these slides, with placeholders for ids, URLs and the token.
 * Used by a dry run. src/meta.js builds the same calls for real; a test compares the two.
 */
function planCalls(slides, caption, { altText = false, pollMs = 5000, maxTries = 60, version = graphVersion() } = {}) {
  const base = `https://graph.facebook.com/${version}`;
  const media = `${base}/<IG_ACCOUNT_ID>/media`;
  const wait = `repeat every ${pollMs / 1000} s until FINISHED; fail on ERROR or EXPIRED; give up after ${maxTries} tries`;
  const calls = slides.map((s) => {
    const params = { is_carousel_item: true };
    if (s.kind === 'video') { params.media_type = 'VIDEO'; params.video_url = `<hosted ${s.path}>`; }
    else { params.image_url = `<hosted ${s.path}>`; if (altText && s.alt) params.alt_text = String(s.alt).slice(0, 1000); }
    return { method: 'POST', url: media, params };
  });
  slides.forEach((s, i) => { if (s.kind === 'video') calls.push({ method: 'GET', url: `${base}/<container ${i + 1}>`, params: { fields: 'status_code,status' }, note: wait }); });
  calls.push({ method: 'POST', url: media, params: { media_type: 'CAROUSEL', children: slides.map((_, i) => `<container ${i + 1}>`).join(','), caption: `<${[...String(caption ?? '')].length} characters>` } });
  calls.push({ method: 'GET', url: `${base}/<carousel container>`, params: { fields: 'status_code,status' }, note: wait });
  calls.push({ method: 'POST', url: `${base}/<IG_ACCOUNT_ID>/media_publish`, params: { creation_id: '<carousel container>' } });
  calls.push({ method: 'GET', url: `${base}/<published media>`, params: { fields: 'permalink' } });
  return calls;
}

module.exports = { LIMITS, DEFAULT_GRAPH_VERSION, graphVersion, sha256File, manifestHash, readManifest, verifyFiles, validationProblem,
  checkManifest, checkSlides, checkSet, checkCaption, planCalls, fmt, sniff, probe };
