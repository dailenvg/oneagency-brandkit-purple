/** WCAG relative luminance of a #rrggbb colour. */
export function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = Number.parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG contrast ratio between two #rrggbb colours (1 to 21). */
export function contrastRatio(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** --ink and --paper, the two label colours. */
const INK = '#01030f'
const PAPER = '#ffffff'

/**
 * Whether ink (--ink) or paper (--paper) text reads better on this colour: whichever has the higher contrast ratio.
 * Against these two the worst case (luminance ≈ 0.18) is still about 4.5:1, so the winner always passes AA at full
 * opacity.
 */
export const readableOn = (hex: string): 'ink' | 'paper' => (contrastRatio(hex, INK) >= contrastRatio(hex, PAPER) ? 'ink' : 'paper')
