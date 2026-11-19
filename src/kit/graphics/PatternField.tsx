import type { ReactNode } from 'react'
import { anim } from './anim'
import { Artboard } from './Artboard'
import { palette } from './palette'
import type { GraphicProps } from './types'
import { useGraphicIds } from './use-graphic-ids'
import { PATTERN_SIZE } from './sizes'

/** How the pattern fades across the frame: a radial spot (cx, cy, r as fractions), or a straight fade between two corners. */
export type PatternFade =
  | { kind: 'radial'; cx: number; cy: number; r: number; edge: number }
  | { kind: 'linear'; x1: number; y1: number; x2: number; y2: number; edge: number }

interface PatternFieldProps extends GraphicProps {
  tile: { width: number; height: number; transform?: string }
  fade: PatternFade
  /** The tile's marks: drawn in `ink`, with opacities multiplied by `gain`. */
  children: (ink: string, gain: number) => ReactNode
}

/**
 * A full-bleed pattern: the ground, then one tileable <pattern> faded across the frame so copy can sit on the quiet
 * side. Shared by the four kit patterns.
 */
export function PatternField({ tone, idPrefix, label, className, tile, fade, children }: PatternFieldProps) {
  const c = palette(tone)
  const { id, url } = useGraphicIds(idPrefix)
  const { width: W, height: H } = PATTERN_SIZE
  const stops = (
    <>
      <stop offset="0" stopColor="#fff" />
      <stop offset="1" stopColor="#fff" stopOpacity={fade.edge} />
    </>
  )

  return (
    <Artboard {...PATTERN_SIZE} label={label} className={className}>
      <defs>
        <pattern id={id('tile')} width={tile.width} height={tile.height} patternUnits="userSpaceOnUse" patternTransform={tile.transform}>
          {children(c.line, c.patternGain)}
        </pattern>
        {fade.kind === 'radial' ? (
          <radialGradient id={id('fade')} cx={fade.cx} cy={fade.cy} r={fade.r}>
            {stops}
          </radialGradient>
        ) : (
          <linearGradient id={id('fade')} x1={fade.x1} y1={fade.y1} x2={fade.x2} y2={fade.y2}>
            {stops}
          </linearGradient>
        )}
        <mask id={id('mask')}>
          <rect width={W} height={H} fill={url('fade')} />
        </mask>
      </defs>
      <rect width={W} height={H} fill={c.ground} />
      <rect {...anim('area')} width={W} height={H} fill={url('tile')} mask={url('mask')} />
    </Artboard>
  )
}
