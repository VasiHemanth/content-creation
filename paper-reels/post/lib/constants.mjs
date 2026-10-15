// Numbers and names shared by the builder, the QA gates and the validator. One place, so they cannot drift apart.
import path from 'node:path';
import { HANDLE } from '../../engine/brand.mjs';

export { HANDLE };
export const POST_DIR = path.resolve(import.meta.dirname, '..');          // paper-reels/post
export const REELS_DIR = path.resolve(POST_DIR, '..');                     // paper-reels
export const HF_DIR = path.join(REELS_DIR, 'hf');
export const ROOT_DIR = path.resolve(REELS_DIR, '..');                     // content-creation

export const W = 1080;
export const H = 1350;                                                    // 4:5
export const FORMAT = '4x5';
export const SLIDE_SECONDS = 1;                                           // every slide is a one second composition
export const MIN_SLIDES = 2;
export const MAX_SLIDES = 10;
export const MARGIN = 70;                                                 // px, text stays inside it
export const MIN_BODY_PX = 38;                                            // body text on a phone
export const MIN_HEAD_PX = 72;                                            // headings (.pk-h1, .pk-h2, h1, h2)
// Instagram crops the profile grid to 3:4. On a 1080x1350 slide that is the central 1012.5 px: x 33.75..1046.25, full height.
export const GRID_W = (H * 3) / 4;
export const GRID_X0 = (W - GRID_W) / 2;
export const GRID_X1 = GRID_X0 + GRID_W;

export const JPEG_QUALITY = 92;                                           // IJG-equivalent quantisation tables
export const MAX_IMAGE_BYTES = 8_000_000;                                 // the platform allows 8 MB; stay under in SI megabytes
export const MAX_VIDEO_S = 30;                                            // our own limit per video slide (SPEC)
export const VIDEO_W = 759;                                               // 9:16 scaled to full height, no crop
export const VIDEO_X = Math.floor((W - VIDEO_W) / 2);                     // 160
export const FPS = 30;

export const SLIDE_ID = /^[a-z][a-z0-9_-]{0,23}$/;
export const UNOFFICIAL_LABEL = /unofficial guide/i;
// Identity strings that must never be printed (the reels' QA bans the same words). The handle itself is HANDLE.
export const BANNED_IDENTITY = [/hemanthvasi/i, /instagram/i, /youtube/i, /threads/i];
