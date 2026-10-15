# Cold viewer answers: engineer 3, agentPlasticity v3

Method. I went through l01 to l14 in order, three frames each, and judged the narration first. Source tags: (voice) means the narration said it, (screen) means a large label or drawing showed it, (small text) means only a small caption or label showed it, which I would probably have missed at speaking pace on a phone. [my background] marks facts I filled in from engineering knowledge. [guess] marks guesses.

Gaps between script.md and my frames. script.md lists on-screen text that appears in none of my three frames, including: in l04 the "its games" label; in l10 the "98%" figure, the square legend and "A second model judged this from the game logs"; in l12 "poor use?"; in l13 "Sol gained in board games but lost score in another game". I did not count these as seen. I cannot tell whether they appear briefly between my frames.

## 1

The video explains one paper (arXiv 2610.08902, whose full title, "Agent Plasticity: Measuring Self-Improvement Through Experience", appears only on the last card). It says ordinary AI tests show how good a model is today, so the paper defines plasticity, the test-score gain per dollar for a model that practises board games and saves programs and notes between rounds, and it compares three named models while warning that the numbers are not a ranking.

## 2

Missing (voice, l02): most tests show how good a model is now and say nothing about how well it learns. The picture is a single dot labelled "score today" with a dashed arrow up to "how well it learns?" (screen). The paper crop behind it ("at a fixed point", "rather than how effectively it learns") is too small to read at speed and only repeats the narration.

Added (voice, l07): a measure of learning called plasticity, the gain in test score per dollar spent learning. It comes with a setup (voice, l03 to l06): a model that never changes practises over rounds, saves programs and notes, and is scored on test games it never reviews.

## 3

Not changed (voice, l05): the model. A padlock labelled "model: never changes" shows it (screen). I read "model" as its weights [my background]; the video never says weights or fine-tuning.

Changed (voice, l05): what each round starts with, which is the programs and notes it wrote earlier. The same robot sits in a "this round" box and a "next round" box, and small file cards ride along into the second box (screen).

## 4

It saves code it wrote and written notes for itself, produced after it reviews its games (voice, l04). I think of the program as a script or tool and the note as a memory file like AGENTS.md [my background].

Example (screen, l04 and l05): in chess, Sol wrote chess_engine.py, tagged "a program", and START_HERE.md, tagged "a note". The note's large handwritten text reads "IMMEDIATE ACTION" (in red) and "DO NOT INSPECT" (in dark ink); I took it as an order to run the program at once without checking [guess]. Small text in l05 gives the payoff: before it had a program, Sol lost; in a later round "its program plays every move, and Sol wins." So in that game the saved program, not the model, chose every move. The voice never says that.

## 5

In plain words (voice, l07): how much the test score rises for each dollar the model spends to learn. Counted: the test-score gain (screen: a curve rising from a start dot, with a bracket "test score gain"). Divided by: dollars (screen: a "per dollar" bracket along the x-axis and a row of coins).

Small text only: "Score: the share of points won", "Dollars pay for its games and its reviews", and (l09) "points per $1,000: a rate, not a total". So the score is a win share, the dollars are what its own games and reviews cost (I would call that API usage cost [my background]), and Sol's 298 and Fable 5's 57 are rates per $1,000.

Not conveyed: what the gain is measured from (I assume the starting dot [guess]), over how many rounds or dollars, and what "estimates" (small text, l09) means. The video does not say why a frozen model's improvement is called plasticity; I know the word from neural nets [my background].

## 6

Plain reading: the score is measured on the test games, not on the games the model reviews. The reason (voice, l06): the model plays them like an exam and never reviews them, so a gain there is evidence of progress. Small text adds "A gain on its games is not always a gain on test games." I read this as a held-out test set [my background].

Not conveyed: what the test games are (same game with new positions or opponents? [guess]), how many there are, and why chess, Go and Hex were chosen. I know Go; Hex only vaguely [my background]. The small text "Average of the games" (l08) tells me the curves average over several games. The "another game" line that script.md lists for l13 would imply a game beyond these three, but it is not in my frames, so I do not use it.

## 7

Same practice, very different gains. Sol gained a lot, Luna did not, and Fable 5 gained a lot too (voice, l08). Fable 5 reached the best test score, but Sol had the best plasticity (voice, l09). Luna almost never used its programs and notes, and models that used them less gained less, "a link, not proof" (voice, l10). Models that used them most made fewer bad moves, but some remain (voice, l11), and the paper does not know why (voice, l12). The numbers do not rank models (voice, l13).

In one line: the best scorer and the best learner per dollar are different models, and one model barely learned at all.

## 8

The two bests are best test score (the highest score on the test games) and best plasticity (the most score gained per dollar). The video says different models win. Fable 5 has the best test score (voice; screen: a circle on the end of its curve, l09). Sol has the best plasticity (voice; screen: bars of 298 for Sol and 57 for Fable 5, labelled points per $1,000, l09).

