# Treatment: AutoCompact (arXiv 2610.02163 v1)

Paper: "AutoCompact: Learning When to Compact Context in Long-Horizon Coding Agents". Authors: Xuan Zhang and Longtao Zheng (equal contribution), Cunxiao Du, Bo An, Xin Dong, from Singapore Management University, Nanyang Technological University and Harvard University. arXiv 2610.02163, version v1, submitted 1 Oct 2026. I read it in full from `llm-wiki/raw/assets/2610.02163/paper-v1.pdf` (11 pages). The text is in `paper-v1-text.txt`, with pages split by `===== PAGE n =====` and extracted with pdfium. pdfium joins a printed line that ends in a soft hyphen (U+FFFE) to the next one, so one text line can hold two printed lines.

- **Renderer.** HyperFrames. Folder: `paper-reels/episodes/autoCompact/`.
- **Size.** 13 lines, 198 caption words (about 210 spoken, with numbers spelled out), 8 scenes.
- **Length.** About 78 s at Dream-RSI's measured pace.
- **Voice.** Same as Dream-RSI (`aiden`, speed 1.12).
- **Timing basis.** Dream-RSI's measured pace is 3.14 words a second, plus the timing formula (lead 0.25 s, tail 0.5 s, 1.6 s after the last line). Start seconds below are estimates. Every beat is tied to a spoken word, so re-time it from this episode's own `audio/words.json`.

## What the channel already covered, and how this one differs

- **Context Language Models.** The model edits its context as a file. Pictures: desk, page stack, scissors, eraser.
- **ContextEvo.** The harness learns what the model sees, and the model stays fixed. Pictures: scrolling screen of message bubbles, robot, skill shelf.
- **Dream-RSI.** Replaying old search trees. Pictures: dream bubble, tree.
- **DeepSWE.** A coding benchmark. Picture: pin-tumbler lock.

This is the third context video, so it has to be new in idea and in picture.

- **New idea.** The training targets the model's own compaction decision, including what it does after it compacts. The paper's sharpest point is that a summary only helps if the agent follows it. Its judge fixes actions *before* they run, so the rest of the run grows from the fix.
- **New picture.** A hiker on a trail with a backpack, stage flags, and a press that flattens the pack into a trail card. There is no desk, paper stack, scissors, eraser, chat screen or robot.

## 1. The one idea

AutoCompact trains a coding agent to choose its own moment to compact its context, when a stage of the task is done, instead of when the context is full, and that trained agent passed more tasks.

The mechanism comes second. The producer needs it; the viewer only needs the idea above.

1. The agent gets a `compact()` action. Compaction replaces earlier history with a working-state summary and keeps the original task (sec 2.1).
2. A judge reviews each proposed action of the base agent during data collection and writes a fix. The environment runs the fix in place of the original, so the run continues from it (sec 2.2). The fixes cover three things: when to compact, what to keep, and how to continue.
3. The corrected runs train the model with supervised fine-tuning (SFT). Then reinforcement learning (RL) with one pass-or-fail reward trains coding and compaction together. There is no compaction-specific reward (sec 2.3).
4. At test time there is no judge (sec 2.2).

**What the idea must not claim.** It must not claim that the timing of compaction alone produced the gain. The 30.4% to 39.6% jump is the whole trained recipe against an untrained base model that keeps its full context. When the same trained agent skips its compact calls, it loses 19.9 points at the smallest budget but only 1.9 at the largest (sec 3.3). The video says this in the caveat.

## 2. Hook options

| # | Spoken line (STE, 12 words max) | On screen from 0.0 to 1.0 s |
|---|---|---|
| A | "Popular coding agents compact when their context nears the limit. Wrong moment?" (12 words) | **Frame 0 already shows** the big type `COMPACT AT THE LIMIT.` / `WRONG MOMENT?` over a drawing that is already there. A hiker is halfway along a trail stretch, between two stage flags, with a magnifier on a line of footprints. The hiker's backpack bulges with chips (`search`, `tool output`, `test log`), and a gauge strap on the pack, labeled `context`, sits just under a red `limit` tick. A press plate labeled `compact()` hangs open above the pack. By 1.0 s a `tool output` chip drops into the pack and the gauge ticks up. |
| B | "Even with rules in its prompt, this model rarely compacted early." (11 words) | Big type `TOLD TO COMPACT EARLY.` / `IT RARELY DID.` A hiker walks straight past a `compact()` peg planted at a stage flag. A scroll labeled `compaction rules` floats over its head. |
| C | "This agent had room for its whole context. Compaction still helped." (11 words) | Big type `ROOM FOR EVERYTHING.` / `COMPACTION STILL HELPED.` A very tall, mostly empty backpack, with a hiker who flattens it into a trail card anyway. |

**Pick A.**

- **The viewer has seen it happen.** Anyone who runs a coding agent has watched it compact in the middle of a task. The paper names that design: "Widely used agent harnesses such as Codex and Claude Code currently compact the context automatically when it approaches the window limit" (p.9, Limitations). The video does not name them, because the paper did not test them.
- **It asks a question the video answers on schedule.** l04 at about 16 s gives the paper's answer: decide when, what and how. The answer is backed up in l10 at about 51 to 58 s, with a forced compaction for both agents and the authors' sentence "compaction based on task progress is more effective".
- **It loops.** The close, "Your agent will compact. The question is when.", leads straight back into "Wrong moment?".
- **Why not B.** It is a measured surprise, but it is about the base model, not the idea. It works better as l05, with its own receipt.
- **Why not C.** It puts the smallest effect in the paper first: 30.4 to 32.2 for SFT against Base at 256K, and 1.9 points from running compaction at the largest budget. It also opens the training-versus-compaction question in the first second.

**Truth check for A.**

