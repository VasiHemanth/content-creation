# Paper-faithful audit, round 3: script-v2

Files read: `round2/script-v2.md`, `round2/producer-response.md` and `quiz-v2.md`. I checked the paper on the PDF pages themselves (p. 1 Fig. 1, p. 3 Fig. 3, p. 4 Fig. 4, p. 7, p. 8, p. 16 Fig. 9, p. 25 Fig. 14) as well as on the text file. I wrote this before reading any cold-viewer answer for v2.

Verdict: REVISE (the last section). The narration is clean and true to the paper. Four picture or label instructions would teach a wrong thing, so they must change before the build. None of the four needs a narration change. Decide the l06 hedge and the two optional narration edits (l03 "or", l13 "plasticity estimates") before voicing, so that nothing is re-recorded.

## 1. Answers to the producer's questions

### Question 1 (to the grader): do l10 and l12 meet Q9 from the narration alone?

Answer: yes. No change. Do not add "likely cause".

- Quiz-v2 Q9 asks two things: why some models improved less, and how sure the paper is about the cause. l10 answers the first as a link (less use, less gain) and the second with "This is a link, not proof." l12 names what stays unknown. A stranger who understood these three sentences would write: they used their programs and notes less; the paper is not sure that this is the cause; it does not know if the programs, the notes or their use are weak. That meets my minimum.
- The paper's own word for these causes is "candidate" (pp. 1, 3, 4, 8), not "likely". Speaking "likely" would claim more than the paper does. My key says "likely causes, not proven ones". I will grade that clause as "candidate causes, not proven".
- Watch item, not a change: l12's "Why?" can be read as "why did less use give less gain?". The paper does not know that either, so the reading does no harm.

### Question 2 (to me): "show real progress", or "give evidence of real progress"?

Answer: change it, with the producer's two-word variant. This is optional, not a blocker.

Say: "It never reviews them, so gains there give evidence of real progress."

- Without the change, "show real progress" is a fair simplification, not a misleading line.
- The fixed test seeds in Go and Hex (p. 20) are not a reason to hedge. Neither the moves nor the scores of test games reach the review step (p. 4), so a fixed set leaks nothing.
- The reasons to hedge are two. The paper's own verb for these results is evidence (p. 6). And the paper says the test gains do not separate what the games taught from the extra computing spent on review (pp. 7, 10). "Show" reads as proof. The video already hedges the same kind of claim in l10 ("link, not proof"), so a hedged l06 matches it.
- In the l06 picture, replace the tick that lands on the score line with a rising arrow. A tick reads as checked and proven.

### Question 3 (to me): is "ended with the best test score" fair, or does it need "on average over the games"?

Answer: fair as written. Do not change the narration. Add a label on the chart.

Label: "Average of the games."

- On Fig. 1 (p. 1) Fable 5's curve ends highest, near 80% against near 55% for Sol. That is the combined curve of chess, Go and Hex, so the label keeps the sketch honest.
- Game by game, Fable 5 ends highest or level in every one: Hard chess (Fig. 3, p. 3), Easy chess and Go (Fig. 9, p. 16; level with Opus 5 in Easy chess), and level with Sol and Opus 5 in Hex (Fig. 9). So the spoken sentence holds on the average and in each game, and the speech does not need the qualifier.
- "Ended" matches the data points at the right of the curves as well as the fitted line.

## 2. Audit of script-v2.md

### 2.1 The six checks you asked for

