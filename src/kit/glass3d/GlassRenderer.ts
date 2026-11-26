import { FIELD_SIZE } from './field'
import type { GlassSettings, Ground, RGB } from './presets'
import { DEFAULT_SETTINGS, hex } from './presets'
import { FRAG, VERT } from './shader'

const UNIFORMS = [
  'uRes', 'uRot', 'uTex', 'uSdf', 'uBg', 'uRim', 'uIor', 'uDisp', 'uFrost', 'uTintAmt', 'uTintLo', 'uTintHi',
  'uScale', 'uDepth', 'uBevel', 'uTexH', 'uWhite', 'uRimAmt', 'uAlpha', 'uTintA', 'uTintB',
] as const
type UniformName = (typeof UNIFORMS)[number]

const SCALAR_KEYS = ['ior', 'disp', 'frost', 'depth', 'bevel', 'tint', 'white', 'rim', 'lo', 'hi'] as const

export interface Backdrop {
  ground: Ground
  words: string
  /** CSS font family for the words (the display face). */
  family: string
}

export class GlassError extends Error {}

const clone = (s: GlassSettings): GlassSettings => ({ ...s, top: [...s.top] as RGB, middle: [...s.middle] as RGB })

/**
 * Owns one WebGL2 canvas that draws a glass icon over a typographic backdrop. Renders on demand: frames run only while
 * something moves (drag, inertia, a shape morph or settings easing in) and the canvas is on screen.
 */
export class GlassRenderer {
  private readonly gl: WebGL2RenderingContext
  private readonly u = {} as Record<UniformName, WebGLUniformLocation | null>
  private readonly tex: WebGLTexture
  private readonly sdfTex: WebGLTexture
  private readonly backdropCanvas = document.createElement('canvas')
  private readonly bctx = this.backdropCanvas.getContext('2d')!

  private target: GlassSettings = clone(DEFAULT_SETTINGS)
  private cur: GlassSettings = clone(DEFAULT_SETTINGS)
  private backdrop: Backdrop | null = null
  private bgRGB: RGB = [0, 0, 0]
  private rimRGB: RGB = [0, 0, 0]

  private fieldFrom: Float32Array | null = null
  private fieldTo: Float32Array | null = null
  private readonly fieldNow = new Float32Array(FIELD_SIZE * FIELD_SIZE)
  private morph = 1

  yaw = -0.42
  pitch = 0.28
  private vYaw = 0
  private vPitch = 0
  private dragging = false

  private raf = 0
  private last = 0
  private visible = true
  private renderScale = 1
  private slowFrames = 0
  private cssW = 1
  private cssH = 1
  private disposed = false

  private readonly canvas: HTMLCanvasElement
  private readonly reducedMotion: boolean

