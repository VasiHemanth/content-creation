// node --test paper-reels/post/tests/media.test.mjs
// The encoders: JPEG at quality 92 with the right headers and colours, and the video slide compositor on a synthetic reel.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { estimateQuality, ijgTable, jpegInfo, pngToJpeg, readJpegInfo } from '../lib/jpeg.mjs';
import { checkImageFile, checkVideoFile } from '../lib/mediacheck.mjs';
import { ffmpeg, mad, probe, sha256File } from '../lib/media.mjs';
import { renderVideoSlide } from '../lib/video.mjs';
import { fakePng, rm, tmp } from './helpers.mjs';

// tests exercise the gate itself, so they switch it on whatever hf/ste.json says
import { PROFILE as STE_PROFILE } from '../../hf/bin/ste.mjs';
STE_PROFILE.enforce = true;
const px = (file, x, y) => [...ffmpeg(['-i', file, '-frames:v', '1', '-vf', `format=rgb24,crop=1:1:${x}:${y}`, '-f', 'rawvideo', '-'])];

test('IJG tables: quality 92 scales the standard table by 0.16 and clamps at 1', () => {
  const base = Array(64).fill(100);
  assert.deepEqual(new Set(ijgTable(base, 92)), new Set([16]));
  assert.deepEqual(new Set(ijgTable([2, 3], 92)), new Set([1]));
  assert.deepEqual(new Set(ijgTable(base, 50)), new Set([100]));
});

test('pngToJpeg: baseline, 8-bit, 3 components, JFIF, no profile, IJG-equivalent quality 92, decodes, and the colours hold', () => {
  const d = tmp();
  try {
    const png = path.join(d, 'a.png'), jpg = path.join(d, 'a.jpg');
    // drawn in RGB so the PNG holds exactly these values (a yuv colour source would round them)
    ffmpeg(['-f', 'lavfi', '-i', 'nullsrc=s=1080x1350:d=1,format=rgb24', '-vf', 'drawbox=x=0:y=0:w=1080:h=1350:color=0x0b2a4a:t=fill,drawbox=x=100:y=100:w=400:h=300:color=0xff6b6b:t=fill,drawbox=x=600:y=600:w=300:h=300:color=0x7be3b0:t=fill', '-frames:v', '1', png]);
    pngToJpeg(png, jpg);
    const info = readJpegInfo(jpg);
    assert.equal(info.sof.marker, 0xc0, 'baseline');
    assert.deepEqual([info.sof.precision, info.sof.components, info.sof.w, info.sof.h], [8, 3, 1080, 1350]);
    assert.equal(info.jfif, true); assert.equal(info.icc, false); assert.equal(info.eoi, true);
    assert.ok(Math.abs(estimateQuality(info) - 92) <= 1, `estimated quality ${estimateQuality(info)}`);
    assert.deepEqual(checkImageFile(jpg), []);
    // sRGB in, sRGB out: flat areas of the sheet colour, coral and mint come back within a couple of levels
    for (const [x, y, rgb] of [[50, 50, [11, 42, 74]], [300, 250, [255, 107, 107]], [750, 750, [123, 227, 176]]]) {
      const got = px(jpg, x, y), want = px(png, x, y);
      assert.deepEqual(want, rgb, 'the source PNG has the expected colour');
      assert.ok(got.every((v, i) => Math.abs(v - rgb[i]) <= 3), `at ${x},${y} the JPEG reads ${got}, expected about ${rgb}`);
    }
    const again = path.join(d, 'b.jpg');
    pngToJpeg(png, again);
    assert.equal(sha256File(jpg), sha256File(again), 'the same PNG gives the same bytes');
  } finally { rm(d); }
});

test('jpegInfo refuses what is not a JPEG', () => {
  assert.throws(() => jpegInfo(Buffer.from('\x89PNG\r\n\x1a\n')), /not a JPEG/);
  assert.throws(() => jpegInfo(Buffer.alloc(2)), /not a JPEG/);
});

