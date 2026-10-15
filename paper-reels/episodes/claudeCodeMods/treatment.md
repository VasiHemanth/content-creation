# Treatment: Claude Code mods, one example (Blast Radius)

Style: `paper`. Topic episode (`kind=topic`, item `claude-code-mods`), not a paper. About 63 s across 9 scene lines (55.2 s of voice), all bespoke `scene` blocks in `scenes.mjs`. The final line is a credit scene in place of the stock end card, because the stock card prints `arXiv <id>` and authors.

## The one idea
A mod is a few TypeScript functions that Claude Code calls on events. The sample mod Blast Radius uses one to hold a risky Bash command, show what it would delete, and let you Proceed or Cancel.

## Hook
"Your agent is about to run r m dash r f on the build folder. Something stops it first." The first frame shows the robot, a hammer and the `build` folder. The terminal slams in at 0.05 s, and the command types on. At about 3.6 s the hammer freezes mid-swing and a red `HELD` stamp lands. The stakes and the surprise both arrive before the second line starts.

## Metaphor
- The agent is the robot with a hammer.
- A tool call is a ticket with a `Bash` header riding a conveyor belt.
- Blast Radius is a gloved hand (sleeve label `Blast Radius`) that grabs only the risky ticket.
- The limits are shown as a net that catches a plain `rm -rf build` ticket, while wrapped tickets (`bash -c`, `alias`, `eval`) slip through the holes.

None of the drawings carries a number or a result.

## Shot list (line: scene, main beats)
1. h1 `hammer`: terminal slam, `rm -rf build` types on, the robot raises the hammer (snap zoom), winds up (snap zoom), freezes, then the `HELD` stamp lands (thud) and pulses.
2. m2 `plug`: code card slides in and types the docs hook shape, `mod` tag, snap zoom onto `tool.call`, the `Claude Code` box rises, the plug clicks (pop), the event chips `tool call` / `prompt` / `UI draw` ride up the wire, and the verbs `watch` / `rewrite` / `answer` stamp in.
3. b3 `conveyor`: `Blast Radius` title, `sample mod · shared as is` tag, tickets on the belt, snap zoom, the glove swoops in, grabs `rm -rf build` and lifts it, then the `HOLD` stamp (thud). The other tickets keep rolling.
4. p4 `pane` (the wow beat): it opens zoomed on the folder. The `blast radius` ring expands, the pane drops from the top, and the camera snaps into the rows. Five example file rows draw in one at a time, each struck through in red (pops). Then come the `files it would delete` label with an arrow and the `count · total size` footer slam, and the camera pulls back out to the whole picture.
5. k5 `buttons`: Proceed and Cancel slam in. Keys `1` and `2` are sketched with `runs it` / `refuses it`. The yellow focus ring and `focus` tag sit on Cancel (snap zoom). The Enter key arrives, the cursor taps Enter, and Cancel goes down (chime).
6. r6 `refusal`: a note arrives at the robot's desk and gets a `refused` stamp, then `+ the reason` writes on. The robot reads it (snap zoom) and shrugs. The folder stays, tagged `nothing deleted`. `ls`, `git status` and `npm test` tickets zip across the top under `runs as normal`.
7. l7 `limits`: `the catch` title, the net labelled `reads the text only`, the plain rm ticket caught, three wrapped tickets slipping through, then the `SAFETY NET, NOT A LOCK` stamp (thud) and the `hard block: use permission rules` plate.
8. t8 `trust`: an empty sandbox with the `mod` box outside it. The `NOT SANDBOXED` stamp lands (thud). Arrows run to the files, terminal and network drawings. Then the `runs with your permissions` plate, and the `install only from sources you trust` card slams in.
9. c9 `close`: speech bubble `Describe a mod to Claude.`, a page writes itself under `It writes one.`, and a terminal types `$ claude --plugin-dir ./blast-radius`. The handle `hemanth_with_ai` writes on, with the credit `code.claude.com/docs/en/plugins/mods`.

Every line also gets 0.16 s camera snaps about every 1 to 1.5 s, so the engagement gate has a large change to count.

## Numbers budget
The only digits on screen are the keys `1` and `2` (README, "Using the pane"); both are in `facts.json`. The voice says "one" and "two". There is no version number, no file count, no size and no ten-minute timeout on screen or in the voice. The file names in the pane are scenery, labelled `example files`.

## Documented exceptions
- "Claude Code" is spoken and shown, because it is the subject of the video. BLOCKS.md otherwise avoids product and model names in `say`. This exception applies to this episode only.
- `say` spells out the shell tokens so Kokoro reads them: "r m dash r f", "Bash dash c", "claude dash dash plugin dir". The `text` field uses the real tokens, joined with U+00A0 so the caption chunker does not split them.

## Honest caveats on screen
- Sample mod, shared as is.
- It reads the command text only, so `bash -c`, aliases and `eval` slip past.
- It is a safety net, not a lock; use permission rules for a hard block.
- Mods are not sandboxed; they run with your permissions; install only from sources you trust.

## Fix pass (2026-10-05, after critic 7.2)
- The close shows the README steps (`clone claude-code-playground`, `cd claude-code-playground/claude-code/mods`, `claude --plugin-dir ./blast-radius`) and the docs credit at 40 px. It then ends on the robot and folder from h1's first frame, so a replay loops cleanly.
- The voice says "r m dash r f build" to match the caption, and "JavaScript or TypeScript functions" to match the docs.
- In l7, "reads only the Bash command text" covers the Bash-only limit and is spoken. The separate "watches the Bash tool only" plate is dropped, and the "hard block: use permission rules" plate stays.
- Stamps are opaque, and sparkles draw behind them.
- Thumbnail hook is now "Hold rm -rf / before it runs."
- Length is 65.9 s; wording in m2, k5 and t8 was trimmed to offset the longer close.
