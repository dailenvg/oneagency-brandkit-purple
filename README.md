# ONE Agency Brand Kit

The hosted ONE Agency brand kit: guidelines plus every downloadable asset (logos, colour, type, motion, templates,
imagery, copy, glass and texture). Digital only: RGB, px, SVG/PNG/JPG/WebP and web fonts. Version 2.0, 2026-11-20,
rebranded to the new identity: the moodboard's palette and logo, Unbounded and Geist, and concept 01 "Nova" for the
Frames in orbit pattern, the photo set, radii and UI motion timing. No glow, halo or backlight effects anywhere.

## The hub (v2.0)

A dashboard: a sidebar (a drawer below 1024 px) and one view per topic, each on its own hash route:
`#/overview`, `#/logo`, `#/colour`, `#/type`, `#/elements`, `#/glass`, `#/motion`, `#/imagery`, `#/voice`, `#/copy`,
`#/ads` and `#/assets`. Subsections have deep links (`#/logo/clear-space`). Every file downloads from the view it
belongs to (per file and as a group ZIP), Assets lists them all, and the full kit and the most used ZIPs are on
Overview. The v1.0 anchors (`#logo`, `#assets`, `#top`) still work and are rewritten to their view; an unknown
`#/path` shows a not-found view.

- **Routing** (`src/lib/router.ts`, `src/lib/views.ts`): `useRoute()` reads the hash; `views.ts` is the registry
  (labels, nav groups, icons, eyebrow numbers, document titles). Each view is a lazy chunk
  (`src/components/layout/view-loaders.ts`), preloaded on nav hover or focus.
- **Shell** (`src/components/layout/`): `AppShell` (sidebar, `TopBar`, `NavDrawer`, `ViewOutlet`, `Footer`).
  `ViewOutlet` runs the page transition (AnimatePresence `mode="wait"`, Nova's out curve, plain fade for reduced
  motion), scrolls to the top between views, sets the document title, and catches load errors with a reload action.
  After a navigation the view's h1 takes focus.
- **Theme** (`src/styles/theme.css`, `src/lib/theme.ts`): `data-theme` on `<html>`, set before first paint by the inline
  script in `index.html` (saved choice in `localStorage` key `oa-kit-theme`, else `prefers-color-scheme`). The hub draws
  with `--ui-*` variables: navy in dark (the page on the derived `--void`, cards on Navy), white with Mist surfaces and
  Sky panels in light. Brand tokens are never redefined, so swatches and the contrast matrix stay true. Brand specimens
  (logo on navy, element stages, ad text, CTA rows) pin their ground with `data-theme="dark"` (Navy) or `"light"`.
- **Möbius loop**: `public/vendor/ciq/ciq-loop.js` is ConversionIQ's key visual, copied byte for byte with its README
  (the provenance copy; never edit it). By the client's decision the kit uses a recolour: `npm run kit:mobius-colour`
  (`scripts/recolour-mobius.mjs`) writes `public/vendor/ciq/ciq-loop.one-agency.js`, with the pink end of the loop's
  colour ramps in Mint (the blue end unchanged) and the glow ground turned off (see `public/vendor/ciq/RECOLOUR.md`).
  The hub and the stills load the recolour. Live, it runs behind the Overview hero
  (`src/components/overview/MobiusLoop.tsx`): it follows the hub theme, pauses while the tab is hidden and is removed
  when you leave the view. In the kit it ships as stills (`public/kit/elements/mobius/`, `npm run kit:mobius`), and
  three creative ads (technology, results, vacation-ownership) are built on them. Credit wherever it appears:
  "Möbius loop: ConversionIQ key visual, recoloured to Mint." Never edit or redraw it; colour changes go through the
  recolour script only.

## Sources

The identity comes from the rebrand moodboard (Figma file Ex4UgCrCeAKPnv8H6BdHMm, node 133:305, exported 2026-11-20),
in `design/source/rebrand/`:

| File | What it is |
| --- | --- |
| `brand-tokens.json` | Hand-authored colour source: the five board colours (Navy, Mint, Ultra Violet, Sky, Mist), white, the logo gradient, and every derived token with its recipe. `npm run kit:tokens` builds everything from it. |
| `logo_*.svg`, `wordmark-one_gradient.svg`, `mark_*.svg`, `icon_*.svg` | The logo masters, verified against the board (written by `build-source.mjs`). The only logo source. |
| `paths.json`, `moodboard_figma-133-305.png` | The three logo paths and the board itself, for reference. |

