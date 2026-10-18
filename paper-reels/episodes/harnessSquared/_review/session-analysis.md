# Harness Squared: session analysis (Antigravity, Gemini 3.8 Flash High)

Sources: orchestrator session 684ce78d (70 steps) and the subagent sessions under ~/.gemini/antigravity-cli/brain/<id>/ (director 442f028b, script producer 224e155f, build producer 98d35a72, validator 85490ff9, critic f10ae949, three cold viewers). Items marked (inferred) are my reading, not something the model said.

## 1. Timeline (UTC, 2026-10-17; wall clock 74 min)

| Phase | Time | Notes |
|---|---|---|
| Director | 19:49 to 20:01 | 150 steps, ~100k output tokens. Read explain.md, paper.md, picture.md, make-reel SKILL, memScope treatment (as a template), then the paper. |
| Cold viewer x3 + director fixes | 20:01 to 20:08 | 3 rounds, all FAIL (~1 min each, flash, ~4k tokens each). Rule says stop after three and report. Script text only. |
| Script phase producer | 20:08 to 20:15 | 130 steps, ~66k tokens. |
| Step 4 (storyboard cold viewer) | skipped | Lines word for word as the script (inferred from steps 38 to 42). |
| Build phase producer | 20:15 to 20:57 (42 min) | 363 steps, ~166k tokens. All 9 scene files first-written 20:17:43 to 20:23:15, about 20 s each. Voice (Fish S2-Pro) took ~15 min of waiting (20:26 to 20:42). Render/audio/mux 20:44 to 20:47. Validate loop to 20:57. |
| Validator + critic (parallel) | 20:58 to 21:02 | 33k and 28k tokens. Both PASS first time. No fix round. |
| Wrap-up | 21:02 | Registered post text, asks human for approval. |

Orchestrator: 185k input, 15k output tokens (as logged). Every subagent was invoked with `Model: inherit` (steps 5, 13, 21, 29, 35, 41, 49), so the `model: pro` in the producer, director, validator and critic frontmatter was not applied (inferred: agents ran on Flash). The user's settings record the session model as Gemini 3.8 Flash (High).

## 2. Guidance read vs skipped

Director (442f028b) opened: formats/explain.md, paper.md, picture.md, .agents/skills/make-reel/SKILL.md, memScope/treatment.md, the paper text. It did NOT open `_deepswe-hf/scenes/lock.html`, the one scene picture.md says to read "once to see how a shot list line becomes motion".

Build producer (98d35a72) opened, in order: storyboard.json, facts.json, evidence.json, treatment.md, formats/paper.md, formats/explain.md, hf/README.md (step 13), then episodes/dreamRSI/scenes/hook.html, dreamRSI/scenes/tree.html, contextEvo/scenes/results.html, hf/kit/blueprint.css, hf/kit/kit.js (lines 1 to 350), hf/bin/qa.mjs (after QA complained, step 53), dreamRSI/scenes/thumb-hero.html.