| Check | Result | Evidence from the paper |
|---|---|---|
| (a) l01 and l08: Sol and Luna as the pair, Luna flat, Sol climbs, Sol starts below Fable 5 | True | Fig. 1 (p. 1), left edge: Fable 5 near 43%, Sol near 18%, Luna near 6%. Sol's line is flat to about $30, then climbs to about 55%. Luna's dotted line stays near 5%, drifts down a little, and stops near $15. The text (p. 7) says Luna shows no reliable rise. Game by game (Fig. 3, p. 3; Fig. 9, p. 16): Sol starts below Fable 5 in Hard chess, Easy chess, Go and Hex and rises in each. Luna stays near its start in Easy chess, Go and Hex. The paper does not pair Sol with Luna. The pair is the producer's choice, and a fair one. |
| (b) l04 and l05: Fig. 14, the two files, the heading, "plays every move", "ends in a win for Sol" | True for one game. Misleading as drawn in l05 | p. 25 shows two test games as Black against Stockfish at skill 8. At round 0 (empty library) Sol picks every move by hand and is mated on move 37. At round 18 the engine Sol wrote at round 1 (tools/chess_engine.py) picks every move (14 of 15 calls run the engine, none is a direct move), and Sol mates on move 42. So the game does end in a win for Sol. START_HERE.md is in the same library. Its heading starts with the words IMMEDIATE ACTION, and a second phrase warns the model not to inspect files first. A line below it loads and runs the engine. The win is one game. At the end of the run Sol's average test score in Hard chess is about 37% (p. 6), so it does not win most of its games. l05 draws the win on "the next board", which reads as the next round. |
| (c) l06 label "A gain on reviewed games may not carry over." | Content true. Wording breaks the producer's own rules | The paper's concern is that gains may fail to generalize beyond the games that produced them (pp. 2, 4), and the test games measure that. The label uses a modal verb ("may"), a phrasal verb ("carry over") and a second name for its games ("reviewed games"). |
| (d) l10 and l11: 98% for Luna, "used them less gained less", the four models that used them most, fewer mistakes | True | p. 8: pooled over Hard and Easy chess, Luna did not use its programs and notes in about 98% of the moves where one applied. The four models with 2 to 6% non-use are Fable 5, Opus 5, Opus 4.8 and Sol. Use and gain go together across 19 model-game cells, and the paper calls it an association (pp. 5, 8). The same four make fewer mistakes than the other models (about 0.16 against 0.38 per relevant move), and most of their remaining mistakes happen while a program or note is in use. Two cautions. The 98% is a judged share: a second model read the logs (p. 5; App. G, p. 33), so it is not "measured". And one of the four, Opus 4.8, gained little (p. 7), so heavy use does not guarantee a big gain (p. 8). |
| (e) l12 quote | True, word for word | p. 8, Sec. 3.5, last sentence of the paragraph on strong improvers. The paper gives two causes there: the saved item may not fit the position, or the model may apply it badly. "Programs, notes or their use" splits the first cause in two. Fair. |
| (f) l13 quote and the Sol label | True | The phrase closes Sec. 3.4, on the last line of p. 7. The label matches p. 7: Sol's NetHack score falls from about 570 to 420, and Sol has the highest plasticity on the board-game curve. NetHack has no test games and its change mixes learning with game difficulty (App. C, p. 21), so the label is right to say "score", not "test score". |

### 2.2 Line by line

#### l01 (0.0 to 4.5 s): narration accurate, picture fair simplification

Narration: the paper's main finding, said of one pair. True of Sol and Luna (check a).
Picture and labels: faithful to Fig. 1 in direction. Two details for the build: draw Luna's bar below Sol's at the start (about 6% against about 18% on the combined curve) and print no digits. Luna's bar may drift down a little but must not rise.
Problem: none that blocks. "Only one improves" is about the pair, and l08 adds Fable 5, so keep each model's colour from l01 to l13.
Fix: none.

#### l02 (4.5 to 10.5 s): accurate

Narration: the abstract's contrast between a test at one point in time and how well a model learns. "Most" is fair for the paper's "largely".
Picture and labels: the receipt phrase starts at the left margin on the third line of the abstract (p. 1), so the highlighter can follow it. The crop will also show the start of the next sentence on the same line. That is harmless.
Fix: none.

#### l03 (10.5 to 15.0 s): narration accurate, picture misleading (blocker)

Narration: true. Each model in the cast ran on chess, Go and Hex.
Picture problem: one round marker keeps filling while the camera slides across three boards. That draws one run in which one model carries one set of programs and notes from game to game. The paper runs a separate lineage for each game, and it says separately trained runs do not show that saved items carry across tasks (pp. 10 to 11). The reading "one toolbox for every game" is one of the misreadings in my key (Q10), and l04's "chess program" makes it stronger.
Fix: three boards, each with its own row of dots that fills on its own. Add the label below. Draw the small boards the paper used (5 by 5 Go, 6 by 6 Hex) and print no sizes.
Label: "Each game has its own rounds."
Optional narration: "An AI model plays chess, Go or Hex, round after round."

