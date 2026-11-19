/**
 * The live site's selection guard (neon.js): the light filter and Add blend would also light up the selection
 * highlight, turning it into a glowing white block. While any text is selected, html.oa-selecting switches lit words and
 * figures back to plain gradient text (index.css); the light returns when the selection clears.
 */
export function installSelectionGuard() {
  const root = document.documentElement
  let on = false
  document.addEventListener('selectionchange', () => {
    const sel = document.getSelection()
    const selecting = !!sel && !sel.isCollapsed && sel.toString().length > 0
    if (selecting !== on) {
      on = selecting
      root.classList.toggle('oa-selecting', on)
    }
  })
}
