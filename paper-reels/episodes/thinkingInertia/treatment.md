# Treatment: Thinking Inertia (arXiv 2610.11765 v1)

Paper: "Thinking Inertia: LLMs Keep Thinking When Told Not To", Dianqiao Lei, Kevin Qinghong Lin, Pan Lu, Philip Torr, James Zou (Tsinghua, Oxford, Stanford). arXiv 2610.11765v1, 8 Oct 2026, 37 pages. v1 is the only version on arXiv as of 2026-10-15 (checked on the abstract page). It is a preprint, not peer reviewed.

**What I read**
- **Main text.** Pages 1 to 16 in full, including the p. 13 full-page example and sec 5.1 (Scope and Limitations).
- **Appendix.** B to I read in full, for the per-model tables behind every number below (B.2, D.3, G.2, H.1, H.2, I.5).
- **Source files.** `llm-wiki/raw/assets/2610.11765/paper-v1.pdf` and `abs.html` were downloaded for this treatment. `paper-v1-text.txt` was extracted with pypdfium2, one `===== PAGE n =====` marker per page.

**Renderer and size**
- Renderer: HyperFrames, blueprint look. Folder: `paper-reels/episodes/thinkingInertia/`. Voice: `aiden` at 1.12.
- Size: 15 lines, about 205 spoken words, 7 scenes.
- Length: about 77 s, estimated at 0.32 s a spoken word plus 0.75 s of lead and tail per line. Agent Plasticity read about 7 s faster than its estimate, so expect about 71 s. Re-time every beat from `audio/words.json`.

**What the channel already covered**
- Agent memory and context, self-improvement, coding benchmarks, security (`llm-wiki/wiki/topics/`).
- Thinking Before Thinking (2609.38147) is about how an agent spends its calls. This paper is the opposite question: whether a model stops writing steps when you ask it to. No overlap in claims.
- Pictures already used: trees, dream bubbles, desks, notebooks, curves, a railway. This one uses brake carts, a seesaw, and cards on a table.

## 1. The one idea

With thinking mode off, models still write explicit steps on open-ended math, even most replies under a strict "no reasoning" prompt, and less so when the answer choices are already on the page.

The mechanism, for the producer:
- The paper splits each reply into **pre-answer text** and the **final answer**.
- A blinded judge model labels the pre-answer text. The label that counts is **explicit inference**: deduction, computation, comparison, elimination, and so on (Table 1, p. 6).
- Six models and six benchmarks, grouped in three **answer spaces**:
  - yes-or-no: BoolQ, StrategyQA
  - multiple choice: MMLU, MMLU-Pro
  - open-ended: GSM8K, MATH. Both are math, so "open-ended" in this video always means math.
- Six modes. Only three are in the video:
  - M2 THINK-OFF: the thinking mode is disabled, with no prompt change.
  - M5 STRICT: thinking mode disabled, plus "Give the final answer directly without any reasoning."
  - The p. 13 rewrite example, which runs under M5.

## 2. Hook options

| # | Spoken line (STE, 12 words max) | On screen from 0.0 to 1.0 s |
|---|---|---|
| A | "If you tell AI models not to think, do they stop?" (11 words) | Frame 0 already shows big type: `TOLD NOT TO THINK.` in white and `DO THEY STOP?` in amber. Under it, a chat bubble holds the question `Find the area of the rectangle.` (the p. 13 wording, no digits) and the strict prompt `Give the final answer directly without any reasoning.` and a toggle reads `thinking mode`. By 1.0 s the toggle snaps to OFF (click sound) and a reply bubble opens below. |
| B | "Thinking mode off. On math, models still write the steps." (10 words) | Big type `THINKING MODE: OFF.` / `THE STEPS STAY.` over a reply bubble that already fills with lines of math. |
| C | "Answer only, please. Most math replies still showed their steps." (10 words) | Big type `"ANSWER ONLY."` / `THE STEPS STAYED.` over a chat with the strict prompt and a reply that keeps typing. |

**Pick A.**
- **It is the paper's central question, in plain words.** This follows the 2026-10-11 rule: open on the central question, not on an example. It is also the paper's title as a question ("LLMs Keep Thinking When Told Not To").
- **It has stakes and a visible answer.** The toggle flips at 1.0 s and the reply bubble starts filling with lines, so the eye gets the answer before the ear does.
- **It loops.** The close ("So ask for the answer only. Then read what comes before it.") hands straight back to "If you tell AI models not to think...".
- **Why not B.** It is the strongest claim, but it describes M2 (switch off, no prompt). It is true per model (H.1, H.2: 99.5 to 99.9% on open-ended). B is kept as the substance of l05.
- **Why not C.** "Most" rests on the pooled 62% (M5), which does not hold per model: GPT-5.4 complies almost fully under M5 (G.2, ETR 100 and 99.8 on GSM8K and MATH). Too easy to read as "every model".

