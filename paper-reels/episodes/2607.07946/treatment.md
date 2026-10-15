# Treatment: DeepSWE (arXiv 2607.07946), v2 rebuild in blueprint

Requested 2026-10-06: explain what the benchmark is, how agents are now scoring on it and what that means, and the technical details, in the blueprint style. The 3 Oct template cut failed the engagement gate (12.5 s gap, 19 events/min). It is kept in `out/blueprint-v1/` and was never posted.

## Framing decision
The request was framed as "LLMs crossing a threshold shows they can automate this work". The paper does not support that. Section 1 says the leaderboard "is not a global ranking of coding products or of overall model quality". Section 8 says task size is "not a claim that the tasks correspond to hours or days of human engineering effort". So the video states what the 74% shows (with a clear prompt, top agent setups finish most of these long, multi-file changes, graded on functional correctness) and what is not measured.

The video does not compare the paper's May runs (v1, best 70.0%) with the live board (v1.1, best 74%), because grading changed between versions. It says "agent setups", not "models": a score is model plus harness plus effort.

## Lines (9 scenes, 63.4 s, voice at speed 1.2)
1. s1 `gauge`: `DeepSWE` title, gauge sweeps, `74%` slams. Labels: `pass@1, best agent setups`, `live board v1.1`, `written from scratch`.
2. s2 `recipe`: merged-fix card, an eye asking `seen in pretraining?`, the shipped tests drawn as a lock cut for one key, and another working fix (a different key) `REJECTED`.
3. s3 `build`: repo boxes, `113` `original tasks`, `written from scratch, never merged upstream`, five language tags.
4. s4 `anatomy`: exploded task. Prompt sheet, `repo @ base commit`, `.git history` crossed out (`shallow clone`), `$ bash`, `same harness for every agent`.
5. s5 `verifier`: two differently shaped working solutions both `PASS`; a broken build caught by `regression checks` and marked `FAIL`.
6. s6 `audit`: a judge with a magnifier and neutral bars, `32.4%` (SWE-Bench Pro) and `1.4%` (DeepSWE). Tags: `authors' own audit`, `disagreement, not error`, `small sample`, `judge = the paper's top model`.
7. s7 `board`: `DeepSWE board v1.1`, Datacurve as owner, update and access dates. Three setups with effort tags, a tie bracket, `74%`, `run intervals overlap`, and cost-per-task coin stacks (low / mid / high, no figures).
8. s8 `scope`: `shows` versus `not measured`.
9. s9 `close`: back to the gauge, `Check who graded it.`, the handle, `DeepSWE · arXiv 2607.07946 · unofficial explainer`. The needle returns to zero for the loop.

## Numbers budget
Four headline numbers:
- 74 (owner's board)
- 113 (paper)
- 32.4 (authors' audit)
- 1.4 (authors' audit)

Provenance labels outside the budget:
- the board's `v1.1`
- `Sep 22, 2026`
- `accessed Oct 6`
- the arXiv id
- the metric name `pass@1`

All are listed in `facts.json`. The board was re-checked on 2026-10-06 and was unchanged from the 2026-10-03 snapshot.
