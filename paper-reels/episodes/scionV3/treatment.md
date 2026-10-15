# Scion v3: treatment (revision 3, after cold-viewer round 2)

Item slug (planned, not registered yet): `anthropic-scion-v3`, kind `topic`.
Source of record: `llm-wiki/raw/assets/anthropic-scion/article-text.txt` (Anthropic Engineering, "Redesigning source control at Anthropic", 2026-10-13). Page numbers below refer to `article-print-clean.pdf` (18 pages), checked with pdfium.

The earlier attempts (`scionV2`, 12 lines, and `scionSourceControl`, 16 lines) used CI, checkout, tree, blob and daemon without explaining them, and they listed conclusions. I compared their storyboard `say`/`text` fields with this script: no line is shared. This script never says blob, daemon, packfile, Spanner, changeset, ref, mirror or region. The mechanism works without them.

## Changes in revision 3 (cold-viewer round 2: FAIL, main idea now held)

| Viewer's lost point | Fix (new line) |
|---|---|
| "local" and "offline" unclear; is the full copy a plus or a minus? | l08: "With all of it, people can work offline, with no connection." l09 opens with "For most projects, this is the right design." (article p3: "For the vast majority of repositories, this is the right design"). |
| "squeezed" unexplained; 25 GB has no reference | "squeezed" is gone. l09: "But here, the files alone fill over 25 gigabytes, for one small fix." The fix is the reference, and the board shows the 25 GB block next to the one small file. |
| "that copy" vague | l11: "If each took the full 25-gigabyte copy, the servers would send over 600 petabytes a day." |
| "online by definition" is a jump | l12 adds the reason in plain words: "Their machines stay wired to the server." |
| How the payments tree leads to the file | l05 names the path `payments/refund.py`. l16 is the two-step lookup: "The top tree points to the payments tree. That tree points to refund.py, the file the job needs." |
| "kept copy" not introduced; "so" skips; cache defined in the same line as the claim | Split in two lines. l19: "So a saved copy of an address never goes wrong. Any machine can keep and reuse it." l20 only names the cache. |
| "area" unclear; why a middle layer | l21: "Each machine has its own cache. Nearby machines also share one cache, so few ask the server." |
| 99% "on each tier" includes the server, which the viewer does not see as a cache | l23: "Both cache tiers hit over 99% of the time." The article says each tier keeps a hit rate over 99%, so the claim for the two cache tiers is a true subset. The server's own hit rate is left out, because the script does not explain that the servers also cache. |
| Power and memory come from nowhere | l11 now says "the servers would send" the copies, so server load is the problem from the start. l24 opens with "So few requests reach the server." |
| "by no means a suitable replacement" is near a double negative and gives no reason | l25: "Anthropic says Scion fits only the largest monorepos. For normal projects and offline work, Git stays right." The `general` receipt is replaced by the `enormous` receipt (p12). |

Cut to stay within 170 s: "Scion uses this idea", "code" in l10, "own" in l17, and "on their own computer" in l08.

## 1. Format

`system-design`. The source is an engineering article about how a company built a system and why the standard tool (Git) failed for it. It is not an arXiv paper. Length target 120 to 170 s, gate 90 to 178 s.

## 2. The one idea

Git gives every machine a full copy of the code so that people can work offline. Anthropic's test machines are always online, so Scion has each machine ask only for the files it reads and share those files through caches.

## 3. The newcomer's questions (the spine)

