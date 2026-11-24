from PIL import Image, ImageEnhance
from pathlib import Path
import math
root=Path(__file__).resolve().parent.parent
out=root/'public/images/stationery'
out.mkdir(parents=True,exist_ok=True)
src=Image.open(root/'artwork/envelope-layers.png').convert('RGBA')
def cut(a,b):
 im=src.crop((a,0,b,724)); alpha=im.getchannel('A').point(lambda p: p if p>95 else 0); im.putalpha(alpha); return im.crop(alpha.getbbox())
body=cut(0,724).resize((490,308),Image.Resampling.LANCZOS)
flap=cut(724,1448).resize((490,184),Image.Resampling.LANCZOS)
seal=Image.open(root/'public/images/stationery/wax-seal.webp').convert('RGBA').resize((54,54),Image.Resampling.LANCZOS)
letter=cut(1448,2172).resize((350,450),Image.Resampling.LANCZOS)
def ease(t):
 t=max(0,min(1,t)); return t*t*(3-2*t)
frames=[]
for i in range(100):
 t=i/99; im=Image.new('RGBA',(600,728)); opening=ease(t/.46); cosine=math.cos(opening*math.pi)
 h=max(1,round(184*abs(cosine))); f=flap.resize((490,h),Image.Resampling.LANCZOS)
 if cosine<0: f=f.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
 f=ImageEnhance.Brightness(f).enhance(.84+.16*abs(cosine))
 if cosine>0.02:
  wax=seal.resize((54,max(1,round(54*cosine))),Image.Resampling.LANCZOS)
  f.alpha_composite(wax,(218,max(0,h-round(60*cosine))))
 if cosine<0: im.alpha_composite(f,(55,335-h))
 # Paper slides from inside the pocket, occluded by its front face.
 rise=ease((t-.36)/.6)
 paper=Image.new('RGBA',im.size); paper.alpha_composite(letter,(125,round(385-315*rise)))
 paper.paste((0,0,0,0),(0,643,600,728)); im.alpha_composite(paper)
 im.alpha_composite(body,(55,335))
 if cosine>=0: im.alpha_composite(f,(55,335))
 frames.append(im)
frames[0].save(out/'envelope-closed.webp',quality=88,method=6)
frames[-1].save(out/'envelope-open.webp',quality=88,method=6)
frames[0].save(out/'envelope-opening.webp',save_all=True,append_images=frames[1:],duration=30,loop=1,quality=78,method=4,minimize_size=True,allow_mixed=True)
sheet=Image.new('RGB',(1800,2190),'#fff7e9')
for i,im in enumerate(frames):
 small=im.resize((180,219),Image.Resampling.LANCZOS); sheet.paste(small,((i%10)*180,(i//10)*219),small)
sheet.save(out/'envelope-100-frames.webp',quality=87,method=6)
print([(p.name,p.stat().st_size) for p in out.glob('envelope-*') if p.name in ['envelope-closed.webp','envelope-open.webp','envelope-opening.webp','envelope-100-frames.webp']])
with Image.open(out/'envelope-opening.webp') as check: print('frames',check.n_frames,'loop',check.info.get('loop'))
