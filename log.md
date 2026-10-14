# Log

Append only. Format: `## [YYYY-MM-DD] op | title`.

## [2026-10-03] init | Wiki created
Structure adapted from the AI Research wiki (raw, wiki, AGENTS.md, OKF frontmatter, index, log, lint).

## [2026-10-03] ingest | SkillSeek (arXiv 2609.38822)
Source record, paper dossier and topic page added. Posted as YouTube Short and Instagram Reel on 2026-10-02.

## [2026-10-03] add | 2607.07946 DeepSWE: Measuring Frontier Coding Agents on Original, Long-Horizon Engineering Tasks
Database item created. Dossier still to write: wiki/papers/2607.07946.md

## [2026-10-03] ingest | DeepSWE (arXiv 2607.07946)
Source records for the paper (full PDF text), the v1.1 leaderboard snapshot and the GitHub README. Benchmark dossier and topic page added. Benchmark dossier contract added to AGENTS.md.

## [2026-10-03] render | DeepSWE explainer in three styles
Blueprint, chalkboard and terminal cuts (83.4 s, 9:16) rendered from one storyboard and one voice track. Independent Opus reviews found no factual blockers; fixes applied. Not posted. Post text drafted in the content database (item 2607.07946).

## [2026-10-04] add | 2609.37725 Context Language Models
Database item created. Dossier still to write: wiki/papers/2609.37725.md

## [2026-10-04] render | 2609.37725 9x16
84.8s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/contextLanguageModels/out/paper/final.mp4

## [2026-10-04] publish | 2609.37725
- youtube
- instagram

## [2026-10-04] correction | 2609.37725 first upload was corrupt
The published YouTube and Instagram videos had a truncated video stream (about 20 s of frames under 85 s of audio) because two renders wrote the same file at once. The owner deleted both posts; they are marked DELETED in the database. Re-rendered and validated with the new `paper-reels/bin/validate.mjs`; `reels publish` now refuses unvalidated files. Not reposted yet.

## [2026-10-04] render | 2609.37725 9x16
88.2s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/contextLanguageModels/out/paper/final.mp4

## [2026-10-04] schema | content.sqlite v2: queue, settings, reviews, pipeline_runs
Unattended mode (PIPELINE.md, scheduler/README.md). autopublish defaults to off. Backup before migrating: data/backups/pre-v2-*.sqlite; row counts of items, posts, post_texts, episodes, comments unchanged.

## [2026-10-04] render | 2609.37725 9x16
61.1s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/contextLanguageModels/out/paper/final.mp4

## [2026-10-04] render | 2609.37725 9x16
61.1s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/contextLanguageModels/out/paper/final.mp4

## [2026-10-04] render | 2609.37725 9x16
61.1s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/contextLanguageModels/out/paper/final.mp4

## [2026-10-04] render | 2609.37725 9x16
55.5s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/contextLanguageModels/out/paper/final.mp4

## [2026-10-04] render | 2609.37725 9x16
48.1s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/contextLanguageModels/out/paper/final.mp4

## [2026-10-04] publish | 2609.37725
- youtube
- instagram

## [2026-10-04] publish | 2609.37725 reposted after rebuild
Rebuilt in the v2 engine (bespoke scenes, transitions, sound design; 48 s) and re-validated by script (22/22 including the new engagement gate) plus my own frame and post-text check. The independent critic and validator reviews were not completed on this final cut (earlier cuts: critic 6.0 and 6.8, validator PASS). Posted to YouTube and Instagram at the owner's request.

## [2026-10-05] render | claude-code-mods 9x16
63.0s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/claudeCodeMods/out/paper/final.mp4

## [2026-10-05] render | claude-code-mods 9x16
63.0s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/claudeCodeMods/out/paper/final.mp4

## [2026-10-05] ingest | Claude Code mods: Blast Radius
Topic item `claude-code-mods` (kind topic, no arXiv). Source records for the Blast Radius README, the mods docs and the announcement; dossier on the new topic page `wiki/topics/claude-code.md`. Video made, validated by script, not for posting.

## [2026-10-05] render | claude-code-mods 9x16
63.0s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/claudeCodeMods/out/paper/final.mp4

## [2026-10-05] render | claude-code-mods 9x16
65.9s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/claudeCodeMods/out/paper/final.mp4

## [2026-10-06] render | 2607.07946 9x16
83.4s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/2607.07946/out/blueprint/final.mp4

