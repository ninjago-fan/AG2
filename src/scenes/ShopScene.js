// Between levels: spend gold on weapons, weapon upgrades (forge), armor,
// upgrades, pets and the pegasus. Purchases are saved right away. Pets and the
// pegasus stay yours for every future run. The shopkeeper has opinions.
const SHOP_TABS = ['WEAPONS', 'FORGE', 'ARMOR', 'UPGRADES', 'PETS'];
const SHOP_ROWS = 9;          // rows visible at once (the list scrolls)
const SHOP_ROW_H = 18;

const SHOPKEEPER_LINES = {
  hello: ['WELCOME, HERO! BEST PRICES IN ALL OF TIME AND SPACE.', 'AH, A CUSTOMER! BROWSE, BUY, BE AMAZED.', 'BACK AGAIN? I KNEW YOU COULDN\'T STAY AWAY.'],
  buy: ['PLEASURE DOING BUSINESS!', 'EXCELLENT CHOICE!', 'NO REFUNDS. JUST KIDDING. ALSO NO REFUNDS.', 'THAT ONE IS MY FAVOURITE!'],
  poor: ['NO GOLD, NO GOODS!', 'COME BACK WITH MORE SHINY COINS.', 'I DON\'T TAKE IOUS.'],
  pet: ['TAKE GOOD CARE OF IT!', 'IT ALREADY LIKES YOU.'],
  bye: ['COME BACK SOON!', 'GOOD LUCK OUT THERE!'],
  tab: {
    WEAPONS: 'EVERY WEAPON GIVES A BONUS THE FIRST TIME YOU GET IT.',
    FORGE: 'I CAN MAKE YOUR WEAPONS STRONGER AND FASTER.',
    ARMOR: 'ARMOR TAKES HITS BEFORE YOUR HEARTS DO.',
    UPGRADES: 'UPGRADES LAST THE WHOLE RUN.',
    PETS: 'PETS AND THE PEGASUS STAY WITH YOU FOREVER!',
  },
};

class ShopScene extends Phaser.Scene {
  constructor() { super('ShopScene'); }

