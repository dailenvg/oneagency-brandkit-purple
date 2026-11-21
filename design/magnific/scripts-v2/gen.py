"""Layout generator for ONE Agency Magnific designs, v2 identity (2026-11-20).
Prints designs_add_blocks JSON for one page spec: python run.py <spec-id> ...
All coordinates absolute; text metrics measured from the kit's own TTFs (public/kit/fonts).

Changes from v1 (design/magnific/scripts/gen.py):
- Palette: Navy #020257 ground, Mint #00FAB3, Ultra Violet #6203D0 / Violet light #A08CEC, Raised #132A6E,
  Text 2 #C2CBDE. Rose, lilac and #01030F are gone.
- Type: Unbounded 600 for headlines, accent words and stat numbers; Geist for everything else. Metal and Lato
  are retired. The accent word is the same face and size as the headline, filled with the Mint to Violet-light
  gradient (Ultra Violet itself is too weak on Navy), so the v1 Metal baseline offset is no longer needed.
- No halo glow (v1 Page.halo). The corner device is now "orbit" (from Nova's Frames in orbit): thin Mint to
  Violet-light ellipses with one lit stretch each, flat strokes, no blur, clipped to the page.
- CTA: Mint pill (textBackground, cornerRadius -1) with Navy text. Panels use the Nova radius 24.
- Logos: the v2 masters uploaded as creations (on-navy variants for the Navy ground).
"""
import json, sys, math
from PIL import ImageFont

FONTS = "/Users/dailenvazquez/Projects/One Agency/oneagency-brandkit-purple/public/kit/fonts/one-agency_font_"
FILES = {("Geist", 400): "geist-400", ("Geist", 500): "geist-500", ("Geist", 600): "geist-600",
         ("Geist", 700): "geist-700", ("Unbounded", 500): "unbounded-500", ("Unbounded", 600): "unbounded-600",
         ("Unbounded", 700): "unbounded-700"}
# (ascent, box height) per 1px of font size, as the Designer renders a single line. Geist measured in v1 (hhea
# 1005/-295). Unbounded re-measured in the Designer for v2 (see log-v2.md): hhea 995/-245 -> 0.995 / 1.24.
MET = {"Geist": (1.01, 1.31), "Unbounded": (0.995, 1.24)}
HL_LS = -0.02   # headline tracking, em (src/data/ad-styles.ts)
_cache = {}

def font(fam, w, s):
    k = (fam, w, round(s * 4))
    if k not in _cache:
        _cache[k] = ImageFont.truetype(FONTS + FILES[(fam, w)] + ".ttf", max(1, round(s)))
    return _cache[k]

def tw(t, fam, w, s, ls=0.0):
    return font(fam, w, s).getlength(t) * (s / max(1, round(s))) + ls * s * max(0, len(t) - 1)

NAVY, WHITE, MINT, VIOLET, VIOLET_L, TEXT2, RAISED, SURFACE2 = "#020257", "#FFFFFF", "#00FAB3", "#6203D0", "#A08CEC", "#C2CBDE", "#132A6E", "#071A63"
GROUND = NAVY
GRAD = {"type": "linear", "angle": 0, "stops": [{"color": MINT, "position": 0}, {"color": VIOLET_L, "position": 1}]}
LOGO = {  # v2 creation ids of the uploaded on-navy masters, aspect w/h
    "horizontal": ("w4a1Vhc7EI", 3840 / 429), "stacked": ("kseCZeN16B", 1920 / 890), "mark": ("9ZHgBqUNYZ", 960 / 644),
}

def wrap(t, fam, w, s, maxw, ls=0.0):
    words, lines, cur = t.split(" "), [], ""
    for wd in words:
        c = (cur + " " + wd).strip()
        if tw(c, fam, w, s, ls) <= maxw or not cur:
            cur = c
        else:
            lines.append(cur); cur = wd
    lines.append(cur)
    return lines

def mix(t, a=MINT, b=VIOLET_L):
    a = [int(a[i:i+2], 16) for i in (1, 3, 5)]; b = [int(b[i:i+2], 16) for i in (1, 3, 5)]
    return "#" + "".join(f"{round(x + (y - x) * t):02X}" for x, y in zip(a, b))