**Truth check for A.**
- A question asserts nothing, so it can carry the "told not to" framing.
- **Do not add "almost always" next to "told".** About 100% explicit inference belongs to the switch-off condition (M2). The told condition (M5) is 62% pooled.
- l05 and l08 keep the two conditions apart: l05 is "thinking mode off", l07 and l08 are "strict prompt".

**First-frame rules.**
- The big type is at full opacity at 0.0 s. It may settle in scale from 1.1 to 1.0 over 0.0 to 0.25 s. No entrance from opacity 0.
- `thumb_hook` is "Told not to think. Do they stop?", the same words as the big type.
- The paper's name ("Thinking Inertia") is first spoken at l06, about 26 s in. It is never the largest text in the first 2 s.

## 3. Visual metaphors (one per idea)

**Idea 1, thinking inertia: three carts and one brake.**
- **Picture.** Three blueprint carts on three parallel tracks, tagged `yes-or-no`, `multiple choice` and `open-ended`. One lever, tagged `thinking mode: OFF`, pulls the brake on all three at once.
  - The yes-or-no cart stops almost at once.
  - The multiple-choice cart rolls further.
  - The open-ended cart keeps rolling. It drops small paper slips behind it, each with one short line on it.
- **What a stranger reads.** "Brakes on, but some carts keep going, and the third goes furthest." The paper's own word is inertia.
- **Scene.** `inertia` (l04 to l06).
- **Limits.**
  - The roll lengths show only the order Bool < MCQ < Open, which the paper states (sec 3.2). They carry no values.
  - The slips are short single lines, not long scrolls. One explicit inference can be one equation (Fig 2, case 3).
  - The cart says nothing about what happens inside the model.

**Idea 2, the trade-off: a seesaw.**
- **Picture.** A plank on a pivot. Left seat `answer only`, right seat `accuracy`. The pivot base is tagged `open-ended math`. When the strict prompt lands, the left seat rises and the right seat dips a little.
- **What a stranger reads.** "Push one side up, the other comes down."
- **Scene.** `strict` (l09, l10).
- **Limits.**
  - The tilt is small and schematic. The base tag keeps it to open-ended tasks; the paper reports little accuracy change on yes-or-no and multiple choice (sec 3.3).
  - No red or green on the seats.

**Idea 3, answer space: cards on the table versus a blank page.**
- **Picture.** One question card (a rectangle with its diagonal, the words `find the area`) splits into three:
  - a card with `proposed answer` and two buttons, `yes` and `no`;
  - a card with four option tiles, `A B C D`;
  - a blank page with a pencil.
- On the two cards, a robot hand taps one button or tile, and an `answer only` stamp lands. On the blank page, the pencil fills the page with lines.
- **What a stranger reads.** "If the answer is on the table, it points. If not, it works it out."
- **Scene.** `forms` (l11 to l13).
- **Limits.**
  - This is the p. 13 example: one item, one model (Qwen3-32B), under the strict prompt. The tag says so.
  - The general claim comes only from the l13 receipt.
  - The rectangle is drawn with letters (`w`, `2w`) or no labels, so no digits appear.

**Must-nots.**
- No line, picture or caption says the model "keeps thinking inside" or that answer-only saves compute (sec 5.1, sec 5.2).
- No crown, no green check of approval on a model.
- No "every model" anywhere.

## 4. Receipts

Four text passages. All are confirmed in `paper-v1-text.txt` with an exact `grep -F` match, and each sits on one line of the PDF. Each is read on camera at about 3.4x, holds about 2 s on one phrase, and the scene's own picture returns while the line finishes. Use `follow: 0` and left-align the start of each highlight.

