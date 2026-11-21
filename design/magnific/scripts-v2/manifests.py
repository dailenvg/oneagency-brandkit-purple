"""Point the Magnific manifests at the v2 production (2026-11-20). Run from the repo root:
  python3 design/magnific/scripts-v2/manifests.py
- src/data/ads.generated.json: v2 brand kit link, v2 design and creation links, imagery notes; ids, names, paths
  and sizes are unchanged (the v2 files replaced the v1 files of the same names).
- src/data/glass.generated.json: v2 creation links and notes for the 24 illustration variants; textures: the three
  glow textures removed, halftone arc repainted in Mint, ground-violet-navy added. The particle stream texture was
  removed by client decision (2026-11-20): it is no longer listed here.
- src/data/assets.generated.json: per-file entries (bytes, width, height) re-read from disk for every file under
  templates/, imagery/ (not imagery/photos/), illustrations/ and textures/; deleted files dropped, new files added;
  group counts and bytes recomputed. The ZIP entries are left as they are: run `npm run kit:zips` to rebuild them.
Every path is checked against the file on disk (exists, pixel size matches the manifest).
"""
import json, os, re
from PIL import Image

ROOT = os.getcwd()
PUB = os.path.join(ROOT, "public")
DATE = "2026-11-20"

DESIGNS = {  # v1 design id -> v2 design id
    "8a6J41ZIrU": "0eURsCbTfW", "9ZFvxzKNYZ": "xSBQXPSjfW", "LwoMCN7swO": "gOm5mreSXO", "SymdF2sUb8": "6AbU55xiJO",
    "CqziDSnEEy": "O6EjQSZynm", "jUBVbQfLD0": "If3VNDxtvE", "P3umJ9g42C": "If3VRF9tvE", "gOtdUeCSXO": "5jDaXYvKxe",
}
IMAGES = {  # subject -> (v2 creation, note)
    "resort-guests": ("P3Qsv0l42C", "Vacation ownership: a couple arriving on a resort pool terrace in clear afternoon light, an Ultra Violet towel the only accent."),
    "cruise-booking": ("hu2pNjivqL", "Hotels and cruises: a couple planning a cruise at their kitchen table in the evening, Mint mug and Ultra Violet cushion."),
    "sales-agent": ("9ZHgfDBNYZ", "Sales / call centre: agent on a headset answering a lead, quiet navy sales floor behind her."),
    "franchise-owner": ("3zK7QBMREY", "Franchise: owner in the doorway of her fitness studio at dawn, Mint wall stripe and Ultra Violet mat."),
    "healthcare-front-desk": ("JNCxt0wOq4", "Healthcare: receptionist with a Mint lanyard greeting a patient at a bright clinic front desk."),
    "admissions": ("5jDaWNhKxe", "Higher education: admissions conversation with a student and her father on a campus bench."),
    "orlando-night": ("dt4YwkYXSL", "Orlando-style skyline at blue hour, navy sky, crisp white, Mint and violet window lights mirrored in the lake (AI evocation, not a photo of the real skyline; no glow)."),
    "small-business-owner": ("O6EjmD5ynm", "Small business: barbecue shop owner taking an order by phone, Mint enamel cup on the counter."),
}
ILLUS = {  # subject -> (on-dark creation, cut-out creation, description)
    "magnifier": ("dt4YZDuXSL", "If3VWs3tvE", "AI search visibility: navy glass icon tile with a white-silver magnifier and a crisp Mint edge."),
    "seo-document": ("5jDa8q7Kxe", "gOm5Fc9SXO", "SEO audit: navy glass document of blank bars under a silver magnifier, crisp Mint edge."),
    "review-star": ("lJtbEs7gv9", "kseChZB16B", "Reviews: frosted navy glass star with a crisp Mint edge."),
    "cro-window": ("BhNcAXMoQR", "WDgi4F8cXe", "Website CRO: navy glass browser window with blank blocks, a Mint button and a white glass cursor."),
    "growth-stairs": ("EbYoDEBuuO", "MBJA3KNDCm", "Tactical steps to scale up: frosted glass staircase with a Mint arrow climbing it."),
    "profile-stack": ("EbYopQouuO", "CqnBpPQEEy", "Leads and customers: depth stack of three glass profile cards, Mint check badge with a Navy check."),
    "toggle-check": ("xSBQasCjfW", "lJtbQ0Dgv9", "Violet variant: glass toggle switched on, Mint knob with a Navy check, on a flat Ultra Violet to Navy ground. Use alone."),
    "lead-flow": ("1ldEhLEr4r", "mEZD0wIhJQ", "Convert visitors into leads: a white dot stream into a glass browser window, lead cards flying out."),
}
TEXTURES = [
    dict(id="texture-halftone-arc", kind="texture", name="Mint halftone dot arc", subject="halftone-arc", theme="dark", width=2048, height=1024,
         files=dict(png="/kit/textures/one-agency_texture-halftone-arc_2048x1024.png", webp="/kit/textures/one-agency_texture-halftone-arc_2048x1024.webp",
                    svg="/kit/textures/one-agency_texture-halftone-arc_2048x1024.svg"),
         notes="Hex-grid Mint #00FAB3 dots on an arc band; dots shrink toward the band edges and ends. Transparent; made for Navy grounds (Mint dots are too faint on white). SVG is the vector source (2,381 circles). Built locally (Pillow), v2 repaint of the v1 geometry."),
    dict(id="texture-grain", kind="texture", name="Fine grain tile", subject="grain", theme="any", width=512, height=512,
         files=dict(png="/kit/textures/one-agency_texture-grain_512x512.png"),
         notes="Tileable luminance noise (wrap-safe), black/white pixels at up to ~12.5% alpha. Use as background-repeat at 1x; lower opacity further on light grounds. Built locally; colourless, so unchanged from v1 (the v2 build is pixel-identical)."),
    dict(id="texture-ground-violet-navy", kind="texture", name="Violet to Navy ground", subject="ground-violet-navy", theme="dark", width=1920, height=1080,
         files=dict(jpg="/kit/textures/one-agency_texture-ground-violet-navy_1920x1080.jpg", webp="/kit/textures/one-agency_texture-ground-violet-navy_1920x1080.webp"),
         notes="Flat diagonal gradient, Ultra Violet #6203D0 top-left through Navy #020257 to Void #010138, light grain. The ground of the violet variant (replaces the v1 violet-streaks texture: no streaks, bokeh or glow). Built locally."),
]


