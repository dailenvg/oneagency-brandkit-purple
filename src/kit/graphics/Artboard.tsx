import type { ReactNode } from 'react'

interface ArtboardProps {
  width: number
  height: number
  /** Accessible name; without one the graphic is decorative. */
  label?: string
  className?: string
  children: ReactNode
}

/** Root <svg> for every kit graphic: real px size for the export, scaled by CSS in the hub. */
export function Artboard({ width, height, label, className, children }: ArtboardProps) {
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" className={className} {...a11y}>
      {children}
    </svg>
  )
}
