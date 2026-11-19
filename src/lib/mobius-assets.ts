import { creativeConcept } from '../data/ad-creative'
import { MOBIUS_DIR } from '../data/mobius'

const CREATIVE_AD = /^\/kit\/ads\/creative\/([^/]+)\//

/**
 * Files that show ConversionIQ's Möbius loop, so they carry its credit: the Möbius stills, and the creative ads whose
 * concept has the loop as backdrop (src/data/ad-creative.ts).
 */
export function usesMobius(url: string) {
  if (url.startsWith(`${MOBIUS_DIR}/`)) return true
  const concept = url.match(CREATIVE_AD)?.[1]
  return !!concept && creativeConcept(concept)?.backdrop === 'mobius'
}
