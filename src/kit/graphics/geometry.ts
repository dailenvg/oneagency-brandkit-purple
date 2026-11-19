/** Path helpers for the graphics. Pure functions: the same input always writes the same path. */

export type Point = readonly [number, number]

/** One decimal is finer than a 2x pixel and keeps the SVG small. */
export const n = (v: number) => String(Math.round(v * 10) / 10)

export const linePath = (points: readonly Point[]) => `M${points.map(([x, y]) => `${n(x)} ${n(y)}`).join('L')}`

/**
 * A smooth curve through every point (centripetal-free Catmull-Rom, converted to cubic Béziers). `tension` 1 is the
 * classic spline; lower is tighter.
 */
export function smoothPath(points: readonly Point[], tension = 1) {
  if (points.length < 3) return linePath(points)
  const k = tension / 6
  let d = `M${n(points[0][0])} ${n(points[0][1])}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]
    const [x1, y1] = points[i]
    const [x2, y2] = points[i + 1]
    const p3 = points[i + 2] ?? points[i + 1]
    d += `C${n(x1 + (x2 - p0[0]) * k)} ${n(y1 + (y2 - p0[1]) * k)} ${n(x2 - (p3[0] - x1) * k)} ${n(y2 - (p3[1] - y1) * k)} ${n(x2)} ${n(y2)}`
  }
  return d
}

/** `count` evenly spaced values from `from` to `to`, both included. */
export const steps = (from: number, to: number, count: number) =>
  Array.from({ length: count }, (_, i) => from + ((to - from) * i) / Math.max(1, count - 1))

/** A point on a circle, angle in degrees clockwise from 3 o'clock. */
export function polar(cx: number, cy: number, r: number, deg: number): Point {
  const a = (deg * Math.PI) / 180
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
}

/** An arc along a circle, from one angle to another (degrees, clockwise). */
export function arcPath(cx: number, cy: number, r: number, fromDeg: number, toDeg: number) {
  const [x1, y1] = polar(cx, cy, r, fromDeg)
  const [x2, y2] = polar(cx, cy, r, toDeg)
  const large = Math.abs(toDeg - fromDeg) > 180 ? 1 : 0
  return `M${n(x1)} ${n(y1)}A${n(r)} ${n(r)} 0 ${large} 1 ${n(x2)} ${n(y2)}`
}
