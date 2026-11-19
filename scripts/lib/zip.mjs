/**
 * Minimal ZIP writer (PKZIP 2.0, no ZIP64): deflates text-like files and stores already-compressed ones. Entries get a
 * fixed timestamp so the same inputs always produce the same bytes. No dependency beyond node:zlib.
 */
import { crc32, deflateRawSync } from 'node:zlib'

/** Formats that are already compressed: deflating them again only costs time. */
const STORED = /\.(png|jpe?g|webp|gif|mp4|webm|woff2?|zip)$/i

/** 2026-11-18 00:00, the kit's release date, in MS-DOS date/time format. */
const DOS_DATE = ((2026 - 1980) << 9) | (11 << 5) | 18
const DOS_TIME = 0

/**
 * @param {{ name: string, data: Buffer }[]} files  name is the path inside the archive, with forward slashes
 * @returns {Buffer}
 */
export function zipFiles(files) {
  const locals = []
  const centrals = []
  let offset = 0

  for (const { name, data } of files) {
    const nameBytes = Buffer.from(name, 'utf8')
    const store = STORED.test(name)
    const body = store ? data : deflateRawSync(data, { level: 9 })
    const crc = crc32(data) >>> 0

    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4)
    local.writeUInt16LE(0x0800, 6) // UTF-8 names
    local.writeUInt16LE(store ? 0 : 8, 8)
    local.writeUInt16LE(DOS_TIME, 10)
    local.writeUInt16LE(DOS_DATE, 12)
    local.writeUInt32LE(crc, 14)
    local.writeUInt32LE(body.length, 18)
    local.writeUInt32LE(data.length, 22)
    local.writeUInt16LE(nameBytes.length, 26)
    local.writeUInt16LE(0, 28)

    const central = Buffer.alloc(46)
    central.writeUInt32LE(0x02014b50, 0)
    central.writeUInt16LE(20, 4)
    central.writeUInt16LE(20, 6)
    central.writeUInt16LE(0x0800, 8)
    central.writeUInt16LE(store ? 0 : 8, 10)
    central.writeUInt16LE(DOS_TIME, 12)
    central.writeUInt16LE(DOS_DATE, 14)
    central.writeUInt32LE(crc, 16)
    central.writeUInt32LE(body.length, 20)
    central.writeUInt32LE(data.length, 24)
    central.writeUInt16LE(nameBytes.length, 28)
    central.writeUInt32LE(offset, 42)

    locals.push(local, nameBytes, body)
    centrals.push(central, nameBytes)
    offset += local.length + nameBytes.length + body.length
  }

  const directory = Buffer.concat(centrals)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(files.length, 8)
  end.writeUInt16LE(files.length, 10)
  end.writeUInt32LE(directory.length, 12)
  end.writeUInt32LE(offset, 16)
  return Buffer.concat([...locals, directory, end])
}
