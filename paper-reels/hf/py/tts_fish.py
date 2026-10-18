"""Synthesize many lines with Fish Audio S2-Pro (mlx-audio, Apple MLX). One model load for the whole job.

usage: tts_fish.py job.json     (run with the fish-tts-demo venv python; see hf/README.md, "Voices")
job.json: { "model": "<path to fish-audio-s2-pro-8bit>",
            "lines": [ { "id", "text", "out", "seed",
                         "ref_audio", "ref_text",            # the locked voice: 10-30 s clip + exact transcript
                         "temperature", "top_p", "top_k",    # sampling (defaults 0.7 / 0.7 / 30, the Fish SDK defaults)
                         "tags", "max_tokens" } ] }          # tags: free-form style cue, e.g. "[warm, thoughtful narrator]"

Each line is seeded, so the same job gives the same audio. ref_audio + ref_text are required: without a
reference the model casts a new random voice per take, and this pipeline makes one take per line.
The text is prefixed with one <|speaker:0|> tag per paragraph: mlx-audio's chunker only splits batches on
speaker turns, and a single batch is capped near 47.5 s (1024 frames) with the rest silently dropped.
Prints one JSON object per line on stdout: { "id", "out", "seconds" }.
"""
import json
import os
import re
import sys

import mlx.core as mx
import numpy as np
from mlx_audio.audio_io import write as audio_write
from mlx_audio.tts.utils import load_model
from mlx_audio.utils import load_audio

job = json.load(open(sys.argv[1]))
model = load_model(job["model"])

_refs = {}  # one encode of each reference clip per job


def load_ref(path):
    if path not in _refs:
        _refs[path] = load_audio(path, sample_rate=model.sample_rate)
    return _refs[path]


def split_long(paragraph, limit=110):
    """A single batch holds about 47.5 s. Split an over-long paragraph on sentence ends (word count limit)."""
    if len(paragraph.split()) <= limit:
        return [paragraph]
    parts, cur = [], ""
    for sentence in re.split(r"(?<=[.!?]) +", paragraph):
        if cur and len((cur + " " + sentence).split()) > limit:
            parts.append(cur)
            cur = sentence
        else:
            cur = f"{cur} {sentence}".strip()
    if cur:
        parts.append(cur)
    out = []
    for part in parts:
        words = part.split()
        while len(words) > limit:
            out.append(" ".join(words[:limit]))
            words = words[limit:]
        out.append(" ".join(words))
    return out


def tagged(text, tags):
    """<|speaker:0|> and the style tags before every paragraph."""
    paragraphs = [p.strip() for p in str(text).split("\n") if p.strip()] or [str(text).strip()]
    turns = []
    for paragraph in paragraphs:
        for part in split_long(paragraph):
            turns.append(f"<|speaker:0|> {tags} {part}" if tags else f"<|speaker:0|> {part}")
    return "\n".join(turns)


for line in job["lines"]:
    mx.random.seed(int(line.get("seed", 1234)))
    kw = {}
    if line.get("max_tokens"):
        kw["max_tokens"] = int(line["max_tokens"])
    gen = model.generate(
        text=tagged(line["text"], line.get("tags")),
        ref_audio=load_ref(line["ref_audio"]) if line.get("ref_audio") else None,
        ref_text=line.get("ref_text"),
        temperature=float(line.get("temperature", 0.7)),
        top_p=float(line.get("top_p", 0.7)),
        top_k=int(line.get("top_k", 30)),
        **kw,
    )
    chunks, rate = [], None
    for r in gen:
        chunks.append(np.array(r.audio, dtype=np.float32).reshape(-1))
        rate = r.sample_rate
    if not chunks:
        sys.exit(f"no audio for line {line['id']}")
    audio = np.concatenate(chunks)
    os.makedirs(os.path.dirname(line["out"]), exist_ok=True)
    tmp = line["out"] + ".partial.wav"
    audio_write(tmp, audio, rate, format="wav")
    os.replace(tmp, line["out"])
    print(json.dumps({"id": line["id"], "out": line["out"], "seconds": len(audio) / rate}), flush=True)
