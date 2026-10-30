// Armor, skins, accessories, shop upgrades, runes, items, pets and the pegasus.

// Armor gives blue shield hearts that soak up damage before your real hearts.
// They refill at the start of every level and when you respawn.
// colors: [main, shade] used for the helmet and chest of the player sprite.
const ARMORS = {
  leather: { name: 'Leather Armor', points: 2, price: 30, colors: ['#9a6a3b', '#6a4424'] },
  gold:    { name: 'Gold Armor',    points: 3, price: 55, colors: ['#ffcd3a', '#c28a1e'] },
  iron:    { name: 'Iron Armor',    points: 5, price: 90, colors: ['#c8ced8', '#7d8794'] },
  diamond: { name: 'Diamond Armor', points: 8, price: 150, colors: ['#7ff0ea', '#2aa8b8'] },
};
const ARMOR_ORDER = ['leather', 'gold', 'iron', 'diamond'];

// Skins are free: pick one in the WARDROBE on the main menu.
// colors override the player palette: H hair, S skin, B tunic, b tunic shade, L trousers.
const SKINS = {
  classic: { name: 'Classic', colors: {} },
  ranger:  { name: 'Ranger',  colors: { H: '#e8c050', B: '#3d9a45', b: '#246a2e' } },
  royal:   { name: 'Royal',   colors: { H: '#2a1a10', B: '#7b4fb8', b: '#4a2a7a', L: '#2a2a3a' } },
  frost:   { name: 'Frost',   colors: { H: '#f4f4f4', B: '#4dd2ff', b: '#2a7fb0', L: '#3a4a6a' } },
  crimson: { name: 'Crimson', colors: { H: '#1a1c2c', B: '#e43b44', b: '#9e2835', L: '#3a2020' } },
  shadow:  { name: 'Shadow',  colors: { H: '#e8e8f0', S: '#d8a878', B: '#2a2a38', b: '#15151f', L: '#15151f' } },
  midas:   { name: 'Midas',   colors: { H: '#ffe080', S: '#ffd27a', B: '#ffcd3a', b: '#c28a1e', L: '#c28a1e' } },
  sunset:  { name: 'Sunset',  colors: { H: '#ff8a3a', B: '#ff5a8a', b: '#c23a6a', L: '#5a2a4a' } },
  alien:   { name: 'Alien',   colors: { H: '#2a1a40', S: '#8ae070', B: '#7b4fb8', b: '#4a2a7a', L: '#2a2a3a' } },
  robot:   { name: 'Robot',   colors: { H: '#707884', S: '#c0c8d0', B: '#4dd2ff', b: '#2a7fb0', L: '#505864' } },
};
const SKIN_ORDER = Object.keys(SKINS);

// Accessories are optional extras worn on top of any skin (WARDROBE).
// Art lives in sprites2.js (ACCESSORY_ART). Belts recolour the belt instead.
const ACCESSORY_SLOTS = ['hat', 'neck', 'face', 'belt'];
const ACCESSORY_SLOT_NAMES = { hat: 'HAT', neck: 'NECKLACE', face: 'FACE', belt: 'BELT' };
const ACCESSORIES = {
  hat: {
    none: 'None', crown: 'Crown', wizard: 'Wizard Hat', tophat: 'Top Hat',
    cowboy: 'Cowboy Hat', party: 'Party Hat', viking: 'Viking Helmet',
  },
  neck: { none: 'None', chain: 'Gold Chain', pendant: 'Gem Pendant', scarf: 'Scarf', bowtie: 'Bow Tie' },
  face: { none: 'None', shades: 'Sunglasses', mustache: 'Mustache', eyepatch: 'Eye Patch', mask: 'Ninja Mask' },
  belt: { none: 'Gold Belt', black: 'Black Belt', silver: 'Silver Belt', ruby: 'Ruby Belt', leaf: 'Leaf Belt' },
};
const BELT_COLORS = { black: '#1a1c2c', silver: '#d8dce4', ruby: '#e43b44', leaf: '#4fc24a' };

// Shop upgrades. price = base + step * (times already bought).
const UPGRADES = {
  maxHp: { name: '+1 Max HP',     desc: 'One more heart, for good.',            icon: 'heart_full', base: 15, step: 10, max: 10 },
  power: { name: '+1 Power',      desc: 'Every weapon does 1 more damage.',     icon: 'icon_power', base: 40, step: 30, max: 3 },
  speed: { name: 'Swift Boots',   desc: 'Run a little faster.',                 icon: 'icon_speed', base: 20, step: 15, max: 3 },
  haste: { name: 'Quick Hands',   desc: 'Attack 10% faster.',                   icon: 'icon_haste', base: 30, step: 20, max: 3 },
  dash:  { name: 'Dash Recharge', desc: 'Dash recharges 0.2 seconds faster.',   icon: 'icon_dash',  base: 20, step: 20, max: 2 },
  jumps: { name: 'Triple Jump',   desc: 'Jump a third time in mid-air.',        icon: 'icon_jump',  base: 80, step: 0,  max: 1 },
};
const UPGRADE_ORDER = Object.keys(UPGRADES);

