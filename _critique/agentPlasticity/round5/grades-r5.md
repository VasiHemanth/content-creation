# Grades, round 5: the two fresh cold viewers of the finished video

Graded: `cold-novice-3.md` (a curious 16-year-old) and `cold-engineer-3.md` (a software engineer), in this folder. Both read only `v3-kit/script.md` (the exact narration, three stills per line) and `quiz-v2.md`. Minimums are my key's, adapted to the quiz-v2 wording as in `round3/paper-faithful-r3.md`, section 3. I graded first. Then I checked the real file, `paper-reels/episodes/agentPlasticity/out/hf/final.mp4` (71.95 s), at 2 frames a second over the whole video and finer around l10, l12 and l13, and read its composition files (read only). Section 3 lists what that check changed in my part 1 audit (`paper-faithful-r5.md`).

## Bottom line

- Both viewers score 18 of 18 and pass section C. The finished video passes comprehension.
- Leave the video as it is. Nothing in it is false, no minimum was lost, and a new cut would be a new post (as far as I know a published reel's video cannot be swapped). The caption is the only fix that can still reach the live post.
- Nothing should come down. My frame checks cover `final.mp4` with sha256 `06932edc...bf8a`. I recomputed it and it matches `validation.json`. Please confirm that this is the file that was uploaded. The MP4 cannot show Instagram's own overlays, so the phone check in part 1 (section 4e) still stands.
- Caption: three changes, with paste-ready text, in section 5.

## Rules used (the same as rounds 1 and 3)

- 2: the narration states the answer and the viewer reports it. A hedge tag on content the narration states does not lower the score.
- 1: the narration states part of the answer. The viewer supplies the rest from a [guess], from [my background], or from small print they say they would miss at speaking pace.
- 0: the narration states none of the answer, or the viewer holds a misreading from the key.
- Clauses the question does not ask are recorded and not scored. Facts the viewers mark "(small print)" or "(small text)" do not count unless the narration also says them. Facts marked "(screen)", which are large labels and drawings, count.
- Q1, Q11 and Q12 are judged as the key describes them. Q12 passes at four of six items. Section C: at least 7 of the 9 minimums, including Q3, Q5, Q8 and Q10, and Q12 passes.

## 1. Grades

| Q | Topic | Novice | Engineer |
|---|---|---|---|
| 2 | What usual tests miss, what the paper adds | 2 | 2 |
| 3 | What changes, what does not | 2 | 2 |
| 4 | What the model saves | 2 | 2 |
| 5 | Plasticity | 2 | 2 |
| 6 | Which games, and why those | 2 | 2 |
| 7 | Main finding | 2 | 2 |
| 8 | Two kinds of best | 2 | 2 |
| 9 | Why some improved less, how sure | 2 | 2 |
| 10 | What not to conclude | 2 | 2 |
| Total | out of 18 | 18 | 18 |
| Minimums met | out of 9 (the rule needs 7) | 9 | 9 |
| Q3, Q5, Q8, Q10 all met | required | yes | yes |
| Q12 passes | required | yes, 6 of 6 | yes, 6 of 6 |
| Understands the paper (section C) | | yes | yes |

### Reasons, one per question

Q2. Novice 2 and engineer 2: l02 gives the gap (a score for today, not how well a model learns) and l07 gives the measure. The novice records which tests are meant as not conveyed, which is not asked.

Q3. Novice 2: "never changes" (padlock), and each round starts with the program and notes it writes after it reviews its games (l04, l05). Engineer 2: the same. [my background] sits on "weights". The novice's [guess] that the improvement lives in the programs and notes is not part of the minimum (see finding (a), section 4).

Q4. Novice 2 and engineer 2: a program and notes that the model writes for itself (l04), with the large file cards chess_engine.py and START_HERE.md as the example. [my background] sits on ".py" and on AGENTS.md. Neither could say what "IMMEDIATE ACTION / DO NOT INSPECT" means, which is not asked.

Q5. Novice 2 and engineer 2: the test score gain, divided by the dollars the model spends to learn (l07, spoken and drawn). What a score point is and what the dollars buy sit in small print and are not counted.

Q6. Novice 2 and engineer 2. This is the one cell that moved since round 3, where both scored 1. Round 3 gave the verdict ("show real progress") without the reason, and both viewers filled in the exam idea from background. The narration now says "like an exam" and "never reviews them", and both viewers report that as the voice's reason. The novice says the exam clause "lands". The engineer's Q6 answer credits the reason to the voice (l06). Its log adds that it completed the "so ... evidence of progress" step from held-out-test-set knowledge [my background]. I count that as a hedge on stated content, which the rule has always allowed. If a stricter reader scores the engineer 1, the engineer has 17 of 18 and 8 of 9, and the verdict does not change.

Q7. Novice 2 and engineer 2: with the same practice, Sol gained a lot, Luna did not, and Fable 5 gained a lot too (l08).

Q8. Novice 2 and engineer 2: best test score (Fable 5) against best plasticity (Sol), different models (l09). What a "point" is next to a score is not conveyed, and not asked.

Q9. Novice 2 and engineer 2: models that used their programs and notes less gained less, Luna almost never used them, "a link, not proof" (l10), and the paper does not know whether the programs, the notes or their use are weak (l12). Both read l12 as being about bad moves, which is the intended reading, and both say that why Luna skipped its files is not conveyed. That is true of the paper too. The engineer guessed what "used" means [guess] and guessed right. The novice notes that "used" is never defined in the audio.

Q10. Novice 2 and engineer 2: the numbers do not rank models, and they depend on the games and the prices (l13). Neither viewer holds a misreading from the key. The engineer adds that Fable 5's 57 does not mean it learned little, which is right.

Q1. Both partial. Novice: the new measure and the finding are there, but the mechanism is only "play board games over many rounds" (no saved programs and notes, no fixed model). Engineer: the mechanism and the measure are there, but the finding is only "compares three named models while warning that the numbers are not a ranking". Both put the missing parts into Q12.

Q11. Both useful. I checked each named item against the real video, and all exist as described. Novice: the l10 sentence "Models that used them most did not all gain a lot." (on screen 47.9 to 50.9 s), then l06's last clause, then "improves" in l01 against "never changes" in l05. Engineer: l11 ("X: a bad move." is the only gloss, and the squares have no key in l11), then l08 to l09 (similar curves, bars 298 and 57), then l10 (by ear, use and gain move together).

Q12. Novice pass, 6 of 6. Engineer pass, 6 of 6.

### Their ratings and line logs

| | Novice | Engineer |
|---|---|---|
| (a) The opening told me what the video was about | 4 | 4 |
| (b) Clear beginning, middle and end | 4 | 4 |
| (c) Every new word explained before use | 3 | 3 |
| (d) I could explain the paper after one viewing | 3 | 4 |
| Lines marked lost | none | none |
| Lines marked partly | l03, l05, l06, l09, l10, l13 | l03, l06, l10, l11 |

## 2. Round 1, round 3, round 5

| Round | What the viewers saw | Novice | Engineer | Minimums met | Q12 | Section C |
|---|---|---|---|---|---|---|
| 1 | v1 kit | 13 of 18 | 13 of 18 | 6 of 9 each | pass | fail |
| 3 | `script-v2.md` (text only) | 17 of 18 | 17 of 18 | 8 of 9 each | pass | pass |
| 5 | v3 kit (script and 42 stills of the finished video) | 18 of 18 | 18 of 18 | 9 of 9 each | pass | pass |

Only Q6 moved between round 3 and round 5 (1 to 2, in both viewers). The three questions that failed in round 1 (Q4, Q6, Q9) are now all 2. In round 3 I called Q6 the cell I could not predict, and the exam clause is what moved it.

The count of lines marked partly went up (novice 4 to 6, engineer 3 to 4) while every answer stayed at 2. The marks moved from lost answers to small print and ordinary words nobody defines (round, used, bad move, prices of what). l04 (novice), l12 (both) and l11 (novice) moved from partly to clear.

## 3. What the real video shows (checked after grading)

I scanned the whole file at 2 fps, and finer around l10, l12 and l13. I also read the composition files in `out/hf/project/compositions/` for the cue times. Times below are in the video's clock. Label sizes are the CSS sizes converted to pt on a 390-pt phone (pixels times 0.361).

Corrections to my part 1 audit:

- Withdrawn: clarity item 2 (the third l12 card is late). It enters on the word "poor", so it is in step with the voice.
- Withdrawn: clarity item 3 (the l13 dials make the gap wider) and its place as the "most serious" picture in part 1, section 3. The bars move both ways.
- Withdrawn: clarity item 8 (the l06 pencil icon reads as note writing). The engineer lists the exam sheet among the pictures that helped most.
- Closed: every item I marked "not in my frames" is now checked. None changes the verdict.
- Directly for the coordinator: the label "A second model judged this from the game logs." is in the composition but is effectively never visible, and it was on my part 1 live-check list. `script.md` lists it as on-screen text, so the kit is wrong on that item.

| Item | What the real video does | Effect on part 1 |
|---|---|---|
| l10 98% and its key | The 98% slams in on the word "never" (about 43.8 s). Its line "of the moves where one applied: not used." comes in at 44.2 s, the two key lines at 44.6 and 44.7 s, the "Used:" line at 45.3 s. All fade from 45.9 s. The 98% is on screen about 2 s. The key lines are on screen about 1.3 s, 1.2 s and 0.7 s, at 10.8 pt. | Matches the coordinator's check (15 to 35% of l10). The number and the grid carry the point together with the voice. The key is too brief to read. Neither viewer saw it, and both still scored 2 on Q9. The engineer guessed the right meaning of "used". |
| l10 "A second model judged this from the game logs." | It starts to fade in at 45.9 s, 0.03 s before its group fades out. It shows at low opacity for about 0.2 s. A viewer does not see it. | The live reel does not carry this label. Nothing is false, because the video never calls the 98% measured. |
| l12 third card | "poor use?" pops in on "poor" (59.9 s) and stays to the end of the line, about 1.0 s. | Item 2 withdrawn. |
| l13 dials | The "games" dial narrows the gap (Sol bar to 0.82, Fable 5 bar to 1.6 of their heights, about 2.7 to 1). The "prices" dial widens it (1.1 and 0.7, about 8 to 1). The bars never swap places. The printed 298 and 57 stay. | Item 3 withdrawn. Left as a cosmetic note: the end state is 8 to 1 under unchanged numerals. |
| l13 Sol label | "Sol gained in board games but lost score in another game." rises on the word "models" (65.1 s) and stays about 1.0 s (11 words, 11.6 pt). | It exists and is true (NetHack, p. 7). It is too brief to read, and it is the only on-screen support for "depend on games". |
| l14 "how well it learns" | The label pops in at 69.2 s. The chart fades 0.25 s later. | Cosmetic. The dashed arrow and the voice carry the idea. |
| l05 labels | The band comes at 19.6 s, the "Before" label at 19.9 s, the "One game" label at 20.2 s. All fade with the line at 22.2 s. | About 2.0 to 2.3 s on screen for 18 words. Confirms item 1. |
| l06 labels | "The model never reviews test games." at 26.5 s and "A gain on its games ..." at 26.9 s, both until 29.05 s. The first one arrives after the voice has said "never reviews". | About 2.1 to 2.5 s on screen. Brief. |
| l08 and l09 dollar axis | The sketch uses a log dollar axis, as Fig. 1 does, with no ticks. Sol's rise is centred near $56 and Fable 5's near $200. At the 90% points they sit near $155 and $910, a ratio of 5.9. On screen that gap is about 17% of the axis. | Explains finding (d). Equal-looking spans hide a 5.9 to 1 gap in dollars (about 4 to 5 to 1 in Fig. 1 by my reading). |
| Whole file | No frame shows a false number or a wrong label. Counting numerals pass through 90, 280 and 287 on the way to 298, and 46 and 55 on the way to 57, for under a second each. | The condition on my part 1 verdict is closed. SHIP AS IS stands. |

## 4. Merged findings and rulings

### 4a. My nine clarity items against the viewers

| # | Part 1 item | Viewer evidence | Ruling |
|---|---|---|---|
| 1 | l05 proof boards: label long, late and small | Both. Novice: could not tell who was winning from the boards, and these labels are the only proof that the programs work. Engineer: boards are under a third of the frame width, and "its program plays every move" is small text only. | Confirmed. Rank 1. |
| 2 | l12 third card late | Neither raised it. | Withdrawn. |
| 3 | l13 dials | Engineer: the dials make the point. Novice: no comment. | Withdrawn. |
| 4 | Labels under 11 pt | Both list the same small print: units, "Score: ...", "Dollars pay for ...", group labels, sketch notes, source tags. | Confirmed. Rank 4. |
| 5 | l04 "its games" tag hidden | Novice: a label that looks clipped at the left edge. | Confirmed by one viewer. |
| 6 | l11 right grid has no filled square | Neither read it as "never used". Engineer: the squares have no key in l11. | Not confirmed. Low. |
| 7 | l08 and l09 dollar axis | Engineer only (finding d). | Confirmed by one viewer, with the cause found. Rank 2. |
| 8 | l06 pencil icon | Engineer counts the exam sheet as helping. | Withdrawn. |
| 9 | l10 "used most" on Fable 5 only, "used least" crowded | Both. Novice took Sol for a middle case until l11 put it in the top group. | Confirmed. Rank 3. |

### 4b. Other findings from the viewers

| Finding | Who | Ruling |
|---|---|---|
| "Round", "used", "bad move", "prices of what", "who does it play", "what is a point", "how many models" are not defined | Both, in different mixes | Accepted in round 3 (f) as ordinary words, except "bad move", whose only gloss is "X: a bad move.". None cost a point. |
| GPT and Claude prefixes, and whether Sol, Luna and Fable 5 are real products | Engineer; novice ("GPT in the names") | The video shows full names on small tags only. The caption can carry them. |
| "IMMEDIATE ACTION / DO NOT INSPECT" is loud and unexplained | Both | Cosmetic. It is the paper's own note (Fig. 14). Optional label in section 6. |
| Paper crops (l02, l13) are unreadable at phone size | Both | Cosmetic. They show provenance. The l13 crop's "provider pricing" would answer "prices of what?", but it is highlighted for about 2 s and cannot be read in that time. |
| "Best plasticity" then "do not rank" sounds contradictory | Novice | The paper does the same: Sol has the highest estimate on its protocol, and that protocol is not a universal ranking. The caption fix ("universal rank") answers it. |
| l12 answers a question about bad moves, not why Luna gained little, so l12 and l13 feel like two endings | Novice, engineer | Accept. The paper keeps the two questions apart (p. 8). |
| l12 quote has low contrast | Novice | Cosmetic. It is fading in at that still. |

### 4c. Rulings on (a) to (e)

(a) "improves" (l01) against "never changes" (l05). Only the novice raised the clash (Q3, Q11, l05 log). The engineer raised the neighbouring gap in Q4: the voice never says that the saved program, not the model, chose the moves. Both still scored 2 on Q3. The gap is real and small: l05 says what each round starts with, but no spoken line says the gain sits in the programs and notes. The picture does say it (the cards ride into "next round", and the two boards show the effect), but that proof is the brief small print of item 1. Fix now: the caption sentence "The model never changes. It writes programs and notes for itself." Fix in a cut: give the l05 proof boards more time (section 6, picture item 1). A voice change is optional (section 6).

(b) The l10 sentence "Models that used them most did not all gain a lot." The novice read it as the opposite of the point. The engineer read it correctly, but says it is about models the graph does not draw. My round 3 nice-to-have label backfired. It is true (the paper says high reuse does not close the gap, p. 8), but the graph shows only the two high-use, high-gain models, so the sentence has no picture. Ruling: delete it in any cut. The guard against the key's misreading for Q9 ("more use always means more gain") is the spoken "This is a link, not proof." together with the l11 and l12 lines about high-use models that still fail. Neither viewer held the misreading, so deleting the label costs no point that was measured.

(c) l06. No voice change. Q6 is 2 for both, and the novice answers it from the voice. The last clause is compressed ("evidence of progress"), and both viewers say so. The two stacks do look alike: the differences are an orange outline and a magnifier sign. The corner arrow has no label. These are picture faults: make the test stack look sealed and label the arrow "test score" (section 6). I do not adopt the novice's rewrite. "A higher test score is evidence it improved" changes the claim: a higher score is not evidence of improvement (Fable 5 starts at about 43% and Sol at about 18%). A gain over the round 0 score is.

(d) The dollar axis. The engineer is right that nothing reconciles the equal-looking curves with 298 against 57. The cause is the log dollar axis without ticks (section 3). The curves do rise about equally in the paper: p. 6 says Sol gains about as much as Fable 5 in Hard chess, and Fig. 1 shows both gaining roughly 36 points up to their saturation stars (my reading of the plot). The bars differ because Fable 5 needs several times the dollars. No minimum needs this, and the engineer's own guess ("Fable 5 costs more per unit of gain") is right. Caption now: one sentence (section 5). In a cut: ticks on the axis (section 6, picture item 2).

(e) Small labels. Confirmed, and sharper with the real sizes: the l10 key is 10.8 pt and on screen 0.7 to 1.3 s, the l13 unit label is 9.4 pt, "Score: the share of points won." is 9.4 pt, the l11 group labels are 9.4 pt, and the source tags are 7.9 pt. None cost a point, because every minimum comes from the voice and the burned-in captions. They carry the units, what the dollars buy and who "the other models" are, which the viewers say they missed. Nothing to do for the live reel. In a cut: section 6, picture item 4, with the selectors.

## 5. Recommendation

1. Does the finished video pass comprehension? Yes. Both viewers get 9 of 9 minimums, Q12 6 of 6, and section C. Every minimum is in the narration and the burned-in captions, so a viewer on a phone with the sound off gets the same answers.
2. Does anything justify a re-cut now? No. A re-cut would be justified by a false claim, a lost minimum, or a misreading from the key. None is present. What remains is small print, short label times, and one axis without ticks, and a re-cut would reset the post.
3. Caption. Three changes to revision 4 (or to my part 1 revision 5, if it is already pasted):
   - Replace "They do not rank models." with "They do not give a universal rank for models." It is the only claim in the caption that is stronger than the paper, and the caption has no paper strip to qualify it.
   - Add "The model never changes. It writes programs and notes for itself." It answers finding (a) for caption readers and gives "its programs and notes" a meaning.
   - Add "Fable 5 spent more dollars for each point it gained." It answers finding (d). It follows from 298 against 57 and the definition of plasticity (points gained per dollar): about $3.40 a point for Sol and $17.50 a point for Fable 5. It needs no reading of Fig. 1.

Paste-ready block (the full names and the split sentences are the part 1 edits; each sentence passed the style check in section 7):

```
Two AI models get the same practice. Only one improves.

A new paper, Agent Plasticity, measures how well an AI model learns. The model never changes. It writes programs and notes for itself. Plasticity is the test score gain for each dollar the model spends to learn.

In the authors' runs, Claude Fable 5 reached the best test score. GPT-5.6 Sol had the best plasticity. Fable 5 spent more dollars for each point it gained. GPT-5.6 Luna almost never used its programs and notes. It showed no reliable gain. Models that used them less gained less. The paper treats this as a link, not proof.

Limit: these numbers are estimates. They depend on the games and the prices. They do not give a universal rank for models.

Paper: arXiv 2610.08902. Unofficial explainer.
Comment "Paper" or "Research" for links
```

Keep the hashtags line as it is. I did not touch the live post.

4. The live reel, in two lines. Nothing should come down: the real MP4 has no false number or wrong label, and both fresh viewers pass 18 of 18. The weak spots are short, small labels and one axis without ticks, which are clarity items for a later cut and not a reason to act on the live post.

## 6. If a re-cut happens anyway (or for the next reel on this template)

Picture and label changes, no re-voice, ranked. Merged from my nine items and the viewers.

| # | Change | Source |
|---|---|---|
| 1 | l05: give the proof boards more time. Show both boards and both labels from the band (19.6 s) and raise `#loop-bef` and `#loop-aft` to 34 px. If the pipeline supports a per-line tail, add a 1.5 s hold after the voice (71.95 s to about 73.5 s) and check that the validator's frame-count check against the storyboard timeline still passes. | Both viewers, item 1 |
| 2 | l08 and l09: show the dollar gap. Add ticks "$10", "$100", "$1,000" to the sketch's x axis (the paper's own axis has them) and mark the top of each curve. Optional label: "Fable 5 spends more to reach its top." | Engineer, item 7 |
| 3 | l10: delete `#why-cav`. Put "used most" on a bracket over the Fable 5 and Sol tags. Move "used least" above the Luna line. Show the key from the 98% (44.2 s) as the one line "Used: it runs the program or follows the note." and drop the other two key lines. | Both viewers, item 9, finding (b) |
| 4 | Raise to at least 34 px (12.3 pt): `#cl-unit` (26 now), `#ms-score` (26), `#loop-bef` (26), `#why-who` (26), `#why-sk` (28), `#why-least` (28), `#ms-pay` (30), `#loop-wrote` (30), `#rs-avg` (30), `#why-k3` (30). Source tags are 22 px (7.9 pt): raise to 28 px or drop them. | Both viewers, item 4 |
| 5 | l13: start the Sol label on "games" (about 63.2 s) in place of "models" (65.1 s). It then stays about 2.9 s. | Part 1 |
| 6 | l06: make the test games stack look sealed (a lock) and label the corner arrow "test score". | Novice, finding (c) |
| 7 | l04: move `#loop-stackl` below the stack and put `#loop-wrote` under it. | Novice, item 5 |
| 8 | l04 or l05, optional: a label on the note card, "The note tells Sol to run the program first." (the note in Fig. 14 does say to run the program as the first call). | Engineer, Q4 |
| 9 | l11: fill about one right-grid square in three. Repeat "Filled: used. Hollow: not used." as a small line. | Item 6 |

