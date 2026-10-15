# Cold viewer answers: software engineer, round 1

Persona: software engineer who uses AI coding assistants daily, knows what an LLM, a prompt and a benchmark are, has not read the paper. I read only `v1-kit/script.md`, the 14 frame sheets (l01 to l14, three samples each) and `quiz.md`. I looked nothing up.

Tags used below:

- [my background] means I filled this in from general engineering or ML knowledge. The video did not say it.
- [guess] means I do not know and am guessing.
- `not conveyed` means the video did not tell me.

The frame sheets hold three samples per line. "Not visible in the sampled frames" means I did not see it in those three. The script may list it.

## 1

A paper proposes scoring an AI agent by how much its held-out score improves per dollar of learning cost, which it calls plasticity. The video says the agent with the best final score need not be the one that improves most efficiently, and that agents can fail to follow what they write down for themselves.

## 2

The video never names the usual way of testing agents. The gap is implied, and the only contrast comes at l13 (about 60 s): a score shows what an agent can do today, plasticity shows how efficiently it improves. So the missing piece is, by implication, how quickly or cheaply an agent gets better, which a single score does not show [my background]. What the paper adds is plasticity: held-out score gained per dollar of learning cost. A viewer who stops before l13 gets no statement of the problem.

## 3

Not changed: the model. l02 labels it "model: frozen" and puts a lock on the robot. I read "frozen" as no weight updates [my background], but the video never says weights or training. Each game starts fresh, so I assume context and game state do not carry over [my background].

Changed: the artifacts, which pass to the next game. The video never says outright that the agent writes or edits them. l01 ("wrote itself a rule") and l11 ("told itself to load its saved program first") imply it.

## 4

The video never defines artifacts in words. It shows a sticky note labelled ARTIFACTS passing from "this game" to "next game" (l02) and reuses the icon in l08 and l09. From l01 and l11 I infer they are things the agent writes for its future self: a rule ("Pray only through its own tool") and a saved program, with a file listing of README, engine.py, notes.md and src/ in l11 [guess]. I first read "artifact" as a build artifact, a file produced by a process [my background], and only l11 made me fairly sure. The video does not say whether artifacts are notes, code or both. A non-engineer has no anchor for the word.

## 5

Held-out score gained per dollar of learning cost (l03 formal wording, l04 plain wording). Counted: the gain in held-out score, in points. Divided by: learning cost, in dollars. The slope triangle in l04 makes this clear. `not conveyed`: what the dollars pay for, and what the gain is measured from. I assume API spend while the agent practises, and gain relative to the starting score, because the line starts at a dot above zero [guess].

## 6

`not conveyed`. The only hint is a small on-screen label, "held-out: never seen while learning", which the narration never reads out. I saw it in the l04 frames. The script lists it under l03, so the timing may differ. The video also never says held-out refers to games. It says only "held-out score" and "held-out performance". My reading is that it checks the agent generalises instead of memorising what it practised on [my background]. The video does not say that.

## 7

The video has no single headline. The claim it quotes from the abstract (l06) is that the agent that ends best need not be the one that improves most efficiently. l05 says some agents improved, some stayed flat and a few got worse, with no counts and no names. l07 gives the example: one model gets 298 points per $1,000 (estimated), the top scorer 57. l08 and l09 say one agent barely uses its artifacts, while strong agents use them almost always and still fail mostly while using them. l10 and l11 add that a written instruction is not always followed. `not conveyed`: how many models, which games, how big the final score gap is.

## 8

The two kinds: the agent whose held-out score ends highest ("ends higher" on the two-curve sketch), and the agent that gains the most score per dollar ("faster per dollar"). No, the video says they need not be the same model (l06), and its example uses two. On the sketch, Claude Fable 5 ends higher and GPT-5.6 Sol rises faster per dollar. The script lists the sketch under l06. In the sampled frames the abstract crop covers it, and I could first read the model names at the start of l07. The bars then give GPT-5.6 Sol 298 points per $1,000 against 57 for "top scorer". The narration never says the names aloud, and the dashed "top scorer" box carries no model name in the sampled frames, so I inferred that the top scorer is Claude Fable 5 from the sketch [guess]. The sketch is marked "sketch, not data", and no final scores are given.

## 9

`not conveyed` as a cause. Three lines are hints. l08: one agent does not use its artifacts at about 98% of relevant decisions. l11: an agent wrote "load the saved program first" and listed files instead. l10 states the general version. The video never says the l08 or l11 agent is one that stayed flat or got worse, so linking them is my inference [guess]. l09 complicates it: strong agents use artifacts almost always, so non-use cannot be the whole story.

## 10

Do not read the numbers as a ranking of models (l12, "NOT A RANKING"). They depend on the setup and the prices, and l07 labels them "estimated". The curves in l06 and l07 are marked "sketch, not data", so the crossing shape is an illustration. Nor is 298 versus 57 a verdict on which model is better overall, since the video gives no final scores.

## 11

Most confusing: l09, "Most of their failures happen while they use them." The picture has 48 of 50 squares lit (artifact used), and five of the six red X marks I could see sit on lit squares. When nearly every decision uses an artifact, nearly every failure lands there anyway, so I could not tell what the sentence shows. It could mean artifacts do not prevent failures, that they cause failures, or that failures are not due to ignoring them. I could not pick one [guess].

