# Treatment: Opera

1. **The one idea.** 
Opera fixes how coding agents fail by leaving a persistent, audited note for every error and tracking it until the agent actually resolves it.

2. **Three hook options.**
- Option 1 (Chosen): 
  - Spoken: Most AI critics break working code. Opera leaves a persistent note.
  - On screen: MOST CRITICS BREAK WORKING CODE
  - Reason: It is a strong claim that highlights the problem of bad interventions, immediately setting up the paper's solution (notes).
- Option 2: 
  - Spoken: Why do AI agents ignore feedback? The critic forgets to follow up.
  - On screen: WHY DO AI AGENTS IGNORE FEEDBACK?
  - Reason: A question with stakes, but slightly less punchy than Option 1.
- Option 3: 
  - Spoken: This new system forces your coding agent to fix its own bugs.
  - On screen: FORCE YOUR AGENT TO FIX BUGS
  - Reason: A claim that promises a benefit, but doesn't mention the core mechanism (the critic).

3. **One visual metaphor per idea.**
A sticky note on a screen. The agent tries to type code, and the note stays slapped on the monitor until the code actually passes. This conveys the idea of a persistent note followed until the problem is resolved, without needing words. Scene 5 carries it.

4. **Receipts.**
- Receipt 1 (Page 2, Section 1, line 122): "Opera combines periodic and event-driven triggers with the option to stay silent."
- Receipt 2 (Page 2, Section 4.2, line 188): "Opera achieves the highest mean resolve rate among competitive critic baselines on all three benchmarks."

5. **Shot list.**
| Scene | Line | Start | Spoken | Visual / Camera | Transition |
|---|---|---|---|---|---|
| 1 | 1 | 0.0 | Most AI critics break working code. Opera leaves a persistent note. | Text "MOST CRITICS BREAK WORKING CODE". A robot breaks a gear. | zoom |
| 2 | 2 | 3.5 | Long horizon coding agents make mistakes. | Agent types code, a red error appears. | cut |
| 3 | 3 | 6.0 | Standard critics give feedback once and forget. | A loud speaker icon yells, then fades away. | whip |
| 4 | 4 | 8.5 | The agent repeats the exact same error. | The agent types the exact same code again. | cut |
| 5 | 5 | 11.5 | Opera treats feedback as a sticky note. | A yellow sticky note slaps onto the monitor. | zoom |
| 6 | 6 | 14.0 | The note stays open during the fix. | Agent types new code, the sticky note remains. | cut |
| 7 | 7 | 16.5 | The system checks the code again. | Magnifying glass scans the new code. | cut |
| 8 | 8 | 19.0 | It closes the note only when the code passes. | The sticky note folds up and disappears. | whip |
| 9 | 9 | 22.0 | It also knows when to speak. | A clipboard with a checklist appears. | cut |
| 10 | 10 | 24.5 | "Opera combines periodic and event-driven triggers with the option to stay silent." | Paper text highlights this line. Camera dives to reading size. | cut |
| 11 | 11 | 29.5 | This stops bad advice. | A shield blocks a red error message. | zoom |
| 12 | 12 | 32.0 | The results set a new bar. | A bar chart rises. | whip |
| 13 | 13 | 34.5 | "Opera achieves the highest mean resolve rate among competitive critic baselines on all three benchmarks." | Paper text highlights this line. | cut |
| 14 | 14 | 40.5 | It boosts the Qwen model by fifteen percentage points. | The chart bar for Qwen shoots up. | zoom |
| 15 | 15 | 44.0 | The self generated data trains better models. | Smaller robots learn from the main robot. | blur |
| 16 | 16 | 47.5 | The caveat is it needs a smart model to work. | A sign says "Smart policy required". | cut |
| 17 | 17 | 50.5 | If the agent cannot write code, the note will not help. | Robot looks confused at the screen. | zoom |
| 18 | 18 | 54.0 | Which answers the question: | End card appears. | - |

*(Every 3s interval has a visual beat. Total 56s)*

6. **Numbers budget.**
1. **15.0 percentage points**: Section 4.2 / Abstract. Absolute gain, measured. Resolve rate improvement on SWE-Bench Pro for the Qwen3.5-9B policy model.
2. **3 benchmarks**: Abstract / Section 4.1. Absolute count of benchmarks tested (Terminal-Bench 2.1, SWE-Bench Pro, DeepSWE v1.1).
3. **10.2 percentage points**: Abstract / Section 4.3. Absolute gain, measured. Improvement on held-out SWE-Bench Pro repositories after fine-tuning Qwen3.5-9B on Opera-guided rollouts.

7. **The honest caveat.**
The caveat is it needs a smart model to work. If the agent cannot write code, the note will not help.

8. **Loop and ending.**
Line 18: "Which answers the question:"
Loop leads directly back to Line 1: "Most AI critics break working code." The end card shows only `hemanth_with_ai`.

9. **Post text angle.**
Title: The best AI coding critic leaves sticky notes.
First line: Opera is a new framework that tracks coding mistakes until the agent actually fixes them, boosting performance by 15 points.

---
**Narration (STE) terms list for producer:**
- `names`: ["Opera", "Qwen", "SWE-Bench", "DeepSWE"]
- `terms`: 
  - {"term": "note", "avoid": ["correction", "feedback", "intervention"]}
  - {"term": "agent", "avoid": ["policy model", "coder"]}
  - {"term": "critic", "avoid": ["verifier", "judge"]}
