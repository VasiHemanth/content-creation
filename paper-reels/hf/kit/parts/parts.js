/* PARTS: reusable drawing pieces for HyperFrames scenes (hiker, walk cycle, flag, chip, press, gauge, card, peg, hand, footprints).
   Loads after kit/kit.js. Uses the global KIT (svgEl) and GSAP (hiker calls gsap.set). Styles are in parts.css (.part-*).
   Every helper is a pure function of its arguments: no clocks, no randomness, no copy. Labels arrive as arguments,
   so scenes still take all words from the storyboard (data-bind or KIT.data). Ids passed in are used as prefixes for
   the elements a helper creates, so give each scene its own prefix. */
window.PARTS = (() => {
  /** Blueprint colours as literal hex, because SVG attributes do not read CSS variables. They match the tokens in blueprint.css. */
  const C = { W: '#f2f8ff', PANEL: '#0a2340', AMB: '#ffb454', COR: '#ff6b6b', CY: '#a8dcf2', DIM: '#6aa9d0' };
  const { W, PANEL, AMB, COR, CY, DIM } = C;

  /** Query a selector, or pass an element through. */
  const $ = (s) => (typeof s === 'string' ? document.querySelector(s) : s);
  /** Create an SVG element (KIT.svgEl). Attributes set to null or undefined are skipped. */
  const svg = (tag, attrs, parent) => KIT.svgEl(tag, attrs, parent);
  /**
   * Create an HTML div and append it to parent.
   * cls: class name or null. id: element id. css: inline style text or null. parent: element or selector.
   * txt: text content (skipped when null or undefined). Returns the element.
   */
  const div = (cls, id, css, parent, txt) => {
    const e = document.createElement('div');
    if (cls) e.className = cls;
    e.id = id;
    if (css) e.style.cssText = css;
    if (txt != null) e.textContent = txt;
    $(parent).appendChild(e);
    return e;
  };
  /**
   * A stroked SVG path (round caps and joins). o: { c: colour, w: stroke width (default 3.4), id, dash: dasharray }.
   * Returns the path element.
   */
  const ln = (d, parent, o = {}) => svg('path', { d, fill: 'none', stroke: o.c || W, 'stroke-width': o.w || 3.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', id: o.id, 'stroke-dasharray': o.dash }, parent);

  /**
   * A hiker facing right, drawn in SVG inside host. Scale s = 1 is about 230 px tall.
   * Args: { id, x, y, s = 1, mag = false (holds a magnifier), pack = 1 (scales the backpack) }.
   * (x, y) is the ground point between the feet, in frame pixels.
   * Creates these ids (prefix = id): `${id}` (root group, move with x/y in local units = px / s), `${id}-body` (rotate for
   * a lean), `${id}-legF` and `${id}-legB` (use walk()), `${id}-pack`, `${id}-arm`.
   * Returns { pos, g, body, x, y, s, packTop, packBox }. The backpack top and box are in frame pixels, for labels.
   * GSAP: gsap.set sets the pack's svgOrigin at load. Animate the rest on the scene timeline (tl.to).
   */
  function hiker(host, { id, x, y, s = 1, mag = false, pack = 1 }) {
    const pos = svg('g', { transform: `translate(${x} ${y}) scale(${s})` }, host);
    const g = svg('g', { id }, pos), body = svg('g', { id: `${id}-body` }, g);
    const legB = svg('g', { id: `${id}-legB` }, body); ln('M2 -86 L-8 -42 L-14 0 L-1 0', legB, { c: DIM, w: 4.2 });
    const pk = svg('g', { id: `${id}-pack` }, body);
    svg('rect', { x: -66, y: -184, width: 56, height: 100, rx: 15, fill: PANEL, stroke: W, 'stroke-width': 3.6 }, pk);
    ln('M-66 -160 L-10 -160', pk, { w: 2.6 }); ln('M-50 -132 L-26 -132', pk, { c: DIM, w: 2.6 });
    ln('M-60 -84 L-62 -76 M-16 -84 L-14 -76', pk, { w: 2.6 });
    ln('M-10 -172 L4 -148', body, { c: AMB, w: 3 });
    ln('M2 -150 L-8 -116 L-4 -94', body, { c: DIM, w: 4 });
    ln('M2 -170 L2 -86', body, { w: 5 });
    const legF = svg('g', { id: `${id}-legF` }, body); ln('M2 -86 L14 -42 L12 0 L26 0', legF, { w: 4.4 });
    svg('circle', { cx: 6, cy: -194, r: 19, fill: PANEL, stroke: W, 'stroke-width': 3.6 }, body);
    ln('M-14 -200 Q6 -228 26 -201 L36 -199', body, { w: 3.4 });
    svg('circle', { cx: 15, cy: -196, r: 2.6, fill: W }, body);
    const arm = svg('g', { id: `${id}-arm` }, body);
    if (mag) { ln('M2 -150 L30 -122 L52 -110', arm, { w: 4.2 }); svg('circle', { cx: 64, cy: -98, r: 14, fill: 'rgba(168,220,242,.18)', stroke: AMB, 'stroke-width': 3.6 }, arm); ln('M54 -108 L50 -112', arm, { c: AMB, w: 4 }); }
    else ln('M2 -150 L18 -116 L26 -94', arm, { w: 4.2 });
    gsap.set(`#${id}-pack`, { scale: pack, svgOrigin: '-38 -84' });
    return { pos, g, body, x, y, s, packTop: [x - 38 * s, y - 184 * s * pack], packBox: [x - 66 * s, y - 184 * s * pack, 56 * s, 100 * s * pack] };
  }
  /**
   * Walk cycle for a hiker made by hiker(). Legs swing on keyframes with tl.to only, so several walks can follow each other.
   * Args: tl (scene timeline), id (the hiker's id), t0 (start time), dur (length of the walk in seconds), step (seconds per swing).
   * Animates `${id}-legF` and `${id}-legB`. Returns nothing.
   */
  function walk(tl, id, t0, dur, step = 0.26) {
    const n = Math.max(2, Math.round(dur / step)), kf = (sgn) => { const k = []; for (let i = 0; i < n; i++) k.push({ rotation: (i % 2 ? -1 : 1) * 20 * sgn, duration: dur / n, ease: 'sine.inOut' }); k.push({ rotation: 0, duration: 0.12 }); return k; };
    tl.to(`#${id}-legF`, { keyframes: kf(1), svgOrigin: '2 -86' }, t0);
    tl.to(`#${id}-legB`, { keyframes: kf(-1), svgOrigin: '2 -86' }, t0);
  }
  /**
   * A flag on the ground line at (x, y), pole height h, with a cloth in colour `color`.
   * Args: { id, x, y, h = 210, label (text, or null for no label), right = false (label anchored to the right edge),
   * color = amber, below = false (label under the ground line instead of above the cloth) }.
   * Creates `${id}` (group: pole and cloth), `${id}-cloth`, and `${id}-lab` (a .lbl div in parent, when label is set).
   * Animate with KIT.pop or KIT.rise on `#${id}`, or with tl.to. Returns { g, cloth, lab }.
   */
  function flag(host, parent, { id, x, y, h = 210, label, right = false, color = AMB, below = false }) {
    const g = svg('g', { id }, host);
    ln(`M${x} ${y} L${x} ${y - h}`, g, { w: 5 });
    const cloth = svg('path', { d: `M${x + 2} ${y - h} L${x + 74} ${y - h + 22} L${x + 2} ${y - h + 46} Z`, fill: color, stroke: color, 'stroke-width': 2, id: `${id}-cloth` }, g);
    const lab = label != null ? div('lbl white', `${id}-lab`, `top:${below ? y + 30 : y - h - 48}px;${right ? `right:${KIT.W - x - 6}px` : `left:${x - 6}px`};font-size:28px`, parent, label) : null;
    return { g, cloth, lab };
  }
  /**
   * A chip of carried text (a search term, a tool output, a log line). A dark box with a cyan border.
   * Args: parent (element or selector), id, txt (the chip text), x, y (frame pixels, top left).
   * Animate with KIT.pop or KIT.fade on `#${id}`. Add class "old" in the element for a faded chip (see .part-chip.old).
   * Returns the element.
   */
  const chip = (parent, id, txt, x, y) => div('part-chip', id, `left:${x}px;top:${y}px`, parent, txt);
  /**
   * A press: two rods and a plate with the label. The plate is the part that slams.
   * Args: parent, { id, x, y (the plate's line, frame pixels), w = 200 (width), label }.
   * Creates `${id}` (the frame, 120 px above y), `${id}-r1`, `${id}-r2` (rods), `${id}-plate`.
   * Slam with tl.to(`#${id}`, { y }) to move the whole press, or tl.to(`#${id}-plate`, ...) to move only the plate.
   * Returns the press element.
   */
  function press(parent, { id, x, y, w = 200, label }) {
    const p = div('part-press', id, `left:${x}px;top:${y - 120}px;width:${w}px`, parent);
    div('part-rod', `${id}-r1`, `left:${w * 0.25 - 5}px`, p); div('part-rod', `${id}-r2`, `left:${w * 0.75 - 5}px`, p);
    div('part-plate', `${id}-plate`, `width:${w}px`, p, label);
    return p;
  }
  /**
   * A vertical gauge: an outline, a fill that rises from the bottom, a red limit tick and two labels.
   * Args: parent, { id, x, y (top left, frame pixels), h = 300 (height), lim = 0.9 (limit as a fraction of h, from the bottom),
   * limitLabel (text by the tick, or null), valueLabel (text under the gauge, or null), fill = 0.5 (start fraction) }.
   * Creates `${id}` (outline), `${id}-fill` (the fill, grows with tl.to on scaleY), `${id}-tick` (the limit tick),
   * `${id}-lim` and `${id}-ctx` (labels). The fill's starting height is set at load with gsap.set.
   * Returns { g, f, tk }.
   * Values for fill and lim must come from the storyboard, never a literal: parseFloat(KIT.data('l01').value) / 100 when the value is a percent.
   */
  function gauge(parent, { id, x, y, h = 300, lim = 0.9, limitLabel, valueLabel, fill = 0.5 }) {
    const g = div('part-gauge', id, `left:${x}px;top:${y}px;height:${h}px`, parent);
    const f = div('part-gfill', `${id}-fill`, '', g);
    const tk = div('part-gtick', `${id}-tick`, `top:${(1 - lim) * h - 3}px`, g);
    div('lbl', `${id}-lim`, `left:${x - 96}px;top:${y + (1 - lim) * h - 20}px;font-size:28px;color:#ff9d9d`, parent, limitLabel);
    div('lbl', `${id}-ctx`, `left:${x - 40}px;top:${y + h + 12}px;font-size:28px`, parent, valueLabel);
    gsap.set(f, { scaleY: fill });
    return { g, f, tk };
  }
  /**
   * A paper index card: a header line and a list of rows. Rows start hidden only if the scene hides them (use KIT.rise or KIT.fade).
   * Args: parent, { id, x, y, w = 330, head (header text), rows (array of strings, one per row) }.
   * Creates `${id}` (the card), `${id}-h` (the header), `${id}-r0` ... `${id}-r{n-1}` (the rows).
   * Returns { c, rs } where rs is the array of row elements.
   */
  function card(parent, { id, x, y, w = 330, head, rows }) {
    const c = div('part-card', id, `left:${x}px;top:${y}px;width:${w}px`, parent);
    div('part-chead', `${id}-h`, '', c, head);
    const rs = rows.map((r, i) => div('part-crow', `${id}-r${i}`, '', c, r));
    return { c, rs };
  }
  /**
   * A peg: a stake in the ground with a tag on top. Use it to mark a point the press or a label refers to.
   * Args: parent, { id, x, y (the ground point, frame pixels), label (tag text) }.
   * Creates `${id}` (the peg), `${id}-s` (the stake), `${id}-t` (the tag, class .tag). Returns the peg element.
   */
  function peg(parent, { id, x, y, label }) {
    const p = div('part-peg', id, `left:${x - 12}px;top:${y - 120}px`, parent);
    div('part-stake', `${id}-s`, '', p); div('tag', `${id}-t`, 'left:-8px;top:-52px;font-size:26px;padding:4px 12px', p, label);
    return p;
  }
  /**
   * A hand pointing down, with a labelled cuff on the wrist. Drawn at 220 x 330 in SVG.
   * Args: parent, { id, x, y (top left, frame pixels), label (cuff text) }.
   * Creates `${id}` (the hand, a div) and `${id}-cuff` (the label). Animate the hand with tl.to or KIT.slam on `#${id}`.
   * Returns the hand element.
   */
  function hand(parent, { id, x, y, label }) {
    const h = div('part-hand', id, `left:${x}px;top:${y}px`, parent);
    const sv = KIT.svgEl('svg', { viewBox: '0 0 220 330', width: 220, height: 330, style: 'position:absolute;left:0;top:0;overflow:visible' }, h);
    svg('rect', { x: 34, y: 0, width: 150, height: 120, rx: 10, fill: PANEL, stroke: CY, 'stroke-width': 6 }, sv);
    svg('path', { d: 'M44 120 L44 210 C44 236 60 250 84 250 L150 250 C170 250 182 236 182 214 L182 120 Z', fill: PANEL, stroke: W, 'stroke-width': 6, 'stroke-linejoin': 'round' }, sv);
    [[52, 300], [86, 322], [120, 318], [152, 296]].forEach(([fx, fy]) => svg('path', { d: `M${fx} 236 L${fx} ${fy}`, stroke: W, 'stroke-width': 24, 'stroke-linecap': 'round' }, sv));
    [[52, 300], [86, 322], [120, 318], [152, 296]].forEach(([fx, fy]) => svg('path', { d: `M${fx} 238 L${fx} ${fy - 2}`, stroke: PANEL, 'stroke-width': 12, 'stroke-linecap': 'round' }, sv));
    svg('path', { d: 'M182 170 C214 180 220 214 206 236', fill: 'none', stroke: W, 'stroke-width': 18, 'stroke-linecap': 'round' }, sv);
    div('part-cuff', `${id}-cuff`, '', h, label);
    return h;
  }
  /**
   * A pair of footprints on the ground. Two ellipses, the second one to the right and below the first.
   * Args: host (SVG element or selector), id, x, y (the first print, frame pixels), c = dim colour (or amber for a highlighted trail).
   * Creates a group `${id}`. Fade it in with KIT.fade or KIT.pop. Returns the group.
   */
  const prints = (host, id, x, y, c = DIM) => { const g = svg('g', { id }, host); svg('ellipse', { cx: x, cy: y - 7, rx: 15, ry: 5.5, fill: c }, g); svg('ellipse', { cx: x + 22, cy: y + 5, rx: 15, ry: 5.5, fill: c }, g); return g; };

  return { C, $, svg, div, ln, hiker, walk, flag, chip, press, gauge, card, peg, hand, prints };
})();
