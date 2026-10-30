// Type three letters for the leaderboard (keyboard, or tap the arrows).
// data: { score, level, time, result, title }
class NameEntryScene extends Phaser.Scene {
  constructor() { super('NameEntryScene'); }

  create(data) {
    const W = this.scale.width, H = this.scale.height;
    this.data_ = data;
    this.letters = ['A', 'A', 'A'];
    this.pos = 0;
    this.done = false;
    this.add.image(0, 0, 'sky_2').setOrigin(0).setDisplaySize(W, H);
    this.add.rectangle(0, 0, W, H, 0x000000, 0.5).setOrigin(0);

    pixelText(this, W / 2, 30, data.title || 'NEW HIGH SCORE!', { scale: 3, origin: 0.5, tint: 0xffcd3a });
    pixelText(this, W / 2, 58, `SCORE ${data.score}   LEVEL ${data.level}   TIME ${formatTime(data.time)}`, { origin: 0.5 });
    pixelText(this, W / 2, 78, 'ENTER YOUR NAME', { origin: 0.5, tint: 0xcccccc });

    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const step = (i, d) => {
      this.pos = i;
      const c = CHARS.indexOf(this.letters[i]);
      this.letters[i] = CHARS[(c + d + CHARS.length) % CHARS.length];
      Sfx.play('select');
      this.refresh();
    };
    this.slots = [0, 1, 2].map(i => {
      const x = W / 2 - 50 + i * 50;
      makeButton(this, x, 104, 30, 16, '^', () => step(i, 1));
      makeButton(this, x, 172, 30, 16, 'V', () => step(i, -1));
      this.add.zone(x, 138, 36, 40).setInteractive().on('pointerdown', () => { this.pos = i; this.refresh(); });
      return pixelText(this, x, 138, 'A', { scale: 4, origin: 0.5 });
    });
    this.underline = this.add.rectangle(0, 160, 26, 3, 0xffcd3a);
    makeButton(this, W / 2, 206, 100, 20, 'SAVE', () => this.submit(), { tint: 0xffcd3a });
    pixelText(this, W / 2, 236, 'TYPE A LETTER, OR UP/DOWN TO CHANGE IT', { origin: 0.5, tint: 0xaaaaaa });
    pixelText(this, W / 2, 250, 'LEFT/RIGHT TO MOVE   ENTER TO SAVE', { origin: 0.5, tint: 0xaaaaaa });

    const kb = this.input.keyboard;
    kb.on('keydown-UP', () => step(this.pos, 1));
    kb.on('keydown-DOWN', () => step(this.pos, -1));
    kb.on('keydown-LEFT', () => { this.pos = Math.max(0, this.pos - 1); this.refresh(); });
    kb.on('keydown-RIGHT', () => { this.pos = Math.min(2, this.pos + 1); this.refresh(); });
    kb.on('keydown-BACKSPACE', () => { this.pos = Math.max(0, this.pos - 1); this.refresh(); });
    kb.on('keydown', e => {
      const ch = (e.key || '').toUpperCase();
      if (ch.length === 1 && CHARS.includes(ch)) {
        this.letters[this.pos] = ch;
        this.pos = Math.min(2, this.pos + 1);
        Sfx.play('select');
        this.refresh();
      }
    });
    kb.on('keydown-ENTER', () => this.submit());
    this.refresh();
    Shaders.apply(this);
  }

  refresh() {
    this.slots.forEach((t, i) => t.setText(this.letters[i]).setTint(i === this.pos ? 0xffffff : 0x9a9a9a));
    this.underline.setX(this.slots[this.pos].x);
  }

  submit() {
    if (this.done) return;
    this.done = true;
    Sfx.play('confirm');
    const d = this.data_;
    const entry = Leaderboard.add(this.letters.join(''), d.score, d.level, d.time, d.result);
    this.scene.start('LeaderboardScene', { highlight: entry.date, sort: d.result === 'VICTORY' ? 'time' : 'score' });
  }
}

