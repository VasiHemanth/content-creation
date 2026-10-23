"""Generate narration per line with Kokoro, trim silence, lay lines on a timeline.
usage: tts.py <style_dir> <voice> <speed>
reads  <style_dir>/script.json  {"lines":[{"id","text","gap_before"}]}
writes <style_dir>/assets/voice.wav, <style_dir>/timing.json (line + word timings)
Word timing: Kokoro gives no alignment, so each line's measured span is split by
syllable-weighted character counts (deterministic, good to ~60 ms)."""
import sys, json, re, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
d, voice, speed = sys.argv[1], sys.argv[2], float(sys.argv[3])
S = json.load(open(f"{d}/script.json"))
k = Kokoro("/tmp/claude-0/kokoro/kokoro.onnx", "/tmp/claude-0/kokoro/voices.bin")
SR = 24000
def trim(a, thr=0.004):
    idx = np.where(np.abs(a) > thr)[0]
    return a[max(idx[0]-int(.02*SR),0): idx[-1]+int(.06*SR)]
def weight(w):
    c = re.sub(r"[^a-z0-9]", "", w.lower())
    syl = max(1, len(re.findall(r"[aeiouy]+", c)))
    wt = len(c) * .6 + syl * 1.6 + (2 if w[-1:] in ",.?!" else 0)
    return wt
out, lines, t = [], [], 0.0
for L in S["lines"]:
    gap = L.get("gap_before", 0.35)
    out.append(np.zeros(int(gap*SR), dtype=np.float32)); t += gap
    sents = [x for x in re.findall(r"[^.?!]+[.?!]+|[^.?!]+$", L["text"]) if x.strip()]
    wl = []; lstart = t; first = True
    for si, st in enumerate(sents):
        st = st.strip()
        a, _ = k.create(st, voice=voice, speed=speed, lang="en-us")
        a = trim(a)
        if si:
            pg = L.get("sent_gap", 0.26); out.append(np.zeros(int(pg*SR), dtype=np.float32)); t += pg
        dur = len(a)/SR
        words = st.split(); ws = [weight(w) for w in words]; tot = sum(ws); cur = t
        for w, x in zip(words, ws):
            span = dur * x / tot
            wl.append({"text": w, "start": round(cur, 3), "end": round(cur + span, 3)})
            cur += span
        out.append(a.astype(np.float32)); t += dur
    lines.append({"id": L["id"], "text": L["text"], "start": round(lstart, 3), "end": round(t, 3), "words": wl})
total = t + S.get("tail", 1.5)
out.append(np.zeros(int(S.get("tail", 1.5)*SR), dtype=np.float32))
y = np.concatenate(out)
y = y / max(1e-9, np.abs(y).max()) * 0.9
import os; os.makedirs(f"{d}/assets", exist_ok=True)
sf.write(f"{d}/assets/voice.wav", y, SR)
json.dump({"voice": voice, "speed": speed, "duration": round(total, 3), "lines": lines}, open(f"{d}/timing.json", "w"), indent=1)
print(f"total {total:.2f}s")
for l in lines: print(f"{l['start']:6.2f}-{l['end']:6.2f}  {l['text'][:60]}")
