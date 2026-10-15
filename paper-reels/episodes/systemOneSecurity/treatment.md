# Treatment: System One models for agent security (arXiv 2609.33401 v1)

Paper: "Evaluating System One Models for Agent Security Decisions: Reliability, Calibration, and Selective Automation", Yixuan Liu (TraceStone and Nanyang Technological University). arXiv 2609.33401v1 [cs.CR], 27 Sep 2026, 27 pages. I read the full text from `llm-wiki/raw/assets/2609.33401/paper-v1-text.txt` (extracted with pdfium from `paper-v1.pdf`, both downloaded for this treatment). Page numbers below are PDF pages.

Renderer: HyperFrames. Folder: `paper-reels/episodes/systemOneSecurity/`. Voice: `aiden` at 1.12, the same as the last three episodes. Size: 14 lines, 202 spoken words, 7 scenes. Length: about 77 s, estimated at 3.2 spoken words a second plus 0.75 s of lead and tail per line (Agent Plasticity measured about 3.3). If the measured cut runs over 80 s, cut the second sentence of l10 first.

What the channel already covered (`llm-wiki/wiki/topics/`): self-improvement, context management, skill retrieval, coding benchmarks, Claude Code. Agent security and calibration are new. Pictures already used: a pin-tumbler lock, trees, dream bubbles, a notebook, a slope. This video uses a sorting rail, a jar of marbles, a bucket and a second inspector.

One model and one task carry the whole story: Jev on WAInjectBench (prompt injection). Every number and every beat from l05 to l12 is that pair, so a viewer never has to switch datasets. The other tasks appear only as tags in l02.

## 1. The one idea

A security judge's confident misses hide inside good average calibration and no threshold can separate them, so a strict miss limit leaves it almost nothing to decide automatically.

The chain the video follows (each step causes the next):

1. A policy turns the judge's unsafe probability into allow, block or escalate (Fig. 3, eq. 1).
2. Average calibration looks fine, but one attack group, the attacks with no direct instruction, gets near-zero unsafe probabilities (sec 5.2).
3. Many of those misses share the lowest possible probability with benign inputs, so no allow threshold can split them (sec 6.5).
4. Escalation cannot help, because confidently allowed attacks never reach the second judge (sec 6.6).
5. Under a 1% miss limit the allow threshold must stay at zero. Jev's policy allows nothing, and every automatic decision is a block (sec 6.3, 6.4, Table 20).

## 2. Hook options

| # | Spoken line (STE, 12 words max) | On screen from 0.0 to 1.0 s |
|---|---|---|
| A | "Your agent's security judge says safe. When can you trust it?" (11 words) | Frame 0 already shows big type `IT SAYS SAFE.` (white) and `WHEN CAN YOU TRUST IT?` (amber) above a conveyor. An input card sits under a stamp arm. By 0.8 s the arm drops and `SAFE` lands on the card. |
| B | "A security judge can be calibrated on average and still confidently wrong." (12 words) | Big type `CALIBRATED ON AVERAGE. CONFIDENTLY WRONG.` over a jar whose label and contents disagree. |
| C | "Under a strict miss limit, these security judges allowed almost nothing." (11 words) | Big type `STRICT LIMIT. ALMOST NOTHING ALLOWED.` over an allow gate with a padlock and a review tray that overflows. |

**Pick A.**

- **It is the paper's own central question, in plain words.** Sec 1 asks: "How reliably can System One models make agent security decisions, and when can their probabilities support useful automation?" A states that question as stakes for the viewer ("your agent"). The user wants reels to open on the central question, not on an anecdote.
- **"Safe" is the hinge of the whole video.** Every act returns to the judge's `safe` label: the jar shows a `safe` lid over attacks, the bucket holds tied `safe` decisions, and the last scene sends every `safe` past a closed allow gate into review. So the hook pays off at l12 and the loop closes on the same word.
- **Why not B:** it is the thesis, but it stays abstract until the viewer knows what calibration is. It becomes the first receipt (l04), where the paper says it.
- **Why not C:** it is the payoff. Opening with it spends the answer before the viewer knows why the gate is locked.

