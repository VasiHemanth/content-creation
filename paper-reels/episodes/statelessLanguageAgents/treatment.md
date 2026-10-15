# Treatment: Stateless Language Agents (arXiv 2610.07625 v1)

Paper: "Stateless Language Agents: Scaling Long-Horizon Automated Research", Qizheng Zhang, Changxiu Ji, Isaac Sun, Yuetai Li, Shubhangi Upasani, Sherry Ruan, Boyuan Ma, Fenglu Hong, Vamsidhar Kamanuru, Yoonho Lee, Yuzhen Mao, Genghan Zhang, Rulin Shao, Qiuyang Mang, Andy Dimnaku, Changran Hu, Radha Poovendran, Kunle Olukotun (Stanford, CMU, University of Washington, SambaNova Systems, UC Berkeley). arXiv 2610.07625v1, 6 Oct 2026, 32 pages.

**Version.** The arXiv abstract page (fetched 2026-10-14) lists v1 only (6 Oct 2026). This treatment uses v1.

**What I read**
- **Full text.** Pages 1 to 32 from `llm-wiki/raw/assets/2610.07625/paper-v1-text.txt`, extracted with pypdfium2 from `paper-v1.pdf`. Both files and `abs.html` were downloaded for this treatment. The main text (pp. 1 to 11) and Appendices B to D were read closely. Appendix A and the prompts in Appendix E were read, but not as closely.

**Renderer and size**
- Renderer: HyperFrames. Folder: `paper-reels/episodes/statelessLanguageAgents/`.
- Voice: `aiden` at 1.12, the same as the recent episodes.
- Size: 14 lines, about 206 spoken words (numbers and "S L A" said out loud), 10 scenes.
- Length: about 78 s at 3.1 spoken words a second plus 0.75 s of lead and tail per line. Agent Plasticity read at about 3.2 words a second, which gives about 75 s. Re-time every beat from `audio/words.json`.
- If the take runs over 79 s, cut in this order: the second sentence of l05, then "None improved the score." in l09 (the stamp still shows it).

**What the channel already covered, and what is new here**
- **Context management.** AutoCompact, Context Language Models, ContextEvo.
- **Meta-Reasoning (Thinking Before Thinking).** This is the closest earlier episode. A controller picks the next step and chooses what each worker sees. That controller keeps its own compact state.
- **New in this paper.**
  - No agent keeps state across invocations, the Advisor included. The harness holds everything.
  - The runs go to a billion tokens.
  - A ranking at a quarter of the budget reversed at the end.
  - The video gives the Advisor beat (l08 to l10) about 13 s, so it does not replay the Meta-Reasoning video.
- **Pictures already used:** trees, dream bubbles, desks, notebooks, two curves, chat screens, a railway signal box, a hiker's backpack, shelves, a rail with pins, jars of marbles. This one is a **construction site** drawn as a blueprint (which suits the channel's blueprint look): a tower under construction, a token meter, wheelbarrows, a site office with a plan board, work-order cards, an inspector's stamp.

**Requester's summary, checked against the paper**
- **"The harness owns durable research state and rebuilds a fresh role-specific context per invocation."** Correct (Abstract, p. 1; sec 3.1, p. 4 to 5). The research state is "candidate solutions and measured outcomes". It is not conversations.
- **"An Advisor assigns experiments to parallel Workers."** Correct (sec 3.2). The Advisor is itself stateless and starts a new session each epoch (sec 3.3).
- **"Software engineering, kernel optimization, algorithm design at budgets up to 1B tokens."** Correct (sec 4.1). Only the Anthropic kernel task runs to 1B. FrontierSWE runs to 700M, SOL-ExecBench to 500M and Structured-LWE to 200M.
- **">84% fewer tokens to reach the strongest kernel baseline's final score."** Correct, with one condition: it is the lower of two configurations (Table 1, p. 8):
  - Codex: 93.1%, mean curve of three runs, against SwarmResearch.
  - Claude Code: 84.4%, one run, against CORAL.
  - It measures the tokens to *match* the baseline's final result, not to beat it.
