import { useContext, type ReactNode } from 'react'
import { slug, subAnchorId } from '../../lib/views'
import { SectionViewContext } from './view-focus'

interface SubHeadingProps {
  title: string
  badge?: ReactNode
  children?: ReactNode
}

/**
 * h2 inside a view, with an optional status badge and intro line. Inside a Section it carries the subsection anchor
 * (`sub-[view]-[slug]`) the sidebar dropdowns and #/view/sub links scroll to; it is script-focusable so a subsection
 * link moves focus here. The page's scroll-padding-top (index.css) already clears the sticky top bar below lg; the
 * small scroll margin adds breathing room above the heading.
 */
export function SubHeading({ title, badge, children }: SubHeadingProps) {
  const view = useContext(SectionViewContext)
  const id = view ? subAnchorId(view, slug(title)) : undefined
  return (
    <div className="mb-6 flex flex-col gap-2">
      <h2
        id={id}
        tabIndex={id ? -1 : undefined}
        className="flex scroll-mt-4 flex-wrap items-center gap-3 text-step-2 font-semibold tracking-tight outline-none"
      >
        {title}
        {badge}
      </h2>
      {children && <div className="max-w-2xl text-step--1 text-text-2">{children}</div>}
    </div>
  )
}
