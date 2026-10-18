# Prompt and gate proposal for weaker-model reels

Proposal only. Nothing in the project was edited. "SA" is session-analysis.md, "VD" is visual-diagnosis.md. All edits go in `.claude/` sources, then `node scripts/sync-agents.mjs`.

## 1. Ranked changes

### 1. Critic rubric, and its fixes become mandatory
Cause: SA root cause 1. The critic scored placeholder boxes 9.0 for visual interest, and its fixes were never sent back (SA section 4).

Edit `.claude/agents/retention-critic.md`. Replace the **Visual interest** bullet with:

> - **Visual interest:** Open one mid-scene frame per scene at full size, not only the sheet. For each scene, list the nouns the voice names and what is drawn for each. Cap this score at 5 if any of these is true: a named thing is a blank box, a colored chip or a grey-striped card with no label; one stock drawing (robot, page, folder) is the main picture in more than 2 scenes; the key verb of a scene has no event on screen (nothing travels, changes, counts, splits or is replaced); more than a third of the content area is empty for 2 s or more; a receipt replaces the live scene with a black frame. Cap it at 7 if every scene has only entrances plus the same slow camera push.

Replace the verdict sentence's condition with: "`VERDICT: PASS` if the mean is at least 7, no single score is below 5, and Visual interest is at least 7". Add: "Each fix names a scene, a time and what to draw ('probe, 34 s: copy B gets a rulebook strapped on')."

Edit `.claude/skills/make-reel/SKILL.md` step 6. After "Merge their findings into one list (...) and send it to the build-phase producer (SendMessage)." insert: "Send the critic's fixes even when the validator passes, if the critic's verdict is FAIL or its Visual interest is below 8." Keep the rest.

Effect: a checklist a weak judge can apply without taste. Claude runs scoring visuals 8+ skip the extra round.

### 2. Forced build loop
Cause: SA root causes 2 and 6. One `snap` of 7 times, no look at 5 of 9 scenes, no edits after step 227.

Edit `.claude/agents/reel-producer.md`, build phase, step 3. Replace it with:

> 3. Build and look before you render: `evidence`, `build`, `check` (must pass; every overflow or overlap warning is a defect to fix, not info). Then, for each scene, run `snap` at three times: 0.3 s after the scene starts, its middle, and 0.5 s before it ends. Read each image. Write one line per scene in `scenes/_look.md`: the defects you see (blank or tiny object, text under 30 px, clipped or overlapping, same drawing as another scene, key verb not shown) and the fix. Make at least one fix per scene, `build`, `snap` the same times again and read them again. A scene with no defect needs a line saying which drawing-plan row each object came from. Register only when every scene has two looks. Then `render`, `audio`, `mux`. Run each step in the foreground, one at a time. Never background a render and never start a second render of the same episode: the steps take a lock; if one refuses, wait.

Optional code change (needs your OK): `hf.mjs <dir> snap --scenes` that expands to the three times per scene. Otherwise the model computes them from `audio/words.json`.

Effect: forces image reads on every scene and a second pass. A weak model may invent defects, but it still sees its own output twice, and the gate catches the worst cases.

### 3. Drawing plan in the treatment
Cause: SA root cause 4, VD problem 1 (three sprites carry 80 s) and problem 2.

Edit `.claude/agents/reel-director.md`. Append to item 7 (**Picture**):

> Then write the drawing plan, a table with one row per noun the script names: noun, the object that stands for it, how it is drawn (shape, at least two parts, which `data` key labels it), what it does on the spoken word (travels, changes, counts, splits, falls, fills), and the scene. Rules: every noun in a script line has its own row and its own object. No object is the main drawing in more than 2 scenes. The stock robot (`KIT.robot`) appears in at most 2 scenes. Each scene has one mechanism event on the line's key verb: something moves from A to B, changes state, splits, fills or is replaced. A shape with no label and no job is not allowed. Before you write this table, open the reference scenes in `picture.md#reference-scenes` and match their detail, not their objects.

In item 9 (**Shot list**) add the column "drawing-plan row". The producer's script phase reads the treatment already, so no new read.

Effect: moves visual decisions to the director, who spent 150 steps on the script and none on drawing. A table is easy to fill and to audit.

### 4. Name the rich references and wire PARTS
Cause: SA root cause 2: the producer copied the shortest scenes, never opened `_deepswe-hf`, `picture.md`, or `parts/README.md`.

Edit `paper-reels/formats/picture.md`. Replace the section "One example to look at" with:

