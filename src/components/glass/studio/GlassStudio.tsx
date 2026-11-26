import { ArrowCounterClockwise, CaretDown, DownloadSimple, UploadSimple, WarningCircle } from '@phosphor-icons/react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useId, useRef, useState, type DragEvent } from 'react'
import { ShapeCanvas } from '../../../kit/glass3d/field'
import { GlassError, GlassRenderer } from '../../../kit/glass3d/GlassRenderer'
import { DEFAULT_SETTINGS, GROUNDS, MATERIALS, ONE_MARK_PATH, SLIDERS, hex, type GlassSettings, type GroundId, type MaterialId } from '../../../kit/glass3d/presets'
import { collapse, fade, pressCard, reveal, sequence, spring, stagger } from '../../../lib/motion'
import { useToast } from '../../../lib/toast'
import { Button } from '../../ui/Button'
import { iconButtonClass } from '../../ui/button-styles'
import { EmptyState } from '../../ui/EmptyState'
import { ReloadButton } from '../../ui/ReloadButton'
import { DISPLAY_FAMILY, SHAPES } from './shapes'
import { ControlGroup, Segmented, Slider } from './StudioControls'

type Status = { text: string; tone: 'ok' | 'error' } | null
type SliderKey = (typeof SLIDERS)[number]['key']

const EXPORT_SIZES = [
  { id: '1080', label: '1080 px' },
  { id: '2160', label: '2160 px' },
] as const
type ExportSize = (typeof EXPORT_SIZES)[number]['id']

const MAX_UPLOAD = 4 * 1024 * 1024

/**
 * Glass icon studio: any brand shape (the ONE mark, the Phosphor ad icons, Unbounded letters, or an uploaded SVG or
 * transparent PNG) raymarched as thick refractive glass over a brand ground, in the brand materials, exported as PNG.
 */
