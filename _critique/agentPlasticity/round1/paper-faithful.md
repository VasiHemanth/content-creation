# Paper-faithful critique, round 1: Agent Plasticity video (v1)

Paper: arXiv 2610.08902v1. Ground truth is the paper text only: main text pp. 1 to 11, Appendices B, C and G, and the NetHack and chess examples in Appendices D and E (pp. 23 to 26), which the hook and the anecdotes come from. Kit read: `v1-kit/script.md` and all 14 frame strips (`l01.png` to `l14.png`, three frames each). The answer key was written before the kit was opened: `answer-key.md` in this folder. Page numbers are PDF pages.

## Verdict: partly

Almost every sentence in the video is true to the paper, and three of them (l03, l06, l10) are the paper's own sentences. The video still does not explain the paper to a stranger. It never says what the AI plays, what the AI changes, what an "artifact" is, what "held-out" means or what the money pays for. It lists true facts. It does not connect them as cause and effect, and the opening story gets no ending.

Prediction against the answer key (a prediction, not a measurement): a first-time viewer meets the minimum answer on about five of the nine content questions (Q2, Q5, Q7, Q8, Q10). Q3, Q6 and Q9 are half met. Q4 is missed. That is below the pass rule in the key (7 of 9, including Q3).

The three worst problems:

1. The setup is never told. The video does not say that the AI plays games, reviews them, and then writes programs and notes for itself, or that some games are never reviewed. "Artifacts" and "held-out" get no plain definition, and the saved items have five names (artifacts, rule, tool, instruction, saved program).
2. The key definition is quoted, not explained. l03 gives the paper's sentence, with four unexplained words, at 10 s. The numbers 298 and 57 have no scale. The "one agent" of l08 (Luna) and of l11 (GPT-5.5) are different models, and neither is named.
3. There is no chain from cause to effect. The "why" (l08 to l11) mixes two weak points and never states a conclusion. The opening story (died while praying, wrote a rule) never gets its ending, and the last line is a question.

## 1. Line-by-line fidelity audit

Format per line: verdict in the heading, then the paper check, the problem, what a newcomer will probably infer, a fix in plain words, then jargon and picture notes. Fixes follow the style rules of section 3 and use the names of the term table there.

### l01 (0.0 to 3.9 s): fair simplification

Narration: "This agent died while it prayed. Then it wrote itself a rule."

Paper: Fig. 8 bottom (p. 10) and Fig. 12 (p. 23). Claude Opus 5.5 in NetHack, round 1: it prayed with raw keystrokes, which skip its own safety check, and the game ended with "Killed by a dust vortex, while praying". After that round it added a rule to its CLAUDE.md file: pray only through its own controller. The game character died. The AI did not.

Problem: No model name. NetHack is a small tag and is never explained, nor is why a prayer can kill. "Its own tool" is a program the AI wrote (a controller that refuses risky prayers), and the video does not say so. The story stops at the rule. The paper's ending is round 10: the same agent waits until its tool allows a prayer (8 of 94 hit points) and the prayer heals it (pp. 10, 23). The Fig. 12 caption adds that later agents still sometimes bypass the check and die, so the fix is not a clean success. This agent is none of the models named later.

A newcomer will infer: an AI learns from its mistakes by writing rules (right in spirit). Likely extras: the AI itself "died"; praying is special or religious; this is the paper's main experiment; this agent is one of the two models compared in l06 and l07.

Fix: "An AI's game character prayed at a bad time and died." If the hook stays, close it later with "At round 10, the rule worked: the prayer healed its character."

Jargon first used: agent, NetHack, "its own tool". Picture: a stick figure with a halo, a swirl and a tombstone make sense only after the text is read. "NetHack" is the only game name in the whole video.

### l02 (3.9 to 9.6 s): fair simplification

Narration: "The paper freezes the model. Each game starts fresh. Its artifacts pass to the next game."

Paper: model weights stay frozen (p. 2). Each acting episode begins in a fresh context, so history and temporary files do not carry over and only the saved tools, skills, strategies and memory do (p. 3). They change once per round, after a review of that round's training games (pp. 3, 6).

Problem: Three undefined words in three sentences (model, fresh, artifacts). The line says what stays fixed and what is passed on. It does not say who writes the artifacts, when, or from what, so the learning step is missing. "Next game" should be "next round". "Fresh" means "blank memory", which a stranger will not guess. The word "model" was never separated from "agent": the paper's agent is the model plus its saved files.

