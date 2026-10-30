// Main menu > WARDROBE: pick a skin and accessories (all free). Choices are
// saved right away and used in every run.
const WARDROBE_ROWS = ['skin'].concat(ACCESSORY_SLOTS);

class WardrobeScene extends Phaser.Scene {
  constructor() { super('WardrobeScene'); }

  create() {
    const W = this.scale.width, H = this.scale.height;
    this.profile = Profile.get();
    this.row = 0;
    this.leaving = false;

    this.add.image(0, 0, 'sky_4').setOrigin(0).setDisplaySize(W, H);
    this.add.tileSprite(0, 0, W, H, 'bg_far_4').setOrigin(0);
    this.add.rectangle(0, 0, W, H, 0x000000, 0.35).setOrigin(0);
    pixelText(this, W / 2, 10, 'WARDROBE', { scale: 3, origin: [0.5, 0], tint: 0xffcd3a });

    this.add.rectangle(20, 44, 150, 190, 0x10101c, 0.85).setOrigin(0).setStrokeStyle(1, 0x4a4a6a);
    this.preview = this.add.sprite(95, 130, 'player_idle').setScale(6);
    this.armorPreview = 0;

    this.labels = [];
    this.values = [];
    WARDROBE_ROWS.forEach((slot, i) => {
      const y = 64 + i * 34;
      this.labels.push(pixelText(this, 327, y - 12, slot === 'skin' ? 'SKIN' : ACCESSORY_SLOT_NAMES[slot], { origin: 0.5, tint: 0x9a9a9a }));
      makeButton(this, 214, y + 4, 22, 18, '<', () => { this.row = i; this.change(-1); });
      makeButton(this, 440, y + 4, 22, 18, '>', () => { this.row = i; this.change(1); });
      this.values.push(pixelText(this, 327, y + 4, '', { origin: 0.5, scale: 1 }));
      this.add.zone(327, y + 4, 190, 20).setInteractive().on('pointerdown', () => { this.row = i; this.refresh(); });
    });
    this.cursor = this.add.rectangle(327, 0, 196, 22, 0xffffff, 0.08).setStrokeStyle(1, 0xffcd3a);

    makeButton(this, 95, 252, 110, 18, 'DONE', () => this.leave());
    pixelText(this, 327, 252, InputMode.ipad ? 'TAP THE ARROWS TO CHANGE' : 'UP/DOWN PICK  LEFT/RIGHT CHANGE  ESC DONE', { origin: 0.5, tint: 0x8a8a9a });

    const kb = this.input.keyboard;
    kb.on('keydown-UP', () => { this.row = (this.row + WARDROBE_ROWS.length - 1) % WARDROBE_ROWS.length; Sfx.play('select'); this.refresh(); });
    kb.on('keydown-DOWN', () => { this.row = (this.row + 1) % WARDROBE_ROWS.length; Sfx.play('select'); this.refresh(); });
    kb.on('keydown-LEFT', () => this.change(-1));
    kb.on('keydown-RIGHT', () => this.change(1));
    ['ESC', 'ENTER'].forEach(k => kb.on('keydown-' + k, () => this.leave()));

    this.refresh();
    Shaders.apply(this);
    this.cameras.main.fadeIn(300);
  }

  options(slot) {
    return slot === 'skin' ? SKIN_ORDER : Object.keys(ACCESSORIES[slot]);
  }

  current(slot) {
    return slot === 'skin' ? this.profile.skin : this.profile.accessories[slot];
  }

  change(d) {
    const slot = WARDROBE_ROWS[this.row];
    const list = this.options(slot);
    const next = list[(list.indexOf(this.current(slot)) + d + list.length) % list.length];
    if (slot === 'skin') this.profile.skin = next;
    else this.profile.accessories[slot] = next;
    Profile.save();
    Sfx.play('select');
    this.refresh();
  }

  refresh() {
    WARDROBE_ROWS.forEach((slot, i) => {
      const key = this.current(slot);
      const name = slot === 'skin' ? SKINS[key].name : ACCESSORIES[slot][key];
      this.values[i].setText(name.toUpperCase()).setTint(i === this.row ? 0xffffff : 0xb0b0b0);
      this.labels[i].setTint(i === this.row ? 0xffcd3a : 0x9a9a9a);
    });
    this.cursor.setY(64 + this.row * 34 + 4);
    const tex = ensurePlayerTextures(this, this.profile.skin, null);
    this.preview.play(tex + '_run', true);
  }

  leave() {
    if (this.leaving) return;
    this.leaving = true;
    Sfx.play('confirm');
    this.scene.start('MenuScene');
  }
}
