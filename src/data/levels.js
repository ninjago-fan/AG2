// Level layouts.
//
// Each level is described by ground segments, floating platforms and entity
// positions, and buildLevelMap() turns that into an array of strings (one per
// tile row). The game reads the strings.
//
// Map legend:
//   .  empty            #  ground            =  floating platform / stepping stone
//   P  player start     C  treasure chest    K  boss (type set by `boss`)
//   s  slime            b  bat               a  skeleton archer
//   g  gem crab         m  golemite          n  ninja
//   O  ogre             F  governmental guard
//   A  alien            B  alien guard       R  robot             X  glitch mob
//   o  gold coin        G  gem               h  health potion     H  heart container
//   r  the level's rune (set by `rune`)      Q  portal to the bonus level
//   1-9 weapon pickup (1 dagger, 2 sword, 3 hammer, 4 bow, 5 fire wand,
//                      6 battle axe, 7 throwing axe, 8 bombs, 9 boom-arang)
//   i j k l v  wand pickup (ice, earth, air, lightning, void)
//
// In the later levels an entity can leave out its row: it then stands on the
// ground (or stepping stone) at its column.
//
// Not part of the map strings (drawn on top of it):
//   secrets   [x0, y0, x1, y1]        fake walls: look solid, but you can walk
//                                     straight into them. They hide treasure.
//   runeWalls [x0, y0, x1, y1, rune]  vault walls. Solid (but harmless: they
//                                     bounce you back) until you own the rune,
//                                     then they work like a secret.
//
// Coordinates are in tiles: column x (0 = far left), row y (0 = top).
// The screen is 30 x 17 tiles. Row 14 is the normal ground surface.
// A level with a boss ends in a flat arena exactly one screen wide.
//
// Platform rule: touching a solid tile from the side or from below kills the
// player (clipping just a corner bounces you off instead), so layouts never
// require walking into a wall. Height changes only happen across pits (you
// land on top), and floating stones sit over pits so you can't bump your head.

const TILE = 16;
const LEVEL_ROWS = 17;
const ARENA_WIDTH = 30;

