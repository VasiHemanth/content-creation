import sys, json, re, numpy as np
sys.path.insert(0, "/home/user/content-creation/style-lab/tools")
from synth import *
D = "/home/user/content-creation/style-lab/papercut"
T = json.loads(re.search(r"=(.*);", open(D + "/assets/timing.js").read()).group(1))
total = T["total"]; Wd = lambda li: T["lines"][li]["words"]; S = T["scenes"]
sf_dir = D + "/assets/sfx/"
# ---------- sfx library ----------
def pop(seed, f=420):
    n = int(.09 * SR); x = sweep(f * 1.7, f * .8, n) * env(n, .001, .06) + noise(n, seed) * env(n, .0005, .01) * .3; return lp(x, 6000)
def tick(seed):
    n = int(.05 * SR); return bp(noise(n, seed), 1800, 7000) * env(n, .0005, .02) * 1.2
def rustle(seed, dur):
    n = int(dur * SR); x = bp(noise(n, seed), 1500, 7500); r = rng(seed + 1)
    am = lp(np.abs(noise(n, seed + 2)), 22) ; am = am / am.max()
    return x * (0.25 + am) * env(n, .02, dur * .6) 
def flap(seed):
    n = int(.4 * SR); x = bp(noise(n, seed), 400, 3500) * env(n, .004, .12) + sine(95, n) * env(n, .002, .09) * .8; return x
def snap(seed):
    n = int(.12 * SR); return (bp(noise(n, seed), 2500, 9000) * env(n, .0003, .015) * 1.2 + sine(180, n) * env(n, .001, .05) * .5)
def sheet(seed, dur=1.0):
    n = int(dur * SR); t = np.linspace(0, 1, n)
    x = bp(noise(n, seed), 700, 6500) * (np.sin(np.pi * t) ** 1.5) ; am = lp(np.abs(noise(n, seed + 3)), 30); am /= am.max()
    return x * (.4 + am) 
def whirr(dur, seed):
    n = int(dur * SR); t = np.arange(n) / SR; x = bp(noise(n, seed), 300, 2500) * (.55 + .45 * np.sin(2 * np.pi * 9 * t)) + sine(120, n) * .12
    return x * np.minimum(t / .15, 1) * np.minimum((dur - t) / .2, 1)
def pour(dur, seed):
    n = int(dur * SR); t = np.arange(n) / SR; x = bp(noise(n, seed), 600, 3200) * (.7 + .3 * lp(noise(n, seed + 1), 15)); return x * np.minimum(t / .1, 1) * np.minimum((dur - t) / .25, 1)
def thud(seed):
    n = int(.35 * SR); return sine(70, n) * env(n, .002, .18) + lp(noise(n, seed), 500) * env(n, .001, .08) * .6
def tink(seed):
    n = int(.05 * SR); return bp(noise(n, seed), 1200, 4200) * env(n, .0006, .025) * .9
