#!/usr/bin/env node
/**
 * Colour tokens from the live oneagency.com stylesheet.
 *
 * Reads the production CSS bundle (home.bundle.css) and writes:
 *   src/data/tokens.ts                              typed data for the kit site
 *   public/kit/colour/one-agency_tokens_web.css     the site's custom properties, value for value
 *   public/kit/colour/one-agency_tokens_web.json    the same data as JSON
 *   src/styles/tokens.css                           the same CSS, imported by the kit site
 *
 * Every token value is copied verbatim from the live CSS. Two separate, clearly labelled "derived" blocks hold the
 * only colours that are not on the live site: the tint/shade ramps, and the v1.1 style tokens (the highlight band and
 * the violet ground sampled from the reference ads).
 *
 * Usage: node scripts/extract-tokens.mjs [path/to/home.css]
 * Default source: design/source/home.css (a snapshot of the live bundle, see README).
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { composite, contrastRatio, mixOklab, parseColour, toHex, toRgbString } from './lib/colour.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = resolve(process.argv[2] ?? `${ROOT}/design/source/home.css`)
const SOURCE_URL = 'https://oneagency.com/assets/css/home.bundle.css?v=746d4bae1d'
const SNAPSHOT_DATE = '2026-11-17'

/**
 * Classification and plain-language role for each site token. The group is a kit decision for presentation only; the
 * value always comes from the CSS. Tokens the site defines in :root but that are not listed here fail the build, so a
 * new colour on the live site cannot slip through unclassified.
 */
const CLASSIFY = {
  '--ground': ['brand', 'Page ground: the night-navy behind every section.'],
  '--rose': ['brand', 'Primary accent: pill buttons, focus ring, accent-word gradient start.'],
  '--lilac': ['brand', 'Secondary accent (the site\'s blue): gradient end, links and highlights.'],
  '--rose-deep': ['accent', 'Pressed or hover step of rose.'],
  '--lilac-deep': ['accent', 'End of the gradient rule (--bar).'],
  '--on-accent': ['accent', 'Text on rose buttons and chips.'],
  '--lavender': ['accent', 'Primary-button hover text on dark; pale tint panels.'],
  '--void': ['surface', 'Deepest ground: same value as --ground, used for page backdrops and shadows.'],
  '--surface': ['surface', 'First raised step above the ground: cards, panels.'],
  '--surface-2': ['surface', 'Second raised step: nested cards, inputs.'],
  '--band': ['surface', 'Alternating section band.'],
  '--raised': ['surface', 'Cards sitting on a band; the lightest dark ground.'],
  '--paper': ['surface', 'White paper: case-study receipt, light panels.'],
  '--paper-2': ['surface', 'Pale-blue paper band.'],
  '--form-field-bg': ['surface', 'Form field fill on dark (white at 9%).'],
  '--form-field-bg-focus': ['state', 'Form field fill when focused (white at 14%).'],
  '--text': ['neutral', 'Primary text on dark.'],
  '--text-2': ['neutral', 'Secondary body copy on dark.'],
  '--text-3': ['neutral', 'Captions and labels on dark.'],
  '--text-4': ['neutral', 'Decorative text only; never carries meaning.'],
  '--placeholder': ['neutral', 'Input placeholder text.'],
  '--ink': ['neutral', 'Text on paper (same value as --ground).'],
  '--ink-2': ['neutral', 'Secondary text on paper.'],
  '--ink-3': ['neutral', 'Body grey on paper.'],
  '--edge': ['neutral', 'Decorative dividers.'],
  '--edge-soft': ['neutral', 'Faint dividers.'],
  '--edge-strong': ['neutral', 'Interactive boundaries (inputs, outlined buttons).'],
  '--form-copy': ['neutral', 'Copy inside the audit form card.'],
  '--pos': ['state', 'Positive / highlight tag colour (amber).'],
  '--form-field-edge': ['state', 'Form field border at rest.'],
  '--form-field-edge-hover': ['state', 'Form field border on hover.'],
  '--form-placeholder': ['state', 'Form placeholder text on the audit card.'],
  '--accent-fill': ['gradient', 'Signature gradient: Metal accent words, rose to lilac.'],
  '--bar': ['gradient', 'Gradient rule: header, footer and card tops.'],
  '--v2-hairline': ['gradient', '1px rose-to-lilac hairline that fades at both ends.'],
  '--v2-lit-edge': ['gradient', 'Lit top edge of featured cards.'],
  '--v2-alt-bg': ['gradient', 'Alternate section background.'],
  '--stat-divider': ['gradient', 'Vertical divider between stats.'],
  '--stat-divider-h': ['gradient', 'Horizontal divider between stacked stats.'],
  '--form-card-bg': ['gradient', 'Glass fill of the audit form card.'],
}

