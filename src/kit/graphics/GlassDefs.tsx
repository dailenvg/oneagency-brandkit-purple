import type { GraphicPalette } from './palette'

interface GlassDefsProps {
  c: GraphicPalette
  id: (name: string) => string
}

/**
 * Shared paint for the glass illustrations, after the hub's glass tokens: body, rim light and specular lit from the
 * top left, a soft shadow, the signature gradient and the focal glow. Put inside <defs>.
 */
export function GlassDefs({ c, id }: GlassDefsProps) {
  return (
    <>
      <linearGradient id={id('glass')} x1="0" y1="0" x2="0.8" y2="1">
        {c.glass.map(([offset, color, opacity]) => (
          <stop key={offset} offset={offset} stopColor={color} stopOpacity={opacity} />
        ))}
      </linearGradient>
      <linearGradient id={id('rim')} x1="0" y1="0" x2="0.8" y2="1">
        {c.rimStops.map(([offset, color, opacity]) => (
          <stop key={offset} offset={offset} stopColor={color} stopOpacity={opacity} />
        ))}
      </linearGradient>
      <linearGradient id={id('spec')} x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor={c.paper} stopOpacity={c.specular} />
        <stop offset="1" stopColor={c.paper} stopOpacity="0" />
      </linearGradient>
      <linearGradient id={id('accent')} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={c.from} />
        <stop offset="1" stopColor={c.to} />
      </linearGradient>
      <radialGradient id={id('glow')}>
        <stop offset="0" stopColor={c.focal} stopOpacity={c.alpha.glow} />
        <stop offset="1" stopColor={c.focal} stopOpacity="0" />
      </radialGradient>
      <filter id={id('soft')} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="16" />
      </filter>
    </>
  )
}
