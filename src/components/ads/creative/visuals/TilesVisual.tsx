import { Browser, FileMagnifyingGlass, MagnifyingGlass, Star, TrendUp, type Icon } from '@phosphor-icons/react'
import { GlassIcon } from '../../../../kit/glass/GlassIcon'
import { adMinPx } from '../ad-type'
import { FitScaleContext } from '../fit-scale'
import { Stage } from './Stage'
import type { VisualProps } from './visual-props'

/** Icons for the five audit items, in list order (the five-part reference ad's tiles). */
const ICONS: Icon[] = [MagnifyingGlass, FileMagnifyingGlass, Star, Browser, TrendUp]

/** Growth audit: the list as glass icon tiles, two columns with the last one full width (one column on a story). */
export function TilesVisual({ concept, format, className, placement, bleed }: VisualProps) {
  const single = format === 'story'
  const [w, h] = single ? [380, 440] : [500, 282]
  return (
    <Stage width={w} height={h} bleed={bleed} arc={{ width: single ? 640 : 700, top: single ? -68 : -72 }} glow={{ width: w * 0.9, bottom: -10 }} placement={placement} className={className}>
      <FitScaleContext.Consumer>
        {(fit) => (
          <ul className={`absolute inset-0 grid content-center gap-3 text-left ${single ? 'grid-cols-1' : 'grid-cols-2'}`} style={{ fontSize: Math.max(17, adMinPx('legal', format, fit)) }}>
            {concept.list.map((item, i) => (
              <li key={item} className={!single && i === concept.list.length - 1 && concept.list.length % 2 ? 'col-span-2' : ''}>
                <GlassIcon icon={ICONS[i % ICONS.length]} label={item} size="lg" className={!single && i === concept.list.length - 1 ? 'justify-center' : ''} />
              </li>
            ))}
          </ul>
        )}
      </FitScaleContext.Consumer>
    </Stage>
  )
}