A newcomer will infer: "frozen" means stuck or switched off (the robots in the picture have closed eyes and a lock). Artifacts are things handed from game to game, content unknown.

Fix: "The model never changes, but each new round starts with its programs and notes."

Jargon: model, freezes, fresh, artifacts. Picture: two robot cards ("this game", "next game"), a lock, an empty thought bubble, an arrow that carries a sticky note labelled ARTIFACTS with nothing written on it. The closed eyes need decoding.

### l03 (9.6 to 14.1 s): accurate

Narration: "Plasticity means held-out performance gain per unit learning cost."

Paper: the narration uses the same words as the definition in Sec. 2.2 (p. 4).

Problem: This is the central definition of the video and it arrives at 10 s as one sentence with four unexplained words (held-out, performance, unit, learning cost). Nothing earlier says what is scored or what costs money. The on-screen gloss "held-out: never seen while learning" is wrong in a small way: the model plays the held-out games every round and only never reviews them (p. 4). In Go the held-out seeds are fixed across rounds and Hex uses fixed banks (p. 20), so it meets the same test games again and again.

A newcomer will infer: plasticity is some kind of performance measure. Cannot say what "unit" or "held-out" means.

Fix: "Plasticity is the test score gain for each dollar the model spends to learn."

Jargon: plasticity, held-out, performance, gain, unit, learning cost. Picture: the page strip is cut at both edges in portrait. In the middle and late frames it reads "per uin per unit" and the highlight sits out of step with the words, as if two crops were overlaid. Check the render.

### l04 (14.1 to 17.7 s): fair simplification

Narration: "In plain words: score gained per dollar."

Paper: Eq. 3 and Sec. 2.2 (pp. 4 to 5): held-out score gain divided by cumulative learning cost. The headline version stops where the fitted curve reaches 90% of its rise.

Problem: "Score" is not tied to any games, and "dollar" is not tied to anything bought. The paper counts model calls for playing the training games and for the review step, including rejected attempts (p. 4). The chart is a straight line with a triangle drawn between a middle dot and the end, so it shows a local slope and constant returns. The paper's measure is the whole gain since round 0 divided by the cost so far, and real curves level off (p. 4: plasticity falls after the plateau).

A newcomer will infer: plasticity is how much the score rises for each dollar. That is right. Cannot say what the dollars are for.

Fix: replace the line with the cost definition: "The cost is the money the model spends to play and to review."

Jargon: score, dollar. Picture: straight line, triangle labelled "score gained" and "per dollar".

### l05 (17.7 to 22.0 s): accurate

Narration: "Some agents improved. Some stayed flat. A few got worse."

Paper: abstract (p. 1) and Sec. 3.2 (p. 6): several models stay close to their starting score and a few decline.

Problem: It drops "with the same chance to learn", which is what makes the spread a finding (abstract; Sec. 3.2). No names, no numbers, no games. "Improved", "flat" and "worse" are measured against the score at round 0, and nothing says so. In the sampled frames no line goes below the start point, so "worse" is not drawn.

A newcomer will infer: some AIs are better players than others. Not: same practice, different gain.

Fix: "With the same chance to learn, some models gained a lot and some did not."

Jargon: none new. Picture: curves with no names; the axes read "held-out score" and "learning cost".

### l06 (22.0 to 27.4 s): accurate

Narration: "The agent that ultimately performs best need not be the one that improves most efficiently."

Paper: abstract (p. 1), verbatim; Sec. 3.4 and Finding 2 (pp. 7 to 8).

Problem: A quote placed before its evidence, with two undefined phrases ("performs best", "improves most efficiently"). These two kinds of "best" are the paper's main surprise, and the narration gives no names and no units. The page strip shows only fragments of two lines, so the full sentence can be read in the captions only. The sketch (labelled "sketch, not data") starts both curves at the same point. In the paper Sol starts near 0% in Hard chess and Fable 5 at 37.5% (p. 6). It labels the steep curve "faster per dollar", and "faster" reads as time while the paper's measure is per dollar. Both labels (Fable 5 "ends higher", Sol "faster per dollar") are right in direction, and they appear on screen only.

A newcomer will infer: the top finisher is not the fastest learner. Cannot say which models.

Fix: "Fable 5 ended with the best test score, but Sol had the best plasticity." (full names given earlier)

