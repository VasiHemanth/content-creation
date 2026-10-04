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
