import sys, json, numpy as np
sys.path.insert(0, "/home/user/content-creation/style-lab/tools")
from synth import *
D = "/home/user/content-creation/style-lab/clay"
T0 = json.load(open(D + "/timing.json")); total = round(T0["duration"], 2); L = T0["lines"]
w = lambda l, i: L[l - 1]["words"][i]["start"]; we = lambda l, i: L[l - 1]["words"][i]["end"]
sf_dir = D + "/assets/sfx/"
# ---------------- sfx library ----------------
def squish(seed, d=.28, f=240):
    n = int(d * SR); t = np.linspace(0, 1, n); x = lp(noise(n, seed), 1100) * (.5 + .5 * np.sin(np.pi * t)) * 2.2
    return (x + sweep(f * 1.6, f * .6, n) * .5) * env(n, .01, d * .6)
def slap(seed):
    n = int(.14 * SR); return lp(noise(n, seed), 1400) * env(n, .001, .05) * 2 + sine(95, n) * env(n, .001, .07) * .9
def pop(seed, f=520):
    n = int(.1 * SR); return sweep(f * 1.5, f * .55, n) * env(n, .001, .06) + lp(noise(n, seed), 4000) * env(n, .0005, .01) * .25
def click(seed):
    n = int(.045 * SR); return bp(noise(n, seed), 2400, 8500) * env(n, .0003, .014) * 1.4 + sine(2100, n) * env(n, .0004, .01) * .25
def thud(seed, f=78):
    n = int(.3 * SR); return sine(f, n) * env(n, .002, .16) + lp(noise(n, seed), 400) * env(n, .001, .05) * .5
def whoosh(seed, d=.5):
    n = int(d * SR); t = np.linspace(0, 1, n); x = bp(noise(n, seed), 500, 4200) * np.sin(np.pi * t) ** 1.4; return x
def stretch(seed, d=.8):
    n = int(d * SR); t = np.linspace(0, 1, n); return lp(noise(n, seed), 1100) * (.4 + .6 * np.sin(np.pi * t)) * 1.5 * env(n, .03, d * .8) + sweep(180, 330, n) * .15 * np.sin(np.pi * t)
def slide(seed, d=.7):
    n = int(d * SR); return bp(noise(n, seed), 900, 3200) * (.3 + .7 * lp(np.abs(noise(n, seed + 1)), 40) / 1.0) * env(n, .02, d * .7)
lib = {}
for k in range(3): lib["squish%d" % k] = squish(10 + k, .26 + .04 * k, 200 + 40 * k); lib["pop%d" % k] = pop(20 + k, 460 + 70 * k); lib["click%d" % k] = click(30 + k); lib["slap%d" % k] = slap(40 + k)
lib["thud"] = thud(50); lib["thudB"] = thud(51, 60); lib["whoosh0"] = whoosh(52, .55); lib["whoosh1"] = whoosh(53, .45); lib["stretch"] = stretch(54, .9); lib["slide"] = slide(55, .8)
lib["bigwhoosh"] = whoosh(56, .9)
for k, v in lib.items(): write(sf_dir + k + ".wav", v)
dur = {k: len(v) / SR for k, v in lib.items()}
ev = []
def add(name, t, v=.6): ev.append({"file": name + ".wav", "t": round(max(0, t), 3), "d": round(dur[name] + .05, 3), "v": v})
# ---------------- story times (mirror of story.js) ----------------
five = we(8, 16); stamp = five + 1.35; title = five + 2.15
sq0 = w(2, 12) - .1; tossJ = w(3, 0) + .15; replay = w(7, 11) - .8
loops = [w(8, 0) + .4, w(8, 0) + 1.7, w(8, 7), w(8, 12) - .1]; lt = [.4, .33, .26, .2]
add("squish0", 1.3, .7); add("pop1", .3, .5)
for i, t in enumerate([w(2, 0), w(2, 1), w(2, 2)]): add("thud", t + .5, .35); add("pop%d" % i, t - .05, .3)
add("thud", w(1, 6), .0)
def passes(t0, sq, td, v=.55, tj=None, ld=.5):
    for i in range(3):
        s = t0 + i * (sq + td); add("squish%d" % (i % 3), s, v); add("whoosh1", s + sq, v * .55)
        if i < 2: add("slap%d" % (i % 3), s + sq + td, v * .6)
    add("whoosh0", (tj if tj else t0 + 3 * (sq + td)), v * .6); add("slap0", (tj if tj else t0 + 3 * (sq + td)) + ld, v * .8)
