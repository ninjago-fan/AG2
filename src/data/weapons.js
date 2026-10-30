// Weapon definitions.
// The first time a weapon is obtained (picked up or bought), its `upgrade` is
// applied permanently: it stays even after you swap to a different weapon.
//   maxHp  - added to max HP once
//   power  - flat bonus damage for every weapon
//   speed  - bonus run speed (pixels/second)
//   haste  - attack cooldown reduction (0.1 = 10% faster)
// Styles: melee (hitbox in front), ranged (straight shot), thrown (arcing,
// spinning, flies through enemies), bomb (bounces, then explodes),
// boomerang (flies out and comes back), and one style per magic wand:
// ice, earth, air, lightning, void (see GameScene.fireWeapon).
// Shots from ranged weapons aim at the nearest mob.
const WEAPONS = {
  dagger: {
    name: 'Dagger',
    desc: 'Fast little blade. You start with it.',
    style: 'melee',
    damage: 1,
    cooldown: 220,      // ms between attacks
    reach: 16,          // hitbox width in front of the player
    height: 14,         // hitbox height
    duration: 90,       // how long the hitbox stays active (ms)
    knockback: 90,
    slashTint: 0xffffff,
    sfx: 'swingFast',
    price: 0,
    upgrade: { speed: 12 },
    upgradeText: '+SPEED',
  },
  sword: {
    name: 'Sword',
    desc: 'Balanced melee weapon. Owning it gives +1 max HP.',
    style: 'melee',
    damage: 2,
    cooldown: 360,
    reach: 22,
    height: 18,
    duration: 120,
    knockback: 140,
    slashTint: 0xcfe8ff,
    sfx: 'swing',
    price: 25,
    upgrade: { maxHp: 1 },
    upgradeText: '+1 MAX HP',
  },
  hammer: {
    name: 'Hammer',
    desc: 'Slow, huge knockback, sometimes stuns. Owning it gives +1 power.',
    style: 'melee',
    damage: 4,
    cooldown: 700,
    reach: 22,
    height: 24,
    duration: 150,
    knockback: 340,
    slashTint: 0xffb060,
    sfx: 'swingHeavy',
    shake: true,
    stunChance: 0.3,    // sometimes stuns the mob for stunTime ms
    stunTime: 2000,
    price: 40,
    upgrade: { power: 1 },
    upgradeText: '+1 POWER',
  },
  axe: {
    name: 'Battle Axe',
    desc: 'Wide heavy swing. Owning it gives +2 max HP.',
    style: 'melee',
    damage: 3,
    cooldown: 520,
    reach: 26,
    height: 22,
    duration: 140,
    knockback: 220,
    slashTint: 0xd8d8e0,
    sfx: 'swingHeavy',
    price: 45,
    upgrade: { maxHp: 2 },
    upgradeText: '+2 MAX HP',
  },
  bow: {
    name: 'Bow',
    desc: 'Long range arrows. Owning it gives +1 max HP.',
    style: 'ranged',
    damage: 2,
    cooldown: 450,
    projectile: 'arrow',
    speed: 330,
    lifetime: 1100,
    knockback: 70,
    sfx: 'bow',
    price: 30,
    upgrade: { maxHp: 1 },
    upgradeText: '+1 MAX HP',
  },
  fireWand: {
    name: 'Fire Wand',
    desc: 'Rapid fireballs. Owning it gives +10% attack speed.',
    style: 'ranged',
    damage: 3,
    cooldown: 280,
    projectile: 'fireball',
    speed: 230,
    lifetime: 520,
    knockback: 110,
    sfx: 'fire',
    price: 60,
    upgrade: { haste: 0.1 },
    upgradeText: '+10% ATK SPEED',
  },
  throwingAxe: {
    name: 'Throwing Axe',
    desc: 'Spinning arc that cuts through every enemy it touches.',
    style: 'thrown',
    damage: 3,
    cooldown: 480,
    projectile: 'p_axe',
    speed: 200,
    lift: -210,         // initial upward speed
    gravity: 700,
    pierce: true,
    lifetime: 1400,
    knockback: 120,
    sfx: 'throw',
    price: 55,
    upgrade: { haste: 0.05 },
    upgradeText: '+5% ATK SPEED',
  },
  bombs: {
    name: 'Bombs',
    desc: 'Bouncing bombs. Big blast that hits everything nearby.',
    style: 'bomb',
    damage: 6,
    cooldown: 900,
    speed: 150,
    lift: -230,
    fuse: 1100,         // ms before it explodes (sooner if it touches an enemy)
    radius: 36,
    knockback: 260,
    sfx: 'throw',
    price: 70,
    upgrade: { maxHp: 1 },
    upgradeText: '+1 MAX HP',
  },
  boomerang: {
    name: 'Boom-arang',
    desc: 'Flies out, comes back to you, and grabs coins on the way.',
    style: 'boomerang',
    damage: 3,
    cooldown: 520,
    projectile: 'p_boomerang',
    speed: 250,
    range: 150,         // pixels before it turns around
    lifetime: 2600,
    knockback: 120,
    sfx: 'boomerang',
    price: 50,
    upgrade: { speed: 8 },
    upgradeText: '+SPEED',
  },
  iceWand: {
    name: 'Ice Wand',
    desc: 'Ice bolts freeze mobs solid for 3 seconds.',
    style: 'ice',
    damage: 1,
    cooldown: 420,
    projectile: 'icebolt',
    speed: 240,
    lifetime: 750,
    knockback: 20,
    freeze: 3000,       // ms a mob stays frozen (bosses: less)
    sfx: 'freeze',
    price: 70,
    upgrade: { maxHp: 1 },
    upgradeText: '+1 MAX HP',
  },
  earthWand: {
    name: 'Earth Wand',
    desc: 'Quake! Every mob on the platform you stand on loses half its health.',
    style: 'earth',
    damage: 0,          // damage is half the mob's health instead
    cooldown: 1600,
    sfx: 'quake',
    price: 90,
    upgrade: { power: 1 },
    upgradeText: '+1 POWER',
  },
  airWand: {
    name: 'Air Wand',
    desc: 'A tornado that sucks up mobs and shots, then throws them off the platform.',
    style: 'air',
    damage: 2,
    cooldown: 1300,
    speed: 125,
    lifetime: 1500,
    sfx: 'wind',
    price: 80,
    upgrade: { speed: 10 },
    upgradeText: '+SPEED',
  },
  lightningWand: {
    name: 'Lightning Wand',
    desc: 'A bolt that bounces to every mob on screen, goes through walls and grabs money.',
    style: 'lightning',
    damage: 3,
    cooldown: 900,
    sfx: 'zap',
    price: 100,
    upgrade: { haste: 0.05 },
    upgradeText: '+5% ATK SPEED',
  },
  voidWand: {
    name: 'Void Wand',
    desc: 'A void circle around you takes 3/4 of the health of any mob that touches it.',
    style: 'void',
    damage: 0,
    cooldown: 700,      // attacking makes the circle pulse bigger
    radius: 30,
    pulseRadius: 46,
    sfx: 'void',
    price: 120,
    upgrade: { maxHp: 2 },
    upgradeText: '+2 MAX HP',
  },
};

