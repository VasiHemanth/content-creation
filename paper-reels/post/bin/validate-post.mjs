#!/usr/bin/env node
import '../lib/env.mjs';
// Validate a rendered post.   node paper-reels/post/bin/validate-post.mjs <postDir>
//
// Judges the files that out/manifest.json lists (as they are on disk now) and the sources they came from, then writes
// <postDir>/out/validation.json: { verdict: "PASS" | "FAIL", manifest_sha256, checks: [{ id, ok, msg, detail }], ... }.
// The verdict is PASS only if every check ran and passed. Exit code 0 on PASS, 1 on FAIL, 2 on bad usage.
// `reels publish-post` refuses unless this report says PASS and its manifest_sha256 equals the hash of the files it uploads.
// Takes a minute or less: it rebuilds the project in a scratch folder and runs HyperFrames and a headless Chrome on it.
import fs from 'node:fs';
import path from 'node:path';
import { lock } from '../lib/lock.mjs';
import { files } from '../lib/postdir.mjs';
import { validatePost } from '../lib/validate.mjs';

const dirArg = process.argv[2];
if (!dirArg || dirArg.startsWith('-')) { console.error('usage: validate-post.mjs <postDir>'); process.exit(2); }
const dir = path.resolve(dirArg);
if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) { console.error(`${dir} is not a folder`); process.exit(2); }
const F = files(dir);
lock(F, 'validate');

const { report } = validatePost(dir);
fs.mkdirSync(F.out, { recursive: true });
fs.writeFileSync(F.validation, `${JSON.stringify(report, null, 2)}\n`);

for (const c of report.checks) console.log(`${c.skipped ? 'SKIP' : c.ok ? 'PASS' : 'FAIL'}  ${c.id.padEnd(15)} ${c.msg}${c.detail ? `\n      ${c.detail}` : ''}`);
console.log(`\n${report.verdict}  ${report.summary}`);
console.log(`manifest_sha256 ${report.manifest_sha256 || '(none: the manifest files are not all readable)'}`);
console.log(`report: ${F.validation}`);
process.exit(report.verdict === 'PASS' ? 0 : 1);