// Best runs on this computer, sorted by score, level reached, or time.
// data: { highlight (entry date), sort }
const BOARD_SORTS = [['score', 'SCORE'], ['level', 'LEVEL'], ['time', 'TIME']];

class LeaderboardScene extends Phaser.Scene {
  constructor() { super('LeaderboardScene'); }

  create(data = {}) {
    const W = this.scale.width, H = this.scale.height;
    this.data_ = data;
    this.leaving = false;
    this.sort = Math.max(0, BOARD_SORTS.findIndex(([k]) => k === data.sort));
    this.rows = [];
    this.add.image(0, 0, 'sky_2').setOrigin(0).setDisplaySize(W, H);
    this.add.tileSprite(0, 0, W, H, 'bg_far_2').setOrigin(0);
    this.add.rectangle(0, 0, W, H, 0x000000, 0.55).setOrigin(0);
    pixelText(this, W / 2, 16, 'LEADERBOARD', { scale: 3, origin: 0.5, tint: 0xffcd3a });

    this.tabs = BOARD_SORTS.map(([, label], i) => makeButton(this, W / 2 - 110 + i * 110, 40, 90, 15, 'BY ' + label, () => {
      this.sort = i;
      Sfx.play('select');
      this.refresh();
    }));

    this.cols = [40, 80, 150, 250, 320];
    ['RANK', 'NAME', 'SCORE', 'LEVEL', 'TIME'].forEach((h, i) => pixelText(this, this.cols[i], 56, h, { tint: 0x9a9a9a }));
    makeButton(this, W / 2, 254, 120, 18, 'BACK TO MENU', () => this.leave());
    pixelText(this, W / 2, 236, InputMode.ipad ? '' : 'LEFT/RIGHT TO SORT   ENTER OR ESC TO GO BACK', { origin: 0.5, tint: 0x7a7a8a });
    this.refresh();

    Shaders.apply(this);
    this.cameras.main.fadeIn(300);
    const kb = this.input.keyboard;
    kb.on('keydown-LEFT', () => { this.sort = (this.sort + 2) % 3; Sfx.play('select'); this.refresh(); });
    kb.on('keydown-RIGHT', () => { this.sort = (this.sort + 1) % 3; Sfx.play('select'); this.refresh(); });
    this.time.delayedCall(300, () => {
      ['ENTER', 'ESC', 'SPACE'].forEach(k => kb.on('keydown-' + k, () => this.leave()));
    });
  }

  refresh() {
    const W = this.scale.width;
    this.rows.forEach(o => o.destroy());
    this.rows = [];
    this.tabs.forEach((t, i) => t.text.setTint(i === this.sort ? 0xffcd3a : 0x9a9a9a));
    const list = Leaderboard.list(BOARD_SORTS[this.sort][0]);
    if (!list.length) this.rows.push(pixelText(this, W / 2, 130, 'NO SCORES YET. BE THE FIRST!', { origin: 0.5 }));
    list.forEach((e, i) => {
      const y = 70 + i * 16;
      const mine = e.date === this.data_.highlight;
      const tint = mine ? 0xffcd3a : (i < 3 ? 0xffffff : 0xcccccc);
      const row = [
        pixelText(this, this.cols[0], y, String(i + 1), { tint }),
        pixelText(this, this.cols[1], y, e.name, { tint }),
        pixelText(this, this.cols[2], y, String(e.score), { tint }),
        pixelText(this, this.cols[3], y, e.result === 'VICTORY' ? 'ALL ' + e.level : String(e.level), { tint }),
        pixelText(this, this.cols[4], y, e.time ? formatTime(e.time) : '-', { tint }),
      ];
      if (mine) this.tweens.add({ targets: row, alpha: 0.4, duration: 400, yoyo: true, repeat: -1 });
      this.rows.push(...row);
    });
  }

  leave() {
    if (this.leaving) return;
    this.leaving = true;
    Sfx.play('confirm');
    this.scene.start('MenuScene');
  }
}