export function GlassStudio() {
  const reduced = useReducedMotion() ?? false
  const { notify } = useToast()
  const ids = useId()
  const fileRef = useRef<HTMLInputElement>(null)
  const renderer = useRef<GlassRenderer | null>(null)
  const shapes = useRef<ShapeCanvas | null>(null)
  const shapeJob = useRef(0)

  const [ready, setReady] = useState(false)
  const [fatal, setFatal] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<Status>(null)

  const [shapeId, setShapeId] = useState<string | null>('one-mark')
  const [shapeName, setShapeName] = useState('one-mark')
  const [letters, setLetters] = useState('')
  const [pasteOpen, setPasteOpen] = useState(false)
  const [svgText, setSvgText] = useState('')

  const [materialId, setMaterialId] = useState<MaterialId | null>('mint')
  const [settings, setSettings] = useState<GlassSettings>(DEFAULT_SETTINGS)
  const [groundId, setGroundId] = useState<GroundId>('navy')
  const [words, setWords] = useState('One agency. Every channel.')

  const [exportSize, setExportSize] = useState<ExportSize>('1080')
  const [transparent, setTransparent] = useState(false)
  const [exporting, setExporting] = useState(false)

  /* ------------------------------------------------------------ renderer lifecycle */

  const [rendererKey, setRendererKey] = useState(0)
  const [fontsReady, setFontsReady] = useState(false)

  /**
   * The canvas's ref callback owns the renderer: created when the canvas mounts (and again if reduced motion flips),
   * disposed with it. The stage (its parent) drives the size and pauses rendering while off screen.
   */
  const attachCanvas = useCallback(
    (canvas: HTMLCanvasElement | null) => {
      const stage = canvas?.parentElement
      if (!canvas || !stage) return
      let r: GlassRenderer
      try {
        r = new GlassRenderer(canvas, reduced)
      } catch (e) {
        setFatal(e instanceof GlassError ? e.message : 'The glass renderer couldn’t start in this browser.')
        return
      }
      const c = new ShapeCanvas()
      renderer.current = r
      shapes.current = c
      const ro = new ResizeObserver(([entry]) => r.resize(entry.contentRect.width, entry.contentRect.height))
      ro.observe(stage)
      const io = new IntersectionObserver(([entry]) => r.setVisible(entry.isIntersecting))
      io.observe(stage)
      setRendererKey((k) => k + 1)
      return () => {
        ro.disconnect()
        io.disconnect()
        r.dispose()
        c.dispose()
        if (renderer.current === r) renderer.current = null
        if (shapes.current === c) shapes.current = null
      }
    },
    [reduced],
  )

  useEffect(() => {
    const run = { live: true }
    const load = document.fonts?.load ? document.fonts.load(`600 100px ${DISPLAY_FAMILY}`) : Promise.resolve([])
    load.catch(() => []).then(() => run.live && setFontsReady(true))
    return () => {
      run.live = false
    }
  }, [])

  /** Draws a shape, builds its distance field off the input frame, and hands it to the renderer. */
  const applyShape = useCallback(async (draw: (c: ShapeCanvas) => Promise<string | null> | string | null, okText?: string) => {
    const c = shapes.current
    const r = renderer.current
    if (!c || !r) return false
    const job = ++shapeJob.current
    setBusy(true)
    try {
      const err = await draw(c)
      if (err) {
        setStatus({ text: err, tone: 'error' })
        return false
      }
      // Yield a frame so the busy state paints before the distance transform runs.
      await new Promise((res) => setTimeout(res, 16))
      if (job !== shapeJob.current) return false
      const field = c.field()
      if (!field) {
        setStatus({ text: 'That shape came out empty. Use one with at least one filled area.', tone: 'error' })
        return false
      }
      r.setField(field)
      setStatus(okText ? { text: okText, tone: 'ok' } : null)
      return true
    } catch {
      setStatus({ text: 'That shape couldn’t be read. Try another file or path.', tone: 'error' })
      return false
    } finally {
      if (job === shapeJob.current) setBusy(false)
    }
  }, [])

  // Each new renderer opens on the ONE mark.
  useEffect(() => {
    if (!rendererKey) return
    const run = { live: true }
    applyShape((c) => (c.drawPath(ONE_MARK_PATH, { evenOdd: true }) ? null : 'The ONE mark couldn’t be drawn.')).then((ok) => {
      if (!run.live) return
      setReady(true)
      if (ok) {
        setShapeId('one-mark')
        setShapeName('one-mark')
      }
    })
    return () => {
      run.live = false
    }
  }, [rendererKey, applyShape])

  // The words wait for the display face, so the first frame isn't set in a fallback.
  useEffect(() => {
    if (!rendererKey || !fontsReady) return
    renderer.current?.setBackdrop({ ground: GROUNDS.find((g) => g.id === groundId)!, words, family: DISPLAY_FAMILY })
  }, [rendererKey, fontsReady, groundId, words])

  useEffect(() => {
    if (rendererKey) renderer.current?.setSettings(settings)
  }, [rendererKey, settings])

  // Letters: rebuild a beat after typing stops.
  useEffect(() => {
    const text = letters.trim()
    if (!ready || !text) return
    const t = setTimeout(() => {
      applyShape((c) => {
        c.drawGlyph(text, DISPLAY_FAMILY)
        return null
      }).then((ok) => {
        if (ok) {
          setShapeId(null)
          setShapeName(`letters-${text.toLowerCase().replace(/[^a-z0-9]+/g, '') || 'glyph'}`)
        }
      })
    }, 250)
    return () => clearTimeout(t)
  }, [letters, ready, applyShape])

  /* ------------------------------------------------------------ actions */

  const pickShape = async (id: string) => {
    const shape = SHAPES.find((s) => s.id === id)
    if (!shape) return
    setShapeId(id)
    if (await applyShape(shape.draw)) {
      setShapeName(id)
      setLetters('')
    }
  }

  const pickMaterial = (id: MaterialId) => {
    const m = MATERIALS.find((x) => x.id === id)!
    setMaterialId(id)
    setSettings((s) => ({ ...s, tint: m.tint, lo: m.lo, hi: m.hi, ...(m.tint > 0 ? { top: hex(m.top), middle: hex(m.middle) } : {}) }))
  }

  const setSlider = (key: SliderKey, v: number) => {
    setSettings((s) => ({ ...s, [key]: v }))
    if (key === 'tint' && v === 0) setMaterialId('clear')
  }

  const applySvgText = async (raw: string, name: string) => {
    const v = raw.trim()
    if (!v) return setStatus({ text: 'Paste SVG code first.', tone: 'error' })
    if (/^https?:\/\//i.test(v)) return setStatus({ text: 'Links can’t be opened from here. Download the SVG, then use Upload.', tone: 'error' })
    const ok =
      v.indexOf('<') === -1
        ? await applyShape((c) => (c.drawPath(v, { soften: false }) ? null : 'That path couldn’t be read. Check it’s a complete d value, starting with M.'), `Turned ${name} into glass.`)
        : await applyShape((c) => c.drawMarkup(v.match(/<svg[\s\S]*<\/svg>/i)?.[0] ?? v), `Turned ${name} into glass.`)
    if (ok) {
      setShapeId(null)
      setShapeName('custom')
      setLetters('')
    }
  }

  const applyFile = (file: File | undefined) => {
    if (!file) return
    const isSvg = /svg/i.test(file.type) || /\.svg$/i.test(file.name)
    const isPng = /png/i.test(file.type) || /\.png$/i.test(file.name)
    if (!isSvg && !isPng) return setStatus({ text: 'Upload an SVG, or a PNG with a transparent background.', tone: 'error' })
    if (file.size > MAX_UPLOAD) return setStatus({ text: 'That file is over 4 MB. Upload a smaller one.', tone: 'error' })
    const reader = new FileReader()
    reader.onerror = () => setStatus({ text: 'That file couldn’t be read. Try uploading it again.', tone: 'error' })
    if (isSvg) {
      reader.onload = () => applySvgText(String(reader.result), file.name)
      reader.readAsText(file)
      return
    }
    reader.onload = () => {
      const img = new Image()
      img.onload = async () => {
        if (await applyShape((c) => c.drawPng(img), `Turned ${file.name} into glass.`)) {
          setShapeId(null)
          setShapeName('custom')
          setLetters('')
        }
      }
      img.onerror = () => setStatus({ text: 'That image couldn’t be opened. Try a different file.', tone: 'error' })
      img.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    applyFile(e.dataTransfer.files?.[0])
  }

  const download = async () => {
    const r = renderer.current
    if (!r || exporting) return
    setExporting(true)
    try {
      const size = Number(exportSize)
      const blob = await r.exportPng(size, transparent)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `one-agency_glass-${shapeName}_${materialId ?? 'custom'}${transparent ? '_transparent' : `_${groundId}`}_${size}.png`
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      notify(`Downloaded the ${size} px PNG`)
    } catch {
      notify('The PNG couldn’t be exported. Try the smaller size.', 'error')
    } finally {
      setExporting(false)
    }
  }

  /* ------------------------------------------------------------ view */

  if (fatal) {
    return (
      <EmptyState icon={WarningCircle} title="The glass studio can’t run here" tone="error" action={<ReloadButton />}>
        {fatal} Try a current Chrome, Edge, Safari or Firefox. The finished glass files are still under Illustrations and textures below.
      </EmptyState>
    )
  }

  return (
    <div className="grid overflow-hidden rounded-site border border-edge bg-surface lg:grid-cols-[minmax(0,1fr)_22rem]">
      {/* Stage */}
      <div className="relative aspect-square min-h-0 lg:aspect-auto lg:min-h-[38rem]" onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>
        <canvas
          ref={attachCanvas}
          tabIndex={0}
          aria-label="Glass icon preview. Drag, or focus it and use the arrow keys, to turn the icon. Home resets the view."
          className="absolute inset-0 size-full cursor-grab touch-none outline-none focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-accent data-[dragging=true]:cursor-grabbing"
        />
        <AnimatePresence>
          {!ready && (
            <motion.div key="skeleton" variants={fade} initial="show" exit="exit" aria-hidden className="absolute inset-0 grid place-items-center bg-ground">
              <div className="size-2/5 animate-pulse rounded-site-lg bg-surface-2/60" />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
          <AnimatePresence>
            {busy && ready && (
              <motion.span
                key="busy"
                variants={fade}
                initial="hidden"
                animate="show"
                exit="exit"
                className="rounded-full bg-surface/80 px-3 py-1.5 text-step-small font-semibold text-text backdrop-blur"
              >
                Shaping glass…
              </motion.span>
            )}
          </AnimatePresence>
          <motion.button
            type="button"
            onClick={() => renderer.current?.resetView()}
            aria-label="Reset the view"
            title="Reset the view"
            className={iconButtonClass('quiet', 'pointer-events-auto ml-auto bg-surface/80 backdrop-blur')}
            {...pressCard}
          >
            <ArrowCounterClockwise aria-hidden />
          </motion.button>
        </div>
        <p className="pointer-events-none absolute inset-x-0 bottom-0 p-4 text-center text-step-small text-text-3 max-lg:hidden">
          Drag to turn it. Drop an SVG or transparent PNG anywhere here.
        </p>
      </div>

      {/* Controls */}
      <motion.div
        variants={sequence(stagger.children)}
        initial="hidden"
        animate="show"
        className="flex max-h-none flex-col gap-8 border-t border-edge p-5 sm:p-6 lg:max-h-[38rem] lg:overflow-y-auto lg:border-t-0 lg:border-l"
      >
        <ControlGroup title="Shape">
          <ul className="grid grid-cols-4 gap-2" aria-label="Brand shapes">
            {SHAPES.map((s) => {
              const active = shapeId === s.id
              const IconComponent = s.icon
              return (
                <li key={s.id}>
                  <motion.button
                    type="button"
                    aria-pressed={active}
                    aria-label={s.label}
                    title={s.label}
                    disabled={busy}
                    onClick={() => pickShape(s.id)}
                    className={`relative grid aspect-square w-full min-h-touch place-items-center rounded-site-sm border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-wait ${
                      active ? 'border-transparent text-on-fill' : 'border-edge bg-surface-2/40 text-text hover:border-accent hover:text-accent'
                    }`}
                    {...(busy ? {} : pressCard)}
                  >
                    {active && <motion.span layoutId={`${ids}-shape`} className="absolute inset-0 rounded-site-sm bg-fill" transition={spring.layout} aria-hidden />}
                    {IconComponent === 'mark' ? (
                      <svg viewBox="0 0 492 330" className="relative w-6" aria-hidden>
                        <path d={ONE_MARK_PATH} fill="currentColor" fillRule="evenodd" />
                      </svg>
                    ) : (
                      <IconComponent weight="fill" className="relative size-6" aria-hidden />
                    )}
                  </motion.button>
                </li>
              )
            })}
          </ul>
          <div className="grid grid-cols-[6.5rem_1fr] items-center gap-3">
            <label htmlFor={`${ids}-letters`} className="text-step-small text-text-2">
              Letters
            </label>
            <input
              id={`${ids}-letters`}
              type="text"
              maxLength={4}
              value={letters}
              onChange={(e) => setLetters(e.target.value)}
              placeholder="Up to 4, e.g. 1A"
              className="h-touch w-full rounded-site-sm border border-edge bg-surface-2/40 px-3 text-step--1 text-text placeholder:text-text-3 focus-visible:border-accent focus-visible:outline-none"
            />
          </div>
          <input ref={fileRef} type="file" accept=".svg,image/svg+xml,image/png" hidden onChange={(e) => (applyFile(e.target.files?.[0]), (e.target.value = ''))} />
          <div className="flex flex-wrap gap-2">
            <Button variant="quiet" size="sm" onClick={() => fileRef.current?.click()} disabled={busy}>
              <UploadSimple aria-hidden />
              Upload SVG or PNG
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setPasteOpen((o) => !o)} aria-expanded={pasteOpen} aria-controls={`${ids}-paste`}>
              Paste SVG
              <motion.span animate={{ rotate: pasteOpen ? 180 : 0 }} transition={spring.snappy} className="inline-flex">
                <CaretDown aria-hidden />
              </motion.span>
            </Button>
          </div>
          <AnimatePresence initial={false}>
            {pasteOpen && (
              <motion.div key="paste" id={`${ids}-paste`} variants={collapse} initial="hidden" animate="show" exit="exit" className="overflow-hidden">
                <div className="flex flex-col gap-2 pt-1">
                  <label htmlFor={`${ids}-svg`} className="text-step-small text-text-2">
                    SVG markup or a path’s d value
                  </label>
                  <textarea
                    id={`${ids}-svg`}
                    spellCheck={false}
                    value={svgText}
                    onChange={(e) => setSvgText(e.target.value)}
                    rows={4}
                    className="w-full resize-y rounded-site-sm border border-edge bg-surface-2/40 px-3 py-2 font-code text-step-small text-text focus-visible:border-accent focus-visible:outline-none"
                  />
                  <Button size="sm" onClick={() => applySvgText(svgText, 'your SVG')} disabled={busy || !svgText.trim()}>
                    Turn into glass
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <p role="status" className={`min-h-[1.4em] text-step-small ${status?.tone === 'error' ? 'text-dont' : 'text-text-3'}`}>
            {status?.text}
          </p>
        </ControlGroup>

        <ControlGroup title="Glass">
          <Segmented label="Material" layoutId={`${ids}-material`} options={MATERIALS} value={materialId} onChange={pickMaterial} />
          <div className="flex flex-col">
            {SLIDERS.map((s) => (
              <Slider key={s.key} id={`${ids}-${s.key}`} label={s.label} min={s.min} max={s.max} step={s.step} value={settings[s.key]} onChange={(v) => setSlider(s.key, v)} />
            ))}
          </div>
        </ControlGroup>

        <ControlGroup title="Ground">
          <Segmented label="Ground colour" layoutId={`${ids}-ground`} options={GROUNDS} value={groundId} onChange={setGroundId} />
          <div className="grid grid-cols-[6.5rem_1fr] items-center gap-3">
            <label htmlFor={`${ids}-words`} className="text-step-small text-text-2">
              Words behind
            </label>
            <input
              id={`${ids}-words`}
              type="text"
              maxLength={40}
              value={words}
              onChange={(e) => setWords(e.target.value)}
              className="h-touch w-full rounded-site-sm border border-edge bg-surface-2/40 px-3 text-step--1 text-text focus-visible:border-accent focus-visible:outline-none"
            />
          </div>
        </ControlGroup>

        <ControlGroup title="Export">
          <Segmented label="PNG size" layoutId={`${ids}-size`} options={[...EXPORT_SIZES]} value={exportSize} onChange={setExportSize} />
          <label className="flex min-h-touch cursor-pointer items-center gap-3 text-step-small text-text-2">
            <input type="checkbox" checked={transparent} onChange={(e) => setTransparent(e.target.checked)} className="size-5 accent-(--ui-accent)" />
            Transparent background (glass and shadow only)
          </label>
          <motion.div variants={reveal}>
            <Button onClick={download} disabled={!ready || busy || exporting} className="w-full">
              <DownloadSimple aria-hidden />
              {exporting ? 'Exporting…' : 'Download PNG'}
            </Button>
          </motion.div>
        </ControlGroup>
      </motion.div>
    </div>
  )
}
