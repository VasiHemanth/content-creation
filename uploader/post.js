#!/usr/bin/env node
/**
 * Post one rendered post (an Instagram carousel) and log the result.
 *
 *   node post.js --manifest ../paper-reels/posts/<slug>/out/manifest.json --caption "Instagram caption" \
 *     [--label <item id>] [--platforms instagram_post] [--dry-run] [--force]
 *
 *   --dry-run   fully local: reads the files, runs every check, prints the API calls it would make. It hosts nothing, calls no API and
 *               does not load .env, the tracker, Cloudinary or Meta code (Cloudinary links are public, so nothing is hosted early).
 *   --force     post again although a SUCCESS row exists for the label and platform.
 *   --alt-text  send each image's alt text as alt_text on its child container (off: the SPEC says carousels have no alt text,
 *               but the ig-user/media reference says image items accept it; untested).
 *
 * The label is the item id (it must match "item" in the manifest). The result goes to the posts table with platform instagram_post,
 * in the database named by TRACKER_DB (reels.mjs sets it to data/content.sqlite). Only instagram_post exists in v1; threads_post is reserved.
 * A real run refuses unless out/validation.json says PASS for these exact files, and does nothing under REELS_NO_PUBLISH.
 * The normal way to post is `node paper-reels/bin/reels.mjs publish-post <id>`, which checks the text and the posts table first.
 *
 * Exit codes: 0 done (or dry run passed, or skipped as already posted), 1 usage error or upload failure, 3 a check failed.
 */
const fs = require('fs');
const carousel = require('./src/carousel');

const USAGE = 'Usage: node post.js --manifest <postDir>/out/manifest.json --caption "..." [--label id] [--platforms instagram_post] [--dry-run] [--force]';
const PLATFORM = 'instagram_post';
const kv = (p) => Object.entries(p).map(([k, v]) => `${k}=${v}`).join(' ');
const blocked = () => !!process.env.REELS_NO_PUBLISH && !['', '0'].includes(process.env.REELS_NO_PUBLISH);

