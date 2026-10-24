"""Measures that the card's on-screen rect is identical in every visible world at each look swap (the clones share one transform)."""
import asyncio, pathlib, sys, json
from playwright.async_api import async_playwright
comp = pathlib.Path("comp.html").resolve()
SWAPS = {"iris":4.14+0.3,"ripple":6.62+0.6,"whip":10.34+0.2,"plates":12.4,"flood":15.0}
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":1920,"height":1080})
        await pg.goto("file://"+str(comp)); await pg.evaluate("window.__ready")
        worst = 0
        for name, t in SWAPS.items():
            await pg.evaluate(f"window.__seek({t})")
            r = await pg.evaluate("""[...document.querySelectorAll('.world')].filter(w=>w.style.display!=='none').map(w=>{const c=w.querySelector('.card').getBoundingClientRect();return [c.x,c.y,c.width,c.height]})""")
            spread = max((max(a[i] for a in r)-min(a[i] for a in r)) for i in range(4)) if len(r)>1 else 0
            worst = max(worst, spread); print(f"{name:7s} t={t:5.2f} visible worlds {len(r)}  max card rect spread {spread:.3f}px")
        print("worst spread", round(worst,3), "px"); await b.close()
asyncio.run(main())