Jargon: ultimately, performs best, efficiently. Picture: page strip, a ghost of the sketch behind it, two curves that cross.

### l07 (27.4 to 34.5 s): fair simplification

Narration: "By the estimates, one model gets 298 points for each $1,000. The top scorer gets 57."

Paper: Sec. 3.4 (p. 7). GPT-5.6 Sol 298 and Claude Fable 5 57, in percentage points of held-out score per $1,000 of mean per-game learning cost, measured up to the fitted 90% point of the rise, on the combined chess, Go and Hex curve (p. 5 for the method).

Problem: "298 points" has no scale. Scores run from 0 to 100, so 298 can only be a rate, but the line says "gets ... for each $1,000" as if it were a gain. It is a fitted rate to the plateau, not a measured total, and it depends on provider prices (p. 7). "By the estimates" does not say what is estimated. "One model" and "the top scorer" are not named in the narration, and "top scorer" is not tied to l06's "performs best". In the sampled frames the dashed bar for 57 has no number on it. Frame 1 carries the tags "estimated" and "sketch, not data" together. The ratio of about 5 to 1 is real as a ratio of rates, but the paper's own point gains in Hard chess are alike (about 36 for Fable 5 and about 37 for Sol, p. 6), so it does not mean "Sol gains five times more points".

A newcomer will infer: Sol earns 298 points per $1,000 and Fable 5 earns 57, so Sol is much better value and perhaps simply the better model.

Fix: "Per dollar, Sol gained far more than Fable 5." Show 298 and 57 on screen under the label "points per $1,000: a rate, not a total".

Jargon: estimates, points, top scorer. Picture: two crossing curves, then bars.

### l08 (34.5 to 39.9 s): fair simplification

Narration: "One agent does not use its artifacts at about 98% of relevant decisions."

Paper: Sec. 3.5 (p. 8) and Fig. 4 left (p. 4). GPT-5.6 Luna takes about 98% of relevant decisions without artifact use (Hard and Easy chess pooled). A relevant decision is a move where at least one saved item applies, used or not (p. 5).

Problem: The model is unnamed. "Relevant decisions" and "artifacts" are undefined. "Does not use ... at about 98%" is easy to read as "uses at 98%". The big orange "98%" sits above a grid in which the single orange square means "used", so colour and number disagree. Nothing says this model is one of those that stayed flat, so the step from "not used" to "improved less" is only implied. The paper frames it as an association that makes low reuse a candidate bottleneck (p. 8).

A newcomer will infer: some AI mostly ignores what it saved (right), or uses it 98% of the time (inverted). Does not see why it matters.

Fix: "Luna did not use its programs and notes in 98% of moves where they applied."

Jargon: relevant decisions, artifacts. Picture: a grid of 50 squares for decisions, orange for used, an ARTIFACTS card.

### l09 (39.9 to 45.7 s): fair simplification

Narration: "Strong agents use them at almost every decision. Most of their failures happen while they use them."

Paper: Sec. 3.5 (p. 8). Fable 5, Opus 5, Opus 4.8 and Sol use artifacts at 94 to 98% of relevant chess decisions. 83 to 99% of their remaining failures happen while an artifact is in use. They fail about 0.16 times per relevant decision against 0.38 for the other models.

Problem: (1) "Strong agents" is looser than the paper. The four include Opus 4.8, which improves only modestly, and the paper's point is that high use does not explain the gap between them (p. 8). (2) The video drops that these models fail less than half as often as the rest. Without that, "most failures happen while they use them" sounds like an attack on the notes. (3) My reading, not the paper's: when use is 94 to 98%, a share of 83 to 99% is about what to expect even if use changed nothing, so the share alone says little. The paper's own claim is smaller: use does not guarantee success, and it cannot say whether the artifact or its application is weak (pp. 8, 10). (4) "Failures" are moves flagged as mistakes by an engine and a judge model, not lost games (p. 5, App. G).

A newcomer will infer: using notes does not help, or the notes cause the failures, or "failure" means losing the game.

Fix: "Even the best models still made mistakes while they used their programs and notes."

Jargon: failures. Picture: the grid fills with orange, then red X marks appear, with the labels "artifact used" and "failure".

### l10 (45.7 to 49.3 s): accurate

Narration: "Writing down an instruction is not the same as following it."

Paper: Sec. 3.5, "Concrete Examples of Persistent Learning" (p. 9), verbatim.

