# Treatment: Context Language Models (arXiv 2609.37725), redo

Style: `paper` (cream paper, ink strokes, marker highlights, boxy mascot robot). Target runtime about 58 s (55.9 s voiced plus a 2.4 s end card), timed at the measured voice rate of the previous cut.

What went wrong last time: the old cut opened on a topic label ("What if the model edited that context itself?"), then ran ten text cards with ten numbers, each line 7 to 13 s long. Nothing on screen showed the problem, so the viewer had no reason to care about the fix. This cut opens on the pain as a drawn scene, pays off the claim by second 8, keeps four numbers, and puts a visual event at least every 2.5 s.

## 1. The one idea

Instead of a harness trimming an agent's context by a fixed rule, let the model edit its own context like a file; with no training, that beat the best hand-built harness in the authors' research and coding tests.

## 2. Hook options

| # | Spoken line (12 words max) | On screen in the first second |
|---|---|---|
| A | "Your A I agent forgets. A fixed rule decides what gets cut." | Robot at a desk behind a tall paper stack. A dashed line labeled `FIXED RULE: CUT HERE` slaps across the stack; scissors are already moving toward it. |
| B | "Hand the model the eraser, and it beats the hand-built harness." | Robot snatches an eraser out of a big gloved hand labeled `harness`. |
| C | "Why does your agent lose the one note it needed?" | One page with a marker star sits on top of the stack; scissors close in on it. |

**Pick: A.** It names a pain every agent builder has felt (the agent drops something important after compaction) and shows the cause in the same second: a rule, not the model, decides what goes. B is the payoff and works better as the second line, once the viewer knows what the eraser is for. C is a question the paper does not answer directly (it never measures which note gets lost), so it risks implying a result. A is true to the paper: section 2 describes harnesses that "compact accumulated histories according to a fixed harness policy, such as at a predefined length threshold", and section 3 shows summary-based compaction can "lose or hallucinate information".

The surprise (no training, beat the harness) lands at 7.9 s in line 3, so the hook is a pain-then-twist pair inside the first 10 s.

## 3. Visual metaphor: the desk, the scissors and the eraser

The robot's context is a stack of pages on its desk. In the usual setup a gloved hand labeled `harness` cuts the stack at a fixed line with scissors, whatever is on the pages. In this paper the robot gets a pencil and an eraser and edits its own pages: crosses out stale ones, writes a short note, keeps the starred page.

The metaphor adds no numbers and no results. It must not show the robot "winning" (no trophy, crown, or green check) and must not show the robot scoring anything.

Scenes that carry it (`episodes/contextLanguageModels/scenes.mjs`):

- `snip` (line 1): the stack, the dashed rule line, the scissors, a starred page falling into a bin. Text from `d`: `rule: "FIXED RULE: CUT HERE"`, `hand: "harness"`.
- `eraser` (line 2): the gloved hand pulls back with the scissors; the robot picks up a pencil and eraser; one stale page gets crossed out, the starred page stays. Text from `d`: `hand: "harness"`.
- `file` (line 5): the stack folds into one page with a dog-eared corner labeled `context file`; a terminal strip types `$ bash`; two lines get struck through and one new line is written; an arrow loops from the page back into the robot's head labeled `next turn`. Text from `d`.
- `habits` (line 6): three sticky notes slap onto the desk. Text from `d`: `notes: ["notes section", "tracker for helper agents", "reusable cleanup function"]`. These are the paper's own qualitative findings (section 4.1, Figure 3a, 3b, 3d), not decoration.
- `inject` (line 10): three pages in a row labeled `turn` (no turn numbers); a scribbled sticky note labeled `prompt injection` gets copied from page to page. Text from `d`.
- `loop` (line 11): back to the line 1 desk, but the scissors lie on the desk and the robot holds the eraser. Text from `d`: `rule: "FIXED RULE: CUT HERE"` shown faded.

## 4. Shot list

Timing basis: the previous cut's voice files (`audio/l1.wav` to `l10.wav`) run 220 words in 79.6 s, about 2.75 words a second. Each line below is timed at that rate plus 0.3 s padding. Scene beats are given as a fraction `at` of the line duration so they survive the producer's re-timing to the real voice, the same way the block `at` fields do.