- "Compact when the context nears the limit": p.9 (quoted above) and sec 1, "Length-triggered methods ... compact only when the remaining context budget falls below a fixed threshold".
- "Wrong moment?" stays a question. The paper's reason it can be wrong: "stale exploration accumulates until the threshold is reached, and compaction may then occur in the middle of an unresolved stage whose evidence is still needed" (sec 1, p.1). l03 says this.

**First-frame rules.**

- The big type is at full opacity at 0.0 s. It may settle in scale from 1.04 to 1.0 over 0.0 to 0.4 s. There is no character-by-character entrance.
- The thumbnail hook uses the same words: `thumb_hook` "Compact at the limit. Wrong moment?". `scenes/thumb-hero.html` is the frame-0 hiker with the pack and the press.
- `AutoCompact` first appears at about 16.6 s, as a tag of about 70 px. It is never the largest text in the first 2 s.

## 3. Visual metaphors (one per idea)

**Idea 1, context and compaction: the backpack and the press.**

- **Picture.**
  - Everything the agent read and ran is a chip that drops into its backpack: `search`, `tool output`, `test log`, `code`.
  - A gauge strap on the pack, labeled `context`, fills toward a red `limit` tick.
  - Compaction is a press plate, labeled `compact()`, that comes down on the pack. It flattens the chips into one folded trail card labeled `summary`.
  - The card unfolds to three rows: `state`, `target file`, `next step`. These are Figure 2's words: "state, target file, next step".
- **What a stranger reads.** "Everything I carried got pressed into one note."
- **Scenes.** Carried by `hook` (l01, l02). It returns in `close`.
- **Limits.** The card's rows are labels only. No card shows a file name or code.

**Idea 2, the wrong moment: the press that lands mid-stage.**

- **Picture.**
  - The task is a trail with stage flags taken from Figure 1's labels: `bug localized`, `edit file`, `run tests`.
  - Chips behind the hiker turn grey and gather dust lines (stale).
  - With length-triggered compaction, the gauge hits `limit` while the hiker is in the middle of a stretch, magnifier still on the footprints, before reaching the `bug localized` flag. The press comes down there. A tag reads `evidence still needed`.
- **What a stranger reads.** "It had to pack up in the middle of the search."
- **Scene.** Carried by `stale` (l03).
- **Limits.** The press does not destroy the footprints and no chip is shown lost. The paper says compaction "may" land mid-stage, where evidence "is still needed"; it gives no count of lost evidence.

**Idea 3, what AutoCompact decides: compact at the flag.**

- **Picture.**
  - The trained hiker walks to the `bug localized` flag, then plants a `compact()` peg (`when`).
  - The pack opens: grey stale chips drop to a discard pile, and the useful chips fold into the card (`what`).
  - A dotted arrow draws from the card's `next step` row to the `edit file` flag, and the hiker follows it (`how`).
  - Three empty sockets fill with the word labels `when`, `what` and `how` as each part happens. The sockets carry no digits.
- **Scene.** Carried by `idea` (l04).
- **Source.** Sec 2.1: "the agent may compact after localizing the cause of an issue and before proceeding to implementation".

**Idea 4, the judge fixes an action before it runs: the hand that moves the foot.**

- **Picture.**
  - The hiker's next footprint appears as a ghost outline in mid-air, labeled with the proposed action (`search repo`).
  - Time freezes: everything desaturates except the hand and the ghost print.
  - A large hand from above, its cuff labeled `judge`, lifts the ghost print and sets down a corrected one (`compact()`).
  - New footprints then grow forward from the corrected print. The old ghost path fades.
- **Second use, for continuation.** This is still the `base model` hiker, during data collection; the `AutoCompact` hiker first appears in `reward`. After compaction the hiker turns back toward the old dig site, while the summary card sits in its pocket. Tag: `ignores the summary`. The hand turns the hiker around toward the `edit file` flag. Tag: `follow the summary`. Both tags are Figure 2's words, and sec 2.2 describes the same failure in text: "such as re-running a search whose result is already recorded in the working-state summary".
- **What a stranger reads.** "Someone caught the wrong step before it landed, and the walk went on from there."
- **Scene.** Carried by `judge` (l06, l07).
- **Limits.** The hand never shows a check mark or a score. It only replaces the action.

**Idea 5, one reward trains everything: the pulse back along the trail.**

- **Picture.**
  - The hand lifts out of the frame and the tag `judge removed` appears.
  - A gate at the trail's end has a two-state light, `pass` / `fail`. Two ghost runs hit it, one each way.
  - A single pulse runs back from the gate along the whole trail. It lights the footprints (`coding`), the `compact()` peg and the summary card, all with the same glow.
- **Scene.** Carried by `reward` (l08).
- **Source.** Sec 2.3: the advantage is "a shared learning signal for all model-generated tokens in a trajectory, including regular coding actions, the decision to invoke compact(), the generated context summary, and the continuation".

**Not metaphors.**

- The results are a bar chart and a two-line budget chart (`results`).
- The caveat is a two-line budget chart and a split gain bar (`caveat`).

**Must-nots.**

- No trophy, crown, medal or green check near AutoCompact.
- Data marks (bars, chart lines, gain bar) stay in the neutral palette. The `pass` / `fail` gate light is a kind, so it may use mint and red.
- The base-model hiker is not drawn as clumsy or failing. It walks past the peg; it does not fall.
- No product logos, no terminal that resembles a named product, and no "/compact" command text.

## 4. Receipts

There are four text passages. Each is read on camera at about 3.4x, holds for about 2 s, and then the scene's own picture returns. I checked the printed line of each fragment with pdfium; each phrase sits on one printed line.