#### l04 (15.0 to 20.6 s): narration accurate, picture fair simplification

Narration: it reviews its games (the training games, not the test games), then writes a program and notes. True for Sol: the engine entered the library at round 1, in the review after round 0, and START_HERE.md sits in the same library (Fig. 14).
Picture and labels: "two cards slide out of the stack" can read as "the program is taken out of the games". Let the cards land beside the stack. The note's heading is cut after two words: show the whole heading, because the second phrase explains why the note exists. The code lines are drawn, so keep them generic and do not present them as the paper's code. The label "Written by Sol" is passive.
Fix: cards land beside the stack; whole heading; label below.
Label: "Sol wrote: a program and a note."

#### l05 (20.6 to 26.2 s): narration accurate, picture and label misleading (blocker)

Narration: true. The model never changes, and each new round starts with its programs and notes.
Picture problem: an arrow carries the cards to the next round, and "on the next board the program plays every move by itself and the game ends in a win for Sol". The win is real but it is one test game at round 18 (check b). The picture puts it one round after the program was written. The on-screen text says "a later round", which disagrees with the picture. A viewer will read: write a program, win the next game. That teaches "Sol wins after one round", which the paper does not show, and it hides that Sol's average test score stays below Fable 5's.
Fix: after the cards reach the next round, show a time jump marked "a later round", then one board from Fig. 14's second game, with the label below. Do not say "test game" here, because l06 defines it. If time allows, add a small "before" board from Fig. 14's first game (round 0, no program, Sol loses). Alternative: move the board to l06, where the game is a test game, and use "One test game, a later round: Sol wins."
Label: "One game, a later round: its program plays every move, and Sol wins."

#### l06 (26.2 to 32.1 s): narration fair simplification, label blocker, picture nit

Narration: "It never reviews them" is true (p. 4). "Show real progress": see question 2. The sentence is a fair simplification as it stands.
Label problem: check (c). Replace the label with the one below.
Picture: replace the tick with a rising arrow. The crossed-out magnifier is right.
Label: "A gain on its games is not always a gain on test games."

#### l07 (32.1 to 37.7 s): accurate

Narration: true to the definition and the cost (p. 4). The label "Dollars pay for its games and its reviews." is true: the cost covers the model's calls to play its games and to write the next programs and notes, rejected tries included. The test games are not charged (Fig. 20 caption, p. 31).
Picture: one bracket on the gain and one on the dollars fits the headline measure, the gain up to where the curve levels off, divided by the cost at that point (p. 5). The coin counter must show no digits.
Fix: none.

#### l08 (37.7 to 43.6 s): accurate (a sketch of Fig. 1)

Narration: true (Fig. 1; Sec. 3.2 and 3.4). "Same games, same rounds" is true: every model ran 20 rounds on the same games (p. 6).
Picture: the sketch must follow Fig. 1. Start heights: Fable 5 above Sol above Luna. Sol flat until about $30, then climbing. Luna's line short, stopping near $15. Choose the paper's log axis, or a linear axis on which Luna's line is almost a dot. That is correct, so do not draw Luna's line as long as Sol's. Fable 5 amber and Sol green are also the paper's colours.
Fix: add the chart label from question 3.
Label: "Average of the games."

#### l09 (43.6 to 49.2 s): accurate

Narration and labels: true (checks a, d and Sec. 3.4, p. 7). "298 | 57" with the unit under both bars and "These are estimates." are right.
Picture: "the lines fold into two bars" can make the bars look like the line heights, and the amber bar is lower than its line. Use a wipe, and change the axis label from "test score" to "plasticity".
Fix: nice to have.

#### l10 (49.2 to 57.2 s): fair simplification

