import sys, json, re, numpy as np
sys.path.insert(0, "/home/user/content-creation/style-lab/tools")
from synth import *
D = "/home/user/content-creation/style-lab/woodblock"
T = json.loads(re.search(r"=(.*);", open(D + "/assets/timing.js").read()).group(1))
total = T["total"]; S = T["scenes"]; sf_dir = D + "/assets/sfx/"
Wl = [l["words"] for l in T["lines"]]
# ---------- sfx library (procedural, seeded) ----------
def knock(seed, f=210):
    n = int(.22 * SR); return (sine(f, n) * env(n, .001, .09) + sine(f * 2.3, n) * env(n, .001, .04) * .35 + lp(noise(n, seed), 1800) * env(n, .0005, .02) * .5)
def tak(seed):
    n = int(.08 * SR); return (sine(520, n) * env(n, .0008, .03) * .6 + bp(noise(n, seed), 900, 4200) * env(n, .0004, .015))
def scrape(dur, seed):
    n = int(dur * SR); t = np.arange(n) / SR; x = bp(noise(n, seed), 500, 5200); am = lp(np.abs(noise(n, seed + 1)), 40); am /= am.max()
    return x * (.35 + .65 * am) * (.7 + .3 * np.sin(2 * np.pi * 14 * t)) * np.minimum(t / .05, 1) * np.minimum((dur - t) / .08, 1)
def chip(seed):
    n = int(.07 * SR); return bp(noise(n, seed), 1800, 8000) * env(n, .0003, .02) + sine(900 + (seed % 5) * 120, n) * env(n, .0004, .012) * .3
def rubloop(dur, seed, rate=7):
    n = int(dur * SR); t = np.arange(n) / SR; x = bp(noise(n, seed), 300, 2600); return x * (.5 + .5 * np.abs(np.sin(np.pi * rate * t))) * np.minimum(t / .06, 1) * np.minimum((dur - t) / .1, 1)
def slap(seed):
    n = int(.3 * SR); return lp(noise(n, seed), 2400) * env(n, .001, .06) * .9 + sine(110, n) * env(n, .002, .1) * .6
def tear(dur, seed):
    n = int(dur * SR); t = np.arange(n) / SR; x = bp(noise(n, seed), 1200, 7500); am = lp(np.abs(noise(n, seed + 2)), 90); am /= am.max(); return x * (.2 + am) * np.minimum(t / .05, 1) * np.minimum((dur - t) / .1, 1)
def whoosh(seed, dur=.8):
    n = int(dur * SR); t = np.linspace(0, 1, n); x = bp(noise(n, seed), 160, 2400) * np.sin(np.pi * t) ** 1.3; return x + sine(62, n) * np.sin(np.pi * t) ** 2 * .5
def hiss(dur, seed):
    n = int(dur * SR); t = np.linspace(0, 1, n); return bp(noise(n, seed), 2500, 9500) * (.25 + .75 * t) * np.minimum(np.arange(n) / (SR * .04), 1) * np.minimum((n - np.arange(n)) / (SR * .1), 1)
def thud(seed, f=64):
    n = int(.4 * SR); return sine(f, n) * env(n, .002, .2) + lp(noise(n, seed), 420) * env(n, .001, .09) * .7
def brush(dur, seed):
    n = int(dur * SR); t = np.arange(n) / SR; return bp(noise(n, seed), 700, 4200) * (.5 + .5 * lp(np.abs(noise(n, seed + 1)), 18) / .4).clip(0, 1.2) * np.minimum(t / .06, 1) * np.minimum((dur - t) / .12, 1)
def drip(seed):
    n = int(.12 * SR); return sine(720, n) * env(n, .001, .03) * .45 * (1 + 0 * np.arange(n)) + bp(noise(n, seed), 1000, 3000) * env(n, .0004, .012) * .4
