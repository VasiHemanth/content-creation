# Treatment: MemScope (arXiv 2610.21170 v1)

Paper: "MemScope: Evolving Agent Memory Architectures through Localized Code Repair", Miao Su, Yucan Guo, Zixuan Li, Long Bai, Zhongni Hou, Xiaolong Jin, Jiafeng Guo (ICT, Chinese Academy of Sciences; UCAS; Meituan). arXiv 2610.21170v1, 15 Oct 2026, 19 pages. v1 is the only version on arXiv as of 2026-10-16: the submission history on the abstract page shows only [v1]. It is a preprint, not peer reviewed.

**What I read**
- **Main text.** Pages 1 to 9 in full.
- **Appendices.** A (the Patch-Agent prompt, pp. 15 to 17) and B (repair cases, edit size, cost, pp. 18 to 19).
- **Source files.**
  - `llm-wiki/raw/assets/2610.21170/paper-v1.pdf`, downloaded from `arxiv.org/pdf/2610.21170`, which served v1.
  - `abs.html`, the v1 abstract page.
  - `paper-v1-text.txt`, extracted with PDFKit, one `===== PAGE n =====` marker per page. The extractor is a scratch Swift script, because `pdftotext` and `pypdf` are not installed here.

**Voice and size** (round 3, after cold viewer rounds 1 and 2)
- **Voice.** `s2pro` preset (Fish Audio S2-Pro) at speed about 1.2, about 2.7 spoken words a second.
- **Size.** 14 lines, 184 spoken words (the `say` form, numbers spelled out), 6 scenes.
- **Length.** About 80 s. The estimate counts 2.7 words a second, plus 0.25 s lead and 0.5 s tail per line, with the 1.6 s end in place of the last tail. That is the top of the 60 to 80 s target.
- **If the S2-Pro take runs long, cut in this order:**
  1. "a new method" in l02.
  2. "Same questions:" in l12. The screen tag carries it.
- **Re-time.** Take every beat from `audio/words.json`.

**What the channel already covered** (from `data/content.sqlite`)
- **Agent memory and context.** ContextEvo (2610.07625), AutoCompact (2610.02163), context as a file (2609.37725).
- **Agent self-improvement.** Dream-RSI (2609.14858), Agent Plasticity (2610.08902).
- **What is new here.** No item covers repairs to the memory code itself. This episode is about the code that manages memory, not the memory contents and not the context.

---

## 1. Format

**`paper`.** The source is an arXiv preprint with a method, a baseline and an ablation. Target 60 to 80 s, gate 45 to 90 s.

## 2. The one idea

When an AI agent's memory code fails, MemScope reads the step-by-step record of the failure, finds the line at fault and edits only that line. The older methods rewrote the code from a bare score.

## 3. The newcomer's questions (the spine)

