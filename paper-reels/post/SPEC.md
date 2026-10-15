# Posts engine v1: spec

Written 2026-10-08 by the main session. Three workers read this file: the renderer (track A), the registry and uploader (track B) and the content director (track C). If a worker finds a problem in this file, it reports the problem and does not deviate silently.

## Purpose

Static social posts made by the same pipeline as the reels: infographics in the blueprint look, copy in the STE narration profile, and an optional embedded video slide. The video engine (`paper-reels/hf/`) is unchanged. The first post is an ASD-STE100 prompting guide, item id `asd-ste100-prompting-guide` (kind `topic`).

## v1 scope

- Target: one Instagram feed carousel. Platform key `instagram_post`.
- Not in v1: Threads (no credentials in `uploader/.env`; the key `threads_post` is reserved), YouTube (no image-post API), X, LinkedIn, autopublish for posts.
- Every slide is 4:5, 1080 x 1350. Between 2 and 10 slides. Slide kinds:
  - `image`: an HTML slide captured by HyperFrames to PNG, then converted to JPEG (quality 92, sRGB, 8 MB or less).
  - `video`: an excerpt of a registered reel (9x16 episode in the database), placed in a 4:5 frame without cropping (see "Video slides").

## Instagram facts (official page, read 2026-10-08)

Source: https://developers.facebook.com/documentation/instagram-platform/content-publishing

- A carousel holds up to 10 images, videos, or a mix of the two.
- JPEG is the only supported image format.
- Each child container is created with `is_carousel_item=true`. The carousel container uses `media_type=CAROUSEL` and `children` (comma-separated container ids). `media_publish` takes `creation_id`.
- All carousel items are cropped to the first item's aspect ratio (default 1:1). So slide 1 and every video must be 4:5.
- An account may publish 50 posts in 24 hours; a carousel counts as one.
- `alt_text` is not available for carousels. The caption must carry the key text.
- Not found on that page, so unverified: the video duration limits and aspect-ratio range for carousel children (a third-party summary says 3 to 60 s and 4:5 to 1.91:1). Check https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-user/media before relying on them. Our own rule is 30 s or less per video slide.

## Folders and who may write what

| Path | Owner | Content |
|---|---|---|
| `paper-reels/post/**` | A | Engine code: builder, kit, CLI, validator, tests, README. |
| `paper-reels/posts/_sample/**` | A | A sample post that exercises every feature. |
| `lib/db.mjs`, `paper-reels/bin/reels.mjs`, `uploader/src/*`, `uploader/post.js`, `uploader/README.md`, `paper-reels/tests/` | B | Database, CLI, uploader. |
| `paper-reels/posts/asd-ste100-prompting-guide/treatment.md` and `research.md` | C | Content brief and research. |
| everything else, including `paper-reels/hf/`, `paper-reels/engine/`, `paper-reels/episodes/`, `llm-wiki/` | nobody | Read only. Import from `hf/` freely, never edit it. |

Never run two writers on one file. Never publish. Never call Meta, Cloudinary or any other posting service. Do not add npm or pip dependencies; use node, ffmpeg, the pinned HyperFrames CLI (`hf/lib/hfcli.mjs`) and what is already installed. Run every step in the foreground.

## A post folder (`paper-reels/posts/<slug>/`)

| File | Content |
|---|---|
| `treatment.md` | Content brief from the director. |
| `post.json` | The storyboard (below). |
| `slides/<id>.html` | One bare `<template>` per `image` slide, static, copy from `post.json` through `data-bind`. |
| `facts.json` | Every number on a slide, with its source or how it was computed. |
| `sources.json` | Sources: url, what it supports, access date. |
| `out/` | Generated: `slides/<id>.png`, `<id>.jpg`, `<id>.mp4`, `manifest.json`, `validation.json`, contact sheet. |

### post.json

    { "item": "asd-ste100-prompting-guide", "kind": "post", "name": "ASD-STE100 prompting guide", "format": "4x5",
      "ste": { "names": [], "terms": [{ "term": "...", "avoid": ["..."] }], "allow": [{ "slide": "s03", "rule": "passive", "why": "..." }],
               "examples": [{ "slide": "s05", "key": "x_before", "why": "typical model prose, shown on purpose" }] },
      "slides": [
        { "id": "s01", "kind": "image", "alt": "plain description for a screen reader",
          "data": { "hook": "...", "x_before": "...", "_bar": 0.4 } },
        { "id": "s07", "kind": "video", "alt": "...", "source": { "item": "2609.14858", "from": 0, "to": 18 },
          "data": { "title": "..." } } ] }

Rules for `data`:

- Every printed word and number comes from `data` (QA fails an HTML slide that types words or digits itself, as for reels).
- A key that starts with `_` is for drawing only (a bar length). It is never printed.
- A key that starts with `x_` holds a deliberate counter-example (text that breaks STE on purpose, such as a rejected sentence). It is exempt from the STE check, but each one must be declared in `ste.examples` with a `why`, and the slide must label it visibly (for example "Not STE").
- All other string values are checked by the STE profile, one string at a time, with the same hard and soft rules as reel narration (`hf/bin/ste.mjs`: import `checkLine`; do not edit that file). The first and the last slide skip the soft rules.

