// HUD overlay: hearts, armor and pegasus hearts top-left, score/gold/level/time
// top-right, weapon bar and rune powers along the bottom (along the top on an
// iPad, where the bottom has the touch buttons; tap a slot to use it), boss
// health or bonus timer top-center.
class UIScene extends Phaser.Scene {
  constructor() { super('UIScene'); }

  create() {
    const W = this.scale.width;
    this.hearts = [];
    this.shields = [];
    this.pegHearts = [];
    this.slots = [];
    this.runeSlots = [];
    this.last = {};
    this.ipad = InputMode.ipad;

    this.scoreText = pixelText(this, W - 6, 6, '', { origin: [1, 0], tint: 0xffcd3a });
    this.goldText = pixelText(this, W - 6, 17, '', { origin: [1, 0], tint: 0xffe080 });
    this.goldIcon = this.add.image(0, 20, 'coin1');
    this.levelText = pixelText(this, W - 6, 28, '', { origin: [1, 0] });
    this.clockText = pixelText(this, W - 6, 39, '', { origin: [1, 0], tint: 0xb0d0ff });
    this.effectText = pixelText(this, 6, 0, '', { tint: 0x80e0ff });

    this.weaponText = pixelText(this, 4, 0, '');

    this.bossName = pixelText(this, W / 2, 4, '', { origin: [0.5, 0], tint: 0xff9090 });
    this.bossBarBg = this.add.rectangle(W / 2, 17, 164, 7, 0x000000).setStrokeStyle(1, 0x5a2a2a);
    this.bossBar = this.add.rectangle(W / 2 - 81, 17, 162, 5, 0xe43b44).setOrigin(0, 0.5);
    this.timerText = pixelText(this, W / 2, 4, '', { origin: [0.5, 0], scale: 2, tint: 0xffe080 });
  }

  get game_() { return this.scene.get('GameScene'); }

  // Row of slots: along the bottom on a computer, under the top HUD on an iPad.
  get barY() { return this.ipad ? 62 : this.scale.height - 11; }

  update() {
    const s = this.registry.get('state');
    if (!s) return;
    const gs = this.game_;
    const time = gs.time.now;
    const last = this.last;
    const armorMax = GameState.armorPoints(s);
    const peg = gs.pegasus;
    const pegHearts = peg && gs.player && gs.player.riding ? peg.hearts : -1;

    if (s.hp !== last.hp || s.maxHp !== last.maxHp || s.armorHp !== last.armorHp || armorMax !== last.armorMax || pegHearts !== last.pegHearts) {
      this.drawHearts(s.hp, s.maxHp, s.armorHp, armorMax, pegHearts);
    }
    if (s.score !== last.score) this.scoreText.setText('SCORE ' + String(s.score).padStart(6, '0'));
    if (s.gold !== last.gold) {
      this.goldText.setText(String(s.gold));
      this.goldIcon.setX(this.scale.width - 12 - this.goldText.width);
    }
    const levelLabel = s.inBonus ? 'BONUS LEVEL' : 'LEVEL ' + (s.level + 1) + '/' + LEVELS.length;
    if (levelLabel !== last.levelLabel) this.levelText.setText(levelLabel);
    const clock = 'TIME ' + formatTime(s.time);
    if (clock !== last.clock) this.clockText.setText(clock);

    const weaponsKey = s.owned.join() + '|' + s.weapon + '|' + GameState.weaponLevel(s, s.weapon);
    if (weaponsKey !== last.weaponsKey) this.drawWeapons(s);
    const runesKey = s.runes.join();
    if (runesKey !== last.runesKey) this.drawRunes(s);

    // Rune powers: dimmed with a countdown while recharging.
    this.runeSlots.forEach(p => {
      const left = (gs.powerReady && gs.powerReady[p.rune]) - time;
      const ready = !(left > 0);
      p.icon.setAlpha(ready ? 1 : 0.3);
      p.cd.setText(ready ? '' : String(Math.ceil(left / 1000)));
    });

    // Potions and time stop that are running.
    const effects = [];
    const secs = until => Math.ceil((until - time) / 1000);
    if (gs.player) {
      if (gs.player.shieldUntil > time) effects.push('SHIELD ' + secs(gs.player.shieldUntil));
      if (gs.player.frenzyUntil > time) effects.push('FRENZY ' + secs(gs.player.frenzyUntil));
    }
    if (gs.timeStopUntil > time) effects.push('TIME STOP ' + secs(gs.timeStopUntil));
    if (peg && peg.mode === 'resting') effects.push('PEGASUS BACK IN ' + secs(peg.returnAt));
    this.effectText.setText(effects.join('  '));

    // Boss health bar.
    const boss = this.registry.get('boss');
    [this.bossName, this.bossBarBg, this.bossBar].forEach(o => o.setVisible(!!boss));
    if (boss) {
      this.bossName.setText(boss.name);
      this.bossBar.width = 162 * boss.hp / boss.max;
    }

    // Bonus level countdown.
    const showTimer = s.inBonus && gs.bonusEndsAt > 0;
    this.timerText.setVisible(showTimer);
    if (showTimer) {
      const left = Math.max(0, Math.ceil((gs.bonusEndsAt - time) / 1000));
      this.timerText.setText(String(left)).setTint(left <= 10 ? 0xff6060 : 0xffe080);
    }

    Object.assign(last, {
      hp: s.hp, maxHp: s.maxHp, armorHp: s.armorHp, armorMax, pegHearts, score: s.score, gold: s.gold,
      levelLabel, clock, weaponsKey, runesKey,
    });
  }

