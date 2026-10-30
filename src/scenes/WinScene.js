// data: { score, time, level }
class WinScene extends Phaser.Scene {
  constructor() { super('WinScene'); }

  create(data) {
    const W = this.scale.width, H = this.scale.height;
    const score = data.score || 0;
    this.result = { score, time: data.time || 0, level: data.level || LEVELS.length };
    this.leaving = false;
    this.add.image(0, 0, 'sky_10').setOrigin(0).setDisplaySize(W, H);
    this.add.tileSprite(0, 0, W, H, 'bg_far_10').setOrigin(0);

    // Coins raining down.
    for (let i = 0; i < 40; i++) {
      const c = this.add.sprite(Phaser.Math.Between(0, W), Phaser.Math.Between(-H, 0), 'coin1').play('coin_spin');
      this.tweens.add({ targets: c, y: H + 20, duration: Phaser.Math.Between(2500, 5000), repeat: -1, delay: Phaser.Math.Between(0, 2000) });
    }

    this.add.image(W / 2, 180, 'chest_open').setScale(4);
    const title = pixelText(this, W / 2, 44, 'YOU WIN!', { scale: 5, origin: 0.5, tint: 0xffcd3a });
    this.tweens.add({ targets: title, scale: 5.4, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    pixelText(this, W / 2, 82, 'ALL TEN TREASURES ARE YOURS. TIME IS SAFE AGAIN!', { origin: 0.5 });
    pixelText(this, W / 2, 102, 'FINAL SCORE ' + score, { scale: 2, origin: 0.5 });
    pixelText(this, W / 2, 120, 'TIME ' + formatTime(this.result.time), { origin: 0.5, tint: 0xb0d0ff });
    pixelText(this, W / 2, 132, 'BEST ' + Math.max(score, SaveManager.getBest()), { origin: 0.5, tint: 0xffcd3a });
    pixelText(this, W / 2, 250, InputMode.ipad ? 'TAP TO CONTINUE' : 'PRESS ENTER OR CLICK', { origin: 0.5 });

    Shaders.apply(this);
    this.cameras.main.fadeIn(500);
    this.time.delayedCall(800, () => {
      this.input.keyboard.once('keydown-ENTER', () => this.next());
      this.input.once('pointerdown', () => this.next());
    });
  }

  next() {
    if (this.leaving) return;
    this.leaving = true;
    Sfx.play('confirm');
    const r = this.result;
    if (Leaderboard.qualifies(r.score)) {
      this.scene.start('NameEntryScene', { score: r.score, level: r.level, time: r.time, result: 'VICTORY', title: 'NEW HIGH SCORE!' });
    } else {
      this.scene.start('LeaderboardScene', { sort: 'time' });
    }
  }
}
