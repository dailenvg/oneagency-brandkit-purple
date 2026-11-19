/**
 * Dimensions (and duration for video/GIF) read from file headers, so the asset list never relies on hand-typed sizes.
 * Video uses ffprobe when it is installed and falls back to the [WxH] in the file name.
 */
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'

const FFPROBE = ['/opt/homebrew/bin/ffprobe', '/usr/local/bin/ffprobe', '/usr/bin/ffprobe'].find(existsSync)

function png(buf) {
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
}

function jpg(buf) {
  let i = 2
  while (i < buf.length) {
    if (buf[i] !== 0xff) return null
    const marker = buf[i + 1]
    const length = buf.readUInt16BE(i + 2)
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) }
    }
    i += 2 + length
  }
  return null
}

function webp(buf) {
  const chunk = buf.toString('ascii', 12, 16)
  if (chunk === 'VP8X') return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) }
  if (chunk === 'VP8 ') return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff }
  if (chunk === 'VP8L') {
    const bits = buf.readUInt32LE(21)
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 }
  }
  return null
}

function gif(buf) {
  return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) }
}

function svg(buf) {
  const head = buf.toString('utf8', 0, 2000)
  const tag = head.match(/<svg[^>]*>/)?.[0] ?? ''
  const attr = (name) => Number.parseFloat(tag.match(new RegExp(`\\s${name}="([\\d.]+)(px)?"`))?.[1] ?? 'NaN')
  let width = attr('width')
  let height = attr('height')
  if (!(width && height)) {
    const box = tag.match(/viewBox="[\d.-]+[ ,]+[\d.-]+[ ,]+([\d.]+)[ ,]+([\d.]+)"/)
    if (box) [width, height] = [Number(box[1]), Number(box[2])]
  }
  return width && height ? { width: Math.round(width), height: Math.round(height) } : null
}

function probe(path) {
  if (!FFPROBE) return null
  try {
    const out = execFileSync(FFPROBE, ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height:format=duration', '-of', 'json', path], { encoding: 'utf8' })
    const json = JSON.parse(out)
    const s = json.streams?.[0]
    const duration = Number.parseFloat(json.format?.duration)
    return s ? { width: s.width, height: s.height, duration: Number.isFinite(duration) ? Math.round(duration * 10) / 10 : null } : null
  } catch {
    return null
  }
}

const fromName = (path) => {
  const m = path.match(/_(\d+)x(\d+)(?:_|\.)/)
  return m ? { width: Number(m[1]), height: Number(m[2]) } : null
}

/**
 * @param {string} path  absolute path
 * @param {Buffer} buf   file contents
 * @returns {{ width: number|null, height: number|null, duration: number|null }}
 */
export function mediaInfo(path, buf) {
  const ext = path.slice(path.lastIndexOf('.') + 1).toLowerCase()
  let info = null
  try {
    if (ext === 'png') info = png(buf)
    else if (ext === 'jpg' || ext === 'jpeg') info = jpg(buf)
    else if (ext === 'webp') info = webp(buf)
    else if (ext === 'svg') info = svg(buf)
    else if (ext === 'gif') info = { ...gif(buf), duration: probe(path)?.duration ?? null }
    else if (ext === 'mp4' || ext === 'webm') info = probe(path) ?? fromName(path)
  } catch {
    info = null
  }
  return { width: info?.width ?? null, height: info?.height ?? null, duration: info?.duration ?? null }
}