  constructor(canvas: HTMLCanvasElement, reducedMotion = false) {
    this.canvas = canvas
    this.reducedMotion = reducedMotion
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: true, premultipliedAlpha: false, powerPreference: 'high-performance' })
    if (!gl) throw new GlassError('This browser didn’t provide WebGL2, which the glass renderer needs.')
    this.gl = gl

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new GlassError(`The glass shader didn’t compile on this GPU. ${gl.getShaderInfoLog(s) ?? ''}`)
      return s
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new GlassError(`The glass shader didn’t link. ${gl.getProgramInfoLog(prog) ?? ''}`)
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    for (const n of UNIFORMS) this.u[n] = gl.getUniformLocation(prog, n)

    this.tex = gl.createTexture()!
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.tex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.uniform1i(this.u.uTex, 0)

    this.sdfTex = gl.createTexture()!
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, this.sdfTex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.uniform1i(this.u.uSdf, 1)

    canvas.addEventListener('pointerdown', this.onDown)
    canvas.addEventListener('pointermove', this.onMove)
    canvas.addEventListener('pointerup', this.onUp)
    canvas.addEventListener('pointercancel', this.onUp)
    canvas.addEventListener('keydown', this.onKey)
  }

  /* ------------------------------------------------------------ inputs */

  setSettings(next: Partial<GlassSettings>) {
    Object.assign(this.target, next)
    if (this.reducedMotion) this.cur = clone(this.target)
    this.wake()
  }

  setField(field: Float32Array) {
    if (!this.fieldTo || this.reducedMotion) {
      this.fieldTo = field
      this.fieldNow.set(field)
      this.uploadField()
      this.morph = 1
    } else {
      this.fieldFrom = new Float32Array(this.fieldNow)
      this.fieldTo = field
      this.morph = 0
    }
    this.wake()
  }

  setBackdrop(b: Backdrop) {
    this.backdrop = b
    this.bgRGB = hex(b.ground.from).map((v, i) => (v + hex(b.ground.to)[i]) / 2) as RGB
    this.rimRGB = hex(b.ground.rim)
    this.drawBackdrop(this.canvas.width, this.canvas.height)
    this.wake()
  }

  /** CSS size of the canvas; call from a ResizeObserver. */
  resize(cssW: number, cssH: number) {
    this.cssW = Math.max(1, cssW)
    this.cssH = Math.max(1, cssH)
    this.applySize()
    this.drawBackdrop(this.canvas.width, this.canvas.height)
    this.wake()
  }

  setVisible(v: boolean) {
    this.visible = v
    if (v) this.wake()
  }

  resetView() {
    this.yaw = -0.42
    this.pitch = 0.28
    this.vYaw = this.vPitch = 0
    this.wake()
  }

  /* ------------------------------------------------------------ export */

  /** Renders one frame at size × size and returns it as a PNG. Transparent keeps the glass and its shadow only. */
  async exportPng(size: number, transparent: boolean): Promise<Blob> {
    const { gl } = this
    cancelAnimationFrame(this.raf)
    this.raf = 0
    // Settle every eased value so the file matches the settings, not a frame mid-transition.
    this.cur = clone(this.target)
    if (this.fieldTo && this.morph < 1) {
      this.fieldNow.set(this.fieldTo)
      this.uploadField()
      this.morph = 1
    }
    const max = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE) as number
    const s = Math.min(size, max)
    this.canvas.width = s
    this.canvas.height = s
    this.drawBackdrop(s, s)
    this.draw(transparent ? 1 : 0)
    const px = new Uint8Array(s * s * 4)
    gl.readPixels(0, 0, s, s, gl.RGBA, gl.UNSIGNED_BYTE, px)
    this.applySize()
    this.drawBackdrop(this.canvas.width, this.canvas.height)
    this.wake()

    const out = document.createElement('canvas')
    out.width = out.height = s
    const ctx = out.getContext('2d')!
    const img = ctx.createImageData(s, s)
    const row = s * 4
    for (let y = 0; y < s; y++) img.data.set(px.subarray((s - 1 - y) * row, (s - y) * row), y * row)
    ctx.putImageData(img, 0, 0)
    return new Promise((resolve, reject) => out.toBlob((b) => (b ? resolve(b) : reject(new GlassError('The PNG couldn’t be written.'))), 'image/png'))
  }

  dispose() {
    this.disposed = true
    cancelAnimationFrame(this.raf)
    this.canvas.removeEventListener('pointerdown', this.onDown)
    this.canvas.removeEventListener('pointermove', this.onMove)
    this.canvas.removeEventListener('pointerup', this.onUp)
    this.canvas.removeEventListener('pointercancel', this.onUp)
    this.canvas.removeEventListener('keydown', this.onKey)
    // The context is left for the canvas to release when it unmounts: a renderer created again on the same canvas
    // (React's dev double-mount, a reduced-motion change) gets the same context back, so it must not be lost here.
  }

  /* ------------------------------------------------------------ internals */

  private applySize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2) * this.renderScale
    const w = Math.max(2, Math.floor(this.cssW * dpr))
    const h = Math.max(2, Math.floor(this.cssH * dpr))
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w
      this.canvas.height = h
    }
  }

  private uploadField() {
    const { gl } = this
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, this.sdfTex)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, FIELD_SIZE, FIELD_SIZE, 0, gl.RED, gl.FLOAT, this.fieldNow)
  }

  private drawBackdrop(w: number, h: number) {
    if (!this.backdrop) return
    const { ground, words, family } = this.backdrop
    const c = this.backdropCanvas
    const ctx = this.bctx
    c.width = w
    c.height = h
    const g = ctx.createLinearGradient(0, 0, w, h * Math.tan((30 * Math.PI) / 180))
    g.addColorStop(0, ground.from)
    g.addColorStop(0.75, ground.to)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)

    const lines = words.trim().split(/\s+/).filter(Boolean)
    if (lines.length) {
      let size = Math.min((h * 0.8) / (lines.length * 0.95), h * 0.28)
      const setFont = () => {
        ctx.font = `600 ${size}px ${family}`
        try {
          ctx.letterSpacing = `${-0.03 * size}px`
        } catch {
          /* older engines: no letterSpacing */
        }
      }
      setFont()
      const widest = Math.max(1, ...lines.map((l) => ctx.measureText(l).width))
      const avail = w * 0.9
      if (widest > avail) {
        size *= avail / widest
        setFont()
      }
      ctx.textAlign = 'center'
      ctx.textBaseline = 'alphabetic'
      ctx.fillStyle = ground.ink
      const lead = size * 0.95
      const top = h * 0.5 - (lead * lines.length) / 2 + size * 0.78
      lines.forEach((l, i) => ctx.fillText(l, w / 2, top + i * lead))
    }

    const { gl } = this
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.tex)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c)
    gl.generateMipmap(gl.TEXTURE_2D)
  }

  private wake() {
    if (this.disposed || this.raf || !this.visible) return
    this.last = performance.now()
    this.raf = requestAnimationFrame(this.frame)
  }

  private frame = (now: number) => {
    this.raf = 0
    const dt = Math.min((now - this.last) / 1000, 0.1)
    this.last = now
    let moving = this.dragging

    // Drop resolution on slow GPUs, down to half.
    if (dt > 0.03 && this.renderScale > 0.5) {
      if (++this.slowFrames > 25) {
        this.renderScale = Math.max(0.5, this.renderScale * 0.8)
        this.slowFrames = 0
        this.applySize()
        this.drawBackdrop(this.canvas.width, this.canvas.height)
      }
    } else if (this.slowFrames > 0) this.slowFrames--

    if (this.morph < 1 && this.fieldFrom && this.fieldTo) {
      this.morph = Math.min(1, this.morph + dt * 2.2)
      const m = this.morph * this.morph * (3 - 2 * this.morph)
      const im = 1 - m
      for (let j = 0; j < this.fieldNow.length; j++) this.fieldNow[j] = this.fieldFrom[j] * im + this.fieldTo[j] * m
      this.uploadField()
      moving = true
    }

    const k = 1 - Math.exp(-dt * 6)
    for (const n of SCALAR_KEYS) {
      const d = this.target[n] - this.cur[n]
      if (Math.abs(d) > 1e-4) moving = true
      this.cur[n] += d * k
    }
    for (let i = 0; i < 3; i++) {
      for (const key of ['top', 'middle'] as const) {
        const d = this.target[key][i] - this.cur[key][i]
        if (Math.abs(d) > 1e-4) moving = true
        this.cur[key][i] += d * k
      }
    }

    if (!this.dragging) {
      this.yaw += this.vYaw
      this.pitch += this.vPitch
      this.vYaw *= 0.92
      this.vPitch *= 0.92
      if (Math.abs(this.vYaw) + Math.abs(this.vPitch) > 1e-4) moving = true
      else this.vYaw = this.vPitch = 0
    }

    this.draw(0)
    if (moving && this.visible) this.raf = requestAnimationFrame(this.frame)
  }

  private draw(alpha: number) {
    const { gl, u, cur, canvas } = this
    const ca = Math.cos(this.pitch)
    const sa = Math.sin(this.pitch)
    const cb = Math.cos(this.yaw)
    const sb = Math.sin(this.yaw)
    // Row-major object-to-world; uploaded untransposed so GLSL gets the inverse.
    const rot = [cb, 0, sb, sa * sb, ca, -sa * cb, -ca * sb, sa, ca * cb]
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.uniform2f(u.uRes, canvas.width, canvas.height)
    gl.uniformMatrix3fv(u.uRot, false, rot)
    gl.uniform3f(u.uBg, ...this.bgRGB)
    gl.uniform3f(u.uRim, ...this.rimRGB)
    gl.uniform1f(u.uIor, Math.max(1.001, cur.ior))
    gl.uniform1f(u.uDisp, cur.disp)
    gl.uniform1f(u.uFrost, cur.frost)
    gl.uniform1f(u.uTintAmt, cur.tint)
    gl.uniform1f(u.uTintLo, cur.lo)
    gl.uniform1f(u.uTintHi, cur.hi)
    // The icon fills about 70% of a square frame; narrower frames shrink it so it never clips.
    gl.uniform1f(u.uScale, Math.max(0.3, Math.min(1.35, (canvas.width / canvas.height) * 1.5)))
    gl.uniform1f(u.uDepth, cur.depth)
    gl.uniform1f(u.uBevel, Math.min(cur.bevel, cur.depth * 0.9))
    gl.uniform1f(u.uWhite, cur.white)
    gl.uniform1f(u.uRimAmt, cur.rim)
    gl.uniform1f(u.uAlpha, alpha)
    gl.uniform1f(u.uTexH, this.backdropCanvas.height)
    gl.uniform3f(u.uTintA, ...cur.top)
    gl.uniform3f(u.uTintB, ...cur.middle)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  private lastX = 0
  private lastY = 0

  private onDown = (e: PointerEvent) => {
    this.dragging = true
    this.lastX = e.clientX
    this.lastY = e.clientY
    this.canvas.dataset.dragging = 'true'
    try {
      this.canvas.setPointerCapture(e.pointerId)
    } catch {
      /* capture is a nicety */
    }
    this.wake()
  }

  private onMove = (e: PointerEvent) => {
    if (!this.dragging) return
    this.vYaw = (e.clientX - this.lastX) * 0.008
    this.vPitch = (e.clientY - this.lastY) * 0.008
    this.yaw += this.vYaw
    this.pitch += this.vPitch
    this.lastX = e.clientX
    this.lastY = e.clientY
    if (this.reducedMotion) this.vYaw = this.vPitch = 0
    this.wake()
  }

  private onUp = () => {
    this.dragging = false
    delete this.canvas.dataset.dragging
    if (this.reducedMotion) this.vYaw = this.vPitch = 0
    this.wake()
  }

  /** Arrow keys turn the icon 10° a press; Home resets the view. */
  private onKey = (e: KeyboardEvent) => {
    const step = (10 * Math.PI) / 180
    const moves: Record<string, () => void> = {
      ArrowLeft: () => (this.yaw -= step),
      ArrowRight: () => (this.yaw += step),
      ArrowUp: () => (this.pitch -= step),
      ArrowDown: () => (this.pitch += step),
      Home: () => this.resetView(),
    }
    const move = moves[e.key]
    if (!move) return
    e.preventDefault()
    move()
    this.wake()
  }
}