Narration: true. "Almost never" fits 98% (used in about 2 of 100 moves where one applied). "Link, not proof" matches the paper's own caution (pp. 5, 8).
Picture: the grid, the key and the colours are right. The three-line chart shows only the extremes, so it looks like a clean law, and one of the four models that used them most (Opus 4.8) gained little. The paper's own caution is that high use does not explain the remaining gap (p. 8). l11 and l12 cover part of it.
Problem: the line is dense (21 words in 8 s, four things on screen).
Fix: nice to have. Add the label below under the chart. If the cold viewers lose this line, split it after "Models that used them less gained less."
Label: "Models that used them most did not all gain a lot."

#### l11 (57.2 to 62.0 s): narration accurate, picture misleading (blocker)

Narration: true (check d). The label "Fable 5, Sol and two other models" is true: the other two are Opus 5 and Opus 4.8.
Picture problems:
1. Two or three X marks on a grid of white squares read as almost clean. The paper's rate for these models is about 16 mistakes per 100 relevant moves, which is not a clean grid.
2. There is no second grid, so "fewer than the other models" cannot be seen.
3. The paper's two rates count mistakes per relevant move, and one move can hold more than one mistake. So crosses per square give no share of squares.
Fix: two grids of equal size, side by side. Left: "Models that used them most", filled squares, several X marks. Right: "The other models", plain squares with no filled or hollow coding (that group mixes 98% non-use and 28% non-use), clearly more X marks. The left grid shows well under half as many crosses as the right grid. Neither grid looks nearly clean. Print no numbers. Keep the label "Fewer mistakes than the other models, but not none."
Label: "The other models"
Label: "The X counts here are a sketch."

#### l12 (62.0 to 68.0 s): accurate

Narration: true (check e).
Labels: the quote is right (p. 8). "The paper cannot tell which." uses a modal verb. Nice to have: "The paper does not know which."
Picture: fine.

#### l13 (68.0 to 74.6 s): accurate

Narration: true (check f). "These estimates" points at the bars, which return small on screen. "Games and prices" are both in the paper (task dependence, Finding 1, p. 7; provider prices, p. 7).
Picture: the dials change the bar heights. Do not let the bars swap order: the paper does not show Sol and Fable 5 changing places. Use a two-line crop of the last lines of p. 7. The paragraph above holds 298, 233, 57 and 14.
Optional narration (15 words): "These plasticity estimates depend on the games and prices, so they do not rank models."

## 3. Prediction for quiz-v2

A stranger who understood the narration as written, with no help from labels or pictures (the cold viewers showed that answers kept only on screen get missed). Minimums are my key's, adapted to the quiz-v2 wording where it changed (Q4, Q6, Q9).

| Q | Minimum as I will apply it | Spoken in | Predicted | Risk |
|---|---|---|---|---|
| 2 | Usual tests show how good the model is now. The paper measures the gain in test score for each dollar spent to learn. | l02, l07 | 2 | low |
| 3 | The model never changes. Between rounds it reviews its games and writes programs and notes, and the next round starts with them. | l04, l05 | 2 | low |
| 4 | Programs and notes the model writes for itself, for example a chess program. The video showed Sol's chess_engine.py and START_HERE.md. | l04, l05 | 2 | low to medium |
| 5 | Test score gain, divided by the dollars the model spends to learn. | l07 | 2 | low |
| 6 | Test games, which the model plays but never reviews. A gain on games it reviewed could come from studying them, so a gain on test games is evidence of real progress. | l06 | 2 | medium |
| 7 | With the same practice, some models gained a lot and others did not. | l01, l08 | 2 | low to medium |
| 8 | Best test score against best plasticity. Fable 5 had the first, Sol the second. Different models. | l09 | 2 | low |
| 9 | Models that used their programs and notes less gained less (Luna almost never used them). The paper calls this a link, not proof. It does not know whether the programs, the notes or their use are weak. | l10, l11, l12 | 2 | medium |
| 10 | The numbers do not rank models. They depend on the games and the prices. | l13 | 2 | low to medium |
| 12 | Six items present: model unchanged, programs and notes, test games never reviewed, dollars, best score is not best plasticity, not a ranking | l05, l04, l06, l07, l09, l13 | pass | low |

