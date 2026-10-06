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
