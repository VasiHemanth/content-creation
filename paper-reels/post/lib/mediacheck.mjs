// What the validator asks of the rendered files themselves (SPEC, "Gates (track A)" and "Video slides"). Each function
// returns a list of problems; an empty list means the file passed. Nothing here trusts a file name or the manifest.
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { FPS, H, MAX_IMAGE_BYTES, MAX_VIDEO_S, W } from './constants.mjs';
import { jpegInfo } from './jpeg.mjs';
import { brightShare, gray, probe } from './media.mjs';

export const BLANK_SHARE = 0.005;        // a slide needs at least 0.5% bright "ink" inside the margin to count as drawn

/** Decode the whole file; ffmpeg's error output (if any) is the problem. */
function decodeErrors(file) {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 1 << 26 });
  return r.status !== 0 ? [`ffmpeg cannot decode it (exit ${r.status})`] : String(r.stderr || '').trim() ? [`decoding reports: ${String(r.stderr).trim().split('\n')[0]}`] : [];
}

/** An image slide: a baseline JPEG, 1080x1350, 8-bit, 3 components, no embedded profile, complete, 8 MB or less, decodes. */
export function checkImageFile(file) {
  const P = [];
  if (!fs.existsSync(file)) return ['file is missing'];
  const buf = fs.readFileSync(file);
  if (buf.length === 0) return ['file is empty'];
  if (buf.length > MAX_IMAGE_BYTES) P.push(`${(buf.length / 1e6).toFixed(2)} MB is over the ${MAX_IMAGE_BYTES / 1e6} MB limit`);
  let info;
  try { info = jpegInfo(buf); } catch (e) { return [...P, e.message]; }
  if (!info.sof) P.push('no frame header found');
  else {
    if (info.sof.marker !== 0xc0 && info.sof.marker !== 0xc1) P.push(`not a baseline JPEG (frame marker FF${info.sof.marker.toString(16).toUpperCase()}; progressive and arithmetic coding are not accepted)`);
    if (info.sof.precision !== 8) P.push(`${info.sof.precision}-bit samples, expected 8`);
    if (info.sof.components !== 3) P.push(`${info.sof.components} colour component(s), expected 3 (YCbCr)`);
    if (info.sof.w !== W || info.sof.h !== H) P.push(`${info.sof.w}x${info.sof.h}, expected ${W}x${H}`);
  }
  if (!info.eoi) P.push('the file does not end with the JPEG end marker (truncated)');
  if (info.icc) P.push('carries an embedded colour profile; slides are plain sRGB with none');
  const p = probe(file, ['-show_streams']), v = p && p.streams && p.streams[0];
  if (!v || v.codec_name !== 'mjpeg') P.push(`ffprobe reads it as ${v ? v.codec_name : 'unreadable'}, not mjpeg`);
  else if (v.width !== W || v.height !== H) P.push(`ffprobe reads ${v.width}x${v.height}`);
  if (!P.length) P.push(...decodeErrors(file));
  return P;
}

/** First box offsets of an MP4: where moov and mdat start (faststart means moov comes first). */
export function mp4Layout(file) {
  const fd = fs.openSync(file, 'r'), size = fs.fstatSync(fd).size, head = Buffer.alloc(16), out = {};
  try {
    for (let off = 0; off + 8 <= size;) {
      fs.readSync(fd, head, 0, 16, off);
      let len = head.readUInt32BE(0); const type = head.toString('latin1', 4, 8);
      if (len === 1) len = Number(head.readBigUInt64BE(8)); else if (len === 0) len = size - off;
      if (!(type in out)) out[type] = off;
      if (len < 8) break;
      off += len;
    }
  } finally { fs.closeSync(fd); }
  return out;
}

/**
 * A video slide: 4:5 (1080x1350), H.264 High, yuv420p, 30 fps, AAC 44.1 kHz stereo, 30 s or less, faststart, decodes,
 * and its first frame shows something (the platform shows the first frame until the video plays).
 * Returns { problems, duration }.
 */
export function checkVideoFile(file, { videoBox = null } = {}) {
  const P = [];
  if (!fs.existsSync(file)) return { problems: ['file is missing'], duration: NaN };
  const p = probe(file);
  if (!p) return { problems: ['ffprobe cannot read the file'], duration: NaN };
  const v = p.streams.find((s) => s.codec_type === 'video'), a = p.streams.find((s) => s.codec_type === 'audio'), d = +p.format.duration;
  if (!v) return { problems: ['no video stream'], duration: d };
  if (v.codec_name !== 'h264') P.push(`video codec ${v.codec_name}, expected h264`);
  if (v.profile !== 'High') P.push(`H.264 profile ${v.profile}, expected High`);
  if (v.pix_fmt !== 'yuv420p') P.push(`pixel format ${v.pix_fmt}, expected yuv420p`);
  if (v.width !== W || v.height !== H) P.push(`${v.width}x${v.height}, expected ${W}x${H} (4:5)`);
  if (v.r_frame_rate !== `${FPS}/1`) P.push(`frame rate ${v.r_frame_rate}, expected ${FPS}/1`);
  if (!a) P.push('no audio stream (the reel audio is kept)');
  else {
    if (a.codec_name !== 'aac') P.push(`audio codec ${a.codec_name}, expected aac`);
    if (+a.sample_rate !== 44100) P.push(`audio sample rate ${a.sample_rate}, expected 44100`);
    if (+a.channels !== 2) P.push(`${a.channels} audio channel(s), expected stereo (2)`);
  }
  if (!(d > 0)) P.push('no duration');
  else if (d > MAX_VIDEO_S + 1e-6) P.push(`${d.toFixed(2)} s is over the ${MAX_VIDEO_S} s limit`);
  const lay = mp4Layout(file);
  if (!('moov' in lay) || !('mdat' in lay) || lay.moov > lay.mdat) P.push('moov is not before mdat (the file was not written with +faststart)');
  if (!P.length) P.push(...decodeErrors(file));
  // first frame: the area the reel covers must show drawn content, not a blank or black frame
  if (!P.length) {
    const crop = videoBox ? `crop=${videoBox.w}:${videoBox.h}:${videoBox.x}:0,` : '';
    const r = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-frames:v', '1', '-vf', `${crop}scale=190:338:flags=area,format=gray`, '-f', 'rawvideo', '-'], { maxBuffer: 1 << 24 });
    const g = r.stdout;
    if (!g || g.length !== 190 * 338) P.push('cannot decode the first frame');
    else if (brightShare(g, 190, 338, { t: 120, inset: 10 }) < BLANK_SHARE) P.push('the first frame is blank or black (start the excerpt where something is on screen)');
  }
  return { problems: P, duration: d };
}

/** Is this rendered image blank? Returns the bright share (0..1). */
export const imageBrightShare = (file) => brightShare(gray(file, 270, 338), 270, 338, { t: 120, inset: 15 });