Other points:

- l07: "The top scorer gets 57" has no unit. I read it as points per $1,000 [guess]. The model names are on screen only, in small labels. The script lists them under l06, where the abstract crop covers them in the sampled frames, so I first read them at the start of l07. The colours also flip. In the sketch orange is Claude Fable 5 (ends higher) and blue is GPT-5.6 Sol, but in the bars the orange 298 bar is GPT-5.6 Sol. I briefly read the tall orange bar as the winner. The number 57 is not visible in the sampled frames. "Estimated" is never explained.
- l01: I do not know what "its own tool" in "Pray only through its own tool." refers to, or why the channel matters. Why praying is dangerous is `not conveyed`. The rule is never followed up: nothing says whether the agent obeyed it or whether it helped. The ending repeats the hook only in faint small text.
- l08: "One agent" is unnamed and "relevant decisions" is undefined.
- l03: "held-out performance gain per unit learning cost" arrives in 4.5 s, and held-out is defined only in a small unspoken label.
- The paper crops (l03, l06, l10) are a narrow moving strip that repeats the caption. I read the caption instead, so the crops added credibility but no understanding.
- Vocabulary: the video says agent in l01, l05, l06, l08, l09, l11, l13 and l14, and model in l02, l07 and l12, without saying they are the same. I treated them as the same [my background].
- Structure: l08 to l11 (how agents behave) never link back to the results in l05 to l07.

## 12

Researchers freeze an AI model and let an agent play game after game (the opening example is NetHack), so only the artifacts it saves for itself carry over. They measure plasticity, the held-out score (never seen while learning) gained per dollar of learning cost: a score shows what an agent can do today, and plasticity shows how efficiently it improves. Some agents improve, some stay flat and a few get worse, the best final scorer need not be the best improver, and some agents do not follow what they wrote down.

## Ratings

- (a) The opening told me what the video was about: 3. The death and self-written rule hook is concrete, but it does not say the video is about measuring improvement per dollar. "Plasticity" first appears at 9.6 s (l03), and the paper's name only on the end card.
- (b) The story had a clear beginning, middle and end: 3. The shape is there (hook, setup, metric, results, caveat, takeaway, closing question), but the hook's rule is never followed up and l08 to l11 are not tied back to l05 to l07.
- (c) Every new word was explained before it was used: 2. Plasticity is defined as it arrives. Artifacts, frozen model, held-out, tool, relevant decisions and estimated are not explained in the narration. A non-engineer would likely give 1 [guess].
- (d) After one viewing I could explain the paper to someone else: 3. I can give the metric, the headline claim and the caveat. I cannot say what the experiment was (which games, how many agents, what learning cost covers). A non-engineer would likely give 2 [guess].

## Line-by-line log

| Line | Mark | Reason |
|---|---|---|
| l01 | partly | Hook is concrete (died, wrote a rule), but "its own tool" is unexplained and the rule is never followed up. |
| l02 | partly | Lock, two games and a note passing across got me there [my background]. "Freezes the model" and "artifacts" are not explained in words. |
| l03 | partly | Definition is shown on the paper page but is dense for 4.5 s. "Held-out" is used with only a small label as explanation. |
| l04 | clear | The slope triangle shows score gained per dollar directly. What the dollars pay for is not said. |
| l05 | partly | Improved, flat and worse are clear. How many agents, which ones, and gain from what are `not conveyed`. No "worse" curve in the sampled frames. |
| l06 | clear | Best final versus fastest improver is clear to me [my background]. The script lists the crossing sketch here, but the abstract crop covers it in the sampled frames. |
| l07 | partly | The contrast lands. The top scorer is unnamed in speech, 57 has no unit, and orange changes meaning between sketch and bars. |
| l08 | partly | One lit square in 50 makes 98% concrete. "One agent" is unnamed and "relevant decisions" is undefined. |
| l09 | partly | Nearly all squares lit is clear. The second sentence is lost: with 48 of 50 lit, failures landing there tells me nothing. |
| l10 | clear | Plain sentence, with a red circle on "following". It is a bare paper strip until l11 gives the example. |
| l11 | clear | Note, then a directory listing, shows the instruction skipped. Why that counts as a failure needs engineering sense [my background]. |
| l12 | clear | Setup and price dials moving the bars say the numbers shift. "Setup" itself is vague. |
| l13 | clear | A dot versus an arrow gives the missing contrast, but only at 60 s. |
| l14 | clear | The closing question echoes the hook. The paper title and arXiv id are small and appear only here. |

## Background I leaned on, and what a non-engineer would miss

- "Freezes the model" as no weight updates (l02). A non-engineer would not parse it.
- "Held-out" as a train/test split (l03, l04). The narration never explains it.
- Artifacts as files written for a future run (l02). Only the file listing in l11 made me fairly sure.
- The l11 file listing as a directory listing, "<>" as code, and why listing files first counts as ignoring the instruction. A non-engineer would see nothing wrong with listing files.
- "Tool" in the l01 rule as a function the agent can call. Even so I cannot say what the rule means.
- NetHack as a game, from the label and the GAME OVER screen plus general knowledge [my background]. The video does not explain it.
- "Estimated" and "prices" as dollar cost computed from usage and API prices [guess].
