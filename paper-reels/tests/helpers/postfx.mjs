// Throwaway post folders for the posts tests: JPEG and MP4 slides made with ffmpeg, out/manifest.json and out/validation.json.
// The manifest hash below is written from the formula in paper-reels/post/SPEC.md, on purpose not shared with the code under test.
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const hasFfmpeg = ['ffmpeg', 'ffprobe'].every((b) => spawnSync(b, ['-version'], { stdio: 'ignore' }).status === 0);
export const sha256 = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
export const manifestHash = (slides) => crypto.createHash('sha256').update(JSON.stringify(slides.map((s) => [s.idx, s.kind, s.sha256]))).digest('hex');

const ff = (args) => {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-y', ...args], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`ffmpeg ${args.join(' ')}: ${r.stderr}`);
};
export const makeJpeg = (file, { w = 1080, h = 1350, color = '0x1d3a6b' } = {}) =>
  ff(['-f', 'lavfi', '-i', `color=c=${color}:s=${w}x${h}:d=0.04`, '-frames:v', '1', '-q:v', '3', file]);
export const makePng = (file, { w = 1080, h = 1350 } = {}) =>
  ff(['-f', 'lavfi', '-i', `color=c=0x336699:s=${w}x${h}:d=0.04`, '-frames:v', '1', file]);
export const makeMp4 = (file, { w = 1080, h = 1350, seconds = 4, audio = true, vcodec = 'libx264', fps = 30, pixfmt = 'yuv420p', acodec = 'aac', arate = 44100 } = {}) =>
  ff(['-f', 'lavfi', '-i', `color=c=0x6b3a1d:s=${w}x${h}:r=${fps}:d=${seconds}`,
    ...(audio ? ['-f', 'lavfi', '-i', `anullsrc=r=${arate}:cl=stereo`, '-c:a', acodec] : []),
    '-t', String(seconds), '-c:v', vcodec, '-pix_fmt', pixfmt, '-movflags', '+faststart', ...(audio ? ['-shortest'] : []), file]);

const COLORS = ['0x1d3a6b', '0x2a6b3a', '0x6b2a4a', '0x4a6b2a', '0x2a4a6b', '0x6b5a2a', '0x3a2a6b', '0x2a6b6b', '0x5a2a2a', '0x2a2a5a'];

/**
 * Build <dir>/out with the slides and manifest.json (and a PASS validation.json unless validation is false).
 * slides: array of 'image' | 'video' or { kind, file } where file is a prepared file to copy instead of a fresh slide.
 * Returns { dir, out, manifestPath, manifest, slides, rewrite(), validate(verdict, hash) }.
 */
export function makePost(dir, { item, slides = ['image', 'image', 'image'], validation = true } = {}) {
  const out = path.join(dir, 'out');
  fs.mkdirSync(out, { recursive: true });
  const entries = slides.map((spec, i) => {
    const { kind, file } = typeof spec === 'string' ? { kind: spec, file: null } : spec;
    const id = `s${String(i + 1).padStart(2, '0')}`;
    const rel = `out/${id}.${kind === 'video' ? 'mp4' : 'jpg'}`;
    const abs = path.join(dir, rel);
    if (file) fs.copyFileSync(file, abs);
    else if (kind === 'video') makeMp4(abs);
    else makeJpeg(abs, { color: COLORS[i % COLORS.length] });
    return { idx: i, id, kind, path: rel, alt: `plain description of ${id}`, sha256: sha256(abs), ...(kind === 'video' ? { duration_s: 4 } : {}) };
  });
  const post = { dir, out, manifestPath: path.join(out, 'manifest.json'), item, slides: entries };
  post.rewrite = () => {   // after a test changed a file: recompute hashes and write the manifest again
    for (const s of post.slides) s.sha256 = sha256(path.join(dir, s.path));
    post.manifest = { item, format: '4x5', w: 1080, h: 1350, slides: post.slides, manifest_sha256: manifestHash(post.slides) };
    fs.writeFileSync(post.manifestPath, JSON.stringify(post.manifest, null, 2));
    return post.manifest.manifest_sha256;
  };
  post.validate = (verdict = 'PASS', hash = post.manifest.manifest_sha256) =>
    fs.writeFileSync(path.join(out, 'validation.json'), JSON.stringify({ item, verdict, manifest_sha256: hash, checks: [] }));
  post.rewrite();
  if (validation) post.validate();
  return post;
}

export const tmpdir = (prefix) => fs.mkdtempSync(path.join(os.tmpdir(), prefix));

export const NO_NETWORK = path.join(import.meta.dirname, 'no-network.cjs');
const DUMMY_CREDENTIALS = ['YOUTUBE_CLIENT_SECRET_FILE', 'META_APP_ID', 'META_APP_SECRET', 'META_ACCESS_TOKEN', 'IG_ACCOUNT_ID', 'THREADS_ACCESS_TOKEN',
  'THREADS_USER_ID', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];

/**
 * The environment for a child process of these tests: a throwaway database, wiki log and notification log (never the real ones),
 * dummy credentials (dotenv does not override variables that are already set, so uploader/.env cannot add real ones),
 * every network connection blocked, and REELS_NO_PUBLISH unset unless the test sets it.
 */
export function safeEnv(dir, extra = {}) {
  const env = { ...process.env, TRACKER_DB: path.join(dir, 'content.sqlite'), WIKI_LOG: path.join(dir, 'wiki.log'), NOTIFY_LOG: path.join(dir, 'notifications.log'), NOTIFY_OSASCRIPT: '0',
    NODE_OPTIONS: `${process.env.NODE_OPTIONS || ''} --require ${NO_NETWORK}`.trim() };
  delete env.REELS_NO_PUBLISH;
  delete env.META_GRAPH_VERSION;
  for (const k of DUMMY_CREDENTIALS) env[k] = `dummy-${k.toLowerCase()}`;
  return { ...env, ...extra };
}
