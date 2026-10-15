# Plan: reels that explain the paper

Status 2026-10-12: not approved. The owner rejected rules 3 and 4 as written (replacing the paper's technical terms, such as artifacts and held-out, with plain words): "we need those words". They will plan the next-reel changes differently. Keep this file as evidence only.

Written 2026-10-11 by Claude Sonnet 5.5 from the review rows in `data/content.sqlite`, the storyboards of every episode, and the Agent Plasticity critique loop (`_critique/agentPlasticity/`, summary in `REPORT.md` there). Goal: a stranger can say what the paper found after one watch. STE stays as the grammar layer. This plan adds a clarity layer on top of it and tests it on readers who have not seen the paper, before any render.

## 1. What the data says

| Evidence | Reading |
|---|---|
| Plasticity first cut (Kimi K3 script, Haiku 5.5 build) passed `validate.mjs` 22 of 22. Its narration reads paper sentences aloud (l06, l07, l12), declares 9 paper terms, speaks no model name, and speaks four statistics (73.3%, 98%, 298, 57) in l08 to l11, about 20 s. | The gates measure form, claims and attention. None measures understanding. |
| Cold-viewer quiz, 9 graded questions, 18 points, the same score for both viewers each time: Sonnet first cut 13 (script plus stills), rewritten script 17 (text only), finished video 18 (script plus stills). The script rewrite gave +4 and the l06 exam clause gave the last +1. | Every point gained came from narration edits. The render added none that was measured. Text alone scored higher than script plus stills, with fewer cues. Test the narration before voice and render. |
| Critic notes: "harness" never defined (Context Language Models, clarity 6), "compact" and "advantage" undefined (AutoCompact), two names for the saved tree (Dream-RSI), "artifacts" and "held-out" (both early Plasticity cuts). | The same jargon fault shows up in every research reel with a clarity note. |
| Fact checks: 3 of the 5 episodes that have one failed the first time on a one-line takeaway. Dream-RSI "ran faster" (true on average, slower on 5 of 6 datasets). AutoCompact "most of the gain stays" (false at the small budget, reverses the authors' point). Opera's caption invented a KV-cache claim. | Punchy sentences lose their scope. |
| Critic scores: Mods 7.2 and 7.4 (hook 8, first line "about to run rm -rf build"); Context Language Models 6.0 and 6.8; Dream-RSI 6.2; AutoCompact 7.0. | Weak evidence for a concrete stake in the first line. Mods is the only topic reel (the others are papers) and a tool demo, so its score cannot be credited to the first line alone. |
| Longest sentence is 14 words in both the worst and the best Plasticity versions; 188 and 195 words. | Sentence length and word count did not separate them. Leave the STE length rules alone. |
| A cold-viewer run took 26 to 43 model calls. The grading pass in a lean gate has not been measured. The critic in the loop took 482 calls, but that covered five rounds of key, audit, grading and briefs. | Per round, a lean gate is two viewer runs plus one grading pass. The loop's totals are not a fair comparison, so do not read a ratio into them. |
| Audience data: none is stored anywhere in the repo. | We know what our critics think, not what viewers do. |

Three rules in `reel-director.md` caused part of the jargon. It asks for receipts the narration says "nearly word for word". It asks for "the paper's own word" for each concept, with the plain synonyms refused. It says no model names in the spoken line, which gave "one agent", "another", "the top scorer". The final Plasticity cut broke all three on purpose.

## 2. The rules (the clarity profile)

The tag shows who enforces each rule: [director], [producer], [code] for a script check next to `ste.mjs`, [viewers] for the cold-viewer gate.

1. One teach-back sentence. [director, at triage] The sentence a viewer should repeat, at most 20 words and at most one coined term. If it needs more, change the angle or skip the paper.
2. Story spine. [director, code] Seven beats in order: question, gap, setup (one picture), measure (one sentence), result (named actors), catch (one caveat, one limit), callback. Each storyboard line carries a `beat`. The 18-of-18 cut follows it: l01 question, l02 gap, l03 to l05 setup, l06 to l07 measure, l08 to l09 result, l10 to l13 catch, l14 callback. That is one video, so treat the spine as a starting point and revise it after three more reels.
3. Glossary. [director, code] At most 3 coined terms. Each has a plain name and a defining line, and no line before the defining line may use it. Where the paper's word needs a lesson, use the plain word (programs and notes for artifacts, test games for held-out).
4. Receipts. [producer, code] The narration says the plain version. The screen shows the paper's phrase, 6 words or fewer, held 2 s. Soft check: no narration line copies 8 or more words from the paper.
5. Words for the comparison, digits on the screen. [code] At most 2 spoken statistics, each with its owner and unit in the same sentence. The 18-of-18 cut speaks none.
6. Name the actors. [producer] The models or systems the result depends on are named in the spoken line at first mention and keep one name and one colour on screen.
7. Scope on every takeaway. [director, code] The director lists each takeaway with its scope (on average, in the authors' runs, at the largest budget). A flagged line must carry a scope phrase. The fact check still verifies it.
8. No answer on a label alone. [code, later] A fact a viewer needs is spoken or sits in a caption of at least 34 px for at least 2 s. The finished Plasticity video had labels at 8 to 11 pt on screen for 0.7 to 2.5 s.
9. First line. [director] A concrete stake, or a contrast that raises a question. The same words are big at frame 0.
10. Ending. [director] End on the takeaway sentence, not on the caveat. One caveat, not four.

## 3. The cold-viewer gate (lean version)

- Where: on the storyboard text, before voice and render. A short stills check after the render only when the text round passed with a margin of one minimum or less, or the template is new.
- The director drafts the answer key with the treatment, from the paper, before any script exists: 8 to 10 questions from a template with slots (the problem, what is measured, what changes and what stays, the main result with names, the contrast, why and how sure, what not to conclude, a free summary), with the minimum answer for each. The validator audits the key against the paper before the producer starts.
- The producer writes `storyboard.json` only.
- A kit script builds `script.md` (and, after the render, three stills per line from the MP4). It generalizes `_critique/agentPlasticity/make_kit.py`.
- Two fresh viewers (a curious 16-year-old, a software engineer) see only the kit and the quiz, never the paper. Sonnet worked; Haiku is untested.
- The validator grades them against the audited key.
- Pass: at least 7 of the 9 graded minimums including the four critical ones, a free summary that names at least 4 of 6 key items, and no line marked lost in either viewer's log.
- At most 2 rounds, then report what still fails. Cost: three new agent runs per round.

## 4. Caption

Draft it from what the viewers got wrong or missed. All three of the critic's caption fixes for Plasticity came from viewer misreads (the model never changes, Fable 5 spent more dollars per point, "universal rank").

## 5. Measurement

- For each posted reel record the 3-second hold, average percent viewed, shares and saves at 48 hours and 7 days. Until a command exists, paste them by hand into a small table. YouTube numbers need the OAuth re-auth first.
- After 5 or 6 reels, compare those numbers with the quiz score and the critic score. Until then "easier to understand" is our judgment, not a result.
- Calibrate the model viewers once: give the Plasticity reel to 3 to 5 people who do not follow AI research and ask them the free-summary question. Compare with the model viewers.

## 6. Rollout

1. Rules in `reel-director.md` and `reel-producer.md`, and a treatment template with the teach-back sentence, spine, glossary and key. Also the "Narration (STE)" section of `paper-reels/hf/README.md`: it says "Pick the paper's word and list the synonyms to refuse", `reel-producer.md` sends producers there, and the docs would keep teaching the jargon rule if only the agent files change. Check `PIPELINE.md` for the same wording.
2. Script checks in the STE tooling: glossary before use, spoken statistics, beats in order, scope phrase, copied paper words.
3. The gate: viewer agent, kit script, validator grading, the `make-reel` step. Then `node scripts/sync-agents.mjs`.
4. Audience numbers table and, later, a command to fill it.
5. Experiments: send Kimi's original Plasticity script through the gate and see whether an open-model producer reaches 17 or more with the loop (that is the real test of "what lags"); try Haiku as a viewer; run the 5-person calibration.

## 7. Risks

- The viewers are models reading text and stills, not people hearing audio. Their scores are upper bounds.
- The spine and the thresholds rest on one finished video. Revise them with data.
- A simpler sentence can change the claim. The critic rejected "A higher test score is evidence it improved" because a higher score alone is not evidence of improvement. Keep the fact check after the comprehension gate.
- A key the director writes tests whether the script taught what the director planned, not whether it explains the paper. In the loop an independent critic wrote the key and caught fidelity problems, so the audit of the key against the paper is a required step.
- The gate adds about 20 minutes and three agent runs per round to every reel.

## 8. Decisions for the owner

1. Run the gate on every reel until there are five reels of data, or only when triage marks the paper as hard? Recommended: every reel.
2. Who copies the audience numbers until a command exists?
3. Keep open models as producers under the gate as an experiment (step 5 above)?
