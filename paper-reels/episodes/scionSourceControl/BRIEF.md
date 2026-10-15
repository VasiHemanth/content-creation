---
workflow: faceless-explainer
flow: automation
storyboard: no
destination: youtube-shorts, instagram-reels
aspect: 9:16
language: en
length: 75s
angle: engineering-case-study
audience: developers and people curious about AI infrastructure
message: Agent-scale source control can serve only the immutable data a job needs through shared cache tiers.
---

## Intent

Create the finished reel from Anthropic's engineering article "Redesigning source control at Anthropic". The user says "use your creativity and go all out" and wants to validate the finished video before posting. They explicitly prefer execution over another plan presentation. Production follows this repository's make-reel pipeline and independent review gates, using its existing HyperFrames integration.

## Assets

- ../../../llm-wiki/raw/assets/anthropic-scion/article.html: saved original source HTML.
- ../../../llm-wiki/raw/assets/anthropic-scion/article-text.txt: full extracted source text.
- ../../../llm-wiki/raw/assets/anthropic-scion/article-print-clean.pdf: actual Chrome print of source page after rejecting optional cookies, for unobscured receipts. Original print is retained separately.
- ../../../llm-wiki/raw/assets/anthropic-scion/article-print-clean-text.txt: clean source PDF text with page markers.
- treatment.md: the reel-director's creative plan and narration.

## Customizations

One coherent visual world: a repository warehouse transforms into a close, readable request journey through Scion's actual cache tiers. Bespoke SVG diagrams, physical motion, semantic reveals, focused camera changes, local narration, synchronized sound accents, readable captions, and a matching thumbnail. The full article is the source of truth. Keep the benchmark and infrastructure results attributed and precisely scoped.

## Notes

Source: https://www.anthropic.com/engineering/redesigning-source-control, published 2026-10-13, accessed 2026-10-14 Asia/Kolkata. Register kind=topic, item anthropic-scion. No arXiv attribution. Retain Git's partial-clone capabilities and Scion's huge-monorepo/online-client tradeoff. Total verbatim source quotations in the deliverable <=25 words. No changes to the shared renderer, dependency set, database schema, or pipeline agents are required for this pilot. Preserve all unrelated staged and unstaged work. Do not publish: show the finished video and caption to the human first, as explicitly requested.
