# Treatment: Agent Plasticity (arXiv 2610.08902)

Paper: *Agent Plasticity: Measuring Self-Improvement Through Experience* (Singh, Bakhtin, Shao, Synnaeve, Kulikov, Fergus, Arora, Keutzer, Weston, Mahajan, Goyal). Full text read from `llm-wiki/raw/assets/2610.08902/paper-v1-text.txt` (43 pp).

Coverage context: the wiki's `agent-self-improvement` topic covers *mechanisms* (Dream-RSI, ContextEvo). This paper is the *measurement* counterpart, so the angle is fresh: it grades the learners, it does not build one.

## 1. The one idea

Frontier agents get the same experience and the same rules, yet they learn at wildly different rates, and the agent with the best final score is not the one that learned most efficiently.

## 2. Hook options

**A. "The best agent is not the best learner."** (9 words)
First second: the full line slams in big type at 0.0 s ("NOT" stamped a beat later), same words as the thumbnail. A gauge needle sits frozen behind the type.

**B. "Give two agents the same practice. Only one gets better."** (10 words)
First second: "SAME PRACTICE." over two identical robots; "ONLY ONE GETS BETTER" lands at 0.8 s.

**C. "Your agent writes itself notes. Does it ever read them?"** (10 words)
First second: "IT WRITES NOTES." over a scribbling pencil; "DOES IT READ THEM?" at 0.8 s.

**Pick: A.** It is the paper's Finding 2 verbatim in spirit (Claude Fable 5 reaches the highest fitted endpoint; GPT-5.6 Sol has the highest estimated plasticity, p. 7–8), so the claim is provable from the text. It sets up the 298 vs 57 payoff, it needs no model name to work, and the closing line can hand straight back to it for the loop. B covers Finding 1 (spread), which the curves scene already shows; C is a detail from the failure analysis, good for a comment prompt but too small for the frame.

## 3. Visual metaphor

**Two identical gauges under one rain of coins.** The same experience falls on both (same games, same interface, same update chances); one fill line climbs, the other barely twitches. Rise per unit poured is plasticity. A stranger reads it without the caption: equal rain, unequal rise.

- Carried by scene **measure** (l05–l06): gauges appear, coins rain, needles move.
- Pays off in scene **twist** (l10–l11): the gauges return as the two bars, 298 vs 57.
- The metaphor adds no numbers, names or claims (rain is equal, rise differs: exactly the controlled setup, not a result it invents). No crown, no red/green on the gauges.

Secondary illustration, scene **breakdown**: a closed toolbox for artifacts that exist but never get used (the lid rattles, it stays shut). Also neutral.

## 4. Receipts

Four passages, each spoken nearly word for word; each holds about 2 s on one phrase, then the scene cuts back to its own visual while the rest of the line plays.

1. **Page 1 (abstract), scene measure, l06.** Exact text: "We introduce agent plasticity, the efficiency with which an agent converts experience into gains in future held-out performance." Narration: "Agent plasticity: the efficiency with which an agent converts experience into gains in future held-out performance." Highlight "the efficiency with which an agent converts experience into gains"; cut back to the gauges for "in future held-out performance".
2. **Page 6 (§3.2), scene spread, l07.** Exact text: "The common learning interface therefore permits improvement but does not ensure it." Spoken verbatim. Highlight "does not ensure it"; cut to the fanning curves.
3. **Page 7 (§3.4), scene twist, l10.** Exact text: "GPT-5.6 Sol has the highest estimated Psat at 298 percentage points per $1,000 of mean per-game learning cost, followed by Claude Opus 5 at 233, Claude Fable 5 at 57, and Claude Opus 4.8 at 14". Narration: "The highest estimated plasticity: two hundred ninety eight points per thousand dollars of learning cost." Highlight "highest estimated Psat at 298 percentage points per $1,000"; hold on the 298, cut to the bar for "of learning cost". (Crop shows 233/57/14 incidentally; those go in `facts.json` `evidence_incidental`.)
4. **Page 9 (§3.5), scene breakdown, l12.** Exact text: "Writing down an instruction is not the same as following it." Spoken verbatim. Highlight "not the same as following it"; cut to the sticky-note scene.

