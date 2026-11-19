"""Build ONE Agency glass-style textures locally (Pillow + numpy).

Outputs to public/kit/textures/ in the repo:
  halftone-arc (PNG 2048x1024 + SVG), particle-stream (PNG 2048x768 + SVG),
  grain tile (PNG 512x512, tileable), rose under-glow (PNG 2048x768),
  violet-blue light-streak ground (JPG + WebP 1920x1080),
  near-black rose-glow ground (JPG + WebP 1920x1080).
"""
import math
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

OUT = Path(sys.argv[1])
OUT.mkdir(parents=True, exist_ok=True)
RNG = np.random.default_rng(20261117)

ROSE = (255, 160, 170)
WHITE = (255, 255, 255)
LILAC = (55, 141, 240)
GROUND = (1, 3, 15)


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
        d.ellipse([(x - rr) * S, (y - rr) * S, (x + rr) * S, (y + rr) * S], fill=ROSE + (a,))
    img = big.resize((W, H), Image.LANCZOS)
    img.save(name("halftone-arc", W, H, "png"), optimize=True)
    save_webp(img, name("halftone-arc", W, H, "webp"))

    svg = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">',
           '<g fill="#FFA0AA">']
    for x, y, rr, op in dots:
        svg.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{rr:.2f}" fill-opacity="{op:.2f}"/>')
    svg.append("</g></svg>")
    name("halftone-arc", W, H, "svg").write_text("".join(svg))
    return len(dots)


# ------------------------------------------------------------- particle stream
def particle_stream():
    W, H = 2048, 768
    S = 3
    cy = H / 2
    strands = 34
    pts = []
    lines = []
    for i in range(strands):
        u = (i / (strands - 1)) * 2 - 1  # -1..1 position in the ribbon
        phase = RNG.uniform(-0.25, 0.25)
        n = 170
        xs = np.linspace(-20, W + 20, n) + RNG.uniform(0, 12)
        strand_pts = []
        for j, x in enumerate(xs):
            p = x / W
            # ribbon: wide and loose on the left, gathers and lifts toward the right
            spread = 250 * (1 - 0.86 * max(0.0, p) ** 0.9) + 14
            wave = 120 * math.sin(2 * math.pi * (p * 1.15 + 0.1) + phase * 0.6) * (0.55 + 0.45 * p)
            y = cy + wave + u * spread * (0.85 + 0.15 * math.sin(6 * p + i))
            y += RNG.normal(0, 0.6)
            xj = x + RNG.normal(0, 0.8)
            edge = 1 - abs(u) ** 2  # strands near the ribbon edge are fainter
            fade_in = min(1.0, p / 0.12) if p > 0 else 0.0
            fade_out = min(1.0, (1 - p) / 0.08) if p < 1 else 0.0
            op = (0.25 + 0.75 * edge) * fade_in * fade_out * RNG.uniform(0.55, 1.0)
            r = (0.7 + 1.6 * edge * RNG.uniform(0.4, 1.0)) * (0.8 + 0.5 * p)
            col = tuple(int(WHITE[k] + (ROSE[k] - WHITE[k]) * min(1, max(0.0, p) ** 1.3 * 1.15)) for k in range(3))
            strand_pts.append((xj, y))
            if op > 0.04:
                pts.append((xj, y, r, op, col))
        if i % 3 == 1:
            lines.append((strand_pts, 0.14 * (1 - abs(u) ** 2)))

    big = Image.new("RGBA", (W * S, H * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(big)
    for spts, op in lines:
        for k in range(len(spts) - 1):
            p = spts[k][0] / W
            col = tuple(int(WHITE[c] + (ROSE[c] - WHITE[c]) * min(1, max(0, p))) for c in range(3))
            d.line([(spts[k][0] * S, spts[k][1] * S), (spts[k + 1][0] * S, spts[k + 1][1] * S)],
                   fill=col + (int(255 * op),), width=S)
    for x, y, r, op, col in pts:
        d.ellipse([(x - r) * S, (y - r) * S, (x + r) * S, (y + r) * S], fill=col + (int(255 * op),))
    img = big.resize((W, H), Image.LANCZOS)
    # soft glow: blurred copy under the dots
    glow = img.filter(ImageFilter.GaussianBlur(6))
    g = np.asarray(glow).astype(np.float32)
    g[..., 3] *= 0.9
    base = Image.fromarray(g.clip(0, 255).astype(np.uint8))
    out = Image.alpha_composite(base, img)
    out.save(name("particle-stream", W, H, "png"), optimize=True)
    save_webp(out, name("particle-stream", W, H, "webp"))

    svg = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">',
           '<defs><linearGradient id="s" x1="0" x2="1" y1="0" y2="0" gradientUnits="objectBoundingBox">'
           '<stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#FFA0AA"/></linearGradient></defs>',
           '<g fill="none" stroke-width="1">']
    for spts, op in lines:
        dpath = "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in spts[::2])
        svg.append(f'<path d="{dpath}" stroke="url(#s)" stroke-opacity="{op:.2f}"/>')
    svg.append("</g><g>")
    for x, y, r, op, col in pts:
        svg.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.2f}" fill="#{col[0]:02X}{col[1]:02X}{col[2]:02X}" fill-opacity="{op:.2f}"/>')
    svg.append("</g></svg>")
    name("particle-stream", W, H, "svg").write_text("".join(svg))
    return len(pts)


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


