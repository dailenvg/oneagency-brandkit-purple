# Magnific production log (ONE Agency Brand Kit v1.0, 2026-11-17)

Account: Magnific Plus. Credits at start: 19,469 available.

## Project folder
- "ONE Agency Brand Kit" (project) reference `2ec0b013-16b0-451a-a365-7560a3a3ae11`

## Brand kit "ONE Agency" (id `j7NxLD0Vkf`)
- Sources: scrape of https://oneagency.com; 6 logo PNGs (stacked/horizontal/icon, on-dark + on-light, 4x) uploaded as creations
  (stacked-on-dark `Xm4USIEBfo`, stacked-on-light `8a6J7vyIrU`, horizontal-on-dark `mERPyERhJQ`, horizontal-on-light `8a6J7f4IrU`,
  icon-on-dark `5jMnzs9Kxe`, icon-on-light `3z5ECWgREY`); scraped live logo `YMsKbCaWeC`.
- Fonts registered from public/kit/fonts: Geist 400/500/600/700, Lato 700, Metal 400.
- Palette: the scrape wrote Void Navy #0A0E20 and Lavender #B3A4F0; the logo image analysis re-added #0A0E20 and #141A30.
  Both times the palette was reset to the site tokens, value for value: --ground #01030F, white #FFFFFF, --rose #FFA0AA,
  --lilac #378DF0, --surface #0A0E1F, --band #11162A, --raised #181E35, --text-2 #B0B2C1, --rose-deep #E8808C,
  --lilac-deep #6D92DE, --lavender #F4F3FE, --pos #E8B87D.
- The scrape also set Poppins as a label font and Metal as the display tier; both corrected (Geist tiers, Metal = accent word only).
- Hard bans (negative prompt): stock office, robot hands, glowing AI brain, brand logos, text overlay.
- Kit rules: accent colour for one thing per ad; real customer moments; light variants only on --paper with --ink.

## Layout method
- Pages are built from scratchpad scripts (gen.py / layouts.py / run.py) that measure text with the kit's own TTFs and place
  every block absolutely (Geist baseline = top + 1.01 x size, Metal baseline = top + 1.27 x size), so the Metal accent word
  sits on the Geist baseline. Accent word = separate text block with the rose-to-lilac gradient fill.
- CTA = Geist 600 text with a rose pill textBackground (cornerRadius -1), #01030F text.

## Designs
All in project "ONE Agency Brand Kit", all with the ONE Agency brand kit attached. Editable source = these designs.

| Design | id | webUrl | Pages |
|---|---|---|---|
| ONE Agency · Template · Social | 8a6J41ZIrU | https://www.magnific.com/app/designer/8a6J41ZIrU | 1080x1080, 1080x1350, 1080x1920 |
| ONE Agency · Template · Social carousel | 9ZFvxzKNYZ | https://www.magnific.com/app/designer/9ZFvxzKNYZ | 5 x 1080x1080 (hook, 3 points, CTA; continuous line) |
| ONE Agency · Template · LinkedIn | LwoMCN7swO | https://www.magnific.com/app/designer/LwoMCN7swO | 1200x627, 1080x1080 |
| ONE Agency · Template · Google display | SymdF2sUb8 | https://www.magnific.com/app/designer/SymdF2sUb8 | 1200x628, 1200x1200, logo 1200x1200, logo 1200x300 |
| ONE Agency · Template · Web banners | CqziDSnEEy | https://www.magnific.com/app/designer/CqziDSnEEy | 970x250, 728x90, 300x600, 300x250, 160x600, 320x50 |
| ONE Agency · Sample ad A · Growth Audit | jUBVbQfLD0 | https://www.magnific.com/app/designer/jUBVbQfLD0 | 9 sizes |
| ONE Agency · Sample ad B · Proof | P3umJ9g42C | https://www.magnific.com/app/designer/P3umJ9g42C | 9 sizes (1080x1920 lead) |
| ONE Agency · Sample ad C · Award | gOtdUeCSXO | https://www.magnific.com/app/designer/gOtdUeCSXO | 9 sizes |

