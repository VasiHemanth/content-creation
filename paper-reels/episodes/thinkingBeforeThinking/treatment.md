# Treatment: Thinking Before Thinking (arXiv 2609.38147 v1)

Paper: "Thinking Before Thinking: Scaling Agentic Inference Through Meta-Reasoning", Paras Dahal, Anton Bakhtin, Taco Cohen, Zhengxing Chen, Carole-Jean Wu, Rob Fergus, Scott Yih, Gabriel Synnaeve, Ruslan Salakhutdinov, Sanjeev Arora, Jason Weston, Anirudh Goyal (Meta Superintelligence Labs). arXiv 2609.38147v1, 29 Sep 2026, 38 pages.

**What I read**
- **Main text.** Pages 1 to 16 in full, plus Appendix A (Scope of the Evidence, p. 20), from `llm-wiki/raw/assets/2609.38147/paper-v1-text.txt`. That file is extracted with pypdfium2 from `paper-v1.pdf`, both downloaded for this treatment.
- **Appendices.** B to I (the prompts and implementation details) were searched, not read in full.

**Renderer and size**
- Renderer: HyperFrames. Folder: `paper-reels/episodes/thinkingBeforeThinking/`.
- Voice: `aiden` at 1.12.
- Size: 15 lines, 201 caption words (about 211 spoken, with the numbers said out loud), 8 scenes.
- Length: about 78 s, estimated at 3.2 spoken words a second plus 0.75 s of lead and tail per line. Agent Plasticity came out 7 s under its estimate, so expect about 72 s. Re-time every beat from `audio/words.json`.

**What the channel already covered**
- **Context management.** AutoCompact, Context Language Models and ContextEvo (`wiki/topics/agent-context-management.md`).
- **Self-improvement.** Dream-RSI and Agent Plasticity.
- **How this paper differs.** It does not change what is in the context, and it does not train anything. It splits the decision about the next step away from the work itself.
- **Pictures already used:** trees, dream bubbles, desks, notebooks, two curves, scrolling message screens. This one uses a railway: a signal box, trains, a wagon shed and switch levers.

**Requester's notes, checked against the paper**
- **"Structured control becomes more valuable than raw extra compute."** The paper does not say this. Its words are "spending computation on structured control becomes more important as agents scale to longer runs" (p. 1). Appendix A also says the results concern nominal call budgets, "not efficiency, latency, or performance at equal matched cost". The video makes no cost or efficiency claim.
- **"+3.6 to 4.2 pp average lifts."** Correct as a per-benchmark mean over three models on the three reasoning benchmarks, at 100 calls (p. 2, sec 6.1). Per-model gains run from 0.4 to 9.2. Cut from the video.
- **"71.5% vs 58.0% for Codex."** Correct, but Codex is an external product with budget accounting added (sec 5.2, App. I). The matched comparison is direct control at 63.7%. The video uses the matched pair. Codex stays out of the video and the caption.
- **"Controller quality depends on the model; strongest results use frontier models."** The paper says the size of the gain depends on the model (sec 7.3). Appendix A says the evidence covers three frontier models only, with no generalization to weaker models. The caveat line says the second of these.

## 1. The one idea

On a long agent run, the choice of what to do next is a job of its own, and a separate controller that does only that job made the same model score higher on the same budget.

**The mechanism** (the producer needs it; the viewer needs only the sentence above):

1. **Workers and controller.** Workers do the task. A controller decides what work comes next. It does nothing else.
2. **The control cycle.** Each cycle has four stages: assess, propose, evaluate, dispatch.
3. **State and memory.** Between cycles the controller keeps only a compact state. Every output (an artifact) stays in persistent memory, and dispatch gives each worker only the artifacts it needs.
4. **The matched comparison.** The baseline is a direct control agent: the same workers, models, budget and interfaces, but it chooses each action in one call over its full history. Appendix A: the comparison changes the compact state, the stages and memory access together. It shows that the whole design works, not which part does. No line credits one component.

