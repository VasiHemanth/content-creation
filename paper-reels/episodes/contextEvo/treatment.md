# Treatment: ContextEvo (arXiv 2609.34649 v1)

Paper: "Beyond Skill Evolution: Self-Evolving Context Management Policies for Long-Horizon Agent Harnesses", Weiyuan Li, Jinghan Xu, Aili Chen, Xintao Wang, Shuang Liang, Jiaqing Liang, Deqing Yang (Fudan University). arXiv 2609.34649, version v1 (submitted 28 Sep 2026; the only version on arXiv on 8 Oct 2026). Read in full from `llm-wiki/raw/assets/2609.34649/paper-v1.pdf` (27 pages). Text is in `paper-v1-text.txt`, with pages split by `=====PAGE=====`.

- Renderer: HyperFrames. Folder: `paper-reels/episodes/contextEvo/`.
- Size: 13 lines, 190 spoken words, 8 scenes.
- Length: about 72 s at Dream-RSI's measured pace, 76 s at the conservative pace used for the times below.
- Voice: as Dream-RSI (`aiden`, speed 1.12).
- Timing basis: Dream-RSI's `audio/words.json` measures 215 words in 68.5 s of voice, 3.14 words a second. Here hook lines are estimated at 2.9 and number lines at 2.7. Every beat is tied to a spoken word, so re-time it from this episode's own `audio/words.json`.

What the channel already covered, and how this one differs:

- Context Language Models: the model edits its own context as a file. Pictures: desk, page stack, scissors, eraser.
- Dream-RSI: replaying old search trees. Pictures: dream bubble, tree.
- SkillSeek: finding skills.
- DeepSWE: the benchmark.

This video is about something new. A harness learns, from its own runs, what its model should see. On the same tasks, learned skills made the score worse. To avoid repeating earlier pictures, there is no desk, page stack or scissors; what the model sees is drawn as a scrolling screen of message bubbles.

## 1. The one idea

On long tasks, an agent did better when it learned what its model should see than when it learned new skills.

The mechanism comes second (the producer needs it; the viewer only needs the idea above):

1. ContextEvo rebuilds what the model saw in past runs.
2. It decides whether the evidence the model needed was missing, degraded, buried or polluted, or whether the model made its own mistake.
3. It can test a fix by replaying one step with an edited context.
4. Only then does it edit the context policy. The model never changes.

## 2. Hook options

| # | Spoken line (STE, 12 words max) | On screen from 0.0 to 1.0 s |
|---|---|---|
| A | "This agent learned skills from its own runs. Its score dropped." (11 words) | **Frame 0 already shows** big type `NEW SKILLS.` / `LOWER SCORE.` and the kicker `on long tasks`, over a drawing that is already there: a robot at a tall screen of scrolling message bubbles, skill books on a shelf at left, a score meter at right with a `start` tick. By 1.0 s, three skill books hop from the shelf onto the robot's desk. |
| B | "In over half its skill runs, this agent never opened a skill." (12 words) | Big type `SKILLS. NEVER OPENED.` over a shut skill book puffing dust, above a grid of run chips, most of them dark with a shut-book glyph. |
| C | "Why do agents on long tasks lose the evidence they need?" (11 words) | Big type `WHERE DID THE EVIDENCE GO?` while an amber bubble scrolls up past the top edge of the screen under a flood of grey log bubbles. |

**Pick A.**

- **It is a measured surprise.** It runs against the current enthusiasm for agent skills, and the paper's own title makes the same point ("Beyond Skill Evolution").
- **It opens a question the video answers on schedule.** "Then what raised it?" gets a first answer at 9 s (l02, "Its score rose"), a mechanism at 25 to 50 s, and numbers at 51 to 62 s.
- **It loops.** The closing line ("before you add skills, check what your agent can see") leads straight back into it.
- **Why not B:** it is a strong fact, but it explains how skills failed rather than stating the stakes, so it works better as l04.
- **Why not C:** it is a generic question, and it is close to the Context Language Models hook ("Your AI agent forgets"), so the channel would repeat itself.

**Truth check for A.** Table 3 and sec 6.1 (p.7) cover all 46 Long-Horizon-Terminal-Bench (LHTB) tasks:

- The starting agent scores 0.417.
- The skill-only arm scores 0.370. Its skills were derived from runs on the same held-in tasks, "following recent trajectory-driven harness evolution". Per App. C.1, this arm injects a procedural skill bank and turns context-policy generation off.

Because this is one benchmark, the kicker `on long tasks` is on screen from frame 0, and l10 says "On long terminal tasks".

