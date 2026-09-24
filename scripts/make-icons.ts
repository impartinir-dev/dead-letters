/**
 * Generates PWA PNG icons with a hand-rolled PNG encoder (no native deps).
 * Icon: walnut-dark rounded square, cream page, oxblood magnifier over a "?"
 */
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'icons')
mkdirSync(outDir, { recursive: true })

/* ------------------------------- PNG encode ------------------------------ */

function crc32(buf: Buffer): number {
  let table = crc32.table
  if (!table) {
    table = crc32.table = new Uint32Array(256)
    for (let n = 0; n < 256; n++) {
      let c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      table[n] = c >>> 0
    }
  }
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}
crc32.table = null as unknown as Uint32Array

function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function encodePNG(px: Uint8Array, size: number): Buffer {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // RGBA
  const raw = Buffer.alloc(size * (size * 4 + 1))
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0 // filter: none
    Buffer.from(px.buffer, y * size * 4, size * 4).copy(raw, y * (size * 4 + 1) + 1)
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

/* ------------------------------- tiny canvas ----------------------------- */

type RGB = [number, number, number]

class Img {
  px: Uint8Array
  constructor(public size: number) {
    this.px = new Uint8Array(size * size * 4)
  }
  set(x: number, y: number, [r, g, b]: RGB, a = 255) {
    if (x < 0 || y < 0 || x >= this.size || y >= this.size) return
    const i = (y * this.size + x) * 4
    this.px[i] = r
    this.px[i + 1] = g
    this.px[i + 2] = b
    this.px[i + 3] = a
  }
  fill([r, g, b]: RGB) {
    for (let i = 0; i < this.px.length; i += 4) {
      this.px[i] = r
      this.px[i + 1] = g
      this.px[i + 2] = b
      this.px[i + 3] = 255
    }
  }
  rect(x0: number, y0: number, w: number, h: number, c: RGB) {
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) this.set(x, y, c)
  }
  circle(cx: number, cy: number, rad: number, c: RGB, hollow = 0) {
    const r2 = rad * rad
    const i2 = (rad - hollow) * (rad - hollow)
    for (let y = cy - rad; y <= cy + rad; y++)
      for (let x = cx - rad; x <= cx + rad; x++) {
        const d = (x - cx) ** 2 + (y - cy) ** 2
        if (d <= r2 && (!hollow || d >= i2)) this.set(x, y, c)
      }
  }
  line(x0: number, y0: number, x1: number, y1: number, w: number, c: RGB) {
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const x = Math.round(x0 + (x1 - x0) * t)
      const y = Math.round(y0 + (y1 - y0) * t)
      this.circle(x, y, Math.floor(w / 2), c)
    }
  }
}

/* --------------------------------- icon ---------------------------------- */

const INK: RGB = [43, 33, 24]
const PAPER: RGB = [243, 234, 215]
const RED: RGB = [122, 31, 31]

function drawIcon(size: number, maskable: boolean): Buffer {
  const img = new Img(size)
  img.fill(INK)
  const u = size / 64 // unit scale (icon designed on a 64-grid)
  const m = maskable ? 8 : 0 // maskable: shrink art into safe zone

  // cream page
  const px0 = Math.round((12 + m) * u)
  const px1 = Math.round((52 - m) * u)
  img.rect(px0, Math.round((8 + m) * u), px1 - px0, Math.round((48 - m) * u), PAPER)

  // page "text" lines
  const lineY = [14, 18, 22].map((v) => Math.round((v + m) * u))
  for (const y of lineY)
    img.rect(Math.round((16 + m) * u), y, Math.round((32 - 2 * m) * u), Math.max(1, Math.round(u)), INK)

  // magnifier: red ring + handle over the page, bottom-right
  const cx = Math.round((36 - m / 2) * u)
  const cy = Math.round((38 - m / 2) * u)
  const rad = Math.round(11 * u)
  img.circle(cx, cy, rad, RED, Math.round(3.2 * u))
  img.line(cx + Math.round(rad * 0.72), cy + Math.round(rad * 0.72), cx + Math.round(rad * 1.7), cy + Math.round(rad * 1.7), Math.round(4.5 * u), RED)

  // question mark: dot + arc-ish blob inside the lens
  img.circle(cx, cy - Math.round(2.5 * u), Math.round(2.6 * u), RED)
  img.circle(cx, cy + Math.round(3.5 * u), Math.round(1.8 * u), RED)

  return encodePNG(img.px, size)
}

writeFileSync(join(outDir, 'icon-192.png'), drawIcon(192, false))
writeFileSync(join(outDir, 'icon-512.png'), drawIcon(512, false))
writeFileSync(join(outDir, 'maskable-512.png'), drawIcon(512, true))
writeFileSync(join(outDir, 'apple-touch-icon.png'), drawIcon(180, false))
console.log('icons written → public/icons/')
