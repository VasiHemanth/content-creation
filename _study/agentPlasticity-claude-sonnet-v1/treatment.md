# Treatment: Agent Plasticity (arXiv 2610.08902 v1)

Paper: "Agent Plasticity: Measuring Self-Improvement Through Experience", Harman Singh, Anton Bakhtin, Rulin Shao, Gabriel Synnaeve, Ilia Kulikov, Rob Fergus, Sanjeev Arora, Kurt Keutzer, Jason Weston, Anuj Mahajan, Anirudh Goyal (UC Berkeley, Meta Superintelligence Labs, University of Washington, Princeton). arXiv 2610.08902v1, 6 Oct 2026, 43 pages. Main text (pages 1 to 11) read in full from `llm-wiki/raw/assets/2610.08902/paper-v1-text.txt`. The appendix was searched, not read in full.

Provenance, for the model comparison:

- Written inline by Claude Sonnet 5.5 in the main session. The `reel-director` subagent (Opus) was not used because the user declined that spawn.
- This is not a blind regeneration. Earlier in the same session I read the kimi-k3 treatment and storyboard while finishing that run. I did not reopen them for this file. The hook, metaphor, receipts and script below were chosen from the paper, but I cannot claim they are independent of what I read.

Renderer: HyperFrames. Folder: `paper-reels/episodes/agentPlasticity/`. Voice: `aiden` at 1.12. Size: 14 lines, 186 spoken words, 7 scenes. Length: about 77 s at the pace measured on earlier episodes (about 2.85 spoken words a second, plus 0.75 s of lead and tail per line). Every beat below is tied to a spoken word, so re-time from this episode's `audio/words.json`.

What the channel already covered: Dream-RSI and ContextEvo (mechanisms for agent self-improvement), SkillSeek, DeepSWE, AutoCompact. This paper is the measurement side of self-improvement. Pictures already used: trees, dream bubbles, desks, scrolling message screens. This one uses a notebook, a slope and two curves.

## 1. The one idea

An agent's score and how fast it learns are different things, and the paper measures the second one: held-out score gained per dollar of learning cost.

The mechanism comes second (the producer needs it, the viewer needs only the sentence above):

1. The model's weights are frozen. Each game starts in a fresh context.
2. Between games the same model edits its own artifacts (tools, skills, strategies, memory), and the next game inherits them.
3. Every checkpoint is scored on held-out games the agent never trained on, and the learning cost is counted in dollars.
4. Plasticity is the score gained per cost. The best player (Claude Fable 5) and the fastest learner (GPT-5.6 Sol) are different models.

## 2. Hook options

| # | Spoken line (STE, 12 words max) | On screen from 0.0 to 1.0 s |
|---|---|---|
| A | "This agent died while it prayed. Then it wrote itself a rule." (12 words) | Frame 0 already shows big type `IT DIED WHILE PRAYING.` in white and `THEN IT WROTE ITSELF A RULE.` in amber, over a dungeon-game panel with a small figure, a halo and a dust vortex closing in. A `NetHack` tag sits on the panel frame. By 1.0 s the vortex hits and the panel flashes. |
| B | "The best agent is not the best learner." (8 words) | Big type `NOT THE BEST LEARNER.` over two curves, one ending higher and one climbing faster. |
| C | "Two agents get the same practice. Only one gets better." (9 words) | Two identical robots at a desk, a stack of coins falling on both, one robot's score bar climbing. |

**Pick A.**

- **It is a scene, not a thesis.** A viewer needs no prior interest in "learners" to want the next two seconds. B is the paper's headline, but it is an abstract claim; it works better as the first receipt (l06), where the paper's own sentence says it.
- **It sets up a callback.** The rule the agent wrote in the hook comes back at l10, where the paper says that writing an instruction down is not the same as following it. The last line is a question that A answers, so a replay reads as question then answer.
- **Why not C:** "practice" is a synonym the paper's term ("experience") avoids, and a generic coin-rain picture would repeat what the channel used for cost before.

