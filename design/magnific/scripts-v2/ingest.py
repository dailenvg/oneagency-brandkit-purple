"""Ingest Magnific export zips into the repo.
usage: python -I ingest.py <dl_dir> <out_dir> <base1> <base2> ...
dl_dir holds png.zip and jpg.zip; pages are matched to bases by trailing page number in the zip entry names.
Each base is like one-agency_template-social_square_1080x1080 (size parsed from the name and verified).
"""
import sys, os, re, zipfile, io
from PIL import Image

dl, out, bases = sys.argv[1], sys.argv[2], sys.argv[3:]
os.makedirs(out, exist_ok=True)

def entries(zpath):
    z = zipfile.ZipFile(zpath)
    items = []
    for n in z.namelist():
        m = re.search(r"-(\d+)\.(png|jpe?g)$", n)
        if m and "/" not in n and ".." not in n:
            items.append((int(m.group(1)), n))
    items.sort()
    return z, items

zp, pngs = entries(os.path.join(dl, "png.zip"))
jz = os.path.join(dl, "jpg.zip")
zj, jpgs = entries(jz) if os.path.exists(jz) else (None, None)
jpgs = jpgs or [(0, None)] * len(pngs)
assert len(pngs) == len(bases) == len(jpgs), (len(pngs), len(jpgs), len(bases))
for (pi, pn), (ji, jn), base in zip(pngs, jpgs, bases):
    w, h = map(int, re.search(r"_(\d+)x(\d+)$", base).group(1, 2))
    im = Image.open(io.BytesIO(zp.read(pn)))
    im.load()
    assert im.size == (w, h), (base, im.size)
    im_rgb = im.convert("RGB")
    im_rgb.save(os.path.join(out, base + ".png"), optimize=True)
    jim = (Image.open(io.BytesIO(zj.read(jn))) if jn else im_rgb); jim.load()
    assert jim.size == (w, h), (base, "jpg", jim.size)
    jim.convert("RGB").save(os.path.join(out, base + ".jpg"), quality=85, optimize=True, progressive=True)
    im_rgb.save(os.path.join(out, base + ".webp"), quality=82, method=6)
    sizes = [os.path.getsize(os.path.join(out, base + e)) // 1024 for e in (".png", ".jpg", ".webp")]
    print(f"{base}: {w}x{h} png {sizes[0]}K jpg {sizes[1]}K webp {sizes[2]}K")
