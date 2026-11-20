import type { ReactNode } from 'react'

/**
 * Status label: Proposed, Derived, counts. One look everywhere, in both themes: a Sky filled tag with Navy text,
 * 14.3:1. The words carry the meaning, not the colour.
 */
export function Badge({ children }: { children: ReactNode }) {
  // font-sans and tracking-normal: a badge inside a display h2 (SubHeading) stays Geist, the same as everywhere else.
  return <span className="inline-flex items-center rounded-site-sm bg-tag px-3 py-0.5 font-sans text-step-small font-semibold tracking-normal text-on-tag">{children}</span>
}
