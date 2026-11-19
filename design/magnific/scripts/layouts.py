import json, sys
from gen import *

# ---------------------------------------------------------------- content
T = dict(  # template placeholder copy (source pack)
    eyebrow="Eyebrow, 3 words max",
    hl=dict(two=[[("Headline in two", "g")], [("short", "g"), ("lines", "m")]],
            one=[[("Headline in two short", "g"), ("lines", "m")]]),
    sub="One supporting line with the buyer's outcome.",
    cta="Call to action", legal="Legal or source line, with a date.")
A = dict(
    eyebrow="Free AI Growth Audit",
    hl=dict(two=[[("Find and close the", "g")], [("holes", "m"), ("in your business", "g")]],
            three=[[("Find and close", "g")], [("the", "g"), ("holes", "m"), ("in", "g")], [("your business", "g")]],
            one=[[("Find and close the", "g"), ("holes", "m"), ("in your business", "g")]]),
    sub="Results in 5 minutes. Yours to keep.",
    cta="Start My 5-Minute Audit", small="Powered by ChattiBiz AI.")
B = dict(
    hl=dict(two=[[("Results delivered.", "g")], [("In", "g"), ("any", "m"), ("industry.", "g")]],
            one=[[("Results delivered. In", "g"), ("any", "m"), ("industry.", "g")]]),
    stats=[("10M+", "Qualified leads generated"), ("$100M+", "Media under management"),
           ("7B+", "Brand impressions delivered"), ("450K+", "E-commerce transactions")],
    cta="Run My Free Audit", legal="Figures as published on oneagency.com, November 2026.")
C = dict(
    eyebrow="Winner",
    hl=dict(one=[[("Best", "g"), ("AI", "m"), ("Product", "g")]],
            two=[[("Best", "g"), ("AI", "m")], [("Product", "g")]]),
    sub="2026 ARDY Awards, American Resort Development Association",
    attribution="Awarded to ConversionIQ.ai",
    cta="Talk to ONE Agency", small="(689) 205-9923 · oneagency.com")
CONTENT = dict(T=T, A=A, B=B, C=C)


def fit_S(lines, S, maxw):
    """Shrink S until the widest headline line fits maxw."""
    while S > 8:
        P = Page(0, 0, 0)
        _, w = P.headline(lines, 0, 0, S)
        if w <= maxw:
            return S
        S -= 1
    return S


def stats_block(P, stats, x, y, w, k, cols, minlab=12):
    """Band with stats. Returns height."""
    pad = round(36 * k)
    gap = round(28 * k)
    cw = (w - 2 * pad - (cols - 1) * gap) / cols
    V = max(20, round(64 * k)); L = max(minlab, round(22 * k))
    while tw(max((s[0] for s in stats), key=len), "Lato", 700, V) > cw and V > 14:
        V -= 1
    rows = (len(stats) + cols - 1) // cols
    labh = []
    for v, l in stats:
        labh.append(1.31 * L + (len(wrap(l, "Geist", 400, L, cw)) - 1) * 1.3 * L)
    rowh = [1.21 * V + 8 * k + max(labh[r * cols:(r + 1) * cols]) for r in range(rows)]
    H = 2 * pad + sum(rowh) + (rows - 1) * gap
    P.add(type="shape", name="Proof bar", x=round(x), y=round(y), width=round(w), height=round(H), cornerRadius=round(24 * k), color=BAND)
    cy = y + pad
    for r in range(rows):
        for c in range(cols):
            i = r * cols + c
            if i >= len(stats): break
            v, l = stats[i]
            cx = x + pad + c * (cw + gap)
            P.text(f"Stat {i+1} value", v, cx, cy, "Lato", 700, V, WHITE)
            P.text(f"Stat {i+1} label", l, cx, cy + 1.21 * V + 8 * k, "Geist", 400, L, TEXT2, maxw=cw)
            if c and False: pass
        cy += rowh[r] + gap
    # thin gradient dividers between columns
    for c in range(1, cols):
        dx = x + pad + c * (cw + gap) - gap / 2
        P.add(type="shape", name="Stat divider", x=round(dx - 1), y=round(y + pad), width=2, height=round(H - 2 * pad),
              gradient={"type": "linear", "angle": 90, "stops": [{"color": ROSE + "00", "position": 0}, {"color": ROSE + "B3", "position": 0.3}, {"color": LILAC + "B3", "position": 0.7}, {"color": LILAC + "00", "position": 1}]})
    return H