## 2. Hook options

| # | Spoken line (STE, 12 words max) | On screen from 0.0 to 1.0 s |
|---|---|---|
| A | "Same model, same budget. Only the control changed. Every score rose." (11 words) | Frame 0 already shows the full claim in big type: `SAME MODEL. SAME BUDGET.` in white and `ONLY THE CONTROL CHANGED.` in amber, over two identical blueprint locomotives on parallel tracks. By 1.0 s the wheels turn and steam puffs from both. |
| B | "Your agent still has budget left. Why does it stop?" (10 words) | Big type `BUDGET LEFT. WHY STOP?` over a tall budget tank that drains only a little, then a train braking at a buffer stop. |
| C | "On long runs, the next-step decision is a job of its own." (12 words) | Big type `DECIDING THE NEXT STEP IS A JOB.` over a single track that splits into three branches. |

**Pick A.**

- **It is the paper's central claim in plain words.** This follows the 2026-10-11 rule: open on the paper's point, not an example. Sec 7.1 says the two agents "call the same models, dispatch the same workers, and draw on the same allowance, differing only in how the run is directed", and "every matched setting improves".
- **It has stakes.** A score went up with nothing changed except one part. A cold viewer wants to know which part.
- **It loops.** The close says what the control does, and the hook replays as the proof.
- **Why not B:** it is true only for one model on one benchmark (direct control used about 18% of the budget with GPT-5.5 on ProgramBench). It also opens on the baseline's failure, not on the idea. It becomes beat l09.
- **Why not C:** it is abstract and has no stakes. It is close to the paper's own sentence, which is the first receipt (l03).

**Truth check for A**
- **"Same model, same budget, only the control changed."** Sec 3.5 (p. 6) and sec 7.1 (p. 14).
- **"Same budget" means the same nominal budget, not the same spend.** Direct control spends far less of it. l08 and l09 say so right after the setup, so the hook does not mislead.
- **"Every score rose" is true at the main budgets** (100 calls on the reasoning benchmarks, 1200 on ProgramBench). All 12 matched comparisons there have higher point estimates (p. 2; sec 6.1 Finding, p. 10).
  - **At small budgets it is not true.** Opus 4.8 trails at 400 calls, and GPT-5.5 is slightly behind at the smallest ProgramBench budget (sec 6.2).
  - **l13 restores the scope** ("At the main budgets ... all 12 matched comparisons"), and l14 says the overhead can hurt at small budgets.
  - **Significance.** Appendix A says positive point estimates "do not establish significance for every difference". l13 covers this with "Some gains are small".

**First-frame rules**
- Frame 0.0 shows all of `thumb_hook` ("Same model. Same budget. Only the control changed.") at full opacity. It may settle in scale from 1.1 to 1.0 over 0.0 to 0.25 s. No entrance from opacity 0.
- On the spoken word "control" (about 1.9 s), the amber line does not enter (it is already there). It flashes, slams in scale from 1.15 to 1.0, and the camera shakes.
- "Every score rose" is spoken but is not part of the big type. It is shown by the 12 tiles.
- The paper's name never appears in the first 2 s, or anywhere before the end card. "Meta-reasoning" is first spoken at l05 (about 17 s).

## 3. Visual metaphors (one per idea, one railway world)

**Idea 1, control is its own job: the signal box.**
- **Picture.**
  - **Before:** one locomotive whose driver also throws the track switch from the cab, while it drives.
  - **After:** a signal box above the yard. The box throws the switches; the locomotives (workers) only run.
- **What a stranger reads:** "one person used to drive and steer the junctions; now someone in a tower decides the route."
- **Scenes.** Carried by `fork` (l03, the box builds itself by the junction) and `split` (l04, l05). Paid off in `close`.
- **Limits.** The box stands for the controller and the trains for the workers. It adds no number and makes no claim about speed or cost.