**Truth check for A.** The hook is a question. The paper's answer is the abstract, finding 1 ("attacks that models confidently classify as safe") and finding 2 ("Under strict limits on missed attacks, the evaluated policies allow few inputs automatically"). The first frame shows a card stamped `SAFE` with no claim on it. The hidden hook mark in that card appears only at 3.3 s, on "trust". It shows an attack labelled safe, which the paper reports (sec 4.2, sec 5.2).

**First-frame rules.**

- The big type is at full opacity at 0.0 s. It may settle in scale from 1.12 to 1.0 over 0.0 to 0.25 s. No entrance from opacity 0.
- `thumb_hook`: "It says safe. When can you trust it?" The same words appear in the first frame.
- The paper's name never appears in the first 2 s. "System One" is first spoken at l02 (about 5 s) as a small tag, never the largest text.

## 3. Visual metaphors (one per idea)

**Idea 1, the policy: a sorting rail with three exits.**

- **Picture.** A horizontal rail, its left end marked `safe`, its right end marked `unsafe` (words only, no digits). Two threshold pins stand on it. Input cards drop onto the rail at their unsafe probability and fall through one of three exits: an open gate on the left (`allow`), a tray with a desk bell in the middle (`escalate`), a wall on the right (`block`).
- **What a stranger reads.** "Low ones go in, high ones stop, the middle waits for a person."
- **Scenes.** Carried by `policy` (l03). The same rail returns in `tie`, `judge` and `limit`, so the viewer learns it once.
- **Limits.** The pin positions are schematic. No threshold value is printed (the 10.5% and 89.5% of Fig. 3 are cut).

**Idea 2, calibration: a jar with a label.**

- **Picture.** A glass jar of marbles with a paper label. The label states the predicted share of attacks. The marbles show the real share: attack marbles are amber, benign marbles are pale. When label and marbles agree, a neutral `match` tag pops. In l05 and l06 they disagree.
- **What a stranger reads.** "The label says almost none. Look inside."
- **Scene.** Carried by `jar` (l04 to l07).
- **Limits.** The jar holds 100 marbles drawn from the storyboard value (`_observed: 9.14`, so 9 amber). The count of marbles is never printed. Amber is a kind (attack), not a judgment, and there are no green or red data marks. The intro jar in l04 (the `match` example) carries no numbers and is tagged `example`.

**Idea 3, ties: one bucket at the bottom of the rail.**

- **Picture.** At the far left of the rail sits one bucket, labelled `lowest possible unsafe probability`. Many identical pale cards fill it, and a few have an amber core (missed attacks). When the allow pin moves right by a hair, the whole bucket tips through the gate, amber cores included. When it moves back, the whole bucket stays out. You cannot take half a bucket.
- **What a stranger reads.** "They all look the same to the gate."
- **Scene.** Carried by `tie` (l08, l09). In `limit` (l12) the same bucket slides past the closed allow gate into the review tray, which answers the hook: under this limit, every `safe` goes to review.
- **Limits.** The share of amber cores is drawn from `_tieMiss: 101` and `_tieAll: 1318` (about 8%) and never printed.

**Idea 4, escalation: an inspector behind the tray.**

- **Picture.** A second inspector with a magnifying glass sits behind the escalate tray. The confidently allowed amber cards travel on the allow track behind the inspector's back and never pass the glass.
- **Scene.** Carried by `judge` (l10).
- **Limits.** In the "separate test" beat the inspector re-checks a tray of those cards and stamps nearly all of them `safe` again. Draw it as 1 flipped card in 20 (`_fixed: 5`, `_confident: 129`, rounded down for the drawing). No count on screen.

**Not metaphors.** The coverage bar in l12 is a data mark (`_cov: 6.70`, `_block: 108`, `_allow: 0`), in the neutral palette (block segment amber, empty allow segment as a dashed cyan outline).