def stack(W, H, page, c, hl="two", logo="horizontal", top=None, bottom=None, valign="bottom", S0=100, k=None, line=None, num=None, show=None, halo=True, sk=1.0):
    """Vertical stack layout for squares, portraits, stories and tall banners."""
    P = Page(W, H, page)
    show = show or ["bar", "eyebrow", "hl", "sub", "stats", "attribution", "cta", "small", "legal"]
    k = k or W / 1080
    m = round(0.08 * min(W, H)) if W >= 300 else 14
    top = top if top is not None else m
    bottom = bottom if bottom is not None else m
    cw = W - 2 * m
    if halo: P.halo(W * 0.82, top + H * 0.12, max(W, H) * 0.5)
    lw = min(cw * 0.42, 330 * k) if logo == "horizontal" else min(cw * 0.7, 420 * k)
    _, lh = P.logo(logo, m, top, w=lw)
    # measure items
    items = []
    if "bar" in show: items.append(("bar", 6 * k + 0.5, 0))
    if c.get("eyebrow") and "eyebrow" in show: items.append(("eyebrow", 1.31 * max(12, 26 * k), 28 * k))
    if num: items.append(("num", 1.21 * 120 * k, 0))
    S = fit_S(c["hl"][hl], S0 * k, cw)
    hlh = (len(c["hl"][hl]) - 1) * 1.08 * S + 1.31 * S
    items.append(("hl", hlh, 22 * k if items else 0))
    subS = max(15, 36 * k)
    if c.get("sub") and "sub" in show:
        n = len(wrap(c["sub"], "Geist", 400, subS, cw * 0.9))
        items.append(("sub", 1.31 * subS + (n - 1) * 1.3 * subS, 30 * k))
    if c.get("stats") and "stats" in show:
        items.append(("stats", None, 44 * k))
    if c.get("attribution") and "attribution" in show:
        items.append(("attribution", 1.31 * max(13, 28 * k) + 2 * round(14 * k), 36 * k))
    ctaS = max(14, 32 * k)
    if "cta" in show:
        items.append(("cta", Page.pill_size(c["cta"], ctaS)[1], 56 * k))
    smallS = max(12, 22 * k)
    if c.get("small") and "small" in show:
        items.append(("small", 1.31 * smallS, 24 * k))
    # stats height needs a dry run
    if any(i[0] == "stats" for i in items):
        D = Page(W, H, page)
        sh = stats_block(D, c["stats"], 0, 0, cw, k * sk, 2)
        items = [(n, sh if n == "stats" else h, g) for n, h, g in items]
    total = sum(h + g for _, h, g in items)
    legalS = max(12, 22 * k)
    legal_h = 1.31 * legalS if (c.get("legal") and "legal" in show) else 0
    if legal_h:
        n = len(wrap(c["legal"], "Geist", 400, legalS, cw))
        legal_h = 1.31 * legalS + (n - 1) * 1.3 * legalS
    lim_top = top + lh + 48 * k
    lim_bot = H - bottom - (legal_h + 40 * k if legal_h else 0)
    if valign == "bottom":
        y = lim_bot - total
    else:
        y = lim_top + (lim_bot - lim_top - total) / 2
    y = max(y, lim_top)
    for name, h, g in items:
        y += g
        if name == "bar": P.bar(m, y, 140 * k, 6 * k)
        elif name == "eyebrow": P.text("Eyebrow", c["eyebrow"], m, y, "Geist", 600, max(12, 26 * k), TEXT2, ls=0.12, case="uppercase")
        elif name == "num": P.text("Card number", num, m, y, "Lato", 700, 120 * k, TEXT2)
        elif name == "hl": P.headline(c["hl"][hl], m, y, S)
        elif name == "sub": P.text("Sub", c["sub"], m, y, "Geist", 400, subS, TEXT2, maxw=cw * 0.9)
        elif name == "stats": stats_block(P, c["stats"], m, y, cw, k * sk, 2)
        elif name == "attribution":
            fs = max(13, 28 * k); pad = round(14 * k)
            P.text("Attribution", c["attribution"], m + pad * 1.6, y + pad, "Geist", 600, fs, WHITE,
                   extra={"textBackground": {"color": RAISED, "cornerRadius": -1, "paddingX": round(pad * 1.6), "paddingY": pad}})
        elif name == "cta": P.pill(c["cta"], m, y, ctaS)
        elif name == "small": P.text("Small line", c["small"], m, y, "Geist", 400, smallS, TEXT2)
        y += h
    if legal_h:
        P.text("Legal line", c["legal"], m, H - bottom - legal_h, "Geist", 400, legalS, TEXT2, maxw=cw)
    if line:
        P.line(*line)
    return P


