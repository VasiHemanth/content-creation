import sys, json, re, numpy as np
sys.path.insert(0, "/home/user/content-creation/style-lab/tools")
from synth import *
D = "/home/user/content-creation/style-lab/vox"
T = json.loads(re.search(r"=(.*);", open(D + "/assets/timing.js").read()).group(1))
total = T["total"]; S = T["scenes"]; sf_dir = D + "/assets/sfx/"
def L(i): return T["lines"][i]["words"]
def whoosh(seed, dur=.35):
    n = int(dur * SR); t = np.linspace(0, 1, n); x = bp(noise(n, seed), 400, 5000) * (np.sin(np.pi * t ** .7) ** 1.3); return x
def thud(seed):
    n = int(.4 * SR); return sine(55, n) * env(n, .001, .22) * 1.2 + lp(noise(n, seed), 400) * env(n, .001, .06) * .6 + sweep(110, 45, n) * env(n, .001, .15) * .6
def tick(seed):
    n = int(.03 * SR); return bp(noise(n, seed), 2500, 9000) * env(n, .0004, .012)
def squeak(seed, dur=.35):
    n = int(dur * SR); t = np.arange(n) / SR; f = 1800 + 500 * np.sin(2 * np.pi * 9 * t); ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) * .5 + bp(noise(n, seed), 1500, 5000) * .6) * np.minimum(t / .02, 1) * np.minimum((dur - t) / .06, 1) * (.5 + .5 * np.abs(np.sin(2 * np.pi * 5 * t)))
def stamp(seed):
    n = int(.3 * SR); return sine(90, n) * env(n, .001, .12) + bp(noise(n, seed), 800, 3500) * env(n, .0005, .04) * .9
def paper(seed, dur=.3):
    n = int(dur * SR); return bp(noise(n, seed), 1200, 7000) * env(n, .01, dur * .5)