/** Shadows and glows: colour-bearing, but effects rather than fills. */
const EFFECTS = {
  '--accent-glow': 'Glow filter on accent words.',
  '--v2-shadow': 'Card drop shadow.',
  '--form-card-shadow': 'Audit form card shadow.',
}

/** Tokens the site redefines per component; reported with every value rather than as one swatch. */
const COMPONENT_ALIASES = ['--v2-card-bg', '--v2-card-border', '--v2-card-border-hover', '--v2-focus-ring']

/**
 * Tint/shade ramps, derived for the three brand colours only. Each step is a mix amount: positive toward --paper,
 * negative toward --ink, 0 is the exact site value. The ground is already the darkest ink, so its ramp is tints only.
 */
const ACCENT_STEPS = { 50: 0.92, 100: 0.84, 200: 0.68, 300: 0.5, 400: 0.26, 500: 0, 600: -0.18, 700: -0.36, 800: -0.54, 900: -0.72 }
const GROUND_STEPS = { 50: 0.94, 100: 0.88, 200: 0.76, 300: 0.62, 400: 0.5, 500: 0.38, 600: 0.26, 700: 0.15, 800: 0.07, 900: 0 }
const RAMPS = { '--rose': ACCENT_STEPS, '--lilac': ACCENT_STEPS, '--ground': GROUND_STEPS }

/** Text and background tokens checked against each other in the contrast table. */
const CONTRAST_TEXT = ['--text', '--text-2', '--text-3', '--text-4', '--placeholder', '--form-copy', '--form-placeholder', '--rose', '--rose-deep', '--lilac', '--lilac-deep', '--lavender', '--pos', '--ink', '--ink-2', '--ink-3']
const CONTRAST_BG = ['--ground', '--surface', '--surface-2', '--band', '--raised', '--paper', '--paper-2', '--lavender', '--rose', '--lilac']

const COLOUR_RE = /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b|rgba?\([^)]*\)|hsla?\([^)]*\)|\b(?:white|black)\b/gi

