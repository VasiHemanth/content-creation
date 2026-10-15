# Grades, round 1: the two cold viewers against the answer key

Graded: `cold-novice.md` (a curious 16-year-old) and `cold-engineer.md` (a software engineer), against `answer-key.md`. Both viewers saw only the v1 kit and `quiz.md`.

## Rules used

One rule for every question. Score what the question literally asks, and let provenance decide: did the video state it?

- 2: the video states the answer in its own words or pictures and the viewer reports it. A hedge tag on content the video states does not lower the score.
- 1: the video states part of the answer and the viewer supplies the rest by inference.
- 0: the video states none of the answer, the viewer's answer rests on a flagged guess or on background, or it holds a misreading from the key.

Clauses in the key's minimum answer that the question does not ask are recorded as "not conveyed" and are not scored. They are: the dollars pay for practice and review (Q5), the same chance to learn (Q7), and the "likely, not proven" hedge (Q9). Q9's "why" is the question itself, so it is scored.

A viewer's [my background] or [guess] tag on content the video does not state means the video did not convey it. I apply the tag to the part it sits on, not to the whole answer. Q1, Q11 and Q12 are judged as the key describes them (Q12 passes at four of the six items).

Both viewers saw three still frames per line and the exact script. They could read small labels that a one-pass viewer would miss (the novice says so). Their totals are upper bounds for a real viewer.

## 1. Scores

| Q | Topic | Novice | Engineer |
|---|---|---|---|
| 2 | What usual tests miss, what the paper adds | 2 | 2 |
| 3 | What changes, what does not | 2 | 2 |
| 4 | What artifacts are | 0 | 0 |
| 5 | Plasticity | 2 | 2 |
| 6 | Why score on unseen games | 0 | 0 |
| 7 | Main finding about the models | 2 | 2 |
| 8 | Two kinds of best | 2 | 2 |
| 9 | Why some improved less | 1 | 1 |
| 10 | What not to conclude | 2 | 2 |
| Total | out of 18 | 13 | 13 |
| Minimums met | out of 9 (rule needs 7) | 6 | 6 |
| Q3, Q5, Q8, Q10 all met | required | yes | yes |
| Q12 passes | required | yes | yes |
| Understands the paper (section C) | | no | no |

Both viewers fail by one question. Q3, Q5, Q8 and Q10 are met, Q12 passes, and the count of met minimums is 6 where the rule needs 7. They miss the same three questions: Q4, Q6 and Q9.

### Reasons, one per viewer

Q1, judged as the key describes. Novice, partial: it has the hook story, the per-dollar measure and the best-final finding, but not "the model never changes" and not "it writes and saves its own programs and notes". Engineer, partial: the measure and the finding are clear, and "agents fail to follow what they write down" stands where the mechanism should be.

Q2. Novice 2: l13 says a score shows what an agent can do today and plasticity shows how efficiently it improves, and l04 gives per dollar. The viewer tags it "guess" because the usual way is never named, but both halves are the video's own words. Engineer 2: the same two lines. The [my background] tag sits on a gloss ("quickly or cheaply"), not on the answer. The engineer notes that a viewer who stops before l13 (60 s) gets no statement of the problem.

Q3. Novice 2: the model is frozen (lock, "model: frozen" tag), and what changes is what it saves for next time (the ARTIFACTS card, l01 "wrote itself a rule"). No misreading from the key. "Fresh" is a guess, and the answer does not need it. Engineer 2: the same. [my background] sits only on "frozen means no weight updates". It says the video never states outright that the agent writes the artifacts, and that l01 and l11 imply it.

Q4. Novice 0: "not conveyed", a flagged guess ("maybe notes or rules"), doubt after l11's "saved program", and a first reading as a game item. The l01 rule note is on screen for 1 to 2 s. Engineer 0: it builds "things the agent writes for its future self, a rule and a saved program" from l01 and l11, and is "fairly sure" only after the l11 file listing. Its own section "Background I leaned on" says that listing was read with engineering knowledge and that a non-engineer would see nothing wrong there. l02 says what happens to artifacts (they pass on), and no line says what they are, so both definitions rest on a guess or on background. The engineer's answer is the closer of the two, and the sensitivity list covers it.