Sample sizes: 1080x1080, 1080x1350, 1080x1920, 1200x627, 1200x628, 300x250, 300x600, 728x90, 970x250.
Dropped lines (wording never changed): A drops eyebrow + sub at 300x250 / 970x250, keeps headline + CTA only at 728x90.
B drops the proof bar at 300x250 / 728x90 / 970x250 but keeps the legal line everywhere. C drops eyebrow + sub at
300x250 / 728x90 / 970x250 but keeps "Awarded to ConversionIQ.ai" everywhere.

## designs_check notes (judged false positives, verified visually)
- "text_overlap" between headline blocks: Metal's line box is 2.06 x size tall (ascent 1.27), so the accent block's box
  overlaps neighbours although the glyphs do not. Setting lineHeight does not shrink a single-line box.
- "low_contrast 1.0:1" on CTA pills: the checker compares #01030F text with the page, ignoring the rose textBackground.
  Real pair: #01030F on #FFA0AA, about 11:1.
- "no_logo": the logo is placed as the kit's own uploaded PNG (image block), which the checker does not count.
- Fixed for real: legal colour #9A9DB0 (site --text-3, not in kit) -> #B0B2C1 (--text-2); widows on C landscape and
  A 300x600 sub; B 300x250 legal too close to the bottom edge; 300x600 result line touching the gradient bar.

## Exports
- designs_export PNG per design (zip), downloaded at once with curl, unpacked with python -I, sizes asserted.
- JPG (q85) and WebP (q82) made locally from the PNG with Pillow (the JPEG export was identical content; one export
  per design keeps links fresh and halves calls).

## Imagery (images_generate, Magnific One + brand kit, 1:1 at 2048x2048, 180 credits each, 8 images = 1,440 credits)
| Subject | creation | webUrl |
|---|---|---|
| resort-guests | TdUjBm2VNR | https://www.magnific.com/app/creation/TdUjBm2VNR |
| cruise-booking | Xm4wvqGBfo | https://www.magnific.com/app/creation/Xm4wvqGBfo |
| sales-agent | ovNJfrm829 | https://www.magnific.com/app/creation/ovNJfrm829 |
| franchise-owner | iGbEnIM3uK | https://www.magnific.com/app/creation/iGbEnIM3uK |
| healthcare-front-desk | DoJlI6mpcl | https://www.magnific.com/app/creation/DoJlI6mpcl |
| admissions | LwoDJEZswO | https://www.magnific.com/app/creation/LwoDJEZswO |
| orlando-night | bxVnLaU5Y2 | https://www.magnific.com/app/creation/bxVnLaU5Y2 |
| small-business-owner | yiEmRSwPW9 | https://www.magnific.com/app/creation/yiEmRSwPW9 |
All eight reviewed with creations_read; none regenerated. Crops made locally (Pillow, LANCZOS): 1:1 1080x1080, 4:5
1080x1350, 9:16 1080x1920, 1.91:1 1200x628, plus the 2048 master. Licence: AI-generated in Magnific, owned by ONE Agency
per Magnific plan terms. The Orlando skyline is an AI evocation, not a photograph of the real skyline.

## Credits
- simulate_cost: images_generate with the kit = 180 credits (exact). Only paid batch: 8 images = 1,440 credits.
- Balance: 19,469 at start. It fell to 14,428 before any generation by this job; creations_search shows other work on
  the shared account in another project at the same time (video, product shots, voiceovers). 14,428 -> 12,988 across the
  image batch = 1,440, matching the estimate. Credits used by this job: 1,440 (cap 3,000).

## Scripts
Layout generator and export ingest used for this run: design/magnific/scripts/ (gen.py, layouts.py, run.py print designs_add_blocks JSON per page; ingest.py unpacks export zips into public/kit/templates).