Five colours, white and the logo gradient are the board's. Everything else is computed and labelled derived wherever
it appears: the system colours (surfaces, text greys, edges, `--violet-light`, pressed steps), the tint/shade ramps,
the hub's light theme and the highlight band tokens. Type is Unbounded (display and numerals) and Geist (body); Lato
and Metal are retired. Radii, the "Frames in orbit" pattern, the photo set (Unsplash, ids in
`src/data/imagery-photos.ts`) and the UI motion tokens come from concept 01 "Nova" (`one-agency-rebrand-v2`). The
brand moves follow the film "ONE Agency: The Free Business Audit". The glass style is codified from nine ONE Agency
reference ads and repainted in Mint and Violet.

Three files from the old live site remain in `design/source/`. `award-laurel.svg` is still read by `kit:elements`
for the award laurel; `home.css` and `one-agency-logo.svg` are kept for reference only, and no script reads them.

## Stack

Vite 8, React 19, TypeScript, Tailwind CSS 4 (`@tailwindcss/vite`), `motion` (motion/react), Phosphor icons, oxlint,
Playwright (asset rendering). Python 3 with `fonttools` and `brotli` for the font script, and `pillow` plus
`pyoxipng` for the PNG optimiser (without `pyoxipng` it falls back to Pillow and saves less).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server. `.claude/launch.json` runs it on port 5180 (`--strictPort`). |
| `npm run build` | Type-check and production build to `dist/`. |
| `npm run preview` | Serves the production build from `dist/`. |
| `npm run lint` | oxlint (generated bundles in `public/kit/motion` are ignored). |
| `npm run kit` | Regenerates every kit asset below, in order. |
| `npm run kit:tokens` | `scripts/extract-tokens.mjs`: builds `src/data/tokens.ts`, `src/styles/tokens.css` and `public/kit/colour/one-agency_tokens_web.{css,json}` from `design/source/rebrand/brand-tokens.json` (board and derived tokens, ramps, WCAG contrast table). |
| `npm run kit:fonts` | `scripts/fetch-fonts.py`: downloads Geist 400/500/600/700 (vercel/geist-font v1.9.2) and Unbounded 500/600/700 (static instances of the google/fonts variable font) with their OFL licences. Full TTF + WOFF2 to `public/kit/fonts/`, Latin WOFF2 subsets (Geist, Unbounded 600, and Sora, the hub's own face for token and file names, not a brand face) to `src/assets/fonts/`. Removes font files it no longer writes. |
| `npm run kit:logos` | `scripts/build-logos.mjs`: from the moodboard masters, the horizontal (primary), stacked, wordmark and mark lockups in four variants (gradient on light, Mint and white on navy, Navy, white) as SVG + PNG @1x/@2x/@4x, the three app tiles, favicons, social avatar and OG image to `public/kit/logos/`, plus `src/data/logos.ts`. Add `-- --contact <file.png>` for a review contact sheet. Needs `kit:tokens` and `kit:fonts` first. |
| `npm run kit:motion` | `scripts/build-motion.mjs`: bundles the framework-free motion runtime to `public/kit/motion/one-motion.{js,mjs}`. |
| `npm run kit:elements` | `scripts/build-elements.mjs`: graphic elements as SVG + PNG and the Phosphor ad icons to `public/kit/elements/` (list in `src/data/elements.ts`). The signature devices, patterns (including Frames in orbit) and illustrations are the React components in `src/kit/graphics/`, rendered to static SVG through Vite's SSR loader, once on dark and once on light. |
| `npm run kit:mobius-colour` | `scripts/recolour-mobius.mjs`: writes the Mint recolour of the Möbius loop, `public/vendor/ciq/ciq-loop.one-agency.js`, from ConversionIQ's original (each edit must match exactly once, so an updated original fails loudly). |
| `npm run kit:mobius` | `scripts/build-mobius.mjs`: the Möbius loop in its Mint recolour (`public/vendor/ciq/ciq-loop.one-agency.js`, run `kit:mobius-colour` first) held on one frame in Playwright and placed big and cropped, bleeding off the frame like the hub's Overview hero, in five crops (sweep, band top, band bottom, side, frame), energy and strings looks, flattened on navy and paper (JPG) and transparent (PNG), at 1080x1080, 1080x1350, 1080x1920 and 1200x628, to `public/kit/elements/mobius/` (crops and placements in `src/data/mobius.ts`), with half-size WebP previews in `public/previews/elements/mobius/` (display only). |
| `npm run kit:copy` | `scripts/build-copy.mjs`: exports `src/data/copy.ts` to `public/kit/copy/one-agency_copy-bank.{md,json}`. |
| `npm run kit:motion-ads` | `scripts/build-motion-ads.mjs` writes the nine HTML5 ads (3 concepts x 1080x1920, 1080x1080, 300x250) to `public/kit/motion/ads/` plus an HTML5 ZIP each; `scripts/export-motion-ads.mjs` renders them frame by frame (Playwright, `oneAd.seek(t)`) to MP4 (ffmpeg), GIF (300x250 under 3 MB) and an end-frame PNG in `public/kit/motion/exports/`. Without ffmpeg it records WebM instead and skips the GIF. `node scripts/export-motion-ads.mjs --stills` renders end frames only. |
| `npm run kit:references` | `scripts/copy-references.mjs [folder]`: copies the nine reference ads (default `../Ads`) to `public/kit/references/one-agency_reference-ad_[slug]_1254x1254.png` and writes WebP previews to `public/previews/references/` (display only). Names and alt text live in `src/data/glass-references.ts`. Skips when the folder is not there. |
| `npm run kit:ads` | `scripts/export-creative-ads.mjs [concept ...] [--format=square,story]`: renders the ten creative ad concepts (copy and visuals in `src/data/ad-creative.ts`, components in `src/components/ads/creative/`) through the `render-ad.html` Vite entry in Playwright, at 1080x1080, 1080x1350, 1080x1920 and 1200x627, to `public/kit/ads/creative/[concept]/one-agency_ad-[concept]_[WxH].{png,webp}`, and lists them in `src/data/ads-creative.generated.json` for the Ads view. |
| `npm run kit:optimise` | `scripts/optimise-pngs.py public/kit`: lossless re-encode of every kit PNG (oxipng level 6 with `pyoxipng`, else Pillow), written only when the decoded pixels match the original exactly and the file is smaller. Content credentials are always preserved: any PNG carrying C2PA (a caBX chunk or a C2PA JUMBF box) is left untouched, so the reference ads stay byte copies of the source ads. |
| `npm run kit:og` | `scripts/build-og-image.mjs`: the hub's own link preview, `public/og/one-agency_brand-kit_og-image_1200x630.jpg`, composed from the energy Möbius still, the horizontal logo on navy, Unbounded and Geist. Not a kit download and never zipped. Needs `kit:logos` and `kit:mobius` first. |
| `npm run kit:zips` | `scripts/build-zips.mjs`: ZIPs every group to `public/kit/zips/one-agency_kit_[group].zip` and `one-agency_kit_full.zip`, and writes the asset list `src/data/assets.generated.json`. Rerun it whenever files change (for example after the Magnific export lands). |

## Structure

```
design/source/        rebrand/: the moodboard masters and brand-tokens.json; award-laurel.svg (read by kit:elements); two old live-site files kept for reference
scripts/              asset generators (scripts/lib: shared colour maths)
public/kit/           the downloads, served as-is (see below)
src/
  components/         views (*Section.tsx), with their parts in a folder per view (overview/, glass/, ...)
    layout/ ui/       app shell, sidebar, drawer, view outlet, footer, view header; buttons, filters, toasts, lightbox
  kit/motion/         motion components + vanilla.ts runtime
  kit/glass/          GlassCard, GlassIcon, CheckBadge, HalftoneArc, ParticleStream, Grain, LightStreaks (no glow anywhere)
  kit/type/           HighlightText (the highlight band)
  kit/graphics/       the element artwork as pure-SVG components (devices, patterns, illustrations), shared by the
                      hub and scripts/build-elements.mjs
  lib/                motion tokens, hooks, router, views, theme, kit constants, the manifest and asset loaders
  data/               typed data: generated (tokens.ts, logos.ts, assets.generated.json) and authored (copy.ts,
                      ad-copy.ts, ad-styles.ts, voice.ts, elements.ts, motion-ads.ts, ...)
  styles/             fonts.css, tokens.css (generated), theme.css (dark/light --ui-* layer), glass.css
  assets/fonts/       site font subsets
```

## Downloads: `public/kit/`

| Folder | Contents |
| --- | --- |
| `logos/` | `horizontal/`, `stacked/`, `wordmark/`, `mark/` (each in `on-light`, `on-navy`, `navy`, `white`), `tile/` (Sky, Navy, Mint app tiles), `favicon/`, `social/` |
| `colour/` | `one-agency_tokens_web.css`, `one-agency_tokens_web.json` |
| `fonts/` | Unbounded and Geist as TTF + WOFF2, with OFL licence texts |
| `elements/` | signature devices, patterns (including Frames in orbit) and illustrations (SVG + PNG, on dark and on light), laurel, CTA buttons, proof bar, award badge (SVG + PNG); `mobius/` the Möbius loop stills (JPG and PNG); `icons/` |
| `motion/` | `one-motion.js` (global `OneMotion`), `one-motion.mjs`; `ads/` HTML5 sources; `exports/` MP4, GIF, PNG, HTML5 ZIP |
| `copy/` | the copy bank, Markdown and JSON |
| `templates/`, `imagery/` | written by the Magnific export, with `src/data/ads.generated.json` (not generated here); `imagery/photos/` holds the Nova photo set (`src/data/imagery-photos.ts`, Unsplash ids) |
| `illustrations/`, `textures/` | glass illustrations and textures, written by the Magnific export with `src/data/glass.generated.json` |
| `ads/creative/` | the creative ads, PNG and WebP per concept and size (`npm run kit:ads`); in their own ZIP (`one-agency_kit_ads.zip`), not in the full kit |
| `references/` | the nine reference ads the glass style comes from (`npm run kit:references`) |
| `zips/` | per-group and full-kit ZIPs (`npm run kit:zips`) |

Download groups are folders under `public/kit/`, except `glass`, which collects `illustrations/`, `textures/`,
`references/`, `public/vendor/ciq/README.md` (the loop's credit) and `public/vendor/ciq/RECOLOUR.md` (the recolour);
the kit carries the loop as stills, not the script. The groups and their paths are in `src/lib/kit.ts`. To stay under
GitHub's 100 MiB file limit, `one-agency_kit_full.zip` carries
illustrations as PNG only (their WebP twins are in the glass ZIP), leaves out the Möbius stills (`elements/mobius/`, in
the elements ZIP), the creative ads (`ads/creative/`, in the ads ZIP) and the six 1080 px motion GIFs
(in the motion ZIP; the MP4s carry the same ads), and says so in its README.txt. Watch its size when adding files (the
current size is printed by `npm run kit:zips`).

File names follow `one-agency_[asset]_[variant]_[size].[ext]`, for example
`one-agency_logo_horizontal-on-navy_2x.png` or `one-agency_font_geist-700.woff2`. SVGs carry no size segment.

### The Magnific manifest

`src/data/ads.generated.json` is written by the Magnific export, not by this repo. `src/lib/ads.ts` loads it if present
(`import.meta.glob`, so the build works without it), validates every item and skips what does not fit:
`{ brandKitUrl, folderUrl, items: [{ id, group: "template" | "sample" | "imagery", channel, concept, name, width,
height, files: { png?, jpg?, webp? }, magnificUrl, notes }] }`, file paths starting `/kit/`. Until it exists the
Imagery and Ads views show an empty state with the planned sizes. After it lands: `npm run kit:zips`, then rebuild.

`src/data/glass.generated.json` works the same way for the Glass & texture view (`src/lib/glass.ts`):
`{ items: [{ id, kind: "illustration" | "texture", name, subject, theme: "dark" | "light" | "any", width, height,
files: { png?, jpg?, webp?, svg? }, magnificUrl?, notes }] }`. Illustrations are grouped by `subject` with a switch
between their variants. Missing file: "on the way" state; malformed: error state; skipped items are counted.

## Glass, texture and the highlight band

The Glass & texture view codifies the nine reference ads, which are in the old palette, and repaints the style in Mint
and Violet with no glow: components in `src/kit/glass/` (classes in
`src/styles/glass.css`, colours from the `--glass-*` theme variables), the anatomy of a glass card, depth stack rules,
glass versus flat, do and don't, the references themselves and the Magnific files. Rules and copy live in
`src/data/glass-rules.ts`.

The highlight band (`HighlightText`, `.highlight-band`, `--kit-highlight` derived / `--kit-highlight-light` = Sky) is
documented on the Type view with a live rebuild of the reference line. `WordRise` takes `highlight={[from, to]}`
(word indices), which `Section` passes through for view titles (Glass, Copy, Assets).

## Motion

Tokens live in `src/lib/motion.ts` (durations, the film's exact easing functions, overshoots, staggers, springs,
variants). The UI tokens (micro duration, the `out` and `emphasized` curves, page and reveal transitions, photo zoom)
follow concept 01 "Nova". React components in `src/kit/motion/` all accept `inView` (play once on scroll, default) and `delay`, and
honour reduced motion: `WordRise`, `LetterHop`, `Pop` (also the logo scale-in), `LineDraw`, `GradientBar`,
`GradientWipe`, `GradientText`.

For HTML5 ads, `one-motion.js` runs the same moves as pure functions of time, so any frame can be rendered exactly:

```html
<p id="line">Marketing that pays for itself.</p>
<script src="one-motion.js"></script>
<script>
  const line = document.getElementById('line')
  // Plays once and holds; under prefers-reduced-motion it shows the final frame.
  const ad = OneMotion.player((t) => OneMotion.rise(line, t, 0.2, { accent: [2] }), { duration: 6 })
  // Frame export: ad.seek(frame / fps)
</script>
```

Accent words get the class `acc`; style it with the `.accent-word` recipe from `src/index.css` (Unbounded 600 and the
signature gradient).
