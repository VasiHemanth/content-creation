# Treatment: Harness^2 (arXiv 2610.14224 v1)

Paper: "Harness^2: Recursive Agent Harnessing for an Open World", Ruiyao Xu, Yanfei Chen, Zhongying CuiZhu, Bhavana Dalvi Mishra, Yifei Ming, Han Yu, Rujun Han, Chen-Yu Lee, Tomas Pfister (Northwestern University, Google Cloud AI Research). arXiv 2610.14224v1, 9 Oct 2026, 37 pages. v1 is the only version on arXiv as of 2026-10-18: the submission history shows only [v1]. It is a preprint, not peer reviewed.

**What I read**
- **Main text.** Pages 1 to 13 in full.
- **Appendices.** B (Benchmarks, pp. 20–21), D (Implementation details and the 8 editable harness components, pp. 21–23), E.7 (Case studies, pp. 26–28), F (Limitations, p. 29), and H (Stage prompts, pp. 30–37).
- **Source files.**
  - `llm-wiki/raw/assets/2610.14224/paper-v1.pdf`, downloaded from `arxiv.org/pdf/2610.14224`, which served v1.
  - `abs.html`, the v1 abstract page.
  - `paper-v1-text.txt`, extracted with PDFKit, pages split by running header `Harness2 : Recursive Agent Harnessing for an Open World`.

**Voice and size** (round 3, after cold viewer rounds 1 and 2)
- **Voice.** `s2pro` preset (Fish Audio S2-Pro) at speed about 1.25, about 2.7 spoken words a second.
- **Size.** 16 lines, 207 spoken words (the `say` form, numbers spelled out), 6 scenes.
- **Length.** About 79 s. The estimate counts 2.7 words a second (76.6 s), plus 0.25 s lead and 0.5 s tail per line across 16 lines (12.0 s), with the 1.6 s end in place of the last tail. That lands squarely within the 60 to 80 s target (gate 45 to 90 s).
- **If the S2-Pro take runs long, cut in this order:**
  1. "with two loops of improvement" in l02.
  2. "out of 100" in l11 (l05 already established the 100-point scale).
  3. "on average" in l15.
- **Re-time.** Take every beat from `audio/words.json`.

**What the channel already covered** (from `data/content.sqlite`)
- **Agent memory and context.** ContextEvo (2609.34649), AutoCompact (2610.02163), MemScope (2610.21170), Context as a file (2609.37725).
- **Agent self-improvement.** Dream-RSI (2609.14858), Agent Plasticity (2610.08902), Stateless Language Agents (2610.07625).
- **What is new here.** Prior self-improving agents either optimize harnesses offline on fixed benchmarks, or continuously mutate their active execution files during deployment. Harness^2 introduces two coupled levels: contrastive probing at test time without ground-truth answers, and an improvement harness that preserves lessons across tasks while resetting the worker's execution files.

---

## 1. Format

**`paper`.** The source is an arXiv research paper proposing a novel two-level recursive self-improvement framework with baselines, benchmark experiments, and ablations. Target length 60 to 80 s, gate 45 to 90 s (`paper-reels/formats/paper.md`).

## 2. The one idea

When an AI agent modifies its own prompt files and scripts to solve a hard job, keeping those edits for the next job causes clutter and failures. Harness^2 tests edits on the fly through contrastive probes, but resets the AI agent's files after each job and saves only the lessons into an improvement harness.

## 3. The newcomer's questions (the spine)

