# Cold viewer 3: answers to quiz-v2 (v3 kit)

I am the 16-year-old who uses ChatGPT every day. I could not hear the voice, so "heard" means the exact narration in script.md. The pictures are the 14 strips of three stills. They are about a third of phone size and I could study them as long as I liked, which a one-pass viewer cannot, so I flag anything I could only get from tiny text.

Flags:
- (small print): text smaller than the captions. I read it on a still. A phone viewer would probably miss it at speed.
- not seen: script.md lists this on-screen text for the line, but none of my three stills of that line show it. I did not use any of it in my answers.
- [guess] and [my background], as the quiz asks.

## 1

A research paper asks how well AI models learn from practice, rather than how good they are today, and measures it by letting them play board games over many rounds and counting how much their score rises per dollar spent. Some models (Sol, Fable 5) gain a lot, one (Luna) barely gains, and the model with the best score is not the one that learns best per dollar.

## 2

Missing: most tests give a snapshot, "how good a model is now", not "how well it learns". The l02 picture is one dot, "score today", against a dashed arrow, "how well it learns?". Which tests those are is `not conveyed`.

Added: a way to watch a model improve with practice, and one number for it, "plasticity" (score gain per dollar). The setup behind it is repeated rounds of games, programs and notes the model writes for itself, and test games it never reviews.

## 3

Does not change: the model itself ("The model never changes", drawn as a padlock on the robot). Changes: what it starts each round with. After reviewing its games it writes a program and notes, and the next round starts with them (l04, l05). What "the model itself" is made of is `not conveyed`.

The video never says in words that the improvement lives in the programs and notes. I guessed that [guess], because "Only one improves" (l01) clashed with "never changes" (l05) until the "but each round starts with its programs and notes".

## 4

After a round it looks back at the games it just played and writes itself two things, a program and notes, and carries them into the next round. Examples shown: chess_engine.py, labelled "a program" (the .py ending means a Python file [my background]), and START_HERE.md, labelled "a note", with big handwritten words, "IMMEDIATE ACTION" in red and "DO NOT INSPECT" below it. What those words mean is `not conveyed` (maybe an order to itself to act without checking [guess]).

What a program does is only in small print: "Before: no program, Sol loses" and, in a later round, "its program plays every move, and Sol wins". Where they are saved, or who reads them, is `not conveyed`.

## 5

Plasticity is how much a model's test score goes up for each dollar it spends learning. Counted: the test score gain, the rise from the start dot to the top of the curve (the vertical bracket in l07). Divided by: dollars spent (the "per dollar" bracket along the bottom).

"Score" means the share of points won, and the dollars pay for its games and its reviews (both small print). Why it is called plasticity is `not conveyed` [guess: "able to change", like plastic].

## 6

Heard: the score is measured on "test games", which the model plays but never reviews, "like an exam" (l06). Because it never reviews them, a gain there counts as "evidence of progress". Small print: "A gain on its games is not always a gain on test games", and "Average of the games" (l08), so the score is probably an average over several games [guess].

`not conveyed`: which games the test games are (more chess, Go and Hex? [guess]), how they differ from "its games", who the opponent is, and why chess, Go and Hex were picked.

## 7

Same practice, very different gains. Sol and Fable 5 gained a lot of test score and Luna did not (l08). Fable 5 ended with the best score, but Sol gained the most per dollar (l09). Luna almost never used its programs and notes, and models that used them less gained less, with the warning "a link, not proof" (l10). GPT in the names of Sol and Luna makes me think of ChatGPT [my background], but the video never says what they are.

## 8

The two bests are best test score (who ends highest) and best plasticity (who gains most per dollar). They are different models. Fable 5 has the best test score. Sol has the best plasticity, shown as two bars, 298 for Sol and 57 for Fable 5 (l09). The unit, points per $1,000, is small print, and what a "point" is next to a score is `not conveyed`.

## 9