Q5. Novice 2: "score gained per dollar" (l04), on a score the label calls "never seen while learning". What the dollars pay for is a guess, and it is not asked. Engineer 2: the same, with the slope triangle. What the dollars pay for and the baseline are [guess], and not asked.

Q6. Novice 0: "not conveyed". The label says what held-out is, not why it is used. The reason offered comes from school tests, not from the video. Engineer 0: "not conveyed". The reason offered is a train and test split [my background], which its own "Background I leaned on" section lists.

Q7. Novice 2: l05 gives improved, flat, worse. "Same chance to learn" is not in the video, so it is recorded, not scored. Engineer 2: the same, with l06's claim added.

Q8. Novice 2: best at the end ("ends higher", "top scorer") against best per dollar ("faster per dollar", 298), different models, Fable 5 and Sol read from the l07 sketch labels, which are on screen for about 2 s. Engineer 2: the same. It first read the tall orange Sol bar as the winner, because orange meant Fable 5 in the sketch, and then corrected itself. That is the key's misreading "Sol is the best model", nearly held.

Q9. Novice 1: it lists 98% non-use, strong agents failing while they use artifacts, and the instruction anecdote. It says the video never gives them as the reason and that the join to "improved less" is its own. Engineer 1: the same facts. It notes that l09 means non-use cannot be the whole story, and calls the cause "inference [guess]".

Q10. Novice 2: do not rank models, it depends on setup and prices, and the numbers are estimates. It does not know what "setup" means, which is not asked. Engineer 2: the same, and it adds that 298 against 57 is no verdict because no final scores are shown.

Q11. Both useful. The novice names l08 and says why: three undefined things at once and a grid with no key. Its runners-up (l03, l07, the l01 rule note, the second sentence of l09) all match the frames. The engineer names the second sentence of l09: 48 of 50 squares lit, and 5 of 6 crosses on lit squares. I counted the same in the frame. It adds the colour flip in l07, the paper strips that repeat the caption, "agent" against "model", and that l08 to l11 never link back to l05 to l07.

Q12. Novice pass: 6 of 6 items, two of them tagged guess ("notes", "test games it never saw"), so 4 of 6 without them. Engineer pass: 5 of 6, with no "not a ranking".

### The viewers' own ratings and line logs

| | Novice | Engineer |
|---|---|---|
| (a) The opening told me what the video was about | 2 | 3 |
| (b) Clear beginning, middle and end | 3 | 3 |
| (c) Every new word explained before use | 2 | 2 |
| (d) I could explain the paper after one viewing | 2 | 3 |
| Lines marked lost | l03, l08 | none |
| Lines marked partly | l01, l02, l06, l07, l09, l11 | l01, l02, l03, l05, l07, l08, l09 |
| Lines marked clear | l04, l05, l10, l12, l13, l14 | l04, l06, l10, l11, l12, l13, l14 |

Both viewers rate l01, l02, l03, l07, l08 and l09 at partly or lower. Both rate l04, l10, l12, l13 and l14 clear.

### Sensitivity

- Engineer Q4 at 2 would make the engineer pass (7 of 9). I score it 0 for the reason given under Q4. At 1 it would not change the verdict.
- Either viewer's Q9 at 2 would make that viewer pass. I score 1 because both say the video never gives the reason and the join is theirs.
- If the viewers' own tags on Q2 are honoured (both tag the "what is missing" half), both drop to 1 on Q2: 12 of 18 and 5 of 9, which is the number my audit predicted. I do not honour them because l13 states that half in the video's own words.
- The verdict holds under the stated rule: both fail. A pass needs one more met question, and the open ones are Q4, Q6 and Q9.
- The viewers worked from stills and the exact script, so their 6 is an upper bound.
- The engineer's answers lean more on engineering background (Q3, Q4, Q6). The novice is the better proxy for the channel's audience.

## 2. Against my prediction

