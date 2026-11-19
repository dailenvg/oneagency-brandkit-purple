# Magnific production log: glass & texture style (ONE Agency Brand Kit v1.1, 2026-11-17)

Continues design/magnific/log.md (v1.0). Same project folder "ONE Agency Brand Kit" and brand kit "ONE Agency".

## Brand kit update
- Uploaded the 9 reference ads (/Users/dailenvazquez/Projects/One Agency/Ads/*.png, 1254x1254) as creations in the project
  folder (glass-ref-01 .. glass-ref-09) and added them to the kit as image documents.
- Image analysis ran on arrival and, as in v1.0, rewrote parts of the kit. Reverted:
  - Palette: it added "Void Navy" #0A0E20, "Brushed silver" #CED0CE and "Graphite navy" #2C3246. Reset to the 12 site
    tokens, value for value (#01030F, #FFFFFF, #FFA0AA, #378DF0, #0A0E1F, #11162A, #181E35, #B0B2C1, #E8808C, #6D92DE,
    #F4F3FE, #E8B87D).
  - Typography tiers: it set Metal as the display tier and Geist 500 labels. Reset to Geist 700/600/400/600, Metal = one
    accent word only.
  - Voice: it replaced the do/don't lists and dropped the banned-word list and the em-dash ban. Restored them; kept two
    useful additions ("X into Y" phrasing, open with a pointed question).
  - Brand positioning text restored. Colour rule "Never place text on light or white backgrounds" removed (light variants
    are allowed). Typography rule "rose italic serif" replaced by "Metal, the serif accent face, rose or rose-to-lilac".
  - Left in place (judged harmless): "Avoid stock photography of people in layouts" (imagery subsection) and the
    extracted kit rule "Place the logo at the top of the layout".
- Imagery atoms: medium is now two media (photography + glass illustration); removed "3D renders" from medium_avoid,
  added "Text, letters or numbers baked into illustrations" to avoid.
- Organized Assets (brand_kit_organize):
  - Illustrations: 8 rules for the glass style (frosted 3D glass UI objects at 10-20 degree perspective on #01030F, rose
    #FFA0AA rim light, inner glow, specular top-left, ~24px radii / pill toggles, depth stacks of 2-3 with dimmer blurred
    back layers, silver glyphs, rose check badges, rose under-glow + reflection, optional halftone arc and white-to-rose
    particle stream, optional violet-to-blue variant used alone; no text/letters/numbers/logos, no robot hands, no glowing
    brains, no other brands' logos, no colour outside rose/white/silver/near-black). Items: 3 glass crops the analysis cut
    from the ads.
  - Icons (5 silver icon crops), Graphic elements (halftone arc crop), Patterns & textures (purple dot crop),
    Applications & layouts (the 9 ads, with a layout rule), Library (4 CTA button crops that carry text, kept out of
    generation).
  - Colors: restored the v1.0 "accent colour is for one thing per ad" rule (now also allowing rose as glass rim light),
    added a light-variant rule.
- Hard ban (brand_kit_add_rule, merged into the existing "text overlay" rule): no text, words, letters, numbers, captions,
  UI copy or watermarks in photographs or glass illustrations; placeholder bars instead.

## Illustrations (images_generate, Magnific One + kit, 1:1, 2048x2048, 180 credits each)
| Subject | on-dark creation | cut-out creation | notes |
|---|---|---|---|
| magnifier | https://www.magnific.com/app/creation/UPhI5Jewny | https://www.magnific.com/app/creation/Ifi9DvotvE | first take |
| seo-document | https://www.magnific.com/app/creation/DoJU2BYpcl | https://www.magnific.com/app/creation/iGbFJGD3uK | first take |
| review-star | https://www.magnific.com/app/creation/lJIBHyagv9 | https://www.magnific.com/app/creation/gOtok4RSXO | first take |
| cro-window | https://www.magnific.com/app/creation/VXwgRI3MMU | https://www.magnific.com/app/creation/UPhIriowny | first take |
| growth-stairs | https://www.magnific.com/app/creation/fHGZBpSCDY | https://www.magnific.com/app/creation/cpgLAf20eP | 2nd take; v1 (WDljN8OcXe) read as a bar chart |
| profile-stack | https://www.magnific.com/app/creation/Bh9yYq0oQR | https://www.magnific.com/app/creation/Lwodb9RswO | first take |
| toggle-check (violet-blue) | https://www.magnific.com/app/creation/WDljNa6cXe | https://www.magnific.com/app/creation/WDljRIwcXe | first take |
| lead-flow | https://www.magnific.com/app/creation/TdUl2RiVNR | https://www.magnific.com/app/creation/gOtornESXO | 2nd take; v1 (O6CvrMAynm) had a weak stream |
All checked visually (contact sheet + creations_read on the retakes); no text or letters in any image.
Variants built locally (design/magnific/glass/scripts/illus.py): 1200x1200 PNG + WebP q82 for on-dark, transparent
(images_remove_background, 3 credits each) and on-light (#FFFFFF + soft #01030F contact and ambient shadow).
The cut-outs lose the glow, reflection and the toggle's light streaks (they belong to the ground); the glass reads as
smoked/dark on white.

## Textures (built locally, design/magnific/glass/scripts/textures.py, deterministic seed 20261117)
halftone-arc 2048x1024 (PNG, WebP, SVG), particle-stream 2048x768 (PNG, WebP, SVG), grain 512x512 (PNG, tileable),
rose-underglow 2048x768 (PNG, WebP), violet-streaks 1920x1080 (JPG q88, WebP q82), ground-rose-glow 1920x1080 (JPG, WebP).
Local build chosen over generation: exact rose values, true transparency, tileable grain, vector SVG sources, no credits.

## Files and manifest
- public/kit/illustrations/ (48 files), public/kit/textures/ (13 files); every file's pixel size matches its name
  (checked with Pillow; SVG width/height attributes checked).
- src/data/glass.generated.json: 30 items (24 illustration variants, 6 textures).
- Review sheets: scratchpad review/glass-contact.png and review/textures-contact.png.

## Credits
- simulate_cost: images_generate with kit = 180 (exact); images_remove_background = 3 (exact).
- Spent by this job: 10 generations (8 + 2 retakes) = 1,800 + 8 background removals = 24. Total 1,824 (cap 3,000).
- Balance 27,497 before, 25,413 after = 2,084 moved. The 260 not explained by this job's generations is either the
  brand-kit image analysis of the 9 documents or other activity on the shared account during the run.