| # | Line | Page, section | Exact text in the paper | Highlighted | `find` | `circle` | Hold (est.) |
|---|---|---|---|---|---|---|---|
| R1 | l03 | p.1, Abstract | "As a task progresses, earlier exploration becomes stale, so managing context is more than avoiding overflow: an agent must decide when to compact, what working state to preserve, and how to continue from it." | "earlier exploration becomes stale" | `earlier exploration becomes stale` | `stale,` | 10.6 to 12.4 s |
| R2 | l05 | p.3, sec 2.2 | "In our preliminary experiments, the base model rarely invoked compact() before the context limit, even when compaction rules were specified in the agent prompt." | "rarely invoked compact()", then "even when compaction rules were" | `rarely invoked compact() before the context limit` | `rarely` | 23.2 to 25.6 s |
| R3 | l10 | p.8, sec 3.3 | "It also indicates that compaction based on task progress is more effective than compaction based solely on the length of the context." | "compaction based on task progress is more effective" | `compaction based on task progress is more effective` | `progress` | 54.6 to 57.0 s |
| R4 | l11 and l12 | p.8, sec 3.3 | "The advantage is 19.9% at $0.10 and remains 1.9% at $4.00, so executing compaction improves cost efficiency without reducing final performance." | l11: "The advantage is 19.9% at $0.10". l12: "remains 1.9% at $4.00" | `The advantage is 19.9% at $0.10 and remains 1.9% at $4.00` | `19.9%` (l11), `1.9%` (l12) | 62.5 to 64.6 s, then 67.6 to 69.3 s |

**R4 needs two `evidence.json` entries** (R4a for l11, R4b for l12) with the same `find` and different highlight and circle: R4a highlights "The advantage is 19.9% at $0.10" and circles `19.9%`; R4b highlights "remains 1.9% at $4.00" and circles `1.9%`. One entry cannot hold two separate highlights.

**What each hold sits between.**

- **R1.**
  - Before: the hiker walks, and chips pile into the pack.
  - After: on "A full context", cut back to the trail as the gauge climbs to `limit`.
- **R2.**
  - Before: the base-model hiker with a bulging pack.
  - After: on "rules", cut back as the `compaction rules` scroll unrolls over the hiker, who walks past the peg.
- **R3.**
  - Before: the small-context two-line chart.
  - After: on "effective", cut back to the trail as its flags light up one after another, each with a peg.
- **R4, first hold.**
  - Before: the two-hiker chart.
  - After: back on the chart, where the gap bracket at the smallest-budget end gets its `19.9 points` label.
- **R4, second hold.** The same crop, with the camera on the second half of the line. Then back to the chart's largest-budget end.

**Line breaks, checked with pdfium.**

- **R1.** "earlier exploration becomes stale" starts its printed line. "As a task progresses," ends the line above, so never highlight across that break. The voice reads both, but the highlight starts on "earlier".
- **R2.** The phrase sits mid-line, on the last printed line of p.3. That line ends "spec-" and the sentence continues on p.4, so the crop must stop at the page. The highlighter reaches "even when compaction rules were" on the same printed line. The voice matches its order: "rarely invoked compact early, even with rules in its prompt". Pin "rarely invoked compact()" to "rarely invoked compact" and "rules" to "rules".
- **R3.** The phrase ends its printed line ("... is more effective than"). The next line, "compaction based solely on the length of the context.", may stay visible without a highlight.
- **R4.** The whole fragment is one printed line. The line above it ends "part of the benefit depends on", and the line below starts "executing compaction improves cost efficiency".
- **In all four.** Left-align the first highlighted word with a margin (`follow: 0`, `fx` near 90), keep the circled word in frame for the whole hold, and `snap` each hold.

**Voice against crop.**

- **R1.** Read word for word.
- **R2.** The voice says "early" for "before the context limit". A label beside the crop reads `early = before the context limit`.
- **R3.** The voice says "The authors say compaction based on task progress is more effective." The paper's verb is "indicates", which is the authors' reading of the small-context result, so the line attributes it.
- **R4.**
  - l11 voice: "The advantage is nineteen point nine points at the smallest budget". Pin "advantage", "nineteen point nine" and "smallest budget".
  - Beside the crop, a word-only label with an arrow to `$0.10` reads `smallest budget`. A second label, shown during the second hold, points to `$4.00` and reads `largest budget`. These labels must carry no digits.
  - The paper writes "%" for these absolute differences (sec 3.3, and "absolute 9.2%" in the abstract). Voice and caption say "points".

**Numbers inside the crops.** Run `hf.mjs evidence`, then read `evidence/manifest.json`. Every digit in a crop goes into `facts.json` under `evidence_incidental`. Expected:

| Receipt | Expected digits |
|---|---|
| R1 | None in the abstract's middle lines. Check whether the crop reaches "9.2% and 5.0%" or "256K" and "16K" lower in the abstract; it should not if it keeps one line of context. |
| R2 | "2.2" from the section heading "2.2 JUDGE-GUIDED DATA COLLECTION AND SFT", if the crop reaches it, and the page number "3". |
| R3 | "3" from "Figure 3 (c)", two lines above, if included. |
| R4 | "19.9%", "$0.10", "1.9%", "$4.00", and "3" from "Figure 3 (d)" two lines above, if included. |

**Not usable as receipts.**

| Passage | Why not |
|---|---|
| "retaining the complete interaction history is not necessarily optimal" (p.7) | Breaks across printed lines after "necessarily". |
| "Prompting alone does not induce proactive compaction." (p.3) | Readable, but it would contradict Table 1, where SelfCompact (an inference-time rubric) beats Base, 31.7 against 30.4. Using it would mean a "prompting fails" line, so it is cut. |

## 5. Shot list

### Script (copy into `storyboard.json`)

