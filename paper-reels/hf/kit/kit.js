/* KIT: helpers shared by every HyperFrames scene in paper-reels.
   Loaded by the root page after data.js (window.EP) and GSAP. Scenes are plain sub-compositions that call
   these helpers on their own paused timeline. Everything here is a pure function of timeline time: no clocks,
   no unseeded randomness, no network. */
(function () {
  const EP = window.EP;
  const W = 1080, H = 1920;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const norm = (w) => String(w).toLowerCase().replace(/[^a-z0-9]/g, '');
  const rng = (seed) => { let a = (seed >>> 0) || 1; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };

  // ---- words and cues -------------------------------------------------------------------------------------
  // Cue times are seconds from the START OF THE SCENE (local time 0 of the scene's timeline). A scene may hold
  // several lines; line.t0 is where a line starts inside its scene, and its voice begins line.lead later.
  const line = (id) => { const l = EP.lines[id]; if (!l) throw new Error(`KIT: no line "${id}"`); return l; };
  function find(id, spec, nth) {
    const l = line(id), key = norm(spec); let k = nth || 0;
    for (const w of l.words) if (norm(w.w) === key && k-- === 0) return w;
    throw new Error(`KIT.cue: word "${spec}" (#${nth || 0}) is not in the spoken text of line ${id}: ${l.words.map((w) => w.w).join(' ')}`);
  }
  /** Start of a spoken word; or seconds into the line (number); "@0.4" = 40% through the line; "end"; "end-1.2". */
  function cue(id, spec, nth) {
    const l = line(id);
    if (typeof spec === 'number') return l.t0 + spec;
    if (spec[0] === '@') return l.t0 + l.dur * parseFloat(spec.slice(1));
    if (spec === 'end') return l.t0 + l.dur;
    if (/^end-/.test(spec)) return l.t0 + l.dur - parseFloat(spec.slice(4));
    return l.t0 + l.lead + find(id, spec, nth).a;
  }
  /** End of a spoken word. */
  const cueEnd = (id, spec, nth) => line(id).t0 + line(id).lead + find(id, spec, nth).b;
  const data = (id) => line(id).data;
  const sceneDur = (name) => EP.scenes[name].dur;
  /** Fill every [data-bind="l03.title"] inside scope with that storyboard value (all copy comes from the storyboard). */
  function bind(scope) {
    const host = typeof scope === 'string' ? document.querySelector(scope) : scope;
    for (const el of host.querySelectorAll('[data-bind]')) {
      const [id, ...p] = el.dataset.bind.split('.'); let v = line(id).data;
      for (const k of p) { v = v == null ? v : v[k]; }
      if (v == null) throw new Error(`KIT.bind: ${el.dataset.bind} is not in the storyboard`);
      if (el.hasAttribute('data-to')) el.dataset.to = String(v); el.textContent = String(v);
    }
  }

  // ---- entrances and effects (all take the scene timeline first) ----------------------------------------
  const asEls = (sel, root) => (typeof sel === 'string' ? Array.from((root || document).querySelectorAll(sel)) : sel instanceof Element ? [sel] : Array.from(sel));
  function pop(tl, sel, t, o = {}) {
    tl.fromTo(sel, { scale: o.from ?? 0.35, opacity: 0, transformOrigin: o.origin || '50% 50%' }, { scale: 1, opacity: 1, duration: o.dur ?? 0.42, ease: o.ease || 'back.out(2.4)' }, t);
  }
  function rise(tl, sel, t, o = {}) {
    tl.fromTo(sel, { y: o.y ?? 60, x: o.x ?? 0, opacity: 0 }, { y: 0, x: 0, opacity: 1, duration: o.dur ?? 0.5, ease: o.ease || 'power3.out', stagger: o.stagger || 0 }, t);
  }
  function fade(tl, sel, t, o = {}) { tl.fromTo(sel, { opacity: 0 }, { opacity: o.to ?? 1, duration: o.dur ?? 0.3, ease: o.ease || 'power1.out', stagger: o.stagger || 0 }, t); }
  /** Big drop onto the page with a hit shake. Returns the impact time. */
  function slam(tl, sel, t, o = {}) {
    const d = o.dur ?? 0.2;
    tl.fromTo(sel, { scale: o.from ?? 2.6, opacity: 0, transformOrigin: o.origin || '50% 50%' }, { scale: 1, opacity: 1, duration: d, ease: 'power4.in' }, t);
    if (o.shake !== false) shake(tl, o.shakeTarget || '#root', t + d, { amp: o.amp ?? 16, dur: 0.32 });
    return t + d;
  }
  /** Deterministic decaying shake (x, y, a little rotation). */
  function shake(tl, sel, t, o = {}) {
    const amp = o.amp ?? 14, dur = o.dur ?? 0.3, n = Math.max(4, Math.round(dur * 30)), r = rng(Math.round(t * 1000) + 7), kx = [], ky = [], kr = [];
    for (let i = 0; i < n; i++) { const k = (1 - i / n) ** 1.5; kx.push({ x: (r() * 2 - 1) * amp * k, y: (r() * 2 - 1) * amp * k, rotation: (r() * 2 - 1) * amp * 0.04 * k, duration: dur / n, ease: 'none' }); }
    kx.push({ x: 0, y: 0, rotation: 0, duration: dur / n, ease: 'none' });
    tl.to(sel, { keyframes: kx }, t);
  }
  /** Draw a stroke on. Dashed paths (class "dash") are revealed with a clip wipe so the dashes survive; o.frac (0..1)
   *  stops a dashed reveal part way. Use this once per element: animate later changes with tl.to. */
  function draw(tl, sel, t, dur = 0.8, o = {}) {
    const els = asEls(sel), ease = o.ease || 'power2.inOut';
    const dashed = els.filter((e) => e.classList && e.classList.contains('dash')), solid = els.filter((e) => !dashed.includes(e));
    if (solid.length) tl.fromTo(solid, { drawSVG: o.from || '0%' }, { drawSVG: o.to || '100%', duration: dur, ease, stagger: o.stagger || 0 }, t);
    for (const e of dashed) {
      const b = e.getBBox(), vert = b.height > b.width, rest = `${Math.round((1 - (o.frac ?? 1)) * 100)}%`;
      tl.fromTo(e, { clipPath: vert ? 'inset(0% 0% 100% 0%)' : 'inset(0% 100% 0% 0%)' }, { clipPath: vert ? `inset(0% 0% ${rest} 0%)` : `inset(0% ${rest} 0% 0%)`, duration: dur, ease }, t);
    }
  }
  /** Left-to-right reveal with clip-path. */
  function wipe(tl, sel, t, dur = 0.5, o = {}) {
    const dir = o.dir || 'left'; const from = { left: 'inset(0 100% 0 0)', right: 'inset(0 0 0 100%)', up: 'inset(100% 0 0 0)', down: 'inset(0 0 100% 0)' }[dir];
    tl.fromTo(sel, { clipPath: from }, { clipPath: 'inset(0 0 0 0)', duration: dur, ease: o.ease || 'power3.out' }, t);
  }
  /** Count a number up from 0. The element's data-to holds the final string ("74%", "32.4%"); the last frame shows it exactly. */
  function count(tl, sel, t, dur = 1.0, o = {}) {
    for (const el of asEls(sel)) {
      const s = el.dataset.to ?? el.textContent, m = String(s).match(/^([^\d]*?)(\d+(?:\.\d+)?)(.*)$/);
      if (!m) continue;
      const pre = m[1], num = +m[2], dec = (m[2].split('.')[1] || '').length, suf = m[3], st = { v: 0 };
      el.textContent = `${pre}${(0).toFixed(dec)}${suf}`;
      tl.to(st, { v: num, duration: dur, ease: o.ease || 'power3.out', onUpdate() { el.textContent = st.v >= num - 1e-9 ? s : `${pre}${st.v.toFixed(dec)}${suf}`; } }, t);
    }
  }
  /** Characters appear at cps characters per second (opacity steps, no layout shift). */
  function typeOn(tl, sel, t, cps = 28) {
    for (const el of asEls(sel)) {
      const sp = SplitText.create(el, { type: 'chars' }), n = sp.chars.length;
      tl.fromTo(sp.chars, { opacity: 0 }, { opacity: 1, duration: 0.01, stagger: 1 / cps }, t);
      el.__typeEnd = t + n / cps;
    }
  }
  /** Marker highlight sweeping across an overlay element (scaleX 0 -> 1). */
  function sweep(tl, sel, t, dur = 0.5, o = {}) { tl.fromTo(sel, { scaleX: 0, opacity: 1 }, { scaleX: 1, duration: dur, ease: o.ease || 'power2.out' }, t); }
  /** Small amber crosses bursting from a point, deterministic. */
  function sparks(tl, parent, x, y, t, o = {}) {
    const n = o.n ?? 10, R = o.r ?? 240, col = o.color || '#ffb454', r = rng(Math.round(x * 31 + y * 17 + t * 1000)), host = typeof parent === 'string' ? document.querySelector(parent) : parent;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + r() * 0.5, d = R * (0.55 + 0.45 * r()), el = document.createElement('div');
      el.style.cssText = `position:absolute;left:${x - 14}px;top:${y - 14}px;width:28px;height:28px;opacity:0;pointer-events:none;background:linear-gradient(${col},${col}) center/100% 4px no-repeat,linear-gradient(${col},${col}) center/4px 100% no-repeat`;
      host.appendChild(el);
      // a fromTo renders its start state at load, so the start state stays invisible; the spark appears at t
      tl.fromTo(el, { x: 0, y: 0, scale: 0.4, opacity: 0, rotation: 0 }, { opacity: 1, duration: 0.01, ease: 'none' }, t);
      tl.to(el, { x: Math.cos(a) * d, y: Math.sin(a) * d, scale: 1.1, opacity: 0, rotation: 90 * (r() - 0.5), duration: o.dur ?? 0.8, ease: 'power3.out' }, t + 0.01);
    }
  }
  /** Camera: animate a world wrapper so that point (px, py) sits at the frame centre at scale s.
   *  floor (optional): world y of the lowest actor on the board at t. The camera then keeps that actor above the caption
   *  band (screen y 1490, less `margin` for small camera beats); if the wanted shot sits too high for that, it zooms out
   *  until the target and the floor both fit. Learned on scionV3: without it, zooms push boxes behind the captions and
   *  the layout audit does not catch boxes, only text. */
  function focus(tl, world, t, { px = W / 2, py = H / 2, s = 1, r = 0, dur = 1, ease = 'power3.inOut', floor = null, margin = 60 } = {}) {
    if (floor != null) {
      const room = 1490 - margin - H / 2;            // screen px allowed below the frame centre
      if (py < floor - room / s) s = Math.min(s, (2 * room + 40) / (floor - py));   // target may sit ~510 px above centre
      py = Math.max(py, floor - room / s);
    }
    tl.to(world, { x: s * (W / 2 - px), y: s * (H / 2 - py), scale: s, rotation: r, duration: dur, ease, transformOrigin: '50% 50%' }, t);
  }
  /** Slow constant drift (a camera that never quite sits still). */
  function drift(tl, sel, t, dur, { x = 0, y = 0, s = 1, r = 0, ease = 'none' } = {}) { tl.to(sel, { x, y, scale: s, rotation: r, duration: dur, ease }, t); }
  /** RGB-split glitch on text for a moment. */
  function glitch(tl, sel, t, o = {}) {
    const a = o.amp ?? 8, d = o.dur ?? 0.28, r = rng(Math.round(t * 977) + 3), keys = [];
    for (let i = 0; i < 7; i++) { const k = (r() * 2 - 1) * a; keys.push({ x: k * 0.6, skewX: (r() * 2 - 1) * 8, textShadow: `${k}px 0 #ff3b6b, ${-k}px 0 #38e1ff`, duration: d / 8, ease: 'none' }); }
    keys.push({ x: 0, skewX: 0, textShadow: '0 0 0 transparent, 0 0 0 transparent', duration: d / 8, ease: 'none' });
    tl.to(sel, { keyframes: keys }, t);
  }
  /** A bar or fill growing from the left (scaleX with a left origin). The element must be display:block with a real width. */
  function grow(tl, sel, t, dur = 0.8, o = {}) { tl.fromTo(sel, { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: o.to ?? 1, duration: dur, ease: o.ease || 'power3.out' }, t); }
  /** Breathing for a decorative element, finite so it renders deterministically. */
  function breathe(tl, sel, dur, { s = 1.06, period = 3.2 } = {}) {
    const n = Math.max(1, Math.floor(dur / period));
    tl.fromTo(sel, { scale: 1 }, { scale: s, duration: period / 2, ease: 'sine.inOut', yoyo: true, repeat: n * 2 - 1 }, 0);
  }

  // ---- paper evidence -------------------------------------------------------------------------------------
  /** Build a page of the paper (real pixels) with highlight rectangles from the evidence manifest. */
  function paper(parent, id, { width = 760, x = 0, y = 0, z = '' } = {}) {
    const ev = EP.evidence && EP.evidence[id]; if (!ev) throw new Error(`KIT.paper: no evidence "${id}"`);
    const host = typeof parent === 'string' ? document.querySelector(parent) : parent, h = width * ev.h / ev.w;
    const el = document.createElement('div'); el.className = 'paper'; el.id = `${host.id || 'ev'}-${id}`;
    el.style.cssText = `left:${x}px;top:${y}px;width:${width}px;height:${h}px;${z}`;
    el.innerHTML = `<img src="${ev.img}" alt="">`;
    const hls = ev.rects.map((r) => { const d = document.createElement('div'); d.className = 'hl'; d.style.cssText = `left:${r.x * width}px;top:${r.y * h}px;width:${r.w * width}px;height:${r.h * h}px;transform:scaleX(0)`; el.appendChild(d); return d; });
    host.appendChild(el);
    const u = ev.rects.reduce((a, r) => ({ x0: Math.min(a.x0, r.x), y0: Math.min(a.y0, r.y), x1: Math.max(a.x1, r.x + r.w), y1: Math.max(a.y1, r.y + r.h) }), { x0: 1, y0: 1, x1: 0, y1: 0 });
    return { el, hls, width, height: h, box: { x: u.x0 * width, y: u.y0 * h, w: (u.x1 - u.x0) * width, h: (u.y1 - u.y0) * h }, ev };
  }

  /**
   * A paper receipt: the page crop rises in on a 3D tilt with its source tag, then the marker sweeps over each
   * highlighted line in order. Returns { el, end } where end is when the last sweep finishes.
   * o: { x, y, width, label, at (sweep start, defaults to t + 0.55), sweep (seconds for all lines), tilt, from }
   */
  function receipt(tl, parent, id, t, o = {}) {
    const width = o.width ?? 940, p = paper(parent, id, { width, x: o.x ?? (W - width) / 2, y: o.y ?? 900 });
    p.el.style.transformOrigin = '50% 100%';
    const tilt = o.tilt ?? -2;
    tl.fromTo(p.el, { y: o.from ?? 420, rotationX: 38, rotationZ: tilt - 6, opacity: 0, scale: 0.92 },
      { y: 0, rotationX: 0, rotationZ: tilt, opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' }, t);
    let tag = null;
    if (o.label) {
      tag = document.createElement('div'); tag.className = 'receipt-tag'; tag.id = `${p.el.id}-tag`; tag.textContent = o.label;
      tag.style.left = `${(o.x ?? (W - width) / 2) - 6}px`; tag.style.top = `${(o.y ?? 900) - 58}px`;
      p.el.parentNode.appendChild(tag);
      tl.fromTo(tag, { x: -40, opacity: 0, rotation: -4 }, { x: 0, opacity: 1, rotation: tilt, duration: 0.35, ease: 'back.out(2)' }, t + 0.25);
    }
    const at = o.at ?? t + 0.55, total = o.sweep ?? 0.9;
    const tw = p.hls.reduce((a, el, k) => a + p.ev.rects[k].w, 0) || 1;
    let s = at;
    p.hls.forEach((el, k) => { const d = total * p.ev.rects[k].w / tw; tl.fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: d, ease: 'none' }, s); s += d; });
    return { ...p, tag, end: s };
  }

  /** A hand-drawn pen loop around one word of a paper crop (the word is located by evidence.py "circle"). */
  function circle(tl, p, word, t, c = {}) {
    const m = p.ev.circles && p.ev.circles[word]; if (!m) throw new Error(`KIT.circle: no circle "${word}" in evidence ${p.el.id}`);
    const W0 = p.width, pad = 0.012, cx = (m.x + m.w / 2) * W0, cy = (m.y + m.h / 2) * p.height, rx = (m.w / 2 + pad) * W0 + 4, ry = (m.h / 2) * p.height + 7;
    const NS = 'http://www.w3.org/2000/svg', sv = document.createElementNS(NS, 'svg');
    sv.setAttribute('class', 'ink'); sv.setAttribute('style', `left:0;top:0;width:${W0}px;height:${p.height}px;overflow:visible`);
    sv.setAttribute('viewBox', `0 0 ${W0} ${p.height}`);
    const e = document.createElementNS(NS, 'path'); e.setAttribute('id', `${p.el.id}-circle-${norm(word)}`);
    const pts = []; for (let i = 0; i <= 44; i++) { const a = -2.2 + (i / 40) * Math.PI * 2, w = 1 + 0.06 * Math.sin(i * 1.7); pts.push(`${(cx + Math.cos(a) * rx * w).toFixed(1)} ${(cy + Math.sin(a) * ry * w).toFixed(1)}`); }
    e.setAttribute('d', `M${pts.join(' L')}`); e.setAttribute('fill', 'none'); e.setAttribute('stroke', c.color || '#e8473f');
    e.setAttribute('stroke-width', c.width || 3.4); e.setAttribute('stroke-linecap', 'round'); e.setAttribute('stroke-linejoin', 'round');
    sv.appendChild(e); p.el.appendChild(sv);
    tl.fromTo(e, { drawSVG: '0%' }, { drawSVG: '100%', duration: c.dur ?? 0.38, ease: 'power2.inOut' }, t);
    return e;
  }

  /**
   * Read a passage of the paper on camera: the page strip rises in at reading distance, then the camera dives in and
   * follows the highlighter along each marked line, so the words are big enough to read on a phone.
   * o: { cam: selector of a wrapper (transform-origin 0 0) that holds `parent`; parent: where the page goes;
   *      hud: element outside the camera for the source tag (stays put while the camera moves);
   *      id: evidence id; t: enter time; label: tag text; x, y, width: page box at zoom 1;
   *      zoom; fx, fy: frame point where the marker tip is held;
   *      marks: one entry per highlighted rect: [t0, t1] or [t0, t1, [[t, f], ...]] where f (0..1) is how far along
   *      the rect the marker is at time t (pins the marker to the voice); without marks, rects are swept one after
   *      another at `speed` px/s (zoomed);
   *      circles: [{ word, t }] draw a pen ellipse around that word (located by evidence.py) at time t;
   *      follow: 0..1, how far the camera pans with the marker along each rect (default 1 = keep the marker tip at fx).
   *      With 0 the camera holds the start of each rect at fx, so the first highlighted word stays in frame; pick
   *      a zoom that fits the whole rect (rect.w * width * zoom) between fx and the right edge. }
   * Returns { el, end }.
   */
  function read(tl, o) {
    const W0 = o.width ?? 1000, X = o.x ?? 40, Y = o.y ?? 760, s = o.zoom ?? 3.4, fx = o.fx ?? 640, fy = o.fy ?? 860, follow = o.follow ?? 1;
    const p = paper(o.parent, o.id, { width: W0, x: X, y: Y });
    p.el.style.transformOrigin = '50% 100%';
    tl.fromTo(p.el, { y: 420, rotationX: 42, rotationZ: -7, opacity: 0, scale: 0.9 }, { y: 0, rotationX: 0, rotationZ: -1.5, opacity: 1, scale: 1, duration: 0.55, ease: 'power3.out' }, o.t);
    if (o.label) {
      const tag = document.createElement('div'); tag.className = 'receipt-tag'; tag.id = `${p.el.id}-tag`; tag.textContent = o.label;
      const host = o.hud ? (typeof o.hud === 'string' ? document.querySelector(o.hud) : o.hud) : p.el.parentNode;
      tag.style.left = `${o.hud ? 60 : X - 4}px`; tag.style.top = `${o.hud ? (o.tagY ?? 330) : Y - 60}px`; host.appendChild(tag);
      tl.fromTo(tag, { x: -60, opacity: 0, rotation: -5 }, { x: 0, opacity: 1, rotation: -1.5, duration: 0.35, ease: 'back.out(2)' }, o.t + 0.2);
    }
    const rects = p.ev.rects.map((r) => ({ x0: X + r.x * W0, x1: X + (r.x + r.w) * W0, y: Y + (r.y + r.h / 2) * p.height }));
    const cam = (px, py) => ({ x: Math.max(1030 - s * (X + W0), Math.min(50 - s * X, fx - s * px)), y: fy - s * py });
    let marks = o.marks;
    if (!marks) {
      let t = o.t + (o.establish ?? 0.85); marks = [];
      for (const r of rects) { const d = ((r.x1 - r.x0) * s) / (o.speed ?? 1000); marks.push([t, t + d]); t += d + 0.16; }
    }
    if (marks.length !== rects.length) throw new Error(`KIT.read ${o.id}: ${marks.length} marks for ${rects.length} highlighted rects`);
    const c0 = cam(rects[0].x0, rects[0].y), dive = Math.min(0.45, Math.max(0.2, marks[0][0] - o.t - 0.3));
    tl.to(o.cam, { ...c0, scale: s, duration: dive, ease: 'power3.inOut' }, marks[0][0] - dive);
    tl.to(p.el, { rotationZ: 0, duration: dive, ease: 'power2.inOut' }, marks[0][0] - dive);
    rects.forEach((r, k) => {
      const [a, b, anchors] = marks[k], from = cam(r.x0, r.y);
      if (k > 0) tl.to(o.cam, { ...from, duration: Math.min(0.18, Math.max(0.06, a - marks[k - 1][1])), ease: 'power2.inOut' }, Math.max(marks[k - 1][1], a - 0.18));
      const pts = [[a, 0], ...(anchors || []).filter(([t]) => t > a && t < b).sort((u, v) => u[0] - v[0]), [b, 1]];
      tl.set(p.hls[k], { scaleX: 0 }, a);
      for (let i = 1; i < pts.length; i++) {
        const [ta, fa] = pts[i - 1], [tb, fb] = pts[i], d = Math.max(0.01, tb - ta);
        tl.fromTo(p.hls[k], { scaleX: fa }, { scaleX: fb, duration: d, ease: 'none', immediateRender: false }, ta);
        tl.fromTo(o.cam, { ...cam(r.x0 + follow * fa * (r.x1 - r.x0), r.y) }, { ...cam(r.x0 + follow * fb * (r.x1 - r.x0), r.y), duration: d, ease: 'none', immediateRender: false }, ta);
      }
    });
    for (const c of o.circles || []) circle(tl, p, c.word, c.t, c);
    return { ...p, end: marks[marks.length - 1][1] };
  }

  /**
   * Camera beats: a quick push or reframe on each time in `times` (spoken-word cues), so the frame changes when the
   * voice lands a point. Use a wrapper of its own (scale, x, y), so beats never fight the scene camera or a shake.
   * `reset` returns the wrapper to rest at that time.
   */
  function beats(tl, sel, times, { amp = 0.035, shift = 26, dur = 0.3, reset = null } = {}) {
    times.filter((t) => t != null).sort((p, q) => p - q).forEach((t, k) => {
      const sc = 1 + amp * (1 + (k % 3) * 0.6), x = (k % 2 ? 1 : -1) * shift, y = (k % 2 ? -1 : 1) * shift * 0.6;
      tl.to(sel, { scale: sc, x, y, duration: dur, ease: 'power3.out' }, t);
    });
    if (reset != null) tl.to(sel, { scale: 1, x: 0, y: 0, duration: 0.3, ease: 'power3.inOut' }, reset);
  }

  // ---- drawings ------------------------------------------------------------------------------------------
  const SVGNS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs, parent) {
    const e = document.createElementNS(SVGNS, tag); for (const k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    if (parent) (typeof parent === 'string' ? document.querySelector(parent) : parent).appendChild(e); return e;
  }
  /**
   * A layered discovery tree in an existing <svg>. levels: node count per level after the root, e.g. [3, 5, 7].
   * Each node gets a parent on the level above, a seeded score in 0..1, and an id prefix. Returns
   * { root, nodes: [{ el, x, y, level, parent, score, edge }], byLevel }. Positions are pure functions of the seed.
   */
  function tree(svg, { id = 'tr', x = 540, y = 200, w = 860, dy = 150, levels = [3, 5, 7], seed = 1, r = 16, dir = 1,
    edgeClass = 'ln cyan', nodeFill = '#f2f8ff', rootFill = '#ffb454' } = {}) {
    const host = typeof svg === 'string' ? document.querySelector(svg) : svg, rnd = rng(seed);
    const gE = svgEl('g', { id: `${id}-edges` }, host), gN = svgEl('g', { id: `${id}-nodes` }, host);
    const root = { x, y, level: 0, el: svgEl('circle', { cx: x, cy: y, r: r * 1.35, fill: rootFill, id: `${id}-root` }, gN) };
    const nodes = [], byLevel = [[root]];
    levels.forEach((n, li) => {
      const prev = byLevel[li], row = [];
      for (let k = 0; k < n; k++) {
        const nx = x - w / 2 + (w * (k + 0.5)) / n + (rnd() - 0.5) * (w / n) * 0.35, ny = y + dir * dy * (li + 1) + (rnd() - 0.5) * dy * 0.25;
        const parent = prev[Math.min(prev.length - 1, Math.floor((k / n) * prev.length + (rnd() - 0.5) * 0.6))] || prev[0];
        const my = (parent.y + ny) / 2;
        const edge = svgEl('path', { d: `M${parent.x.toFixed(1)} ${parent.y.toFixed(1)} C ${parent.x.toFixed(1)} ${my.toFixed(1)}, ${nx.toFixed(1)} ${my.toFixed(1)}, ${nx.toFixed(1)} ${ny.toFixed(1)}`, class: edgeClass, id: `${id}-e${li}-${k}` }, gE);
        const score = rnd();
        const el = svgEl('circle', { cx: nx.toFixed(1), cy: ny.toFixed(1), r, fill: nodeFill, id: `${id}-n${li}-${k}` }, gN);
        const node = { el, edge, x: nx, y: ny, level: li + 1, parent, score }; row.push(node); nodes.push(node);
      }
      byLevel.push(row);
    });
    return { root, nodes, byLevel, edges: gE, group: gN };
  }
  /** A blueprint robot drawn into an <svg> at (x, y) = top centre of the head. Returns its parts for animation. */
  function robot(svg, { id = 'bot', x = 540, y = 1000, s = 1, asleep = false, stroke = '#f2f8ff', eye = '#ffb454' } = {}) {
    const host = typeof svg === 'string' ? document.querySelector(svg) : svg, g = svgEl('g', { id }, host);
    const S = (v) => (v * s).toFixed(1), X = (v) => (x + v * s).toFixed(1), Y = (v) => (y + v * s).toFixed(1);
    svgEl('path', { d: `M${X(0)} ${Y(0)} L${X(0)} ${Y(-34)}`, stroke, 'stroke-width': S(6), 'stroke-linecap': 'round' }, g);
    const ant = svgEl('circle', { cx: X(0), cy: Y(-44), r: S(11), fill: eye, id: `${id}-ant` }, g);
    svgEl('rect', { x: X(-90), y: Y(0), width: S(180), height: S(132), rx: S(26), fill: '#0a2340', stroke, 'stroke-width': S(7) }, g);
    const eyes = asleep
      ? [svgEl('path', { d: `M${X(-58)} ${Y(62)} Q ${X(-38)} ${Y(80)} ${X(-18)} ${Y(62)}`, fill: 'none', stroke: eye, 'stroke-width': S(8), 'stroke-linecap': 'round', id: `${id}-eyeL` }, g),
         svgEl('path', { d: `M${X(18)} ${Y(62)} Q ${X(38)} ${Y(80)} ${X(58)} ${Y(62)}`, fill: 'none', stroke: eye, 'stroke-width': S(8), 'stroke-linecap': 'round', id: `${id}-eyeR` }, g)]
      : [svgEl('circle', { cx: X(-38), cy: Y(62), r: S(16), fill: eye, id: `${id}-eyeL` }, g), svgEl('circle', { cx: X(38), cy: Y(62), r: S(16), fill: eye, id: `${id}-eyeR` }, g)];
    svgEl('path', { d: `M${X(-34)} ${Y(104)} L${X(34)} ${Y(104)}`, stroke: '#a8dcf2', 'stroke-width': S(6), 'stroke-linecap': 'round' }, g);
    svgEl('rect', { x: X(-70), y: Y(146), width: S(140), height: S(120), rx: S(18), fill: '#0a2340', stroke, 'stroke-width': S(6) }, g);
    return { g, eyes, ant };
  }

  // ---- scene transitions (root timeline). The outgoing scene holds its last frame for `d` seconds past T. ----
  const TRANSITIONS = {
    cut() {},
    whip(tl, o, i, T, d) {
      tl.fromTo(o, { x: 0, filter: 'blur(0px)' }, { x: -W, filter: 'blur(16px)', duration: d, ease: 'power3.in' }, T);
      tl.fromTo(i, { x: W, filter: 'blur(16px)' }, { x: 0, filter: 'blur(0px)', duration: d, ease: 'power3.out' }, T);
    },
    punch(tl, o, i, T, d) {
      tl.fromTo(o, { scale: 1, opacity: 1, filter: 'blur(0px)' }, { scale: 2.4, opacity: 0, filter: 'blur(12px)', duration: d * 0.8, ease: 'power3.in', transformOrigin: '50% 50%' }, T);
      tl.fromTo(i, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: d, ease: 'back.out(1.5)', transformOrigin: '50% 50%' }, T);
    },
    zoom(tl, o, i, T, d) {
      tl.fromTo(o, { scale: 1, opacity: 1 }, { scale: 3.2, opacity: 0, filter: 'blur(14px)', duration: d, ease: 'power2.in', transformOrigin: '50% 50%' }, T);
      tl.fromTo(i, { scale: 0.62, opacity: 0, filter: 'blur(12px)' }, { scale: 1, opacity: 1, filter: 'blur(0px)', duration: d, ease: 'power2.out', transformOrigin: '50% 50%' }, T);
    },
    rise(tl, o, i, T, d) {
      tl.fromTo(o, { y: 0 }, { y: -H * 0.5, opacity: 0, duration: d, ease: 'power3.in' }, T);
      tl.fromTo(i, { y: H * 0.5, opacity: 0 }, { y: 0, opacity: 1, duration: d, ease: 'power3.out' }, T);
    },
    blur(tl, o, i, T, d) {
      tl.fromTo(o, { opacity: 1, filter: 'blur(0px)' }, { opacity: 0, filter: 'blur(22px)', duration: d, ease: 'sine.inOut' }, T);
      tl.fromTo(i, { opacity: 0, filter: 'blur(22px)' }, { opacity: 1, filter: 'blur(0px)', duration: d, ease: 'sine.inOut' }, T);
    },
    iris(tl, o, i, T, d) {
      tl.fromTo(i, { clipPath: 'circle(0px at 50% 50%)' }, { clipPath: 'circle(1400px at 50% 50%)', duration: d, ease: 'power2.inOut' }, T);
      tl.fromTo(o, { scale: 1 }, { scale: 0.92, duration: d, ease: 'power2.inOut', transformOrigin: '50% 50%' }, T);
    },
    glitch(tl, o, i, T, d) {
      const r = rng(Math.round(T * 1000) + 11), ko = [], ki = [], n = 8;
      for (let k = 0; k < n; k++) { const j = (r() * 2 - 1) * 60; ko.push({ x: j, skewX: (r() * 2 - 1) * 10, filter: `hue-rotate(${Math.round(r() * 80)}deg) saturate(1.6)`, duration: d / n, ease: 'none' }); }
      ko.push({ x: 0, skewX: 0, filter: 'none', opacity: 0, duration: 0.001 });
      tl.to(o, { keyframes: ko }, T);
      for (let k = 0; k < n; k++) { const j = (r() * 2 - 1) * 40; ki.push({ x: j * (1 - k / n), skewX: (r() * 2 - 1) * 8 * (1 - k / n), opacity: k < 2 ? 0.6 : 1, duration: d / n, ease: 'none' }); }
      ki.push({ x: 0, skewX: 0, opacity: 1, duration: 0.001 });
      tl.fromTo(i, { opacity: 0 }, { keyframes: ki }, T);
    },
  };
  function transition(tl, kind, outSel, inSel, T, d) {
    const f = TRANSITIONS[kind]; if (!f) throw new Error(`KIT: unknown transition "${kind}" (${Object.keys(TRANSITIONS).join(', ')})`);
    f(tl, outSel, inSel, T, d);
  }

  // ---- root-only: captions and ambient layers ---------------------------------------------------------------
  function captions(tl) {
    const box = document.getElementById('cap');
    for (const ln of EP.order) {
      EP.lines[ln].caps.forEach((c, ci) => {
        const el = document.createElement('div'); el.className = 'chunk'; el.id = `cap-${ln}-${ci}`;
        el.innerHTML = c.words.map((w, k) => `<span class="w" id="cap-${ln}-${ci}-${k}">${w.t}${k < c.words.length - 1 ? ' ' : ''}</span>`).join('');
        if (c.two) el.classList.add('two');
        box.appendChild(el);
        tl.set(el, { opacity: 1 }, c.a); tl.set(el, { opacity: 0 }, c.b);
        c.words.forEach((w, k) => {
          const we = el.querySelector(`#cap-${ln}-${ci}-${k}`), nxt = c.words[k + 1];
          tl.set(we, { color: '#ffb454' }, w.a);
          tl.set(we, { color: '#f2f8ff' }, nxt ? nxt.a : c.b);
        });
      });
    }
  }
  function ambient(tl, total) {
    tl.fromTo('#bg-grid', { backgroundPosition: '0px 0px, 0px 0px, 0px 0px, 0px 0px' }, { backgroundPosition: '-80px 80px, -80px 80px, -400px 400px, -400px 400px', duration: total, ease: 'steps(80)' }, 0);  // whole-pixel steps: a sub-pixel drift redraws the grid every frame
    tl.fromTo('#bg-glow', { scale: 1, opacity: 0.9 }, { scale: 1.25, opacity: 1, duration: 5, ease: 'sine.inOut', yoyo: true, repeat: Math.max(0, Math.floor(total / 5) - 1) }, 0);
    // the grain stays still: animated noise changes every pixel every frame and multiplies the file size ten times
  }

  // ---- board helpers (paper-reels/formats/system-design.md) ---------------------------------------------
  // Actors stay on the board and change in place. Move the camera with focus(); these four do the rest.
  /** Change a label in place: outSel lifts away, inSel takes its spot. Both elements exist in the markup with their own
   *  data-bind (copy from the storyboard); inSel sits on top of outSel (same position) and starts hidden. */
  function swap(tl, outSel, inSel, t, o = {}) {
    const d = o.dur ?? 0.35, dy = o.y ?? 18;
    tl.to(outSel, { y: -dy, opacity: 0, duration: d, ease: 'power2.in' }, t);
    tl.fromTo(inSel, { y: dy, opacity: 0 }, { y: 0, opacity: 1, duration: d, ease: 'power2.out' }, t + d * 0.6);
  }
  /** Change an actor's role colour where it stands. The actor's CSS reads var(--role) (see .actor in blueprint.css);
   *  `to` is a token name ('new', 'old', 'compute', 'hero', 'store') or a colour. */
  function recolor(tl, sel, t, to, o = {}) {
    const val = /^(old|new|compute|hero|store)$/.test(to) ? getComputedStyle(document.documentElement).getPropertyValue(`--role-${to}`).trim() : to;
    tl.to(sel, { '--role': val, duration: o.dur ?? 0.5, ease: o.ease || 'power2.inOut' }, t);
  }
  /** A packet that travels from (x1, y1) to (x2, y2) in the parent's coordinates, then fades. The element is created here.
   *  o.cls adds classes (default "packet"); o.hold keeps it visible at the end. */
  function travel(tl, parent, t, [x1, y1], [x2, y2], o = {}) {
    const host = typeof parent === 'string' ? document.querySelector(parent) : parent, el = document.createElement('div'), d = o.dur ?? 0.8;
    el.className = o.cls || 'packet'; el.style.left = `${x1}px`; el.style.top = `${y1}px`; host.appendChild(el);
    tl.fromTo(el, { x: 0, y: 0, opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.12, ease: 'none' }, t);
    tl.to(el, { x: x2 - x1, y: y2 - y1, duration: d, ease: o.ease || 'power2.inOut' }, t + 0.12);
    if (!o.hold) tl.to(el, { opacity: 0, scale: 0.6, duration: 0.15, ease: 'none' }, t + 0.12 + d);
    return t + 0.12 + d;
  }
  /** Show scale: a grid of n small copies that pop in, fast, in a seeded order. Cells get class o.cls (default "cell").
   *  The grid is centred on (x, y) in the parent. Returns the time the last cell lands. */
  function multiply(tl, parent, t, { n = 60, cols = 12, cell = 56, gap = 12, x = W / 2, y = 900, dur = 1.2, seed = 5, cls = 'cell' } = {}) {
    const host = typeof parent === 'string' ? document.querySelector(parent) : parent, rows = Math.ceil(n / cols), r = rng(seed);
    const w = cols * cell + (cols - 1) * gap, h = rows * cell + (rows - 1) * gap, order = [];
    for (let i = 0; i < n; i++) order.push([r(), i]);
    order.sort((a, b) => a[0] - b[0]);
    const step = n > 1 ? dur / (n - 1) : 0;
    order.forEach(([, i], k) => {
      const el = document.createElement('div');
      el.className = cls; el.style.left = `${x - w / 2 + (i % cols) * (cell + gap)}px`; el.style.top = `${y - h / 2 + Math.floor(i / cols) * (cell + gap)}px`;
      el.style.width = el.style.height = `${cell}px`; host.appendChild(el);
      tl.fromTo(el, { scale: 0.2, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.18, ease: 'back.out(2)' }, t + k * step);
    });
    return t + dur + 0.18;
  }

  window.KIT = { EP, W, H, clamp, rng, line, data, cue, cueEnd, sceneDur, bind, pop, rise, fade, slam, shake, draw, wipe, count, typeOn, sweep, sparks, focus, drift, glitch, grow, breathe, beats, paper, receipt, read, circle, svgEl, tree, robot, transition, captions, ambient, swap, recolor, travel, multiply, TRANSITIONS };
})();