| # | Line | Page, section | Exact text in the paper | Highlight (`find`) | `circle` |
|---|---|---|---|---|---|
| R1 | l06 | p. 9, sec 3.2 (italic summary) | "We use “thinking inertia” to describe how visible explicit inference persists under no-thinking controls and becomes more common as the answer space opens." | `visible explicit inference persists under no-thinking controls` | `persists` |
| R2 | l10 | p. 11, sec 3.3 (bold run-in) | "On open-ended tasks, no-thinking comes at a cost." | `On open-ended tasks, no-thinking comes at a cost.` | `cost` |
| R3 | l13 | p. 12, sec 3.5 (italic summary) | "Even for the same question, the answer space shapes whether an LLM answers directly." | `Even for the same question, the answer space shapes whether` | `answer space` |
| R4 | l14 | p. 15, sec 5.1 | "Our claims therefore concern visible output, not the absence of task-relevant computation from hidden states" | `Our claims therefore concern visible output` | `visible` |

**Crop notes for the producer.**
- **Keep the crops tight.** Above R2 on p. 11 is the paragraph with 99.69%, 62.00%, 5.15%, 0.12%, 45.57% and 25.39%. The R1 block on p. 9 sits near M1, M2 and M3 labels and a "six-model" mention. QA requires every number readable in a crop to be in `facts.json`, so crop to the one sentence, or list the neighbours under `evidence_incidental`.
- **R3 says "an LLM"; the narration says "a model".** The highlight stops before that word, so the voice and the marker agree.
- **R4.** The narration says "the claims concern visible output". The highlight covers "Our claims therefore concern visible output".

**What each hold sits between.**
- **R1.** Before: the open-ended cart still rolls and the 99.7% tag sits on its slips. After: the page drops away and a `THINKING INERTIA` stamp lands on the cart.
- **R2.** Before: the seesaw tips. After: a price tag swings onto the seesaw base on "cost".
- **R3.** Before: the three forms with their stamps. After: the camera pulls back, so the two cards sit on one side and the full page on the other.
- **R4.** Before: a robot head drawn as an opaque box, with a reply sheet sliding out of its mouth slot. After: the magnifier stays on the sheet, and a small `?` pulses inside the box on "inside".

## 5. Shot list

Main transition `whip` (new topic). Accents: `zoom` into the reply, `punch` on the payoff, `blur` into the limit. `cut` inside a topic. Start times are estimates; replace them with `words.json` times.

