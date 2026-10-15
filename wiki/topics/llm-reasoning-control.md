---
type: Topic
title: LLM reasoning control
description: Whether thinking switches, effort settings and answer-only prompts change what a model writes before its answer, and what that costs.
tags: [llm, reasoning, no-thinking, instruction-following]
generated: { by: claude/opus-5.5, at: 2026-10-15T09:30:00+05:30 }
status: draft
stale_after: 2027-10-15T00:00:00+05:30
---

# LLM reasoning control

Papers on the controls that are supposed to turn a model's reasoning on, off or down: thinking modes, effort settings, answer-only prompts and prefilled answers.

## Papers
- [Thinking Inertia](/wiki/papers/2610.11765.md): with thinking mode off, six models still wrote explicit inference before the answer in 99.7% of open-ended math replies (pooled, true per model; one model at "minimal"). A strict "no reasoning" prompt lowered that to 62% pooled, with a wide spread across models, and cost about 15 points of mean open-ended accuracy across five models. The answer space (yes-or-no, multiple choice, open-ended) orders the effect. Claims cover visible output only.

## Open questions
- Does answer-only output lower actual reasoning-token cost, or does the computation move out of view? Thinking Inertia measures visible text only.
- Does the answer-space ordering hold on code, tool use and multi-turn tasks?
- Why does the strict prompt work almost fully on one model (GPT-5.4) and barely on others (Qwen3-4B, Qwen3-235B)?