lib = {}
for k in range(3): lib["knock%d" % k] = knock(10 + k, 190 + 30 * k); lib["tak%d" % k] = tak(20 + k); lib["chip%d" % k] = chip(30 + k); lib["drip%d" % k] = drip(60 + k)
lib["scrape"] = scrape(1.9, 40); lib["roller"] = rubloop(.5, 41, 4); lib["baren"] = rubloop(.75, 42, 7); lib["slap0"] = slap(43); lib["slap1"] = slap(44); lib["peel"] = tear(.8, 45); lib["peelLong"] = tear(1.0, 46)
lib["wipe0"] = whoosh(47); lib["wipe1"] = whoosh(48); lib["wipe2"] = whoosh(49)
lib["hiss1"] = hiss(1.7, 50); lib["hiss2"] = hiss(.5, 51); lib["hiss3"] = hiss(.55, 52)
lib["stamp"] = thud(53, 70); lib["hanko"] = thud(54, 58); lib["brush0"] = brush(.8, 55); lib["brush1"] = brush(.7, 56); lib["brush2"] = brush(.6, 57); lib["bloom"] = thud(58, 46) * .8
for k, v in lib.items(): write(sf_dir + k + ".wav", v)
dur = {k: len(v) / SR for k, v in lib.items()}
ev = []
def add(name, t, v=.6): ev.append({"file": name + ".wav", "t": round(max(0, t), 3), "d": round(dur[name] + .05, 3), "v": v})
w = lambda li, word: [x for x in Wl[li] if x["text"].lower().strip(",.") == word][0]
# S1: block, carving, inking, printing, peel
add("knock0", w(0, "block")["start"], .7); add("knock1", w(0, "wood")["start"], .7)
add("scrape", 3.5, .55)
for i in range(22): add("chip%d" % (i % 3), 3.6 + i * .085 + (i % 4) * .01, .35)
add("roller", 5.4, .5); add("slap0", 5.9, .75); add("baren", 6.2, .55); add("baren", 6.5, .5); add("peel", 6.95, .55)
for s, k in [(8.0, 0), (27.0, 1), (44.4, 2)]: add("wipe%d" % k, s - .45, .7)
# S2: the print, then static
add("hiss1", w(2, "starts")["start"] - .15, .5)
# S3: forward noising, five stamped steps
W4 = Wl[3]; s3 = S["S3"]["start"]; ts = [W4[3]["start"] + .15, W4[5]["start"] - .1, W4[11]["start"] - .2, W4[14]["start"] - .1, W4[19]["start"] - .2]
add("hiss2", s3 + .05, .35)
for i, t in enumerate(ts): add("stamp", t, .6); add("hiss3", t, .3)
# S4: guess the noise
W5 = Wl[4]; add("brush0", W5[12]["start"] - .05, .5); add("slap1", W5[12]["start"] + .55, .5); add("knock2", W5[13]["start"] + .1, .5)
# S5: twenty steps; the last one is the key block snapping in
s5 = S["S5"]["start"]; T0 = .5; DT = (10.8 - .5) / 19
for k in range(20): add("tak%d" % (k % 3), s5 + T0 + k * DT, .32 + .012 * k)
add("knock0", s5 + 10.8, .85)
# S6: prompt brushed in, ink runs, the sun reddens
W9 = Wl[8]; s6 = S["S6"]["start"]; t1 = W9[3]["start"] + .05; t2 = W9[6]["start"] - .1; t3 = W9[9]["start"] + .05
add("brush0", t1, .55); add("brush1", t2, .55); add("brush2", t3, .5)
for k in range(4): add("drip%d" % (k % 3), t3 + .35 + 1.2 + k * .33, .4)
add("bloom", W9[13]["start"] - .1, .6)
# S7: lifted, laid flat, hanko, handle
s7 = S["S7"]["start"]; add("peelLong", s7 + .3, .6); add("slap1", s7 + 2.3, .6); add("hanko", s7 + 2.75, .85); add("brush1", s7 + 3.2, .5)
ev.sort(key=lambda e: e["t"])
# ---------- music: a sparse koto-like line (D hirajoshi) over a low drone, 60 bpm ----------
n = int((total + 1) * SR); M = np.zeros(n); r = np.random.RandomState(21)
scale = [146.8, 164.8, 174.6, 220.0, 233.1]
def koto(f, seed):
    m = int(1.8 * SR); t = np.arange(m) / SR; y = (sine(f, m) * np.exp(-t * 2.4) + .5 * sine(f * 2.01, m) * np.exp(-t * 4) + .25 * sine(f * 3.02, m) * np.exp(-t * 6)) * np.minimum(t / .003, 1)
    return y + bp(noise(m, seed), 1200, 5000) * np.exp(-t * 60) * .25
for k in range(int(total)):
    if r.rand() < .55:
        f = scale[r.randint(len(scale))] * (2 if r.rand() < .5 else 1); mixin(M, koto(f, k), k + (0 if r.rand() < .7 else .5), .22)
dr = np.arange(n) / SR
for f, a in [(73.4, .16), (110.0, .09)]: M += sine(f, n) * a * (.75 + .25 * np.sin(2 * np.pi * dr / 9.0))
M = lp(M, 4200); write(D + "/assets/music.wav", M)
pts = [(0, .24)]
for ln in T["lines"]:
    pts += [(ln["start"] - .15, .24), (ln["start"] + .1, .1), (ln["end"] + .15, .1), (ln["end"] + .6, .24)]
pts += [(total - 2.0, .3), (total, 0)]; pts.sort()
auto = {"version": 1, "lanes": [{"target": "volume", "points": [{"t": round(t, 3), "v": v} for t, v in pts]}]}
json.dump({"sfx": ev, "musicAuto": auto}, open(D + "/assets/audio-plan.json", "w"))
print(len(ev), "sfx; music", round(total + 1, 1), "s")
