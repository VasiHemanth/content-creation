# Producer response, round 2 (Agent Plasticity, script only)

What exists: `round2/script-v2.md` (what the cold viewers read) and the scratch storyboard `round2/scratch-storyboard-v2.json` (moved here from `paper-reels/episodes/_scratch_agentPlasticity_v2/`). The narration in the markdown is generated from the storyboard `text` fields, so the two cannot differ. Nothing else was touched: no scenes, voice, render, database, wiki, validation file or live episode folder.

Opening line (first spoken line and first frame, 0.0 s): "Two AI models get the same practice, but only one improves." This is O5 unchanged. It has 11 words, no coined term, and states the paper's finding. At 0.0 s the same claim is on screen in three big lines (TWO AI MODELS. SAME PRACTICE. ONLY ONE IMPROVES.). The first picture tags the two models by name (Sol green, Luna red), so l08 reads as its payoff and l10 as its answer: Luna is the one that did not improve, and Luna is the one that almost never used what it wrote.

13 lines, 185 words. 74.6 s on the brief's formula, about 69 s at v1's measured pace (section 5). STE: 0 hard, 0 soft findings.

## 1. The ten fixes

Each entry: verdict, why in one sentence, what I did, where it shows in `script-v2.md`.

1. Test games: accepted. Why: v1 never said why test games exist, so Q6 scored 0 and 0. What I did: l06 says "It also plays test games. It never reviews them, so gains there show real progress." (the brief's sentence split in two so "test games" gets its own beat, +1 word). The label is "The model never reviews test games." and a second label gives the contrast: "A gain on reviewed games may not carry over." "Held-out" is gone from narration, captions and labels. Where: l06.
2. Programs and notes: accepted, with one change. Why: five names and a blank card left Q4 at 0 and 0, so one name plus real files is the repair. What I did: "programs and notes" is the only name in the narration (l04, l05, l10, l12), and the cards show Sol's two real files from Fig. 14, chess_engine.py (a program) and START_HERE.md (a note). Change: the label is "Written by Sol: a program and a note", not "Sol's own files", because "files" would be a second name. The same two cards ride to the next round (l05), sit beside the grid (l10) and return as the question cards (l12). Where: l04, l05, l10, l12.
3. The why: changed. Why: both viewers could not parse the old l09 sentence and joined the facts themselves, so three plain sentences replace it. What I did: kept the three ideas (less use, less gain; heavy users made fewer mistakes but still made some; the paper does not know) and dropped the l09 sentence, the GPT-5.5 anecdote and the paper strip. Changes: l10 names Luna; "This is a link, not proof." is spoken, not only labelled; l12 starts with "Why?"; the 98% is on screen only, with "almost never used" spoken. Reasons are in section 7. Where: l10, l11, l12.
4. Subject first, plasticity after the loop: accepted. Why: a stranger had no statement of the problem until 60 s, and "plasticity" arrived before anything it measured. What I did: l01 hook, l02 gap (the problem is stated by 10 s), l03 to l05 the loop, l06 test games, then "Plasticity is the test score gain for each dollar the model spends to learn." at l07 (32 s). PLASTICITY is large at l07 and again at l09 with the two bests. The slope picture returns as a curve that levels off. The paper title is a tag from 0.0 s and on the end card. Change: l03 names the games ("plays chess, Go and Hex"), which cleared the one noun-cluster warning and gives l04's "chess program" an anchor. Where: l01 to l07, l13.
5. Names, "model", "same practice": accepted, with one change. Why: "one agent" meant two different models in v1, and the colours flipped between pictures. What I did: "model" is the only word for the player ("agent" appears only in the paper's title, on screen); "same practice" is in l01 and l08; Luna is named in l08 and l10. Change: the narration says short names (Fable 5, Sol, Luna) and the screen shows the full names at first mention (l01 for Sol and Luna, l08 for all three). Where: l01, l08, l09, l10.
6. Numbers picture: accepted, with one change. Why: the engineer nearly read Sol as the winner because orange changed meaning. What I did: one colour per model in every picture (Fable 5 amber, Sol green, Luna red; l01, l08, l09, l10, l13); every bar named; 57 shown; the unit under both bars; Sol's line starts below Fable 5's (the build reads exact starts from Fig. 1); one status tag per picture ("Sketch of the paper's Figure 1" on the lines, "These are estimates." on the bars, never together); three numbers only (298, 57, 98%). Change: 98% does not get "a rate, not a total", because it is a share of moves with its own unit. Where: l08, l09, l10.
7. Readable grids: accepted, with one change. Why: both viewers lost l08 and l09 on the grids. What I did: the key says "One square is one move where a program or note applied. Filled: used. Hollow: not used." Hollow squares are red, the colour of the 98%. A grid of the same layout serves l10 (Luna, nearly all hollow) and l11 (the four models that used them most, named on a label, nearly all filled, two or three crosses), so l11 cannot be read as Luna starting to use its notes. Change: not "orange used, grey not used", because amber is Fable 5's colour under fix 6. Where: l10, l11.
8. The three paper strips: changed. Why: the owner wants real pages read on camera, and the v1 strips failed for a fixable reason (they repeated the caption in jargon). What I did: the v1 strips (the definition, the endpoint sentence, "Writing down an instruction...") are cut. I keep two new receipts, each the paper's own plain sentence, six words or fewer, read while the narration says the same thing in plain words: l02 "rather than how effectively it learns" (abstract, p. 1) and l13 "not a universal model ranking" (Sec. 3.4, p. 7). Other lines get small source tags (section and page). Reasons are in section 7. Where: l02, l13, and tags on l04, l06, l07, l09 to l12.
9. NetHack hook: accepted. Why: it had no ending, NetHack has no test games, and finishing it costs about 33 words. What I did: cut it. NetHack appears once, unnamed, in the l13 label "Sol gained in board games but lost score in another game." Where: l13.
10. End on the caution: accepted. Why: the closing question did not apply to the novice, and the caution came 20 s after the numbers with no example. What I did: l13 ends the video with "These estimates depend on the games and prices, so they do not rank models.", the paper's own words on the page, the Sol counterexample label, the dials and the stamp. No closing question. The end card has the paper's title and id at reading size. Where: l13.

## 2. Terms

Three coined terms: plasticity, test games, programs and notes. Each is defined where it first appears (test games l06, plasticity l07, programs and notes l04 by example and l05 by use). Every other word is ordinary English in its ordinary sense.

| Concept | The one name | Names refused |
|---|---|---|
| the player | model ("AI model" until l03) | agent, bot, system, LLM, player |
| what it writes and saves | programs and notes (a program, a note) | artifacts, tools, skills, rules, instructions, memory, files, saved program, code |
| games it reviews | its games | training games, practice games |
| games it never reviews | test games | held-out, unseen, hidden, validation, new games |
| one cycle of play then review | round | checkpoint, epoch, iteration, cycle |
| looking back at its games | reviews | reflects, reflection, revises |
| the measure | plasticity | learning efficiency, learning speed, adaptability |
| the cost | dollar | learning cost, compute, budget, tokens |
| a bad move | mistake | failure, error, blunder |
| score on test games | test score | held-out score, final score, top scorer, performance |
| the rise in that score | gain | uplift, performance gain |
| playing and reviewing, as a whole | practice | experience, opportunities |
| putting a program or note to work | use | reuse, retrieve, invoke, ignore, skip |

The `ste.terms` I declare (the scratch storyboard has the full list, 13 entries; `names` are Fable, Sol, Luna, Hex, Go; `allow` is empty):

    model:               agent, agents, bot, bots, system, systems, LLM, player, players
    programs and notes:  artifact(s), tool(s), skill(s), rule(s), instruction(s), memory, file(s), saved program, saved items, code, script(s)
    test games:          held-out, held out, unseen, hidden, validation, evaluation games, new games
    its games:           training games, practice games, training
    round:               checkpoint(s), epoch(s), iteration(s), cycle(s)
    reviews:             reflect(s), reflection, revise(s), revision
    plasticity:          learning efficiency, learning speed, learning rate, adaptability, learnability, efficiency
    dollar:              learning cost, compute, budget, tokens
    mistakes:            failure(s), error(s), blunder(s)
    test score:          held-out score, final score, top score, top scorer, performance
    gain:                uplift, performance gain
    practice:            experience, opportunities
    use:                 reuse, reused, retrieve, invoke, ignore(d), skip(ped)

On-screen labels follow the same names. Two spots quote the paper and are not narration: the note's own heading IMMEDIATE ACTION on the START_HERE.md card (l04) and the sentence on the l12 tag.

## 3. Numbers on screen

| Number | Plain meaning | Unit | Sentence that stops a wrong reading |
|---|---|---|---|
| 298 | Sol's estimated plasticity: the test score points it gained for each $1,000 it spent to learn, up to where its curve levels off, averaged over chess, Go and Hex (Sec. 3.4, p. 7) | test score points per $1,000 the model spends to learn | Under both bars: "points per $1,000: a rate, not a total" and "These are estimates." Spoken at l13: "These estimates depend on the games and prices, so they do not rank models." Scores stop at 100, so 298 cannot be read as a gain. |
| 57 | Fable 5's estimate, same unit, same curve | same | Same label. l09 says Fable 5 "ended with the best test score", so a low 57 reads as a different measure and not as "learns badly". The bars are never captioned better or worse. |
| 98% | The share of moves, in chess (Hard and Easy pooled), where a program or note applied and Luna did not use it (Sec. 3.5, p. 8). Measured, not estimated. | percent of chess moves where a program or note applied | Spoken: "almost never used", so it cannot be heard as a use rate. On screen: "98% of these chess moves: not used", hollow squares in the same red. Then "This is a link, not proof." |

Other digits on screen are model names (Claude Fable 5, GPT-5.6 Sol, GPT-5.6 Luna), the arXiv id and source tags. They are citations, not data, and go into `facts.json` as sources. Not shown anywhere: 233, 14, 61.75, 37.5% to 73.3%, the 94 to 98% and 83 to 99% reuse figures, 0.16 against 0.38, and any ratio of 298 to 57. The Sol counterexample says "lost score" with no number.

## 4. Where each quiz answer is spoken

| Q | Spoken in | The words |
|---|---|---|
| 1 | l01, l02, l07, l09, l13 | same practice, one improves; tests miss how well it learns; plasticity; best score is not best plasticity; do not rank |
| 2 | l02, l07 | "show how good an AI model is now, not how well it learns"; "Plasticity is the test score gain for each dollar..." |
| 3 | l04, l05 | "reviews its games and writes a chess program and notes"; "The model never changes, but each new round starts with its programs and notes." |
| 4 | l04, l05 | "a chess program and notes", "its programs and notes". The card shows Sol's two files. |
| 5 | l07 | counted: test score gain; divided by: dollars the model spends to learn |
| 6 | l06 | "test games. It never reviews them, so gains there show real progress." |
| 7 | l01, l08 | "With the same practice, Fable 5 and Sol gained a lot, but Luna did not." |
| 8 | l09 | "Fable 5 ended with the best test score, but Sol had the best plasticity." Two different models. |
| 9 | l10, l11, l12 | "Luna almost never used its programs and notes. Models that used them less gained less. This is a link, not proof." / "...fewer mistakes, but still made some." / "The paper does not know if the programs, notes or their use are weak." |
| 10 | l13 | "These estimates depend on the games and prices, so they do not rank models." |
| 12 | six items | model unchanged l05; programs and notes l04, l05; test games never reviewed l06; cost in dollars l07; best score is not best plasticity l09; not a ranking l13 |

Traps and where each is blocked: "the model retrains" (l05 "never changes"); "a human writes the notes" (l04 "it ... writes"); "298 is a gain" (unit label); "Sol is the best model" (l09 gives each model its own best, l13 label); "98% is the use rate" (l10 "almost never used", hollow squares); "the notes cause the mistakes" (l11 "fewer mistakes"); "less use caused less gain" (l10 "link, not proof").

## 5. Length

| Basis | Result |
|---|---|
| Brief's formula: 2.9 spoken words a second, 0.75 s lead and tail per line, 1.85 s on the last line | 74.6 s |
| v1's measured pace: 186 words in 58.4 s of voice, 3.18 words a second | about 69.0 s |

13 lines, 185 spoken words (the only digits in the narration are the 5 in Fable 5, twice, read as "five"). The grader's table has 171 words, which is 69.8 s on the same formula. Mine is 14 words longer: +11 in l10 (the Luna sentence and the spoken hedge, minus the words saved by writing "them" for "their programs and notes"), +2 in l03 (the game names), +1 in l06 (the split), +1 in l12 ("Why?"), -1 in l11. If the real take runs long, cut in this order: "also" (l06), "new" (l05), "Why?" (l12), about 1 s together. The l10 hedge is the last thing to go.

Cheap from v1: robot cards and padlock (wake), axes and rise-over-run (plot), crossing lines and two bars (twist), the 50-square grid (why), dials and stamp (close). New: three boards, the program and note cards, two piles of games, the three-line chart, the three question cards, the end card.

## 6. STE result

`node paper-reels/hf/bin/ste.mjs paper-reels/episodes/_scratch_agentPlasticity_v2` (scratch folder since removed; its storyboard is kept as `round2/scratch-storyboard-v2.json`): 0 hard, 0 soft findings in 13 lines (185 words). The first pass had one soft finding, a possible noun cluster in l03 ("AI model plays board games"). I fixed it by naming the games ("plays chess, Go and Hex"), which is also more concrete. `ste.allow` is empty. Checked by hand beyond the tool: no modal verb, no -ing form, no phrasal verb, active voice, simple present for method and caution, simple past for results. The longest sentence has 15 words (l02, l08).

## 7. Where I disagree with a critic

1. The grader (fix 3): the three spoken sentences should be about groups, and only a label names Luna. I name Luna in the first sentence of l10. A stranger sees Luna's flat line at l08 and has to join "gained less" to a face two lines later; the name does that for 8 words (about 2.8 s). Luna is also the model in the l01 picture, so the hook gets its answer.
2. The grader (fix 3): "This is a link, not proof." as a label. I speak it, in l10 right after the claim it qualifies. Quiz v2 Q9 asks "how sure is the paper about the cause", and the brief's own rule says a label may not carry an answer alone. The 6 words are the cost.
3. The grader (fix 8): cut all three strips. I keep two, changed. The owner wants real pages read on camera. The v1 strips repeated the caption word for word, two of them in the paper's jargon, and the third came before its example. The two new phrases are the paper's own plain sentences, and the narration says the same thing in plain words as the highlighter moves. If you judge they still teach nothing, the fallback is the source tag, which every other line already carries.
4. The paper-faithful critic (beat 7): speak the full names (Claude Fable 5, GPT-5.6 Sol, GPT-5.6 Luna). The voice would say "G P T five point six" twice, about 3 s for names that the screen shows in the model's colour. I speak the short names and show the full ones.
5. The paper-faithful critic (term table): "fit this setup and these prices". I say "depend on the games and prices". The novice did not know what "setup" meant, the paper's Finding 1 calls the effect task-dependent, and the Sol label makes "games" concrete. The cost: the third dependency (curve-fit assumptions) is carried only by the word "estimates".
6. The grader (fix 7): "orange means used". Amber is Fable 5's colour under fix 6, so I use filled and hollow.
7. Small: "Estimates" is spoken (l13) and labelled (l09). The brief asked only for the label.

## 8. Questions to the critics

1. To the grader: l10 says "This is a link, not proof." and l12 says "The paper does not know if the programs, notes or their use are weak." Together, do they meet Q9's "likely causes, not proven ones" from the narration alone, or does the minimum need the words "likely cause" spoken?
2. To the paper-faithful critic: l06 says "so gains there show real progress". The paper says the test results "provide evidence" that the programs and notes help beyond the data the review used (p. 6), and Go and Hex keep their test seeds fixed across rounds (p. 20). Is "show real progress" safe, or should it read "give evidence of real progress" (+2 words)?
3. To the paper-faithful critic: l09 turns "highest fitted performance level on the combined three-game curve" (p. 7) into "ended with the best test score". Is that fair for a stranger, or does it need "on average over the games"?
4. To the cold novice: from the script alone, after l06, do you know what "its games" and "test games" are, and does "reviews" mean looking back at games to find mistakes? Which line, if any, do you mark lost?
5. To the cold engineer: does "the programs, notes or their use are weak" (l12) parse, and does "Why?" tell you that "weak" explains the mistakes of l11?

## 9. Notes for the build

- Receipts: the l02 phrase starts a line at the left margin (the third line of the abstract), so `follow: 0` with a left-aligned start works. The l13 phrase ends a long line on p. 7, so left-align it with a margin and `snap` the hold. Both crops may show other figures (the p. 7 paragraph above the phrase has 298, 233, 57 and 14): list what shows under `evidence_incidental`.
- l04 and l05 cards are drawn, not cropped. Fig. 14 is a raster figure and QA cannot read numbers inside it.
- Source tags carry section and page digits. Put them in `facts.json` as sources.
- l08 and l09 start points come from Fig. 1 (p. 1). Do not invent them. The Hard-chess point gains of Fable 5 and Sol are alike (about 36 and 37, p. 6), so no picture or label may say Sol gained more points.
- Left out on purpose: the stronger-opponent results (abstract), the GPT-5.5 reuse drop, Opus 5 (233) and Opus 4.8 (14), the NetHack numbers, Gemini 3.1 Pro as the judge.
