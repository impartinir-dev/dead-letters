/**
 * Generates the 1200x630 Open Graph / Twitter card image (public/og-image.png)
 * in the casebook style: ruled paper, double frame, DEAD / LETTERS tiles,
 * tagline, and an oxblood magnifier. Drawn at 2x and downsampled for
 * anti-aliasing; letters come from a built-in 5x7 bitmap font.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Img, type RGB } from './png.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outFile = join(root, 'public', 'og-image.png')
mkdirSync(dirname(outFile), { recursive: true })

const W = 1200
const H = 630
const S = 2 // supersampling factor

const PAPER: RGB = [236, 225, 201]
const PAPER2: RGB = [247, 239, 220]
const INK: RGB = [38, 29, 18]
const INK_SOFT: RGB = [107, 93, 69]
const RED: RGB = [122, 31, 31]
const SHADOW: RGB = [190, 176, 148]

/* 5x7 bitmap font, uppercase A–Z */
const FONT: Record<string, string[]> = {
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
  C: ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'],
  D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  G: ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.####'],
  H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  I: ['.###.', '..#..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  J: ['..###', '...#.', '...#.', '...#.', '...#.', '#..#.', '.##..'],
  K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
  N: ['#...#', '#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  Q: ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  V: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  W: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '#.#.#', '.#.#.'],
  X: ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
  Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  Z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
}

const img = new Img(W * S, H * S)
const R = (v: number) => Math.round(v * S)

/** width in px (1x) of `text` at block size `b` with `gap` blocks between letters */
const textWidth = (text: string, b: number, gap = 1) => text.length * (5 + gap) * b - gap * b

function drawText(text: string, x: number, y: number, b: number, c: RGB, gap = 1) {
  for (const [n, ch] of [...text].entries()) {
    const glyph = FONT[ch]
    if (!glyph) continue
    const gx = x + n * (5 + gap) * b
    glyph.forEach((row, ry) =>
      [...row].forEach((p, rx) => {
        if (p === '#') img.rect(R(gx + rx * b), R(y + ry * b), R(b), R(b), c)
      }),
    )
  }
}

const centerText = (text: string, y: number, b: number, c: RGB, gap = 1) =>
  drawText(text, (W - textWidth(text, b, gap)) / 2, y, b, c, gap)

function roundRect(x: number, y: number, w: number, h: number, rad: number, c: RGB) {
  img.rect(R(x + rad), R(y), R(w - 2 * rad), R(h), c)
  img.rect(R(x), R(y + rad), R(w), R(h - 2 * rad), c)
  for (const [cx, cy] of [[x + rad, y + rad], [x + w - rad, y + rad], [x + rad, y + h - rad], [x + w - rad, y + h - rad]])
    img.circle(R(cx), R(cy), R(rad), c)
}

function tile(ch: string, x: number, y: number, size: number, red: boolean) {
  const border = 5
  roundRect(x + 5, y + 5, size, size, 9, SHADOW) // drop shadow
  roundRect(x, y, size, size, 9, red ? RED : INK) // border
  roundRect(x + border, y + border, size - 2 * border, size - 2 * border, 6, red ? RED : PAPER2)
  const b = 11
  drawText(ch, x + (size - 5 * b) / 2, y + (size - 7 * b) / 2, b, red ? PAPER2 : INK)
}

function tileRow(word: string, y: number, red: boolean) {
  const size = 112
  const gap = 14
  const x0 = (W - (word.length * size + (word.length - 1) * gap)) / 2
  ;[...word].forEach((ch, i) => tile(ch, x0 + i * (size + gap), y, size, red))
}

/* paper + faint ruled lines */
img.fill(PAPER)
for (let y = 0; y < H; y += 6) img.rect(0, R(y), W * S, 1, INK, 7)

/* double frame */
const frame = (inset: number, w: number) => {
  img.rect(R(inset), R(inset), R(W - 2 * inset), R(w), INK)
  img.rect(R(inset), R(H - inset - w), R(W - 2 * inset), R(w), INK)
  img.rect(R(inset), R(inset), R(w), R(H - 2 * inset), INK)
  img.rect(R(W - inset - w), R(inset), R(w), R(H - 2 * inset), INK)
}
frame(24, 4)
frame(36, 1.5)

tileRow('DEAD', 84, true)
tileRow('LETTERS', 216, false)
centerText('THE MURDER MYSTERY WORD SEARCH', 384, 4, INK, 2)
img.rect(R(W / 2 - 60), R(438), R(120), R(3), RED)
centerText('A NEW CASE EVERY DAY', 468, 5, RED, 2)
centerText('FIND THE WORDS  CATCH THE KILLER', 530, 3, INK_SOFT, 2)

/* magnifier in the lower-right corner */
const cx = 1050, cy = 500, rad = 42
img.circle(R(cx), R(cy), R(rad), RED, R(9))
img.line(R(cx + rad * 0.72), R(cy + rad * 0.72), R(cx + rad * 1.55), R(cy + rad * 1.55), R(14), RED)

writeFileSync(outFile, img.downsample(S).png())
console.log('share image written → public/og-image.png (1200x630)')
