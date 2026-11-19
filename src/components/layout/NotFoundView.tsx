import { ArrowLeft, Compass } from '@phosphor-icons/react'
import { VIEWS, viewHref } from '../../lib/views'
import { ButtonLink } from '../ui/ButtonLink'
import { buttonClass } from '../ui/button-styles'
import { useFocusTitleOnNavigate } from './view-focus'

const TITLE_ID = 'not-found-title'

/** Unknown #/path: says so, offers Overview and every view. */
export function NotFoundView({ path }: { path: string }) {
  useFocusTitleOnNavigate(TITLE_ID)

  return (
    <section aria-labelledby={TITLE_ID} className="container-site flex flex-col items-start gap-6 pt-12 pb-section lg:pt-16">
      <Compass className="size-10 text-info" aria-hidden />
      <h1 id={TITLE_ID} tabIndex={-1} className="text-step-4 font-bold leading-display tracking-tight outline-none">
        There is no &ldquo;{path}&rdquo; view
      </h1>
      <p className="max-w-2xl text-step-1 text-text-2">The link may be from an older version of the kit. Start from the overview, or pick a view.</p>
      <ButtonLink href={viewHref('overview')}>
        <ArrowLeft className="size-5" aria-hidden />
        Back to overview
      </ButtonLink>
      <ul className="flex flex-wrap gap-2">
        {VIEWS.filter((v) => v.id !== 'overview').map((v) => (
          <li key={v.id}>
            <a href={viewHref(v.id)} className={buttonClass('quiet', 'sm')}>
              {v.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