**First-frame rules.**

- The big type is at full opacity at 0.0 s: no character-by-character entrance from opacity 0, which is the Dream-RSI 5/10 hook problem. It may settle in scale from 1.04 to 1.0 over 0.0 to 0.4 s.
- The thumbnail hook uses the same words (`thumb_hook`: "New skills. Lower score.").
- "ContextEvo" first appears at about 25 s, as a small tag. It is never the largest text in the first 2 s.

## 3. Visual metaphors (one per idea)

**Idea 1, the problem: the scrolling screen.**

- **Picture.** What the model sees is a tall screen of message bubbles, like a chat feed. On a long task, grey bubbles (`log`, `file`, `tool output`) keep arriving at the bottom and push the amber `evidence` bubble up past the top edge into the dark. The bubble is still in the history but no longer in view.
- **What a stranger reads.** "The message I needed scrolled away."
- **Scenes.** Carried by `buried` (l03). Set up small in `hook`, paid off in `close`.
- **Limits.** It is a schematic of the paper's "model-visible context" (sec 3.2). It adds no numbers and makes no claim about how often evidence gets lost.

**Idea 2, skills unread: the shut skill book.**

- **Picture.** Skill books stand on a shelf beside the screen. Below them is a grid of run chips, each showing an open or a shut book.
- **Scene.** Carried by `buried` (l04).
- **Data.** The chips are drawn from 20 read out of 44 inspectable runs (sec 6.1, data keys `_read`, `_runs`). The counts are never printed.
- **Limits.** The books are not crossed out or thrown away. The paper shows skills went unopened in these runs, not that skills are useless.

**Idea 3, the context policy: screen controls.**

- **Picture.** A header strip across the screen reads `context policy`. It has three controls, one per dimension in the paper's Table 1, and each acts on a bubble:
  - `entry`: folds a long log bubble into one line with a link back (Table 11, observation entry).
  - `history`: files an old bubble into a drawer, then fetches the evidence bubble back into view (Table 11, memory writer and memory retriever).
  - `sharing`: splits off a helper panel and takes back one small chip (Table 11, parent-to-child dispatch and child-to-parent return).
- **The model.** The robot below the screen wears a padlock badge, `same model`.
- **Scenes.** Carried by `policy` (l05). The header card returns in `replay` (l09).

**Idea 4, how ContextEvo learns: the rewind.**

- **Picture, in four steps:**
  1. A failed run is printed as a strip of pages and read with a magnifier. Above it, a small screen rebuilds what the model saw (sec 4.1).
  2. Four stamps name the paper's failure types. A fork separates them from "model's own mistake" (sec 4.2).
  3. The strip becomes a timeline. A playhead rewinds to one step: the steps before it lock, the steps after it dim. The evidence bubble is moved back into view, and the robot's next-move arrow is drawn again beside the old one, under a "?" (counterfactual replay, sec 4.2, eq. 4).
  4. A pencil adds one line to the policy card, or a `no edit` stamp lands (sec 4.3).
- **Scenes.** Carried by `learn` (l06, l07) and `replay` (l08, l09).
- **Limits.** The "?" is never answered with a check mark. The paper says replay "measures only local next-action sensitivity" (sec 7).

**Not metaphors.** The results are a bar chart (`results`). The caveat splits a row of task cards into two groups (`caveat`).

**Must-nots.**

- No trophy, crown or green check anywhere near ContextEvo.
- Data marks (bars, meter levels, token stacks) stay in the neutral palette. No red on the skills bar.
- The `failed` and `passed` tabs on the run strips are kinds, so they may use red and mint.
- The `buried` stamp that slams in `learn` illustrates one case. It is not a share of cases.
- The needle in `caveat` is decoration and never points at a value.

## 4. Receipts

Three text passages. Each is read on camera at about 3.4x, holds for about 2 s, and then the scene's own picture returns.

| # | Line | Page, section | Exact text in the paper | Read on camera (highlighted) | `find` | `circle` | Hold (est.) |
|---|---|---|---|---|---|---|---|
| R1 | l03 | p.1, Abstract | "As interactions grow, useful evidence can be buried by redundant or outdated context, making context management itself a key bottleneck." | "useful evidence can be buried" | `useful evidence can be buried by redundant or` | `buried` | 11.4 to 13.2 s |
| R2 | l10 | p.7, sec 6.1 | "Across 46 tasks, skill-only reward falls from 0.417 to 0.370, while mean tokens rise from 8.57M to 9.61M (Table 3)." | "0.417 to 0.370" | `0.417 to 0.370` | `0.370,` | 55.0 to 57.3 s |
| R3 | l12 | p.9, sec 7 Conclusion | "Across the reported benchmark and model settings, the selected policies improve several full-benchmark point estimates over the Pi-agent baseline, while held-out changes vary by setting." | "held-out changes vary by setting." | `held-out changes vary by setting.` | `vary` | 68.0 to 69.9 s |