**Must-nots.**

- No crown, no green check, no red X on any model or policy.
- No "hacker" figure. The attack is a mark inside a card.
- The hidden hook mark on attack cards stands for "attack-derived text". It must not show a command or a skull, because the misses in question hold no direct instruction.
- Do not show the Fig. 3 example text (that input was escalated, not allowed).

## 4. Receipts

Three passages, spaced 20 to 25 s apart. Each one is read on camera at about 3.4x, holds for about 2 s on one phrase, then cuts back to the scene's own picture. Hold the camera still during a highlight (`follow: 0`, `fx` near 90). Start no receipt earlier than 0.1 s into its scene.

| # | Line | Page, section | Exact text in the paper | Read on camera (highlighted) | `find` fragments | `circle` | Hold (est.) |
|---|---|---|---|---|---|---|---|
| R1 | l04 | p. 1, Abstract, finding (1) | "Strong overall performance and favorable average calibration can hide systematic failures on particular attack groups, including attacks that models confidently classify as safe." | "average calibration can hide" ... "attacks that models confidently classify as safe." | `average calibration can hide`, `including attacks that models confidently classify as safe.` | `confidently` | 19.4 to 21.6 s |
| R2 | l09 | p. 21, sec 6.5 (bold run-in) | "Thresholds cannot separate correct and incorrect decisions with the same score." | the whole sentence, in two highlights | `Thresholds cannot separate correct`, `and incorrect decisions with the same score.` | `same` | 41.8 to 44.0 s |
| R3 | l10 | p. 23, sec 6.6 (last paragraph) | "Confidently allowed attacks never reach the second judge, including those it could detect." | "Confidently allowed attacks never reach the second judge," | `Confidently allowed attacks never reach the second judge,` | `never` | 45.9 to 48.2 s |

**What each hold sits between.**

- **R1.** First sentence of l04: the example jar and its `match` tag. The page rises on "Average", and the highlighter follows the voice through "confidently classify as safe". Then cut back: a `safe` lid slams onto a jar with amber marbles inside.
- **R2.** Before: the bucket fills (l08). The page rises at the start of l09, and the highlighter runs both halves. Then cut back to the bucket on "same score" as the allow pin nudges and the whole bucket tips.
- **R3.** l10 opens the `judge` scene, so the page rises at 0.1 s into the scene and the highlighter starts on "Confidently" with the voice. The inspector and the zipping cards come after the cut-back, on "separate test". If the page has to rise later, shorten the fragment to `never reach the second judge,`.

**Crop warnings for `evidence.json`.** QA requires every number readable in a crop to be in `facts.json`. Crop each receipt to its own lines, or list these numbers in `evidence_incidental`:

- R1: the abstract lines carry "(1)" and "(2)".
- R2: the same text line ends "...same score. Jev", and the next line holds "1,318" and "101", then "82.05%" and "7.65%".
- R3: the paragraph above holds "80%" and "10%" (Laya, Decider, Nimble), and Table 22 sits just above it.

## 5. Shot list

Main transition `whip`, accents `zoom` and `blur`, `cut` inside a topic. Times are estimates (0.25 s lead + voice at 3.2 words a second + 0.5 s tail). Re-time every beat from `audio/words.json`. Every beat is tied to a spoken word.

