// Art for the second batch of upgrades: new mobs, bosses, wands, items, pets,
// the pegasus, the shopkeeper and accessories. Same format as sprites.js:
// pixel grids for small things, shape functions for the big bosses.

// Colours added to PAL in BootScene.
const MORE_PAL = {
  F: '#2f5a28', f: '#1c3a1a',   // forest leaves
  I: '#e8f8ff',                 // ice white
  J: '#6ee06a', j: '#3a9a3a',   // alien green
  Q: '#5a6a3a', a: '#3a4426',   // olive armor
  d: '#8a9a4a', '1': '#5e6b30', // ogre skin
  h: '#00e0ff', '2': '#007a99', // neon cyan
  k: '#ff3ad0',                 // neon pink
  o: '#c0c8d0', s: '#707884', '3': '#3a404a', // robot metal
  t: '#fff2a0',                 // light gold
  w: '#5a3a1a', '4': '#3a2410', // bark
  '5': '#9adfa0',               // ghost green
  '7': '#3a8fff', '8': '#1a4a9a', // water
  '9': '#ff9ad0',               // pegasus mane
  '0': '#8a5a3a', '@': '#c08a5a', // monkey fur
  $: '#a0a0a8', '%': '#6a6a74', '&': '#f0e0c0', // rhino
  '^': '#4a2a6a',               // time robe
  '~': '#ff4040',               // laser red
};