## 5. Shot list

Renderer: HyperFrames. Voice: `aiden` at 1.12 (~3.1 words/s). Line length = 0.25 s lead + voice + 0.5 s tail. Main transition: `whip`; accents: `zoom`, `punch`; `cut` inside a topic; `blur` for the wind-down.

| Scene | Line | Start (s) | Spoken words | On screen / camera | Transition out |
|---|---|---|---|---|---|
| hook | l01 | 0.0 | "The best agent is not the best learner." | 0.0 s: full line slams in big type (thumbnail words). "NOT" stamps on the spoken "not". Camera pushes 0.5–2.0 s. Frozen gauge needle behind type. | whip |
| problem | l02 | 3.7 | "Most tests grade an agent once, at one moment. But agents learn from experience." | Report card pops with one big score; "FINAL" stamp slams at "one moment". At "learn from experience" the card flips into a calendar, pages flip. Camera tilts down. | whip |
| protocol | l03 | 9.3 | "This paper freezes the model. Each game starts fresh, and future instances inherit its artifacts." | Frost lines draw over a brain at "freezes". A board wipes blank at "starts fresh". A toolbox slides from one robot silhouette to the next at "inherit". | cut (inside topic) |
| protocol | l04 | 15.2 | "Agents play chess, Go, Hex, and NetHack. Between games, they reflect and revise." | Four game icons pop in beat with the names (knight, stone, hex tile, @). A pencil writes in the toolbox notebook at "reflect and revise". Camera pans across the icons. | zoom into the notebook |
| measure | l05 | 20.5 | "Plasticity is the score gain per thousand dollars of learning cost." | The metaphor: two identical gauges pop center; coins rain equally from one cloud into both; left needle climbs, right needle barely twitches. | cut |
| measure | l06 | 25.1 | "Agent plasticity: the efficiency with which an agent converts experience into gains in future held-out performance." | Receipt 1: page rises, camera dives to the abstract line, highlighter follows the voice, holds ~2 s on "converts experience into gains". Cut back to the gauges (left clearly higher) for the last four words. | cut |
| spread | l07 | 31.7 | "The common learning interface therefore permits improvement but does not ensure it." | Receipt 2: highlight "does not ensure it" ~2 s. Cut to a hand-drawn chart: three curves fan out from one shared start dot, one rises, one flat, one sags. Camera rides the rising curve. | whip |
| examples | l08 | 36.3 | "One agent's held-out chess score averages seventy three point three percent over its last five checkpoints." | A bar grows to **73.3%** with a knight on top; count-up on the spoken digits; small tags "late average, hard chess" and the model name. Camera follows the bar up. | cut |
| examples | l09 | 41.9 | "Another does not use its artifacts at about ninety eight percent of relevant decisions." | Whip pan to a closed toolbox. **98%** slams over it on "ninety eight". The lid rattles but stays shut on "does not use". | punch |
| twist | l10 | 46.8 | "The highest estimated plasticity: two hundred ninety eight points per thousand dollars of learning cost." | Receipt 3: highlight "highest estimated Psat at 298 percentage points per $1,000" ~2 s. Cut to the gauges, now two bars; the left bar grows tall to **298** on the spoken number. | cut |
| twist | l11 | 52.1 | "The top scorer manages fifty seven. Endpoint capability and acquisition efficiency differ." | The right bar stops short at **57** on "fifty seven". The knight from examples hops onto the short bar (top scorer = 57). Model tags pop. Camera pulls back to frame both bars at "differ". | cut |
| breakdown | l12 | 56.7 | "Writing down an instruction is not the same as following it." | Receipt 4: highlight "not the same as following it" ~2 s. Cut to a monitor with a sticky note slapped on: "LOAD THE PROGRAM NOW". | cut |
| breakdown | l13 | 61.0 | "One note says load the program now. The agent opens the file list anyway." | A cursor scrolls a "files/" list on "opens the file list". The sticky note wiggles, ignored, on "anyway". Camera pushes in on the note. | blur |
| close | l14 | 66.6 | "Plasticity depends on the protocol and the prices. It is a lens, not a ranking." | The two bars shrink into a magnifying-glass lens; a small price tag dangles off the rim on "prices". The lens pans across the chart. | blur |
| close | l15 | 72.2 | "Next time a leaderboard crowns a winner, ask what it learned per dollar." | A leaderboard rises, crown on row one; the crown tips on "crowns a winner". Camera pulls back, the hook words ghost back in, dip to end card: only **hemanth_with_ai** rises. | (end) |