| # | Question | Answered in |
|---|---|---|
| 1 | What did Anthropic do, and what is Git? | l01 |
| 2 | What did it use instead? Where does its code live? | l02 (Scion, monorepo) |
| 3 | Who writes that code? | l03 (agents) |
| 4 | How do they know a change does not break anything? | l04 (CI job) |
| 5 | Show me one change. | l05 (payments/refund.py) |
| 6 | Where does the CI job get the code? | l06 (server) |
| 7 | What do we call getting the code? | l07 (checkout) |
| 8 | What does Git put in that copy, and why? | l08 (every file and every past version, so people can work offline) |
| 9 | Is that good or bad? How big is it here? | l09 (right for most projects; over 25 GB here, for one small fix) |
| 10 | How often does that happen? | l10 (25 million a day) |
| 11 | How much would the servers send? | l11 (600 PB, petabyte) |
| 12 | Do these machines need to work offline? | l12 (no, online by definition, wired to the server) |
| 13 | Then do they need the full copy? | l13 (no, they can ask for each file when needed) |
| 14 | What does Scion change? | l14 (past versions stay on the server, the machine asks for what its job reads) |
| 15 | How does the machine know which files exist? | l15 (tree) |
| 16 | How does it get from the top to refund.py? | l16 (top tree, payments tree, file) |
| 17 | How does it name the file it wants? | l17 (content address) |
| 18 | What happens when the file changes? | l18 (new address; the old address keeps the old contents) |
| 19 | Why does that matter? | l19 (a saved copy never goes wrong, any machine can reuse it) |
| 20 | What is the place that keeps such copies? | l20 (cache) |
| 21 | Where are the caches, and why more than one? | l21 (one per machine, one shared by nearby machines) |
| 22 | How many layers is that? | l22 (tiers) |
| 23 | How often does a cache have the file? | l23 (cache hit, 99% in both cache tiers) |
| 24 | What does that do to the server's load? | l24 (few requests reach it, 200 times less computer power and memory) |
| 25 | Should everyone switch? | l25 (no, only the largest monorepos) |
| 26 | So, back to the start: why did Anthropic replace Git? | l26 |

## 4. Jargon plan (`ste.jargon`)

One new term a line. Each term is described in plain words before or in the line that names it, with an active naming sentence.

| Term | Plain description first | Naming words | Line |
|---|---|---|---|
| Git | "the tool that tracks every code change" | "Anthropic replaced Git, the tool that tracks every code change." | l01 |
| monorepo | "All its code sits in one store." | "We call it a monorepo." (used again in l25) | l02 |
| agent | "AI programs write code all day." | "We call them agents." | l03 |
| CI job | "A machine checks that each change still works." | "We call this a CI job." | l04 |
| server | "a central computer" with the code | "We call it the server." | l06 |
| checkout | "The server sends a copy." | "We call this step a checkout." | l07 |
| offline | "With all of it" on the machine, "with no connection" | "people can work offline, with no connection." | l08 |
| petabyte | said with its size | "A petabyte is a million gigabytes." | l11 |
| tree | "a list of the top folders" | "We call such a list a tree." | l15 |
| content address | "an ID made from its contents" | "We call it a content address." | l17 |
| cache | "a nearby store of copies" (the copies are set up in l19) | "We call such a nearby store of copies a cache." | l20 |
| tier | "Machine cache, shared cache, server" | "we call these three layers tiers." | l22 |
| cache hit | "When a cache holds the file" | "we call it a cache hit." | l23 |

Proper names, not jargon (`ste.names`): `Scion` (described in l02 as "its own tool"), `Anthropic`, `refund.py`, `payments/refund.py`.

Copy this block into `storyboard.json` as is. I ran the final 26 lines with exactly this block and `"format": "system-design"` through `paper-reels/hf/bin/ste.mjs` (scratch storyboard, not in an episode folder): 0 hard findings. Two soft findings remain: l11 has a 16-word sentence, and l23 "Both cache tiers hit over" is flagged as a possible noun cluster (it is a subject and a verb, not a cluster).

```json
"ste": {
  "names": ["Scion", "Anthropic", "refund.py", "payments/refund.py"],
  "jargon": [
    { "term": "Git", "line": "l01" }, { "term": "monorepo", "line": "l02" }, { "term": "agent", "line": "l03" },
    { "term": "CI job", "line": "l04" }, { "term": "server", "line": "l06" }, { "term": "checkout", "line": "l07" },
    { "term": "offline", "line": "l08" }, { "term": "petabyte", "line": "l11" }, { "term": "tree", "line": "l15" },
    { "term": "content address", "line": "l17" }, { "term": "cache", "line": "l20" }, { "term": "tier", "line": "l22" },
    { "term": "cache hit", "line": "l23" }
  ],
  "terms": [
    { "term": "checkout", "avoid": ["clone", "fetch"] },
    { "term": "monorepo", "avoid": ["repository", "repo", "codebase"] },
    { "term": "content address", "avoid": ["hash", "fingerprint", "checksum"] },
    { "term": "cache", "avoid": ["buffer"] },
    { "term": "server", "avoid": ["mirror", "mirrors", "replica", "backend"] },
    { "term": "CI job", "avoid": ["test run", "pipeline", "build job"] },
    { "term": "tree", "avoid": ["manifest", "directory"] },
    { "term": "every past version", "avoid": ["history", "commits"] }
  ]
}
```