My audit predicted about 5 of 9 (Q2, Q5, Q7, Q8, Q10 met; Q3, Q6, Q9 half; Q4 missed). In points that was 13 of 18.

| Q | Predicted | Novice | Engineer | Call |
|---|---|---|---|---|
| 2 | met, late | 2 | 2 | right: only through l13 at 60 s |
| 3 | half | 2 | 2 | too harsh |
| 4 | missed | 0 | 0 | right |
| 5 | met | 2 | 2 | right |
| 6 | half | 0 | 0 | too kind |
| 7 | met | 2 | 2 | right |
| 8 | met | 2 | 2 | right |
| 9 | half | 1 | 1 | right |
| 10 | met | 2 | 2 | right |

Too harsh on Q3. The lock, the "model: frozen" tag, the card that moves to the next game and l01's "wrote itself a rule" were enough. Too kind on Q6. I counted the small label as half credit. The label says what held-out is and never says why, and the novice adds that it would miss the label while listening. The count moved from 5 to 6 because of Q3, and the pass or fail verdict did not change. In points I was at 13, and both viewers scored 13. For a real viewer the stills caveat suggests my 5 is close.

Misses in the audit, found by the viewers:

- l07 colour flip. Orange is Fable 5 in the sketch and Sol in the bars. I described both pictures and never compared them. The engineer nearly read Sol as the winner.
- l09 second sentence. I flagged the base-rate problem in prose, and still gave the line a fair-simplification verdict and did not predict that both viewers would be unable to parse it. For a viewer the line is lost, whatever its fidelity verdict.
- Labels at speed. I counted on-screen labels as help. The novice says the Q6 label, the model names and the l01 rule note would be missed in real time.
- The blank ARTIFACTS card. I noted "nothing written on it" and did not see that it makes the word impossible to learn, even in the l08 and l09 pictures.
- The engineer's background. Its closing section shows that its answers to Q3, Q4 and Q6 lean on engineering knowledge that the channel's audience does not have.

## 3. Would the 11-beat story with opening line O5 pass?

Yes, narrowly, if the viewer understands each beat as written. I score the story under the same rule, narration only, because the viewers show that answers kept on the screen get missed.

| Q | Beats | Narration only |
|---|---|---|
| 2 | 1, 6 | 2 |
| 3 | 3, 4 | 2 |
| 4 | 3, 4 | 1: "programs and notes" is defined, but no example is spoken |
| 5 | 5, 6 | 2 |
| 6 | 5 | 2 |
| 7 | 7 | 2 |
| 8 | 8 | 2 |
| 9 | 9, 10 | 1: the two facts are there, the link and the weak point are labels only |
| 10 | 11 | 2 |

That is 7 of 9, with Q3, Q5, Q8 and Q10 met and Q12 passing on all six items, so it passes, with no slack. The 9 of 9 that the screen notes in section 3b of `paper-faithful.md` would give cannot be counted, for the reason above. The quiz must be reworded for v2: Q4 must say "programs and notes", and Q6 must say "test games", because the words "artifacts" and "held-out" are gone.

The beat most at risk of being misread is beat 10 of the 11 (section 3b of `paper-faithful.md`): "Even the best models still made mistakes while they used their programs and notes." Its v1 counterpart, the second sentence of l09, is the line both viewers could not parse. The new sentence keeps the same shape. It invites two readings that the paper does not support: that the notes cause the mistakes, and that the notes do not help. The paper's data say the opposite for the group: the models that used them most made fewer mistakes than the rest. Fix 3 below replaces it. After that fix, the beat most at risk is the new association sentence, "Models that used their programs and notes less gained less" (B9 in the last table). It can be read as a cause, so it carries the label "This is a link, not proof."

## Producer brief

Order: by the number of failing quiz cells repaired. Fixes 1, 2 and 3 each flip both viewers to a pass if the question they target is then met. One rule for all fixes: every fact that a quiz answer needs must be spoken. A label may add to the narration. It may not carry an answer alone. Sources: A is my audit, N the novice, E the engineer.

