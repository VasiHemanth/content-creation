# Cold novice 2: answers to quiz-v2

Persona: a 16-year-old who uses ChatGPT daily and has never heard of AI agents, benchmarks, test sets or arXiv. I watched once and judged the narration first. "Bonus" marks a fact that appears only in a small label or a picture detail, which a real viewer could miss. Bonus facts did not raise any mark or rating.

Files read: only script-v2.md and quiz-v2.md. My first try at the quiz used a wrong path (round2/quiz-v2.md). That file did not exist and returned nothing.

## 1. What the video is about

The video is about a way to test whether an AI model gets better with practice. Researchers had models play board games round after round, keep programs and notes between rounds, and compared how much each model's test score rose per dollar spent.

## 2. What is missing, and what the paper adds

Missing: the usual tests show how good a model is now, a score for today. They do not show how well it learns, meaning how much it improves with practice (l02). What the usual tests actually look like: `not conveyed`.

Added: a measure called plasticity, the gain in test score per dollar spent learning (l07), scored on test games the model never reviews (l06). The narration never says outright that the paper invented it. I took that from the framing in l02 and l07 [guess].

## 3. What changes between rounds, and what does not

Not changed: the model itself ("The model never changes", with a padlock on the robot).

Changed: after each round the model reviews its games and writes a chess program and notes, and the next round starts with them. So what it carries in changes, and the model does not. Whether new programs and notes replace the old ones or pile up: `not conveyed`. How many rounds there are: `not conveyed`.

## 4. What it saves

It saves things it wrote itself: a program and notes. In my words, a piece of code and a note to itself. The narration only says "a chess program and notes". That the program plays chess for the model is my [guess].

Example shown (picture, so bonus): a code file called chess_engine.py (I know .py is code [my background]) and a note called START_HERE headed IMMEDIATE ACTION. In a later round Sol's program played every move and Sol won.

`not conveyed`: what the notes say; why it is a chess program when the model plays chess, Go and Hex.

## 5. Plasticity

Plain words: how much the test score goes up for each dollar the model spends to learn (l07).

Counted: the gain in test score, the rise and not the final score. Divided by: dollars spent. What the dollars pay for: I took it as the cost of running the AI [guess]. The video's own label says "its games and its reviews" (bonus). What a score or a point is made of (wins? something else?): `not conveyed`. Bonus: 298 and 57 shown as "points per $1,000".

## 6. Which games, and why those

The score is measured on the test games, the ones the model plays but never reviews (l06). The video's reason is "so gains there show real progress."

From the narration alone I cannot say why a gain on reviewed games would be less real. The video's own words for that are in a small label I would likely miss (bonus: "A gain on reviewed games may not carry over"). I filled the gap with an exam idea, that a test counts when you did not practice on it [my background]. That idea is mine, not the video's.

`not conveyed`: whether test games are chess, Go, Hex or something else; who the model plays against; what the score measures; when the test games are played; how many there are.

## 7. Main finding

With the same practice, Fable 5 and Sol gained a lot and Luna did not (l08). Fable 5 ended with the best test score, but Sol had the best plasticity (l09). Luna almost never used its programs and notes, and models that used them less gained less (l10). The video says that last part is a link, not proof.

## 8. Two kinds of best

Best test score (who ends highest) and best plasticity (who gains the most per dollar). The same model does not win both: Fable 5 has the best test score, Sol has the best plasticity.

Bonus: the bars read Sol 298 and Fable 5 57, in points per $1,000, and on the chart Sol starts lower than Fable 5. My [guess] is that a lower start leaves more room to gain, but the video does not say so.

## 9. Why some improved less, and how sure the paper is

The video's reason: the models that gained less used their programs and notes less. Luna almost never used them (bonus: a big red 98% on screen), and models that used them less gained less (l10). How a model "uses" a program or note in practice: `not conveyed`. I pictured the model following them when it chose moves [guess], but the sentences made sense without it.

How sure: not sure. The video calls it "a link, not proof" (l10), and later says the paper does not know whether the programs, the notes or their use are weak (l12). So the cause is open and only a pattern is reported.

## 10. What not to conclude

That the numbers rank the models. They depend on the games and the prices used, so they "do not rank models" (l13). I should not say "Sol is the best AI" or "Fable 5 is better." I also should not conclude that skipping the notes caused Luna's flat line, because l10 says it is a link, not proof.

Bonus: 298 and 57 are rates, not totals, and one small label says Sol lost score in "another game". Which game that was: `not conveyed`, since no other game was introduced.

## 11. What confused me most

Most: l06, "It never reviews them, so gains there show real progress." The whole test score rests on this sentence, and the "so" asks me to take it on faith. The narration never says what a gain on reviewed games would look like or why it would be less real. I supplied the exam idea myself. I also cannot tell whether test games are a different game or the same kind of game kept apart.

Next: l11. "Mistakes" appears for the first time with no definition. Mistakes in what, and made by whom? [guess: bad moves].

Then l04, "writes a chess program and notes". An AI writing a program was a jump. I do not know what the program does, or why it is only chess when l03 had three games.

## 12. The paper in three sentences