const MORE_SPRITES = {
  // ------------------------------------------------------------ mobs
  ogre1: [
    '......dddd......',
    '.....dddddd.....',
    '.....dKddKd.....',
    '.....dddddd.....',
    '.....d1WW1d.....',
    '...dddddddddd...',
    '..dddddddddddd..',
    '.ddd1dddddd1ddd.',
    '.dd.1dddddd1.dd.',
    '.dd.dddddddd.dd.',
    '.dd.nnnnnnnn.dd.',
    '.dd.LLLLLLLL.NN.',
    '..d.LLLLLLLL.NN.',
    '....LLL..LLL.NN.',
    '....LLL..LLL.Nn.',
    '....ddd..ddd.Nn.',
    '....ddd..ddd.nn.',
    '...dddd..dddd...',
  ],
  ogre2: [
    '............NNN.',
    '......dddd.NNNN.',
    '.....dddddd.Nn..',
    '.....dRddRd.dd..',
    '.....dddddd.dd..',
    '.....d1WW1ddd...',
    '...ddddddddd....',
    '..dddddddddd....',
    '.ddd1dddddd1d...',
    '.dd.1dddddd1....',
    '.dd.dddddddd....',
    '.dd.nnnnnnnn....',
    '....LLLLLLLL....',
    '....LLLLLLLL....',
    '....LLL..LLL....',
    '....LLL..LLL....',
    '....ddd..ddd....',
    '...dddd..dddd...',
  ],
  guard1: [
    '....KKKK....',
    '...KKKKKK...',
    '...KSSSSS...',
    '...SKKSKK...',
    '...SSSSSS...',
    '....SSSS....',
    '...XXWWXX...',
    '..XXXWRXXX..',
    '..SXXWRXXS..',
    '..SXXXXXXS..',
    '...xxxxxx...',
    '...XX..XX...',
    '...XX..XX...',
    '...XX..XX...',
    '..KKK..KKK..',
    '............',
  ],
  guard_shoot: [
    '....KKKK....',
    '...KKKKKK...',
    '...KSSSSS...',
    '...SKKSKK...',
    '...SSSSSS...',
    '....SSSS....',
    '...XXWWXX...',
    '..XXXWRXXSso',
    '..SXXWRXX.s.',
    '...XXXXXX...',
    '...xxxxxx...',
    '...XX..XX...',
    '...XX..XX...',
    '...XX..XX...',
    '..KKK..KKK..',
    '............',
  ],
  alien1: [
    '...JJJJJJ...',
    '..JJJJJJJJ..',
    '.JJKKJJKKJJ.',
    '.JJKKJJKKJJ.',
    '.JJKWJJKWJJ.',
    '..JJJJJJJJ..',
    '...JJjjJJ...',
    '....JJJJ....',
    '...VVVVVV...',
    '..JVVVVVVJ..',
    '..J.VVVV.J..',
    '....J..J....',
    '....J..J....',
    '...jj..jj...',
  ],
  alien2: [
    '............',
    '...JJJJJJ...',
    '..JJJJJJJJ..',
    '.JJKKJJKKJJ.',
    '.JJKWJJKWJJ.',
    '..JJJJJJJJ..',
    '...JJjjJJ...',
    '..JVVVVVVJ..',
    '.J.VVVVVV.J.',
    '....VVVV....',
    '...J....J...',
    '..jj....jj..',
    '............',
    '............',
  ],
  aguard1: [
    '..E...ssss....',
    '.EWE.sJJJJs...',
    '..E.sJJKKJKs..',
    '..E.sJJKWJKs..',
    '..E.sJJJJJJs..',
    '..E..sJjjJs...',
    '..J.ssQQQQss..',
    '..JQQQQQQQQoo.',
    '..E.QQQQQQosso',
    '..E.QQYYQQoYso',
    '..E.QQQQQQosso',
    '..E.aaaaaaosso',
    '..E.QQ..QQ.oo.',
    '....QQ..QQ....',
    '....QQ..QQ....',
    '....JJ..JJ....',
    '...sss..sss...',
    '..............',
  ],
  robot1: [
    '......h.......',
    '......s.......',
    '...ssssssss...',
    '...soooooos...',
    '...so3hh3os...',
    '...soooooos...',
    '...ssssssss...',
    '..3ooooooo3...',
    '.3ooKoooKoo3..',
    '.3ooooooooo3..',
    '..3ooooooo3...',
    '...3333333....',
    '..s.s.s.s.s...',
    '..3s3s3s3s3...',
  ],
  glitch1: [
    '..kkkkkkk...',
    '.kkKkkkKkk..',
    '.kkWkkkWkkh.',
    'hkkkkkkkkk..',
    '.kk22222kkh.',
    '..kkkkkkk...',
    '...hhkkhh...',
    '..hhhkkhhhk.',
    '.k.hhhhhh.k.',
    '...hhkkhh...',
    '...kk..kk...',
    '..hh....hh..',
    '.kk......kk.',
    '............',
  ],

  // ------------------------------------------------------------ crystal crab (gem crab)
  crab1: [
    '.....iU..Ui.....',
    '....iUu..uUi....',
    '.WK..UUiiUU..KW.',
    '..U.iUUUUUUi.U..',
    '.UU.UiUUuUiU.UU.',
    '..iUUUuUUuUUUi..',
    '...uUUUiiUUUu...',
    '....uuuuuuuu....',
    '...u.u....u.u...',
    '..u..u....u..u..',
  ],
  crab2: [
    '.....iU..Ui.....',
    '....iUu..uUi....',
    '.WK..UUiiUU..KW.',
    '..U.iUUUUUUi.U..',
    '.UU.UiUUuUiU.UU.',
    '..iUUUuUUuUUUi..',
    '...uUUUiiUUUu...',
    '....uuuuuuuu....',
    '....u.u..u.u....',
    '....u..uu..u....',
  ],

  // ------------------------------------------------------------ projectiles
  laser: [
    '.~~~~~~~~.',
    '~WWWWWWWW~',
    '.~~~~~~~~.',
  ],
  laser_beam: [
    '.hhhhhhhhhhhhhhhhhhhh.',
    'hIIIIIIIIIIIIIIIIIIIIh',
    '.hhhhhhhhhhhhhhhhhhhh.',
  ],
  plasma: [
    '..jjj..',
    '.jJJJj.',
    'jJlWlJj',
    'jJWWWJj',
    'jJlWlJj',
    '.jJJJj.',
    '..jjj..',
  ],
  acorn: [
    '..nn..',
    '.NNNN.',
    'nNNNNn',
    '.yYYy.',
    '.YYYy.',
    '..Yy..',
    '...y..',
  ],
  data_bomb: [
    '.kkkkkk.',
    'khhhhhhk',
    'kh2hh2hk',
    'khhhhhhk',
    'kh2222hk',
    'khhhhhhk',
    'k222222k',
    '.kkkkkk.',
  ],
  clock_hand: [
    'K.........Y.',
    'KYYYYYYYYYYY',
    'K.........Y.',
  ],
  sand: [
    '.tt.',
    'tYYt',
    'tYYt',
    '.tt.',
  ],
  warn: [
    '~~~~~~~~~~~~~~',
    '~YY~YY~YY~YY~~',
    '~~~~~~~~~~~~~~',
  ],
  icebolt: [
    '..iIIi...',
    '.iIWWIIi.',
    'iIWWWWIIU',
    '.iIWWIIi.',
    '..iIIi...',
  ],
  p_boomerang: [
    '.RRR......',
    'RYRRR.....',
    '.RYRRR....',
    '..rRYRR...',
    '...rRRYRRR',
    '...rRRYRRR',
    '..rRYRR...',
    '.RYRRR....',
    'RYRRR.....',
    '.rrr......',
  ],
  coconut: [
    '.nnnn.',
    'nN@nnn',
    'nnnnnn',
    'nnKnKn',
    'nnnnnn',
    '.nnnn.',
  ],
  fireball_small: [
    '.OYO.',
    'OYWYO',
    'YWWWY',
    'OYWYO',
    '.OYO.',
  ],
  ghost: [
    '...5555...',
    '..555555..',
    '.55K55K55.',
    '.55K55K55.',
    '.55555555.',
    '.555KK555.',
    '.55555555.',
    '.55555555.',
    '.55555555.',
    '.5.55.55.5',
    '5...5..5..',
  ],
  stars: [
    '..Y.......Y..',
    '.YYY.....YYY.',
    '..Y...Y...Y..',
    '.....YYY.....',
    '......Y......',
  ],

  // ------------------------------------------------------------ items
  item_timeApple: [
    '....nM..',
    '...nMM..',
    '.RRRnRR.',
    'RRWWWRRr',
    'RWKWKWRr',
    'RWWKWWRr',
    'RRWWWRRr',
    '.RRRRRr.',
    '..rrrr..',
  ],

  // ------------------------------------------------------------ pets and mount
  pet_monkey1: [
    '...0000...',
    '..000000..',
    '.0@@00@@0.',
    '.0@K@@K@0.',
    '@0@@@@@@0@',
    '..0@@@@0..',
    '..000000..',
    '.0.0000.0.',
    '...0000...',
    '...0..0...',
    '..00..00..',
  ],
  pet_monkey2: [
    '...0000..@',
    '..000000.0',
    '.0@@00@@00',
    '.0@K@@K@0.',
    '@0@@@@@@0.',
    '..0@@@@0..',
    '..000000..',
    '.0.0000...',
    '...0000...',
    '...0..0...',
    '..00..00..',
  ],
  pet_phoenix1: [
    'O............O',
    'OO....YY....OO',
    '.OO..YRRY..OO.',
    '..OORRKRRROO..',
    '...ORRRRRRO...',
    '....RRRRRR....',
    '.....RRRR.....',
    '....OY..YO....',
    '...O..YY..O...',
    '.......Y......',
  ],
  pet_phoenix2: [
    '..............',
    '......YY......',
    '.....YRRY.....',
    '...ORRKRRRO...',
    '.OORRRRRRRROO.',
    'OO..RRRRRR..OO',
    'O....RRRR....O',
    '....OY..YO....',
    '...O..YY..O...',
    '.......Y......',
  ],
  pet_rhino1: [
    '..............&.',
    '.....$$$$$...&&.',
    '...$$$$$$$$$$&..',
    '..$$$$$$$$$K$$..',
    '.$$$$$$$$$$$$$$.',
    '%$$$$$$$$$$$$$$$',
    '.$$$$$$$$$$$$$%.',
    '..%%$$$$$$$$%%..',
    '..$$.$$..$$.$$..',
    '..$$.$$..$$.$$..',
    '..%%.%%..%%.%%..',
  ],
  pet_rhino2: [
    '..............&.',
    '.....$$$$$...&&.',
    '...$$$$$$$$$$&..',
    '..$$$$$$$$$K$$..',
    '.$$$$$$$$$$$$$$.',
    '%$$$$$$$$$$$$$$$',
    '.$$$$$$$$$$$$$%.',
    '..%%$$$$$$$$%%..',
    '...$$.$$..$$.$$.',
    '..$$..$$.$$..$$.',
    '..%%..%%.%%..%%.',
  ],
  pegasus1: [
    '.......II...............',
    '......IIIi..............',
    '.....IIIii..............',
    '....IIIiii.........99...',
    '...IIIiii.........99WW..',
    '..IIIiii..........9WWKW.',
    '..IIii...........9WWWWWW',
    '.99IIWWWWWWWWWWW9WWW.WWK',
    '99.WWWWWWWWWWWWWWWW.....',
    '9..WWWWWWWWWWWWWWWW.....',
    '9..CWWWWWWWWWWWWWWC.....',
    '...CCWWWWWWWWWWWWCC.....',
    '....WW.WW....WW.WW......',
    '....WW.WW....WW.WW......',
    '....WW..WW..WW..WW......',
    '....YY..YY..YY..YY......',
  ],
  pegasus2: [
    '........................',
    '........................',
    '........................',
    '...................99...',
    '..................99WW..',
    '..................9WWKW.',
    '.................9WWWWWW',
    '.99..WWWWWWWWWWW9WWW.WWK',
    '99.WWWWIIIIIIWWWWWW.....',
    '9..WWWIIIIIIIIWWWWW.....',
    '9..CWWWiIIIIIIiWWWC.....',
    '...CCWWWiiiiiiWWWCC.....',
    '....WW.WW...iiWW.WW.....',
    '....WW..WW...WW..WW.....',
    '....WW..WW..WW...WW.....',
    '....YY..YY..YY...YY.....',
  ],
  shopkeeper: [
    '......VVVV......',
    '.....VVVVVV.....',
    '.....VVYYVV.....',
    '...VVVVVVVVVV...',
    '....SSSSSSSS....',
    '....SKKSSKKS....',
    '....SWKSSWKS....',
    '....SSSSSSSS....',
    '....CCSRRSCC....',
    '....CCCCCCCC....',
    '.....CCCCCC.....',
    '...NNNCCCCNNN...',
    '..NNNNNCCNNNNN..',
    '..NNYNNNNNNYNN..',
    '..SNNNNNNNNNNS..',
    '..SNNNNYYNNNNS..',
    '...NNNNNNNNNN...',
    '...nnnnnnnnnn...',
    '....LL....LL....',
    '...KKK....KKK...',
  ],
  shopkeeper2: [
    '......VVVV......',
    '.....VVVVVV.....',
    '.....VVYYVV.....',
    '...VVVVVVVVVV...',
    '....SSSSSSSS....',
    '....SKKSSKKS....',
    '....SWKSSWKS....',
    '....SSSSSSSS....',
    '....CCSKKSCC....',
    '....CCCRRCCC....',
    '.....CCCCCC.....',
    '...NNNCCCCNNN.S.',
    '..NNNNNCCNNNNNS.',
    '..NNYNNNNNNYNN..',
    '..SNNNNNNNNNNN..',
    '..SNNNNYYNNNN...',
    '...NNNNNNNNNN...',
    '...nnnnnnnnnn...',
    '....LL....LL....',
    '...KKK....KKK...',
  ],

  // ------------------------------------------------------------ icons
  w_boomerang: [
    '............',
    '..RRR.......',
    '.RYRRR......',
    '..RYRRR.....',
    '...rRYRR....',
    '....rRRYRRR.',
    '....rRRYRRR.',
    '...rRYRR....',
    '..RYRRR.....',
    '.RYRRR......',
    '..rrr.......',
    '............',
  ],
  heart_peg: [
    '.II.II.',
    'IWIIIII',
    'IIIIIII',
    '.IIIII.',
    '..III..',
    '...I...',
  ],
  icon_pegasus: [
    '......99..',
    '.....99WW.',
    '....9WWKW.',
    '...9WWWWWW',
    '..9WWW.WWK',
    'I.WWW.....',
    'IIWWW.....',
    'IiWWW.....',
    '.iWWW.....',
    '..WW......',
  ],
  icon_forge: [
    '............',
    '.EEEEEEEEE..',
    'EEWWWWWWWEEE',
    '.eEEEEEEEe..',
    '...eEEEEe...',
    '....EEEE....',
    '....eEEe....',
    '...eEEEEe...',
    '..eeeeeeee..',
    '............',
  ],
  icon_star: [
    '...Y...',
    '...Y...',
    'YYYYYYY',
    '.YYWYY.',
    '..YYY..',
    '.YY.YY.',
    'YY...YY',
  ],
  icon_none: [
    '..........',
    '.RR....RR.',
    '..RR..RR..',
    '...RRRR...',
    '....RR....',
    '...RRRR...',
    '..RR..RR..',
    '.RR....RR.',
    '..........',
  ],
};

