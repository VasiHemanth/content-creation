#!/usr/bin/env node
/**
 * Upload one video to YouTube Shorts, Instagram Reels and/or Threads, and log the result.
 *
 *   node upload.js --video out/clip.mp4 --label clip-01 \
 *     --title "Title #Shorts" --description "..." --tags a,b,c \
 *     --caption "Instagram caption" --threads-text "Threads text" \
 *     [--thumbnail out/thumb.png] [--platforms youtube,instagram,threads] \
 *     [--privacy public|unlisted|private] [--force]
 *
 *   node upload.js --history       show the last 30 posts
 *
 * Or pass --meta file.json with { title, description, tags[], caption, threads_text }.
 * Platforms that already succeeded for a label are skipped unless --force is set.
 */
const fs = require('fs');
const path = require('path');
require('./src/config');
const tracker = require('./src/tracker');
const { uploadYouTube } = require('./src/youtube');
const { uploadInstagram, uploadThreads } = require('./src/meta');
const { hostFile } = require('./src/host');

const argv = process.argv.slice(2);
const arg = (f) => { const i = argv.indexOf(f); return i !== -1 ? argv[i + 1] : null; };
const flag = (f) => argv.includes(f);

async function main() {
  await tracker.init();

  if (flag('--history')) {
    console.table(await tracker.history());
    return;
  }

  const video = arg('--video');
  if (!video || !fs.existsSync(video)) {
    console.error('Usage: node upload.js --video <file.mp4> [--label id] [--platforms youtube,instagram,threads] ...');
    process.exit(1);
  }
  const meta = arg('--meta') ? JSON.parse(fs.readFileSync(arg('--meta'), 'utf8')) : {};
  const label = arg('--label') || path.basename(video, path.extname(video));
  const title = arg('--title') || meta.title;
  const description = arg('--description') || meta.description || '';
  const tags = (arg('--tags') ? arg('--tags').split(',').map((t) => t.trim()) : meta.tags) || [];
  const caption = arg('--caption') || meta.caption || description;
  const threadsText = arg('--threads-text') || meta.threads_text || caption;
  const thumbnail = arg('--thumbnail');
  const privacy = arg('--privacy') || 'public';
  const platforms = (arg('--platforms') || 'youtube,instagram,threads').split(',').map((p) => p.trim().toLowerCase());

  // Host once, reuse for Instagram and Threads.
  let videoUrl, coverUrl;
  const needsPublicUrl = platforms.includes('instagram') || platforms.includes('threads');
  const publicUrls = async () => {
    if (!videoUrl) {
      console.log('   Hosting video on Cloudinary...');
      videoUrl = await hostFile(video);
      if (thumbnail && fs.existsSync(thumbnail)) coverUrl = await hostFile(thumbnail, { image: true });
    }
  };

  const jobs = {
    youtube: () => uploadYouTube({ video, title, description, tags, thumbnail, privacy }),
    instagram: async () => { await publicUrls(); return uploadInstagram({ videoUrl, coverUrl, caption }); },
    threads: async () => { await publicUrls(); return uploadThreads({ videoUrl, text: threadsText }); },
  };

  for (const p of platforms) {
    if (!jobs[p]) { console.warn(`Unknown platform "${p}", skipping`); continue; }
    if (!flag('--force') && await tracker.alreadyPosted(label, p)) {
      console.log(`${p}: already posted for "${label}", skipping (use --force to repost)`);
      continue;
    }
    console.log(`${p}: uploading...`);
    try {
      const url = await jobs[p]();
      console.log(`${p}: done ${url}`);
      await tracker.record(label, p, 'SUCCESS', url);
    } catch (e) {
      console.error(`${p}: failed: ${e.message}`);
      await tracker.record(label, p, 'FAILED', null, e.message);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
