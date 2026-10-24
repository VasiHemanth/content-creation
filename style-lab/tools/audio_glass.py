import sys, json, re, numpy as np
sys.path.insert(0, "/home/user/content-creation/style-lab/tools")
from synth import *
D = "/home/user/content-creation/style-lab/glass"
T = json.loads(re.search(r"=(.*);", open(D + "/assets/timing.js").read()).group(1))
total = T["total"]; S = T["scenes"]; sf_dir = D + "/assets/sfx/"
L = [l["words"] for l in T["lines"]]
seams = [S[k]["start"] for k in ["G2", "G3", "G4", "G5", "G6", "G7"]]
# ---------- sfx: glass, stone, air. No tonal dings. ----------
def tick(seed, lo=2200, hi=9000):
    n = int(.06 * SR); return bp(noise(n, seed), lo, hi) * env(n, .0004, .02) * 1.3
def shimmer(seed, dur=.7, lo=3000, hi=9500):
    n = int(dur * SR); t = np.arange(n) / SR; x = bp(noise(n, seed), lo, hi) * (.55 + .45 * np.sin(2 * np.pi * (14 + seed % 5) * t + seed))
    return x * np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.4
def whoosh(seed, dur=1.0):
    n = int(dur * SR); t = np.linspace(0, 1, n); x = noise(n, seed); y = np.zeros(n); k = 0
    for i, fc in enumerate(np.geomspace(250, 5200, 8)):
        a = bp(x, fc * .7, fc * 1.4) * np.exp(-((t - (.15 + .8 * i / 8)) ** 2) / .03); y += a
    return y * np.minimum(t * 12, 1) * np.minimum((1 - t) * 6, 1)
def scrape(seed, dur=.5):
    n = int(dur * SR); t = np.arange(n) / SR; return bp(noise(n, seed), 1200, 4500) * (.5 + .5 * lp(np.abs(noise(n, seed + 1)), 40) / .5) * np.minimum(t / .05, 1) * np.minimum((dur - t) / .15, 1) * .6
def thud(seed): n = int(.5 * SR); return sine(62, n) * env(n, .003, .22) + lp(noise(n, seed), 400) * env(n, .001, .06) * .5
def swell(seed, dur=1.8):
    n = int(dur * SR); t = np.arange(n) / SR; x = bp(noise(n, seed), 400, 2600) * np.sin(np.pi * t / dur) ** 2; return x
def chisel(seed): n = int(.07 * SR); return bp(noise(n, seed), 900, 6000) * env(n, .0003, .025) * 1.2 + sine(140, n) * env(n, .001, .03) * .25
lib = {}
for k in range(4): lib["gtick%d" % k] = tick(10 + k, 2000 + 400 * k, 8000 + 600 * k)
for k in range(3): lib["shim%d" % k] = shimmer(20 + k, .6 + .15 * k, 2600 + 500 * k, 8000 + 800 * k)
for k in range(3): lib["whoosh%d" % k] = whoosh(30 + k, 1.0)
for k in range(2): lib["scrape%d" % k] = scrape(40 + k, .5 + .2 * k)
lib["thud"] = thud(50); lib["swell"] = swell(51); lib["swellL"] = swell(52, 2.6)
for k in range(3): lib["chisel%d" % k] = chisel(60 + k)
for k, v in lib.items(): write(sf_dir + k + ".wav", v)
dur = {k: len(v) / SR for k, v in lib.items()}
ev = []
def add(name, t, v=.5): ev.append({"file": name + ".wav", "t": round(max(0, t), 3), "d": round(dur[name] + .05, 3), "v": v})
for i, s in enumerate(seams): add("whoosh%d" % (i % 3), s - .95, .75); add("thud", s - .1, .45)
for k in range(10): add("scrape%d" % (k % 2), .15 + k * .22, .22)
add("swell", L[0][9]["start"], .4); add("shim0", L[0][12]["start"] - .3, .5)
for i, off in enumerate([.0, .62, 1.24]): add("shim%d" % i, L[1][7]["start"] + off + .05, .55)
add("swell", L[1][4]["start"], .3)
for i, w in enumerate([4, 6, 7, 10]): add("gtick%d" % (i % 4), L[2][w]["start"], .5)
add("shim1", L[2][6]["start"], .45); add("shim2", L[2][10]["start"], .45)
add("swell", L[3][6]["start"], .35)
for w, nm in [(8, "gtick0"), (10, "gtick1"), (12, "gtick2")]: add(nm, L[3][w]["start"], .6); add("scrape0", L[3][w]["start"] + .1, .35)
for i, w in enumerate([3, 4, 6, 7]): add("swell", L[4][w]["start"], .3)
add("swellL", L[4][8]["start"], .5); add("shim2", L[4][8]["start"] + .9, .6)
for i in range(6): add("shim%d" % (i % 3), L[5][7]["start"] - .1 + i * .62, .35)
add("thud", L[5][10]["end"] + .05, .5); add("shim1", L[5][6]["start"], .45)
for i, w in enumerate([2, 5, 6, 9]): add("shim%d" % (i % 3), L[6][w]["start"] + .05, .5); add("swell", L[6][w]["start"], .25)
tc = L[6][11]["start"] + .4; add("thud", tc, .55)
r = np.random.RandomState(4)
for k in range(17): add("chisel%d" % (k % 3), tc + .5 + k * .092, .3 + r.rand() * .15)
add("scrape1", tc + .5, .35); add("swellL", tc + 1.2, .35)
ev.sort(key=lambda e: e["t"])
# ---------- bed: a slow stone-and-air drone ----------
n = int((total + 1) * SR); t = np.arange(n) / SR; M = np.zeros(n)
for f, a, ph in [(73.4, .5, 0), (110.0, .32, 1.1), (146.8, .2, 2.3), (174.6, .16, 3.0), (220.0, .1, 1.7)]:
    M += a * np.sin(2 * np.pi * f * t + ph + .5 * np.sin(2 * np.pi * .05 * t + ph)) * (.7 + .3 * np.sin(2 * np.pi * (.03 + ph * .007) * t))
air = bp(noise(n, 7), 700, 2600) * (.35 + .35 * np.sin(2 * np.pi * .06 * t) ** 2) * .18
M = lp(M, 700) * .8 + air
M *= np.minimum(t / 2.0, 1)
write(D + "/assets/music.wav", M)
pts = [(0, .30)]
for ln in T["lines"]:
    pts += [(ln["start"] - .2, .30), (ln["start"] + .1, .12), (ln["end"] + .1, .12), (ln["end"] + .7, .30)]
pts += [(total - 2.2, .34), (total, 0)]
pts.sort()
auto = {"version": 1, "lanes": [{"target": "volume", "points": [{"t": round(a, 3), "v": v} for a, v in pts]}]}
json.dump({"sfx": ev, "musicAuto": auto}, open(D + "/assets/audio-plan.json", "w"))
print(len(ev), "sfx")
