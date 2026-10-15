import json
import os

os.makedirs("paper-reels/episodes/opera/scenes", exist_ok=True)
with open("paper-reels/episodes/opera/storyboard.json") as f:
    sb = json.load(f)

for line in sb["lines"]:
    id = line["scene"]
    
    extra_html = ""
    extra_js = ""
    
    if id == "scene-10":
        extra_html = f"""
      <div id="{id}-hud"></div>
      <div id="{id}-stage"></div>
        """
        extra_js = f"""
      KIT.read(tl, {{ cam: '#{id}-cam', parent: '#{id}-stage', hud: '#{id}-hud', id: 'triggers', t: 0.2, x: 40, y: 860, width: 1000, zoom: 3.4, fx: 600, fy: 860, marks: [[0.5, 1.5], [1.6, 2.5]], circles: [{{ word: 'triggers', t: 1.0 }}] }});
        """
    elif id == "scene-13":
        extra_html = f"""
      <div id="{id}-hud"></div>
      <div id="{id}-stage"></div>
        """
        extra_js = f"""
      KIT.read(tl, {{ cam: '#{id}-cam', parent: '#{id}-stage', hud: '#{id}-hud', id: 'results', t: 0.2, x: 40, y: 860, width: 1000, zoom: 3.4, fx: 600, fy: 860, marks: [[0.5, 1.5]], circles: [{{ word: 'highest', t: 1.0 }}] }});
        """

    bind_attr = f'data-bind="{id}.text"'

    template = f"""<template id="{id}-template">
  <style>
    #root {{ position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; overflow: hidden; background: #111; color: white; }}
    #{id}-cam {{ position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; transform-origin: 540px 960px; }}
    #{id}-text {{ position: absolute; left: 100px; top: 1200px; width: 880px; font-size: 60px; text-align: center; color: var(--magenta); font-family: sans-serif; }}
    #{id}-box {{ position: absolute; left: 500px; top: 500px; width: 80px; height: 80px; background: cyan; border-radius: 40px; }}
  </style>
  <div id="root" data-composition-id="{id}" data-width="1080" data-height="1920">
    <div id="{id}-cam">
      <div id="{id}-text" {bind_attr}></div>
      <div id="{id}-box"></div>
      {extra_html}
    </div>
  </div>
  <script>
    (function () {{
      const S = '{id}', D = KIT.sceneDur(S);
      KIT.bind('#{id}-cam');
      const tl = gsap.timeline({{ paused: true }});
      
      tl.fromTo('#{id}-cam', {{ scale: 1 }}, {{ scale: 1.1, duration: D, ease: 'sine.inOut' }}, 0);
      tl.fromTo('#{id}-text', {{ opacity: 0, y: 50 }}, {{ opacity: 1, y: 0, duration: 0.5 }}, 0.0);
      
      const words = (KIT.scene(S).say || "").replace(/[^\\w\\s]/g, '').split(' ').filter(Boolean);
      words.forEach((w) => {{
         try {{
           let t = KIT.cue(S, w);
           tl.to('#{id}-box', {{ scale: 1.5, duration: 0.1, yoyo: true, repeat: 1, ease: 'power1.inOut' }}, t);
         }} catch (e) {{}}
      }});

      {extra_js}
      
      window.__timelines['{id}'] = tl;
    }})();
  </script>
</template>
"""
    with open(f"paper-reels/episodes/opera/scenes/{id}.html", "w") as out:
        out.write(template)

print("Done")