const LEVEL_DEFS = [
  {
    name: 'Green Meadow',
    theme: 0,
    width: 132,
    difficulty: { enemySpeed: 0.85, fireRate: 1.3, swoop: 0.8, hpBonus: 0 },
    rune: 'earth',
    boss: 'golem',
    // [firstColumn, lastColumn, surfaceRow]
    ground: [
      [0, 21, 14],
      [24, 40, 14],
      [44, 58, 14],
      [67, 131, 14],
    ],
    // [column, row, length]
    platforms: [
      [62, 14, 3],
    ],
    secrets: [
      [76, 11, 80, 13],     // mound hiding the Earth Rune
    ],
    runeWalls: [],
    // [char, column, row]
    entities: [
      ['P', 2, 13],
      ['o', 6, 13], ['o', 8, 13], ['o', 10, 13],
      ['2', 18, 13],
      ['s', 14, 13],
      ['o', 22, 12], ['o', 23, 12],
      ['o', 30, 13], ['o', 31, 13],
      ['s', 34, 13],
      ['o', 41, 11], ['o', 42, 11], ['o', 43, 11],
      ['s', 50, 13],
      ['o', 52, 13], ['o', 54, 13],
      ['h', 56, 13],
      ['o', 60, 11], ['o', 62, 12], ['o', 63, 12], ['o', 65, 11],
      ['H', 70, 13],
      ['o', 77, 13], ['r', 78, 13], ['o', 79, 13], ['G', 78, 12],
      ['s', 84, 13],
      ['m', 88, 13],
      ['b', 90, 9],
      ['6', 94, 13],
      ['o', 97, 13], ['o', 98, 13], ['o', 99, 13],
      // boss arena: columns 102-131
      ['K', 124, 13],
      ['C', 128, 13],
    ],
  },
  {
    name: 'Crystal Cave',
    theme: 1,
    width: 144,
    difficulty: { enemySpeed: 1, fireRate: 1, swoop: 1, hpBonus: 0 },
    rune: 'crystal',
    boss: 'crystalCrab',
    ground: [
      [0, 18, 14],
      [22, 36, 13],
      [40, 52, 14],
      [60, 74, 12],
      [78, 92, 14],
      [99, 143, 14],
    ],
    platforms: [
      [55, 13, 3],
      [95, 13, 3],
    ],
    secrets: [
      [44, 11, 46, 13],     // hides the Crystal Rune
    ],
    runeWalls: [
      [84, 12, 85, 13, 'earth'],
    ],
    entities: [
      ['P', 2, 13],
      ['4', 7, 13],
      ['Q', 12, 10],        // bonus portal, floating: jump into it
      ['s', 15, 13],
      ['o', 20, 11], ['o', 21, 11],
      ['b', 26, 8],
      ['g', 29, 12],
      ['a', 34, 12],
      ['o', 38, 11],
      ['h', 44, 13], ['r', 45, 13], ['o', 46, 13],
      ['b', 48, 8],
      ['s', 50, 13],
      ['o', 55, 11], ['o', 56, 11],
      ['H', 61, 11],
      ['o', 63, 11], ['o', 64, 11], ['o', 65, 11],
      ['b', 66, 7],
      ['g', 68, 11],
      ['a', 71, 11],
      ['o', 76, 10],
      ['o', 80, 13], ['o', 81, 13],
      ['h', 82, 13],
      ['G', 84, 13], ['G', 85, 13], ['G', 84, 12], ['G', 85, 12],
      ['b', 88, 8],
      ['s', 89, 13],
      ['a', 91, 13],
      ['o', 95, 11], ['o', 96, 11],
      ['g', 102, 13],
      ['a', 105, 13],
      ['b', 106, 8],
      ['o', 109, 13], ['o', 110, 13],
      // boss arena: columns 114-143
      ['K', 134, 13],
      ['C', 140, 13],
    ],
  },
  {
    name: 'Shadow Castle',
    theme: 2,
    width: 156,
    difficulty: { enemySpeed: 1.25, fireRate: 0.75, swoop: 1.2, hpBonus: 1 },
    rune: 'shadow',
    boss: 'stranger',
    ground: [
      [0, 16, 14],
      [20, 32, 13],
      [37, 50, 13],
      [57, 70, 11],
      [75, 86, 14],
      [94, 104, 12],
      [108, 155, 14],
    ],
    platforms: [
      [53, 12, 3],
      [90, 13, 3],
    ],
    secrets: [
      [81, 11, 83, 13],     // hides the Shadow Rune
    ],
    runeWalls: [
      [116, 12, 117, 13, 'crystal'],
    ],
    entities: [
      ['P', 2, 13],
      ['3', 9, 13],
      ['s', 12, 13],
      ['o', 18, 11], ['o', 19, 11],
      ['b', 18, 8],
      ['s', 26, 12],
      ['a', 31, 12],
      ['o', 34, 10], ['o', 35, 10],
      ['b', 35, 7],
      ['h', 40, 12],
      ['n', 44, 12],
      ['a', 48, 12],
      ['o', 53, 10], ['o', 54, 10],
      ['b', 54, 6],
      ['5', 60, 10],
      ['o', 63, 10], ['o', 64, 10],
      ['H', 66, 10],
      ['a', 68, 10],
      ['o', 72, 9], ['o', 73, 9],
      ['b', 72, 6],
      ['h', 76, 13],
      ['o', 77, 13], ['o', 78, 13],
      ['n', 79, 13],
      ['o', 81, 13], ['r', 82, 13], ['G', 83, 13],
      ['a', 85, 13],
      ['b', 88, 8],
      ['o', 90, 11], ['o', 91, 11],
      ['h', 95, 11],
      ['o', 96, 11], ['o', 97, 11],
      ['s', 99, 11],
      ['8', 101, 11],
      ['a', 102, 11],
      ['b', 106, 8],
      ['o', 110, 13], ['o', 111, 13],
      ['n', 113, 13],
      ['H', 116, 13], ['G', 117, 13], ['G', 116, 12], ['G', 117, 12],
      ['b', 119, 8],
      ['a', 121, 13],
      // boss arena: columns 126-155
      ['K', 146, 13],
      ['C', 152, 13],
    ],
  },
  {
    name: "Dragon's Peak",
    theme: 3,
    width: 140,
    difficulty: { enemySpeed: 1.35, fireRate: 0.7, swoop: 1.3, hpBonus: 1 },
    boss: 'dragon',
    ground: [
      [0, 14, 14],
      [18, 30, 13],
      [34, 44, 12],
      [49, 60, 14],
      [64, 76, 13],
      [81, 92, 11],
      [96, 106, 14],
      [110, 139, 14],
    ],
    platforms: [],
    secrets: [
      [89, 8, 91, 10],
    ],
    runeWalls: [
      [69, 11, 70, 12, 'shadow'],
    ],
    entities: [
      ['P', 2, 13],
      ['7', 7, 13],
      ['n', 11, 13],
      ['o', 16, 11], ['o', 17, 11],
      ['m', 23, 12],
      ['b', 25, 8],
      ['a', 29, 12],
      ['o', 32, 10],
      ['g', 38, 11],
      ['o', 40, 11], ['o', 41, 11],
      ['n', 43, 11],
      ['h', 51, 13],
      ['m', 55, 13],
      ['b', 57, 8],
      ['a', 59, 13],
      ['o', 62, 11],
      ['g', 66, 12],
      ['H', 69, 12], ['G', 70, 12], ['G', 69, 11], ['G', 70, 11],
      ['n', 74, 12],
      ['o', 78, 9], ['o', 79, 9],
      ['n', 82, 10],
      ['o', 83, 10], ['o', 84, 10],
      ['a', 86, 10],
      ['b', 87, 6],
      ['h', 89, 10], ['G', 90, 10], ['G', 91, 10],
      ['o', 98, 13], ['o', 99, 13],
      ['m', 100, 13],
      ['b', 102, 8],
      ['n', 104, 13],
      // boss arena: columns 110-139
      ['K', 128, 7],
      ['C', 136, 13],
    ],
  },
  {
    name: 'The Dark Forest',
    theme: 5,
    width: 150,
    difficulty: { enemySpeed: 1.35, fireRate: 0.75, swoop: 1.25, hpBonus: 1 },
    rune: 'water',
    boss: 'hauntedTree',
    ground: [
      [0, 17, 14], [21, 33, 13], [37, 50, 14], [54, 64, 12],
      [68, 82, 14], [87, 98, 13], [102, 149, 14],
    ],
    platforms: [[84, 13, 2]],
    secrets: [[43, 11, 45, 13]],
    runeWalls: [[92, 11, 93, 12, 'shadow']],
    entities: [
      ['P', 2], ['o', 5], ['o', 6], ['i', 9], ['O', 14],
      ['o', 18, 11], ['o', 19, 10], ['o', 20, 11],
      ['b', 25, 8], ['o', 24], ['o', 25], ['s', 30],
      ['o', 34, 10], ['o', 35, 9], ['o', 36, 10],
      ['a', 40], ['o', 43], ['r', 44], ['G', 45], ['h', 48],
      ['o', 51, 11], ['o', 52, 10], ['o', 53, 11],
      ['O', 58], ['b', 61, 6], ['H', 63],
      ['o', 65, 10], ['o', 66, 9], ['o', 67, 10],
      ['s', 72], ['O', 78], ['o', 80], ['o', 81],
      ['o', 84, 11], ['o', 85, 11],
      ['a', 90], ['G', 92, 12], ['G', 93, 12], ['G', 92, 11], ['G', 93, 11],
      ['b', 96, 7], ['h', 97],
      ['o', 99, 11], ['o', 100, 10], ['o', 101, 11],
      ['O', 106], ['b', 110, 8], ['s', 113], ['o', 115], ['o', 116], ['o', 117],
      // boss arena: columns 120-149
      ['K', 138], ['C', 145],
    ],
  },
  {
    name: 'Area 51.2',
    theme: 6,
    width: 150,
    difficulty: { enemySpeed: 1.4, fireRate: 0.7, swoop: 1.3, hpBonus: 1 },
    rune: 'ice',
    boss: 'gateGuard',
    ground: [
      [0, 16, 14], [20, 31, 14], [35, 46, 13], [50, 58, 11],
      [62, 75, 13], [79, 90, 14], [95, 104, 12], [108, 149, 14],
    ],
    platforms: [[92, 13, 2]],
    secrets: [[69, 10, 71, 12]],
    runeWalls: [[84, 12, 85, 13, 'water']],
    entities: [
      ['P', 2], ['o', 5], ['o', 6], ['9', 8], ['F', 13],
      ['o', 17, 11], ['o', 18, 10], ['o', 19, 11],
      ['s', 24], ['o', 26], ['o', 27], ['F', 29],
      ['o', 32, 10], ['o', 33, 10], ['o', 34, 10],
      ['h', 38], ['b', 40, 8], ['F', 44],
      ['o', 47, 9], ['o', 48, 8], ['o', 49, 9],
      ['H', 52], ['A', 56],
      ['o', 59, 9], ['o', 60, 9], ['o', 61, 10],
      ['F', 65], ['o', 69], ['r', 70], ['G', 71], ['b', 73, 7],
      ['o', 77, 11], ['o', 78, 11],
      ['s', 81], ['G', 84, 13], ['G', 85, 13], ['G', 84, 12], ['G', 85, 12], ['F', 88],
      ['o', 92, 11], ['o', 93, 11],
      ['h', 97], ['A', 100], ['b', 102, 7],
      ['o', 105, 10], ['o', 106, 10], ['o', 107, 11],
      ['F', 111], ['s', 115], ['o', 117], ['o', 118],
      // boss arena: columns 120-149
      ['K', 136], ['C', 145],
    ],
  },
  {
    name: 'Alien Planet',
    theme: 7,
    width: 150,
    difficulty: { enemySpeed: 1.45, fireRate: 0.7, swoop: 1.3, hpBonus: 2 },
    rune: 'air',
    boss: 'giantAlien',
    ground: [
      [0, 15, 14], [19, 28, 12], [32, 44, 13], [48, 56, 14],
      [60, 72, 12], [76, 86, 13], [91, 102, 14], [106, 149, 14],
    ],
    platforms: [[88, 13, 2]],
    secrets: [[38, 10, 40, 12]],
    runeWalls: [[96, 12, 97, 13, 'ice']],
    entities: [
      ['P', 2], ['o', 5], ['k', 8], ['A', 12],
      ['o', 16, 11], ['o', 17, 10], ['o', 18, 9],
      ['s', 22], ['o', 24], ['o', 25], ['A', 27],
      ['o', 29, 10], ['o', 30, 10], ['o', 31, 11],
      ['b', 35, 7], ['o', 38], ['r', 39], ['G', 40], ['A', 43],
      ['o', 45, 11], ['o', 46, 11], ['o', 47, 12],
      ['h', 50], ['s', 54],
      ['o', 57, 11], ['o', 58, 10], ['o', 59, 9],
      ['A', 63], ['H', 66], ['b', 68, 6], ['A', 71],
      ['o', 73, 9], ['o', 74, 10], ['o', 75, 10],
      ['s', 79], ['o', 82], ['o', 83], ['A', 85],
      ['o', 88, 11], ['o', 89, 11],
      ['A', 93], ['G', 96, 13], ['G', 97, 13], ['G', 96, 12], ['G', 97, 12],
      ['b', 99, 8], ['h', 100],
      ['o', 103, 12], ['o', 104, 12], ['o', 105, 12],
      ['A', 110], ['b', 112, 8], ['s', 114], ['o', 116], ['o', 117],
      // boss arena: columns 120-149
      ['K', 134], ['C', 145],
    ],
  },
  {
    name: 'Alien Castle',
    theme: 8,
    width: 156,
    difficulty: { enemySpeed: 1.5, fireRate: 0.65, swoop: 1.35, hpBonus: 2 },
    rune: 'undead',
    boss: 'alienKing',
    ground: [
      [0, 16, 14], [20, 30, 13], [34, 46, 13], [50, 60, 11],
      [64, 76, 13], [80, 90, 14], [94, 106, 12], [110, 155, 14],
    ],
    platforms: [],
    secrets: [[70, 10, 72, 12]],
    runeWalls: [[84, 12, 85, 13, 'air']],
    entities: [
      ['P', 2], ['o', 5], ['o', 6], ['j', 9], ['B', 13],
      ['o', 17, 11], ['o', 18, 10], ['o', 19, 11],
      ['a', 23], ['o', 26], ['b', 27, 7], ['n', 29],
      ['o', 31, 10], ['o', 32, 10], ['o', 33, 10],
      ['A', 37], ['h', 40], ['B', 44],
      ['o', 47, 9], ['o', 48, 8], ['o', 49, 9],
      ['H', 52], ['n', 57], ['b', 58, 5],
      ['o', 61, 9], ['o', 62, 10], ['o', 63, 11],
      ['a', 67], ['o', 70], ['r', 71], ['G', 72], ['B', 75],
      ['o', 77, 11], ['o', 78, 11], ['o', 79, 12],
      ['s', 82], ['G', 84, 13], ['G', 85, 13], ['G', 84, 12], ['G', 85, 12], ['B', 88],
      ['o', 91, 10], ['o', 92, 9], ['o', 93, 10],
      ['h', 96], ['A', 99], ['b', 101, 6], ['n', 104],
      ['o', 107, 10], ['o', 108, 11], ['o', 109, 12],
      ['B', 113], ['a', 118], ['o', 120], ['o', 121], ['b', 122, 8],
      // boss arena: columns 126-155
      ['K', 144, 7], ['C', 151],
    ],
  },
  {
    name: 'Technology Dimension',
    theme: 9,
    width: 156,
    difficulty: { enemySpeed: 1.55, fireRate: 0.6, swoop: 1.4, hpBonus: 2 },
    rune: 'light',
    boss: 'superComputer',
    ground: [
      [0, 15, 14], [19, 29, 14], [33, 42, 12], [46, 55, 13], [59, 70, 13],
      [74, 84, 11], [88, 99, 13], [103, 114, 14], [118, 155, 14],
    ],
    platforms: [],
    secrets: [[62, 10, 64, 12]],
    runeWalls: [[108, 12, 109, 13, 'undead']],
    entities: [
      ['P', 2], ['o', 5], ['l', 8], ['R', 12],
      ['o', 16, 11], ['o', 17, 11], ['o', 18, 11],
      ['F', 22], ['o', 25], ['o', 26], ['X', 28],
      ['o', 30, 11], ['o', 31, 10], ['o', 32, 9],
      ['R', 37], ['h', 40],
      ['o', 43, 10], ['o', 44, 10], ['o', 45, 11],
      ['X', 49], ['b', 51, 8], ['F', 54],
      ['o', 56, 11], ['o', 57, 11], ['o', 58, 11],
      ['H', 60], ['o', 62], ['r', 63], ['G', 64], ['R', 68],
      ['o', 71, 9], ['o', 72, 8], ['o', 73, 9],
      ['F', 77], ['b', 79, 5], ['X', 82],
      ['o', 85, 9], ['o', 86, 10], ['o', 87, 11],
      ['h', 90], ['R', 95],
      ['o', 100, 11], ['o', 101, 11], ['o', 102, 12],
      ['s', 105], ['G', 108, 13], ['G', 109, 13], ['G', 108, 12], ['G', 109, 12], ['F', 112],
      ['o', 115, 12], ['o', 116, 12], ['o', 117, 12],
      ['X', 120], ['R', 123], ['o', 124], ['o', 125],
      // boss arena: columns 126-155
      ['K', 146], ['C', 136],
    ],
  },
  {
    name: 'The Time-Space Continuum',
    theme: 10,
    width: 160,
    difficulty: { enemySpeed: 1.6, fireRate: 0.6, swoop: 1.4, hpBonus: 3 },
    rune: 'time',
    boss: 'masterOfTime',
    ground: [
      [0, 15, 14], [19, 28, 13], [32, 40, 11], [44, 54, 13], [58, 68, 14],
      [72, 80, 12], [84, 95, 13], [99, 108, 14], [112, 121, 12], [125, 159, 14],
    ],
    platforms: [],
    secrets: [[88, 10, 90, 12]],
    runeWalls: [[62, 12, 63, 13, 'light']],
    entities: [
      ['P', 2], ['o', 5], ['v', 8], ['X', 12],
      ['o', 16, 11], ['o', 17, 10], ['o', 18, 11],
      ['O', 22], ['o', 25], ['o', 26],
      ['o', 29, 10], ['o', 30, 9], ['o', 31, 9],
      ['X', 35], ['h', 38],
      ['o', 41, 9], ['o', 42, 10], ['o', 43, 11],
      ['B', 47], ['b', 50, 7], ['R', 53],
      ['o', 55, 11], ['o', 56, 11], ['o', 57, 12],
      ['n', 60], ['G', 62, 13], ['G', 63, 13], ['G', 62, 12], ['G', 63, 12], ['H', 66],
      ['o', 69, 11], ['o', 70, 10], ['o', 71, 10],
      ['X', 75], ['a', 79],
      ['o', 81, 10], ['o', 82, 10], ['o', 83, 11],
      ['s', 86], ['o', 88], ['r', 89], ['G', 90], ['X', 94],
      ['o', 96, 11], ['o', 97, 12], ['o', 98, 12],
      ['h', 100], ['O', 104], ['b', 106, 8],
      ['o', 109, 11], ['o', 110, 10], ['o', 111, 10],
      ['X', 115], ['A', 119],
      ['o', 122, 10], ['o', 123, 11], ['o', 124, 12],
      ['X', 127], ['o', 128],
      // boss arena: columns 130-159
      ['K', 150], ['C', 155],
    ],
  },
];

