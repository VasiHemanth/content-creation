"""Synthesize many lines with one MLX TTS model (mlx-audio): Qwen3-TTS CustomVoice or Chatterbox Turbo.

usage: tts_mlx.py job.json      (run with paper-reels/.venv-qwen/bin/python)
job.json: { "provider": "qwen3" | "chatterbox", "model": "<hf repo>",
            "lines": [ { "id", "text", "out", "seed",
                         "speaker", "instruct", "language",      # qwen3
                         "ref_audio", "temperature" } ] }       # chatterbox (ref_audio optional: clone a voice)
Prints one JSON object per line: { "id", "out", "seconds" }. Each line is seeded, so the same job gives the same audio.
"""
import json
import os
import sys

import mlx.core as mx
import numpy as np
import soundfile as sf
from mlx_audio.tts.utils import load_model

job = json.load(open(sys.argv[1]))
model = load_model(job["model"])

for line in job["lines"]:
    mx.random.seed(int(line.get("seed", 1234)))
    if job["provider"] == "qwen3":
        gen = model.generate_custom_voice(
            text=line["text"],
            speaker=line.get("speaker", "Ryan"),
            language=line.get("language", "English"),
            instruct=line.get("instruct"),
        )
    elif job["provider"] == "chatterbox":
        kw = {"temperature": float(line.get("temperature", 0.8))}
        if line.get("ref_audio"):
            kw["ref_audio"] = line["ref_audio"]
        gen = model.generate(text=line["text"], **kw)
    else:
        sys.exit(f"unknown provider {job['provider']}")
    chunks, rate = [], None
    for r in gen:
        chunks.append(np.array(r.audio, dtype=np.float32).reshape(-1))
        rate = r.sample_rate
    if not chunks:
        sys.exit(f"no audio for line {line['id']}")
    audio = np.concatenate(chunks)
    os.makedirs(os.path.dirname(line["out"]), exist_ok=True)
    tmp = line["out"] + ".partial.wav"
    sf.write(tmp, audio, rate)
    os.replace(tmp, line["out"])
    print(json.dumps({"id": line["id"], "out": line["out"], "seconds": len(audio) / rate}), flush=True)
