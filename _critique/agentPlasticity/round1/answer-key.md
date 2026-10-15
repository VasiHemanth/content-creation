# Answer key, round 1: Agent Plasticity quiz

Paper: arXiv 2610.08902v1, "Agent Plasticity: Measuring Self-Improvement Through Experience" (Singh et al., 6 Oct 2026).

Ground truth is the paper only: main text pp. 1 to 11, plus Appendix B (setup, pp. 19 to 20), Appendix C (NetHack, pp. 21 to 22) and Appendix G (failure analysis, p. 33). Page numbers are PDF pages, which match the printed ones. This key was written before the video kit was opened.

Words used below, with the paper's term in brackets: practice game [training game]; test game [held-out game]; round [checkpoint]; saved tools and notes [artifact inventory]; review [reflection]; cost [learning cost]; mistake [identified failure].

## 0. Facts that cut across questions

Graders and the video are both likely to slip on these.

1. **Update cadence.** The saved tools and notes change once per round, not after each game. In Hard chess a round is: play 16 practice games, 12 test games at practice difficulty and 12 test games against stronger opponents, all with the current tools and notes. Then the model reviews the 16 practice games and edits its files (Sec. 3.1, p. 6). Every game starts in a fresh context: chat history and temporary files do not carry over (Sec. 2.1, p. 3). An edit must pass structural and executable checks. A rejected edit leaves the files unchanged and still costs money (pp. 3 to 4). So "between one game and the next" in Q3 is a simplification of "between one round and the next".
2. **Test games.** The agent plays them with its current tools and notes, but neither their moves nor their scores ever reach the review step (Sec. 2.1, p. 4). "In-distribution" (ID) test games have the same difficulty range as practice. "Out-of-distribution" (OOD) test games use stronger opponents in the same game. The paper says this tests transfer across opponent difficulty, not transfer to unrelated tasks (p. 4). NetHack has no test-game split. Its ten fresh games per round are scored and then all ten are reviewed, and changes across rounds mix learning with game difficulty (pp. 6, 20, 21). Do not accept "all four games used test games".
3. **Scope of 298, 233, 57, 14.** They come from the combined curve of chess (Hard and Easy), Go and Hex, averaged equally, for the six models tested in all three games (Sec. 3.4, p. 7). Each one is the test-score gain up to the fitted 90% point of the rise, per $1,000 of mean per-game cost, in percentage points (Sec. 2.2, p. 5). It is a rate, not a gain: 298 cannot mean a 298-point gain on a 0 to 100 scale. Luna's 0 is assigned by rule when the fitted 90% rise is under 10 percentage points (p. 5). GPT-5.5 has no value because it is still rising (p. 7). Neither one means "worst". The NetHack value 61.75 (Opus 5.5) uses a different, rescaled score (p. 21) and cannot be set beside 298.
4. **Hard-chess before and after** (test games at practice difficulty, Sec. 3.2, p. 6): Fable 5 37.5% to 73.3%; Opus 5 25.0% to 66.4%; Sol about 0% to 36.9%. "Before" is round 0. "After" is the average of rounds 16 to 20. "Fable 5 has the highest endpoint" refers to the fitted level on the combined curve (pp. 3, 7). Keep these apart from the per-dollar figures in any single claim. The point gains of Fable 5 (about 36), Opus 5 (about 41) and Sol (about 37) are close, so 298 against 57 must not be read as "Sol gained five times more points".
5. **Sol is the paper's own counterexample to "Sol is the best learner".** In NetHack its mean score falls from about 570 to about 420 (Sec. 3.3, p. 7). The paper says plasticity depends on the protocol and is not a universal ranking of models (p. 7).
6. **Reuse figures.** "About 98%" for GPT-5.6 Luna is the share of relevant decisions WITHOUT any saved tool or note in use (Sec. 3.5, p. 8; pooled Hard and Easy chess). It is easy to invert. The others are Gemini 3.1 Pro 87%, Opus 4.6 51% and GPT-5.5 28%, against 2 to 6% for Fable 5, Opus 5, Opus 4.8 and Sol. That is half of the finding. The other half: those four use their saved items in 94 to 98% of relevant chess decisions yet end with very different scores, and 83 to 99% of their remaining mistakes happen while a relevant tool or note is in use (p. 8). A "relevant decision" is a move where at least one saved item is relevant to choosing it, used or not (p. 5). All of this is observational. The labels come from Gemini 3.1 Pro reading the saved games together with execution logs (p. 5, App. G p. 33). The paper adds that use of a tool does not by itself show that the tool works (p. 5).

## A. The paper in six plain sentences

Counting rule: split on spaces; a hyphenated word and a number each count as one word. Each sentence has no -ing form, no modal verb and no phrasal verb, so the six can seed the story beats in the critique.