// Recoloured copies of other sprites: [newKey, sourceKey, {from: to}].
const RECOLORS = [
  ['aguard2', 'aguard1', { W: 'R' }],
  ['robot_shoot', 'robot1', { h: '~' }],
  ['item_shieldPotion', 'potion', { R: 'U', r: 'u' }],
  ['item_frenzyPotion', 'potion', { R: 'O', r: 'r' }],
  ['item_explodePotion', 'potion', { R: 'Y', r: 'K' }],
];

// Frames made by shifting some rows sideways: [newKey, sourceKey, {row: shift}].
const SHIFTED = [
  ['robot2', 'robot1', { 12: 1, 13: 1 }],
  ['glitch2', 'glitch1', { 1: 2, 2: 2, 7: -2, 8: -2, 11: 1 }],
];

// Wand icons share one shape; only the gem on the tip changes colour.
const WAND_ICON = [
  '.......*+*..',
  '......*+W+*.',
  '.......*+*..',
  '......nN....',
  '.....nN.....',
  '....nN......',
  '...nN.......',
  '..nN........',
  '.nN.........',
  'nN..........',
  '............',
  '............',
];
const WAND_TIPS = {
  iceWand: ['#4dd2ff', '#e8f8ff'],
  earthWand: ['#7a6e64', '#4fc24a'],
  airWand: ['#c0c8d0', '#ffffff'],
  lightningWand: ['#ffcd3a', '#fff2a0'],
  voidWand: ['#6a2aa8', '#17121f'],
};

