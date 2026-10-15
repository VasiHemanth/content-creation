# Round 5, part 1: the finished video (v3) against the paper

Evidence: `v3-kit/script.md`, the 14 strips `v3-kit/frames/l01.png` to `l14.png` (three frames per line, early, middle, late, from the real MP4), and Instagram caption revision 4 as the coordinator sent it. Ground truth is the paper only (arXiv 2610.08902v1).

Limits. I cannot hear the voice or see motion. Three stills per line cannot give timings, so I write "late frame only" for an item that shows in the last still and not in the first two. Sizes in pt come from character widths in zoomed crops (monospace font, 0.6 em per character) on a phone 390 pt wide, so one frame pixel is 1.08 pt. I did not read the two new cold-viewer files.

## Verdict

**SHIP AS IS.** Nothing in the video or in caption revision 4 is false or misleading enough to come down. Factual errors: none.

This holds for what the frames show. Five items listed in `script.md` are not in my frames (section 4e). A two-minute scrub of the live reel closes them. Only a wrong number, a reversed key, or a claim stronger than the paper in those items could change this verdict.

The edits worth doing now are the caption wording (section 4d, paste-ready). Everything else is for a later cut.

## 1. Narration check

I compared the 14 narrated lines in `script.md` with the table in section (e) of `round3/grades-r3.md`, word for word.

- Differences: none. All 14 lines are identical.
- Words: 195, as in the table. Final line ends at 72.0 s.
- Line lengths in seconds: 4.5, 4.4, 4.3, 4.7, 4.3, 6.9, 4.6, 4.5, 4.7, 8.0, 4.4, 5.6, 5.2, 5.9.
- The burned-in caption words in all 42 frames match the narration. No caption shows a word that is not in the line.

## 2. Blockers and labels

### 2a. My four blockers

| Blocker | Verdict | Frame evidence |
|---|---|---|
| l03: three boards, each with its own round dots | Built correctly | Late frame: chess board with 7 of 8 dots filled, Go board with 4 of 8, Hex board with 4 of 8. Each row has its own game tag and the word "round". Middle frame: only the chess row has moved (2 dots), Go and Hex are still empty. "Each game has its own rounds." sits under the Hex row (late frame only, about 12 pt). Board sizes match the paper (chess 8 by 8, Go 5 by 5, Hex 6 by 6; p. 7). No shared toolbox. |
| l05: time jump and one-game label | Built correctly | Middle frame: an orange band crosses the screen between the "this round" and "next round" drawing and a faded board. Late frame: the band reads "A LATER ROUND", with the left board "Before: no program, Sol loses." and right board "One game, a later round: its program plays every move, and Sol wins." with the Fig. 14, p. 25 tag. Matches Fig. 14 (empty library, mated on move 37; round 18, the engine plays every move, mate on move 42). Both labels are in the late frame only. |
| l06: label and rising arrow | Built correctly | Late frame: "The model never reviews test games." and "A gain on its games is not always a gain on test games." under the two stacks. A red crossed-out magnifier sits in front of the test games stack. A rising arrow chart sits above it at top right. The "its games" stack has an orange outline, the test games stack does not. Both labels are late frame only. |
| l11: two grids | Built correctly | Late frame: left grid "Models that used them most" with 6 X in 40 squares; right grid "The other models" with 15 X in 40 squares (the last X still fading in). Same grid size. "X: a bad move.", "Fewer bad moves than the other models, but not none.", "The X counts here are a sketch.". 6 of 40 is 0.15 and 15 of 40 is 0.375; the paper gives about 0.16 and 0.38 per relevant decision (p. 8). |

### 2b. Other labels you listed