| Scene | Line | Start (s) | Spoken words | On screen / camera | Transition out |
|---|---|---|---|---|---|
| hook | l01 | 0.0 | "Your agent's security judge says safe. When can you trust it?" | 0.0: big type already up, conveyor below, one input card under a stamp arm. "judge" (0.8): the arm drops. "safe" (1.9): `SAFE` slams onto the card with a thud. 2.6: the card glides through an open gate toward a small agent robot. "trust" (3.3): an x-ray sweep crosses the card and an amber hook mark glows inside. 3.9: the question mark in the type wiggles. Slow push-in throughout. | whip |
| policy | l02 | 4.2 | "The paper tests System One models as security judges for AI agents. Each returns a decision and an unsafe probability." | "System One" (4.8): a box labelled `System One model` drops in. "security judges" (5.8): three task tags fan out from it (`prompt injection`, `interaction risk`, `harmful requests`). "agents" (6.9): a robot plugs into the box. "decision" (8.6): a chip pops out (`safe` / `unsafe`). "unsafe probability" (9.8): a gauge needle swings across a scale marked `safe` to `unsafe`. | cut |
| policy | l03 | 11.2 | "A policy maps that probability to allow, block or escalate for review." | The gauge unrolls into the rail and two pins drop (11.5). "allow" (12.9): the left zone paints, the gate opens, a card falls in. "block" (13.4): the right zone paints, a card bounces off the wall. "escalate" (13.9): the middle tray lights, a card drops in, the bell rings. "review" (14.8): a `review` tag. The camera pans left to right along the rail. | zoom (into the gauge needle) |
| jar | l04 | 15.7 | "Calibration means the probabilities match how often inputs are unsafe. Average calibration can hide attacks that models confidently classify as safe." | "Calibration" (16.0): a jar drops in with its label and an `example` tag. "match" (17.2): marbles pour in and settle level with the label line, then a `match` tag pops. "unsafe" (18.3): the amber marbles pulse. "Average" (19.4): R1 page rises, the highlighter follows the voice, a pen loop circles `confidently`. "safe" (21.8): cut back, and a `safe` lid slams onto a jar with amber marbles inside. | cut |
| jar | l05 | 23.0 | "On prompt injection, one model's lowest unsafe probabilities averaged about zero point two percent." | A new empty jar with tags `prompt injection`, `Jev`, `lowest bin` (23.3). "model's" (24.3): marbles pour in, all pale. "averaged" (25.9): an `average` tag. "zero point two" (26.6): the jar label counts up to **0.2%**. The camera pushes on the label. | cut |
| jar | l06 | 28.1 | "About nine percent of those inputs were attacks." | "nine" (28.6): 9 marbles flip amber in a ripple from the bottom, with an impact sfx. **9%** slams beside the jar, larger than the label's 0.2%. "attacks" (30.2): the camera pulls back to frame label and contents side by side. | cut |
| jar | l07 | 31.4 | "Most of them held no direct instruction. The model missed every attack of that kind." | The amber marbles lift out and become cards (31.6). "direct instruction" (32.6): one card shows a bold command line, and most show plain text with only a faint amber core. A `no direct instruction` tag lands on the plain group. "missed" (34.8): a judge eye scans the plain amber cards. "every" (35.4): each plain card gets a `safe` stamp in a fast stagger, with tick sfx. | whip |
| tie | l08 | 36.8 | "Some missed attacks shared the lowest possible unsafe probability with many benign inputs." | The rail returns (36.8). "missed attacks" (37.2): a few amber-core cards slide onto the rail. "shared" (37.9): they snap to the same height. "lowest possible" (38.5): a bucket drops at the far left end with its label and the amber cards fall into it. "benign" (40.5): pale cards stream in on top until the amber cores are buried. The camera dives toward the bucket. | cut |
| tie | l09 | 41.6 | "Thresholds cannot separate correct and incorrect decisions with the same score." | R2: page rises at 41.8, two highlights, a pen loop on `same`. "same score" (44.6): cut back to the rail. The allow pin nudges right and the whole bucket tips through the gate, amber cores and all. The pin slides back and the bucket rights itself (45.3), all of it kept out. | cut |
| judge | l10 | 45.8 | "Confidently allowed attacks never reach the second judge. And in a separate test, second judges missed nearly all of them." | R3 page rises at 45.9 (0.1 s into the scene). The highlighter follows from "Confidently" to "second judge", with a pen loop on `never` (47.0). "judge" (48.2): cut back to the rail. An inspector with a magnifying glass pops in behind the escalate tray, and amber-core cards zip along the allow track behind the inspector's back. "separate test" (49.6): a tray of the same cards slides in front of the inspector. "missed" (51.2): the glass sweeps the tray. "nearly all" (51.9): `safe` stamps land on all but one card, and that one flips amber. | whip |
| limit | l11 | 52.8 | "Now allow at most one percent of attacks. The model's policy then escalated every input." | "one percent" (53.6): a `miss limit` dial slams in with **1%**, and the allow pin slides hard left onto the bucket's edge. "policy" (55.6): both pins jump to the rail ends and the whole rail becomes escalate. "escalated every" (56.6): cards flood into the review tray, the tray overflows and the pile climbs. The camera tilts up with the pile. | cut |
| limit | l12 | 58.2 | "With separate thresholds, it decided about seven percent of inputs automatically. Every one was a block, never an allow." | "separate thresholds" (58.8): a padlock between the pins pops open and the block pin slides left alone. A coverage bar draws under the rail (59.5). "seven percent" (60.7): the bar fills to **7%** in amber, all of it block, and the count-up lands. "automatically" (61.9): a stream of cards hits the wall, with a camera shake. "block" (63.3): a `block` tag on the filled segment. "never an allow" (64.0): the camera cuts to the allow gate, which stays padlocked. The bucket of `safe` cards slides past it into the overflowing review tray from l11 (the allow threshold sits at zero, and inputs exactly at a threshold escalate, sec 6.1). A dashed empty `allow` segment pulses. | blur |
| close | l13 | 64.9 | "The tests use public text benchmarks and known attacks, not new or adaptive ones." | The rail shrinks into a frame labelled `public text benchmarks` (65.2). "known attacks" (66.6): a `known attacks` tag stamps on the frame. "new" (68.0): outside the frame, a card of a new shape fades in with a dashed outline. "adaptive" (68.8): it morphs shape twice, and an `untested` tag lands. | cut |
| close | l14 | 70.1 | "Test accuracy, calibration and the policy together, before you trust a judge that says safe." | "accuracy" (70.6), "calibration" (71.2), "policy" (71.9): three tiles slam in one after another. "together" (72.5): a clamp locks them into one block. "trust" (73.5): the hook card slides back in. "says safe" (74.4): the `SAFE` stamp lands and the hook type ghosts back. The end card rises at about 75.0: only `hemanth_with_ai`. | (end) |

