import type { ReactNode } from 'react'

/**
 * Status label: Proposed, Derived, Live site, counts. One look everywhere, in both themes: a light blue filled tag
 * (--kit-lilac-100) with navy text (--kit-lilac-900), about 13:1. The words carry the meaning, not the colour.
 */
export function Badge({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center rounded-site-sm bg-tag px-2.5 py-0.5 text-step-small font-semibold text-on-tag">{children}</span>
}