| Part | Sentence | Words |
|---|---|---|
| Problem | Most tests show how good an AI agent is now, not how well it learns. | 15 |
| Idea | The paper measures score gain on games the agent never reviews, divided by dollars spent. | 15 |
| Method | The model stays fixed; after each round it edits its own saved tools and notes. | 15 |
| Result | With equal chances to learn, some models gained a lot; others stayed flat or declined. | 15 |
| Surprise | The model with the top final score did not gain most per dollar. | 13 |
| Caution | The numbers fit one setup and four games; they do not rank the models. | 14 |

Sources: Problem, abstract p. 1 and Sec. 1 p. 2. Idea, Sec. 2.1 p. 4 and Eq. 3. Method, Sec. 1 p. 2, Sec. 2.1 p. 3, Sec. 3.1 p. 6. Result, abstract p. 1, Sec. 3.2 p. 6, Finding 1 p. 7. Surprise, Sec. 1 p. 3, Sec. 3.4 p. 7, Finding 2 p. 8. Caution, Sec. 3.4 p. 7, Sec. 4 pp. 10 to 11.

The Idea sentence carries the test-game condition because "gain" means nothing without it. The Surprise is surprising because a high final score is usually read as proof of good learning, and the paper shows the two come apart.

## B. Questions

### Q1 (free-form)

A good two-sentence answer has three parts.
- What happens: top AI agents play a game many times and improve by writing and saving their own tools and notes, while the model itself stays the same.
- What is new: a way to measure how well and how cheaply they learn, besides how well they play.
- What was found: models differ a lot, and the best final player is not the best learner per dollar.

Weak signs: "AI is getting smarter" (no mechanism); "a new AI that plays chess" (wrong object); "a ranking of AI models" (the paper says it is not one); "AI trains itself" with no word on the model staying unchanged.

### Q2 Missing in usual tests, and what the paper adds

Ground truth. Usual tests measure what an agent can do at one point in time, not how well it learns (abstract p. 1; Sec. 1 p. 2). A final score alone hides three things: the agent may have started strong, two agents may gain the same amount at very different cost, and gains may not carry beyond the games that produced them (p. 2). The paper adds a way to measure, not a new way to make agents improve: a protocol with a frozen model, a fresh context per game, self-written tools and notes, test games at every round and cost counted in dollars (Sec. 2, pp. 3 to 4); one number, plasticity (Sec. 2.2, pp. 4 to 5); and a trace of where the improvement breaks (Sec. 2.3 and 3.5, pp. 5, 8 to 9). It describes its work as a measurement problem that complements work on improvement methods (p. 2).

Minimum. "Usual tests take a snapshot of skill. This paper measures how much an agent improves from practice, and at what cost."

Likely misreading. "The paper invents a way to make AI improve itself" (it measures; it does not propose a method). "Usual tests are too easy or unfair." "What is missing is a harder game."

### Q3 What changes between games, and what does not

Ground truth. The model does not change: its weights are frozen, and the same model both plays and reviews (Sec. 1 p. 2; Sec. 2.1 p. 3; Sec. 3.1 p. 6). What changes is the agent's saved set of tools (Python code), strategies or skills (written rules) and memory (text notes), which the model edits after it reviews the practice games (p. 3). Each game starts with a blank context, so only the saved files carry over (p. 3). The edit happens once per round (fact 1).

Minimum. "The AI model itself does not change. It rewrites the tools and notes it saves, and the next games start from those."

Likely misreading. "It retrains or updates its brain (weights)." "It remembers the last game's chat." "A human edits the notes." "It changes after every single game."

### Q4 What "artifacts" are

Ground truth. The persistent files an agent writes for itself: executable Python tools, written strategies or skills, and text memory (Sec. 2.1, p. 3). The paper's own short version is that the agent carries forward code and notes it can use again (Sec. 3.5, p. 9). Examples:
- Fable 5 first writes its own chess engine (a program that searches ahead to choose moves). It then adds fixes after specific mistakes: a search for moves that leave check, different handling of repeated positions, more search time in endgames (p. 9).
- Sol's chess engine, written at round 1, plays every move of its round-18 game (App. E, Fig. 14, p. 25).
- Opus 5.5 in NetHack adds a rule to pray only through its own controller after it dies while praying (Fig. 8, p. 10; App. D, Fig. 12, p. 23).

Minimum. "Files the AI writes and saves for itself, such as code tools, rules and notes, that later games load", plus one example.

Likely misreading. The word means glitches or visual errors; old relics or leftovers; the game record; part of the model; something humans wrote.

### Q5 Plasticity

