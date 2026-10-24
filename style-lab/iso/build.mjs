// iso build: timing.json -> assets/timing.js, events.json (for audio), compositions/*.html, index.html
import fs from "node:fs";
const T = JSON.parse(fs.readFileSync("timing.json", "utf8"));
const total = Math.round(T.duration * 100) / 100;
const words = T.lines.flatMap((l) => l.words.map((w, k) => ({ ...w, line: l.id, k })));
const TIMING = { total, lines: T.lines, words };
fs.writeFileSync("assets/timing.js", "window.TIMING=" + JSON.stringify(TIMING) + ";\n");
// run the pure model in node to list the story's events (for the audio plan) and check the counts
globalThis.TIMING = TIMING;
await import("./assets/model.js?" + Date.now());
const ISO = globalThis.ISO;
fs.writeFileSync("assets/events.json", JSON.stringify({ events: ISO.events(), B: ISO.B, E: ISO.E, story: ISO.story(), tally: ISO.tally(), released: ISO.releaseCount }, null, 1));
const ff = (fam, w, f) => `@font-face{font-family:"${fam}";font-weight:${w};src:url("assets/fonts/${f}.woff2") format("woff2")}`;
const fonts = [ff("Space Grotesk", 500, "space-grotesk-latin-500-normal"), ff("Space Grotesk", 700, "space-grotesk-latin-700-normal")].join("\n");
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
<script src="assets/three.min.js"></script>
<script src="assets/timing.js"></script>
<script src="assets/model.js"></script>
<script src="assets/world.js"></script>
<style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:1080px;height:1920px;overflow:hidden;background:#dfe6f0}#root{position:absolute;inset:0}</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${total}" data-width="1080" data-height="1920">
`;
html += host("world", 0, total, 1, 'data-track-kind="graphics" style="z-index:1"') + "\n";
html += host("hud", 0, total, 2, 'data-track-kind="graphics" style="z-index:5"') + "\n";
html += host("captions", 0, total, 3, 'data-track-kind="captions" style="z-index:9"') + "\n";
html += `  <audio id="voice" src="assets/voice.wav" data-start="0" data-duration="${total}" data-track-index="20" data-volume="1"></audio>\n`;
if (fs.existsSync("assets/music.wav")) html += `  <audio id="music" src="assets/music.wav" data-start="0" data-duration="${total}" data-track-index="21" data-volume="1"${plan.musicAuto ? ` data-automation='${JSON.stringify(plan.musicAuto)}'` : ""}></audio>\n`;
const lanes = [];
plan.sfx.forEach((s, i) => { let l = lanes.findIndex((e) => e <= s.t); if (l < 0) { l = lanes.length; lanes.push(0); } lanes[l] = s.t + s.d + 0.01; html += `  <audio id="sfx${i}" src="assets/sfx/${s.file}" data-start="${s.t}" data-duration="${s.d}" data-track-index="${22 + l}" data-volume="${s.v}"></audio>\n`; });
html += `</div>\n<script>window.__timelines = window.__timelines || {};</script>\n</body>\n</html>\n`;
fs.writeFileSync("index.html", html);
console.log("built", total, "s;", "released cubes", ISO.releaseCount, "tally", JSON.stringify(ISO.tally()));
