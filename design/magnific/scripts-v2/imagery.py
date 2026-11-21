"""Starter-library crops for the v2 imagery (same names and sizes as v1).
usage: python -I imagery.py <dl_dir> <out_dir>
dl_dir holds <subject>.png (the 2048x2048 Magnific renders). Writes, per subject:
  one-agency_image-<subject>_master.{jpg,webp} 2048x2048, and 1080x1080, 1080x1350, 1080x1920, 1200x628 crops.
Crops are centred horizontally; FOCUS_Y moves the vertical centre for the wide crops so faces stay in frame.
JPG q85 progressive, WebP q82 (as v1). LANCZOS resampling.
"""
import sys
from pathlib import Path
from PIL import Image

SRC, OUT = Path(sys.argv[1]), Path(sys.argv[2])
OUT.mkdir(parents=True, exist_ok=True)
SUBJECTS = ["resort-guests", "cruise-booking", "sales-agent", "franchise-owner", "healthcare-front-desk",
            "admissions", "orlando-night", "small-business-owner"]
SIZES = [(1080, 1080), (1080, 1350), (1080, 1920), (1200, 628)]
FOCUS_Y = {"resort-guests": 0.42, "franchise-owner": 0.45, "healthcare-front-desk": 0.45, "sales-agent": 0.45}


def crop(im, w, h, fy):
    W, H = im.size
    if w / h >= W / H:
        cw, ch = W, round(W * h / w)
    else:
        cw, ch = round(H * w / h), H
    x0 = (W - cw) // 2
    y0 = min(max(0, round(fy * H - ch / 2)), H - ch)
    return im.crop((x0, y0, x0 + cw, y0 + ch)).resize((w, h), Image.LANCZOS)


def save(im, stem):
    im.save(OUT / f"{stem}.jpg", quality=85, optimize=True, progressive=True)
    im.save(OUT / f"{stem}.webp", "WEBP", quality=82, method=6)


for s in SUBJECTS:
    im = Image.open(SRC / f"{s}.png").convert("RGB")
    assert im.size == (2048, 2048), (s, im.size)
    save(im, f"one-agency_image-{s}_master")
    for w, h in SIZES:
        save(crop(im, w, h, FOCUS_Y.get(s, 0.5)), f"one-agency_image-{s}_{w}x{h}")
    print(s, "ok")
