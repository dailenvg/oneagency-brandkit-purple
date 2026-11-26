"""Build ONE Agency glass-style textures locally (Pillow + numpy), v2 identity (2026-11-20).

Outputs to public/kit/textures/ in the repo:
  halftone-arc (PNG + WebP 2048x1024 + SVG, Mint dots), grain tile (PNG 512x512, tileable, unchanged recipe),
  ground-violet-navy (JPG + WebP 1920x1080: flat Ultra Violet to Navy gradient with grain; the ground of the violet
  variant, replacing v1 violet-streaks without streaks, bokeh or glow).
Dropped from v1 (glow textures, banned in v2): rose-underglow, violet-streaks, ground-rose-glow.
Removed in v2 (client decision, 2026-11-20): the particle stream texture.
Changes from v1 (design/magnific/glass/scripts/textures.py): ROSE -> MINT, LILAC/violet -> Ultra Violet / Navy.
"""
import math
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

OUT = Path(sys.argv[1])
OUT.mkdir(parents=True, exist_ok=True)
RNG = np.random.default_rng(20261117)

MINT = (0, 250, 179)      # #00FAB3
WHITE = (255, 255, 255)
VIOLET = (98, 3, 208)     # #6203D0
NAVY = (2, 2, 87)         # #020257
VOID = (1, 1, 56)         # #010138


def name(n, w, h, ext):
    return OUT / f"one-agency_texture-{n}_{w}x{h}.{ext}"


def save_webp(img, path, q=82):
    img.save(path, "WEBP", quality=q, method=6)


# ---------------------------------------------------------------- halftone arc
def halftone_arc():
    W, H = 2048, 1024
    S = 3  # supersample
    cx, cy = W / 2, H * 1.02  # arc centre just below the canvas
    r_mid, band = 860.0, 250.0  # mid radius and band thickness
    spacing = 15.0
    rmax = spacing * 0.46
    dots = []
    row_h = spacing * math.sqrt(3) / 2
    y = 0.0
    row = 0
    while y < H:
        x = (spacing / 2 if row % 2 else 0.0)
        while x < W:
            dx, dy = x - cx, y - cy
            r = math.hypot(dx, dy)
            t = (r - r_mid) / (band / 2)  # -1..1 across the band
            if abs(t) < 1 and dy < 0:
                ang = math.degrees(math.atan2(-dy, dx))  # 0 right, 90 top, 180 left
                a = (ang - 90) / 78  # -1..1 across the sweep
                if abs(a) < 1:
                    radial = (1 - abs(t) ** 1.6)
                    # outer edge crisper, inner edge softer (matches refs: dots shrink toward both edges)
                    radial *= 1 - 0.25 * max(0.0, -t)
                    taper = math.cos(a * math.pi / 2) ** 1.2
                    k = radial * taper
                    rr = rmax * k
                    if rr > 0.55:
                        dots.append((x, y, rr, 0.55 + 0.45 * k))
            x += spacing
        y += row_h
        row += 1

    big = Image.new("RGBA", (W * S, H * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(big)
    for x, y, rr, op in dots:
        a = int(255 * op)
        d.ellipse([(x - rr) * S, (y - rr) * S, (x + rr) * S, (y + rr) * S], fill=MINT + (a,))
    img = big.resize((W, H), Image.LANCZOS)
    img.save(name("halftone-arc", W, H, "png"), optimize=True)
    save_webp(img, name("halftone-arc", W, H, "webp"))

    svg = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">',
           '<g fill="#00FAB3">']
    for x, y, rr, op in dots:
        svg.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{rr:.2f}" fill-opacity="{op:.2f}"/>')
    svg.append("</g></svg>")
    name("halftone-arc", W, H, "svg").write_text("".join(svg))
    return len(dots)


# ----------------------------------------------------------------- grain tile
def grain():
    N = 512
    n = RNG.normal(0, 1, (N, N)).astype(np.float32)
    # very light low-pass via wrap-around averaging keeps it tileable and less harsh
    n = (n * 2 + np.roll(n, 1, 0) + np.roll(n, 1, 1)) / 4
    n /= n.std()
    rgb = np.where(n[..., None] > 0, 255, 0).repeat(3, axis=2).astype(np.uint8)
    alpha = np.clip(np.abs(n) * 9, 0, 32).astype(np.uint8)  # max ~12.5% opacity
    img = Image.fromarray(np.dstack([rgb, alpha]), "RGBA")
    img.save(name("grain", N, N, "png"), optimize=True)


def dithered(arr):
    return np.clip(arr + RNG.uniform(-1.0, 1.0, arr.shape), 0, 255).astype(np.uint8)


def grain_layer(arr, amount=3.0):
    return arr + RNG.normal(0, amount, arr.shape[:2])[..., None]


# ------------------------------------------------- violet-variant ground (flat)
def ground_violet_navy():
    """Flat diagonal gradient: Ultra Violet top-left, through Navy, to Void bottom-right, with light grain.
    No streaks, bokeh, bloom or glow (replaces v1 violet-streaks)."""
    W, H = 1920, 1080
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    t = np.clip((x / W) * 0.7 + (y / H) * 0.3, 0, 1)[..., None]
    c0, c1, c2 = (np.array(c, np.float32) for c in (VIOLET, NAVY, VOID))
    w0 = np.clip(1 - t / 0.6, 0, 1)
    w2 = np.clip((t - 0.6) / 0.4, 0, 1)
    base = c0 * w0 + c1 * (1 - w0 - w2) + c2 * w2
    arr = grain_layer(base, 1.6)
    out = Image.fromarray(dithered(arr), "RGB")
    out.save(name("ground-violet-navy", W, H, "jpg"), quality=88, optimize=True, progressive=True)
    save_webp(out, name("ground-violet-navy", W, H, "webp"))


if __name__ == "__main__":
    print("halftone dots", halftone_arc())
    grain()
    ground_violet_navy()
    for p in sorted(OUT.glob("one-agency_texture-*")):
        print(p.name, p.stat().st_size)