| # | Question | Answered at |
|---|---|---|
| 1 | Why would learning new skills break an AI on future jobs? (raised) | l01 |
| 2 | Who fixes this problem? | l02 (Harness2, a new method) |
| 3 | What does this AI agent do, and what is its workload? | l03 (reconciles an event schedule, roster, and budget) |
| 4 | Where do the AI's instructions and tools live? | l04 (the instructions, files, and tools around the AI: its harness) |
| 5 | What went wrong on the base run? | l05 (first harness missed mismatched files, scored 43 out of 100) |
| 6 | If it scored 43, why can't the AI just test and grade itself? | l06 (in the real world, the AI has no answer key to check its own output) |
| 7 | How does Harness2 fix the job without an answer key? | l07 (creates two test versions: work habits vs job rules) |
| 8 | How does it test them? | l08 (runs both candidates on the same job: a probe) |
| 9 | How does it pick what to keep? | l09, l10 (Harness2 combines only edits that clearly helped; each decision tied to a concrete observation) |
| 10 | Did that fix the job? | l11 (re-run checked every output, score jumped to 78 out of 100) |
| 11 | Why not just keep those edits forever? | l12 (if an agent keeps every past edit, future jobs break) |
| 12 | What does Harness2 do across jobs instead? | l13 (resets the AI agent to clean files, saves only the lesson) |
| 13 | What is the architectural principle behind this split? | l14 (execution harness is the system being improved; improvement harness is the mechanism that improves it) |
| 14 | Does this work across general tasks? | l15 (across office tasks, gained eleven points on average) |
| 15 | What is the catch? | l16 (extra test probes take more computing time) |
| 16 | What is the takeaway? | l16 (resetting after each task keeps the AI from breaking on its next job; loops to l01) |

### Stranger read

**Terms in order:**
- "AI" (l01): plain.
- "skills" (l01): plain.
- Harness2 (l02): name of the paper's framework, explained by l07 and l13.
- agent (l03): introduced with plain description ("an AI agent reconciles a schedule, roster, and budget").
- harness (l04): named with active definition in plain words ("We call the instructions, files, and tools around the AI its harness").
- probe (l08): named with active definition ("It runs both candidates on the same job: we call this step a probe").
- observation (l10): plain, in Receipt 1.
- execution harness and improvement harness (l14): named in Receipt 2, grounded by l13's split between worker files and saved lessons.

No term is used before its declaration line.

**Fixes from cold viewer rounds 1 and 2:**
1. **l06 (Resolved perceived contradiction with scores).** Clarified that in the real world, the AI has no answer key to check its own output ("In the real world, the AI has no answer key to check its own output"). The viewer understands that 43 was the evaluation benchmark score, but the deployed agent has no ground truth to verify itself.
2. **l09 (Unknown "composer" eliminated).** Replaced "A composer compares..." with "Harness2 compares both runs, and combines only the edits that clearly helped." Avoids introducing an unnecessary actor term.
3. **l13 (Unknown "worker" replaced).** Replaced "resets the worker" with "resets the AI agent to clean files, and saves only the lesson." Directly references the declared protagonist `agent`.
4. **l16 (Natural tone and seamless loop).** Replaced developer advice with a natural conclusion: "One caveat: extra test probes take more computing time. But resetting after each task keeps the AI from breaking on its next job." Loops seamlessly back to l01 ("New skills can break an AI on its next job").
5. **l14 (Receipt 2 flow).** Set up Receipt 2 as the concluding architectural principle of the two-level split established in l12 and l13.

## 4. Jargon plan (`ste.jargon`)

| Term | Plain description first | Line | How it is named |
|---|---|---|---|
| Harness2 | "a new method … solves this with two loops of improvement" | l02 | "Harness2, a new method, solves this with two loops of improvement." |
| agent | "an AI … reconciles a schedule, roster, and budget" | l03 | "Take one complex job: an AI agent reconciles a schedule, roster, and budget." |
| harness | "the instructions, files, and tools around the AI" | l04 | "We call the instructions, files, and tools around the AI its harness." |
| probe | "runs both candidates on the same job" | l08 | "It runs both candidates on the same job: we call this step a probe." |
| improvement harness | "saves only the lesson … the mechanism that improves it" | l14 | "The execution harness is the system being improved, and the improvement harness is the mechanism that improves it." |

**Reuse.** Each term returns later in the script:
- Harness2: l07, l09, l13
- agent: l12, l13
- harness: l05, l07, l14
- probe: l16
- improvement harness: l14 (defined in Receipt 2)

**`ste.names`:** `Harness2`, `AI`.

**`ste.terms`:** the word we use, then the words we refuse.

| Term | Avoid |
|---|---|
| `harness` | scaffolding, wrapper, framework |
| `agent` | bot, assistant |
| `probe` | trial, test run, experiment |
| `improvement harness` | meta-harness, improver, learner |
| `lesson` | insight, reflection |
| `score` | grade, mark |

