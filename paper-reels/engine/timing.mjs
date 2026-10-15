// Single source for line timing. The renderer and the validator must agree, or the frame-count check is meaningless.
export const LEAD = 0.25, TAIL = 0.5, END_TAIL = 1.6, FPS = 30;
export const lineDur = (vd, isLast) => LEAD + vd + (isLast ? END_TAIL : TAIL);
