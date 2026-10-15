# Explanation chain (all formats)

The viewer has no background in the field. A script passes when a stranger can say back the main idea and what each technical term means after one watch. Rules, in order of importance:

1. **Ask the newcomer's questions, in order.** Before you write lines, list the questions a person with no background would ask, one after another ("What is a CI job?", "Why does it need a copy of the code?", "Why is a copy slow?"). Each line answers the last question or raises the next one. A line that needs knowledge from outside the video is a gap: add the line that fills it.
2. **Describe, then name.** Say what a thing does in plain words first. Then give its real name. Use an active sentence for the name, because STE fails the passive "is called": "We call this step a checkout." "This file has a name: a pack file." Keep the real term. People watch to learn it.
3. **One new term at a time.** At most one technical term enters in a line. Declare each one in `storyboard.json` under `ste.jargon` with the line that introduces it. `ste.mjs` fails a term that is used before that line, and (in system-design) a line that introduces two.
4. **Show it while you say it.** The picture shows the thing at the moment the voice names it: the file lights up on "billing folder", the label changes on "checkout". Voice and picture carry one message, not two.
5. **One protagonist object.** Pick one concrete thing and follow it through every step (one file, one request, one training example, one token). Show each cost or result on that one thing first, then multiply it ("one checkout ... times twenty five million").
6. **Slow down on definitions.** A line that introduces a term can use a slower voice speed (`"voice": { "speed": 0.95 }` on the line) while plain lines keep the storyboard speed.
7. **No tangents.** A scene that does not explain the problem, the mechanism or the result goes, even when it is interesting.
8. **Use every term again.** A term the viewer learns and never hears again is a tangent ("agents" in scionV3 until l04 said "each of their changes"). Tie it to the next step or cut it.
9. **Give each number and unit something to compare to.** A unit the viewer does not know (gigabyte, petabyte) gets one everyday anchor. Say a product out loud ("twenty five million times twenty five gigabytes") instead of only its result.
10. **Spell out the "so".** A line that starts with "So" must follow from the line before it in plain words. The cold viewer flags every jump ("a new address, so a copy never goes stale" needed "an old address always holds the same contents" in between).
11. **A metaphor is optional.** Use one only when the real objects are invisible or abstract (weights, attention, gradients). When the real objects can be drawn (files, machines, servers), the protagonist object does the job better. If you use a metaphor, map each part to its real term out loud: "The shelves are the trees. The boxes are the blobs."

Pace: about 2.6 to 3.2 spoken words a second. Dense ideas go at the slow end.

Check before any voice is made: the `cold-viewer` agent reads only the spoken lines and must explain every term and the mechanism back. A FAIL there sends the script back to the writer.

Expect several rounds. scionV3 needed 3 rounds on the treatment (all FAIL, the say-back right from round 2) and 3 more on the storyboard (PASS on round 3). Each round finds new, smaller points once the big ones are fixed, so send the writer the whole list sorted: points flagged more than once first, cheap real defects next, points to ignore (a hero named in the hook and explained later is by design).
