#!/usr/bin/env node
// Prepare the inputs for a Threads thread about one arXiv paper.
//   node scripts/thread-prep.mjs <arxiv url or id> [--bottom-frac 0.95]
// Writes (no model involved):
//   llm-wiki/raw/assets/<id>/paper-v1.pdf        downloaded if missing
//   llm-wiki/raw/assets/<id>/paper-v1-text.txt   extracted if missing
//   data/threads/<id>/page1.png                  page 1, cropped above the Introduction, 1440 px wide
// Prints one JSON line with the paths. macOS only (uses swift + sips).
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const arg = process.argv[2] || '';
const m = arg.match(/(\d{4}\.\d{4,5})(v\d+)?/);
if (!m) { console.error('usage: thread-prep.mjs <arxiv url or id>'); process.exit(2); }
const id = m[1];
const bf = process.argv.indexOf('--bottom-frac');
const extra = bf > -1 ? ['--bottom-frac', process.argv[bf + 1]] : [];

const assets = join(root, 'llm-wiki/raw/assets', id);
const outDir = join(root, 'data/threads', id);
mkdirSync(assets, { recursive: true });
mkdirSync(outDir, { recursive: true });

const pdf = join(assets, 'paper-v1.pdf');
const txt = join(assets, 'paper-v1-text.txt');
if (!existsSync(pdf)) {
  const res = await fetch(`https://arxiv.org/pdf/${id}${m[2] || ''}`, { redirect: 'follow' });
  if (!res.ok) { console.error(`arXiv PDF download failed: HTTP ${res.status}`); process.exit(1); }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.subarray(0, 4).toString() !== '%PDF') { console.error('download is not a PDF'); process.exit(1); }
  writeFileSync(pdf, buf);
}

const png3x = join(outDir, '_page1_3x.png');
const size = execFileSync('swift', [join(root, 'scripts/pdf_page1.swift'), pdf, png3x, ...(existsSync(txt) ? [] : ['--text', txt]), ...extra],
  { encoding: 'utf8' }).trim();
const page1 = join(outDir, 'page1.png');
execFileSync('sips', ['--resampleWidth', '1440', png3x, '--out', page1], { stdio: 'ignore' });
execFileSync('rm', ['-f', png3x]);

console.log(JSON.stringify({ id, pdf, text: txt, image: page1, crop: size, dir: outDir }));