| Scene | Line | Start (s) | Spoken words (`text`) | On screen / camera | Out |
|---|---|---|---|---|---|
| hook | l01 | 0.0 | "If you tell AI models not to think, do they stop?" | 0.0: big type already on screen. The chat bubble shows `Find the area of the rectangle.`, the strict prompt and the `thinking mode` toggle, so the reply that follows is a math reply. "tell": the prompt line underlines in amber. "think": the toggle snaps OFF with a click and a `stamp` sound. "stop": the reply bubble opens and short lines start to type into it, one per beat, past the bubble edge. Slow push toward the reply. | zoom |
| setup | l02 | 4.3 | "The paper disabled thinking mode in six models and ran six benchmarks." | The zoom lands on a row of six robot heads, each with a toggle. "disabled": the toggles flip OFF in a ripple, left to right; the sixth reads `minimal`. Small name tags: Qwen3-4B, Qwen3-32B, Qwen3-235B, DeepSeek-V4-Flash, GPT-5.4, Gemini-3-Flash. "six benchmarks": six cards drop in three pairs under group tags `yes-or-no`, `multiple choice`, `open-ended (math)`, each card with its name. Camera tilts down to the cards. | cut |
| setup | l03 | 8.9 | "A judge model checked the pre-answer text for explicit inference: a step from question to answer." | One reply slides in. A dashed line splits it into `pre-answer text` (top) and `final answer` (a boxed slot). "judge": a magnifier glides over the top part. A grey line `The answer is` dims with a small `not counted` tag. "step": an amber arrow draws from a `question` tag to the `final answer` slot, through one highlighted line. "explicit inference" tag pops. Camera follows the arrow. | whip |
| inertia | l04 | 14.8 | "On average, yes-or-no questions rarely had it. Multiple choice had it in almost half." | Three carts on three tracks. The lever `thinking mode: OFF` slams at line start and the brakes spark on all three. "rarely": cart 1 stops after a short skid. "almost half": cart 2 rolls on and stops mid-track. A small `pooled, six models` tag. Camera pans right with cart 3, which keeps going. | cut |
| inertia | l05 | 20.7 | "On open-ended math, it appeared in 99.7% of replies." | Cart 3 keeps rolling and drops paper slips with one short line each. "ninety": **99.7%** slams above the slip trail (impact) and the camera shakes once. "replies": the slips stack into a pile. A small `thinking mode off` tag and a `Gemini: minimal` footnote tag. | cut |
| inertia | l06 | 25.6 | "The paper calls this thinking inertia. Visible explicit inference persists under no-thinking controls." | "thinking inertia": the title types on in kinetic type over the cart. "Visible": R1 rises, the camera dives, the highlighter follows "visible explicit inference persists under no-thinking controls" for about 2 s, and the pen loops `persists`. The page drops; a `THINKING INERTIA` stamp hits the cart. | whip |
| strict | l07 | 30.5 | "Then the authors added a strict prompt: give the final answer directly without any reasoning." | The chat bubble returns, centred and large. "strict": a `STRICT` tag stamps on it. "give": the prompt types on word by word, synced to the voice. "reasoning": the last word underlines twice. The toggle stays OFF in the corner. | cut |
| strict | l08 | 36.1 | "Explicit inference fell to 62% on open-ended math. That is still most replies." | The 99.7% from l05 slides in small at left. "fell": an arrow sweeps to the right and **62%** counts down from 99.7 into place (`tick` sounds). "most": a half-line marker draws on a bar, and the 62% fill passes it. Tags: `pooled over all replies` and `varies by model`. | cut |
| strict | l09 | 41.6 | "Accuracy fell too. On average, it dropped about 15 percentage points across five models." | The seesaw draws in (base tag `open-ended math`). "Accuracy": the right seat label pulses. "dropped": the left seat `answer only` rises and the right seat `accuracy` dips (thud). "fifteen": a **−15 pts** tag pops on the right seat. "average": tags `average of five models` and `varies by model` pop. Camera eases in on the dipped seat. | cut |
| strict | l10 | 46.8 | "On open-ended tasks, no-thinking comes at a cost." | "On": R2 rises and the highlighter runs the whole sentence; the pen loops `cost` (about 2 s). "cost": the page drops and a price tag swings onto the seesaw base. | whip |
| forms | l11 | 50.1 | "One example put the same question in three forms, under the strict prompt." | A question card with a drawn rectangle and its diagonal (`find the area`). "same question": the card flips to face the camera. "three forms": it splits into the yes/no card, the A B C D card and a blank page, which fan out. "strict": a small `STRICT` tag clips to each. Tag: `one example: Qwen3-32B, p. 13`. | cut |
| forms | l12 | 55.0 | "The yes-or-no and multiple-choice forms got the answer only. The open-ended form got the full solution." | "yes-or-no": a robot hand taps `yes` and an `answer only` stamp lands (pop). "multiple-choice": the hand taps tile `C` and a second `answer only` stamp lands. "open-ended": the camera slides to the blank page. "full solution": the pencil fills the page line by line, and the camera pushes in as it fills. | cut |
| forms | l13 | 61.8 | "Even for the same question, the answer space shapes whether a model answers directly." | "Even": R3 rises, the highlighter runs "Even for the same question, the answer space shapes whether" and the pen loops `answer space` (about 2 s). "model": the page drops and the camera pulls back, cards on one side, full page on the other. A tag `same question, new answer space` underlines both. R3 carries its own scope tag while it is up: `Qwen3-32B, thinking mode off, matched math items (Fig 6)`, so the general claim is not credited to the strict-prompt example. | blur |
| limit | l14 | 67.0 | "One limit: the claims concern visible output, not what happens inside the model." | A robot head drawn as a closed opaque box with a mouth slot. "limit": a `LIMIT` tag stamps. "claims": R4 rises, the highlighter runs "Our claims therefore concern visible output" (about 1.8 s). "visible": the page drops, a reply sheet slides out of the slot, and the magnifier settles on it. "inside": a small `?` pulses inside the box. The box stays shut. | cut |
| close | l15 | 71.9 | "So ask for the answer only. Then read what comes before it." | The hook's chat bubble and OFF toggle return. "answer only": a boxed final answer appears at the bottom of the reply. "read": the camera pans up from the boxed answer through the lines above it, with the magnifier tracking. "before it": the lines glow. Big type `READ WHAT COMES BEFORE IT.` settles. In the last 1.6 s the end card rises: only `hemanth_with_ai`. | (end) |

