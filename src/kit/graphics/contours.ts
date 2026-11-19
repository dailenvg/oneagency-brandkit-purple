import { linePath, type Point } from './geometry'

/**
 * Contour lines for the topographic pattern, by marching squares over a field that repeats every CONTOUR_TILE px in
 * both directions, so the tile joins seamlessly. sin x cos y makes the loops (and the figure-eights at its saddles, the
 * brand's loop); two harmonics keep it from looking like a formula, and a slow term the size of the whole tile makes
 * every hill different, so a 1080 frame never shows a repeat. Computed once, deterministic.
 */
export const CONTOUR_TILE = 1080

const RES = 8
const N = CONTOUR_TILE / RES
const TAU = Math.PI * 2

function field(i: number, j: number) {
  const x = (TAU * i) / N
  const y = (TAU * j) / N
  return (
    Math.sin(2 * x) * Math.cos(2 * y) +
    0.5 * Math.sin(4 * x + 2 * y + 1) +
    0.3 * Math.cos(2 * x - 4 * y + 0.5) +
    0.6 * Math.sin(x + 0.6) * Math.cos(y + 1.2) +
    0.25 * Math.sin(x - y + 2)
  )
}

const VALUES = Array.from({ length: N + 1 }, (_, i) => Array.from({ length: N + 1 }, (_, j) => field(i, j)))

type Edge = string

/** The crossing point on a cell edge, and its key (shared with the neighbouring cell). */
function crossing(level: number, a: [number, number], b: [number, number]): [Edge, Point] {
  const va = VALUES[a[0]][a[1]]
  const vb = VALUES[b[0]][b[1]]
  const t = (level - va) / (vb - va)
  const key = `${a[0]},${a[1]}-${b[0]},${b[1]}`
  return [key, [(a[0] + (b[0] - a[0]) * t) * RES, (a[1] + (b[1] - a[1]) * t) * RES]]
}

/** Segments for one level: pairs of edge keys, with every key's point. */
function segments(level: number) {
  const points = new Map<Edge, Point>()
  const segs: [Edge, Edge][] = []
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++) {
      const tl: [number, number] = [i, j]
      const tr: [number, number] = [i + 1, j]
      const br: [number, number] = [i + 1, j + 1]
      const bl: [number, number] = [i, j + 1]
      const above = [tl, tr, br, bl].map(([x, y]) => VALUES[x][y] > level)
      const edges: [Edge, Point][] = []
      const sides: [[number, number], [number, number]][] = [
        [tl, tr],
        [tr, br],
        [bl, br],
        [tl, bl],
      ]
      const corner = [
        [0, 1],
        [1, 2],
        [3, 2],
        [0, 3],
      ]
      sides.forEach(([a, b], k) => {
        if (above[corner[k][0]] !== above[corner[k][1]]) edges.push(crossing(level, a, b))
      })
      edges.forEach(([key, p]) => points.set(key, p))
      if (edges.length === 2) segs.push([edges[0][0], edges[1][0]])
      if (edges.length === 4) {
        // Saddle: pair the crossings so the centre value decides which way the lines bend.
        const centreAbove = (VALUES[i][j] + VALUES[i + 1][j] + VALUES[i + 1][j + 1] + VALUES[i][j + 1]) / 4 > level
        const [top, right, bottom, left] = edges.map((e) => e[0])
        if (centreAbove === above[0]) segs.push([top, right], [bottom, left])
        else segs.push([top, left], [bottom, right])
      }
    }
  return { points, segs }
}

/** Joins segments that share an edge into polylines. */
function chain(level: number) {
  const { points, segs } = segments(level)
  const byEdge = new Map<Edge, number[]>()
  segs.forEach(([a, b], k) => {
    byEdge.set(a, [...(byEdge.get(a) ?? []), k])
    byEdge.set(b, [...(byEdge.get(b) ?? []), k])
  })
  const used = new Set<number>()
  const lines: Point[][] = []
  const walk = (start: Edge, from: number) => {
    const out: Edge[] = []
    let edge = start
    let seg = from
    for (;;) {
      const next = byEdge.get(edge)?.find((k) => k !== seg && !used.has(k))
      if (next === undefined) return out
      used.add(next)
      const [a, b] = segs[next]
      edge = a === edge ? b : a
      seg = next
      out.push(edge)
    }
  }
  segs.forEach(([a, b], k) => {
    if (used.has(k)) return
    used.add(k)
    const forward = walk(b, k)
    const back = walk(a, k).reverse()
    lines.push([...back, a, b, ...forward].map((e) => points.get(e)!))
  })
  return lines
}

export const CONTOUR_LEVELS = Array.from({ length: 17 }, (_, i) => -2 + i * 0.25)

/** One path per level. Every fourth is an index contour, drawn stronger, as on a survey map. */
export const CONTOURS = CONTOUR_LEVELS.map((level, i) => ({
  d: chain(level)
    .map((line) => linePath(line))
    .join(''),
  index: i % 4 === 0,
}))
