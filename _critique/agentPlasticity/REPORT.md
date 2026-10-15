# Agent Plasticity: does the video explain the paper?

Written 2026-10-11 by Claude Sonnet 5.5. This is the summary and index for the critique loop in this folder. The loop was the answer to one request: the first Claude cut told a story that was hard to follow, so keep the narration in ASD-STE100 and build a plain story from the paper, with critics and a producer checking whether the video really explains it.

## Who did what

| Role | Agent | What it saw | What it wrote |
|---|---|---|---|
| Paper-faithful critic | one Sonnet 5.5 subagent, resumed between rounds | the paper and every video version | an answer key (before it saw any viewer answer), a fidelity audit, grades, and the brief for the producer |
| Producer | one Sonnet 5.5 subagent, resumed between rounds | the critic's brief | a response to each fix, the new script, then the scenes, voice and render |
| Cold viewers | two fresh Sonnet 5.5 subagents per round: a curious 16-year-old and a software engineer | only the script and three still frames per line (round 5: stills of the finished video), plus a 12-question quiz. Never the paper or an earlier version. | their answers, flags for guesses and background knowledge, ratings and a line-by-line log |

The agents did not message each other. I relayed between them with SendMessage: the critic's brief went to the producer, and the producer's reply went back to the critic.

Pass rule: at least 7 of the 9 graded questions (Q2 to Q10) at their minimum answer, including Q3, Q5, Q8 and Q10, and Q12 (a free summary) naming at least 4 of 6 items. Each question scores 2, 1 or 0, so 18 is the top score.

## Results

| Round | What the viewers saw | Novice | Engineer | Minimums met | Verdict |
|---|---|---|---|---|---|
| 1 | first Claude cut (NetHack hook) | 13 of 18 | 13 of 18 | 6 of 9 each | fail |
| 3 | rewritten script, text only | 17 of 18 | 17 of 18 | 8 of 9 each | pass |
| 5 | the finished video (script and 42 stills) | 18 of 18 | 18 of 18 | 9 of 9 each | pass |

Rounds 2 and 4 were the producer's: round 2 rewrote the script, round 4 built and rendered the video. The viewers' scores are upper bounds. They read the exact script and could study each still as long as they liked.

## The exchange

**Round 1, the critic's findings.** Both viewers missed the same three questions. Q4: they could not say what the model saves (the paper's word "artifacts" was on screen with a blank card, plus four other names for the same thing). Q6: nothing said why test games exist. Q9: the sentence about why only one model improves could not be parsed. The critic also found that the NetHack hook had no ending, that NetHack has no test games and only one model, and that finishing the story would cost about 33 words of a 70 s budget. It sent the producer ten ranked fixes, with one rule: every fact a quiz answer needs must be spoken, and a label may add to the narration but may not carry an answer alone.

**Round 2, the producer's answer.** It accepted 8 fixes (4 with a small change) and reworked 2. It cut the NetHack hook and opened on "Two AI models get the same practice. Only one improves." It gave the saved items one name, "programs and notes", and showed the two real files from the paper's Fig. 14. It declared 13 term entries for the STE checker (one name per idea, with the other names refused) and passed with 0 hard and 0 soft findings.

**Round 2 to 3, the disagreements.** The producer pushed back on seven points: name Luna in the narration, speak "This is a link, not proof." instead of labelling it, keep two paper strips instead of cutting all three, speak short model names and show the full names, say "games and prices", use filled and hollow squares, and say "estimates". The critic accepted all seven, with three conditions on the strips (hold 3 s, show only the line around the phrase, keep 233 and 14 off screen).

**Round 3, what the viewers still missed.** Both scored 17. Only Q6 stayed at 1: the narration gave the verdict ("so gains there show real progress") and not the reason. The critic also caught a l05 picture that put Sol's win one round after it wrote its program (the paper's game is one test game at round 18), so the fix is a time jump marked "a later round", and a l06 label with a modal verb and a phrasal verb. It sent a second brief with four picture fixes, seven narration changes and a new closing line, capped at 195 words and 14 lines. The Q6 fix was an exam clause: "It also plays test games, like an exam."

