// Main menu > DAILY TASKS: today's three tasks and how far along they are.
// New tasks every day. They're just for fun: finishing one earns a star.
class DailyScene extends Phaser.Scene {
  constructor() { super('DailyScene'); }

  create() {
    const W = this.scale.width, H = this.scale.height;
    this.leaving = false;
    this.add.image(0, 0, 'sky_0').setOrigin(0).setDisplaySize(W, H);
    this.add.tileSprite(0, 0, W, H, 'bg_far_0').setOrigin(0);
    this.add.rectangle(0, 0, W, H, 0x000000, 0.45).setOrigin(0);
    pixelText(this, W / 2, 12, 'DAILY TASKS', { scale: 3, origin: [0.5, 0], tint: 0xffcd3a });
    pixelText(this, W / 2, 48, 'NEW TASKS EVERY DAY. JUST FOR FUN!', { origin: 0.5, tint: 0xcccccc });

    Daily.tasks().forEach((t, i) => {
      const y = 78 + i * 50;
      this.add.rectangle(W / 2, y + 8, 400, 42, 0x10101c, 0.85).setStrokeStyle(1, t.done ? 0xffcd3a : 0x4a4a6a);
      this.add.image(52, y + 8, 'icon_star').setScale(2).setAlpha(t.done ? 1 : 0.25);
      pixelText(this, 76, y - 2, t.text, { tint: t.done ? 0xffcd3a : 0xffffff });
      this.add.rectangle(76, y + 16, 300, 6, 0x000000).setOrigin(0, 0.5).setStrokeStyle(1, 0x4a4a6a);
      this.add.rectangle(77, y + 16, 298 * t.progress / t.n, 4, t.done ? 0xffcd3a : 0x4fc24a).setOrigin(0, 0.5);
      pixelText(this, 424, y + 13, t.done ? 'DONE!' : `${t.progress}/${t.n}`, { origin: [1, 0], tint: t.done ? 0xffcd3a : 0xaaaaaa });
    });

    pixelText(this, W / 2, 228, 'STARS COLLECTED: ' + Profile.get().stars, { origin: 0.5, tint: 0xffe080, scale: 1 });
    makeButton(this, W / 2, 252, 100, 18, 'BACK', () => this.leave());
    ['ESC', 'ENTER', 'SPACE'].forEach(k => this.input.keyboard.on('keydown-' + k, () => this.leave()));
    Shaders.apply(this);
    this.cameras.main.fadeIn(300);
  }

  leave() {
    if (this.leaving) return;
    this.leaving = true;
    Sfx.play('confirm');
    this.scene.start('MenuScene');
  }
}
