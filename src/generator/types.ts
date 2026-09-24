export type Mechanic = 'leftovers' | 'lineup' | 'elimination' | 'anagram'

export interface Placement {
  word: string
  r: number
  c: number
  /** direction name, e.g. 'E' | 'SE' | 'NW' */
  d: string
}

export interface LeftoverPayload {
  kind: 'leftovers'
  /** full leftover text in row-major order (core message + padding tail), uppercase, no spaces */
  message: string
  /** which case-file blanks the player must fill */
  blanks: Array<'killer' | 'weapon' | 'location'>
  /** cell indices (r*cols+c) of all leftover cells, row-major */
  messageCells: number[]
}

export interface Suspect {
  name: string
  traits: { hair: string; hand: string; accessory: string; habit: string }
}

export interface LineupPayload {
  kind: 'lineup'
  /** leftover message, e.g. THEKILLERHASREDHAIR + padding */
  message: string
  /** human-readable clue, e.g. "The killer has red hair." */
  clueText: string
  clueDim: keyof Suspect['traits']
  clueValue: string
  /** exactly one suspect has clueDim === clueValue */
  suspects: Suspect[]
  messageCells: number[]
}

export interface ElimItem {
  name: string
  cleared: boolean
  /** evidence note shown when cleared; empty for the true answer */
  note: string
}

export interface EliminationPayload {
  kind: 'elimination'
  suspects: ElimItem[]
  weapons: ElimItem[]
  locations: ElimItem[]
  /** ordered drip: eliminations[i] is revealed when the i-th word (bank order) is found */
  eliminations: Array<{
    word: string
    kind: 'suspect' | 'weapon' | 'location'
    item: string
    note: string
  }>
  /** leftover flavor message */
  message: string
  messageCells: number[]
}

export interface AnagramPayload {
  kind: 'anagram'
  /** the confession with spaces, e.g. "I DID IT FORGIVE ME" */
  phrase: string
  /** scrambled tile letters (no spaces), same multiset as phrase */
  tiles: string
  messageCells: number[]
}

export type Payload = LeftoverPayload | LineupPayload | EliminationPayload | AnagramPayload

export interface CaseFile {
  id: number
  volume: 1 | 2 | 3
  title: string
  themeId: string
  mechanic: Mechanic
  rows: number
  cols: number
  /** row strings of uppercase letters */
  grid: string[]
  words: string[]
  victim: string
  killer: string
  weapon: string
  location: string
  motive: string
  flavor: string
  parSeconds: number
  placements: Placement[]
  payload: Payload
}

export interface CaseIndexEntry {
  id: number
  volume: 1 | 2 | 3
  title: string
  mechanic: Mechanic
  rows: number
  wordCount: number
}