On-screen labels use the same names. The board never shows `scion-daemon`, `scion-cache`, `region`, `blob`, `packfile`, `mirror`, `history` or `CPU`. The machine's cache reads `CACHE`. The middle box reads `SHARED CACHE`.

## 5. Protagonist object

One file, `payments/refund.py`, with one small fix, and the one test machine that runs its CI job. Every cost lands on that pair first:
- the checkout cost: one machine, one small fix, over 25 GB of files (l09), then that full copy times 25 million, all sent by the servers (l10, l11);
- the Scion path: the same machine reads the top tree, follows it to the `payments/` tree, and follows that to `refund.py` (l15, l16);
- its content address `#5e1b` becomes `#d02c` when the fix lands (l18);
- the payoff: its file comes almost always from a cache, so few requests reach the server (l23, l24), then the fleet number (l24).

The file name, the folder names and the two IDs are drawings, not claims. Keep the IDs in `_`-prefixed drawing keys (`_idOld`, `_idNew`) or list them in `facts.json` as illustrative, so QA does not read them as numbers.

## 6. Three hook options

| | Spoken (at most 12 words) | First second on screen |
|---|---|---|
| A | "Anthropic replaced Git, the tool that tracks every code change. Why?" (11) | Big type at 0.0 s: `ANTHROPIC REPLACED GIT`, with a coral `GIT` box under it. A strike crosses the box on "replaced", then `WHY?` slams on "Why". |
| B | "Every test machine got a full copy. Anthropic stopped that. Why?" (11) | A test machine with a large block falling into it. Uses "test machine" and "full copy" before the viewer knows what either means. |
| C | "Git could not keep pace with Anthropic's AI agents. What broke?" (11) | A `GIT` box cracking under a stream of robot heads. Uses "agents" before its line (a jargon gap), and "keep pace" is vaguer than the fact. |

**Pick A.** It is a surprising move by a known company, its one term (Git) carries its own description in the same line, and it needs no number. It matches the thumbnail hook word for word (`ANTHROPIC REPLACED GIT`, sub `WHY?`). The last line asks the same question and answers it, which closes the loop. Scion is named right after, in l02, as a proper name ("its own tool, Scion"). It does not go in the hook, because two terms in l01 would fail the system-design jargon gate.

## 7. Picture: the board

One long scene (`board`, l02 to l24) on the blueprint grid. A world wrapper `#board-world` holds every actor so `KIT.focus` can push in and pull out. Layout (all inside y 160..1450, nothing at x > 940 for y 1000..1700):

