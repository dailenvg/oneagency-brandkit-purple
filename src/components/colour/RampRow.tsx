import { motion } from 'motion/react'
import type { Ramp } from '../../data/tokens'
import { readableOn } from '../../lib/colour'
import { press } from '../../lib/motion'
import { useCopy } from '../../lib/toast'

/** A derived tint/shade ramp. Each step copies its HEX; the site value is marked. */
export function RampRow({ ramp }: { ramp: Ramp }) {
  const copy = useCopy()
  return (
    <div>
      <p className="mb-2 font-code text-step-small text-text-2">{ramp.base}</p>
      <ul className="grid grid-cols-5 overflow-hidden rounded-site border border-edge sm:grid-cols-10">
        {ramp.steps.map((step) => {
          const ink = readableOn(step.hex) === 'ink'
          return (
            <li key={step.name}>
              <motion.button
                type="button"
                {...press}
                onClick={() => copy(step.hex.toUpperCase(), `${step.hex.toUpperCase()} (${step.name})`)}
                aria-label={`Copy ${step.hex.toUpperCase()}, ${step.name}${step.isSiteValue ? ', the site value' : ''}`}
                // The strip clips overflow, so the focus ring sits inside the swatch, in ink or paper to read on the swatch itself.
                className={`relative flex h-20 w-full flex-col justify-end gap-1 p-2 text-left text-step-small hover:z-10 focus-visible:z-10 focus-visible:-outline-offset-4 ${ink ? 'text-ink focus-visible:outline-ink' : 'text-paper focus-visible:outline-paper'}`}
                style={{ background: step.hex }}
              >
                <span className="font-num font-bold">
                  {step.step}
                  {step.isSiteValue && ' ●'}
                </span>
                {/* Full opacity: readableOn guarantees at least 4.5:1 only for the solid ink or paper colour. */}
                <span className="font-code">{step.hex.slice(1).toUpperCase()}</span>
              </motion.button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
