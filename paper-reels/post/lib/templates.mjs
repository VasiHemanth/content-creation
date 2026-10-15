// Built-in slide templates. A video slide is a 4:5 blueprint sheet with the 9:16 reel laid over its middle, so the
// sheet shows only in two 160 px gutters. The default template prints the slide's data in them, turned on its side:
//   data.title            left gutter, reads bottom to top
//   data.handle | note    right gutter, reads top to bottom (the handle belongs on the last slide)
// A post may replace it with its own slides/<id>.html (any bare <template>, same rules as an image slide).
import { H, W } from './constants.mjs';

export function videoSlideTemplate(id, data = {}) {
  const has = (k) => typeof data[k] === 'string' || typeof data[k] === 'number';
  const right = has('handle') ? 'handle' : has('note') ? 'note' : null;
  return `<template id="${id}-template">
  <div id="root" data-composition-id="${id}" data-width="${W}" data-height="${H}">
    <div class="pk-vframe" data-bleed></div>
    <div class="pk-vlabel pk-vleft" data-bind="${id}.title"></div>${right ? `
    <div class="pk-vlabel pk-vright${right === 'handle' ? ' pk-vhandle' : ''}" data-bind="${id}.${right}"></div>` : ''}
  </div>
</template>
`;
}
