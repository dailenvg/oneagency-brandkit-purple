/**
 * Shape → signed distance field for the glass shader. A shape is drawn black on a 1024 px scratch canvas (path, glyph,
 * SVG markup or a transparent PNG), fitted to the mask, and turned into a 512 px signed distance field in icon units
 * (the mask spans -1..1, positive inside). Exact Euclidean distance transform (Felzenszwalb and Huttenlocher), computed
 * at twice the texture size and averaged down for sub-pixel edges and clean side walls.
 */

export const FIELD_SIZE = 512
const MASK = 1024
const SCRATCH = 1024
const INF = 1e20
const SVGNS = 'http://www.w3.org/2000/svg'

function edt1d(f: Float64Array, offset: number, stride: number, n: number, d: Float64Array, v: Uint16Array, z: Float64Array) {
  let k = 0
  v[0] = 0
  z[0] = -INF
  z[1] = INF
  d[0] = f[offset]
  for (let q = 1; q < n; q++) {
    d[q] = f[offset + q * stride]
    const q2 = q * q
    let s: number
    do {
      const r = v[k]
      s = (d[q] - d[r] + q2 - r * r) / (q - r) / 2
    } while (s <= z[k] && --k > -1)
    k++
    v[k] = q
    z[k] = s
    z[k + 1] = INF
  }
  k = 0
  for (let q = 0; q < n; q++) {
    while (z[k + 1] < q) k++
    const r = v[k]
    f[offset + q * stride] = d[r] + (q - r) * (q - r)
  }
}

function edt(grid: Float64Array, n: number) {
  const d = new Float64Array(n)
  const v = new Uint16Array(n)
  const z = new Float64Array(n + 1)
  for (let i = 0; i < n; i++) edt1d(grid, i, n, n, d, v, z)
  for (let i = 0; i < n; i++) edt1d(grid, i * n, 1, n, d, v, z)
}

/** A 1024 px scratch canvas that shapes are drawn on, plus the helpers that draw them. */
export class ShapeCanvas {
  readonly canvas: HTMLCanvasElement
  readonly ctx: CanvasRenderingContext2D
  private readonly mask: HTMLCanvasElement
  private readonly maskCtx: CanvasRenderingContext2D
  private readonly measure: SVGSVGElement

  constructor() {
    this.canvas = document.createElement('canvas')
    this.canvas.width = this.canvas.height = SCRATCH
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!
    this.mask = document.createElement('canvas')
    this.mask.width = this.mask.height = MASK
    this.maskCtx = this.mask.getContext('2d', { willReadFrequently: true })!
    this.measure = document.createElementNS(SVGNS, 'svg')
    this.measure.setAttribute('aria-hidden', 'true')
    this.measure.style.cssText = 'position:absolute;left:-9999px;top:0;width:10px;height:10px;visibility:hidden;overflow:hidden'
    document.body.appendChild(this.measure)
  }

  dispose() {
    this.measure.remove()
  }