**Idea 2, compact state and persistent memory: the wagon shed.**
- **Picture.**
  - **Direct control:** the driver's train couples a new wagon after every step and drags all of them (the whole history).
  - **Controller:** a small slate in the signal box holds a few chalk lines (the compact state). The wagons wait in a shed (persistent memory), and a departing locomotive couples only two of them (dispatch with selected artifacts).
- **Scenes.** Set up in `split` (l04) and carried by `cycle` (l07).
- **Limits.**
  - Wagons stand for artifacts. They carry blank plates, not IDs or counts.
  - The train is long and the slate is small. That picture is true of how the two designs are built (sec 3.1, 3.5). No line says the long history caused the plateau: the paper says "we did not test it directly" (p. 13).
  - No character counts on screen.

**Idea 3, four stages: the lever frame.**
- **Picture.** Inside the signal box, a row of four big levers labelled `assess`, `propose`, `evaluate`, `dispatch`. Each lever is pulled on its spoken word, and then a circular arrow wraps the row.
- **Scene.** Carried by `cycle` (l06).
- **Limits.** The levers name the stages only. Nothing suggests that one stage matters more than another.

**Data marks, not metaphors**
- **Budget tanks** (`tank`).
- **Two bars** (`result`).
- **Budget sketch** (`result`, `limits`): tagged `sketch, after Fig. 3`.
- **Twelve result tiles** (`hook`, `limits`).

All of them are drawn from storyboard values (section 6), never from literals.

**Must-nots**
- No crown, trophy, checkmark or red and green on any data mark. Direct control is amber and Meta-Reasoning cyan, both neutral. The amber hook line is decoration.
- No line or picture about cost, speed, tokens or efficiency.

## 4. Receipts

Three passages, spaced about 20 to 35 s apart.
- Each is read on camera at about 3.4x, holds for about 2 s on one phrase, then the scene's own picture returns.
- The camera holds still during a highlight (`follow: 0`, left-aligned, `fx` near 90), and no receipt starts before 0.1 s into its scene.
- The page numbers below are PDF pages, and they match the printed page numbers.

| # | Line | Page, section | Exact text in the paper | Read on camera (highlighted) | `find` | `circle` | Hold (est.) |
|---|---|---|---|---|---|---|---|
| R1 | l03 | p. 16, sec 8 Conclusion | "As runs grow longer, that decision becomes work in its own right." | "that decision becomes work in its own right." | `that decision becomes work`, `in its own right.` | `work` | 9.9 to 11.9 s |
| R2 | l10 | p. 11, sec 6.2 | "Continuing to work is not enough; what the agent does next also matters." | "Continuing to work is not enough;" | `Continuing to work is not enough;` | `enough` | 46.0 to 48.0 s |
| R3 | l14 | p. 1, Abstract | "It keeps improving over the tested budget ranges where direct control plateaus, though its overhead can hurt at small budgets." | "its overhead can hurt at small budgets." | `its overhead can hurt at small budgets.` | `small` | 67.5 to 69.5 s |

**What each hold sits between**
- **R1.** l02 names the decision (keep, restart, or stop), and "that decision" in the receipt points back to it. "As runs grow longer" is spoken over the train adding wagons. The page dives on "that decision" and holds on the clause. On "right", the scene cuts back to the junction, where the signal box draws itself.
- **R2.** The first two sentences of l10 play over the budget chart. The page dives on "Continuing" and holds about 2 s. The camera cuts back to the chart before the transition.
- **R3.** The page dives on "overhead". After about 2 s it cuts to the budget sketch, zoomed on the small-budget end where the two lines cross. Then "three frontier models" lands as three tags.

**Crop notes for `evidence.json` and `facts.json`**
- **R2, the line above** holds "376 to 768" and "62.7% to 65.3%". These support l10. If the crop includes them, list them in `evidence_incidental`.
- **R2, the line below** begins "Meta-reasoning does not win at every budget. With Opus 4.8, it trails direct control at 400 calls, 56.6%".
  - That sentence is true, but it arrives 15 s before the caveat and could read as a contradiction of the hook.
  - Crop R2 to its own PDF line if `evidence.py` allows it. If not, frame the 3.4x hold so that only line 682 is in view, and `snap` the hold to check.
  - List 4.8, 400 and 56.6% in `evidence_incidental` either way.