// Accessories, drawn on top of the player frames. Coordinates are relative to
// the top-left hair pixel of each frame (rows above it are the extra space
// player textures have for hats). Belts recolour the belt (see BELT_COLORS).
const ACCESSORY_ART = {
  hat: {
    crown: { ox: -1, oy: -3, rows: ['Y.YY.Y', 'YYYYYY', 'YRYYUY'] },
    wizard: { ox: -3, oy: -4, rows: ['......V...', '.....VV...', '....VYVV..', '...VVVVVV.', '.vvvvvvvvv'] },
    tophat: { ox: -2, oy: -4, rows: ['..KKKK..', '..KKKK..', '..KKKK..', '..RRRR..', 'KKKKKKKK'] },
    cowboy: { ox: -3, oy: -3, rows: ['...NNNN...', '...NnnN...', 'N..NNNN..N', '.NNNNNNNN.'] },
    party: { ox: 0, oy: -5, rows: ['..Y..', '..R..', '.RYR.', '.YRY.', 'RYRYR'] },
    viking: { ox: -2, oy: -3, rows: ['C......C', 'C.EEEE.C', 'CEEEEEEC', '.EEEEEE.'] },
  },
  neck: {
    chain: { ox: 0, oy: 6, rows: ['YYYY', '.YY.'] },
    pendant: { ox: 0, oy: 6, rows: ['Y..Y', '.YY.', '.UU.'] },
    scarf: { ox: -1, oy: 5, rows: ['RRRRRR', '.RRRRr', '.R....'] },
    bowtie: { ox: 0, oy: 6, rows: ['R..R', 'RrrR', 'R..R'] },
  },
  face: {
    shades: { ox: 1, oy: 3, rows: ['KUKUK'] },
    mustache: { ox: 2, oy: 4, rows: ['nNNn'] },
    eyepatch: { ox: -2, oy: 2, rows: ['KKKKKKK', '......K'] },
    mask: { ox: -1, oy: 4, rows: ['XXXXXX', '.XXXX.'] },
  },
};