| Label | Seen? | Frame evidence and caution |
|---|---|---|
| l04 "Sol wrote: a program and a note." | Seen | Late frame only, orange, three lines, under the stack of games (about 11 pt). Tags "a program" (about 9.5 pt) and "a note" (about 7 pt, on a card that is still fading in) are on the two cards. The "its games" tag that should name the stack is hidden behind the stack: only a clipped fragment shows at its lower left in the middle and late frames. The Fig. 14 source tag is not in the frames. |
| l08 and l09 "Average of the games." | Seen | l08 late frame and l09 early and middle frames, with "A sketch of the paper's first figure." (about 11 pt). Gone in the l09 late frame, which shows the bars. |
| l10 labels | Partly seen | Seen: the grid (40 squares, 1 filled), "Luna" tag with "used least", "Fable 5" and "Sol" tags, "used most" above the Fable 5 tag, "Models that used them most did not all gain a lot." (late frame only), source tag. Not seen: "98%", "of the moves where one applied: not used.", "One square is one move...", the key "Filled: used. Hollow: not used.", "Used: it runs the program or follows the note.", "This is a link, not proof.", "A second model judged this from the game logs." |
| l12 cards and quote | Partly seen | Seen: the X and question mark, "The paper does not know which.", cards "weak programs?" and "weak notes?" (late frame only), the p. 8 sentence (dim in the middle frame, full in the late frame), source tag. Not seen: the third card "poor use?". The late-frame caption already reads "notes or poor use." with two cards on screen. |
| l13 strip, no 233 or 14 | Built as specified | Middle and late frames show two bars only, 298 and 57, with tags "Sol" and "Fable 5". No 233 and no 14 anywhere. The page strip shows the paper's own sentences, highlighted word by word with the narration. The stamp "NOT A RANKING" appears in the late frame. Not seen: "Sol gained in board games but lost score in another game." |
| l14 reprise and end card | Built as specified | Early frame: the l02 chart with the dot only. Middle frame: "score today", the dashed arrow and the "PLASTICITY" heading. Late frame: end card with the handle, the paper title, "arXiv 2610.08902 · unofficial explainer". "how well it learns" shows only as a ghost behind the end card. |

### 2c. Too small or too brief for a phone

Rule I used: under 11 pt is too small, 11 to 13 pt is readable if it stays about 3 s, over 13 pt is fine. Burned-in captions are about 16 pt (l13 late frame about 12 pt).

Too small (under 11 pt):

| Label | Line | Size |
|---|---|---|
| Source tags "Paper, Sec. x, p. y" and "Paper, Fig. 14, p. 25" | l05 to l07, l09 to l12 | about 8 pt, dim blue-grey on dark blue |
| Tag "a note" on the note card | l04 | about 7 pt, on a card still fading in |
| "points per $1,000: a rate, not a total" | l13 | about 9 pt (the same label in l09 is about 12 pt) |
| "Before: no program, Sol loses." | l05 | about 9.5 pt |
| "Score: the share of points won." | l07 | about 9.5 pt |
| "Fable 5, Sol and two other models" | l11 | about 9.5 pt |
| "The X counts here are a sketch." | l11 | about 10 pt, dim |
| "used least" | l10 | about 10 pt, dim red, touching the axis |

Borderline (11 to 12 pt): "Sol wrote: a program and a note." (l04), "Dollars pay for its games and its reviews." (l07), "Average of the games. A sketch of the paper's first figure." (l08, l09), "weak programs?" and "weak notes?" (l12). The other labels, including the l06 pair and the l12 sentence from p. 8, are about 12 to 13 pt and fine.

Too brief to read (late frame only, so on screen for well under half of the line, and 10 words or more):

- l05 "One game, a later round: its program plays every move, and Sol wins." (13 words in a 4.3 s line, with "Before..." next to it).
- l06 "A gain on its games is not always a gain on test games." (12 words, while the voice finishes the line).
- l10 "Models that used them most did not all gain a lot." (10 words).
- l11 "Fewer bad moves than the other models, but not none." (10 words).

Borderline on time: l04 "Sol wrote: a program and a note." (7 words, late frame only, about 11 pt).

## 3. Fidelity of pictures

No picture teaches something false. Faithful items first, then the pictures that could mislead a careful viewer.