Ground truth. Plasticity is how efficiently an agent turns experience into later gains on held-out games (abstract p. 1; Sec. 1 p. 2).
- Counted: the gain in score on test games, score now minus score at round 0. Score is 100 x (wins + 0.5 x draws) / games (p. 6).
- Divided by: the cost so far in dollars. It covers the model calls that play the practice games and write the new tools and notes, including rejected tries (Sec. 2.1, p. 4; Eq. 3).
- The headline version, P_sat, takes the gain up to the point where a fitted curve reaches 90% of its rise, divided by the cost at that point, in points per $1,000 (Sec. 2.2, p. 5).
- It can be negative, and it falls if the score levels off while cost keeps rising (p. 4). The cost is a dollar proxy and does not measure physical computation (p. 4).

Minimum. "How many points of score on new games an AI gains for each dollar spent on its practice and revision."

Likely misreading. "How smart or how high-scoring it is." "How fast it improves in time or per game" (no cost). "How flexible it is" (everyday sense of the word). "How many tools it writes." Reading "per $1,000" as a price tag ("it cost $298").

### Q6 Why score on games it did not practise on

Ground truth. Test games check whether a gain carries beyond the practice games. The agent plays them each round, but neither the moves nor the scores reach the review step (Sec. 2.1, p. 4). So the gains are evidence that the saved tools and notes help beyond the data the review step saw (Sec. 3.2, p. 6). A second set uses stronger opponents to check transfer, and gains there are generally smaller or less consistent (pp. 6 to 7).

Minimum. "A score on practice games could just show the AI memorised them. New games it never reviewed show real improvement."

Likely misreading. Held-out means games kept secret from humans or viewers; games the AI skipped or lost; a different game or task (the paper says OOD is not new tasks, p. 4); games the agent never plays (it plays them and never reviews them).

### Q7 Main finding about the models

Ground truth. With the same setup and comparable chances to learn, frontier models follow sharply different improvement paths. Some gain a lot and keep it. Others stay near their start or decline (abstract p. 1; Sec. 3.2 p. 6; Finding 1 p. 7).
- Hard chess, test games: Fable 5 37.5% to 73.3%; Opus 5 25.0% to 66.4%; Sol about 0% to 36.9%. Opus 4.8 improves modestly, mostly in Easy chess (0% to 19.0%). Several stay flat and a few decline (p. 6).
- It depends on the game: Opus 4.8 loses ground in Go but gains in Hex (p. 7). In NetHack only Opus 5.5 shows a clear persistent gain (p. 7).
- Gains against stronger opponents are smaller or less consistent (pp. 6 to 7).
- The shared learning setup allows improvement but does not guarantee it (p. 6).

Minimum. "Given the same chance to learn, some models improved a lot and others stayed flat or got worse."

Likely misreading. "All AI models improve themselves." "The newest or biggest model learns best." "Claude beats GPT" or the reverse. "Self-improvement is solved."

### Q8 Two kinds of "best"

Ground truth. Endpoint capability (how high the final score gets) and acquisition efficiency (plasticity, gain per dollar) are different things. Fable 5 reaches the highest fitted level on the combined curve (pp. 3, 7). Sol has the highest estimated plasticity, 298 points per $1,000, against Opus 5 at 233, Fable 5 at 57 and Opus 4.8 at 14 (Sec. 3.4, p. 7). So one model does not win both. Sol also starts below Opus 4.8 yet ends above it in score and in plasticity (Finding 2, p. 8). In Hard chess Sol goes from about 0% to 36.9%, and Fable 5 from 37.5% to 73.3% (p. 6).

Minimum. "Best final score against best gain per dollar. Fable 5 had the best final level. Sol had the best gain per dollar. Different models."

Likely misreading. "Sol is the best model" (its NetHack score fell, p. 7). "Sol gained five times more points" (Hard-chess point gains are about equal; 298 is a rate). "Sol is the cheapest model to run." "Plasticity and capability are the same thing."

### Q9 Why some agents improved less

Ground truth. Low reuse goes with weak improvement. Luna takes about 98% of relevant decisions without using a saved tool or note, Gemini 3.1 Pro 87%, Opus 4.6 51%, GPT-5.5 28%, against 2 to 6% for the four best improvers (Sec. 3.5, p. 8). Across 19 model-game cells, reuse tracks the gain, so the paper treats reuse as a candidate bottleneck (p. 8). A plain example: in one GPT-5.5 run, the review step kept telling the agent to load its saved program first, yet the agent still began by listing and reading files (p. 9).

But high reuse does not close the gap. Fable 5, Opus 5, Opus 4.8 and Sol use their saved items in 94 to 98% of relevant chess decisions and still score very differently. 83 to 99% of their remaining mistakes happen while a relevant tool or note is in use (p. 8). So the tool may be weak, may not fit the position, or may be applied badly. The paper does not separate these causes (pp. 8, 10) and calls the analysis observational, not causal (pp. 5, 10).

