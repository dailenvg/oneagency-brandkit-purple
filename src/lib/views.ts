import {
  CubeTransparent,
  FilmStrip,
  FolderOpen,
  Image,
  Layout,
  Megaphone,
  Palette,
  Quotes,
  Shapes,
  Signature,
  SquaresFour,
  TextAa,
  type Icon,
} from '@phosphor-icons/react'

/** The hub's views in nav order: hash routes (#/logo), sidebar labels, eyebrow numbers and document titles. */
export const VIEWS = [
  { id: 'overview', label: 'Overview', title: 'Overview', icon: SquaresFour },
  { id: 'logo', label: 'Logo', title: 'Logo', icon: Signature },
  { id: 'colour', label: 'Colour', title: 'Colour', icon: Palette },
  { id: 'type', label: 'Type', title: 'Typography', icon: TextAa },
  { id: 'elements', label: 'Elements', title: 'Graphic elements', icon: Shapes },
  { id: 'glass', label: 'Glass & texture', title: 'Glass and texture', icon: CubeTransparent },
  { id: 'motion', label: 'Motion', title: 'Motion', icon: FilmStrip },
  { id: 'imagery', label: 'Imagery', title: 'Imagery', icon: Image },
  { id: 'voice', label: 'Voice', title: 'Voice', icon: Megaphone },
  { id: 'copy', label: 'Copy', title: 'Copy bank', icon: Quotes },
  { id: 'ads', label: 'Ads', title: 'Ads', icon: Layout },
  { id: 'assets', label: 'Assets', title: 'Assets', icon: FolderOpen },
] as const satisfies readonly { id: string; label: string; title: string; icon: Icon }[]

export type ViewId = (typeof VIEWS)[number]['id']
export type ViewDef = (typeof VIEWS)[number]

export const NAV_GROUPS: { label: string | null; views: ViewId[] }[] = [
  { label: null, views: ['overview'] },
  { label: 'Identity', views: ['logo', 'colour', 'type'] },
  { label: 'System', views: ['elements', 'glass', 'motion'] },
  { label: 'Content', views: ['imagery', 'voice', 'copy'] },
  { label: 'Production', views: ['ads', 'assets'] },
]

/** A view's subsection: a sidebar dropdown item and a deep link, #/logo/clear-space. */
export interface Subsection {
  /** URL segment, the slug of the subsection's SubHeading title (its h2 carries the id `sub-[view]-[id]`). */
  id: string
  /** Sidebar label; shorter than the heading where the heading is long. */
  label: string
  /** The view's opening block, which has no SubHeading: the link goes to the top of the view. */
  top?: true
}

/** "Do and don't" → "do-and-dont", "Möbius loop" → "mobius-loop". SubHeading ids and the lists below both use it. */
export const slug = (title: string) =>
  title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/** A subsection whose SubHeading is `title`; `label` shortens it in the sidebar. */
const sub = (title: string, label = title): Subsection => ({ id: slug(title), label })
/** The view's opening block, before its first SubHeading. */
const top = (label: string): Subsection => ({ id: slug(label), label, top: true })

/**
 * Sidebar dropdowns, in page order. Titles must match the views' SubHeading titles (the id is their slug). Overview,
 * Copy and Assets have no headed subsections (a dashboard and two filterable lists), so they stay plain links.
 */
export const SUBSECTIONS: Partial<Record<ViewId, Subsection[]>> = {
  logo: [top('Composition'), sub('Clear space'), sub('Minimum size'), sub('Misuse'), sub('Favicon and social avatar')],
  colour: [
    top('Palette'),
    sub('Tints and shades'),
    sub('Text on ground: approved pairs', 'Contrast pairs'),
    sub('Accent rules for ads', 'Accent rules'),
    sub('Light theme for this hub', 'Light theme'),
  ],
  type: [top('Typefaces'), sub('Type scale'), sub('Ad text styles'), sub('Highlight band')],
  elements: [
    sub('Signature devices'),
    sub('Möbius loop'),
    sub('Patterns'),
    sub('Illustrations'),
    sub('CTA buttons'),
    sub('Proof bar'),
    sub('Award badge'),
    sub('Icons'),
  ],
  glass: [
    top('Scene'),
    sub('Components'),
    sub('Anatomy of a glass card', 'Anatomy'),
    sub('Depth stack'),
    sub('Glass or flat'),
    sub("Do and don't"),
    sub('Source of the style'),
    sub('Illustrations and textures'),
  ],
  motion: [top('Principles'), sub('The moves')],
  imagery: [top('Direction'), sub('Starter library')],
  voice: [sub('Four pillars'), sub('Voice traits'), sub('Words we never use'), sub('Headline patterns')],
  ads: [top('Featured'), sub('Creative ads'), sub('Reference ads'), sub('Templates and samples', 'Templates'), sub('Animated ads')],
}

export const subsectionsFor = (view: ViewId): Subsection[] => SUBSECTIONS[view] ?? []

export const findSubsection = (view: ViewId, id: string) => subsectionsFor(view).find((s) => s.id === id)

export const subHref = (view: ViewId, id: string) => `#/${view}/${id}`

/** DOM id of a subsection's h2. Prefixed so it never meets another id on the page. */
export const subAnchorId = (view: ViewId, id: string) => `sub-${view}-${id}`

export const DEFAULT_VIEW: ViewId = 'overview'

export const isViewId = (value: string): value is ViewId => VIEWS.some((v) => v.id === value)

export const viewFor = (id: ViewId): ViewDef => VIEWS.find((v) => v.id === id)!

export const viewHref = (id: ViewId) => `#/${id}`

/** Two-digit number shown in a view's eyebrow ("01 · Logo"); Overview is 00. */
export const viewIndex = (id: ViewId) => String(VIEWS.findIndex((v) => v.id === id)).padStart(2, '0')

export const SITE_TITLE = 'ONE Agency · Brand Kit'

export const documentTitle = (title: string) => `${title} · ${SITE_TITLE}`
