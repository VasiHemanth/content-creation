# Scion v2: about 25 million checkouts a day

Source: [Redesigning source control at Anthropic](https://www.anthropic.com/engineering/redesigning-source-control), Anthropic Engineering, published 2026-10-13. Item `anthropic-scion`, kind `topic`. This is an engineering blog post. Every number in it is reported by Anthropic about its own systems. None of them is an independent benchmark.

Read for this treatment: the full article (`llm-wiki/raw/assets/anthropic-scion/article-text.txt`) and its six figures (I downloaded them and checked every row); the Codex version (`episodes/scionSourceControl/`: treatment, storyboard, `out/hf/validation.json`); `hf/README.md`, `engine/BLOCKS.md` v2, `PIPELINE.md`, `hf/ste.json`; the DeepSWE `lock.html` scene; and the wiki topic `scion-source-control.md`.

This is a rebuild. Do not edit `episodes/scionSourceControl/`, because we keep it for comparison.

## Needs the owner's yes

- **Two numbers outside the approved list:** "about 7 min" and "about 5 s". They come from the article's performance figure (Agent environments, "New worktree" row, git 7.1 min against scn 5.1 s, median). They carry the minutes-to-seconds clock wipe, because the approved "two orders of magnitude (seconds rather than minutes)" does not match the article's own per-row CI medians (see caveat 2). If the owner says no, the clock wipe shows "minutes" and "seconds" as words, attributed to the article, with no CI label and no multiplier.
- **Quote budget counted strictly:** figure text that can be read counts against the 25 words, the same as prose. The plan totals exactly 25 (section 4). If the owner counts figure labels as images and not quotes, add the three tier names from the checkout-architecture figure (3 words; see the swap note in section 4).

## What changes from the Codex version (and why)

| Codex defect | Fix in this treatment |
|---|---|
| First visual event came at 6.0 s. There was a 7.3 s gap at 61 s, and the video had 28 events/min. | Frame 0 holds big type and a moving flood of checkout tiles across the lower half, so the first large-area event comes by 0.3 s. Every beat below names its **large-area** change. The gate samples at 4 fps and needs a mean grey change of more than 3 levels, so thin lines, small tags and caption changes do not count. The payoff and caveat stretch gets camera moves and full-panel entrances, not label fades. Planned: 66 events in about 73 s, longest gap 1.5 s. |
| The bottom 40% of frames was empty. | Each scene uses the full band from y 170 to 1450. The checkout path is a **vertical** stack: jobs at the bottom, then scion-daemon, then scion-cache, then scion-server near the top. The request climbs the screen, so the 9:16 frame holds the whole path. |
| Labels were about 20 px. | Minimum text is 40 px. Tier names are 64 px mono. Hero numbers are 180 to 220 px. Supporting numbers are 64 px or less, inside tags. Tags are 44 to 56 px. |
| Cube icons covered the tier names. | Each tier band has a fixed left gutter for its name (x 80 to 560) and a separate icon zone on the right (x 600 to 900, and x 920 or less where y is 1000 to 1700). No icon, token or card ever passes over a label. Receipt cards go only where the scene first clears the space (see the shot list). |
| The Git box was empty. | Git appears as a dense field of several hundred mirror icons, and later as the top half of the before/after. It never appears as an empty box. |
| The same headline card stayed up for about 7 beats. | Each line changes the main picture. No headline card stays on screen for more than one line. |
| The 200x frame had no comparison. | A drawn area comparison: a 200-unit block for the old Git mirrors against a 1-unit block for Scion, with sides in the ratio sqrt(200). Before that, a split frame puts the mirror field above the three-tier stack. |
| The look was flat cream on navy. | The blueprint family stays (navy, ink lines, mono labels). The change: tinted tier bands (daemon, cache and server each get their own tint), amber for requests, mint for cache hits, coral for the old Git mirrors and misses, and cream paper cards only for article captures. |
| Length was 81.5 s, and about 15 s went to what Scion is not. | 13 lines, 175 written words (187 spoken), about 71 to 76 s. Scope gets one line (l13), plus one clause in l03 about Git's own tools. |
| The warehouse metaphor replaced the real terms. | No term swaps. The voice says trees, blobs, scion-daemon, scion-cache, scion-server, changeset and derived data, and the same words are the on-screen labels. The metaphors (below) are pictures that sit **behind** the real labels. |

## 1. The one idea

Scion serves about 25 million checkouts a day by having each job ask three cache tiers for only the trees and blobs it needs, which never change.

## 2. Hook options

The hook words appear on frame 0.0 in big type, and the thumbnail uses the same words. Neither "Scion" nor the article title is the largest text in the first 2 s.

| # | Spoken line (12 words or fewer) | On screen at 0.0 s | Type |
|---|---|---|---|
| **A (recommended)** | "How do you serve about twenty five million C I checkouts a day?" | Top: "ABOUT 25 MILLION CHECKOUTS A DAY" at 140 px, with "HOW?" under it at 220 px, amber. Lower half: amber checkout tiles already flood upward into a narrow neck (the Git mirrors). The flood moves from the first frame. | Question with stakes |
| B | "One September day, Anthropic merged over thirty thousand changes. What broke?" | "OVER 30,000 CHANGES IN ONE DAY" plus the real September bars rising. | Surprise and question |
| C | "Agents write code faster than source control can serve it." | A flood of code tiles jams a narrow Git neck. | Claim |

**Pick A.** It is the article's central problem in plain words: how a source-control system serves a load this large. The memory file asks for the central question, not an example, and the owner suggested this one. The stake (a very large number) and the question both sit in one line. The answer is the whole video (three tiers, objects that never change), so the viewer stays to get it. A is also true as worded: the article says "on the order of 25 million code checkouts per day for CI", which is why both the voice and the screen say "about" and the voice says "CI".

Why not B: 30,000 is a single-day peak (see the numbers budget), and "what broke" invites an outage story the article does not tell. Why not C: it is vaguer, and "faster than source control can serve it" is our wording, not a stated result.

Thumbnail: the same words, "ABOUT 25 MILLION CHECKOUTS A DAY. HOW?" (see section 10).

## 3. Visual metaphors (one per idea; they carry the terms and never replace them)

| Idea | Metaphor | Scene | Guard |
|---|---|---|---|
| Old way: every mirror holds the whole repo, and that does not scale | **A field of several hundred identical mirror icons**, each with a disk gauge and a memory gauge that fill to the top | `mirrors` (l03), and again in `result` (l10, the before half) | The count is not exact: about 250 icons drawn as "several hundred", with no digit on screen. The gauges show "outgrew disks and memory", not an outage. Nothing breaks, burns or goes red-X. |
| New way: three tiers catch almost every request | **A three-stage sieve.** Requests rise from the jobs, each tier band catches nearly all of them (the dots turn mint), and only a thin amber trickle passes up to the next tier | `path` (l06, l07), and `result` (l08) with the hit counter | The trickle stays visibly thin, about 1 dot in 100 per tier, and the label says "over 99%". The sieve makes no claim about speed. |
| Objects never change, so any cache can answer | **A sealed object.** Each tree or blob carries a wax-seal stamp the moment it exists. Copies of the same sealed object sit in all three tiers and look identical. | `path` (l07) | No hash strings and no invented IDs. The seal is a symbol, not text. |
| Minutes to seconds | **A clock wipe.** A large dial fills a coral wedge to about 7 minutes, then a radial wipe erases it and leaves a thin mint sliver at about 5 seconds | `result` (l09) | This is the per-row median for one named operation (new agent worktree), not "all checkouts". |

The real terms stay on screen as labels at full size: `trees`, `blobs`, `scion-daemon`, `scion-cache`, `scion-server`, `changeset`, `derived data`, `Git mirrors`.

## 4. Receipts (live article captures, 2x DPR)

**Method.** `hf.mjs evidence` reads PDFs only, so this episode needs a producer-side capture script; `episodes/scionSourceControl/crop-evidence.py` is a model. Use headless Chrome on the live URL with viewport width 1280 and `deviceScaleFactor: 2`.
- **Text phrases:** find the exact phrase in the DOM, wrap it in a `Range`, take `getClientRects()`, pad by 10 CSS px, and screenshot that clip. Each crop holds the phrase only and no neighbouring words. Write the rects (scaled 2x) into `evidence/manifest.json` as highlight boxes so `KIT.read` can sync the highlighter. Use `follow: 0` and left-align the highlight at x of about 90.
- **Figure:** screenshot the `<figure>` that holds the merges chart, then crop it (coordinates below).
- **Exception:** `hf/README.md` says text passages only. The owner asked for figures, so this episode uses one tightly cropped chart. pdfium cannot read raster digits, so the producer types its two digit groups into `facts.json` under `evidence_incidental` by hand.

**Sync rule for every receipt.** The card enters on the spoken word that matches its first highlighted word. Every highlighted word is in that line's `say`, because `KIT.cue` throws on a word that is not spoken:

| Highlight | Spoken words that carry it |
|---|---|
| "200x" | "two hundred" |
| "CPU" | "C P U" |
| "no." | "no" |

### Text receipts (verbatim on screen and nearly verbatim in the voice)

| ID | Exact text highlighted | Article location | Line, and cue words | Hold |
|---|---|---|---|---|
| `cache` | any cache can answer | "Scaling Scion", paragraph on scn client negotiation ("Every request is for a specific object that never changes, so any cache can answer it.") | l07 "So any cache can answer." Card enters on "any"; marks on any, cache, can, answer | about 1.8 s |
| `footprint` | 200x smaller · CPU and memory (two tight crops of the same sentence, stacked on one card) | "Scaling Scion", paragraph after "Scion's checkout architecture" | l10 "...is two hundred times smaller in C P U and memory..." Card enters on "two"; marks "200x" on "two hundred", "smaller" on "smaller"; second crop "CPU and memory" on "C", "and", "memory" | about 2.2 s |
| `no` | tell Claude "no." | "What we learned building Scion", "Engineers are no less valuable..." paragraph | l12 "Engineers often had to tell Claude no." Card enters on "tell" | about 1.6 s |
| `scope` | by no means a suitable replacement for git | "Contributing to the wider ecosystem", third paragraph | l13 first sentence. Card enters on "by" | about 2 s |

### Figure capture (shown as a picture, not read aloud)

| ID | Figure (figcaption) | Line | Crop | Text legible in the crop |
|---|---|---|---|---|
| `merges` | "Changes merged to our monorepo per day, from January to September 2026." | l02 | The early-August to Sep 9 bars only. In the 1400 px-wide figure that is about x 1160 to 1330 and y 235 to 625: above the month axis, right of the "Quiet week" note and the y-axis labels, without the legend and title. It is a tall, narrow strip that fits 9:16, with the spike at the top. | the callout "30,401 merged on Sep 9" only (5 tokens). Register 30,401 and Sep 9 as `evidence_incidental`. |

**Not captured:**
- The performance figure. Its rows include "×207" for `status`, which a viewer could confuse with the 200x footprint, and every one of its digits would need registering.
- The changeset figure. It has dates and hash strings.
- The git-setup figure. The drawn mirror field already carries l03.
- The checkout-architecture figure. Its tier names would add 3 words; see the swap note below.
- Article headings. "Scaling Scion" would add 2 words.

### Quote budget (strict: every legible article word counts, 25 at most)

| Item | Words |
|---|---|
| any cache can answer | 4 |
| 200x smaller | 2 |
| CPU and memory | 3 |
| tell Claude "no." | 3 |
| by no means a suitable replacement for git | 8 |
| `merges` callout: "30,401 merged on Sep 9" | 5 |
| **Total** | **25** |

This uses the whole budget, with no margin. The source credit is an authored tag ("Anthropic Engineering · Oct 13, 2026"), not a capture, and no figcaption text goes under the chart.

**Swap note (only with the owner's yes).** The checkout-architecture figure gives a strong receipt: three tight crops of its blue boxes, the name line only ("scion-daemon", "scion-cache", "scion-server", 3 words). Each crop stamps into its tier's name gutter in l06 and l07 for about 1.2 s, then cross-fades to our 64 px label. To fit it under strict counting, drop the `no` receipt (3 words); the "NO" stamp and the voice still carry l12.

## 5. Narration (STE): final draft

It passes `node paper-reels/hf/bin/ste.mjs` with **0 hard and 0 soft findings** (checked on a scratch storyboard with the `ste` block below). It has 13 lines, 175 written words and 187 spoken. Voice `aiden` at 1.12. That voice ran 2.87 words/s on the Codex Scion script (same terms) and 3.25 on Agent Plasticity. Estimates: **76.0 s at 2.87, 73.2 s at 3.0, 71.2 s at 3.1**.

If the take runs past 75 s, raise the speed to 1.16 (about 73.5 s at the slow pace) before cutting words. If you must cut, cut "So" in l04 or "Now" in l09, never a term.

| id | scene | text (caption) | say |
|---|---|---|---|
| l01 | hook | How do you serve about 25 million CI checkouts a day? | How do you serve about twenty five million C I checkouts a day? |
| l02 | hook | One September day, Anthropic merged over 30,000 changes. | One September day, Anthropic merged over thirty thousand changes. |
| l03 | mirrors | Partial clones and several hundred Git mirrors helped. But the repo outgrew their disks and memory. | (same) |
| l04 | online | Almost all clients are agents and jobs, always online. So Scion moves the work to the server. | (same) |
| l05 | online | The server writes each changeset and computes derived data, such as blame. | (same) |
| l06 | path | One checkout asks scion-daemon for only the trees and blobs it needs. | One checkout asks Scion daemon for only the trees and blobs it needs. |
| l07 | path | Misses go to scion-cache, then scion-server. Trees and blobs never change. So any cache can answer. | Misses go to Scion cache, then Scion server. Trees and blobs never change. So any cache can answer. |
| l08 | result | Anthropic reports over 99% cache hits on every tier. | Anthropic reports over ninety nine percent cache hits on every tier. |
| l09 | result | A new agent worktree took about 7 minutes. Now it takes about 5 seconds. | A new agent worktree took about seven minutes. Now it takes about five seconds. |
| l10 | result | Scion infrastructure is 200 times smaller in CPU and memory than the old Git mirrors. | Scion infrastructure is two hundred times smaller in C P U and memory than the old Git mirrors. |
| l11 | claude | A Claude rewrite of one prototype used 20 times less memory. | A Claude rewrite of one prototype used twenty times less memory. |
| l12 | claude | Claude sometimes broke the core rules. Engineers often had to tell Claude no. | (same) |
| l13 | scope | Scion is by no means a suitable replacement for Git for general use. It serves about 25 million checkouts a day. | Scion is by no means a suitable replacement for Git for general use. It serves about twenty five million checkouts a day. |

Pronunciation: Scion is "SIGH-on". Spell CI and CPU as letters. Read the hyphenated names as "Scion daemon", "Scion cache" and "Scion server". After `words`, check that whisper heard "daemon" and not "demon". If it did not, try another seed.

Model name: "Claude" is spoken because the point (Claude rewrote part of the system, and engineers had to correct it) depends on it. "Claude Mythos Preview · early internal snapshot" appears **only as an on-screen label** in l11.

The approved "seven people, five months" line is cut to bring the take near 73 s. The caption carries it (see section 11).

### `ste` block for storyboard.json

```json
"ste": {
  "names": ["Anthropic", "Scion", "Git", "CI", "CPU", "Claude", "scion-daemon", "scion-cache", "scion-server", "Spanner"],
  "terms": [
    { "term": "changeset", "avoid": ["change set", "patch", "diff"] },
    { "term": "trees", "avoid": ["directories", "folders", "directory objects"] },
    { "term": "blobs", "avoid": ["file contents", "file objects", "payloads"] },
    { "term": "derived data", "avoid": ["indexes", "indices", "metadata"] },
    { "term": "checkouts", "avoid": ["fetches", "pulls", "downloads"] },
    { "term": "Git mirrors", "avoid": ["mirror servers", "replicas", "mirror fleet"] },
    { "term": "footprint", "avoid": ["cost", "savings", "bill"] },
    { "term": "node", "avoid": ["machine", "host", "box"] }
  ],
  "allow": []
}
```

On-screen labels use the same words. "Partial clones" is a separate Git feature, not a synonym for checkouts. "Never change" is the only wording for immutability: do not print "immutable" next to it.

## 6. Shot list

The times are targets at 3.0 words/s (line starts: l01 0.0, l02 5.1, l03 8.8, l04 14.9, l05 21.3, l06 26.1, l07 31.2, l08 37.9, l09 42.3, l10 47.7, l11 54.5, l12 58.9, l13 64.0, end 72.1 to 73.2). After `words`, remap each beat to the spoken-word cue in the "On word" column, not to the second. **Number** is the number on screen during the beat. **Large-area change** is what the 4 fps gate will see.

Layout constants for every scene:
- Content stays in y 170 to 1450, and captions in y 1490 to 1586.
- x > 940 stays clear for y 1000 to 1700.
- Text is 40 px or larger.
- Tier names are 64 px mono in a left gutter, and nothing moves over them.
- Supporting numbers are 64 px or less, inside tags, with no impact sound. Only the four hero numbers get big type and impacts.

| Scene / line | t (s) | On word | What appears or moves (camera) | Large-area change | Number on screen | Out |
|---|---|---|---|---|---|---|
| hook / l01 | 0.0 | (before voice) | Hook type is already on screen: "ABOUT 25 MILLION CHECKOUTS A DAY" 140 px (y 200 to 560), "HOW?" 220 px amber (y 580 to 760). Lower half (y 800 to 1450): rows of amber checkout tiles already move up into a narrow coral neck labelled "Git mirrors" (48 px, left gutter). | tile flood over the lower 40% | about 25 million | |
| | 0.3 | | The flood speeds up and tiles stack under the neck. | tiles fill rows | about 25 million | |
| | 1.6 | twenty | "25 MILLION" scale-punches 1.0 to 1.12 to 1.0 (riser ends here, impact). | headline punch | about 25 million | |
| | 2.9 | checkouts | Camera pushes 1.0 to 1.15 toward the jammed neck. The tile pile reaches the neck mouth. | camera move on a dense frame | about 25 million | |
| | 4.1 | day | Tag "CI alone · Anthropic's estimate" (48 px) slides in from the left at y 770, under "HOW?". | panel entry | about 25 million | |
| hook / l02 | 5.2 | September | Whip-pan to the `merges` strip on a cream card (x 290 to 790, y 200 to 1100). Tag "Anthropic's chart · changes merged per day" 40 px under it. | cream card over about 25% of frame, navy to cream | 30,401 (in crop) | |
| | 6.3 | merged | Camera rises up the bars to the spike. A mint ring circles the callout. | camera move | 30,401 (in crop) | |
| | 7.3 | thirty | "over 30,000 in one day" (180 px, two lines) slams below the card (y 1150 to 1420). | big type block | over 30,000 | |
| | 8.3 | changes | The card and type tilt 4 degrees as the whip begins. | frame-wide motion | over 30,000 | whip |
| mirrors / l03 | 8.9 | Partial | Whip in. A field of about 250 mirror icons builds bottom to top in a 0.8 s wave (y 330 to 1440). | field fills the frame | | |
| | 10.1 | clones | One mirror pops forward to 2x; a slice of it lights amber, tag "partial clones" 48 px. | element scales up | | |
| | 11.5 | mirrors | Header "several hundred Git mirrors" (64 px, y 200) lands, and the camera pans across the whole field. | camera pan on a dense frame | | |
| | 12.9 | outgrew | Every mirror's two gauges (disk, memory) fill to the top in coral, in a wave from the bottom. Tags "disk" and "memory" 44 px. | colour change across the field | | |
| | 14.2 | memory | Camera pulls back; the field dims to 40%. | pull-back plus dim | | whip |
| online / l04 | 14.9 | clients | Whip in. A 6 x 4 grid of agent and job icons (y 520 to 1300). Labels "agents" and "jobs" at 56 px above their columns. | grid entry | | |
| | 16.3 | online | Each icon gets a mint "online" dot; all dots pulse together. "ALWAYS ONLINE" 110 px slams at y 300. | type block plus pulse | | |
| | 17.8 | So | Thick cables (8 px) draw from every icon up to one big `scion-server` block (y 180 to 420, 64 px mono name, tinted fill). "ALWAYS ONLINE" slides out to make room. | server block fill | | |
| | 19.2 | work | Work glyphs (commit, merge, history) slide up the cables into the server. The agent grid scales down to 70%. Camera tilts up. | camera tilt plus grid scale | | |
| | 20.5 | server | The server block flashes cyan, and the camera settles on it. | flash on a large block | | cut |
| online / l05 | 21.4 | writes | The server block opens wide (y 300 to 1150). Inside, a `changeset` card: header "changeset" (64 px), three rows "changed file" with sealed icons on the right, footer "only the changed files" (44 px). | panel opens | | |
| | 22.7 | changeset | A chain of three changeset cards slides in from the left (parent to child), joined by arrows. | cards slide | | |
| | 24.0 | derived | Arrows grow down from each changeset into a "derived data" shelf (y 1180 to 1440) with tiles "blame" and "path history" (48 px). | lower band fills | | |
| | 25.2 | blame | The "blame" tile pulses. Camera zooms toward a job icon at bottom right. | zoom | | zoom |
| path / l06 | 26.2 | checkout | Zoom lands on the vertical stack. It builds bottom up: jobs row (y 1260 to 1440), then the `scion-daemon` band (y 980 to 1200, tint A, "per node" 44 px). | two bands fill | | |
| | 27.4 | Scion daemon | The `scion-cache` band (y 680 to 900, tint B, "regional") and the `scion-server` band (y 380 to 600, tint C) drop in. Spanner and cloud storage tags sit above, y 190 to 300. | two more bands | | |
| | 28.6 | trees | Camera dives to the jobs row. A card in the right zone (x 600 to 900, y 1000 to 1440) unfolds a tree glyph: root tree, then child trees. Label "trees" 56 px. The daemon label is above the card, not under it. | card plus camera | | |
| | 29.8 | blobs | Blob boxes appear under the tree leaves, each with a seal. Label "blobs". Most branches grey out; two stay amber (only what it needs). | half the card dims | | |
| | 30.8 | needs | Camera pulls back to the full stack. An amber request token rises to the daemon band in the right lane. | camera pull-back | | cut |
| path / l07 | 31.3 | Misses | Daemon slots: most are filled mint, one is a dashed empty slot. The token passes the daemon on a thick amber trail. | trail plus slots | | |
| | 32.4 | Scion cache | Camera tilts up with the token to the cache band. The cache band flashes, but it also has an empty slot. | camera tilt | | |
| | 33.6 | Scion server | The token reaches the server band. The server glows, and a dashed line drops to cloud storage. | band glow | | |
| | 34.9 | never | The sealed object falls back down. It leaves an identical sealed copy in the server, cache and daemon slots, filling each one mint in turn (tick per tier). | three slot fills | | |
| | 36.0 | any | The whole stack scales to 60% and slides down to y 860 to 1440, labels and all. Receipt `cache` rises into the cleared space (cream, y 360 to 640). The highlighter follows "any cache can answer". | stack moves plus cream card | | |
| | 37.2 | answer | The card drops and the stack returns to full size. A second job's request stops at the daemon, which flashes mint (chime); no trail goes up. | stack scale plus band flash | | punch |
| result / l08 | 38.0 | Anthropic | Punch in. The three tier bands widen to the full frame. Each holds its name (64 px) on the top line of the gutter, a counter at "0" (96 px) under it, and a 10 x 10 dot grid in the right zone. | three grids appear | | |
| | 39.0 | ninety | The grids fill mint row by row as the three counters roll. | grids fill | counting to 99 | |
| | 40.4 | percent | The counters lock to "over 99%", one per tier (impact). One amber dot per grid keeps rising to the next tier: the sieve trickle. | type change plus dot motion | over 99% | |
| | 41.5 | tier | Camera pans bottom to top across the three counters. | camera move | over 99% | cut |
| result / l09 | 42.4 | worktree | A large dial (r 380, centre y 800). Label "new agent worktree · median" 48 px at y 260. "Git" tag on the left. | dial entry | | |
| | 43.6 | seven | A coral wedge sweeps to the tag "about 7 min" (64 px). | wedge fills about 40% of the dial | about 7 min | |
| | 45.0 | Now | Clock wipe: a radial mint wipe erases the coral wedge. | radial wipe | about 7 min | |
| | 46.2 | five | A thin mint sliver with the tag "about 5 s" (64 px). The "Scion" tag stamps in. Tag "Anthropic's figure" 40 px. | type plus sliver | about 5 s | |
| | 47.0 | seconds | Camera push 1.0 to 1.1 on the dial. | camera move | about 5 s | cut |
| result / l10 | 47.8 | Scion | Split frame. Top (y 200 to 760): the mirror field from l03, coral, "old Git mirrors" 56 px. Bottom (y 900 to 1440): the three-tier stack, small, "Scion" 56 px. | two halves fill | | |
| | 48.6 | two | Both halves slide apart (top up to y 170 to 520, bottom down to y 1120 to 1440, labels with them). Receipt `footprint` rises into the cleared middle (cream, y 560 to 1080): "200x smaller" highlighted on "two hundred ... smaller". | halves move plus cream card | 200x (in crop) | |
| | 49.8 | C P U | The highlighter moves to the second crop, "CPU and memory". | highlight sweep on the card | 200x (in crop) | |
| | 51.0 | than | The card drops. "200×" (220 px) slams into the middle (impact). | big type | 200× | |
| | 52.3 | mirrors | The halves give way to the area comparison: a coral square of side 700 px ("Git mirrors · CPU + memory") against a mint square of side 700/sqrt(200), about 50 px ("Scion"). Both sides come from `parseFloat(l10.value)`. | big square draws | 200× | |
| | 53.6 | (line end) | The scope tag lands under 200×: "Scion infrastructure vs old Git mirrors · CPU + memory · Anthropic reports" (44 px, two lines). Camera pulls back. | camera plus tag | 200× | whip |
| claude / l11 | 54.6 | Claude | Whip in. Two boxes (y 420 to 1320): left "git-to-Scion ingestion prototype · handwritten", right "Claude rewrite". Label at y 220: "Claude Mythos Preview · early internal snapshot" 44 px. | two boxes | | |
| | 55.8 | prototype | A tall coral memory bar grows in the left box (label "memory"). | bar fills | | |
| | 57.0 | twenty | A mint bar 1/20 of that height (from `parseFloat(l11.value)`) appears in the right box, with the tag "20× less memory" (64 px). | bar plus tag | 20× | |
| | 58.1 | memory | Camera pushes into the rewrite box. | camera move | 20× | cut |
| claude / l12 | 59.0 | Claude | A dashed coral "core rule" line runs the full width at y 900. A Claude-coloured path draws up from y 1400. | path draws | | |
| | 60.3 | broke | The path crosses the rule line, and the line flashes coral. | flash across the frame | | |
| | 61.6 | tell | Receipt `no` (cream, y 300 to 480), above the scene, which starts at y 700. The highlighter is on "tell Claude "no."". A big "NO" stamp (200 px) hits at y 520 to 680 (stamp sfx). | stamp plus card | | |
| | 62.8 | no | The card lifts away. The path retracts below the rule line, and an engineer icon with a pen appears beside it. | path retract | | |
| | 63.6 | (line end) | Camera pulls back while the blur begins. | camera plus blur | | blur |
| scope / l13 | 64.1 | by | Blur in. Receipt `scope` (cream, y 300 to 560) on an empty navy frame. The highlighter is on "by no means a suitable replacement for git". | cream card | | |
| | 65.0 | replacement | Two panel outlines draw and fill under the card (y 700 to 1440). Left: an ordinary Git repo with a laptop. Right: one wide monorepo outline. | two panels fill | | |
| | 66.2 | general | The card lifts away. The panels slide up to fill y 260 to 1440. Left tags: "partial clones", "sparse checkouts" (44 px). Labels "Git" and "Scion" 56 px. | panels move | | |
| | 67.4 | use | The Scion stack inside the right panel glows tier by tier, bottom to top. | three band glows | | |
| | 68.6 | serves | Camera pushes into the right panel. The amber tile flood from 0.0 returns at the bottom. | camera plus flood | | |
| | 69.9 | twenty | "ABOUT 25 MILLION CHECKOUTS A DAY" slams back in the same place and size as frame 0. | big type | about 25 million | |
| | 71.2 | day | "HOW?" fades in as on frame 0. The composition now matches 0.0. | type block | about 25 million | cut |
| end | 72.1 to 73.2 | | End card: only `hemanth_with_ai` (72 px) over the flood silhouette, which keeps moving. | flood motion | | loop |

**Pacing audit.**
- Gaps between planned beats are at most 1.5 s (the longest is 16.3 to 17.8).
- The first event comes at 0.3 s, and the flood moves from 0.0.
- In the stretch where the Codex cut failed (61 to 68 s here), beats come at 61.6, 62.8, 63.6, 64.1, 65.0, 66.2, 67.4 and 68.6. Each is a panel, a stamp, a card or a camera move, not a label fade.
- Receipt holds are the low-motion case for the 4 fps gate. Each one comes with a large move (the stack slides, the halves part, the panels fill) within 1 s.
- Planned event count: 66 in about 73 s, about 54 a minute.
- After the render, check the decoded MP4 with the gate; this audit does not replace it.

**Transitions.** The main one is `whip` (new topic: l02 to mirrors, mirrors to online, result to claude). `zoom` goes into the node (online to path). `punch` lands the payoff (path to result). `blur` winds down into scope. `cut` is used inside topics.

**Sound.** A riser ends on "twenty" in l01, then an impact. A whoosh on each whip. A soft tick for each tier in l07, and a chime on the second job's local hit. Impacts only on the hero numbers: "over 99%" and "200×". The clock-wipe landing gets a soft pop, not an impact, and the 20× tag gets none. A stamp on "no". No alarm sounds, because no outage happened.

## 7. Numbers budget

**Hero numbers (big type and impacts; 4 is the limit):**

| # | On screen | Spoken | Source | Absolute or relative | Measured or theoretical | Whose | Wording guard |
|---|---|---|---|---|---|---|---|
| 1 | about 25 million checkouts a day | about twenty five million C I checkouts a day | "Growing our monorepo": "on the order of 25 million code checkouts per day for CI" | absolute | Anthropic's estimate ("on the order of") | Anthropic | Always "about", on screen and in the voice, with "CI alone" on screen. It is CI only, before developer environments, agent sandboxes and research jobs. |
| 2 | over 30,000 in one day | One September day, Anthropic merged over thirty thousand changes | Opening paragraph: "as of September, we merged over 30,000 per day". The merges-per-day figure labels the peak "30,401 merged on Sep 9". | absolute | measured | Anthropic | **This is a single-day peak.** The figure's 7-day average ends well below it (about 18,000 by eye), so never say "30,000 a day" as a rate. Do not set it next to May's "about 2,500 a day", because that is an average and the pair is not like for like. |
| 3 | over 99% (each tier) | over ninety nine percent cache hits on every tier | "Scaling Scion": "Each tier of this system maintains a cache hit rate of over 99%" | relative (rate) | measured | Anthropic | Always "over". The counter stops at 99 and the label reads "over 99%". The 1-in-100 trickle is a picture, not data. |
| 4 | 200× | two hundred times smaller in C P U and memory | "Scaling Scion": "infrastructure footprint is now 200x smaller than our previous git mirroring infrastructure in terms of CPU and memory requirements" | relative | measured | Anthropic | It covers **infrastructure CPU and memory only**, against the old Git mirrors. It is not speed, checkout time, dollars or "all CI". The scope tag stays on screen while 200× is visible. |

**Supporting numbers (64 px or less, in tags, no impact, attributed, registered in `facts.json`):**

| On screen | Source | Note |
|---|---|---|
| about 7 min, about 5 s | Figure "Observed performance improvements on native Scion repos", Agent environments, "New worktree" row: git 7.1 min, scn 5.1 s, median | **Not on the approved list; needs the owner's yes.** One named operation, shown as a median. This is the only row that really goes from minutes to seconds. See caveat 2. |
| 20× less memory | "What we learned": the Claude Mythos Preview rewrite "consumed 20x less memory and was 4x faster" | This is the **git-to-Scion ingestion pipeline prototype**, not Scion itself, and the box label says so. The 4x faster figure is cut to save words and numbers. |
| 30,401 and Sep 9 | Inside the `merges` crop only | `evidence_incidental` |

"Several hundred" mirrors appears as words only. The icon field has no exact count, and the mirror count must never stand in for the 200x.

**Cut, even though approved (the caption may carry the starred ones, each with its source wording):**
- about 2,500 a day in May (not like for like with the peak; the real bars show the growth)
- 600 PB a day if fetched naively (theoretical)*
- almost 100 GB of history and over 25 GB working copy
- 25% CPU capacity win in CI*
- "two orders of magnitude faster"
- seven people and five months*
- merge volume up 10x during the build
- 4x faster ingestion

## 8. Caveats

**Spoken caveat** (l13, paced like the rest): "Scion is by no means a suitable replacement for Git for general use." Git's own partial clones get their credit earlier, in l03, and again on the l13 split screen ("partial clones", "sparse checkouts").

**Producer and validator notes (not spoken):**
1. Every result is Anthropic-reported about Anthropic's own systems. Nothing here is an independent benchmark.
2. **"Two orders of magnitude faster" against the per-row table.** The article text says CI and research jobs check out "two orders of magnitude faster (in seconds rather than minutes)". The article's own performance figure gives these medians:
   - CI-job checkout: 31 s to 3.5 s (×8.8).
   - Compute-job checkout: 175 s to 22 s (×8.0).
   - New agent worktree: 7.1 min to 5.1 s (×84). This is the only row near 100x.

   So no CI picture says ×100, and the clock wipe names the worktree row and the word "median". "Seconds rather than minutes" may appear in the caption, attributed and quoted, but not as a CI claim on screen.
3. 30,000 is a single day (see the numbers budget). The article's "more than tenfold" growth compares other periods, so do not draw 2,500 to 30,000 as a matched ratio.
4. 200x is infrastructure CPU plus memory against the previous Git mirroring infrastructure. It is not latency or cost.
5. The 20x memory figure belongs to a prototype ingestion pipeline that Claude rewrote. It is not a property of Scion.
6. The article says the engineers' role was "very often" to tell Claude no. We say "often" because STE bans "very". Do not upgrade it to "main job".
7. Scion fits "truly enormous monorepos". It needs its own review, search and CI. Anthropic does not offer it to others.

## 9. Loop and ending

The last sentence, "It serves about twenty five million checkouts a day", lands while the frame rebuilds the frame-0 composition: the same flood, the same "ABOUT 25 MILLION CHECKOUTS A DAY" in the same place, then "HOW?". On replay the voice asks "How do you serve about twenty five million C I checkouts a day?" over a picture that has not moved. The end card shows only `hemanth_with_ai` over the still-moving flood: no title, no "follow", no source line.

## 10. Thumbnail

`scenes/thumb-hero.html`. At the top (y 300 to 700), "ABOUT 25 MILLION CHECKOUTS A DAY" in white, 130 px, and "HOW?" in amber, 240 px: the same words as frame 0 and the database hook. Below (y 820 to 1450), the vertical three-tier stack with the names `scion-daemon`, `scion-cache` and `scion-server` at 64 px in the left gutter, tinted bands, an amber request token halfway up in the right lane, and the amber tile flood at the bottom. There is no "200×" (that would be a second headline) and no "Anthropic" in large type. Take the number from the storyboard with `{{num ...}}`.

## 11. Post text angle

- **Title:** "How do you serve about 25 million checkouts a day?"
- **Caption first line:** "Anthropic runs about 25 million CI checkouts a day. Its new system, Scion, asks three cache tiers for only the trees and blobs a job needs, and Anthropic reports over 99% cache hits on each tier."

Caption body (for the producer):
- Say this is an unofficial explainer of Anthropic's Oct 13, 2026 engineering post, and link it.
- Say all figures are Anthropic-reported.
- Give the scope of 200x (CPU and memory against its old Git mirrors).
- Mention that Git already has partial clones and sparse checkouts.
- Mention that a team of seven built Scion and its review tool in five months.
- Quote the article that Scion is "by no means a suitable replacement for git for general use".

## 12. Hand-off checklist for the producer

- `storyboard.json`: `renderer: "hyperframes"`, voice `aiden` 1.12, the `ste` block above, and the 13 lines above verbatim.
- Hero numbers go in `data.value` so the drawn proportions read from it (200 for the squares, 99 for the counter, 20 for the bars).
- Register in `facts.json` every hero and supporting number above, plus the `merges` crop's 30,401 and Sep 9.
- `evidence/` comes from the live-capture script (2x DPR). Its manifest holds the highlight rects.
  - Every receipt `marks` word must be in the line's `say`.
  - The receipt start in each scene must be at 0.1 s or later.
- Run `ste.mjs` (expect 0 hard), then `words`. After that:
  - Re-map every beat in the shot list to its word cue.
  - `snap` the receipt holds, the 200× frames and the clock frames.
  - In those snaps, check that labels are 40 px or larger and that no card or icon overlaps any label.