Size column: **B** is a big event (a large element popping or sliding in, a robot entrance or action, a scene change, a count-up of large digits); the engagement gate measures grey-level change outside the caption band, so small marker strokes do not count on their own. Every gap between B events is 2.1 s or less except the last one into the end card (2.6 s, bridged by the dip).

| Beat | Start (s) | Line | at | Spoken words (`say`) | What appears or moves | Size | Block / scene | Transition out |
|---|---|---|---|---|---|---|---|---|
| 1 | 0.0 | L1 (4.7 s) | 0 | "Your A I agent forgets. A fixed rule decides what gets cut." | Desk, robot, tall page stack on screen at frame 0; pages keep landing on top every 0.4 s. | B | scene `snip` | same line |
| 2 | 0.4 | L1 | 0.08 | | Dashed line `FIXED RULE: CUT HERE` slaps across the stack (sfx thud). | B | scene `snip` | same line |
| 3 | 1.6 | L1 | 0.35 | | Gloved `harness` hand with scissors snips along the line; top pages, one with a yellow marker star, tumble off (sfx whoosh). | B | scene `snip` | same line |
| 4 | 3.1 | L1 | 0.65 | | Starred page drops into a bin; robot turns its whole body toward the bin, a large "?" pops over its head. | B | scene `snip` | punch |
| 5 | 4.7 | L2 (3.2 s) | 0 | "So researchers handed the model the eraser instead." | Gloved hand slides out of frame with the scissors. | B | scene `eraser` | same line |
| 6 | 6.1 | L2 | 0.45 | | Robot grabs a pencil and a large eraser (popIn), scrubs one page; starred page stays on top, marker circle around it. | B | scene `eraser` | punch |
| 7 | 7.9 | L3 (5.0 s) | 0 | "No training. On research and coding tests, it beat the best hand-built harness." | `No training.` pops in, large. | B | `hook` {lines: ["No training.", "Beat the best", "hand-built harness."], sub: "research + coding tests, authors' own results"} | same line |
| 8 | 9.4 | L3 | 0.3 | | Lines 2 and 3 pop in, marker underline under "hand-built". | B | `hook` | same line |
| 9 | 11.2 | L3 | 0.65 | | Robot slides in at lower left holding the eraser; `sub` fades in with it. | B | `hook` (style draws the robot as decoration) | whip |
| 10 | 12.9 | L4 (5.0 s) | 0.05 | "Normally the harness compacts at a set length, the same way every task." | Flow title `the usual setup`; step 1 `context grows`. | B | `flow` | same line |
| 11 | 14.4 | L4 | 0.3 | | Step 2 `hits a set length`. | B | `flow` | same line |
| 12 | 15.7 | L4 | 0.55 | | Step 3 `harness summarizes or drops old turns`. | B | `flow` | same line |
| 13 | 16.7 | L4 | 0.75 | | Flag on step 3 `same rule, every task` (flag card, not a thin label). | B | `flow` | whip |
| 14 | 17.9 | L5 (5.8 s) | 0 | "Here the context is a file. The model edits it with Bash, live next turn." | Page stack folds into one large dog-eared page `context file`. | B | scene `file` | same line |
| 15 | 19.6 | L5 | 0.3 | | Terminal strip slides up under the page and types `$ bash`. | B | scene `file` | same line |
| 16 | 21.1 | L5 | 0.55 | | Two stale blocks on the page get grey hatch and thick strike-throughs; a new pencil line writes in. | B | scene `file` | same line |
| 17 | 22.4 | L5 | 0.78 | | Large arrow loops from the page into the robot's head, label `next turn`; robot nods. | B | scene `file` | cut |
| 18 | 23.7 | L6 (6.1 s) | 0 | "It even invented habits: a notes section, a tracker for helper agents, reusable cleanup code." | Robot at desk, pencil tapping. | B (scene change) | scene `habits` | same line |
| 19 | 24.9 | L6 | 0.2 | | Sticky 1 `notes section` slaps down (sfx pop). | B | scene `habits` | same line |
| 20 | 26.4 | L6 | 0.45 | | Sticky 2 `tracker for helper agents` (pop). | B | scene `habits` | same line |
| 21 | 28.0 | L6 | 0.7 | | Sticky 3 `reusable cleanup function` (pop). | B | scene `habits` | whip |
| 22 | 29.8 | L7 (6.0 s) | 0 | "On a deep research test, with no training, it scored fifty nine point four percent." | Card and label `BrowseComp-Plus: deep research, zero-shot` write on. | B | `bigstat` {items: [{value: "59.4%", label: "BrowseComp-Plus, deep research, zero-shot", at: 0.15}]} | same line |
| 23 | 30.7 | L7 | 0.15 | | `59.4%` counts up from 0 in large digits until about 33.0 s. | B (continuous) | `bigstat` | same line |
| 24 | 33.7 | L7 | 0.65 | | Robot slides in at left and points at the number; marker swipe under it. | B | `bigstat` (robot as decoration) | punch |
| 25 | 35.8 | L8 (5.0 s) | 0.1 | "That's eleven point four percent higher, in relative terms, than the best baseline." | `+11.4%` pops in, large. | B | `bigstat` {items: [{value: "+11.4%", label: "higher than the best baseline", at: 0.1}], foot: "relative gain. best baseline: summarizing harness", footAt: 0.65} | same line |
| 26 | 37.8 | L8 | 0.4 | | Large stamped box `RELATIVE` lands beside the number (sfx thud). Text from `d`. | B | `bigstat` (stamp drawn by the style or a `sfx`-synced overlay) | same line |
| 27 | 39.1 | L8 | 0.65 | | Foot slides up as a full-width strip: `relative gain. best baseline: summarizing harness`. | B | `bigstat` | cut |
| 28 | 40.8 | L9 (5.4 s) | 0 | "On a coding test, seventy three point seven against sixty seven for that harness." | Titles `edits own context` and `summarizing harness`, row label `TBLite (coding)`. | B | `versus` {aTitle: "edits own context", bTitle: "summarizing harness", rows: [{label: "TBLite (coding)", a: "73.7%", b: "67.0%", aW: 0.737, bW: 0.67}]} | same line |
| 29 | 41.9 | L9 | 0.2 | | Bar A grows, `73.7%` pops at its end. | B | `versus` | same line |
| 30 | 43.5 | L9 | 0.5 | | Bar B grows, `67.0%` pops. Both bars in the same ink; no winner mark. | B | `versus` | same line |
| 31 | 45.0 | L9 | 0.78 | | Robot steps in below the bars and looks from one to the other (no gesture of approval). | B | `versus` (robot as decoration) | punch |
| 32 | 46.2 | L10 (5.4 s) | 0 | "One catch: a context the model can rewrite can carry a prompt injection forward." | Three large pages labeled `turn` slide in left to right. | B | scene `inject` | same line |
| 33 | 47.6 | L10 | 0.25 | | Scribbled sticky `prompt injection` slaps onto page 1 (sfx tick). | B | scene `inject` | same line |
| 34 | 48.9 | L10 | 0.5 | | Sticky copies onto page 2 (tick). | B | scene `inject` | same line |
| 35 | 50.1 | L10 | 0.72 | | Sticky copies onto page 3 (tick). | B | scene `inject` | whip |
| 36 | 51.6 | L11 (4.3 s) | 0 | "So next time your agent forgets, ask who's holding the scissors." | Back at the line 1 desk; scissors lie on the desk, faded `FIXED RULE: CUT HERE` line. | B (scene change) | scene `loop` | same line |
| 37 | 53.3 | L11 | 0.4 | | Robot lifts the eraser and turns to camera; marker circle drawn around the scissors. | B | scene `loop` | cut (dip into end card) |
| 38 | 55.9 | L12 (2.4 s) | 0 | (no voice) | `hemanth_with_ai` writes on; robot waves (sfx chime). | B | end card | end |