def landscape(W, H, page, c, hl="two"):
    P = Page(W, H, page)
    m = 56
    k = 0.62
    P.halo(W * 0.84, H * 0.3, 460)
    _, lh = P.logo("horizontal", m, m, w=250)
    colw = 660
    S = fit_S(c["hl"][hl], 72, colw)
    items = []
    if c.get("eyebrow"): items.append(("eyebrow", 1.31 * 18, 0))
    hlh = (len(c["hl"][hl]) - 1) * 1.08 * S + 1.31 * S
    items.append(("hl", hlh, 16 if items else 0))
    if c.get("sub"):
        n = len(wrap(c["sub"], "Geist", 400, 24, colw))
        items.append(("sub", 1.31 * 24 + (n - 1) * 1.3 * 24, 20))
    if c.get("attribution"): items.append(("attribution", 1.31 * 20 + 20, 22))
    if not c.get("stats"): items.append(("cta", Page.pill_size(c["cta"], 22)[1], 34))
    if c.get("small"): items.append(("small", 1.31 * 17, 16))
    legal_h = 1.31 * 16 if c.get("legal") else 0
    total = sum(h + g for _, h, g in items)
    stats_h = 0
    if c.get("stats"):
        D = Page(W, H, page); stats_h = stats_block(D, c["stats"], 0, 0, W - 2 * m, 0.62, 4, minlab=15)
    bot = H - m - (legal_h + 18 if legal_h else 0) - (stats_h + 26 if stats_h else 0)
    top = m + 32 + 40
    y = max(top, bot - total) if not stats_h else top
    for name, h, g in items:
        y += g
        if name == "eyebrow": P.text("Eyebrow", c["eyebrow"], m, y, "Geist", 600, 18, TEXT2, ls=0.12, case="uppercase")
        elif name == "hl": P.headline(c["hl"][hl], m, y, S)
        elif name == "sub": P.text("Sub", c["sub"], m, y, "Geist", 400, 24, TEXT2, maxw=colw)
        elif name == "attribution":
            P.text("Attribution", c["attribution"], m + 16, y + 10, "Geist", 600, 20, WHITE,
                   extra={"textBackground": {"color": RAISED, "cornerRadius": -1, "paddingX": 16, "paddingY": 10}})
        elif name == "cta": P.pill(c["cta"], m, y, 22)
        elif name == "small": P.text("Small line", c["small"], m, y, "Geist", 400, 17, TEXT2)
        y += h
    if stats_h:
        sy = H - m - (legal_h + 18 if legal_h else 0) - stats_h
        stats_block(P, c["stats"], m, sy, W - 2 * m, 0.62, 4, minlab=15)
        pw, ph = Page.pill_size(c["cta"], 22)
        P.pill(c["cta"], W - m - pw, sy - 26 - ph, 22)
    else:
        # result line on the right: rises left to right and ends on a dot
        P.line([(760, H - m - 40), (850, H - m - 80), (930, H - m - 66), (1010, H - m - 170), (1090, H - m - 200), (W - m - 10, m + 150)], 5)
    if legal_h:
        P.text("Legal line", c["legal"], m, H - m - legal_h, "Geist", 400, 16, TEXT2)
    return P


def b970(W, H, page, c, hl="two", show=("hl", "cta", "small", "legal", "attribution")):
    P = Page(W, H, page)
    m = 28
    P.halo(W * 0.78, H * 0.2, 300)
    P.logo("horizontal", m, m, w=190)
    pw, ph = Page.pill_size(c["cta"], 20)
    colw = W - 2 * m - pw - 48
    S = fit_S(c["hl"][hl], 46, colw)
    hlh = (len(c["hl"][hl]) - 1) * 1.08 * S + 1.31 * S
    foot = c.get("legal") or c.get("small")
    attr = c.get("attribution") if "attribution" in show else None
    y = 28 + 25 + 22
    P.headline(c["hl"][hl], m, y, S)
    y += hlh
    if attr:
        P.text("Attribution", attr, m + 14, y + 10 + 8, "Geist", 600, 16, WHITE,
               extra={"textBackground": {"color": RAISED, "cornerRadius": -1, "paddingX": 14, "paddingY": 8}})
    if foot:
        P.text("Legal line" if c.get("legal") else "Small line", foot, m, H - m - 1.31 * 13, "Geist", 400, 13, TEXT2)
    P.pill(c["cta"], W - m - pw, (H - ph) / 2, 20)
    P.line([(W - m - pw - 30, H - 40), (W - m - pw + 60, H - 52), (W - m - pw + 120, H - 47), (W - m - 40, H - 70), (W - m - 4, H - 84)], 3, dot=True)
    return P


