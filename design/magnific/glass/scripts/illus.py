"""Build illustration variants (on-dark, transparent, on-light) at 1200x1200, PNG + WebP q82."""
import sys
from pathlib import Path
from PIL import Image, ImageFilter
import numpy as np

SRC_DARK, SRC_CUT, OUT = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
OUT.mkdir(parents=True, exist_ok=True)
N = 1200
SUBJECTS = ["magnifier", "seo-document", "review-star", "cro-window", "growth-stairs",
            "profile-stack", "toggle-check", "lead-flow"]


def save(img, stem):
    png = OUT / f"{stem}_{N}x{N}.png"
    webp = OUT / f"{stem}_{N}x{N}.webp"
    img.save(png, optimize=True)
    img.save(webp, "WEBP", quality=82, method=6)
    return png, webp


for s in SUBJECTS:
    base = f"one-agency_illustration-{s}"
    dark = Image.open(SRC_DARK / f"{s}.png").convert("RGB").resize((N, N), Image.LANCZOS)
    save(dark, f"{base}_on-dark")

    cut = Image.open(SRC_CUT / f"{s}.png").convert("RGBA").resize((N, N), Image.LANCZOS)
    # clean near-invisible alpha noise so edges stay crisp and files stay small
    a = np.asarray(cut).copy()
    a[..., 3][a[..., 3] < 3] = 0
    cut = Image.fromarray(a)
    save(cut, f"{base}_transparent")

    # on-light: #ffffff ground + soft ink shadow (contact + ambient)
    alpha = cut.split()[3]
    light = Image.new("RGBA", (N, N), (255, 255, 255, 255))
    for dy, blur, op in ((10, 8, 0.16), (34, 36, 0.14)):
        sh = Image.new("RGBA", (N, N), (1, 3, 15, 0))
        m = alpha.point(lambda v, op=op: int(v * op))
        sh.putalpha(m)
        sh = sh.transform((N, N), Image.AFFINE, (1, 0, 0, 0, 1, -dy)).filter(ImageFilter.GaussianBlur(blur))
        light.alpha_composite(sh)
    light.alpha_composite(cut)
    save(light.convert("RGB"), f"{base}_on-light")

for p in sorted(OUT.glob("*")):
    im = Image.open(p)
    print(f"{p.name}\t{im.size[0]}x{im.size[1]}\t{im.mode}\t{p.stat().st_size//1024}KB")