// ---- the video slide compositor ----

function fakeReel(file, { seconds = 4, channels = 1 } = {}) {
  ffmpeg(['-f', 'lavfi', '-i', `testsrc2=s=1080x1920:r=30:d=${seconds}`, '-f', 'lavfi', '-i', `sine=frequency=440:sample_rate=44100:d=${seconds}`, '-ac', String(channels), '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv', '-preset', 'veryfast', '-crf', '20', '-c:a', 'aac', '-shortest', file]);
}
const meanDb = (f) => +(spawnSync('ffmpeg', ['-i', f, '-af', 'volumedetect', '-vn', '-f', 'null', '-'], { encoding: 'utf8' }).stderr.match(/mean_volume: (-?[\d.]+)/) || [])[1];
const gray = (file, t, crop) => ffmpeg(['-ss', String(t), '-i', file, '-frames:v', '1', '-vf', `${crop}scale=190:338:flags=area,format=gray`, '-f', 'rawvideo', '-']);

test('renderVideoSlide: 1080x1350 H.264 High, stereo AAC, faststart, a visible first frame, the reel uncropped at x 160', () => {
  const d = tmp();
  try {
    const bg = path.join(d, 'bg.png'), reel = path.join(d, 'reel.mp4'), out = path.join(d, 'out.mp4');
    fakePng(bg, { kind: 'blank' });
    fakeReel(reel);
    renderVideoSlide({ bg, src: reel, from: 1.23, to: 3.0, out });       // 1.23 s is not on a frame boundary
    const { problems, duration } = checkVideoFile(out, { videoBox: { x: 160, w: 759, h: 1350 } });
    assert.deepEqual(problems, []);
    assert.ok(Math.abs(duration - 1.77) < 0.06, `duration ${duration}`);
    const a = probe(out).streams.find((s) => s.codec_type === 'audio');
    assert.equal(+a.channels, 2); assert.equal(+a.sample_rate, 44100);
    // the first frame already shows the reel (an overlay that starts late would show the bare sheet)
    assert.ok(mad(gray(out, 0, 'crop=759:1350:160:0,'), gray(reel, 1.23, '')) < 4, 'frame 0 is the reel at 1.23 s');
    // geometry: x 159 is the sheet, x 160 is the reel; the right edge of the reel is x 918
    assert.ok(px(out, 100, 600).every((v, i) => Math.abs(v - px(bg, 100, 600)[i]) <= 4), 'the gutter shows the sheet');
    assert.notDeepEqual(px(out, 500, 600), px(out, 100, 600), 'the middle shows the reel');
    // the mono source is copied to both channels at full level: no 3 dB loss
    assert.ok(Math.abs(meanDb(out) - meanDb(reel)) < 1.5, `level ${meanDb(out)} dB vs ${meanDb(reel)} dB`);
    // no clock or random seed in the output: the same inputs give the same bytes
    const again = path.join(d, 'again.mp4');
    renderVideoSlide({ bg, src: reel, from: 1.23, to: 3.0, out: again });
    assert.equal(sha256File(out), sha256File(again));
  } finally { rm(d); }
});

test('renderVideoSlide: a stereo source stays stereo, an excerpt outside the reel is refused', () => {
  const d = tmp();
  try {
    const bg = path.join(d, 'bg.png'), reel = path.join(d, 'reel.mp4'), out = path.join(d, 'out.mp4');
    fakePng(bg, { kind: 'blank' });
    fakeReel(reel, { seconds: 2, channels: 2 });
    renderVideoSlide({ bg, src: reel, from: 0, to: 1, out });
    assert.equal(+probe(out).streams.find((s) => s.codec_type === 'audio').channels, 2);
    assert.throws(() => renderVideoSlide({ bg, src: reel, from: 1, to: 5, out }), /outside the source video/);
  } finally { rm(d); }
});
