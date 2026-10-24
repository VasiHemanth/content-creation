import sys, json, re, numpy as np
sys.path.insert(0, "/home/user/content-creation/style-lab/tools")
from synth import *
D = "/home/user/content-creation/style-lab/riso"
T = json.loads(re.search(r"=(.*);", open(D + "/assets/timing.js").read()).group(1))
total = T["total"]; S = T["scenes"]; sd = D + "/assets/sfx/"
Ln = T["lines"]
def W(l, i): return Ln[l]["words"][i]
# ---------- riso-flavoured sfx ----------
def stamp(seed, f=85, big=1.0):
    n = int(.28 * SR); return (sine(f, n) * env(n, .001, .16) * .9 + lp(noise(n, seed), 900) * env(n, .0008, .05) * .7 + bp(noise(n, seed + 1), 2500, 8000) * env(n, .0004, .012) * .5) * big
def chunk(seed):                       # drum-master "ka-chunk"
    n = int(.22 * SR); return bp(noise(n, seed), 1800, 7000) * env(n, .0004, .02) * .9 + sine(120, n) * env(n, .001, .09) * .7 + lp(noise(n, seed + 2), 600) * env(n, .002, .06) * .5
def flip(seed, dur=.5):                # paper page swish
    n = int(dur * SR); t = np.linspace(0, 1, n); return bp(noise(n, seed), 900, 6500) * (np.sin(np.pi * t) ** 1.2) * (.4 + .6 * np.abs(lp(noise(n, seed + 1), 40)) / .4)
def drum(dur, seed):                   # riso drum whir
    n = int(dur * SR); t = np.arange(n) / SR; x = bp(noise(n, seed), 250, 2200) * (.5 + .5 * np.sin(2 * np.pi * 14 * t)) + sine(95, n) * .15 + sine(190, n) * .05
    return x * np.minimum(t / .12, 1) * np.minimum((dur - t) / .18, 1)
def tick(seed):
    n = int(.04 * SR); return bp(noise(n, seed), 2200, 7500) * env(n, .0004, .015)
def scratch(seed):
    n = int(.22 * SR); return bp(noise(n, seed), 1500, 6000) * env(n, .01, .09) * (.5 + .5 * lp(np.abs(noise(n, seed + 1)), 80) / .3)
def whoosh(seed, dur=.9):
    n = int(dur * SR); t = np.linspace(0, 1, n); return bp(noise(n, seed), 400, 5000) * (np.sin(np.pi * t) ** 2)
lib = {}
for k in range(3): lib["stamp%d" % k] = stamp(10 + k, 80 + 8 * k); lib["tick%d" % k] = tick(20 + k); lib["scratch%d" % k] = scratch(30 + k); lib["chunk%d" % k] = chunk(40 + k); lib["flip%d" % k] = flip(50 + k)
lib["stampbig"] = stamp(60, 62, 1.0); lib["whir2"] = drum(2.4, 61); lib["whir3"] = drum(3.6, 62); lib["whoosh"] = whoosh(63)
for k, v in lib.items(): write(sd + k + ".wav", v)
dur = {k: len(v) / SR for k, v in lib.items()}
ev = []
def add(name, t, v=.6): ev.append({"file": name + ".wav", "t": round(max(0, t), 3), "d": round(dur[name] + .05, 3), "v": v})
# S1: twelve dots stamp in (t0 = -0.32 -> first two already in at frame 0)
for q in range(12): add("stamp%d" % (q % 3), -.32 + q * .16, .55 if q > 1 else .0)
for i, s in enumerate(["S2", "S3", "S4", "S5", "S6", "S7"]):
    t0 = S[s]["start"]
    add("flip%d" % (i % 3), t0 - .12, .45)
    for j, (dt, c) in enumerate([(0, "chunk0"), (.2, "chunk1"), (.4, "chunk2")]): add(c, t0 + dt, .55)
