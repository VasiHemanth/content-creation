// clay build: timing.json -> assets/timing.js, compositions/*.html (from src/), index.html
import fs from "node:fs";
const T = JSON.parse(fs.readFileSync("timing.json", "utf8"));
const total = Math.round(T.duration * 100) / 100;
const words = T.lines.flatMap((l) => l.words.map((w, k) => ({ ...w, line: l.id, k })));
fs.writeFileSync("assets/timing.js", "window.TIMING=" + JSON.stringify({ total, lines: T.lines, words }) + ";\n");
const fonts = ["500", "600", "700"].map((w) => `@font-face{font-family:"Fredoka";font-weight:${w};src:url("assets/fonts/fredoka-latin-${w}-normal.woff2") format("woff2")}`).join("\n");
fs.mkdirSync("compositions", { recursive: true });
for (const f of fs.readdirSync("src")) fs.writeFileSync("compositions/" + f, fs.readFileSync("src/" + f, "utf8").replace("/*@FONTS*/", fonts));
const plan = fs.existsSync("assets/audio-plan.json") ? JSON.parse(fs.readFileSync("assets/audio-plan.json", "utf8")) : { sfx: [], musicAuto: null };
const host = (id, st, du, z, extra = "") => `  <div id="${id}" class="clip" data-composition-id="${id}" data-composition-src="compositions/${id}.html" data-start="${st}" data-duration="${du}" data-track-index="${z}" data-width="1080" data-height="1920" ${extra}></div>`;
let html = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=1080, height=1920"/>
<script src="assets/gsap.min.js"></script>
<script src="assets/vendor/three.min.js"></script>
<script src="assets/timing.js"></script>
<script src="assets/font.js"></script>
<script src="assets/clay.js"></script>
<script src="assets/world.js"></script>
<script src="assets/story.js"></script>
<style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:1080px;height:1920px;overflow:hidden;background:#4d8c8a}#root{position:absolute;inset:0}</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${total}" data-width="1080" data-height="1920">
`;
html += host("world", 0, total, 1, `data-track-kind="graphics" style="z-index:10"`) + "\n";
html += host("captions", 0, total, 2, `data-track-kind="captions" style="z-index:60"`) + "\n";
html += `  <audio id="voice" src="assets/voice.wav" data-start="0" data-duration="${total}" data-track-index="20" data-volume="1"></audio>\n`;
if (fs.existsSync("assets/music.wav")) html += `  <audio id="music" src="assets/music.wav" data-start="0" data-duration="${total}" data-track-index="21" data-volume="1"${plan.musicAuto ? ` data-automation='${JSON.stringify(plan.musicAuto)}'` : ""}></audio>\n`;
const lanes = [];
plan.sfx.forEach((s, i) => { let l = lanes.findIndex((e) => e <= s.t); if (l < 0) { l = lanes.length; lanes.push(0); } lanes[l] = s.t + s.d + 0.01; html += `  <audio id="sfx${i}" src="assets/sfx/${s.file}" data-start="${s.t}" data-duration="${s.d}" data-track-index="${22 + l}" data-volume="${s.v}"></audio>\n`; });
html += `</div>\n<script>window.__timelines = window.__timelines || {};</script>\n</body>\n</html>\n`;
fs.writeFileSync("index.html", html);
console.log("total", total);