Problem: A proverb that comes before its example. "Instruction" is yet another name for the saved items. The order of the section is unused (l08), used (l09), unused (l10 and l11), which mixes the two weak points. In the sampled middle frame the strip reads "is nis not the same", the same doubled text as in l03.

A newcomer will infer: a general moral about AI, and waits for the example.

Fix: give the example first, or merge l10 and l11 into one line: "GPT-5.5 notes said to load its saved program first, but it read files first."

Jargon: instruction. Picture: page strip with a red circle on "following".

### l11 (49.3 to 54.6 s): fair simplification

Narration: "One agent told itself to load its saved program first. It listed files instead."

Paper: Sec. 3.5 (p. 9). In one GPT-5.5 run, the review step kept telling the agent to load its saved move-picking program at once, yet the agent began by listing and reading files.

Problem: "One agent" is GPT-5.5, a different model from the "one agent" of l08 (Luna), and a viewer will merge them. "Instead" is stronger than the paper ("still spends its first steps"). "Told itself" hides that the reminder came from the review step. The file names (README, engine.py, notes.md, src/) are invented and not marked as an illustration; the paper has no figure for this case. The paper also reports that in Hard chess GPT-5.5 used its artifacts at 96 to 100% of relevant decisions in rounds 2 to 8 and at only 32 to 50% from round 9, with its artifacts unchanged (p. 9). The video omits this.

A newcomer will infer: the model of l08 wasted its time listing files; AI does not follow its own notes.

Fix: as l10.

Jargon: saved program. Picture: a window with a sticky note and a code icon, a file list, and a red marker at engine.py that suggests what it should have loaded.

### l12 (54.6 to 60.4 s): accurate

Narration: "These numbers depend on the setup and the prices. Do not use them to rank models."

Paper: Sec. 3.4 (p. 7): the paper treats plasticity as tied to the protocol, not as a universal ranking, and says the efficiency estimates depend on provider prices and on the curve fit. Sec. 4 (pp. 10 to 11).

Problem: "The setup" and "the prices" have no antecedent. Nothing earlier says costs come from provider prices, and the setup was never described. The caution comes 20 s after the numbers and has no example. The paper has one: Sol, the best on the board games, loses score in NetHack (about 570 to 420, p. 7), and Opus 4.8 loses ground in Go but gains in Hex (p. 7).

A newcomer will infer: be careful with these numbers. Then asks why they were shown.

Fix: "These numbers fit this setup and these prices, so they do not rank models."

Jargon: setup, prices. Picture: two bars, two dials, a stamp. It reads as "turn the dials and the bars change". It does not show that the order can flip.

### l13 (60.4 to 66.3 s): accurate

Narration: "A score shows what an agent can do today. Plasticity shows how efficiently it improves."

Paper: Sec. 1 (p. 2) and Sec. 5 (p. 11).

Problem: The best summary in the video arrives at 60 s. "Efficiently" is not tied to "per dollar" in this line. The axes have no labels.

A newcomer will infer: plasticity is how good the learning is. Close enough.

Fix: "A score shows skill today; plasticity shows how much a model gains per dollar." Say it near the start as well.

Picture: a dot and an arrow.

### l14 (66.3 to 70.0 s): accurate (it makes no claim)

Narration: "What does your agent do after it fails?"

Paper: none. The question asks the viewer something the video does not answer. The paper's answer is in Sec. 3.5: some models write fixes and gain, some do not use the fixes, some use them and still fail.

Problem: A closing question where a closing answer should stand. "Your agent" is not what the paper measures. The end card repeats the two hook sentences, whose second half never got its ending.

A newcomer will infer: a reflective prompt, and no takeaway.

Fix: end on the finding or the caution (beat 11 of section 3).

Picture: the title fades and an end card shows the channel name and "unofficial explainer".

### Jargon, names and pictures across the video

Jargon used before it is explained, in order of first use (27 items): agent, NetHack, prayed, its own tool (l01); model, freezes, fresh, artifacts (l02); plasticity, held-out, performance, gain, unit, learning cost (l03); score, dollar (l04); performs best, efficiently (l06); estimates, points, top scorer (l07); relevant decisions (l08); failures (l09); instruction (l10); saved program (l11); setup, prices (l12). Some definitions exist only on screen ("held-out: never seen while learning"), and that gloss is slightly wrong.