| # | Question | Answered at |
|---|---|---|
| 1 | One bug in an AI's memory: fix it, or rewrite everything? (raised) | l01 |
| 2 | Who does the fix? | l02 (MemScope, a new method) |
| 3 | What is this AI, what does it do, and what is its memory? | l03 (an agent that answers research questions with web tools and saves notes) |
| 4 | What decides which notes it saves and finds? | l04 (code: the memory architecture) |
| 5 | What does a failure look like, and how is it scored? | l05 (one question: the search finds no notes; its score is "wrong") |
| 6 | What did older methods look at? | l06 (only that score, or a summary) |
| 7 | Why is that not enough? | l06 (a score alone cannot tell which code failed) |
| 8 | So what did they do? | l07 (with nothing to point at, they rewrote all of it) |
| 9 | What does MemScope do instead? | l08 (it adds a Patch Agent that writes small code edits) |
| 10 | What does the Patch Agent look at? | l09 (the question's step-by-step record, the trace) |
| 11 | What does the trace show? | l09 (each search returned nothing) |
| 12 | How does that lead to the code? | l10 (the trace is the evidence; one line in the memory architecture likely skipped the search) |
| 13 | What does it change? | l11 (one minimal patch: it removes that line) |
| 14 | Does reading the trace help? How was it tested? | l12, l13 (same questions: 63% right when the Patch Agent read only summaries, 87% with the trace and the saved notes) |
| 15 | What is the catch? | l14 (a small test: one question moved the result about three points) |
| 16 | What do I take away? | l14 (read the trace first, then fix only what broke; loops to l01) |

### Stranger read

**Terms in order:**
- "AI": known.
- "bug": plain.
- MemScope (l02): a name, explained by l08.
- agent (l03).
- research questions, web tools, notes (l03): plain.
- memory architecture (l04).
- score (l05): plain, set up as "Its score: wrong."
- summary (l06): plain.
- Patch Agent and patch (l08).
- trace (l09).
- "line" (l10): plain, placed "in the memory architecture".

No term is used before its line.

**Fixes from cold viewer rounds 1 and 2:**
1. **Tasks and score (both rounds).** l03 now says what the agent does: "answers research questions with web tools". l05 gives the protagonist question its score: "Its score: wrong." So l06 says "only that score", with no new word. "Run" is gone.
2. **"one rule" (both rounds).** It is now "In the memory architecture, one line likely skipped the search." It is a line of the memory code. It follows l09, where the trace shows that each search returned nothing. "Likely" keeps the paper's hedge: "may suppress guidance".
3. **What "right" measures.** l12 now says "Same questions", and "the agent got 63% right" refers back to l03's questions and l05's "wrong". For the inputs, l13 says "With the trace and saved notes". "Saved notes" is l03's word for what the memory stores. The l13 picture shows the Patch Agent opening the notes drawer, so the second input is shown as well as said.
4. **The scale for "three points".** l14 now says "one question moved the result about three points". "Result" points back to the 63% and 87%. The paper prints no task count, so none is spoken (section 10).
5. **From round 1, still in place:**
   - l07's missing step: "With nothing to point at, …".
   - The trace is named as the evidence (l10) before "evidence-backed" (l11).
6. **The l15 loop.** It is merged into the caveat line (l14) to buy time, as the coordinator suggested.

**Other reads:**
- "it" in l09, l10 and l11 is the Patch Agent, the subject of l08.
- "all of it" in l07 is the code from l06. The picture replaces the whole file on that word. The coordinator's "all of the memory code" would use a word that is in the avoid list for `memory architecture`, so the line stays "all of it".

## 4. Jargon plan (`ste.jargon`)

| Term | Plain description first | Line | How it is named |
|---|---|---|---|
| MemScope | "a new method … edits only the broken part" | l02 | "MemScope, a new method, edits only the broken part." l08 says what it does. |
| agent | "an AI … answers research questions with web tools, and saves notes" | l03 | "An AI agent answers research questions with web tools, and saves notes." |
| memory architecture | "the code that saves and finds notes" | l04 | "We call the code that saves and finds notes the memory architecture." |
| Patch Agent | "MemScope adds …", with l08's second sentence | l08 | "MemScope adds a Patch Agent." |
| patch | "small code edits" | l08 | "It writes patches: small code edits." |
| trace | "the question's step-by-step record" | l09 | "It reads the question's step-by-step record: the trace." |

**Soft findings from `ste.mjs`** (left as they are):
- **l08: two new terms in one line.** The coordinator said to ignore it, and the next sentence defines a patch.
- **l03: possible noun cluster ("AI agent answers research questions").** This is a false positive: "answers" is the verb.

**Reuse.** Each term comes back later:
- agent: l05, l12
- memory architecture: l06 ("which code"), l10
- Patch Agent: l12
- patch: l11
- trace: l10, l13, l14
- MemScope: l08

**Other words**
- "evidence" is a plain word. l10 gives its meaning ("That trace is its evidence") right before the R2 quote.
- GAIA is never spoken. It appears only as the on-screen scope tag at l12 to l13: `GAIA test, authors' runs`.

**`ste.names`:** `MemScope`, `AI`, `Patch Agent`.

**`ste.terms`:** the word we use, then the words we refuse.

| Term | Avoid |
|---|---|
| `notes` | memories, experience, guidance |
| `memory architecture` | memory system, memory code, provider, memory design |
| `trace` | log, transcript, trajectory |
| `patch` | fix-up, hotfix |
| `agent` | bot, assistant |
| `line` | guard, early return, rule |
| `summary` | report, digest |
| `score` | grade, mark |

- **"record" (l09).** It is the plain description of "trace", spoken before the name, so it is not in the avoid list.
- **"rewrite" (l01, l07).** It is the contrast to a patch, not a second name for one, so it stays out of the `patch` avoid list.

**Checker.** A scratch storyboard with this script, `ste.names`, `ste.terms` and `ste.jargon` passes `node paper-reels/hf/bin/ste.mjs`: 0 hard findings, 2 soft (both above).

## 5. Protagonist object

**One failed question, and the one line in the memory architecture that skipped its note search.**

**Source.** The recorded GAIA case in Table 6 (p. 9) and App. B.1 (p. 18):
- **Evidence.** "Zero-length traces; empty guidance steps".
- **Diagnosis.** An "early-return guard under MemoryStatus.IN [that] may suppress guidance".
- **Edit.** "Remove the early-return guard".
- **Status.** The question is one of the failed cases in that group: B.1 says "two zero-step failures".

**On screen.**
- One question card labelled `question` (no number), with a pink `notes: 0` badge and later a coral `wrong` stamp.
- One highlighted line in the code file `memory_architecture.py`, drawn as `if status == IN: return` (paraphrased code, no digits).

**What happens to it, line by line:**
- **l05.** The question card's search goes into the notes drawer, and an empty tray comes back. "wrong": a coral `wrong` stamp lands.
- **l06 and l07.** It gets only that stamp and a `summary` slip. Then the whole code file is replaced: every line turns coral and wipes away, and new lines rain in. This is the prior methods' path (Fig 1: "propose complete executable architectures").
- **l09 and l10.** A film strip of the same question unrolls. Each frame labelled `search` shows `notes: 0`. The Patch Agent's lens jumps from those frames to the one line in the file.
- **l11.** Only that line gets a strike-through. The other lines stay, and the notes drawer is untouched.
- **l12 and l13.** Multiply: the one question card becomes a grid of the test's questions, and two bars show the share right.

**Do not claim:**
- **That this patch made this question right.** The paper does not report it.
- **That this case read the saved notes.** It came from the Trace-only variant, so the memory store was not inspected in this case. "Likely" (l10) carries the hedge, and a tag reads `recorded case, Table 6`.
- **That "blocked" in l01 is certain.** l01 says it as fact, while the paper says "may suppress guidance". This is the one claim a little stronger than the source; l10's "likely" covers it.

## 6. Hook options

| # | Spoken line (12 words max) | On screen from 0.0 to 1.0 s |
|---|---|---|
| A | "One bug blocked an AI's memory. Fix it, or rewrite it all?" (12) | Frame 0 already shows big type `ONE BUG.` (white) / `FIX IT, OR REWRITE IT ALL?` (amber). Behind it is a code file of about 16 grey lines, one of them red. On "blocked", a notes drawer beside it slams shut (thud). By 1.0 s a cursor blinks on the red line. |
| B | "A score says your AI failed. It never says where." (10) | Big type `WRONG.` stamped on a question card, then `BUT WHERE?` under it, beside a long code file with no line marked. |
| C | "Your AI rewrote its whole memory to fix one line." (10) | Big type `WHOLE REWRITE. FOR ONE LINE.` over a code file whose lines all flash and change. |

**Pick A.**
- **A choice with stakes.** It is put in words a newcomer has: bug, AI, memory, fix, rewrite.
- **Both sides of the paper.** It sets up the rewrite the prior methods do (l07) and the small patch MemScope does (l11).
- **The loop.** The end of l14, "Read the trace first, then fix only what broke.", answers "Fix it, or rewrite it all?"
- **Why not B.** "It never says where" is too strong. The paper says "A score alone cannot distinguish" the causes (p. 5).
- **Why not C.** It is false. MemScope's agent rewrote nothing, and the prior methods are not "your AI".

**First frame and thumbnail.**
- The big type is at full opacity at 0.0 s. It may settle in scale from 1.1 to 1.0 over 0.25 s. No fade in from blank.
- `thumb_hook`: "One bug. Fix it, or rewrite it all?"
- MemScope is spoken at l02, about 6 s in. It appears as small kinetic type under the code file, never the largest text in the first 2 s.

## 7. Picture

**No metaphor.** Each object can be drawn as itself: the notes, the code file, the trace, the second agent. This follows `explain.md` rule 11 ("When the real objects can be drawn …, the protagonist object does the job better").

**The board.** Blueprint style. Each object is named out loud at the moment it appears.

| Object on screen | Real term | Look |
|---|---|---|
| Small robot with a toolbelt (globe, search glass), a question card in hand | agent, question | white line art, left |
| Card drawer of index cards | notes | amber cards |
| Code file `memory_architecture.py`, about 16 drawn lines | memory architecture | grey lines on dark paper, centre. The protagonist line is pink. |
| Question card `question` | the protagonist question | pink border, no number |
| Stamp `wrong` and a short paper slip `summary` | score, summary | coral (old path) |
| Second robot with a magnifier and a pen | Patch Agent | violet |
| Film strip of blank frames, some labelled `search` | trace | white frames, no step numbers. Each `search` frame shows a pink `notes: 0`. |

**Colours by phase.**
- **Old path (l06 to l07).** Coral. The whole file is replaced.
- **New path (l08 to l11).** Violet. One line is struck through.
- **Data marks (l12 to l13).** Neutral bars. Only the labels differ.

**No crown or green tick** on MemScope.

## 8. Receipts

**Checks.** Both passages are confirmed in `paper-v1-text.txt` with `grep -F`. Each highlight span sits on one PDF line.

**How they play.** Read on camera at about 3.4x, held about 2 s, then the scene's own picture returns. Use `follow: 0` and left-align the start of the highlight.

| # | Line | Page, section | Exact text in the paper | Highlight (`find`) | `circle` |
|---|---|---|---|---|---|
| R1 | l06 | p. 5, sec 3.3 ("Diagnosis and localized update") | "A score alone cannot distinguish absent experience, filtering/ranking errors, and ineffective guidance formatting" | `A score alone cannot` (end of one PDF line, text line 277) | `alone` |
| R2 | l11 | p. 15, App. A.1, Listing 1 (Patch-Agent prompt, line 2) | "Your job is to make one minimal, evidence-backed patch to the CURRENT provider." | `make one minimal, evidence-backed patch` | `minimal` |

**R1.**
- **Voice and marker.** The voice says "A score alone cannot distinguish which code failed." The highlight covers "A score alone cannot", which the voice says word for word.
- **Why "which code failed" is fair.** The paper's sentence goes on to list three causes that live in the code: absent experience, filtering errors, formatting. "Which code failed" sums them up.
- **Timing.** The span is short (about 1.2 s). Hold the page through "distinguish", and let the pen loop on `alone` fill the 2 s.
- **Crop.** The same PDF line starts "provider code through the read-only tools in Table 1 to identify …". Crop to the right part of the line, or list `1` (Table 1) under `evidence_incidental`.

**R2.**
- **Text, not a figure.** It is a monospace prompt listing.
- **Voice and marker.** The voice says "Its job: make one minimal, evidence-backed patch." The highlight starts at "make", so the marker and the voice agree.
- **Crop.** The listing sits under "A.1 PATCH-AGENT PROVIDER REPAIR" and the caption "Listing 1". Crop to the one PDF line, or list those under `evidence_incidental`.

**Caveat source (not on camera).**
- p. 8, sec 4.4: "the one-task difference comprises three tasks answered correctly only without history and two answered correctly only with history."
- Do not crop it. The line before it carries 83.33% and 86.67%.

## 9. Shot list

**Transitions.** Main transition `whip` (new topic). Accents: `zoom` into the code file, `punch` on the fix, `blur` into the caveat. `cut` inside a topic.

**Timing.** Start times are estimates. Replace them with `words.json` times.

**Delivery column.** The tone, then the one stressed word in caps, for the producer's S2-Pro direction tags. l14 has two tones: the caveat, then the loop.

| Scene | Line | Start (s) | Spoken words | On screen / camera | Delivery | Out |
|---|---|---|---|---|---|---|
| hook | l01 | 0.0 | "One bug blocked an AI's memory. Fix it, or rewrite it all?" | 0.0: big type already up, with the code file and its one red line behind it. "blocked": the notes drawer slams shut (thud) and a small padlock icon snaps on it. "Fix": the red line pulses. "rewrite": every line of the file flickers once (glitch). Slow push toward the file. | warm, curious hook; stress FIX | cut |
| hook | l02 | 5.6 | "MemScope, a new method, edits only the broken part." | "MemScope": small kinetic type `MemScope` types on under the file (type sound). "only": a violet pen draws a box round the red line only (pop). "broken": the rest of the file dims, and the boxed line stays lit. | warm, promising; stress ONLY | whip |
| memory | l03 | 9.6 | "An AI agent answers research questions with web tools, and saves notes." | The agent robot enters left with a question card (`question`) in hand. "research questions": two more question cards fan behind the first. "web tools": a globe and a search glass pop onto its belt. "saves": an amber card flies from the robot into the drawer (pop). "notes": two more cards follow, and the drawer label `notes` stamps on. | thoughtful setup; stress QUESTIONS | cut |
| memory | l04 | 15.2 | "We call the code that saves and finds notes the memory architecture." | Camera pans to the code file between the robot and the drawer. "saves": an arrow draws from the robot through the file to the drawer. "finds": a second arrow draws back from the drawer through the file to the robot. "memory architecture": the title `memory architecture` stamps on the file tab (stamp). | thoughtful, clear; stress ARCHITECTURE | zoom |
| fail | l05 | 20.4 | "One question: the agent searches its notes and finds none. Its score: wrong." | The zoom lands on the pink question card in the robot's hand. "searches": a dotted search line runs from the file into the drawer (tick). "none": an empty tray slides back, and a pink `notes: 0` badge pops on the card. "score": a score box draws on the card's corner. "wrong": a coral `wrong` stamp slams into it (stamp). | thoughtful problem; stress WRONG | cut |
| fail | l06 | 26.0 | "Older methods saw only that score, or a summary. A score alone cannot distinguish which code failed." | "Older methods": a coral magnifier slides in from the left. "score": it settles on the `wrong` stamp. "summary": a grey slip `summary` with two lines of text slides in beside it. "A score alone": R1 rises, the camera dives, the highlighter runs `A score alone cannot`, and the pen loops `alone` (about 2 s). "which code": the page drops. A coral dashed line runs from the stamp toward the code file and stops short with a `?`. Every line of the file blinks grey at once: no line is singled out. | thoughtful, a little puzzled; stress ALONE | cut |
| fail | l07 | 33.0 | "With nothing to point at, they rewrote all of it." | "nothing": a coral crosshair drifts over the file and finds no line to lock on. "rewrote": every line turns coral and wipes away in a fast sweep (whoosh). "all": new coral lines rain in to fill the whole file, a tag `whole file replaced` pops, and the camera shakes once. | thoughtful, flat; stress ALL | whip |
| patch | l08 | 37.5 | "MemScope adds a Patch Agent. It writes patches: small code edits." | The original grey file returns with its one pink line. "Patch Agent": a violet robot with a magnifier and a pen drops in at right (pop), and its tag `Patch Agent` stamps. "patches": a small violet sliver labelled `patch` peels off its pen. "small": the sliver shrinks to one line's width next to the full-height file. | confident idea; stress SMALL | cut |
| patch | l09 | 42.3 | "It reads the question's step-by-step record: the trace. Each search returned nothing." | "reads": the Patch Agent turns to the question card. "step-by-step": a film strip unrolls from the card, with blank frames popping in one by one (tick, tick, tick). "trace": the label `trace` stamps on the strip. "search": two frames light up, each labelled `search`. "nothing": both show a pink `notes: 0` (pop, pop). Camera tracks along the strip. | steady mechanism; stress NOTHING | cut |
| patch | l10 | 47.5 | "That trace is its evidence. In the memory architecture, one line likely skipped the search." | "evidence": the pink frames lift off the strip and pin to the Patch Agent's clipboard, tag `evidence` (pop). "memory architecture": the camera follows a violet line from those frames to the code file, and its title tab glows. "one line": one line lights pink, `if status == IN: return`. "skipped": an exit arrow bends out of the search path before it reaches the drawer (thud). Small tag `recorded case, Table 6`. | steady, careful; stress LINE | zoom |
| patch | l11 | 53.8 | "Its job: make one minimal, evidence-backed patch. It removes that line." | "job": R2 rises, the camera dives, the highlighter runs `make one minimal, evidence-backed patch`, and the pen loops `minimal` (about 2 s). "removes": the page drops and the camera zooms into the file. The violet pen strikes through the pink line only (click). "line": the other lines flash white once and stay, and a tag `notes kept` sits on the drawer. | steady, precise; stress MINIMAL | punch |
| result | l12 | 58.6 | "Same questions: when the Patch Agent read only summaries, the agent got 63% right." | The question card multiplies into a grid of small question cards (whoosh). Tags: `GAIA test, authors' runs` and `same questions, same Patch Agent, only its input changes`. "Patch Agent": the violet robot stays at right, never coral, so it is not read as an older method. "summaries": the grey `summary` slip from l06 slides into its hand, and the left bar `summaries only` starts to rise. "sixty": the bar counts to **63%** (tick sounds). "right": about two thirds of the grid cards flip to `right`. | building; stress SUMMARIES | cut |
| result | l13 | 65.3 | "With the trace and saved notes: 87%." | "trace": a film strip slides into the Patch Agent's hand. "saved notes": the Patch Agent pulls the notes drawer open and lifts a few amber cards. A tag `it also saw what the memory stored` pops. "eighty": the right bar `trace + saved notes` shoots past the first and lands on **87%** (impact). The camera punches in on the number, and more grid cards flip to `right`. | the one excited payoff; stress EIGHTY-SEVEN | blur |
| close | l14 | 69.4 | "One caveat: a small test, where one question moved the result about three points. Read the trace first, then fix only what broke." | Soft background. "caveat": a `CAVEAT` tag stamps. "small": the grid shrinks to a small block. "one question": one card in the block flips on its own (pop). "three points": the 87% bar nudges by a visible sliver, with the tag `one question ≈ 3 points (sec 4.4)`. "Read": the hook's code file returns with its pink line, and the film strip unrolls beside it. "fix": the violet pen strikes the one line (click), and the drawer opens with its cards fanning out. Big type `READ THE TRACE FIRST.` settles. In the last 1.6 s the end card rises: only `hemanth_with_ai`. | calm caveat (stress SMALL), then warm and settled for the last sentence (stress FIRST) | (end) |

**Pacing audit (3 s windows).**
- **First event.** 0.0 s, when the type settles. The drawer slams at about 1.2 s.
- **Longest line: l14 (about 9.3 s).** Eight events, about 1.2 s apart: caveat, small, one question, three points, read, strip, fix, big type.
- **l06 (about 7 s).** Seven events: magnifier, stamp, slip, R1 rise and dive, pen loop, dashed line, grey blink.
- **l12 (about 6.7 s).** Six events.
- **l09 and l10 (about 5.2 s and 6.3 s).** Five and four events, plus a camera move.
- **Short lines.** l07 (about 4.5 s) has three events. l13 (about 4.1 s) has four.
- **Receipts.** R1 and R2 each hold about 2 s, with a dive, a moving highlighter and a pen loop. A new event lands on the next stressed word.
- **Thin line art.** The film-strip edges and the code lines are thin. Give each stressed word a soft warm pulse (about 0.2 opacity, 0.5 s) or a stamp, so the gate's grey-level threshold sees the change.
- **Result.** No 3 s stretch has nothing new.

## 10. Numbers budget (2 headline numbers, plus 1 spoken scale)

**1. 63%** (spoken "sixty three percent")
- **What it is.** The agent's accuracy on the GAIA diagnostic ablation when the Patch Agent got only summary reports (row "Summary-only").
- **Source.** Table 5, p. 8 (63.33%). Also sec 4.4, p. 8: "versus 70.00% for Trace-only and 63.33% for Summary-only".
- **Kind.** Absolute, measured, the authors' runs.
- **"right".** GAIA answers are judged correct or not by GPT-4o-mini (sec 4.1). That matches l05's score.

**2. 87%** (spoken "eighty seven percent")
- **What it is.** The same accuracy when the Patch Agent could read raw traces and inspect the memory store (row "Trace + Memory Inspection").
- **Source.** Table 5, p. 8 (86.67%). Sec 4.4: "The Trace + Memory Inspection variant achieves the highest GAIA diagnostic accuracy at 86.67%".
- **Kind.** Absolute, measured, the authors' runs.
- **"Saved notes".** This is the memory store: what the memory architecture saved, l03's notes.
- **It is not the full MemScope's score.** The full system adds Patch History and scored 83.33%. So no line or tag says "MemScope scored 87%". The line names the inputs, and the screen label reads `trace + saved notes`, never `MemScope`.

**3. "about three points"** (a spoken scale, not a headline)
- **What it is.** The size of one question in this test.
- **Source.** Sec 4.4, p. 8, calls the 83.33% vs 86.67% gap "the one-task difference": 3.34 points.
- **Kind.** Relative, from the paper's own words.
- **Screen tag.** `one question ≈ 3 points (sec 4.4)`. For `facts.json`: 86.67 − 83.33.

**Derived, for the producer only.** Not spoken and not on screen.
- The Table 5 level splits make the ablation about 30 tasks:
  - Summary-only: 6/8 + 12/17 + 1/5 = 19/30 = 63.33%.
  - Trace + Memory: 6/8 + 16/17 + 4/5 = 26/30 = 86.67%.
- 63% vs 87% is about 7 questions.
- This is not the 165-task GAIA validation set behind the 83.64% main result.
- The paper prints no task count for the ablation, so "about thirty questions" is not spoken.

**What the result tags must carry.**
- **No model name.** The backbone model for the ablation is not stated in Table 5, so no model name appears on screen at l12 to l13.
- **Code and memory both vary.** Code and memory state both differ across the compared runs (Fig 3 caption, sec 4.4). This goes in the caption.

**Cut.**
- **4.4% median code change.** Cut in round 2. The small-edit point stays in l11 and in the l08 picture.
- **Other results.** 83.64% GAIA main result. 70.00% Trace-only. xBench 55/70 vs 49/70 and 53/70 vs 50/70. ALFWorld 71.64% vs 50.75%.
- **Other details.** The 12 memory skills. The 0.7 to 0.8 threshold story. The 98.8% and 99.4% coverage figures.

## 11. The caveat

**l14, first sentence (about 69 s):** "One caveat: a small test, where one question moved the result about three points."

**Support.**
- **One question is about 3.3 points.** Sec 4.4, p. 8, calls the 86.67% vs 83.33% gap "the one-task difference".
- **So the 63% to 87% gap is a handful of questions.** These are the authors' own runs, with one number per setting and no spread reported.

**Also carried by tags and the caption.**
- **The protagonist case.** It is one recorded case from the Trace-only variant, and the cause is "proposed" (tag at l10).
- **87% is not the full system.** The full system with Patch History scored 83% (caption).
- **Preprint, v1** (caption).

## 12. Loop and ending

- **Last sentence.** "Read the trace first, then fix only what broke." It is the end of l14, merged with the caveat to save a line.
- **The loop.** On replay, the next frame is the hook "One bug blocked an AI's memory. Fix it, or rewrite it all?" over the same code file with its one pink line. The close and the hook share the file, so the cut back reads as one shot. "Fix only what broke" answers "Fix it, or rewrite it all?"
- **End card.** Only `hemanth_with_ai`, rising in the last 1.6 s.

## 13. Post text angle

**Title:** One bug in an AI's memory. Fix it, or rewrite it all?

**Caption first line:** "MemScope gives an AI agent a second agent that reads the step-by-step trace of a failed question and edits only the line of memory code at fault. In the authors' small GAIA test, the agent got 63% right when that second agent read only summaries, and 87% when it read traces and the saved notes. (Unofficial explainer of arXiv 2610.21170 v1.)"

**The rest of the caption should carry:**
- 87% is the trace-plus-memory variant; the full system with patch history scored 83%.
- One question was worth about 3 points.
- The median edit changed 4.4% of the code (14 recorded patches).
- "Preprint".

## 14. Script

The `text` form. The `say` form spells out "A I", "sixty three percent" and "eighty seven percent".

```
l01: One bug blocked an AI's memory. Fix it, or rewrite it all?
l02: MemScope, a new method, edits only the broken part.
l03: An AI agent answers research questions with web tools, and saves notes.
l04: We call the code that saves and finds notes the memory architecture.
l05: One question: the agent searches its notes and finds none. Its score: wrong.
l06: Older methods saw only that score, or a summary. A score alone cannot distinguish which code failed.
l07: With nothing to point at, they rewrote all of it.
l08: MemScope adds a Patch Agent. It writes patches: small code edits.
l09: It reads the question's step-by-step record: the trace. Each search returned nothing.
l10: That trace is its evidence. In the memory architecture, one line likely skipped the search.
l11: Its job: make one minimal, evidence-backed patch. It removes that line.
l12: Same questions: when the Patch Agent read only summaries, the agent got 63% right.
l13: With the trace and saved notes: 87%.
l14: One caveat: a small test, where one question moved the result about three points. Read the trace first, then fix only what broke.
```
