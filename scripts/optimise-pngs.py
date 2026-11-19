#!/usr/bin/env python3
"""
Lossless PNG optimisation for the kit (keeps the full-kit ZIP under GitHub's 100 MiB file limit).

Every PNG under the given folders or files is re-encoded losslessly with oxipng (pip install pyoxipng) at level 6,
or, without it, with Pillow's optimiser (an RGBA image with no transparency is stored as RGB, 256 colours or fewer as
a palette). The result is decoded and compared with the original as RGBA, byte for byte, and written only if it is
identical and smaller; anything else is left untouched.

Content credentials are always preserved: a PNG carrying C2PA (a caBX chunk, or any chunk holding a C2PA JUMBF
box) is never touched, because re-encoding would invalidate its signed hash. The reference ads are such files, so they
stay byte copies of the source ads. Otherwise none of the kit's PNGs carry gAMA, cHRM, sRGB or iCCP, so nothing that
affects display can be lost.

Usage: python3 scripts/optimise-pngs.py [--dry-run] <folder-or-file> ...   (npm run kit:optimise)
Needs Pillow; pyoxipng is optional and saves more.
"""

from __future__ import annotations

import io
import struct
import sys
from pathlib import Path

from PIL import Image

try:
    import oxipng
except ImportError:
    oxipng = None


def has_content_credentials(data: bytes) -> bool:
    """True for a caBX chunk, or any chunk whose data holds a JUMBF box (jumb) labelled c2pa."""
    i = 8
    while i + 8 <= len(data):
        length = struct.unpack(">I", data[i : i + 4])[0]
        kind, body = data[i + 4 : i + 8], data[i + 8 : i + 8 + length]
        if kind == b"caBX" or (kind not in (b"IDAT", b"IHDR", b"PLTE") and b"jumb" in body and b"c2pa" in body):
            return True
        i += 12 + length
    return False


def pixels(data: bytes) -> bytes:
    with Image.open(io.BytesIO(data)) as im:
        return im.convert("RGBA").tobytes()


def pillow_encode(data: bytes) -> bytes:
    with Image.open(io.BytesIO(data)) as src:
        src.load()
        im = src
        if im.mode == "RGBA" and im.getchannel("A").getextrema() == (255, 255):
            im = im.convert("RGB")
        if im.mode == "RGB" and im.getcolors(256) is not None:
            im = im.quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
        icc = src.info.get("icc_profile")
        buf = io.BytesIO()
        im.save(buf, format="PNG", optimize=True, **({"icc_profile": icc} if icc else {}))
        return buf.getvalue()


def optimise(path: Path, dry_run: bool) -> tuple[int, int, str]:
    data = path.read_bytes()
    if has_content_credentials(data):
        return len(data), len(data), "kept: content credentials"
    out = oxipng.optimize_from_memory(data, level=6) if oxipng else pillow_encode(data)
    if len(out) >= len(data):
        return len(data), len(data), "kept: already smallest"
    if pixels(out) != pixels(data):
        return len(data), len(data), "skipped: not pixel-identical"
    if not dry_run:
        path.write_bytes(out)
    return len(data), len(out), "optimised"


def main() -> None:
    args = [a for a in sys.argv[1:] if a != "--dry-run"]
    dry_run = "--dry-run" in sys.argv
    if not args:
        sys.exit(__doc__)
    files = sorted({p for a in args for p in ([Path(a)] if Path(a).is_file() else Path(a).rglob("*.png"))})
    before = after = 0
    for path in files:
        b, a, note = optimise(path, dry_run)
        before += b
        after += a
        print(f"{b:>10} -> {a:>10}  {note:<30} {path}")
    print(f"\n{len(files)} PNGs with {'oxipng' if oxipng else 'Pillow'}: {before / 1e6:.2f} MB -> {after / 1e6:.2f} MB, saved {(before - after) / 1e6:.2f} MB{' (dry run)' if dry_run else ''}")


if __name__ == "__main__":
    main()
