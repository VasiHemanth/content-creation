"""Synthesize many lines with one Kokoro model load.

usage: tts_kokoro.py job.json
job.json: { "model": path, "voices": path, "lines": [ { "id", "text", "out", "voice", "speed", "lang" } ] }
Prints one JSON object per line on stdout: { "id", "out", "seconds" }.
"""
import json
import os
import re
import sys

import kokoro_onnx
import soundfile as sf

job = json.load(open(sys.argv[1]))
model = kokoro_onnx.Kokoro(job["model"], job["voices"])

OVERFLOW = re.compile(r"index \d+ is out of bounds for axis 0 with size 510", re.I)


def split_half(value):
    mid = len(value) // 2
    cuts = [i + 1 for i, c in enumerate(value) if (c in "!?.,;:\n" or c.isspace()) and 0 < i < len(value) - 1]
    at = min(cuts, key=lambda i: abs(i - mid)) if cuts else mid
    return value[:at], value[at:]


def synth(text, **kw):
    try:
        return model.create(text, **kw)
    except IndexError as e:
        if not OVERFLOW.search(str(e)) or len(text) < 2:
            raise
        a, b = split_half(text)
        sa, ra = synth(a, **kw)
        sb, rb = synth(b, **kw)
        if ra != rb:
            raise RuntimeError("inconsistent sample rates")
        return list(sa) + list(sb), ra


for line in job["lines"]:
    kw = {"voice": line["voice"], "speed": float(line["speed"])}
    if line.get("lang"):
        kw["lang"] = line["lang"]
    samples, rate = synth(line["text"], **kw)
    os.makedirs(os.path.dirname(line["out"]), exist_ok=True)
    tmp = line["out"] + ".partial.wav"
    sf.write(tmp, samples, rate)
    os.replace(tmp, line["out"])
    print(json.dumps({"id": line["id"], "out": line["out"], "seconds": len(samples) / rate}), flush=True)