  clear() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.ctx.clearRect(0, 0, SCRATCH, SCRATCH)
  }

  /** Fills an SVG path's d value. `soften` adds a round-joined stroke so sharp corners read as moulded glass. */
  drawPath(d: string, { soften = false, evenOdd = false } = {}): boolean {
    const el = document.createElementNS(SVGNS, 'path')
    el.setAttribute('d', d)
    this.measure.appendChild(el)
    let bb: DOMRect | null = null
    try {
      bb = el.getBBox()
    } catch {
      bb = null
    }
    el.remove()
    if (!bb || !(bb.width > 0) || !(bb.height > 0)) return false
    const size = Math.max(bb.width, bb.height)
    const sc = 860 / size
    this.clear()
    this.ctx.setTransform(sc, 0, 0, sc, 512 - (bb.x + bb.width / 2) * sc, 512 - (bb.y + bb.height / 2) * sc)
    const path = new Path2D(d)
    this.ctx.fillStyle = '#000'
    this.ctx.fill(path, evenOdd ? 'evenodd' : 'nonzero')
    if (soften) {
      this.ctx.strokeStyle = '#000'
      this.ctx.lineJoin = 'round'
      this.ctx.lineWidth = size * 0.07
      this.ctx.stroke(path)
    }
    return true
  }

  /** Up to four characters in the display face. */
  drawGlyph(text: string, family: string, weight = 600) {
    this.clear()
    let size = 700
    this.ctx.font = `${weight} ${size}px ${family}`
    const w = this.ctx.measureText(text).width
    if (w > 900) {
      size = (size * 900) / w
      this.ctx.font = `${weight} ${size}px ${family}`
    }
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    this.ctx.fillStyle = '#000'
    this.ctx.fillText(text, 512, 512)
  }

  /**
   * Draws SVG markup through an <img> (scripts never run there), after stripping active content. Resolves with an
   * error message, or null when something was drawn.
   */
  drawMarkup(markup: string): Promise<string | null> {
    const doc = new DOMParser().parseFromString(markup, 'image/svg+xml')
    const root = doc.documentElement
    if (!root || root.nodeName.toLowerCase() !== 'svg' || doc.getElementsByTagName('parsererror').length) {
      return Promise.resolve('That isn’t valid SVG. Paste the whole <svg>…</svg> element or a path’s d value.')
    }
    root.querySelectorAll('script, foreignObject, iframe, image, style, a').forEach((el) => el.remove())
    root.querySelectorAll('*').forEach((el) => {
      for (const at of Array.from(el.attributes)) {
        if (/^on/i.test(at.name) || /^\s*(javascript:|https?:)/i.test(at.value)) el.removeAttribute(at.name)
      }
    })
    const node = document.importNode(root, true) as unknown as SVGSVGElement
    this.measure.appendChild(node)
    let bb: DOMRect | null = null
    try {
      bb = node.getBBox()
    } catch {
      bb = null
    }
    node.remove()
    if (bb && bb.width > 0 && bb.height > 0) {
      const pad = Math.max(bb.width, bb.height) * 0.12
      node.setAttribute('viewBox', `${bb.x - pad} ${bb.y - pad} ${bb.width + pad * 2} ${bb.height + pad * 2}`)
    }
    node.setAttribute('xmlns', SVGNS)
    node.setAttribute('width', String(SCRATCH))
    node.setAttribute('height', String(SCRATCH))
    node.setAttribute('color', '#000')
    node.removeAttribute('style')
    node.removeAttribute('class')
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        this.clear()
        try {
          this.ctx.drawImage(img, 0, 0, SCRATCH, SCRATCH)
          resolve(null)
        } catch {
          resolve('This browser blocked that SVG. Try pasting just the path’s d value.')
        }
      }
      img.onerror = () => resolve('That SVG didn’t load. Try pasting just the path’s d value.')
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(node))}`
    })
  }

  /** Draws a PNG; refuses one with an opaque background, which would extrude into a plain slab. */
  drawPng(img: HTMLImageElement): string | null {
    this.clear()
    const sc = SCRATCH / Math.max(img.width, img.height)
    const dw = img.width * sc
    const dh = img.height * sc
    const x = (SCRATCH - dw) / 2
    const y = (SCRATCH - dh) / 2
    this.ctx.drawImage(img, x, y, dw, dh)
    const a1 = this.ctx.getImageData(Math.floor(x) + 2, Math.floor(y) + 2, 1, 1).data[3]
    const a2 = this.ctx.getImageData(Math.ceil(x + dw) - 3, Math.ceil(y + dh) - 3, 1, 1).data[3]
    if (a1 > 250 && a2 > 250) return 'That PNG has no transparent background, so it would become a plain slab. Use an SVG or a transparent PNG.'
    return null
  }

  private bbox(): [number, number, number, number] | null {
    const data = this.ctx.getImageData(0, 0, SCRATCH, SCRATCH).data
    let x0 = SCRATCH
    let y0 = SCRATCH
    let x1 = -1
    let y1 = -1
    for (let y = 0; y < SCRATCH; y++) {
      for (let x = 0; x < SCRATCH; x++) {
        if (data[(y * SCRATCH + x) * 4 + 3] > 8) {
          if (x < x0) x0 = x
          if (x > x1) x1 = x
          if (y < y0) y0 = y
          if (y > y1) y1 = y
        }
      }
    }
    return x1 < 0 ? null : [x0, y0, x1 - x0 + 1, y1 - y0 + 1]
  }

  /** The signed distance field of whatever is drawn now, or null when the canvas is empty. */
  field(): Float32Array | null {
    const bb = this.bbox()
    if (!bb) return null
    const M = MASK
    const N = FIELD_SIZE
    const sc = (M * 0.8) / Math.max(bb[2], bb[3])
    const dw = bb[2] * sc
    const dh = bb[3] * sc
    this.maskCtx.clearRect(0, 0, M, M)
    this.maskCtx.imageSmoothingQuality = 'high'
    this.maskCtx.drawImage(this.canvas, bb[0], bb[1], bb[2], bb[3], (M - dw) / 2, (M - dh) / 2, dw, dh)
    const m = this.maskCtx.getImageData(0, 0, M, M).data
    const outer = new Float64Array(M * M)
    const inner = new Float64Array(M * M)
    for (let i = 0; i < M * M; i++) {
      const a = m[i * 4 + 3] / 255
      if (a >= 1) {
        outer[i] = 0
        inner[i] = INF
      } else if (a <= 0) {
        outer[i] = INF
        inner[i] = 0
      } else {
        const dd = 0.5 - a
        outer[i] = dd > 0 ? dd * dd : 0
        inner[i] = dd < 0 ? dd * dd : 0
      }
    }
    edt(outer, M)
    edt(inner, M)
    const sd = new Float32Array(N * N)
    const t = new Float32Array(N * N)
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        let sum = 0
        for (let q = 0; q < 4; q++) {
          const j = (2 * y + (q >> 1)) * M + 2 * x + (q & 1)
          sum += Math.sqrt(inner[j]) - Math.sqrt(outer[j])
        }
        sd[y * N + x] = sum * 0.125
      }
    }
    // Two passes of a 1-2-1 blur: smooth walls without moving the edge.
    for (let pass = 0; pass < 2; pass++) {
      for (let y = 0; y < N; y++) {
        for (let x = 0; x < N; x++) {
          const xl = x > 0 ? x - 1 : x
          const xr = x < N - 1 ? x + 1 : x
          t[y * N + x] = (sd[y * N + xl] + 2 * sd[y * N + x] + sd[y * N + xr]) * 0.25
        }
      }
      for (let y = 0; y < N; y++) {
        for (let x = 0; x < N; x++) {
          const yu = y > 0 ? y - 1 : y
          const yd = y < N - 1 ? y + 1 : y
          sd[y * N + x] = (t[yu * N + x] + 2 * t[y * N + x] + t[yd * N + x]) * 0.25
        }
      }
    }
    // Flip rows (GL's origin is bottom-left) and convert pixels to icon units.
    const out = new Float32Array(N * N)
    const k = 2 / N
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) out[(N - 1 - y) * N + x] = sd[y * N + x] * k
    return out
  }
}