**What each hold sits between.**

- **R1.**
  - Before: bubbles pouring into the screen.
  - After: on "redundant", cut back to the `redundant` and `outdated` stamps, and the evidence bubble crossing out of view.
- **R2.**
  - Before: the starting bar grows, and the skills bar falls below the dashed start line on "falls".
  - After: back on the chart, the `0.370` label and the token stacks.
- **R3.**
  - Before: the task row splits into `learned from` and `did not learn from`.
  - After: back on the right-hand group under its swinging needle.

**Layout, checked with pdfium.**

- R1's phrase sits mid-line in the abstract.
- R2's phrase starts its printed line. "skill-only reward falls from" ends the line above, so never highlight across that break: a wide sideways pan is what clipped the Dream-RSI Lasso receipt.
- R3's phrase sits at the end of its printed line.
- In all three, left-align the first highlighted word with a margin, keep the circled word in frame for the whole hold, and `snap` the hold to check.

**Soft hyphens.** pdfium marks line-end hyphens with U+FFFE, for example `out￾dated` (p.1), `full￾benchmark` (p.9) and `Follow￾ing` (p.7). The fragments above stop before them, so do not extend R1 past "or".

**Voice against crop.**

- R1 is read word for word. Its passive voice is covered by an STE `allow`.
- R2: the voice says "the average score with skills falls from point four one seven to point three seven". The verb "falls" mirrors the paper; pin the highlighter to "point four one seven", "to" and "point three seven".
- R3: the voice says "On tasks it did not learn from, changes vary by setting". Pin `held-out` to "learn" and the last four words to their spoken matches. A label beside the crop reads `held-out = tasks it did not learn from`.

**Numbers inside the crops.** R2's crop, with one line of context above and below, shows these numbers; they all go into `facts.json` under `evidence_incidental`:

- 46
- 0.417 and 0.370
- 8.57M and 9.61M
- 3 (from "Table 3")
- 0.448 and 7.52M
- 0.419 and 9.69M

The R1 and R3 lines, and their neighbours, contain no digits. Check the manifest after `hf.mjs evidence`.

**Not usable as a receipt.** "only 20 of 44 inspectable skill-only trajectories read a skill body" (sec 6.1) crosses the p.7/p.8 page break. l04 carries it as a drawing instead.

## 5. Shot list

### Script (copy into `storyboard.json`)

| id | scene | `text` (caption, checked by STE) | `say` where it differs |
|---|---|---|---|
| l01 | hook | This agent learned skills from its own runs. Its score dropped. | |
| l02 | hook | The same agent learned what its model should see instead. Its score rose. | |
| l03 | buried | On long tasks, useful evidence can be buried by redundant or outdated context. | |
| l04 | buried | In over half the skill runs, the agent never opened a skill. | |
| l05 | policy | A context policy decides what the model sees. The model itself stays the same. | |
| l06 | learn | ContextEvo learns this policy from past runs. It rebuilds what the model saw, page by page. | Context Evo learns this policy from past runs. It rebuilds what the model saw, page by page. |
| l07 | learn | Was the evidence missing, degraded, buried, or polluted? Or was it the model's own mistake? | |
| l08 | replay | To test a fix, it can replay only that step, with an edited context. Does the next move improve? | |
| l09 | replay | If the checks support the fix, it updates the context policy. If not, it changes nothing. | |
| l10 | results | On long terminal tasks, the average score with skills falls from 0.417 to 0.370. | On long terminal tasks, the average score with skills falls from point four one seven to point three seven. |
| l11 | results | ContextEvo reaches 0.448 and uses fewer tokens on average. | Context Evo reaches point four four eight and uses fewer tokens on average. |
| l12 | caveat | One limit: each task ran once. On tasks it did not learn from, changes vary by setting. | |
| l13 | close | So before you add skills, check what your agent can see. | |

Scenes and their transitions out:

| Scene | Transition out | Why |
|---|---|---|
| `hook` | `zoom` | into the screen |
| `buried` | `whip` | new topic |
| `policy` | `whip` | new topic |
| `learn` | `cut` | same topic |
| `replay` | `punch` | payoff |
| `results` | `blur` | wind-down |
| `caveat` | `whip` | new topic |
| `close` | none | end card inside the scene |

