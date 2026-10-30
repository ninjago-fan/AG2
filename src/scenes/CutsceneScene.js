// Short story scenes (STORY in story.js) with a typewriter text box.
// ENTER / SPACE / click / tap: next line. ESC or the SKIP button: skip it all.
// data: { story, next, nextData }

// Start the current level, playing its cutscene first if this run hasn't seen it.
function startLevel(scene) {
  const s = scene.registry.get('state');
  if (!s.inBonus && STORY[s.level] && !s.seenStory.includes(s.level)) {
    s.seenStory.push(s.level);
    scene.scene.start('CutsceneScene', { story: s.level, next: 'GameScene' });
  } else {
    scene.scene.start('GameScene');
  }
}

class CutsceneScene extends Phaser.Scene {
  constructor() { super('CutsceneScene'); }

  create(data) {
    const W = this.scale.width, H = this.scale.height;
    this.data_ = data;
    this.story = STORY[data.story];
    this.line = -1;
    this.typing = null;
    this.ending = false;
    const t = this.story.theme;

    this.add.image(0, 0, 'sky_' + t).setOrigin(0).setDisplaySize(W, H);
    this.far = this.add.tileSprite(0, 0, W, H, 'bg_far_' + t).setOrigin(0);
    this.near = this.add.tileSprite(0, 0, W, H, 'bg_near_' + t).setOrigin(0);
    const ground = 176;
    this.add.tileSprite(0, ground, W, 16, 'tiles', t * 3).setOrigin(0);
    this.add.tileSprite(0, ground + 16, W, H - ground - 16, 'tiles', t * 3 + 1).setOrigin(0);

    // The two characters slide in from the sides, standing on the ground.
    const actor = (key, x, fromX, flip) => {
      const tex = key === 'player' ? ensurePlayerTextures(this, Profile.get().skin, null) + '_idle' : key;
      const img = this.add.image(fromX, ground, tex).setOrigin(0.5, 1).setFlipX(flip);
      const frame = this.textures.get(tex).getSourceImage();
      img.setScale(Math.max(1, Math.min(4, Math.floor(84 / frame.height))));
      this.tweens.add({ targets: img, x, duration: 600, ease: 'Cubic.out' });
      return img;
    };
    if (this.story.left) this.leftActor = actor(this.story.left, 110, -60, false);
    if (this.story.right) this.rightActor = actor(this.story.right, 370, W + 80, this.story.right !== 'chest_open');

    this.add.rectangle(W / 2, 228, W - 20, 70, 0x0b0b14, 0.9).setStrokeStyle(2, 0x8a8aaa);
    this.speaker = pixelText(this, 22, 199, '', { tint: 0xffcd3a });
    this.text = pixelText(this, 22, 213, '', { tint: 0xffffff }).setMaxWidth(W - 44);
    this.hint = pixelText(this, W - 22, 254, '', { origin: [1, 0.5], tint: 0x8a8a9a });
    makeButton(this, W - 34, 14, 56, 16, 'SKIP >>', () => this.finish());

    const kb = this.input.keyboard;
    ['ENTER', 'SPACE'].forEach(k => kb.on('keydown-' + k, () => this.advance()));
    kb.on('keydown-ESC', () => this.finish());
    this.input.on('pointerdown', (pointer, over) => { if (!over.length) this.advance(); });

    Shaders.apply(this);
    this.cameras.main.fadeIn(400);
    this.time.delayedCall(500, () => this.advance());
  }

  advance() {
    if (this.ending) return;
    // Still typing: show the whole line at once.
    if (this.typing) {
      this.typing.remove();
      this.typing = null;
      this.text.setText(this.story.lines[this.line][1]);
      this.hint.setText(InputMode.ipad ? 'TAP' : 'ENTER');
      return;
    }
    this.line++;
    if (this.line >= this.story.lines.length) {
      this.finish();
      return;
    }
    const [who, words] = this.story.lines[this.line];
    this.speaker.setText(who);
    this.text.setText('');
    this.hint.setText('');
    // Whoever is speaking hops a little.
    const target = who === 'YOU' ? this.leftActor : (who ? this.rightActor : null);
    if (target) this.tweens.add({ targets: target, y: target.y - 6, duration: 120, yoyo: true });
    let n = 0;
    this.typing = this.time.addEvent({
      delay: 28,
      repeat: words.length - 1,
      callback: () => {
        n++;
        this.text.setText(words.slice(0, n));
        if (n % 3 === 0) Sfx.play('type');
        if (n >= words.length) {
          this.typing = null;
          this.hint.setText(InputMode.ipad ? 'TAP' : 'ENTER');
        }
      },
    });
  }

  finish() {
    if (this.ending) return;
    this.ending = true;
    Sfx.play('confirm');
    this.cameras.main.fadeOut(300);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(this.data_.next, this.data_.nextData));
  }

  update(time) {
    this.far.tilePositionX = time * 0.004;
    this.near.tilePositionX = time * 0.01;
  }
}