| id | scene | `text` (caption, checked by STE) | `say` where it differs |
|---|---|---|---|
| l01 | hook | Popular coding agents compact when their context nears the limit. Wrong moment? | |
| l02 | hook | Compaction replaces the agent's context with a short summary. | |
| l03 | stale | As a task progresses, earlier exploration becomes stale. A full context can force compaction in the middle of a stage. | |
| l04 | idea | AutoCompact trains the agent to decide when to compact, what to keep, and how to continue. | Auto Compact trains the agent to decide when to compact, what to keep, and how to continue. |
| l05 | judge | The base model rarely invoked compact early, even with rules in its prompt. | |
| l06 | judge | So a judge checked each action before it ran. The run continued from the judge's fix. | |
| l07 | judge | Sometimes the agent ignored its summary and searched again. The judge sent it to the edit. | |
| l08 | reward | Then the judge left. One reward, pass or fail, trained coding and compaction together. | |
| l09 | results | The base model with its full context passed 30.4%. AutoCompact passed 39.6%. | The base model with its full context passed thirty point four percent. Auto Compact passed thirty nine point six percent. |
| l10 | results | In a small context, it also beat compaction at the limit. The authors say compaction based on task progress is more effective. | |
| l11 | caveat | Skip the trained agent's compact calls, and its pass rate drops. The advantage is 19.9 points at the smallest budget. | ... The advantage is nineteen point nine points at the smallest budget. |
| l12 | caveat | One limit: the advantage remains only 1.9 points at the largest budget. Most of the gain stays without the summaries. | One limit: the advantage remains only one point nine points at the largest budget. Most of the gain stays without the summaries. |
| l13 | close | Your agent will compact. The question is when. | |

Scenes and their transitions out:

| Scene | Transition out | Why |
|---|---|---|
| `hook` | `zoom` | into the backpack |
| `stale` | `whip` | new topic: the method |
| `idea` | `whip` | new topic: how the data was made |
| `judge` | `cut` | same topic, next training stage |
| `reward` | `punch` | payoff: the results |
| `results` | `blur` | wind-down into the check |
| `caveat` | `whip` | new topic: the close |
| `close` | none | end card inside the scene |

The main transition is `whip`, with `zoom`, `punch` and `blur` as accents.

### STE block

I checked it on a scratch copy of this script: 0 hard findings and 2 soft ones (l04 has 16 words in its sentence; l05 is a possible noun cluster). All three hooks check clean, with 0 hard and 0 soft findings.

    "ste": {
      "names": ["AutoCompact", "coding", "GitHub", "Reinforcement learning"],
      "terms": [
        { "term": "context", "avoid": ["memory", "transcript", "chat log"] },
        { "term": "compact", "avoid": ["compress", "compression", "condense", "prune", "trim", "wipe"] },
        { "term": "summary", "avoid": ["recap", "digest", "notes", "working state"] },
        { "term": "judge", "avoid": ["teacher", "coach", "reviewer", "critic", "grader"] },
        { "term": "action", "avoid": ["move", "moves", "turn"] },
        { "term": "stage", "avoid": ["phase", "milestone", "checkpoint"] },
        { "term": "run", "avoid": ["trajectory", "trajectories", "rollout", "rollouts", "episode", "episodes"] },
        { "term": "base model", "avoid": ["original model", "untrained model", "vanilla model"] },
        { "term": "pass rate", "avoid": ["score", "accuracy", "success rate", "solve rate"] },
        { "term": "tasks", "avoid": ["issues", "problems", "jobs"] },
        { "term": "budget", "avoid": ["spend", "cost cap", "price"] }
      ],
      "allow": []
    }

- **"compact" and "compaction"** are the paper's words and the word coding-agent users already see. "memory" is avoided because the paper's concept is context, and "memory" suggests a separate store.
- **"working state"** is the paper's long form for the summary. The narration uses only "summary"; "working state" stays out so there is one name.
- **"Reinforcement learning"** is in `names` only as a guard for a rewrite. The current script does not say it.
- The l05 noun-cluster warning is soft. If the producer wants it gone, use "The base model rarely invoked compact before the limit, even with rules in its prompt." It adds 2 words.

### Shots

Start seconds are estimates (see the timing basis at the top). Words in quotes are the cue words.