# ------------------------------------------------------------- rose under-glow
def under_glow():
    W, H = 2048, 768
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    nx = (x - W / 2) / (W * 0.40)
    ny = (y - H * 0.5) / (H * 0.30)
    d2 = nx ** 2 + ny ** 2
    a = 0.62 * np.exp(-d2 * 1.6) + 0.30 * np.exp(-d2 * 6.0)  # wide pool + brighter core
    a = np.clip(a, 0, 1)
    a = a * 255 + RNG.uniform(-0.5, 0.5, a.shape)  # dither against banding
    rgb = np.empty((H, W, 3), np.float32)
    core = np.exp(-d2 * 6.0)[..., None]
    rgb[:] = np.array(ROSE, np.float32) * (1 - 0.35 * core) + np.array(WHITE, np.float32) * 0.35 * core
    img = Image.fromarray(np.dstack([rgb, a]).clip(0, 255).astype(np.uint8), "RGBA")
    img.save(name("rose-underglow", W, H, "png"), optimize=True)
    save_webp(img, name("rose-underglow", W, H, "webp"))


def dithered(arr):
    return np.clip(arr + RNG.uniform(-1.0, 1.0, arr.shape), 0, 255).astype(np.uint8)


def grain_layer(arr, amount=3.0):
    return arr + RNG.normal(0, amount, arr.shape[:2])[..., None]


