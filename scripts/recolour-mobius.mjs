#!/usr/bin/env node
/**
 * The Möbius loop in the ONE Agency palette: reads ConversionIQ's original <ciq-loop> script
 * (public/vendor/ciq/ciq-loop.js, kept byte for byte as the provenance copy) and writes a recoloured copy,
 * public/vendor/ciq/ciq-loop.one-agency.js, that the hub and scripts/build-mobius.mjs load.
 *
 * Every colour in the loop comes from two ramps, pink (238, 43, 140) into blue (24, 87, 223):
 *   mMixRGB    the strands, and through MG_LUT the GPU wires, nodes and Flight trails
 *   mSparkRGB  the energy look's sparks
 * The pink end becomes Mint (0, 250, 179); the blue end is unchanged. mMixRGB's "bow" lifted red (+26) and blue (+20)
 * mid-blend so pink into blue did not dip to a grey purple. Mint into blue already passes through a clear cyan, and the
 * red lift would only grey it, so the copy keeps the blue lift and drops the red one.
 *
 * Glow is not part of the brand: the copy also turns off the lilac glow ground (paintGlow), which the original paints
 * behind the loop on dark unless background="none" is set. The hub and the stills set it anyway.
 *
 * Each replacement must match the original exactly once, so an updated ciq-loop.js fails loudly instead of slipping
 * through half-recoloured. Usage: node scripts/recolour-mobius.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = resolve(ROOT, 'public/vendor/ciq/ciq-loop.js')
const OUT = resolve(ROOT, 'public/vendor/ciq/ciq-loop.one-agency.js')

const PINK = [238, 43, 140]
const MINT = [0, 250, 179]

/** [what the original says, what the copy says, why]. */
const EDITS = [
  [
    'return [238 + (24-238)*t, 43 + (87-43)*t, 140 + (223-140)*t];',
    `return [${MINT[0]} + (24-${MINT[0]})*t, ${MINT[1]} + (87-${MINT[1]})*t, ${MINT[2]} + (223-${MINT[2]})*t];`,
    'mSparkRGB: spark ramp starts at Mint',
  ],
  [
    'var r = 238 + (24-238)*t, g = 43 + (87-43)*t, b = 140 + (223-140)*t;',
    `var r = ${MINT[0]} + (24-${MINT[0]})*t, g = ${MINT[1]} + (87-${MINT[1]})*t, b = ${MINT[2]} + (223-${MINT[2]})*t;`,
    'mMixRGB: strand ramp starts at Mint',
  ],
  ['r += 26*bow; b += 20*bow;', 'b += 20*bow;', 'mMixRGB: keep the blue lift, drop the red lift that greyed the Mint-to-blue middle'],
  ['var glow = !none && dark && this._look() !== 3;', 'var glow = false;', 'no glow ground, ever'],
]

const source = readFileSync(SOURCE, 'utf8')
let out = source
for (const [from, to, why] of EDITS) {
  const count = out.split(from).length - 1
  if (count !== 1) throw new Error(`Expected one "${from}" in ${SOURCE} (${why}), found ${count}`)
  out = out.replace(from, to)
}
if (out.includes(PINK.join(','))) throw new Error('A pink literal is left in the recoloured loop')

const header = `/* ONE Agency recolour of ConversionIQ's ciq-loop.js, written by scripts/recolour-mobius.mjs. Do not edit.
   The pink end of the loop's colour ramps is Mint (${MINT.join(', ')}); the blue end is unchanged; no glow ground.
   The original is public/vendor/ciq/ciq-loop.js, unchanged. */
`
writeFileSync(OUT, header + out)
console.log(`mobius colour: ${EDITS.length} edits → ${OUT.replace(`${ROOT}/`, '')}`)
