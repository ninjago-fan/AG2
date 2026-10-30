// iPad controls: on-screen buttons drawn over the game. Hold the arrows to
// move, slide your finger between them, and use several fingers at once.
class TouchScene extends Phaser.Scene {
  constructor() { super('TouchScene'); }

  create() {
    const W = this.scale.width, H = this.scale.height;
    this.input.addPointer(4);
    const profile = Profile.get();
    // [action, x, y, radius, label]
    const buttons = [
      ['left', 30, 238, 22, '<'],
      ['right', 82, 238, 22, '>'],
      ['down', 56, 196, 15, 'V'],
      ['attack', 448, 232, 24, 'HIT'],
      ['up', 396, 246, 21, 'JUMP'],
      ['dash', 448, 184, 16, 'DASH'],
      ['nextWeapon', 352, 254, 13, 'WPN'],
    ];
    if (profile.pegasus) buttons.push(['pegasus', 400, 198, 15, 'RIDE']);
    buttons.forEach(([action, x, y, r, label]) => this.makeButton(action, x, y, r, label));

    const pause = makeButton(this, W / 2, H - 12, 34, 16, 'II', () => this.controls && this.controls.press('pause'), { alpha: 0.4 });
    pause.box.on('pointerup', () => this.controls && this.controls.release('pause'));
  }

  get controls() {
    const gs = this.scene.get('GameScene');
    return gs && gs.controls;
  }

  makeButton(action, x, y, r, label) {
    const circle = this.add.circle(x, y, r, 0xffffff, 0.14).setStrokeStyle(1, 0xffffff, 0.5);
    pixelText(this, x, y, label, { origin: 0.5, tint: 0xffffff }).setAlpha(0.8);
    // A slightly bigger touch area than the drawn circle.
    circle.setInteractive(new Phaser.Geom.Circle(r, r, r + 6), Phaser.Geom.Circle.Contains);
    // Remember which finger holds the button, so lifting another finger
    // doesn't let go of it.
    let finger = null;
    const down = pointer => {
      if (!this.controls) return;
      finger = pointer.id;
      this.controls.press(action);
      circle.setFillStyle(0xffffff, 0.35);
    };
    const up = pointer => {
      if (finger === null || pointer.id !== finger) return;
      finger = null;
      if (this.controls) this.controls.release(action);
      circle.setFillStyle(0xffffff, 0.14);
    };
    circle.on('pointerdown', down);
    circle.on('pointerover', pointer => { if (pointer.isDown) down(pointer); });
    circle.on('pointerup', up);
    circle.on('pointerout', up);
    this.input.on('pointerupoutside', up);
  }
}
