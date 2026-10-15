#!/usr/bin/env python3
"""Build a viewer-facing kit for critics from a rendered episode.

usage: make_kit.py <episodeDir> <outDir>

Writes <outDir>/script.md (what a viewer hears and reads, line by line, with times) and
<outDir>/frames/<line>.png (three frames per line, taken from the finished MP4).
It copies nothing from the treatment, facts, wiki or paper, so a critic who reads only this kit
sees what a viewer sees.
"""
import json, os, re, subprocess, sys

ep, out = os.path.abspath(sys.argv[1]), os.path.abspath(sys.argv[2])
os.makedirs(os.path.join(out, 'frames'), exist_ok=True)
sb = json.load(open(os.path.join(ep, 'storyboard.json')))
raw = open(os.path.join(ep, 'out/hf/project/data.js')).read().strip()
EP = json.loads(re.sub(r'^window\.EP = ', '', raw).rstrip(';'))
video = os.path.join(ep, 'out/hf/final.mp4')

def tile(line_id, start, dur):
    ts = [start + dur * f for f in (0.12, 0.45, 0.8)]
    pngs = []
    for k, t in enumerate(ts):
        p = os.path.join(out, 'frames', f'_{line_id}_{k}.png')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{t:.3f}', '-i', video, '-frames:v', '1', '-vf', 'scale=360:640', p], check=True)
        pngs.append(p)
    dst = os.path.join(out, 'frames', f'{line_id}.png')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *sum([['-i', p] for p in pngs], []), '-filter_complex', '[0:v][1:v][2:v]hstack=inputs=3', '-frames:v', '1', dst], check=True)
    for p in pngs: os.remove(p)
    return ts

lines = ['# What the viewer gets', '',
         f'A vertical video of {EP["total"]:.1f} s. A synthetic voice reads the narration below; the same words appear as captions at the bottom of the screen.',
         'Besides the captions, the video shows the on-screen text listed for each line, drawings, and (where noted) a real crop of a page of the paper with the spoken words highlighted.',
         'The three frames of each line are in `frames/<line>.png` (left to right: early, middle, late in the line). You cannot hear the voice, but the narration text is exact.', '']
for l in sb['lines']:
    e = EP['lines'][l['id']]
    ts = tile(l['id'], e['start'], e['dur'])
    d = {k: v for k, v in (l.get('data') or {}).items() if not k.startswith('_')}
    shown = [str(v) for k, v in d.items() if k != 'receipt']
    lines += [f'## {l["id"]}  ({e["start"]:.1f} s to {e["start"] + e["dur"]:.1f} s)', '',
              f'Narration: "{l["text"]}"', '']
    if shown: lines += ['On-screen text (besides captions): ' + ' | '.join(shown), '']
    if 'receipt' in d: lines += [f'A real page of the paper is shown with the spoken words highlighted (label: "{d["receipt"]}").', '']
    lines += [f'Frames: frames/{l["id"]}.png', '']
open(os.path.join(out, 'script.md'), 'w').write('\n'.join(lines))
print('kit written:', out, len(sb['lines']), 'lines')
