const fs = require('fs');
const path = 'paper-reels/episodes/opera/scenes/';
fs.readdirSync(path).forEach(f => {
  if (f.endsWith('.html')) {
    const p = path + f;
    let content = fs.readFileSync(p, 'utf8');
    
    // Replace the old word logic
    content = content.replace(/const words = \(KIT\.data\(S\)\.text \|\| ""\)\.replace[^]*?catch \(e\) \{\}\n\s*\}\);/m, 
`const counts = {};
      const words = (KIT.data(S).text || "").replace(/[^\\w\\s]/g, '').split(' ').filter(Boolean);
      words.forEach((w) => {
         let wNorm = w.toLowerCase();
         let nth = counts[wNorm] || 0;
         counts[wNorm] = nth + 1;
         try {
           let t = KIT.cue(S, w, nth);
           tl.to('#' + S + '-text', { y: 20, duration: 0.15, yoyo: true, repeat: 1, ease: 'power1.inOut' }, t);
         } catch (e) {}
      });`);
      
    fs.writeFileSync(p, content);
  }
});