| Actor | Class / role | Place | Life |
|---|---|---|---|
| `#board-store`: monorepo card, folders `api/ web/ payments/ docs/` | `.actor.store` (amber) | top centre, y 240..520 | l02 to the end. The `payments/` row and `refund.py` in it turn pink on cue. |
| `#board-server`: frame around the store, label `GIT SERVER` | `.actor.old` (coral) | wraps the store | Draws on at l06. On "Scion" in l14: `KIT.recolor` to `new` (violet) and `KIT.swap` to `SCION SERVER`. Never replaced. |
| `#board-agents`: row of small robot heads | outline in the compute colour, small | above the store, left, y 170 | l03 to the end. They send change packets into the store. |
| `#board-fix`: chip `payments/refund.py` | `.chip`, hero (pink) | in the store, then travels | The protagonist. Lights in l05 and rides every packet that carries it. |
| `#board-machine`: test machine with a disk slot, chip `CI JOB` | `.actor.compute` (cyan) | lower centre, y 980..1260, x 240..780 | l04 to the end. The slot fills with a coral block (Git) or holds one pink file (Scion). |
| `#board-copy`: fat block `EVERY FILE + EVERY PAST VERSION`, then size chip `25+ GB` | `.actor.old` | travels from server to machine | l07 to l13. Fades out in l13. |
| `#board-grid`: copies of the machine | `.cell` via `KIT.multiply` | whole board | l10 and l11, zoom out to many. Gone when the camera returns to one machine in l12. |
| `#board-wire`: a solid cyan line from machine to server | line | between them | l12 to the end. |
| `#board-tree`: folder-list cards `TREE` (top, then `payments/`) | `.actor.new` | between server and machine | l15 and l16. |
| `#board-cache`: amber slot in the machine, label `CACHE` | `.actor.store` | inside `#board-machine` | l20 to the end. |
| `#board-shared`: `SHARED CACHE`, wired to three machines | `.actor.store` | midway, y 700 | l21 to the end. Machine cache, shared cache and server then form one column. |

**Do not draw a full copy inside the Scion server.** The article says "there is no fully materialized copy of the repo anywhere, even on the server". On the recolor in l14, the store card inside the server breaks into many small blocks scattered across the frame (the data is spread out). It never shows one whole store box again.

What changes in place:
- `GIT SERVER` turns into `SCION SERVER` (recolor and swap, l14).
- The machine's slot goes from a full coral block (l07 to l12) to `ASK WHEN NEEDED` (l13) to one pink file (l16).
- The `refund.py` ID changes from `#5e1b` to `#d02c` (swap, l18).
- A `HIT` stamp lands on the two cache tiers (l23), never on the server.

Camera:
- l02: wide on the store.
- l05 to l09: `KIT.focus` into the machine for the checkout.
- l10 and l11: pull out to the grid of machines.
- l12 and l13: back to one machine for the insight.
- l14: wide for the recolor.
- l15 and l16: focus on the tree walk.
- l17 and l18: focus on the `refund.py` chip.
- l20: into the machine's cache.
- l21 and l22: pull back along the column.
- l24: wide for the payoff.

Packets: amber squares via `KIT.travel`. A packet that carries `refund.py` is pink.

## 8. Receipts

Four text passages. Each is read with `KIT.read` for at most about 2 s before the board returns. The bold span is what the highlighter marks, and the voice says that span nearly word for word. The exact text is from `article-print-clean-text.txt`.

| Id | Line | Page | Exact text (highlight in bold) | Narration |
|---|---|---|---|---|
| `checkouts` | l10 | p3, "Growing our monorepo" | "We perform on the order of **25 million** code **checkouts per day for CI**, before counting developer environments, agent sandboxes, and research jobs." | "Anthropic performs twenty five million checkouts per day for CI." |
| `online` | l12 | p3, same section, two paragraphs on | "but nearly all of our clients were **agents and jobs that are online by definition**." | "But nearly all checkouts go to agents and jobs that are online by definition." |
| `footprint` | l24 | p8, "Scaling Scion" | "Our Scion infrastructure footprint is now **200x smaller** than our previous git mirroring infrastructure in terms of CPU and **memory** requirements." | "Scion needs two hundred times less computer power and memory than the old Git servers." |
| `enormous` | l25 | p12, "Contributing to the wider ecosystem" | "The concepts we've outlined here really **only make sense for truly enormous monorepos**, with either tens of thousands of engineers or swarms of agents prolifically writing code." | "Anthropic says Scion fits only the largest monorepos." |

Crop notes for the producer:
- The `checkouts` paragraph also shows "almost 100 GB", "over 25 GB" and "over 600 PB". 25 GB and 600 PB are in the budget. Put 100 GB in `evidence_incidental`, or crop to the one sentence.
- The `footprint` sentence sits next to "over 99%", "two orders of magnitude" and "25%". Crop tight to the sentence, or list them as incidental. "Two orders of magnitude" must not be readable on screen (see section 10).
- The `enormous` sentence starts with "The concepts we've outlined here" (curly apostrophe in the PDF). Find on the bold fragment only.
- The figures `figure-merges-2x.png` and `figure-performance-2x.png` are not receipts.

