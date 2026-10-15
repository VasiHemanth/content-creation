"""Crop only the nine quoted source words from genuine source PDF pixels.
Run from repository root with paper-reels/.venv/bin/python. No re-typesetting.
"""
import json
from pathlib import Path
import pypdfium2 as pdfium
D=Path(__file__).resolve().parent
job=json.loads((D/'evidence.json').read_text());pdf=pdfium.PdfDocument(str((D/job['pdf']).resolve()));out={}
(D/'evidence').mkdir(exist_ok=True)
for item in job['items']:
 page=pdf[item['page']-1];tp=page.get_textpage();pw,ph=page.get_size();frag=item['find'][0]
 hit=tp.search(frag,match_case=True).get_next()
 if not hit:raise ValueError((item['id'],frag,'not found'))
 rects=[tp.get_rect(k) for k in range(tp.count_rects(*hit))]
 l,bo,r,t=min(x[0] for x in rects),min(x[1] for x in rects),max(x[2] for x in rects),max(x[3] for x in rects)
 rects=[(l,bo,r,t)];left,right,bottom,top=l-1,r+1,bo-4,t+4
 im=page.render(scale=7,crop=(left,bottom,pw-right,ph-top)).to_pil();im.save(D/'evidence'/f"{item['id']}.png")
 W,H=right-left,top-bottom
 def norm(v):a,b,c,d=v;return {'x':(a-left)/W,'y':(top-d)/H,'w':(c-a)/W,'h':(d-b)/H}
 circles={}
 for word in item['circle']:
  search=tp.search(word,match_case=True,match_whole_word=True)
  while True:
   h=search.get_next()
   if not h:raise ValueError('No circle match')
   rs=[tp.get_rect(k) for k in range(tp.count_rects(*h))];rec=(min(x[0] for x in rs),min(x[1] for x in rs),max(x[2] for x in rs),max(x[3] for x in rs))
   if rec[0]>=left and rec[2]<=right and rec[1]>=bottom and rec[3]<=top:circles[word]=norm(rec);break
 text=tp.get_text_bounded(left,bottom,right,top).strip()
 if text.rstrip(",")!=frag:raise ValueError(('Extra prose',text,frag))
 out[item['id']]={'img':f"evidence/{item['id']}.png",'w':im.width,'h':im.height,'page':item['page'],'rects':[norm(rects[0])],'circles':circles,'text':text,'source_pdf_rect':[left,bottom,right,top]}
(D/'evidence/manifest.json').write_text(json.dumps(out,indent=2));print(out)