// Row an entity without a row stands in: just above the ground or stepping
// stone at its column.
function surfaceRow(def, x) {
  for (const [x0, x1, top] of def.ground) if (x >= x0 && x <= x1) return top;
  for (const [px, py, len] of def.platforms) if (x >= px && x < px + len) return py;
  console.warn(`${def.name}: no ground at column ${x}`);
  return LEVEL_ROWS - 1;
}

// The bonus level is reached through the portal in Crystal Cave (needs the
// Earth Rune). No enemies, no pits: grab as much treasure as you can before
// the timer runs out. Afterwards you go back to the start of Crystal Cave.
const BONUS_DEF = (() => {
  const entities = [['P', 2, 13], ['C', 86, 13]];
  const arc = [12, 10, 9, 10, 12];
  for (let i = 0; i < 8; i++) {
    const cx = 8 + i * 9;
    arc.forEach((row, k) => entities.push(['o', cx + k, row]));
    entities.push(['G', cx + 2, 6]);
    entities.push(['o', cx + 6, 13], ['o', cx + 7, 13]);
  }
  return {
    name: 'Sky Vault',
    theme: 4,
    width: 90,
    timeLimit: 45,
    difficulty: { enemySpeed: 1, fireRate: 1, swoop: 1, hpBonus: 0 },
    ground: [[0, 89, 14]],
    platforms: [],
    secrets: [],
    runeWalls: [],
    entities,
  };
})();

// Turn a level definition into an array of strings, one per tile row.
function buildLevelMap(def) {
  const rows = [];
  for (let y = 0; y < LEVEL_ROWS; y++) rows.push(new Array(def.width).fill('.'));

  def.ground.forEach(([x0, x1, top]) => {
    for (let x = x0; x <= x1; x++) {
      for (let y = top; y < LEVEL_ROWS; y++) rows[y][x] = '#';
    }
  });
  def.platforms.forEach(([x, y, len]) => {
    for (let i = 0; i < len; i++) rows[y][x + i] = '=';
  });
  def.entities.forEach(([ch, x, y]) => {
    if (y === undefined) y = surfaceRow(def, x) - 1;
    if (rows[y][x] !== '.') console.warn(`${def.name}: entity ${ch} at ${x},${y} overlaps a tile`);
    rows[y][x] = ch;
  });
  return rows.map(r => r.join(''));
}

const LEVELS = LEVEL_DEFS.map(def => Object.assign({}, def, { map: buildLevelMap(def) }));
const BONUS_LEVEL = Object.assign({}, BONUS_DEF, { map: buildLevelMap(BONUS_DEF) });