**Truth check for A.** Figure 8 and its caption (p. 10), bottom panel, NetHack, Claude Opus 5.5:

- At checkpoint 1 the game ends with the message "Killed by a dust vortex, while praying." The agent had prayed using raw keystrokes.
- The caption: "after dying at checkpoint 1 while praying through raw keystrokes, Claude Opus 5.5 adds a rule to pray only through its own controller; at checkpoint 10 the prayer heals it."
- The rule is a real file edit: "checkpoint 2 · CLAUDE.md, lines 66-67 added after the checkpoint-1 games: ... Pray only via `nhctl pray`, which refuses raw `pray`."
- The agent edits its own file between checkpoints (sec 3.1, p. 6: "the model may edit CLAUDE.md/AGENTS.md, skills, Python tools, strategies, and memory").

"Died" is the game character, so the first frame shows a game panel and the `NetHack` tag, not a person. The line says "this agent", not a model name.

**First-frame rules.**

- The big type is at full opacity at 0.0 s. It may settle in scale from 1.12 to 1.0 over 0.0 to 0.25 s. No entrance from opacity 0.
- The thumbnail hook uses the same words (`thumb_hook`: "It died while praying. Then it wrote itself a rule.").
- "Plasticity" is first spoken at l03 (about 11 s) and the paper's name appears only on the end card. Neither is ever the largest text in the first 2 s.

## 3. Visual metaphors (one per idea)

**Idea 1, what an agent carries: the notebook.**

- **Picture.** A ruled notebook with a spiral edge. The cover reads `artifacts`. In the hook it receives one line, the new rule. In `wake` the same notebook is handed from one fresh robot to the next. It comes back, closed and dusty, in `why`.
- **What a stranger reads.** "It forgets everything each game, but it keeps a notebook."
- **Scenes.** Carried by `wake` (l02). Set up in `hook`, paid off in `why` and `follow`.
- **Limits.** It stands for the paper's artifact inventory (executable tools, strategies, textual memory, sec 2.1). It adds no number and no claim about how many artifacts exist.

**Idea 2, plasticity: the slope.**

- **Picture.** A plot with `learning cost` along the bottom and `held-out score` up the side. A line climbs. A small bracket marks "rise" over "run". A steeper line means more plasticity.
- **Scene.** Carried by `plot` (l03, l04). The same axes hold the curves of l05.
- **Limits.** A schematic. A small tag says `sketch, not data`. The log scale of the paper's Figure 1 is not drawn.

**Idea 3, best score is not best learner: two curves.**

- **Picture.** Two saturating curves from one start. One ends higher and climbs slowly. The other climbs steeply and stops lower. A stranger reads "one wins at the end, one is faster per dollar".
- **Scene.** Carried by `twist` (l06), then the curves collapse into two bars (l07).
- **Limits.** The curve shapes are schematic and carry no values. The names appear only as small tags.

**Not metaphors.** The results are two bars (`twist`). The reuse tiles in `why` are data marks, drawn from the 98% value.

**Must-nots.**

- No crown, trophy or green check on the top scorer. The `top scorer` tag is neutral.
- Data marks (bars, curves, tiles) stay in the neutral palette: amber and cyan. The coral `fail` marks in l09 are a kind, not a value.
- The 50 tiles in l08 are drawn from the storyboard value (98), and the count of closed tiles is never printed.
- The failure marks in l09 are few and illustrative. The paper says failure shares do not measure overall failure frequency, so no count or share goes on screen.

## 4. Receipts

Three passages, spaced about 15 to 25 s apart. Each is read on camera at about 3.4x, holds for about 2 s on one phrase, and then the scene's own picture returns. The camera holds still during a highlight (`follow: 0`), and no receipt starts before 0.1 s into its scene.