**Pacing audit.** I read the table against a 3 s window, then against the 2.5 s target.

- **Gaps.** No gap between listed beats exceeds 2.2 s. The longest are the receipt holds (R1 19.4 to 21.6, R2 41.8 to 44.0, R3 45.9 to 48.2). Each carries a moving highlighter and a pen loop.
- **l08 fix.** In the first draft, "shared" moved cards that did not exist yet. The amber cards now enter on "missed attacks" (37.2) and snap on "shared" (37.9), before the bucket (38.5) and the benign stream (40.5).
- **Thin lines.** The gate counts an event only above 3.0 grey levels at 4 fps, and thin line drawings fail that. The rail pins, the gauge needle, the dashed outlines and the shape morph in l13 need a faint warm pulse (about 0.2 opacity, 0.5 s fade, `fromTo` with `immediateRender: false`) or a filled shape behind them.
- **End card.** It holds about 1.6 s and is excluded by the gate.

## 6. Numbers budget (4)

| # | On screen | Paper value | Source | Kind |
|---|---|---|---|---|
| 1 | **0.2%** | 0.205% | Sec 5.2, p. 13 | Jev's mean unsafe probability over the 1,444 WAInjectBench test inputs it scored below 0.1. An average (the line says "averaged"), absolute, measured, the author's runs, one model on one benchmark. |
| 2 | **9%** | 9.14% | Sec 5.2, p. 13 | The share of those same 1,444 inputs labelled unsafe. Absolute, measured, the same set. The line says "about". |
| 3 | **1%** | ε = 0.01 | Sec 6.2, p. 17 | The miss limit, a setting the author chose (the strictest of 1, 5 and 10%). Thresholds were picked on selection data and held fixed on test. Not a result. |
| 4 | **7%** | 6.70% | Sec 6.4, p. 19, Table 20 | Jev's automatic coverage on WAInjectBench test with separate thresholds at the 1% miss limit, original scores: 108 blocks, 0 allows. It passed both the confirmation and the test checks. Absolute share of inputs, measured. The line says "about". |

