# Cold viewer, software engineer (cold-engineer-2)

I read only script-v2.md and quiz-v2.md. The quiz is at agentPlasticity/quiz-v2.md (there is none in round2/). I looked nothing up.

Limit of this test: I read a plan and can re-read it, while a real viewer hears each line once at roughly 2.5 words per second (185 words in about 75 s). A real viewing would leave me with less than what follows, mostly in the numbers and the small labels.

Source tags. No tag means the narration. (big) is large on-screen text or the main picture. (small) is a small label I would probably miss at speaking pace. (picture) is something only the picture shows. [my background] marks what I filled in as a software engineer and [guess] marks guesses. About Fable 5, Sol and Luna I know only the name tags. I take Claude and GPT to be vendor names [my background].

## 1. About the video

It is about a research paper that tries to measure how well an AI model learns, instead of how good it is today: a model that never changes plays chess, Go and Hex round after round, writes itself programs and notes after each round, and is scored on test games it never reviews, with the score gain per dollar called plasticity. In the results Fable 5 and Sol gained a lot and Luna did not, Luna almost never used its own programs and notes, and the video ends by saying the numbers do not rank models.

## 2. The gap and what the paper adds

Missing: the usual tests show how good a model is now, a score today, and say nothing about how well it learns (l02). I took "usual tests" to mean fixed benchmarks with one score [my background]. The video names no example.

Added: a way to score learning. The model practises over rounds and carries forward programs and notes it wrote, it is scored on test games it never reviews, and the gain is divided by the dollars spent. The video calls that plasticity (l03 to l07). It never says in one sentence that plasticity is the answer to the gap in l02. I joined the two myself, helped by "to learn" in l07.

## 3. What changes between rounds

Changes: what the model starts a round with. After a round it reviews its games and writes a chess program and notes, and the next round starts with them (l04, l05). Does not change: the model itself, "never changes", shown by a padlock (l05, big). I read that as frozen weights and no fine-tuning [my background]. The video never says weights or training, and a non-engineer could take "never changes" to mean "never improves". `not conveyed`: whether each round replaces the old files or edits them [guess: edits, since the files carry forward].

## 4. What it saves

Two things it wrote itself after reviewing its games: a program (code that plays chess) and notes (written instructions for the next round). The narration says only "a chess program and notes", so the example comes from the picture: Sol's chess_engine.py, and a note START_HERE.md headed IMMEDIATE ACTION above a line that runs the program (small, l04). In a later round "its program plays every move" (small, l05) and Sol wins (picture, l05). START_HERE.md reads to me like an AGENTS.md file, and the program like a tool the model builds for its later self [my background]. A non-engineer would hear "program" without knowing it is code that runs by itself. `not conveyed`: what the notes say beyond the heading.

## 5. Plasticity

How much the test score goes up for each dollar the model spends learning (l07; the word PLASTICITY is big). Counted: the test score gain. Divided by: the dollars spent. The dollars pay for its games and its reviews (small, l07). The unit is points per $1,000, "a rate, not a total" (small, l09). `not conveyed`: what a score point is (win rate, rating, something else), the scale, and the stretch of rounds the gain is taken over [guess: first round to last]. I read "the model spends" as the compute or API bill [my background].

## 6. Which games the score is measured on

The test games, which the model plays but never reviews. Reason given: because it never reviews them, gains there "show real progress" (l06). A small label adds that a gain on reviewed games may not carry over. This is the held-out test set idea [my background]. `not conveyed`: whether the test games are chess, Go and Hex again or something else [guess: fresh games of the same three], who the opponent is, how many games, and what the score is. A small label in l13 mentions "board games" and "another game", so one of the games may not be a board game, but the narration never says so.

## 7. Main finding

With the same practice, Fable 5 and Sol gained a lot on test score and Luna did not (l08). Fable 5 ended with the best test score and Sol had the best plasticity (l09). Luna almost never used its programs and notes, and models that used them less gained less (l10). `not conveyed`: how big "a lot" is (I saw no values on the chart), how many models were tested (three are named, and a small label in l11 adds "two other models" [guess: five in all]), and anything per game.