def check(path, w, h):
    p = os.path.join(PUB, path.lstrip("/"))
    assert os.path.isfile(p), path
    if p.endswith(".svg"):
        s = open(p).read(400)
        assert f'width="{w}"' in s and f'height="{h}"' in s, path
    else:
        with Image.open(p) as im:
            assert im.size == (w, h), (path, im.size)


# ---------------------------------------------------------------- ads.generated.json
ads = json.load(open("src/data/ads.generated.json"))
ads["version"] = "2.0"
ads["generated"] = DATE
ads["brandKitUrl"] = "https://www.magnific.com/app/brand-kits/42FH9AaisN"
ads["notes"] = ("v2 identity (2026-11-20). Editable source for every template and sample is the Magnific design at magnificUrl "
                "(\"ONE Agency v2 · …\", private to the ONE Agency Magnific account, brand kit \"ONE Agency v2\"). JPG q85 and "
                "WebP q82 made locally from the Magnific PNG export. Production log: design/magnific/log-v2.md.")
ads["urlsNote"] = ("Design and creation links are the webUrls Magnific returned. Magnific returns no web link for brand kits or "
                   "projects, so brandKitUrl and folderUrl follow the app URL pattern and should be checked once in a browser "
                   "(brand kit: Library > Brand kits > ONE Agency v2; project: ONE Agency Brand Kit).")
for it in ads["items"]:
    if it["group"] == "imagery":
        subj = re.sub(r"^image-|-(master|\d+x\d+)$", "", it["id"])
        cid, note = IMAGES[subj]
        crop = it["notes"].rsplit("Crop: ", 1)[1]
        it["magnificUrl"] = f"https://www.magnific.com/app/creation/{cid}"
        it["notes"] = (f"{note} AI-generated in Magnific (model: Magnific One, with the ONE Agency v2 brand kit), owned by ONE Agency "
                       f"per Magnific plan terms. No real identifiable people, no third-party logos, no glow. Crop: {crop}")
    else:
        old = it["magnificUrl"].rsplit("/", 1)[1]
        it["magnificUrl"] = f"https://www.magnific.com/app/designer/{DESIGNS.get(old, old)}"  # idempotent
    for f in it["files"].values():
        check(f, it["width"], it["height"])
json.dump(ads, open("src/data/ads.generated.json", "w"), indent=2, ensure_ascii=False)
open("src/data/ads.generated.json", "a").write("\n")