- **"Coordination costs <0.6% of tokens."** Correct as a share of tokens: 0.24% and 0.51% in the two analyzed runs (Table 5, p. 10). As a share of model cost it is 1.20% to 2.29%, because the Advisor reuses less cache. The video says "tokens", never "cost".
- **"Short horizons misjudge systems."** Correct (p. 3, sec 4.2). On all four FrontierSWE tasks SLA trails the strongest baseline at 25% of the budget and leads at 100%. These are single runs with Codex.
- **"Strongest on AutoResearch-style tasks with reliable evaluators."** The paper's own wording is narrower and is what the caveat uses: "All tasks have executable evaluators, so goals that are vague or slow to evaluate remain untested" (sec 5, p. 11).

**Two limits the script must respect (not in the summary)**
1. **Statelessness itself is never ablated.** The paper says: "Our ablations change what each agent sees, not whether it keeps its conversation across invocations" (sec 5). The ablations show that focused contexts and Advisor assignments help, and in every ablation the agents are already stateless. EvoX also starts a fresh coding agent for each generation (sec 4.1), and SLA still beats it. So the video never says or shows that forgetting the conversation is *why* SLA wins. It says what SLA does, then what the results were, and the caveat names this gap.
2. **Trace examples are not rates.** The duplicate-work trace (Appendix D.3, Figure 5a) "do[es] not measure how often these behaviors occur". The line says it happened once in one test ("once"), not that it always happens.

## 1. The one idea

In a billion-token research run, the harness, not any agent's conversation, holds the research state, and each agent gets a fresh context built for its role.

(One "and". The mechanism is the video. The results and the horizon reversal are the evidence that it is worth a look, not a second idea.)

## 2. Hook options

| # | Spoken line (STE, 12 words max) | On screen from 0.0 to 1.0 s |
|---|---|---|
| A | "Give research agents a billion tokens. Does the work still improve?" (11 words) | Frame 0 already shows big type `A BILLION TOKENS.` (white) and `DOES THE WORK STILL IMPROVE?` (amber) over a blueprint tower under construction. A token meter (a round gauge with no numerals, labelled `tokens`) sits top right, and its needle is already moving. By 1.0 s a crane hook lifts a beam and coins drop into the meter's hopper. |
| B | "These agents stopped work. The token meter did not." (9 words) | Big type `THEY STOPPED WORK. THE METER DID NOT.` over three robots sitting idle on a steel beam, while the token meter needle spins. |
| C | "No agent here keeps its conversation. The research still improves." (10 words) | Robots walk out of a site office with empty hands, and the tower rises behind them. |

**Pick A.**

- **It is the paper's central question in plain words.** The paper asks it in sec 1: "how can automated research sustain progress as its inference budget grows?" The user's tested rule is to open on the central question, not on an example. The NetHack anecdote hook was rejected on 2026-10-11, and the plain-question hook scored 18 of 18 with cold viewers.
- **It has stakes a stranger feels.** A billion tokens is a lot of money, and the question is whether it buys anything.
- **It sets up the loop.** The close tells the viewer how to judge such a run. A replay starts on the same question.
- **Why not B.** B is a single baseline trace (one CORAL run). It is a strong picture, and it opens the answer in l02 and l03. As a hook, it is the kind of example the user rejected, and it is about a baseline, not the paper's method.
- **Why not C.** C implies that dropping the conversation is what makes the research improve. The paper never tests that (see limit 1 above).

**Truth check for A.**
- It is a question, not a claim.
- "A billion tokens" is a real budget in the paper: "budgets of up to one billion tokens" (Abstract), the Anthropic kernel task, and the CORAL trace in l02 and l03.
- The paper's answer is "not by itself": "more inference does not by itself produce more progress" (Abstract). l02 says "Not always."

**First-frame rules.**
- The big type is at full opacity at 0.0 s. It may settle in scale from 1.12 to 1.0 over 0.0 to 0.25 s, with no entrance from opacity 0.
- The thumbnail hook uses the same words (`thumb_hook`: "A billion tokens. Does the work still improve?").
- "SLA" is first spoken at l06 (about 24 s). The paper's name appears only on the end card credit. Neither is ever the largest text in the first 2 s.

## 3. Visual metaphors (one per idea, one construction-site world)