**Pacing audit (3 s windows).**
- **First event.** 0.0 s (the type settles), then the toggle at about 1.0 s.
- **Longest lines.** l12 (6.8 s) has five scheduled events, about 1.4 s apart. l03 and l04 (5.9 s) have four each.
- **Receipts.** Each 2 s hold has a camera dive, a moving highlighter and a pen loop, and the scene's own picture returns right after.
- **Thin line drawings.** Track lines, the seesaw plank and the pencil strokes are thin. Like Agent Plasticity, they may not pass the gate's 3.0 grey-level threshold. Give each emphasis word a soft warm pulse (about 0.2 opacity, 0.5 s linear), or a stamp.
- **Result.** No stretch of 3 s has nothing new.

## 6. Numbers budget (3 headline numbers)

1. **99.7%**
   - What it is: the explicit inference rate on open-ended math (GSM8K and MATH) under M2, thinking mode off with no prompt change.
   - Source: Table D.3 (99.69%, GPT-5.5 judge), sec 3.3 p. 11.
   - Kind: absolute rate, measured, the authors' runs.
   - Scope: pooled over all outputs of all six models. Per model it is 99.5 to 99.9% (H.1, H.2), so it holds for each model, not only on average. Gemini-3-Flash is at "minimal", not off (Table B.2), which is the on-screen footnote tag.
2. **62%**
   - What it is: the same rate, same tasks and judge, under M5 (thinking mode off plus the strict prompt).
   - Source: Table D.3 (62.00%), sec 3.3 p. 11.
   - Kind: absolute, measured.
   - Scope: pooled over all replies. The local Qwen3-4B and Qwen3-32B runs use full splits, so they are about 60% of the open-ended outputs.
   - Per model it varies a lot. Qwen3-4B is 97.78% and Qwen3-235B 98.90%, while Qwen3-32B is 56.73% (H.2). GPT-5.4 almost fully complies (G.2).
   - Hence the tags `pooled over all replies` and `varies by model`, and the line says "most replies", never "most models".
3. **About 15 percentage points**
   - What it is: the drop in mean accuracy on open-ended tasks from M2 to M5.
   - Source: sec 3.3 p. 11 and sec 1 p. 3.
   - Kind: relative (a change), measured, an average.
   - Scope: the five models with fully disabled thinking (Gemini excluded). It is a five-model mean, not the same population as the pooled 62%, which is why l08 and l09 say different groups out loud ("replies" and "five models").
   - Per model (G.2): GSM8K +0.1, −49.0, +0.9, −25.1, −22.7; MATH +0.5, −6.2, −1.8, −16.9, −28.5. Two models lost almost nothing.
   - The line says "on average". The video adds no cause for the spread.

**Spoken without digits.**
- "rarely" (yes-or-no, 5.15% pooled) and "almost half" (multiple choice, 45.57% pooled), from Table D.3.
- Per model these vary: on multiple choice GPT-5.4 is 5.3% and Gemini 88.9% (H.1). l04 says "On average", and the `pooled, six models` tag is on screen.
- Bar or roll lengths for these may come from `_` keys and are never printed.

**Cut.**
- The 40% answer-only rate.
- The 98.8% judge agreement.
- The 10.5 to 62.5% rewrite figures (Fig 6).
- DeepSeek-V4-Flash's 99.9%.
- The 572,688 output count.
- All MMLU domain numbers.

**Setup counts.** "Six models" and "six benchmarks" are spoken. If they appear as digits, add them to `facts.json` (sec 3.1, Table 3, p. 8).

**Example text.** The l03 example reply uses words only (`The answer is`), with no digits.

## 7. The honest caveat

**l14 (about 67 s):** "One limit: the claims concern visible output, not what happens inside the model."
- It gets its own picture (the closed box) and receipt R4, paced like the other lines.
- Source: sec 5.1, p. 15: "Our claims therefore concern visible output, not the absence of task-relevant computation from hidden states."

**Limits the video must carry somewhere (line, tag or caption):**
- Visible output only (l14). Sec 5.2 also warns that "Visible compliance should not ... be equated with lower inference cost when hidden reasoning may remain active." No line may imply that answer-only saves compute.
- "Open-ended" means two math benchmarks. Code, tool use, multi-turn, multilingual and sampled decoding are untested (sec 5.1). Spoken lines say "math" at l05 and l08; the setup tag reads `open-ended (math)`.
- Gemini-3-Flash runs at "minimal", not off (Table B.2). On-screen tags at l02 and l05.
- The 62% and the "rarely" and "almost half" rates are pooled and vary by model. The 15 points is a five-model average. Tags at l04, l08 and l09.
- The three-forms example is one item, one model, under the strict prompt (p. 13), and the line calls it "one example". The general claim in R3 rests on a different test (Fig 6: Qwen3-32B, thinking mode off, matched math items). Tags at l11 and l13.
- Explicit inference is labelled by a judge model (GPT-5.5). The paper cross-checks it with a second judge (Claude Opus 4.8) and five human annotators (sec 3.6, App. D). Caption only; no line needed.
- v1 preprint. Caption.