Result: 9 of 9 minimums met, with Q3, Q5, Q8 and Q10 among them, and Q12 passes. The script passes my section C rule with two to spare. Even if two questions slip, the count stays at 7.

Where the real grading could still miss. The densest spoken line is l10 (Q9). Two misreadings could come from the pictures, not the narration. Check these first if a cold viewer misses Q3, Q4, Q7 or Q10:

1. "One set of programs and notes works across chess, Go and Hex", from the single round marker of l03. It would show up in Q4 or Q10.
2. "Sol wins after one round", from the "next board" of l05. It would show up in Q7 or Q3.

Both are blocked by the blockers below.

## 4. Blockers and nice to have

### Blockers (must change before anything is built)

1. l03 picture. One round marker runs across three boards and draws a shared toolbox. Replace it with three boards, each with its own row of dots, and the label below.
   Label: "Each game has its own rounds."
2. l05 picture and label. The win sits on "the next board" and is not marked as one game. Use a time jump marked "a later round" and the label below.
   Label: "One game, a later round: its program plays every move, and Sol wins."
3. l06 label. "A gain on reviewed games may not carry over." has a modal verb, a phrasal verb and a second name for its games. Replace it.
   Label: "A gain on its games is not always a gain on test games."
4. l11 picture. Two or three crosses on one grid, with no comparison grid, show neither "fewer" nor the size of the rate. Use two grids as described under l11, with these labels.
   Label: "The other models"
   Label: "The X counts here are a sketch."

### Nice to have

1. l06 hedge (question 2).
   Say: "It never reviews them, so gains there give evidence of real progress."
   Replace the tick with a rising arrow.
2. Chart label for l08 and l09 (question 3).
   Label: "Average of the games."
3. l10 caveat under the chart.
   Label: "Models that used them most did not all gain a lot."
4. l12 label with a modal verb.
   Label: "The paper does not know which."
5. l04 passive label.
   Label: "Sol wrote: a program and a note."
6. The 98% is judged. producer-response.md calls it "measured, not estimated". Keep "measured" out of facts.json and record it as judged from the logs by another model. An optional label:
   Label: "A second model judged this from the game logs."
7. l13 optional narration with the antecedent for "estimates" (15 words).
   Say: "These plasticity estimates depend on the games and prices, so they do not rank models."
8. Picture details with no new sentence:
   - l01: Luna's bar starts below Sol's.
   - l03: small boards, no sizes printed.
   - l04: cards land beside the stack, whole heading on the note.
   - l05: a small "before" board from Fig. 14's first game.
   - l07: the coin counter shows no digits.
   - l08: axis and line lengths as in Fig. 1 (Luna's line short).
   - l09: a wipe, not a fold, from lines to bars.
   - l13: bars keep their order; a two-line crop of p. 7.
9. If l10 reads as lost, split it after "Models that used them less gained less."

## 5. Rulings on the producer's disagreements

1. Naming Luna in l10: accepted. The name joins the flat line of l08 to the 98%, which is what my brief wanted.
2. Speaking "This is a link, not proof.": accepted. The rule that an answer may not sit on a label alone is mine, and this follows it.
3. Keeping two paper strips (l02, l13): accepted, on three conditions. Hold each for at least 3 seconds. Show only the line or two around the phrase. Keep the narration as the plain version. The l13 strip must not show 233 or 14.
4. Short names spoken, full names on screen: accepted.
5. "Games and prices" in place of "setup and prices": accepted. "Games" is concrete, and the paper says the effect depends on the task (p. 7).
6. Filled and hollow instead of orange and grey: accepted. Amber belongs to Fable 5.
7. Speaking "estimates": accepted.

## 6. Verdict

REVISE.

Blockers: (1) l03 picture, (2) l05 picture and label, (3) l06 label, (4) l11 picture. All four are picture or label instructions. The narration is clean: 185 words, 13 lines, no modal verb, no -ing form, no phrasal verb, and it is true to the paper. The blockers need no narration change. Decide the l06 hedge and the two optional narration edits before voicing, and the picture instructions can be fixed while the voice is recorded. When the four fixes are in, send the picture instructions back to me for a quick re-check.
