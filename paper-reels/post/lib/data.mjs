// How a slide's `data` is read, in one place, so the STE gate, the facts gate, the builder and the audit agree.
//
//   key starting with "_"   drawing only (a bar length). Never printed, never checked as copy. Applies at any depth.
//   key starting with "x_"  a deliberate counter-example. Exempt from the STE check only when it is declared in
//                           post.json ste.examples with a `why`; the slide must label it visibly.
//   anything else           printed copy: checked by the STE profile, one string at a time, and by the facts gate.
//
// A leaf is a string or a finite number. Arrays and objects nest freely; the path to a leaf is a dotted key such as
// "rows.1.label", which is also what data-bind uses in a slide ("s02.rows.1.label").

export const isDrawKey = (k) => String(k).startsWith('_');
export const isExampleKey = (k) => String(k).startsWith('x_');

/** Every leaf of `data`: [{ key, path, value, draw, example, exampleKey }]. Also returns the structural problems found. */
export function describeData(data, slideId = '?') {
  const leaves = [], problems = [];
  const walk = (v, path) => {
    const key = path.join('.');
    if (v !== null && typeof v === 'object') {
      const entries = Array.isArray(v) ? v.map((x, i) => [String(i), x]) : Object.entries(v);
      for (const [k, x] of entries) {
        if (!Array.isArray(v) && (k === '' || /[.\s]/.test(k))) problems.push(`${slideId}: data key "${[...path, k].join('.')}" must not be empty or contain a dot or a space`);
        walk(x, [...path, k]);
      }
      return;
    }
    const draw = path.some(isDrawKey);
    const xi = path.findIndex(isExampleKey);
    const ok = (typeof v === 'string') || (typeof v === 'number' && Number.isFinite(v));
    if (!ok) { problems.push(`${slideId}: data.${key} must be a string or a finite number (got ${v === null ? 'null' : typeof v})`); return; }
    leaves.push({ key, path, value: v, draw, example: !draw && xi !== -1, exampleKey: xi === -1 ? null : path.slice(0, xi + 1).join('.') });
  };
  if (data === null || typeof data !== 'object' || Array.isArray(data)) { problems.push(`${slideId}: data must be an object`); return { leaves, problems }; }
  walk(data, []);
  return { leaves, problems };
}

/** The value at a dotted key, or undefined. */
export function lookup(data, key) {
  let v = data;
  for (const k of String(key).split('.')) { if (v === null || typeof v !== 'object') return undefined; v = v[k]; }
  return v;
}

/** Everything a reader can see, in slide order: [{ slide, idx, key, text, example, exampleKey }]. Drawing-only leaves are left out. */
export function printed(post) {
  const out = [];
  post.slides.forEach((s, idx) => {
    for (const l of describeData(s.data, s.id).leaves) if (!l.draw) out.push({ slide: s.id, idx, key: l.key, text: String(l.value), example: l.example, exampleKey: l.exampleKey });
  });
  return out;
}
