/**
 * Motion hooks for the hub. A graphic tags its parts with one of these roles; the hub's GraphicMotion plays them in this
 * order (structure, then strokes drawing, then areas, nodes and the focal point last). Exports strip the attribute and
 * stay static.
 */
export const ANIM_ROLES = ['structure', 'draw', 'area', 'node', 'focal'] as const

export type AnimRole = (typeof ANIM_ROLES)[number]

export const anim = (role: AnimRole) => ({ 'data-anim': role })