- **R3.** The line above holds "4.2 points" and "three frontier models" (and "3.6" one line higher). Treat them the same way.
- **R1.** No numbers nearby.
- **Soft hyphen.** p. 2 has one in "meta-reasoning" at a line break. No receipt uses p. 2.

## 5. Shot list

**Transitions.** Main transition `whip`, accents `zoom` and `punch`, `cut` inside a topic, `blur` for the wind-down.

**Timing.** Start times are estimates (line length = 0.25 s lead + voice + 0.5 s tail, 1.6 s after the last line).

**Visual events.** Every beat is tied to a spoken word. Thin line drawings do not register with the gate (Agent Plasticity production notes), so each beat below is a fill, a slam, a camera move or a large shape. Add a faint warm pulse (about 0.2 opacity, 0.5 s) on emphasis words where a scene is mostly lines.

| Scene | Line | Start (s) | Spoken words | On screen / camera | Transition out |
|---|---|---|---|---|---|
| hook | l01 | 0.0 | "Same model, same budget. Only the control changed. Every score rose." | **0.0 s:** the full claim is already on screen in big type (white `SAME MODEL. SAME BUDGET.`, amber `ONLY THE CONTROL CHANGED.`), over two identical locomotives on parallel tracks. **0.6 s:** wheels turn, steam puffs. **"control" (about 1.9 s):** a signal box drops onto the right-hand gantry, the amber line flashes and slams in scale, the camera shakes. **"score rose" (about 3.2 s):** a row of 12 small tiles under the tracks each ticks up one notch in a fast stagger. Slow push throughout. | whip |
| fork | l02 | 4.2 | "Long runs force one decision again and again: keep, restart, or stop?" | One track runs up the frame and the camera rides it. **"one decision":** the track splits into three branches. **"again and again":** the camera passes a second and a third junction, fast. **"keep", "restart", "stop":** a sign pops on each branch of the last junction (`keep`, `restart`, `stop`), and a buffer stop slams onto the `stop` branch. | cut |
| fork | l03 | 8.7 | "As runs grow longer, that decision becomes work in its own right." | **"grow longer":** the train behind the camera couples wagon after wagon, and the camera pulls back to show its length. **"that decision":** receipt R1 rises and the camera dives; the highlighter follows "that decision becomes work in its own right." and a pen loop circles `work` (about 2 s). **"right":** cut back to the junction, where a signal box draws itself and fills beside the switch. | zoom (into the signal box window) |
| split | l04 | 13.2 | "Many agents decide in one step, over their whole history." | A single locomotive. In its cab, the driver also holds the switch lever. **"one step":** the lever throws with a click and the track switch snaps. **"whole history":** wagons couple behind it one by one (each one a solid fill), and the camera pulls back until the train fills the frame width. | cut |
| split | l05 | 17.1 | "Meta-reasoning splits the job. Workers do the task. A controller decides the next work." | **"splits":** the frame cracks in two along a horizontal line. The top half is the signal box (`controller` tag); the bottom half is three small locomotives (`workers` tag). **"Workers do the task":** the three roll out, steam puffs. **"controller decides":** the box window lights, a lever throws, a switch moves and one locomotive diverts. | cut |
| cycle | l06 | 22.2 | "Each control cycle has four stages: assess, propose, evaluate, dispatch." | Inside the box: a lever frame with four big levers. **"assess", "propose", "evaluate", "dispatch":** each lever is pulled on its word with a click; its label lights and the camera steps one lever right each time. **"dispatch":** a circular arrow wraps all four and spins once. | cut |
| cycle | l07 | 26.1 | "The controller keeps a compact state. All artifacts stay in persistent memory." | **"compact state":** a small slate on the box wall gets three chalk strokes (`compact state` tag). **"artifacts":** the camera tilts down to a wagon shed with a `persistent memory` sign, and wagons roll in and fill the rows. **"memory":** one locomotive leaves the shed with only two wagons coupled. | whip |
| tank | l08 | 30.6 | "The comparison: direct control, with the same workers, model and budget." | Two lanes: left `direct control` (the driver with the lever), right `Meta-Reasoning Agent` (the box and its workers). **"workers", "model", "budget":** three `=` tags slam between the lanes, one per word. | cut |
| tank | l09 | 34.8 | "With one model, direct control used only about 18% of its budget. Meta-reasoning used almost all." | A full budget tank rises under each lane, with small tags `ProgramBench` and `GPT-5.5`. **"eighteen":** the left tank drains to 18% used and `18%` counts up and lands. **"almost all":** the right tank drains nearly empty (from `_mrUsed`) and an `almost all` tag pops. The camera pans left to right. | cut |
| tank | l10 | 40.8 | "With another model, direct control doubled its calls as its budget grew. Its score rose only a little. Continuing to work is not enough." | The tanks slide away and the left lane becomes a vertical calls axis (no tick labels). The model tag flips to `Opus 4.8`. **"doubled":** a solid used-calls bar rises to `_dcCallsLow`, then grows to `_dcCallsHigh` (twice as tall). **"budget grew":** a dashed budget marker moves up the same axis from `_budgetLow` to `_budgetHigh`, ahead of the bar. **"score":** a small score gauge appears; on "little" its needle moves a hair. **"Continuing":** receipt R2 rises, the camera dives, the highlighter follows "Continuing to work is not enough;" and a pen loop circles `enough` (about 2 s). Cut back to the axis. | punch |
| result | l11 | 49.1 | "Best case: on average, direct control passed 63.7% of hidden tests. Meta-reasoning passed 71.5%." | Chart axes draw, with tags `ProgramBench`, `GPT-5.5`, `best case` and `mean test-pass rate`. **"on average":** the `mean test-pass rate` tag flashes. **"sixty":** the amber left bar grows and **63.7%** counts up. **"hidden tests":** a row of sealed test cards slides in under the axis. **"seventy":** the cyan right bar grows and **71.5%** counts up. The camera pulls back to frame both bars. | cut |
| result | l12 | 56.7 | "With more budget, the meta-reasoning score still rose. Direct control stayed flat." | The bars fold into a budget axis (`budget` with three unlabelled ticks; tag `sketch, after Fig. 3`). **"more budget":** the axis extends right. **"still rose":** the cyan line climbs from the left tick to the right one (from `_mr400` to `_mr1200`). **"flat":** the amber line draws level at `_dcFlat` and a ruler snaps along it. | blur |
| limits | l13 | 61.2 | "At the main budgets, meta-reasoning scored higher in all 12 matched comparisons. Some gains are small." | A 4 x 3 grid of tiles with small benchmark and model tags, and a `main budgets` tag over the grid. **"twelve":** the tiles flip up in a stagger, each with an up arrow whose length comes from `_gains`, and `12` lands. **"small":** the camera pushes in on the three shortest arrows and a magnifier slides over them. | cut |
| limits | l14 | 67.3 | "Its overhead can hurt at small budgets. The paper used only three frontier models." | **"overhead":** receipt R3 rises, the highlighter follows "its overhead can hurt at small budgets." and a pen loop circles `small` (about 2 s). Cut to the budget sketch zoomed on its left end, where the two lines cross. **"three frontier models":** three model tags slide in and a `tested with` bracket wraps them. | cut |
| close | l15 | 72.4 | "The model does the work. The control decides which work is worth it." | **"does the work":** a locomotive runs across the frame with steam. **"control decides":** the signal box lever throws and the switch snaps. **"worth it":** the camera pulls back to the hook's composition (two locomotives on parallel tracks) and the hook type ghosts in at 0.3 opacity. The end card rises with only `hemanth_with_ai`. | (end) |

