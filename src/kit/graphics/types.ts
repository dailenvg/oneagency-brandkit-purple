import type { Tone } from './palette'

/** Props every kit graphic takes. */
export interface GraphicProps {
  tone: Tone
  /** Prefix for gradient, mask and filter ids; defaults to a unique one. */
  idPrefix?: string
  label?: string
  className?: string
}