| Item | What the picture shows | What the paper shows | Verdict |
|---|---|---|---|
| Colours per model | Fable 5 orange, Sol green, Luna red, in l01, l08, l09, l10, l13. Sol's pieces in the l05 boards are green. | Fig. 1 (p. 1): Fable 5 orange, Sol green, Luna brown dotted. | Faithful. Luna's red does not conflict with anything in the paper. |
| Luna's line | Dashed, slopes down slightly, ends about half way across the axis. | Luna about 6 to 7% falling to about 3%, stops near $15 on a log axis (about half way). | Faithful. |
| Sol starts below Fable 5 | Measured as a share of the axis height: Fable 5 starts at about 42%, Sol about 17%, Luna about 6%. Ends: Fable 5 about 79%, Sol about 53%. | Fig. 1: about 43%, 18%, 6%. Ends about 80% and 55%. | Faithful, including the order. |
| Bar order and size | Sol 298 (left), Fable 5 57 (right). Height ratio 5.1. | 298 and 57 (p. 7), ratio 5.2. The paper shows six bars in a fixed model order. | Faithful. The video shows two of six and sorts by size. Opus 5 (233) is second and is not shown. Not false. |
| 98% grid (l10) | 40 squares, 39 hollow, 1 filled, which is 97.5%. | Luna skips its saved programs and notes at about 98% of the decisions where one applies (p. 8). | Faithful. |
| X counts (l11) | 6 of 40 and 15 of 40. Labelled a sketch. | About 0.16 and 0.38 failures per relevant decision (p. 8). | Faithful. |
| Fig. 14 boards (l05) | Left: mate by a white rook. Right: Sol's mating piece drawn as a rook next to the white king. | Left: Ra5#. Right: Qg4# (p. 25). | Left faithful. Right shows a rook where the paper has a queen. Cosmetic. |
| Score axis (l07) | "Score: the share of points won." | Score is 100(W + 0.5D)/N (Fig. 3 caption). | Faithful. |
| Cost label (l07) | "Dollars pay for its games and its reviews." | Cost covers training play and the reflection step (Sec. 2.1, p. 4). | Faithful. |

Pictures that could mislead, most serious first. None is a factual error.

1. **l13 dials.** In the middle frame the Sol bar is about 5 times the Fable 5 bar. In the late frame, after the dials turn, it is about 8 times. The printed 298 and 57 do not move, so the bars stop matching their numbers and the gap widens. A viewer can read this as "the numbers change but Sol stays far ahead", which works against "not a ranking". The label that carries the real counterexample ("Sol gained in board games but lost score in another game.", the NetHack result on p. 7) is not in my frames.
2. **l11 right grid.** No square is filled. With the l10 key ("Filled: used. Hollow: not used.") it reads as "the other models never used them". The paper's other chess models took 28% to 98% of relevant decisions without use (p. 8), so some of their squares should be filled.
3. **l08 and l09 dollar axis.** Fable 5 and Sol finish their rise over a similar span of dollars, so a viewer sees similar gain and similar spend, and then 298 against 57 has no visible cause. In Fig. 1 both models gain about 36 points up to their saturation stars, and Fable 5 reaches its top at about four to five times Sol's cost (my reading of the plot). The axis has no scale, so the sketch cannot show it.
4. **l10 "used most".** The tag sits above Fable 5 only. The paper puts all four high-use models, Sol included, at 94% to 98% use. The orange line "did not all gain a lot" has no picture of a high-use model with a small gain (Opus 4.8, 14).
5. **l06 icon.** The white sheet with a pencil looks like the note card from l04 and l05 (cream paper, blue lines), so it can read as "the model writes notes about test games". The crossed-out magnifier and the label next to it correct this.
6. **l13 stamp.** "NOT A RANKING" drops the paper's word "universal". The strip right under it shows the paper's own sentence, so I accept it in the video. The caption has no strip (section 4d).

## 4. Verdict detail

### 4a. Factual errors (must act)

None. Checked against the paper: every number I could see (298, 57, 1 filled square in 40, 6 of 40 against 15 of 40), the 98% that `script.md` lists for l10, the model names, all eight source tags and the two page strips (each matches its page), the Fig. 14 story (mated on move 37, mate on move 42), the l12 sentence, and the l13 strip.

### 4b. Clarity problems (nice to fix), ranked

Order: first, what the voice says before the picture shows it (1, 2). Then the one picture that works against the closing takeaway (3). Then legibility and the smaller items. Only the caption (4d) can be applied to the live post. These nine are for a re-cut.

