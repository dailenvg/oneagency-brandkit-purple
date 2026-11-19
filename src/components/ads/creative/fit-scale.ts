import { createContext, useContext } from 'react'

/** The scale a FitBox draws its contents at, so text inside can hold the ad's minimum sizes. 1 outside a FitBox. */
export const FitScaleContext = createContext(1)

export const useFitScale = () => useContext(FitScaleContext)