**Post-hoc labels.**

- Three results the video uses come from analyses the author added after the primary evaluation (sec 8, Construct validity):
  - "Most of them held no direct instruction" (l07) is the post-hoc no-EI analysis of sec 5.2 (Finding 4 is labelled "held-out sensitivity").
  - The separate-threshold result behind number 4 (l12) is the "sensitivity analysis performed after the primary evaluation" of sec 6.4.
  - "second judges missed nearly all of them" (l10) is the error-complementarity analysis of sec 6.6.
- The lines keep the paper's hedges ("most", "nearly all", "about"), and none of the three is called a headline finding.
- The symmetric result in l11 (Jev escalates every WAInjectBench input at 1%, Table 19, coverage 0.00%) is from the primary protocol.

**Words, not digits.**

- "every attack of that kind" (l07): sec 4.2 says Jev "misses all 129 no-EI positives".
- "nearly all of them" (l10): sec 6.6 says each judge "corrects at most five of the 129 misses that Jev makes with max(p, 1 − p) ≥ 0.95".
- "every input" (l11): Table 19 shows Jev's coverage as 0.00%.
- "Every one was a block, never an allow" (l12): Table 20 shows Allow 0 and Block 108, with τL = 0.000.

**Cut.** 1,444, 1,318, 101, 129, 5, 108, 92.2%, 8.1%, the 5% false-block limit, every F1, AUROC, ECE and Brier value, the R-Judge results (47.03%, 7.63%), the Fig. 3 thresholds and the escalated example's probabilities. The 5% block limit is real and applies to every policy. It is left off screen to keep the budget, and the l11 line does not claim it is the only limit.

**Model names.** `Jev` is a small tag in l05 only, for checkability. No model name is spoken.

## 7. The honest caveat

Placed at l13 (about 65 s), paced like the rest, with its own picture (the frame and the shape-shifting card outside it): "The tests use public text benchmarks and known attacks, not new or adaptive ones."

This is true to sec 8 (External validity): "The study covers known attack families and text inputs, leaving transfer to unseen or adaptive attacks, other languages, and multimodal settings open." The same section adds that public benchmarks "may overlap unknown training data, and their unsafe-input proportions can differ from deployed traffic".

## 8. Loop and ending

The last line ends on "before you trust a judge that says safe." The first line begins "Your agent's security judge says safe. When can you trust it?", so a replay picks up mid-thought. Visually, l14 ends with the hook card and its `SAFE` stamp, which is the hook's first frame. The end card shows only `hemanth_with_ai`.

## 9. Post text angle

**Title:** Your agent's security judge says safe. When can you trust it?

**Caption first line:** "One AI security judge put about 0.2% odds of attack on its lowest-scored inputs. About 9% were attacks. A new paper on calibration and what a strict safety limit leaves to automate. (Unofficial explainer.)"

---

## STE notes for the producer