| # | Where | Problem | Fix |
|---|---|---|---|
| 1 | l05 | The one-game label is long, late frame only, and shares the line with the "Before" label. | Preferred: bring both boards and both labels in from the middle of the line. If the line cannot change, shorten the right label (it keeps "one game" and "program"): "One game: its program plays every move, and Sol wins." |
| 2 | l12 | The third card is not on screen while the voice says "poor use". | Bring in the "poor use?" card with the word "use". No new wording. |
| 3 | l13 | Dials make the gap wider while the printed numbers stay fixed (section 3, item 1). This works against "not a ranking", a must-pass takeaway. | Let the bars move in both directions by different amounts, keep the order as in the paper, and keep the printed numbers tied to the bars. Or drop the dials and keep the Sol label on screen for the whole second half of the line. |
| 4 | Many | Labels under 11 pt (table in 2c), including the l13 unit label at about 9 pt. The source tags are about 8 pt and dim. | Raise the listed labels to 11 pt or more, and make the tags brighter or drop them from the video (the caption already gives the arXiv number). No new wording. |
| 5 | l04 | The "its games" tag is hidden behind the stack. | Move the tag below the stack and put "Sol wrote..." under it. |
| 6 | l11 | Right grid has no filled square (section 3, item 2). | Fill about one square in three on the right. The key "Filled: used. Hollow: not used." can repeat in small type. |
| 7 | l08, l09 | Similar spend on the two curves hides why 298 is above 57. | Draw Fable 5's rise clearly to the right of Sol's, or add: "Fable 5 spends more to reach its top." |
| 8 | l06 | Pencil icon reads as note writing. | Swap for an exam sheet with a tick or a score mark and no pencil. Optional label: "Test games work like an exam." |
| 9 | l10 | "used most" on Fable 5 only; "used least" crowds the axis. | Put "used most" on a bracket over both the Fable 5 and Sol tags. Move "used least" above the Luna line. |

### 4c. Cosmetic notes

- l05 right board: the mating piece is a rook. The paper's mate is by a queen (Qg4#, p. 25).
- Red carries five meanings: Luna, "no review" (l06), the "Before" label (l05), the question marks on the l12 cards, and the "NOT A RANKING" stamp.
- l01: Luna's eyes go dark in the late frame. It can read as "off" or "dead".
- l11: the left grid is fully filled. The paper has 94% to 98% use, so a few hollow squares would be exact.
- l08: the Fable 5 curve is still being drawn when the line ends, and finishes in l09.
- l13: the captions are set smaller than elsewhere (about 12 pt against 16 pt). The stamp covers the top of the Sol bar.
- l02 and l13: the page strips start and end mid-word at the frame edges.
- l12: the first still shows only the caption bar.
- l14: the end card shows the handle in capitals.
- l09 and l13 show two of the paper's six bars (Opus 5 at 233 is second). Not false.

### 4d. Instagram caption, revision 4

Line by line against the paper:

| Sentence | Verdict |
|---|---|
| Two AI models get the same practice. Only one improves. | True (Sol and Luna, same interface). |
| A new paper, Agent Plasticity, measures how well an AI model learns: the test score gain for each dollar it spends to learn. | True (Sec. 2.2). 23 words in one sentence. Split it. |
| In the authors' runs, Fable 5 reached the best test score, but Sol had the best plasticity. | True (pp. 7 and 8). 17 words. The revision splits it in two. |
| Luna almost never used its programs and notes and showed no reliable gain. | True (p. 8 and p. 7). |
| Models that used them less gained less. | True as an association (p. 8). |
| The paper calls this a link, not proof. | A fair paraphrase. The paper says association and observational, not causal (pp. 5, 8). "calls" reads like a quote, so use "treats". |
| Limit: the numbers are estimates that depend on the games and the prices. | True (p. 7). |
| They do not rank models. | Stronger than the paper, which limits the claim to its own test protocol and calls the numbers non-universal. In the video the l13 strip shows that limit next to the narration. The caption has no strip, so it needs the limit in words. |
| Paper: arXiv 2610.08902. Unofficial explainer. | True. |

Other gaps for a reader of the caption alone:

