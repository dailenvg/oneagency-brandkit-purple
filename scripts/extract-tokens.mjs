#!/usr/bin/env node
/**
 * Colour tokens from the hand-authored brand source, design/source/rebrand/brand-tokens.json (the Figma moodboard
 * palette plus the kit's derived system colours).
 *
 * Writes:
 *   src/data/tokens.ts                              typed data for the kit site
 *   public/kit/colour/one-agency_tokens_web.css     the custom properties
 *   public/kit/colour/one-agency_tokens_web.json    the same data as JSON
 *   src/styles/tokens.css                           the same CSS, imported by the kit site
 *
 * The five board colours, white and the logo gradient are copied from the board; Plum Night and Lavender (marked with an
 * origin) come from concept 01 "Nova". Everything else is computed and
 * labelled "derived" wherever it appears: the system colours (surfaces, text, edges), the tint/shade ramps and the
 * style tokens (the highlight band).
 *
 * Usage: node scripts/extract-tokens.mjs [path/to/brand-tokens.json]
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { composite, contrastRatio, mixOklab, parseColour, toHex, toRgbString } from './lib/colour.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = resolve(process.argv[2] ?? `${ROOT}/design/source/rebrand/brand-tokens.json`)
const brand = JSON.parse(readFileSync(SOURCE, 'utf8'))

/** Every resolved opaque colour by token name, filled in as tokens are built (brand first, so derivations can use it). */
const HEX = new Map()

const tokens = [...buildBoardTokens(), ...buildSystemTokens()]
const ramps = buildRamps()
const effects = brand.effects.map((e) => ({ name: e.name, cssVar: `var(${e.name})`, value: e.value, role: e.role }))
const styleTokens = brand.style.map(buildStyleToken)
const contrast = buildContrast()

const data = {
  source: brand.source,
  note: 'Navy, Mint, Ultra Violet, Sky, Mist, white and the logo gradient are from the Figma moodboard; Plum Night and Lavender are from concept 01 Nova. Everything marked "derived" is computed from them.',
  tokens,
  logoGradient: brand.logoGradient,
  effects,
  derived: {
    label: 'Derived, not on the board',
    method: 'OKLab mix of the board value toward white (tints) or toward navy (Mint and Violet shades) or black (Navy shades). Step 500 is the board value for Mint and Violet, step 900 for Navy.',
    ramps,
  },
  derivedStyle: { label: 'Derived, not on the board (highlight band)', method: 'CSS color-mix in sRGB of the brand tokens (hex shown for reference).', tokens: styleTokens },
  contrast,
}

write('public/kit/colour/one-agency_tokens_web.json', JSON.stringify(data, null, 2) + '\n')
write('public/kit/colour/one-agency_tokens_web.css', renderCss())
write('src/styles/tokens.css', renderCss())
write('src/data/tokens.ts', renderTs())
console.log(`tokens: ${tokens.length} (${tokens.filter((t) => t.source === 'board').length} from the board, ${tokens.filter((t) => t.source === 'concept').length} from a concept) · effects: ${effects.length} · derived ramps: ${ramps.length} · contrast pairs: ${contrast.length} (${contrast.filter((c) => c.aaNormal).length} pass AA)`)

/* ---------------------------------------------------------------- resolve */

/** A colour reference: a token name (already resolved) or a literal. */
function colourOf(ref) {
  if (ref.startsWith('--')) {
    const hex = HEX.get(ref)
    if (!hex) throw new Error(`${ref} is used before it is defined in ${SOURCE}`)
    return parseColour(hex)
  }
  return parseColour(ref)
}

function pct(k) {
  return `${Math.round(k * 100)}%`
}