One concept, several names:
saved items: artifacts (l02, l08, l09), rule (l01, l14), tool (l01 sticky note), instruction (l10), saved program (l11).
the player: agent (l01, l05, l06, l08, l09, l11, l14) and model (l02, l07).
the score: held-out performance and held-out score (l03), score (l04, l13), top scorer (l07), performs best (l06).
the cost: learning cost (l03), dollar (l04), $1,000 (l07), prices (l12).
a mistake: died (l01), failures (l09), fails (l14), not following (l10).

Pictures that need decoding: the sleeping, locked robots and the empty sticky note (l02); the clipped page strip with doubled text (l03, l06, l10); the straight line with a triangle (l04); curves with no names and no visible "worse" (l05); crossing curves labelled "sketch, not data" and "estimated" together (l07); the 50-square grid where orange means "used" but the number 98% is also orange (l08); the same grid with red X marks (l09); the invented file list (l11); the two dials (l12); a dot and an arrow with no axis labels (l13).

## 2. What a viewer needs and the video never says

1. What the AI does. It plays board games (chess, Go, Hex) and, in one extension, NetHack. The video names one game on a small tag and never says what is scored. Needed for Q2 and Q5.
2. The loop in order: play games, review the mistakes, write or edit programs and notes, start the next round with only those files (pp. 3, 6). The video has "artifacts pass to the next game" and nothing about who writes them, when, or from what. Needed for Q3 and Q4.
3. Two kinds of games: those the model reviews and test games it never reviews, and why (p. 4). The video offers only the on-screen gloss. Needed for Q6.
4. What an artifact is, in plain words. Needed for Q4. The paper's own plain version is on p. 9: code and notes the agent carries forward and can use again.
5. What the cost is: dollars of model calls for playing and for review, including rejected attempts, at provider prices (pp. 4, 7). The video says "per dollar" and later "prices" with no link between them. Needed for Q5 and Q10.
6. Who is who. The narration never names a model: "one model", "the top scorer", "one agent" (twice, for two different models). Needed for Q8 and Q9.
7. What "improved" means in numbers. There is no before and after. The paper has one a stranger can read: Fable 5 went from 37.5% to 73.3% on Hard chess test games (p. 6). Needed for Q7.
8. The link between the two kinds of "best" and the two numbers. l06 is the paper's sentence. l07 gives the numbers. Neither says that 298 belongs to the best plasticity and 57 to the model that ended with the best test score; only the on-screen labels do. Needed for Q8.
9. The conclusion of the "why". The video has two facts and an anecdote and never says: one weak point is not using the notes, another is using them and still failing, and the paper cannot yet tell which part of the second one is at fault (pp. 8, 10). Needed for Q9.
10. The ending of the hook: at round 10 the rule worked (p. 23). Needed for Q1 and Q12.
11. Why a viewer should care. The paper starts from agents that now learn from experience, so a test of skill today misses how they change (p. 1). The video shows this only through the hook.
12. An example of why the numbers do not rank models. The paper's own: Sol falls in NetHack (p. 7). Needed for Q10.
13. Optional: gains against stronger opponents are smaller and less consistent (abstract p. 1; pp. 6 to 7). One of the paper's three headline findings, absent from the video.

## 3. The simplest true story

Style rules used: at most 15 words per beat, simple present or past tense, active voice, no -ing form (except names), no phrasal verb, no modal verb. The beats were checked with a script for word count (whitespace split, hyphenated words and numbers count as one), -ing words, modals, a list of 46 phrasal verbs and passive forms. No beat has a hit.

### 3a. Terms: one name per concept

Coined terms (three): plasticity, test games, programs and notes. Each is defined where it first appears. Every other label is an ordinary English word in its ordinary sense (round, review, dollar, test score, mistake, use).