The video gives no absolute test-score number for any model. The curves are a sketch (small text, l08 and l09), so the only numbers are the plasticity bars, and small text calls them estimates.

## 9

Voice (l10): the models that gained less used their saved programs and notes less, and Luna is the example, with almost no use. That is offered as a link, not as the cause. Small text adds that heavy users did not all gain a lot, which the voice does not say. I have no definition of "used" from the voice or from my frames; script.md lists a legend ("it runs the program or follows the note") that I did not see. I assumed "used" means the model consulted or ran them in later rounds [guess].

Certainty: low. The voice says "This is a link, not proof" (l10), and for the bad moves that remain it says the paper does not know whether weak programs, weak notes or poor use is the cause (l12). Why Luna did not use them is not conveyed.

## 10

Do not read the plasticity numbers as a ranking (voice and screen, l13): they depend on games and prices, and a red "NOT A RANKING" stamp covers the 298 bar. Sol's 298 against Fable 5's 57 does not make Sol the better model. Fable 5's 57 also does not mean it learned little, because the voice says it gained a lot too (l08).

From small text: 298 is a rate per $1,000, not a total gain (l09); the numbers are estimates (l09); the curves are a sketch of the paper's first figure (l08); the X counts are a sketch (l11). I should not read real values off those drawings. From the voice: using programs and notes goes with gain, and the video does not show that it causes gain (l10).

script.md also lists, for l13, a line that Sol gained in board games but lost score in another game. It is not in my frames, so I did not use it, but it would be the only concrete support for "depends on games".

## 11

Most confusing: l11, "Models that used them most made fewer bad moves, but some remain." I cannot tell what a bad move is, who decided, or compared with what. The only definition is the small text "X: a bad move", which is circular. The picture (two grids of squares with fewer X marks on the left than on the right) carries the small text "The X counts here are a sketch", so it shows no real size of the effect. The squares have no key in my frames; I assumed each is a move [guess]. "Fable 5, Sol and two other models" is named only in small text, so I never learned who the other models are or how many models were tested.

Second, l08 to l09: by eye, Sol's and Fable 5's curves rise by about the same height over similar dollar spans, yet the bars read 298 against 57. Nothing reconciles this until "prices" in l13, and there only by implication. [guess] Fable 5 costs more per unit of gain.

Third, l10: by ear, "Models that used them less gained less" sounds like more use gives more gain. Small text says heavy users did not all gain a lot, and that qualifier is about models the picture does not draw.

## 12

Ordinary AI tests show how good a model is today, so this paper measures plasticity, the gain in test score for each dollar a model spends learning. A model that never changes plays chess, Go and Hex over rounds, reviews its games, and writes programs and notes that the next round starts with, and its score comes from test games it never reviews. Sol had the best plasticity (298 against 57 for Fable 5, per $1,000) while Fable 5 had the best score, Luna barely used its notes and barely gained, and the paper says the link between using notes and gaining is not proof and the numbers are not a ranking.

## Ratings

(a) 4. By 4.5 s I knew it was about AI models learning differently from the same practice, and l02 stated the thesis by 9 s. One point off: "practice" stays vague until l03 and l04, and the model names are only on tiny labels. The voice first says Sol, Luna and Fable 5 in l08 and never says the "GPT-5.6" or "Claude" prefixes.

(b) 4. Problem (l01, l02), setup (l03 to l07), results (l08, l09), a "why" section (l10 to l12), a caveat (l13) and a close that repeats the l02 picture (l14). One point off: the why section introduces "used" and "bad moves" late, and the video returns to plasticity only in l13, so l12 and l13 feel like two endings.

(c) 3. Plasticity and test games were explained at first use. Not explained before use: round (l03, never defined), Hex (l03), Sol, Luna and Fable 5 (first spoken in l08 with no introduction), estimates (l09, small text), used (l10), bad move (l11, only "X: a bad move").

(d) 4. I can retell the claim, the results and the caveats (Q12). I could not answer these follow-ups: what a round is, how many models and games were tested, what the gain is measured from and over what dollar range, who judged "used" and "bad move", and why Sol's rate is about five times Fable 5's when the curves look alike.

## Log

