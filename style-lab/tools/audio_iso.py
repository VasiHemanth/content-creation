import sys, json, re, numpy as np
sys.path.insert(0, "/home/user/content-creation/style-lab/tools")
from synth import *
D = "/home/user/content-creation/style-lab/iso"
T = json.loads(re.search(r"=(.*);", open(D + "/assets/timing.js").read()).group(1))
EV = json.load(open(D + "/assets/events.json"))
total = T["total"]; sf_dir = D + "/assets/sfx/"
# ---------- sfx library (noise, clicks and thuds; no musical tones) ----------
def tick(seed, hi=7500):
    n = int(.04 * SR); return bp(noise(n, seed), 2200, hi) * env(n, .0004, .014) * 1.3
def hum(dur, seed):
    n = int(dur * SR); t = np.arange(n) / SR
    x = lp2(noise(n, seed), 420) * .5 + (sine(52, n) * .5 + sine(104, n) * .18 + sine(156, n) * .06) * (0.8 + .2 * np.sin(2 * np.pi * .7 * t))
    return x * np.minimum(t / .3, 1) * np.minimum((dur - t) / .3, 1)
def whirr(dur, seed, f0=120, f1=420):
    n = int(dur * SR); t = np.arange(n) / SR; x = sweep(f0, f1, n) * .5 + bp(noise(n, seed), 300, 2500) * .5
    return x * (0.6 + .4 * np.sin(2 * np.pi * 11 * t)) * np.minimum(t / .05, 1) * np.minimum((dur - t) / .1, 1)
def thud(seed, f=62, d=.4):
    n = int(d * SR); return (sine(f, n) * env(n, .002, .2) + lp(noise(n, seed), 600) * env(n, .001, .06) * .7) 
def clunk(seed):
    n = int(.28 * SR); return (bp(noise(n, seed), 400, 3500) * env(n, .001, .05) + sine(95, n) * env(n, .001, .09) * .8)
def pop(seed, f=330):
    n = int(.1 * SR); return lp(sweep(f * 1.8, f * .8, n) * env(n, .001, .05) + noise(n, seed) * env(n, .0005, .01) * .3, 5500)
def swish(dur, seed, up=True):
    n = int(dur * SR); t = np.linspace(0, 1, n); x = bp(noise(n, seed), 600, 6500) * (np.sin(np.pi * t) ** 1.4); return x
def rumble(dur, seed):
    n = int(dur * SR); t = np.linspace(0, 1, n); x = lp2(noise(n, seed), 260) * (np.sin(np.pi * t) ** .8); return x * 1.8
def ratchet(n_ticks, gap, seed):
    n = int((n_ticks * gap + .1) * SR); y = np.zeros(n)
    for i in range(n_ticks): mixin(y, tick(seed + i, 5000) * (1 - .4 * i / n_ticks), i * gap, 1)
    return y
def fuse(dur, seed):
    n = int(dur * SR); y = np.zeros(n); tt = 0.0; i = 0
    while tt < dur - .05: mixin(y, tick(seed + i, 4500) * .8, tt, 1); tt += .14 - .06 * (tt / dur); i += 1
    return y
lib = {}
for k in range(3): lib["tick%d" % k] = tick(20 + k); lib["pop%d" % k] = pop(30 + k, 300 + 50 * k)
lib["hum"] = hum(4.3, 5); lib["rise"] = whirr(1.0, 6, 70, 260); lib["drop"] = thud(7, 58, .5); lib["gate"] = clunk(8)
lib["miss"] = pop(9, 190); lib["db"] = whirr(.85, 10, 140, 330); lib["copy"] = pop(11, 420)
lib["hit"] = tick(12, 9000); lib["green"] = tick(13, 6000); lib["recolor"] = swish(1.9, 14); lib["dial"] = ratchet(14, .12, 15)
lib["sink"] = rumble(1.4, 16); lib["ring"] = fuse(3.0, 17); lib["stale"] = thud(18, 85, .3); lib["discard"] = pop(19, 150); lib["sign"] = pop(21, 360)
for k, v in lib.items(): write(sf_dir + k + ".wav", v)
dur = {k: len(v) / SR for k, v in lib.items()}
gain = {"tick": .35, "hum": .22, "rise": .5, "drop": .9, "gate": .6, "miss": .55, "db": .5, "copy": .6, "hit": .25, "green": .45, "recolor": .4, "dial": .5, "sink": .7, "ring": .35, "stale": .6, "discard": .55, "sign": .5}
ev = []
def add(name, t, v=None):
    ev.append({"file": name + ".wav", "t": round(max(0, t), 3), "d": round(min(dur[name] + .05, total - max(0, t) - .01), 3), "v": v if v is not None else gain.get(re.sub(r"\d$", "", name), .5)})
tsec = 0.0
while tsec < 33.2: add("hum", tsec, .2); tsec += 4.0                       # belts are running until the crowd slab sinks
tsec = 33.4
while tsec < total - 1: add("hum", tsec, .12); tsec += 4.0
pc = 0; hc = 0
for e in EV["events"]:
    n = e["n"]
    if n == "hum": continue
    if n == "tick": add("tick%d" % (pc % 3), e["t"], e.get("v", .3)); pc += 1
    elif n == "hit": add("hit", e["t"], .22); 
    elif n == "dial": add("dial", e["t"] + .2)
    elif n in lib: add(n, e["t"])
ev.sort(key=lambda e: e["t"])
ded = []
for e in ev:
    if not any(d["file"] == e["file"] and abs(d["t"] - e["t"]) < 0.05 for d in ded): ded.append(e)
ev = ded
# ---------- music: a quiet 104 bpm pulse bed ----------
bpm = 104; beat = 60 / bpm; n = int((total + 1) * SR); M = np.zeros(n); rr = np.random.RandomState(31)
chords = [[220, 261.6, 329.6], [196, 246.9, 293.7], [174.6, 220, 261.6], [196, 246.9, 329.6]]
bar = 4 * beat
for b in range(int(total / bar) + 2):
    ch = chords[b % 4]; t0 = b * bar
    for f in ch:
        L = int(bar * SR * 1.05); x = sine(f / 2, L) * .5 * np.minimum(np.arange(L) / (SR * .6), 1) * np.minimum((L - np.arange(L)) / (SR * .6), 1); mixin(M, x, t0, .08)
    for k in range(8):
        f = ch[0] / 2 if k % 2 == 0 else ch[(k // 2) % 3]
        mixin(M, lp(pluck(f * (1 if k % 2 == 0 else 2), .4, 1, .6, .25), 1800), t0 + k * beat / 2, .17 if k % 2 == 0 else .09)
    for k in range(8): mixin(M, tick(40 + b * 8 + k, 9000), t0 + k * beat / 2 + beat / 4, .05)
M = lp(M, 5000); write(D + "/assets/music.wav", M)
pts = [(0, .24)]
for ln in T["lines"]:
    pts += [(ln["start"] - .15, .24), (ln["start"] + .1, .095), (ln["end"] + .15, .095), (ln["end"] + .5, .24)]
pts += [(total - .5, .3), (total, 0)]; pts.sort()
auto = {"version": 1, "lanes": [{"target": "volume", "points": [{"t": round(t, 3), "v": v} for t, v in pts]}]}
json.dump({"sfx": ev, "musicAuto": auto}, open(D + "/assets/audio-plan.json", "w"))
print(len(ev), "sfx")
