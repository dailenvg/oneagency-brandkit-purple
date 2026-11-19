import { elementById } from '../../data/elements'
import { graphicById } from '../../kit/graphics/registry'
import { useTheme } from '../../lib/theme'
import { GraphicMotion } from './GraphicMotion'

interface ElementGraphicProps {
  /** Element id of a kit graphic (src/kit/graphics/registry.ts). */
  id: string
  className?: string
}

/**
 * A kit graphic as the hub shows it: the on-dark file in dark mode and the on-light file in light mode (the same
 * component the downloads are rendered from), with its entrance on top.
 */
export function ElementGraphic({ id, className }: ElementGraphicProps) {
  const theme = useTheme()
  const { Component } = graphicById(id)
  const { alt, title } = elementById(id)
  return (
    <GraphicMotion className={className}>
      <Component tone={theme} label={alt ?? title} className="block h-auto w-full" />
    </GraphicMotion>
  )
}