**Checker.** Passes `node paper-reels/hf/bin/ste.mjs`: 0 hard findings, 7 soft findings (false positive noun-cluster in l05, passive voice in direct quotes l10 and l14, length warning in l14 direct quote, "-ing" forms in l16).

## 5. Protagonist object

**One complex multi-file production job: reconciling an event schedule, roster, and budget into a final deliverables memo.**

**Source.** JobBench Case Study (Paper Section 4, p. 11, Figure 9, p. 12, and Appendix E.7, p. 27):
- **Task.** "Reconcile schedule, roster and budget files into interconnected production deliverables."
- **Failure modes on base run.** Figures never reconciled across files; outputs never reopened after writing. First harness score: 43.1 out of 100.
- **Interventions.**
  - Invariant scope: `guardrails.md` (mandatory inventory and cross-checking) and `scripts/verify_outputs.py` (reopens generated `.xlsx` and memo files).
  - Domain scope: `skills/SKILL.md` (mechanics for labor hour caps, conditional spend, and venue rules) and `tool_guidance.md` (stripping currency symbols and commas before math).
- **Outcome.** Composed harness successfully cross-references figures and verifies files, jumping score to 77.8 out of 100 (+34.7 points).

**On screen.**
- An in-tray holding three source files: `schedule.xlsx`, `roster.csv`, `budget.json`.
- A desk workspace with the agent's active harness: a folder showing component tabs (`guardrails.md`, `scripts/`, `SKILL.md`).
- A draft memo card `deliverables_memo.pdf`.
- An amber tag `missed mismatched files` and a coral score stamp `43 / 100`.
- During probing: the desk splits into two parallel test tracks (Cyan for work habits, Amber for job rules).
- During composition: a magnifying lens isolates the verified outputs and copies the winning files into a green successor folder.
- Re-run score stamp: green `78 / 100`.
- Across tasks: the AI agent's desk wipes clean, but a lesson card floats up into a violet filing cabinet labelled `improvement harness`.

## 6. Hook options

| # | Spoken line (12 words max) | On screen from 0.0 to 1.0 s |
|---|---|---|
| A | "New skills can break an AI on its next job." (10) | Frame 0 already shows big type `NEW SKILLS.` (white) / `BREAK THE NEXT JOB?` (amber). Beside it is an AI robot at a desk cluttered with chaotic, tangled file tabs. At 0.8 s, the desk shakes (thud) as a new job request arrives and gets rejected. |
| B | "Should an AI agent keep its new skills tomorrow?" (10) | Big type `KEEP NEW SKILLS?` / `OR RESET TOMORROW?` over an agent staring at a filing drawer bursting with sticky notes. |
| C | "An AI that modifies itself can ruin its future." (10) | Big type `SELF-IMPROVEMENT.` / `RUINING FUTURE TASKS?` over an AI editing its own prompt file with red crossed-out lines. |

**Pick A.**
- **Surprise and stakes in plain words.** Everyone assumes an AI gaining skills makes it strictly better. Explaining that task-specific skills clutter and break the next job hooks curiosity immediately.
- **Clear protagonist setup.** It establishes the core tension of open-world adaptation: test-time learning versus task-to-task interference.
- **The loop.** Line 16 ("But resetting after each task keeps the AI from breaking on its next job") loops directly back to Line 01.
- **First frame and thumbnail.**
  - Big type at full opacity at 0.0 s: `NEW SKILLS.` (white) / `BREAK THE NEXT JOB?` (amber).
  - `thumb_hook`: "New skills can break your AI's next job."
  - Harness2 is introduced at l02 (about 3.7 s in) and never dominates the first 2 s.

## 7. Picture

**Visual presentation.** Blueprint / workshop layout.
Rather than abstract geometric shapes, each object represents concrete agent components:

| Object on screen | Real term | Look |
|---|---|---|
| Small AI robot at a desk | agent / executor | white line-art robot with tool icons |
| Desk folder with file tabs (`guardrails.md`, `SKILL.md`, `verify.py`) | execution harness | slate folder with distinct colored component tabs |
| Three document icons (`schedule`, `roster`, `budget`) | task input files | white document cards with table grid marks |
| Output card `memo.pdf` | deliverable / trajectory | white document card with coral stamp `43 / 100` then green stamp `78 / 100` |
| Split tracks: Cyan track (work habits) and Amber track (job rules) | candidate test versions (INV and DOM) | parallel running lanes with matched task files |
| Center evaluation lens | composer selection | violet magnifying lens selecting supported edits |
| Overhead violet cabinet | improvement harness / library | violet multi-drawer library cabinet storing `EXPERIENCE.md` cards |

**Colours by phase.**
- **Baseline failure (l05).** Coral stamp `43 / 100` and red alert highlight.
- **Probing candidates (l07–l08).** Cyan (work habits) and Amber (job rules).
- **Composition & Re-run (l09–l11).** Green checkmarks and green stamp `78 / 100`.
- **Improvement harness (l13–l14).** Violet cabinet and glowing experience cards.
- **Benchmarks (l15).** Neutral clean bars with amber highlight on the +11.5 surge.

## 8. Receipts

**Checks.** Both passages are confirmed in `paper-v1-text.txt` and verified in `paper-v1.pdf`. Each highlight span sits on exactly one line of the PDF.

**How they play.** The PDF crop rises in, the camera dives to reading size, the highlighter follows the voice at about 3.4x for about 2 s, then cuts back to the scene's own animation.

| # | Line | Page, section | Exact text in the paper | Highlight (`find`) | `circle` |
|---|---|---|---|---|---|
| R1 | l10 | p. 5, sec 2.2.1 ("Compose") | "Each decision is tied to a concrete observation rather than a presumed score gain." | `concrete observation rather than a presumed score` (p. 5, line 45) | `concrete observation` |
| R2 | l14 | p. 4, sec 2.1 ("Definition: Recursive Agent Harnessing") | "the execution harness is the system being improved, and the improvement harness is the mechanism that improves it." | `the improvement harness is the mechanism that improves it` (p. 4, line 21) | `improves` |

**R1.**
- **Voice and marker.** The voice reads the sentence word for word: "Each decision is tied to a concrete observation rather than a presumed score gain." The camera highlights `concrete observation rather than a presumed score` and circles `concrete observation`.
- **Significance.** Proves that Harness2 does not guess scores or assume correctness; it only adopts edits that produced concrete behavioral differences in the probe.

**R2.**
- **Voice and marker.** The voice reads: "The execution harness is the system being improved, and the improvement harness is the mechanism that improves it." The camera highlights `the improvement harness is the mechanism that improves it` on the single line of Page 4, circling `improves`.
- **Significance.** This is the core architectural insight of the entire paper: separating the execution layer from the learning layer.

## 9. Shot list

**Transitions.** Main transition `whip` (topic shifts). Accents: `zoom` into the desk folder, `punch` on the score jump, `blur` into the caveat. `cut` inside a topic.