The main transition is `whip`, with `zoom`, `punch` and `blur` as accents.

### STE block (checked on a scratch copy: 0 hard, 0 soft findings for this script and for all three hooks)

    "ste": {
      "names": ["ContextEvo", "coding"],
      "terms": [
        { "term": "context policy", "avoid": ["rules", "memory rules", "context rules", "context strategy", "memory policy", "context management"] },
        { "term": "evidence", "avoid": ["clue", "clues", "information", "facts"] },
        { "term": "runs", "avoid": ["trajectory", "trajectories", "rollout", "rollouts", "episode", "episodes", "attempts"] },
        { "term": "skills", "avoid": ["playbook", "playbooks", "manual", "manuals", "procedures"] },
        { "term": "model", "avoid": ["LLM", "base model", "brain"] },
        { "term": "step", "avoid": ["decision point", "turn", "moment"] },
        { "term": "score", "avoid": ["reward", "accuracy", "pass rate"] },
        { "term": "replay", "avoid": ["rerun", "reruns", "simulate"] },
        { "term": "benchmarks", "avoid": ["test sets", "evals", "exams"] }
      ],
      "allow": [
        { "line": "l03", "rule": "passive", "why": "quotes the abstract word for word; the receipt highlights the same words" },
        { "line": "l07", "rule": "ing", "why": "missing is one of the paper's four failure labels (sec 4.2); the scene stamps the same word" },
        { "line": "l12", "rule": "ing", "why": "quotes the conclusion (held-out changes vary by setting); the receipt highlights the same words" }
      ]
    }

