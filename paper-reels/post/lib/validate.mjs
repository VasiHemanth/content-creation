// The post validator: the gate between "rendered" and "may be registered and published" (SPEC, "Gates (track A)").
//
// It judges the files the manifest lists, as they are on disk now, and the sources they were made from. It does not
// trust the producer's own run: the project is rebuilt from the sources into a scratch folder, and that copy is audited,
// checked by HyperFrames, and snapshotted again to prove that the JPEGs show what the sources say today.
//
// Rules of this file:
//   - one entry per check, every check in EXPECTED appears exactly once, and a check that cannot run is a failure
//     ("skipped"), never a pass. The verdict is PASS only when every entry is ok and none is skipped.
//   - read only on the post folder. The one file it writes is out/validation.json, written by validate-post.mjs.
import './env.mjs';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { FPS, H, W, VIDEO_W, VIDEO_X } from './constants.mjs';
import { midTimes } from './build.mjs';
import { registeredEpisode } from './episode.mjs';
import { checkAt, HF_VERSION, judgeCheck, snapshotAt } from './hf.mjs';
import { BLANK_SHARE, checkImageFile, checkVideoFile, imageBrightShare } from './mediacheck.mjs';
import { brightShare, changed, ffmpeg, luma, mad, sha256File } from './media.mjs';
import { manifestHash, verifyManifest } from './manifest.mjs';
import { files } from './postdir.mjs';
import { CHECKS as QA_CHECKS, runQa } from './qa.mjs';

// the order of the report; qa.mjs owns the ids of the source gates
export const EXPECTED = [
  'post.structure', 'files.facts', 'files.sources',
  'manifest.files', 'slides.count', 'slides.images', 'slides.videos', 'slides.blank', 'render.fresh', 'video.match',
  'hf.check',
  ...QA_CHECKS.filter((id) => !['post.structure', 'files.facts', 'files.sources'].includes(id)),
];
const TITLES = {
  'manifest.files': 'every manifest file exists, its hash matches, and the manifest matches post.json',
  'slides.count': 'a carousel has 2 to 10 slides', 'slides.images': 'every image slide is a baseline JPEG that decodes, 1080x1350, 8 MB or less',
  'slides.videos': 'every video slide is 4:5, H.264 High, 30 fps, AAC 44.1 kHz stereo, 30 s or less, faststart, and starts with a visible frame',
  'slides.blank': 'no blank slide', 'render.fresh': 'the JPEGs show what the sources draw today (a fresh render of the same sources matches)',
  'video.match': 'each video slide shows the registered reel between its from and to times',
  'hf.check': 'HyperFrames lint, layout and contrast pass on a fresh build (no clipped or overlapping text, text contrast)',
};
export const FRESH_LIMIT = 0.0008;      // fraction of pixels allowed to differ by more than 40 grey levels between a JPEG and a fresh render

const list = (a, n = 5) => `${a.slice(0, n).join('; ')}${a.length > n ? `; and ${a.length - n} more` : ''}`;
function safeAbs(dir, rel) {
  const abs = path.resolve(dir, String(rel || ''));
  return rel && !path.isAbsolute(rel) && abs.startsWith(path.join(dir, 'out') + path.sep) ? abs : null;
}

// ---- frames of a rendered MP4 and of its source reel, as small grey images ----
const VW = 190, VH = 338;
function mp4Region(file, t) {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-ss', String(t), '-i', file, '-frames:v', '1', '-vf', `crop=${VIDEO_W}:${H}:${VIDEO_X}:0,scale=${VW}:${VH}:flags=area,format=gray`, '-f', 'rawvideo', '-'], { maxBuffer: 1 << 24 });
  if (!r.stdout || r.stdout.length !== VW * VH) throw new Error(`cannot decode ${path.basename(file)} at ${t} s`);
  return r.stdout;
}
function srcRegion(file, t) {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-ss', String(t), '-i', file, '-frames:v', '1', '-vf', `scale=${VW}:${VH}:flags=area,format=gray`, '-f', 'rawvideo', '-'], { maxBuffer: 1 << 24 });
  if (!r.stdout || r.stdout.length !== VW * VH) throw new Error(`cannot decode the source reel at ${t} s`);
  return r.stdout;
}

