#!/usr/bin/env python3
"""Fetch the two brand typefaces (and Sora, the hub's own UI face) and write the font files.

Sources (all SIL Open Font License 1.1):
  Geist 400/500/600/700      body: official release zip, github.com/vercel/geist-font
  Unbounded 500/600/700      display: github.com/google/fonts (ofl/unbounded), static instances of the variable font
  Sora 100-800 variable      github.com/google/fonts (ofl/sora), site only

Writes:
  public/kit/fonts/one-agency_font_[family]-[weight].{ttf,woff2}   full-character downloads
  public/kit/fonts/one-agency_font_[family]_ofl.txt                licence text per family
  src/assets/fonts/[family]-[weight].woff2                         Latin subsets for the kit site

Files in those folders that this run does not write (faces dropped from the brand) are removed.

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
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parent.parent
KIT_DIR = ROOT / "public" / "kit" / "fonts"
SITE_DIR = ROOT / "src" / "assets" / "fonts"

GEIST_VERSION = "v1.9.2"
GEIST_ZIP = f"https://github.com/vercel/geist-font/releases/download/{GEIST_VERSION}/geist-font-{GEIST_VERSION}.zip"
GOOGLE_FONTS = "https://raw.githubusercontent.com/google/fonts/main/ofl"

GEIST_WEIGHTS = {400: "Regular", 500: "Medium", 600: "SemiBold", 700: "Bold"}

# Unbounded weights in the kit download; the hub serves only the display weight (600) as a Latin subset.
UNBOUNDED_WEIGHTS = (500, 600, 700)
UNBOUNDED_SITE_WEIGHT = 600

# Google Fonts' "latin" unicode-range: what the live site's Google Fonts request serves to English pages.
LATIN = (
    "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, "
    "U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD"
)


def fetch(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": "oneagency-brandkit font fetch"})
    with urllib.request.urlopen(request, timeout=60) as response:
        return response.read()


def write_pair(ttf: bytes, family: str, weight: int, scratch: Path, site: bool = True) -> list[Path]:
    """Kit download (TTF + full WOFF2) and, unless site is False, the Latin WOFF2 subset the site serves."""
    stem = f"one-agency_font_{family}-{weight}"
    written = [KIT_DIR / f"{stem}.ttf", KIT_DIR / f"{stem}.woff2"]
    written[0].write_bytes(ttf)

    font = TTFont(io.BytesIO(ttf))
    font.flavor = "woff2"
    font.save(written[1])

    if site:
        source = scratch / f"{family}-{weight}.ttf"
        source.write_bytes(ttf)
        written.append(SITE_DIR / f"{family}-{weight}.woff2")
        subset.main([
            str(source),
            f"--unicodes={LATIN}",
            "--layout-features=*",
            "--flavor=woff2",
            f"--output-file={written[-1]}",
        ])
    return written


def geist(scratch: Path) -> list[Path]:
    archive = zipfile.ZipFile(io.BytesIO(fetch(GEIST_ZIP)))
    written = []
    for weight, style in GEIST_WEIGHTS.items():
        written += write_pair(archive.read(f"geist-font/Geist/ttf/Geist-{style}.ttf"), "geist", weight, scratch)
    licence = KIT_DIR / "one-agency_font_geist_ofl.txt"
    licence.write_bytes(archive.read("geist-font/OFL.txt"))
    return [*written, licence]


def unbounded(scratch: Path) -> list[Path]:
    """Unbounded ships as one variable font (wght 200 to 900): each kit weight is a static instance pinned from it."""
    variable = TTFont(io.BytesIO(fetch(f"{GOOGLE_FONTS}/unbounded/Unbounded%5Bwght%5D.ttf")))
    written = []
    for weight in UNBOUNDED_WEIGHTS:
        static = instancer.instantiateVariableFont(variable, {"wght": weight}, updateFontNames=True)
        buffer = io.BytesIO()
        static.save(buffer)
        written += write_pair(buffer.getvalue(), "unbounded", weight, scratch, site=weight == UNBOUNDED_SITE_WEIGHT)
    licence = KIT_DIR / "one-agency_font_unbounded_ofl.txt"
    licence.write_bytes(fetch(f"{GOOGLE_FONTS}/unbounded/OFL.txt"))
    return [*written, licence]


def sora(scratch: Path) -> Path:
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
    return SITE_DIR / "sora-variable.woff2"


def remove_stale(written: list[Path]) -> None:
    """Deletes font files no longer produced (faces dropped from the brand), so the kit never ships them."""
    keep = {path.resolve() for path in written}
    for folder in (KIT_DIR, SITE_DIR):
        for path in folder.iterdir():
            if path.is_file() and path.resolve() not in keep:
                path.unlink()
                print(f"removed  {path.relative_to(ROOT)}")


def main() -> None:
    for folder in (KIT_DIR, SITE_DIR):
        folder.mkdir(parents=True, exist_ok=True)
    scratch = Path(tempfile.mkdtemp(prefix="oa-fonts-"))
    try:
        written = [*geist(scratch), *unbounded(scratch), sora(scratch)]
        remove_stale(written)
    finally:
        shutil.rmtree(scratch, ignore_errors=True)
    for path in sorted([*KIT_DIR.iterdir(), *SITE_DIR.iterdir()]):
        print(f"{path.stat().st_size:>9,}  {path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
