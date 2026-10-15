// One place that knows how to call the HyperFrames CLI. The version is pinned so renders stay reproducible
// (a newer CLI can change output). Bump it on purpose, run `check` on a known episode, then update this line.
import { spawn, spawnSync } from 'node:child_process';

export const HF_VERSION = process.env.HF_VERSION || '0.8.137';
const args = (a) => ['--yes', `hyperframes@${HF_VERSION}`, ...a];
// The CLI reports anonymous usage events by default (not the video or the project). The pipeline opts out.
const env = { ...process.env, HYPERFRAMES_NO_TELEMETRY: '1' };
const clean = (s) => String(s).replace(/\x1b\[[0-9;]*m/g, '');

/** Run to completion, stream output to the parent. Throws on a non-zero exit. */
export function hfRun(a, { cwd, quiet = false } = {}) {
  const r = spawnSync('npx', args(a), { cwd, env, stdio: quiet ? ['ignore', 'pipe', 'pipe'] : ['ignore', 'inherit', 'inherit'], encoding: 'utf8', maxBuffer: 1 << 28 });
  if (r.status !== 0) { const e = new Error(`hyperframes ${a.join(' ')} exited ${r.status}\n${clean(r.stdout || '')}${clean(r.stderr || '')}`); e.status = r.status; throw e; }
  return clean(r.stdout || '') + clean(r.stderr || '');
}
/** Run and capture; never throws, returns { status, out }. */
export function hfCapture(a, { cwd } = {}) {
  const r = spawnSync('npx', args(a), { cwd, env, encoding: 'utf8', maxBuffer: 1 << 28 });
  return { status: r.status, out: clean(r.stdout || '') + clean(r.stderr || '') };
}
/** Async capture (used to run several transcriptions at once). */
export function hfCaptureAsync(a, { cwd } = {}) {
  return new Promise((res) => {
    const p = spawn('npx', args(a), { cwd, env }); let out = '';
    p.stdout.on('data', (d) => { out += d; }); p.stderr.on('data', (d) => { out += d; });
    p.on('close', (status) => res({ status, out: clean(out) }));
  });
}
