# Format: system-design

An engineering blog post or design write-up: how a company built a system and why the standard tool failed. `storyboard.format` is `"system-design"`. Item kind `topic`, added with `reels add-topic`. Tested on one episode: `scionV3` (Scion remake, 2026-10-15): 26 lines, 436 spoken words, 162.3 s, 55 MB at CRF 23, validator PASS, critic 7.0. The numbers below come from that run.

Reference: `paper-reels/reference/kodekloud-scion.md` (measured breakdown of a reel that explains Scion to people with no software background). Learn its grammar, not its look. Our look stays the blueprint style of `hf/kit/blueprint.css`.

## Length
Target 120 to 170 s, gate 90 to 178 s (`formats.json`). The hard cap stays under 180 s so the video stays a Short on YouTube. Use the time to explain, not to add topics.

Budget about 400 to 450 spoken words over 24 to 28 lines. Project the length as words / 3.0 plus 0.75 s per line plus 1.6 s at the end. The rate differs per script with the same voice (aiden 1.12 measured 2.88 words a second on scionV2 and 3.07 on scionV3), so a projection borrowed from another episode can be 10 s off. Each cold-viewer round adds words: leave about 30 words of room after the treatment.

## Source
The article text in `llm-wiki/raw/assets/<slug>/` (for example `article-text.txt`). Name the file in `facts.json` as `"source_text"`. Numbers are the company's own reports: say so ("Anthropic reports ...").

## Arc
| Share of runtime | Beat | Job |
|---|---|---|
| 0 to 5% | Hook | The surprising move, with the hero named. A term in the hook carries its own short description, so a newcomer can follow: "Anthropic stopped using Git, the tool that tracks code changes. It built its own tool, Scion. Why?" |
| 5 to 20% | Scale | What the system does every day, built up from plain facts. Define each term as it enters. |
| 20 to 35% | One example | Pick the protagonist object (one file, one request, one machine) and follow it. |
| 35 to 55% | Why the standard tool fails | Show the cost on the one object, then multiply it to the daily scale. |
| 40 to 65% | The insight | The one design rule the old tool does not use ("CI machines are always online"). It comes right before the hero. |
| 65 to 88% | How the hero works | The same protagonist through the new design, step by step. One new term a line. |
| 88 to 95% | Payoff and limit | 2 or 3 before-and-after numbers on the same object, then the honest limit (where the new system does not fit). |
| 95 to 100% | Close | A last line that leads back to the hook. |

The hero is named in the hook but explained only after the problem and the insight. The viewer then sees the new design as the answer to a question they already hold.

scionV3 put the insight at 41%, because each term of the problem needed its own line. That read fine; the hero section needs the larger share. Keep only one new term in the hook line (the Git description in l01 used it, so Scion went to l02).

## Picture: the board
- **Persistent actors.** The server, the machine, the file stay on screen for the whole explanation. Build the video as one or a few long scenes (all lines with the same `scene` value share one composition and one camera), not a new scene per line.
- **Change in place.** When a thing changes role, change it where it stands: relabel ("TESTS" becomes "CI JOBS") with `KIT.swap`, recolor (the Git server turns into the Scion server) with `KIT.recolor`. Never replace it with a new box somewhere else.
- **Zoom in to one, out to many.** Zoom into one instance to explain it (`KIT.focus` on the board wrapper). Zoom out to a grid of copies to show scale (`KIT.multiply`).
- **Packets move.** Data in transit is a small shape that travels between two actors (`KIT.travel`), not a label.
- **Semantic color.** One color per role, the same in every scene: old or failing (`old`, coral), new (`new`, violet), compute (`compute`, cyan), the protagonist (`hero`, pink), cache or storage (`store`, amber). Use the `.actor` class with a role class and the `--role-*` tokens in `blueprint.css`.
- **No empty board after the hook.** The hook's actor stays where it stood and becomes the first board actor (scionV3: the GIT box recolors to SCION, then grows into the monorepo store). A blank board in the first 10 s was the critic's top complaint.
- **Floor the camera.** Pass `floor` (world y of the lowest actor on screen at that time) to `KIT.focus`. Without it, zooms push boxes behind the captions, and the layout audit only checks text, so nothing catches it until a human looks at frames.
- **Motion with a reason.** A long board scene needs a visual event at least every 3 s (gate 3.5 s). Small changes at a wide zoom (thin strokes, tag pops at scale 0.8) do not count. Fill quiet stretches with a packet that travels (`KIT.travel`) or a camera move onto the thing the voice names. Generic 5 to 10% pushes read as filler and crop labels at the frame edge.
- **Hide late actors with `gsap.set` before the timeline.** A `tl.set` at 0 does not render at frame 0, so actors that enter later flash on the first frame.
- **One file per board is large.** A 24-line board ran about 460 lines of HTML (HyperFrames warns `composition_file_too_large`; a warning only).
- **Receipts:** 2 to 4 short quotes from the article, at the moments that need proof (a number, the design rule). Not more: the board is the explanation.

## Numbers
Up to 6 numbers on screen, because this format has more room. Each one is in `facts.json` with its sentence in the article.

- **Every big number needs a scale the viewer holds.** The cold viewer flagged "25 gigabytes" in every round until the script gave an anchor ("One film is a few gigabytes") and said the multiplication out loud ("twenty five million times twenty five gigabytes"). Comparisons that are ours (films) are spoken, recorded in `facts.json` as illustrative, and kept off the screen.
- **Speak the hedge.** "On the order of 25 million" becomes "about twenty five million" in the voice. A small on-screen tag that shows for half a second does not count as the hedge.
- **Labels must match the number.** If a line multiplies "the files alone" figure, do not call it "full copies" when "full copy" was defined as files plus history.
- **Quote the article on screen, not in the voice.** Article phrases such as "online by definition" failed the cold viewer twice. Speak the plain reason and put the quote in a receipt.
- **Receipts from article PDFs.** A browser-printed PDF stores text one word or glyph at a time. `hf/py/evidence.py` now merges those into lines when it finds no full-width text lines (arXiv crops are unchanged).

## Who wins on words
The cold viewer and the retention critic can pull opposite ways: the critic asked to cut "tier", the memory definition and the film comparison; the cold viewer had asked for the definition and the comparison. The cold viewer decides the words, and the critic decides the picture. Words change after the storyboard PASS only for a factual fix (a hedge, a wrong label), and those are re-voiced alone.

## Gates that differ from paper
- `ste.jargon` is required and its findings are hard: no term before its line, at most one new term a line.
- Length 90 to 178 s.

## After posting
No Notion vault entry (that page lists papers). `/make-thread` is for papers: skip it and say so, until the human decides how threads work for this format.

Read `explain.md` first.