## [2026-10-06] render | 2607.07946 9x16
63.4s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/2607.07946/out/blueprint/final.mp4

## [2026-10-06] rebuild | 2607.07946 DeepSWE v2 (blueprint)
The old blueprint cut failed validation (engagement gap 12.5 s, 19 events/min); it is kept in `out/blueprint-v1/` and was not posted. Rebuilt with nine bespoke blueprint scenes, 63.4 s; validate.mjs 22/22. Live board re-checked: unchanged since 2026-10-03. Not posted; awaiting the owner's go-ahead.

## [2026-10-06] publish | 2607.07946
- youtube
- instagram

## [2026-10-06] add | 2609.14858 Dream-RSI: Recursive Self-Improvement through Evolving Worlds
Database item created. Dossier still to write: wiki/papers/2609.14858.md

## [2026-10-07] ingest | 2609.14858 Dream-RSI
Full text read from the v1 PDF (36 pages). Source record, dossier and new topic page `agent-self-improvement`. Video built with the HyperFrames renderer and the STE narration profile (`paper-reels/episodes/dreamRSI/`), voice Qwen3-TTS Aiden. Not posted.

## [2026-10-06] render | 2609.14858 9x16
79.7s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/dreamRSI/out/hf/final.mp4

## [2026-10-06] render | 2609.14858 9x16
78.6s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/dreamRSI/out/hf/final.mp4

## [2026-10-06] render | 2609.14858 9x16
78.6s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/dreamRSI/out/hf/final.mp4

## [2026-10-07] publish | 2609.14858
- youtube
- instagram

## [2026-10-08] add | 2609.34649 Beyond Skill Evolution: Self-Evolving Context Management Policies for Long-Horizon Agent Harnesses
Database item created. Dossier still to write: wiki/papers/2609.34649.md

## [2026-10-08] ingest | 2609.34649 ContextEvo
Full text read from the v1 PDF (27 pages). Source record, dossier, link from both the agent context management and agent self-improvement topic pages. Video in production with the HyperFrames renderer and the STE narration profile (`paper-reels/episodes/contextEvo/`), voice Qwen3-TTS Aiden. Not posted.

## [2026-10-08] render | 2609.34649 9x16
74.3s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/contextEvo/out/hf/final.mp4

## [2026-10-08] publish | 2609.34649
- youtube
- instagram

## [2026-10-09] add | 2610.02163 AutoCompact: Learning When to Compact Context in Long-Horizon Coding Agents
Database item created. Dossier still to write: wiki/papers/2610.02163.md

## [2026-10-09] ingest | 2610.02163 AutoCompact
Full text read from the v1 PDF (11 pages). Source record, dossier, link from the agent context management topic page. Video in production with the HyperFrames renderer and the STE narration profile (`paper-reels/episodes/autoCompact/`), voice Qwen3-TTS Aiden, from the director's treatment. Not posted.

## [2026-10-09] render | 2610.02163 9x16
78.8s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/autoCompact/out/hf/final.mp4

## [2026-10-09] render | 2610.02163 9x16
78.8s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/autoCompact/out/hf/final.mp4

## [2026-10-09] render | 2610.02163 9x16
78.8s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/autoCompact/out/hf/final.mp4

## [2026-10-09] render | 2610.02163 9x16
78.8s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/autoCompact/out/hf/final.mp4

## [2026-10-09] render | 2610.02163 9x16
77.3s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/autoCompact/out/hf/final.mp4

## [2026-10-09] publish | 2610.02163
- youtube
- instagram

## [2026-10-10] add | 2610.08902 Agent Plasticity: Measuring Self-Improvement Through Experience
Database item created. Dossier still to write: wiki/papers/2610.08902.md

## [2026-10-10] ingest | 2610.08902 Agent Plasticity
Full text read from the v1 PDF (43 pages). Source record, dossier, link from the agent self-improvement topic page. Video in production with the HyperFrames renderer and the STE narration profile (`paper-reels/episodes/agentPlasticity/`), voice Qwen3-TTS Aiden, from the director's treatment. Not posted.

## [2026-10-10] render | 2610.08902 9x16
77.6s, /Users/hemanthvasi/Documents/Developer/content-creation/_study/agentPlasticity-opensource-haiku/out/hf/final.mp4 (open-model run finished by Haiku 5.5, archived for study, replaced by the Claude regeneration). Not posted. Validator 22/22.