- "Fable 5", "Sol" and "Luna" have no maker or full name. The video shows "Claude Fable 5", "GPT-5.6 Sol", "GPT-5.6 Luna".
- "its programs and notes" has no meaning in the caption. A reader can take it as "the AI retrains itself". One sentence closes it: the model never changes, it writes programs and notes for itself.

Paste-ready revision 5 (each sentence passed the style check, section 4f):

```
Two AI models get the same practice. Only one improves.

A new paper, Agent Plasticity, measures how well an AI model learns. The model never changes. It writes programs and notes for itself. Plasticity is the test score gain for each dollar the model spends to learn.

In the authors' runs, Claude Fable 5 reached the best test score. GPT-5.6 Sol had the best plasticity. GPT-5.6 Luna almost never used its programs and notes. It showed no reliable gain. Models that used them less gained less. The paper treats this as a link, not proof.

Limit: these numbers are estimates. They depend on the games and the prices. They do not give a universal rank for models.

Paper: arXiv 2610.08902. Unofficial explainer.
Comment "Paper" or "Research" for links
```

Keep the hashtags line as it is. I did not touch the live post.

### 4e. Live checks (about two minutes)

Scrub the live reel at these points. Each item is in `script.md` and not in my frames.

| Time on the reel | Line | Check |
|---|---|---|
| 43 to 48 s | l10 | "98%" with "of the moves where one applied: not used." The key "Filled: used. Hollow: not used." and "Used: it runs the program or follows the note." are on screen long enough to read. |
| 49 to 51 s | l10 | "This is a link, not proof." and "A second model judged this from the game logs." |
| 59 to 61 s | l12 | The third card "poor use?" appears. |
| 62 to 66 s | l13 | "Sol gained in board games but lost score in another game." The paper supports it (NetHack, p. 7). It must not say "chess" or "Go". |
| 66 to 72 s | l14 | The "how well it learns" label shows. |

What would change the verdict: a number other than 98%, a key that says the opposite, a word like "proves" or "causes", or a Sol label that claims a loss in a board game.

What would not change it: "on screen but too brief". Expect that for the l10 row. The 98% and its key are about 34 words, and they must fit between my early and middle stills, in the first half of an 8 s line. If they are too brief to read, count it as a clarity issue for a re-cut. It is not a reason to act on the live post.

Phone check (not a finding, because stills cannot show it). Instagram draws its own text over the reel. The burned-in caption bar sits at about 78% to 83% of the height and reaches about 94% of the width. Muted viewers read the narration there. Check on a phone that the bar is clear of the account name, caption preview and the button column. Also check the tag at the top left of l01 (about 7% to 11% of the height) against the status bar, and the right edge of l12 where the third card should land (my estimate from the first two cards: about 68% to 96% of the width, 28% to 48% of the height). That card is likely clear of the button column, which starts lower, but confirm. The l13 dials and the Fable 5 tags in l08 to l10 sit under 86% of the width and above the button column, so I did not list them.

### 4f. Exact ASD-STE100 wording

New or changed sentences only. Each is at most 15 words and has no -ing form, no modal verb, no phrasal verb, and an active verb in the simple present or past.

| Where | Sentence | Words |
|---|---|---|
| l05 label (only if it must be shorter) | One game: its program plays every move, and Sol wins. | 10 |
| l06 label (optional) | Test games work like an exam. | 6 |
| l08 and l09 label (optional) | Fable 5 spends more to reach its top. | 8 |
| Caption | A new paper, Agent Plasticity, measures how well an AI model learns. | 12 |
| Caption | The model never changes. | 4 |
| Caption | It writes programs and notes for itself. | 7 |
| Caption | Plasticity is the test score gain for each dollar the model spends to learn. | 14 |
| Caption | In the authors' runs, Claude Fable 5 reached the best test score. | 12 |
| Caption | GPT-5.6 Sol had the best plasticity. | 6 |
| Caption | GPT-5.6 Luna almost never used its programs and notes. | 9 |
| Caption | It showed no reliable gain. | 5 |
| Caption | Models that used them less gained less. | 7 |
| Caption | The paper treats this as a link, not proof. | 9 |
| Caption | Limit: these numbers are estimates. | 5 |
| Caption | They depend on the games and the prices. | 8 |
| Caption | They do not give a universal rank for models. | 9 |

The narration needs no change.