  create() {
    const W = this.scale.width, H = this.scale.height;
    this.state = this.registry.get('state');
    this.profile = Profile.get();
    this.tab = 0;
    this.index = 0;
    this.top = 0;
    this.leaving = false;
    this.rows = [];

    this.add.image(0, 0, 'sky_1').setOrigin(0).setDisplaySize(W, H);
    this.add.tileSprite(0, 0, W, H, 'bg_far_1').setOrigin(0);
    this.add.rectangle(0, 0, W, H, 0x000000, 0.45).setOrigin(0);

    pixelText(this, W / 2, 6, 'SHOP', { scale: 3, origin: [0.5, 0], tint: 0xffcd3a });
    pixelText(this, 8, 8, 'NEXT', { tint: 0x9a9a9a });
    pixelText(this, 8, 19, LEVELS[this.state.level].name, { tint: 0xffffff });
    this.add.image(W - 8, 12, 'coin1').setOrigin(1, 0.5);
    this.goldText = pixelText(this, W - 20, 8, '', { origin: [1, 0], tint: 0xffe080 });

    this.tabTexts = SHOP_TABS.map((t, i) => {
      const x = 50 + i * 95;
      this.add.zone(x, 38, 90, 14).setInteractive().on('pointerdown', () => this.switchTab(i - this.tab));
      return pixelText(this, x, 34, t, { origin: [0.5, 0] });
    });

    this.add.rectangle(10, 50, 318, 172, 0x10101c, 0.85).setOrigin(0).setStrokeStyle(1, 0x4a4a6a);
    this.add.rectangle(334, 50, 136, 172, 0x10101c, 0.85).setOrigin(0).setStrokeStyle(1, 0x4a4a6a);
    this.highlight = this.add.rectangle(12, 0, 314, SHOP_ROW_H - 2, 0x2a2a4a).setOrigin(0, 0.5);
    this.cursor = pixelText(this, 14, 0, '>', { origin: [0, 0.5], tint: 0xffcd3a });
    this.moreUp = pixelText(this, 318, 54, '', { origin: [1, 0], tint: 0x8a8a9a });
    this.moreDown = pixelText(this, 318, 212, '', { origin: [1, 0], tint: 0x8a8a9a });
    for (let i = 0; i < SHOP_ROWS; i++) {
      this.add.zone(169, this.rowY(i), 314, SHOP_ROW_H).setInteractive().on('pointerdown', () => this.tapRow(this.top + i));
    }
    this.input.on('wheel', (p, objs, dx, dy) => this.move(dy > 0 ? 1 : -1));

    // The shopkeeper and you, side by side.
    this.keeper = this.add.image(372, 75, 'shopkeeper').setScale(2);
    this.preview = this.add.image(436, 75, 'player_idle').setScale(2);
    this.speech = pixelText(this, 340, 100, '', { tint: 0xffffff }).setMaxWidth(126);
    this.statsText = pixelText(this, 344, 160, '', { tint: 0xcccccc });

    this.descText = pixelText(this, 12, 228, '', { tint: 0xcccccc }).setMaxWidth(316);
    this.flashText = pixelText(this, 169, 214, '', { origin: 0.5, tint: 0xff6060 });
    makeButton(this, 402, 238, 128, 20, 'NEXT LEVEL >', () => this.leave(), { tint: 0xffcd3a });
    pixelText(this, W / 2, 263, InputMode.ipad ? 'TAP A ROW TO PICK IT, TAP AGAIN TO BUY'
      : 'LEFT/RIGHT TAB  UP/DOWN CHOOSE  ENTER BUY  ESC NEXT LEVEL', { origin: 0.5, tint: 0x8a8a9a });

    const kb = this.input.keyboard;
    kb.on('keydown-LEFT', () => this.switchTab(-1));
    kb.on('keydown-RIGHT', () => this.switchTab(1));
    kb.on('keydown-UP', () => this.move(-1));
    kb.on('keydown-DOWN', () => this.move(1));
    kb.on('keydown-ENTER', () => this.buy());
    kb.on('keydown-SPACE', () => this.buy());
    kb.on('keydown-ESC', () => this.leave());

    this.refresh();
    this.say('hello');
    Shaders.apply(this);
    this.cameras.main.fadeIn(300);
  }

  rowY(i) { return 61 + i * SHOP_ROW_H; }

  // The shopkeeper says a random line of a kind ('buy', 'poor', ...) or the
  // given text, moving their mouth while talking.
  say(kindOrText) {
    const lines = SHOPKEEPER_LINES[kindOrText];
    const text = Array.isArray(lines) ? Phaser.Utils.Array.GetRandom(lines) : kindOrText;
    this.speech.setText(text);
    if (this.talk) this.talk.remove();
    let n = 0;
    this.talk = this.time.addEvent({
      delay: 110, repeat: 7,
      callback: () => { n++; this.keeper.setTexture(n % 2 && n < 8 ? 'shopkeeper2' : 'shopkeeper'); },
    });
  }