1. Say what a test game is, and why it matters, in the narration.
   Change: drop "held-out" from narration, captions and labels. Replace the small label "held-out: never seen while learning" (slightly wrong: the model plays those games every round) with a label.
   Say: "It also plays test games it never reviews, so gains there show real progress."
   Label: "Test games: the model never reviews them."
   Repairs: Q6 (0 and 0 now), Q5, Q12, Q1.
   Found by: A, N, E.

2. Give the saved items one name, define them by example in the narration, and fill the blank card.
   Change: use "programs and notes" everywhere. Drop "artifacts", "rule", "tool", "instruction" and "saved program" for these items. Put real files on the card in l02, l08 and l09: Sol's own two files from the paper (a note, START_HERE, and a program, chess_engine; Fig. 14, p. 25).
   Say: "After each round, it reviews its games and writes a chess program and notes."
   Say: "The model never changes, but each new round starts with its programs and notes."
   Label: "Sol's own files: a note and a program."
   Repairs: Q4 (0 and 0 now), Q3, Q9, Q11, Q12.
   Found by: A, N, E.

3. Say the "why" in order, with a sentence that people can parse, and drop the l09 second sentence.
   Change: replace l08 to l11 with three spoken sentences and two labels. Cut the GPT-5.5 anecdote and the paper strip. Only the Luna label names a model; the three spoken sentences are about groups. The old sentence "most of their failures happen while they use them" goes: two of two viewers could not tell what it shows, and with use near 100% the share alone says little about the notes (my reading, not the paper's).
   Say: "Models that used their programs and notes less gained less."
   Say: "The models that used them most made fewer mistakes, but still made some."
   Say: "The paper does not know if the programs, notes or their use are weak."
   Label: "This is a link, not proof."
   Label: "Luna did not use them in 98% of moves where they applied."
   Repairs: Q9 (1 and 1 now), Q11, Q7.
   Found by: A, N, E.

4. Open with the subject, tell the loop, and name plasticity only after the loop.
   Change: the first 10 s say what the video is about without the word "plasticity": opening line, then the gap. Then the game, the review, the fixed model and the test games. Then define plasticity, show the word large when it is spoken, and show it again with the two bests. Delete l02, l03 and l04 as written. Keep l04's slope picture, which both viewers rated clear, but draw it as a curve that levels off, not a straight line. Show the paper's title as a tag in the first 3 s, and again on the end card.
   Say: "Two AI models get the same practice, but only one improves."
   Say: "Most tests show how good an AI model is now, not how well it learns."
   Say: "An AI model plays board games, round after round."
   Say: "Plasticity is the test score gain for each dollar the model spends to learn."
   Repairs: Q1, Q2 (now reached only through l13 at 60 s), Q3, Q5.
   Found by: A, N, E.

5. Name the models in the narration, use one word for the player, and say "same practice".
   Change: "model" for the player everywhere ("agent" only in the paper's title). Say the names aloud. Name the "one agent" of l08 as Luna; the GPT-5.5 line is cut by fix 3. Put the full names on screen at first mention.
   Say: "With the same practice, Fable 5 and Sol gained a lot, but Luna did not."
   Say: "Fable 5 ended with the best test score, but Sol had the best plasticity."
   Repairs: Q8, Q7, Q9, Q11.
   Found by: A, N, E.

6. Repair the numbers picture.
   Change: one colour per model in every picture (v1: orange is Fable 5 in the sketch and Sol in the bars). Name every bar. Show the number 57. Put the unit under both bars. Start Sol's curve below Fable 5's, as in the paper. Use one tag, not "sketch, not data" and "estimated" together. Show only three numbers in the whole video: 298, 57 and 98%.
   Label: "Points per $1,000: a rate, not a total."
   Label: "These are estimates."
   Repairs: Q8, Q10, Q7, Q11, and the misreading "Sol is the best model" that the engineer nearly held.
   Found by: A (in part), E, N.

7. Make the square grids readable.
   Change: add a key, show "not used" in the colour of the 98%, and use the same grid for the two why beats, with fewer crosses in the second.
   Label: "One square is one move where a program or note applied."
   Label: "Orange means used. Grey means not used."
   Repairs: Q9, Q11.
   Found by: A, N, E.

8. Cut the three paper strips (l03, l06, l10).
   Change: replace each with a small source tag, for example "Paper, Sec. 2.2, p. 4". The strips repeat the caption, are clipped in portrait, and show doubled text in the middle frames. The engineer says they added credibility but no understanding. The novice could not read them while the voice talked.
   Repairs: Q5, Q8, Q11.
   Found by: A, N, E.

9. Cut the NetHack hook. If it stays, it needs its ending, and it does not fit.
   Change: recommended is to cut it and open with the line in fix 4. The hook leaves "prayed" and "its own tool" unexplained and has no ending. NetHack has no test games and one model. Finishing it takes three sentences (33 words) and does not fit in 70 s: it replaces the opening line (11 words), B2 (9 words) and the chess example in B3 (2 words), so the total becomes 171 - 22 + 33 = 182 words against 179. Dropping B1 (15 words) fits, but B1 is the only spoken carrier of what usual tests miss in Q2. Q2 would fall to 1 and the narration-only count to 8 of 9, which still passes.
   If kept, B3 is shortened and the three hook sentences open the video:
   Say: "After each round, it reviews its games and writes programs and notes."
   Say: "An AI's game character prayed at a bad time and died."
   Say: "Then the AI wrote a rule: pray only through its own program."
   Say: "Later, the rule worked and the prayer healed its character."
   Repairs: Q1, Q12, Q4 (an example).
   Found by: A, N, E.

10. End on the caution, with its example, and drop the closing question.
   Change: l14's question ("your agent") does not apply to the novice. End on the caution beat and put the paper's title and id on the end card at a readable size. Keep l12's dials and stamp, which both viewers rated clear. Add the paper's own counterexample, without numbers.
   Say: "These numbers fit this setup and these prices, so they do not rank models."
   Label: "Sol gained in board games but lost score in another game."
   Repairs: Q10, Q1, Q12.
   Found by: A, N.

Keep as they are: the l04 plain words "score gained per dollar" with its picture, the three curves of l05, the l12 dials and stamp, and l13's contrast between a score today and how a model improves, which both viewers called the best line (its content now sits in beats 1 and 4).

### Narration after the fixes, with a time budget

At the v1 pace of 2.56 words per second, 70 s holds 179 words. The v1 script has 179.

| Line | Narration | Words | Replaces |
|---|---|---|---|
| O5 | Two AI models get the same practice, but only one improves. | 11 | l01 hook |
| B1 | Most tests show how good an AI model is now, not how well it learns. | 15 | l13, moved up |
| B2 | An AI model plays board games, round after round. | 9 | l02 (was 15 words) |
| B3 | After each round, it reviews its games and writes a chess program and notes. | 14 | l02, with the example inside |
| B4 | The model never changes, but each new round starts with its programs and notes. | 14 | l02 |
| B5 | It also plays test games it never reviews, so gains there show real progress. | 14 | l03, l04 |
| B6 | Plasticity is the test score gain for each dollar the model spends to learn. | 14 | l03, l04 |
| B7 | With the same practice, Fable 5 and Sol gained a lot, but Luna did not. | 15 | l05 |
| B8 | Fable 5 ended with the best test score, but Sol had the best plasticity. | 14 | l06, l07 |
| B9 | Models that used their programs and notes less gained less. | 10 | l08 |
| B10 | The models that used them most made fewer mistakes, but still made some. | 13 | l09 |
| B11 | The paper does not know if the programs, notes or their use are weak. | 14 | l10, l11 |
| B12 | These numbers fit this setup and these prices, so they do not rank models. | 14 | l12, l13, l14 |

Total 171 words, about 66.8 s, with 3.2 s spare. Against the 11-beat story with O5 (169 words), the example sentence moves inside B3, the hedge is added as B11 (14 words), the opening B2 loses 6 words, the 98% moves from the narration to a label, and B9 and B10 change. There is no room for the NetHack hook (33 words) or for a closing summary line (14 words). Under the rule of this file, narration only, the 13 lines meet all nine minimums and Q12 passes on six of six.
