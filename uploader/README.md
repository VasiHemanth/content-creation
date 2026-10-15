# social-uploader

Uploads one video to YouTube Shorts, Instagram Reels and Threads, and logs each
attempt in a local SQLite file (`tracker.sqlite`). Extracted from the
education_video pipeline with the render, LLM and Drive code removed.

## Setup

    npm install
    cp .env.example .env     # fill in keys
    # put your Google OAuth desktop client JSON at ./client_secret.json

First YouTube upload prints an auth URL; approve it and the token is saved to
`youtube_tokens.json`.

## Use

    node upload.js --video clip.mp4 --label clip-01 \
      --title "Title #Shorts" --description "..." --tags gcp,cloud \
      --caption "IG caption" --threads-text "Threads text" --thumbnail thumb.png

    node upload.js --video clip.mp4 --meta clip.json --platforms youtube
    node upload.js --history

`--meta` JSON: `{ "title", "description", "tags": [], "caption", "threads_text" }`.
A platform that already succeeded for a label is skipped unless `--force`.

## Carousel posts

`post.js` posts one rendered post from `paper-reels/post/` as an Instagram feed carousel: 2 to 10 slides,
JPEG images and MP4 clips, in the order of `out/manifest.json`.

    node post.js --manifest ../paper-reels/posts/<slug>/out/manifest.json --caption "..." \
      [--label <item id>] [--platforms instagram_post] [--dry-run] [--force] [--alt-text]

The normal way is `node paper-reels/bin/reels.mjs publish-post <id>`, which checks the post text, the
`posts` table and the validation file first, then runs this script with `TRACKER_DB` set so the result
lands in `data/content.sqlite`. Run it from `content-creation/`. Run `publish-post <id> --dry-run` first.

**Dry run.** `--dry-run` is fully local. It reads the files, runs every check, prints the caption and the
Graph API calls it would make, and stops. It makes no network call, hosts nothing (Cloudinary links are
public), and does not load `.env`, the tracker, Cloudinary or the Meta code. Exit code 3 if a check fails.

**Checks** (the same ones run before a real upload, which hosts nothing if one fails):

- Every slide file matches the sha256 in the manifest, and the manifest hash is right.
- `out/validation.json` says PASS for exactly these files (`verdict`, `manifest_sha256`).
- 2 to 10 slides. The first slide is an image.
- Images: JPEG magic bytes (a PNG renamed `.jpg` fails), `.jpg` name, 8,000,000 bytes or less, ratio 4:5.
- Videos (ffprobe): MP4, H.264, yuv420p, ratio 4:5, 23 to 60 fps, AAC audio if any (48 kHz or less, 2
  channels or fewer), 3 to 30 s, 100 MB or less. No audio stream is a warning.
- Caption: not empty, 2200 characters or less, 30 hashtags or less, 20 @ tags or less.

Where the limits come from (Meta pages read 2026-10-08): 10 items, the caption limits and the 4:5 crop to the
first item are on Meta's pages for carousels. Meta publishes video duration, size, frame rate and codec only
for story videos (3 to 60 s, 100 MB, 23 to 60 fps, H.264 or HEVC), not for carousel items; those numbers are
used as the best available guide. The 30 s maximum, the 8 MB image size in SI units and the 4:5 ratio are
this project's own rules (`paper-reels/post/SPEC.md`).

**Real run.** Each file is hashed again just before it is hosted on Cloudinary (a file that changed since the
checks stops the run). Then, in order:

1. One child container per slide: `is_carousel_item=true` with `image_url`, or `media_type=VIDEO` and
   `video_url`. No caption on a child.
2. Poll each video child until `status_code` is `FINISHED`. `ERROR` or `EXPIRED` fails with the item number
   and container id. Image containers are ready when the call returns, so they are not polled.
3. The `CAROUSEL` container with `children` (ids, comma separated, in slide order) and the caption. Poll it.
4. `media_publish`, then ask for the permalink.

Polling is every 5 s for up to 60 tries (5 minutes, the longest Meta recommends). Meta recommends asking
once a minute; the 5 s interval is the one the reel code already uses.

**Result.** One row in `posts`: `label` is the item id, `platform` is `instagram_post`. A reel of the same item
uses `instagram`, so the two never share a row, a caption (`post_texts` has the same two keys) or a "skip,
already posted" check. `threads_post` is reserved and refused. Two cases are recorded on purpose:

- The carousel went live but the permalink lookup failed: recorded as `SUCCESS` with no URL and the error
  text, so a retry cannot post it twice. Find the post on the profile.
- `media_publish` got no response: recorded as `FAILED`, but the post may be live. The error says to check the
  profile before trying again.

**Refuses.** A real run does nothing without a PASS in `out/validation.json` for the exact files, and does
nothing when `REELS_NO_PUBLISH` is set. `--force` only skips the "already posted" check. `--alt-text` sends
each image's alt text as `alt_text` on its child container. It is off because `paper-reels/post/SPEC.md` says
carousels cannot carry alt text, while Meta's `ig-user/media` reference says image items in a carousel can;
it has not been tried against a live account.

Exit codes: 0 done (or dry run passed, or skipped as already posted), 1 usage error or upload failure,
3 a check failed.

Tests: `node --test paper-reels/tests/post-uploader.test.mjs` (the Graph API and Cloudinary are faked, and
every network connection is blocked).

## Notes

- Instagram and Threads pull the video from a public URL, so the file is hosted on
  Cloudinary first. `CLOUDINARY_CLOUD_NAME` is required.
- Threads has its own token and user id (`THREADS_ACCESS_TOKEN`, `THREADS_USER_ID`),
  created under the Threads use case of your Meta app. It is not the Instagram token.
- `npm run token:check` / `token:refresh` inspect and extend the Meta token (60 days).
- Changes from the original: real permalinks for Instagram, a loopback OAuth
  redirect for YouTube (the paste-the-code flow is deprecated), refreshed YouTube
  tokens are saved, Facebook upload dropped.
- Threads code is untested against a live account.