Pacing check: the first event is at frame 0 and the rule line hits at 0.4 s. Largest gap between B events inside the voiced video is 2.1 s (beats 24 to 25), apart from 53.3 to 55.9 s, which the dip into the end card bridges. 38 events in 58.3 s. Inside scenes, keep idle motion (page flutter, pencil tap, robot blink every 1.5 s) so no stretch is still if the voice runs long.

Spoken words: 143 in total. Longest lines are L5, L6, L7 (15 words each), each with four scheduled B events.

## 5. Numbers budget (4 on screen)

| Number | Where in the paper | Absolute or relative | Measured or theoretical | Whose |
|---|---|---|---|---|
| 59.4% | Sec 5.1.1 (BrowseComp-Plus, 32K context, zero-shot, Figure 5a) | Absolute accuracy | Measured task accuracy | Authors' own runs |
| 11.4% | Sec 5.1.1, abstract ("exceeding the strongest baseline, Codex-style summarization, by 11.4% relative") | Relative gain; must be said "in relative terms" and labeled `relative` on screen | Measured | Authors' own runs |
| 73.7% | Sec 5.1.1 (TBLite) | Absolute score | Measured | Authors' own runs |
| 67.0% | Sec 5.1.1 (TBLite, Codex-style summarization baseline) | Absolute score | Measured | Authors' re-implementation of the baseline in a shared Mini-SWE-Agent harness |