# --------------------------------------------------- violet-blue streak ground
def violet_streaks():
    W, H = 1920, 1080
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    # base: violet #2A004C top-left -> deep blue -> near-black #0E0F12 right
    t = np.clip((x / W) * 0.85 + (y / H) * 0.25, 0, 1)
    c0 = np.array([42, 0, 76], np.float32)
    c1 = np.array([16, 14, 58], np.float32)
    c2 = np.array([14, 15, 18], np.float32)
    w0 = np.clip(1 - t / 0.55, 0, 1)[..., None]
    w2 = np.clip((t - 0.45) / 0.55, 0, 1)[..., None]
    w1 = 1 - w0 - w2
    base = c0 * w0 + c1 * w1 + c2 * w2
    # soft blue bloom bottom-centre and violet corner glow
    blob = np.exp(-(((x - W * 0.62) / (W * 0.35)) ** 2 + ((y - H * 0.95) / (H * 0.45)) ** 2))[..., None]
    base += np.array([30, 40, 120], np.float32) * 0.55 * blob
    img = Image.fromarray(dithered(base), "RGB").convert("RGBA")

    S = 2
    layer = Image.new("RGBA", (W * S, H * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    # light streaks: long gentle curves sweeping from lower-left to upper-right
    for i in range(46):
        mix = RNG.uniform(0, 1)
        col = tuple(int(ROSE[k] * (1 - mix) + LILAC[k] * mix) for k in range(3))
        x0 = RNG.uniform(W * 0.35, W * 1.0)
        sl = RNG.uniform(1.3, 2.2)  # steep, like the reference
        bend = RNG.uniform(-120, 120)
        op = RNG.uniform(0.10, 0.55) * (1 if RNG.uniform() > 0.25 else 0.4)
        wdt = RNG.choice([1, 1, 1, 2, 2, 3])
        ptsl = []
        for s in np.linspace(0, 1, 60):
            yy = H * (1.05 - 1.15 * s)
            xx = x0 + (H - yy) / sl + bend * math.sin(math.pi * s)
            ptsl.append((xx * S, yy * S))
        # fade the streak in/out along its length by drawing segments
        for k in range(len(ptsl) - 1):
            s = k / (len(ptsl) - 1)
            f = math.sin(math.pi * min(1, max(0, (s - RNG.uniform(0, 0.1)) * 1.1))) ** 1.5
            d.line([ptsl[k], ptsl[k + 1]], fill=col + (int(255 * op * f),), width=int(wdt * S))
    sharp = layer.resize((W, H), Image.LANCZOS)

    def premul(im):
        a = np.asarray(im).astype(np.float32)
        return a[..., :3] * (a[..., 3:4] / 255.0)

    # additive light: crisp core + three glow radii
    light = premul(sharp) * 1.1
    for rad, k in ((3, 1.3), (10, 1.6), (28, 1.8)):
        light += premul(sharp.filter(ImageFilter.GaussianBlur(rad))) * k

    # bokeh: soft discs with a slightly brighter rim, added as light
    bok = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    db = ImageDraw.Draw(bok)
    for i in range(80):
        bx = RNG.uniform(W * 0.28, W)
        by = RNG.uniform(0, H)
        r = float(RNG.choice([1.5, 2, 3, 4, 6, 9, 13, 18]))
        mix = RNG.uniform(0, 1)
        col = tuple(int(ROSE[k] * (1 - mix) + (170, 190, 255)[k] * mix) for k in range(3))
        a = RNG.uniform(40, 120) * (1.6 if r < 4 else 1.0)
        db.ellipse([bx - r, by - r, bx + r, by + r], fill=col + (int(min(255, a * 0.6)),),
                   outline=col + (int(min(255, a)),), width=max(1, int(r * 0.18)))
    bokb = bok.filter(ImageFilter.GaussianBlur(1.2))
    light += premul(bokb) + premul(bok.filter(ImageFilter.GaussianBlur(8))) * 0.8
    base_rgb = np.asarray(img.convert("RGB")).astype(np.float32)
    comp = 255 - (255 - base_rgb) * (1 - np.clip(light, 0, 255) / 255)  # screen blend
    img = Image.fromarray(comp.clip(0, 255).astype(np.uint8))

    arr = grain_layer(np.asarray(img.convert("RGB")).astype(np.float32), 2.2)
    out = Image.fromarray(dithered(arr), "RGB")
    out.save(name("violet-streaks", W, H, "jpg"), quality=88, optimize=True, progressive=True)
    save_webp(out, name("violet-streaks", W, H, "webp"))


# ---------------------------------------------------- near-black rose-glow ground
def ground_rose_glow():
    W, H = 1920, 1080
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    base = np.zeros((H, W, 3), np.float32) + np.array(GROUND, np.float32)
    d_rose = ((x - W * 0.5) / (W * 0.42)) ** 2 + ((y - H * 0.80) / (H * 0.36)) ** 2
    d_lil = ((x - W * 0.86) / (W * 0.30)) ** 2 + ((y - H * 0.12) / (H * 0.40)) ** 2
    rose = np.exp(-d_rose * 1.4)[..., None]
    core = np.exp(-d_rose * 5.0)[..., None]
    lil = np.exp(-d_lil * 1.6)[..., None]
    base = 255 - (255 - base) * (1 - (np.array(ROSE, np.float32) / 255) * (0.34 * rose + 0.26 * core))
    base += (np.array(LILAC, np.float32) - base) * 0.07 * lil
    arr = grain_layer(base, 1.6)
    out = Image.fromarray(dithered(arr), "RGB")
    out.save(name("ground-rose-glow", W, H, "jpg"), quality=88, optimize=True, progressive=True)
    save_webp(out, name("ground-rose-glow", W, H, "webp"))


if __name__ == "__main__":
    print("halftone dots", halftone_arc())
    print("stream dots", particle_stream())
    grain()
    under_glow()
    violet_streaks()
    ground_rose_glow()
    for p in sorted(OUT.glob("one-agency_texture-*")):
        print(p.name, p.stat().st_size)