/** The opaque colour of a system token, and how it was made. Gradients and other CSS values resolve to null. */
function resolveSystem(t) {
  if (t.mix) {
    const [from, to, k] = t.mix
    return { colour: mixOklab(colourOf(from), colourOf(to), k), derivation: `OKLab mix of ${from} toward ${to}, ${pct(k)}` }
  }
  if (t.alpha) {
    const [from, a] = t.alpha
    return { colour: { ...colourOf(from), a }, derivation: `${from} at ${pct(a)} opacity` }
  }
  const alias = t.value.match(/^var\((--[\w-]+)\)$/)
  if (alias) return { colour: colourOf(alias[1]), derivation: `same value as ${alias[1]}` }
  if (/^#[0-9a-f]{6}$/i.test(t.value)) return { colour: parseColour(t.value), derivation: 'literal' }
  return { colour: null, derivation: null }
}

/* ---------------------------------------------------------------- tokens */

function solid(name, colour) {
  if (colour.a === 1) HEX.set(name, toHex(colour))
  return { hex: toHex(colour), rgb: toRgbString(colour), alpha: colour.a }
}

function buildBoardTokens() {
  const board = [...brand.brand.map((b) => ({ ...b, group: 'brand' })), { ...brand.white, group: 'surface' }]
  return board.map((b) => ({
    name: b.name,
    label: b.label,
    cssVar: `var(${b.name})`,
    value: b.hex.toLowerCase(),
    ...solid(b.name, parseColour(b.hex)),
    group: b.group,
    role: b.role,
    source: b.origin ? 'concept' : 'board',
    origin: b.origin ?? null,
    derivation: null,
    stops: null,
  }))
}

function buildSystemTokens() {
  return brand.system.map((t) => {
    const { colour, derivation } = resolveSystem(t)
    const base = { name: t.name, label: null, cssVar: `var(${t.name})`, group: t.group, role: t.role, source: t.name === '--gradient-logo' ? 'board' : 'derived', derivation }
    if (!colour) return { ...base, value: t.value, hex: null, rgb: null, alpha: 1, stops: gradientStops(t.value) }
    const value = t.mix || t.alpha ? (colour.a === 1 ? toHex(colour) : toRgbString(colour)) : t.value
    return { ...base, value, ...solid(t.name, colour), stops: null }
  })
}

/** Gradient stops, resolved to hex where they reference a token. */
function gradientStops(value) {
  return [...value.matchAll(/var\((--[\w-]+)\)|#[0-9a-f]{3,8}\b|transparent/gi)].map((m) => (m[1] ? `${m[1]} ${HEX.get(m[1]) ?? ''}`.trim() : m[0]))
}

/* ---------------------------------------------------------------- derived */

/** CSS color-mix(in srgb, a k, b): straight interpolation of the gamma-encoded channels. */
function mixSrgb(a, b, k) {
  return toHex({ r: a.r * k + b.r * (1 - k), g: a.g * k + b.g * (1 - k), b: a.b * k + b.b * (1 - k) })
}

function buildStyleToken(t) {
  const mix = t.value.match(/^color-mix\(in srgb, var\((--[\w-]+)\) (\d+)%, var\((--[\w-]+)\)\)$/)
  const alias = t.value.match(/^var\((--[\w-]+)\)$/)
  const hex = mix ? mixSrgb(colourOf(mix[1]), colourOf(mix[3]), Number(mix[2]) / 100) : toHex(colourOf(alias[1]))
  HEX.set(t.name, hex)
  return { name: t.name, value: t.value, hex, role: t.role }
}

function buildRamps() {
  return Object.entries(brand.ramps)
    .filter(([name]) => name.startsWith('--'))
    .map(([name, { toward, steps }]) => {
      const base = colourOf(name)
      const [light, dark] = toward.map(colourOf)
      const out = Object.entries(steps).map(([step, k]) => {
        const c = k === 0 ? base : mixOklab(base, k > 0 ? light : dark, Math.abs(k))
        const stepName = `${name}-${step}`
        HEX.set(stepName, toHex(c))
        return { step: Number(step), name: stepName, hex: toHex(c), rgb: toRgbString(c), isBoardValue: k === 0 }
      })
      return { base: name, steps: out }
    })
}

/* ---------------------------------------------------------------- contrast */

function buildContrast() {
  const out = []
  for (const bg of brand.contrast.background) {
    const b = colourOf(bg)
    for (const fg of brand.contrast.text) {
      if (fg === bg || HEX.get(fg) === HEX.get(bg)) continue
      const f = composite(colourOf(fg), b)
      const ratio = Math.round(contrastRatio(f, b) * 100) / 100
      out.push({ text: fg, background: bg, textHex: toHex(f), backgroundHex: toHex(b), ratio, aaNormal: ratio >= 4.5, aaLarge: ratio >= 3, aaaNormal: ratio >= 7 })
    }
  }
  return out.sort((a, b) => b.ratio - a.ratio)
}

/* ---------------------------------------------------------------- output */

function write(rel, content) {
  const path = resolve(ROOT, rel)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, content)
}

function renderCss() {
  const groups = ['brand', 'accent', 'surface', 'neutral', 'gradient']
  const line = (t) => {
    const note = t.source === 'concept' ? `${t.origin}: ${t.label}` : t.source === 'board' ? (t.label ? `board: ${t.label}` : 'board') : t.derivation && t.derivation !== 'literal' ? `derived: ${t.derivation}` : 'derived'
    return `  ${t.name}: ${t.value}; /* ${note} */`
  }
  const blocks = groups.map((g) => `  /* ${g} */\n${tokens.filter((t) => t.group === g).map(line).join('\n')}`)
  const fx = effects.map((e) => `  ${e.name}: ${e.value};`).join('\n')
  const rampCss = ramps.map((r) => r.steps.map((s) => `  ${s.name}: ${s.hex};${s.isBoardValue ? ` /* = ${r.base} */` : ''}`).join('\n')).join('\n\n')
  return `/*
 * ONE Agency colour tokens, web (RGB).
 * Source: ${brand.source.name} (${brand.source.figma}, exported ${brand.source.exported}).
 * Brand colours and the logo gradient are the board's; values marked "derived" are computed from them.
 * Generated by scripts/extract-tokens.mjs from design/source/rebrand/brand-tokens.json.
 */
:root {
${blocks.join('\n\n')}

  /* effects (derived) */
${fx}
}

/*
 * DERIVED, NOT ON THE BOARD.
 * Tints and shades for layouts that need more steps (charts, ads, slides, the hub's themes).
 * ${data.derived.method}
 */
:root {
${rampCss}
}

/*
 * DERIVED, NOT ON THE BOARD (highlight band).
 * ${data.derivedStyle.method}
 */
:root {
${styleTokens.map((t) => `  ${t.name}: ${t.value}; /* ${t.hex} */`).join('\n')}
}
`
}

function renderTs() {
  const json = (v) => JSON.stringify(v, null, 2)
  return `/* GENERATED by scripts/extract-tokens.mjs from design/source/rebrand/brand-tokens.json. Do not edit; run \`npm run kit:tokens\`. */

export type TokenGroup = 'brand' | 'accent' | 'neutral' | 'surface' | 'gradient'

export interface ColourToken {
  name: string
  /** Board name (Navy, Mint, ...) for the board colours; null for derived tokens. */
  label: string | null
  cssVar: string
  /** Value as written in tokens.css. */
  value: string
  /** Lowercase 6-digit hex; null for gradients. */
  hex: string | null
  rgb: string | null
  alpha: number
  group: TokenGroup
  role: string
  /** 'board': copied from the Figma moodboard. 'concept': a brand colour taken from a rebrand concept. 'derived': computed by the kit. */
  source: 'board' | 'concept' | 'derived'
  /** Where a 'concept' colour comes from (e.g. "concept 01 Nova"); null otherwise. */
  origin?: string | null
  /** How a derived value was made (e.g. "OKLab mix of --navy toward #000000, 25%"); null for board values and gradients. */
  derivation: string | null
  /** Gradient stops, resolved to hex where they reference a token. */
  stops: string[] | null
}

export interface EffectToken {
  name: string
  cssVar: string
  value: string
  role: string
}

export interface StyleToken {
  name: string
  /** As written in tokens.css (a color-mix of brand tokens, or an alias). */
  value: string
  hex: string
  role: string
}

export interface RampStep {
  step: number
  name: string
  hex: string
  rgb: string
  isBoardValue: boolean
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

export const TOKEN_SOURCE = ${json({ ...data.source, note: data.note })} as const

export const TOKENS: ColourToken[] = ${json(tokens)}

/** The logo gradient as drawn in the masters (SVG coordinates of each shape). */
export const LOGO_GRADIENT = ${json(data.logoGradient)} as const

export const EFFECT_TOKENS: EffectToken[] = ${json(effects)}

/** Derived, not on the board: the highlight band. */
export const STYLE_TOKENS: StyleToken[] = ${json(styleTokens)}

/** Derived, not on the board. */
export const DERIVED_RAMPS = ${json({ label: data.derived.label, method: data.derived.method })} as const

export const RAMPS: Ramp[] = ${json(ramps)}

export const CONTRAST: ContrastPair[] = ${json(contrast)}
`
}