class Page:
    def __init__(self, W, H, page):
        self.W, self.H, self.page, self.b = W, H, str(page), []

    def add(self, **kw):
        kw["page"] = self.page
        self.b.append(kw)

    def text(self, name, t, x, y, fam="Geist", w=400, s=20, color=WHITE, maxw=None, ls=0.0, lh=1.3, case=None, align=None, extra=None):
        """Returns (height, width). maxw None -> autoWidth single line."""
        blk = dict(type="text", name=name, text=t, fontFamily=fam, fontWeight=w, fontSize=round(s, 1), x=round(x, 1), y=round(y, 1))
        asc, box = MET[fam]
        if case: blk["textCase"] = case
        if ls: blk["letterSpacing"] = ls
        if align: blk["align"] = align
        if color == "grad": blk["gradient"] = GRAD
        else: blk["color"] = color
        tt = t.upper() if case == "uppercase" else t
        if maxw is None:
            width = tw(tt, fam, w, s, ls) + 2
            blk["width"] = math.ceil(width); blk["autoWidth"] = True
            h = box * s
        else:
            lines = wrap(tt, fam, w, s, maxw, ls)
            blk["width"] = round(maxw); blk["lineHeight"] = lh
            width = max(tw(l, fam, w, s, ls) for l in lines)
            h = box * s + (len(lines) - 1) * lh * s
        if extra: blk.update(extra)
        self.add(**blk)
        return h, width

    def orbit(self, cx, cy, rx, ry, stroke=2.0, x0=0, y0=0, x1=None, y1=None, base=0.30, name="Orbit lines"):
        """Nova orbit device: two tilted ribbons of two parallel ellipses, Mint to Violet-light, each with one lit
        stretch (22% of the way round). Flat strokes only. The Designer refuses stroke-dasharray and transforms
        are avoided, so every ellipse and lit stretch is a sampled polyline in page space. The SVG covers
        [x0,x1]x[y0,y1] of the page and clips what falls outside."""
        x1 = self.W if x1 is None else x1
        y1 = self.H if y1 is None else y1
        bw, bh = x1 - x0, y1 - y0
        sp = max(4.0, stroke * 4.5)

        def pts(a, b, tilt, t0, t1, n):
            c, s_ = math.cos(math.radians(tilt)), math.sin(math.radians(tilt))
            out = []
            for i in range(n + 1):
                t = t0 + (t1 - t0) * i / n
                ex, ey = a * math.cos(t), b * math.sin(t)
                out.append((cx - x0 + ex * c - ey * s_, cy - y0 + ex * s_ + ey * c))
            return "M" + " L".join(f"{px:.0f} {py:.0f}" for px, py in out)  # whole px keeps the markup small

        parts = []
        for r, tilt in enumerate((-14, 10)):
            for k in range(2):
                a = rx + k * sp - r * rx * 0.1
                b = ry + k * sp + r * ry * 0.28
                parts.append(f'<path d="{pts(a, b, tilt, 0, 2 * math.pi, 120)}Z" stroke-opacity="{base:.2f}"/>')
                t0 = (1.15 if r else 0.35) * math.pi + k * 0.04
                parts.append(f'<path d="{pts(a, b, tilt, t0, t0 + 0.22 * 2 * math.pi, 36)}" stroke-linecap="round"/>')
        svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{bw:.0f}" height="{bh:.0f}" viewBox="0 0 {bw:.1f} {bh:.1f}">'
               f'<defs><linearGradient id="o" gradientUnits="userSpaceOnUse" x1="{cx - x0 - rx:.1f}" y1="0" x2="{cx - x0 + rx:.1f}" y2="0">'
               f'<stop offset="0" stop-color="{MINT}"/><stop offset="1" stop-color="{VIOLET_L}"/></linearGradient></defs>'
               f'<g fill="none" stroke="url(#o)" stroke-width="{stroke:.1f}" stroke-linejoin="round">' + "".join(parts) + "</g></svg>")
        self.add(type="svg", name=name, svgMarkup=svg, x=round(x0, 1), y=round(y0, 1), width=round(bw, 1), height=round(bh, 1))

    def logo(self, kind, x, y, w=None, h=None):
        cid, asp = LOGO[kind]
        if w is None: w = h * asp
        h = w / asp
        self.add(type="image", name=f"Logo {kind} on-navy", creationIdentifier=cid, x=round(x, 1), y=round(y, 1), width=round(w, 1))
        return w, h

    def bar(self, x, y, w, h):
        self.add(type="shape", name="Gradient bar", x=round(x), y=round(y), width=round(w), height=max(2, round(h)), cornerRadius=max(1, round(h / 2)), gradient=GRAD)

    def headline(self, lines, x, y, S, pitch=1.08, name="Headline"):
        """lines: list of lists of (text, 'g'|'m'); 'm' = accent word (same face, gradient fill).
        Returns height, maxwidth."""
        sp = tw(" ", "Unbounded", 600, S)
        maxw = 0
        for i, segs in enumerate(lines):
            ty = y + i * pitch * S
            cx = x
            for j, (t, k) in enumerate(segs):
                if j: cx += sp
                if k == "g":
                    _, wd = self.text(f"{name} line {i+1}", t, cx, ty, "Unbounded", 600, S, WHITE, ls=HL_LS)
                else:
                    _, wd = self.text(f"{name} accent (Unbounded, Mint-to-Violet gradient)", t, cx, ty, "Unbounded", 600, S, "grad", ls=HL_LS)
                cx += wd - 2
            maxw = max(maxw, cx - x)
        h = (len(lines) - 1) * pitch * S + MET["Unbounded"][1] * S
        return h, maxw

    def pill(self, t, x, y, fs, padx=None, pady=None, name="CTA pill"):
        """x,y = outer top-left of the pill. Mint fill, Navy text. Returns (w, h) of the pill."""
        padx = padx if padx is not None else round(fs * 1.25)
        pady = pady if pady is not None else round(fs * 0.62)
        _, wd = self.text(name, t, x + padx, y + pady, "Geist", 600, fs, NAVY,
                          extra={"textBackground": {"color": MINT, "cornerRadius": -1, "paddingX": padx, "paddingY": pady}})
        return wd + 2 * padx, 1.31 * fs + 2 * pady

    @staticmethod
    def pill_size(t, fs, padx=None, pady=None):
        padx = padx if padx is not None else round(fs * 1.25)
        pady = pady if pady is not None else round(fs * 0.62)
        return tw(t, "Geist", 600, fs) + 2 + 2 * padx, 1.31 * fs + 2 * pady

    def line(self, pts, stroke, name="Result line", dot=True, t=(0.0, 1.0)):
        """Polyline in page coordinates, Mint to Violet-light stroke, ending on a Mint dot with a ring."""
        pad = stroke * 6
        xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
        bx, by = min(xs) - pad, min(ys) - pad
        bw, bh = max(xs) - bx + pad, max(ys) - by + pad
        d = "M" + " L".join(f"{p[0]-bx:.1f} {p[1]-by:.1f}" for p in pts)
        ex, ey = pts[-1][0] - bx, pts[-1][1] - by
        dots = (f'<circle cx="{ex:.1f}" cy="{ey:.1f}" r="{stroke*2.6:.1f}" fill="none" stroke="{MINT}" stroke-opacity="0.5" stroke-width="{max(1,stroke*0.6):.1f}"/>'
                f'<circle cx="{ex:.1f}" cy="{ey:.1f}" r="{stroke*1.5:.1f}" fill="{MINT}"/>') if dot else ""
        svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{bw:.0f}" height="{bh:.0f}" viewBox="0 0 {bw:.1f} {bh:.1f}">'
               f'<defs><linearGradient id="g" gradientUnits="userSpaceOnUse" x1="{min(xs)-bx:.1f}" y1="0" x2="{max(xs)-bx:.1f}" y2="0">'
               f'<stop offset="0" stop-color="{mix(t[0])}"/><stop offset="1" stop-color="{mix(t[1])}"/></linearGradient></defs>'
               f'<path d="{d}" fill="none" stroke="url(#g)" stroke-width="{stroke}" stroke-linecap="round" stroke-linejoin="round"/>{dots}</svg>')
        self.add(type="svg", name=name, svgMarkup=svg, x=round(bx, 1), y=round(by, 1), width=round(bw, 1), height=round(bh, 1))

if __name__ == "__main__":
    pass