## [2026-10-10] add | 2609.33987 Opera: A Verbal Critic Framework for Long-horizon Coding Agents
Database item created. Dossier still to write: wiki/papers/2609.33987.md

## [2026-10-10] render | 2609.33987 9x16
60.3s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/opera/out/hf/final.mp4

## [2026-10-10] render | 2609.33987 9x16
60.3s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/opera/out/hf/final.mp4

## [2026-10-10] render | 2609.33987 9x16
60.3s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/opera/out/hf/final.mp4

## [2026-10-10] render | 2609.33987 9x16
61.2s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/opera/out/hf/final.mp4

## [2026-10-11] ingest | 2610.08902 Agent Plasticity (regenerated with Claude)
Full main text re-read from the v1 PDF, appendix B and G read. Source record, dossier and topic link rewritten by Claude Sonnet 5.5 after the earlier open-model records were archived outside the wiki (the earlier version stays in git history at 02b4c92). Video in production with the HyperFrames renderer and the STE narration profile (`paper-reels/episodes/agentPlasticity/`). Not posted.

## [2026-10-11] render | 2610.08902 9x16
70.0s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/agentPlasticity/out/hf/final.mp4. Claude regeneration. Deterministic validator 22/22; no independent claim or critic review yet. Not posted.

## [2026-10-11] render | 2610.08902 9x16
72.0s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/agentPlasticity/out/hf/final.mp4. Version 3, rebuilt after a producer and critic loop (`_critique/agentPlasticity/`) because the first Claude cut did not explain the paper to cold viewers. Deterministic validator 22/22; both cold viewers 18 of 18 on the comprehension quiz; paper-faithful critic found no factual error. The project's claim review and retention review have not run on it.

## [2026-10-11] publish | 2610.08902
- instagram
Run outside the regeneration session, which had been told not to publish; who ran it is not confirmed. The Instagram reel is live and the content database has the URL. The YouTube upload in the same run failed on an expired OAuth token, so the reel is not on YouTube.

## [2026-10-11] publish | 2610.08902
- youtube

## [2026-10-12] add | 2609.33401 Evaluating System One Models for Agent Security Decisions: Reliability, Calibration, and Selective Automation
Database item created. Dossier still to write: wiki/papers/2609.33401.md

## [2026-10-12] ingest | 2609.33401 System One models for agent security decisions
Full text read from the v1 and v3 PDFs (27 and 26 pages; both under `raw/assets/2609.33401/`). The director's treatment was written from v1; arXiv lists v3 (3 Oct 2026) as current, and v3 rewords the abstract finding and drops the v1 sentence "Confidently allowed attacks never reach the second judge", so the source record and dossier describe v3 with a list of changes from v1, and the video uses v3 receipts. New topic page: agent security. Video in production with the HyperFrames renderer (`paper-reels/episodes/systemOneSecurity/`). Not posted.

## [2026-10-12] render | 2609.33401 9x16
80.4s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/systemOneSecurity/out/hf/final.mp4

## [2026-10-12] render | 2609.33401 9x16
80.4s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/systemOneSecurity/out/hf/final.mp4

## [2026-10-12] publish | 2609.33401
- youtube
- instagram

## [2026-10-13] add | 2609.38147 Thinking Before Thinking: Scaling Agentic Inference Through Meta-Reasoning
Database item created. Dossier still to write: wiki/papers/2609.38147.md

## [2026-10-13] ingest | 2609.38147 Thinking Before Thinking (agentic meta-reasoning)
Full main text (pp. 1 to 16) and Appendix A read from the v1 PDF (38 pages, `raw/assets/2609.38147/`); appendices G.2, H and I read, the rest searched. Source record, dossier, and a link from the agent context management topic. The video uses the matched direct-control comparison (63.7% against 71.5%), not the Codex number, and makes no cost or efficiency claim (Appendix A). Video in production with the HyperFrames renderer (`paper-reels/episodes/thinkingBeforeThinking/`). Not posted.

## [2026-10-13] render | 2609.38147 9x16
82.0s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/thinkingBeforeThinking/out/hf/final.mp4

## [2026-10-13] render | 2609.38147 9x16
82.0s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/thinkingBeforeThinking/out/hf/final.mp4

## [2026-10-13] render | 2609.38147 9x16
81.7s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/thinkingBeforeThinking/out/hf/final.mp4

