/** Shared content pools for the case generator. All values uppercase A-Z. */

export const FIRST_NAMES = [
  'ADA', 'AGNES', 'ALVIN', 'AMOS', 'BETTY', 'BRUNO', 'CARL', 'CECIL', 'CLARA',
  'CORA', 'DELIA', 'DORIS', 'EDITH', 'EDMUND', 'ELSIE', 'EMMETT', 'ESSIE',
  'FELIX', 'FLORENCE', 'FRANK', 'FRED', 'GEORGE', 'GLADYS', 'GUS', 'HARRIET',
  'HATTIE', 'HENRY', 'HUGO', 'IDA', 'IRIS', 'IVY', 'JUDE', 'LEO', 'LEON',
  'LILLIAN', 'LOLA', 'LOU', 'MABEL', 'MARLOWE', 'MARTHA', 'MAUDE', 'MILES',
  'MORTON', 'NANCY', 'NELL', 'NINA', 'NORA', 'OLIVE', 'OPAL', 'OTIS', 'OTTO',
  'PEARL', 'RAY', 'ROSCOE', 'ROSE', 'RUBY', 'RUFUS', 'SADIE', 'SILAS', 'STELLA',
  'THEO', 'VERA', 'VERNON', 'VICTOR', 'VIOLA', 'WALTER', 'WILMA', 'ZELDA',
]

export const SURNAMES = [
  'ASHFORD', 'BLACKWOOD', 'BRIGGS', 'CARROW', 'CROWE', 'DELACROIX', 'DRAKE',
  'FENWICK', 'FINCH', 'GRAVES', 'HALLOWAY', 'HARLOW', 'HAWTHORNE', 'KESTREL',
  'LARKIN', 'LOCKE', 'MARSH', 'MERCER', 'MOORE', 'NIGHTINGALE', 'OSGOOD',
  'PALEY', 'QUILL', 'RAVENSCAR', 'ROOK', 'SINCLAIR', 'STERN', 'THORNE',
  'UNDERWOOD', 'VALE', 'VOSS', 'WEXLER', 'WHITLOCK', 'WREN', 'YORK',
]

/* Weapons and locations live per theme in themes.ts (rooms / weapons). */

export const MOTIVES = [
  'INHERITANCE', 'JEALOUSY', 'REVENGE', 'BLACKMAIL', 'RIVALRY', 'GREED',
  'LOVE', 'DEBT', 'SECRET', 'POWER', 'INSURANCE', 'BETRAYAL',
]

/** Generic crime words used to pad word banks. */
export const CRIME_FILLER = [
  'ALIBI', 'BLOOD', 'CLUE', 'CORPSE', 'CRIME', 'EVIDENCE', 'FELONY',
  'FOULPLAY', 'GUILT', 'MOTIVE', 'MURDER', 'RANSOM', 'SUSPECT', 'VICTIM',
  'WITNESS', 'DETECTIVE', 'INQUEST', 'POISON', 'DAGGER', 'NOTEBOOK',
]

/** Padding tails glued after the core leftover message (length >= 3). */
export const PAD_WORDS = [
  'CASECLOSED', 'THEEND', 'RESTINPEACE', 'MURDERMOSTFOUL', 'JUSTICEISSERVED',
  'SIGNEDTHEDETECTIVE', 'FILEDANDBURIED', 'COLDCASE', 'GOODRIDDANCE',
  'ANOTHERONEGONE', 'THEGAMEISUP', 'DEADTOFRIGHT', 'BOOKEM', 'QED',
  'NOIR', 'AMEN', 'PAGETURNER', 'WHODUNIT', 'THIRTY',
]

/** Confession phrases for the anagram mechanic (word arrays). */
export const CONFESSIONS: string[][] = [
  ['I', 'DID', 'IT'],
  ['IT', 'WAS', 'ME'],
  ['I', 'AM', 'THE', 'KILLER'],
  ['GUILTY', 'AS', 'CHARGED'],
  ['I', 'CONFESS'],
  ['YOU', 'CAUGHT', 'ME'],
  ['I', 'KILLED', '{VICTIM}'],
  ['THE', 'BUTLER', 'DID', 'IT'],
  ['IT', 'WAS', 'ME', 'ALL', 'ALONG'],
]

/** Padding tails for anagram phrases (word arrays; extend the confession). */
export const CONFESSION_PADS: string[][] = [
  ['FORGIVE', 'ME'],
  ['I', 'AM', 'SORRY'],
  ['THE', 'END'],
  ['AMEN'],
  ['CASE', 'CLOSED'],
  ['SIGNED', '{KILLER}'],
  ['FOR', 'THE', '{MOTIVE}'],
  ['AND', 'I', 'WOULD', 'DO', 'IT', 'AGAIN'],
  ['NO', 'REGRETS'],
]

/** Trait dimensions for the suspect-lineup mechanic. */
export const TRAIT_VALUES = {
  hair: ['RED', 'BLACK', 'BLONDE', 'GREY', 'BALD'],
  hand: ['LEFT', 'RIGHT'],
  accessory: ['GLASSES', 'CANE', 'TATTOO', 'SCAR', 'PEARLS'],
  habit: ['SMOKER', 'TEETOTAL', 'GAMBLER', 'SLEEPWALKER'],
} as const

export type TraitDim = keyof typeof TRAIT_VALUES

export const TRAIT_LABEL: Record<TraitDim, Record<string, string>> = {
  hair: { RED: 'Red hair', BLACK: 'Black hair', BLONDE: 'Blonde hair', GREY: 'Grey hair', BALD: 'Bald' },
  hand: { LEFT: 'Left-handed', RIGHT: 'Right-handed' },
  accessory: {
    GLASSES: 'Wears glasses', CANE: 'Carries a cane', TATTOO: 'Has a tattoo',
    SCAR: 'Has a scar', PEARLS: 'Wears pearls',
  },
  habit: {
    SMOKER: 'Smokes', TEETOTAL: 'Never drinks', GAMBLER: 'Gambles', SLEEPWALKER: 'Sleepwalks',
  },
}

