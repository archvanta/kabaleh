"""Export generated reading-paper texture and photo fasteners; never touches photographs."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent
output = root / "public/images/stationery"
output.mkdir(parents=True, exist_ok=True)
Image.open(root / "artwork/continuous-paper.png").resize(
    (640, 640), Image.Resampling.LANCZOS
).save(output / "continuous-paper.webp", quality=88, method=6)

sheet = Image.open(root / "artwork/photo-fasteners.png").convert("RGBA")
width, height = sheet.size
for index, name in enumerate(("photo-pushpin", "photo-paperclip", "photo-tape")):
    cell = sheet.crop((round(index * width / 3), 0, round((index + 1) * width / 3), height))
    bounds = cell.getchannel("A").point(lambda alpha: 255 if alpha > 35 else 0).getbbox()
    cell = cell.crop(bounds)
    cell.thumbnail((220, 220), Image.Resampling.LANCZOS)
    cell.save(output / f"{name}.webp", quality=92, method=6)