| # | Line | Page, section | Exact text in the paper | Read on camera (highlighted) | `find` | `circle` | Hold (est.) |
|---|---|---|---|---|---|---|---|
| R0 | l03 | p. 4, sec 2.2 | "We operationalize agent plasticity as held-out performance gain per unit learning cost." | "held-out performance gain per unit learning cost." | `held-out performance gain per unit learning cost.` | none | 12.0 to 14.5 s |
| R1 | l06 | p. 1, Abstract | "Endpoint capability and acquisition efficiency also diverge: the agent that ultimately performs best need not be the one that improves most efficiently." | "need not be the one that improves most efficiently." | `need not be the one`, `that improves most efficiently.` | `efficiently` | 25.5 to 28.0 s |
| R2 | l10 | p. 9, sec 3.5 | "Writing down an instruction is not the same as following it." | "not the same as following it." | `Writing down an instruction is`, `not the same as following it.` | `following` | 50.0 to 52.5 s |

**What each hold sits between.**

- **R0.** Before: the axes draw. After the highlight, the page falls away and the slope bracket (l04) lands on "per dollar".
- **R1.** The first clause ("The agent that ultimately performs best") is spoken over the two curves. The page dives on "need not be", holds on the last two clauses, and the scene cuts back to the curves with an arrow on the steeper one.
- **R2.** Before: the tiles of l09. After: a sticky note slaps onto a monitor (l11), in the same amber as the hook's `NEW RULE` stamp.

## 5. Shot list

Renderer HyperFrames. Main transition `whip`, accents `zoom` and `punch`, `cut` inside a topic, `blur` for the wind-down. Times are estimates (line length = 0.25 s lead + voice + 0.5 s tail), to be replaced by `words.json`.

| Scene | Line | Start (s) | Spoken words | On screen / camera | Transition out |
|---|---|---|---|---|---|
| hook | l01 | 0.0 | "This agent died while it prayed. Then it wrote itself a rule." | 0.0 s: big type already on screen over a dungeon panel (`NetHack` tag). A small figure kneels with a halo; a dust vortex closes in. "died": the vortex hits, the panel flashes, `GAME OVER` slams, and the death message types out. "prayed": the halo flares. "Then": a notebook strip rises. "wrote": a pencil draws one amber line. "rule": a `NEW RULE` stamp lands and the rule text types in. Slow push. | whip |
| wake | l02 | 5.0 | "The paper freezes the model. Each game starts fresh. Its artifacts pass to the next game." | A robot with closed eyes. "freezes": frost lines draw over its head and a padlock pops (`model: frozen`). "starts fresh": its card wipes blank and its eyes open. "artifacts": the notebook (cover `artifacts`) drops in. "pass": it arcs to a second fresh robot on the next card; the camera pans across. | zoom |
| plot | l03 | 11.3 | "Plasticity means held-out performance gain per unit learning cost." | The axes draw (`learning cost`, `held-out score`) and a vault tag marks the held-out side. Receipt R0: page rises, camera dives, highlighter follows "held-out performance gain per unit learning cost", about 2 s. Cut back to the axes. | cut |
| plot | l04 | 15.2 | "In plain words: score gained per dollar." | A coin lands on the cost axis, a line climbs, a rise-over-run bracket pops. "score": the rise arrow. "dollar": the coin and the `rise per dollar` tag. | cut |
| plot | l05 | 18.4 | "Some agents improved. Some stayed flat. A few got worse." | Five more curves draw from the same start: two climb, two stay level, one sags. "improved": the climbers. "flat": the level ones. "worse": the sag. Camera rides the top curve. | whip |
| twist | l06 | 22.7 | "The agent that ultimately performs best need not be the one that improves most efficiently." | Two schematic curves with name tags (`Claude Fable 5` ends higher, `GPT-5.6 Sol` climbs steeper). "need not be": receipt R1 dives, highlighter follows the last two clauses, about 2 s. Cut back to the curves; an arrow lands on the steep segment on "efficiently". | punch |
| twist | l07 | 28.7 | "By the estimates, one model gets two hundred ninety eight points for each thousand dollars. The top scorer gets fifty seven." | The curves fold into two bars. "two hundred": the left bar grows, **298** counts up. `points per $1,000` and `estimated` tags pop. "fifty": the right bar grows to **57**, `top scorer` tag. Camera pulls back to frame both. | cut |
| why | l08 | 36.8 | "One agent does not use its artifacts at about ninety eight percent of relevant decisions." | A grid of 50 decision tiles, each with a small page. "not use": the notebook shuts, dust puffs, and all tiles but one go dark in a sweep. "ninety eight": **98%** slams. "relevant": a `relevant decisions` tag. | cut |
| why | l09 | 42.8 | "Strong agents use them at almost every decision. Most of their failures happen while they use them." | The grid flips: almost every tile lights amber. "failures": a few coral `fail` marks land, nearly all on lit tiles. Camera pushes in on one lit tile with a mark. | cut |
| follow | l10 | 49.5 | "Writing down an instruction is not the same as following it." | Receipt R2: page rises, highlighter follows "not the same as following it", a pen loop circles `following`, about 2 s. Cut back to a monitor. | cut |
| follow | l11 | 54.1 | "One agent told itself to load its saved program first. It listed files instead." | A sticky note slaps onto the monitor (`LOAD THE SAVED PROGRAM FIRST`). "listed": a file list slides in (`files/`, `README`, `engine.py`, `notes.md`, `src/`). A cursor walks the list. "instead": the note wiggles, ignored. Camera pushes on the note. | blur |
| close | l12 | 59.8 | "These numbers depend on the setup and the prices. Do not use them to rank models." | The two bars, small, with a price dial. "prices": the needle swings and the bars wobble a little. "rank": a `NOT A RANKING` stamp slams across them. | cut |
| close | l13 | 66.2 | "A score shows what an agent can do today. Plasticity shows how fast it improves." | One dot on the plot (`score today`). "Plasticity": a dashed slope line draws from the dot. "fast": an arrow zips along it. | cut |
| close | l14 | 72.2 | "What does your agent do after it fails?" | The question in big type. The hook words ghost back in, dip out, and the end card rises: only `hemanth_with_ai` and a small credit line. | (end) |