**Pacing audit**
- **No gap over 2.5 s.** Gaps between planned beats run 0.6 to 2.4 s. The longest are 8.7 to 10.0 s (train couples, then the receipt rises), 42.5 to 44.0 s (the budget marker, then the score gauge) and 56.7 to 58.7 s (the axis extends, then the line climbs).
- **Receipt holds** are about 2 s each. Each carries a camera dive, a moving highlighter and a pen loop, so no 3 s stretch is static.
- **The longest lines** (l10 at 8.3 s, l11 at 7.6 s) schedule six and five events.
- **The first event** lands at 0.0 s (the type is on screen) and the second at 0.6 s.
- **The end card** holds for the last 1.6 s and is excluded by the gate.

## 6. Numbers budget (4)

1. **18%** (direct control, GPT-5.5, ProgramBench, 1200-call budget): the share of the budget it used. Sec 6.2, p. 10: "it uses only about 18% of the 1200-call allowance."
   - Relative (a share), measured, the authors' runs, one model on one benchmark.
   - The line says "with one model" and "about".
2. **63.7%** (Direct Control Agent, GPT-5.5, ProgramBench, 1200 calls). Table 1, p. 11, and sec 1, p. 2.
   - Absolute, measured, the authors' runs.
   - It is an average: the mean per-problem test-pass rate, the share of hidden test cases matched, averaged over problems. The line says "on average ... passed 63.7% of hidden tests", and the tag says `mean test-pass rate`. Never "solved programs".
