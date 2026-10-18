# Voice references

Reference clips that lock a cloned voice. Presets in `voices.json` point here; a `ref_audio` path is
relative to `paper-reels/hf/`. The clip and its `.txt` transcript must describe the same audio, exactly.

| Clip | Preset | Made from |
|---|---|---|
| `s2pro-narrator.wav` + `.txt` | `s2pro` | A 20.6 s cut (26.70 s - 47.30 s) of `fish-tts-demo/outputs/multiagent_tts.wav`, the October 2026 Fish Audio S2-Pro experiment take. Transcript checked with `whisper-large-v3-turbo-asr-fp16`; it matches word for word. |

Every S2-Pro run casts a new random voice unless `ref_audio` + `ref_text` are given, and this pipeline
makes one wav per line, so a `fish` preset without a reference would speak each line in a different voice.

## Adding a reference for the fish provider

1. Take a clean 10-30 s clip of one voice from a take you like (44.1 kHz mono). Cut at sentence edges,
   inside one generated batch. Keep the words exactly as spoken.
2. Write the exact transcript next to the clip as `<name>.txt`.
3. Check the pair, then fix the transcript by hand until the words match:
   `fish-tts-demo/.venv/bin/python -m mlx_audio.stt.generate --model mlx-community/whisper-large-v3-turbo-asr-fp16 --audio <clip>.wav --output-path /tmp/refcheck --format txt`
4. Add a preset in `voices.json` with `provider: "fish"`, `ref_audio`, `ref_text` and a `label`.

The S2-Pro weights are under the Fish Audio Research License (research / non-commercial). For monetized
videos use another provider or a licensed Fish Audio model. See `hf/README.md`, "Voices".
