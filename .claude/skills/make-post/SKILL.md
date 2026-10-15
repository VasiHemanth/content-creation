---
name: make-post
description: Run the post pipeline for one topic, paper or link: direct, produce, validate, show the slides to the human, then publish an Instagram carousel only after approval. Use when the user wants a social post (infographic carousel, optionally with an embedded video slide) rather than a reel.
---

Argument: a URL (a paper, an article, a tweet) or a topic in words, and optionally the post slug.

Posts are carousels of 4:5 slides (1080 x 1350) made by `paper-reels/post/`. The spec is `paper-reels/post/SPEC.md`. For a reel, use `/make-reel` instead.

1. Read the source yourself first (for a tweet or an article, fetch it; if X blocks the fetch, use a public mirror and say so). Pick a slug (`kebab-case`). Spawn `post-director` with the source, what it said and the slug. It writes `treatment.md` and `research.md`. Read the hook; if it is a topic label rather than a claim, send it back once.
2. Spawn `post-producer` with the slug and the treatment path. Wait for its report.
3. Spawn `post-validator` for the item id. On FAIL, send the failures to `post-producer` and validate again. Stop after three rounds and report what is still failing.
4. Show the human the contact sheet, each slide, the caption and the validator's verdict. Publishing needs the human's explicit yes for this post. Never publish on a general instruction given before the slides existed.
5. On an explicit yes in chat, record it yourself: `node paper-reels/bin/reels.mjs approve <id> --post --platforms instagram_post --quote "<the human's exact words>"`. Then spawn `post-publisher`; it checks that record, because it cannot see the chat. Never run `approve` without the human's yes for these slides. If the slides change after the yes, show them again and ask again: the record goes stale. Report the URL, or what is waiting on the human.

Never skip validation. Never let the producer judge its own output. Never publish without the human having seen the slides. Never run two renders of one post at once.
