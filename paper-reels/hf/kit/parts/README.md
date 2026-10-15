# PARTS: shared drawing pieces

`parts.js` (global `PARTS`) and `parts.css` (`.part-*` rules) hold the drawing helpers that came out of the
autoCompact episode: hiker, walk cycle, flag, chip, press, gauge, index card, peg, hand, footprints.
Output is identical to the episode copy (checked against the inlined `AC` block under a stub DOM). Not wired yet.

## Using it in a scene

Each helper returns the element or ids it creates. Animate those ids on the scene's own timeline, as in
`hf/README.md` "Writing a scene". All labels arrive as arguments from `KIT.bind` or `KIT.data`.

    (function () {
      const c = (w, n) => KIT.cue('l01', w, n);       // scene time of a spoken word
      const d = KIT.data('l01');                      // storyboard values only, never literals
      const hk = PARTS.hiker('#trek-sv', { id: 'trek-hk', x: 520, y: 1330, s: 2.3, mag: true });
      const g = PARTS.gauge('#trek-cam', { id: 'trek-g', x: 250, y: 870, h: 300,
        lim: parseFloat(d.limitPct) / 100, limitLabel: d.limit, valueLabel: d.ctx, fill: 0 });
      PARTS.chip('#trek-cam', 'trek-log', d.log, 336, 834);
      const tl = gsap.timeline({ paused: true });
      PARTS.walk(tl, 'trek-hk', 0, c('step'));
      KIT.pop(tl, '#trek-log', c('log'));
      tl.to('#trek-g-fill', { scaleY: parseFloat(d.value) / 100, duration: 0.8, ease: 'power3.out' }, c('gauge'));
      window.__timelines['trek'] = tl;
    })();

`step`, `log` and `gauge` stand for spoken words in the storyboard line. `limitPct` is a placeholder field: the
storyboard line must carry the limit as a percent. Ids carry the scene prefix (`trek-*`), as the rules require.

## Helpers

| Helper | Creates (ids) | Animate with |
|---|---|---|
| `hiker(host, {id, x, y, s, mag, pack})` | `id`, `id-body`, `id-legF`, `id-legB`, `id-pack`, `id-arm` | tl.to on `#id`; `walk` for legs |
| `walk(tl, id, t0, dur, step)` | none | (it is the animation) |
| `flag(host, parent, {id, x, y, h, label, right, color, below})` | `id`, `id-cloth`, `id-lab` | KIT.pop or KIT.rise |
| `chip(parent, id, txt, x, y)` | `id` | KIT.pop or KIT.fade |
| `press(parent, {id, x, y, w, label})` | `id`, `id-r1`, `id-r2`, `id-plate` | tl.to on `#id` (slam) |
| `gauge(parent, {id, x, y, h, lim, limitLabel, valueLabel, fill})` | `id`, `id-fill`, `id-tick`, `id-lim`, `id-ctx` | tl.to on `#id-fill` (scaleY) |
| `card(parent, {id, x, y, w, head, rows})` | `id`, `id-h`, `id-r0`... | KIT.rise on the rows |
| `peg(parent, {id, x, y, label})` | `id`, `id-s`, `id-t` | KIT.pop |
| `hand(parent, {id, x, y, label})` | `id`, `id-cuff` | KIT.slam or tl.to on `#id` |
| `prints(host, id, x, y, c)` | `id` | KIT.fade |

Low-level: `svg`, `div`, `ln`, `$`, `C` (hex colours for SVG attributes).
Not moved: the `HERO` opening layout (`episodes/autoCompact/scenes/hero.js`), which is one episode's geometry.
Renamed from `AC`: `gauge` takes `limitLabel` and `valueLabel` (was `limitTxt`, `ctxTxt`).

## Wiring still needed (instructions only, nothing applied)

1. `hf/lib/project.mjs`, line 70: the root page inlines `kit/blueprint.css`. Read the parts stylesheet too:
   `const css = ['blueprint.css', 'parts/parts.css'].map((f) => fs.readFileSync(path.join(HF, 'kit', f), 'utf8')).join('\n');`
2. `hf/lib/project.mjs`, after line 94 (`<script src="kit/kit.js"></script>`): add
   `<script src="kit/parts/parts.js"></script>`. `copyDir` on line 30 already copies `hf/kit/parts/` into each project.
3. `hf/lib/thumb.mjs`: its page loads only GSAP, not kit.js. A thumbnail that uses PARTS also needs `kit/kit.js`,
   `kit/parts/parts.js`, and `parts/parts.css` in its css (line 16). Skip this unless a thumbnail uses PARTS.
4. Optional: add a `PARTS` row to the kit table in `hf/README.md` ("Writing a scene").
5. QA (`hf/bin/qa.mjs`, lines 37-50) reads scene HTML with scripts and styles stripped. It checks visible digits and
   words, and that each `data-bind` resolves. It cannot see PARTS labels, so labels must still come from `KIT.data`
   or `data-bind`, never typed in the script.
