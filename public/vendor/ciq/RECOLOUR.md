# ONE Agency recolour of the Möbius loop

`ciq-loop.js` beside this file is ConversionIQ's original, kept byte for byte. ONE Agency uses a recoloured copy,
`ciq-loop.one-agency.js`, written by `scripts/recolour-mobius.mjs` (`npm run kit:mobius-colour`) in the brand kit repo.
The recolour was the client's decision (rebrand, 2026-11-20).

What changes, and nothing else:

| Where | Original | ONE Agency copy |
| --- | --- | --- |
| `mMixRGB`, the strands (and through `MG_LUT` the wires, nodes and trails) | pink `238, 43, 140` into blue `24, 87, 223` | Mint `0, 250, 179` into the same blue |
| `mMixRGB` mid-blend lift ("bow") | red +26, blue +20 | blue +20 only: the red lift greyed the Mint-to-blue middle |
| `mSparkRGB`, the energy look's sparks | pink `238, 43, 140` into blue | Mint `0, 250, 179` into the same blue |
| The ground's lilac glow (`paintGlow`) | painted on dark unless `background="none"` | never painted |

The blue end, the geometry and the motion are unchanged. To update, replace `ciq-loop.js` with ConversionIQ's new
version and rerun the script; it stops if any of its edits no longer match.
