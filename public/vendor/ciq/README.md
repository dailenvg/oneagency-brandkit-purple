# ConversionIQ key visual, live

The conversion loop as a web component: one script, no dependencies, about 100 KB.

## Use it

1. Put `ciq-loop.js` with your site's files.
2. Load it once, and place the element where the loop goes, sized with CSS:

```html
<script src="/ciq-loop.js"></script>
<ciq-loop look="mesh" shape="mobius" theme="dark" style="display:block; height: 600px"></ciq-loop>
```

To fill a page as the Brand tool composes it (the loop right of centre, room for a headline on the left), give the element the page's full size and `place="right"`.

## Settings (attributes)

| Attribute | Values | |
|---|---|---|
| `look` | `mesh`, `strings`, `energy`, `flight` | The loop's look |
| `shape` | `mobius`, `trefoil`, `ring`, `teardrop` | Its form (Flight always flies along the Möbius) |
| `theme` | `dark`, `light` | Leave it out to follow the visitor's light or dark setting |
| `background` | `none` | Leave it out for the brand's ground: the night with the lilac glow on dark, white on light |
| `place` | `center`, `right` | Where the loop sits across the element; `right` as in the brand's hero, with room for a headline on the left |
| `paused` | (present) | Holds a frame. In script: `el.pause()`, `el.play()` |

Attributes can change at any time; the loop crossfades between looks.

## Good to know

- It draws with WebGL (a 2D canvas where WebGL isn't available), stops drawing while off screen, and holds still for visitors who ask for reduced motion.
- Several on one page each run their own; keep it to one or two.
- For a still image, export a PNG from the Brand tool's Key visual page instead.
