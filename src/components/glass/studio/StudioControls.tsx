import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { reveal, spring } from '../../../lib/motion'

/** One titled group of controls in the studio panel. */
export function ControlGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <motion.fieldset variants={reveal} className="flex min-w-0 flex-col gap-3 border-0 p-0">
      <legend className="mb-3 text-step--1 font-semibold text-text">{title}</legend>
      {children}
    </motion.fieldset>
  )
}

interface SegmentedProps<T extends string> {
  options: { id: T; label: string }[]
  value: T | null
  onChange: (id: T) => void
  label: string
  /** Unique per instance: the active pill slides between options. */
  layoutId: string
}

/** Pressed-button group (not tabs: each option applies a preset, nothing is shown or hidden). */
export function Segmented<T extends string>({ options, value, onChange, label, layoutId }: SegmentedProps<T>) {
  return (
    <div role="group" aria-label={label} className="flex gap-1 rounded-full border border-edge bg-surface-2/40 p-1">
      {options.map((o) => {
        const active = o.id === value
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.id)}
            className={`relative inline-flex min-h-touch min-w-0 flex-auto items-center justify-center whitespace-nowrap rounded-full px-3 text-step-small font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent ${
              active ? 'text-on-fill' : 'text-text-2 hover:bg-surface-2 hover:text-text'
            }`}
          >
            {active && <motion.span layoutId={layoutId} className="absolute inset-0 rounded-full bg-fill" transition={spring.layout} aria-hidden />}
            <span className="relative">{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}

interface SliderProps {
  id: string
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
}

export function Slider({ id, label, value, min, max, step, onChange }: SliderProps) {
  const pct = Math.round(((value - min) / (max - min)) * 100)
  return (
    <div className="grid grid-cols-[6.5rem_1fr_2.5rem] items-center gap-3">
      <label htmlFor={id} className="text-step-small text-text-2">
        {label}
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-touch w-full cursor-pointer accent-(--ui-accent) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      />
      <output htmlFor={id} className="text-right text-step-small tabular-nums text-text-3">
        {pct}
      </output>
    </div>
  )
}