> ## Reference scenes
> Open these before you plan or build a picture. Copy their level of detail, not their objects.
> - `episodes/statelessLanguageAgents/scenes/assign.html`: a hand-off between characters, one object per idea.
> - `episodes/thinkingInertia/scenes/inertia.html`: carts on rails, a bounce, a camera dive to a number, and a receipt over a dimmed live scene (`#inertia-dim`).
> - `episodes/statelessLanguageAgents/scenes/office.html`: a stack falls away while another thing stays; receipt over a dimmed scene (`#of-dim`).
> - `episodes/_deepswe-hf/scenes/lock.html`: one metaphor scene with reveals on spoken words.
> - `hf/kit/parts/README.md`: `PARTS` drawing pieces (`card` with rows for any file, memo or record; `gauge`, `chip`, `press`, `hand`, `flag`, `peg`). Use `PARTS.card` instead of a grey-striped box.
> Reference scenes run 6 to 15 KB. A scene under 5 KB is probably thin.
>
> For `system-design`, read `paper-reels/reference/kodekloud-scion.md` instead.

In `reel-producer.md` build-phase "Read:" list add `paper-reels/formats/picture.md#reference-scenes` and the drawing-plan table of `treatment.md`; in step 1 add "Open two reference scenes before you write the first scene." The director line already says "picture.md"; its `lock.html` mention is replaced by this section.

Prerequisite code change (needs your OK): PARTS is "not wired yet" (`kit/parts/README.md`, "Wiring still needed"). Without it the producer cannot use it. Steps 1 and 2 there are two lines in `hf/lib/project.mjs`. Check by building `episodes/autoCompact` before and after and comparing snaps. If you decline, drop the PARTS bullet and keep the four scenes.

Effect: concrete code to imitate for cards, gauges and hand-offs; the direct fix for "5 of 9 scenes are a grey-lined page".

### 5. Model per spawn
Cause: SA root cause 5. Every spawn was `Model: inherit`.

Findings from the code. `agents.models.json` maps antigravity `opus` to `pro`, `sonnet` to `flash`, `haiku` to `flash_lite`, default `inherit`. Every reel agent except `cold-viewer` (`sonnet`) is `model: opus`, so `sync-agents.mjs` already writes `model: pro` into the generated producer, director, critic and validator. The config is right. The orchestrator (a Flash session) passed `inherit` on each spawn, which in the logs overrode the file. I cannot confirm from files whether Antigravity honours the file when the call says `inherit`.

Edit `.claude/skills/make-reel/SKILL.md`, after the first paragraph: "Spawn every agent with the model in its own file. Do not pass `inherit` or your own model." Claude Code passes no model today, so nothing changes there.

Cost: no config edit, only tokens on the stronger model: the producer ran about 232k tokens over both phases, critic plus validator about 61k. Pro applies to both producer phases because they share one file. A separate `reel-builder.md` would save the 66k script phase but adds a file; I would not split first.

Check first: spawn `reel-validator` with "state your model id and stop". If it says Flash, either start the Antigravity session on Pro (the orchestrator then costs more) or set `overrides` in `agents.models.json`. `cold-viewer` stays on Flash by design.

### 6. Labels come from `data`, so no blank placeholders
Cause: SA root cause 3, VD problem 4. The QA rule is right. The model dropped labels instead of binding them (hook.html comment, steps 53 to 59).

Edit `paper-reels/hf/README.md`, first rule under "Writing a scene". Replace with:

> - All copy comes from the storyboard through `data-bind` or `KIT.data(id)`. QA fails a scene that types words or digits into its HTML. When a drawing needs a label (a file name, a tab, a lens), add a key for it to that line's `data` in `storyboard.json` and bind it. The build phase may add `data` keys; `say` and `text` stay fixed. Never delete a label to pass QA and never leave a blank box standing for a named thing. Keys that start with `_` are for drawing only and are never printed.

Edit `reel-producer.md`, script phase, step 2: after "write `storyboard.json`" add "with a `data` key for every label the treatment's drawing plan names". Then the script exists with labels in place before the build.

Effect: removes the reason for placeholders. No QA code change.

### 7. Receipts
Cause: VD problem 3 (black frame, 50 px strip, 5 s hold, clipped crop).

Edit `hf/README.md`, "Paper receipts", add: "Keep the live scene behind the receipt, dimmed to about 0.4 and never opacity 0 (see `#of-dim` in `office.html`). Show 2 to 3 lines for about 2 s. Both crop edges stay inside the frame and start on a whole word. In `evidence.json` start `find` at the sentence start, not mid-phrase."

### 8. Validator looks at scenes, not the sheet
Edit `.claude/agents/reel-validator.md`, step 2. Append: "Also decode one mid-scene frame per scene from the MP4 and read it at full size. A defect is: text cut at a frame edge, a receipt shown on a black frame, a blank or striped box standing for a named thing, or a scene whose first second is empty. Any defect is FAIL."

### 9. Deterministic visual gate
Section 2.

## 2. The visual gate

