#!/usr/bin/env python3
"""
Import the creative ads designed in Magnific into the kit.

Each concept is one Magnific Designer document ("ONE Agency ad – <name>", in the ONE Agency Brand Kit project, folder
"Frosted glass ads") with four pages in this order: square 1080x1080, portrait 1080x1350, story 1080x1920 and
landscape 1200x627. Export it as PNG from Magnific (the ZIP, or the four page PNGs ending -01 to -04), then:

  python3 scripts/import-magnific-ads.py <concept-id> <export.zip | folder>   one concept
  python3 scripts/import-magnific-ads.py --manifest                           only rebuild the manifest (npm run kit:ads)

For every page it checks the size, writes the PNG (stored as RGB: the ads are opaque) and a WebP at quality 90 to
public/kit/ads/creative/<concept>/one-agency_ad-<concept>_<WxH>.<ext>, then rewrites
src/data/ads-creative.generated.json from the files on disk (the hub's images and download links). Needs Pillow.
"""

from __future__ import annotations

import json
import re
import sys
import tempfile
import zipfile
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'public/kit/ads/creative'
MANIFEST = ROOT / 'src/data/ads-creative.generated.json'
SOURCE = ROOT / 'src/data/ad-creative.ts'

# Page order of every Magnific ad design (matches CREATIVE_AD_SIZES in src/data/ad-creative.ts).
SIZES = [('square', 1080, 1080), ('portrait', 1080, 1350), ('story', 1080, 1920), ('landscape', 1200, 627)]
WEBP_QUALITY = 90


def concept_ids() -> list[str]:
    """Concept ids in CREATIVE_CONCEPTS order, read from the data file so the two never drift."""
    body = SOURCE.read_text().split('export const CREATIVE_CONCEPTS', 1)[1]
    return re.findall(r"^    id: '([a-z-]+)'", body, flags=re.M)


def file_name(concept: str, w: int, h: int, ext: str) -> str:
    return f'one-agency_ad-{concept}_{w}x{h}.{ext}'


def pages_from(source: Path, work: Path) -> list[Path]:
    """The four page PNGs of an export, in page order."""
    if source.suffix == '.zip':
        with zipfile.ZipFile(source) as z:
            z.extractall(work)
        source = work
    pngs = sorted(p for p in source.rglob('*.png') if re.search(r'-0[1-4]\.png$', p.name))
    if len(pngs) != 4:
        sys.exit(f'Expected four page PNGs ending -01 to -04 in {source}, found {len(pngs)}.')
    return pngs


def import_concept(concept: str, source: Path) -> None:
    dest = OUT / concept
    dest.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        for page, (fmt, w, h) in zip(pages_from(source, Path(tmp)), SIZES):
            img = Image.open(page)
            if img.size != (w, h):
                sys.exit(f'{page.name}: expected {w}x{h} for the {fmt} page, got {img.size[0]}x{img.size[1]}.')
            rgb = img.convert('RGB')
            png, webp = dest / file_name(concept, w, h, 'png'), dest / file_name(concept, w, h, 'webp')
            rgb.save(png, optimize=True)
            rgb.save(webp, quality=WEBP_QUALITY, method=6)
            print(f'{concept:<20} {fmt:<10} PNG {png.stat().st_size // 1024:>5} KB · WebP {webp.stat().st_size // 1024:>4} KB')


def write_manifest() -> int:
    items = []
    for concept in concept_ids():
        for fmt, w, h in SIZES:
            files = {
                ext: {'url': f'/kit/ads/creative/{concept}/{file_name(concept, w, h, ext)}'}
                for ext in ('png', 'webp')
                if (OUT / concept / file_name(concept, w, h, ext)).exists()
            }
            if files:
                items.append({'concept': concept, 'format': fmt, 'width': w, 'height': h, 'files': files})
    stamp = datetime.now(timezone.utc).isoformat(timespec='milliseconds').replace('+00:00', 'Z')
    MANIFEST.write_text(json.dumps({'generatedAt': stamp, 'items': items}, indent=2) + '\n')
    return len(items)


def main(argv: list[str]) -> None:
    if argv == ['--manifest']:
        pass
    elif len(argv) == 2:
        concept, source = argv[0], Path(argv[1]).expanduser()
        if concept not in concept_ids():
            sys.exit(f'Unknown concept "{concept}". Known: {", ".join(concept_ids())}')
        if not source.exists():
            sys.exit(f'Not found: {source}')
        import_concept(concept, source)
    else:
        sys.exit(__doc__)
    print(f'Manifest: {write_manifest()} ads in {MANIFEST.relative_to(ROOT)}')


if __name__ == '__main__':
    main(sys.argv[1:])