Minimum. "Some agents did not use the tools and notes they saved. Others used them and still made mistakes, so the tool or the way they used it was the weak point. The paper treats these as likely causes, not proven ones."

Likely misreading. "They were just weaker models." "They wrote bad notes" (only half). "More reuse always means more gain" (Finding 3, p. 9: reuse is not a proxy for capability). Reading 98% as the reuse rate (inverted). Stating the cause as proven.

### Q10 What not to conclude from the numbers

Ground truth. The paper treats plasticity as a measure tied to the protocol, not a universal ranking of models (Sec. 3.4, p. 7), and as a property of an agent under one learning protocol, not a fixed trait of the underlying model (Sec. 4, p. 10). The values depend on provider prices, saturation-fit assumptions, score headroom and the learning horizon. Small differences should not be read as rankings, and test sets are finite and noisy (pp. 7, 10 to 11). Also:
- The cost is a dollar proxy, not physical computation (p. 4).
- The numbers do not separate the value of game feedback from the extra compute spent on review (pp. 7, 10).
- The reuse results are observational (p. 5).
- Gains against stronger opponents are smaller and less consistent (pp. 6 to 7).
- Difficulty scales are game-specific, not a common Elo scale (p. 19).
- Separately trained agents do not show that tools or skills carry across tasks (pp. 10 to 11).
- See also facts 3 to 5 above.

Minimum. "These numbers do not rank AI models in general. They hold for this setup, these games and these prices." One more caution is a bonus: rate, not gain; observational; partial transfer.

Likely misreading. "Sol is the best AI." "Fable 5 is poor because 57 is small." "298 means a 298-point gain or a $298 price." "AI can now improve itself without limit" (gains level off and some agents decline). "Reuse causes improvement." "The dollars are what it cost to train the model."

### Q11 (free-form)

No ground truth. A useful answer names one line id or one picture and says what was missing: a word used before it was explained, a number with no unit or no comparison, a chart whose axes were never read out. "Nothing" and "everything" carry no signal and should be flagged. After grading, check the named item against the script.

### Q12 (free-form)

A good three-sentence answer covers three things.
- Setup: an AI model that never changes writes and saves its own tools and notes between rounds of a game.
- Measure: score gain on games it never reviewed, per dollar spent, which the paper calls plasticity.
- Result and caution: models differed a lot, the best final player was not the best learner per dollar, and the numbers do not rank models.

Pass: at least four of these six items are present: model unchanged; saved tools and notes; new games it never reviewed; cost in dollars; best final is not best per dollar; not a ranking.

## C. Grading rule

The viewer understands the paper if the minimum answer is met on at least 7 of Q2 to Q10, including Q3, Q5, Q8 and Q10, and Q12 passes. An answer that holds a listed misreading fails that question even if it also holds a correct phrase.

## D. Numbers the paper gives (for checking any claim in the video)

| Number | What it is | Where |
|---|---|---|
| 37.5% to 73.3% | Fable 5, Hard chess, test games at practice difficulty: round 0 against the mean of rounds 16 to 20 | Sec. 3.2, p. 6 |
| 25.0% to 66.4% | Opus 5, same setting | p. 6 |
| about 0% to 36.9% | Sol, same setting | p. 6 |
| 20% to 80% | Fable 5 in Go, test games at practice difficulty, round 0 to round 20 (stronger opponents: 0% to 50%) | Sec. 3.3, p. 7 |
| 40% to 77.5% | Sol in Hex, same kind of test games (stronger opponents: 28.1% to 78.1%) | p. 7 |
| 298, 233, 57, 14 | Plasticity to saturation for Sol, Opus 5, Fable 5, Opus 4.8: test-score points per $1,000 of mean per-game cost, combined chess, Go and Hex | Sec. 3.4, p. 7 |
| 0 (Luna) | Assigned by rule: fitted 90% rise under 10 percentage points | pp. 5, 7 |
| not established (GPT-5.5) | Still rising at the end of its runs | p. 7 |
| 61.75 | Opus 5.5 in NetHack: normalized points per $1,000 on a rescaled score, saturation at round 11. The other five models show no reliable rise | pp. 6, 7; App. C p. 21 |
| about 2k to about 6k | Opus 5.5 NetHack mean score, rounds 0 to 2 against rounds 36 to 40 | p. 7 |
| 98%, 87%, 51%, 28% against 2 to 6% | Share of relevant decisions with no saved tool or note in use: Luna, Gemini 3.1 Pro, Opus 4.6, GPT-5.5, against the four best | p. 8 |
| 94 to 98%; 83 to 99%; 0.16 against 0.38 | Reuse of the four best; share of their remaining mistakes made while using a saved item; mistakes per relevant decision, the four best against the other models | p. 8 |
