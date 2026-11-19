import { createContext, useContext } from 'react'

/** False when the ad is lit by the Möbius loop instead: the visuals then drop their halftone arc (never both). */
export const HalftoneContext = createContext(true)

export const useHalftone = () => useContext(HalftoneContext)