Why these four: together they prove the one idea (no training, beats the best fixed harness) on two different kinds of task, and the TBLite pair gives the viewer a direct side-by-side that the single BrowseComp number cannot (the paper does not state the baseline's absolute BrowseComp score, so do not compute or show one).

Cut, and why:

- **28.8% to 42.5% (RL, Table 2).** It is a second idea (training), and the honest framing is weaker than it looks: after RL the model matches the trained summary harness (42.5 vs 42.1), it does not clearly beat it, and before RL it was six points behind. Showing it would dilute "no training" and invite a misleading read.
- **35% less server compute (Suffix Cache Reuse, sec 5.3).** A third idea (serving and caching) that needs a prefix-cache explanation to mean anything, and it is computed from prefix-reuse FLOPs, so it would also need the theoretical-count caveat.
- **21.5% fewer FLOPs, 59% fewer FLOPs, 65% greater speedup, 44.6 vs 42.3, 35.9 points, 47.6%.** All theoretical FLOP counts or extra benchmarks. Not spoken, not shown. Because no FLOP number appears, the video makes no compute claim at all, which keeps the "FLOPs are theoretical" caveat out of the way rather than squeezing it into the caveat beat.

Also not shown: `32K`, `27B`, model names, the arXiv id inside the video body. The paper title appears only in the post text and description.

## 6. The honest caveat

Line 10, 5.4 s, same pace as the rest: "One catch: a context the model can rewrite can carry a prompt injection forward." "Authors' own results" is already on screen in line 3, so it is not repeated in the voice. Source: sec 6, "Editable context can become another channel through which prompt injections or self-generated instructions persist across turns." Drawn as the `inject` scene, not a text card.

## 7. Loop and ending

L11 ends on "ask who's holding the scissors" over the line 1 desk. On replay, L1 opens on that same desk with "Your A I agent forgets. A fixed rule decides what gets cut," so the question answers itself and the scissors are back in the harness's hand. Keep the desk, stack and robot in identical positions in `loop` and `snip` so the cut back to frame 0 is invisible apart from the scissors.

End card (L12, 2.4 s, no voice): only `hemanth_with_ai` and the waving robot. No paper name, id or authors on it. If the stock `endcard` block cannot hide name, id and authors, the producer draws it as a scene `end` with `d.handle`.

## 8. Post text angle

Title: **Let the agent hold the eraser**

First line of caption: "Most agents lose context to a fixed compaction rule. This paper lets the model edit its own context like a file, and with no training it beat a summarizing harness on research and coding tests (authors' own results)."

Then: paper name "Context Language Models", arXiv 2609.37725, and the prompt-injection caveat in one sentence.

## Producer notes

- Every on-screen digit must already be in `facts.json`: 59.4, 11.4, 73.7, 67.0 are all there. No new numbers.
- Line 3 says "research and coding tests". That covers BrowseComp-Plus and TBLite only. Do not widen it to "every test": on TerminalBench 2.1 the method only matched the baseline.
- Spoken text never names a model or a benchmark. Benchmark names appear only as on-screen labels.
- No green or red on the bars, no crown or check on the robot. The `+` sign on `11.4%` is fine; the word `relative` must sit next to it.