| Scene | Line | Start (s) | Spoken words | On screen / camera | Delivery | Out |
|---|---|---|---|---|---|---|
| hook | l01 | 0.0 | "New skills can break an AI on its next job." | 0.0 s: Big bold type `NEW SKILLS.` / `BREAK THE NEXT JOB?` at full opacity. An AI agent robot sits at a desk cluttered with chaotic, tangled file tabs. "break": a red warning icon flashes over the desk (glitch effect). "next job": an envelope drops onto the desk and gets bounced off (thud). | intrigued, provocative; stress BREAK | cut |
| hook | l02 | 3.7 | "Harness2, a new method, solves this with two loops of improvement." | "Harness2": kinetic type `Harness^2` drops below the desk (type sound). "two loops": two glowing orbital rings (cyan inner loop, violet outer loop) draw around the robot (whoosh). "improvement": the clutter vanishes into the two structured rings. | clear, confident; stress TWO | whip |
| task | l03 | 8.2 | "Take one complex job: an AI agent reconciles a schedule, roster, and budget." | "complex job": three document cards (`schedule.xlsx`, `roster.csv`, `budget.json`) fan out on the desk in front of the robot. "reconciles": dotted arrows draw between the three documents, showing interconnected numbers. | grounded setup; stress RECONCILES | cut |
| task | l04 | 13.5 | "We call the instructions, files, and tools around the AI its harness." | Camera pans to a slate folder beside the robot. "instructions": a tab labelled `instructions` lifts. "tools": a tab labelled `tools/` pops up (pop). "harness": title `execution harness` stamps onto the folder tab (stamp). | explanatory, steady; stress HARNESS | zoom |
| fail | l05 | 18.5 | "On this job, its first harness missed mismatched files, and scored 43 out of 100." | The robot writes a memo card. "missed": red question marks appear over contradictory figures in `budget.json` and `schedule.xlsx`. "scored 43": the memo slides into the out-tray and a coral stamp `43 / 100` slams onto it (thud). Tag: `JobBench: 43.1 / 100`. | problem revealed; stress FORTY-THREE | cut |
| fail | l06 | 24.2 | "In the real world, the AI has no answer key to check its own output." | Zoom in on the coral stamp. "real world": the workspace expands showing open-world incoming tasks. "no answer key": a blank grading sheet with a red question mark dissolves into mist (whoosh). "check": the robot shrugs, unable to grade its own memo. | analytical; stress ANSWER KEY | whip |
| probe | l07 | 29.0 | "Harness2 creates two test versions: one fixes work habits, and one adds job rules." | The desk splits into two parallel lanes. "work habits": left lane turns cyan with a new `verify_outputs.py` habit tab. "job rules": right lane turns amber with a new `reconciliation_rules` tab. | structured, clear; stress TWO | cut |
| probe | l08 | 34.5 | "It runs both candidates on the same job: we call this step a probe." | "runs both": identical copies of the three task files slide into both lanes. Both robots execute in parallel (tick, tick). "probe": the label `PROBE (matched conditions)` stamps across the top of both lanes (stamp). | engaging mechanism; stress PROBE | cut |
| compose | l09 | 40.0 | "Harness2 compares both runs, and combines only the edits that clearly helped." | A violet magnifying lens slides between the lanes. "compares both": highlights show where outputs differed. "combines": the lens pulls the verified habit from cyan and the job rule from amber into a fresh green successor folder. | precise; stress COMBINES | zoom |
| compose | l10 | 45.0 | "Each decision is tied to a concrete observation rather than a presumed score gain." | "decision": R1 PDF crop rises from page 5, camera dives to reading size. Highlighter runs across `concrete observation rather than a presumed score` while pen loops `concrete observation` (2.0 s). Camera pulls back to the green folder. | authoritative, grounded; stress CONCRETE | punch |
| payoff | l11 | 50.8 | "The re-run checked every output, and the score jumped to 78 out of 100." | The green folder runs the task. "checked every output": green checkmarks pop on all three input files and the memo. "jumped to 78": a vibrant green stamp `78 / 100` smashes down over the old `43` (impact sound). Tag: `JobBench: 43.1 -> 77.8 (+34.7)`. | exciting payoff; stress SEVENTY-EIGHT | whip |
| reset | l12 | 56.0 | "If an agent keeps every past edit, future jobs break." | A stack of new unrelated tasks arrives on the desk. "future jobs break": the green folder's specialized rules clash with the new task, flashing coral errors across the workspace (buzz). | cautious turn; stress BREAK | cut |
| reset | l13 | 59.8 | "Instead, Harness2 resets the AI agent to clean files, and saves only the lesson." | "resets the AI agent": a clean sweep wipes the desk back to base files (whoosh). "saves only the lesson": a glowing card `EXPERIENCE: verify outputs` floats up into an overhead violet cabinet. | relief, elegant solution; stress LESSON | zoom |
| reset | l14 | 65.2 | "The execution harness is the system being improved, and the improvement harness is the mechanism that improves it." | "execution harness": R2 PDF crop rises from page 4. Camera dives, highlighter runs `the improvement harness is the mechanism that improves it`, pen loops `improves` (2.0 s). Page drops, showing the desk (worker) and overhead cabinet (improver). | calm, profound definition; stress MECHANISM | whip |
| data | l15 | 71.5 | "Across office tasks, the method gained eleven points on average." | Chart scene: WorkBuddy-Bench macro-average. "gained eleven points": performance bar surges from 64.2 up to 75.7 (+11.5 points, tick count). A dotted line marks the base model baseline at 72.4. Tag: `WorkBuddy-Bench: +11.5 points (Table 1)`. | impressive proof; stress ELEVEN | blur |
| close | l16 | 76.0 | "One caveat: extra test probes take more computing time. But resetting after each task keeps the AI from breaking on its next job." | Softened lighting. "caveat": a `CAVEAT` tag stamps with a computing clock icon `+time` (tick). "resetting": the robot's desk resets to clean paper. "keeps the AI from breaking": the robot happily starts a new task without errors. At 80.5 s, the end card rises: only `hemanth_with_ai`. | objective caveat (stress TIME), then warm, firm takeaway (stress NEXT JOB) | (end) |