  drawHearts(hp, maxHp, armorHp, armorMax, pegHearts) {
    const perRow = 12;
    while (this.hearts.length < maxHp) this.hearts.push(this.add.image(0, 0, 'heart_empty').setOrigin(0));
    this.hearts.forEach((img, i) => {
      img.setVisible(i < maxHp);
      img.setPosition(6 + (i % perRow) * 9, 6 + Math.floor(i / perRow) * 8);
      img.setTexture(i < hp ? 'heart_full' : 'heart_empty');
    });
    // Armor shields go on the row under the hearts.
    let y = 6 + Math.ceil(maxHp / perRow) * 8;
    while (this.shields.length < armorMax) this.shields.push(this.add.image(0, 0, 'shield_empty').setOrigin(0));
    this.shields.forEach((img, i) => {
      img.setVisible(i < armorMax);
      img.setPosition(6 + i * 9, y);
      img.setTexture(i < armorHp ? 'shield_full' : 'shield_empty');
    });
    if (armorMax) y += 8;
    // Pegasus hearts (white) while riding.
    while (this.pegHearts.length < PEGASUS.hearts) this.pegHearts.push(this.add.image(0, 0, 'heart_peg').setOrigin(0));
    this.pegHearts.forEach((img, i) => {
      img.setVisible(pegHearts >= 0);
      img.setPosition(6 + i * 9, y);
      img.setAlpha(i < pegHearts ? 1 : 0.25);
    });
    if (pegHearts >= 0) y += 8;
    this.effectText.setY(y + 1);
    // Flash red when HP drops.
    if (this.last.hp !== undefined && hp < this.last.hp) {
      this.cameras.main.flash(120, 120, 0, 0);
    }
  }

  slot(x, y, current, color) {
    return this.add.rectangle(x, y, 15, 15, current ? 0x3a3020 : 0x000000, 0.6).setStrokeStyle(1, color);
  }

  // One slot per owned weapon, in bar order, with its hotkey above it.
  drawWeapons(s) {
    const y = this.barY;
    this.slots.forEach(o => o.destroy());
    this.slots = [];
    const letters = {};
    Object.entries(WEAPON_HOTKEYS).forEach(([k, w]) => { letters[w] = k; });
    WEAPON_ORDER.filter(w => s.owned.includes(w)).forEach((w, i) => {
      const x = 10 + i * 17;
      const current = w === s.weapon;
      const box = this.slot(x, y, current, current ? 0xffcd3a : 0x5a5a6a);
      this.slots.push(box, this.add.image(x, y, 'w_' + w).setAlpha(current ? 1 : 0.6));
      if (this.ipad) {
        box.setInteractive().on('pointerdown', () => this.game_.selectWeapon(w));
      } else {
        const n = WEAPON_ORDER.indexOf(w);
        this.slots.push(pixelText(this, x, y - 18, letters[w] || (n < 10 ? String((n + 1) % 10) : ''), {
          origin: [0.5, 0], tint: current ? 0xffcd3a : 0x9a9a9a,
        }));
      }
    });
    const level = GameState.weaponLevel(s, s.weapon);
    this.weaponText.setText(WEAPONS[s.weapon].name.toUpperCase() + (level > 1 ? ' LV' + level : ''));
    this.weaponText.setY(this.ipad ? y + 10 : y - 31);
  }

  // One slot per rune you own, right to left, with its key above it.
  drawRunes(s) {
    const W = this.scale.width;
    const y = this.barY;
    this.runeSlots.forEach(p => [p.frame, p.icon, p.key, p.cd].forEach(o => o && o.destroy()));
    const owned = RUNE_ORDER.filter(r => s.runes.includes(r));
    this.runeSlots = owned.map((r, i) => {
      const x = W - 10 - (owned.length - 1 - i) * 17;
      const def = RUNES[r];
      const p = {
        rune: r,
        frame: this.add.rectangle(x, y, 15, 15, 0x000000, 0.5).setStrokeStyle(1, def.color),
        icon: this.add.image(x, y, 'rune_' + r),
        key: this.ipad ? null : pixelText(this, x, y - 18, def.key, { origin: [0.5, 0], tint: def.color }),
        cd: pixelText(this, x, y - 3, '', { origin: [0.5, 0] }),
      };
      if (this.ipad) p.frame.setInteractive().on('pointerdown', () => this.game_.usePower(r));
      return p;
    });
  }
}
