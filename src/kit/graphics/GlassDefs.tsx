import type { GraphicPalette } from './palette'

interface GlassDefsProps {
  c: GraphicPalette
  id: (name: string) => string
}

/**
 * Shared paint for the glass illustrations, after the hub's glass tokens (the glass studio's frosted material): body
 * colour running top to bottom, rim light along the top, the diagonal sheen, and the signature gradient. No glow and no
 * blur filters. Put inside <defs>.
 */
export function GlassDefs({ c, id }: GlassDefsProps) {
  return (
    <>
      <linearGradient id={id('glass')} x1="0" y1="0" x2="0" y2="1">
        {c.glass.map(([offset, color, opacity]) => (
          <stop key={offset} offset={offset} stopColor={color} stopOpacity={opacity} />
        ))}
      </linearGradient>
      <linearGradient id={id('rim')} x1="0" y1="0" x2="0" y2="1">
        {c.rimStops.map(([offset, color, opacity]) => (
          <stop key={offset} offset={offset} stopColor={color} stopOpacity={opacity} />
        ))}
      </linearGradient>
      <linearGradient id={id('spec')} x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor={c.paper} stopOpacity={c.specular} />
        <stop offset="1" stopColor={c.paper} stopOpacity="0" />
      </linearGradient>
      <linearGradient id={id('sheen')} x1="0" y1="0" x2="1" y2="0.36">
        <stop offset="0.28" stopColor={c.paper} stopOpacity="0" />
        <stop offset="0.4" stopColor={c.paper} stopOpacity={c.sheen} />
        <stop offset="0.54" stopColor={c.paper} stopOpacity="0" />
      </linearGradient>
      <linearGradient id={id('accent')} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={c.from} />
        <stop offset="1" stopColor={c.to} />
      </linearGradient>
    </>
  )
}