| Paper term | Say | Avoid |
|---|---|---|
| agent, frontier model | "model" (full name once: Claude Fable 5, GPT-5.6 Sol, GPT-5.6 Luna; then Fable 5, Sol, Luna) | agent, bot, system, LLM, lineage |
| frozen weights | "The model never changes" | frozen, fixed, weights, parameters, retrain |
| artifact (tools, skills, strategies, memory) | "programs and notes" (coined term 1) | artifact, tool, skill, rule, instruction, memory, file, saved program |
| training game | "its games" (the ones it reviews) | training game, practice game |
| reflection | "reviews" | reflect, reflection, revise, update |
| held-out game | "test games" (coined term 2) | held-out, unseen, hidden, validation |
| checkpoint | "round" | checkpoint, epoch, step, iteration |
| learning cost | "the dollars the model spends to learn" | learning cost, compute, tokens, budget |
| held-out performance gain | "test score gain" | improvement, uplift, performance gain |
| agent plasticity | "plasticity" (coined term 3): the test score gain for each dollar | learning efficiency, learning speed, learnability, "faster" |
| endpoint capability | "ended with the best test score" | endpoint, ultimate performance, final score, top scorer, ends higher |
| plasticity to saturation (P_sat) | on screen only: "points per $1,000, a rate" | P_sat, saturation, estimates |
| relevant decision | "moves where they applied" | relevant decision |
| artifact reuse | "use", "did not use" | reuse, retrieve, invoke, ignore, skip |
| identified failure | "mistake" | failure, error, blunder |
| protocol-dependent | "fit this setup and these prices" | protocol, universal, depends on |

### 3b. The beats

| # | Narration | Words | Paper | On screen, at minimum |
|---|---|---|---|---|
| 1 | Most tests show how good an AI model is now, not how well it learns. | 15 | Abstract p. 1; Sec. 1 p. 2 | One dot: "score today". |
| 2 | In this paper, an AI model plays board games, such as chess, round after round. | 15 | Sec. 3.1 pp. 5 to 6 (chess, Go, Hex; 20 rounds) | A chess board and a round counter. |
| 3 | After each round, it reviews its games and writes programs and notes for itself. | 14 | Sec. 2.1 p. 3; Sec. 3.1 p. 6 | A real example from p. 9: Fable 5 writes its own chess engine, then fixes it after named mistakes. |
| 4 | The model never changes, but each new round starts with its programs and notes. | 14 | Sec. 1 p. 2; Sec. 2.1 p. 3 | A lock on the model; the cards carried to round 2. |
| 5 | It also plays test games and never reviews them, so gains there show real progress. | 15 | Sec. 2.1 p. 4; Sec. 3.2 p. 6 | Two piles: "games it reviews", "test games: never reviewed". |
| 6 | Plasticity is the test score gain for each dollar the model spends to learn. | 14 | Sec. 2.2 p. 4 (Eq. 3); Sec. 2.1 p. 4 | Gain divided by dollars; the label "score on test games". |
| 7 | Claude Fable 5 and GPT-5.6 Sol gained a lot, but GPT-5.6 Luna did not. | 14 | Sec. 3.2 p. 6; Sec. 3.4 p. 7; Finding 1 p. 7 | Three named curves from the same start, "same chance to learn". |
| 8 | Fable 5 ended with the best test score, but Sol had the best plasticity. | 14 | Sec. 3.4 p. 7; Finding 2 p. 8; Sec. 1 p. 3 | Bars 298 and 57 named, "points per $1,000: a rate, not a total". |
| 9 | Luna did not use its programs and notes in 98% of moves where they applied. | 15 | Sec. 3.5 p. 8; Fig. 4 left p. 4 | Grid with "not used" in the colour of the number. Label: "weak point 1. A link, not proof." |
| 10 | Even the best models still made mistakes while they used their programs and notes. | 14 | Sec. 3.5 p. 8; Fig. 4 right p. 4; Finding 3 p. 9 | Grid with mistakes inside used squares. Label: "weak point 2. The paper cannot say if the program or its use is weak." |
| 11 | These numbers fit this setup and these prices, so they do not rank models. | 14 | Sec. 3.4 p. 7; Sec. 4 pp. 10 to 11 | Dials, and a label: Sol gained in board games but lost score in another game (p. 7). |

Total 158 words, about 62 s at the v1 pace (2.56 words per second), which leaves room for one opening line and pauses. Tense: present in 1 to 6 and 11 (method and caution), past in 7 to 10 (results).

Notes on how the beats meet the brief:
Definitions at first use: "test games" in beat 5 (defined by what the model does not do with them and by why); "plasticity" in beat 6; "programs and notes" in beat 3 by its plain meaning plus "for itself" and beat 4 ("starts with"); "round" in beat 2 by "round after round" and beat 3.
The sequence answers Q3 (beats 3 and 4), Q4 (3 and 4, with the p. 9 example on screen), Q5 (6), Q6 (5), Q7 (7), Q8 (8), Q9 (9 and 10), Q10 (11).
The story is one loop told in order (play, review, write, start again), then the measure, then the cast (one model that ended with the best test score, one with the best plasticity, one that did not gain), then the two weak points, then the caution.

