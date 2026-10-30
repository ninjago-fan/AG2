// The first screen: are you playing on an iPad or a computer? Click or tap
// to choose. 'iPad' turns on the touch buttons; 'computer' uses the keyboard.
class DeviceScene extends Phaser.Scene {
  constructor() { super('DeviceScene'); }

  create() {
    const W = this.scale.width, H = this.scale.height;
    this.add.image(0, 0, 'sky_0').setOrigin(0).setDisplaySize(W, H);
    this.add.tileSprite(0, 0, W, H, 'bg_far_0').setOrigin(0);
    this.add.rectangle(0, 0, W, H, 0x000000, 0.35).setOrigin(0);
    pixelText(this, W / 2, 40, 'AG1', { scale: 5, origin: 0.5, tint: 0xffcd3a });
    pixelText(this, W / 2, 80, 'WHAT ARE YOU PLAYING ON?', { scale: 1, origin: 0.5 });

    this.choice(W / 2 - 90, 'IPAD', 'TOUCH BUTTONS ON SCREEN', 'ipad', (g, x, y) => {
      g.fillStyle(0x2a2a3a).fillRoundedRect(x - 22, y - 30, 44, 60, 5);
      g.fillStyle(0x4aa8f0).fillRect(x - 18, y - 25, 36, 48);
      g.fillStyle(0xffffff).fillCircle(x, y + 27, 1.5);
    });
    this.choice(W / 2 + 90, 'COMPUTER', 'KEYBOARD CONTROLS', 'computer', (g, x, y) => {
      g.fillStyle(0x2a2a3a).fillRect(x - 30, y - 28, 60, 40);
      g.fillStyle(0x4aa8f0).fillRect(x - 26, y - 24, 52, 32);
      g.fillStyle(0x6a6a7a).fillRect(x - 6, y + 12, 12, 6);
      g.fillStyle(0x8a8a9a).fillRect(x - 34, y + 20, 68, 8);
      g.fillStyle(0x3a3a4a);
      for (let i = 0; i < 10; i++) g.fillRect(x - 31 + i * 6.5, y + 22, 4, 2);
    });
    pixelText(this, W / 2, 250, 'CLICK OR TAP TO CHOOSE', { origin: 0.5, tint: 0xcccccc });
    Shaders.apply(this);
    this.cameras.main.fadeIn(300);
  }

  choice(x, label, sub, mode, drawIcon) {
    const y = 160;
    const box = this.add.rectangle(x, y, 150, 120, 0x10101c, 0.85).setStrokeStyle(2, 0x8a8aaa).setInteractive({ useHandCursor: true });
    const g = this.add.graphics();
    drawIcon(g, x, y - 18);
    pixelText(this, x, y + 30, label, { scale: 2, origin: 0.5, tint: 0xffcd3a });
    pixelText(this, x, y + 48, sub, { origin: 0.5, tint: 0xaaaaaa });
    box.on('pointerover', () => box.setStrokeStyle(2, 0xffcd3a));
    box.on('pointerout', () => box.setStrokeStyle(2, 0x8a8aaa));
    box.on('pointerdown', () => {
      if (this.chosen) return;
      this.chosen = true;
      Sfx.unlock();
      Sfx.play('confirm');
      InputMode.set(mode);
      if (mode === 'ipad') {
        // Fill the whole screen if the browser lets us.
        try { if (!this.scale.isFullscreen) this.scale.startFullscreen(); } catch (e) { /* ignore */ }
      }
      this.cameras.main.fadeOut(250);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('MenuScene'));
    });
  }

  init() { this.chosen = false; }
}