**Round 4, the build.** The producer rendered 71.95 s. `validate.mjs` passes 22 of 22. Two rendering bugs cost most of the time: the engagement gate ignores thin line drawings, so light pulses were needed, and a camera wrapper without `transform-origin: 0 0` pushed a receipt off screen.

**Round 5, the finished video.** Both fresh viewers scored 18 of 18, and Q6 moved from 1 to 2 on the exam clause. The critic then scanned the real MP4 at 2 fps and withdrew three of its own items. It found no false number or wrong label in any frame. Its verdict: ship as is, because a re-cut would be a new post.

## The story now

1. Two AI models get the same practice. Only one improves.
2. Most tests show how good a model is now, not how well it learns.
3. A model plays chess, Go or Hex, round after round.
4. In chess, it reviews its games each round and writes a program and notes.
5. The model never changes, but each round starts with its programs and notes.
6. It also plays test games, like an exam. It never reviews them, so gains there are evidence of progress.
7. Plasticity is the test score gain for each dollar the model spends to learn.
8. Sol gained a lot, but Luna did not. Fable 5 gained a lot too.
9. Fable 5 reached the best test score, but Sol had the best plasticity.
10. Luna almost never used its programs and notes. Models that used them less gained less. This is a link, not proof.
11. Models that used them most made fewer bad moves, but some remain.
12. The paper does not know which causes bad moves: weak programs, notes or poor use.
13. These plasticity numbers depend on games and prices, so they do not rank models.
14. A score shows skill today. Plasticity shows how well a model learns.

## What the loop does not show

- The viewers are models reading text and stills. None heard the voice or watched the motion. No person has been tested.
- The critic, the producer and the viewers are the same model family as the builder, so a blind spot could be shared.
- The project's own `reel-validator` (claim check against the paper) and `retention-critic` have not run on this version. Only the deterministic gate has.
- Small print is the weak spot: the critic measured several labels at 8 to 11 pt on a phone and on screen for 0.7 to 2.5 s. Every graded answer comes from the voice and the burned-in captions, so no point was lost, but a person reading on a phone may miss them.

## If a re-cut happens (a new post, not a swap)

Ranked in `round5/grades-r5.md` section 6. In short: give the l05 proof boards more time and larger labels; add dollar ticks on the l08 and l09 axis (Fable 5 needs several times the dollars of Sol to reach its top, which equal-looking curves hide); delete the l10 label "Models that used them most did not all gain a lot." and bracket "used most" over Fable 5 and Sol; raise small labels to at least 34 px; make the l06 test stack look sealed and label its arrow "test score"; start the l13 Sol label earlier. One optional voice change: l05 as "The model never changes. Its programs and notes carry what it learns to the next round."

## Caption

The live Instagram caption is revision 4. The critic's paste-ready revision 5 is in `round5/grades-r5.md` section 5. It makes three changes: "They do not give a universal rank for models." in place of "They do not rank models."; adds "The model never changes. It writes programs and notes for itself."; adds "Fable 5 spent more dollars for each point it gained." Only the account owner can edit a live Instagram caption.

## Files

- `quiz.md`, `quiz-v2.md`: the 12 questions (v2 uses "programs and notes" and "test games").
- `make_kit.py`: builds the viewer kit (script and three stills per line) from the rendered video.
- `round1/`: viewers' answers (`cold-novice.md`, `cold-engineer.md`), the answer key, the fidelity audit (`paper-faithful.md`) and `grades.md` with the ten fixes.
- `round2/`: `script-v2.md`, `producer-response.md`, `scratch-storyboard-v2.json`.
- `round3/`: viewers' answers on the script, the critic's rulings (`paper-faithful-r3.md`) and `grades-r3.md` with the final narration and the build brief.
- `round5/`: viewers' answers on the finished video, the critic's scan of the real MP4 and `grades-r5.md` with the verdict, the caption and the re-cut list.
- `v1-kit/`, `v3-kit/`: what the viewers were given in rounds 1 and 5.
- The first Claude cut and the open-model versions are archived in `../_study/` and `../agent-plasticity-model-study.zip`.
