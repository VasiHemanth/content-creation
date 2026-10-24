import sys, json, re, numpy as np
sys.path.insert(0, "/home/user/content-creation/style-lab/tools")
from synth import *
D = "/home/user/content-creation/style-lab/swiss"
T = json.loads(re.search(r"=(.*);", open(D + "/assets/timing.js").read()).group(1))
total = T["total"]; S = T["scenes"]; sf_dir = D + "/assets/sfx/"
Ls = [T["lines"][i]["words"] for i in range(8)]
def click(seed, f=2400, d=.03):
    n = int(d * SR); return bp(noise(n, seed), f * .6, f * 2.2) * env(n, .0003, d * .45) * 1.3
def thock(seed):
    n = int(.18 * SR); return (sine(95, n) * env(n, .001, .08) + bp(noise(n, seed), 400, 2500) * env(n, .0005, .02) * .6)
def slide(seed, d=.35, lo=700, hi=4200):
    n = int(d * SR); t = np.linspace(0, 1, n); return bp(noise(n, seed), lo, hi) * np.sin(np.pi * t) ** 1.2 * .8
def roll(count, spacing, seed, f=2600, rise=0.0):
    n = int((count * spacing + .12) * SR); y = np.zeros(n)
    for k in range(count): mixin(y, click(seed + k, f * (1 + rise * k / max(1, count)), .028), k * spacing, .8 + .2 * ((k % 4) == 0))
    return y
lib = {"click0": click(1), "click1": click(2, 3000), "click2": click(3, 1900), "thock": thock(4), "slide0": slide(5), "slide1": slide(6, .9, 500, 3000), "slide2": slide(7, 1.4, 400, 2600),
       "drop": roll(20, 0.3 / 20, 40, 2400), "circles": roll(20, .075, 60, 2200, .4)}
sc = Ls[1][10]["end"] + .1 - Ls[1][3]["start"]; lib["scan"] = roll(int(sc / .05), .05, 80, 1800, .3)
lib["probe"] = roll(26, .12, 90, 1500, .5)
for k, v in lib.items(): write(sf_dir + k + ".wav", v)
dur = {k: len(v) / SR for k, v in lib.items()}
ev = []
def add(name, t, v=.6): ev.append({"file": name + ".wav", "t": round(max(0, t), 3), "d": round(dur[name] + .05, 3), "v": v})
add("click1", .4, .35); add("click0", Ls[0][4]["start"], .6); add("click2", 2.2, .3)
add("scan", S["S2"]["start"] + (Ls[1][3]["start"] - S["S2"]["start"]), .45); add("thock", Ls[1][9]["start"], .5)
add("slide0", Ls[2][3]["start"], .5); add("click0", Ls[2][7]["start"], .4); add("click0", Ls[2][10]["start"], .4)
add("drop", Ls[2][12]["start"], .5); add("slide0", Ls[2][12]["start"] + .3, .55)
add("slide0", Ls[3][2]["start"], .5); add("drop", Ls[3][7]["start"], .5); add("slide0", Ls[3][7]["start"] + .3, .55)
for i, w in [(5, 5), (7, 7), (10, 10)]: add("slide0", Ls[4][w]["start"], .45); add("thock", Ls[4][w]["start"], .35)
add("slide0", Ls[4][13]["end"] + .12, .4); add("thock", Ls[4][13]["end"] + .12, .3)
add("circles", Ls[5][0]["start"], .5); add("thock", Ls[5][5]["start"], .55); add("thock", Ls[5][10]["start"], .55); add("click1", Ls[5][12]["start"], .5)
add("slide1", Ls[5][14]["start"], .4); add("click2", Ls[5][14]["start"] + .6, .5)
add("click1", Ls[6][0]["start"], .4); add("thock", Ls[6][4]["start"], .5); add("click2", Ls[6][11]["start"], .6); add("thock", Ls[6][11]["start"] + .1, .7)
add("slide1", Ls[7][1]["start"], .4); add("slide2", Ls[7][4]["start"], .45)
tT = S["S8"]["start"] + (Ls[7][8]["end"] - S["S8"]["start"]) + .5
add("thock", tT, .75); add("probe", tT + .3, .35)
ev.sort(key=lambda e: e["t"])
# bed: a 60 bpm tick with a soft sub on every fourth beat, nothing else
n = int((total + 1) * SR); M = np.zeros(n)
for b in range(int(total) + 2):
    mixin(M, click(200 + b % 7, 4200, .02) * .35, b * 1.0, 1.0)
    if b % 4 == 0: mixin(M, sine(55, int(1.6 * SR)) * env(int(1.6 * SR), .01, .9) * .6, b * 1.0, 1.0)
    if b % 4 == 2: mixin(M, sine(82.4, int(1.2 * SR)) * env(int(1.2 * SR), .01, .6) * .4, b * 1.0, 1.0)
write(D + "/assets/music.wav", lp(M, 6000))
pts = [(0, .2)]
for ln in T["lines"]:
    pts += [(ln["start"] - .15, .2), (ln["start"] + .1, .1), (ln["end"] + .15, .1), (ln["end"] + .5, .2)]
pts += [(total - 1.0, .24), (total, 0)]
pts.sort()
json.dump({"sfx": ev, "musicAuto": {"version": 1, "lanes": [{"target": "volume", "points": [{"t": round(t, 3), "v": v} for t, v in pts]}]}}, open(D + "/assets/audio-plan.json", "w"))
print(len(ev), "sfx")
