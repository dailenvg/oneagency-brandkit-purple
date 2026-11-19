import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
ILL, TEX, OUTDIR = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
FONT = "/Users/dailenvazquez/Projects/One Agency/oneagency-brandkit/public/kit/fonts/one-agency_font_geist-600.ttf"
f = ImageFont.truetype(FONT, 20); fs = ImageFont.truetype(FONT, 15)
SUB = ["magnifier","seo-document","review-star","cro-window","growth-stairs","profile-stack","toggle-check","lead-flow"]
C, PAD, LBL = 300, 16, 34
rows = ["on-dark","transparent","on-light"]
W = PAD + len(SUB)*(C+PAD); H = 60 + len(rows)*(C+LBL+PAD) + PAD
sheet = Image.new("RGB",(W,H),"#0A0E1F"); d = ImageDraw.Draw(sheet)
d.text((PAD,18),"ONE Agency glass illustrations v1.1 · 1200x1200 · rows: on-dark / transparent (checker) / on-light",font=f,fill="#FFFFFF")
def checker(n,sq=15):
    c = Image.new("RGB",(n,n),"#FFFFFF"); dd = ImageDraw.Draw(c)
    for y in range(0,n,sq):
        for x in range(0,n,sq):
            if (x//sq+y//sq)%2: dd.rectangle([x,y,x+sq-1,y+sq-1],fill="#CFCFD6")
    return c
for r,v in enumerate(rows):
    y0 = 60 + r*(C+LBL+PAD)
    for i,s in enumerate(SUB):
        x0 = PAD + i*(C+PAD)
        im = Image.open(ILL/f"one-agency_illustration-{s}_{v}_1200x1200.png").convert("RGBA").resize((C,C),Image.LANCZOS)
        if v=="transparent":
            bg = checker(C).convert("RGBA"); bg.alpha_composite(im); im = bg
        sheet.paste(im.convert("RGB"),(x0,y0))
        d.text((x0,y0+C+8),f"{s} · {v}",font=fs,fill="#B0B2C1")
sheet.save(OUTDIR/"glass-contact.png")

# textures
items = [("halftone-arc_2048x1024.png","#01030F"),("particle-stream_2048x768.png","#01030F"),
         ("rose-underglow_2048x768.png","#01030F"),("grain_512x512.png","#01030F"),
         ("violet-streaks_1920x1080.jpg",None),("ground-rose-glow_1920x1080.jpg",None),
         ("halftone-arc_2048x1024.png","#FFFFFF"),("grain_512x512.png","#FFFFFF")]
TW, TH = 760, 428
cols = 2
W2 = PAD + cols*(TW+PAD); H2 = 60 + 4*(TH+LBL+PAD)+PAD
s2 = Image.new("RGB",(W2,H2),"#0A0E1F"); d2 = ImageDraw.Draw(s2)
d2.text((PAD,18),"ONE Agency textures v1.1 (transparent ones shown on #01030F, last two on #FFFFFF; grain tiled 2x2 at 1:1)",font=f,fill="#FFFFFF")
for k,(name,bg) in enumerate(items):
    x0 = PAD + (k%cols)*(TW+PAD); y0 = 60 + (k//cols)*(TH+LBL+PAD)
    im = Image.open(TEX/f"one-agency_texture-{name}").convert("RGBA")
    if "grain" in name:
        t = Image.new("RGBA",(1024,1024)); 
        for a in (0,512):
            for b in (0,512): t.paste(im,(a,b))
        im = t.crop((0,0,TW,TH))
        canvas = Image.new("RGBA",(TW,TH),bg); canvas.alpha_composite(im)
    else:
        sc = min(TW/im.width, TH/im.height); im = im.resize((int(im.width*sc),int(im.height*sc)),Image.LANCZOS)
        canvas = Image.new("RGBA",(TW,TH),bg or "#000000"); canvas.alpha_composite(im,((TW-im.width)//2,(TH-im.height)//2))
    s2.paste(canvas.convert("RGB"),(x0,y0))
    d2.text((x0,y0+TH+8),f"{name}" + (f" on {bg}" if bg else ""),font=fs,fill="#B0B2C1")
s2.save(OUTDIR/"textures-contact.png")
print("ok")