Not opened: `_deepswe-hf/scenes/*` (README line 84 says "Copy `_deepswe-hf/scenes/lock.html`"), `formats/picture.md` (the producer prompt does not name it, only the director's does), `hf/kit/parts/README.md` (shared drawing parts; README does not link it, and it says "Not wired yet"), `engine/BLOCKS.md` (correctly skipped, it says HyperFrames episodes do not use it). Of the existing scenes, it never opened the richer ones (_deepswe-hf 9 to 14 KB, contextEvo 10 to 16 KB, dreamRSI dream/search 10 KB). The reference files it did open are the shortest style (6 to 8 KB). It did read the README scene rules and the kit API, so the omissions are about taste references, not mechanics.

## 3. How the visuals were decided

Director: it chose the protagonist as a "complex multi-file job" and a recurring robot-at-a-desk plus folder/cabinet metaphor (treatment sec. 5 and 7). The treatment's table of "Object on screen" is a list of boxes: robot, folder with tabs, three document cards, memo with stamp, two lanes, violet lens, violet cabinet. The shot list is detailed per word (envelope bounces, orbital rings, lens pulls habits into a green folder, desk wipes clean). The brief is reasonable on paper; it names objects, not how they are drawn. The one visual risk it never tested is whether a blank rectangle can carry "a lens" or "a cabinet".

Build producer: the thinking log shows almost no visual reasoning. Steps 37 to 51: "Beginning HTML template design for nine scenes... reviewing existing HTML structure". Its thinking at steps 45 and 55 is largely a paraphrase of the script, not design. Choices and shortcuts, with evidence:

- Same skeleton in every scene: `-cam`/`-beat` wrappers, same `KIT.pop/rise/slam` + `KIT.beats(... amp 0.02 shift 12)` + slow `scale 1.05..1.08` push (hook, task, fail, probe, all show the same lines). This is the dreamRSI/contextEvo pattern, copied.
- One stock robot (`KIT.robot`, kit.js:299) is the only character: used in hook, probe (twice, scaled .85), reset, close (scenes/*.html). In the validation sheet, 14 of 32 frames show the same face on a blue field.
- Placeholders instead of drawings. Hook: "Chaotic tabs - visual color chips without hardcoded text" (hook.html) are four unlabeled colored rectangles. Memo/document body is a `repeating-linear-gradient` of grey stripes (task.html, fail.html). Probe "candidate files" are empty dark boxes. The compose "lens" is a bordered circle. The desk is a single cyan bar. Plausibly the cause: QA fails any static words/digits (step 53 thinking "violates the established rule"), so the model deleted the labels (step 59 rewrite "Clean static words from hook.html") rather than bind labels from the storyboard.
- Wrong or unused kit parts: no use of `KIT.focus`, `travel`, `multiply`, `swap`, `recolor`, `tree`, `PARTS`. The producer's own first thought (step 1) mentions the system-design board rules, then applied the paper layout. Treatment promises (envelope bounce, "robot shrugs", "two robots execute in parallel with tick", "clutter vanishes into rings") were reduced to fades and pops.
- No iteration on look. `snap` was run once for 7 timestamps (0, 4, 44.5, 50, 64.5, 70, 80 s; step 215), chosen for receipts and the hook. Scenes task (8 to 18 s), fail, probe, reset first half, payoff were never looked at as images by the producer. The only fixes after viewing were a receipt tag overflow (steps 223 to 227). After step 227 there are no layout or aesthetic edits; later edits are QA, voice and audio fixes (steps 300 to 350). Evidence: the `check` output lists overflow and overlap warnings (hook-title overlapping task-job, escaped folder tabs) that were not fixed, only ignored as info.
- Scene weight: 4 to 7 KB each vs 9 to 16 KB in the reference episodes, written in ~20 s per file with no revision pass.
- Time went to TTS, not scenes: the 42 min build was ~5 min scene code, ~15 min waiting on voice, rest QA and registration. The producer prompt tells it to "look before you render" but sets no minimum for how many scenes or what counts as looked at.

## 4. Gates and reviewers

- Cold viewer (3 rounds, flash, text only): tests script comprehension. It is blind to visuals by design. All three returned FAIL and pushed edits to the script (which the user likes). Nothing in the pipeline asks a cold viewer to watch frames.
- validate.mjs (23/23): file/format checks, frame match to engine stills, no blank frames, "engagement": event in first 1.5 s, gap <= 3.5 s (longest gap was exactly 3.5 s at 43 s), >= 30 events/min (75). Camera beats count as events, so the slow push and `KIT.beats` jitter satisfy it. Nothing measures whether an event is meaningful. QA 119/119 checks copy binding, numbers, captions.
- reel-validator: PASS. It inspected the 32-frame sheet and found "no blank frames, no unexpected frozen frames, no overlapping or clipped text". Scope is claim accuracy and defects, not design quality.
- retention-critic: PASS 8.6/10 (hook 9.0, visual interest 9.0). Its text praises "complex recursive architectures made visually tangible through dynamic character actions". Looking at the sheet, the actions are a stock robot and boxes. Its three fixes were minor (animation on receipt 1, arrows on receipt 2, badge timing); none went back to the producer because the orchestrator treated PASS as done (the skill's step 6 says to send the critic's top fixes, the orchestrator did not, inferred from steps 52 to 56). It also says it cannot hear audio and mentions details (e.g. "ticking clock icon") whose drawing is a bare circle with two hands (close.html:35). It is advisory by design and graded by the same Flash model family.

Neither checker has a rubric item such as "each concept has a distinct drawn object", "no placeholder shapes", or "the stock mascot repeats at most N times".

## 5. Root causes, ranked

1. No visual quality bar and a self-referential critic (prompt/design). Gates only measure presence and rate of motion; the critic scores 9/10 on visual interest for placeholder boxes. Fix: give critic and validator a concrete visual rubric (every named object is drawn and labeled, no blank rectangles standing for files, mascot reuse limit, per-scene contact-sheet review), and make "top fixes" mandatory to apply when any visual score < 8. Evidence: steps 52, 54; validation.json.
2. Build phase has no taste reference and a thin "look" step (prompt). Producer read the short dreamRSI scenes and not `_deepswe-hf` (the file README and picture.md both point at). The instruction "snap and read the contact sheets" has no minimum coverage. Fix: require snapping each scene at least twice and reading it, name 2 to 3 rich reference scenes by path, and require a per-scene "what is drawn for each noun" check. Evidence: steps 13 to 27, 215.
3. The "no static words" QA rule drives the model to blank placeholders (prompt/tooling). The treatment lists labeled objects (file names, tabs) but the model deleted labels to pass QA instead of binding them. Fix: say in the README that labels come from `data` and give a worked example of a labeled file card; add `PARTS.card` style helpers to the build brief. Evidence: steps 53 to 59, hook.html comment.
4. The director's picture brief names objects but not drawing detail or variety (prompt). One metaphor (robot at desk) is carried through 9 scenes; picture.md says the renderer offers "trees, a small robot, icons, charts" so the model chose the one named sprite. Fix: require a distinct visual per scene and a drawing plan (what each noun looks like) in the treatment's Picture section, and point the director at the rich reference scenes. Evidence: treatment sec. 7; robot count across scenes.
5. Subagents ran on Flash, not Pro (config/orchestration). `Model: inherit` on every spawn overrode frontmatter `model: pro` (inferred). The build producer is the one stage that needs strong spatial/visual judgment. Fix: have the make-reel skill state the model per spawn, or set the Antigravity default to match the frontmatter. This is partly a capability issue.
6. Model capability (cannot fully fix by prompts): weak at judging its own pixels. It viewed the sheet once and made only receipt fixes; its thinking about the image is a description of the text in the frame ("The visual data suggests the initial drawing of a circle"). It also front-loaded all 9 scenes in ~5 minutes with very little thinking per scene. Stronger model or a forced critique-then-revise loop with explicit defect lists would help.

Prompt-fixable: 1 to 4. Config: 5. Capability: 6 (and part of 1, because the critic is the same weak judge).