- l01 clear: two robots with fill bars show one model improving and one not. The names are on tiny labels, and "practice" is not defined yet.
- l02 clear: the "score today" dot against the "how well it learns?" arrow carries the point. The paper crop is unreadable and not needed.
- l03 partly: three boards with rows of dots show repeated play, but "round" is never defined, and Go and Hex are shown without explanation.
- l04 clear: games lead to a program (chess_engine.py) and a note (START_HERE.md), a pattern I know from agent memory files [my background]. The note text "IMMEDIATE ACTION / DO NOT INSPECT" puzzled me but was not needed.
- l05 clear: the padlock "model: never changes" and the files carried into "next round" explain it. The before and after boards are too small, and "its program plays every move" is small text only.
- l06 partly: the exam analogy and "never reviews" are clear. "So gains there are evidence of progress" is a compressed step I completed from held-out-test-set knowledge [my background], and what the test games are is not said.
- l07 clear: a plain definition with a rising curve, a "per dollar" bracket and coins. The units (win share, dollars paying for games and reviews) are small text only.
- l08 clear: three curves, with Sol rising, Luna flat and Fable 5 starting higher and rising. The three names are first spoken here with no introduction, and "a lot" has no size.
- l09 clear: two bests, two winners, big 298 and 57. I could not reconcile the five-fold gap with the similar-looking curves in l08.
- l10 partly: three claims in 8 s. Luna's near-zero use is clear from the 40-square picture. "Used" is defined only in a legend I did not see in my frames, and the voice sounds one-directional while small text says heavy users did not all gain.
- l11 partly: the gist (fewer X marks with heavy use, but not zero) is clear. "Bad move" is undefined and the X counts are labelled a sketch.
- l12 clear: three candidate causes and "future work" are plain. "Poor use?" is not in my frames, but two of the three causes have icons.
- l13 clear: the "NOT A RANKING" stamp and the turning "games" and "prices" dials make the point. I mapped "prices" to API pricing [my background]; the voice does not say prices of what.
- l14 clear: it repeats the l02 dot and arrow, and the end card gives the full paper title for the first time.

## Extra

### (a) Pictures

Helped most:

- l05, the padlock "model: never changes", with the same robot in "this round" and "next round" boxes and small files riding along. It carries the central idea in two seconds and is readable at phone size.
- l04, the two file cards (chess_engine.py "a program", START_HERE.md "a note"). Large monospace, and as an engineer I recognised the pattern at once [my background].
- l02 and l14, the white dot with a dashed arrow. Using it at both ends frames the story, and "score today" against "how well it learns?" is the whole thesis.
- l09, the circled end of Fable 5's curve followed by two big hand-lettered numbers (298, 57). The switch from curves to bars shows that the two "bests" are different measures.
- l10, 40 red hollow squares with one filled. "Almost never used" is obvious without reading.
- l06, the exam sheet beside "test games" and the crossed-out magnifier ("never reviewed").
- l07, the "test score gain" bracket and the "per dollar" bracket with a row of coins.
- l13, the "NOT A RANKING" stamp and the two dials, "games" and "prices", whose needles turn.

Confused or too small to read on a phone:

- Paper crops (l02, l13): serif text cut off at both edges and moving. The highlighted fragments are readable only when the frame is still. They add credibility but no information at speed. The l13 crop does say "provider pricing", which would answer "prices of what?", but I could not read it at pace.
- l05 before and after chess boards: each board is under a third of the frame width, the positions are unreadable, and "Sol loses" and "Sol wins" are small coloured text.
- l11: the grids read fine, but their labels ("Fable 5, Sol and two other models", "X: a bad move.", "The X counts here are a sketch.") are tiny, and the squares have no key in my frames.
- l12: the two document icons with red question marks work, but I saw no picture for "poor use?".
- l10: the "98%" figure and the square legend are in script.md but not in my frames, so the grid as I saw it carries no number and no key.
- l08 and l09: axis labels and "A sketch of the paper's first figure" are small. The footers ("Paper, Fig. 14, p. 25" and similar) are close to invisible and not needed. The model names in l01 sit in tiny labels; the voice first says Sol, Luna and Fable 5 in l08 and never says the "GPT-5.6" or "Claude" prefixes. The video never says how Sol and Luna differ, or who makes any of the three; I take the "GPT" and "Claude" prefixes to mean two vendors [my background], and I cannot tell whether Sol, Luna and Fable 5 are real products.

Pictures that cut against the narration:

- l08 and l09: by eye, Sol and Fable 5 rise by similar heights over similar dollar spans, yet the bars read 298 and 57.
- l10: by ear, use and gain move together. Small text says heavy users did not all gain a lot, and the late frame labels Fable 5 "used most" while the models that "did not all gain" are not drawn.

### (b) The one line I would rewrite

l10: "Luna almost never used its programs and notes. Models that used them less gained less. This is a link, not proof."

It packs three claims into 8 seconds, the voice never says what "used" means, and the middle sentence sounds like more use means more gain while the small text says heavy users did not all gain. Rewrite: "Luna almost never ran its saved programs or followed its notes. Models that did so less gained less, though heavy use did not guarantee a gain. A link, not proof." It runs about 3 seconds longer, which l11 and l12 could give up by merging.