const raw = readFileSync(SOURCE, 'utf8')
const css = raw.replace(/\/\*[\s\S]*?\*\//g, '')
const decls = parseDeclarations(css)
const rootDefs = collectRootDefinitions(decls)
const notes = collectNotes(raw)

const tokens = buildTokens()
const effects = Object.entries(EFFECTS).map(([name, role]) => ({ name, cssVar: `var(${name})`, value: single(name), role }))
const componentAliases = COMPONENT_ALIASES.map((name) => ({ name, values: [...new Set(decls.filter((d) => d.prop === name).map((d) => d.value))] }))
const ramps = buildRamps()
const styleTokens = buildStyleTokens()
const contrast = buildContrast()
const literals = buildLiterals()

const data = {
  source: SOURCE_URL,
  snapshot: SNAPSHOT_DATE,
  note: 'Values copied verbatim from the live production CSS. Only the "derived" ramps are computed; they are not on the live site.',
  tokens,
  effects,
  componentAliases,
  derived: { label: 'Derived, not on the live site', method: 'OKLab mix of the site value toward --paper (tints) or --ink (shades). Rose and lilac: step 500 is the site value. Ground: step 900 is the site value.', ramps },
  derivedStyle: {
    label: 'Derived, not on the live site (v1.1 style)',
    method: 'Highlight band: CSS color-mix in sRGB of the live tokens (hex shown for reference). Violet ground: sampled from the reference ads. Light accent: hand-tuned rose and blue that clear 3:1 on every light ground.',
    tokens: styleTokens,
  },
  contrast,
  literals,
}

write('public/kit/colour/one-agency_tokens_web.json', JSON.stringify(data, null, 2) + '\n')
write('public/kit/colour/one-agency_tokens_web.css', renderCss())
write('src/styles/tokens.css', renderCss())
write('src/data/tokens.ts', renderTs())
console.log(`tokens: ${tokens.length} · effects: ${effects.length} · derived ramps: ${ramps.length} · contrast pairs: ${contrast.length} (${contrast.filter((c) => c.aaNormal).length} pass AA) · literal colours: ${literals.length}`)

/* ---------------------------------------------------------------- parsing */

/** Flat list of declarations with the selector (and any at-rule) they sit in. Respects quotes and parentheses. */
function parseDeclarations(text) {
  const out = []
  const stack = []
  let buf = ''
  let quote = null
  let depth = 0
  const flush = () => {
    const s = buf.trim()
    buf = ''
    const i = s.indexOf(':')
    if (i < 1 || !stack.length) return
    const rule = stack.findLast((x) => !x.startsWith('@')) ?? ''
    const at = stack.filter((x) => x.startsWith('@')).join(' ')
    out.push({ selector: rule, at, prop: s.slice(0, i).trim().toLowerCase(), value: s.slice(i + 1).trim() })
  }
  for (const ch of text) {
    if (quote) {
      buf += ch
      if (ch === quote) quote = null
    } else if (ch === '"' || ch === "'") {
      quote = ch
      buf += ch
    } else if (ch === '(') {
      depth++
      buf += ch
    } else if (ch === ')') {
      depth--
      buf += ch
    } else if (ch === ';' && depth === 0) {
      flush()
    } else if (ch === '{' && depth === 0) {
      stack.push(buf.trim().replace(/\s+/g, ' '))
      buf = ''
    } else if (ch === '}' && depth === 0) {
      flush()
      stack.pop()
    } else {
      buf += ch
    }
  }
  return out
}

function collectRootDefinitions(list) {
  const map = new Map()
  for (const d of list) {
    if (!d.prop.startsWith('--') || d.selector !== ':root' || d.at) continue
    if (!map.has(d.prop)) map.set(d.prop, d.value)
  }
  return map
}

/** The site's own end-of-line comment for each custom property (e.g. "derived, not from OA"). */
function collectNotes(text) {
  const map = new Map()
  for (const m of text.matchAll(/(--[\w-]+)\s*:[^;\n]*;[ \t]*\/\*([^*]*(?:\*(?!\/)[^*]*)*)\*\//g)) {
    if (!map.has(m[1])) map.set(m[1], m[2].replace(/\s+/g, ' ').trim())
  }
  return map
}

/**
 * The kit never prints em-dashes (brand voice rule), so site comments are re-punctuated: a spaced em/en dash becomes
 * ": " (", " after a contrast ratio such as "7.8:1", where a second colon would misread), any other em-dash ", ".
 * Words are untouched; siteNoteSource says when this happened.
 */
function normaliseNote(note) {
  if (note == null) return { siteNote: null, siteNoteSource: null }
  const clean = note
    .replace(/(\d:1)\s+[—–]\s+/g, '$1, ')
    .replace(/\s+[—–]\s+/g, ': ')
    .replace(/—/g, ', ')
  return { siteNote: clean, siteNoteSource: clean === note ? 'live CSS comment' : 'live CSS comment, punctuation normalised' }
}

function single(name) {
  const v = rootDefs.get(name) ?? decls.find((d) => d.prop === name)?.value
  if (v == null) throw new Error(`${name} is not defined in ${SOURCE}`)
  return v.replace(/\s+/g, ' ')
}

/* ---------------------------------------------------------------- tokens */

function buildTokens() {
  const rootNames = [...rootDefs.keys()].filter((n) => isColourish(rootDefs.get(n)))
  const scopedNames = decls.filter((d) => d.prop.startsWith('--') && !rootDefs.has(d.prop) && isColourish(d.value)).map((d) => d.prop)
  const names = [...new Set([...rootNames, ...scopedNames])].filter((n) => !(n in EFFECTS) && !COMPONENT_ALIASES.includes(n))
  const unknown = names.filter((n) => !(n in CLASSIFY))
  if (unknown.length) throw new Error(`Unclassified colour tokens on the live site: ${unknown.join(', ')}. Add them to CLASSIFY.`)
  const missing = Object.keys(CLASSIFY).filter((n) => !names.includes(n))
  if (missing.length) throw new Error(`Classified tokens not found in the live CSS: ${missing.join(', ')}`)

  return names.map((name) => {
    const value = single(name)
    const [group, role] = CLASSIFY[name]
    const usage = usageOf(name)
    const scope = rootDefs.has(name) ? ':root' : decls.find((d) => d.prop === name).selector
    const base = { name, cssVar: `var(${name})`, value, scope, group, role, ...normaliseNote(notes.get(name)), siteMarkedDerived: /derived/i.test(notes.get(name) ?? ''), ...usage }
    if (group === 'gradient') return { ...base, hex: null, rgb: null, alpha: 1, stops: gradientStops(value) }
    const c = parseColour(value)
    return { ...base, hex: toHex(c), rgb: toRgbString(c), alpha: c.a, stops: null }
  })
}

function isColourish(v) {
  return /gradient\(/.test(v) || (/^\s*(#|rgba?\(|hsla?\(|color-mix)/i.test(v) && !/\s(solid|dashed)\s/.test(v))
}

/** Where a token is used: counts by property kind, by UI context, and the selectors that use it most. */
function usageOf(name) {
  const re = new RegExp(`var\\(\\s*${name.replace(/[-]/g, '\\-')}\\s*[,)]`)
  const hits = decls.filter((d) => re.test(d.value))
  const byProperty = countBy(hits, (d) => propertyKind(d.prop))
  const contexts = { button: 0, link: 0, state: 0 }
  for (const d of hits) for (const k of contextsOf(d.selector)) contexts[k]++
  const topSelectors = Object.entries(countBy(hits.filter((d) => d.selector !== ':root'), (d) => d.selector.split(',')[0].trim()))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([s]) => s)
  return { usageCount: hits.length, usage: sortedCounts(byProperty), contexts, topSelectors }
}

function propertyKind(prop) {
  if (prop.startsWith('--')) return 'token alias'
  if (/^background/.test(prop)) return 'background'
  if (/^(color|-webkit-text-fill-color|caret-color|text-decoration-color|accent-color)$/.test(prop)) return 'text'
  if (/^(border|outline)/.test(prop)) return 'border / outline'
  if (/shadow|^filter$/.test(prop)) return 'shadow / glow'
  if (/^(fill|stroke|stop-color)/.test(prop)) return 'svg'
  if (/mask/.test(prop)) return 'mask'
  return 'other'
}

/** Heuristic UI context from the selector: buttons, links, and interactive states. */
function contextsOf(selector) {
  const out = []
  if (/btn|button|cta|\.pill/i.test(selector)) out.push('button')
  if (/(^|[\s>+~,(])a(?=[:.[\s,)]|$)|link/i.test(selector)) out.push('link')
  if (/:(hover|focus|focus-visible|focus-within|active|disabled|checked)|\[aria-(current|expanded|selected|pressed|invalid)|is-active|is-open/i.test(selector)) out.push('state')
  return out
}

function gradientStops(value) {
  return [...value.matchAll(/var\((--[\w-]+)\)|#[0-9a-f]{3,8}\b|rgba?\([^)]*\)|transparent/gi)].map((m) => (m[1] ? `${m[1]} ${toHex(parseColour(single(m[1])))}` : m[0]))
}

/* ---------------------------------------------------------------- derived v1.1 style tokens */

/** CSS color-mix(in srgb, a k, b): straight interpolation of the gamma-encoded channels. */
function mixSrgb(a, b, k) {
  const [x, y] = [parseColour(a), parseColour(b)]
  return toHex({ r: x.r * k + y.r * (1 - k), g: x.g * k + y.g * (1 - k), b: x.b * k + y.b * (1 - k) })
}

function buildStyleTokens() {
  const hex = (name) => tokens.find((t) => t.name === name).hex
  const mix = (name, role, amount, into) => ({
    name,
    value: `color-mix(in srgb, var(--lilac) ${amount * 100}%, var(${into}))`,
    hex: mixSrgb(hex('--lilac'), hex(into), amount),
    role,
  })
  return [
    mix('--kit-highlight', 'Highlight band on dark grounds, white text on top. Reference sample #172C78 to #11306A.', 0.4, '--ground'),
    mix('--kit-highlight-light', 'Highlight band on light grounds, ink text on top.', 0.4, '--paper'),
    { name: '--kit-violet', value: '#2a004c', hex: '#2a004c', role: 'Violet ground, top left (sampled from the reference ads).' },
    { name: '--kit-night', value: '#0e0f12', hex: '#0e0f12', role: 'Near-black the violet ground runs into (sampled).' },
    // Rose and lilac are too pale on paper and the 700 steps read muddy as a fill: these keep both hues at full chroma
    // and clear 3:1 on every light ground (rose 3.67 to 4.03, blue 3.75 to 4.12, lavender to paper).
    { name: '--kit-accent-light-from', value: '#e0446b', hex: '#e0446b', role: 'Accent gradient start on light grounds (hand-tuned rose, full chroma).' },
    { name: '--kit-accent-light-mid', value: '#a057d6', hex: '#a057d6', role: 'Accent gradient midpoint on light grounds, for sRGB blending (keeps the middle violet, not grey).' },
    { name: '--kit-accent-light-to', value: '#2f7be6', hex: '#2f7be6', role: 'Accent gradient end on light grounds (hand-tuned blue, full chroma).' },
  ]
}

/* ---------------------------------------------------------------- derived ramps */

function buildRamps() {
  const paper = parseColour(single('--paper'))
  const ink = parseColour(single('--ink'))
  return Object.entries(RAMPS).map(([name, table]) => {
    const base = parseColour(single(name))
    const steps = Object.entries(table).map(([step, k]) => {
      const c = k === 0 ? base : mixOklab(base, k > 0 ? paper : ink, Math.abs(k))
      return { step: Number(step), name: `--kit-${name.slice(2)}-${step}`, hex: toHex(c), rgb: toRgbString(c), isSiteValue: k === 0 }
    })
    return { base: name, steps }
  })
}

/* ---------------------------------------------------------------- contrast */

function buildContrast() {
  const out = []
  for (const bg of CONTRAST_BG) {
    const b = parseColour(single(bg))
    for (const fg of CONTRAST_TEXT) {
      if (fg === bg || single(fg) === single(bg)) continue
      const f = composite(parseColour(single(fg)), b)
      const ratio = Math.round(contrastRatio(f, b) * 100) / 100
      out.push({ text: fg, background: bg, textHex: toHex(f), backgroundHex: toHex(b), ratio, aaNormal: ratio >= 4.5, aaLarge: ratio >= 3, aaaNormal: ratio >= 7 })
    }
  }
  return out.sort((a, b) => b.ratio - a.ratio)
}

/* ---------------------------------------------------------------- literals */

/** Colours written as literals in declarations (not via a token), with counts by property kind and UI context. */
function buildLiterals() {
  const map = new Map()
  for (const d of decls) {
    if (d.prop.startsWith('--')) continue
    const value = d.value.replace(/url\([^)]*\)/g, '')
    for (const m of value.matchAll(COLOUR_RE)) {
      const key = m[0].toLowerCase().replace(/\s+/g, '')
      const entry = map.get(key) ?? { value: key, count: 0, byProperty: {}, contexts: { button: 0, link: 0, state: 0 } }
      entry.count++
      const kind = propertyKind(d.prop)
      entry.byProperty[kind] = (entry.byProperty[kind] ?? 0) + 1
      for (const k of contextsOf(d.selector)) entry.contexts[k]++
      map.set(key, entry)
    }
  }
  const tokensByHex = Map.groupBy(tokens.filter((t) => t.hex && t.alpha === 1), (t) => t.hex)
  return [...map.values()]
    .map((e) => {
      const c = parseColour(e.value)
      return { ...e, byProperty: sortedCounts(e.byProperty), hex: toHex(c), alpha: c.a, matchesTokens: c.a === 1 ? (tokensByHex.get(toHex(c)) ?? []).map((t) => t.name) : [] }
    })
    .sort((a, b) => b.count - a.count)
}

/* ---------------------------------------------------------------- output */

function countBy(list, key) {
  const out = {}
  for (const x of list) out[key(x)] = (out[key(x)] ?? 0) + 1
  return out
}

function sortedCounts(obj) {
  return Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .map(([property, count]) => ({ property, count }))
}

function write(rel, content) {
  const path = resolve(ROOT, rel)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, content)
}

function renderCss() {
  const groups = ['brand', 'accent', 'surface', 'neutral', 'state', 'gradient']
  const line = (t) => {
    const notes = [t.siteMarkedDerived && 'site marks this "derived"', t.scope !== ':root' && `scoped to ${t.scope} on the site`].filter(Boolean)
    return `  ${t.name}: ${t.value};${notes.length ? ` /* ${notes.join('; ')} */` : ''}`
  }
  const blocks = groups.map((g) => `  /* ${g} */\n${tokens.filter((t) => t.group === g).map(line).join('\n')}`)
  const fx = effects.map((e) => `  ${e.name}: ${e.value};`).join('\n')
  const derived = ramps.map((r) => r.steps.map((s) => `  ${s.name}: ${s.hex};${s.isSiteValue ? ` /* = ${r.base} */` : ''}`).join('\n')).join('\n\n')
  return `/*
 * ONE Agency colour tokens, web (RGB).
 * Source: ${SOURCE_URL} (snapshot ${SNAPSHOT_DATE}).
 * Names and values are the live site's, unchanged. Generated by scripts/extract-tokens.mjs.
 */
:root {
${blocks.join('\n\n')}

  /* effects */
${fx}
}

/*
 * DERIVED, NOT ON THE LIVE SITE.
 * Tints and shades for layouts that need more steps than the site uses (charts, ads, slides).
 * ${data.derived.method}
 */
:root {
${derived}
}

/*
 * DERIVED, NOT ON THE LIVE SITE (v1.1 style).
 * ${data.derivedStyle.method}
 */
:root {
${styleTokens.map((t) => `  ${t.name}: ${t.value};${t.value === t.hex ? '' : ` /* ${t.hex} */`}`).join('\n')}
}
`
}

function renderTs() {
  const json = (v) => JSON.stringify(v, null, 2)
  return `/* GENERATED by scripts/extract-tokens.mjs from the live oneagency.com CSS. Do not edit; run \`npm run kit:tokens\`. */

export type TokenGroup = 'brand' | 'accent' | 'neutral' | 'surface' | 'state' | 'gradient'

export interface Count {
  property: string
  count: number
}

export interface UsageContexts {
  button: number
  link: number
  state: number
}

export interface ColourToken {
  /** Custom property name as written on the live site. */
  name: string
  cssVar: string
  /** Value exactly as written in the live CSS. */
  value: string
  /** Selector that defines it on the live site (':root' for global tokens). */
  scope: string
  /** Lowercase 6-digit hex; null for gradients. */
  hex: string | null
  rgb: string | null
  alpha: number
  group: TokenGroup
  role: string
  /** The site's own comment on this token: words verbatim, dashes re-punctuated (see siteNoteSource). */
  siteNote: string | null
  /** "live CSS comment", or "live CSS comment, punctuation normalised" when dashes were rewritten. */
  siteNoteSource: string | null
  /** The live CSS comments this value as derived (a tonal step the original site did not have). */
  siteMarkedDerived: boolean
  usageCount: number
  usage: Count[]
  contexts: UsageContexts
  topSelectors: string[]
  /** Gradient stops, resolved to hex where they reference a token. */
  stops: string[] | null
}

export interface EffectToken {
  name: string
  cssVar: string
  value: string
  role: string
}

export interface ComponentAlias {
  name: string
  values: string[]
}

export interface StyleToken {
  name: string
  /** As written in tokens.css (a literal, or a color-mix of live tokens). */
  value: string
  hex: string
  role: string
}

export interface RampStep {
  step: number
  name: string
  hex: string
  rgb: string
  isSiteValue: boolean
}

export interface Ramp {
  base: string
  steps: RampStep[]
}

export interface ContrastPair {
  text: string
  background: string
  textHex: string
  backgroundHex: string
  ratio: number
  aaNormal: boolean
  aaLarge: boolean
  aaaNormal: boolean
}

export interface LiteralColour {
  value: string
  hex: string
  alpha: number
  count: number
  byProperty: Count[]
  contexts: UsageContexts
  /** Site tokens with the same opaque value: the literal could have used one of these. */
  matchesTokens: string[]
}

export const TOKEN_SOURCE = ${json({ url: data.source, snapshot: data.snapshot, note: data.note })} as const

export const TOKENS: ColourToken[] = ${json(tokens)}

export const EFFECT_TOKENS: EffectToken[] = ${json(effects)}

export const COMPONENT_ALIASES: ComponentAlias[] = ${json(componentAliases)}

/** Derived, not on the live site (v1.1 style): highlight band, violet ground, light-ground accent. */
export const STYLE_TOKENS: StyleToken[] = ${json(data.derivedStyle.tokens)}

/** Derived, not on the live site. */
export const DERIVED_RAMPS = ${json({ label: data.derived.label, method: data.derived.method })} as const

export const RAMPS: Ramp[] = ${json(ramps)}

export const CONTRAST: ContrastPair[] = ${json(contrast)}

export const SITE_LITERALS: LiteralColour[] = ${json(literals)}
`
}