AI models played board games like chess, Go and Hex round after round, and after each round a model looked over its games and wrote itself a chess program and notes to start the next round with, even though the model itself never changes. The researchers scored each model on separate test games it never reviews and defined plasticity as the score gain per dollar, and with the same practice Fable 5 and Sol gained a lot and Luna did not, with Fable 5 ending highest but Sol gaining the most per dollar. Luna almost never used its programs and notes and models that used them less gained less, but the paper says that is only a link, it cannot tell which part is weak, and the numbers depend on the games and prices so they do not rank models.

## Ratings

- (a) The opening told me what the video was about: 4. Two models, same practice, only one improves is concrete, and l02 made the topic clear: how well a model learns. I did not know what the practice was until l03.
- (b) The story had a clear beginning, middle and end: 4. The problem (l01 to l02), the setup (l03 to l07) and the results (l08 to l09) are clear. The end is four hedges in a row (l10 to l13), and the hook's question, why only one improves, ends on "we don't know" with no one-line takeaway.
- (c) Every new word was explained before it was used: 3. "Plasticity" is defined as soon as it is said. "Round", "reviews", "mistakes", "estimates" and "prices" are used without being pinned down, and "its games" versus "test games" is only half explained.
- (d) After one viewing I could explain the paper to someone else: 4. I can retell the whole sequence from the narration (see 12). I have two soft spots I could not defend: why test-game gains are "real", and what the mistakes were.

## Line-by-line log

Rule I used: `clear` means I could repeat the line's main point without guessing at it. If I guessed only at a side detail, the guess is tagged in the reason and the mark stays `clear`. `partly` means a guess or a gap touches the main point itself, such as a key word or the link between two ideas. `lost` means I could not repeat the line.

- l01: `clear`. Two models, same practice, only one improves. I ignored the small paper tag. "Practice" is not specific yet.
- l02: `clear`. Tests give a score for today, not how well a model learns. "Learns" is a little vague.
- l03: `clear`. A model plays chess, Go and Hex many times. "Round" is not defined yet. I have heard of Go as a board game [my background]. Hex means nothing to me, which did not matter.
- l04: `partly`. It looks over its games and writes a chess program and notes. The narration does not say what they do, and never explains why chess only.
- l05: `clear`. The model is locked, but each new round starts with its programs and notes. What the programs and notes do is still not said in words. That gap does not change this line's point (bonus: the picture shows the program playing the moves).
- l06: `partly`, the weakest of my `partly` marks. Test games are extra games it never reviews, and gains there are "real progress". The "so" is taken on faith, since the narration never says what would make a gain on reviewed games less real.
- l07: `clear`. Plasticity is the test score gain per dollar. What the dollars are is a side detail I guessed at, because "the model spends dollars" is odd [guess: the cost of running the AI].
- l08: `clear`. Same practice: Fable 5 and Sol gained a lot, Luna did not. Small snag: l01 said two models and one improved, and now it is three models and two improved.
- l09: `clear`. Two bests with different winners: Fable 5 best test score, Sol best plasticity. No numbers were spoken (bonus: 298 and 57 on screen).
- l10: `clear`. Luna rarely used its programs and notes, less use went with less gain, and it is a link, not proof. Three ideas in 8 seconds, so I kept the sentences but not the grid of squares (bonus). How a model "uses" a program is `not conveyed`, but the sentences made sense without it.
- l11: `partly`. I got that using them more helps but does not fix everything. "Mistakes" is undefined: mistakes in what? [guess: bad moves].
- l12: `partly`. Three possible weak spots (programs, notes, their use) and the paper cannot tell which. "Why?" is unclear (why the leftover mistakes, or why Luna gained less?), and "weak" is vague.
- l13: `clear`. The point landed: the results depend on the games and prices, so do not rank the models. Two side words are loose: "These estimates" has no spoken antecedent, because no numbers were said aloud, and "prices" is not explained [guess: what each model costs to run].

## Extra

(a) After l06, do I know what "its games" and "test games" are?

Roughly. "Its games" are the games the model plays each round (chess, Go, Hex) and then looks back over. "Test games" are a separate set it also plays but never looks back at, used to measure its score. "Also" and "never reviews them" gave me that split. `not conveyed`: whether test games are the same kind of game or different games, when they are played, and against whom.

Does "reviews" mean looking back at games to find mistakes? I took it as looking back over the games it just played (bonus: the magnifier picture). The video never says why it reviews. Finding mistakes is what chess players do when they review a game [my background], so I assumed it [guess], but nothing in the narration supports it. The word "mistakes" only appears in l11, and there I could not tell what it meant.

Which line do I mark lost: none. l06 is `partly`, and it is close to `lost` on the word "so". Using the narration only, I cannot say why a gain on reviewed games would be less real. The small label "A gain on reviewed games may not carry over" says it, but I would likely miss it at speaking pace. I got through the line because I supplied an exam idea myself [my background]. Without it I would have taken the "so" on faith.

(b) The single line to rewrite: l06.

It holds the reason a test-game gain can be trusted, and the narration leaves that reason out. The whole plasticity number rests on it. I would move the on-screen sentence into the narration: "It also plays test games it never reviews. A gain on reviewed games may not carry over, so a gain on test games shows real progress." That adds a few seconds.