## [2026-10-13] publish | 2609.38147
- youtube
- instagram

## [2026-10-13] add | anthropic-scion Redesigning source control at Anthropic
Database item created (kind topic). Source records and the wiki page are still to write.

## [2026-10-14] ingest | Scion source control
Full Anthropic engineering article read. Saved original HTML, extracted text, original browser print and page-marked print text. Source record and two topic pages describe the cache route, online-client assumptions, and company-reported CPU/memory footprint comparison. No publication.

## [2026-10-13] render | anthropic-scion 9x16
81.5s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/scionSourceControl/out/hf/final.mp4

## [2026-10-14] add | anthropic-scion-v2 Redesigning source control at Anthropic
Database item created (kind topic). Source records and the wiki page are still to write.

## [2026-10-14] render | anthropic-scion-v2 9x16
70.7s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/scionV2/out/hf/final.mp4

## [2026-10-14] render | anthropic-scion-v2 9x16
70.7s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/scionV2/out/hf/final.mp4

## [2026-10-14] ingest | Scion v2 rebuild
Reused the saved article and source record. Topic page now lists item anthropic-scion-v2 and the extra Anthropic-reported figures used by the rebuilt video (25 million CI checkouts a day, 30,401 peak, over 99% hits per tier, worktree 7.1 min to 5.1 s median, 20x less memory for the Claude rewrite of the ingestion prototype), with the per-row note against "two orders of magnitude". No publication.

## [2026-10-14] render | anthropic-scion-v2 9x16
70.7s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/scionV2/out/hf/final.mp4

## [2026-10-14] render | anthropic-scion-v2 9x16
70.6s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/scionV2/out/hf/final.mp4

## [2026-10-14] render | anthropic-scion-v2 9x16
72.0s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/scionV2/out/hf/final.mp4

## [2026-10-14] render | anthropic-scion-v2 9x16
72.0s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/scionV2/out/hf/final.mp4

## [2026-10-14] render | anthropic-scion-v2 9x16
69.2s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/scionV2/out/hf/final.mp4

## [2026-10-14] render | anthropic-scion-v2 9x16
69.2s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/scionV2/out/hf/final.mp4

## [2026-10-14] render | anthropic-scion-v2 9x16
73.5s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/scionV2/out/hf/final.mp4

## [2026-10-14] add | 2610.07625 Stateless Language Agents: Scaling Long-Horizon Automated Research
Database item created. Dossier still to write: wiki/papers/2610.07625.md

## [2026-10-14] ingest | Stateless Language Agents (2610.07625)
Full main text (pp. 1 to 11) and Appendices B to D read from the v1 PDF (32 pages, `raw/assets/2610.07625/`); Appendices A and E read less closely. Source record, dossier, and a link on the agent context management topic page. Scope notes kept for the video: the 84% is the lower of two setups on one kernel task (Claude Code, one run), the Advisor's 0.24% to 0.51% is a token share (cost share 1.20% to 2.29%), the FrontierSWE reversal is single Codex runs, and statelessness itself is not ablated. No publication.

## [2026-10-14] render | 2610.07625 9x16
79.5s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/statelessLanguageAgents/out/hf/final.mp4

## [2026-10-14] render | 2610.07625 9x16
79.5s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/statelessLanguageAgents/out/hf/final.mp4

## [2026-10-14] render | 2610.07625 9x16
79.5s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/statelessLanguageAgents/out/hf/final.mp4

## [2026-10-14] build | Stateless Language Agents (2610.07625) video
Scenes office, assign, cost, result, twist, caveat, close and a thumbnail drawing added to the episode the earlier producer run started; the 14 voiced lines were kept as they were (79.5 s, voice `aiden`). Scope chips stay on screen in each scene they apply to: one baseline run (98%), lower of two setups and Claude Code one run (84%), two analyzed runs and share of tokens, not cost (<0.6%), Codex one run each (FrontierSWE), a trace example, not a rate (duplicate feature), most setups one run (caveat). Post text for YouTube and Instagram is in the database. Validator: 22/22. Not posted.

## [2026-10-14] render | 2610.07625 9x16
79.5s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/statelessLanguageAgents/out/hf/final.mp4

## [2026-10-14] render | 2610.07625 9x16
79.5s, /Users/hemanthvasi/Documents/Developer/content-creation/paper-reels/episodes/statelessLanguageAgents/out/hf/final.mp4
