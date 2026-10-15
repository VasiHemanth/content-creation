// The headless Chrome that HyperFrames renders with (the path comes from the pinned CLI: `hyperframes browser path`).
// Used for what the CLI does not report: real text boxes (audit.mjs) and the labelled contact sheet (sheet.mjs).
import './env.mjs';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { hfCapture } from '../../hf/lib/hfcli.mjs';

let cached = null;
export function chromePath() {
  if (cached) return cached;
  const env = process.env.POST_CHROME;
  if (env && fs.existsSync(env)) return (cached = env);
  const r = hfCapture(['browser', 'path']);
  const p = r.out.trim().split('\n').map((s) => s.trim()).filter(Boolean).pop() || '';
  if (r.status !== 0 || !p.startsWith('/') || !fs.existsSync(p)) throw new Error(`cannot find the HyperFrames Chrome (hyperframes browser path said: ${r.out.trim().slice(0, 300) || 'nothing'}). Set POST_CHROME to a headless Chrome binary.`);
  return (cached = p);
}

const BASE = ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files', '--force-device-scale-factor=1', '--run-all-compositor-stages-before-draw'];

/** Load a local page, let its scripts and fonts settle, return the DOM as HTML. */
export function dumpDom(file, { budgetMs = 8000 } = {}) {
  const r = spawnSync(chromePath(), [...BASE, `--virtual-time-budget=${budgetMs}`, '--dump-dom', pathToFileURL(file).href], { encoding: 'utf8', maxBuffer: 1 << 28, timeout: 120000 });
  if (r.status !== 0 || !r.stdout) throw new Error(`Chrome could not load ${file} (exit ${r.status}) ${String(r.stderr || '').slice(0, 300)}`);
  return r.stdout;
}

/** Screenshot of a local page at a fixed window size. */
export function screenshot(file, out, w, h, { budgetMs = 8000 } = {}) {
  const r = spawnSync(chromePath(), [...BASE, `--window-size=${w},${h}`, `--virtual-time-budget=${budgetMs}`, `--screenshot=${out}`, pathToFileURL(file).href], { encoding: 'utf8', maxBuffer: 1 << 26, timeout: 120000 });
  if (r.status !== 0 || !fs.existsSync(out)) throw new Error(`Chrome could not render ${file} (exit ${r.status}) ${String(r.stderr || '').slice(0, 300)}`);
  return out;
}
