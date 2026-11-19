import { CheckBadge } from '../../kit/glass/CheckBadge'
import { GlowGround } from '../../kit/glass/GlowGround'
import { Grain } from '../../kit/glass/Grain'
import { HalftoneArc } from '../../kit/glass/HalftoneArc'
import { ParticleStream } from '../../kit/glass/ParticleStream'
import { BrowserMock } from './BrowserMock'

/** The audit checklist from the reference ads (source: the ads' own copy). */
const CHECKS = ['AI search visibility scan', 'SEO audit', 'Online reviews audit', 'Website CRO audit', 'Tactical steps to scale up']

/**
 * The style at a glance, rebuilt from the kit components (not an image): halftone arc, glass browser in a depth stack
 * on a rose under-glow, the check list, a particle stream and grain. Follows the hub theme.
 */
export function GlassScene() {
  return (
    <figure className="relative isolate overflow-hidden rounded-site border border-edge bg-ground">
      <Grain className="z-10" />
      <ParticleStream className="absolute bottom-0 left-0 -z-10 h-1/2 w-full opacity-70 md:w-1/2" />
      <div className="grid items-center gap-10 p-6 sm:p-10 md:grid-cols-2 lg:p-14">
        <div className="relative mx-auto w-full max-w-sm">
          <HalftoneArc inView className="absolute -top-16 left-1/2 -z-10 w-[150%] max-w-none -translate-x-1/2" />
          <GlowGround className="-bottom-10 left-1/2 -z-10 h-24 w-[110%] -translate-x-1/2" />
          <BrowserMock depth={2} className="-rotate-3" />
        </div>
        <ul className="flex flex-col gap-3">
          {CHECKS.map((c) => (
            <li key={c} className="flex items-center gap-3 text-step-1 font-semibold text-text">
              <CheckBadge />
              {c}
            </li>
          ))}
        </ul>
      </div>
      <figcaption className="sr-only">
        The glass style rebuilt from the kit components: a frosted browser window stacked in depth on a rose under-glow, a rose halftone arc behind it, a checklist with rose
        glass badges, a particle stream and grain.
      </figcaption>
    </figure>
  )
}
