# Magnific production log: v2 identity (ONE Agency Brand Kit v2.0, 2026-11-20)

Re-export of every Magnific-made asset in the new brand: Navy #020257, Mint #00FAB3, Ultra Violet #6203D0, Sky #D0E6FD,
Mist #EBEBED and white; Unbounded and Geist; concept 01 "Nova" (radii 24/12/40, pill CTAs, Frames in orbit). No glow,
halo, backlight, bloom, lens flare or neon anywhere (the user's hard rule). Copy is v1's, word for word.
Continues design/magnific/log.md (v1.0) and design/magnific/glass/log.md (v1.1). v1 designs, creations and the v1 brand
kit "ONE Agency" were left untouched; everything below is new. Nothing was shared.

Account: Magnific Plus. Credits at start of this job: 18,038 available. Credit cap for the job: 3,200.

## Project folder
- "ONE Agency Brand Kit" (project) reference `2ec0b013-16b0-451a-a365-7560a3a3ae11` (same as v1).

## Brand kit "ONE Agency v2" (id `42FH9AaisN`)
- `brand_kit_duplicate` of "ONE Agency" (`j7NxLD0Vkf`), renamed "ONE Agency v2". The v1 kit is intact.
- Logo: the 12 v2 masters (public/kit/logos/*/…_4x.png: horizontal, stacked, mark x on-navy, on-light, navy, white)
  uploaded as creations "v2_one-agency_logo_[lockup]-[variant]_4x.png": horizontal-on-navy `w4a1Vhc7EI`,
  horizontal-on-light `gOm5cIQSXO`, horizontal-navy `p8yzkO7ehw`, horizontal-white `6AbU8q4iJO`, stacked-on-navy
  `kseCZeN16B`, stacked-on-light `yiuLeubPW9`, stacked-navy `lJtbWmJgv9`, stacked-white `gOm5chpSXO`, mark-on-navy
  `9ZHgBqUNYZ`, mark-on-light `dt4YrNqXSL`, mark-navy `iG5wIkF3uK`, mark-white `EbYoycouuO`.
  - The six old (silver/chrome) logo marks removed from the v2 kit (`logo_entry_remove`, one string per call; an
    array was silently ignored) and the six old-logo documents deleted from the v2 kit only.
  - Six new logo documents added from the creations (stacked, horizontal, mark x on-navy, on-light). The analysis
    picked stacked-on-light as canonical; set by hand to stacked-on-navy (`kseCZeN16B`). Logo description and its 8
    rules rewritten for the flat v2 variants.
- Fonts: Unbounded 500/600/700 uploaded and registered (user_font_id 25672 / 25671 / 25673; 600 = display and
  heading). Geist 400/500/600/700 re-registered (the files matched the account's existing fonts 24054 / 24055 /
  24056 / 24053). Metal and Lato removed from families, tiers and rules. Tiers: display Unbounded 600, heading
  Unbounded 600 (subheads Geist 500), body Geist 400, label Geist 600.
- Palette, value for value (12 entries): Navy #020257, Mint #00FAB3, Ultra Violet #6203D0, Sky #D0E6FD, Mist #EBEBED,
  White #FFFFFF (core); Void #010138, Raised #132A6E, Text 2 #C2CBDE, Violet light #A08CEC, Mint deep #00CDA6,
  Violet deep #5006B9 (marketing, derived).
- False positives the logo-image analysis wrote, all reset: palette additions #00FAB3 (duplicate), #6203CF, #0A0E20,
  #020256; voice atoms and voice rule rewritten (original text restored); v1-style rules re-added ("solid Rose CTA",
  "Metal serif in Rose", "Rose edge glow", "Rose checkmark icons", "avoid light backgrounds"); an
  `imagery.observed_system` text describing the pink neon look (replaced with a v2 description); status set to
  "ready" (set back to "draft"). Kept: "AI search visibility" added to `brand.company_type`.
- Rules: 26 rewritten in place (Colors, Typography, Imagery, Illustrations, Icons, Graphic elements, Patterns,
  Applications, kit level), 4 removed, 7 added (gradient use; Mint never text on light / Violet light on Navy; CTA
  colour ban; stat numbers; no pink cast or glow in photos; white or silver icons in 12 px tiles; no glow around glass).
  Imagery atoms (medium, aesthetic, avoid, prompt fragments) rewritten; voice kept.
- Hard bans added (`brand_kit_add_rule`; the v1 bans stock office, robot hands, glowing AI brain, brand logos and text
  overlay are kept): glow `3ba072ba…`, halo `97deafaa…`, bloom `bf0a3e84…`, backlight `31d2dac9…`, lens flare
  `d55fd141…`, neon `41ef040f…`, pink or rose colour `2ac778de…`.
- The 19 pink v1 items (9 glass reference ads, 3 illustration crops, 5 icon crops, the halftone arc, the dot pattern)
  moved to the Library slot so they never feed generation; nothing deleted. The nine glass-ref documents stay in
  Documents (their analysis text still describes pink; Library keeps them out of generation).
- Asset added: "Frames in orbit (on Navy)" SVG (patterns slot). The CTA pill SVG was skipped (it carries live text and
  an embedded font).
- design_md: a v2 token sheet (palette and roles, gradients, type tiers, radii, pill CTA rules, no-glow rule).
- Left in "draft": `atoms.typography.uploaded_fonts.lato` (user_font_id 24057) cannot be removed through the API
  (updates to `uploaded_fonts` are ignored). It is not a family, tier or rule, and generation worked with the kit in
  draft. Set it to ready in the app (Library > Brand kits > ONE Agency v2) once that entry is cleared.
- Credits used by the kit work, including the logo analysis: 0 (balance unchanged at 18,038).

## Layout method (design/magnific/scripts-v2/)
- Same method as v1 (gen.py / layouts.py / run.py print one designs_add_blocks array per page; every block absolute).
  New in v2: Unbounded 600 for headline, accent word, stat numbers and carousel numbers; Geist for the rest.
- Unbounded re-measured in the Designer: a single-line Unbounded box is 1.24 x size tall (Designer default lineHeight
  1.24, hhea 995/-245), ascent 0.995 x size; Geist stays 1.01 / 1.31. Widths from the TTFs with -0.02 em tracking run
  0.2-1% wide of the Designer, so fitted headlines never overflow. Because the accent word is the same face and size as
  the headline, every segment shares one top y (the v1 Metal baseline offset is gone).
- Accent word and stat numbers: gradient Mint #00FAB3 to Violet light #A08CEC (Ultra Violet itself is too weak on Navy).
- The v1 halo glow (`Page.halo`) is replaced by `Page.orbit`: Nova's orbit lines, two tilted ribbons of two ellipses,
  Mint to Violet light at 30% with one lit stretch each. The Designer refuses `stroke-dasharray`, so every ellipse and
  lit stretch is a sampled polyline in whole pixels. No orbit on 728x90, 160x600 and 320x50 (too busy).
- CTA = Mint pill (textBackground, cornerRadius -1), Navy Geist 600 text. Proof bar and attribution chip on Raised
  #132A6E, proof bar radius 24 (Nova). Eyebrow Geist 600 caps in Mint, 0.14 em. Sub lines Geist 500 in Text 2.
- Logos are the v2 on-navy PNGs as image blocks (horizontal; stacked on 160x600 and the Google logo square; the mark
  on 320x50, where v1 used the ONE icon).
- Headline breaks (same words): Web banners 160x600 now sets the template headline in four lines ("Headline / in two /
  short / lines"); Sample A 728x90 uses the two-line break. Unbounded is wide, so most headlines are fitted (`fit_S`).
- Fixes folded back into the scripts after the build: landscape (1200x627/628) orbit and result line -80 px (the lit
  arcs crossed headline line 1); 300x250 orbit +40/-38 px; 300x250 footer anchored by its wrapped height; Sample B
  1080x1920 result line -60 px (it touched the gradient bar); `nowidow()` picks a sub width that never leaves one word
  on the last line. The designs carry the equivalent manual patches listed below, so a page regenerated from the
  scripts can differ from the design by a few px or a sub width.

## Designs
All new, in project "ONE Agency Brand Kit", attached to the "ONE Agency v2" kit, Navy #020257 pages. Same pages and
sizes as v1. Editable source = these designs.

| Design | id | webUrl | Pages |
|---|---|---|---|
| ONE Agency v2 · Template · Social | 0eURsCbTfW | https://www.magnific.com/app/designer/0eURsCbTfW | 1080x1080, 1080x1350, 1080x1920 |
| ONE Agency v2 · Template · Social carousel | xSBQXPSjfW | https://www.magnific.com/app/designer/xSBQXPSjfW | 5 x 1080x1080 (continuous line, joins verified) |
| ONE Agency v2 · Template · LinkedIn | gOm5mreSXO | https://www.magnific.com/app/designer/gOm5mreSXO | 1200x627, 1080x1080 |
| ONE Agency v2 · Template · Google display | 6AbU55xiJO | https://www.magnific.com/app/designer/6AbU55xiJO | 1200x628, 1200x1200, logo 1200x1200, logo 1200x300 |
| ONE Agency v2 · Template · Web banners | O6EjQSZynm | https://www.magnific.com/app/designer/O6EjQSZynm | 970x250, 728x90, 300x600, 300x250, 160x600, 320x50 |
| ONE Agency v2 · Sample ad A · Growth Audit | If3VNDxtvE | https://www.magnific.com/app/designer/If3VNDxtvE | 9 sizes |
| ONE Agency v2 · Sample ad B · Proof | If3VRF9tvE | https://www.magnific.com/app/designer/If3VRF9tvE | 9 sizes |
| ONE Agency v2 · Sample ad C · Award | 5jDaXYvKxe | https://www.magnific.com/app/designer/5jDaXYvKxe | 9 sizes |

Dropped lines as v1 (wording never changed): A drops eyebrow + sub at 300x250 / 970x250 and keeps headline + CTA only
at 728x90; B drops the proof bar at 300x250 / 728x90 / 970x250 and keeps the legal line on all 9 sizes; C drops
eyebrow + sub at 300x250 / 728x90 / 970x250 and keeps "Awarded to ConversionIQ.ai" on all 9 sizes.
Social page 1 was first built by hand to calibrate Unbounded and the orbit SVG, then cleared and rebuilt from its file.

Manual patches in the designs (positions and widths only):
- LinkedIn p1 and Google display p1: orbit group (582, -7) -> (582, -87), result line (760, 193) -> (760, 113).
- Web banners p4 (300x250): orbit group (138, -12) -> (178, -50).
- Sample A p7 (300x600): sub width 227 -> 175 ("keep." was alone on the last line).
- Sample B p3 (1080x1920): result line y 344 -> 284; p6 (300x250): CTA y 176.6 -> 154, legal line y 214.3 -> 196
  (the two-line legal line ended 4 px from the edge).
- Sample C p4 and p5: sub width 660 -> 480; p7: sub width 227 -> 252 ("Association" was alone on the last line).

## designs_check notes (judged false positives, verified visually)
- "text_overlap" between stacked headline line blocks: an Unbounded single-line box is 1.24 x size tall while lines are
  pitched 1.08 x size, so the boxes overlap but the glyphs do not.
- "low_contrast" on CTA pills: the checker ignores the Mint textBackground. Real pair Navy #020257 on Mint #00FAB3,
  about 12:1.
- "no_logo": the logo is the kit's uploaded PNG as an image block.
- "off_page" (LinkedIn p1, Google p1, Web banners p1/p4, Sample A p6/p9): the Designer splits the orbit SVG into
  sub-paths, and two ellipse arcs sit wholly above the page. They never render.
- Orbit lines pass faintly behind some headline words (Sample A 300x250, Sample B 1080x1080) at 30%; type stays fully
  legible, left as is.

## Exports
- designs_export PNG per design (zip), downloaded at once with curl into a new directory per design, unpacked and
  converted by scripts-v2/ingest.py (unchanged copy of v1 ingest.py) run with Python in isolated mode (-I).
  PNG + JPG q85 + WebP q82 per page, sizes asserted, written over the v1 files of the same names in
  public/kit/templates/ (141 files: 47 pages x 3 formats). Contact sheets of the exports reviewed after ingest.

## Imagery (images_generate, Magnific One + "ONE Agency v2" kit, 1:1 at 2048x2048, 180 credits each, 8 images = 1,440)
Same subjects as v1; prompts are v1's with the palette swapped (Navy shadows, one Mint and one Ultra Violet object as
accents) and the light made flat: no lanterns, glowing practicals, bokeh glints, sun flare or neon.

| Subject | creation | webUrl |
|---|---|---|
| resort-guests | P3Qsv0l42C | https://www.magnific.com/app/creation/P3Qsv0l42C |
| cruise-booking | hu2pNjivqL | https://www.magnific.com/app/creation/hu2pNjivqL |
| sales-agent | 9ZHgfDBNYZ | https://www.magnific.com/app/creation/9ZHgfDBNYZ |
| franchise-owner | 3zK7QBMREY | https://www.magnific.com/app/creation/3zK7QBMREY |
| healthcare-front-desk | JNCxt0wOq4 | https://www.magnific.com/app/creation/JNCxt0wOq4 |
| admissions | 5jDaWNhKxe | https://www.magnific.com/app/creation/5jDaWNhKxe |
| orlando-night | dt4YwkYXSL | https://www.magnific.com/app/creation/dt4YwkYXSL |
| small-business-owner | O6EjmD5ynm | https://www.magnific.com/app/creation/O6EjmD5ynm |

All eight read with creations_read; none regenerated. Judgments: no glow, bloom or flare; no text or logos (the cruise
itinerary's print is soft and unreadable, as in v1); no pink. Orlando checked at 1024 px: tower crown lights are crisp
strips with no halo or starburst. The cruise pendant lamp is a lit practical with no halo around it. Resort is now an
afternoon scene (v1 was golden hour) and Orlando is blue hour (v1 was full night). Crops made locally
(scripts-v2/imagery.py, Pillow LANCZOS, JPG q85 + WebP q82): 2048 master, 1080x1080, 1080x1350, 1080x1920 and
1200x628, centred, with the wide crop's vertical focus raised for standing subjects (resort 0.42; franchise,
healthcare, sales 0.45). Licence: AI-generated in Magnific, owned by ONE Agency per Magnific plan terms; the Orlando
skyline is an AI evocation, not a photograph of the real skyline. 80 files replaced in public/kit/imagery/
(imagery/photos/ not touched).

## Glass illustrations (images_generate, Magnific One + v2 kit, 1:1 2048x2048, 180 credits each, 8 = 1,440)
v1 subjects and prompts repainted: Navy #020257 ground, navy-tinted frosted glass, a thin crisp Mint hairline edge
instead of the rose rim light, a soft dark contact shadow instead of the rose under-glow and reflection, white-silver
glyphs, Mint check badges with a Navy check. Toggle-check stays the violet variant: a flat Ultra Violet to Navy
ground, no streaks or bokeh.

| Subject | on-dark creation | cut-out creation |
|---|---|---|
| magnifier | https://www.magnific.com/app/creation/dt4YZDuXSL | https://www.magnific.com/app/creation/If3VWs3tvE |
| seo-document | https://www.magnific.com/app/creation/5jDa8q7Kxe | https://www.magnific.com/app/creation/gOm5Fc9SXO |
| review-star | https://www.magnific.com/app/creation/lJtbEs7gv9 | https://www.magnific.com/app/creation/kseChZB16B |
| cro-window | https://www.magnific.com/app/creation/BhNcAXMoQR | https://www.magnific.com/app/creation/WDgi4F8cXe |
| growth-stairs | https://www.magnific.com/app/creation/EbYoDEBuuO | https://www.magnific.com/app/creation/MBJA3KNDCm |
| profile-stack | https://www.magnific.com/app/creation/EbYopQouuO | https://www.magnific.com/app/creation/CqnBpPQEEy |
| toggle-check (violet variant) | https://www.magnific.com/app/creation/xSBQasCjfW | https://www.magnific.com/app/creation/lJtbQ0Dgv9 |
| lead-flow | https://www.magnific.com/app/creation/1ldEhLEr4r | https://www.magnific.com/app/creation/mEZD0wIhJQ |

All first takes, all eight read with creations_read; no text or letters in any. The review star looked like it might
carry an edge glow at 512 px; checked at 1024 px and at full resolution (crops of the star, magnifier and stairs
edges): the Mint edge is a crisp 1-2 px line with no halo, so it stays. Lead-flow's dot stream is mostly white (v1 went
white to rose); accepted. Variants built locally with scripts-v2/illus.py (v1 recipe; the on-light shadow is now
Navy-tinted): on-dark, transparent (images_remove_background, 3 credits each) and on-light (#FFFFFF), 1200x1200 PNG +
WebP q82, 48 files replaced in public/kit/illustrations/ (same names). The cut-outs lose the ground and its shadow; the
lead-flow cut-out also loses most of the dot stream (as in v1).

**2026-11-20 note:** lead-flow was dropped from the kit at the user's request: its dot stream reads as the retired particle
stream. Its files, manifest entries and script entries are removed; this row stays as history (21 variants, 7 subjects remain).

## Textures (built locally, scripts-v2/textures.py, seed 20261117 as v1)
- halftone-arc 2048x1024 (PNG, WebP, SVG): Mint dots, v1 geometry (2,381 circles). Theme now "dark".
- particle-stream 2048x768 (PNG, WebP, SVG): white to Mint, v1 geometry (5,545 dots + 12 paths); the v1 blurred "soft
  glow" layer under the dots is removed.
- grain 512x512: colourless; the v2 build is pixel-identical to v1, so the v1 file is kept unchanged.
- ground-violet-navy 1920x1080 (JPG q88, WebP q82), new: flat Ultra Violet -> Navy -> Void gradient with light grain,
  the ground of the violet variant (replaces violet-streaks without streaks, bokeh or glow).
- Removed (glow textures): rose-underglow (PNG, WebP), violet-streaks (JPG, WebP), ground-rose-glow (JPG, WebP).
  No remaining file name carries an old colour (rose, lilac), so nothing needed a rename beyond these removals.
- Numpy is not installed system-wide on this machine: the texture, illustration and contact scripts ran in a scratch
  venv (numpy 2.0.2, Pillow 11.3.0) with `python -I`.

## Manifests (scripts-v2/manifests.py, run from the repo root)
- src/data/ads.generated.json: version 2.0, brandKitUrl -> ONE Agency v2, every magnificUrl -> the v2 design or
  creation, imagery notes rewritten. 87 items; ids, names, paths and sizes unchanged; every file checked on disk.
- src/data/glass.generated.json: version 2.0, source this log; 24 illustration items with v2 links and notes;
  textures 6 -> 4 (halftone-arc, particle-stream, grain, ground-violet-navy). 28 items, every file checked on disk.
- src/data/assets.generated.json: file entries for templates/, imagery/ (not photos/), illustrations/ and textures/
  re-read from disk (bytes, width, height), 6 removed and 2 added, group counts and bytes recomputed (glass 72 -> 68).
  The ZIP entries (and public/kit/zips) still hold v1 files: `npm run kit:zips` was not run, per the brief.
- `npm run kit:optimise` run (Pillow fallback; pyoxipng is not installed). It kept every new file as written and also
  rewrote 63 PNGs in public/kit/logos/ losslessly (pixels identical, smaller). That folder is outside this job; the
  revert (`git checkout -- public/kit/logos`) was blocked by the session's permission check, so it is left for the CD.

## Extra: Mint photo for the Nova set (Develop wires it in)
- images_generate, model Nano Banana 2 Flash (no kit: the kit forces Navy grounds), 3:2, 75 credits:
  "ONE Agency v2 · Photo · Mint paper waves", https://www.magnific.com/app/creation/Xm9WAQjBfo
  Soft layered matte paper waves, one colour, diffused daylight, no glow, streaks, bokeh, text or people. First take.
- design/magnific/v2-photo-mint/one-agency_photo-mint-paper-waves_900x600.webp (centre crop of the 1264x848 render to
  3:2, LANCZOS to 900x600, WebP q82, 14,920 bytes).
- Measured: saturation-weighted mean hue 168.3 deg (target about 162; it leans blue, not toward grass green or yellow);
  mean colour #7ED1C1, mean saturation 0.43, so it is a paler, softer Mint than #00FAB3 itself.

## Credits
- simulate_cost: images_generate with the v2 kit = 180 (exact); images_remove_background = 3 (exact); Nano Banana 2
  Flash 3:2 = 75 (exact).
- Balance 18,038 at start; 18,038 after the kit work; 16,598 after imagery (1,440); 15,059 after illustrations, cut-outs
  and the Mint photo (1,440 + 24 + 75 = 1,539). Every step matched its estimate.
- Credits used by this job: 2,979 of the 3,200 cap. No retakes were needed.

## Scripts (design/magnific/scripts-v2/)
gen.py, layouts.py, run.py (v2 layouts), ingest.py (v1 copy), imagery.py (new: imagery crops), illus.py and
contact.py (v2 copies of glass/scripts), textures.py (v2), manifests.py (new). The v1 scripts in scripts/ and
glass/scripts/ are unchanged.

## Follow-ups (2026-11-20, after the first hand-back)

### Violet photo for the Nova set (replaces "Violet ribbon swirl", Unsplash 1uyWq9xVwcE, which had pink-lit light trails)
- images_generate, model Nano Banana 2 Flash (no kit), 3:2, 75 credits (simulate_cost 75, exact), same recipe as the
  Mint paper waves with Ultra Violet #6203D0: "ONE Agency v2 · Photo · Violet paper waves",
  https://www.magnific.com/app/creation/Xm9cKPQBfo . First take; read with creations_read: matte layered paper waves in
  one deep violet, soft diffused light, no lit edges, glow, trails, bokeh, text or people.
- design/magnific/v2-photo-violet/one-agency_photo-violet-paper-waves_900x600.webp (centre crop of the 1264x848 render
  to 3:2, LANCZOS to 900x600, WebP q82, 22,080 bytes). Develop wires it in; nothing written to public/kit or src.
- Measured: saturation-weighted mean hue 260.1 deg (#6203D0 is about 268; well below the 290 deg pink/magenta limit),
  mean colour #56319E, mean saturation 0.71.

### "ONE Agency v2" brand kit: stray uploaded_fonts.lato
- Routes tried (all on 42FH9AaisN, each checked with brand_kit_get full + jq): `uploaded_fonts: {lato: null}`,
  `uploaded_fonts: {}`, the full typography with `uploaded_fonts` minus lato and `user_requested_overwrite: true`,
  `section_item_remove` on a Lato item, a writability probe (`lato: {family: "Geist", …}`; the server recorded a write
  but left uploaded_fonts as it was), brand_kit_organize of the Typography section with only the Unbounded and Geist
  faces, re-registering Geist 400 as body (matched font 24054; typography byte-identical), and a temporary "Lato"
  family filed and then deleted with `section_item_remove` (the face went, uploaded_fonts.lato stayed). Result: the
  server treats `uploaded_fonts` as server-owned and drops client writes to it; the entry is still there
  (body Geist 24054, label Geist 24056, display/heading Unbounded 25671, lato Lato 24057).
- The one remaining route, `atoms: {typography: null}` with `user_requested_overwrite: true` followed by restoring the
  families and tiers and re-registering the four role fonts, was blocked by the session's permission check as
  destructive and was not attempted another way.
- Status: the kit was already "ready" when this follow-up started (updated 23:50:11, not set by this job's calls);
  left as it is. Families (Unbounded, Geist), tiers, the 12-colour palette, rules, logos and design_md unchanged.
  Lasting side effect: the Unbounded and Geist faces are now filed as two items in the Typography section (correct
  filing; removing them would delete the faces).

### Particle stream texture removed (client decision)
- Develop deleted the particle-stream files, its generation in scripts-v2/textures.py and its manifest entry.
  scripts-v2/manifests.py no longer lists texture-particle-stream (it would have re-added an entry pointing at
  deleted files) and scripts-v2/contact.py no longer draws it. Both still run: contact.py rebuilt the review sheet,
  and a dry run of manifests.py on a copy of src/data reproduced the current ads, glass (27 items) and assets
  manifests byte for byte. The texture and manifest notes above describe the state before this removal.

### Credits
- Balance 15,059 -> 14,984 (75, the Violet photo). Credits used by this job in total: 3,054 of the 3,200 cap.
