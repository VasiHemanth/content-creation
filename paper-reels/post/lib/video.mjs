// Video slides: an excerpt of a registered 9x16 reel, laid over a 4:5 blueprint sheet.
//
// The reel is scaled to full height (759 x 1350), centred (x 160), never cropped, so its captions stay visible. The
// sheet (a HyperFrames snapshot of the slide's own composition) shows in the two gutters. The overlay runs in RGB, which
// allows the odd width; the result is converted to yuv420p (BT.709, limited range) last.
// Output: MP4, 1080x1350, 30 fps, H.264 High, yuv420p, AAC 44.1 kHz stereo, +faststart. The reel's audio is kept: a mono
// source is copied to both channels at full level (not the -3 dB of a default up-mix), and the cut gets a 20 ms fade at
// each end so it cannot click.
import { FPS, H, VIDEO_W, VIDEO_X, W } from './constants.mjs';
import { ffmpeg, probe } from './media.mjs';

const FADE = 0.02;

/** Probe the source reel: { video, audio, duration } or throws. */
export function sourceInfo(src) {
  const p = probe(src);
  if (!p) throw new Error(`ffprobe cannot read the source video ${src}`);
  const video = p.streams.find((s) => s.codec_type === 'video'), audio = p.streams.find((s) => s.codec_type === 'audio') || null;
  if (!video) throw new Error(`${src} has no video stream`);
  return { video, audio, duration: +p.format.duration };
}

// setpts: after an input seek the first reel frame can sit a few milliseconds past 0 (the cut is not on a frame boundary), and the
// overlay would show the bare sheet until it arrives. Starting the reel's clock at its first frame removes that gap.
const videoChain = `[1:v]setpts=PTS-STARTPTS,scale=${VIDEO_W}:${H}:flags=lanczos:in_color_matrix=bt709:in_range=tv,format=gbrp[v];[0:v]format=gbrp[bg];[bg][v]overlay=x=${VIDEO_X}:y=0:format=gbrp`;

/** One composite frame (PNG): the sheet with the reel's frame at `at` seconds. Used for the contact sheet. */
export function composeFrame({ bg, src, at, out }) {
  ffmpeg(['-i', bg, '-ss', String(at), '-i', src, '-filter_complex', `${videoChain},format=rgb24[o]`, '-map', '[o]', '-frames:v', '1', out]);
  return out;
}

/** The excerpt as an MP4 slide. */
export function renderVideoSlide({ bg, src, from, to, out }) {
  const d = +(to - from).toFixed(3), info = sourceInfo(src);
  if (from < 0 || to > info.duration + 0.05) throw new Error(`excerpt ${from}..${to} s is outside the source video (${info.duration.toFixed(2)} s)`);
  const ch = info.audio ? +info.audio.channels : 0;
  const audioIn = info.audio ? ['-ss', String(from), '-t', String(d), '-i', src] : ['-f', 'lavfi', '-t', String(d), '-i', 'anullsrc=r=44100:cl=stereo'];
  const pan = ch === 1 ? ',pan=stereo|c0=c0|c1=c0' : '';
  const af = `[2:a]asetpts=PTS-STARTPTS,aresample=44100${pan},aformat=sample_fmts=fltp:channel_layouts=stereo,afade=t=in:st=0:d=${FADE},afade=t=out:st=${(d - FADE).toFixed(3)}:d=${FADE}[ao]`;
  ffmpeg(['-loop', '1', '-framerate', String(FPS), '-t', String(d), '-i', bg,
    '-ss', String(from), '-t', String(d), '-i', src, ...audioIn,
    '-filter_complex', `${videoChain},scale=out_color_matrix=bt709:out_range=tv,format=yuv420p[vo];${af}`,
    '-map', '[vo]', '-map', '[ao]', '-r', String(FPS), '-t', String(d),
    '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-threads', '1',
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
    '-c:a', 'aac', '-b:a', '160k', '-ar', '44100', '-ac', '2',
    '-fflags', '+bitexact', '-flags:v', '+bitexact', '-flags:a', '+bitexact', '-movflags', '+faststart', out]);
  return out;
}

export const videoGeometry = { W, H, x: VIDEO_X, w: VIDEO_W };
