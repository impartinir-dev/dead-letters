/**
 * Themed word packs. `words` must be uppercase A-Z (no spaces/punctuation),
 * 3–14 chars. `titles` are finished case titles; `place` slots into flavor text.
 * `rooms` / `weapons` (4–6 each, Title Case, letters + spaces) are the only
 * locations and weapons a case of this theme may use — including decoys.
 * `keywords` are the theme's distinctive nouns: no case title may contain
 * another theme's keyword (enforced by tests).
 */
export interface Theme {
  id: string
  place: string
  titles: string[]
  keywords: string[]
  rooms: string[]
  weapons: string[]
  words: string[]
}

export const THEMES: Theme[] = [
  {
    id: 'winery',
    place: 'old hillside winery',
    titles: ['The Winery', 'Blood and Merlot', 'A Vintage Murder', 'Corked', 'The Last Pour'],
    keywords: ['Winery', 'Vineyard', 'Merlot', 'Vintage'],
    rooms: ['Wine Cellar', 'Tasting Room', 'Barrel Room', 'Vineyard', 'Press House'],
    weapons: ['Corkscrew', 'Wine Bottle', 'Pruning Knife', 'Barrel Stave', 'Poisoned Glass'],
    words: [
      'AGED', 'AROMA', 'BARREL', 'BOTTLED', 'BUNG', 'CASK', 'CELLAR',
      'CHARDONNAY', 'CORK', 'DREGS', 'DRY', 'ESTATE', 'FERMENT', 'GRAPE',
      'MERLOT', 'OAK', 'PRESSING', 'SOMMELIER', 'VAT', 'VINE', 'VINTAGE',
    ],
  },
  {
    id: 'jazz',
    place: 'smoke-filled jazz club',
    titles: ['Last Set at the Blue Note', 'The Jazz Club Murder', 'Murder in Swing Time', 'Bebop and Bloodshed', 'A Minor Murder'],
    keywords: ['Jazz', 'Blue Note', 'Swing', 'Bebop'],
    rooms: ['Green Room', 'Bandstand', 'Back Bar', 'Coat Check', 'Stage Door Alley'],
    weapons: ['Trumpet', 'Mic Stand', 'Piano Wire', 'Drumstick', 'Poisoned Martini'],
    words: [
      'BASS', 'BRASS', 'CHORDS', 'DRUMS', 'ENCORE', 'IMPROV', 'LOUNGE',
      'RHYTHM', 'SAXOPHONE', 'SMOKE', 'SOLO', 'STAGE', 'STANDARDS',
      'SWING', 'TEMPO', 'TRUMPET', 'VINYL', 'VOCALS',
    ],
  },
  {
    id: 'ski',
    place: 'snowed-in ski lodge',
    titles: ['Death on the Slopes', 'The Ski Lodge Case', 'Cold Blood', 'Black Diamond', 'The Avalanche Alibi'],
    keywords: ['Ski', 'Slopes', 'Avalanche', 'Black Diamond'],
    rooms: ['Chairlift', 'Sauna', 'Boot Room', 'Fireside Lounge', 'Ski Patrol Hut'],
    weapons: ['Ski Pole', 'Ice Axe', 'Snow Shovel', 'Crampon', 'Poisoned Thermos'],
    words: [
      'AVALANCHE', 'BINDINGS', 'CHALET', 'CHAIRLIFT', 'FROST', 'GONDOLA',
      'LODGE', 'MOGULS', 'POWDER', 'SKIING', 'SLOPE', 'SNOWBOUND',
      'SUMMIT', 'THERMOS', 'TRAIL', 'WAX',
    ],
  },
  {
    id: 'aquarium',
    place: 'city aquarium',
    titles: ['The Aquarium Case', 'Sleeping with the Fishes', 'Blood in the Water', 'The Shark Tank Affair', 'Deep Water'],
    keywords: ['Aquarium', 'Fishes', 'Shark Tank'],
    rooms: ['Shark Tank', 'Touch Pool', 'Wet Lab', 'Pump Room', 'Penguin House'],
    weapons: ['Harpoon', 'Scuba Tank', 'Dive Knife', 'Gaff Hook', 'Jellyfish Venom'],
    words: [
      'AQUATIC', 'CORAL', 'DIVER', 'FIN', 'GILL', 'JELLYFISH', 'KELP',
      'OCTOPUS', 'PENGUIN', 'REEF', 'SHARK', 'STINGRAY', 'TANK', 'TIDAL',
      'TURTLE', 'WETLAB',
    ],
  },
  {
    id: 'bakery',
    place: 'corner bakery',
    titles: ['The Bakery Murder', 'A Recipe for Murder', 'Death by Sourdough', 'Half-Baked', 'The Last Crumb'],
    keywords: ['Bakery', 'Sourdough', 'Recipe', 'Half-Baked', 'Crumb'],
    rooms: ['Bakehouse', 'Cold Room', 'Flour Store', 'Shopfront', 'Pantry'],
    weapons: ['Rolling Pin', 'Bread Knife', 'Dough Hook', 'Baking Tray', 'Poisoned Eclair'],
    words: [
      'BAGUETTE', 'BUTTER', 'CRUMB', 'DOUGH', 'FLOUR', 'GLAZE', 'ICING',
      'KNEAD', 'LOAF', 'OVEN', 'PASTRY', 'PROOF', 'RYE', 'SCONE',
      'SOURDOUGH', 'YEAST',
    ],
  },
  {
    id: 'filmset',
    place: 'midnight film set',
    titles: ['Murder on the Set', 'The Final Take', 'A Killer Performance', 'Lights, Camera, Murder', 'The Stunt Double'],
    keywords: ['Film', 'on the Set', 'Final Take', 'Camera', 'Stunt'],
    rooms: ['Soundstage', 'Star Trailer', 'Editing Bay', 'Prop Room', 'Lighting Rig'],
    weapons: ['Prop Revolver', 'Boom Pole', 'Stage Light', 'Clapperboard', 'Power Cable'],
    words: [
      'ACTOR', 'CAMERA', 'CASTING', 'CLAPPER', 'CUT', 'DIRECTOR',
      'EXTRAS', 'LIGHTING', 'REEL', 'SCENE', 'SCRIPT', 'SOUND', 'TAKE',
      'TRAILER', 'MONITOR', 'PROP',
    ],
  },
  {
    id: 'cruise',
    place: 'midnight cruise liner',
    titles: ['Murder on the High Seas', 'The Cruise Ship Case', 'Dead Voyage', 'Man Overboard', 'The Captain\'s Table'],
    keywords: ['Cruise', 'High Seas', 'Voyage', 'Overboard', 'Captain'],
    rooms: ['Stateroom', 'Engine Room', 'Promenade Deck', 'Ballroom', 'Lifeboat'],
    weapons: ['Flare Gun', 'Anchor Chain', 'Steak Knife', 'Champagne Bottle', 'Life Ring'],
    words: [
      'ANCHOR', 'BUFFET', 'CABIN', 'CAPTAIN', 'DECK', 'HARBOR',
      'LIFEBOAT', 'PORTHOLE', 'STARBOARD', 'STATEROOM', 'VOYAGE',
      'GANGWAY', 'STEWARD', 'HULL', 'REGATTA',
    ],
  },
  {
    id: 'library',
    place: 'dusty public library',
    titles: ['The Library Murder', 'Overdue', 'Silence in the Stacks', 'Due Back Never', 'The Last Chapter'],
    keywords: ['Library', 'Stacks', 'Overdue', 'Chapter'],
    rooms: ['Reading Room', 'Rare Book Room', 'Stacks', 'Archive', 'Map Room'],
    weapons: ['Letter Opener', 'Bookend', 'Heavy Atlas', 'Paper Cutter', 'Brass Lamp'],
    words: [
      'ARCHIVE', 'AUTHOR', 'CATALOG', 'CHAPTER', 'DUE', 'INDEX',
      'LIBRARIAN', 'NOVEL', 'PAGE', 'QUIET', 'READER', 'SHELF',
      'STACKS', 'VOLUME', 'SPINE', 'FOOTNOTE',
    ],
  },
  {
    id: 'circus',
    place: 'traveling circus',
    titles: ['Death Under the Big Top', 'The Circus Murder', 'Send in the Clues', 'The Last Trapeze', 'The Ringmaster\'s Secret'],
    keywords: ['Circus', 'Big Top', 'Trapeze', 'Ringmaster', 'Clues'],
    rooms: ['Big Top', 'Lion Cage', 'Wardrobe Wagon', 'Ticket Booth', 'Trapeze Rig'],
    weapons: ['Juggling Pin', 'Whip', 'Tent Stake', 'Throwing Knife', 'Trapeze Bar'],
    words: [
      'ACROBAT', 'BIGTOP', 'CLOWN', 'JUGGLER', 'LION', 'PARADE',
      'RINGMASTER', 'STILTS', 'TENT', 'TRAPEZE', 'UNICYCLE', 'CANNON',
      'SEQUINS', 'SAWDUST',
    ],
  },
  {
    id: 'golf',
    place: 'private golf course',
    titles: ['The Golf Course Murder', 'A Hole in One', 'Death on the Green', 'Fore!', 'The Back Nine'],
    keywords: ['Golf', 'Hole in One', 'the Green', 'Fore', 'Back Nine'],
    rooms: ['Clubhouse', 'Pro Shop', 'Locker Room', 'Bunker', 'Cart Barn'],
    weapons: ['Nine Iron', 'Putter', 'Driver', 'Trophy', 'Flagstick'],
    words: [
      'BOGEY', 'BUNKER', 'CADDIE', 'CART', 'DRIVER', 'FAIRWAY', 'GREEN',
      'HOLE', 'IRON', 'PAR', 'PUTTER', 'ROUGH', 'TEE', 'DIVOT', 'CLUBHOUSE',
    ],
  },
  {
    id: 'casino',
    place: 'riverside casino',
    titles: ['The Casino Job', 'A Dead Hand', 'House Always Wins', 'Snake Eyes', 'All In'],
    keywords: ['Casino', 'House Always Wins', 'Dead Hand', 'Snake Eyes', 'All In'],
    rooms: ['Vault', 'High Roller Suite', 'Cashier Cage', 'Card Room', 'Counting Room'],
    weapons: ['Croupier Rake', 'Dealing Shoe', 'Derringer', 'Champagne Bottle', 'Poisoned Cocktail'],
    words: [
      'BET', 'BLACKJACK', 'CHIPS', 'CROUPIER', 'DEALER', 'DICE',
      'JACKPOT', 'POKER', 'ROULETTE', 'SHUFFLE', 'SLOTS', 'WAGER',
      'STAKE', 'BACCARAT', 'PITBOSS',
    ],
  },
  {
    id: 'theater',
    place: 'grand old theater',
    titles: ['Murder at the Matinee', 'The Theater Case', 'Curtain Call', 'Break a Leg', 'The Final Act'],
    keywords: ['Theater', 'Matinee', 'Curtain Call', 'Break a Leg', 'Final Act'],
    rooms: ['Dressing Room', 'Orchestra Pit', 'Fly Loft', 'Balcony', 'Box Office'],
    weapons: ['Sandbag', 'Prop Sword', 'Counterweight', 'Curtain Rope', 'Spotlight'],
    words: [
      'ACT', 'AISLE', 'APPLAUSE', 'BALCONY', 'CURTAIN', 'INTERMISSION',
      'MATINEE', 'PLAYBILL', 'REHEARSAL', 'SPOTLIGHT', 'STAGE', 'USHER',
      'ORCHESTRA', 'ENCORE',
    ],
  },
  {
    id: 'museum',
    place: 'natural history museum',
    titles: ['The Museum Murder', 'Night at the Museum', 'A Priceless Death', 'The Curator\'s Curse', 'After Hours'],
    keywords: ['Museum', 'Priceless', 'Curator'],
    rooms: ['Egyptian Wing', 'Dinosaur Hall', 'Storage Vault', 'Restoration Lab', 'Gift Shop'],
    weapons: ['Ceremonial Dagger', 'Marble Bust', 'Stone Axe', 'Bronze Statuette', 'Spear'],
    words: [
      'ARTIFACT', 'CURATOR', 'EXHIBIT', 'FOSSIL', 'GALLERY', 'MARBLE',
      'MUMMY', 'PAINTING', 'RELIC', 'SCULPTURE', 'TICKET', 'TOUR',
      'DINOSAUR', 'PLINTH',
    ],
  },
  {
    id: 'farm',
    place: 'run-down dairy farm',
    titles: ['The Farm Murder', 'Harvest of Death', 'Blood on the Wheat', 'Buried in the Barn', 'What the Scarecrow Saw'],
    keywords: ['Farm', 'Harvest', 'Wheat', 'Barn', 'Scarecrow'],
    rooms: ['Hayloft', 'Milking Shed', 'Silo', 'Tool Shed', 'Root Cellar'],
    weapons: ['Pitchfork', 'Scythe', 'Shovel', 'Rat Poison', 'Branding Iron'],
    words: [
      'BARN', 'CATTLE', 'CROPS', 'HARVEST', 'HAY', 'LOAM', 'ORCHARD',
      'PLOW', 'SCYTHE', 'STABLE', 'TRACTOR', 'WHEAT', 'SILO', 'GRAIN',
      'FALLOW',
    ],
  },
  {
    id: 'lighthouse',
    place: 'lonely lighthouse',
    titles: ['The Lighthouse Keeper', 'Dark Beacon', 'A Light Went Out', 'The Keeper\'s Log', 'Fog Warning'],
    keywords: ['Lighthouse', 'Beacon', 'Keeper', 'A Light Went Out'],
    rooms: ['Lamp Room', 'Spiral Stair', 'Keeper Cottage', 'Boathouse', 'Oil Store'],
    weapons: ['Boat Hook', 'Kerosene Lamp', 'Spyglass', 'Pipe Wrench', 'Anchor'],
    words: [
      'BEACON', 'COAST', 'FOG', 'HORN', 'KEROSENE', 'LAMP', 'LENS',
      'ROCKS', 'SHORE', 'SPIRAL', 'WAVES', 'GALLEY', 'KEEPER', 'STORM',
      'TIDE',
    ],
  },
  {
    id: 'hotel',
    place: 'grand hotel',
    titles: ['The Hotel Murder', 'Room 313', 'Do Not Disturb', 'Checkout Time', 'The Night Porter'],
    keywords: ['Hotel', 'Room 313', 'Do Not Disturb', 'Checkout', 'Porter'],
    rooms: ['Penthouse', 'Lobby', 'Laundry', 'Elevator', 'Ballroom'],
    weapons: ['Ice Bucket', 'Curtain Cord', 'Pillow', 'Champagne Bottle', 'Hair Dryer'],
    words: [
      'BELLHOP', 'CONCIERGE', 'ELEVATOR', 'KEY', 'LOBBY', 'LUGGAGE',
      'MAID', 'MINIBAR', 'PORTER', 'SUITE', 'TOWEL', 'VALET',
      'TURNDOWN', 'REGISTER', 'PENTHOUSE',
    ],
  },
  {
    id: 'carnival',
    place: 'midway carnival',
    titles: ['The Carnival Murder', 'Death at the Midway', 'A Fatal Ride', 'The Ferris Wheel Stopped', 'Step Right Up'],
    keywords: ['Carnival', 'Midway', 'Ferris Wheel', 'Step Right Up'],
    rooms: ['Ferris Wheel', 'Carousel', 'Ghost Train', 'Ticket Booth', 'Games Tent'],
    weapons: ['Mallet', 'Dart', 'Tent Pole', 'Candy Apple', 'Balloon Pump'],
    words: [
      'BALLOON', 'CAROUSEL', 'COTTONCANDY', 'FERRIS', 'GAMES', 'MIDWAY',
      'POPCORN', 'PRIZE', 'RIDE', 'TICKET', 'BARKER', 'FUNHOUSE',
      'SODA', 'RINGTOSS',
    ],
  },
  {
    id: 'train',
    place: 'overnight express train',
    titles: ['Murder on the Night Express', 'The Sleeper Car', 'Last Stop', 'The Midnight Line', 'Next Stop, Murder'],
    keywords: ['Train', 'Express', 'Sleeper Car', 'Last Stop', 'Next Stop'],
    rooms: ['Sleeper Car', 'Dining Car', 'Baggage Car', 'Observation Car', 'Caboose'],
    weapons: ['Coal Shovel', 'Lantern', 'Railroad Spike', 'Sleeping Draught', 'Steak Knife'],
    words: [
      'BERTH', 'BOXCAR', 'CONDUCTOR', 'ENGINE', 'PLATFORM', 'RAIL',
      'SLEEPER', 'TICKET', 'TRACK', 'TUNNEL', 'WHISTLE', 'CABOOSE',
      'DININGCAR', 'CROSSING',
    ],
  },
  {
    id: 'courtroom',
    place: 'county courtroom',
    titles: ['The Courtroom Murder', 'Contempt of Court', 'A Hostile Witness', 'Order in the Court', 'The Closing Argument'],
    keywords: ['Courtroom', 'Court', 'Witness', 'Closing Argument'],
    rooms: ['Chambers', 'Jury Room', 'Holding Cell', 'Records Room', 'Witness Stand'],
    weapons: ['Gavel', 'Fountain Pen', 'Law Book', 'Nightstick', 'Brass Scales'],
    words: [
      'ALIBI', 'BAILIFF', 'DEFENSE', 'EVIDENCE', 'GAVEL', 'JUDGE',
      'JURY', 'OATH', 'OBJECTION', 'VERDICT', 'WITNESS', 'DOCKET',
      'STENO', 'RECESS',
    ],
  },
  {
    id: 'newsroom',
    place: 'city newsroom',
    titles: ['The Newsroom Murder', 'Stop the Presses', 'Deadline: Midnight', 'Hold the Front Page', 'Late Edition'],
    keywords: ['Newsroom', 'Presses', 'Deadline', 'Front Page', 'Edition'],
    rooms: ['Press Room', 'Darkroom', 'Morgue', 'Corner Office', 'Mailroom'],
    weapons: ['Typewriter', 'Paper Spike', 'Letter Opener', 'Printing Plate', 'Poisoned Coffee'],
    words: [
      'COLUMN', 'DEADLINE', 'EDITOR', 'HEADLINE', 'INK', 'LEAD',
      'PRESS', 'PRINT', 'SOURCE', 'TYPESET', 'BYLINE', 'COPYBOY',
      'REPORTER', 'OBIT',
    ],
  },
  {
    id: 'hospital',
    place: 'county hospital',
    titles: ['The Hospital Murder', 'A Fatal Dose', 'Code Blue', 'Visiting Hours', 'Do No Harm'],
    keywords: ['Hospital', 'Code Blue', 'Fatal Dose', 'Visiting Hours', 'Do No Harm'],
    rooms: ['Operating Room', 'Morgue', 'Pharmacy', 'Supply Closet', 'Recovery Ward'],
    weapons: ['Scalpel', 'Syringe', 'Oxygen Tank', 'Bone Saw', 'Stethoscope'],
    words: [
      'CLINIC', 'DOSE', 'NURSE', 'PATIENT', 'SCALPEL', 'SURGEON',
      'SUTURE', 'THERAPY', 'VITALS', 'WARD', 'XRAY', 'GURNEY',
      'ORDERLY', 'RECOVERY',
    ],
  },
  {
    id: 'camp',
    place: 'lakeside campground',
    titles: ['The Campground Murder', 'Dead of Night', 'The Last Campfire', 'Ghost Stories', 'Lights Out at Camp'],
    keywords: ['Campground', 'Campfire', 'Camp', 'Ghost Stories'],
    rooms: ['Boathouse', 'Mess Hall', 'Ranger Station', 'Fire Pit', 'Bunk Cabin'],
    weapons: ['Hatchet', 'Canoe Paddle', 'Hunting Knife', 'Tent Stake', 'Poison Berries'],
    words: [
      'CANOE', 'CAMPFIRE', 'CANTEEN', 'LANTERN', 'MOSQUITO', 'TENT',
      'TRAIL', 'WILDERNESS', 'COMPASS', 'FIREWOOD', 'SLEEPINGBAG',
      'RANGER', 'PADDLE',
    ],
  },
  {
    id: 'harbor',
    place: 'foggy harbor',
    titles: ['The Harbor Murder', 'Low Tide', 'Dead in the Water', 'Shipped Out', 'The Fisherman\'s Knot'],
    keywords: ['Harbor', 'Docks', 'Wharf', 'Low Tide', 'Fisherman'],
    rooms: ['Docks', 'Pier', 'Fish Market', 'Warehouse', 'Crane Cab'],
    weapons: ['Cargo Hook', 'Crowbar', 'Anchor Chain', 'Fillet Knife', 'Mooring Rope'],
    words: [
      'ANCHOR', 'BUOY', 'CARGO', 'DOCK', 'FERRY', 'HULL', 'MOORING',
      'ROPE', 'TIDE', 'WHARF', 'CRANE', 'FOGHORN', 'TRAWLER', 'NETS',
    ],
  },
  {
    id: 'opera',
    place: 'grand opera house',
    titles: ['The Opera Murder', 'A Fatal Aria', 'Murder in Mezzanine', 'Death of a Diva', 'High C'],
    keywords: ['Opera', 'Aria', 'Mezzanine', 'Diva', 'High C'],
    rooms: ['Royal Box', 'Wardrobe', 'Rehearsal Hall', 'Backstage', 'Grand Foyer'],
    weapons: ['Chandelier', 'Hatpin', 'Baton', 'Poisoned Lozenge', 'Costume Sword'],
    words: [
      'ARIA', 'BARITONE', 'CHORUS', 'COSTUME', 'LIBRETTO', 'MEZZANINE',
      'OVERTURE', 'PROGRAM', 'SOPRANO', 'DIVA', 'FALSETTO', 'SCORE',
      'ENCORE', 'TENOR',
    ],
  },
  {
    id: 'rodeo',
    place: 'county rodeo',
    titles: ['The Rodeo Murder', 'Eight Seconds', 'Thrown', 'Bucked', 'Saddled with Murder'],
    keywords: ['Rodeo', 'Eight Seconds', 'Bucked', 'Saddled'],
    rooms: ['Stables', 'Bull Pen', 'Chutes', 'Grandstand', 'Tack Room'],
    weapons: ['Lasso', 'Branding Iron', 'Horseshoe', 'Bullwhip', 'Six Shooter'],
    words: [
      'BRONCO', 'BUCKLE', 'CORRAL', 'LASSO', 'RIDER', 'SPURS',
      'STAMPEDE', 'STEER', 'BARREL', 'CLOWN', 'CHUTE', 'LARIAT',
      'SADDLE', 'ARENA',
    ],
  },
  {
    id: 'speakeasy',
    place: 'underground speakeasy',
    titles: ['The Speakeasy Murder', 'Whisper the Password', 'Bathtub Gin', 'Last Call', 'The Bootlegger\'s Ledger'],
    keywords: ['Speakeasy', 'Bathtub Gin', 'Password', 'Bootlegger', 'Last Call'],
    rooms: ['Back Room', 'Cellar', 'Secret Tunnel', 'Coat Room', 'Bar'],
    weapons: ['Tommy Gun', 'Brass Knuckles', 'Poisoned Gin', 'Ice Pick', 'Broken Bottle'],
    words: [
      'BOOTLEG', 'FLAPPER', 'GIN', 'HIDDEN', 'JAZZ', 'PASSWORD',
      'TAPROOM', 'VELVET', 'WHISKEY', 'RAID', 'STILL', 'MOONSHINE',
      'HOOCH', 'COVERCHARGE',
    ],
  },
  {
    id: 'garden',
    place: 'botanical garden',
    titles: ['The Garden Murder', 'A Bed of Roses', 'Deadly Nightshade', 'Poison Ivy', 'Pushing Up Daisies'],
    keywords: ['Garden', 'Roses', 'Nightshade', 'Poison Ivy', 'Daisies'],
    rooms: ['Greenhouse', 'Rose Garden', 'Potting Shed', 'Hedge Maze', 'Lily Pond'],
    weapons: ['Garden Shears', 'Trowel', 'Weedkiller', 'Nightshade', 'Rake'],
    words: [
      'BLOOM', 'FERN', 'GARDEN', 'GREENHOUSE', 'LILY', 'ORCHID',
      'PETAL', 'POLLEN', 'TULIP', 'VINE', 'PRUNER', 'TERRARIUM',
      'MULCH', 'TRELLIS',
    ],
  },
  {
    id: 'boxing',
    place: 'smoky boxing gym',
    titles: ['The Boxing Gym Murder', 'A Knockout', 'Down for the Count', 'The Final Round', 'Below the Belt'],
    keywords: ['Boxing', 'Knockout', 'Down for the Count', 'Round', 'Below the Belt'],
    rooms: ['Ring', 'Locker Room', 'Showers', 'Weight Room', 'Back Alley'],
    weapons: ['Dumbbell', 'Jump Rope', 'Loaded Glove', 'Corner Stool', 'Brass Bell'],
    words: [
      'BELL', 'BOUT', 'CANVAS', 'CORNER', 'GLOVES', 'JAB', 'PUNCH',
      'RING', 'SPAR', 'UPPERCUT', 'SPEEDBAG', 'REFEREE', 'FEINT',
      'MOUTHPIECE',
    ],
  },
  {
    id: 'chess',
    place: 'old chess club',
    titles: ['The Chess Club Murder', 'Checkmate', 'A Fatal Gambit', 'Endgame', 'The Poisoned Pawn'],
    keywords: ['Chess', 'Checkmate', 'Gambit', 'Endgame', 'Pawn'],
    rooms: ['Tournament Hall', 'Smoking Room', 'Trophy Room', 'Analysis Room', 'Cloakroom'],
    weapons: ['Chess Clock', 'Marble Rook', 'Trophy', 'Poisoned Tea', 'Chessboard'],
    words: [
      'BISHOP', 'BOARD', 'CASTLE', 'CHECK', 'GAMBIT', 'KING', 'KNIGHT',
      'MATE', 'PAWN', 'QUEEN', 'ROOK', 'ENDGAME', 'BLITZ', 'SACRIFICE',
    ],
  },
  {
    id: 'diner',
    place: 'all-night diner',
    titles: ['The Diner Murder', 'Coffee and Corpses', 'Order Up', 'The Late Shift', 'Blue Plate Special'],
    keywords: ['Diner', 'Order Up', 'Coffee', 'Blue Plate', 'Late Shift'],
    rooms: ['Kitchen', 'Corner Booth', 'Freezer', 'Parking Lot', 'Stockroom'],
    weapons: ['Frying Pan', 'Meat Cleaver', 'Coffee Pot', 'Poisoned Pie', 'Spatula'],
    words: [
      'BOOTH', 'COFFEE', 'COUNTER', 'GRIDDLE', 'JUKEBOX', 'MILKSHAKE',
      'PANCAKE', 'PIE', 'PLATTER', 'WAITRESS', 'KETCHUP', 'NAPKIN',
      'TOASTER', 'CHECKPLEASE',
    ],
  },
  {
    id: 'drivein',
    place: 'moonlight drive-in',
    titles: ['The Drive-In Murder', 'Double Feature', 'Death at Dusk', 'The Late Show', 'Fade to Black'],
    keywords: ['Drive-In', 'Double Feature', 'Late Show', 'Fade to Black'],
    rooms: ['Projection Booth', 'Snack Bar', 'Back Row', 'Box Office', 'Parking Lot'],
    weapons: ['Film Reel', 'Tire Iron', 'Speaker Cord', 'Poisoned Soda', 'Car Jack'],
    words: [
      'CONCESSION', 'FENDER', 'FEATURE', 'HORNS', 'MOVIE', 'PROJECTOR',
      'SCREEN', 'SODA', 'TRAILER', 'MARQUEE', 'REEL', 'DUSK', 'SPEAKER',
    ],
  },
  {
    id: 'fairground',
    place: 'county fairground',
    titles: ['The Fairground Murder', 'A Fatal Attraction', 'Funhouse', 'Hall of Mirrors', 'Blue Ribbon Killer'],
    keywords: ['Fairground', 'Funhouse', 'Attraction', 'Mirrors', 'Blue Ribbon'],
    rooms: ['Mirror Maze', 'Livestock Barn', 'Strongman Tent', 'Funhouse', 'Prize Booth'],
    weapons: ['Sledgehammer', 'Broken Mirror', 'Pitchfork', 'Carving Knife'],
    words: [
      'BARKER', 'BOOTH', 'FERRIS', 'FUNHOUSE', 'MIRROR', 'PRIZE',
      'RIDES', 'TICKETS', 'STRONGMAN', 'MIRRORMAZE',
      'CAROUSEL', 'MIDWAY',
    ],
  },
  {
    id: 'monastery',
    place: 'hilltop monastery',
    titles: ['The Monastery Murder', 'A Silent Vow', 'Sanctuary', 'Vespers', 'The Silent Brother'],
    keywords: ['Monastery', 'Silent Vow', 'Sanctuary', 'Vespers', 'Brother'],
    rooms: ['Chapel', 'Bell Tower', 'Scriptorium', 'Cloister', 'Crypt'],
    weapons: ['Candlestick', 'Censer', 'Bell Rope', 'Rosary', 'Poisoned Wine'],
    words: [
      'ABBEY', 'BELL', 'CANDLE', 'CELL', 'CHAPEL', 'CHOIR', 'CLOISTER',
      'MONK', 'PRAYER', 'VESPERS', 'SCRIPTORIUM',
      'NOVICE', 'HYMN', 'FRIAR',
    ],
  },
  {
    id: 'observatory',
    place: 'clifftop observatory',
    titles: ['The Observatory Murder', 'A Falling Star', 'Written in the Stars', 'Dark Skies', 'The Event Horizon'],
    keywords: ['Observatory', 'Falling Star', 'the Stars', 'Skies', 'Horizon'],
    rooms: ['Dome', 'Control Room', 'Catwalk', 'Darkroom', 'Map Room'],
    weapons: ['Meteorite', 'Sextant', 'Tripod', 'Brass Telescope', 'Celestial Globe'],
    words: [
      'COMET', 'DOME', 'LENS', 'LUNAR', 'ORBIT', 'PLANET', 'SATELLITE',
      'STAR', 'TELESCOPE', 'ZODIAC', 'ECLIPSE', 'NEBULA', 'COSMOS',
    ],
  },
  {
    id: 'tailor',
    place: 'savile row tailor shop',
    titles: ['The Tailor Murder', 'Cut to Fit', 'A Perfect Fit', 'Hemmed In', 'Loose Threads'],
    keywords: ['Tailor', 'Fit', 'Hemmed', 'Threads'],
    rooms: ['Fitting Room', 'Cutting Room', 'Stockroom', 'Shopfront', 'Back Office'],
    weapons: ['Tailor Shears', 'Tape Measure', 'Pressing Iron', 'Poisoned Needle'],
    words: [
      'BOBBIN', 'BUTTON', 'FABRIC', 'NEEDLE', 'PATTERN', 'PIN', 'SEAM',
      'SILK', 'STITCH', 'THIMBLE', 'THREAD', 'TWEED', 'LAPEL', 'HEM',
    ],
  },
]

/**
 * Title templates built from the theme's place ({place}); used alongside the
 * theme's own titles. Never reference a case's location or weapon.
 */
export const PLACE_TITLE_TEMPLATES = [
  'Death at the {place}',
  'Murder at the {place}',
  'The {place} Affair',
]

/**
 * Fallback templates ({victim}, {motive}) that keep 150 titles unique when a
 * theme's own titles run out. Theme-neutral, so they can't contradict a story.
 */
export const CASE_TITLE_TEMPLATES = [
  'Who Killed {victim}?',
  'The {victim} File',
  'The {victim} Mystery',
  'What Happened to {victim}',
  'The Night {victim} Died',
  'The {motive} Motive',
  'A {motive} Killing',
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