| Scene | Line | Start (s) | Spoken words | What appears or moves; camera | Transition out |
|---|---|---|---|---|---|
| hook | l01 | 0.0 | (before the voice) | Frame 0 is complete. Big type `COMPACT AT THE LIMIT.` / `WRONG MOMENT?` (y 170 to 470). Below it, the hiker mid-stretch between two flags, magnifier on footprints, pack bulging, gauge strap `context` just under the red `limit` tick, and the press plate `compact()` open above (y 560 to 1350). The big type settles from 1.04 to 1.0 by 0.4 s. The camera pushes from 1.00 to 1.03 over the line. | |
| hook | l01 | 0.6 | "coding" | A `tool output` chip drops into the pack (pop). The gauge ticks up. | |
| hook | l01 | 1.3 | "compact" | The press plate twitches down 20 px (tick). | |
| hook | l01 | 2.3 | "context nears" | A `search` chip drops in (pop). The gauge reaches `limit` on "nears" (2.7) and the tick flashes red (tick). | |
| hook | l01 | 3.2 | "limit" | The press slams onto the pack (thud, small shake). The magnifier jolts sideways off the footprints. | |
| hook | l01 | 3.7 | "Wrong moment?" | `WRONG MOMENT?` bumps in scale. A large `?` stamps beside the press (stamp at 4.0). The camera punches in to 1.06. | |
| hook | l02 | 5.3 | "Compaction" | The press lifts. The pack is flat, and a folded card slides out of it (whoosh). | |
| hook | l02 | 6.3 | "replaces the agent's context" | The chips stream out of the pack and shrink into the card (whoosh). The strap label `context` crossfades to `summary` on the card. | |
| hook | l02 | 7.7 | "short summary" | The card unfolds into three rows, `state`, `target file`, `next step`, at 7.7, 7.9 and 8.1 (click x3). | |
| hook | l02 | 8.6 | "summary" | The camera dives toward the pack's opening. | zoom (into the pack) |
| stale | l03 | 9.1 | "As a task" | A side-scrolling trail with flags `bug localized`, `edit file`, `run tests`. The hiker walks. The pack is shown in cutaway (the zoom lands inside it), with its `context` gauge strap, and fills with chips as they are picked up (tick on every second chip). | |
| stale | l03 | 9.9 | "progresses" | Chips behind the hiker turn grey and gain dust lines, three in a ripple (tick x3). | |
| stale | l03 | 10.6 | "earlier exploration becomes stale" | Receipt R1 rises (pop). The camera dives to reading size with "earlier" left-aligned. The highlighter follows the voice; the pen circles "stale," on "stale" (12.0). | |
| stale | l03 | 12.6 | "A full context" | Cut back to the trail. The hiker is in the middle of the stretch before `bug localized`, magnifier on footprints. The pack's gauge climbs to its red `limit` tick (short riser ending on "force", 13.5). | |
| stale | l03 | 13.8 | "compaction" | The press comes down on the pack (thud, shake). | |
| stale | l03 | 14.5 | "in the middle of a stage" | A stage bar draws over the stretch with a marker at its middle, labeled `stage: find the bug` (draw). Tag `evidence still needed` slams beside the magnifier on "stage" (15.3, stamp). | |
| stale | l03 | 15.8 | "stage" | The camera pulls back to show the unreached `bug localized` flag ahead. | whip |
| idea | l04 | 16.3 | "Auto Compact" | A clean trail with the same three flags. Tag `AutoCompact` pops at top left (about 70 px) on "Auto" (16.6). Three empty sockets slide in under the tag. | |
| idea | l04 | 17.2 | "trains the agent" | The hiker steps in from the left with a light pack (whoosh). Its footprints land in rhythm (tick x2). | |
| idea | l04 | 18.6 | "when to compact" | The hiker reaches `bug localized` and plants a `compact()` peg (stamp at 19.0). Socket 1 fills with `when` (pop). | |
| idea | l04 | 19.6 | "what to keep" | The pack opens. Grey chips drop to a discard pile and fade; amber chips fold into the card. Socket 2 fills with `what` on "keep" (20.0, pop). | |
| idea | l04 | 20.7 | "how to continue" | The card's `next step` row glows. A dotted arrow draws from it to the `edit file` flag. Socket 3 fills with `how` (21.0, pop). | |
| idea | l04 | 21.6 | "continue" | The hiker follows the arrow; the camera tracks right with it. | whip |
| judge | l05 | 22.4 | "The base model" | A second hiker with the badge `base model` is on the same trail, pack bulging, approaching `bug localized`. | |
| judge | l05 | 23.2 | "rarely invoked compact early" | Receipt R2 rises. The camera dives with "rarely" left-aligned. The highlighter follows "rarely invoked compact()" and the pen circles "rarely" (23.4). Label `early = before the context limit`. | |
| judge | l05 | 24.9 | "even with rules" | The highlighter reaches "even when compaction rules were" on "rules" (25.4). Cut back to the trail on 25.6. | |
| judge | l05 | 25.6 | "in its prompt" | A scroll labeled `compaction rules` unrolls over the hiker's head (whoosh). The hiker walks past the planted `compact()` peg, which wobbles (pop at 26.0). The pack bulges once more (26.5). | |
| judge | l06 | 27.3 | "So a judge" | A large hand with a cuff labeled `judge` enters from the top (whoosh). | |
| judge | l06 | 28.3 | "each action" | The hiker's next footprint appears as a ghost outline in mid-air, labeled `search repo`, aimed back down the trail. | |
| judge | l06 | 28.9 | "before it ran" | Time freezes: everything desaturates except the hand and the ghost print (tick, freeze pulse). | |
| judge | l06 | 29.8 | "The run continued" | The hand lifts the ghost print away and sets down a new print labeled `compact()` at the flag (stamp at 30.2). Colour returns. | |
| judge | l06 | 30.7 | "from the judge's fix" | Footprints grow forward from the corrected print, one every 0.25 s (pop x4, 30.7 to 31.5). The old ghost path fades. | |
| judge | l07 | 32.7 | "Sometimes the agent" | Still the `base model` hiker, during data collection: after a compaction, it holds the summary card in a pocket. | |
| judge | l07 | 33.7 | "ignored its summary" | The hiker turns back toward the old dig site. The card in its pocket flashes (tick at 34.3). | |
| judge | l07 | 34.9 | "searched again" | A ghost path draws back to the dig site. Tag `ignores the summary` stamps (35.2). | |
| judge | l07 | 35.9 | "The judge" | The hand returns and turns the hiker around by the shoulder (whoosh at 36.1). | |
| judge | l07 | 36.8 | "to the edit" | The card's `next step` row lights. The dotted arrow draws to `edit file`, and the flag waves (pop at 37.1). Tag `follow the summary` (37.3). | cut |
| reward | l08 | 38.4 | "Then the judge left" | The hand lifts out of the frame (whoosh). Tag `judge removed` pops (39.1). The hiker's badge flips from `base model` to `AutoCompact` (39.3). | |
| reward | l08 | 39.6 | "One reward" | At the trail's end, a test gate with a two-state light builds (pop at 39.8). | |
| reward | l08 | 40.4 | "pass or fail" | Two ghost runs reach the gate: the light shows `pass` on "pass" (40.4) and `fail` on "fail" (40.8) (tick x2). | |
| reward | l08 | 41.2 | "trained coding" | One pulse runs back from the gate along the whole trail (whoosh). It lights the footprints on "coding" (41.6, pop). | |
| reward | l08 | 42.2 | "and compaction" | The pulse lights the `compact()` peg and the summary card (pop at 42.3). | |
| reward | l08 | 42.7 | "together" | Every lit element glows at once. The camera pulls back to the full trail. | punch |
| results | l09 | 43.9 | "The base model" | Title `SWE-bench Verified` and subtitle `real GitHub tasks · pass rate · average of three runs` write on. The axis (from 0, no break, no printed ticks) draws. | |
| results | l09 | 44.3 | "base model with its full context" | Bar `base model · full context` grows (tick x3). | |
| results | l09 | 46.0 | "passed thirty point four percent" | The bar counts up and lands on `30.4%` on "percent" (47.2, small thud). | |
| results | l09 | 47.9 | "Auto Compact passed" | Bar `AutoCompact` grows (riser ending on "six", 49.8). | |
| results | l09 | 50.0 | "percent" | It lands on `39.6%` (impact, small sparks). A bracket under both bars draws, labeled `same model, same scaffold` (pop at 50.4). | |
| results | l10 | 51.3 | "In a small context" | The camera slides right to a second panel: two hikers with short packs, both with a red `limit` line and a press labeled `forced compaction`. | |
| results | l10 | 51.6 | "small context" | Labels pop: `base model: compacts at the limit` (51.6), `AutoCompact: same limit, plus its own choice` (52.0). | |
| results | l10 | 52.9 | "beat compaction at the limit" | A small two-line chart draws across `budget per task`, with word labels `smallest` and `largest` and no numbers. The AutoCompact line sits above at every point (draw, 52.9 to 54.1). Tag `higher at every budget` on "limit" (54.1). | |
| results | l10 | 54.6 | "The authors say compaction based on task progress" | Receipt R3 rises. The camera is at reading size with "compaction" left-aligned. The highlighter follows; the pen circles "progress" on "progress" (56.6). | |
| results | l10 | 57.1 | "is more effective" | Cut back to the `idea` trail. Its three flags light in sequence, each getting a `compact()` peg (pop x3, 57.2 to 57.6). | blur |
| caveat | l11 | 58.9 | "Skip the trained agent's" | Two identical hikers stand side by side, both badged `AutoCompact`. | |
| caveat | l11 | 60.2 | "compact calls" | The right hiker's `compact()` peg gets a strip of tape labeled `skipped` (stamp). Its pack stays full, with no card (pop at 60.6). | |
| caveat | l11 | 61.3 | "and its pass rate drops" | A two-line chart draws below: `compaction runs` and `compact calls skipped`, across `smallest budget` to `largest budget` in words (draw, 61.3 to 62.3). | |
| caveat | l11 | 62.5 | "The advantage is nineteen point nine" | Receipt R4 rises. The camera has "The advantage" left-aligned. The highlighter follows "The advantage is 19.9% at $0.10", and the pen circles `19.9%` on "nine" (64.1). The label `smallest budget` points at `$0.10`. | |
| caveat | l11 | 64.7 | "at the smallest budget" | Back on the chart. A gap bracket draws at the smallest-budget end, and the label `19.9 points` pops (64.9). | |
| caveat | l12 | 66.9 | "One limit" | Tag `one limit` slams at the top (thud on "limit", 67.1). | |
| caveat | l12 | 67.6 | "the advantage remains only one point nine" | R4 returns for its second phrase. The highlighter sweeps "remains 1.9% at $4.00", and the pen circles `1.9%` on "nine" (68.9). The label `largest budget` points at `$4.00`. | |
| caveat | l12 | 69.4 | "at the largest budget" | Back on the chart. The camera pans to the largest-budget end, where a small gap bracket draws with the label `1.9 points` (pop at 69.8). | |
| caveat | l12 | 70.8 | "Most of the gain" | A single gain bar rises from the base model's level (ghost outline). It splits into a tall lower part labeled `stays without summaries` (pop at 71.4) and a thin cap labeled `from running compaction` (pop at 71.9). | |
| caveat | l12 | 72.5 | "without the summaries" | The thin cap glints. A small tag fades in: `one base model · one scaffold` (72.6). | whip |
| close | l13 | 74.0 | "Your agent" | The hook drawing returns in its frame-0 positions: hiker mid-stretch, magnifier, bulging pack, gauge just under `limit`, press open (whoosh). | |
| close | l13 | 74.8 | "will compact" | The press twitches (tick), as in the hook. | |
| close | l13 | 75.4 | "The question" | The `bug localized` flag ahead lights (pop). | |
| close | l13 | 76.2 | "is when" | Big type `THE QUESTION IS WHEN.` slams into the hook title's box, in the same size (slam on "when"). | |
| close | end | 76.8 | (no voice) | The big type fades. `hemanth_with_ai` writes on in the centre (chime). The drawing holds the exact frame-0 layout for the loop. | end (78.3) |