## 9. Shot list

Timing uses 2.9 spoken words a second and the engine's padding (0.25 s lead and 0.5 s tail per line, 1.6 s after the last line, which also holds the end card). Speech is about 149 s.

| Pace | Total |
|---|---|
| 2.9 words a second | about 170 s |
| 3.1 words a second (aiden at 1.12, the voice of the last two posts) | about 160 s |
| 2.67 words a second (160 words a minute) | about 183 s, over the 178 s gate |

The voice must run at 2.9 words a second or faster. Starts are approximate. The producer re-times from `words.json`.

Scenes: `hook` (l01), `board` (l02 to l24), `close` (l25 and l26). Transitions: `zoom` (main, hook to board) and `whip` (accent, board to close).

| Scene | Line | Start s | Spoken words | What appears or moves (camera) | Out |
|---|---|---|---|---|---|
| hook | l01 | 0.0 | Anthropic replaced Git, the tool that tracks every code change. Why? | 0.0: `ANTHROPIC REPLACED GIT` is already on screen in big type (the thumbnail words), with a coral `GIT` box under it. "replaced": a strike crosses the `GIT` box. "tracks": sub `TRACKS EVERY CODE CHANGE` types on under the box. "Why": `WHY?` slams, shake. | zoom |
| board | l02 | 4.5 | It built its own tool, Scion. All its code sits in one store. We call it a monorepo. | "Scion": violet `SCION` tag pops at top right, then shrinks into a corner (it returns in l14). "one store": `#board-store` draws on, folders rise one by one. "monorepo": label `MONOREPO` swaps onto the card. Slow camera push. | |
| board | l03 | 11.5 | AI programs write code all day. We call them agents. | "AI programs": robot heads pop in a row. "write code": packets stream from the heads into the store (`KIT.travel`, one every 0.5 s). "agents": label `AGENTS`. | |
| board | l04 | 16.0 | A machine checks that each change still works. We call this a CI job. | "machine": `#board-machine` rises below the store. "still works": a check mark draws on it. "CI job": chip `CI JOB` stamps on. | |
| board | l05 | 22.0 | Take one fix to payments/refund.py. Its CI job needs the code. | "one fix": camera focuses on the store. "payments": the `payments/` row lights. "refund": the `refund.py` chip in it turns pink and pulses. "needs the code": camera pans down; the machine's slot reads `NO CODE` (dim). | |
| board | l06 | 28.6 | It asks a central computer for the code. We call it the server. | "asks": a small `?` packet travels from the machine to the store. "central computer": a frame draws around the store. "server": label `GIT SERVER` in coral. | |
| board | l07 | 33.8 | The server sends a copy. We call this step a checkout. | "sends a copy": `#board-copy` travels from the server to the machine. "checkout": label `CHECKOUT` writes along the arrow. | |
| board | l08 | 38.4 | Git sends every file and every past version. With all of it, people can work offline, with no connection. | "every file": the copy block grows a `FILES` layer. "every past version": ghost layers stack under it. "people": a laptop icon pops beside the machine with the same block inside it. "offline": the laptop's signal mark is crossed out and the laptop keeps working (its screen still shows code). | |
| board | l09 | 45.7 | For most projects, this is the right design. But here, the files alone fill over 25 gigabytes, for one small fix. | "most projects": a row of small project cards, each with a small copy block, gets a check. "But here": camera back to the machine (`KIT.focus`). "files alone": the ghost layers fade, the `FILES` layer stays. "twenty five gigabytes": chip `25+ GB` slams onto the block. "one small fix": the small pink `refund.py` chip pops beside the large block (the size contrast is the reference). | |
| board | l10 | 54.0 | Anthropic performs 25 million checkouts per day for CI. | Receipt `checkouts` reads (about 2 s). Back to the board: `KIT.multiply` 30 machines, camera pulls out, chip `25 MILLION / DAY`. | |
| board | l11 | 58.5 | If each took the full 25-gigabyte copy, the servers would send over 600 petabytes a day. A petabyte is a million gigabytes. | "full twenty five gigabyte copy": a `25+ GB` block drops into every cell in a wave. "the servers would send": the server frame at the top glows coral and packets stream down to all cells. "six hundred petabytes": big mono `600+ PB / DAY` slams, tag `IF EVERY CHECKOUT TOOK A FULL COPY`. "A petabyte": sub-line `PETABYTE = A MILLION GB` (in words, no new digits). | |
| board | l12 | 67.9 | But nearly all checkouts go to agents and jobs that are online by definition. Their machines stay wired to the server. | Grid collapses back to one machine (camera in). Receipt `online` reads (about 2 s). Back: "wired to the server": `#board-wire` draws from the machine to the server and stays; the laptop from l08 dims away. | |
| board | l13 | 75.9 | So they need no full copy. They can ask for each file when needed. | "no full copy": the coral block in the slot cracks and fades. "ask for each file": the slot label swaps to `ASK WHEN NEEDED`; a small `?` packet pulses along the wire. | |
| board | l14 | 81.5 | In Scion, every past version stays on the server. The machine asks only for what its job reads. | "Scion": `KIT.recolor` turns the server from coral to violet, `KIT.swap` changes `GIT SERVER` to `SCION SERVER`, sparks; the store inside breaks into scattered small blocks. "every past version": ghost layers stack inside the server frame, tag `STAYS HERE`. "what its job reads": camera eases toward the machine. | |
| board | l15 | 88.4 | First it gets a list of the top folders. We call such a list a tree. | "list": a card travels from the server to the machine, rows `api/ web/ payments/ docs/`. "tree": `TREE` label swaps on, branch lines draw. | |
| board | l16 | 94.7 | The top tree points to the payments tree. That tree points to refund.py, the file the job needs. | "points to the payments tree": an arrow draws from the `payments/` row; a second card `payments/` travels down with rows `refund.py  invoice.py  ...` (drawing only). "That tree points to refund": an arrow from the `refund.py` row; the pink `refund.py` packet travels down and lands in the slot. "the file the job needs": the other rows dim to grey. | |
| board | l17 | 102.7 | Each file version gets an ID made from its contents. We call it a content address. | `KIT.focus` on the `refund.py` chip. "contents": code lines scroll inside it, and the ID `#5e1b` types on. "content address": label `CONTENT ADDRESS`. | |
| board | l18 | 109.3 | When the fix edits refund.py, it gets a new address. An old address always holds the same contents. | "edits": one code line changes colour. "new address": a new chip appears with `#d02c`. "old address": the old chip with `#5e1b` stays beside it; a padlock stamps on it on "always". | |
| board | l19 | 117.3 | So a saved copy of an address never goes wrong. Any machine can keep and reuse it. | "saved copy": a copy of the locked `#5e1b` chip peels off and lands beside it. "never goes wrong": a check mark on the copy. "Any machine": two more machines slide in at the sides and each takes the copy (short travels). | |
| board | l20 | 123.9 | We call such a nearby store of copies a cache. | Camera into the first machine: an amber `CACHE` slot opens in it and the copy drops in. "cache": label. | |
| board | l21 | 128.1 | Each machine has its own cache. Nearby machines also share one cache, so few ask the server. | "its own cache": `CACHE` slots open in the two side machines. "share one cache": `#board-shared` pops midway, wired to all three machines. "few ask the server": three requests go up; two stop at the shared cache, one dotted line reaches the server. | |
| board | l22 | 134.7 | Machine cache, shared cache, server: we call these three layers tiers. | Each word lights its box in turn, in one column. "tiers": a bracket labelled `TIERS` draws along the column. | |
| board | l23 | 139.3 | When a cache holds the file, we call it a cache hit. Both cache tiers hit over 99% of the time. | "holds the file": a packet stops at the machine's cache, `HIT` stamp. "cache hit": label. "ninety nine percent": a `99%+` badge pops on the machine cache, then on the shared cache. No badge on the server. | |
| board | l24 | 147.9 | So few requests reach the server. Scion needs 200 times less computer power and memory than the old Git servers. | "few requests": many small packets run between machines and caches; a rare one goes on to the server. Receipt `footprint` reads (about 2 s). Back: two bars, coral `OLD GIT SERVERS` long and violet `SCION` short, chip `200x LESS · COMPUTER POWER + MEMORY`. Camera pulls out to the full board. | whip |
| close | l25 | 155.9 | These are Anthropic's own numbers. Anthropic says Scion fits only the largest monorepos. For normal projects and offline work, Git stays right. | Tag `ANTHROPIC'S OWN NUMBERS`. Receipt `enormous` reads (about 2 s). Back: a violet `SCION` box over `LARGEST MONOREPOS`, and a coral `GIT` box over `NORMAL PROJECTS` and the offline laptop from l08, which gets a check. | |
| close | l26 | 164.3 | So why did Anthropic replace Git? Its agents are always online. | The hook title `ANTHROPIC REPLACED GIT` returns in the same type and place as l01. Under it, `AGENTS ARE ALWAYS ONLINE` slams. Hold, then the end card (`hemanth_with_ai` only) inside the 1.6 s tail. | end |

Pacing: every row names at least two cued events, and the long lines carry four or more (l09, l11, l16, l21, l24). If a gap over 2.5 s shows up after real word timing, add a camera beat on the nearest noun. Watch l10 (the receipt plus the grid in 4 s) and l20 (one event in 3.7 s): give l20 a camera move as a second beat.

## 10. Numbers budget (5, all Anthropic's own reports)

| # | Number | Line | Article section and sentence | Kind |
|---|---|---|---|---|
| 1 | over 25 GB | l09, l11 | Growing our monorepo: "a compressed working copy is over 25 GB." | Absolute size of the compressed current files, without past versions (the history alone is almost 100 GB, not shown). "Over 25" stays true uncompressed. Said as a size, and l11 says "If each took": Anthropic used partial clones, mirrors and snapshots, so the video does not claim that any CI job pulled 25 GB. |
| 2 | 25 million checkouts per day for CI | l10 | Growing our monorepo: "We perform on the order of 25 million code checkouts per day for CI, before counting developer environments, agent sandboxes, and research jobs." | Order-of-magnitude estimate, CI only. |
| 3 | over 600 PB a day | l11 | Growing our monorepo: "Fetched naively, that would be over 600 PB of git traffic per day." | Theoretical: 25 GB times 25 million. The line says "If each took ... the servers would send". |
| 4 | over 99% hits in both cache tiers | l23 | Scaling Scion: "Each tier of this system maintains a cache hit rate of over 99%." | Measured, Anthropic. The article's "each tier" includes the server tier; the line claims only the two cache tiers, a true subset. |
| 5 | 200 times less computer power and memory | l24 | Scaling Scion: "Our Scion infrastructure footprint is now 200x smaller than our previous git mirroring infrastructure in terms of CPU and memory requirements." | Relative, measured, Anthropic. It compares the serving machines with the old Git mirror servers. It is not speed and not cost. |

Not used, on purpose:
- "two orders of magnitude faster (in seconds rather than minutes)". The article's own figure "Observed performance improvements on native Scion repos" shows a median CI checkout of 31 s with Git against 3.5 s with Scion (8.8x), and a compute-job checkout of 175 s against 22 s (8x). Only the agent "new worktree" row is near 100x (7.1 min against 5.1 s). The text claim does not hold for CI, so the video makes no speed claim.
- 30,000 changes a day, the 25% CPU win, 2,500 changes in May, several hundred mirrors, seven people, five months, the 20x memory rewrite. All are true and sourced, but they cost time the explanation needs.
- "a million gigabytes" (l11) is a unit definition, not a reported number. It goes on screen in words, not digits.
- "So few requests reach the server" (l24) follows from 99% hits in both cache tiers. It is not a separate number.

## 11. Caveat

l25: "These are Anthropic's own numbers. Anthropic says Scion fits only the largest monorepos. For normal projects and offline work, Git stays right." Sources: p12, "really only make sense for truly enormous monorepos"; p3, "For the vast majority of repositories, this is the right design" (about Git's full offline copy).

## 12. Loop and ending

l26 asks the hook's question again ("So why did Anthropic replace Git?") and answers it with the design rule ("Its agents are always online."). The close shows the hook title in the same place and type as frame 0.0, so a replay feels continuous. End card: `hemanth_with_ai` only.

## 13. Post text angle

- Title: `Why Anthropic replaced Git`
- First line of the caption: `Git gives every machine a full copy of the code. Anthropic's test machines never needed one.`

