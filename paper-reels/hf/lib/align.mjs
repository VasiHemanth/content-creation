// Word timing for the spoken text (`say`). An ASR pass (whisper) gives timed tokens, but it writes "32.4%" where
// the script says "thirty two point four percent" and "LLM" where it says "L L M". So the ASR tokens are used as
// anchors (exact or near matches, including one ASR token standing for several script words that spell the same
// letters), and the script words between anchors share the anchors' time by letter count.

export const norm = (w) => String(w).toLowerCase().replace(/[^a-z0-9]/g, '');

// Edit distance, small strings only.
function lev(a, b) {
  const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}
const near = (a, b) => a === b ? 2 : (a.length >= 4 && b.length >= 4 && lev(a, b) <= 1) ? 1.4 : 0;

/**
 * @param {string[]} say  spoken words, in order
 * @param {{text:string,start:number,end:number}[]} asr  timed tokens from the ASR pass
 * @param {number} wavDur  length of the audio file in seconds
 * @returns {{i:number,w:string,a:number,b:number,anchor:boolean}[]}  seconds from the start of the audio
 */
export function alignWords(say, asr, wavDur) {
  const S = say.map(norm), A = asr.map((t) => norm(t.text));
  const n = S.length, m = A.length, K = 6;
  const out = say.map((w, k) => ({ i: k, w, a: 0, b: 0, anchor: false }));
  const first = m ? asr[0].start : 0, last = m ? asr[m - 1].end : wavDur;
  const spread = (i0, i1, t0, t1) => {          // share [t0,t1] among script words i0..i1-1 by letter count
    if (i0 >= i1) return;
    const wts = []; for (let k = i0; k < i1; k++) wts.push(Math.max(1, S[k].length) + 1);
    const tot = wts.reduce((x, y) => x + y, 0); let t = t0;
    for (let k = i0; k < i1; k++) { const d = (t1 - t0) * wts[k - i0] / tot; out[k].a = t; out[k].b = t + d; t += d; }
  };

  // best[i][j] = best score aligning S[i..] with A[j..]
  const best = Array.from({ length: n + 1 }, () => new Float64Array(m + 1));
  const move = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(null));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) {
    let b = best[i + 1][j], mv = ['s', 1];                                   // skip a script word
    if (best[i][j + 1] > b) { b = best[i][j + 1]; mv = ['a', 1]; }           // skip an ASR token
    const one = S[i] ? near(S[i], A[j]) : 0;
    if (one) { const v = one + best[i + 1][j + 1]; if (v > b) { b = v; mv = ['m', 1]; } }
    // one ASR token standing for several script words: "llm" for L L M, "deepswe" for Deep S W E
    for (let k = 2, joined = S[i]; k <= K && i + k <= n; k++) {
      joined += S[i + k - 1];
      if (!A[j].startsWith(joined)) break;
      if (joined === A[j]) { const v = 2 + k * 0.5 + best[i + k][j + 1]; if (v > b) { b = v; mv = ['m', k]; } }
    }
    best[i][j] = b; move[i][j] = mv;
  }
  const anchors = []; let i = 0, j = 0;
  while (i < n && j < m) {
    const mv = move[i][j]; if (!mv) break;
    if (mv[0] === 'm') { anchors.push({ i0: i, i1: i + mv[1], j }); i += mv[1]; j += 1; }
    else if (mv[0] === 's') i += 1; else j += 1;
  }
  if (!anchors.length) { spread(0, n, first, Math.max(last, first + 0.1 * n)); return out; }

  for (const an of anchors) { spread(an.i0, an.i1, asr[an.j].start, asr[an.j].end); for (let k = an.i0; k < an.i1; k++) out[k].anchor = true; }
  // Gaps: script words with no anchor, between anchor g-1 and anchor g (g = 0 and g = anchors.length are the ends).
  for (let g = 0; g <= anchors.length; g++) {
    const prev = anchors[g - 1], next = anchors[g];
    const i0 = prev ? prev.i1 : 0, i1 = next ? next.i0 : n;
    if (i0 >= i1) continue;
    const j0 = prev ? prev.j + 1 : 0, j1 = next ? next.j : m;               // unmatched ASR tokens j0..j1-1
    let t0, t1;
    if (j0 < j1) { t0 = asr[j0].start; t1 = asr[j1 - 1].end; }
    else { t0 = prev ? asr[prev.j].end : first; t1 = next ? asr[next.j].start : Math.max(last, t0); }
    if (t1 < t0 + 0.04 * (i1 - i0)) t1 = t0 + 0.04 * (i1 - i0);
    spread(i0, i1, t0, t1);
  }
  // monotone repair: a word never starts before the one before it
  for (let k = 1; k < out.length; k++) if (out[k].a < out[k - 1].a) { const d = out[k].b - out[k].a; out[k].a = out[k - 1].a; out[k].b = out[k].a + d; }
  return out;
}