// ---------------------------------------------------------------- shapes

// The Haunted Tree: a huge dead tree with a glowing face.
function treeShape(angry) {
  const seg = (px, py, ax, ay, bx, by) => {
    const dx = bx - ax, dy = by - ay;
    const t = Phaser.Math.Clamp(((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy), 0, 1);
    return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
  };
  const ell = (px, py, cx, cy, rx, ry) => ((px - cx) / rx) ** 2 + ((py - cy) / ry) ** 2;
  return (x, y) => {
    const px = x + 0.5, py = y + 0.5;
    // face
    for (const ex of [24, 33]) {
      const d = ell(px, py, ex, 36, 3, 2.5);
      if (d <= 1) return d < 0.35 ? 'W' : (angry ? 'R' : 'Y');
      if (d <= 1.9) return 'K';
    }
    if (y >= 43 && y <= (angry ? 50 : 47) && x >= 22 && x <= 35) {
      if ((y === 43 && x % 3 === 0) || (y === (angry ? 50 : 47) && x % 3 === 1)) return 'C';
      return 'K';
    }
    // trunk with roots
    const half = y >= 54 ? 9 + (y - 54) * 1.3 : 9;
    if (y >= 24 && Math.abs(px - 28) <= half) return (x + (y >> 3)) % 5 === 0 ? '4' : 'w';
    // branch arms
    if (seg(px, py, 20, 34, 4, angry ? 18 : 26) < 1.8 || seg(px, py, 36, 34, 52, angry ? 18 : 26) < 1.8) return 'w';
    if (seg(px, py, 6, 25, 1, 30) < 1.1 || seg(px, py, 50, 25, 55, 30) < 1.1) return '4';
    // leaves
    const e = Math.min(ell(px, py, 28, 14, 25, 13), ell(px, py, 11, 20, 11, 8), ell(px, py, 45, 20, 11, 8));
    if (e <= 1) {
      if ((x * x * 7 + y * 13 + x * y * 3) % 23 === 0) return angry ? 'R' : 'M';
      return e > 0.7 || y > 22 ? 'f' : 'F';
    }
    return null;
  };
}

// Portal Gate Guard: a big armoured soldier with a blaster arm.
function gateGuardShape(firing) {
  return (x, y) => {
    const r = (x0, y0, x1, y1) => inRect(x, y, x0, y0, x1, y1);
    if (r(10, 4, 19, 6)) return firing ? '~' : 'h';                // visor
    if (r(8, 0, 19, 9)) return (x === 8 || y === 0) ? 'o' : 's';    // helmet
    if (r(11, 10, 16, 10)) return 'a';
    if (r(22, 17, 27, 20)) {                                         // blaster
      if (firing && x === 27) return 'Y';
      return y === 18 || y === 19 ? 'K' : 's';
    }
    if (r(3, 11, 24, 15)) return y === 11 ? 'o' : 'Q';              // shoulders
    if (r(12, 18, 15, 21)) return 'Y';                               // badge
    if (r(6, 16, 21, 25)) return x === 21 ? 'a' : 'Q';
    if (r(6, 26, 21, 27)) return (x === 13 || x === 14) ? 'Y' : 'K'; // belt
    if (r(1, 15, 5, 26)) return x === 1 ? 'a' : 'Q';
    if (r(1, 27, 5, 29)) return 'K';
    if (r(7, 28, 12, 35) || r(15, 28, 20, 35)) return y >= 33 ? 'K' : 'a';
    return null;
  };
}

// The Giant Alien: big head, bigger eyes.
function giantAlienShape(angry) {
  const ell = (px, py, cx, cy, rx, ry) => ((px - cx) / rx) ** 2 + ((py - cy) / ry) ** 2;
  return (x, y) => {
    const px = x + 0.5, py = y + 0.5;
    for (const ex of [14, 30]) {
      const d = ell(px, py, ex, 17, 6, 4.5);
      if (d <= 1) {
        if (ell(px, py, ex - 2, 15.5, 1.6, 1.3) <= 1) return 'W';
        return angry ? 'R' : 'K';
      }
    }
    if ((x === 12 || x === 32) && y <= 5) return y <= 1 ? 'k' : 'j';
    const head = ell(px, py, 22, 17, 18, 12);
    if (head <= 1) {
      if (y === 25 && x >= 18 && x <= 26) return 'K';
      return head > 0.8 ? 'j' : 'J';
    }
    if (inRect(x, y, 2, 32, 9, 35) || inRect(x, y, 35, 32, 42, 35)) return 'J';   // arms
    const body = ell(px, py, 22, 37, 11, 8);
    if (body <= 1) return body > 0.75 ? 'v' : 'V';
    if (inRect(x, y, 15, 43, 19, 47) || inRect(x, y, 25, 43, 29, 47)) return y === 47 ? 'j' : 'J';
    return null;
  };
}

// The Alien King: crowned, riding a hover saucer.
function alienKingShape(frame) {
  const ell = (px, py, cx, cy, rx, ry) => ((px - cx) / rx) ** 2 + ((py - cy) / ry) ** 2;
  return (x, y) => {
    const px = x + 0.5, py = y + 0.5;
    if (y <= 6 && x >= 14 && x <= 30) {                              // crown
      if (y <= 2) return x % 4 === 2 ? 'Y' : null;
      if (y === 4 && (x === 18 || x === 26)) return 'R';
      if (y === 4 && x === 22) return 'U';
      return 'Y';
    }
    for (const ex of [18, 26]) {
      if (ell(px, py, ex, 13, 2.5, 2) <= 1) return frame === 1 ? 'R' : 'K';
    }
    const head = ell(px, py, 22, 13, 9, 7);
    if (head <= 1) return head > 0.75 ? 'j' : 'J';
    const robe = ell(px, py, 22, 25, 9, 7);
    if (robe <= 1) return Math.abs(px - 22) < 1 ? 'Y' : (robe > 0.7 ? 'v' : 'V');
    const saucer = ell(px, py, 22, 36, 21, 6);
    if (saucer <= 1) {
      if (y === 38 && x % 4 === 1) return (x >> 2) % 2 === frame ? 'h' : 'k';
      return py < 34 ? 'o' : (saucer > 0.7 ? '3' : 's');
    }
    return null;
  };
}

// The Super Computer: a giant monitor with a face. frame 2 is glitching.
function computerShape(frame) {
  return (x, y) => {
    const r = (x0, y0, x1, y1) => inRect(x, y, x0, y0, x1, y1);
    if (r(4, 4, 43, 31)) {
      if (frame === 2 && ((x * 7 + y * 3) % 13 === 0 || (y % 6 === 0 && x > 10 && x < 30))) return (x + y) % 2 ? 'k' : 'h';
      const eye = frame === 1 ? 'k' : 'h';
      if (r(13, 10, 18, 15) || r(29, 10, 34, 15)) {
        if (frame === 1 && ((x < 20 && y - 10 < x - 13) || (x > 28 && y - 10 < 34 - x))) return 'K';   // angry brows
        return eye;
      }
      if (frame === 1 ? (r(15, 24, 32, 25) || r(13, 22, 14, 23) || r(33, 22, 34, 23)) : (r(14, 22, 33, 23) || r(12, 20, 13, 21) || r(34, 20, 35, 21))) return eye;
      return y % 2 ? 'K' : '3';
    }
    if (r(0, 0, 47, 35)) return (x === 0 || y === 0) ? 'o' : 's';
    if (r(20, 36, 27, 43)) return x === 20 ? 'o' : 's';
    if (r(10, 44, 37, 51)) {
      if (y === 47 && x % 5 === 2) return frame === 2 ? 'k' : 'h';
      return y === 44 ? 'o' : 's';
    }
    return null;
  };
}

// The Master of Time: hooded robe, a clock on the chest, an hourglass staff.
function timeMasterShape(angry) {
  return (x, y) => {
    const px = x + 0.5, py = y + 0.5;
    // hourglass staff
    if (x === 21 && y >= 9) return 'N';
    if (y >= 1 && y <= 9 && x >= 18 && x <= 24) {
      if (y === 1 || y === 9) return 'Y';
      const w = Math.abs(5 - y);
      if (Math.abs(px - 21.5) <= w * 0.7 + 0.5) return (y > 5) ? 't' : (y === 4 ? 't' : 'W');
      return null;
    }
    // clock face
    const dc = Math.hypot(px - 10, py - 19);
    if (dc <= 5) {
      if (dc > 4.2) return 'Y';
      if ((x === 10 && y >= 15 && y <= 19) || (y === 19 && x >= 10 && x <= 13)) return 'K';
      return 'W';
    }
    // hood and face
    if (y <= 10) {
      const hw = 2 + y * 0.6;
      if (Math.abs(px - 10) <= hw) {
        if (y >= 5 && y <= 6 && (x === 8 || x === 12)) return angry ? 'R' : 'Y';
        if (y >= 4 && y <= 8 && Math.abs(px - 10) <= hw - 2) return 'x';
        return '^';
      }
      return null;
    }
    // robe
    const rw = 6 + (y - 10) * 0.18;
    if (Math.abs(px - 10) <= rw) {
      if (y >= 33) return 'Y';
      if (Math.abs(px - 10) > rw - 1) return 'v';
      return '^';
    }
    // arms
    if (angry ? (y >= 6 && y <= 12 && (x === 2 || x === 3)) : (y >= 14 && y <= 22 && (x === 2 || x === 3))) return 'S';
    return null;
  };
}

// The tornado from the air wand. Wide at the top, thin at the bottom.
function tornadoShape(frame) {
  return (x, y) => {
    const half = 1.5 + (21 - y) * 0.33;
    const cx = 8 + Math.sin(y * 0.5 + frame * 2) * 1.2;
    const dx = Math.abs(x + 0.5 - cx);
    if (dx > half) return null;
    const band = (y * 2 + x + frame * 3) % 6;
    if (dx > half - 1 && (y + frame) % 3 === 0) return null;
    return band < 2 ? 'I' : band < 4 ? 'i' : 'o';
  };
}

// A breaking wave from the water rune.
function waveShape(x, y) {
  const top = 17 - (x / 21) * 13;
  if (y < top) {
    // the curl at the front
    if (x >= 15 && Math.hypot(x - 17, y - (top - 1)) < 3 && y > top - 4) return 'I';
    return null;
  }
  if (y < top + 2) return 'I';
  return y > 13 ? '8' : '7';
}

// A thin root spike that bursts out of the ground (Haunted Tree).
function rootShape(x, y) {
  const half = (y / 17) * 3.5;
  if (Math.abs(x + 0.5 - 4) > half + 0.3) return null;
  return (x + (y >> 2)) % 3 === 0 ? '4' : 'w';
}

// A falling lightning strike (Alien King).
function boltShape(x, y) {
  const cx = 4 + Math.round(2 * Math.sin(y * 0.7));
  const d = Math.abs(x - cx);
  if (d === 0) return 'W';
  if (d === 1) return 'Y';
  return null;
}

const MORE_SHAPES = {
  tree1: { w: 56, h: 64, fn: treeShape(false) },
  tree2: { w: 56, h: 64, fn: treeShape(true) },
  gateguard1: { w: 28, h: 36, fn: gateGuardShape(false) },
  gateguard2: { w: 28, h: 36, fn: gateGuardShape(true) },
  giantalien1: { w: 44, h: 48, fn: giantAlienShape(false) },
  giantalien2: { w: 44, h: 48, fn: giantAlienShape(true) },
  alienking1: { w: 44, h: 44, fn: alienKingShape(0) },
  alienking2: { w: 44, h: 44, fn: alienKingShape(1) },
  computer1: { w: 48, h: 52, fn: computerShape(0) },
  computer2: { w: 48, h: 52, fn: computerShape(1) },
  computer3: { w: 48, h: 52, fn: computerShape(2) },
  timemaster1: { w: 26, h: 36, fn: timeMasterShape(false) },
  timemaster2: { w: 26, h: 36, fn: timeMasterShape(true) },
  tornado1: { w: 16, h: 22, fn: tornadoShape(0) },
  tornado2: { w: 16, h: 22, fn: tornadoShape(1) },
  tornado3: { w: 16, h: 22, fn: tornadoShape(2) },
  wave: { w: 22, h: 18, fn: waveShape },
  root: { w: 8, h: 18, fn: rootShape },
  bolt_v: { w: 9, h: 48, fn: boltShape },
};
