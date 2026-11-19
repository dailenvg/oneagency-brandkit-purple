const pending = new Map<string, Promise<void>>()

/** Adds a classic <script> once per URL and resolves when it has run. A failed load can be retried. */
export function loadScriptOnce(src: string): Promise<void> {
  const known = pending.get(src)
  if (known) return known
  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      pending.delete(src)
      script.remove()
      reject(new Error(`Could not load ${src}`))
    }
    document.head.append(script)
  })
  pending.set(src, promise)
  return promise
}
