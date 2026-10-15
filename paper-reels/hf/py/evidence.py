"""Crop real passages out of a paper PDF for on-screen "receipts".

usage: evidence.py job.json
job.json: { "pdf": path, "out_dir": path, "items": [ {
    "id": "recall", "page": 1,                        # 1-based page number
    "find": ["plausibly in pretraining", "..."],      # fragments to highlight, each found on that page. A phrase
                                                      # broken across lines must be given as separate fragments.
    "context": 1,                                     # whole text lines kept above and below the highlight, or [above, below]
    "scale": 4                                        # render scale (4 = 288 dpi)
} ] }
Writes <out_dir>/<id>.png and prints a JSON manifest on stdout:
  { "<id>": { "img", "w", "h", "page", "rects": [{x,y,w,h} fractions of the crop], "text": "<all text in the crop>" } }
The crop spans the text column and cuts in the gaps between lines, so no line is sliced. Fails if a fragment is
not found, so a typo never ships an empty highlight.
"""
import json
import os
import sys

import pypdfium2 as pdfium

job = json.load(open(sys.argv[1]))
pdf = pdfium.PdfDocument(job["pdf"])
os.makedirs(job["out_dir"], exist_ok=True)
out = {}


def pct(vals, p):
    vals = sorted(vals)
    return vals[min(len(vals) - 1, max(0, int(len(vals) * p)))]


for item in job["items"]:
    page = pdf[item["page"] - 1]
    pw, ph = page.get_size()
    tp = page.get_textpage()
    n = tp.count_chars()
    runs = [tp.get_rect(k) for k in range(tp.count_rects(0, n))]          # (left, bottom, right, top) per text run
    body = [r for r in runs if (r[2] - r[0]) > pw * 0.45 and (r[3] - r[1]) < 16]  # full-width body lines
    word_runs = not body
    if word_runs:   # word-level runs (Chrome print): merge runs into lines first, then pick the wide ones
        merged = []
        for r in sorted((r for r in runs if (r[3] - r[1]) < 20), key=lambda r: -r[3]):
            for L in merged:
                if abs((L[1] + L[3]) / 2 - (r[1] + r[3]) / 2) < 3.5:
                    L[0], L[1], L[2], L[3] = min(L[0], r[0]), min(L[1], r[1]), max(L[2], r[2]), max(L[3], r[3]); break
            else:
                merged.append(list(r))
        body = [L for L in merged if (L[2] - L[0]) > pw * 0.45 and (L[3] - L[1]) < 16]
    x0, x1 = pct([r[0] for r in body], 0.10), pct([r[2] for r in body], 0.90)
    # text lines in the column: merge runs that share a vertical band
    lines = []
    for r in sorted((r for r in runs if r[2] > x0 - 5 and r[0] < x1 + 5 and (r[3] - r[1]) < 20), key=lambda r: -r[3]):
        for L in lines:
            if abs((L[1] + L[3]) / 2 - (r[1] + r[3]) / 2) < 3.5:
                L[0], L[1], L[2], L[3] = min(L[0], r[0]), min(L[1], r[1]), max(L[2], r[2]), max(L[3], r[3])
                break
        else:
            lines.append(list(r))
    lines.sort(key=lambda L: -L[3])                                         # top of page first
    hits = []
    for frag in item["find"]:
        s = tp.search(frag, match_case=True, match_whole_word=False)
        r = s.get_next()
        if not r:
            sys.exit(f"evidence {item['id']}: fragment not found on page {item['page']}: {frag!r}")
        i, cnt = r
        hits += [tp.get_rect(k) for k in range(tp.count_rects(i, cnt))]
    if word_runs:   # one rect per glyph run: join the pieces of each text line into one highlight rect
        joined = []
        for h in hits:
            for J in joined:
                if abs((J[1] + J[3]) / 2 - (h[1] + h[3]) / 2) < 3.5:
                    J[0], J[1], J[2], J[3] = min(J[0], h[0]), min(J[1], h[1]), max(J[2], h[2]), max(J[3], h[3]); break
            else:
                joined.append(list(h))
        hits = [tuple(J) for J in joined]
    mid = lambda r: (r[1] + r[3]) / 2
    hit_lines = [k for k, L in enumerate(lines) if any(L[1] - 1 <= mid(h) <= L[3] + 1 for h in hits)]
    if not hit_lines:
        sys.exit(f"evidence {item['id']}: highlight is outside the text column")
    ctx = item.get("context", 1)
    above, below = (ctx, ctx) if isinstance(ctx, int) else (int(ctx[0]), int(ctx[1]))
    a, b = max(0, min(hit_lines) - above), min(len(lines) - 1, max(hit_lines) + below)
    gap = lambda upper, lower: (upper[1] + lower[3]) / 2                    # midway between two lines
    top = gap(lines[a - 1], lines[a]) if a > 0 else lines[a][3] + 6
    bottom = gap(lines[b], lines[b + 1]) if b + 1 < len(lines) else lines[b][1] - 6
    pad = 14
    left, right = max(0, x0 - pad), min(pw, x1 + pad)
    scale = float(item.get("scale", 4))
    img = page.render(scale=scale, crop=(left, bottom, pw - right, ph - top)).to_pil()
    path = os.path.join(job["out_dir"], f"{item['id']}.png")
    img.save(path)
    W, H = right - left, top - bottom
    rects = [{"x": (l - left) / W, "y": (top - t) / H, "w": (r - l) / W, "h": (t - bo) / H} for (l, bo, r, t) in hits]
    text = tp.get_text_bounded(left, bottom + 1, right, top - 1)
    # words to annotate (circled on screen): first match inside the crop
    marks = {}
    for word in item.get("circle", []):
        srch = tp.search(word, match_case=True, match_whole_word=True)
        while True:
            r = srch.get_next()
            if not r:
                sys.exit(f"evidence {item['id']}: circle word not found inside the crop: {word!r}")
            nr = tp.count_rects(r[0], r[1])
            box = tp.get_rect(0) if nr else None
            if box and word_runs:   # the word may span several glyph runs: take their union
                bs = [tp.get_rect(k) for k in range(nr)]
                box = (min(b[0] for b in bs), min(b[1] for b in bs), max(b[2] for b in bs), max(b[3] for b in bs))
            if box and box[1] >= bottom and box[3] <= top:
                (l, bo, rr, t) = box
                marks[word] = {"x": (l - left) / W, "y": (top - t) / H, "w": (rr - l) / W, "h": (t - bo) / H}
                break
    out[item["id"]] = {"img": path, "w": img.width, "h": img.height, "page": item["page"], "rects": rects, "text": text, "circles": marks}

print(json.dumps(out))
