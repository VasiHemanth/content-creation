---
type: Topic
title: Agent security
description: How agents detect prompt injection, risky interactions and harmful requests, and how a judge's output becomes an allow, block or escalate decision.
tags: [agents, security, prompt-injection, calibration]
generated: { by: claude/opus-5.5, at: 2026-10-12T10:30:00+05:30 }
status: draft
stale_after: 2027-10-12T00:00:00+05:30
---

# Agent security

Papers on the judges and policies that guard AI agents: prompt-injection detectors, interaction-risk judges, harmful-request screens, and the thresholds that turn their probabilities into actions.

## Papers
- [System One Security Judges](/wiki/papers/2609.33401.md): evaluates System One models and other judges on three public benchmarks. On prompt injection, one model's low-scored inputs held far more attacks than its probabilities said, many tied at the lowest score with benign inputs, and under a 1% miss limit its policies allowed nothing automatically.

## Open questions
- Do the offline coverage and miss rates hold in an executable agent environment, where blocks and escalations change task completion?
- Would a judge trained to spread its low-score probabilities break the ties that block automation?
- How do these judges behave on adaptive attacks written against the judge itself? The 2609.33401 paper says only that results may differ for adaptive attacks.