  // Items in the current tab: { icon, name, desc, price, status, tint, buy?, equip?, disabled? }
  items() {
    const s = this.state;
    const p = this.profile;
    const owned = 0x80ff80, equipped = 0x80e0ff;
    const priced = price => ({ price, status: price + ' G', tint: s.gold >= price ? 0xffe080 : 0xff6060 });
    const tab = SHOP_TABS[this.tab];

    if (tab === 'WEAPONS') {
      return WEAPON_ORDER.filter(w => w !== 'dagger').map(w => {
        const def = WEAPONS[w];
        const base = { icon: 'w_' + w, name: def.name, desc: def.desc };
        if (s.weapon === w) return Object.assign(base, { status: 'EQUIPPED', tint: equipped });
        if (s.owned.includes(w)) return Object.assign(base, { status: 'EQUIP', tint: owned, equip: () => { s.weapon = w; } });
        return Object.assign(base, priced(def.price), {
          buy: () => {
            s.owned.push(w);
            s.weapon = w;
            if (def.upgrade.maxHp) s.maxHp += def.upgrade.maxHp;
          },
        });
      });
    }
    if (tab === 'FORGE') {
      return WEAPON_ORDER.filter(w => s.owned.includes(w)).map(w => {
        const def = WEAPONS[w];
        const lv = GameState.weaponLevel(s, w);
        const base = {
          icon: 'w_' + w, name: `${def.name} LV ${lv}/${FORGE.maxLevel}`,
          desc: lv >= FORGE.maxLevel ? 'AS STRONG AS IT GETS.' : `LEVEL ${lv + 1}: +1 DAMAGE AND 8% FASTER ATTACKS.`,
        };
        if (lv >= FORGE.maxLevel) return Object.assign(base, { status: 'MAX', tint: owned });
        return Object.assign(base, priced(FORGE.price(w, lv)), { buy: () => { s.weaponLevels[w] = lv + 1; } });
      });
    }
    if (tab === 'ARMOR') {
      const cur = ARMOR_ORDER.indexOf(s.armor);
      return ARMOR_ORDER.map((a, i) => {
        const def = ARMORS[a];
        const base = { icon: 'armor_' + a, name: def.name, desc: `${def.points} shield hearts that soak up hits. Refill every level.` };
        if (i === cur) return Object.assign(base, { status: 'WEARING', tint: equipped });
        if (i < cur) return Object.assign(base, { status: '-', tint: 0x6a6a6a, disabled: 'YOU HAVE BETTER ARMOR' });
        return Object.assign(base, priced(def.price), { buy: () => { s.armor = a; } });
      });
    }
    if (tab === 'UPGRADES') {
      return UPGRADE_ORDER.map(k => {
        const def = UPGRADES[k];
        const n = s.upgrades[k];
        const base = { icon: def.icon, name: def.name + (def.max > 1 ? ` (${n}/${def.max})` : ''), desc: def.desc };
        if (n >= def.max) return Object.assign(base, { status: 'MAX', tint: owned });
        return Object.assign(base, priced(def.base + def.step * n), {
          buy: () => {
            s.upgrades[k]++;
            if (k === 'maxHp') s.maxHp++;
          },
        });
      });
    }
    // PETS: one pet at a time comes along; the pegasus always does.
    const rows = PET_ORDER.map(k => {
      const def = PETS[k];
      const base = { icon: def.texture, name: def.name, desc: def.desc, pet: true };
      if (p.pet === k) return Object.assign(base, { status: 'WITH YOU', tint: equipped });
      if (p.pets.includes(k)) return Object.assign(base, { status: 'TAKE', tint: owned, equip: () => { p.pet = k; } });
      return Object.assign(base, priced(def.price), { buy: () => { p.pets.push(k); p.pet = k; } });
    });
    if (p.pets.length) {
      rows.push(Object.assign({ icon: 'icon_none', name: 'No Pet', desc: 'Leave your pet at home for a while.' },
        p.pet ? { status: 'LEAVE', tint: owned, equip: () => { p.pet = null; } } : { status: 'ALONE', tint: equipped }));
    }
    const peg = { icon: 'icon_pegasus', name: PEGASUS.name, desc: PEGASUS.desc, pet: true };
    rows.push(p.pegasus ? Object.assign(peg, { status: 'OWNED', tint: owned })
      : Object.assign(peg, priced(PEGASUS.price), { buy: () => { p.pegasus = true; } }));
    return rows;
  }