/** deps (tests only): log, err, tracker, hostFile, uploadInstagramCarousel. Anything missing is loaded on a real run. */
async function run(argv, deps = {}) {
  const log = deps.log || ((...a) => console.log(...a));
  const err = deps.err || ((...a) => console.error(...a));
  const flag = (f) => argv.includes(f);
  const opt = (f) => { const i = argv.indexOf(f); return i !== -1 && argv[i + 1] !== undefined ? argv[i + 1] : null; };
  const dry = flag('--dry-run');

  if (!opt('--manifest')) { err(USAGE); return 1; }
  let m;
  try { m = carousel.readManifest(opt('--manifest')); } catch (e) { err(e.message); return 1; }
  const label = opt('--label') || m.manifest.item;
  if (!label) { err('The manifest has no "item" and --label is not set'); return 1; }
  if (m.manifest.item && label !== m.manifest.item) { err(`--label ${label} does not match the manifest item ${m.manifest.item}`); return 1; }
  const platforms = (opt('--platforms') || PLATFORM).split(',').map((p) => p.trim()).filter(Boolean);
  for (const p of platforms) {
    if (p === 'threads_post') { err('threads_post is reserved: Threads posting is not in v1 (see paper-reels/post/SPEC.md)'); return 1; }
    if (p !== PLATFORM) { err(`Unknown platform "${p}". Only ${PLATFORM} exists.`); return 1; }
  }
  if (!dry && blocked()) { err(`Publishing is disabled in this process (REELS_NO_PUBLISH=${process.env.REELS_NO_PUBLISH}).`); return 3; }

  const caption = opt('--caption') ?? '';
  const { results, filesHash } = carousel.checkManifest(m, { expectHash: opt('--manifest-sha256'), item: label });
  results.push(...carousel.checkSlides(m.slides), ...carousel.checkCaption(caption));
  log(`${dry ? 'DRY RUN ' : ''}post.js ${label} -> ${PLATFORM}: ${m.slides.length} slides, manifest ${filesHash ? filesHash.slice(0, 12) : 'unreadable'}`);
  for (const r of results) log(`  ${carousel.fmt(r)}`);
  const failed = results.filter((r) => r.level === 'fail');
  if (failed.length) {
    log(dry ? `DRY RUN: ${failed.length} check(s) failed. A real run would refuse and upload nothing.` : `Refusing to upload: ${failed.length} check(s) failed. Nothing was hosted.`);
    return 3;
  }

  if (dry) {
    log(`Caption, exactly as it would be sent (${[...caption].length} characters):`);
    for (const line of caption.split('\n')) log(`  | ${line}`);
    log('Would host these files on Cloudinary (public links until deleted there):');
    for (const s of m.slides) log(`  slide ${s.idx + 1}  ${s.kind}  ${s.path}  ${(fs.statSync(s.abs).size / 1024).toFixed(0)} KB`);
    log('Would call the Graph API in this order (every call also sends access_token; ids come from earlier replies):');
    for (const c of carousel.planCalls(m.slides, caption, { altText: flag('--alt-text') })) log(`  ${c.method.padEnd(4)} ${c.url}  ${kv(c.params)}${c.note ? `   (${c.note})` : ''}`);
    log('Not checked in a dry run: credentials, whether Instagram accepts the files, Cloudinary limits, and the posts table (reels.mjs publish-post checks that).');
    return 0;
  }

  // ---- real run: load the network code only now
  if (!deps.tracker || !deps.hostFile || !deps.uploadInstagramCarousel) require('./src/config');
  const tracker = deps.tracker || require('./src/tracker');
  const hostFile = deps.hostFile || require('./src/host').hostFile;
  const uploadCarousel = deps.uploadInstagramCarousel || require('./src/meta').uploadInstagramCarousel;
  await tracker.init();
  if (!flag('--force') && await tracker.alreadyPosted(label, PLATFORM)) {
    log(`${PLATFORM}: already posted for "${label}", skipping (use --force to repost)`);
    return 0;
  }
  const record = async (status, url, error) => {
    try { await tracker.record(label, PLATFORM, status, url, error); }
    catch (e) { err(`COULD NOT RECORD the ${status} result in the database (${e.message}). ${url ? `The post is live: ${url}` : ''}`); }
  };
  log(`${PLATFORM}: hosting ${m.slides.length} files on Cloudinary...`);
  try {
    const items = [];
    for (const s of m.slides) {
      const h = carousel.sha256File(s.abs);   // again, right before this file leaves the machine
      if (h !== s.sha256) throw new Error(`slide ${s.idx + 1} (${s.path}) changed after the checks (sha256 ${h.slice(0, 12)}, manifest ${s.sha256.slice(0, 12)}); the carousel was not created`);
      items.push({ kind: s.kind, url: await hostFile(s.abs, { image: s.kind === 'image' }), alt: s.alt });
    }
    log(`${PLATFORM}: creating the carousel...`);
    const url = await uploadCarousel({ items, caption, altText: flag('--alt-text') });
    log(`${PLATFORM}: done ${url}`);
    await record('SUCCESS', url, null);
    return 0;
  } catch (e) {
    if (e.published) {   // live on Instagram, only the permalink is missing: record SUCCESS so a retry cannot post it twice
      err(`${PLATFORM}: ${e.message}`);
      err('Recorded as SUCCESS without a URL so it is not posted twice. Find the post on the profile.');
      await record('SUCCESS', null, e.message);
      return 0;
    }
    err(`${PLATFORM}: failed: ${e.message}`);
    await record('FAILED', null, e.message);
    return 1;
  }
}

module.exports = { run };

if (require.main === module) {
  run(process.argv.slice(2)).then((code) => process.exit(code), (e) => { console.error(e.message); process.exit(1); });
}
