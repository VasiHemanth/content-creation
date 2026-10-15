// out/manifest.json: the contract between the renderer and the registry/uploader (SPEC, "out/manifest.json").
//
//   { item, format, w, h, slides: [{ idx, id, kind, path, alt, sha256 }, video slides also duration_s],
//     manifest_sha256: sha256(JSON.stringify(slides.map((s) => [s.idx, s.kind, s.sha256]))) }
//
// Paths are relative to the post folder (out/<id>.jpg, out/<id>.mp4). No timestamps: the same files give the same manifest.
// duration_s is what ffprobe says about the output file, not what post.json asked for.
import fs from 'node:fs';
import path from 'node:path';
import { FORMAT, H, W } from './constants.mjs';
import { duration, sha256, sha256File } from './media.mjs';
import { files, loadPost, readJson, readPost } from './postdir.mjs';

/** The hash that identifies a set of slides: order, kind and content, nothing else. */
export const manifestHash = (slides) => sha256(JSON.stringify(slides.map((s) => [s.idx, s.kind, s.sha256])));

/** Build the manifest object from post.json and the rendered files. Throws with one message per missing file. */
export function buildManifest(dirArg) {
  const { dir, post } = loadPost(dirArg), missing = [];
  const slides = post.slides.map((s, idx) => {
    const rel = s.kind === 'video' ? `out/${s.id}.mp4` : `out/${s.id}.jpg`, abs = path.join(dir, rel);
    if (!fs.existsSync(abs)) { missing.push(`${rel} is missing (run the render step)`); return null; }
    const e = { idx, id: s.id, kind: s.kind, path: rel, alt: s.alt };
    if (s.kind === 'video') { const d = duration(abs); if (!(d > 0)) missing.push(`${rel}: ffprobe cannot read a duration`); e.duration_s = +d.toFixed(3); }
    e.sha256 = sha256File(abs);
    return e;
  });
  if (missing.length) throw new Error(`cannot write the manifest:\n  - ${missing.join('\n  - ')}`);
  return { item: post.item, format: FORMAT, w: W, h: H, slides, manifest_sha256: manifestHash(slides) };
}

export function cliManifest(dir) {
  const m = buildManifest(dir), file = files(path.resolve(dir)).manifest;
  fs.writeFileSync(file, `${JSON.stringify(m, null, 2)}\n`);
  console.log(`manifest: ${file}\n  ${m.slides.length} slide(s), manifest_sha256 ${m.manifest_sha256}`);
  return 0;
}

/**
 * Check a written manifest against post.json and the files on disk.
 * Returns { ok, problems: [], manifest } and never throws on bad input: every defect is a problem string.
 */
export function verifyManifest(dirArg) {
  const dir = path.resolve(dirArg), F = files(dir), problems = [];
  const r = readJson(F.manifest);
  if (r.error) return { ok: false, problems: [`out/${r.error}`], manifest: null };
  const m = r.value;
  if (!m || typeof m !== 'object' || !Array.isArray(m.slides)) return { ok: false, problems: ['out/manifest.json has no slides array'], manifest: m };
  const { post } = readPost(dir);
  if (m.format !== FORMAT || m.w !== W || m.h !== H) problems.push(`manifest says ${m.format} ${m.w}x${m.h}; it must be ${FORMAT} ${W}x${H}`);
  if (post) {
    if (m.item !== post.item) problems.push(`manifest item "${m.item}" is not post.json item "${post.item}"`);
    if (m.slides.length !== post.slides.length) problems.push(`manifest lists ${m.slides.length} slide(s), post.json has ${post.slides.length} (render and write the manifest again)`);
  }
  m.slides.forEach((s, i) => {
    const at = `manifest slide ${i + 1}${s && s.id ? ` (${s.id})` : ''}`;
    if (!s || typeof s !== 'object') { problems.push(`${at} is not an object`); return; }
    if (s.idx !== i) problems.push(`${at}: idx is ${s.idx}, expected ${i}`);
    const ps = post && post.slides[i];
    if (ps && (s.id !== ps.id || s.kind !== ps.kind)) problems.push(`${at}: post.json slide ${i + 1} is ${ps.id} (${ps.kind}); the manifest is out of date`);
    if (ps && s.alt !== ps.alt) problems.push(`${at}: alt text differs from post.json (write the manifest again)`);
    const rel = String(s.path || '');
    const abs = path.resolve(dir, rel);
    if (!rel || path.isAbsolute(rel) || rel.split(/[\\/]/).includes('..') || !abs.startsWith(path.join(dir, 'out') + path.sep)) { problems.push(`${at}: path "${rel}" must be relative and inside out/`); return; }
    if (ps && rel !== (ps.kind === 'video' ? `out/${ps.id}.mp4` : `out/${ps.id}.jpg`)) problems.push(`${at}: path "${rel}" is not the expected file for this slide`);
    if (!fs.existsSync(abs)) { problems.push(`${at}: ${rel} does not exist`); return; }
    if (typeof s.sha256 !== 'string' || sha256File(abs) !== s.sha256) problems.push(`${at}: ${rel} changed since the manifest was written (hash mismatch)`);
  });
  const sane = m.slides.every((s) => s && typeof s.sha256 === 'string');
  if (sane && manifestHash(m.slides) !== m.manifest_sha256) problems.push('manifest_sha256 does not match the slide hashes in the manifest');
  return { ok: problems.length === 0, problems, manifest: m };
}
