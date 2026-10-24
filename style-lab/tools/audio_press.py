import sys, json, re, numpy as np
sys.path.insert(0, "/home/user/content-creation/style-lab/tools")
from synth import *
D = "/home/user/content-creation/style-lab/press"
T = json.loads(re.search(r"=(.*);", open(D + "/assets/timing.js").read()).group(1))
total = T["total"]; S = T["scenes"]; Ln = [l["words"] for l in T["lines"]]
sf_dir = D + "/assets/sfx/"
# ---------- sfx library ----------
def rumble(dur, seed):
    n = int(dur * SR); t = np.arange(n) / SR
    x = lp2(noise(n, seed), 140) * 2.2 + sine(36, n) * .5 + sine(72, n) * .25 + bp(noise(n, seed + 1), 400, 1400) * .12 * (.6 + .4 * np.sin(2 * np.pi * 11 * t))
    return x * np.minimum(t / .5, 1) * np.minimum((dur - t) / .6, 1)
def thunk(seed, f=90, d=.16):
    n = int(.3 * SR); return sine(f, n) * env(n, .001, d) + lp(noise(n, seed), 500) * env(n, .001, .05) * .7
def stamp(seed):
    n = int(.6 * SR); return sine(55, n) * env(n, .001, .22) * 1.1 + lp(noise(n, seed), 900) * env(n, .001, .12) + bp(noise(n, seed + 1), 1200, 5000) * env(n, .0005, .03) * .8
def whoosh(dur, seed, f0=300, f1=3200):
    n = int(dur * SR); t = np.linspace(0, 1, n); x = noise(n, seed); y = np.zeros(n); seg = 12
    for i in range(seg):
        a, b = i * n // seg, (i + 1) * n // seg; fc = f0 + (f1 - f0) * (i / seg) ** 1.3; y[a:b] = bp(x[a:b], max(80, fc * .5), fc * 1.4)
    return y * (np.sin(np.pi * t) ** 1.2)
def scrape(dur, seed):
    n = int(dur * SR); t = np.arange(n) / SR; am = lp(np.abs(noise(n, seed + 3)), 40); am /= am.max()
    return bp(noise(n, seed), 900, 6500) * (.3 + am) * env(n, .01, dur * .6)
def pageturn(dur, seed):
    n = int(dur * SR); t = np.linspace(0, 1, n); am = lp(np.abs(noise(n, seed + 1)), 25); am /= am.max()
    return bp(noise(n, seed), 600, 5000) * (.25 + am) * np.sin(np.pi * t) ** .8
def typing(dur, cps, seed):
    n = int(dur * SR); y = np.zeros(n); r = rng(seed); t = 0.0
    while t < dur - .05:
        v = .5 + r.rand() * .5; k = tick(seed + int(t * 100), v); i = int(t * SR); j = min(n, i + len(k)); y[i:j] += k[:j - i]
        t += (1 / cps) * (.6 + r.rand() * .8)
    return y
def tick(seed, v=1.0):
    n = int(.04 * SR); return (bp(noise(n, seed), 1500, 6000) * env(n, .0004, .014) * 1.1 + sine(170, n) * env(n, .001, .02) * .5) * v
def sprinkle(dur, seed):
    n = int(dur * SR); y = np.zeros(n); r = rng(seed)
    for _ in range(int(dur * 70)):
        t = r.rand() ** .7 * (dur - .1); k = tick(int(r.rand() * 9999), .25 + r.rand() * .5) * .5; i = int(t * SR); j = min(n, i + len(k)); y[i:j] += k[:j - i]
    return y
lib = {"rumble": rumble(2.6, 1), "thunk": thunk(2), "thunkS": thunk(3, 120, .1), "stamp": stamp(4), "spin": whoosh(.9, 5), "swish": scrape(.3, 6), "swishS": scrape(.16, 9), "scrape": scrape(.6, 7),
       "turn": pageturn(.9, 8), "sprinkle": sprinkle(1.8, 10), "drawS": scrape(.8, 11), "rustle": scrape(2.4, 12), "magwhoosh": whoosh(.8, 13, 200, 2200)}
for d, c, nm in [(.95, 22, "type1"), (1.0, 22, "type2"), (.6, 26, "type3"), (1.5, 30, "type4"), (.9, 12, "typeCard1"), (.8, 12, "typeCard2"), (.4, 12, "typeCard3"), (.7, 12, "typeCard4"), (1.7, 17, "typeDef"), (2.2, 15, "typeCorr"), (.7, 14, "typeS")]:
    lib[nm] = typing(d, c, int(d * 100 + c))