lib = {}
for k in range(3): lib["whoosh%d" % k] = whoosh(10 + k, .3 + .06 * k); lib["tick%d" % k] = tick(20 + k); lib["squeak%d" % k] = squeak(30 + k, .3 + .08 * k); lib["thud%d" % k] = thud(40 + k)
lib["stamp"] = stamp(50); lib["paper"] = paper(51); lib["flash"] = whoosh(52, .22) + sine(900, int(.22 * SR)) * 0
for k, v in lib.items(): write(sf_dir + k + ".wav", v)
dur = {k: len(v) / SR for k, v in lib.items()}
ev = []
def add(n, t, v=.6): ev.append({"file": n + ".wav", "t": round(max(0, t), 3), "d": round(dur[n] + .05, 3), "v": v})
W = [L(i) for i in range(9)]
add("thud0", 0.0, .9)
for k in range(12): add("tick%d" % (k % 3), .3 + k * .085, .35)
add("thud1", S["V1"]["start"] + 1.45 - .05, .4)
for w, n in [(1.45, "whoosh0"), (1.83, "whoosh1"), (2.28, "whoosh2"), (2.56, "whoosh0")]: add(n, w - .12, .5)
add("squeak0", 2.78, .5); add("whoosh1", 3.1, .5); add("paper", 3.52, .4); add("whoosh2", 4.6, .5); add("thud2", 5.38, .9)
# V2
for i, (w, n) in enumerate([(6.18, "whoosh1"), (6.93, "whoosh2"), (7.78, "whoosh0"), (8.17, "whoosh1"), (8.57, "whoosh2"), (9.06, "whoosh0"), (9.55, "whoosh1")]): add(n, w - .12, .5)
add("squeak1", 8.75, .6); add("squeak2", 8.9, .6)
for k in range(3): add("stamp", 9.06 + k * .3, .5)
# slabs and numerals
for t, n in [(10.54, "thud0"), (11.2, "thud1"), (17.54, "thud2"), (18.21, "thud0"), (31.54, "thud1"), (32.1, "thud2")]: add(n, t, .85)
for k in range(20): add("tick%d" % (k % 3), 12.0 + k * .02, .3)
add("flash", 12.45, .5); add("whoosh1", 12.44, .4)
for n, t in [("whoosh0", 12.44), ("whoosh1", 13.19), ("whoosh2", 14.7)]: add(n, t, .5)
add("whoosh0", 13.83, .5); add("stamp", 14.83, .5)
for k in range(24): add("tick%d" % (k % 3), 14.0 + k * .1, .22)
add("thud2", 14.95 + 0.7, .6); add("flash", 15.65, .5); add("whoosh1", 16.1, .5)
# V4
for t, n in [(19.1, "tick0"), (19.5, "flash"), (19.89, "whoosh0"), (20.91, "whoosh1"), (22.1, "whoosh2"), (22.6, "whoosh0")]: add(n, t - .1 if n.startswith("whoosh") else t, .5)
add("squeak0", 21.2, .6); add("paper", 21.3, .4)
for t in [22.3, 22.55, 22.62]: add("thud%d" % int(t * 10 % 3), t, .8)
add("stamp", 22.62, .8); add("whoosh2", 24.05, .5); add("whoosh1", 24.54, .5); add("paper", 24.9, .5); add("whoosh0", 25.89, .5); add("whoosh1", 26.25, .5); add("squeak1", 26.6, .5)
# V5
add("whoosh0", S["V5"]["start"] + .0, .5)
for k in range(6): add("tick%d" % (k % 3), 27.84 + k * .15, .3)
for k in range(8): add("tick%d" % (k % 3), 29.6 + k * .13, .3)
add("squeak2", 30.8, .6); add("squeak0", 30.95, .6)
# V6
for t, n in [(32.17, "whoosh1"), (32.68, "whoosh2"), (32.91, "whoosh0"), (33.7, "tick0")]: add(n, t, .5)
add("squeak1", 33.1, .5); add("flash", 34.1, .5); add("paper", 34.95, .5); add("whoosh2", 34.9, .5); add("whoosh0", 35.0, .5); add("whoosh1", 35.92, .5); add("thud0", 36.29, .9)
# V7
add("whoosh1", 37.5, .5)
for k in range(12): add("thud%d" % (k % 3), 37.8 + k * .08, .25)
add("whoosh2", 38.76, .5); add("squeak0", 39.3, .5); add("whoosh0", 39.4, .5)
for k in range(6): add("stamp", 40.7 + k * .1, .3)
add("whoosh1", 40.2, .5); add("whoosh2", 41.4, .5)
for k in range(4): add("paper", 41.6 + k * .08, .3)
add("whoosh0", 42.07, .5); add("thud1", 42.47, .9); add("squeak1", 42.5, .5); add("flash", 42.85, .6)
# V8
for k in range(12): add("tick%d" % (k % 3), 43.55 + k * .035, .3)
add("flash", 43.98, .5)
for t in [44.45, 44.8, 45.0, 45.75]: add("squeak%d" % int(t * 10 % 3), t, .45)
for k in range(10): add("tick%d" % (k % 3), 45.45 + k * .045, .3)
add("thud2", 45.95, .8); add("whoosh1", 46.72, .5)
# V9
for t, n in [(48.83, "whoosh0"), (49.19, "whoosh1")]: add(n, t, .5)
add("thud0", 49.52, .9); add("whoosh2", 50.0, .5); add("squeak0", 50.0, .5)
for t in [50.16, 50.62, 51.6]: add("stamp", t, .6)
add("whoosh1", 50.28, .5); add("whoosh1", 52.0, .6); add("thud1", 52.9, 1.0); add("thud2", 53.45, .8); add("thud0", 53.62, 1.0); add("paper", 54.3, .4)
ev = [e for e in ev if e["t"] < total - .2]
ev.sort(key=lambda e: e["t"])
# music: 104 bpm - kick + bass + clicky hats + minor stab, simple and quiet
bpm = 104; beat = 60 / bpm; n = int((total + 1) * SR); M = np.zeros(n); rr = np.random.RandomState(7)
kick = sine(55, int(.3 * SR)) * env(int(.3 * SR), .001, .2) + sweep(120, 48, int(.3 * SR)) * env(int(.3 * SR), .001, .1) * .7
hat = bp(noise(int(.06 * SR), 5), 6000, 12000) * env(int(.06 * SR), .0005, .03)
notes = [110, 110, 130.8, 98]
for b in range(int(total / beat) + 2):
    t0 = b * beat
    mixin(M, kick, t0, .9) if b % 2 == 0 or b % 8 == 7 else None
    mixin(M, hat, t0 + beat / 2, .35); 
    if rr.rand() < .5: mixin(M, hat, t0 + beat * .25, .18)
    f = notes[(b // 4) % 4]; mixin(M, (sine(f, int(beat * 1.6 * SR)) + .4 * sine(f * 2, int(beat * 1.6 * SR))) * env(int(beat * 1.6 * SR), .005, .35), t0 + (beat * .5 if b % 2 else 0), .45)
    if b % 8 == 0:
        for ff in [f * 4, f * 4.76, f * 6]: mixin(M, pluck(ff, 1.0, 1, .6, .4), t0, .12)
M = lp(M, 7000)
write(D + "/assets/music.wav", M)
pts = [(0, .0), (.1, .30)]
for ln in T["lines"]:
    pts += [(ln["start"] - .1, .30), (ln["start"] + .1, .105), (ln["end"] + .1, .105), (ln["end"] + .4, .26)]
pts += [(total - 1.6, .3), (total, 0)]
pts.sort()
auto = {"version": 1, "lanes": [{"target": "volume", "points": [{"t": round(t, 3), "v": v} for t, v in pts]}]}
json.dump({"sfx": ev, "musicAuto": auto}, open(D + "/assets/audio-plan.json", "w"))
print(len(ev), "sfx")
