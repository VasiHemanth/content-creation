// Assemble a renderable HyperFrames project for one episode in <episode>/out/hf/project/.
// Authored inputs: storyboard.json, scenes/<scene>.html (one <template> fragment per scene), evidence/ crops,
// audio/words.json. Everything in the project folder is generated and may be deleted at any time.
import fs from 'node:fs';
import path from 'node:path';
import { buildTimeline, loadStoryboard } from './timeline.mjs';

const HF = path.resolve(import.meta.dirname, '..');
const W = 1080, H = 1920;
const r3 = (x) => +(+x).toFixed(3);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

export const projectDir = (DIR) => path.join(DIR, 'out', 'hf', 'project');

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) copyDir(s, d); else fs.copyFileSync(s, d);
  }
}

export function build(DIR) {
  const sb = loadStoryboard(DIR);
  const words = JSON.parse(fs.readFileSync(path.join(DIR, 'audio', 'words.json'), 'utf8'));
  const tlx = buildTimeline(DIR, sb, words);
  const P = projectDir(DIR);
  fs.rmSync(P, { recursive: true, force: true });
  fs.mkdirSync(path.join(P, 'compositions'), { recursive: true });
  copyDir(path.join(HF, 'kit'), path.join(P, 'kit'));
  if (fs.existsSync(path.join(DIR, 'scenes', 'assets'))) copyDir(path.join(DIR, 'scenes', 'assets'), path.join(P, 'assets'));

  // evidence crops (paper receipts)
  const evidence = {};
  const evManifest = path.join(DIR, 'evidence', 'manifest.json');
  if (fs.existsSync(evManifest)) {
    const m = JSON.parse(fs.readFileSync(evManifest, 'utf8'));
    fs.mkdirSync(path.join(P, 'evidence'), { recursive: true });
    for (const [id, e] of Object.entries(m)) {
      fs.copyFileSync(path.join(DIR, 'evidence', `${id}.png`), path.join(P, 'evidence', `${id}.png`));
      evidence[id] = { img: `evidence/${id}.png`, w: e.w, h: e.h, page: e.page, rects: e.rects, circles: e.circles || {} };
    }
  }

  // scenes: copy each template, check its ids
  for (const s of tlx.scenes) {
    const src = path.join(DIR, 'scenes', `${s.name}.html`);
    if (!fs.existsSync(src)) throw new Error(`missing scene file ${src}`);
    const html = fs.readFileSync(src, 'utf8');
    if (!html.trimStart().startsWith('<template')) throw new Error(`${src}: must be a bare <template> fragment`);
    if (!html.includes(`data-composition-id="${s.name}"`)) throw new Error(`${src}: root must carry data-composition-id="${s.name}"`);
    if (!html.includes(`window.__timelines["${s.name}"]`) && !html.includes(`window.__timelines['${s.name}']`)) throw new Error(`${src}: must register window.__timelines["${s.name}"]`);
    fs.writeFileSync(path.join(P, 'compositions', `${s.name}.html`), html);
  }

  // data for the page: per line timing, words, data, captions; per scene timing
  const EP = {
    fps: tlx.fps, total: r3(tlx.total), name: sb.name, item: sb.item, authors: sb.authors || [],
    order: tlx.lines.map((l) => l.id),
    lines: Object.fromEntries(tlx.lines.map((l) => [l.id, {
      scene: l.scene, t0: r3(l.t0), start: r3(l.start), dur: r3(l.dur), lead: l.lead, vd: r3(l.vd), text: l.text, data: l.data || {},
      words: l.words.map((w) => ({ w: w.w, a: w.a, b: w.b })),
      caps: l.caps.map((c) => ({ a: c.a, b: c.b, two: c.two, words: c.words })),
    }])),
    scenes: Object.fromEntries(tlx.scenes.map((s) => [s.name, { start: r3(s.start), dur: r3(s.dur), lines: s.lines, transition: s.transition, tdur: s.tdur }])),
    evidence,
  };
  fs.writeFileSync(path.join(P, 'data.js'), `window.EP = ${JSON.stringify(EP)};\n`);

  const css = fs.readFileSync(path.join(HF, 'kit', 'blueprint.css'), 'utf8');
  const hosts = tlx.scenes.map((s, i) => {
    const hold = i < tlx.scenes.length - 1 ? s.tdur : 0;
    return `      <div id="el-${s.name}" class="scene" data-composition-id="${s.name}" data-composition-src="compositions/${s.name}.html" data-start="${r3(s.start)}" data-duration="${r3(s.dur + hold)}" data-track-index="${1 + (i % 2)}" data-width="${W}" data-height="${H}" style="z-index:${10 + i}"></div>`;
  }).join('\n');
  const trans = tlx.scenes.slice(0, -1).map((s, i) => {
    const nx = tlx.scenes[i + 1];
    return s.transition === 'cut' ? '' : `      KIT.transition(tl, ${JSON.stringify(s.transition)}, "#el-${s.name}", "#el-${nx.name}", ${r3(nx.start)}, ${s.tdur});`;
  }).filter(Boolean).join('\n');
  const T = r3(tlx.total);
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <title>${esc(sb.name)}</title>
    <script src="kit/vendor/gsap.min.js"></script>
    <script src="kit/vendor/DrawSVGPlugin.min.js"></script>
    <script src="kit/vendor/SplitText.min.js"></script>
    <script src="kit/vendor/CustomEase.min.js"></script>
    <script src="kit/vendor/MotionPathPlugin.min.js"></script>
    <script src="kit/vendor/MorphSVGPlugin.min.js"></script>
    <script>gsap.registerPlugin(DrawSVGPlugin, SplitText, CustomEase, MotionPathPlugin, MorphSVGPlugin);</script>
    <script src="data.js"></script>
    <script src="kit/kit.js"></script>
    <style>
${css}
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: #061a30; }
      #root { position: relative; width: ${W}px; height: ${H}px; overflow: hidden; background: #0b2a4a; }
      .scene { position: absolute; left: 0; top: 0; width: ${W}px; height: ${H}px; overflow: hidden; }
      #bg { position: absolute; left: 0; top: 0; width: ${W}px; height: ${H}px; overflow: hidden; }
      #bg-base { position: absolute; inset: 0; background: radial-gradient(1300px 1500px at 50% 42%, #10406b 0%, #0b2a4a 55%, #061a30 100%); }
      #bg-glow { position: absolute; left: 90px; top: 380px; width: 900px; height: 900px; border-radius: 50%;
        background: radial-gradient(closest-side, rgba(255,180,84,.16), rgba(255,180,84,0)); }
      #bg-grid { position: absolute; left: -400px; top: -600px; width: 1880px; height: 3120px;
        background-image: linear-gradient(rgba(127,196,238,.10) 1px, transparent 1px), linear-gradient(90deg, rgba(127,196,238,.10) 1px, transparent 1px),
          linear-gradient(rgba(159,216,244,.22) 1.4px, transparent 1.4px), linear-gradient(90deg, rgba(159,216,244,.22) 1.4px, transparent 1.4px);
        background-size: 40px 40px, 40px 40px, 200px 200px, 200px 200px; }
      #bg-frame { position: absolute; left: 34px; top: 34px; width: ${W - 68}px; height: ${H - 68}px; border: 2px solid rgba(168,220,242,.55);
        outline: 1px solid rgba(168,220,242,.3); outline-offset: -12px; }
      #grain { position: absolute; inset: 0; opacity: .11; background-image: url("kit/grain.png"); background-size: 256px 256px; mix-blend-mode: screen; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${T}" data-width="${W}" data-height="${H}">
      <svg id="bp-defs" width="0" height="0" style="position:absolute;left:0;top:0"><defs>
        <filter id="bp-sketch" x="-4%" y="-4%" width="108%" height="108%"><feTurbulence id="bp-turb" type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="1" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="3.4" xChannelSelector="R" yChannelSelector="G" /></filter>
      </defs></svg>
      <div id="bg" class="clip" data-start="0" data-duration="${T}" data-track-index="0">
        <div id="bg-base" data-layout-ignore></div><div id="bg-glow" data-layout-ignore></div><div id="bg-grid" data-layout-ignore></div><div id="bg-frame" data-layout-ignore></div><div id="grain" data-layout-ignore></div>
      </div>
${hosts}
      <div id="cap" class="clip" data-start="0" data-duration="${T}" data-track-index="4" style="z-index:100"><div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div></div>
    </div>
    <script>
      (function () {
        const tl = gsap.timeline({ paused: true });
        KIT.ambient(tl, ${T});
        tl.fromTo("#bp-turb", { attr: { seed: 1 } }, { attr: { seed: ${Math.max(2, Math.floor(T * 8))} }, duration: ${T}, ease: "steps(${Math.max(2, Math.floor(T * 8)) - 1})" }, 0);
        KIT.captions(tl);
${trans}
        window.__timelines["main"] = tl;
      })();
    </script>
  </body>
</html>
`;
  fs.writeFileSync(path.join(P, 'index.html'), html);
  fs.writeFileSync(path.join(P, 'hyperframes.json'), JSON.stringify({ paths: { blocks: 'compositions', components: 'compositions/components', assets: 'assets' }, media: { autoProxy: false } }, null, 2));
  fs.writeFileSync(path.join(P, 'meta.json'), JSON.stringify({ id: path.basename(DIR), name: sb.name }, null, 2));
  return { P, tlx, sb };
}
