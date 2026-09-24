/**
 * Themed word packs. `words` must be uppercase A-Z (no spaces/punctuation),
 * 3–14 chars. `titles` are finished case titles; `place` slots into flavor text.
 */
export interface Theme {
  id: string
  place: string
  titles: string[]
  words: string[]
}

export const THEMES: Theme[] = [
  {
    id: 'winery',
    place: 'old hillside winery',
    titles: ['The Winery', 'Blood and Merlot', 'A Vintage Murder'],
    words: [
      'AGED', 'AROMA', 'BARREL', 'BOTTLED', 'BUNG', 'CASK', 'CELLAR',
      'CHARDONNAY', 'CORK', 'DREGS', 'DRY', 'ESTATE', 'FERMENT', 'GRAPE',
      'MERLOT', 'OAK', 'PRESSING', 'SOMMELIER', 'VAT', 'VINE', 'VINTAGE',
    ],
  },
  {
    id: 'jazz',
    place: 'smoke-filled jazz club',
    titles: ['Last Set at the Blue Note', 'The Jazz Club Murder', 'Murder in Swing Time'],
    words: [
      'BASS', 'BRASS', 'CHORDS', 'DRUMS', 'ENCORE', 'IMPROV', 'LOUNGE',
      'RHYTHM', 'SAXOPHONE', 'SMOKE', 'SOLO', 'STAGE', 'STANDARDS',
      'SWING', 'TEMPO', 'TRUMPET', 'VINYL', 'VOCALS',
    ],
  },
  {
    id: 'ski',
    place: 'snowed-in ski lodge',
    titles: ['Death on the Slopes', 'The Ski Lodge Case', 'Cold Blood'],
    words: [
      'AVALANCHE', 'BINDINGS', 'CHALET', 'CHAIRLIFT', 'FROST', 'GONDOLA',
      'LODGE', 'MOGULS', 'POWDER', 'SKIING', 'SLOPE', 'SNOWBOUND',
      'SUMMIT', 'THERMOS', 'TRAIL', 'WAX',
    ],
  },
  {
    id: 'aquarium',
    place: 'city aquarium',
    titles: ['The Aquarium Case', 'Sleeping with the Fishes', 'Blood in the Water'],
    words: [
      'AQUATIC', 'CORAL', 'DIVER', 'FIN', 'GILL', 'JELLYFISH', 'KELP',
      'OCTOPUS', 'PENGUIN', 'REEF', 'SHARK', 'STINGRAY', 'TANK', 'TIDAL',
      'TURTLE', 'WETLAB',
    ],
  },
  {
    id: 'bakery',
    place: 'corner bakery',
    titles: ['The Bakery Murder', 'A Recipe for Murder', 'Death by Sourdough'],
    words: [
      'BAGUETTE', 'BUTTER', 'CRUMB', 'DOUGH', 'FLOUR', 'GLAZE', 'ICING',
      'KNEAD', 'LOAF', 'OVEN', 'PASTRY', 'PROOF', 'RYE', 'SCONE',
      'SOURDOUGH', 'YEAST',
    ],
  },
  {
    id: 'filmset',
    place: 'midnight film set',
    titles: ['Murder on the Set', 'The Final Take', 'A Killer Performance'],
    words: [
      'ACTOR', 'CAMERA', 'CASTING', 'CLAPPER', 'CUT', 'DIRECTOR',
      'EXTRAS', 'LIGHTING', 'REEL', 'SCENE', 'SCRIPT', 'SOUND', 'TAKE',
      'TRAILER', 'MONITOR', 'PROP',
    ],
  },
  {
    id: 'cruise',
    place: 'midnight cruise liner',
    titles: ['Murder on the High Seas', 'The Cruise Ship Case', 'Dead Voyage'],
    words: [
      'ANCHOR', 'BUFFET', 'CABIN', 'CAPTAIN', 'DECK', 'HARBOR',
      'LIFEBOAT', 'PORTHOLE', 'STARBOARD', 'STATEROOM', 'VOYAGE',
      'GANGWAY', 'STEWARD', 'HULL', 'REGATTA',
    ],
  },
  {
    id: 'library',
    place: 'dusty public library',
    titles: ['The Library Murder', 'Overdue', 'Silence in the Stacks'],
    words: [
      'ARCHIVE', 'AUTHOR', 'CATALOG', 'CHAPTER', 'DUE', 'INDEX',
      'LIBRARIAN', 'NOVEL', 'PAGE', 'QUIET', 'READER', 'SHELF',
      'STACKS', 'VOLUME', 'SPINE', 'FOOTNOTE',
    ],
  },
  {
    id: 'circus',
    place: 'traveling circus',
    titles: ['Death Under the Big Top', 'The Circus Murder', 'Send in the Clues'],
    words: [
      'ACROBAT', 'BIGTOP', 'CLOWN', 'JUGGLER', 'LION', 'PARADE',
      'RINGMASTER', 'STILTS', 'TENT', 'TRAPEZE', 'UNICYCLE', 'CANNON',
      'SEQUINS', 'SAWDUST',
    ],
  },
  {
    id: 'golf',
    place: 'private golf course',
    titles: ['The Golf Course Murder', 'A Hole in One', 'Death on the Green'],
    words: [
      'BOGEY', 'BUNKER', 'CADDIE', 'CART', 'DRIVER', 'FAIRWAY', 'GREEN',
      'HOLE', 'IRON', 'PAR', 'PUTTER', 'ROUGH', 'TEE', 'DIVOT', 'CLUBHOUSE',
    ],
  },
  {
    id: 'casino',
    place: 'riverside casino',
    titles: ['The Casino Job', 'A Dead Hand', 'House Always Wins'],
    words: [
      'BET', 'BLACKJACK', 'CHIPS', 'CROUPIER', 'DEALER', 'DICE',
      'JACKPOT', 'POKER', 'ROULETTE', 'SHUFFLE', 'SLOTS', 'WAGER',
      'STAKE', 'BACCARAT', 'PITBOSS',
    ],
  },
  {
    id: 'theater',
    place: 'grand old theater',
    titles: ['Murder at the Matinee', 'The Theater Case', 'Curtain Call'],
    words: [
      'ACT', 'AISLE', 'APPLAUSE', 'BALCONY', 'CURTAIN', 'INTERMISSION',
      'MATINEE', 'PLAYBILL', 'REHEARSAL', 'SPOTLIGHT', 'STAGE', 'USHER',
      'ORCHESTRA', 'ENCORE',
    ],
  },
  {
    id: 'museum',
    place: 'natural history museum',
    titles: ['The Museum Murder', 'Night at the Museum', 'A Priceless Death'],
    words: [
      'ARTIFACT', 'CURATOR', 'EXHIBIT', 'FOSSIL', 'GALLERY', 'MARBLE',
      'MUMMY', 'PAINTING', 'RELIC', 'SCULPTURE', 'TICKET', 'TOUR',
      'DINOSAUR', 'PLINTH',
    ],
  },
  {
    id: 'farm',
    place: 'run-down dairy farm',
    titles: ['The Farm Murder', 'Harvest of Death', 'Blood on the Wheat'],
    words: [
      'BARN', 'CATTLE', 'CROPS', 'HARVEST', 'HAY', 'LOAM', 'ORCHARD',
      'PLOW', 'SCYTHE', 'STABLE', 'TRACTOR', 'WHEAT', 'SILO', 'GRAIN',
      'FALLOW',
    ],
  },
  {
    id: 'lighthouse',
    place: 'lonely lighthouse',
    titles: ['The Lighthouse Keeper', 'Dark Beacon', 'A Light Went Out'],
    words: [
      'BEACON', 'COAST', 'FOG', 'HORN', 'KEROSENE', 'LAMP', 'LENS',
      'ROCKS', 'SHORE', 'SPIRAL', 'WAVES', 'GALLEY', 'KEEPER', 'STORM',
      'TIDE',
    ],
  },
  {
    id: 'hotel',
    place: 'grand hotel',
    titles: ['The Hotel Murder', 'Room 313', 'Do Not Disturb'],
    words: [
      'BELLHOP', 'CONCIERGE', 'ELEVATOR', 'KEY', 'LOBBY', 'LUGGAGE',
      'MAID', 'MINIBAR', 'PORTER', 'SUITE', 'TOWEL', 'VALET',
      'TURNDOWN', 'REGISTER', 'PENTHOUSE',
    ],
  },
  {
    id: 'carnival',
    place: 'midway carnival',
    titles: ['The Carnival Murder', 'Death at the Midway', 'A Fatal Ride'],
    words: [
      'BALLOON', 'CAROUSEL', 'COTTONCANDY', 'FERRIS', 'GAMES', 'MIDWAY',
      'POPCORN', 'PRIZE', 'RIDE', 'TICKET', 'BARKER', 'FUNHOUSE',
      'SODA', 'RINGTOSS',
    ],
  },
  {
    id: 'train',
    place: 'overnight express train',
    titles: ['Murder on the Night Express', 'The Sleeper Car', 'Last Stop'],
    words: [
      'BERTH', 'BOXCAR', 'CONDUCTOR', 'ENGINE', 'PLATFORM', 'RAIL',
      'SLEEPER', 'TICKET', 'TRACK', 'TUNNEL', 'WHISTLE', 'CABOOSE',
      'DININGCAR', 'CROSSING',
    ],
  },
  {
    id: 'courtroom',
    place: 'county courtroom',
    titles: ['The Courtroom Murder', 'Contempt of Court', 'A Hostile Witness'],
    words: [
      'ALIBI', 'BAILIFF', 'DEFENSE', 'EVIDENCE', 'GAVEL', 'JUDGE',
      'JURY', 'OATH', 'OBJECTION', 'VERDICT', 'WITNESS', 'DOCKET',
      'STENO', 'RECESS',
    ],
  },
  {
    id: 'newsroom',
    place: 'city newsroom',
    titles: ['The Newsroom Murder', 'Stop the Presses', 'Deadline: Midnight'],
    words: [
      'COLUMN', 'DEADLINE', 'EDITOR', 'HEADLINE', 'INK', 'LEAD',
      'PRESS', 'PRINT', 'SOURCE', 'TYPESET', 'BYLINE', 'COPYBOY',
      'REPORTER', 'OBIT',
    ],
  },
  {
    id: 'hospital',
    place: 'county hospital',
    titles: ['The Hospital Murder', 'A Fatal Dose', 'Code Blue'],
    words: [
      'CLINIC', 'DOSE', 'NURSE', 'PATIENT', 'SCALPEL', 'SURGEON',
      'SUTURE', 'THERAPY', 'VITALS', 'WARD', 'XRAY', 'GURNEY',
      'ORDERLY', 'RECOVERY',
    ],
  },
  {
    id: 'camp',
    place: 'lakeside campground',
    titles: ['The Campground Murder', 'Dead of Night', 'The Last Campfire'],
    words: [
      'CANOE', 'CAMPFIRE', 'CANTEEN', 'LANTERN', 'MOSQUITO', 'TENT',
      'TRAIL', 'WILDERNESS', 'COMPASS', 'FIREWOOD', 'SLEEPINGBAG',
      'RANGER', 'PADDLE',
    ],
  },
  {
    id: 'harbor',
    place: 'foggy harbor',
    titles: ['The Harbor Murder', 'Low Tide', 'Dead in the Water'],
    words: [
      'ANCHOR', 'BUOY', 'CARGO', 'DOCK', 'FERRY', 'HULL', 'MOORING',
      'ROPE', 'TIDE', 'WHARF', 'CRANE', 'FOGHORN', 'TRAWLER', 'NETS',
    ],
  },
  {
    id: 'opera',
    place: 'grand opera house',
    titles: ['The Opera Murder', 'A Fatal Aria', 'Murder in Mezzanine'],
    words: [
      'ARIA', 'BARITONE', 'CHORUS', 'COSTUME', 'LIBRETTO', 'MEZZANINE',
      'OVERTURE', 'PROGRAM', 'SOPRANO', 'DIVA', 'FALSETTO', 'SCORE',
      'ENCORE', 'TENOR',
    ],
  },
  {
    id: 'rodeo',
    place: 'county rodeo',
    titles: ['The Rodeo Murder', 'Eight Seconds', 'Thrown'],
    words: [
      'BRONCO', 'BUCKLE', 'CORRAL', 'LASSO', 'RIDER', 'SPURS',
      'STAMPEDE', 'STEER', 'BARREL', 'CLOWN', 'CHUTE', 'LARIAT',
      'SADDLE', 'ARENA',
    ],
  },
  {
    id: 'speakeasy',
    place: 'underground speakeasy',
    titles: ['The Speakeasy Murder', 'Whisper the Password', 'Bathtub Gin'],
    words: [
      'BOOTLEG', 'FLAPPER', 'GIN', 'HIDDEN', 'JAZZ', 'PASSWORD',
      'TAPROOM', 'VELVET', 'WHISKEY', 'RAID', 'STILL', 'MOONSHINE',
      'HOOCH', 'COVERCHARGE',
    ],
  },
  {
    id: 'garden',
    place: 'botanical garden',
    titles: ['The Garden Murder', 'A Bed of Roses', 'Deadly Nightshade'],
    words: [
      'BLOOM', 'FERN', 'GARDEN', 'GREENHOUSE', 'LILY', 'ORCHID',
      'PETAL', 'POLLEN', 'TULIP', 'VINE', 'PRUNER', 'TERRARIUM',
      'MULCH', 'TRELLIS',
    ],
  },
  {
    id: 'boxing',
    place: 'smoky boxing gym',
    titles: ['The Boxing Gym Murder', 'A Knockout', 'Down for the Count'],
    words: [
      'BELL', 'BOUT', 'CANVAS', 'CORNER', 'GLOVES', 'JAB', 'PUNCH',
      'RING', 'SPAR', 'UPPERCUT', 'SPEEDBAG', 'REFEREE', 'FEINT',
      'MOUTHPIECE',
    ],
  },
  {
    id: 'chess',
    place: 'old chess club',
    titles: ['The Chess Club Murder', 'Checkmate', 'A Fatal Gambit'],
    words: [
      'BISHOP', 'BOARD', 'CASTLE', 'CHECK', 'GAMBIT', 'KING', 'KNIGHT',
      'MATE', 'PAWN', 'QUEEN', 'ROOK', 'ENDGAME', 'BLITZ', 'SACRIFICE',
    ],
  },
  {
    id: 'diner',
    place: 'all-night diner',
    titles: ['The Diner Murder', 'Coffee and Corpses', 'Order Up'],
    words: [
      'BOOTH', 'COFFEE', 'COUNTER', 'GRIDDLE', 'JUKEBOX', 'MILKSHAKE',
      'PANCAKE', 'PIE', 'PLATTER', 'WAITRESS', 'KETCHUP', 'NAPKIN',
      'TOASTER', 'CHECKPLEASE',
    ],
  },
  {
    id: 'drivein',
    place: 'moonlight drive-in',
    titles: ['The Drive-In Murder', 'Double Feature', 'Death at Dusk'],
    words: [
      'CONCESSION', 'FENDER', 'FEATURE', 'HORNS', 'MOVIE', 'PROJECTOR',
      'SCREEN', 'SODA', 'TRAILER', 'MARQUEE', 'REEL', 'DUSK', 'SPEAKER',
    ],
  },
  {
    id: 'fairground',
    place: 'county fairground',
    titles: ['The Fairground Murder', 'A Fatal Attraction', 'Funhouse'],
    words: [
      'BARKER', 'BOOTH', 'FERRIS', 'FUNHOUSE', 'MIRROR', 'PRIZE',
      'RIDES', 'TICKETS', 'STRONGMAN', 'MIRRORMAZE',
      'CAROUSEL', 'MIDWAY',
    ],
  },
  {
    id: 'monastery',
    place: 'hilltop monastery',
    titles: ['The Monastery Murder', 'A Silent Vow', 'Sanctuary'],
    words: [
      'ABBEY', 'BELL', 'CANDLE', 'CELL', 'CHAPEL', 'CHOIR', 'CLOISTER',
      'MONK', 'PRAYER', 'VESPERS', 'SCRIPTORIUM',
      'NOVICE', 'HYMN', 'FRIAR',
    ],
  },
  {
    id: 'observatory',
    place: 'clifftop observatory',
    titles: ['The Observatory Murder', 'A Falling Star', 'Written in the Stars'],
    words: [
      'COMET', 'DOME', 'LENS', 'LUNAR', 'ORBIT', 'PLANET', 'SATELLITE',
      'STAR', 'TELESCOPE', 'ZODIAC', 'ECLIPSE', 'NEBULA', 'COSMOS',
    ],
  },
  {
    id: 'tailor',
    place: 'savile row tailor shop',
    titles: ['The Tailor Murder', 'Cut to Fit', 'A Perfect Fit'],
    words: [
      'BOBBIN', 'BUTTON', 'FABRIC', 'NEEDLE', 'PATTERN', 'PIN', 'SEAM',
      'SILK', 'STITCH', 'THIMBLE', 'THREAD', 'TWEED', 'LAPEL', 'HEM',
    ],
  },
]