Terms for `storyboard.json` `ste.terms` (the paper's word, then the synonyms to refuse):

- `judge` (security judge, second judge): guard, guardrail, detector, filter, screener, moderator
- `unsafe probability`: risk score, confidence score, safety score, danger score, threat score
- `escalate`: defer, hand off, flag, send up
- `policy`: rule set, decision rule, router
- `threshold`: cutoff, cut-off
- `separate thresholds`: independent thresholds, asymmetric thresholds
- `calibration`: honesty, trustworthiness
- `direct instruction`: explicit instruction, direct command, explicit command
- `benign` (the true class of an input): harmless, clean, legitimate, innocent
- `automatically`: on its own, hands-free

**Two words kept apart on purpose.** `safe` names only what the judge returns (l01, l04, l07 stamps, l14). `benign` names only the true class of an input (l08). The paper makes the same split (Fig. 3: "Original label: benign", "Prediction: safe"). Do not add `safe` to the `benign` avoid list or the other way round. Use them as written.

**`score`.** It is spoken only in l09, word for word from the paper (R2). It is not on the avoid list for `unsafe probability`, so no `allow` entry is needed. If the checker treats it as a second name anyway, add `{ "line": "l09", "rule": "terms", "why": "quotes the paper verbatim, and the receipt shows the same words" }`.

**Names and voice.** `ste.names`: `System One`, `Jev`. The voice reads "System One" as two words.

**Checked.** I ran `hf/bin/ste.mjs` on a scratch storyboard with this script, these terms and these names. Result: 0 hard and 2 soft findings, in 14 lines and 202 words. Both soft findings are possible noun clusters, left as they are: l05 ("model's lowest unsafe probabilities averaged") and l10 ("Confidently allowed attacks never reach", a verbatim quote that receipt R3 shows). No `allow` entries are needed.

**Spoken numbers:** "zero point two percent", "nine percent", "one percent", "about seven percent". Captions use digits: `0.2%`, `9%`, `1%`, `7%`.

**Drawing-only data keys (never printed):**

- jar (l05, l06): `_predicted: 0.205`, `_observed: 9.14`
- bucket (l08): `_tieAll: 1318`, `_tieMiss: 101`
- inspector tray (l10): `_confident: 129`, `_fixed: 5`
- coverage bar (l12): `_cov: 6.70`, `_block: 108`, `_allow: 0`

Each one comes from the section listed in the numbers budget. Draw proportions from these values, never from literals.

**Script, in order (the `text` field; `say` spells out the numbers):**

1. l01 Your agent's security judge says safe. When can you trust it?
2. l02 The paper tests System One models as security judges for AI agents. Each returns a decision and an unsafe probability.
3. l03 A policy maps that probability to allow, block or escalate for review.
4. l04 Calibration means the probabilities match how often inputs are unsafe. Average calibration can hide attacks that models confidently classify as safe.
5. l05 On prompt injection, one model's lowest unsafe probabilities averaged about 0.2%.
6. l06 About 9% of those inputs were attacks.
7. l07 Most of them held no direct instruction. The model missed every attack of that kind.
8. l08 Some missed attacks shared the lowest possible unsafe probability with many benign inputs.
9. l09 Thresholds cannot separate correct and incorrect decisions with the same score.
10. l10 Confidently allowed attacks never reach the second judge. And in a separate test, second judges missed nearly all of them.
11. l11 Now allow at most 1% of attacks. The model's policy then escalated every input.
12. l12 With separate thresholds, it decided about 7% of inputs automatically. Every one was a block, never an allow.
13. l13 The tests use public text benchmarks and known attacks, not new or adaptive ones.
14. l14 Test accuracy, calibration and the policy together, before you trust a judge that says safe.

**Claim checks behind lines that are easy to overstate:**

- **l05/l06.** One model (Jev), one benchmark, one probability bin. Not "judges think attacks are safe".
- **l07.** "Most" because the paper says the gap is "largely due to" no-EI attacks. Removing them brings observed and predicted to 0.228% and 0.176%. This is a post-hoc analysis.
- **l10.** "nearly all" because each judge corrects at most 5 of the 129 confident misses (sec 6.6, p. 22).
- **l11.** Table 19, symmetric policy, Jev, WAInjectBench: 0.00% coverage. Four of the six primary policies did the same, but the line speaks only about this model.
- **l12.** Table 20 and p. 19: "its coverage rises from zero to 6.70%, entirely through 108 blocks." This is a sensitivity analysis. Sec 6.5 links it to the tie group: "Any positive allowance threshold admits the entire zero-score group, including its missed attacks."