// Order of the weapon bar. Number keys 1-9 and 0 pick one of the first ten
// by its place here; TAB cycles through every weapon you own.
const WEAPON_ORDER = [
  'dagger', 'sword', 'hammer', 'axe', 'bow', 'fireWand', 'throwingAxe', 'bombs',
  'boomerang', 'iceWand', 'earthWand', 'airWand', 'lightningWand', 'voidWand',
];

// Letter hotkeys (you have to own the weapon to switch to it).
const WEAPON_HOTKEYS = {
  S: 'sword', F: 'fireWand', B: 'bow', A: 'axe', T: 'throwingAxe', M: 'bombs',
  R: 'boomerang', I: 'iceWand', N: 'earthWand', U: 'airWand', L: 'lightningWand', O: 'voidWand',
};

// Weapon upgrades bought in the shop's FORGE. Each level adds 1 damage and
// makes the weapon 8% faster.
const FORGE = {
  maxLevel: 4,
  price(key, level) { return Math.round(25 + Math.max(WEAPONS[key].price, 20) * 0.5 * level); },
  damage(level) { return level - 1; },
  speed(level) { return 1 - 0.08 * (level - 1); },
};

// Map characters used in levels.js to weapon keys.
const WEAPON_CHARS = {
  '1': 'dagger', '2': 'sword', '3': 'hammer', '4': 'bow', '5': 'fireWand',
  '6': 'axe', '7': 'throwingAxe', '8': 'bombs', '9': 'boomerang',
  i: 'iceWand', j: 'earthWand', k: 'airWand', l: 'lightningWand', v: 'voidWand',
};