- **Why "rules" is avoided.** The paper uses "rules" for the approach it argues against ("rules, prompts, or skills" in sec 1, the compression rules of ACON and TRACE, TACO's rule pool). So the narration describes the context policy by what it decides, never as "rules".
- **"coding" in `names`** follows Dream-RSI. It is not in the current script, but it guards a rewrite.

### Shots

Start seconds are estimates (see the timing basis at the top). Words in quotes are the cue words.

| Scene | Line | Start (s) | Spoken words | What appears or moves; camera | Transition out |
|---|---|---|---|---|---|
| hook | l01 | 0.0 | (before the voice) | Frame 0 is complete: big type `NEW SKILLS.` / `LOWER SCORE.` (y 170 to 470), kicker `on long tasks`. Below them, the robot at a tall bubble screen (y 560 to 1300), the skill shelf at left, and the meter at right with its `start` tick. The big type settles from scale 1.04 to 1.0 by 0.4 s, and the bubbles scroll upward slowly the whole time. Camera pushes from 1.00 to 1.03 over the line. | |
| hook | l01 | 0.3 | "This agent" | Robot blinks and turns its head to the screen. Camera beat. | |
| hook | l01 | 1.0 | "learned skills" | Three skill books hop off the shelf onto the desk, 0.15 s apart (pop x3). Tag `skills` slams onto the stack on "skills" at 1.4 (thud). | |
| hook | l01 | 2.0 | "its own runs" | Run chips fly out of the screen into the books (whoosh), and the stack thickens. | |
| hook | l01 | 3.4 | "score dropped" | Meter: the amber level falls from the `start` tick to the skills level and the meter shakes (impact on "dropped", 3.8). `LOWER SCORE.` bumps in scale. | |
| hook | l02 | 5.0 | "The same agent" | The books slide off the desk and out to the left (whoosh). `NEW SKILLS.` wipes to `WHAT IT SEES.` | |
| hook | l02 | 6.0 | "learned what its model" | The screen frame glows cyan. Two long grey log bubbles fold into one-line chips (click x2). The amber evidence bubble slides to the top and gets a pin (pop on "model", 7.1). | |
| hook | l02 | 7.8 | "should see instead" | Robot's eyes move up to the pinned bubble. Camera pushes toward the screen (scale 1.06). | |
| hook | l02 | 8.8 | "Its score rose" | Meter: a cyan level rises from the `start` tick to the ContextEvo level, above the tick (riser ending on "rose", 9.2, then impact and sparks at the top). `LOWER SCORE.` flips to `HIGHER SCORE.` (slam). | zoom (into the screen) |
| buried | l03 | 10.1 | "On long tasks" | The screen fills the frame; the dark zone above its top edge reads as out of view. The amber `evidence` bubble sits just under that edge. Grey bubbles (`log`, `file`, `tool output`) pour in from the bottom, one every 0.35 s, pushing the feed up (tick on every second bubble). | |
| buried | l03 | 11.4 | "useful evidence can be buried" | Receipt R1 rises (pop). Camera dives to reading size with "useful" left-aligned. The highlighter follows the voice, and the pen circles "buried" on "buried" at 12.6. | |
| buried | l03 | 13.2 | "redundant or outdated" | Cut back to the feed. Stamp `redundant` lands on a repeated log bubble (13.3), stamp `outdated` on an old file bubble (13.9) (stamp x2). The amber bubble crosses the top edge and dims. | |
| buried | l03 | 14.2 | "context" | Camera tilts up after the amber bubble. Label `out of view` fades in beside it as it sinks into the dark. | |
| buried | l04 | 15.4 | "In over half" | Camera pans right to the skill shelf. A grid of run chips (4 rows of 11) pops in row by row (pop x4, 15.4 to 15.9). | |
| buried | l04 | 16.7 | "the skill runs" | The 20 `_read` chips flip to show an open book, left to right (tick every few chips). | |
| buried | l04 | 18.0 | "never opened a skill" | The other 24 chips show a shut book and dim. Tag `skill not opened` slams beside them (thud on "opened", 18.3). The top book on the shelf rattles and puffs dust (sparks at 18.9). | whip |
| policy | l05 | 19.9 | "A context policy" | The screen returns, smaller and centred, with the robot below it. A header strip draws across the top of the screen; its label `context policy` stamps in on "policy" (20.8). | |
| policy | l05 | 21.1 | "decides what" | Control `entry`: a long bubble enters from below and folds into a one-line chip with a thin link line (click). | |
| policy | l05 | 21.8 | "the model sees" | Control `history`: an old bubble drops into a side drawer, then the amber evidence bubble is fetched back up into view (pop on "sees", 22.4). | |
| policy | l05 | 22.7 | "The model itself" | Control `sharing`: a helper panel splits off to the right and hands back one small chip (whoosh). | |
| policy | l05 | 23.3 | "stays the same" | The robot gets a padlock badge `same model` (pop and stamp on "stays", 23.7). Camera pushes in on the header strip (24.3). | whip |
| learn | l06 | 25.4 | "Context Evo learns" | Tag `ContextEvo` pops at top left (about 70 px). Three past-run strips slide in from the right, stacked: two with a `failed` tab, one with a `passed` tab. | |
| learn | l06 | 27.1 | "from past runs" | The top failed strip lifts and unrolls across the bench. Perforations divide it into pages (whoosh). | |
| learn | l06 | 28.4 | "It rebuilds what the model saw" | A magnifier lands on page 1. Above it, a small screen assembles its bubbles one by one, labeled `what the model saw` (type). | |
| learn | l06 | 30.0 | "page by page" | The magnifier hops to page 2 (30.0) and page 3 (30.6). On each hop, a running-note card at the side adds a line: `progress`, `open items`, `context changes` (type). | |
| learn | l07 | 31.8 | "Was the evidence" | The magnifier stops on a page with a red flag. Camera pushes in. The small screen shows the amber bubble out of view at the top. | |
| learn | l07 | 32.9 | "missing, degraded, buried, or polluted" | Four stamps pop in a fan around the page, each on its word: `missing` (32.9), `degraded` (33.2), `buried` (33.6), `polluted` (34.2) (stamp x4). | |
| learn | l07 | 34.6 | "Or was it the model's own mistake" | A fork line draws from the page. The left branch, labeled `context`, goes to the four stamps. The right branch goes to a robot icon labeled `model's own mistake` (pop on "model's", 36.0). | |
| learn | l07 | 36.7 | "mistake" | The fork's pointer wobbles between the branches. Then the `buried` stamp lifts and slams onto the page (impact at about 37.1). This illustrates one case; it shows no counts. | cut |
| replay | l08 | 37.6 | "To test a fix" | The failed run lays out as a horizontal timeline of step frames, with a playhead at the end. | |
| replay | l08 | 38.9 | "fix, it can replay" | The playhead rewinds to the flagged step (frames streak right to left; rewind whoosh). Steps before it get small locks and the label `fixed`. Steps after it dim, with the label `not run`. | |
| replay | l08 | 40.5 | "only that step" | The flagged frame lifts out and grows into a large screen. Camera follows. | |
| replay | l08 | 41.7 | "with an edited context" | A hand drags the amber evidence bubble back into view and pins it (pop). Label `edited context` types in. | |
| replay | l08 | 42.4 | "Does the next move" | Under the screen, a dim arrow labeled `before` points at door A. A new arrow labeled `after` draws toward door B (whoosh). | |
| replay | l08 | 43.6 | "improve?" | A big `?` pops between the two arrows and pulses; it is never answered. Camera eases out. | |
| replay | l09 | 44.9 | "If the checks support the fix" | Camera pans to the `context policy` card from `policy`. Two boxes beside it fill: `compare runs` on "checks" (45.5) and `replay` on "support" (45.8) (tick x2). | |
| replay | l09 | 47.1 | "it updates the context policy" | A pencil writes a new line on the card, `keep a record of verified facts` (type), and the card flexes. | |
| replay | l09 | 48.4 | "If not, it changes nothing" | A second card slides in below and a `no edit` stamp slams onto it (stamp on "changes", 49.3). It stays unchanged and gives a small wobble on "nothing" (49.6). Camera drifts right to lead into the punch. | punch |
| results | l10 | 50.6 | "On long terminal tasks" | Title `Long-Horizon-Terminal-Bench` and subtitle `average score · all tasks, including the ones it learned from` write on. The axis (starting at 0, no break, no printed ticks) and a dashed `start` line draw. | |
| results | l10 | 52.0 | "the average score" | Bar `starting agent` grows and counts up to `0.417` (tick x3). | |
| results | l10 | 53.4 | "with skills falls" | Bar `with skills` grows to the dashed start line, then falls to its value on "falls" (54.2, thud). | |
| results | l10 | 55.0 | "from point four one seven to point three seven" | Receipt R2 rises. Camera at reading size, left-aligned on the line that begins `0.417 to 0.370`. The highlighter follows "0.417" (55.0 to 56.0) and "to 0.370" (56.4 to 57.5). The pen circles `0.370,` on "three" (57.1). | |
| results | l10 | 57.3 | "seven" | Back on the chart: label `0.370` pops above the `with skills` bar. Token stacks rise under bars 1 and 2, the `with skills` stack taller (pop). | |
| results | l11 | 58.8 | "Context Evo reaches" | Bar `ContextEvo` grows, counting up. | |
| results | l11 | 60.3 | "point four four eight" | It lands at `0.448`, above the dashed start line (impact on "eight", 61.0, then small sparks). | |
| results | l11 | 61.7 | "uses fewer tokens on average" | Its token stack rises to the shortest height. Tag `fewer tokens, on average` pops on "fewer" (62.1). | |
| results | l11 | 63.2 | "average" | Camera pulls back to show all three bars and stacks. The subtitle pulses once. | blur |
| caveat | l12 | 64.3 | "One limit" | Tag `one limit` slams at the top (thud on "limit", 64.8). | |
| caveat | l12 | 65.1 | "each task ran once" | Task cards deal out in a row (pop stagger, 65.1 to 65.6). One run token sweeps along the row once, and a `ran once` stamp lands (stamp on "once", 66.1). | |
| caveat | l12 | 66.4 | "On tasks it did not learn from" | The row splits. The left group slides left and dims, labeled `learned from`. The right group slides right and brightens, labeled `did not learn from`. | |
| caveat | l12 | 68.0 | "learn from, changes vary by setting" | Receipt R3 rises. Camera at reading size, left-aligned on `held-out`. The highlighter follows the voice and the pen circles "vary" on "vary" (69.0). Label beside the crop: `held-out = tasks it did not learn from`. | |
| caveat | l12 | 69.9 | "setting" | Cut back to the right-hand group. A small needle above it swings left and right (decoration only). Label `setting = benchmark + model`. | whip |
| close | l13 | 70.6 | "So before you add skills" | The hook drawing returns with robot, screen, shelf, and meter at its `start` tick, all in their frame-0 positions. A skill book lifts off the shelf toward the robot (whoosh). | |
| close | l13 | 71.8 | "add skills" | The robot raises a hand and the book stops in mid-air. | |
| close | l13 | 72.4 | "check what your agent" | The screen glows. The amber evidence bubble slides back into view and gets a pin (pop). | |
| close | l13 | 73.7 | "can see" | Big type `CHECK WHAT YOUR AGENT CAN SEE.` writes on in the hook title's position and size (slam on "see", 74.0). | |
| close | end | 74.6 | (no voice) | The big type fades. `hemanth_with_ai` writes on in the centre (chime). The book floats back to the shelf, so the drawing holds exactly the frame-0 layout for the loop. | end (76.0) |

### Pacing check

I re-read the table against the 2.5 s rule. The result is 57 beats in about 76 s (45 a minute), and the first beat is at frame 0 (the big type's settle).

- **Longest gaps:**
  - 2.4 s inside the R2 hold (55.0 to 57.3). The highlighter keeps sweeping and the circle lands at 57.1.
  - 2.2 s at 44.9 to 47.1. Two boxes fill inside it, at 45.5 and 45.8.
  - 2.1 s at 34.6 to 36.7. The `model's own mistake` pop lands at 36.0.
- **No still stretch.** No 3 s stretch is without a new element or camera move. Every gap between big events is 1.9 s or less once those in-between events are counted.
- **Idle motion in every scene** in case the real voice runs long: bubbles scroll, the robot blinks every 1.5 s, the meter breathes.

**If the measured video comes out over 78 s, trim in this order:**

1. "To test a fix," from l08 (4 words, about 1.3 s).
2. "The model itself stays the same." from l05 (6 words, about 2 s). Keep the `same model` badge on screen.

Never cut "average", "On long terminal tasks", or the caveat.

## 6. Numbers budget

Three headline numbers, all from one comparison: same benchmark, same starting harness, same tasks.

| On screen | Where in the paper | Absolute or relative | Measured or theoretical | Whose |
|---|---|---|---|---|
| 0.417 | Table 3 and sec 6.1 (p.7). The same value is Table 2's Pi-agent LHTB "All" score of 41.7. | Absolute: average task score (mean partial reward, 0 to 1, App. A.2 eq. 7) over all 46 LHTB tasks, **including the 20 held-in tasks** the skills and the policy were learned from. | Measured, one run per task (App. A.2, p.16: "Each task is attempted once"). | Authors' runs of the Pi-agent baseline. Sec 6.1 does not name the model; it is inferred to be DeepSeek-V4-Flash-0731 because 0.417 and 0.448 match that model's rows in Table 2. Never named in the video. |
| 0.370 | Table 3 and sec 6.1 | Absolute, same metric and task set | Measured, one run per task | Authors' runs of a skill-only arm: skills derived from held-in LHTB runs (following Zhang et al. 2026a), with context-policy generation off (App. C.1). |
| 0.448 | Table 3 and sec 6.1. Same value as Table 2 iter-1 "All", 44.8. | Absolute, same metric and task set | Measured, after **one** evolution round, one run per task | Authors' runs |

**These are averages, and the lines say so.** All three are benchmark means, and the paper gives no per-task breakdown for Table 3. So l10 says "average score", l11 says "fewer tokens on average", and the chart subtitle reads `average score · all tasks, including the ones it learned from`. No line says "every task" or "each task scored".

**Drawn but never printed.** These come from `_` keys and are listed in `facts.json` for the facts review:

| Drawing | Values | Source |
|---|---|---|
| Meter levels in `hook` and `close` | 0.417, 0.370, 0.448 | Table 3 |
| Run chips | 20 read out of 44 inspectable runs | sec 6.1 |
| Token stacks | 8.57M, 9.61M, 7.52M mean tokens per run | Table 3 |

The meter and the bars both start at 0 with no axis break (top of axis 0.5, not printed), so the gaps are not exaggerated.

**Cut, and why:**

| Cut | Where | Why |
|---|---|---|
| "Scores also rose on the coding and search benchmarks" (a former l12) | Table 2 | True only for the full sets, which include the held-in tasks. On held-out tasks with GPT-5.6-Luna, DeepSWE fell from 18.5 to 15.4 to 13.8, and iter-1 also lowered held-out BrowseComp-Plus for both models. The full-set Luna DeepSWE gain (13.3 to 14.2) is about one task of 113. This is the Dream-RSI "faster" failure again. |
| 3.1 to 4.4 points, 64.6 to 71.7 on DeepSWE, 88.5 on BrowseComp-Plus | sec 1, Table 2 | Full-set numbers. They would need the same held-in qualifier and would take the budget past 4. |
| Comparisons with Codex, OpenCode and OpenClaw | abstract, sec 5.2 | Under GPT-5.6-Luna, Codex is far ahead on DeepSWE (44.3 against 14.2) and BrowseComp-Plus (60.1 against 42.0), so "comparable to prominent harnesses" holds mainly for one model. Too nuanced for 70 s. |
| OpenClaw 33 to 79 of 174 | sec 6.4, App. C.4 | A second idea (cross-harness), from a low base, scored with a Qwen3.8-27B judge. |
| Ablation, without paginated review: 32.64%, -12.15 pp | Table 5 | Method internals. Page-by-page review is shown in l06 without the number. |
| Transfer: the LHTB policy on DeepSWE, -3.54 and -7.96 pp | sec 6.3, Table 13 | A second idea (policies are environment-specific). |
| Context-management baselines (ReSum, ACON, TACO) | Table 4 | A second comparison. |
| 0.419 (ContextEvo plus skills) | Table 3 | Visible inside the R2 crop only. Not narrated. |

## 7. The honest caveat

l12, at 64.2 to 70.5 s, paced like the other lines:

> "One limit: each task ran once. On tasks it did not learn from, changes vary by setting."

Sources: App. A.2 (p.16, "Each task is attempted once") and the conclusion (p.9, receipt R3). It is drawn as the `caveat` scene, not as a text card.

Why this caveat:

- The three scores come from single runs on 46 tasks, with no error bars.
- The paper itself says results on held-out tasks differ across benchmark and model settings. For example, held-out DeepSWE with the second model fell in both rounds.
- The scores also include the tasks it learned from. The results scene states that in its subtitle, so the voice does not repeat it.

## 8. Loop and ending

The last line, "So before you add skills, check what your agent can see", lands on the hook's drawing in its frame-0 positions. On replay, the hook answers it with a cautionary tale: "This agent learned skills from its own runs. Its score dropped."

To make the cut invisible:

- In `close`, the robot, screen, shelf and meter sit exactly where they are at 0.0 s.
- The close's big type sits in the hook title's box.
- When the end card fades the big type, `NEW SKILLS. / LOWER SCORE.` takes that same box at frame 0.

The end card's only text is `hemanth_with_ai`. Unlike Dream-RSI's close, it has no credit line, paper name, arXiv id or authors.

## 9. Post text angle

**Title:** New skills lowered this agent's score. What raised it?

**First line of the caption:** "On 46 long terminal tasks, skills learned from an agent's own runs lowered its average score from 0.417 to 0.370. ContextEvo instead learned what the model should see, and reached 0.448 with fewer tokens on average (authors' runs, one run per task)."

After that:

- Paper title, arXiv 2609.34649 (v1), and "unofficial explainer".
- One sentence of caveat: held-out results vary by benchmark and model.

## Producer notes

**`facts.json` claims, per line:**

| Line | Claim and source |
|---|---|
| l01 | sec 6.1 and Table 3 (skill-only 0.370 against 0.417 on LHTB-46); App. C.1 (the skill-only arm) |
| l02 | sec 6.1 and Table 3 (ContextEvo 0.448); sec 3.2 (the policy governs how information is presented, maintained and shared) |
| l03 | Abstract, R1 |
| l04 | sec 6.1 (only 20 of 44 inspectable skill-only runs read a skill body; "opened" means the body) |
| l05 | sec 3.2 (the policy produces the model-visible context); sec 3.1 ("the base model M remains fixed") |
| l06 | sec 4 and 4.1 (held-in runs; trajectory scan; paginated review rebuilds the model-visible context, with a running note) |
| l07 | sec 4.2 eq. 5 (missing, degraded, buried, polluted); sec 4.1 (separates failures from the model, tools or environment); judge prompt, p.21 to 22 |
| l08 | sec 4.2 eq. 4. "can" because replay is used when the observed evidence does not settle the attribution. |
| l09 | sec 4.2 (an attribution is kept only when the evidence supports it); sec 4.3 (no supported update means no change); App. B.2 (the editor may return an empty changeset) |
| l10 | sec 6.1 and Table 3, R2 |
| l11 | sec 6.1 and Table 3 (7.52M mean tokens per run, against 8.57M and 9.61M) |
| l12 | App. A.2; Conclusion, R3 |
| l13 | Takeaway; adds no claim |

**Sources for on-screen words in the drawings:**

| On-screen words | Source |
|---|---|
| Control labels `entry`, `history`, `sharing` | Table 1 roles |
| Running-note lines `progress`, `open items`, `context changes` | sec 4.1 |
| Policy-card line `keep a record of verified facts` | App. C.5, LHTB policy: "a bounded record of verified facts, unresolved items, and recovery paths" |

**Other rules:**

- No model name anywhere, spoken or on screen. Benchmark names appear only as on-screen labels.
- `46` appears only inside the R2 crop. The chart says `all tasks`.
- Safe zones: the score meter (right of the screen in `hook` and `close`) and the token stacks must stay left of x 940 below y 1000 (platform buttons), and everything stays in y 160 to 1450, clear of the caption band.
- Run `node hf/bin/ste.mjs` before `voice`. Read `words` output for "point four one seven" and "Context Evo"; whisper mishears are why Dream-RSI's l08 needed a new seed.