3. **71.5%** (Meta-Reasoning Agent, same setting). Same sources, same metric, also an average.
   - This is the best case on ProgramBench, and the line says "Best case". The other two models gained about 2 points there (Gemini 48.7 vs 46.9, Opus 67.2 vs 65.3, not shown).
   - It is not the largest gain in the paper: that is LongCoT-mini with Gemini, 9.2 points. So the tags name ProgramBench and GPT-5.5.
4. **12**: matched comparisons (4 benchmarks x 3 models) at the main budgets, all with higher point estimates. Sec 1, p. 2, and the sec 6.1 Finding, p. 10.
   - A count, measured, the authors' runs.
   - It shows as the digit in l13 and as the 12 tiles in l01 and l13.
   - Not tested for significance per comparison (App. A). The same line says "Some gains are small".

**Drawing-only values** (`_` keys, never printed, each listed in `facts.json` with its source):
- **`_mrUsed`** (l09 right tank). Sec 6.2 gives only a range across models at 1200 calls: "roughly 89% to 101%". Either read the GPT-5.5 point from Fig. 3 (left panel), or use 0.9 and note in `facts.json` that it is an estimate inside the stated range. Never draw it above full.
- **`_dcCallsLow` 376, `_dcCallsHigh` 768, `_budgetLow` 400, `_budgetHigh` 1200** (l10). Opus 4.8 direct control on ProgramBench (sec 6.2, p. 11; the budgets from sec 5.3).
  - All four go on one absolute calls axis: the used-calls bar and the budget marker share the scale.
  - Do not draw 376 and 768 as drain levels of one 1200 tank. At 400 calls direct control used about 94% of its budget, not 31%.
- **`_mr400` 64.1, `_mr1200` 71.5** (l12): Meta-Reasoning with GPT-5.5 on ProgramBench (sec 6.2).
- **`_dcFlat` 64** (l12): "stays near 64% across the sweep" (sec 6.2). GPT-5.5 Meta-Reasoning is "slightly behind at the smallest ProgramBench allowance", so start the amber line just above the cyan line at the left tick. The sketch has no middle point and no tick labels.
- **`_gains`** (l13): the 12 per-cell differences from Table 1, for the arrow lengths.

**Cut:** 58.0 (Codex), 65.5 (Claude Code), 67.2, 3.6 to 4.2, 8.6, 9.2, 0.4, 56.6 vs 62.7, the AUCs 0.55 and 0.88, 83%, coverage +20, "one million characters", 4.4 to 9.8 reads, and every budget value (25, 50, 100, 400, 800, 1200) as printed text.

