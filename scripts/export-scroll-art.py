from PIL import Image
from pathlib import Path
root=Path(__file__).resolve().parent.parent
out=root/'public/images/stationery'
im=Image.open(root/'artwork/scroll-ink.png').convert('RGBA');w,h=im.size
for i in range(3):
 a=im.crop((i*w//3,0,(i+1)*w//3,h));box=a.getchannel('A').point(lambda p:255 if p>210 else 0).getbbox();a=a.crop((0,box[1],a.width,box[3]));a.thumbnail((160,900),Image.Resampling.LANCZOS);a.save(out/f'painted-thread-{i+1}.webp',quality=92,method=6)
im=Image.open(root/'artwork/scroll-bridge.png').convert('RGBA');im.thumbnail((1200,400),Image.Resampling.LANCZOS);im.save(out/'painted-bridge.webp',quality=92,method=6)
im=Image.open(root/'artwork/scroll-mats.png').convert('RGBA');w,h=im.size
for i,n in enumerate(['layered-mat','journal-mat','folded-mat']):
 a=im.crop((0,i*h//3,w,(i+1)*h//3));a.thumbnail((1000,400),Image.Resampling.LANCZOS);a.save(out/(n+'.webp'),quality=88,method=6)
# Registration keeps adjacent tiles at exactly the same horizontal anchor.
for i in range(1,4):
 p=out/f'painted-thread-{i}.webp';a=Image.open(p).convert('RGBA');w,h=a.size
 def center(y):
  row=[x for x in range(w) if a.getpixel((x,y))[3]>180]
  return (min(row)+max(row))/2 if row else w/2
 start=center(0);end=center(h-1)
 a=a.transform(a.size,Image.Transform.AFFINE,(1,(end-start)/h,start-w/2,0,1,0),Image.Resampling.BICUBIC)
 a.save(p,quality=93,method=6)
a=Image.open(out/'painted-thread-1.webp').convert('RGBA')
tail=a.crop((0,0,a.width,20));w,h=tail.size
row=[x for x in range(w) if tail.getpixel((x,h-1))[3]>180];end=(min(row)+max(row))/2
start=w/2;tail=tail.transform(tail.size,Image.Transform.AFFINE,(1,(end-start)/h,0,0,1,0),Image.Resampling.BICUBIC)
tail.save(out/'painted-tail.webp',quality=93,method=6)
a=a.resize((64,128));sheet=Image.new('RGBA',(1600,5120))
for i in range(1000):
 f=a.copy();f.paste((0,0,0,0),(0,round(128*(i+1)/1000),64,128));sheet.alpha_composite(f,((i%25)*64,(i//25)*128))
sheet.save(out/'thread-1000-review.webp',quality=83,method=5)
Image.open(root/'artwork/autumn-table.png').save(out/'autumn-table.webp',quality=86,method=6)
