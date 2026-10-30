// Run state helpers and localStorage persistence.

const GameState = {
  BASE_MAX_HP: 5,

  fresh() {
    return {
      level: 0,
      maxHp: this.BASE_MAX_HP,
      hp: this.BASE_MAX_HP,
      weapon: 'dagger',
      owned: ['dagger'],
      weaponLevels: {},     // forge level per weapon (missing = level 1)
      score: 0,
      gold: 0,
      armor: null,          // key in ARMORS
      armorHp: 0,           // shield hearts left (refilled every level)
      upgrades: { maxHp: 0, power: 0, speed: 0, haste: 0, dash: 0, jumps: 0 },
      runes: [],
      bonusDone: false,     // the bonus level can be played once per run
      inBonus: false,
      time: 0,              // ms played this run (for the leaderboard)
      seenStory: [],        // levels whose cutscene has played this run
    };
  },

  clone(state) {
    return JSON.parse(JSON.stringify(state));
  },

  // Permanent bonuses from every weapon the player has ever obtained plus shop
  // upgrades. (Max HP bonuses are added to state.maxHp directly.)
  bonuses(state) {
    const b = { power: 0, speed: 0, haste: 0 };
    state.owned.forEach(key => {
      const u = WEAPONS[key].upgrade;
      b.power += u.power || 0;
      b.speed += u.speed || 0;
      b.haste += u.haste || 0;
    });
    const up = state.upgrades;
    b.power += up.power;
    b.speed += up.speed * 10;
    b.haste += up.haste * 0.1;
    b.haste = Math.min(b.haste, 0.5);
    return b;
  },

  weaponLevel(state, key) { return state.weaponLevels[key] || 1; },

  maxJumps(state) { return 2 + state.upgrades.jumps; },

  dashCooldown(state) { return PLAYER_CFG.dashCooldown - 200 * state.upgrades.dash; },

  armorPoints(state) { return state.armor ? ARMORS[state.armor].points : 0; },
};

// "3:07" or "1:02:45".
function formatTime(ms) {
  const s = Math.floor((ms || 0) / 1000);
  const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, sec = s % 60;
  const mm = h ? String(m).padStart(2, '0') : String(m);
  return (h ? h + ':' : '') + mm + ':' + String(sec).padStart(2, '0');
}