for k, v in lib.items(): write(sf_dir + k + ".wav", v)
dur = {k: len(v) / SR for k, v in lib.items()}
ev = []
def add(name, t, v=.6): ev.append({"file": name + ".wav", "t": round(max(0, t), 3), "d": round(dur[name] + .05, 3), "v": v})
A, B, C, Dd, E = [S[k]["start"] for k in "ABCDE"]
L1, L2, L3, L4, L5, L6, L7 = Ln
# A
add("rumble", 0, .8); add("spin", 0, .8); add("stamp", .85, .9); add("thunk", L1[0]["start"] + .09, .7); add("scrape", L1[1]["start"], .4)
for t0, nm in [(L1[2]["start"] + .2, "type1"), (L1[7]["start"] - .6, "type2"), (L1[12]["start"] - .55, "type3")]: add(nm, t0, .55); add("thunkS", t0, .4)
add("type4", L1[12]["end"] + .15, .4)
for k in range(11): add("swishS", L2[k + 1]["start"], .3)
add("thunk", L2[10]["start"] + .16, .6); add("drawS", L3[2]["start"], .35); add("thunk", L3[6]["start"] + .11, .6)
# B
add("spin", B, .8); add("stamp", B + .85, .8); add("thunk", B + (L4[3]["start"] - B - .25) + .16, .6); add("thunk", L4[12]["start"] + .16, .6); add("swish", L4[12]["start"] + .1, .4)
for (i, w, nm) in [(0, L4[14]["start"] - .35, "typeCard1"), (1, L4[15]["start"] - .15, "typeCard2"), (2, L4[17]["start"] - .15, "typeCard3"), (3, L4[19]["start"], "typeCard4")]: add(nm, w, .5)
add("stamp", L4[24]["end"] + .2 + .13, 1.0)
# C
for i in range(3): add("scrape", C + .08 + i * .12, .5); add("thunkS", C + .75 + i * .12, .4)
th = L5[3]["start"] - .1
add("stamp", th + .16, 1.0); add("typeDef", th + .5, .5); add("sprinkle", th + .35, .45)
# D
add("turn", Dd, .8); add("stamp", Dd + .86, .7); add("thunk", L6[0]["start"] + .11, .6); add("thunk", L6[0]["start"] + .71, .6); add("magwhoosh", L6[7]["start"] - .1, .55)
for i in range(3): t = L6[10]["start"] + i * .42; add("thunkS", t + .14, .5); add("drawS", t + .12, .3); add("thunk", t + .69, .5)
# E
add("spin", E, .8); add("stamp", E + .85, .8)
t1 = L7[3]["start"] - .2; add("stamp", t1 + .15, 1.0); add("typeCorr", t1 + .35, .5)
add("stamp", L7[10]["start"] + .48, .9)
add("rustle", total - 4.2, .3)
ev.sort(key=lambda e: e["t"])
# ---------- music: slow noir bed (78 bpm), enters after the press has landed ----------
bpm = 78; beat = 60 / bpm; n = int((total + 1) * SR); M = np.zeros(n); rr = np.random.RandomState(7)
chords = [[220, 261.6, 329.6], [174.6, 220, 261.6], [146.8, 174.6, 220], [164.8, 207.7, 246.9]]; bar = 4 * beat
for b in range(int(total / bar) + 2):
    ch = chords[b % 4]; t0 = b * bar
    for f in ch:
        m = int(bar * SR * 1.05); x = (sine(f / 2, m) * .45 + sine(f, m) * .2) * np.minimum(np.arange(m) / (SR * .6), 1) * np.minimum((m - np.arange(m)) / (SR * .7), 1); mixin(M, x, t0, .08)
    mixin(M, pluck(ch[0] / 2, 1.6, 1, .25, .8), t0, .3); mixin(M, pluck(ch[0] / 2, 1.2, 2, .25, .8), t0 + 2 * beat, .22)
    for k in range(4):
        if rr.rand() < .55: mixin(M, pluck(ch[rr.randint(3)] * 2, 1.0, 3, .6, .5), t0 + k * beat + (.5 * beat if rr.rand() < .3 else 0), .1)
    for k in (1, 3): mixin(M, bp(noise(int(.12 * SR), b * 9 + k), 3000, 9000) * env(int(.12 * SR), .002, .05), t0 + k * beat, .05)
M = lp(M, 4800); write(D + "/assets/music.wav", M)
pts = [(0, 0), (2.0, 0), (2.5, .16)]
for ln in T["lines"]:
    pts += [(ln["start"] - .15, .17), (ln["start"] + .1, .08), (ln["end"] + .15, .08), (ln["end"] + .55, .17)]
pts += [(total - 3.5, .24), (total - .5, .2), (total, 0)]
pts = sorted(set([(round(a, 3), b) for a, b in pts]))
auto = {"version": 1, "lanes": [{"target": "volume", "points": [{"t": t, "v": v} for t, v in pts]}]}
json.dump({"sfx": ev, "musicAuto": auto}, open(D + "/assets/audio-plan.json", "w"))
print(len(ev), "sfx")
