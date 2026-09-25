/**
 * Generates PWA PNG icons (hand-rolled PNG encoder in png.ts, no native deps).
 * Icon: walnut-dark rounded square, cream page, oxblood magnifier over a "?"
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Img, type RGB } from './png.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'icons')
mkdirSync(outDir, { recursive: true })

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

  return img.png()
}

writeFileSync(join(outDir, 'icon-192.png'), drawIcon(192, false))
writeFileSync(join(outDir, 'icon-512.png'), drawIcon(512, false))
writeFileSync(join(outDir, 'maskable-512.png'), drawIcon(512, true))
writeFileSync(join(outDir, 'apple-touch-icon.png'), drawIcon(180, false))
console.log('icons written → public/icons/')
