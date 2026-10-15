/* PK: the one runtime helper for slides. Loaded by the root page after data.js (window.POST) and GSAP.
   A slide has no script of its own: the builder appends one call, PK.bind("<slide id>"), to every slide template.
   Everything here is a pure function of post.json: no clocks, no randomness, no network. */
(function () {
  const POST = window.POST;
  const isDraw = (k) => String(k).startsWith('_');

  /** The value at "s02.rows.1.label". Throws, with the reference in the message, when it is not in post.json. */
  function value(ref) {
    const [id, ...path] = String(ref).split('.');
    const slide = POST.slides[id];
    if (!slide) throw new Error('PK: slide "' + id + '" is not in post.json (' + ref + ')');
    let v = slide.data;
    for (const k of path) v = v === null || typeof v !== 'object' ? undefined : v[k];
    if (v === undefined || v === null) throw new Error('PK: ' + ref + ' is not in post.json');
    return v;
  }

  /**
   * Fill the slide.
   *   data-bind="s02.title"                 print that string or number (never a "_" key: those are for drawing only)
   *   data-hl="s02._hl"                     on a data-bind element: colour the first occurrence of that string (a "_" key
   *                                         holding part of the printed text) with the highlight colour
   *   data-var="--pct:s02._bar;--n:s02.n"   set CSS custom properties from numbers; CSS draws the proportion
   * A slide may only read its own data: the prefix has to be its own id.
   */
  function bind(id) {
    for (const el of document.querySelectorAll('[data-bind]')) {
      const ref = el.getAttribute('data-bind');
      if (ref.split('.')[0] !== id) continue;
      if (ref.split('.').slice(1).some(isDraw)) throw new Error('PK: ' + ref + ' is a drawing-only key; use data-var, never data-bind');
      const v = value(ref);
      if (typeof v === 'object') throw new Error('PK: ' + ref + ' is a list or an object; bind one of its strings (e.g. ' + ref + '.0)');
      el.textContent = String(v);
      const hl = el.getAttribute('data-hl');
      if (hl) {
        if (hl.split('.')[0] !== id) throw new Error('PK: ' + hl + ' belongs to another slide');
        const part = String(value(hl)), text = el.textContent, at = text.indexOf(part);
        if (!part || at < 0) throw new Error('PK: "' + part + '" (' + hl + ') is not part of the text of ' + ref);
        const span = document.createElement('span');
        span.className = 'pk-hl';
        span.textContent = part;
        el.textContent = '';
        el.append(text.slice(0, at), span, text.slice(at + part.length));
      }
    }
    for (const el of document.querySelectorAll('[data-var]')) {
      const pairs = el.getAttribute('data-var').split(';').map((s) => s.trim()).filter(Boolean);
      if (!pairs.some((p) => p.slice(p.indexOf(':') + 1).trim().split('.')[0] === id)) continue;
      for (const p of pairs) {
        const i = p.indexOf(':'), name = p.slice(0, i).trim(), ref = p.slice(i + 1).trim();
        if (ref.split('.')[0] !== id) throw new Error('PK: ' + ref + ' belongs to another slide');
        if (!/^--[a-z][a-z0-9-]*$/.test(name)) throw new Error('PK: "' + name + '" is not a CSS custom property name (use --name)');
        const n = parseFloat(value(ref));
        if (!Number.isFinite(n)) throw new Error('PK: ' + ref + ' is not a number');
        el.style.setProperty(name, String(n));
      }
    }
  }

  window.PK = { value, bind };
})();
