// Builder: a post folder in, a renderable HyperFrames project out (<postDir>/out/project/ by default).
//
// 1080x1350 constants live here and in constants.mjs. hf/lib/project.mjs and the reels' kit are not parameterised or
// edited: this file only reads hf/kit (fonts, grain, GSAP, blueprint.css).
//
// One sub-composition per slide, one second each. Slide i is captured at i + 0.5 s, the middle of its second. A slide
// is static, but it is still a composition: the builder appends the script (bind the copy, register one empty paused
// GSAP timeline), so slide templates carry markup and CSS only, and no script can ever put text on a slide.
import fs from 'node:fs';
import path from 'node:path';
import { H, HF_DIR, POST_DIR, SLIDE_SECONDS, W } from './constants.mjs';
import { describeData } from './data.mjs';
import { files, loadPost, PostError } from './postdir.mjs';
import { videoSlideTemplate } from './templates.mjs';

const KIT = path.join(POST_DIR, 'kit');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const r3 = (x) => +(+x).toFixed(3);

/** Class names the kit defines (.pk-*, .is-*), read from post.css. */
export function kitClasses() {
  const css = fs.readFileSync(path.join(KIT, 'post.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  return new Set([...css.matchAll(/\.((?:pk|is)-[a-z0-9_-]+)/g)].map((m) => m[1]));
}

const lev = (a, b) => {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
};

const attr = (html, name) => [...html.matchAll(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'gi'))].map((m) => m[1] ?? m[2]);
// Drawing and font classes of hf/kit/blueprint.css that slides may use (SVG linework, fonts). Its reel components (.tag, .plate,
// .stamp, .hd ...) are absolutely positioned for the 1080x1920 canvas and are not for slides.
const BLUEPRINT_OK = new Set(['ink', 'sketch', 'ghost', 'ln', 'fl', 'dash', 'thin', 'thick', 'heavy', 'cyan', 'amber', 'coral', 'mint', 'dim', 'faint', 'deep', 'panel', 'mono', 'marker', 'brush', 'nowrap', 'glow-amber', 'glow-cyan']);
const BANNED_TAGS = ['script', 'link', 'iframe', 'object', 'embed', 'video', 'audio', 'base', 'meta', 'form', 'input', 'textarea', 'select', 'button', 'template'];

/**
 * Static rules for one slide template. Returns a list of problems, each with the fix. The DOM audit (audit.mjs) later
 * checks what the browser actually shows; this catches what can be seen in the source before any browser starts.
 */
export function lintSlide({ id, html, data, classes = kitClasses() }) {
  const P = [], at = `slides/${id}.html`, bad = (m) => P.push(`${at}: ${m}`);
  const t = html.trim();
  if (!/^<template[\s>]/.test(t) || !/<\/template>\s*$/.test(t)) { bad(`must be a bare <template> fragment: start with <template id="${id}-template"> and end with </template>`); return P; }
  if ((t.match(/<template[\s>]/g) || []).length !== 1) bad('must hold exactly one <template>');
  const src = t.replace(/<!--[\s\S]*?-->/g, '');

  for (const tag of BANNED_TAGS.filter((x) => x !== 'template')) {
    if (new RegExp(`<${tag}[\\s>/]`, 'i').test(src)) bad(`<${tag}> is not allowed in a slide${tag === 'script' ? ' (the builder adds the only script: it binds the copy and registers the empty timeline)' : ''}`);
  }
  if (/\son[a-z]+\s*=/i.test(src)) bad('inline event handlers (onclick=...) are not allowed');
  if (/javascript:/i.test(src)) bad('javascript: URLs are not allowed');
  for (const a of ['data-start', 'data-duration', 'data-track-index', 'data-composition-src']) if (new RegExp(`\\s${a}\\s*=`, 'i').test(src)) bad(`${a} belongs to the root page only; the builder sets it`);

  // network: nothing may load at render time (the SVG namespace declaration is not a request)
  const noNs = src.replace(/\sxmlns(?::[a-z]+)?\s*=\s*("[^"]*"|'[^']*')/gi, ' ');
  if (/\bhttps?:/i.test(noNs) || /(^|[\s"'(=,])\/\/[a-z0-9]/i.test(noNs)) bad('no URLs: a slide may not load anything over the network (images go in slides/assets/ and are referenced as assets/<file>)');
  if (/@import|@font-face|@charset/i.test(src)) bad('@import, @font-face and @charset are not allowed (the kit loads the fonts)');

  // static: no motion. Check the style blocks and inline styles, not ids or class names.
  const styles = [...src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).concat(attr(src, 'style'));
  for (const css of styles) {
    if (/@keyframes/i.test(css)) bad('@keyframes is not allowed: slides are static');
    if (/(^|[\s;{])(animation|transition)(-[a-z-]+)?\s*:/i.test(css)) bad('animation and transition are not allowed: slides are static');
    for (const m of css.matchAll(/url\(\s*(["']?)([^)"']*)\1\s*\)/gi)) {
      const u = m[2].trim();
      if (!(u.startsWith('#') || u.startsWith('assets/') || u.startsWith('data:'))) bad(`url(${u}) is not allowed; use url(#id), url(assets/<file>) or a data: URI`);
    }
    if (/(^|[\s;{])content\s*:\s*(?!\s*(none|normal|""|''|counter\(|counters\())/i.test(css)) bad('CSS "content:" may only be "", none or a counter(): every letter and digit on a slide has to come from post.json');
  }
  for (const u of attr(src, 'src').concat(attr(src, 'href'))) if (!(u.startsWith('assets/') || u.startsWith('#') || u.startsWith('data:'))) bad(`src/href "${u}" is not allowed; use assets/<file> (from slides/assets/)`);

  // the root
  const root = src.match(/<([a-z][a-z0-9]*)\b[^>]*\bdata-composition-id\s*=\s*(?:"([^"]*)"|'([^']*)')[^>]*>/i);
  if (!root) bad(`needs a root element: <div id="root" data-composition-id="${id}" data-width="${W}" data-height="${H}">`);
  else {
    const tag = root[0], cid = root[2] ?? root[3];
    if (cid !== id) bad(`the root's data-composition-id is "${cid}", it must be "${id}"`);
    if (!/\sid\s*=\s*["']root["']/i.test(tag)) bad('the root element must have id="root"');
    if (!new RegExp(`data-width\\s*=\\s*["']${W}["']`).test(tag) || !new RegExp(`data-height\\s*=\\s*["']${H}["']`).test(tag)) bad(`the root must say data-width="${W}" data-height="${H}"`);
    if ((src.match(/\bdata-composition-id\s*=/gi) || []).length !== 1) bad('only one element may carry data-composition-id');
  }

  // ids: unique, and prefixed with the slide id (ids are global in the assembled page)
  const ids = attr(src, 'id').filter((x) => x !== 'root');
  for (const x of ids) if (!x.startsWith(`${id}-`)) bad(`id="${x}" must start with "${id}-" (ids are shared by every slide in the assembled page)`);
  for (const x of new Set(ids.filter((v, i) => ids.indexOf(v) !== i))) bad(`id="${x}" appears twice`);

  // classes: the kit's, or the slide's own (prefixed). A typo in a kit class would silently render unstyled.
  const used = new Set(attr(src, 'class').flatMap((c) => c.split(/\s+/).filter(Boolean)));
  for (const c of used) {
    if (/^(pk|is)-/.test(c)) {
      if (!classes.has(c)) { const near = [...classes].map((k) => [k, lev(c, k)]).sort((a, b) => a[1] - b[1])[0]; bad(`unknown kit class "${c}"${near && near[1] <= 3 ? ` (did you mean "${near[0]}"?)` : ''}`); }
    } else if (!BLUEPRINT_OK.has(c) && !c.startsWith(`${id}-`)) bad(`class "${c}" is not a kit class; a class of your own must start with "${id}-" (classes are shared by every slide)`);
  }

  // data-bind and data-var
  const { leaves } = describeData(data, id);
  const byKey = new Map(leaves.map((l) => [l.key, l]));
  for (const ref of attr(src, 'data-bind')) {
    const [sid, ...rest] = ref.split('.'), key = rest.join('.');
    if (sid !== id) { bad(`data-bind="${ref}" must start with "${id}." (a slide reads only its own data)`); continue; }
    if (rest.some((k) => k.startsWith('_'))) { bad(`data-bind="${ref}" points at a drawing-only "_" key, which is never printed; use data-var for a drawing value`); continue; }
    if (!byKey.has(key)) bad(`data-bind="${ref}" is not a string or number in post.json (slide ${id}, data.${key})`);
  }
  for (const ref of attr(src, 'data-hl')) {
    const [sid, ...rest] = ref.split('.'), leaf = byKey.get(rest.join('.'));
    if (sid !== id) bad(`data-hl="${ref}" must start with "${id}."`);
    else if (!leaf || typeof leaf.value !== 'string') bad(`data-hl="${ref}" is not a string in post.json (put the part to colour in a "_" key, for example ${id}._hl)`);
  }
  for (const v of attr(src, 'data-var')) for (const pair of v.split(';').map((s) => s.trim()).filter(Boolean)) {
    const i = pair.indexOf(':'), name = pair.slice(0, i).trim(), ref = pair.slice(i + 1).trim();
    if (i < 0 || !/^--[a-z][a-z0-9-]*$/.test(name)) { bad(`data-var="${v}": use "--name:${id}.key" pairs separated by ";"`); continue; }
    const [sid, ...rest] = ref.split('.');
    if (sid !== id) { bad(`data-var ${ref} must start with "${id}."`); continue; }
    const leaf = byKey.get(rest.join('.'));
    if (!leaf || !Number.isFinite(parseFloat(leaf.value))) bad(`data-var ${ref} is not a number in post.json`);
  }
  return P;
}

/** Insert the root style and the bind script. The author's template stays as written otherwise. */
export function compose(id, html) {
  const style = `<style>#root { position: absolute; left: 0; top: 0; width: ${W}px; height: ${H}px; overflow: hidden; }</style>`;
  const script = `<script>\n    (function () {\n      PK.bind(${JSON.stringify(id)});\n      window.__timelines[${JSON.stringify(id)}] = gsap.timeline({ paused: true });\n    })();\n  </script>`;
  return html.trim().replace(/^(<template[^>]*>)/, `$1\n  ${style}`).replace(/<\/template>$/, `  ${script}\n</template>\n`);
}

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) copyDir(s, d); else fs.copyFileSync(s, d);
  }
}

/** The slide's template source: its own file, or the built-in one for a video slide without a file. */
export function slideSource(F, slide) {
  const f = F.slideHtml(slide.id);
  if (fs.existsSync(f)) return { html: fs.readFileSync(f, 'utf8'), builtin: false };
  if (slide.kind === 'video') return { html: videoSlideTemplate(slide.id, slide.data), builtin: true };
  throw new PostError([`slides/${slide.id}.html is missing`]);
}

export function projectHtml(post, slides) {
  const T = r3(slides.length * SLIDE_SECONDS);
  const css = fs.readFileSync(path.join(HF_DIR, 'kit', 'blueprint.css'), 'utf8') + '\n' + fs.readFileSync(path.join(KIT, 'post.css'), 'utf8');
  const hosts = slides.map((s, i) => `      <div id="el-${s.id}" class="clip scene" data-composition-id="${s.id}" data-composition-src="compositions/${s.id}.html" data-start="${r3(i * SLIDE_SECONDS)}" data-duration="${SLIDE_SECONDS}" data-track-index="${1 + (i % 2)}" data-width="${W}" data-height="${H}" style="z-index:${10 + i}"></div>`).join('\n');
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <title>${esc(post.name)}</title>
    <script src="kit/vendor/gsap.min.js"></script>
    <script src="data.js"></script>
    <script src="kit/post-kit.js"></script>
    <style>
${css}
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: #061a30; }
      #root { position: relative; width: ${W}px; height: ${H}px; overflow: hidden; background: #0b2a4a; }
      .scene { position: absolute; left: 0; top: 0; width: ${W}px; height: ${H}px; overflow: hidden; }
      #bg { position: absolute; left: 0; top: 0; width: ${W}px; height: ${H}px; overflow: hidden; }
      #bg-base { position: absolute; inset: 0; background: radial-gradient(1300px 1500px at 50% 42%, #10406b 0%, #0b2a4a 55%, #061a30 100%); }
      #bg-glow { position: absolute; left: 90px; top: 230px; width: 900px; height: 900px; border-radius: 50%; background: radial-gradient(closest-side, rgba(255,180,84,.14), rgba(255,180,84,0)); }
      #bg-grid { position: absolute; inset: 0; background-position: 40px 75px;
        background-image: linear-gradient(rgba(127,196,238,.10) 1px, transparent 1px), linear-gradient(90deg, rgba(127,196,238,.10) 1px, transparent 1px),
          linear-gradient(rgba(159,216,244,.22) 1.4px, transparent 1.4px), linear-gradient(90deg, rgba(159,216,244,.22) 1.4px, transparent 1.4px);
        background-size: 40px 40px, 40px 40px, 200px 200px, 200px 200px; }
      #bg-frame { position: absolute; left: 34px; top: 34px; width: ${W - 68}px; height: ${H - 68}px; border: 2px solid rgba(168,220,242,.55); outline: 1px solid rgba(168,220,242,.3); outline-offset: -12px; }
      .bg-tick { position: absolute; width: 26px; height: 26px; border: 0 solid var(--amber); }
      #bg-tl { left: 30px; top: 30px; border-left-width: 4px; border-top-width: 4px; } #bg-tr { right: 30px; top: 30px; border-right-width: 4px; border-top-width: 4px; }
      #bg-bl { left: 30px; bottom: 30px; border-left-width: 4px; border-bottom-width: 4px; } #bg-br { right: 30px; bottom: 30px; border-right-width: 4px; border-bottom-width: 4px; }
      #grain { position: absolute; inset: 0; opacity: .11; background-image: url("kit/grain.png"); background-size: 256px 256px; mix-blend-mode: screen; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${T}" data-width="${W}" data-height="${H}">
      <svg id="bp-defs" width="0" height="0" style="position:absolute;left:0;top:0"><defs>
        <filter id="bp-sketch" x="-4%" y="-4%" width="108%" height="108%"><feTurbulence id="bp-turb" type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="1" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="3.4" xChannelSelector="R" yChannelSelector="G" /></filter>
      </defs></svg>
      <div id="bg">
        <div id="bg-base" data-layout-ignore></div><div id="bg-glow" data-layout-ignore></div><div id="bg-grid" data-layout-ignore></div><div id="bg-frame" data-layout-ignore></div>
        <div id="bg-tl" class="bg-tick" data-layout-ignore></div><div id="bg-tr" class="bg-tick" data-layout-ignore></div><div id="bg-bl" class="bg-tick" data-layout-ignore></div><div id="bg-br" class="bg-tick" data-layout-ignore></div>
        <div id="grain" data-layout-ignore></div>
      </div>
${hosts}
    </div>
    <script>
      (function () {
        window.__timelines["main"] = gsap.timeline({ paused: true });
      })();
    </script>
  </body>
</html>
`;
}

/**
 * Build the project for a post folder.
 * Returns { P, slides: [{ id, idx, kind, mid }], warnings }; throws PostError listing every problem found.
 */
export function build(dirArg, projectDir) {
  const { dir, post, warnings } = loadPost(dirArg);
  const F = files(dir), P = projectDir ? path.resolve(projectDir) : F.project;
  const classes = kitClasses(), problems = [], composed = [];

  post.slides.forEach((slide) => {
    const { html, builtin } = slideSource(F, slide);
    if (builtin && typeof slide.data.title !== 'string') problems.push(`slide ${slide.id}: the built-in video slide prints data.title in the left gutter; add "title" (or write slides/${slide.id}.html)`);
    if (builtin && typeof slide.data.handle !== 'undefined' && typeof slide.data.note !== 'undefined') problems.push(`slide ${slide.id}: use data.handle or data.note for the right gutter, not both`);
    problems.push(...lintSlide({ id: slide.id, html, data: slide.data, classes }));
    composed.push({ id: slide.id, html: compose(slide.id, html) });
  });
  if (problems.length) throw new PostError(problems, `${dir}/slides`);

  fs.rmSync(P, { recursive: true, force: true });
  fs.mkdirSync(path.join(P, 'compositions'), { recursive: true });
  const hfKit = path.join(HF_DIR, 'kit');
  copyDir(path.join(hfKit, 'fonts'), path.join(P, 'kit', 'fonts'));
  fs.mkdirSync(path.join(P, 'kit', 'vendor'), { recursive: true });
  fs.copyFileSync(path.join(hfKit, 'grain.png'), path.join(P, 'kit', 'grain.png'));
  fs.copyFileSync(path.join(hfKit, 'vendor', 'gsap.min.js'), path.join(P, 'kit', 'vendor', 'gsap.min.js'));
  fs.copyFileSync(path.join(KIT, 'post-kit.js'), path.join(P, 'kit', 'post-kit.js'));
  if (fs.existsSync(F.assets)) copyDir(F.assets, path.join(P, 'assets'));
  for (const c of composed) fs.writeFileSync(path.join(P, 'compositions', `${c.id}.html`), c.html);

  const POST = { w: W, h: H, name: post.name, item: post.item, slides: Object.fromEntries(post.slides.map((s, idx) => [s.id, { idx, kind: s.kind, data: s.data }])) };
  fs.writeFileSync(path.join(P, 'data.js'), `window.POST = ${JSON.stringify(POST)};\n`);
  fs.writeFileSync(path.join(P, 'index.html'), projectHtml(post, post.slides));
  fs.writeFileSync(path.join(P, 'hyperframes.json'), JSON.stringify({ paths: { blocks: 'compositions', components: 'compositions/components', assets: 'assets' }, media: { autoProxy: false } }, null, 2));
  fs.writeFileSync(path.join(P, 'meta.json'), JSON.stringify({ id: path.basename(dir), name: post.name }, null, 2));
  const slides = post.slides.map((s, idx) => ({ id: s.id, idx, kind: s.kind, mid: r3(idx * SLIDE_SECONDS + SLIDE_SECONDS / 2) }));
  return { P, dir, post, slides, warnings };
}

/** Times (seconds) at which each slide is captured: the middle of its second. */
export const midTimes = (n) => Array.from({ length: n }, (_, i) => r3(i * SLIDE_SECONDS + SLIDE_SECONDS / 2));