/**
 * Extra title templates filled per-case ({victim}, {place}, {location},
 * {motive}) so 150 cases get unique titles even when themes repeat.
 */
export const TITLE_TEMPLATES = [
  'Who Killed {victim}?',
  'The {victim} File',
  'The {victim} Mystery',
  'What Happened to {victim}',
  'Death at the {place}',
  'The {place} Murder',
  'Murder at the {place}',
  'The {location} Case',
  'Death in the {location}',
  'The {motive} Motive',
  'A {motive} Killing',
  'The Night {victim} Died',
]

/** Shared flavor templates; {victim} {place} {weapon} {location} are filled in. */
export const FLAVOR_TEMPLATES = [
  '{victim} was found dead at the {place}. Everyone inside is a suspect.',
  'A quiet night at the {place} ended in murder. {victim} never saw it coming.',
  'The {place} is closed until further notice. {victim} is dead, and the killer left traces everywhere.',
  'Rain fell on the {place} the night {victim} was murdered.',
  'Nobody heard a thing at the {place}. {victim} was already cold when the lights came on.',
  '{victim} had enemies. One of them followed them to the {place}.',
  "The coroner sets {victim}'s time of death at midnight. The {place} holds the answers.",
  '{victim} walked into the {place} at dusk and never walked out.',
]