  refresh() {
    const s = this.state;
    this.list = this.items();
    if (!this.list.length) this.list = [{ icon: 'icon_none', name: 'Nothing here yet', desc: '', status: '' }];
    this.index = Phaser.Math.Clamp(this.index, 0, this.list.length - 1);
    // Scroll so the chosen row is visible, with a row of room past it when possible.
    const maxTop = Math.max(0, this.list.length - SHOP_ROWS);
    if (this.index - 1 < this.top) this.top = this.index - 1;
    if (this.index + 1 > this.top + SHOP_ROWS - 1) this.top = this.index + 2 - SHOP_ROWS;
    this.top = Phaser.Math.Clamp(this.top, 0, maxTop);

    this.rows.forEach(o => o.destroy());
    this.rows = [];
    this.list.slice(this.top, this.top + SHOP_ROWS).forEach((item, k) => {
      const i = this.top + k;
      const y = this.rowY(k);
      const icon = this.add.image(30, y, item.icon);
      icon.setScale(Math.min(1, 14 / Math.max(icon.width, icon.height)) * (icon.height <= 10 ? 1.3 : 1));
      this.rows.push(
        icon,
        pixelText(this, 44, y, item.name, { origin: [0, 0.5], tint: i === this.index ? 0xffffff : 0xb0b0b0 }),
        pixelText(this, 320, y, item.status, { origin: [1, 0.5], tint: item.tint }),
      );
    });
    const y = this.rowY(this.index - this.top);
    this.highlight.setY(y);
    this.cursor.setY(y);
    this.moreUp.setText(this.top > 0 ? 'MORE ^' : '');
    this.moreDown.setText(this.top < maxTop ? 'MORE V' : '');
    this.tabTexts.forEach((t, i) => t.setTint(i === this.tab ? 0xffcd3a : 0x7a7a8a).setScale(i === this.tab ? 1.2 : 1));
    this.goldText.setText(String(s.gold));
    this.descText.setText((this.list[this.index].desc || '').toUpperCase());

    this.preview.setTexture(ensurePlayerTextures(this, this.profile.skin, s.armor) + '_idle');
    const b = GameState.bonuses(s);
    this.statsText.setText([
      'MAX HP  ' + s.maxHp,
      'ARMOR   ' + GameState.armorPoints(s),
      'POWER   +' + b.power,
      'JUMPS   ' + GameState.maxJumps(s),
      'RUNES   ' + s.runes.length + '/' + RUNE_ORDER.length,
    ].join('\n'));
  }

  switchTab(d) {
    if (!d) return;
    this.tab = (this.tab + d + SHOP_TABS.length) % SHOP_TABS.length;
    this.index = 0;
    this.top = 0;
    Sfx.play('select');
    this.refresh();
    this.say(SHOPKEEPER_LINES.tab[SHOP_TABS[this.tab]]);
  }

  move(d) {
    this.index = (this.index + d + this.list.length) % this.list.length;
    Sfx.play('select');
    this.refresh();
  }

  // Tap a row to pick it; tap the picked row again to buy it.
  tapRow(i) {
    if (i >= this.list.length) return;
    Sfx.unlock();
    if (i === this.index) {
      this.buy();
      return;
    }
    this.index = i;
    Sfx.play('select');
    this.refresh();
  }

  flash(text, tint = 0xff6060) {
    this.flashText.setText(text).setTint(tint).setAlpha(1);
    this.tweens.killTweensOf(this.flashText);
    this.tweens.add({ targets: this.flashText, alpha: 0, delay: 900, duration: 300 });
  }

  buy() {
    if (this.leaving) return;
    const item = this.list[this.index];
    const s = this.state;
    if (item.disabled) {
      Sfx.play('error');
      this.flash(item.disabled);
    } else if (item.buy) {
      if (s.gold < item.price) {
        Sfx.play('error');
        this.flash('NOT ENOUGH GOLD');
        this.say('poor');
        return;
      }
      s.gold -= item.price;
      item.buy();
      Sfx.play('buy');
      this.flash('BOUGHT!', 0x80ff80);
      this.say(item.pet ? 'pet' : 'buy');
    } else if (item.equip) {
      item.equip();
      Sfx.play('confirm');
    } else {
      return;
    }
    SaveManager.save(s);
    Profile.save();
    this.refresh();
  }

  leave() {
    if (this.leaving) return;
    this.leaving = true;
    Sfx.play('confirm');
    this.say('bye');
    this.time.delayedCall(350, () => {
      this.cameras.main.fadeOut(300);
      this.cameras.main.once('camerafadeoutcomplete', () => startLevel(this));
    });
  }
}
