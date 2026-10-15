#!/usr/bin/env node
import '../lib/env.mjs';
// Posts engine CLI.   node paper-reels/post/bin/post.mjs <postDir> <step>
// Steps, in order (each runs in the foreground; `all` runs ste .. manifest):
//   ste        copy of every slide against the STE profile (0 hard findings to go on)
//   build      post folder -> out/project/ (a HyperFrames project, 1080x1350, one second per slide)
//   qa         the source gates: structure, STE, facts, typed copy, text size and margins, grid cover, labels, branding
//   check      HyperFrames lint, runtime, layout and contrast on the built project
//   snap       one contact sheet of all slides: out/sheet.png (and out/snaps/*.png)
//   render     out/slides/<id>.png, out/<id>.jpg (quality 92) and out/<id>.mp4 for video slides
//   manifest   out/manifest.json with the hashes (what the registry and the uploader read)
//   all        ste, build, qa, check, snap, render, manifest
// Only validate-post.mjs writes out/validation.json (and so decides PASS): qa and all never do.
import path from 'node:path';
import { build, midTimes } from '../lib/build.mjs';
import { lock } from '../lib/lock.mjs';
import { PostError, files } from '../lib/postdir.mjs';

const [dirArg, step] = process.argv.slice(2);
const STEPS = ['ste', 'build', 'qa', 'check', 'snap', 'render', 'manifest'];
if (!dirArg || !step || (step !== 'all' && !STEPS.includes(step))) {
  console.error(`usage: post.mjs <postDir> ${[...STEPS, 'all'].join('|')}`);
  process.exit(2);
}

async function run(name) {
  const dir = path.resolve(dirArg), F = files(dir);
  const mod = async (m) => import(`../lib/${m}.mjs`);
  if (name === 'ste') { const { cliSte } = await mod('ste-post'); return cliSte(dir); }
  if (name === 'build') {
    lock(F, 'build');
    const { P, slides, warnings } = build(dir);
    for (const w of warnings) console.error(`warn  ${w}`);
    console.log(`build: ${P}\n  ${slides.length} slide(s), ${slides.length} s, captured at ${midTimes(slides.length).join(', ')} s`);
    return 0;
  }
  if (name === 'qa') { lock(F, 'qa'); const { cliQa } = await mod('qa'); return cliQa(dir); }
  if (name === 'check') { lock(F, 'check'); const { cliCheck } = await mod('steps'); return cliCheck(dir); }
  if (name === 'snap') { lock(F, 'snap'); const { cliSnap } = await mod('steps'); return cliSnap(dir); }
  if (name === 'render') { lock(F, 'render'); const { cliRender } = await mod('steps'); return cliRender(dir); }
  if (name === 'manifest') { lock(F, 'manifest'); const { cliManifest } = await mod('manifest'); return cliManifest(dir); }
  throw new Error(`unknown step ${name}`);
}

try {
  const list = step === 'all' ? STEPS : [step];
  for (const s of list) {
    if (step === 'all') console.log(`\n== ${s} ==`);
    const code = await run(s);
    if (code) { console.error(`\n${s}: failed (exit ${code})${step === 'all' ? '; stopping' : ''}`); process.exit(code); }
  }
  if (step === 'all') console.log(`\nall: done. Next: node paper-reels/post/bin/validate-post.mjs ${dirArg}`);
} catch (e) {
  if (e instanceof PostError) console.error(e.message);
  else console.error(`${step}: ${e.stack || e.message}`);
  process.exit(1);
}