passes(sq0, .5, .4, .6, tossJ, .5)
passes(replay, .32, .3, .5, replay + 1.8, .4)
for i, l in enumerate(lt): t0 = loops[i]; passes(t0, l * .45, l * .4, .4, t0 + 3 * l * .85 + .05, l * .45)
add("pop2", w(3, 10) - .2, .6); add("thud", w(3, 20) - .35 + .4, .7); add("slide", w(3, 5) - .1, .4); add("stretch", w(3, 12), .45)
add("stretch", w(4, 2) - .35, .6); add("whoosh0", w(4, 4) + .3, .55); add("slap1", w(4, 4) + .3 + .6, .7); add("pop0", w(4, 15) - .1, .6)
for t in [w(5, 1) + .35, w(5, 10) + .4, w(5, 15) + .6]: add("squish1", t - .1, .8); add("pop2", t + .2, .6)
add("whoosh0", w(5, 5) + .1, .55); add("slap2", w(5, 5) + .55, .6); add("whoosh1", w(5, 12) + .1, .55); add("slap1", w(5, 12) + .6, .6)
m = w(6, 0) + .4
add("whoosh1", m, .5); add("squish2", m + .6, .6); add("whoosh1", m + 1.7, .5)
add("pop0", w(6, 8) - .1, .6); add("pop1", w(6, 12) - .1, .5); add("pop2", w(6, 12) + .1, .5)
for k, t in enumerate([w(7, 0) + .5, w(7, 0) + .85, w(7, 0) + 1.1]):
    for j in range(7): add("click%d" % ((j + k) % 3), t + .05 + j * .8 / 7, .5)
add("bigwhoosh", w(4, 0) - .0 + .0, .0)
add("bigwhoosh", w(3, 5) - 2.2, .7); add("bigwhoosh", replay - 1.4, .7)
for j in range(4): add("slap%d" % (j % 3), loops[j] + 3 * lt[j] * .85 + .3, .4)
add("slap1", five + .35, .9); add("whoosh1", five - .1, .5); add("thudB", stamp + .25, .9); add("whoosh1", stamp, .5)
for k in range(15): add("pop%d" % (k % 3), title + k * .075 + .25, .35)
ev.sort(key=lambda e: e["t"]); ev = [e for e in ev if e["v"] > 0]
# ---------------- music: soft marimba-like plucks, 96 bpm ----------------
bpm = 96; beat = 60 / bpm; n = int((total + 1) * SR); M = np.zeros(n)
chords = [[261.6, 329.6, 392], [220, 261.6, 329.6], [174.6, 220, 261.6], [196, 246.9, 293.7]]
rr = np.random.RandomState(7); bar = 4 * beat
def marimba(f, d):
    nn = int(d * SR); t = np.arange(nn) / SR
    return (np.sin(2 * np.pi * f * t) * np.exp(-t * 7) + .35 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 18) + .15 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t * 30)) * np.minimum(t / .003, 1)
for b in range(int(total / bar) + 2):
    ch = chords[b % 4]; t0 = b * bar
    for f in ch:
        nn = int(bar * SR * 1.05); x = (sine(f / 2, nn) * .5 + sine(f, nn) * .2) * np.minimum(np.arange(nn) / (SR * .5), 1) * np.minimum((nn - np.arange(nn)) / (SR * .6), 1); mixin(M, x, t0, .08)
    for k in range(8):
        if rr.rand() < .7: mixin(M, marimba(ch[rr.randint(3)] * (2 if rr.rand() < .7 else 4), .7), t0 + k * beat / 2, .17 * (.6 + .4 * rr.rand()))
    mixin(M, marimba(ch[0] / 2, 1.0), t0, .3)
M = lp(M, 4800); write(D + "/assets/music.wav", M)
pts = [(0, .20)]
for ln in L: pts += [(ln["start"] - .15, .20), (ln["start"] + .1, .085), (ln["end"] + .15, .085), (ln["end"] + .55, .2)]
pts += [(L[-1]["end"] + .3, .3), (total - .5, .3), (total, 0)]; pts.sort()
json.dump({"sfx": ev, "musicAuto": {"version": 1, "lanes": [{"target": "volume", "points": [{"t": round(t, 3), "v": v} for t, v in pts]}]}}, open(D + "/assets/audio-plan.json", "w"))
print(len(ev), "sfx; total", total)