const SaveManager = {
  KEY: 'ag1-save-v2',
  OLD_KEY: 'ag1-save-v1',
  BEST_KEY: 'ag1-best-v1',

  has() {
    return this.load() !== null;
  },

  save(state) {
    const data = {
      level: state.level,
      maxHp: state.maxHp,
      weapon: state.weapon,
      owned: state.owned.slice(),
      weaponLevels: Object.assign({}, state.weaponLevels),
      score: state.score,
      gold: state.gold,
      armor: state.armor,
      upgrades: Object.assign({}, state.upgrades),
      runes: state.runes.slice(),
      bonusDone: state.bonusDone,
      time: Math.round(state.time),
      seenStory: state.seenStory.slice(),
    };
    try {
      localStorage.setItem(this.KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('Could not save progress', e);
      return false;
    }
  },

  // Returns a full run state, or null if there is no valid save.
  // Saves from before the upgrade (v1) still load.
  load() {
    try {
      const raw = localStorage.getItem(this.KEY) || localStorage.getItem(this.OLD_KEY);
      if (!raw) return null;
      const d = JSON.parse(raw);
      if (typeof d.level !== 'number' || d.level < 0 || d.level >= LEVELS.length) return null;
      const s = GameState.fresh();
      const owned = (Array.isArray(d.owned) ? d.owned : []).filter(k => WEAPONS[k]);
      if (!owned.includes('dagger')) owned.unshift('dagger');
      const weapon = WEAPONS[d.weapon] ? d.weapon : 'dagger';
      if (!owned.includes(weapon)) owned.push(weapon);
      UPGRADE_ORDER.forEach(k => {
        const n = d.upgrades ? d.upgrades[k] | 0 : 0;
        s.upgrades[k] = Phaser.Math.Clamp(n, 0, UPGRADES[k].max);
      });
      Object.entries(d.weaponLevels || {}).forEach(([k, n]) => {
        if (WEAPONS[k]) s.weaponLevels[k] = Phaser.Math.Clamp(n | 0, 1, FORGE.maxLevel);
      });
      s.level = d.level;
      s.maxHp = s.hp = Math.max(1, d.maxHp | 0);
      s.weapon = weapon;
      s.owned = owned;
      s.score = Math.max(0, d.score | 0);
      s.gold = Math.max(0, d.gold | 0);
      s.armor = ARMORS[d.armor] ? d.armor : null;
      s.runes = (Array.isArray(d.runes) ? d.runes : []).filter(r => RUNES[r]);
      s.bonusDone = !!d.bonusDone;
      s.time = Math.max(0, Number(d.time) || 0);
      s.seenStory = (Array.isArray(d.seenStory) ? d.seenStory : []).filter(n => typeof n === 'number');
      return s;
    } catch (e) {
      return null;
    }
  },

  clear() {
    try {
      localStorage.removeItem(this.KEY);
      localStorage.removeItem(this.OLD_KEY);
    } catch (e) { /* ignore */ }
  },

  getBest() {
    let best = 0;
    try { best = parseInt(localStorage.getItem(this.BEST_KEY), 10) || 0; } catch (e) { /* ignore */ }
    const top = Leaderboard.list('score')[0];
    return Math.max(best, top ? top.score : 0);
  },

  setBest(score) {
    if (score <= this.getBest()) return;
    try { localStorage.setItem(this.BEST_KEY, String(score)); } catch (e) { /* ignore */ }
  },
};

// Settings and unlocks that last across runs: the chosen skin and
// accessories, pets and the pegasus, daily tasks, controls and shaders.
const Profile = {
  KEY: 'ag1-profile-v1',
  data: null,

  get() {
    if (this.data) return this.data;
    let d = {};
    try { d = JSON.parse(localStorage.getItem(this.KEY)) || {}; } catch (e) { /* ignore */ }
    const acc = {};
    ACCESSORY_SLOTS.forEach(s => { acc[s] = d.accessories && ACCESSORIES[s][d.accessories[s]] ? d.accessories[s] : 'none'; });
    const pets = (Array.isArray(d.pets) ? d.pets : []).filter(k => PETS[k]);
    this.data = {
      skin: SKINS[d.skin] ? d.skin : 'classic',
      accessories: acc,
      pets,
      pet: pets.includes(d.pet) ? d.pet : null,
      pegasus: !!d.pegasus,
      shaders: d.shaders !== false,
      controls: d.controls === 'ipad' ? 'ipad' : 'computer',
      daily: d.daily && typeof d.daily === 'object' ? d.daily : null,
      stars: Math.max(0, d.stars | 0),
    };
    return this.data;
  },

  save() {
    try { localStorage.setItem(this.KEY, JSON.stringify(this.get())); } catch (e) { /* ignore */ }
  },
};

// Best runs on this computer. Entries: { name, score, level, time, result, date }.
// The list can be sorted by score, by level reached, or by time (furthest
// level first, then fastest).
const Leaderboard = {
  KEY: 'ag1-leaderboard-v1',
  SIZE: 10,             // rows shown
  KEEP: 50,             // rows stored, so every sort has enough to show
  SORTS: {
    score: (a, b) => b.score - a.score,
    level: (a, b) => (b.level - a.level) || (b.score - a.score),
    time: (a, b) => (b.level - a.level) || (a.time - b.time),
  },

  all() {
    try {
      const d = JSON.parse(localStorage.getItem(this.KEY));
      if (!Array.isArray(d)) return [];
      return d.filter(e => e && typeof e.name === 'string' && typeof e.score === 'number').map(e => Object.assign({
        // Entries from before levels and times were recorded.
        level: e.result === 'VICTORY' ? 4 : (parseInt(String(e.result || '').replace(/\D/g, ''), 10) || 1),
        time: 0,
      }, e));
    } catch (e) {
      return [];
    }
  },

  list(sort = 'score') {
    return this.all().sort(this.SORTS[sort] || this.SORTS.score).slice(0, this.SIZE);
  },

  qualifies(score) {
    if (score <= 0) return false;
    const l = this.all().sort(this.SORTS.score);
    return l.length < this.KEEP || score > l[l.length - 1].score;
  },

  // Returns the new entry (so the leaderboard can highlight it).
  add(name, score, level, time, result) {
    const entry = { name: name.slice(0, 3), score, level, time: Math.round(time), result, date: Date.now() };
    const l = this.all();
    l.push(entry);
    l.sort(this.SORTS.score);
    try { localStorage.setItem(this.KEY, JSON.stringify(l.slice(0, this.KEEP))); } catch (e) { /* ignore */ }
    return entry;
  },
};
