// papercut build: timing.json -> assets/timing.js, compositions/*.html (from src/), index.html
import fs from "node:fs";
const T = JSON.parse(fs.readFileSync("timing.json", "utf8"));
const L = Object.fromEntries(T.lines.map((l) => [l.id, l]));
const mid = (a, b) => (L[a].end + L[b].start) / 2;
const seams = [mid("l2", "l3"), mid("l3", "l4"), mid("l4", "l5"), mid("l6", "l7"), mid("l7", "l8"), L.l8.end + 0.95];
const names = ["A", "B", "C", "D", "E", "F", "G"];
const PRE = 0.25;               // a scene is mounted this long before its seam, under the covering sheet
const total = Math.round(T.duration * 100) / 100;
const scenes = {};
names.forEach((n, i) => {
  const seamIn = i === 0 ? 0 : seams[i - 1], seamOut = i === names.length - 1 ? total : seams[i];
  const start = i === 0 ? 0 : seamIn - PRE, end = i === names.length - 1 ? total : seamOut + PRE;
  scenes[n] = { start: +start.toFixed(3), end: +end.toFixed(3), seam: +seamIn.toFixed(3), dur: +(end - start).toFixed(3) };
});
const words = T.lines.flatMap((l) => l.words.map((w, k) => ({ ...w, line: l.id, k })));
const TIMING = { total, seams, scenes, lines: T.lines, words };
fs.writeFileSync("assets/timing.js", "window.TIMING=" + JSON.stringify(TIMING) + ";\n");

const fonts = ["700:fredoka-latin-700", "600:fredoka-latin-600", "500:fredoka-latin-500"].map((s) => { const [w, f] = s.split(":"); return `@font-face{font-family:"Fredoka";font-weight:${w};src:url("assets/fonts/${f}-normal.woff2") format("woff2")}`; }).join("\n") +
  `\n@font-face{font-family:"Bagel Fat One";font-weight:400;src:url("assets/fonts/bagel-fat-one-latin-400-normal.woff2") format("woff2")}`;
fs.mkdirSync("compositions", { recursive: true });
for (const f of fs.readdirSync("src")) {
  let s = fs.readFileSync("src/" + f, "utf8");
  s = s.replace("/*@FONTS*/", fonts);
  fs.writeFileSync("compositions/" + f, s);
}
const plan = fs.existsSync("assets/audio-plan.json") ? JSON.parse(fs.readFileSync("assets/audio-plan.json", "utf8")) : { sfx: [], musicAuto: null };
const host = (id, src, st, du, z, extra = "") => `  <div id="${id}" class="clip" data-composition-id="${id}" data-composition-src="compositions/${src}.html" data-start="${st}" data-duration="${du}" data-track-index="${z}" data-width="1080" data-height="1920" ${extra}></div>`;
let html = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=1080, height=1920"/>
<script src="assets/gsap.min.js"></script>
<script src="assets/timing.js"></script>
<script src="assets/paper.js"></script>
<script src="assets/stage.js"></script>
<style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:1080px;height:1920px;overflow:hidden;background:#1d2a5b}#root{position:absolute;inset:0}.layerhost{position:absolute;inset:0}</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${total}" data-width="1080" data-height="1920">
`;
names.forEach((n, i) => { html += host("scene" + n, "scene" + n, scenes[n].start, scenes[n].dur, 1 + i, `data-track-kind="graphics" style="z-index:${10 + i}"`) + "\n"; });
html += host("wipes", "wipes", 0, total, 10, `data-track-kind="graphics" style="z-index:50"`) + "\n";
html += host("captions", "captions", 0, total, 11, `data-track-kind="captions" style="z-index:60"`) + "\n";
html += `  <audio id="voice" src="assets/voice.wav" data-start="0" data-duration="${total}" data-track-index="20" data-volume="1"></audio>\n`;
if (fs.existsSync("assets/music.wav")) html += `  <audio id="music" src="assets/music.wav" data-start="0" data-duration="${total}" data-track-index="21" data-volume="1"${plan.musicAuto ? ` data-automation='${JSON.stringify(plan.musicAuto)}'` : ""}></audio>\n`;
const lanes = [];
plan.sfx.forEach((s, i) => { let l = lanes.findIndex((e) => e <= s.t); if (l < 0) { l = lanes.length; lanes.push(0); } lanes[l] = s.t + s.d + 0.01; html += `  <audio id="sfx${i}" src="assets/sfx/${s.file}" data-start="${s.t}" data-duration="${s.d}" data-track-index="${22 + l}" data-volume="${s.v}"></audio>\n`; });
html += `</div>
<script>window.__timelines = window.__timelines || {};</script>
</body>
</html>
`;
fs.writeFileSync("index.html", html);
console.log(JSON.stringify(scenes));
