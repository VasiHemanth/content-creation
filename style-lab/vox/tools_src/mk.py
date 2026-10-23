import sys
HEAD = '''<template>
<style>
/*@FONTS*/
#root{position:absolute;inset:0;overflow:hidden;background:#0b0b0b}
</style>
<div id="root" data-composition-id="scene%(n)s" data-width="1080" data-height="1920"></div>
<script>
(function () {
  var SC = TIMING.scenes.%(n)s, L = function (g) { return g - SC.start; };
  V.ready("%(n)s", function () { return V.fontsReady().then(function () {
    var root = document.getElementById("root"), C = V.C, cam = V.div("position:absolute;left:0;top:0;width:1080px;height:1920px", root), tl = gsap.timeline({ paused: true });
'''
TAIL = '''
    V.push(tl, cam, SC.dur, %(push)s);
    window.__timelines["scene%(n)s"] = tl;
  }); });
})();
</script>
</template>
'''
def write(n, body, push="1.07"):
    open(f"src/scene{n}.html", "w").write(HEAD % {"n": n} + body + TAIL % {"n": n, "push": push})
# ghost helper text used by bodies (declared once per scene)
GH = '''    var whip = function (el, t, dx, dy) { return V.ghostTitle(tl, el, { dx: dx || -420, dy: dy || 0, copies: 3, dur: .2 }, t); };
'''
exec(open("tools_src/bodies.py").read())