### out/manifest.json

    { "item": "...", "format": "4x5", "w": 1080, "h": 1350,
      "slides": [ { "idx": 0, "id": "s01", "kind": "image", "path": "out/s01.jpg", "alt": "...", "sha256": "..." },
                  { "idx": 6, "id": "s07", "kind": "video", "path": "out/s07.mp4", "alt": "...", "duration_s": 18.0, "sha256": "..." } ],
      "manifest_sha256": "<sha256 of JSON.stringify(slides.map(s => [s.idx, s.kind, s.sha256]))>" }

Paths are relative to the post folder. This file is the contract between the renderer (A) and the registry and uploader (B).

## Video slides

- Source: the registered `9x16` episode of `source.item` (read `episodes.video_path` from the database, read only). The excerpt `from` to `to` is 30 s or less.
- Output: MP4, 1080 x 1350, 30 fps, H.264 High, yuv420p, AAC 44.1 kHz stereo, `-movflags +faststart`. The 9:16 video is scaled to full height (759 x 1350) and centered over a blueprint background slide, with no crop, so the captions stay visible. The audio is kept.

## STE for posts

The text gate uses the narration profile (`hf/ste.json`). A post about STE must show text that breaks the rules. Exemptions are explicit and have a reason: `x_` keys with `ste.examples`, and `ste.allow` entries with a `why` (an entry without a `why` is ignored). A post cannot switch the gate off.

The profile is a measurable subset. It is not the standard: it fails any sentence of more than 20 words, while the standard has separate limits for instructions and descriptions. Do not teach the profile's limits as if they were the standard. Take every number about ASD-STE100 from the official site (https://www.asd-ste100.org) and cite it in `sources.json`. The specification is copyrighted by ASD: state facts and limits, never reproduce rule text or dictionary entries. Label the post "unofficial guide".

## Database (track B)

- New table `post_assets (item_id, format, idx, kind, path, alt, sha256, duration_s)`, key `(item_id, format, idx)`, and a small `post_sets (item_id, format, dir, manifest_sha256, slide_count, rendered_at)`. Additive and idempotent (`CREATE TABLE IF NOT EXISTS`).
- Platform keys `instagram_post` and `threads_post` in `post_texts` and in `posts`. A post for an item that also has a reel must never reuse the reel's text or collide with its `posts` rows.
- `reels.mjs add-topic <slug> --title ... --url ... --topic ... --name ...` creates a `kind='topic'` item without an arXiv fetch.
- `reels.mjs post register <id> <postDir>` reads `out/manifest.json`, checks that each file's hash matches, and writes the rows.
- `reels.mjs text <id> instagram_post --body ...` works like the existing `text` command.
- `reels.mjs review <id> --kind facts|validator|critic --verdict PASS|FAIL --post` stores `manifest_sha256` in `reviews.video_sha256` (document this in a comment).
- `reels.mjs show <id>` also prints the post assets.
- `reels.mjs publish-post <id> [--platforms instagram_post] [--dry-run] [--force]` is the only way to post. It has no bypass flag. It refuses unless: `REELS_NO_PUBLISH` is unset; `out/validation.json` says PASS and its manifest hash equals the hash recomputed from the files and the database rows; post text exists for each platform; no platform already has a SUCCESS post (unless `--force`).

## Uploader (track B)

- `uploader/src/meta.js`: `uploadInstagramCarousel({ items, caption })`. For each child: create the container with `is_carousel_item=true` (`image_url`, or `media_type=VIDEO` and `video_url`); poll video children until `status_code` is `FINISHED` (fail on `ERROR`, with a timeout); create the `CAROUSEL` container with `children`; poll it; then `media_publish`. Follow the existing style in that file.
- `uploader/post.js`: a CLI like `upload.js` (`--manifest`, `--caption`, `--label`, `--platforms`, `--dry-run`, `--force`). Each file is hosted through the existing `host.js` (Cloudinary) before the containers are created. Results go to the `posts` table with label = item id and platform `instagram_post`.
- `--dry-run` is fully local. It makes no network call and hosts nothing, because Cloudinary links are public. It checks: JPEG magic bytes and size of each image (8 MB or less), ratio 4:5, video codec, size, ratio and duration with ffprobe, 2 to 10 items, first item is an image, caption length (2200 characters or less, at most 30 hashtags). It prints the API calls it would make.
- A real run happens only after the human has seen the rendered slides and said to post. Nobody runs it before then.

## Gates (track A)

`post/bin/validate-post.mjs <postDir>` writes `out/validation.json` (PASS or FAIL, per-check results, `manifest_sha256`). Checks:

- Every manifest file exists and its hash matches.
- Slide count 2 to 10, every image is a JPEG that decodes, every size is 1080 x 1350, 8 MB or less. Every video is 4:5, H.264, AAC, 30 s or less, and starts with a visible frame.
- No blank slide. HyperFrames layout and contrast check passes (no clipped or overlapping text).
- STE: zero hard findings (with the exemptions above). `x_` examples are declared, have a `why`, and are visibly labelled.
- Facts: every number printed on a slide is in `facts.json`. No copy typed into slide HTML.
- Branding: the only on-screen identity is `hemanth_with_ai` (last slide). An "unofficial guide" label appears.
- Slide 1 is readable as a grid cover: its key text sits inside the central 3:4 area.

## Look

Blueprint, as the reels (`hf/kit/blueprint.css`, fonts, palette). Small text on a phone: body 38 px or more, headings 72 px or more, margin 70 px. Do not copy the layout or the artwork of any third-party image. No animation (static frames), but each slide is still a HyperFrames composition so the same fonts, `check` and snapshots apply.

## Reports

Each worker ends with: files created or changed, commands to run, test results, decisions that were not in this file, and open questions.
