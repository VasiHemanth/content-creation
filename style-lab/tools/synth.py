"""Tiny deterministic synth: seeded numpy only. Used for music beds and style SFX."""
import numpy as np, soundfile as sf, json, os
SR = 44100
def rng(seed): return np.random.RandomState(seed & 0x7fffffff)
def env(n, a=0.005, d=0.1, curve=3.0):
    t = np.arange(n) / SR
    e = np.minimum(t / max(a, 1e-4), 1.0) * np.exp(-t / max(d, 1e-4) * curve / 3)
    return e
def lp(x, fc):                       # one-pole lowpass (two passes)
    a = np.exp(-2 * np.pi * fc / SR); y = np.zeros_like(x); s = 0.0
    for i in range(len(x)): s = (1 - a) * x[i] + a * s; y[i] = s
    return y
def lp2(x, fc): return lp(lp(x, fc), fc)
def hp(x, fc): return x - lp(x, fc)
def bp(x, lo, hi): return lp2(hp(x, lo), hi)
def noise(n, seed): return rng(seed).uniform(-1, 1, n)
def sine(f, n, ph=0): return np.sin(2 * np.pi * f * np.arange(n) / SR + ph)
def sweep(f0, f1, n):
    f = np.linspace(f0, f1, n); return np.sin(2 * np.pi * np.cumsum(f) / SR)
def norm(x, peak=0.9): m = np.abs(x).max(); return x / m * peak if m > 0 else x
def write(path, x): os.makedirs(os.path.dirname(path), exist_ok=True); sf.write(path, norm(x).astype(np.float32), SR)
def pluck(f, dur, seed, bright=1.0, dec=0.35):
    n = int(dur * SR); t = np.arange(n) / SR
    y = sum(a * np.sin(2 * np.pi * f * k * t) * np.exp(-t * (k * 5 / dec / 3)) for k, a in [(1, 1), (2, .4 * bright), (3, .18 * bright), (4, .08 * bright)])
    return y * np.minimum(t / 0.004, 1.0)
def mixin(buf, x, t, gain=1.0):
    i = int(t * SR); j = min(len(buf), i + len(x))
    if i < len(buf) and i >= 0: buf[i:j] += x[:j - i] * gain
def duration(path):
    d, sr = sf.read(path); return len(d) / sr
