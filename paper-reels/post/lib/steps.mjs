// The steps that drive HyperFrames and ffmpeg: check, snap, render. Each one rebuilds the project first (the build is
// cheap and deterministic), so none of them can work from a stale out/project/.
import './env.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { build, midTimes } from './build.mjs';
import { registeredEpisode } from './episode.mjs';
import { checkAt, judgeCheck, snapshotAt } from './hf.mjs';
import { pngToJpeg } from './jpeg.mjs';
import { ffmpeg, sha256File } from './media.mjs';
import { files } from './postdir.mjs';
import { contactSheet } from './sheet.mjs';
import { composeFrame, renderVideoSlide } from './video.mjs';

/** Path of the registered reel a video slide uses. Throws with the fix when it is not there. */
export function sourceVideo(slide) {
  const ep = registeredEpisode(slide.source.item);
  if (!ep) throw new Error(`slide ${slide.id}: item ${slide.source.item} has no registered 9x16 episode in the database (table episodes). Register it first: reels episode ${slide.source.item} 9x16 <file>`);
  if (!fs.existsSync(ep.video_path)) throw new Error(`slide ${slide.id}: the registered video ${ep.video_path} does not exist`);
  return ep.video_path;
}

export function cliCheck(dir) {
  const { P, slides } = build(dir), times = midTimes(slides.length);
  const { report, raw } = checkAt(P, times), j = judgeCheck(report, times);
  for (const f of j.findings) console.log(`${String(f.severity).toUpperCase().padEnd(7)} ${f.area}/${f.code}  t=${f.time ?? '-'}  ${f.message}${f.selector ? `  [${f.selector}]` : ''}`);
  if (!j.ok) {
    for (const p of j.problems) console.error(`check: ${p}`);
    if (!report) console.error(raw.slice(-1500));
    return 1;
  }
  console.log(`check: PASS  ${j.stats.samples.length} sample(s) at ${j.stats.samples.join(', ')} s, ${j.stats.passed}/${j.stats.checked} text contrast checks passed`);
  return 0;
}

export function cliSnap(dir) {
  const { P, post, dir: D } = build(dir), F = files(D), snaps = path.join(F.out, 'snaps');
  fs.rmSync(snaps, { recursive: true, force: true });
  const ids = post.slides.map((s) => s.id);
  snapshotAt(P, midTimes(ids.length), snaps, ids);
  const items = post.slides.map((s, i) => {
    const png = path.join(snaps, `${s.id}.png`);
    if (s.kind !== 'video') return { label: `${i + 1}  ${s.id}  image`, file: png };
    // a video slide: lay the reel's frame over the sheet, as the render will
    const bg = path.join(snaps, `${s.id}.bg.png`);
    fs.renameSync(png, bg);
    const at = s.source.from + Math.min(1, (s.source.to - s.source.from) / 2);
    composeFrame({ bg, src: sourceVideo(s), at, out: png });
    return { label: `${i + 1}  ${s.id}  video ${s.source.from}-${s.source.to} s`, file: png };
  });
  contactSheet(items, F.sheet);
  console.log(`snap: ${F.sheet}\n  slide PNGs in ${snaps}`);
  return 0;
}

export function cliRender(dir) {
  const { P, post, dir: D } = build(dir), F = files(D);
  // a new render makes the old manifest and verdict describe files that no longer exist
  for (const f of [F.manifest, F.validation]) fs.rmSync(f, { force: true });
  fs.rmSync(F.outSlides, { recursive: true, force: true });
  for (const f of fs.existsSync(F.out) ? fs.readdirSync(F.out) : []) if (/\.(jpg|mp4)$/.test(f)) fs.rmSync(path.join(F.out, f));
  const ids = post.slides.map((s) => s.id);
  snapshotAt(P, midTimes(ids.length), F.outSlides, ids);
  const sheet = [];
  post.slides.forEach((s, i) => {
    if (s.kind === 'video') {
      renderVideoSlide({ bg: F.png(s.id), src: sourceVideo(s), from: s.source.from, to: s.source.to, out: F.mp4(s.id) });
      const still = path.join(F.out, `.sheet-${s.id}.png`);
      ffmpeg(['-ss', String(Math.min(1, (s.source.to - s.source.from) / 2)), '-i', F.mp4(s.id), '-frames:v', '1', still]);
      sheet.push({ label: `${i + 1}  ${s.id}  video`, file: still });
      console.log(`render: ${path.relative(D, F.mp4(s.id))}  ${(fs.statSync(F.mp4(s.id)).size / 1e6).toFixed(2)} MB  ${sha256File(F.mp4(s.id)).slice(0, 12)}`);
    } else {
      pngToJpeg(F.png(s.id), F.jpg(s.id));
      sheet.push({ label: `${i + 1}  ${s.id}  image`, file: F.jpg(s.id) });
      console.log(`render: ${path.relative(D, F.jpg(s.id))}  ${(fs.statSync(F.jpg(s.id)).size / 1e3).toFixed(0)} KB  ${sha256File(F.jpg(s.id)).slice(0, 12)}`);
    }
  });
  contactSheet(sheet, F.sheet);                         // the sheet shows the rendered files, not the snapshots
  for (const x of sheet) if (path.basename(x.file).startsWith('.sheet-')) fs.rmSync(x.file, { force: true });
  console.log(`render: contact sheet ${F.sheet}`);
  return 0;
}
