// Fixtures for the posts engine tests: scratch post folders, small real JPEGs and MP4s made with ffmpeg, and stand-ins
// for the slow parts (HyperFrames, headless Chrome, the database) so the gates can be tested without them.
import '../lib/env.mjs';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pngToJpeg } from '../lib/jpeg.mjs';
import { buildManifest, manifestHash } from '../lib/manifest.mjs';
import { duration, sha256File } from '../lib/media.mjs';
import { CHECKS } from '../lib/qa.mjs';
import { readPost, files } from '../lib/postdir.mjs';

export function tmp(prefix = 'post-test-') { return fs.mkdtempSync(path.join(os.tmpdir(), prefix)); }
export const rm = (d) => fs.rmSync(d, { recursive: true, force: true });

function ff(args) {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-y', ...args], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`ffmpeg failed: ${r.stderr}`);
}

/** A PNG: 'busy' (test pattern with plenty of bright pixels) or 'blank' (the flat sheet colour). */
export function fakePng(file, { w = 1080, h = 1350, kind = 'busy', seed = 0 } = {}) {
  const src = kind === 'blank' ? `color=c=0x0b2a4a:s=${w}x${h}:d=1` : `testsrc2=s=${w}x${h}:d=${1 + seed}`;
  ff(['-f', 'lavfi', '-i', src, ...(kind === 'busy' && seed ? ['-ss', String(seed)] : []), '-frames:v', '1', '-c:v', 'png', '-f', 'image2', file]);
  return file;
}
/** A JPEG made by the engine's own encoder from a fake PNG (so it has the same headers and quality as a real slide). */
export function fakeJpeg(file, opts = {}) {
  const png = `${file}.png`;
  fakePng(png, opts);
  pngToJpeg(png, file);
  fs.rmSync(png);
  return file;
}
/** A video slide file that meets the spec (1080x1350, H.264 High, 30 fps, AAC 44.1 kHz stereo, faststart). `mod` bends one property. */
export function fakeMp4(file, { seconds = 2, mod = {} } = {}) {
  const w = mod.w || 1080, h = mod.h || 1350, ch = mod.channels || 2, fps = mod.fps || 30, ar = mod.sampleRate || 44100;
  const v = mod.blank ? `color=c=0x0b2a4a:s=${w}x${h}:r=${fps}:d=${seconds}` : `testsrc2=s=${w}x${h}:r=${fps}:d=${seconds}`;
  ff(['-f', 'lavfi', '-i', v, '-f', 'lavfi', '-i', `sine=frequency=440:sample_rate=${ar}:d=${seconds}`, '-ac', String(ch), '-c:v', 'libx264', '-profile:v', mod.profile || 'high', '-pix_fmt', 'yuv420p',
    '-preset', 'veryfast', '-crf', '35', '-c:a', mod.audioCodec || 'aac', '-ar', String(ar), ...(mod.faststart === false ? [] : ['-movflags', '+faststart']), '-shortest', file]);
  return file;
}

const slideHtml = (id, keys) => `<template id="${id}-template">
  <div id="root" data-composition-id="${id}" data-width="1080" data-height="1350">
    <div class="pk-page">
${keys.map((k, i) => `      <div class="pk-body" data-bind="${id}.${k}"></div>`).join('\n')}
    </div>
  </div>
</template>
`;

/**
 * A post folder in a scratch directory. `slides` is a list of { id, kind, data, source? }; image slides get a minimal template
 * that binds every key of their data. Returns { dir, F }.
 */
export function writePost({ slides, ste, facts = { numbers: {} }, sources = [], item = 'fixture', name = 'Fixture' } = {}) {
  const dir = tmp('post-fixture-'), F = files(dir);
  fs.mkdirSync(F.slides, { recursive: true });
  const list = slides || [
    { id: 's01', kind: 'image', data: { hook: 'Plain words', label: 'Unofficial guide' } },
    { id: 's02', kind: 'image', data: { text: 'The operator edits the file.' } },
    { id: 's03', kind: 'image', data: { line: 'Plain steps.', handle: 'hemanth_with_ai' } },
  ];
  const post = { item, kind: 'post', name, format: '4x5', ...(ste ? { ste } : {}), slides: list.map((s) => ({ alt: `alt text for ${s.id}`, ...s })) };
  const htmls = Object.fromEntries(post.slides.map((s) => [s.id, s.html]));
  for (const s of post.slides) delete s.html;
  fs.writeFileSync(F.post, JSON.stringify(post, null, 2));
  for (const s of post.slides) if (s.kind === 'image') fs.writeFileSync(F.slideHtml(s.id), htmls[s.id] || slideHtml(s.id, Object.keys(s.data).filter((k) => !k.startsWith('_') && typeof s.data[k] !== 'object')));
  fs.writeFileSync(F.facts, JSON.stringify(facts));
  fs.writeFileSync(F.sources, JSON.stringify(sources));
  return { dir, F, post };
}

/** A manifest written straight from the fixture's files, without loadPost (so it can describe a post that is itself invalid). */
export function rawManifest(fx) {
  const slides = fx.post.slides.map((s, idx) => {
    const rel = s.kind === 'video' ? `out/${s.id}.mp4` : `out/${s.id}.jpg`;
    return { idx, id: s.id, kind: s.kind, path: rel, alt: s.alt, ...(s.kind === 'video' ? { duration_s: duration(path.join(fx.dir, rel)) } : {}), sha256: sha256File(path.join(fx.dir, rel)) };
  });
  return { item: fx.post.item, format: '4x5', w: 1080, h: 1350, slides, manifest_sha256: manifestHash(slides) };
}

/** Render fake outputs for every slide of a fixture (JPEGs and MP4s) and write the manifest. */
export function renderFake(fx, { videoMod, raw = false } = {}) {
  fs.mkdirSync(fx.F.outSlides, { recursive: true });
  fx.post.slides.forEach((s, i) => {
    if (s.kind === 'video') fakeMp4(fx.F.mp4(s.id), { mod: videoMod });
    else { fakePng(fx.F.png(s.id), { seed: i }); fakeJpeg(fx.F.jpg(s.id), { seed: i }); }
  });
  fs.writeFileSync(fx.F.manifest, `${JSON.stringify(raw ? rawManifest(fx) : buildManifest(fx.dir), null, 2)}\n`);
}

/**
 * Stand-ins for the slow runners of validatePost: the source gates all pass, HyperFrames is clean, and the "fresh render"
 * of each slide is the PNG the fixture's JPEG was made from (so a good fixture matches itself).
 */
export function stubs(fx, over = {}) {
  return {
    qa: (dir, { projectDir }) => {
      fs.mkdirSync(projectDir, { recursive: true });
      fs.writeFileSync(path.join(projectDir, 'index.html'), '<!doctype html>');
      return { post: readPost(dir).post, results: CHECKS.map((id) => ({ id, ok: true, msg: id, detail: '' })) };
    },
    check: () => ({ ok: true, problems: [], findings: [], stats: { samples: [0.5], checked: 4, passed: 4 } }),
    snapshots: (P, times, outDir, ids) => { fs.mkdirSync(outDir, { recursive: true }); return ids.map((id) => { const d = path.join(outDir, `${id}.png`); fs.copyFileSync(fx.F.png(id), d); return d; }); },
    episode: () => null,
    ...over,
  };
}
