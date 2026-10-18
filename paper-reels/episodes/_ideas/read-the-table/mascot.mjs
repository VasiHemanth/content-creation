// Generates the "Lens" mascot poses as SVG files into ./mascot. Run: node mascot.mjs
import fs from 'node:fs';
const NAVY = '#0b1f3a', ORANGE = '#ffb347', MINT = '#7ee2b8', CREAM = '#f4efe3', CORAL = '#ff6b6b';
const arm = (d) => `<path d="${d}" fill="none" stroke="${NAVY}" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${ORANGE}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`;
const hand = (x, y) => `<circle cx="${x}" cy="${y}" r="9" fill="${CREAM}" stroke="${NAVY}" stroke-width="4"/>`;
const mouths = {
  smile: `<path d="M84 142 Q100 156 116 142" fill="none" stroke="${MINT}" stroke-width="5" stroke-linecap="round"/>`,
  flat: `<path d="M88 146 L112 146" fill="none" stroke="${MINT}" stroke-width="5" stroke-linecap="round"/>`,
  open: `<path d="M86 140 Q100 162 114 140 Z" fill="${MINT}"/>`,
  hmm: `<path d="M86 148 Q96 140 104 146 T116 144" fill="none" stroke="${MINT}" stroke-width="5" stroke-linecap="round"/>`,
};
const POSES = {
  neutral: { mouth: 'smile', left: arm('M52 130 Q34 156 42 182') + hand(42, 184), right: arm('M148 130 Q166 156 158 182') + hand(158, 184), extra: '' },
  point: { mouth: 'open',
    left: arm('M52 130 Q34 156 42 182') + hand(42, 184),
    right: arm('M148 126 Q176 118 204 100') + hand(206, 98) + `<path d="M206 98 L262 66" stroke="${NAVY}" stroke-width="9" stroke-linecap="round"/><path d="M206 98 L262 66" stroke="${CORAL}" stroke-width="4" stroke-linecap="round"/><circle cx="264" cy="65" r="7" fill="${CORAL}" stroke="${NAVY}" stroke-width="3"/>`, extra: '', vb: '0 0 280 250' },
  shrug: { mouth: 'flat',
    left: arm('M52 134 Q22 140 20 108') + hand(20, 104), right: arm('M148 134 Q178 140 180 108') + hand(180, 104),
    extra: `<path d="M70 98 L90 104 M130 104 L150 98" stroke="${NAVY}" stroke-width="0"/>` },
  think: { mouth: 'hmm',
    left: arm('M52 130 Q34 156 42 182') + hand(42, 184),
    right: arm('M148 132 Q158 150 128 156') + hand(124, 156),
    extra: `<text x="150" y="58" font-family="Georgia,serif" font-weight="700" font-size="46" fill="${MINT}" stroke="${NAVY}" stroke-width="2">?</text>` },
  check: { mouth: 'smile',
    left: arm('M52 130 Q34 156 42 182') + hand(42, 184),
    right: arm('M148 130 Q172 118 170 86') + hand(170, 82),
    extra: `<g transform="translate(150 20)"><circle cx="22" cy="22" r="20" fill="${MINT}" stroke="${NAVY}" stroke-width="4"/><path d="M12 22 L20 30 L33 14" fill="none" stroke="${NAVY}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></g>` },
};
const svg = (name, p) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${p.vb || '0 0 200 250'}" width="${p.vb ? 280 : 200}" height="250" role="img" aria-label="Lens the mascot, ${name} pose">
  <ellipse cx="100" cy="236" rx="52" ry="7" fill="#000" opacity=".25"/>
  <rect x="68" y="196" width="24" height="30" rx="10" fill="${ORANGE}" stroke="${NAVY}" stroke-width="5"/>
  <rect x="108" y="196" width="24" height="30" rx="10" fill="${ORANGE}" stroke="${NAVY}" stroke-width="5"/>
  <line x1="100" y1="88" x2="100" y2="64" stroke="${NAVY}" stroke-width="6" stroke-linecap="round"/>
  <circle cx="100" cy="60" r="9" fill="${MINT}" stroke="${NAVY}" stroke-width="5"/>
  <rect x="48" y="84" width="104" height="120" rx="42" fill="${ORANGE}" stroke="${NAVY}" stroke-width="6"/>
  <rect x="60" y="98" width="80" height="66" rx="22" fill="${NAVY}"/>
  <circle cx="80" cy="120" r="7" fill="${MINT}"/>
  <circle cx="118" cy="120" r="19" fill="${NAVY}" stroke="${CREAM}" stroke-width="5"/>
  <circle cx="118" cy="120" r="9" fill="${MINT}"/><circle cx="114" cy="116" r="3" fill="#fff"/>
  <path d="M133 135 L146 150" stroke="${CREAM}" stroke-width="6" stroke-linecap="round"/>
  ${mouths[p.mouth]}
  <rect x="78" y="172" width="44" height="22" rx="8" fill="${CREAM}" stroke="${NAVY}" stroke-width="3"/>
  <path d="M84 188 L92 180 L100 185 L108 176 L116 183" fill="none" stroke="${CORAL}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  ${p.left}${p.right}${p.extra}
</svg>`;
for (const [n, p] of Object.entries(POSES)) fs.writeFileSync(new URL(`./mascot/lens-${n}.svg`, import.meta.url), svg(n, p));
console.log('wrote', Object.keys(POSES).map((n) => `lens-${n}.svg`).join(', '));