## 14. Script

```
Script
l01: Anthropic replaced Git, the tool that tracks every code change. Why?
l02: It built its own tool, Scion. All its code sits in one store. We call it a monorepo.
l03: AI programs write code all day. We call them agents.
l04: A machine checks that each change still works. We call this a CI job.
l05: Take one fix to payments slash refund dot py. Its CI job needs the code.
l06: It asks a central computer for the code. We call it the server.
l07: The server sends a copy. We call this step a checkout.
l08: Git sends every file and every past version. With all of it, people can work offline, with no connection.
l09: For most projects, this is the right design. But here, the files alone fill over twenty five gigabytes, for one small fix.
l10: Anthropic performs twenty five million checkouts per day for CI.
l11: If each took the full twenty five gigabyte copy, the servers would send over six hundred petabytes a day. A petabyte is a million gigabytes.
l12: But nearly all checkouts go to agents and jobs that are online by definition. Their machines stay wired to the server.
l13: So they need no full copy. They can ask for each file when needed.
l14: In Scion, every past version stays on the server. The machine asks only for what its job reads.
l15: First it gets a list of the top folders. We call such a list a tree.
l16: The top tree points to the payments tree. That tree points to refund dot py, the file the job needs.
l17: Each file version gets an ID made from its contents. We call it a content address.
l18: When the fix edits refund dot py, it gets a new address. An old address always holds the same contents.
l19: So a saved copy of an address never goes wrong. Any machine can keep and reuse it.
l20: We call such a nearby store of copies a cache.
l21: Each machine has its own cache. Nearby machines also share one cache, so few ask the server.
l22: Machine cache, shared cache, server: we call these three layers tiers.
l23: When a cache holds the file, we call it a cache hit. Both cache tiers hit over ninety nine percent of the time.
l24: So few requests reach the server. Scion needs two hundred times less computer power and memory than the old Git servers.
l25: These are Anthropic's own numbers. Anthropic says Scion fits only the largest monorepos. For normal projects and offline work, Git stays right.
l26: So why did Anthropic replace Git? Its agents are always online.
```