Left out on purpose: the NetHack hook (use it only with its ending, see section 4), gains against stronger opponents (p. 1), 233, 14 and 61.75, GPT-5.5's missing value, the 90% saturation rule (a footnote on screen), Gemini 3.1 Pro as the judge, and the figures 94 to 98%, 83 to 99% and 0.16 against 0.38. The paper's closing idea, that plasticity may become a target for post-training (p. 11), fits an outro line but is not a beat.

## 4. Five candidate opening lines

Each is at most 12 words, passes the same style check, and uses no coined term. An opening line comes before beat 1. If time is short, O1 can replace beat 1.

| # | Line | Words | Paper | A stranger will think the video is about |
|---|---|---|---|---|
| O1 | Most AI tests show skill today, not how well an AI learns. | 12 | Abstract p. 1; Sec. 1 p. 2 | How AI is tested, and a gap between skill and learning. Plain, with no hook. Same idea as beat 1. |
| O2 | One AI model never changed, yet it got better at chess. | 11 | Sec. 2.1 p. 3; Sec. 3.2 p. 6 (Fable 5, 37.5% to 73.3%, Hard chess) | A puzzle: an AI improves without being retrained, and the video will show how. Only some models did this, so "one" must be Fable 5 on screen. |
| O3 | An AI's game character died. Then the AI wrote a rule. | 11 | Fig. 8 p. 10; Fig. 12 p. 23 (Opus 5.5, NetHack) | A story about a game AI that learns from a failure. Needs its ending at round 10 and a tag that it is NetHack and one model. |
| O4 | An AI forgets every game. So how does it get better? | 11 | Sec. 2.1 p. 3 (fresh context each game) | How an AI can improve with no memory of earlier games. "Forgets" is a loose word for "starts with a blank context". |
| O5 | Two AI models get the same practice, but only one improves. | 11 | Abstract p. 1; Sec. 3.2 pp. 6 to 7 | A comparison of two AIs that learn differently, with a reason to come. "Same practice" means the same protocol; the money spent differs. |

Best: O5. It is a full sentence, it states the paper's main finding in words a stranger can parse, it raises the question the rest of the video answers, and it leads straight into beat 1.

## 5. Numbers worth showing (three)

Only these three appear anywhere in the video. 298 and 57 are on screen with beat 8. The narration says "a lot" in beat 7 and "98%" in beat 9.

1. 298 (GPT-5.6 Sol). Sec. 3.4, p. 7; method Sec. 2.2, p. 5. Meaning: up to the point where its curve levels off, Sol's score on test games rose at a rate of 298 points per $1,000 of learning cost, averaged over chess, Go and Hex.
2. 57 (Claude Fable 5). Same section. Meaning: the same rate for the model that ended with the best test score, far lower than Sol's.
3. 98% (GPT-5.6 Luna). Sec. 3.5, p. 8; Fig. 4 left, p. 4. Meaning: in chess, Luna did not use its saved programs and notes in about 98 of 100 moves where they applied.

These numbers must NOT be taken to mean:
298 is not a gain of 298 points (scores stop at 100), a price, or a measured total. It is a rate fitted to a curve, and it depends on provider prices (p. 7). The pair 298 and 57 is not "Sol is five times better": in Hard chess Sol and Fable 5 gained about the same number of points (about 37 and 36, p. 6), and the paper's intervals are not in the main text, so do not say "five times". Neither number is a model ranking: Sol's score falls in NetHack (p. 7), and the paper treats plasticity as a measure tied to the protocol, not a universal ranking (p. 7). A low rate for Fable 5 does not mean it learns badly. It reached the highest final level. The values 298 and 57 must not be set beside 98%, or beside the NetHack value of 61.75, which is on a different, rescaled score (p. 21).
98% is not a use rate (it is the opposite), not a share of lost games, and not proof that skipping the notes caused Luna's lack of gain. The paper calls the link an association, with labels produced by Gemini 3.1 Pro, and says that use of an artifact does not by itself show it works (pp. 5, 8, 10).

Not chosen: 37.5% to 73.3% (Fable 5, Hard chess, p. 6). It is the clearest before and after, but a fourth number breaks the cap. If the owner prefers it to 98%, beat 9 loses its number and must say "rarely" instead.
