"""Layout generator for ONE Agency Magnific designs.
Prints designs_add_blocks JSON for one page spec: python gen.py <spec-id> <page-index>
All coordinates absolute; text metrics measured from the kit's own TTFs.
"""
import json, sys, math
from PIL import ImageFont

FONTS = "/Users/dailenvazquez/Projects/One Agency/oneagency-brandkit/public/kit/fonts/one-agency_font_"
FILES = {("Geist", 400): "geist-400", ("Geist", 500): "geist-500", ("Geist", 600): "geist-600",
         ("Geist", 700): "geist-700", ("Metal", 400): "metal-400", ("Lato", 700): "lato-700"}
# (ascent, box height) per 1px of font size, as the Designer renders a single line
MET = {"Geist": (1.01, 1.31), "Metal": (1.27, 2.06), "Lato": (0.99, 1.21)}
_cache = {}

def font(fam, w, s):
    k = (fam, w, round(s * 4))
    if k not in _cache:
        _cache[k] = ImageFont.truetype(FONTS + FILES[(fam, w)] + ".ttf", max(1, round(s)))
    return _cache[k]

def tw(t, fam, w, s, ls=0.0):
    return font(fam, w, s).getlength(t) * (s / max(1, round(s))) + ls * s * max(0, len(t) - 1)

GROUND, WHITE, ROSE, LILAC, TEXT2, TEXT3, BAND, RAISED = "#01030F", "#FFFFFF", "#FFA0AA", "#378DF0", "#B0B2C1", "#9A9DB0", "#11162A", "#181E35"
GRAD = {"type": "linear", "angle": 0, "stops": [{"color": ROSE, "position": 0}, {"color": LILAC, "position": 1}]}
LOGO = {  # creation ids of the uploaded kit PNGs, aspect w/h
    "horizontal": ("mERPyERhJQ", 2880 / 374), "stacked": ("Xm4USIEBfo", 1920 / 739), "icon": ("5jMnzs9Kxe", 1280 / 325),
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

def mix(t):
    a = [int(ROSE[i:i+2], 16) for i in (1, 3, 5)]; b = [int(LILAC[i:i+2], 16) for i in (1, 3, 5)]
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

    def halo(self, cx, cy, r, color=LILAC, a0="59", a1="1A"):
        self.add(type="shape", shape="ellipse", name="Halo glow", x=round(cx - r), y=round(cy - r), width=round(2 * r), height=round(2 * r),
                 gradient={"type": "radial", "stops": [{"color": color + a0, "position": 0}, {"color": color + a1, "position": 0.5}, {"color": color + "00", "position": 1}]})

    def logo(self, kind, x, y, w=None, h=None):
        cid, asp = LOGO[kind]
        if w is None: w = h * asp
        h = w / asp
        self.add(type="image", name=f"Logo {kind} on-dark", creationIdentifier=cid, x=round(x, 1), y=round(y, 1), width=round(w, 1))
        return w, h

    def bar(self, x, y, w, h):
        self.add(type="shape", name="Gradient bar", x=round(x), y=round(y), width=round(w), height=max(2, round(h)), cornerRadius=max(1, round(h / 2)), gradient=GRAD)

    def headline(self, lines, x, y, S, M=None, pitch=1.08, name="Headline"):
        """lines: list of lists of (text, 'g'|'m'). Returns height, maxwidth."""
        M = M or S * 1.15
        sp = tw(" ", "Geist", 700, S)
        maxw = 0
        for i, segs in enumerate(lines):
            B = y + 1.01 * S + i * pitch * S
            cx = x
            for j, (t, k) in enumerate(segs):
                if j: cx += sp * (0.95 if (k == "m" or segs[j - 1][1] == "m") else 1)
                if k == "g":
                    _, wd = self.text(f"{name} line {i+1}", t, cx, B - 1.01 * S, "Geist", 700, S, WHITE)
                else:
                    _, wd = self.text(f"{name} accent (Metal, rose-to-lilac)", t, cx, B - 1.27 * M, "Metal", 400, M, "grad")
                cx += wd - 2
            maxw = max(maxw, cx - x)
        h = (len(lines) - 1) * pitch * S + 1.31 * S
        return h, maxw

    def pill(self, t, x, y, fs, padx=None, pady=None, name="CTA pill"):
        """x,y = outer top-left of the pill. Returns (w, h) of the pill."""
        padx = padx if padx is not None else round(fs * 1.25)
        pady = pady if pady is not None else round(fs * 0.62)
        _, wd = self.text(name, t, x + padx, y + pady, "Geist", 600, fs, GROUND,
                          extra={"textBackground": {"color": ROSE, "cornerRadius": -1, "paddingX": padx, "paddingY": pady}})
        return wd + 2 * padx, 1.31 * fs + 2 * pady

    @staticmethod
    def pill_size(t, fs, padx=None, pady=None):
        padx = padx if padx is not None else round(fs * 1.25)
        pady = pady if pady is not None else round(fs * 0.62)
        return tw(t, "Geist", 600, fs) + 2 + 2 * padx, 1.31 * fs + 2 * pady

    def line(self, pts, stroke, name="Result line", dot=True, x0=0, y0=0, w=None, h=None, t=(0.0, 1.0)):
        """Polyline in page coordinates, gradient stroke, ending on a dot with a ring."""
        W, H = self.W, self.H
        pad = stroke * 6
        xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
        bx, by = min(xs) - pad, min(ys) - pad
        bw, bh = max(xs) - bx + pad, max(ys) - by + pad
        d = "M" + " L".join(f"{p[0]-bx:.1f} {p[1]-by:.1f}" for p in pts)
        ex, ey = pts[-1][0] - bx, pts[-1][1] - by
        dots = (f'<circle cx="{ex:.1f}" cy="{ey:.1f}" r="{stroke*2.6:.1f}" fill="none" stroke="{LILAC}" stroke-opacity="0.45" stroke-width="{max(1,stroke*0.6):.1f}"/>'
                f'<circle cx="{ex:.1f}" cy="{ey:.1f}" r="{stroke*1.5:.1f}" fill="{LILAC}"/>') if dot else ""
        svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{bw:.0f}" height="{bh:.0f}" viewBox="0 0 {bw:.1f} {bh:.1f}">'
               f'<defs><linearGradient id="g" gradientUnits="userSpaceOnUse" x1="{min(xs)-bx:.1f}" y1="0" x2="{max(xs)-bx:.1f}" y2="0">'
               f'<stop offset="0" stop-color="{mix(t[0])}"/><stop offset="1" stop-color="{mix(t[1])}"/></linearGradient></defs>'
               f'<path d="{d}" fill="none" stroke="url(#g)" stroke-width="{stroke}" stroke-linecap="round" stroke-linejoin="round"/>{dots}</svg>')
        self.add(type="svg", name=name, svgMarkup=svg, x=round(bx, 1), y=round(by, 1), width=round(bw, 1), height=round(bh, 1))

if __name__ == "__main__":
    pass
