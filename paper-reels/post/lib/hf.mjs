// The pinned HyperFrames CLI (hf/lib/hfcli.mjs, version 0.8.137), used for snapshots and the layout/contrast check.
// env.mjs must have been imported before this module (see there): hfcli.mjs copies process.env when it loads.
import './env.mjs';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { hfCapture, hfRun, HF_VERSION } from '../../hf/lib/hfcli.mjs';

export { HF_VERSION, hfCapture, hfRun };

/**
 * PNG snapshots of a built project at the given times (seconds), returned in that order and written to outDir as
 * <name>.png. `describe false` keeps the CLI from calling a vision API. GPU mode: see POST_BROWSER_GPU in the README.
 */
export function snapshotAt(projectDir, times, outDir, names) {
  if (!fs.existsSync(path.join(projectDir, 'index.html'))) throw new Error(`${projectDir} is not a built project (run the build step first)`);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'post-snap-'));
  try {
    const gpu = process.env.POST_BROWSER_GPU === '0' ? ['--no-browser-gpu'] : [];
    hfRun(['snapshot', '--at', times.map((t) => t.toFixed(4)).join(','), '--no-end', '--describe', 'false', ...gpu, '-o', tmp], { cwd: projectDir, quiet: true });
    const found = fs.readdirSync(tmp).filter((f) => /^frame-\d+-at-.*\.png$/.test(f)).sort();
    if (found.length !== times.length) throw new Error(`snapshot returned ${found.length} frame(s) for ${times.length} time(s)`);
    fs.mkdirSync(outDir, { recursive: true });
    return found.map((f, i) => { const d = path.join(outDir, `${names[i]}.png`); fs.copyFileSync(path.join(tmp, f), d); return d; });
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
}

/** `hyperframes check --json` at the given times. Returns { report, raw } where report is the parsed JSON (null if unreadable). */
export function checkAt(projectDir, times) {
  const gpu = process.env.POST_BROWSER_GPU === '0' ? ['--no-browser-gpu'] : [];
  const r = hfCapture(['check', '--json', '--at', times.map((t) => t.toFixed(4)).join(','), ...gpu], { cwd: projectDir });
  // stdout (the JSON) comes first, then stderr (a one-line GPU probe message); cut the JSON out of the pair
  const at = r.out.search(/^\{\s*$/m), end = r.out.lastIndexOf('\n}');
  let report = null;
  if (at >= 0 && end > at) { try { report = JSON.parse(r.out.slice(at, end + 2)); } catch { /* fall through */ } }
  return { report, raw: r.out, status: r.status };
}

/**
 * Turn a check report into findings and a verdict. Passing means: lint, runtime, layout and contrast all report zero
 * errors and zero warnings, and the audits really ran (every requested time was sampled, text was checked). A report
 * that says "0 samples, 0 text checks" ran nothing, so it does not pass.
 */
export function judgeCheck(report, times) {
  const problems = [], findings = [];
  if (!report) return { ok: false, problems: ['hyperframes check did not return a JSON report'], findings, stats: {} };
  const add = (area, list = []) => list.forEach((f) => findings.push({ area, severity: f.severity, code: f.code, message: f.message, selector: f.selector, time: f.time }));
  for (const a of ['lint', 'runtime', 'layout', 'motion', 'contrast']) if (report[a]) {
    add(a, report[a].findings);
    const bad = (report[a].errorCount || 0) + (report[a].warningCount || 0);
    if (bad) problems.push(`${a}: ${report[a].errorCount || 0} error(s), ${report[a].warningCount || 0} warning(s)`);
  }
  const stats = { samples: (report.layout && report.layout.samples) || [], checked: report.contrast ? report.contrast.checked : 0, passed: report.contrast ? report.contrast.passed : 0 };
  if (report.browserSkipped) problems.push('the browser audits were skipped');
  if (!report.layout || stats.samples.length !== times.length) problems.push(`layout audit sampled ${stats.samples.length} time(s), expected ${times.length}`);
  if (!report.contrast || report.contrast.enabled === false) problems.push('the contrast audit did not run');
  else if (!(stats.checked > 0)) problems.push('the contrast audit checked no text (0 checks): nothing ran');
  return { ok: problems.length === 0, problems, findings, stats };
}