The only hint: Luna almost never used its programs and notes, and models that used them less gained less (l10). How sure is the paper: not very. The video says "This is a link, not proof." A small-print line says models that used them most "did not all gain a lot", so on a second look I read the link as loose.

l12 says the paper does not know whether bad moves come from weak programs, weak notes or poor use, but that is about bad moves, not about Luna's low gain. Why Luna rarely used them is `not conveyed`. The question l01 asks, why only one improves, never gets a firm answer.

## 10

Do not conclude that Sol is a better AI than Fable 5, or that 298 versus 57 ranks models. The numbers depend on the games and the prices (l13, "NOT A RANKING"). Do not read them as totals or as exact (small print: "a rate, not a total", "These are estimates"). And do not read "used them less, gained less" as proof that notes cause gains.

## 11

The screen sentence in l10, "Models that used them most did not all gain a lot." I had just heard "Models that used them less gained less", and the graph above the sentence shows the "used most" curves going up. So live I could not tell which models it meant, and it read like the opposite of the point. It is also small print under a busy graph, and the narrator had already moved on to "This is a link, not proof."

Close behind: "so gains there are evidence of progress" (l06), and "improves" in l01 against "never changes" in l05.

## 12

Most AI tests only show how good a model is today, so this paper looks at how well a model learns: it plays chess, Go and Hex for many rounds, and after each round it writes itself programs and notes while the model itself never changes. Then it is scored on test games it never reviews, and plasticity is how much that score rises per dollar it spends. Sol and Fable 5 gained a lot and Luna did not (it almost never used its notes, but that is only a link), the best scorer (Fable 5) was not the best learner per dollar (Sol), and none of this ranks models.

## Ratings

- (a) The opening told me what the video was about: 4. l01 gave me the question in four seconds: two robots, same practice, only one meter rises. It did not say what "practice" means until l03, or that this is about a paper and a new kind of test until l02.
- (b) The story had a clear beginning, middle and end: 4. l01 poses a puzzle and l14 closes the loop by repeating the l02 picture. The last third (l10 to l13) is four caveats in a row, and the puzzle from l01 never gets a firm answer.
- (c) Every new word was explained before it was used: 3. "Plasticity" and "test games" are explained as they arrive. "Round" never is, "score" and "points" only in small print, "used" only in a legend I did not see, and "Agent" in the title never.
- (d) After one viewing I could explain the paper to someone else: 3. I can give the gist (Q12). I could not answer "what is a round?", "what are the test games?", "what is 298 points?" or "who does it play?"

## Line-by-line log

| Line | Mark | Reason |
|---|---|---|
| l01 | clear | Two robots, one meter fills and one does not. The hook is obvious. "Practice" is not defined yet. |
| l02 | clear | Dot "score today" against arrow "how well it learns?" says it. "Tests" is vague and the paper crop is unreadable. |
| l03 | partly | Three games, fine. "Round" is never defined, I could not tell what a dot is, and I do not know who it plays. |
| l04 | clear | Reviews its games, writes a program and notes. The code file and the note card make it concrete. Why it writes them waits until l05. |
| l05 | partly | Padlock plus files moving to the next round answers Q3. It clashes with "improves" in l01, and nothing says the improvement lives in the notes. |
| l06 | partly | "Like an exam" lands. "So gains there are evidence of progress" is vague, and the two stacks of games look the same. |
| l07 | clear | Definition spoken and drawn together (rise over dollars). What "score" is and what the dollars buy are small print. |
| l08 | clear | Green rises, red stays flat, orange rises. Fable 5 shows up with no introduction and the axes have no numbers. |
| l09 | partly | Two kinds of "best" land. 298 of what? "Points per $1,000" is small print. |
| l10 | partly | Three claims in 8 s. "Used" is never defined in the audio, and the screen text "used them most did not all gain a lot" looks like it contradicts the graph. |
| l11 | clear | Two grids, fewer X marks on the left. "Bad move" is plain English. Which moves get counted is `not conveyed`. |
| l12 | clear | "Cause unknown, three suspects" is easy to say back. It answers a question about bad moves, not why Luna gained little. |
| l13 | partly | "Do not rank" is clear. Prices of what? And "best plasticity" two lines earlier sounded like a ranking. |
| l14 | clear | The l02 picture returns and closes the loop. "Agent" in the title is never explained. |

