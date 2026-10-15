// End card for new episodes: paper name, arXiv id, authors, and the single handle.
import { C, txt, bg, marker, robot, eo3, eob, eio, seg, cl } from './core.mjs';
import { HANDLE } from './brand.mjs';

/** Draw at local time t (seconds). authors: string[] (rendered two per line). */
export function endCard(t, { name, arxivId, authors = [] }) {
  bg('paper');
  const sc = eob(seg(t, 0.2, 1.0));
  marker(200, 880, 552, 56, eio(seg(t, 0.8, 1.8)), C.green, 0.5);
  txt(name, 540, 520, { font: 'Marker', size: 180, sc, alpha: cl(sc * 2) });
  txt(`arXiv ${arxivId}`, 540, 660, { font: 'Mono', size: 56, alpha: eo3(seg(t, 1.0, 1.6)) });
  for (let i = 0; i < authors.length; i += 2) txt(authors.slice(i, i + 2).join(' · '), 540, 740 + (i / 2) * 45, { font: 'Mono', size: 30, alpha: eo3(seg(t, 1.3, 1.9)) * 0.8 });
  txt(HANDLE, 540, 1100, { font: 'Brush', size: 130, rot: -0.03, reveal: eo3(seg(t, 1.8, 2.8)), shadow: { col: C.red, dx: 5, dy: 5 } });
  robot(540, 1500, 13, { eye: 'happy', up: Math.abs(Math.sin(t * 5)) * seg(t, 2.8, 3.2), t });
}