## 8. Two kinds of "best"

Best final test score went to Fable 5. Best plasticity, meaning test-score gain per dollar, went to Sol. The video says they are different models ("but", l09). Its example is the two bars: Sol 298 against Fable 5 57 (big), in points per $1,000 (small). Both can be true because plasticity divides gain by dollars, so a model can finish lower and still gain more per dollar, but the narration does not say this. The picture shows Sol's line starting below Fable 5's (picture, l08), so I assume Sol started lower [guess]. The five-fold gap next to a lower final score is explained only by the definition, never shown.

## 9. Why some models improved less

The video's answer: Luna almost never used its programs and notes (98%, big), and models that used them less gained less (l10). The 98% is "of these chess moves", and which moves is explained only by a small legend: one square per move where a program or note applied, filled for used and hollow for not used (small). I first read 98% as all of Luna's moves, which is a different claim. How sure: not very. "A link, not proof" tells me it is a pattern across models with no demonstrated cause [my background: correlation, not causation]. l12 adds that the paper cannot tell whether the programs, notes or their use are weak. I read that as being about the mistakes in l11 and not about the gain gap [guess]. `not conveyed`: why Luna did not use its own files, and how many models the link is drawn from.

## 10. What not to conclude

That the numbers rank the models, or that Sol or Fable 5 is simply the best model. The estimates depend on the games and the prices, so they "do not rank models" (l13; the NOT A RANKING stamp is big). Also that using programs and notes has been shown to cause the gains (l10). Two small labels add more: 298 and 57 are rates, not totals (l09), and Sol gained in board games but lost score in another game (l13), which I read as a warning against generalising [guess].

## 11. What confused me most

First, l12, "Why? The paper does not know if the programs, notes or their use are weak." "Why?" has no object. I guessed it pointed at the mistakes in l11, but the narration never ties "weak" to "mistakes", and l10's gain gap was still a candidate. I was also unsure whether the paper is saying something is weak or only that it cannot say where the problem sits. Second, l11, which l12 leans on: "mistakes" is never defined. Mistakes in what (a bad chess move, an illegal move, ignoring a note, a bug in the program)? The grid with X marks is explained only by a small legend that says "X: a mistake". Third, l10: "used" is never defined, and I could not see why a model would skip files it wrote itself [my background: I would guess an agent loop where running the file is optional, but the video does not say so].

## 12. Three sentences

This paper says most AI tests show how good a model is today but say nothing about how well it learns, so it lets a model that never changes play chess, Go and Hex round after round, write itself programs and notes after each round, and then scores it on test games it never reviews. It calls the test-score gain per dollar spent plasticity, and in the results Fable 5 and Sol gained a lot while Luna did not and almost never used its own programs and notes. Fable 5 had the best final score and Sol the best plasticity, but the numbers depend on the games and prices so they do not rank models, and the paper cannot say why even the heavy users of programs and notes still made mistakes [guess].

## Ratings

- (a) 4. In the first 10 seconds I knew the topic: how well models learn from practice, and that usual tests miss it. The two named models and the flat score bar make the hook concrete. I took off a point because "practice" and "improves" stay vague, and the narration first mentions a paper only in l12 (the paper framing in the opening is a small tag).
- (b) 3. The beginning is clear (l01, l02). The middle runs in a sensible order: setup, metric, results (l03 to l09). The end drifts through a usage link, mistakes, an unknown cause and a caveat (l10 to l13). The hook question, why only one improves, gets a partial answer in l10 and is then left. The video ends on a warning and does not return to what the paper shows.
- (c) 3. "Plasticity" and "test games" were explained as they arrived, and programs and notes were shown. "Round", "used" (l10), "mistakes" (l11), "weak" (l12), "estimates" and "prices" (l13) were used with no narrated explanation. Hex and "score" were never explained.
- (d) 3. I can retell the setup, the metric and the headline results (question 12). I could not say what the score is, who the opponent is, how many rounds or models there were, what a mistake is, or why Luna ignored its files. I followed some lines partly through my background: code plus an AGENTS.md-style note (l04), frozen weights (l05), compute or API cost (l07, l13). A non-engineer would probably lose parts of those lines and rate this 2 [guess].

