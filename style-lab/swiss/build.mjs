// swiss build: timing.json -> assets/timing.js, compositions/*.html, index.html
import fs from "node:fs";
const T = JSON.parse(fs.readFileSync("timing.json", "utf8"));
const total = Math.round(T.duration * 100) / 100;
const mid = (i) => (T.lines[i].end + T.lines[i + 1].start) / 2;
const bounds = [0, ...T.lines.slice(0, 7).map((_, i) => mid(i)), total];
const names = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"];
const scenes = {};
names.forEach((n, i) => (scenes[n] = { start: +bounds[i].toFixed(3), end: +bounds[i + 1].toFixed(3), dur: +(bounds[i + 1] - bounds[i]).toFixed(3) }));
const words = T.lines.flatMap((l) => l.words.map((w, k) => ({ ...w, line: l.id, k })));
fs.writeFileSync("assets/timing.js", "window.TIMING=" + JSON.stringify({ total, scenes, lines: T.lines, words }) + ";\n");
const ff = (w, f) => `@font-face{font-family:"Inter Tight";font-weight:${w};src:url("assets/fonts/${f}.woff2") format("woff2")}`;
const fonts = [ff(500, "inter-tight-latin-500-normal"), ff(800, "inter-tight-latin-800-normal")].join("\n");
fs.mkdirSync("compositions", { recursive: true });
for (const f of fs.readdirSync("src")) fs.writeFileSync("compositions/" + f, fs.readFileSync("src/" + f, "utf8").replace("/*@FONTS*/", fonts));
const plan = fs.existsSync("assets/audio-plan.json") ? JSON.parse(fs.readFileSync("assets/audio-plan.json", "utf8")) : { sfx: [], musicAuto: null };
const host = (id, src, st, du, extra = "") => `  <div id="${id}" class="clip" data-composition-id="${id}" data-composition-src="compositions/${src}.html" data-start="${st}" data-duration="${du}" data-track-index="1" data-width="1080" data-height="1920" ${extra}></div>`;
let html = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=1080, height=1920"/>
<script src="assets/gsap.min.js"></script>
<script src="assets/timing.js"></script>
<script src="assets/swiss.js"></script>
<style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:1080px;height:1920px;overflow:hidden;background:#f2efe8}#root{position:absolute;inset:0}</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${total}" data-width="1080" data-height="1920">
`;
names.forEach((n, i) => { html += host(n, "scene" + n, scenes[n].start, scenes[n].dur, `data-track-kind="graphics" style="z-index:${10 + i}"`) + "\n"; });
html += host("captions", "captions", 0, total, `data-track-kind="captions" style="z-index:60"`).replace('data-track-index="1"', 'data-track-index="2"') + "\n";
html += `  <audio id="voice" src="assets/voice.wav" data-start="0" data-duration="${total}" data-track-index="20" data-volume="1"></audio>\n`;
if (fs.existsSync("assets/music.wav")) html += `  <audio id="music" src="assets/music.wav" data-start="0" data-duration="${total}" data-track-index="21" data-volume="1"${plan.musicAuto ? ` data-automation='${JSON.stringify(plan.musicAuto)}'` : ""}></audio>\n`;
const lanes = [];
plan.sfx.forEach((s, i) => { let l = lanes.findIndex((e) => e <= s.t); if (l < 0) { l = lanes.length; lanes.push(0); } lanes[l] = s.t + s.d + 0.01; html += `  <audio id="sfx${i}" src="assets/sfx/${s.file}" data-start="${s.t}" data-duration="${s.d}" data-track-index="${22 + l}" data-volume="${s.v}"></audio>\n`; });
html += `</div>\n<script>window.__timelines = window.__timelines || {};</script>\n</body>\n</html>\n`;
fs.writeFileSync("index.html", html);
console.log(JSON.stringify(scenes));