/**
 * Validate a post folder. Returns { report, results } and never throws on a bad folder: every problem is a failed check.
 * `runners` replaces the slow parts in tests: { qa, check, snapshots, episode }.
 */
export function validatePost(dirArg, runners = {}) {
  const dir = path.resolve(dirArg), F = files(dir);
  const R = { qa: runQa, check: (P, times) => { const { report } = checkAt(P, times); return judgeCheck(report, times); }, snapshots: snapshotAt, episode: registeredEpisode, ...runners };
  const results = [];
  const add = (id, ok, detail = '') => results.push({ id, ok: !!ok, msg: TITLES[id] || id, detail });
  const skip = (id, why) => results.push({ id, ok: false, skipped: true, msg: TITLES[id] || id, detail: `skipped: ${why}` });
  const guard = (id, fn) => { try { fn(); } catch (e) { if (!results.some((r) => r.id === id)) skip(id, `the check could not run (${e.message})`); } };
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'post-validate-'));
  const projectDir = path.join(tmp, 'project');
  let post = null, manifest = null, actual = null;

  try {
    // 1. the source gates (structure, facts, STE, audit, branding, video sources) on a scratch build
    const qa = R.qa(dir, { projectDir });
    post = qa.post;
    for (const r of qa.results) results.push(r);
    const built = fs.existsSync(path.join(projectDir, 'index.html')) && qa.results.find((r) => r.id === 'build.static' && r.ok);
    const structureOk = post && qa.results.find((r) => r.id === 'post.structure' && r.ok);

    // 2. the manifest and the files it lists
    const vm = verifyManifest(dir);
    manifest = vm.manifest;
    add('manifest.files', vm.ok, vm.problems.length ? list(vm.problems, 6) : `${vm.manifest.slides.length} file(s)`);
    const ms = Array.isArray(manifest && manifest.slides) ? manifest.slides : [];
    const entries = ms.map((s) => ({ ...s, abs: s && safeAbs(dir, s.path) })).filter((s) => s.abs && fs.existsSync(s.abs));

    // what the files hash to now (the verdict is tied to this, not to the hash the manifest claims)
    if (ms.length && entries.length === ms.length) {
      actual = ms.map((s, i) => ({ idx: s.idx, kind: s.kind, id: s.id, path: s.path, sha256: sha256File(entries[i].abs) }));
    }

    guard('slides.count', () => {
      const n = ms.length;
      add('slides.count', n >= 2 && n <= 10 && (!post || n === post.slides.length), `${n} slide(s)${post && n !== post.slides.length ? `; post.json has ${post.slides.length}` : ''}`);
    });

    const imgs = entries.filter((s) => s.kind === 'image'), vids = entries.filter((s) => s.kind === 'video');
    guard('slides.images', () => {
      if (!ms.length) return skip('slides.images', 'there is no manifest to read the files from');
      const bad = [];
      for (const s of imgs) for (const p of checkImageFile(s.abs)) bad.push(`${s.id}: ${p}`);
      if (imgs.length === 0) bad.push('the manifest lists no image slide');
      if (entries.length !== ms.length) bad.push(`${ms.length - entries.length} manifest file(s) are missing or have an unsafe path`);
      add('slides.images', bad.length === 0, bad.length ? list(bad) : `${imgs.length} JPEG(s)`);
    });
    guard('slides.videos', () => {
      if (!ms.length) return skip('slides.videos', 'there is no manifest to read the files from');
      const bad = [];
      for (const s of vids) {
        const { problems, duration } = checkVideoFile(s.abs, { videoBox: { x: VIDEO_X, w: VIDEO_W, h: H } });
        for (const p of problems) bad.push(`${s.id}: ${p}`);
        if (typeof s.duration_s !== 'number' || Math.abs(s.duration_s - duration) > 0.01) bad.push(`${s.id}: manifest duration_s ${s.duration_s} is not the file's ${Number.isFinite(duration) ? duration.toFixed(3) : 'unknown'} s`);
      }
      add('slides.videos', bad.length === 0, bad.length ? list(bad) : vids.length ? `${vids.length} video(s)` : 'no video slide');
    });
    guard('slides.blank', () => {
      if (!ms.length) return skip('slides.blank', 'there is no manifest to read the files from');
      const bad = [], shares = [];
      for (const s of imgs) { const sh = imageBrightShare(s.abs); shares.push(sh); if (sh < BLANK_SHARE) bad.push(`${s.id} is blank (${(sh * 100).toFixed(2)}% drawn, needs ${BLANK_SHARE * 100}%)`); }
      for (const s of vids) {
        const d = s.duration_s || 1;
        for (const t of [0.2, d / 2, Math.max(0.2, d - 0.3)]) {
          const g = mp4Region(s.abs, +t.toFixed(3)), sh = brightShare(g, VW, VH, { t: 120, inset: 10 });
          if (sh < BLANK_SHARE) bad.push(`${s.id} is blank at ${t.toFixed(1)} s`);
        }
      }
      add('slides.blank', bad.length === 0, bad.length ? list(bad) : `${imgs.length} image(s) drawn, lowest ${(Math.min(...shares, 1) * 100).toFixed(1)}%`);
    });

    // 3. HyperFrames on the fresh build: lint, runtime, layout, contrast
    const times = post ? midTimes(post.slides.length) : [];
    guard('hf.check', () => {
      if (!built) return skip('hf.check', 'the project did not build (see build.static)');
      const j = R.check(projectDir, times);
      const f = j.findings.slice(0, 4).map((x) => `${x.area}/${x.code} t=${x.time ?? '-'} ${String(x.message).slice(0, 110)}`);
      add('hf.check', j.ok, j.ok ? `${j.stats.samples.length} sample(s), ${j.stats.passed}/${j.stats.checked} text contrast checks passed` : `${j.problems.join('; ')}${f.length ? ` | ${f.join(' | ')}` : ''}`);
    });

    // 4. the JPEGs against a fresh render of the same sources
    guard('render.fresh', () => {
      if (!built || !structureOk) return skip('render.fresh', 'the project did not build (see build.static)');
      if (!ms.length || entries.length !== ms.length) return skip('render.fresh', 'the manifest files are not all there to compare');
      const ids = post.slides.map((s) => s.id), freshDir = path.join(tmp, 'fresh');
      const pngs = R.snapshots(projectDir, times, freshDir, ids);
      const bad = [], notes = [];
      const lumaOf = (f) => luma(f, W, H);
      const fresh = new Map(ids.map((id, i) => [id, pngs[i]]));
      const cache = new Map();
      const L = (f) => { if (!cache.has(f)) cache.set(f, lumaOf(f)); return cache.get(f); };
      for (const s of imgs) {
        const own = changed(L(s.abs), L(fresh.get(s.id)), 40);
        if (own > FRESH_LIMIT) bad.push(`${s.id}: ${(own * 100).toFixed(2)}% of the pixels differ from a fresh render (limit ${(FRESH_LIMIT * 100).toFixed(2)}%); render again`);
        // negative control: a slide matches its own fresh render better than any other slide's
        const others = ids.filter((x) => x !== s.id).map((x) => changed(L(s.abs), L(fresh.get(x)), 40));
        if (others.length && !(own < Math.min(...others))) bad.push(`${s.id}: matches another slide's render as well as its own (the comparison cannot tell them apart)`);
        notes.push(`${s.id} ${(own * 100).toFixed(3)}%`);
      }
      // a video slide: the two gutters of its first frame are the fresh sheet (the reel covers the middle)
      for (const s of vids) {
        const tmpPng = path.join(tmp, `${s.id}-first.png`);
        ffmpeg(['-i', s.abs, '-frames:v', '1', tmpPng]);
        const cut = (f) => ffmpeg(['-i', f, '-vf', `split[a][b];[a]crop=${VIDEO_X - 8}:${H}:0:0[l];[b]crop=${W - VIDEO_X - VIDEO_W - 8}:${H}:${VIDEO_X + VIDEO_W + 8}:0[r];[l]format=gray[l2];[r]format=gray[r2];[l2][r2]hstack=inputs=2`, '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], {});
        const a = cut(tmpPng), b = cut(fresh.get(s.id)), n = Math.min(a.length, b.length);
        const own = changed(a.subarray(0, n), b.subarray(0, n), 40);
        if (own > FRESH_LIMIT * 4) bad.push(`${s.id}: the gutters of the video slide differ from a fresh render (${(own * 100).toFixed(2)}%); render again`);
        notes.push(`${s.id} gutters ${(own * 100).toFixed(3)}%`);
      }
      add('render.fresh', bad.length === 0, bad.length ? list(bad) : `matches a fresh render (${notes.join(', ')})`);
    });

    // 5. each video slide against the registered reel it claims to excerpt
    guard('video.match', () => {
      const vslides = post ? post.slides.filter((s) => s.kind === 'video') : [];
      if (!vslides.length) return add('video.match', true, 'no video slide');
      if (!ms.length || vids.length !== vslides.length) return skip('video.match', 'the manifest does not list every video file');
      const bad = [], notes = [];
      for (const ps of vslides) {
        const s = vids.find((v) => v.id === ps.id), ep = R.episode(ps.source.item);
        if (!ep || !fs.existsSync(ep.video_path)) { bad.push(`${ps.id}: the registered reel of ${ps.source.item} is not available`); continue; }
        const { from, to } = ps.source, d = to - from;
        const ts = [0.3, d / 2, Math.max(0.3, d - 0.4)].map((t) => +t.toFixed(3));
        let worst = 0;
        for (const t of ts) {
          // the cut is not on a frame boundary, so the matching reel frame can be one frame either side: take the best of three
          const a = mp4Region(s.abs, t), F1 = 1 / FPS;
          const own = Math.min(...[-F1, 0, F1].map((dt) => mad(a, srcRegion(ep.video_path, Math.max(0, from + t + dt)))));
          const other = mad(a, srcRegion(ep.video_path, from + t + (t + 3 < d ? 3 : -3)));
          worst = Math.max(worst, own);
          if (own > 4) bad.push(`${ps.id}: at ${t.toFixed(1)} s the video differs from the reel at ${(from + t).toFixed(1)} s (mean difference ${own.toFixed(1)}, limit 4)`);
          else if (!(own * 2 < other)) bad.push(`${ps.id}: at ${t.toFixed(1)} s the frame matches the reel at another time about as well as at ${(from + t).toFixed(1)} s`);
        }
        notes.push(`${ps.id} worst difference ${worst.toFixed(1)}`);
      }
      add('video.match', bad.length === 0, bad.length ? list(bad) : notes.join(', '));
    });

  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }

  // every expected check ran exactly once; one that did not is a failure of its own
  for (const id of EXPECTED) if (!results.some((r) => r.id === id)) skip(id, 'the check did not run');
  const seen = new Set(), ordered = [];
  for (const id of EXPECTED) { const r = results.find((x) => x.id === id); if (r && !seen.has(id)) { seen.add(id); ordered.push(r); } }
  for (const r of results) if (!seen.has(r.id)) { seen.add(r.id); ordered.push(r); }

  const ok = ordered.every((r) => r.ok && !r.skipped);
  const report = {
    item: post ? post.item : null,
    verdict: ok ? 'PASS' : 'FAIL',
    at: new Date().toISOString(),
    manifest: 'out/manifest.json',
    manifest_sha256: actual ? manifestHash(actual) : null,
    slides: actual ? actual.map((s) => ({ idx: s.idx, id: s.id, kind: s.kind, path: s.path, sha256: s.sha256 })) : [],
    tools: { hyperframes: HF_VERSION },
    summary: `${ordered.filter((r) => r.ok && !r.skipped).length}/${ordered.length} checks passed${ordered.some((r) => r.skipped) ? `, ${ordered.filter((r) => r.skipped).length} skipped` : ''}`,
    checks: ordered.map((r) => ({ id: r.id, ok: r.ok && !r.skipped, ...(r.skipped ? { skipped: true } : {}), msg: r.msg, detail: r.detail || '' })),
  };
  return { report, results: ordered };
}

export { TITLES };