For the storyboard, `text` uses digits and paths (`payments/refund.py`, `refund.py`, `25`, `25-gigabyte`, `25 million`, `600`, `99%`, `200`). `say` spells them out ("payments slash refund dot P Y", "twenty five", "C I"). That is 409 caption words and about 433 spoken.

## Stranger read (self-check before handoff)

- Every declared term first appears in its own line and nowhere earlier (`ste.mjs` checks this).
- The script never says "history". It says "every past version", which the viewer meets in l08 before l14 needs it.
- l08 and l09 say what the full copy is for (working offline with no connection) and that it is the right design for most projects. Then "But here" turns to the cost.
- The 25 GB (l09) is set against one small fix. l11 names "the full 25-gigabyte copy" and says the servers would send it, which sets up server load for l24.
- l12 says why the machines are online (wired to the server). l13 draws the consequence.
- l16 is a two-step lookup that follows the path named in l05.
- l18 says what an address guarantees. l19 draws the consequence (a saved copy never goes wrong, any machine can reuse it). l20 only names the cache.
- l21 says why a middle layer exists (so few machines ask the server). l23's 99% covers only the two cache tiers.
- Still a risk: "CI" is never expanded. The script describes what a CI job does, which is enough for the say-back.
- Still a risk: "the full 25-gigabyte copy" in l11 means the files alone, while l08's full copy also has every past version. The board shows the ghost layers fade in l09, so the block that multiplies in l11 is the files-only block.