Voice change, only if you re-voice anyway:

| Line | New sentence | Words (old to new) | Repairs |
|---|---|---|---|
| l05 | The model never changes. Its programs and notes carry what it learns to the next round. | 13 to 16 | Finding (a) |

Seconds and the 80 s cap. Three more words cost about 1.1 s. Measured pace: 195 words actually ran 71.95 s, so 198 words run about 73.0 s, and the cap holds with 7 s to spare. The producer's old formula (2.9 words a second, 0.75 s a line, 1.85 s on the last line) gives 78.8 s for 195 words, which is 6.9 s above the real length, and 79.9 s for 198 words. Both are under 80 s. I trust the measured pace. A voice change in l05 breaks the animation cues on "but", "each", "round", "starts" and "with", so the picture code needs new cues. I do not recommend a voice change for l10 ("use" is the declared term, and the key line defines it on screen), l06, or l09.

## 7. Checks run

Every new sentence in this file (the caption block, the l05 sentence, and the labels in sections 5 and 6) was counted and checked by script: at most 15 words a sentence, simple present or past, active voice, no -ing form, no modal verb, no phrasal verb. The two sentences "Its programs and notes carry what it learns to the next round." (12 words) and "The note tells Sol to run the program first." (9 words) pass. No em dash or en dash in this file. The sha256 of `final.mp4` was recomputed and matches `validation.json`.