def b728(W, H, page, c, hl="one", sub=None):
    P = Page(W, H, page)
    m = 16
    P.halo(W * 0.5, H * 0.5, 260, a0="40", a1="12")
    lw, lh = P.logo("horizontal", m, (H - 120 / (2880 / 374)) / 2, w=120)
    pw, ph = Page.pill_size(c["cta"], 15, padx=16, pady=9)
    x0 = m + lw + 24
    colw = W - x0 - pw - m - 20
    S = fit_S(c["hl"][hl], 26, colw)
    hlh = (len(c["hl"][hl]) - 1) * 1.08 * S + 1.31 * S
    subS = 12
    tot = hlh + (4 + 1.31 * subS if sub else 0)
    y = (H - tot) / 2
    P.headline(c["hl"][hl], x0, y, S)
    if sub:
        P.text("Legal line" if sub == c.get("legal") else ("Attribution" if sub == c.get("attribution") else "Small line"),
               sub, x0, y + hlh + 4, "Geist", 600 if sub == c.get("attribution") else 400, subS, WHITE if sub == c.get("attribution") else TEXT2)
    P.pill(c["cta"], W - m - pw, (H - ph) / 2, 15, padx=16, pady=9)
    return P


def b300x250(W, H, page, c, hl="three", foot=None, attr=False):
    P = Page(W, H, page)
    m = 20
    P.halo(W * 0.85, H * 0.15, 200)
    _, lh = P.logo("horizontal", m, m, w=128)
    pw, ph = Page.pill_size(c["cta"], 15, padx=18, pady=10)
    S = fit_S(c["hl"][hl], 30, W - 2 * m)
    hlh = (len(c["hl"][hl]) - 1) * 1.08 * S + 1.31 * S
    fy = H - m - (1.31 * 12 if foot else 0)
    cy = fy - (8 if foot else 0) - ph
    y = m + lh + 16
    P.headline(c["hl"][hl], m, y, S)
    if attr:
        P.text("Attribution", c["attribution"], m + 10, y + hlh + 8 + 5, "Geist", 600, 13, WHITE,
               extra={"textBackground": {"color": RAISED, "cornerRadius": -1, "paddingX": 10, "paddingY": 5}})
    P.pill(c["cta"], m, cy, 15, padx=18, pady=10)
    if foot:
        P.text("Legal line" if foot == c.get("legal") else "Small line", foot, m, fy, "Geist", 400, 12, TEXT2, maxw=W - 2 * m)
    return P


def b160(W, H, page, c, hl):
    P = Page(W, H, page)
    m = 14
    P.halo(W * 0.6, H * 0.15, 220)
    P.logo("stacked", (W - 116) / 2, 28, w=116)
    S = fit_S(c["hl"][hl], 30, W - 2 * m)
    P.headline(c["hl"][hl], m, 150, S)
    pw, ph = Page.pill_size(c["cta"], 13, padx=14, pady=9)
    P.line([(m, 470), (50, 455), (80, 462), (110, 430), (W - m - 4, 400)], 3)
    P.pill(c["cta"], (W - pw) / 2, H - 28 - ph, 13, padx=14, pady=9)
    return P


def b320x50(W, H, page, c, hl):
    P = Page(W, H, page)
    P.logo("icon", 10, (H - 14) / 2, h=14)
    pw, ph = Page.pill_size(c["cta"], 12, padx=10, pady=6)
    x0 = 10 + 14 * (1280 / 325) + 12
    S = fit_S(c["hl"][hl], 14, W - x0 - pw - 18)
    hlh = (len(c["hl"][hl]) - 1) * 1.08 * S + 1.31 * S
    P.headline(c["hl"][hl], x0, (H - hlh) / 2, S)
    P.pill(c["cta"], W - 8 - pw, (H - ph) / 2, 12, padx=10, pady=6)
    return P


def logo_only(W, H, page, kind):
    P = Page(W, H, page)
    P.halo(W / 2, H / 2, max(W, H) * 0.55, a0="4D", a1="14")
    if kind == "stacked":
        w = W * 0.62; h = w / (1920 / 739)
        P.logo("stacked", (W - w) / 2, (H - h) / 2, w=w)
    else:
        w = W * 0.72; h = w / (2880 / 374)
        P.logo("horizontal", (W - w) / 2, (H - h) / 2, w=w)
    return P


if __name__ == "__main__":
    pass