### Pacing check

I re-read the table against the 2.5 s rule.

- **Totals.** About 80 listed beats in about 77 s before the end card, roughly 60 a minute. The first beat is at frame 0 (the big type's settle), then 0.6 s.
- **Longest gaps between listed beats:**
  - 2.0 s, 64.9 to 66.9 (end of l11 into l12). The chart line keeps a slow shimmer, and line l12 starts with a thud.
  - 1.9 s, 54.6 to 56.6, inside the R3 hold. The highlighter sweeps the whole time.
  - 1.7 s, 44.3 to 46.0, while the base bar is growing.
  - 1.6 s, 23.4 to 25.0, inside the R2 hold, with the highlighter moving.
- **No still stretch.** No 3 s stretch is without a new element or a camera move.
- **Idle motion in every scene,** in case the real voice runs long: the hiker's walk cycle, the gauge breathing, chips settling, and the chart line shimmer.

**If the measured video comes out over 79 s, trim in this order:**

1. "Sometimes" from l07: "The agent ignored its summary and searched again." (about 0.5 s).
2. "So" from l06 and "short" from l02 (about 0.5 s).
3. "In a small context, it also beat compaction at the limit." from l10 becomes "It also beat compaction at the limit." The panel's labels keep the small-context setting (about 1 s).

Reserve, if it is still over 80 s: cut l07 entirely (about 5.5 s). The `judge` scene then ends on l06's footprints growing from the fix, and the `ignores the summary` / `follow the summary` tags move into l06's freeze. This loses the paper's best detail, so use it only if needed.

Never cut "with its full context" (l09), "at the smallest budget" (l11), or l12.

## 6. Numbers budget

Four headline numbers. All are from SWE-bench Verified, the same base model (Qwen3-Coder-30B-A3B-Instruct, never named in the video), and the same scaffold. All are the authors' runs.

| On screen | Where in the paper | Absolute or relative | Measured or theoretical | Whose |
|---|---|---|---|---|
| 30.4% | Table 1 (p.6), Base row; sec 1 | Absolute pass rate on SWE-bench Verified, full runs, no cost cap. The base model keeps its full context: 256K window, no learned compaction, and "no trajectory reaches the forced-compaction threshold" (sec 1). | Measured, "averaged over three runs" (sec 3.1) | Authors' runs |
| 39.6% | Table 1, AutoCompact row; abstract (+9.2 absolute); sec 1 | Absolute, same metric and setting (256K) | Measured, average of three runs | Authors' runs of their SFT-then-RL model |
| 19.9 points | Sec 3.3, p.8 (R4), Figure 3(d) | Absolute difference in pass rate: the same trained checkpoint running compaction against skipping its compact calls ("no summary is generated, and execution continues with the existing history"), at the smallest budget ($0.10 per task). | Measured. It is a **best case**: the largest gap in a six-budget sweep (Figure 3(d) labels: +100, +62, +30, +11, +9, +9 tasks per 500). l11 says "at the smallest budget". | Authors' runs |
| 1.9 points | Sec 3.3, p.8 (R4) | Absolute difference, same comparison, at the largest budget ($4.00 per task) | Measured. The **smallest** gap in the sweep, said as "at the largest budget". | Authors' runs |

**Average or best case, and how the lines say so.**

- 30.4% and 39.6% are averages over three runs and 500 tasks. The subtitle says `average of three runs`.
- 19.9 and 1.9 are the two ends of a budget sweep, and both lines name their end.
- The paper gives no per-task table, so no line says "every task".
- "Higher at every budget" (l10 tag) rests on sec 3.3's text: "AutoCompact achieves a higher pass rate than Base across all evaluated inference budgets".

**Drawn but never printed.** These come from `_` keys and are listed in `facts.json` for the facts review:

| Drawing | Values | Source |
|---|---|---|
| Small-context chart in `results` (two lines over six budgets) | Endpoints 28.8 (Base) and 38.0 (AutoCompact); gap labels +55, +44, +44, +46, +46, +46 per 500 tasks | Figure 3(c) labels. 28.8 also appears in Table 1 (Fixed Compaction, 16K). The 38.0 is a figure label only, so it is never printed. |
| Two-line chart in `caveat` | Gaps of +100, +62, +30, +11, +9, +9 per 500 tasks; endpoint 39.6, and 37.7 for skipped | Figure 3(d) labels. Sec 3.3 gives 19.9 and 1.9. 37.7 = 39.6 − 1.9. |
| Gain bar in `caveat` | Base 30.4, skipped 37.7, AutoCompact 39.6 | Table 1, sec 3.3; 37.7 derived as above |

All charts start at 0 with no axis break, so the gaps are not exaggerated.

**Inference to flag for the facts review.** l12's "Most of the gain stays without the summaries" compares 37.7 (skipped, at $4.00) with Base's 30.4. Two things make it hold:

- 39.6 at $4.00 in Figure 3(d) equals the 256K AutoCompact value in Table 1 and Figure 3(b), so (d) is the 256K setting.
- Base is 30.4 at $4.00 in Figure 3(a).

The text never states (d)'s context window. If the reviewer rejects the inference, replace the sentence with "Compaction itself helps most on a tight budget." That sentence restates sec 1: "compaction is particularly beneficial under tight inference budgets". The gain bar then becomes the two-line chart alone.

**Cut, and why:**

| Cut | Where | Why |
|---|---|---|
| SWE-PolyBench Verified, 19.5 to 24.5 (+5.0) | Table 1, abstract | A second benchmark; it would take the budget past 4. It is in the caption instead. |
| +9.2 | Abstract | Implied by 30.4 and 39.6. Saying both would be a fifth number. |
| Fixed Compaction 28.8, CompactionRL 32.7, SelfCompact 31.7, SWE-Compressor 31.0 | Table 1 | A baseline table is a second video. The l10 panel carries the length-trigger comparison without numbers. |
| AutoCompact-SFT 32.2, and RL adding +7.4 | Table 1, sec 3.2 | Method internals. l08 shows RL without a number. |
| Proactive compaction rate: about 0%, 44.3%, 58.5% | Fig 4, sec 3.3 | l05 says "rarely" for the base model instead. The 44.3 and 58.5 are a second idea (how RL changes usage). |
| Summary omissions: 3.1% to 0.2%, 8.2% to 2.2% | Fig 4, sec 3.3 | Measured by "keyword-based screening, supplemented by random manual spot checks". Too soft for a headline. |
| 1,052 corrected runs; 24% / 53% / 23% split; 379 tasks | Sec 3.1 | Training detail. |
| $0.10 to $4.00 | Sec 1, 3.1 | Dollar amounts appear only inside the R4 crop, as `evidence_incidental`. Labels say `smallest` and `largest`. |
| 256K, 16K, 32K, 500 | Throughout | Keep them out of captions and labels. The words "full context" and "small context" carry them. |

## 7. The honest caveat

l12, at about 66.6 to 73.8 s, paced like the other lines:

> "One limit: the advantage remains only 1.9 points at the largest budget. Most of the gain stays without the summaries."

Sources: sec 3.3 (p.8, receipt R4), Table 1, and the inference flagged in section 6. It is drawn as the `caveat` scene with a chart and a split gain bar, not as a text card.

Why this caveat:

- **It is the claim a viewer would most likely take away wrongly.** The hook is about when to compact, and the payoff is 30 to 40 percent. Without l12, the video would imply that compaction timing alone bought 9 points. At full budget, running compaction accounts for about 2 of them. The rest stays in the trained weights even when the compact calls are skipped. That weight gain includes RL on coding tasks, and the paper has no baseline that gets the same RL without the `compact()` action.
- **The paper's own limits are smaller here.** RL used 32K-token sequences against a 256K evaluation window, and there was one base model and one scaffold. The `one base model · one scaffold` tag shows the second limit on screen; the voice does not spend time on it.
- **l11 already gives the positive side.** At the smallest budget, skipping compaction costs 19.9 points, so the caveat does not erase the result. It places it: compaction itself pays off most when the budget is tight.

## 8. Loop and ending

The last line, "Your agent will compact. The question is when.", lands on the hook's drawing in its frame-0 positions. On replay, the hook continues it: "Popular coding agents compact when their context nears the limit. Wrong moment?"

To make the cut invisible:

- In `close`, the hiker, magnifier, pack, gauge and press sit exactly where they are at 0.0 s. The gauge sits just under `limit`.
- `THE QUESTION IS WHEN.` sits in the hook title's box. When the end card fades it, `COMPACT AT THE LIMIT.` / `WRONG MOMENT?` takes that same box at frame 0.
- The press twitch at 74.8 s matches the twitch at 1.3 s.

The end card's only text is `hemanth_with_ai`: no paper name, arXiv id, authors or credit line.

## 9. Post text angle

**Title:** Your coding agent compacts at the limit. Is that the wrong moment?

**First line of the caption:** "AutoCompact trains a coding agent to choose when to compact its context, what to keep, and how to continue. On SWE-bench Verified, the same base model went from 30.4% to 39.6% (authors' runs, average of three)."

After that:

- One sentence of caveat: "Skipping its compact calls cost 19.9 points at the smallest budget but only 1.9 at the largest, so at full budget most of the gain stays even without the summaries."
- One line: "It also improved on SWE-PolyBench Verified, 19.5% to 24.5%."
- Paper title, arXiv 2610.02163 (v1), and "unofficial explainer".

## Producer notes

**`facts.json` claims, per line:**

| Line | Claim and source |
|---|---|
| l01 | p.9 Limitations (widely used harnesses compact when the context approaches the window limit); sec 1 (length-triggered methods) |
| l02 | Sec 2.1 ("Compaction replaces earlier interaction history with a model-generated working-state summary") |
| l03 | Abstract, R1; sec 1 ("compaction may then occur in the middle of an unresolved stage whose evidence is still needed") |
| l04 | Abstract, sec 1, Figure 1 caption (when to compact, what to keep, how to continue) |
| l05 | Sec 2.2, R2 |
| l06 | Sec 2.2 (the judge reviews each proposed action using only the current history; corrections are applied before execution; the policy continues from the corrected history) |
| l07 | Sec 2.2 (continuation correction: "re-running a search whose result is already recorded in the working-state summary"); Figure 2 ("redirecting a repeated search toward the edit planned in the summary") |
| l08 | Sec 2.2 (the judge is used only during data collection); sec 2.3 (binary outcome reward, a shared signal for coding actions, the compact decision, the summary and the continuation; no compaction-specific reward) |
| l09 | Table 1; sec 3.1 (same base model and scaffold; averaged over three runs) |
| l10 | Sec 3.3 and Figure 3(c) (shared 16K forced-compaction fallback; higher at all budgets); R3 |
| l11 | Sec 3.3, R4 (Summary-ignored variant: compact calls skipped, same parameters) |
| l12 | Sec 3.3, R4; Table 1; the inference in section 6 |
| l13 | Takeaway; adds no claim |

**Sources for on-screen words in the drawings:**

| On-screen words | Source |
|---|---|
| Flags `bug localized`, `edit file`, `run tests` | Figure 1 labels |
| Card rows `state`, `target file`, `next step` | Figure 2 ("state, target file, next step") |
| Ghost action `search repo`; tags `ignores the summary`, `follow the summary` | Figure 2 labels; sec 2.2 |
| `evidence still needed`, `stage` | Sec 1 |
| `judge removed` | Sec 2.2 ("the trained agent runs without the judge at inference time") |
| `forced compaction`, `compacts at the limit`, `same limit, plus its own choice` | Sec 3.3 (the 16K setting) |
| `same model, same scaffold` | Table 1 caption ("All methods share the same base model and scaffold") |
| `one base model · one scaffold` | Sec 3.1; sec 5 ("We study this co-design within a single scaffold") |

**Other rules:**

- No model name anywhere, spoken or on screen. That covers the base model and the judge (GPT-5.5-Codex, sec 3.1). Benchmark names appear only as on-screen titles.
- No product names (Codex, Claude Code) on screen or in the voice. The paper names them in its limitations, but it did not test them.
- Safe zones: the gauge strap and the test gate stay left of x 940 below y 1000 (platform buttons). Everything stays in y 160 to 1450, clear of the caption band.
- Run `node hf/bin/ste.mjs` before `voice`. Read the `words` output for "Auto Compact", "thirty nine point six" and "nineteen point nine points"; whisper may hear "compact" as "combat". If a line comes out wrong, try another seed for that line, as Dream-RSI's l08 needed.
- **Wiki.** The paper has no dossier or source record yet. I downloaded the PDF and extracted the text into `llm-wiki/raw/assets/2610.02163/`. The ingest steps (source record, dossier, the `agent-context-management` topic link, the log entry) belong to the producer run, before post text is written.