**Spoken numbers:**
- "about eighteen percent"
- "sixty three point seven percent"
- "seventy one point five percent"
- "twelve"

Model names appear only as small on-screen tags and are never spoken. The paper's point is the matched comparison, not which model.

## 7. The honest caveat

**Placement.** l13 and l14 (about 61 to 72 s), paced like every other line, each with its own picture (the magnifier on small arrows; the receipt, then the lines crossing at the small-budget end).

**Spoken:** "At the main budgets, meta-reasoning scored higher in all 12 matched comparisons. Some gains are small. Its overhead can hurt at small budgets. The paper used only three frontier models."

**Sources:**
- The abstract: "its overhead can hurt at small budgets" (p. 1).
- Sec 6.2: "Meta-reasoning does not win at every budget", with Opus 4.8 at 400 calls (56.6% vs 62.7%).
- Sec 7.3: "not uniformly preferable to direct control".
- Appendix A: "three frontier models", no generalization "to weaker models", and point estimates that "do not establish significance for every difference".

**The paper also flags** (kept out of the script for length; put in the caption if there is room):
- It does not separate which part of the design helps (App. A).
- Equal call budgets are not equal token cost or latency (sec 3.5, App. A).
- On the LongCoT-mini chess subset, meta-reasoning does worse than direct control (sec 7.3).

## 8. Loop and ending

**Last line:** "The model does the work. The control decides which work is worth it."

**First line:** "Same model, same budget. Only the control changed. Every score rose."

**On replay** the two read as rule, then proof. The close says the control is the part that decides. The hook says that changing only that part raised every score.

**Visually**, the close pulls back to the exact composition of frame 0: two locomotives on parallel tracks, with the hook type ghosted in. The end card shows only `hemanth_with_ai`.

## 9. Post text angle

**Title:** Same model. Same budget. Only the control changed.

**Caption first line:** "A Meta paper gives an AI agent a separate controller that only decides what to do next. At the main budgets it beat a matched agent in all 12 comparisons, though some gains are small. (Unofficial explainer.)"

---

## STE notes for the producer

The full script above passed `node paper-reels/hf/bin/ste.mjs` in a scratch storyboard: 0 hard, 0 soft findings, 15 lines, 201 words. The `text` fields use digits ("18%", "63.7%", "71.5%", "12"), and `say` spells them out.

**`ste.names`:** `Meta-Reasoning`, `meta-reasoning`, `ProgramBench`. The method name ends in "-ing", and the checker treats the hyphenated form as one word.

**`ste.allow`:** `{ "line": "l10", "rule": "ing", "why": "quotes the paper (p. 11) word for word, and the receipt shows the same words" }`, for "Continuing".

**`ste.terms`** (the paper's word, then the synonyms to refuse). These are the paper's own terms; per the 2026-10-12 decision, do not swap them for plain words.

- `controller`: manager, boss, orchestrator, planner, supervisor, foreman (the signal box is a picture only)
- `workers`: sub-agents, subagents, helpers, crew, crews
- `control`: orchestration, management, planning
- `compact state`: summary, short memory, notes, index card
- `persistent memory`: storage, archive, database, filing cabinet, shed (the shed is a picture only)
- `artifacts`: outputs files, results files, drafts, wagons
- `budget`: allowance, quota, compute. "Calls" is used only as the unit inside l10.
- `direct control`: baseline agent, single loop, plain agent
- `comparisons`: matched tests, matchups, head-to-heads. "Tests" means hidden test cases only (l11). The experiment is "the comparison" (l08) and "the paper" (l14).
- `test-pass rate` (on-screen tag only): accuracy, success rate, solve rate

**Lines that must not be added in production:**
- Any claim about cost, efficiency or speed.
- Any claim that one component (the stages, the compact state, the memory) causes the gain.
- Any causal link between history length and the direct control plateau.
- "Beat Codex" or "beat Claude Code".
