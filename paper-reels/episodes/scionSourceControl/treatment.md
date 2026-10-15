# Scion: the warehouse becomes a request

Source: [Redesigning source control at Anthropic](https://www.anthropic.com/engineering/redesigning-source-control), published 2026-10-13; accessed 2026-10-14. Item `anthropic-scion`, kind `topic`. This is an engineering case study, with Anthropic-reported operational results, not an independent benchmark or an arXiv paper.

Read: full saved article `llm-wiki/raw/assets/anthropic-scion/article-text.txt`; real article print `article-print.pdf` and its page-marked text; renderer README, STE profile, v2 pacing rules, pipeline, wiki topic pages, and DeepSWE lock/anatomy scenes. Existing topics cover coding agents and Claude Code features, but no source-control architecture explainer.

## One idea

Scion scales Anthropic's agent workload by moving source-control work to servers and sharing immutable objects through cache tiers.

## Hooks

1. **Chosen: “Anthropic's agents outgrew its source control.”** First frame: that exact claim fills the upper half; an already visible code conveyor feeds a constrained source-control gateway below it. First motion begins immediately: code tiles accumulate at the gateway. The thumbnail uses the identical words and gateway illustration.
2. “What happens when agents outgrow source control?” First frame: an agent's requested file sits behind a wall of repository objects. The request path is visible, with its destination occluded by the wall.
3. “Why fetch a repository when you need a file?” First frame: one bright file box contrasts with a large, neutral shelf map. This is a question, not a claim that Git always downloads the whole repository.

Choose the first: it states the real reversal in the article, gives the viewer a reason to care, and permits a concrete reveal. The film immediately establishes Anthropic's scale before it teaches the mechanism. Neither the article title nor “Scion” dominates the first two seconds.

## Visual world and metaphor

One visual world: an isometric source-control warehouse with shelves as **trees**, sealed boxes as **blobs**, and a bright request token as the camera's guide. Scene `design` introduces it; `objects`, `journey`, and `service` carry the same geometry and object identities forward.

The warehouse is a conceptual view of the repository namespace, not one machine that stores the full repository. The camera reveals that its objects reside across cache tiers and backing stores. Scion has no fully materialized repository anywhere, including its server. Never show a complete warehouse inside each server or imply that every old Git checkout downloaded everything.

The reveal is the travel route: the viewer follows one cache miss upstream, then follows the same object downstream. A later job receives that object from the shared daemon. No animated counters claim request volumes or hit rates. Illustrative jobs, boxes, and shelves are schematic, not measured quantities.

Use bespoke SVG/HTML geometry and camera moves within HyperFrames. Dark ink, warm ivory labels, amber requests, cyan paths; no triumphant green/red architecture comparison. An object retains its color and shape across all tiers. Avoid decorative terminal text and code that the source does not provide. This film's subject is the protocol, so readable motion explains more than a code screenshot.

## Receipts

Use the original Chrome print `llm-wiki/raw/assets/anthropic-scion/article-print.pdf`, not a rebuilt article mockup. Two phrase receipts total **nine quoted words**. These short fragments adapt the paper-receipt convention to a copyrighted engineering article. Do not add full surrounding sentences, page headers, cookies, or other readable article prose. Tight crops must contain only each listed phrase. Source attribution uses a small authored label, not extra article text.

| Receipt | Exact text | Source location | Voice and picture |
|---|---|---|---|
| `online` | “Clients are always online.” | Print p. 4, “Principles for agent-scale source control,” first principle | l05 repeats the complete sentence. Hold about 1.5–2 seconds, highlight the words with the voice, then return to the connected client/server warehouse. The preceding sentence plays over the diagram. |
| `cache` | “any cache can answer it” | Print p. 7, “Scaling Scion,” paragraph about negotiation, trees and blobs | l08 begins “Any cache can answer it.” Hold this phrase about 1.5–2 seconds. Return immediately to the shared daemon as the rest of l08 plays. Keep the printed lowercase initial. |

The exact highlighted words above occur in the narration. The capital letter and punctuation of l08 differ only to form a spoken sentence. No extra quote is required for the payoff: the precise measurement scope is source-linked in facts and caption.

## Narration and shots

Target **74.5 seconds**, roughly **192 script words** before acronym expansion. Use a clear local voice; Aiden around the established pace is a starting point. Durations below are direction targets, not overrides of actual synthesized timing. Preserve the script and remap motion to spoken-word cues. Aim for 72–78 seconds after voice synthesis; retain a new event at least every 2.5 seconds after timing changes.

Every row has distinct scheduled events. Times are absolute target seconds. “Cut” between rows in one scene means the camera follows the same world without an empty interstitial. Caption motion does not count as a visual beat.

| Scene / line | Start | Exact spoken words | Picture, motion and camera; target beat times | Transition out |
|---|---:|---|---|---|
| `pressure` / l01 | 0.0 | Anthropic's agents outgrew its source control. | **0.0:** exact hook already visible at full opacity above the gateway. **0.15:** first code tile hits it; the gate flexes. **1.7:** camera tracks the growing queue, with a restrained impact sound. | cut |
| `pressure` / l02 | 3.0 | Anthropic averaged about twenty five hundred daily merges, then exceeded thirty thousand by September. | **3.0:** split the gateway's load view into May and September endpoints, labeled “about 2,500/day” and “over 30,000/day”. **4.6:** pan to September; more code tiles flow. **6.2:** widen the view to reveal demand on source control. This is a qualitative comparison; no calibrated graph or unlabeled ratio. | cut |
| `pressure` / l03 | 8.0 | Their jobs needed code. Git mirrors strained under the load. | **8.0:** turn the code queue into job requests. **9.7:** reveal the old mirror fleet behind the gateway; request paths concentrate there. **11.1:** camera follows one path to a partial repository view. No collapse or outage animation. | cut |
| `pressure` / l04 | 12.0 | Git already supports partial clones. Anthropic used those tools and still hit limits. | **12.0:** a selection mask exposes only a slice of shelves, with authored label “Git partial clone”. **13.8:** history remains represented behind the slice; no claim that partial clone loses all history. **15.5:** return to the workload queue and label “Anthropic's workload”. Git is functional; the fleet feels strained, not defective. | whip |
| `design` / l05 | 17.0 | Anthropic built Scion around one rule. Clients are always online. | **17.0:** old request path redraws into a connected client/server world; small “Scion” label. **18.7:** camera dives to real `online` receipt. **20.4:** match its baseline to an always-connected cable; return to warehouse geometry. | zoom |
| `design` / l06 | 21.5 | Think of a warehouse. Each job requests only the shelves and boxes it needs. | **21.5:** camera enters the conceptual warehouse. **23.1:** job request selects one shelf branch; others dim without disappearing from the repository. **24.8:** select one box and route it toward the job; do not move the entire warehouse. | zoom |
| `objects` / l07 | 26.5 | The client requests specific trees and blobs. Each object keeps the same contents. | **26.5:** shelf becomes a tree; its referenced boxes become blobs. Display the actual terms. **28.1:** request token follows a needed child tree, then selects a blob. **29.8:** seal the object's identity with a stable abstract key symbol; contents and shape remain fixed. No invented hash string. | cut |
| `objects` / l08 | 31.5 | Any cache can answer it. A daemon shares objects across jobs on one node. | **31.5:** real `cache` receipt, highlighter follows voice. **33.2:** pull back to one node boundary with several schematic jobs and its shared `scion-daemon`. **34.9:** show one stored object connected to the jobs. Do not imply shared mutable working copies; the shared material is cached objects. | zoom |
| `journey` / l09 | 36.5 | The daemon asks the regional cache for objects it lacks. | **36.5:** client request reaches the node daemon over a visible socket path. **38.1:** show an empty object slot, then follow the request upstream to `scion-cache`. **39.5:** camera stops at the regional boundary. One selected request is a miss, not a typical hit-rate claim. | cut |
| `journey` / l10 | 40.5 | A cache miss reaches the server. It reads Spanner or cloud storage as needed. | **40.5:** regional-cache slot lacks the object; send request to `scion-server`. **42.1:** server lookup opens two backing-store routes labeled “Spanner” and “cloud storage”. **43.6:** conditional “as needed” path fetches this example's object. These routes are alternatives by data need, not a claim that every request hits both stores. | cut |
| `journey` / l11 | 45.0 | The object returns through those tiers. The next job can reuse it. | **45.0:** object travels server → regional cache. **46.5:** same object travels cache → daemon → client; retain copies in caches. **48.0:** a later job requests the same object and receives it from its node daemon; its path stops locally. Keep higher tiers visible, with no repeated upstream request. | whip |
| `service` / l12 | 49.5 | The server handles history, merges, and commits. Some jobs need no local repository. | **49.5:** camera follows a separate API request toward the server; this is the source-control API, distinct from blob delivery. **51.3:** reveal history, merge, and commit symbols beside the server. **53.1:** an API-only job receives a diff; no local checkout appears. Avoid implying every write has zero coordination. | punch |
| `payoff` / l13 | 55.0 | Anthropic reports a two hundred times smaller infrastructure footprint for CPU and memory. | **55.0:** freeze the complete cache architecture as a visual reference. **56.7:** “200× smaller” lands beside it, with equally readable “infrastructure CPU + memory” and “Anthropic reports”. **58.5:** camera expands the metric's scope label. Never replace it with “200× faster” or “200× less CI”. | cut |
| `payoff` / l14 | 60.5 | That compares Scion infrastructure with its old Git mirrors. | **60.5:** place the old mirror-fleet outline and new cache architecture side by side. **62.1:** connect them with a labeled comparison bracket, “vs prior Git mirrors”. **63.4:** bring the scope directly beside the 200× number. No quantitatively scaled machine count or bar. | blur |
| `caveat` / l15 | 64.5 | Scion serves Anthropic's unusual workload. It does not replace Git for general use. | **64.5:** camera widens to contain the warehouse inside “Anthropic's workload”. **66.2:** reveal a separate, ordinary Git repository with an offline laptop and an intact history path. **68.0:** show both operating in their respective contexts, with the authored caption “Different constraints”. Same visual pace as the main explanation. | cut |
| `loop` / l16 | 69.5 | When agents multiply, the next limit may be the infrastructure that serves them. | **69.5:** return to the opening conveyor and source-control gateway, now drawn as the cache system. **71.2:** camera follows a request beyond the gateway toward a neutral next-stage boundary; no invented system outcome. **72.8:** camera returns to the original hook composition. **73.4:** brief end card shows only `hemanth_with_ai`, over the warehouse silhouette; motion continues until 74.5. Replay returns directly to the claim. | cut / loop |

## Number budget

Three headline numbers, all directly Anthropic-reported operational observations. Neither these numbers nor the pictures claim independent replication.

| Number on screen | Spoken form | Source and scope | Type |
|---|---|---|---|
| about 2,500/day | about twenty five hundred | Opening paragraphs, May 2026 merged code changes per day; print p. 2 | Absolute, measured company-reported average. Keep “about” and month. |
| over 30,000/day | over thirty thousand | Opening paragraphs, September 2026 merged code changes per day; print p. 2 | Absolute, measured company-reported rate. Keep “over” and month. |
| 200× smaller | two hundred times smaller | “Scaling Scion,” print p. 8; Scion infrastructure CPU and memory requirements versus prior Git mirroring infrastructure | Relative, measured company-reported infrastructure result. Never generalize to code quality, total costs, all CI, or checkout latency. |

Cut the checkout count, traffic estimate, repo sizes, cache-hit percentages, migration timeline, team size, ingestion rewrite gains, checkout speedup, and CI capacity gain. No visual object count encodes those figures. Dates identify source context; do not turn them into extra metric headlines. Tight receipt crops must contain no incidental numbers.

## STE terms and voice

Copy these term choices into `storyboard.json` as `ste.terms`. Use the same nouns in captions, labels, and voice. Technical component names remain printed labels; narration explains their roles in plain words.

```json
{
  "names": ["Anthropic", "Scion", "Git", "Spanner", "CPU", "memory", "scion-daemon", "scion-cache", "scion-server"],
  "terms": [
    { "term": "trees", "avoid": ["directory objects", "folder objects"] },
    { "term": "blobs", "avoid": ["file objects", "file payloads"] },
    { "term": "daemon", "avoid": ["node agent", "sidecar"] },
    { "term": "regional cache", "avoid": ["edge cache", "regional mirror"] },
    { "term": "server", "avoid": ["origin", "control plane"] },
    { "term": "jobs", "avoid": ["workers", "tasks"] },
    { "term": "infrastructure footprint", "avoid": ["total cost", "compute savings"] }
  ],
  "allow": []
}
```

“Shelves” and “boxes” explicitly introduce the metaphor before the actual tree/blob terms; they are picture nouns, not alternate protocol vocabulary. “Objects” is the article's collective term for trees and blobs. Say “Git” as a word; pronounce Scion as “sigh-on”; spell CPU as “C P U” in `say`. No model names. No passive, perfect tense, phrasal verbs, or `-ing` forms in the selected script. Run the actual STE checker before synthesis.

## Sound and continuity

Use a restrained local music bed; avoid an alarm or an imagined outage. Opening queue: muted ticks and one weighty gate impact. Request selection: click. Upstream journey: quiet traveling whoosh; returning object: soft per-tier clicks. Local reuse: one clear chime. Metric lands with an impact, never a celebratory fanfare. Leave the caveat fully audible. Every camera movement has a destination: queue, selection, requested object, cache tier, API result, measurement scope.

## Caveat, loop, and post angle

Honest caveat before the end: **“Scion serves Anthropic's unusual workload. It does not replace Git for general use.”** The source also says migration would require bespoke review, search, and CI; keep that additional cost in the caption rather than adding a second video topic.

The last line returns the viewer from the particular cache route to the original claim about agent demand. The end card contains only the handle. Do not add “follow,” a second title, an unsupported prediction, or a publish claim.

Title: **Anthropic's agents outgrew source control. Here is the redesign.**

Caption first line: **Anthropic reports a 200× smaller CPU and memory footprint for its source-control infrastructure versus its old Git mirrors. This is how the cache architecture works.**

Caption body must identify this as an unofficial explainer of Anthropic's Oct 13 engineering post, link the article, keep result attribution, explain that Git already supports partial clones, and state that Scion targets an unusual workload rather than general Git replacement. The human reviews the rendered film and caption before posting.

## Pacing audit

Planned content events occur at 0.0, 0.15, 1.7, 3.0, 4.6, 6.2, 8.0, 9.7, 11.1, 12.0, 13.8, 15.5, 17.0, 18.7, 20.4, 21.5, 23.1, 24.8, 26.5, 28.1, 29.8, 31.5, 33.2, 34.9, 36.5, 38.1, 39.5, 40.5, 42.1, 43.6, 45.0, 46.5, 48.0, 49.5, 51.3, 53.1, 55.0, 56.7, 58.5, 60.5, 62.1, 63.4, 64.5, 66.2, 68.0, 69.5, 71.2, 72.8, and 73.4 seconds. Longest planned gap is two seconds. These are meaningful diagram or camera events; no three-second static stretch remains. Producer checks decoded MP4 motion after word-cue remapping; this audit does not replace validation.