# ---------------------------------------------------------------- glass.generated.json
g = json.load(open("src/data/glass.generated.json"))
g["version"] = "2.0"
g["generated"] = DATE
g["source"] = "design/magnific/log-v2.md"
items = []
for it in g["items"]:
    if it["kind"] != "illustration":
        continue
    subj = it["subject"]
    dark, cut, desc = ILLUS[subj]
    v = it["id"].rsplit("-", 2)[-2:]
    variant = "on-dark" if it["id"].endswith("on-dark") else ("transparent" if it["id"].endswith("transparent") else "on-light")
    if variant == "on-dark":
        it["magnificUrl"] = f"https://www.magnific.com/app/creation/{dark}"
        it["notes"] = f"{desc} Generated with Magnific One + ONE Agency v2 brand kit (2048 master, downsized). No text, no glow."
    elif variant == "transparent":
        it["magnificUrl"] = f"https://www.magnific.com/app/creation/{cut}"
        it["notes"] = (f"{desc} Magnific background removal of the on-dark render; the ground and its contact shadow go with it"
                       + ("; most of the dot stream goes too" if subj == "lead-flow" else "") + ". No text, no glow.")
    else:
        it["magnificUrl"] = f"https://www.magnific.com/app/creation/{cut}"
        it["notes"] = (f"{desc} Built locally: transparent cut-out on #FFFFFF with a soft Navy #020257 contact + ambient shadow. "
                       "Derived: the glass stays navy-tinted on light grounds. No text, no glow.")
    for f in it["files"].values():
        check(f, it["width"], it["height"])
    items.append(it)
for t in TEXTURES:
    for f in t["files"].values():
        check(f, t["width"], t["height"])
    items.append(t)
g["items"] = items
json.dump(g, open("src/data/glass.generated.json", "w"), indent=2, ensure_ascii=False)
open("src/data/glass.generated.json", "a").write("\n")

# ---------------------------------------------------------------- assets.generated.json (file entries only)
a = json.load(open("src/data/assets.generated.json"))
FMT = {".png": "PNG", ".jpg": "JPG", ".webp": "WEBP", ".svg": "SVG"}


def managed(url):
    return (url.startswith("/kit/templates/") or url.startswith("/kit/illustrations/") or url.startswith("/kit/textures/")
            or (url.startswith("/kit/imagery/") and not url.startswith("/kit/imagery/photos/")))


old = {f["url"]: f for f in a["files"] if managed(f["url"])}
group_of = {}
for f in old.values():
    group_of[f["url"].split("/")[2]] = f["group"]
disk = []
for top in ("templates", "imagery", "illustrations", "textures"):
    base = os.path.join(PUB, "kit", top)
    for dp, dn, fn in os.walk(base):
        if top == "imagery" and os.path.relpath(dp, base).startswith("photos"):
            continue
        for n in sorted(fn):
            ext = os.path.splitext(n)[1].lower()
            if ext in FMT:
                disk.append("/" + os.path.relpath(os.path.join(dp, n), PUB))
new = []
for url in sorted(disk):
    p = os.path.join(PUB, url.lstrip("/"))
    ext = os.path.splitext(url)[1].lower()
    if ext == ".svg":
        s = open(p).read(400)
        w, h = (int(x) for x in re.search(r'width="(\d+)" height="(\d+)"', s).groups())
    else:
        with Image.open(p) as im:
            w, h = im.size
    e = dict(old.get(url) or dict(url=url, name=os.path.basename(url), group=group_of[url.split("/")[2]], format=FMT[ext],
                                   bytes=0, width=0, height=0, duration=None, preview=url))  # key order as build-zips writes it
    e.update(bytes=os.path.getsize(p), width=w, height=h)
    new.append(e)
removed = sorted(set(old) - set(disk))
added = sorted(set(disk) - set(old))
# keep the original order: managed entries updated in place, deleted ones dropped, new ones inserted after the
# alphabetically preceding file of the same folder
by_url = {e["url"]: e for e in new}
out = []
for f in a["files"]:
    if managed(f["url"]):
        if f["url"] in by_url:
            out.append(by_url[f["url"]])
    else:
        out.append(f)
for url in added:
    d = os.path.dirname(url)
    idx = max(i for i, f in enumerate(out) if os.path.dirname(f["url"]) == d and f["url"] < url)
    out.insert(idx + 1, by_url[url])
a["files"] = out
for grp in a["groups"]:
    fs = [f for f in out if f["group"] == grp["id"]]
    grp["count"] = len(fs)
    grp["bytes"] = sum(f["bytes"] for f in fs)
json.dump(a, open("src/data/assets.generated.json", "w"), indent=2, ensure_ascii=False)
open("src/data/assets.generated.json", "a").write("\n")
print("ads items", len(ads["items"]), "glass items", len(g["items"]), "assets files", len(out))
print("removed from assets:", removed)
print("added to assets:", added)
