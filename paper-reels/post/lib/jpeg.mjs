// JPEG: encoding at quality 92 with ffmpeg, and reading a file's header back (SOF, tables, ICC) for the validator.
//
// ffmpeg's mjpeg encoder takes an integer -q:v: 2 gives IJG quality about 91 and 1 about 95, so 92 is not reachable that way.
// The encoder does accept its own quantisation tables. The tables below are the IJG tables (Annex K of the JPEG standard)
// scaled for quality 92, passed times 8 because ffmpeg divides by 8 at -q:v 1. ffmpeg pins the DC step at 8, so the result
// is "IJG-equivalent tables, estimated quality 92", which estimateQuality() reports.
// Colour: the PNG is sRGB. JFIF is BT.601 full range, so the conversion says so explicitly; nothing is embedded and an
// untagged JPEG is read as sRGB. 4:4:4 keeps coloured text edges sharp.
import fs from 'node:fs';
import { JPEG_QUALITY } from './constants.mjs';
import { ffmpeg } from './media.mjs';

const ZZ = [0,1,8,16,9,2,3,10,17,24,32,25,18,11,4,5,12,19,26,33,40,48,41,34,27,20,13,6,7,14,21,28,35,42,49,56,57,50,43,36,29,22,15,23,30,37,44,51,58,59,52,45,38,31,39,46,53,60,61,54,47,55,62,63];
const LUMA = [16,11,10,16,24,40,51,61,12,12,14,19,26,58,60,55,14,13,16,24,40,57,69,56,14,17,22,29,51,87,80,62,18,22,37,56,68,109,103,77,24,35,55,64,81,104,113,92,49,64,78,87,103,121,120,101,72,92,95,98,112,100,103,99];
const CHROMA = [17,18,24,47,99,99,99,99,18,21,26,66,99,99,99,99,24,26,56,99,99,99,99,99,47,66,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99];

export function ijgTable(base, quality) {
  const s = quality < 50 ? 5000 / quality : 200 - quality * 2;
  return base.map((b) => Math.min(255, Math.max(1, Math.floor((b * s + 50) / 100))));
}
const matrix = (base, q) => ijgTable(base, q).map((v) => v * 8).join(',');

// ffmpeg's encoder writes a bare baseline JPEG (no APP0). Readers cope, but a JFIF header says "YCbCr, BT.601, full range,
// square pixels" outright, which is what the conversion above produced. 18 bytes, the same for every file.
const JFIF = Buffer.from([0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00]);
function ensureJfif(file) {
  const b = fs.readFileSync(file);
  if (b[0] === 0xff && b[1] === 0xd8 && !(b[2] === 0xff && b[3] === 0xe0)) fs.writeFileSync(file, Buffer.concat([b.subarray(0, 2), JFIF, b.subarray(2)]));
}

/** PNG in, JPEG out (1080x1350 or whatever the PNG is). */
export function pngToJpeg(png, jpg, quality = JPEG_QUALITY) {
  ffmpeg(['-i', png, '-vf', 'scale=out_color_matrix=bt601:out_range=pc,format=yuvj444p', '-c:v', 'mjpeg', '-qmin', '1', '-q:v', '1',
    '-intra_matrix', matrix(LUMA, quality), '-chroma_intra_matrix', matrix(CHROMA, quality), '-fflags', '+bitexact', '-flags:v', '+bitexact', '-frames:v', '1', jpg]);
  ensureJfif(jpg);
}

/** Read the markers of a JPEG: { soi, sof: { marker, precision, w, h, components }, tables, icc, eoi }. Throws on a file that is not a JPEG. */
export function jpegInfo(buf) {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) throw new Error('not a JPEG (missing the FF D8 start marker)');
  const out = { sof: null, tables: [], icc: false, jfif: false, eoi: buf[buf.length - 2] === 0xff && buf[buf.length - 1] === 0xd9 };
  let i = 2;
  while (i + 4 <= buf.length) {
    if (buf[i] !== 0xff) { i++; continue; }
    const m = buf[i + 1];
    if (m === 0xff) { i++; continue; }
    if (m === 0xd8 || m === 0x01 || (m >= 0xd0 && m <= 0xd7)) { i += 2; continue; }
    const len = buf.readUInt16BE(i + 2), seg = buf.subarray(i + 4, i + 2 + len);
    if (m === 0xdb) { let p = 0; while (p < seg.length) { const pq = seg[p] >> 4, id = seg[p] & 15; p++; const t = []; for (let k = 0; k < 64; k++) { t.push(pq ? seg.readUInt16BE(p) : seg[p]); p += pq ? 2 : 1; } out.tables[id] = t; } }
    if (m === 0xe0 && seg.subarray(0, 4).toString('latin1') === 'JFIF') out.jfif = true;
    if (m === 0xe2 && seg.subarray(0, 11).toString('latin1') === 'ICC_PROFILE') out.icc = true;
    if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) out.sof = { marker: m, precision: seg[0], h: seg.readUInt16BE(1), w: seg.readUInt16BE(3), components: seg[5] };
    if (m === 0xda) break;
    i += 2 + len;
  }
  return out;
}

/** IJG quality estimate from the first (luma) table: what a JPEG library would call the quality of these tables. */
export function estimateQuality(info) {
  const t = info.tables[0];
  if (!t) return null;
  let sum = 0;
  for (let k = 0; k < 64; k++) sum += (100 * t[k]) / LUMA[ZZ[k]];
  const s = sum / 64;
  return s <= 100 ? Math.round((200 - s) / 2) : Math.round(5000 / s);
}

export const readJpegInfo = (file) => jpegInfo(fs.readFileSync(file));