New file `paper-reels/bin/visual-gate.mjs`, export `visualChecks({ video, epDir, sb, sceneStarts })` returning `{ ok, msg, detail }[]`. In `validate.mjs`, after the engagement block: `for (const c of await visualChecks({ video, epDir, sb, sceneStarts })) check(c.ok, c.msg, c.detail);`. `sceneStarts` is the running sum of `lineDur` over `sb.lines` grouped by `line.scene` (validate already computes `lineDur`). It also runs standalone on `<epDir>/out/hf/final.mp4`, so it works on episodes without a DB row.

Frame pass: one ffmpeg call, `fps=2,scale=270:480 -pix_fmt gray` (about 20 MB for 80 s). An active cell is a 16 px cell whose pixel spread is above 24, which ignores the flat field, vignette and grain. Coverage is the active fraction of the content band (y 160 to 1450, x under 940). All frame thresholds are guesses to calibrate on real episodes; run them warn-only until then.

| Check | Measure | Threshold | False-positive risk | Cost |
|---|---|---|---|---|
| A. Sprite reuse | Count scenes in `scenes/*.html` that call each helper (`KIT.robot`, `PARTS.x`, `KIT.tree`) or share non-generic class tokens | Fail: a helper in more than 2 scenes (robot: 4 here) | Low. Allow a declared exception in the storyboard | Cheap, regex |
| B. Motion variety | Per scene, distinct kinds of `KIT.*` verbs and raw tween props (`x`, `y`, `rotation`, `strokeDashoffset`); camera tweens that only change `scale` within 1.0 to 1.1 | Fail: scene with under 4 kinds; more than half the scenes scale-only with no pan, `focus` or layout change | Medium: padding games it. Calibrate the 4 | Cheap |
| C. Blank opening | Coverage from scene start +0.4 s to +1.4 s | Fail: under 8 percent for over 1.0 s (hook excluded) | Low to medium: deliberate empty beat | Cheap |
| D. Empty area | Mean coverage per scene; largest empty rectangle | Fail: mean under 20 percent, or empty rectangle over 60 percent of band, for over 3 s | Medium: one big number has few cells, so use dilated ink area | Medium |
| E. Receipt window | Runs of frames where ink sits in one strip under 15 percent of band height | Fail: run over 2.5 s, or mean luminance outside the strip under 12 (live scene gone) | Medium: a dimmed scene at 0.4 must stay above the limit | Medium |
| F. Crop clipped | Ink in the outer 6 px columns of receipt frames. Optional: `pdftotext -bbox-layout` (poppler not checked) against the crop box | Fail: ink on an edge column in more than 3 frames | Low (edge test) | Cheap; word test medium |
| G. Text size, overflow | Ink in the outer 8 px columns of content frames; DOM pass: computed `font-size` and bounding boxes in the built project | Fail: non-caption text under 30 px, or a box outside x 0 to 1080 | Low (edge); `hf check` already warns on overflow, so first make validate fail on it | Edge cheap; DOM medium |
| H. Look log | `scenes/_look.md` has a line per scene | Fail if missing | None; filler possible | Trivial |

Build first (half a day): A, B, H, then C and the edge parts of F and G. D and E need calibration. The pdf-word test and the DOM font test come last.

## 3. Test plan

1. Calibrate. Run the standalone gate on `statelessLanguageAgents`, `thinkingInertia`, `dreamRSI`, `contextEvo` and `harnessSquared`, and print per-scene coverage, kinds, helpers and receipt run length. Keep a threshold only if the references pass with margin and harnessSquared fails at least A, C and E. Otherwise move or drop the check.
2. Replay the critic on the existing harnessSquared frames (expect FAIL, Visual interest at most 5) and on `thinkingInertia` (expect PASS).
3. Probe the model: one "state your model id" spawn per agent type in Antigravity.
4. Re-run Antigravity on a new short paper with changes 1 to 8. Compare with the harnessSquared baseline on gate results, critic visual score, scenes with a second snap, helpers per scene, receipt run length, time and tokens. Run once all-Flash and once with Pro for producer, validator and critic.
5. Claude regression: one `/make-reel` with the new prompts. Pass if no new gate failures, no extra critic round and tokens within about 15 percent of the last Claude run.

## 4. Risks and what I would not change

Risks:
- Prompt length grows by about 450 words across four agents. If it feels heavy, move the look loop to `hf/README.md` and cite it.
- Gaming: padded calls, filler in `_look.md`, fake `data` keys. The gate is a floor; do not raise thresholds to cover taste.
- PARTS wiring and `snap --scenes` are additive edits to the shared renderer. Rebuild a Claude episode and compare before trusting them.
- If Antigravity ignores the file model even when the spawn omits it, the prompts will not fully close the gap (SA root cause 6 stays partly open).

Not changing: the cold-viewer and its Flash model (weak by design, and it improved the script); the no-typed-copy QA rule; the engagement gate (it catches dead video, B and the critic cap cover meaning); the director's script work; STE settings, voices and format limits.