All data marks (curves, bars, tower pairs) use the neutral palette: amber for SLA, cyan for baselines. There are no crowns, trophies, or red or green marks. The inspector's stamp is a `scored` mark, never pass or fail.

**Idea 1, the problem: a tower that stops while the meter runs.**
- **Picture.** A blueprint tower under construction. A token meter (round gauge, no numerals) is fed by coins dropping into a hopper. While the tower gains floors, the meter turns. Then the floors stop, the robots sit on a beam with their tools on hooks, and the coins keep dropping.
- **What a stranger reads.** "They keep paying, and nothing gets built."
- **Scenes.** Carried by `hook` and `stall` (l01 to l03). It returns in `close` (l14) with the tower still rising.
- **Limits.** The meter has no digits. The idle-beam picture appears only in `stall`, with the tag `one baseline run · GPU kernel task`, so it never reads as SLA's agents.

**Idea 2, where the research state lives: the wheelbarrow and the plan board.**
- **Picture, old way (l05).** Each robot pushes its own wheelbarrow, labelled `conversation`. Paper scrolls pile in at every step until it overflows and the robot slows.
- **Picture, SLA (l06, l07).** The robots arrive at a site office with empty hands. On the wall is a big plan board labelled `research state`. Its pins hold `candidate` sheets with `score` tags, and a `harness` plate sits on the frame. A slot in the office wall prints a fresh card for each robot as it steps up: a wide `Advisor` card and a narrow `Worker` card with different rows.
- **What a stranger reads.** "Nobody carries the pile around. The office keeps the plans and hands each person only what their job needs."
- **Scenes.** Carried by `why` (l05) and `office` (l06, l07).
- **Limits.**
  - The board holds candidates and scores (the paper's research state), never scrolls. Conversations are not stored anywhere.
  - The card rows use the paper's words:
    - Advisor card: `best code`, `evidence across directions`.
    - Worker card: `assignment`, `its candidate`, `local feedback`.
  - Nothing on screen says the empty hands are why SLA scores higher.

**Idea 3, who picks the next experiment: work-order cards.**
- **Picture.** The Advisor robot (hard hat, `Advisor` tag) reads one summary sheet from the plan board. It sends three work-order cards, each with a different icon (roof, wiring, pipes), to three Worker robots, and they walk to three different parts of the tower. In the counter-example the cards are missing, and three robots lay the same brick in the same spot. The inspector stamps all three with the same `scored` tag, and a `no gain` stamp lands.
- **Scenes.** Carried by `assign` (l08, l09).
- **Limits.** The counter-example carries the tag `one test without assignments`. The three identical bricks show the Figure 5a example only. There is no count and no rate.

**Idea 4, short horizons misjudge: a race of tower pairs.**
- **Picture.** Four pairs of towers (SLA amber, strongest baseline cyan), one pair per FrontierSWE task. A time slider along the bottom has a mark at `a quarter of the budget`. At that mark every amber tower is shorter. When the slider runs to `full budget`, every amber tower ends taller.
- **Scene.** Carried by `twist` (l12).
- **Limits.** These are data marks. Tower heights come from Table 2 as `_` keys (175M and 700M scores). No value is printed. Task names are small tags: `libexpat`, `Git→Zig`, `Dart→Haskell`, `Lua`. A tag reads `Codex · one run each`.

**Not metaphors.** The 0.6% sliver (`cost`) and the tokens-to-match chart (`result`) are data marks.

## 4. Receipts

Three passages, all text, spaced about 15 to 25 s apart. Each one:
- is read on camera at about 3.4x, using `follow: 0` with the start of the highlight left-aligned near x 90;
- holds about 2 s on one phrase, after which the scene's own picture returns;
- starts no earlier than 0.1 s into its scene and keeps its label outside the camera layer.

| # | Line | Page, section | Exact text in the paper | Highlighted (spoken words only) | `find` | `circle` | Hold (est.) |
|---|---|---|---|---|---|---|---|
| R1 | l03 | p. 2, sec 1 | "Afterward, agents repeatedly declare their solutions optimal, and 98% of the final 1,500 sessions make no tool calls while token consumption continues (Figure 2(b))." | "make no tool calls while token consumption continues" | `make no tool calls`, `while token consumption continues` | `continues` | about 10.5 to 12.8 s |
| R2 | l06 | p. 1, Abstract | "no agent carries its conversation across invocations; instead, the harness owns the research state (candidate solutions and measured outcomes)" | "no agent carries its conversation across invocations", then "the harness owns the research state" | `no agent carries its conversation`, `across invocations`, `the harness owns the research state` | `harness` | about 25.0 to 27.5 s, then a second short hold about 28.3 to 29.5 s |
| R3 | l12 | p. 3, sec 1 | "Across our experiments, short horizons can misjudge methods, components, and configurations." | "short horizons can misjudge methods" | `horizons can misjudge methods` (the extracted text breaks the line after "short") | `misjudge` | about 62.0 to 64.0 s |

**Notes per receipt.**
- **R1.** The narration says "Ninety eight percent of the final sessions" and drops "1,500", so the marker covers only the spoken fragments. It never sits on "98%" or "1,500". The crop will also show "231M" from the sentence before. `231M` and `1,500` go to `facts.json` `evidence_incidental`.
  - Before the receipt: the robots sit down on the beam and `98%` slams.
  - After it: the page drops away and the meter needle keeps turning while the tower stays still.
- **R2.** If one highlight is wider than the frame at 3.4x, read it in two holds, as above: "carries its conversation across invocations", then "harness owns the research state".
  - Between the holds: the wheelbarrow tips out of frame and the robot walks in empty-handed.
  - After them: the plan board bolts in. The crop may show "0.6%" and "84%" from later abstract lines. Both are headline numbers, already in `facts.json`.
- **R3.** The crop may show "175M", "700M", "100M", "337" and "4" from the following sentences. Put each in `evidence_incidental`.
  - Before the receipt: the tower pairs.
  - After it: the slider snaps back to the quarter mark, and a stopwatch with a `misjudge` tag pops over it.

## 5. Shot list

Main transition `whip`. Accents are `zoom` (into the site office) and `punch` (the kernel result). `cut` is used inside a topic, and `blur` into the caveat. Start times are estimates (line = 0.25 s lead + voice + 0.5 s tail); replace them from `words.json`.

Gate note: thin line drawings do not register as events (Agent Plasticity memory). Every beat below moves a filled shape (coins, cards, bars, bricks, stamps, the wheelbarrow fill) or is a camera move. Where a scene is only lines, add a soft pulse with a 0.5 s fade.

| Scene | Line | Start (s) | Spoken words | On screen / camera | Transition out |
|---|---|---|---|---|---|
| hook | l01 | 0.0 | "Give research agents a billion tokens. Does the work still improve?" | 0.0 s: big type already up over the blueprint tower, the meter needle moving. "billion": a stream of filled coins pours into the meter hopper and the needle jumps. "tokens": a `tokens` tag pops on the meter. "work": the crane lifts a beam and a new floor slab drops onto the tower. "improve": a dashed outline of the next floor draws and a question-mark plate swings on the crane hook. Slow push-in. | cut |
| stall | l02 | 4.3 | "Not always. In one baseline run, the last gain came early." | The camera pulls back and the tower's floor heights turn into a filled step curve (best score against tokens), the x axis ending at a `1B tokens` tag. "Not always": the curve goes flat and the fill stops. "baseline run": the tag `one baseline run · GPU kernel task` slides in. "last gain": a pin drops on the knee with a `last gain` tag. "early": a bracket stretches from the pin to the end of the axis. | cut |
| stall | l03 | 8.3 | "Ninety eight percent of the final sessions make no tool calls while token consumption continues." | Back on the tower. "Ninety eight": `98%` slams, and three robots sit down on the beam with their legs dangling and their wrenches swung onto hooks. "make no tool calls": receipt R1 rises, the camera dives, and the highlighter follows for about 2 s. Cut back on "continues": coins keep dropping into the hopper, the needle turns, the tower is still. | whip |
| why | l04 | 13.9 | "The paper blames two choices. Where does research state live? Who picks the next experiment?" | "two choices": two large plates drop in and stack. "live": the first plate fills in with a site-office door icon and `where research state lives`. "picks": the second fills in with a hard hat and `who picks the next experiment`. Camera moves from plate to plate. | cut |
| why | l05 | 19.5 | "In two baselines, agents keep long conversations. They grow with the run." | "two baselines": two robots enter pushing wheelbarrows labelled `conversation`. "long": paper scrolls drop in, filled stacks. "grow": the stacks rise past the rim, the wheels wobble, the robots slow. The camera pushes toward the site office door. | zoom |
| office | l06 | 23.8 | "In S L A, no agent carries its conversation across invocations. The harness owns the research state." | Through the door. "S L A": a small `SLA` plate pops above the door. "carries": receipt R2, first hold. Between holds, the wheelbarrow tips out of frame and the robot walks in empty-handed. "harness owns": R2 second hold, then the plan board bolts onto the wall (four bolts pop). `research state` header, `candidate` sheets and `score` tags pin in, one by one. `harness` plate on the frame. | cut |
| office | l07 | 30.0 | "Each invocation gets a fresh context for its role. The agent loses the conversation, not the work." | "invocation": a robot steps up to the slot in the office wall. "fresh context": a blank card slides out and its rows type in. "role": two cards side by side, the wide `Advisor` card (`best code`, `evidence across directions`) and the narrow `Worker` card (`assignment`, `its candidate`, `local feedback`). "loses the conversation": a single speech scroll over the robot crumples into confetti. "the work": the robot's `candidate` sheet on the plan board pulses. | cut |
| assign | l08 | 36.2 | "A stateless Advisor reads the evidence and gives each Worker a different experiment." | "Advisor": a robot in a hard hat steps in with an `Advisor` tag and `stateless` under it, and the camera follows. "reads": a summary sheet lifts off the board and the robot scans it, with a pulse along the rows. "gives": three work-order cards fly out. "different": each card flips to a different icon (roof, wiring, pipes), and three Worker robots walk to three parts of the tower. The camera pans up the tower. | cut |
| assign | l09 | 41.2 | "Without assignments, three Workers once built the same feature. None improved the score." | A rewind wipe (`glitch` sfx); the cards vanish and the tag `one test without assignments` lands. "three Workers": the three robots converge on one wall spot. "same feature": three identical filled bricks slam into the same place. "None": the inspector stamps all three with the same `scored` tag. "score": a `no gain` stamp lands. | whip |
| cost | l10 | 46.1 | "The Advisor used under zero point six percent of tokens." | The token meter returns, large. Below it a stacked bar fills: a long `Workers` bar and a hair-thin `Advisor` sliver (width from `_advisor`). "Advisor": a magnifier swings over the sliver. "zero point six": `<0.6%` slams and the tag `share of tokens · analyzed runs` pops. | punch |
| result | l11 | 50.1 | "On a kernel task, S L A matched the strongest baseline's final result with over eighty four percent fewer tokens." | Chart: tokens across, a dashed line `strongest baseline's final result`. "kernel task": tag `Anthropic kernel task`. "strongest baseline": the cyan baseline marker grows along the axis and reaches the dashed line at `_base: 888.3` (CORAL, Claude Code config) on an axis of `_axis: 1000`. "matched": the amber SLA curve reaches the same line at `_sla: 138.5`, and a flag pops. The bracket length comes from these keys. "eighty four": a filled bracket spans the gap and `84% fewer tokens` slams. Tags `Claude Code setup · one run` and `Codex setup, three runs: larger cut` pop. Camera pulls back to frame both markers. | whip |
| twist | l12 | 57.3 | "On four software tasks, S L A trailed early but led at the end. Short horizons can misjudge methods." | Four tower pairs with task tags, each pair scaled within its own task (Lua scores sit near 80 to 96, the others near 10 to 45). "four": the pairs rise in a stagger to the quarter mark on the slider, tag `a quarter of the budget`; every amber tower is shorter. "led": the slider runs to `full budget` and the amber towers pass the cyan ones. "Short horizons": receipt R3, about 2 s. Cut back: the slider snaps to the quarter mark and a stopwatch with a `misjudge` tag pops over it. | blur |
| caveat | l13 | 64.5 | "Every task had an automatic evaluator. Vague or slow goals remain untested. No test let S L A agents keep their conversations." | "evaluator": an inspector booth labelled `automatic evaluator` stamps a row of task cards one after another (filled stamps). A small tag `most setups: one run` sits under the row. "Vague": a fog card `vague or slow goals` drifts in beside the row, gets no stamp, and an `untested` tag lands on it. "No test": a robot with a `conversation` wheelbarrow stands at the office door inside a dashed outline. "conversations": a `not tested` stamp lands on the outline. | cut |
| close | l14 | 72.3 | "So judge research agents over the whole run, not only the start." | Back to the hook tower and the meter. "whole run": the slider sweeps its full length while floor slabs drop onto the tower in step with the coins. "start": a small marker at the slider's start dims, and the camera pulls out to the full tower. In the 1.6 s tail the end card rises: only `hemanth_with_ai`. | (end) |

**Pacing audit (re-read against the 2.5 s rule).**
- Every line schedules at least one event on a spoken word every 2.5 s or less. The longest lines are l11, l12 and l13 (7.2 to 7.9 s). Each has four or five events.
- The receipts hold the frame for about 2 s each, but every hold has a highlighter moving and a camera dive at its start. R2 is split into two holds with a picture event between them.
- **l04 has a known gap.** The plates are thin line art. Make the plate fills solid (filled panels), and move the camera between them on "live" and "picks".
- **l10 is a short line with a slow bar.** The bar fill starts at the line start, the magnifier comes on "Advisor" and the slam on "zero point six". There is no stretch of 3 s without a filled shape in motion.
- The first event is at 0.0 s (the needle and the type are already up). The end card holds only in the last 1.6 s of l14, and the gate excludes it.

## 6. Numbers budget (4)

| # | On screen | What it is | Section | Absolute or relative, measured or setting, whose |
|---|---|---|---|---|
| 1 | `1B` (`A BILLION TOKENS.`, `1B tokens`) | A token budget, not a result. It is the budget of the Anthropic kernel task, and of the CORAL trace in l02 and l03. That trace (Figure 2(b)) is a separate 1B CORAL run on a GPU kernel task, not one of the 500M SOL-ExecBench main results. The other main tasks ran to 200M to 700M. | Abstract; sec 4.1; Figure 2(b) caption, p. 3 | Setting, absolute. The authors' runs. |
| 2 | `98%` | Share of the final 1,500 sessions that made no tool calls, in one CORAL run on a GPU kernel task (SOL-ExecBench). | Sec 1, p. 2; Figure 2(b), p. 3 | Absolute share, measured, one baseline run run by the authors. The l02 tag says so. |
| 3 | `84%` (spoken "over eighty four percent") | Fewer cumulative tokens for SLA to first match the strongest baseline's full-budget result, on the Anthropic kernel task. Lower of two configs: Claude Code 84.4% (one run, vs CORAL, 138.5M vs 888.3M); Codex 93.1% (mean curve of three runs, vs SwarmResearch, 67.9M vs 986.3M). | Abstract; sec 4 findings, p. 6; Table 1, p. 8 | Relative, measured, the authors' runs, one task. It does not hold for every task: on SOL-ExecBench #1, EvoX reached the target sooner (Table 3). The line says "On a kernel task". |
| 4 | `<0.6%` | The Advisor's share of total tokens: 0.24% (kernel, 1B) and 0.51% (FrontierSWE libexpat, 700M). | Abstract; sec 4.4, Table 5, p. 10 | Absolute share, measured, two analyzed runs. Share of model cost is higher (1.20% to 2.29%). The video says "tokens", never "cost". |

**Small counts said as words, not printed as digits:** "three Workers" (l09), "four software tasks" (l12), "two baselines" and "two choices" (l04, l05), "a quarter of the budget" (the l12 tag). Keep them as words in `text` too, so `facts.json` sees no extra digits.

**Cut:**
- 14.5x and 93.1% (the l11 tag says only `larger cut`), 231M (crop only), 1,500 (crop only).
- 1112 vs 1275.7 cycles, 4.95 points, 224 cycles, 5 to 11 cycles.
- 6.6x to 7.3x, 337 cycles, 8.39% to 10.70% (Shepherd), $100, worker counts.

**Per-item checks done before writing.**
- **"Best final result on every task".** Holds in all of Tables 1 to 3 (kernel with both agents, the four FrontierSWE tasks, the three SOL-ExecBench tasks, Structured-LWE). The video does not say it, so it is not at risk. The caption may say it.
- **"Trailed early, led at the end".** Holds on all four FrontierSWE tasks. Deltas at 175M: −0.85, −3.90, −11.27, −2.75. At 700M: +6.75, +0.86, +6.68, +5.49 (Table 2).
- **"Over 84% fewer".** The lower of the two configurations on one task. The token savings on other tasks range from 9.6% (Git→Zig) to 95.9% (SOL #58), and SOL #1 is the exception (EvoX was sooner). So the line names "a kernel task" and gives no average.

## 7. The honest caveat

l13, at about 64 s, paced like every other line with its own picture (the inspector booth, the fog card, the dashed outline): "Every task had an automatic evaluator. Vague or slow goals remain untested. No test let S L A agents keep their conversations."

True to the paper (sec 5, Limitations, p. 11):
- "All tasks have executable evaluators, so goals that are vague or slow to evaluate remain untested."
- "Our ablations change what each agent sees, not whether it keeps its conversation across invocations."
- "Because long-horizon runs are costly, most configurations use a single run." This is the on-screen tag `most setups: one run`.

## 8. Loop and ending

- **Last line:** "So judge research agents over the whole run, not only the start."
- **On replay:** the first line asks the question that tells the viewer why: "Give research agents a billion tokens. Does the work still improve?" The close also shows the same tower and meter as the hook. So the end card cuts to a first frame the viewer has just seen.
- **"not only".** The line says "not only the start", not "not the start". The paper reports results at several budgets and asks others to do the same (p. 3). It does not say early results are worthless.
- **End card:** only `hemanth_with_ai` and a small credit line.

## 9. Post text angle

**Title:** A billion tokens. Does the work still improve?

**Caption first line:** "A new paper (Stanford, CMU, UW, SambaNova, Berkeley) keeps the research state in the harness, not in agent conversations. On one kernel task it matched the strongest baseline's result with over 84% fewer tokens. (Unofficial explainer.)"

Keep out of the caption: "forgetting makes agents better", "84% cheaper" (it is tokens to a target, not cost) and "beats everything" without "in the authors' runs".

---

## STE notes for the producer

**Terms** for `storyboard.json` `ste.terms` (the paper's word, then the synonyms to refuse):

| Term | Avoid |
|---|---|
| `research state` | memory, notes, history, record, log, knowledge |
| `harness` | framework, orchestrator, controller, scaffold, system |
| `conversation` | chat, transcript, session history, memory |
| `invocation` | turn |
| `context` | prompt, brief, window, input |
| `Advisor` | planner, manager, coordinator, foreman, boss |
| `Workers` | crews, sub-agents, subagents, helpers |
| `experiment` | trial, attempt, idea, job |
| `baseline` | rival, competitor, earlier system |
| `evaluator` | scorer, grader, checker |
| `tokens` | compute, inference, spend |

Notes on the terms:
- "session" is not refused. It appears only in l03, where it quotes the paper about the CORAL baseline. It is a different concept from an SLA invocation.
- "foreman" and "crew" are pictures only. No spoken line uses them.
- `call` is not refused for `invocation` (l03 quotes "make no tool calls"), and `lead` is not refused for `Advisor` (l12 says "led"). If R3 is ever swapped for the abstract's "misjudge research systems", drop `system` from the `harness` list first.

**Names.** `ste.names`: `SLA`. No `-ing` names are needed, and the script has no `-ing` words.

**Allow.** `ste.allow`: none expected.

**Lines to check for soft findings.**
- l03 ("token consumption", a possible noun cluster). It quotes the paper, and R1 shows the same words.
- l11 (20 spoken words with the spelled-out number; 17 in `text`).

**Spoken numbers** are said as a person says them: "a billion", "ninety eight percent", "zero point six percent", "over eighty four percent". `say` spells "S L A". No model name is spoken anywhere. Model and agent names (Claude Code, Codex) appear only as small on-screen tags in l11.