## Line-by-line log

| Line | Rating | Reason |
|---|---|---|
| l01 | clear | Same practice, only one improves. "Practice" and "improves" stay vague until later. |
| l02 | clear | Tests give a score today, not how well it learns. I first took "learns" to mean weight updates [my background]. |
| l03 | clear | Three games, many rounds. The opponent and the games per round are not said. |
| l04 | clear | I read it as code plus an AGENTS.md-style note [my background]; non-engineer: partly. "A chess program" after three games is odd. |
| l05 | clear | Frozen model, files carried forward. I read "never changes" as frozen weights [my background]; non-engineer: partly. |
| l06 | clear | Held-out test games, so gains are real. Which games and what the score is are not said. |
| l07 | clear | Short definition plus the big word. What a point is and what the dollars cover (small) are not narrated. |
| l08 | clear | Fable 5 and Sol up, Luna flat. A third model appears with no introduction, and "a lot" has no number. |
| l09 | clear | Two different "bests" are plain. Why a much higher plasticity goes with a lower final score is only inferable. |
| l10 | partly | Message lands, but "used" is undefined, I read 98% as all of Luna's moves, and why Luna skipped its files is not said. |
| l11 | partly | Heavy users erred less, not never: gist only. I cannot say what a mistake is, and the jump from gain to mistakes is abrupt. |
| l12 | partly | It parses, but "Why?" has no clear target and the narration never ties "weak" to "mistakes". |
| l13 | clear | Do not rank: plain, with a big stamp. "Estimates" points back to a small label in l09, and "prices" took my background (API prices); non-engineer: partly. |

## Extra

### (a) The wording of l12

Does "the programs, notes or their use are weak" parse? Yes, on one hearing, with a small effort. I read it as: the programs may be weak, the notes may be weak, or the model may use them badly. It has three snags. "Weak" has to change meaning down the list (code quality, note quality, how well the model applies them). "Or their use are weak" is the clumsiest stretch, since "use" is singular and "are" is plural. And "does not know if ... are weak" reads literally as "does not know whether these are weak", which differs from "cannot tell which of them is to blame". The second meaning comes only from the small label "The paper cannot tell which." As an engineer I recognise the split (bug in the tool, bad docs, bad usage) [my background], which helps me. Verdict: it parses, it is awkward, and it is not lost.

Does "Why?" tell you that "weak" is the explanation for the mistakes in l11? Not by itself. "Why?" has no object. I attached it to the mistakes because l11 came right before it, but the other candidate stayed open: why models that used their files less gained less (l10). Nothing in the narration ties "weak" to "mistakes". The only word that does is "causes" in the small quote on screen. There is also a second collision. In l10 "use" meant how often a model used its files, and in l12 "their use ... weak" has to mean how well, with no signal that the meaning changed. Verdict: reading l12 as the explanation for l11 is a plausible inference from adjacency. The narration does not give it.

### (b) The one line I would rewrite

l12, rewritten. One rewrite fixes the three problems above: the missing object of "Why?", the unstated tie between "weak" and "mistakes", and the clash over "use". My version: "Why? The paper cannot tell if weak programs, weak notes or poor use cause the mistakes." It is one word longer than the original. I would not cut l11 instead, because l12 would then attach to l10, where use has just been shown to be low, and "their use" would read as something already known. "Mistakes" in l11 stays undefined, but the new l12 uses the word again, so the two lines read as one point. I judged only how easy the video is to follow, not fidelity to the paper.