// A rune is hidden in a secret passage in every level except Dragon's Peak.
// A rune gives a superpower and opens rune vaults and the bonus portal.
const RUNES = {
  earth: {
    name: 'EARTH RUNE', power: 'STONE SKIN', key: 'Q', color: 0x4fc24a, glyph: '#4fc24a', fx: 'goo',
    cooldown: 20000, duration: 4000,
    desc: 'Nothing can hurt you for 4 seconds, and enemies you touch take damage.',
  },
  crystal: {
    name: 'CRYSTAL RUNE', power: 'CRYSTAL STORM', key: 'W', color: 0x4dd2ff, glyph: '#4dd2ff', fx: 'crystal',
    cooldown: 10000, shards: 12, damage: 3,
    desc: 'A ring of crystal shards bursts out in every direction.',
  },
  shadow: {
    name: 'SHADOW RUNE', power: 'VOID BLAST', key: 'E', color: 0xb44cff, glyph: '#b44cff', fx: 'shadow',
    cooldown: 25000, damage: 6,
    desc: 'Damages every enemy on screen and wipes out their shots.',
  },
  water: {
    name: 'WATER RUNE', power: 'TIDAL WAVE', key: 'Z', color: 0x3a8fff, glyph: '#3a8fff', fx: 'water',
    cooldown: 12000, damage: 4,
    desc: 'A wave rolls ahead of you, washing away mobs and their shots.',
  },
  ice: {
    name: 'ICE RUNE', power: 'FROST NOVA', key: 'X', color: 0xa8e8ff, glyph: '#a8e8ff', fx: 'ice',
    cooldown: 16000, radius: 110, freeze: 3500, damage: 2,
    desc: 'Freezes every mob near you for a few seconds.',
  },
  light: {
    name: 'LIGHT RUNE', power: 'HEALING LIGHT', key: 'C', color: 0xfff2a0, glyph: '#fff2a0', fx: 'gold',
    cooldown: 30000, heal: 5,
    desc: 'Heals 5 hearts and refills your armor.',
  },
  undead: {
    name: 'UNDEAD RUNE', power: 'GHOST ARMY', key: 'G', color: 0x9adfa0, glyph: '#9adfa0', fx: 'ghost',
    cooldown: 15000, ghosts: 4, damage: 3,
    desc: 'Friendly ghosts fly out and hunt down mobs.',
  },
  time: {
    name: 'TIME RUNE', power: 'TIME STOP', key: 'H', color: 0xffcd3a, glyph: '#ffcd3a', fx: 'gold',
    cooldown: 30000, duration: 5000,
    desc: 'Stops every mob, boss and shot for 5 seconds.',
  },
  air: {
    name: 'AIR RUNE', power: 'SKY LEAP', key: 'K', color: 0xe0f4ff, glyph: '#e0f4ff', fx: 'spark',
    cooldown: 8000, leap: -520,
    desc: 'Launches you high into the sky and gives you all your jumps back.',
  },
};
const RUNE_ORDER = ['earth', 'crystal', 'shadow', 'water', 'ice', 'light', 'undead', 'time', 'air'];

// Items mobs sometimes drop. They work as soon as you pick them up.
const ITEMS = {
  shieldPotion: { name: 'SHIELD POTION', text: 'SHIELD!', duration: 8000, color: 0x4dd2ff },
  frenzyPotion: { name: 'FRENZY POTION', text: 'FRENZY!', duration: 8000, color: 0xff6a3a },
  explodePotion: { name: 'EXPLODE POTION', text: 'KABOOM!', radius: 90, damage: 8, color: 0xffcd3a },
  timeApple: { name: 'TIME FREEZE APPLE', text: 'TIME FREEZE!', duration: 5000, color: 0x80e0ff },
};
const ITEM_ORDER = Object.keys(ITEMS);
const ITEM_DROP_CHANCE = 0.1;   // per defeated mob (not bosses)

// Pets follow you around and help in fights. Bought in the shop, kept forever.
const PETS = {
  coconut: {
    name: 'Coco-nut', price: 60, texture: 'pet_monkey1',
    desc: 'A monkey that throws coconuts at mobs.',
    damage: 2, every: 1500, range: 190,
  },
  phoenix: {
    name: 'Fire Phoenix', price: 90, texture: 'pet_phoenix1',
    desc: 'Flies above you and shoots little fireballs.',
    damage: 1, every: 900, range: 210,
  },
  rhino: {
    name: 'Rhi-no-no-no', price: 80, texture: 'pet_rhino1',
    desc: 'Charges in and rams mobs out of the way.',
    damage: 3, every: 1800, range: 130,
  },
};
const PET_ORDER = Object.keys(PETS);

// The pegasus: a flying mount. Press P to ride it or to hop off.
// While you ride it, hits take its hearts first. It can't be hurt while nobody
// rides it. If its hearts run out it throws you off and rests for a while.
const PEGASUS = {
  name: 'Pegasus', price: 150,
  desc: 'A flying horse you can ride (P). It has 3 hearts and extra jumps.',
  hearts: 3,
  speed: 1.35,          // run speed multiplier while riding
  extraJumps: 2,        // more mid-air flaps
  restTime: 20000,      // ms it rests after losing all its hearts
};