/**
 * Squashed clue messages per dim+value (go into leftover cells) plus a
 * readable clue shown in the lineup panel.
 */
export const CLUE_TEXT: Record<TraitDim, Record<string, { msg: string; readable: string }>> = {
  hair: {
    RED: { msg: 'THEKILLERHASREDHAIR', readable: 'The killer has red hair.' },
    BLACK: { msg: 'THEKILLERHASBLACKHAIR', readable: 'The killer has black hair.' },
    BLONDE: { msg: 'THEKILLERHASBLONDEHAIR', readable: 'The killer has blonde hair.' },
    GREY: { msg: 'THEKILLERHASGREYHAIR', readable: 'The killer has grey hair.' },
    BALD: { msg: 'THEKILLERISBALD', readable: 'The killer is bald.' },
  },
  hand: {
    LEFT: { msg: 'THEKILLERISLEFTHANDED', readable: 'The killer is left-handed.' },
    RIGHT: { msg: 'THEKILLERISRIGHTHANDED', readable: 'The killer is right-handed.' },
  },
  accessory: {
    GLASSES: { msg: 'THEKILLERWEARSGLASSES', readable: 'The killer wears glasses.' },
    CANE: { msg: 'THEKILLERCARRIESACANE', readable: 'The killer carries a cane.' },
    TATTOO: { msg: 'THEKILLERHASATATTOO', readable: 'The killer has a tattoo.' },
    SCAR: { msg: 'THEKILLERHASASCAR', readable: 'The killer has a scar.' },
    PEARLS: { msg: 'THEKILLERWEARSPEARLS', readable: 'The killer wears pearls.' },
  },
  habit: {
    SMOKER: { msg: 'THEKILLERSMOKES', readable: 'The killer smokes.' },
    TEETOTAL: { msg: 'THEKILLERNEVERDRINKS', readable: 'The killer never drinks.' },
    GAMBLER: { msg: 'THEKILLERGAMBLES', readable: 'The killer gambles.' },
    SLEEPWALKER: { msg: 'THEKILLERISASLEEPWALKER', readable: 'The killer sleepwalks.' },
  },
}

/** Cipher-case plaintext phrases. {WEAPON}/{LOCATION}/{KILLER}/{VICTIM}/{MOTIVE} fill with case atoms (squashed, A-Z + spaces). */
export const CIPHER_PHRASES = [
  'I DID IT FOR THE MONEY',
  'MEET ME AT THE {LOCATION} AT MIDNIGHT',
  'THE {WEAPON} IS HIDDEN IN THE {LOCATION}',
  'BURN THIS LETTER AT ONCE',
  'SHE KNEW TOO MUCH',
  'THE WILL IS IN THE DESK DRAWER',
  'NO ONE WILL EVER FIND HER',
  'IT WAS ALWAYS ABOUT THE {MOTIVE}',
  'I SAW EVERYTHING FROM THE {LOCATION}',
  'THE SAFE CODE IS HER BIRTHDAY',
  'ASK THE MAID WHAT SHE SAW',
  'THE MONEY IS BURIED AT THE {LOCATION}',
  'FOLLOW THE MONEY',
  'CHECK THE LEDGER',
  'IT WAS NEVER AN ACCIDENT',
  'THE {WEAPON} TELLS THE TRUTH',
  'DIG UP THE {LOCATION}',
  'I REGRET NOTHING',
  'MIDNIGHT AT THE {LOCATION}',
  'THE {WEAPON} WAS MINE ALL ALONG',
  'HE NEVER SHOULD HAVE OPENED THAT LETTER',
  'FORGIVE ME FOR WHAT I DID AT THE {LOCATION}',
]

/** Timeline-case events (lowercase clauses). */
export const TIMELINE_EVENTS = [
  'the lights went out',
  'a scream was heard',
  'the hall clock stopped',
  'a car sped away',
  'the telephone rang',
  'the front door slammed',
  'the dog started barking',
  'the alarm was tripped',
  'smoke filled the hall',
  'the piano stopped playing',
  'a shot rang out',
  'the window shattered',
  'the gate creaked open',
  'a candle blew out',
  'the record skipped',
  'someone knocked twice',
]

/** Evidence-note templates for elimination. {item} = cleared name. */
export const ELIM_NOTES = {
  suspect: [
    '{item} has an airtight alibi.',
    'Witnesses place {item} across town.',
    'Lab work clears {item}.',
    '{item} passed the polygraph.',
    'CCTV clears {item} completely.',
    '{item} was in custody that night.',
  ],
  weapon: [
    'No prints on the {item}.',
    'The {item} was ruled out by forensics.',
    'The wound does not match the {item}.',
    'The {item} was never at the scene.',
    'Not a drop of blood on the {item}.',
  ],
  location: [
    'The {loc} was locked all night.',
    'No trace evidence at the {loc}.',
    'The {loc} was full of witnesses.',
    'Dogs swept the {loc}; nothing.',
    'The {loc} lights were off all evening.',
  ],
}

/** Leftover flavor messages for elimination cases (before padding). */
export const ELIM_MESSAGES = [
  'THEEVIDENCENEVERLIES',
  'FOLLOWTHEEVIDENCE',
  'EVERYCLUECOUNTS',
  'TRUSTNOONE',
  'THETRUTHISINTHEGRID',
  'EVIDENCEISEVERYTHING',
]