**Pacing audit (3 s windows).**
- 0.0–3.0 s: Big type (0.0 s), warning flash (1.5 s), envelope bounce (2.8 s) -> 3 events.
- 3.7–6.5 s: Kinetic type (3.7 s), orbital rings draw (4.8 s), clutter cleans (6.0 s) -> 3 events.
- 8.2–11.5 s: Three cards fan out (8.2 s), dotted arrows draw (10.0 s), numbers link (11.5 s) -> 3 events.
- 13.5–16.5 s: Instructions tab lifts (13.5 s), tools tab pops (14.5 s), stamp lands (15.8 s) -> 3 events.
- 18.5–21.5 s: Question marks appear (18.5 s), memo slides (19.8 s), coral 43/100 stamps (20.5 s) -> 3 events.
- 24.2–27.0 s: Workspace expands (24.2 s), sheet dissolves (25.5 s), robot shrugs (26.8 s) -> 3 events.
- 29.0–32.0 s: Desk splits (29.0 s), cyan lane lights up (30.2 s), amber lane lights up (31.5 s) -> 3 events.
- 34.5–37.5 s: Cards slide into lanes (34.5 s), parallel execution ticks (35.8 s), PROBE stamp lands (37.0 s) -> 3 events.
- 40.0–43.0 s: Lens enters (40.0 s), diffs highlight (41.2 s), files pulled into green folder (42.5 s) -> 3 events.
- 45.0–48.0 s: R1 rises and camera dives (45.0 s), highlighter runs (45.8 s), pen loops (47.0 s) -> 3 events.
- 50.8–53.5 s: Green checkmarks pop (50.8 s), green 78/100 stamps down (51.8 s), impact shake (52.6 s) -> 3 events.
- 56.0–58.5 s: New task arrives (56.0 s), rules clash (57.0 s), coral buzz (58.0 s) -> 3 events.
- 59.8–63.0 s: Desk wipes clean (59.8 s), card floats up (61.0 s), violet cabinet opens (62.5 s) -> 3 events.
- 65.2–68.5 s: R2 rises and dives (65.2 s), highlighter runs (66.0 s), pen loops (67.2 s), page drops (68.5 s) -> 4 events.
- 71.5–74.5 s: Bar chart enters (71.5 s), score bar surges (72.5 s), dotted baseline highlights (73.8 s) -> 3 events.
- 76.0–81.5 s: Caveat tag stamps (76.0 s), clock icon ticks (77.2 s), desk clears (78.5 s), robot starts task (79.5 s), end card rises (81.0 s) -> 5 events.
- Result: Every single 3 s window contains at least 3 distinct visual events. Pacing gate passes with zero dead time.

## 10. Numbers budget (3 headline numbers)

**1. 43 to 78 out of 100** (spoken "forty three out of one hundred" and "seventy eight out of one hundred")
- **What it is.** Score jump on the JobBench production case study when contrastive edits are applied and re-run.
- **Source.** Figure 9, p. 12 ("BASE HARNESS 43.1" -> "77.8", gain +34.7).
- **Scope.** JobBench task 1, Gemini 3.5 Flash under OpenCode.
- **Kind.** Absolute score out of 100, measured single-task deliverable evaluation, authors' own run.