Pacing audit: every line schedules at least two visual events; the longest holds are the ~2 s receipt highlights, which carry highlighter motion plus camera dive, so no 3 s stretch is static. First event lands at 0.0 s. Total ≈ 79 s including the end-card tail.

## 6. Numbers budget (4)

1. **73.3%** — Claude Fable 5, Hard chess held-out ID score, averaged over checkpoints 16–20. §3.2, p. 6. Absolute score, measured, authors' runs. The line says "averages … over its last five checkpoints".
2. **98%** — GPT-5.6 Luna's share of relevant chess decisions without artifact use, pooled Hard + Easy chess. §3.5, p. 8. Relative (a share), measured, authors' analysis. The line says "about".
3. **298** — GPT-5.6 Sol's Psat, percentage points per $1,000, combined chess + Go + Hex curve. §3.4, p. 7. Relative to protocol and provider pricing; estimated from a saturation fit. The line says "estimated".
4. **57** — Claude Fable 5's Psat, same unit and curve. §3.4, p. 7. Estimated, relative.

Unit note: "per $1,000" appears only as the unit attached to numbers 3 and 4. Bar tags carry model names, no extra digits. Everything else is cut: no 37.5% start value, no 233/14 (visible only inside the receipt crop, listed as `evidence_incidental`), no 83–99% failure shares, no checkpoint counts.

## 7. The honest caveat

Placed at l14 (~67 s), paced like every other line with its own visual (the lens): "Plasticity depends on the protocol and the prices. It is a lens, not a ranking." True to the paper: "we interpret plasticity as a protocol-dependent measure, not a universal model ranking" (p. 7) and "plasticity estimates depend on score headroom, the learning horizon, saturation-fit assumptions, and provider pricing" (p. 10–11).

## 8. Loop and ending

The last line poses the question the hook answers: "ask what it learned per dollar" → replay → "The best agent is not the best learner." Seamless on loop. End card shows only `hemanth_with_ai`.

## 9. Post text angle

**Title:** The best agent is not the best learner

**Caption first line:** "A new paper froze frontier models, gave them the same experience, and measured who actually learned. The top scorer was not the fastest learner. (Unofficial explainer.)"

---

## STE notes for the producer

Terms to copy into `storyboard.json` as `ste.terms` (paper's word on the left, refused synonyms on the right):

- `plasticity` — avoid: learning efficiency, adaptability, learning rate
- `artifacts` — avoid: notes, files, memory, inventory, tools
- `held-out` — avoid: fresh games, unseen games, test games
- `learning cost` — avoid: practice cost, training spend, budget
- `checkpoint` — avoid: round, version, step
- `experience` — avoid: practice, training data
- `endpoint capability` — avoid: final score, end score
- `acquisition efficiency` — avoid: learning speed
- `instances` — avoid: copies, clones

`ste.names`: ["NetHack", "learning"] ("learning" only as part of the paper's term "learning cost"). `ste.allow`: [{ line "l12", rule "ing", why: "quotes the paper verbatim; the page-9 receipt shows the same words" }].

No model name is spoken anywhere; names appear on screen only as bar tags. The spoken numbers are said as a person says them: "seventy three point three percent", "about ninety eight percent", "two hundred ninety eight", "fifty seven".
