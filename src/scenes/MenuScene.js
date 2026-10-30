class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    const W = this.scale.width;
    this.chosen = false;

    // Backdrop: meadow scenery with a strip of ground.
    this.add.image(0, 0, 'sky_0').setOrigin(0).setDisplaySize(W, this.scale.height);
    this.far = this.add.tileSprite(0, 0, W, this.scale.height, 'bg_far_0').setOrigin(0);
    this.near = this.add.tileSprite(0, 0, W, this.scale.height, 'bg_near_0').setOrigin(0);
    this.add.tileSprite(0, 224, W, 16, 'tiles', 0).setOrigin(0);
    this.add.tileSprite(0, 240, W, 32, 'tiles', 1).setOrigin(0);

    const tex = ensurePlayerTextures(this, Profile.get().skin, null);
    this.add.sprite(60, 214, tex + '_idle').play(tex + '_run');
    const p = Profile.get();
    if (p.pet) this.add.sprite(36, 218, PETS[p.pet].texture);
    this.add.sprite(400, 220, 'slime1').play('slime_move');
    this.add.sprite(360, 219, 'crab1').play('crab_walk');
    const bat = this.add.sprite(330, 120, 'bat1').play('bat_fly');
    this.tweens.add({ targets: bat, y: 104, x: 350, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.add.image(440, 217, 'chest_closed');

    const title = pixelText(this, W / 2, 34, 'AG1', { scale: 6, origin: 0.5, tint: 0xffcd3a });
    this.tweens.add({ targets: title, y: 30, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    pixelText(this, W / 2, 62, 'A PIXEL TREASURE QUEST', { origin: 0.5 });

    this.save = SaveManager.load();
    this.options = [];
    if (this.save) {
      this.options.push({
        label: 'CONTINUE',
        sub: `LEVEL ${this.save.level + 1}  SCORE ${this.save.score}  GOLD ${this.save.gold}  TIME ${formatTime(this.save.time)}`,
        action: () => this.startGame(this.save),
      });
    }
    this.options.push({ label: 'NEW GAME', action: () => this.startGame(GameState.fresh()) });
    this.options.push({ label: 'WARDROBE', sub: 'PICK A SKIN, HAT, NECKLACE, FACE ITEM AND BELT', action: () => this.scene.start('WardrobeScene') });
    this.options.push({ label: 'DAILY TASKS', sub: `JUST FOR FUN - STARS: ${p.stars}`, action: () => this.scene.start('DailyScene') });
    this.options.push({ label: 'LEADERBOARD', action: () => this.scene.start('LeaderboardScene') });
    this.shaderOption = {
      label: Shaders.label(),
      instant: true,
      sub: Shaders.supported(this.game) ? 'CRT SCANLINES AND GLOW (V IN GAME)' : 'NEEDS WEBGL',
      action: () => {
        Shaders.toggle();
        Shaders.apply(this);
        this.shaderOption.label = Shaders.label();
      },
    };
    this.options.push(this.shaderOption);
    this.controlsOption = {
      label: this.controlsLabel(),
      instant: true,
      sub: 'IPAD: TOUCH BUTTONS. COMPUTER: KEYBOARD.',
      action: () => {
        InputMode.set(InputMode.ipad ? 'computer' : 'ipad');
        this.controlsOption.label = this.controlsLabel();
        this.help.setText(this.helpText());
      },
    };
    this.options.push(this.controlsOption);

    this.optionTexts = this.options.map((o, i) => pixelText(this, W / 2, 84 + i * 15, o.label, { scale: 1, origin: 0.5 }));
    // Each option can be clicked or tapped.
    this.options.forEach((o, i) => {
      this.add.zone(W / 2, 84 + i * 15, 220, 15).setInteractive({ useHandCursor: true }).on('pointerdown', () => {
        Sfx.unlock();
        if (this.index !== i) {
          this.index = i;
          this.refresh();
        }
        this.choose();
      });
    });
    this.subText = pixelText(this, W / 2, 84 + this.options.length * 15 + 2, '', { origin: 0.5, tint: 0xaaaaaa });
    this.cursor = pixelText(this, 0, 0, '>', { origin: 0.5, tint: 0xffcd3a });
    this.index = 0;
    this.refresh();

    const best = SaveManager.getBest();
    if (best > 0) pixelText(this, W - 6, 6, 'BEST ' + best, { origin: [1, 0], tint: 0xffcd3a });
    pixelText(this, 6, 6, 'STARS ' + p.stars, { tint: 0xffe080 });

    this.help = pixelText(this, W / 2, 252, this.helpText(), { origin: 0.5 });
    pixelText(this, W / 2, 263, 'UP/DOWN + ENTER, OR CLICK / TAP', { origin: 0.5, tint: 0xcccccc });

    const kb = this.input.keyboard;
    kb.on('keydown-UP', () => this.move(-1));
    kb.on('keydown-DOWN', () => this.move(1));
    ['ENTER', 'SPACE'].forEach(k => kb.on('keydown-' + k, () => this.choose()));

    Shaders.apply(this);
    this.cameras.main.fadeIn(300);
  }

  controlsLabel() { return 'CONTROLS: ' + (InputMode.ipad ? 'IPAD' : 'COMPUTER'); }

  helpText() {
    return InputMode.ipad ? 'TOUCH BUTTONS: ARROWS, JUMP, HIT, DASH. TAP ICONS FOR WEAPONS AND RUNES'
      : 'ARROWS MOVE  SPACE ATTACK  D DASH  P PEGASUS  ESC PAUSE';
  }

  move(d) {
    if (this.options.length < 2) return;
    this.index = (this.index + d + this.options.length) % this.options.length;
    Sfx.play('select');
    this.refresh();
  }

  refresh() {
    this.optionTexts.forEach((t, i) => {
      t.setText(this.options[i].label);
      t.setScale(i === this.index ? 2 : 1);
      t.setTint(i === this.index ? 0xffffff : 0x9a9a9a);
    });
    const sel = this.optionTexts[this.index];
    this.cursor.setPosition(sel.x - sel.displayWidth / 2 - 10, sel.y).setScale(2);
    this.subText.setText(this.options[this.index].sub || '');
  }

  choose() {
    if (this.chosen) return;
    const opt = this.options[this.index];
    if (opt.instant) {
      Sfx.play('select');
      opt.action();
      this.refresh();
      return;
    }
    this.chosen = true;
    Sfx.play('confirm');
    this.cameras.main.fadeOut(300);
    this.cameras.main.once('camerafadeoutcomplete', () => opt.action());
  }

  startGame(state) {
    this.registry.set('state', GameState.clone(state));
    this.registry.set('checkpoint', null);
    startLevel(this);
  }

  update(time) {
    this.far.tilePositionX = time * 0.004;
    this.near.tilePositionX = time * 0.012;
  }
}