**2. 11.5 points** (spoken "eleven points on average")
- **What it is.** WorkBuddy-Bench average score gain for GLM-5 under OpenCode from a single contrastive step ($k=1$).
- **Source.** Table 1, p. 8 (Base Avg 64.2 -> Harness2 75.7, +11.5 points). Also Section 3.2, p. 8: "On WorkBuddy-Bench, Harness2 raises GLM-5's average score by 11.5 points under OpenCode... surpassing the corresponding base Gemini scores of 72.4 and 74.5."
- **Scope.** WorkBuddy-Bench (3-domain macro-average), GLM-5 under OpenCode.
- **Kind.** Absolute benchmark score gain, macro-average of 3 domains over 3 runs, authors' measured result.

**3. 8.4 points** (carried on screen chart at l15 / Figure 6)
- **What it is.** WorkBuddy-Bench average gain for Gemini 3.5 Flash under OpenCode when scaling parallel recursion to $k=5$.
- **Source.** Section 4 ("Compute-Performance Trade-off"), p. 10, lines 563–566: "raises gains over the base from 4.5 to 7.5 points on JobBench and from 5.1 to 8.4 on WorkBuddy-Bench." (Base 72.4 + 8.4 = 80.8).
- **Scope.** WorkBuddy-Bench average, Gemini 3.5 Flash under OpenCode with $k=5$.
- **Kind.** Absolute gain over base harness, authors' measured run.

## 11. The caveat

**l16, first sentence (about 76.0 s):** "One caveat: extra test probes take more computing time."

**Support.**
- **Appendix F (Limitations), p. 29:** "Cost of recursive refinement. Harness2 requires additional executions and editor sessions to propose, probe, and compose harness changes. Increasing the recursion budget therefore adds inference cost."
- **Also carried by caption:** Without ground-truth supervision, behavioral contrasts rely on model judgment and execution traces, which remain subject to execution stochasticity and shared model biases.

## 12. Loop and ending

- **Last sentence (l16):** "But resetting after each task keeps the AI from breaking on its next job."
- **The loop.** When the video loops back to frame 0, the viewer hears the opening hook: "New skills can break an AI on its next job." The ending directly resolves it: resetting after each task prevents those new skills from causing breaking errors on the next job.
- **End card.** Rises in the final 1.6 s, displaying solely `hemanth_with_ai`.

## 13. Post text angle

**Title:** New skills can break an AI on its next job.

**Caption first line:** "When an AI agent modifies its own prompt files and scripts to solve a hard task, keeping those edits for the next task often causes clutter and failures. Google Research's Harness^2 splits self-improvement into two levels: test-time probes that verify edits without ground-truth answers, and an improvement harness that stores lessons while resetting the worker's files. (Unofficial explainer of arXiv 2610.14224 v1.)"

**The rest of the caption should carry:**
- On WorkBuddy-Bench, the method gained 11.5 points on average, rising from 64.2 to 75.7 and beating base Gemini 3.5 Flash (72.4).
- In a JobBench multi-file case study, contrastive probing raised the deliverable score from 43.1 to 77.8 out of 100.
- The trade-off: test-time probing requires extra model rollouts and editor sessions, increasing computing time per task.
- "Preprint, arXiv 2610.14224 v1".

## 14. Script

The `text` form. The `say` form spells out "A I", "forty three out of one hundred", "seventy eight out of one hundred", and "eleven points".

```
l01: New skills can break an AI on its next job.
l02: Harness2, a new method, solves this with two loops of improvement.
l03: Take one complex job: an AI agent reconciles a schedule, roster, and budget.
l04: We call the instructions, files, and tools around the AI its harness.
l05: On this job, its first harness missed mismatched files, and scored 43 out of 100.
l06: In the real world, the AI has no answer key to check its own output.
l07: Harness2 creates two test versions: one fixes work habits, and one adds job rules.
l08: It runs both candidates on the same job: we call this step a probe.
l09: Harness2 compares both runs, and combines only the edits that clearly helped.
l10: Each decision is tied to a concrete observation rather than a presumed score gain.
l11: The re-run checked every output, and the score jumped to 78 out of 100.
l12: If an agent keeps every past edit, future jobs break.
l13: Instead, Harness2 resets the AI agent to clean files, and saves only the lesson.
l14: The execution harness is the system being improved, and the improvement harness is the mechanism that improves it.
l15: Across office tasks, the method gained eleven points on average.
l16: One caveat: extra test probes take more computing time. But resetting after each task keeps the AI from breaking on its next job.
```