## Extra

### (a) Pictures

Helped most:
- l01: two robots with a meter each. The green meter fills, the red one barely moves, Luna's eyes go dark. It works with the sound off.
- l02 and l14: one dot "score today" against a dashed arrow "how well it learns". The best idea picture, and coming back to it in l14 closes the video.
- l05: the padlock on the robot and the program and note moving into the next round's box. It showed "model fixed, notes carried" faster than the words did.
- l07: brackets for "test score gain" (up the side) and "per dollar" (along the bottom), with a row of coins.
- l09: a circle on the end of Fable 5's curve for "best test score", then two bars, 298 and 57, for "best plasticity". Two kinds of best, side by side.
- l10, first still: 39 hollow red boxes and one filled one. "Almost never" at a glance, though I never saw its legend.
- l11: two grids with X marks, fewer on the left.
- l13: the red NOT A RANKING stamp. Big and readable, and the only part of l13 I would have caught live.

Confused me or too small for a phone:
- l03: rows of dots fill at different speeds, and I never learned what a dot is (a round? a game?).
- l04: the orange stack of boards has a label that looks clipped at the left edge. "IMMEDIATE ACTION / DO NOT INSPECT" (l05) is loud and unexplained.
- l05, third still: two tiny boards with the labels "Before: no program, Sol loses" and "its program plays every move, and Sol wins". It is the only proof that the programs work, and I could not tell who was winning from the boards.
- l06: the stacks for "its games" and "test games" look alike apart from an exam-paper icon and a crossed-out magnifier. The little rising graph in the corner has no label.
- l02 and l13: the paper crops are unreadable at phone size. Only the yellow highlight shows. They say "this is real" and add nothing else. The l02 crop even says "answering three questions", which the video never lists.
- l07: "Score: the share of points won" and "Dollars pay for its games and its reviews" are footnote size.
- l08 and l09: the curves start flat, Luna's line slopes down, and the axes carry no numbers. "points per $1,000" and "These are estimates" are footnote size.
- l10: the "used most" tag sits above Fable 5 alone, so I took Sol for a middle case, until l11 put Sol in the top group. "Luna" and "used least" are stacked and cramped. The sentence "most did not all gain a lot" is hard to parse.
- l11: group labels such as "Fable 5, Sol and two other models" are footnote size. That is the only place I learn there are more than three models.
- l12: the grey line "We leave separating these causes to future work." is low contrast in the middle still.
- l13: the captions are smaller than elsewhere, and the stamp covers the top of the 298 bar.

Not seen (listed in script.md, absent from my three stills of the line; if they appear, it is for under a second): l04 the "its games" label; l10 "98%", "of the moves where one applied: not used", the square legend ("One square is one move where a program or note applied", "Filled: used. Hollow: not used.", "Used: it runs the program or follows the note.") and "A second model judged this from the game logs."; l12 "poor use?"; l13 "Sol gained in board games but lost score in another game."

### (b) The one line I would rewrite

l06. Now: "It also plays test games, like an exam. It never reviews them, so gains there are evidence of progress."

Rewrite: "It is also scored on test games it never reviews, like an exam. A higher test score is evidence it improved."

Why: "gains there" and "evidence of progress" are abstract, and the "so" makes me do the logic myself. The one thing that separates test games from its own games is "never reviews", and the picture cannot show it (the two stacks look alike), so the first sentence should carry it. Test score and plasticity both rest on this line. The rewrite is two words longer, 21 against 19, which is roughly 0.7 s at this video's pace.