# S2: wiggly curve drawn by the drum, then zero-error stamp
a, b = S["S2"]["start"] + 0, S["S2"]["start"]
w0, w1 = W(1, 1)["start"], W(1, 8)["end"]
add("whir2", w0, .4); add("stampbig", W(1, 9)["start"], .8)
# S3: blue dots stamp, bars scratch, counter ticks
b0 = W(2, 2)["start"]
for q in range(8): add("stamp%d" % (q % 3), b0 + q * .13, .5)
s0, s1 = W(2, 10)["start"], W(2, 13)["end"]
for q in range(8): add("scratch%d" % (q % 3), s0 + (s1 - s0 - .4) * q / 8, .4)
for q in range(14): add("tick%d" % (q % 3), s0 + (s1 - s0) * q / 14, .3)
# S4: pattern line, residual ticks, NOISE stamp
add("whir2", W(3, 3)["start"], .3)
for q in range(12): add("tick%d" % (q % 3), W(3, 7)["start"] + q * .07, .35)
add("stampbig", W(3, 9)["start"], .9)
# S5
add("whir2", W(4, 1)["start"], .35)
a, z = W(4, 3)["start"], W(4, 6)["end"]
for q in range(12): add("scratch%d" % (q % 3), a + (z - a - .3) * q / 12, .3)
a2, z2 = W(4, 9)["start"], W(4, 14)["end"]
for q in range(8): add("scratch%d" % (q % 3), a2 + (z2 - a2 - .3) * q / 8, .3)
for q in range(12): add("tick%d" % (q % 3), a + (z - a) * q / 12, .25)
# S6 chart
add("whir3", W(5, 6)["start"], .35); add("whir3", W(5, 13)["start"], .35); add("stamp0", W(5, 19)["start"] + .6, .5)
# S7
add("stamp1", W(6, 1)["start"] + .3, .5); add("whoosh", W(6, 4)["start"] - .1, .5); add("chunk1", W(6, 4)["start"] + .7, .6)
add("stampbig", W(6, 11)["start"], 1.0)
ev.sort(key=lambda e: e["t"])
ev = [e for e in ev if e["v"] > 0]
# ---------- bed: lo-fi 96 bpm pulse, soft bass and hats ----------
bpm = 96; beat = 60 / bpm; n = int((total + 1) * SR); M = np.zeros(n); rr = np.random.RandomState(7)
roots = [110, 87.3, 130.8, 98]
for b_i in range(int(total / (4 * beat)) + 2):
    t0 = b_i * 4 * beat; f = roots[b_i % 4]
    for q in range(4):
        mixin(M, sine(f, int(beat * SR * .9)) * env(int(beat * SR * .9), .01, .4) * .5, t0 + q * beat, .5)
        if q % 2 == 0: mixin(M, sine(55, int(.25 * SR)) * env(int(.25 * SR), .002, .12), t0 + q * beat, .5)
    for q in range(8): mixin(M, bp(noise(int(.05 * SR), 100 + b_i * 8 + q), 5000, 9500) * env(int(.05 * SR), .0005, .02), t0 + q * beat / 2, .09 + .05 * (q % 2))
    for q in range(4):
        if rr.rand() < .7: mixin(M, pluck(f * (4 if rr.rand() < .5 else 6) * 1.0, .5, 1, .6, .25), t0 + q * beat + beat / 2, .09)
M = lp(M, 4800); write(D + "/assets/music.wav", M)
pts = [(0, .22)]
for ln in Ln: pts += [(ln["start"] - .15, .22), (ln["start"] + .1, .09), (ln["end"] + .15, .09), (ln["end"] + .55, .20)]
pts += [(Ln[-1]["end"] + .3, .27), (total - .6, .27), (total, 0)]; pts.sort()
auto = {"version": 1, "lanes": [{"target": "volume", "points": [{"t": round(t, 3), "v": v} for t, v in pts]}]}
json.dump({"sfx": ev, "musicAuto": auto}, open(D + "/assets/audio-plan.json", "w"))
print(len(ev), "sfx")
