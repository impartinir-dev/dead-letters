/**
 * Hand-rolled RGBA PNG encoder + a tiny raster canvas (no native deps).
 * Shared by make-icons.ts and make-share-image.ts.
 */
import { deflateSync } from 'node:zlib'

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

export function encodePNG(px: Uint8Array, w: number, h = w): Buffer {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0)
  ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // RGBA
  const raw = Buffer.alloc(h * (w * 4 + 1))
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0 // filter: none
    Buffer.from(px.buffer, y * w * 4, w * 4).copy(raw, y * (w * 4 + 1) + 1)
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

export type RGB = [number, number, number]

export class Img {
  px: Uint8Array
  readonly w: number
  readonly h: number
  constructor(w: number, h = w) {
    this.w = w
    this.h = h
    this.px = new Uint8Array(w * h * 4)
  }
  /** square images keep the old `size` name */
  get size(): number {
    return this.w
  }
  set(x: number, y: number, [r, g, b]: RGB, a = 255) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return
    const i = (y * this.w + x) * 4
    if (a >= 255) {
      this.px[i] = r
      this.px[i + 1] = g
      this.px[i + 2] = b
    } else {
      const t = a / 255
      this.px[i] = Math.round(this.px[i] * (1 - t) + r * t)
      this.px[i + 1] = Math.round(this.px[i + 1] * (1 - t) + g * t)
      this.px[i + 2] = Math.round(this.px[i + 2] * (1 - t) + b * t)
    }
    this.px[i + 3] = 255
  }
  fill([r, g, b]: RGB) {
    for (let i = 0; i < this.px.length; i += 4) {
      this.px[i] = r
      this.px[i + 1] = g
      this.px[i + 2] = b
      this.px[i + 3] = 255
    }
  }
  rect(x0: number, y0: number, w: number, h: number, c: RGB, a = 255) {
    for (let y = Math.round(y0); y < Math.round(y0 + h); y++)
      for (let x = Math.round(x0); x < Math.round(x0 + w); x++) this.set(x, y, c, a)
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
  /** Box-filter downsample by an integer factor (supersampled anti-aliasing). */
  downsample(f: number): Img {
    const out = new Img(Math.floor(this.w / f), Math.floor(this.h / f))
    for (let y = 0; y < out.h; y++)
      for (let x = 0; x < out.w; x++) {
        let r = 0, g = 0, b = 0
        for (let dy = 0; dy < f; dy++)
          for (let dx = 0; dx < f; dx++) {
            const i = ((y * f + dy) * this.w + (x * f + dx)) * 4
            r += this.px[i]
            g += this.px[i + 1]
            b += this.px[i + 2]
          }
        const n = f * f
        out.set(x, y, [Math.round(r / n), Math.round(g / n), Math.round(b / n)])
      }
    return out
  }
  png(): Buffer {
    return encodePNG(this.px, this.w, this.h)
  }
}