lib = {}
for k in range(3): lib["pop%d" % k] = pop(10 + k, 380 + 60 * k); lib["tick%d" % k] = tick(20 + k); lib["tink%d" % k] = tink(60 + k)
for k in range(3): lib["rustleS%d" % k] = rustle(30 + k, .35 + .1 * k); lib["rustleM%d" % k] = rustle(40 + k, .8 + .2 * k)
lib["flap"] = flap(50); lib["snap"] = snap(51); lib["thud"] = thud(52); lib["whirr"] = whirr(2.6, 53); lib["pour"] = pour(1.7, 54); lib["gearturn"] = whirr(2.0, 55)
for k in range(6): lib["sheet%d" % k] = sheet(70 + k, 1.0)
lib["swell"] = rustle(80, 2.6)
for k, v in lib.items(): write(sf_dir + k + ".wav", v)
dur = {k: len(v) / SR for k, v in lib.items()}
ev = []
def add(name, t, v=.6): ev.append({"file": name + ".wav", "t": round(max(0, t), 3), "d": round(dur[name] + .05, 3), "v": v})
# ---------- events ----------
L1, L2, L3, L4, L5, L6, L7, L8, L9 = [T["lines"][i]["words"] for i in range(9)]
for k in range(7): add("pop%d" % (k % 3), k * .1, .55)
for i in range(12): add("tick%d" % (i % 3), L1[3 + i]["start"], .35)
add("pop1", L2[4]["start"] + .1, .6); add("rustleS0", L2[8]["start"], .5); add("snap", L2[8]["start"] + .62, .5); add("gearturn", L2[13]["start"] - .1, .35)
for i, s in enumerate(T["seams"]): add("sheet%d" % i, s - .5, .7)
b = S["B"]["start"]
add("flap", L3[4]["start"] + .15, .7)
for w, nm in [(8, "pop0"), (10, "pop1"), (13, "pop2")]: add(nm, L3[w]["start"], .7)
for k in range(11): add("pop%d" % (k % 3), L3[13]["start"] + .15 + k * .1, .35)
add("rustleS1", L4[3]["start"], .5); add("pop2", L4[4]["start"] + .1, .8)
for i in range(7, 13): add("tick%d" % (i % 3), L4[i]["start"], .4)
for k in range(8): add("tick%d" % (k % 3), L4[8]["start"] + .05 + k * .1, .3)
for k in range(11): add("pop%d" % (k % 3), L5[1]["start"] + (L5[5]["end"] - L5[1]["start"]) * k / 11, .4)
add("rustleM0", L5[13]["start"] - .6, .5)
for k in range(10): add("rustleS%d" % (k % 3), L5[13]["start"] + (L5[20]["end"] - L5[13]["start"] - .55) * k / 10, .4)
add("snap", L6[0]["start"] + .55, .8); add("rustleM1", L6[0]["start"] + .1, .6); add("tick1", L6[5]["start"], .5)
for k in range(11): add("pop%d" % (k % 3), L7[6]["start"] - .1 + k * .07, .3)
for k in range(11): add("rustleS%d" % (k % 3), L7[3]["start"] + k * .08, .3)
r = np.random.RandomState(9)
for k in range(24): add("tink%d" % (k % 3), L7[7]["start"] + (L7[11]["end"] - L7[7]["start"] + .9) * k / 24 + .9, .35 + r.rand() * .2)
add("whirr", L7[12]["start"], .5); add("pour", L7[14]["start"] + .1, .6); add("thud", L7[14]["start"] + 1.4, .4)
add("rustleM2", L8[3]["start"], .5); add("rustleM0", L8[6]["start"] - .05, .7); add("thud", L8[6]["start"] + .85, .6); add("pop1", L8[8]["start"], .6)
add("swell", L9[2]["start"], .35); add("swell", L9[5]["start"], .35); add("swell", L9[7]["start"], .35)
add("rustleM1", L9[11]["end"] + .3, .6); add("thud", L9[11]["end"] + .85, .8)
ev.sort(key=lambda e: e["t"])
# ---------- music: 92 bpm marimba-ish plucks over a soft pad ----------
bpm = 92; beat = 60 / bpm; n = int((total + 1) * SR); M = np.zeros(n)
chords = [[220, 261.6, 329.6], [174.6, 220, 261.6], [261.6, 329.6, 392], [196, 246.9, 293.7]]
pent = [440, 523.3, 587.3, 659.3, 784, 880]
rr = np.random.RandomState(5)
bar = 4 * beat
for b_i in range(int(total / bar) + 2):
    ch = chords[b_i % 4]; t0 = b_i * bar
    for f in ch:
        x = (sine(f / 2, int(bar * SR * 1.05)) * .5 + sine(f, int(bar * SR * 1.05)) * .25) * np.minimum(np.arange(int(bar * SR * 1.05)) / (SR * .5), 1) * np.minimum((bar * 1.05 * SR - np.arange(int(bar * SR * 1.05))) / (SR * .6), 1)
        mixin(M, x, t0, .09)
    for k in range(8):
        if rr.rand() < .72:
            f = ch[rr.randint(3)] * (2 if rr.rand() < .6 else 4); mixin(M, pluck(f, .9, rr.randint(999), .8), t0 + k * beat / 2, .16 * (.6 + .4 * rr.rand()))
    mixin(M, pluck(ch[0] / 2, 1.2, 1, .3, .6), t0, .26)
M = lp(M, 5200)
write(D + "/assets/music.wav", M)
# music envelope: ducked under the voice, ramps through the gaps, silent through the quiet hold, swell under the end card
pts = [(0, .20)]
for ln in T["lines"]:
    pts += [(ln["start"] - .15, .20), (ln["start"] + .1, .085), (ln["end"] + .15, .085), (ln["end"] + .55, .20)]
h0 = T["lines"][7]["end"]
pts = [p for p in pts if not (h0 - .1 < p[0] < h0 + 1.3)] + [(h0 - .05, .05), (h0 + .15, 0), (h0 + 1.05, 0), (h0 + 1.45, .14)]
pts += [(T["lines"][8]["end"] + .3, .26), (total - .4, .3), (total, 0)]
pts.sort()
auto = {"version": 1, "lanes": [{"target": "volume", "points": [{"t": round(t, 3), "v": v} for t, v in pts]}]}
json.dump({"sfx": ev, "musicAuto": auto}, open(D + "/assets/audio-plan.json", "w"))
print(len(ev), "sfx;", "music", round(total + 1, 1), "s")
