// press build: timing.json -> assets/timing.js, compositions/*.html (from src/), index.html
import fs from "node:fs";
const T = JSON.parse(fs.readFileSync("timing.json", "utf8"));
const total = Math.round(T.duration * 100) / 100;
const mid = (i) => (T.lines[i].end + T.lines[i + 1].start) / 2;
const bounds = [0, mid(2), mid(3), mid(4), mid(5), total];
const names = ["A", "B", "C", "D", "E"];
const scenes = {};
names.forEach((n, i) => (scenes[n] = { start: +bounds[i].toFixed(3), end: +bounds[i + 1].toFixed(3), dur: +(bounds[i + 1] - bounds[i]).toFixed(3) }));
const words = T.lines.flatMap((l) => l.words.map((w, k) => ({ ...w, line: l.id, k })));
fs.writeFileSync("assets/timing.js", "window.TIMING=" + JSON.stringify({ total, scenes, lines: T.lines, words }) + ";\n");
const ff = (fam, w, f, st = "normal") => `@font-face{font-family:"${fam}";font-weight:${w};font-style:${st};src:url("assets/fonts/${f}.woff2") format("woff2")}`;
const fonts = [ff("Libre Caslon Text", 400, "libre-caslon-text-latin-400-normal"), ff("Libre Caslon Text", 400, "libre-caslon-text-latin-400-italic", "italic"), ff("Libre Caslon Text", 700, "libre-caslon-text-latin-700-normal"),
  ff("Playfair Display", 700, "playfair-display-latin-700-normal"), ff("Playfair Display", 900, "playfair-display-latin-900-normal"), ff("UnifrakturCook", 700, "unifrakturcook-latin-700-normal"),
  ff("Special Elite", 400, "special-elite-latin-400-normal"), ff("Alfa Slab One", 400, "alfa-slab-one-latin-400-normal")].join("\n");
fs.mkdirSync("compositions", { recursive: true });
for (const f of fs.readdirSync("src")) fs.writeFileSync("compositions/" + f, fs.readFileSync("src/" + f, "utf8").replace("/*@FONTS*/", fonts));
const plan = fs.existsSync("assets/audio-plan.json") ? JSON.parse(fs.readFileSync("assets/audio-plan.json", "utf8")) : { sfx: [], musicAuto: null };
const host = (id, src, st, du, tr, extra = "") => `  <div id="${id}" class="clip" data-composition-id="${id}" data-composition-src="compositions/${src}.html" data-start="${st}" data-duration="${du}" data-track-index="${tr}" data-width="1080" data-height="1920" ${extra}></div>`;
let html = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=1080, height=1920"/>
<script src="assets/gsap.min.js"></script>
<script src="assets/timing.js"></script>
<script src="assets/press.js"></script>
<script src="assets/pages.js"></script>
<style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:1080px;height:1920px;overflow:hidden;background:#12110e}#root{position:absolute;inset:0}</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${total}" data-width="1080" data-height="1920">
`;
names.forEach((n, i) => { html += host(n, "scene" + n, scenes[n].start, scenes[n].dur, 1, `data-track-kind="graphics" style="z-index:${10 + i}"`) + "\n"; });
html += host("captions", "captions", 0, total, 2, `data-track-kind="captions" style="z-index:60"`) + "\n";
html += `  <audio id="voice" src="assets/voice.wav" data-start="0" data-duration="${total}" data-track-index="20" data-volume="1"></audio>\n`;
if (fs.existsSync("assets/music.wav")) html += `  <audio id="music" src="assets/music.wav" data-start="0" data-duration="${total}" data-track-index="21" data-volume="1"${plan.musicAuto ? ` data-automation='${JSON.stringify(plan.musicAuto)}'` : ""}></audio>\n`;
const lanes = [];
plan.sfx.forEach((s, i) => { let l = lanes.findIndex((e) => e <= s.t); if (l < 0) { l = lanes.length; lanes.push(0); } lanes[l] = s.t + s.d + 0.01; html += `  <audio id="sfx${i}" src="assets/sfx/${s.file}" data-start="${s.t}" data-duration="${s.d}" data-track-index="${22 + l}" data-volume="${s.v}"></audio>\n`; });
html += `</div>\n<script>window.__timelines = window.__timelines || {};</script>\n</body>\n</html>\n`;
fs.writeFileSync("index.html", html);
console.log(JSON.stringify(scenes));