**Pacing audit.** The lines run 3 to 8 s, and every line schedules at least two events on spoken words. The longest holds are the receipts (about 2 s), and each carries a highlighter, a camera dive and a pen loop, so no 3 s stretch is static. The first event lands at 0.0 s. The end card holds for the last 1.6 s of l14 and is excluded by the gate.

## 6. Numbers budget (3)

1. **298** (GPT-5.6 Sol): estimated plasticity in score points per $1,000 of mean per-game learning cost, combined chess, Go and Hex curve. Sec 3.4, p. 7 (and Figure 1). Relative (per cost), estimated from a saturation fit, the authors' runs. It depends on provider pricing. The line says "By the estimates".
2. **57** (Claude Fable 5): the same unit and curve, same section. Estimated, relative. Fable 5 also reaches the highest fitted performance level (sec 3.4, Finding 2).
3. **98%** (GPT-5.6 Luna): the share of relevant chess decisions taken without artifact use, pooled over Hard and Easy chess. Sec 3.5, p. 8. A share, measured, the authors' analysis (semantic labelling by Gemini 3.1 Pro plus execution evidence, sec 2.3). The line says "about".

Unit note: `$1,000` appears only as the unit tag on 1 and 2. Model names are on-screen tags, never spoken. Cut: 73.3%, 37.5%, 233, 14, 61.75, the NetHack scores, the 83 to 99% failure shares and every checkpoint count.

## 7. The honest caveat

Placed at l12 (about 60 s), paced like every other line, with its own picture (the price dial and the stamp): "These numbers depend on the setup and the prices. Do not use them to rank models." True to the paper: "plasticity is a protocol-dependent measure, not a universal model ranking" (sec 3.4, p. 7) and "plasticity estimates depend on score headroom, the learning horizon, saturation-fit assumptions, and provider pricing" (sec 4, p. 10 to 11). The reuse figures are observational: "artifact use does not establish causal effectiveness" (sec 2.3).

## 8. Loop and ending

