# Scion production notes

Item: `anthropic-scion`, kind `topic`. Rendering: existing HyperFrames integration. Voice: established Aiden at 1.12. Actual timeline: 81.482 seconds; preserves clear technical phrasing and fits the 90-second hard limit.

Source read in full: `llm-wiki/raw/assets/anthropic-scion/article-text.txt`. Genuine unobscured browser print: `article-print-clean.pdf`, after the page's Reject all cookies button dismissed its banner. The earlier print remains archived but supplies no rendered receipt.

The shared paper evidence extractor assumes whole text runs and a paper column; this browser print exposes character-level runs. Reproduce the two phrase-only crops with:

```
paper-reels/.venv/bin/python paper-reels/episodes/scionSourceControl/crop-evidence.py
```

This renders original PDF pixels at the recorded PDF rectangles. It does not typeset or reconstruct the quotations. The manifest records nine quoted words, their page/rect coordinates, highlights and circle positions. The second phrase retains its source comma.

Build steps: `voice`, `words`, local crop command above, `build`, `check`, `snap`, `render`, `audio`, `mux`, `thumb`. Run each foreground step sequentially. The shared `evidence` command was attempted and failed on its paper-column assumption; no global renderer or extractor changes were made.

Word alignment checked: low counts on spelled-out numbers, C P U, Anthropic, and spoken Sigh on reflect ASR spelling differences. The l03 transcript spells Git as get; l04 spells Anthropic as Entropic. All narrative clauses are present. STE: zero hard findings, three natural noun-cluster warnings.

Three measured values only: about 2,500 merged changes/day (May), over 30,000/day (September), and Anthropic-reported 200 times smaller infrastructure CPU and memory requirements versus prior Git mirrors. All geometry and drawn object counts are schematic. The video keeps Git's partial-clone capability and Scion's online-client/general-use caveat.

The deterministic feedback loop prompted clearer semantic focus: each active tier receives an ivory selection state during the request, the hook highlights its spoken clause, the selected object and immutable-content seal receive visual focus, and the infrastructure comparison retains both scope and baseline. No global flashing, synthetic benchmark, or unsupported intermediate counter values.

Publishing is pending independent validator, retention critic, and human review. Post text revision 1 is saved for YouTube and Instagram and copied in `caption.txt` for review.