## 8. Loop and ending

- **Last line:** "So ask for the answer only. Then read what comes before it."
- **The loop:** the next frame on replay is the hook "If you tell AI models not to think, do they stop?" over the same chat bubble and OFF toggle. The close and the hook share the bubble, the toggle and the camera framing, so the cut back reads as one shot.
- **End card:** only `hemanth_with_ai`, rising in the last 1.6 s.

## 9. Post text angle

**Title:** Told not to think. Do AI models stop?

**Caption first line:** "With thinking mode off (minimal for one model), six models still showed explicit inference in almost every open-ended math reply. A strict 'no reasoning' prompt cut that to 62% of those replies, and average accuracy fell. (Unofficial explainer of arXiv 2610.11765.)"

For the producer, the rest of the caption should carry:
- the pooled and per-model note;
- the visible-output-only limit;
- the judge and human check;
- "preprint".

---

## Script and STE notes for the producer

The `text` field of each line (spoken `say` spells out the numbers: "ninety nine point seven percent", "sixty two percent", "fifteen percentage points"):

| Line | `text` |
|---|---|
| l01 | If you tell AI models not to think, do they stop? |
| l02 | The paper disabled thinking mode in six models and ran six benchmarks. |
| l03 | A judge model checked the pre-answer text for explicit inference: a step from question to answer. |
| l04 | On average, yes-or-no questions rarely had it. Multiple choice had it in almost half. |
| l05 | On open-ended math, it appeared in 99.7% of replies. |
| l06 | The paper calls this thinking inertia. Visible explicit inference persists under no-thinking controls. |
| l07 | Then the authors added a strict prompt: give the final answer directly without any reasoning. |
| l08 | Explicit inference fell to 62% on open-ended math. That is still most replies. |
| l09 | Accuracy fell too. On average, it dropped about 15 percentage points across five models. |
| l10 | On open-ended tasks, no-thinking comes at a cost. |
| l11 | One example put the same question in three forms, under the strict prompt. |
| l12 | The yes-or-no and multiple-choice forms got the answer only. The open-ended form got the full solution. |
| l13 | Even for the same question, the answer space shapes whether a model answers directly. |
| l14 | One limit: the claims concern visible output, not what happens inside the model. |
| l15 | So ask for the answer only. Then read what comes before it. |

**`ste.names`:** `thinking`, `no-thinking`, `Thinking Inertia`, `AI`. ("thinking" appears only inside "thinking mode", "thinking inertia" and "no-thinking".)

**`ste.terms`** (the paper's word, then the synonyms to refuse):

| Term | Avoid |
|---|---|
| `explicit inference` | visible reasoning, explicit reasoning, chain of thought, reasoning trace, reasoning steps, shows its work |
| `thinking mode` | reasoning mode, think mode, thinking switch, reasoning switch |
| `answer only` | direct answer, bare answer, just the answer, answer-only reply |
| `answer space` | answer format, question type, answer interface, question format |
| `open-ended` | free-form, open question, open form |
| `pre-answer text` | preamble, lead-in, reasoning text |
| `strict prompt` | strict instruction, strict mode, answer-only instruction |
| `judge model` | grader, checker, evaluator |
| `model` | LLM, chatbot |

**`ste.allow`:**
- l07, rule `ing` ("reasoning"): it quotes the paper's M5 prompt verbatim (Table 2, p. 7), and the screen types the same words.
- l06, l10: `no-thinking` is covered by `names`. If the checker still flags it, add an `ing` allow with the reason "paper term, receipt shows the same words".

**Checker result.** A scratch storyboard built from the table above passes `node paper-reels/hf/bin/ste.mjs`: 0 hard, 4 soft findings, 193 caption words (re-run after the l11 fix). The soft findings, left as they are:
- l03 sentence 1 has 16 words (target 15).
- l06 noun cluster: a near-quote of R1.
- l07 noun cluster: the verbatim M5 prompt.
- l09 noun cluster ("percentage points across five models"). The scope words must stay.

**No model name is spoken.** Model names appear only as small tags (l02, l11).
