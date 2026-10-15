# Format: paper (stable)

An AI research paper from arXiv. `storyboard.format` is `"paper"` or absent. Item kind `paper`, added with `reels add <arxiv url>`.

- **Length:** target 60 to 80 s, gate 45 to 90 s (`formats.json`).
- **Source text:** `llm-wiki/raw/assets/<id>/paper-v1-text.txt`. Receipts are text crops of the paper PDF.
- **Arc:** hook (the claim, on screen at 0.0 s) → the problem and what people did before → the idea, named → how it works, with the protagonist object → the evidence against the baseline → the honest limit → a last line that leads back to the hook.
- **Numbers:** at most 4 headline numbers. Each one says its scope: which task, which model, average or best case, the authors' own result or not.
- **Hero:** name the method in the first third. The paper's name is never the largest text in the first 2 s.
- **Layout:** one composition per scene, with transitions (`whip` new topic, `zoom` into an object, `punch` payoff, `blur` wind-down, `cut` inside a topic).
- **Term check:** `ste.jargon` is advisory here (soft findings).
- **After posting:** the Notion vault entry and the `/make-thread` thread run as usual.

Read `explain.md` first. It applies to this format too.
