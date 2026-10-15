// One writer per post folder at a time: render, snap, build and validate each take a lock file in out/, because two
// processes writing one out/ folder corrupt each other (the reels' hf.mjs has the same rule for its episodes).
import fs from 'node:fs';
import path from 'node:path';

/** Take the lock for `name`, or print why not and exit with code 3. Released when the process exits. */
export function lock(F, name) {
  fs.mkdirSync(F.out, { recursive: true });
  // out/ is generated (projects, PNGs, JPEGs, MP4s, hashes): keep it out of git without touching the repo's .gitignore
  if (!fs.existsSync(path.join(F.out, '.gitignore'))) fs.writeFileSync(path.join(F.out, '.gitignore'), '*\n');
  const f = path.join(F.out, '.lock');
  if (fs.existsSync(f)) {
    const [pid, what] = fs.readFileSync(f, 'utf8').split(' ');
    if (+pid !== process.pid) {
      let alive = false;
      try { process.kill(+pid, 0); alive = true; } catch (e) { alive = e.code === 'EPERM'; }
      if (alive) { console.error(`another post step (${what}, pid ${pid}) is running for this post; refusing to start (remove ${f} if that process is gone)`); process.exit(3); }
    }
  }
  fs.writeFileSync(f, `${process.pid} ${name}`);
  process.on('exit', () => { try { if (fs.readFileSync(f, 'utf8').startsWith(`${process.pid} `)) fs.unlinkSync(f); } catch { /* already gone */ } });
}
