// Daily tasks, just for fun. Every day three tasks are picked (the same three
// all day). Finishing one earns a star; stars are only for bragging.
// The game reports what happens with Daily.track(event, amount).

const DAILY_TASKS = [
  { id: 'kill', event: 'kill', n: 25, text: 'DEFEAT 25 MOBS' },
  { id: 'coins', event: 'coin', n: 80, text: 'COLLECT 80 COINS' },
  { id: 'gems', event: 'gem', n: 8, text: 'COLLECT 8 GEMS' },
  { id: 'secret', event: 'secret', n: 2, text: 'FIND 2 SECRET PASSAGES' },
  { id: 'boss', event: 'boss', n: 1, text: 'BEAT A BOSS' },
  { id: 'rune', event: 'power', n: 5, text: 'USE RUNE POWERS 5 TIMES' },
  { id: 'jump', event: 'jump', n: 100, text: 'JUMP 100 TIMES' },
  { id: 'dash', event: 'dash', n: 30, text: 'DASH 30 TIMES' },
  { id: 'item', event: 'item', n: 2, text: 'PICK UP 2 MAGIC ITEMS' },
  { id: 'potion', event: 'potion', n: 3, text: 'DRINK 3 HEALTH POTIONS' },
  { id: 'freeze', event: 'freeze', n: 10, text: 'FREEZE 10 MOBS' },
  { id: 'stun', event: 'stun', n: 3, text: 'STUN 3 MOBS WITH THE HAMMER' },
  { id: 'catch', event: 'catch', n: 15, text: 'CATCH YOUR BOOM-ARANG 15 TIMES' },
  { id: 'level', event: 'level', n: 2, text: 'FINISH 2 LEVELS' },
  { id: 'pet', event: 'petHit', n: 15, text: 'LET YOUR PET HIT 15 MOBS' },
  { id: 'ride', event: 'ride', n: 1, text: 'RIDE THE PEGASUS' },
  { id: 'fling', event: 'fling', n: 5, text: 'THROW 5 MOBS WITH A TORNADO' },
];

const Daily = {
  today() {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  },

  // Today's tasks with progress: [{ id, text, n, progress, done }].
  tasks() {
    const p = Profile.get();
    const day = this.today();
    if (!p.daily || p.daily.day !== day) {
      // Pick three tasks for today. Tasks that need things you don't have yet
      // (a pet, the pegasus) are left out.
      const pool = DAILY_TASKS.filter(t => (t.id !== 'pet' || p.pet) && (t.id !== 'ride' || p.pegasus));
      const seed = day.split('-').reduce((a, n) => a * 37 + Number(n), 7);
      const rnd = seededRandom(seed);
      const picks = [];
      while (picks.length < 3 && pool.length) picks.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0].id);
      p.daily = { day, ids: picks, progress: {}, done: [] };
      Profile.save();
    }
    return p.daily.ids.map(id => {
      const t = DAILY_TASKS.find(x => x.id === id);
      return Object.assign({}, t, {
        progress: Math.min(t.n, p.daily.progress[id] || 0),
        done: p.daily.done.includes(id),
      });
    });
  },

  // Count something that happened. Returns the tasks this finished.
  track(event, amount = 1) {
    const p = Profile.get();
    const finished = [];
    this.tasks().forEach(t => {
      if (t.event !== event || t.done) return;
      p.daily.progress[t.id] = (p.daily.progress[t.id] || 0) + amount;
      if (p.daily.progress[t.id] >= t.n) {
        p.daily.done.push(t.id);
        p.stars++;
        finished.push(t);
      }
    });
    // Saving on every coin would be a lot of writes; save when something finishes.
    if (finished.length) Profile.save();
    return finished;
  },
};
