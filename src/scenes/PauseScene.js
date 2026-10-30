class PauseScene extends Phaser.Scene {
  constructor() { super('PauseScene'); }

  create() {
    const W = this.scale.width, H = this.scale.height;
    this.done = false;
    this.add.rectangle(0, 0, W, H, 0x000000, 0.75).setOrigin(0);
    pixelText(this, W / 2, 18, 'PAUSED', { scale: 3, origin: 0.5, tint: 0xffe080 });

    const controls = InputMode.ipad ? [
      ['< >', 'MOVE (SLIDE YOUR FINGER BETWEEN THEM)'],
      ['JUMP', 'JUMP (TAP AGAIN IN THE AIR TO DOUBLE JUMP)'],
      ['V', 'CROUCH (FLYING SHOTS MISS YOU)'],
      ['HIT', 'ATTACK (HOLD TO KEEP ATTACKING)'],
      ['DASH', 'DASH (YOU CAN\'T BE HURT WHILE DASHING)'],
      ['WPN', 'NEXT WEAPON, OR TAP A WEAPON ICON'],
      ['RUNES', 'TAP A RUNE ICON TO USE ITS POWER'],
      ['RIDE', 'GET ON OR OFF THE PEGASUS'],
    ] : [
      ['ARROWS', 'MOVE, JUMP (AGAIN IN THE AIR), CROUCH'],
      ['SPACE OR J', 'ATTACK          D  DASH'],
      ['TAB', 'NEXT WEAPON     1-9, 0  WEAPON BY NUMBER'],
      ['S F B A T M', 'SWORD FIRE BOW AXE THROWING-AXE BOMBS'],
      ['R I N U L O', 'BOOM-ARANG / ICE EARTH AIR LIGHTNING VOID WAND'],
      ['Q W E Z X', 'EARTH CRYSTAL SHADOW WATER ICE RUNES'],
      ['C G H K', 'LIGHT UNDEAD TIME AIR RUNES'],
      ['P', 'RIDE THE PEGASUS / HOP OFF'],
    ];
    controls.forEach(([k, what], i) => {
      pixelText(this, 16, 40 + i * 13, k, { tint: 0xffcd3a });
      pixelText(this, 104, 40 + i * 13, what, { tint: 0xdddddd });
    });

    const s = this.registry.get('state');
    pixelText(this, W / 2, 152, `TIME ${formatTime(s.time)}   SCORE ${s.score}`, { origin: 0.5, tint: 0xb0d0ff });

    makeButton(this, W / 2, 174, 150, 18, 'RESUME', () => this.resume());
    this.shaderButton = makeButton(this, W / 2, 196, 150, 18, Shaders.label(), () => this.toggleShaders());
    makeButton(this, W / 2, 218, 150, 18, 'QUIT TO MENU', () => this.quit());
    pixelText(this, W / 2, 238, InputMode.ipad ? '' : 'ESC RESUME   V SHADERS   Q QUIT', { origin: 0.5, tint: 0xaaaaaa });
    pixelText(this, W / 2, 252, 'YOUR SAVE IS KEPT. A HIGH SCORE GOES ON THE LEADERBOARD.', { origin: 0.5, tint: 0x7a7a8a });

    this.input.keyboard.once('keydown-ESC', () => this.resume());
    this.input.keyboard.on('keydown-V', () => this.toggleShaders());
    this.input.keyboard.once('keydown-Q', () => this.quit());
  }

  resume() {
    if (this.done) return;
    this.done = true;
    Sfx.play('pause');
    this.scene.resume('GameScene');
    this.scene.stop();
  }

  toggleShaders() {
    Shaders.toggle();
    Shaders.apply(this.scene.get('GameScene'));
    this.shaderButton.setLabel(Shaders.label());
  }

  quit() {
    if (this.done) return;
    this.done = true;
    const s = this.registry.get('state');
    Profile.save();
    this.scene.stop('UIScene');
    this.scene.stop('TouchScene');
    this.scene.stop('GameScene');
    if (Leaderboard.qualifies(s.score)) {
      this.scene.start('NameEntryScene', {
        score: s.score, level: s.level + 1, time: s.time,
        result: s.inBonus ? 'BONUS' : 'LEVEL ' + (s.level + 1), title: 'RUN OVER',
      });
    } else {
      this.scene.start('MenuScene');
    }
  }
}
