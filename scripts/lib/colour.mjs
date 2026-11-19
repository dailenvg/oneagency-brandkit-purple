/** sRGB colour helpers shared by the kit build scripts: parsing, WCAG contrast and OKLab mixing. */

export function parseColour(input) {
  const v = input.trim().toLowerCase()
  if (v === 'white') return { r: 255, g: 255, b: 255, a: 1 }
  if (v === 'black') return { r: 0, g: 0, b: 0, a: 1 }
  if (v.startsWith('#')) {
    let h = v.slice(1)
    if (h.length <= 4) h = [...h].map((x) => x + x).join('')
    const n = (i) => parseInt(h.slice(i, i + 2), 16)
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? Math.round((n(6) / 255) * 1000) / 1000 : 1 }
  }
  const rgb = v.match(/^rgba?\(([^)]*)\)$/)
  if (rgb) {
    const p = rgb[1].split(/[\s,/]+/).filter(Boolean).map(Number)
    return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 }
  }
  throw new Error(`Unsupported colour: ${input}`)
}

export function toHex({ r, g, b }) {
  return '#' + [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, '0')).join('')
}
export function toRgbString({ r, g, b, a }) {
  return a === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a})`
}
/** Flattens a translucent colour onto an opaque background. */
export function composite(f, b) {
  const mix = (x, y) => Math.round(x * f.a + y * (1 - f.a))
  return { r: mix(f.r, b.r), g: mix(f.g, b.g), b: mix(f.b, b.b), a: 1 }
}
function lin(c) {
  const x = c / 255
  return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
}
function unlin(c) {
  return 255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)
}
export function luminance({ r, g, b }) {
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

export function contrastRatio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

function toOklab({ r, g, b }) {
  const [R, G, B] = [lin(r), lin(g), lin(b)]
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B)
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B)
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B)
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s]
}

function fromOklab([L, A, B]) {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3
  const clamp = (x) => Math.min(255, Math.max(0, Math.round(unlin(x))))
  return {
    r: clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: clamp(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
    a: 1,
  }
}

export function mixOklab(a, b, k) {
  const [x, y] = [toOklab(a), toOklab(b)]
  return fromOklab(x.map((v, i) => v + (y[i] - v) * k))
}
