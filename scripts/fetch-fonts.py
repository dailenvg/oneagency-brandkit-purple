#!/usr/bin/env python3
"""Fetch the three typefaces oneagency.com loads (and Sora, the hub's own UI face) and write the font files.

Sources (all SIL Open Font License 1.1):
  Geist 400/500/600/700  official release zip, github.com/vercel/geist-font
  Lato 700               github.com/google/fonts (ofl/lato)
  Metal 400              github.com/google/fonts (ofl/metal)
  Sora 100-800 variable  github.com/google/fonts (ofl/sora), site only

Writes:
  public/kit/fonts/one-agency_font_[family]-[weight].{ttf,woff2}   full-character downloads
  public/kit/fonts/one-agency_font_[family]_ofl.txt                licence text per family
  src/assets/fonts/[family]-[weight].woff2                         Latin subsets for the kit site

Needs fontTools with brotli (pip install fonttools brotli). Usage: python3 scripts/fetch-fonts.py
"""

from __future__ import annotations

import io
import shutil
import tempfile
import urllib.request
import zipfile
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
KIT_DIR = ROOT / "public" / "kit" / "fonts"
SITE_DIR = ROOT / "src" / "assets" / "fonts"

GEIST_VERSION = "v1.9.2"
GEIST_ZIP = f"https://github.com/vercel/geist-font/releases/download/{GEIST_VERSION}/geist-font-{GEIST_VERSION}.zip"
GOOGLE_FONTS = "https://raw.githubusercontent.com/google/fonts/main/ofl"

GEIST_WEIGHTS = {400: "Regular", 500: "Medium", 600: "SemiBold", 700: "Bold"}

# Google Fonts' "latin" unicode-range: what the live site's Google Fonts request serves to English pages.
LATIN = (
    "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, "
    "U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD"
)


def fetch(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": "oneagency-brandkit font fetch"})
    with urllib.request.urlopen(request, timeout=60) as response:
        return response.read()


def write_pair(ttf: bytes, family: str, weight: int, scratch: Path) -> None:
    """Kit download (TTF + full WOFF2) and the Latin WOFF2 subset the site serves."""
    stem = f"one-agency_font_{family}-{weight}"
    (KIT_DIR / f"{stem}.ttf").write_bytes(ttf)

    font = TTFont(io.BytesIO(ttf))
    font.flavor = "woff2"
    font.save(KIT_DIR / f"{stem}.woff2")

    source = scratch / f"{family}-{weight}.ttf"
    source.write_bytes(ttf)
    subset.main([
        str(source),
        f"--unicodes={LATIN}",
        "--layout-features=*",
        "--flavor=woff2",
        f"--output-file={SITE_DIR / f'{family}-{weight}.woff2'}",
    ])


def geist(scratch: Path) -> None:
    archive = zipfile.ZipFile(io.BytesIO(fetch(GEIST_ZIP)))
    for weight, style in GEIST_WEIGHTS.items():
        write_pair(archive.read(f"geist-font/Geist/ttf/Geist-{style}.ttf"), "geist", weight, scratch)
    (KIT_DIR / "one-agency_font_geist_ofl.txt").write_bytes(archive.read("geist-font/OFL.txt"))


def google(family: str, filename: str, weight: int, scratch: Path) -> None:
    write_pair(fetch(f"{GOOGLE_FONTS}/{family}/{filename}"), family, weight, scratch)
    (KIT_DIR / f"one-agency_font_{family}_ofl.txt").write_bytes(fetch(f"{GOOGLE_FONTS}/{family}/OFL.txt"))


def sora(scratch: Path) -> None:
    """Sora, the hub's face for token names, values and file names (in place of a monospace). Site only: it is not a
    brand face, so it gets no kit download. One variable WOFF2 (weights 100 to 800), Latin subset."""
    source = scratch / "sora.ttf"
    source.write_bytes(fetch(f"{GOOGLE_FONTS}/sora/Sora%5Bwght%5D.ttf"))
    subset.main([
        str(source),
        f"--unicodes={LATIN}",
        "--layout-features=*",
        "--flavor=woff2",
        f"--output-file={SITE_DIR / 'sora-variable.woff2'}",
    ])


def main() -> None:
    for folder in (KIT_DIR, SITE_DIR):
        folder.mkdir(parents=True, exist_ok=True)
    scratch = Path(tempfile.mkdtemp(prefix="oa-fonts-"))
    try:
        geist(scratch)
        google("lato", "Lato-Bold.ttf", 700, scratch)
        google("metal", "Metal-Regular.ttf", 400, scratch)
        sora(scratch)
    finally:
        shutil.rmtree(scratch, ignore_errors=True)
    for path in sorted([*KIT_DIR.iterdir(), *SITE_DIR.iterdir()]):
        print(f"{path.stat().st_size:>9,}  {path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
