import json, sys
from layouts import *

GL = [(60, 1000), (520, 985), (900, 995), (1400, 965), (1800, 975), (2300, 950), (2750, 958), (3250, 930), (3700, 940), (4100, 922), (4820, 914), (5300, 872)]

def seg(p):
    lo, hi = p * 1080, (p + 1) * 1080
    out = []
    for (x1, y1), (x2, y2) in zip(GL, GL[1:]):
        for (xa, ya) in [(x1, y1), (x2, y2)]:
            pass
        if x2 < lo or x1 > hi: continue
        def at(x): return y1 + (y2 - y1) * (x - x1) / (x2 - x1)
        a = (max(x1, lo), at(max(x1, lo))); b = (min(x2, hi), at(min(x2, hi)))
        if not out or out[-1] != a: out.append(a)
        out.append(b)
    return [(x - lo, y) for x, y in out]

def card(i):
    p = i + 1
    if i == 0:
        P = stack(1080, 1080, p, T, bottom=230, S0=112, show=["bar", "eyebrow", "hl"])
    elif i < 4:
        P = stack(1080, 1080, p, T, bottom=230, S0=92, num=f"0{i}", show=["hl", "sub"])
    else:
        P = stack(1080, 1080, p, T, bottom=230, show=["hl", "sub", "cta"])
        P.text("Legal line", T["legal"], 86, 1080 - 86 - 1.31 * 22, "Geist", 400, 22, TEXT2)
    sg = seg(i); x0g, x1g = GL[0][0], GL[-1][0]
    P.line(sg, 6, name="Carousel line (continues across cards)", dot=(i == 4), t=((sg[0][0] + i * 1080 - x0g) / (x1g - x0g), (sg[-1][0] + i * 1080 - x0g) / (x1g - x0g)))
    return P

REG = {
 "social-1": lambda: stack(1080, 1080, 1, T),
 "social-2": lambda: stack(1080, 1350, 2, T, line=([(88, 560), (300, 520), (480, 540), (700, 420), (860, 380), (992, 250)], 6)),
 "social-3": lambda: stack(1080, 1920, 3, T, top=220, bottom=340, S0=112, line=([(88, 900), (330, 850), (520, 875), (760, 730), (900, 700), (992, 560)], 6)),
 **{f"carousel-{i+1}": (lambda i=i: card(i)) for i in range(5)},
 "linkedin-1": lambda: landscape(1200, 627, 1, T),
 "linkedin-2": lambda: stack(1080, 1080, 2, T),
 "google-1": lambda: landscape(1200, 628, 1, T),
 "google-2": lambda: stack(1200, 1200, 2, T, k=1.0, line=([(96, 410), (330, 375), (520, 392), (760, 300), (930, 272), (1100, 170)], 6)),
 "google-3": lambda: logo_only(1200, 1200, 3, "stacked"),
 "google-4": lambda: logo_only(1200, 300, 4, "horizontal"),
 "web-1": lambda: b970(970, 250, 1, T),
 "web-2": lambda: b728(728, 90, 2, T, "one"),
 "web-3": lambda: stack(300, 600, 3, T, k=0.36, line=([(24, 330), (90, 310), (140, 318), (200, 268), (276, 196)], 3)),
 "web-4": lambda: b300x250(300, 250, 4, T, "two", foot=T["legal"]),
 "web-5": lambda: b160(160, 600, 5, T, "two"),
 "web-6": lambda: b320x50(320, 50, 6, T, "two"),
}
SIZES = [(1080, 1080), (1080, 1350), (1080, 1920), (1200, 627), (1200, 628), (300, 250), (300, 600), (728, 90), (970, 250)]
def sample(c, key):
    L = {
      "A": [lambda: stack(1080, 1080, 1, A), lambda: stack(1080, 1350, 2, A, line=([(88, 560), (300, 520), (480, 540), (700, 420), (860, 380), (992, 250)], 6)),
            lambda: stack(1080, 1920, 3, A, top=220, bottom=340, S0=112, line=([(88, 900), (330, 850), (520, 875), (760, 730), (900, 700), (992, 560)], 6)),
            lambda: landscape(1200, 627, 4, A), lambda: landscape(1200, 628, 5, A), lambda: b300x250(300, 250, 6, A, "three", foot=A["small"]),
            lambda: stack(300, 600, 7, A, hl="three", k=0.36), lambda: b728(728, 90, 8, A, "one"), lambda: b970(970, 250, 9, A, "two")],
      "B": [lambda: stack(1080, 1080, 1, B, S0=92), lambda: stack(1080, 1350, 2, B), lambda: stack(1080, 1920, 3, B, top=220, bottom=340, S0=112, sk=1.3, line=([(88, 640), (330, 600), (520, 620), (760, 520), (900, 495), (992, 380)], 6)),
            lambda: landscape(1200, 627, 4, B), lambda: landscape(1200, 628, 5, B), lambda: b300x250(300, 250, 6, B, "two", foot=B["legal"]),
            lambda: stack(300, 600, 7, B, k=0.36), lambda: b728(728, 90, 8, B, "one", sub=B["legal"]), lambda: b970(970, 250, 9, B, "two")],
      "C": [lambda: stack(1080, 1080, 1, C, hl="one", S0=130), lambda: stack(1080, 1350, 2, C, hl="one", S0=130, line=([(88, 560), (300, 520), (480, 540), (700, 420), (860, 380), (992, 250)], 6)),
            lambda: stack(1080, 1920, 3, C, hl="one", S0=140, top=220, bottom=340, line=([(88, 900), (330, 850), (520, 875), (760, 730), (900, 700), (992, 560)], 6)),
            lambda: landscape(1200, 627, 4, C, hl="one"), lambda: landscape(1200, 628, 5, C, hl="one"), lambda: b300x250(300, 250, 6, C, "one", foot=C["small"], attr=True),
            lambda: stack(300, 600, 7, C, hl="two", k=0.36), lambda: b728(728, 90, 8, C, "one", sub=C["attribution"]), lambda: b970(970, 250, 9, C, "one")],
    }
    return L[c][key]
for c in "ABC":
    for i in range(9):
        REG[f"{c}-{i+1}"] = sample(c, i)

if __name__ == "__main__":
    for k in sys.argv[1:]:
        P = REG[k]()
        print(json.dumps(P.b, separators=(",", ":")))
