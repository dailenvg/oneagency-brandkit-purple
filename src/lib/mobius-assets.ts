import { MOBIUS_DIR } from '../data/mobius'

/** Files that show ConversionIQ's Möbius loop, so they carry its credit: the Möbius stills. */
export function usesMobius(url: string) {
  return url.startsWith(`${MOBIUS_DIR}/`)
}