The last line is a question: "What does your agent do after it fails?" The first line answers it: "This agent died while it prayed. Then it wrote itself a rule." So a replay reads as question then answer. The end card shows only `hemanth_with_ai` and a small credit line.

## 9. Post text angle

**Title:** It died while praying. Then it wrote itself a rule.

**Caption first line:** "A new paper measures how fast AI agents learn from their own mistakes. The best player was not the fastest learner. (Unofficial explainer.)"

---

## STE notes for the producer

Terms for `storyboard.json` `ste.terms` (the paper's word, then the synonyms to refuse):

- `plasticity`: learning efficiency, adaptability, learning rate, learning speed
- `artifacts`: notes, notebook, memory, inventory (the notebook is a picture only; spoken lines say `artifacts`)
- `held-out`: unseen games, new games, test games
- `learning cost`: practice cost, training spend, budget
- `experience`: practice, training data

`ste.names`: `NetHack`, `learning` (only inside the paper's term "learning cost"). `ste.allow`: l10 rule `ing` (quotes the paper verbatim, and the receipt shows the same words).

Known soft findings, left as they are: l03 noun cluster ("Plasticity means held-out performance gain", a near-quote of the paper) and l07 noun cluster ("two hundred ninety eight points", a spelled-out number).

The spoken numbers are said as a person says them: "two hundred ninety eight", "fifty seven", "about ninety eight percent". No model name is spoken anywhere.

---

## Production notes (added after the build; the plan above is unchanged)

What the finished video does differently from the plan, in the order it matters:

- **Length.** 70.0 s, not 77 s. The voice read faster than the 2.85 words a second I planned with. Line starts in the shot list are estimates; the real ones are in `audio/words.json`.
- **l13 wording.** The plan said "Plasticity shows how fast it improves". My own claim check changed it to "how efficiently it improves" (the paper's word). The paper measures gain per dollar of learning cost, not speed over time, so "fast" overclaimed. The on-screen tag changed with it.
- **Receipts.** The p. 4 definition is read as two highlights ("held-out performance gain", then "per unit learning cost.") because one highlight was wider than the frame at 3.4x. All three receipts hold the camera still (`follow: 0`), start no earlier than 0.1 s into their scene, and put their label in a layer outside the camera so the zoom does not enlarge it. The chart behind a receipt is faded while the page is up.
- **l12 caveat picture.** Two dials, `setup` and `price`, turn on the spoken words and the two bars change height (the left bar always stays taller), then the `NOT A RANKING` stamp lands on "rank". The plan had a single price dial.
- **l07.** A dashed outline of the second bar appears on "The top scorer" so the `top scorer` tag has something to sit above until the bar grows on "fifty".
- **Soft light pulses (not in the plan).** The engagement gate counts a visual event only when a frame changes by more than 3.0 grey levels on average. Thin line drawings (the slope, the curves, the dials) never reach that, so the plot, twist, wake, why and close scenes carry a faint warm pulse (about 0.2 opacity, 0.5 s linear fade) on emphasis words. Shorter pulses fell between the gate's 4 frames-a-second samples and did not count.
- **Hook details.** The halo flares on "died", not on "prayed" as planned, so it reads as the prayer failing; the death message types across "while it prayed". The game panel is a line drawing, not a screen capture of NetHack.

Checks on the finished file:

- `ste.mjs`: 0 hard findings, 1 soft (l03, a near-quote of the paper). The l07 noun-cluster note disappeared once the caption text used digits.
- `hf.mjs check`: passes. Two contrast notes remain on the `GAME OVER` and `NEW RULE` stamps at about 3.9 s. The frame is legible; the checker reads each stamp's outline as its background.
- `validate.mjs`: 22/22. Longest stretch without a visual event 2.8 s, 106 events a minute, video 70.0 s.
- Not done: the independent `reel-validator` claim review and the `retention-critic` review, and nobody has listened to the audio. Lines l07 and l08 anchor only 15 of 21 and 12 of 15 words because whisper writes spelled-out numbers as digits; the other twelve lines anchor fully.
