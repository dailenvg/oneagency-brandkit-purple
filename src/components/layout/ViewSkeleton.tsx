/** Placeholder while a view's chunk loads: the header and a card grid, shimmering. */
export function ViewSkeleton() {
  return (
    // role="status": a generic div cannot carry aria-label; the hidden line is what screen readers announce.
    <div role="status" aria-busy="true" className="container-site flex flex-col gap-10 pt-12 pb-section lg:pt-16">
      <span className="sr-only">Loading this view</span>
      <div aria-hidden className="flex flex-col gap-5">
        <div className="h-4 w-32 animate-pulse rounded-full bg-surface-2 motion-reduce:animate-none" />
        <div className="h-12 w-3/4 max-w-xl animate-pulse rounded-site-sm bg-surface-2 motion-reduce:animate-none" />
        <div className="h-5 w-full max-w-2xl animate-pulse rounded-full bg-surface motion-reduce:animate-none" />
      </div>
      <div aria-hidden className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-56 animate-pulse rounded-site bg-surface motion-reduce:animate-none" />
        ))}
      </div>
    </div>
  )
}
