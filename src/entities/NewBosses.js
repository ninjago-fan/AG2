// Bosses of the later levels. Same rules as Boss.js: they wake up when you
// walk into the arena, and get faster with extra attacks below half health.

// Level 5. Rooted in place. Roots burst out of the ground under you, acorns
// rain from its branches, and it calls bats (and, when angry, an ogre).
class HauntedTree extends Boss {
  constructor(scene, x, y) {
    super(scene, x, y, 'hauntedTree', 'tree1');
    this.body.setSize(22, 54).setOffset(17, 10);
    this.mode = 'idle';
  }

  tick(time) {
    if (this.dying) return;
    this.body.setVelocityX(0);
    if (!this.awake) return;
    this.setFlipX(false);
    if (this.mode === 'idle' && time > this.nextAttack) this.pickAttack(time);
  }

  pickAttack(time) {
    const near = Math.abs(this.player.x - this.x) < 56;
    const options = near ? ['swipe', 'roots'] : ['roots', 'acorns', 'roots', 'acorns'];
    options.push('summon');
    const pick = Phaser.Utils.Array.GetRandom(options);
    this.mode = 'attack';
    this.setTexture('tree2');
    if (pick === 'roots') this.roots();
    else if (pick === 'acorns') this.acorns();
    else if (pick === 'swipe') this.swipe();
    else {
      if (this.enraged) this.summon('ogre', 1, 1);
      this.summon('bat', 2, 3);
      this.done(1400);
    }
  }

  done(wait) {
    this.later(250, () => {
      this.setTexture('tree1');
      this.mode = 'idle';
      this.nextAttack = this.scene.time.now + wait * (this.enraged ? 0.65 : 1);
    });
  }

  // Warning marks on the ground, then spikes shoot up out of it.
  roots() {
    const a = this.arena;
    const n = this.enraged ? 5 : 3;
    for (let i = 0; i < n; i++) {
      const x = Phaser.Math.Clamp(this.player.x + (i - (n - 1) / 2) * 34 + Phaser.Math.Between(-6, 6), a.left + 10, a.right - 10);
      const top = this.scene.groundTop(x);
      const mark = this.scene.add.image(x, top - 2, 'warn').setDepth(4);
      this.scene.tweens.add({ targets: mark, alpha: 0.2, duration: 100, yoyo: true, repeat: 3 });
      this.later(650, () => {
        mark.destroy();
        const root = this.shoot('root', x, top - 9, 0, 0, { hitsLow: true, lifetime: 700 });
        root.y = top + 6;
        this.scene.tweens.add({ targets: root, y: top - 9, duration: 120 });
        this.scene.fx('rock', x, top, 6);
      });
      this.scene.time.delayedCall(700, () => { if (mark.active) mark.destroy(); });
    }
    Sfx.play('quake');
    this.done(1900);
  }

  acorns() {
    const n = this.enraged ? 8 : 5;
    for (let i = 0; i < n; i++) {
      this.later(i * 130, () => {
        const x = this.x + Phaser.Math.Between(-24, 24);
        const y = this.y - 24;
        const t = 0.9;
        const tx = this.player.x + Phaser.Math.Between(-40, 40);
        const vx = (tx - x) / t;
        const vy = ((this.player.y - y) - 0.5 * 500 * t * t) / t;
        this.shoot('acorn', x, y, vx, vy, { gravity: 500, spin: 300, hitsLow: true });
        Sfx.play('throw');
      });
    }
    this.done(n * 130 + 1500);
  }

  swipe() {
    this.scene.cameras.main.shake(250, 0.012);
    Sfx.play('slam');
    const y = this.body.bottom - 5;
    [-1, 1].forEach(dir => this.shoot('tremor', this.x + dir * 20, y, dir * 190, 0, { hitsLow: true, lifetime: 1600 }));
    this.done(1500);
  }
}

// Level 6. Marches toward you, fires bursts of lasers, charges behind its
// shield, and opens the portal behind it to call in guards.
class GateGuard extends Boss {
  constructor(scene, x, y) {
    super(scene, x, y, 'gateGuard', 'gateguard1');
    this.body.setSize(18, 33).setOffset(5, 3);
    this.mode = 'walk';
    const a = scene.arena;
    const top = scene.groundTop(a.right - 30);
    this.gate = scene.add.sprite(a.right - 30, top - 24, 'portal1').setScale(2).setDepth(1).play('portal_spin');
    Shaders.glow(this.gate, 0x4dd2ff, 4);
  }

  tick(time) {
    if (this.dying) return;
    const b = this.body;
    const dx = this.player.x - this.x;
    if (!this.awake) {
      b.setVelocityX(0);
      return;
    }
    if (this.mode === 'walk') {
      this.setFlipX(dx < 0);
      b.setVelocityX(Math.abs(dx) < 40 ? 0 : Math.sign(dx) * (this.enraged ? 40 : 26));
      if (time > this.nextAttack) this.pickAttack(time);
    } else if (this.mode === 'charge') {
      const a = this.arena;
      if (time > this.chargeUntil || this.x <= a.left + 16 || this.x >= a.right - 16) {
        this.mode = 'walk';
        this.setTexture('gateguard1');
        this.nextAttack = time + (this.enraged ? 700 : 1200);
      }
    } else if (this.mode !== 'chargeWindup') {
      b.setVelocityX(0);
    }
    this.clampToArena();
  }

  pickAttack(time) {
    const options = ['burst', 'charge', 'burst'];
    options.push('portal');
    const pick = Phaser.Utils.Array.GetRandom(options);
    if (pick === 'burst') this.burst();
    else if (pick === 'charge') this.charge();
    else this.openPortal(time);
  }

  burst() {
    this.mode = 'shoot';
    this.body.setVelocityX(0);
    this.setTexture('gateguard2');
    const n = this.enraged ? 5 : 3;
    for (let i = 0; i < n; i++) {
      this.later(250 + i * 160, () => {
        const dir = this.flipX ? -1 : 1;
        const x = this.x + dir * 14, y = this.y + 1;
        const [vx, vy] = this.aim(x, y, 250, Phaser.Math.Between(-4, 4));
        this.shoot('laser', x, y, vx, vy, { rotate: true });
        Sfx.play('laser');
      });
    }
    this.later(250 + n * 160 + 100, () => {
      this.setTexture('gateguard1');
      this.mode = 'walk';
      this.nextAttack = this.scene.time.now + (this.enraged ? 1100 : 1700);
    });
  }

  charge() {
    this.mode = 'chargeWindup';
    this.body.setVelocityX(0);
    const dir = this.player.x < this.x ? -1 : 1;
    this.setFlipX(dir < 0);
    this.scene.tweens.add({ targets: this, alpha: 0.5, duration: 80, yoyo: true, repeat: 2 });
    this.later(480, () => {
      this.mode = 'charge';
      this.chargeUntil = this.scene.time.now + 800;
      this.body.setVelocityX(dir * (this.enraged ? 290 : 240));
      Sfx.play('dash');
    });
  }

  openPortal(time) {
    this.mode = 'shoot';
    this.body.setVelocityX(0);
    this.scene.tweens.add({ targets: this.gate, scale: 3, duration: 300, yoyo: true });
    this.later(350, () => {
      const alive = this.scene.enemies.getChildren().filter(e => e.active && !e.dying && e.type === 'fedGuard').length;
      if (alive < 2) {
        const top = this.scene.groundTop(this.gate.x);
        const e = new FedGuard(this.scene, this.gate.x, top - 20);
        e.placeOnGround(top);
        this.scene.fx('crystal', this.gate.x, top - 20, 14);
        Sfx.play('portal');
      }
      this.mode = 'walk';
      this.nextAttack = this.scene.time.now + 1300;
    });
  }

  die() {
    if (this.gate) this.scene.tweens.add({ targets: this.gate, scale: 0, duration: 800, onComplete: () => this.gate.destroy() });
    super.die();
  }
}

// Level 7. Stomps and jump-slams, fires eye lasers across the arena at your
// height (jump or crouch out of the way), and calls in aliens.
class GiantAlien extends Boss {
  constructor(scene, x, y) {
    super(scene, x, y, 'giantAlien', 'giantalien1');
    this.body.setSize(28, 40).setOffset(8, 8);
    this.mode = 'walk';
  }

  tick(time) {
    if (this.dying) return;
    const b = this.body;
    if (!this.awake) {
      b.setVelocityX(0);
      return;
    }
    const dx = this.player.x - this.x;
    if (this.mode === 'walk') {
      this.setFlipX(dx < 0);
      b.setVelocityX(Math.abs(dx) < 24 ? 0 : Math.sign(dx) * (this.enraged ? 50 : 32));
      if (time > this.nextAttack && b.blocked.down) this.pickAttack(time);
    } else if (this.mode === 'jump') {
      if (time > this.modeStart + 200 && b.blocked.down) this.land(time);
    } else {
      b.setVelocityX(0);
    }
    this.clampToArena();
  }

  pickAttack(time) {
    const options = ['jump', 'eyes', 'jump', 'eyes', 'summon'];
    const pick = Phaser.Utils.Array.GetRandom(options);
    if (pick === 'jump') {
      this.mode = 'jump';
      this.modeStart = time;
      this.body.setVelocity(Phaser.Math.Clamp((this.player.x - this.x) * 1.1, -170, 170), -460);
      Sfx.play('jump');
    } else if (pick === 'eyes') {
      this.eyeLaser();
    } else {
      this.summon('alien', 2, 3);
      this.nextAttack = time + 1200;
    }
  }

  land(time) {
    this.mode = 'walk';
    this.body.setVelocityX(0);
    this.scene.cameras.main.shake(300, 0.016);
    this.scene.fx('goo', this.x, this.body.bottom, 16);
    Sfx.play('slam');
    const y = this.body.bottom - 5;
    [-1, 1].forEach(dir => this.shoot('tremor', this.x + dir * 18, y, dir * (this.enraged ? 220 : 180), 0, { hitsLow: true, lifetime: 1800 }));
    this.nextAttack = time + (this.enraged ? 1200 : 2000);
  }

  // A red line shows where the beams will go, then they fire along it.
  eyeLaser() {
    this.mode = 'eyes';
    this.body.setVelocityX(0);
    this.setTexture('giantalien2');
    const dir = this.player.x < this.x ? -1 : 1;
    this.setFlipX(dir < 0);
    const y = this.player.body.center.y;
    const a = this.arena;
    const line = this.scene.add.rectangle(a.left, y, a.right - a.left, 1, 0xff4040, 0.6).setOrigin(0, 0.5).setDepth(4);
    this.scene.tweens.add({ targets: line, alpha: 0.1, duration: 90, yoyo: true, repeat: 3 });
    Sfx.play('bossRoar');
    this.later(700, () => {
      line.destroy();
      const n = this.enraged ? 4 : 3;
      for (let i = 0; i < n; i++) {
        this.later(i * 120, () => {
          this.shoot('laser_beam', this.x + dir * 14, y, dir * 380, 0, { tint: 0xff4040 }).setTint(0xff6060);
          Sfx.play('laser');
        });
      }
      this.later(n * 120 + 300, () => {
        this.setTexture('giantalien1');
        this.mode = 'walk';
        this.nextAttack = this.scene.time.now + (this.enraged ? 1000 : 1600);
      });
    });
    this.scene.time.delayedCall(900, () => { if (line.active) line.destroy(); });
  }
}

// Level 8. Floats on a hover saucer, sprays plasma, calls down lightning,
// and summons alien guards.
class AlienKing extends Boss {
  constructor(scene, x, y) {
    super(scene, x, y, 'alienKing', 'alienking1');
    this.body.setAllowGravity(false);
    this.body.setSize(34, 34).setOffset(5, 8);
    this.t = 0;
    this.mode = 'hover';
    this.play('alienking_hover');
  }

  get collidesWithTiles() { return false; }

  tick(time, delta) {
    if (this.dying) return;
    const b = this.body;
    const a = this.arena;
    this.t += delta / 1000;
    if (!this.awake) {
      b.setVelocity(0, Math.sin(this.t * 2) * 10);
      return;
    }
    const cx = (a.left + a.right) / 2;
    if (this.mode === 'hover') {
      this.setFlipX(this.player.x < this.x);
      const tx = cx + Math.sin(this.t * 0.8) * 160;
      const ty = 90 + Math.sin(this.t * 2.3) * 16;
      b.setVelocity((tx - this.x) * 2, (ty - this.y) * 3);
      if (time > this.nextAttack) this.pickAttack(time);
    } else if (this.mode === 'dive') {
      const v = new Phaser.Math.Vector2(this.diveTo.x - this.x, this.diveTo.y - this.y);
      if (v.length() < 8 || time > this.diveEnd) {
        this.mode = 'hover';
        this.nextAttack = time + 800;
      } else {
        v.normalize().scale(this.enraged ? 260 : 210);
        b.setVelocity(v.x, v.y);
      }
    } else {
      b.velocity.scale(0.9);
    }
    this.clampToArena();
  }

  pickAttack(time) {
    const options = ['plasma', 'lightning', 'plasma', 'dive', 'summon'];
    const pick = Phaser.Utils.Array.GetRandom(options);
    if (pick === 'plasma') this.plasmaFan();
    else if (pick === 'lightning') this.lightning();
    else if (pick === 'dive') {
      const groundTop = this.scene.groundTop(this.player.x);
      this.mode = 'dive';
      this.diveTo = { x: this.player.x, y: groundTop - 30 };
      this.diveEnd = time + 1200;
      Sfx.play('bossRoar');
    } else {
      this.summon('alienGuard', 1, 2);
      this.nextAttack = time + 1300;
    }
  }

  plasmaFan() {
    this.mode = 'cast';
    const n = this.enraged ? 7 : 5;
    const waves = this.enraged ? 2 : 1;
    for (let w = 0; w < waves; w++) {
      this.later(300 + w * 450, () => {
        for (let i = 0; i < n; i++) {
          const [vx, vy] = this.aim(this.x, this.y, 150, (i - (n - 1) / 2) * 16);
          this.shoot('plasma', this.x, this.y, vx, vy);
        }
        Sfx.play('plasma');
      });
    }
    this.later(300 + waves * 450, () => {
      this.mode = 'hover';
      this.nextAttack = this.scene.time.now + (this.enraged ? 1000 : 1500);
    });
  }

  lightning() {
    this.mode = 'cast';
    const a = this.arena;
    const n = this.enraged ? 5 : 3;
    const camTop = this.scene.cameras.main.scrollY;
    for (let i = 0; i < n; i++) {
      const x = Phaser.Math.Clamp(this.player.x + (i - (n - 1) / 2) * 44 + Phaser.Math.Between(-8, 8), a.left + 10, a.right - 10);
      const top = this.scene.groundTop(x);
      const mark = this.scene.add.image(x, top - 2, 'warn').setDepth(4);
      this.scene.tweens.add({ targets: mark, alpha: 0.2, duration: 100, yoyo: true, repeat: 3 });
      this.later(700 + i * 90, () => {
        mark.destroy();
        this.shoot('bolt_v', x, camTop - 24, 0, 650, { hitsLow: true, lifetime: 900 });
        this.scene.cameras.main.flash(60, 255, 255, 200);
        Sfx.play('zap');
      });
      this.scene.time.delayedCall(1200, () => { if (mark.active) mark.destroy(); });
    }
    this.later(900 + n * 90, () => {
      this.mode = 'hover';
      this.nextAttack = this.scene.time.now + (this.enraged ? 900 : 1400);
    });
  }
}

// Level 9. A giant computer at the end of the arena. Fires laser beams along
// the floor (jump) or at head height (crouch), drops data bombs, and builds
// robots.
class SuperComputer extends Boss {
  constructor(scene, x, y) {
    super(scene, x, y, 'superComputer', 'computer1');
    this.body.setSize(44, 50).setOffset(2, 2);
    this.mode = 'idle';
  }

  get face() { return this.enraged ? 'computer2' : 'computer1'; }

  tick(time) {
    if (this.dying) return;
    this.body.setVelocityX(0);
    if (!this.awake) return;
    if (this.mode === 'idle') {
      if (this.texture.key !== this.face) this.setTexture(this.face);
      if (time > this.nextAttack) this.pickAttack(time);
    }
  }

  pickAttack(time) {
    const options = ['lasers', 'bombs', 'lasers', 'robot'];
    const pick = Phaser.Utils.Array.GetRandom(options);
    this.mode = 'attack';
    this.setTexture('computer3');
    Sfx.play('glitch');
    if (pick === 'lasers') this.lasers();
    else if (pick === 'bombs') this.bombs();
    else {
      this.summon('robot', 1, 2);
      this.done(1200);
    }
  }

  done(wait) {
    this.mode = 'idle';
    this.setTexture(this.face);
    this.nextAttack = this.scene.time.now + wait * (this.enraged ? 0.65 : 1);
  }

  lasers() {
    const ground = this.scene.groundTop(this.x);
    const n = this.enraged ? 6 : 4;
    for (let i = 0; i < n; i++) {
      this.later(400 + i * 650, () => {
        const low = Math.random() < 0.5;
        // Low beams skim the floor (jump), high beams fly at head height (crouch).
        const y = low ? ground - 4 : ground - 12;
        const beam = this.shoot('laser_beam', this.x - 26, y, -(this.enraged ? 300 : 250), 0, { hitsLow: low, lifetime: 2200 });
        beam.setTint(low ? 0xff6060 : 0x80ffff);
        Sfx.play('laser');
      });
    }
    this.later(400 + n * 650, () => this.done(1000));
  }

  bombs() {
    const a = this.arena;
    const camTop = this.scene.cameras.main.scrollY;
    const n = this.enraged ? 7 : 5;
    for (let i = 0; i < n; i++) {
      this.later(200 + i * 220, () => {
        const x = i === 0 ? this.player.x : Phaser.Math.Between(a.left + 16, a.right - 70);
        this.shoot('data_bomb', x, camTop - 8, 0, 60, { gravity: 300, spin: 200, hitsLow: true });
      });
    }
    this.later(200 + n * 220 + 400, () => this.done(1300));
  }
}

// Final boss. Teleports around, throws clock hands in spinning rings and
// straight at you, pours sand from the sky, and calls in glitch mobs.
class MasterOfTime extends Boss {
  constructor(scene, x, y) {
    super(scene, x, y, 'masterOfTime', 'timemaster1');
    this.body.setSize(14, 32).setOffset(4, 4);
    this.mode = 'idle';
  }

  tick(time) {
    if (this.dying) return;
    const b = this.body;
    const dx = this.player.x - this.x;
    if (!this.awake) {
      b.setVelocityX(0);
      this.setFlipX(dx < 0);
      return;
    }
    if (this.mode === 'idle') {
      this.setFlipX(dx < 0);
      b.setVelocityX(Math.abs(dx) > 100 ? Math.sign(dx) * 34 : -Math.sign(dx) * 34);
      if (time > this.nextAttack) this.pickAttack(time);
    } else {
      b.setVelocityX(0);
    }
    this.clampToArena();
  }

  pickAttack(time) {
    const options = ['teleport', 'spiral', 'hands', 'sand', 'teleport'];
    if (this.enraged) options.push('summon', 'spiral');
    else options.push('summon');
    const pick = Phaser.Utils.Array.GetRandom(options);
    if (pick === 'teleport') this.teleport();
    else if (pick === 'spiral') this.spiral();
    else if (pick === 'hands') this.hands();
    else if (pick === 'sand') this.sand();
    else {
      this.summon('glitch', 2, 3);
      this.nextAttack = time + 1300;
    }
  }

  finish(wait) {
    this.setTexture('timemaster1');
    this.mode = 'idle';
    this.nextAttack = this.scene.time.now + wait * (this.enraged ? 0.65 : 1);
  }

  teleport() {
    this.mode = 'teleport';
    this.untouchable = true;
    Sfx.play('timeStop');
    this.scene.fx('gold', this.x, this.y, 16);
    this.scene.tweens.add({
      targets: this, alpha: 0, angle: 180, duration: 250,
      onComplete: () => {
        if (!this.active || this.dying) return;
        const a = this.arena;
        let x;
        do { x = Phaser.Math.Between(a.left + 30, a.right - 30); } while (Math.abs(x - this.player.x) < 90);
        this.x = x;
        this.angle = 0;
        this.scene.fx('gold', this.x, this.y, 16);
        this.scene.tweens.add({
          targets: this, alpha: 1, duration: 250,
          onComplete: () => {
            if (!this.active || this.dying) return;
            this.untouchable = false;
            if (Math.random() < 0.5) this.hands();
            else this.spiral();
          },
        });
      },
    });
  }

  spiral() {
    this.mode = 'cast';
    this.setTexture('timemaster2');
    const waves = this.enraged ? 4 : 3;
    for (let w = 0; w < waves; w++) {
      this.later(300 + w * 260, () => {
        for (let i = 0; i < 8; i++) {
          const ang = (i / 8) * Math.PI * 2 + w * 0.3;
          this.shoot('clock_hand', this.x, this.y - 4, Math.cos(ang) * 130, Math.sin(ang) * 130, { rotate: true, lifetime: 2400 });
        }
        Sfx.play('type');
      });
    }
    this.later(300 + waves * 260 + 200, () => this.finish(1400));
  }

  hands() {
    this.mode = 'cast';
    this.setTexture('timemaster2');
    const n = this.enraged ? 5 : 3;
    this.later(300, () => {
      for (let i = 0; i < n; i++) {
        const [vx, vy] = this.aim(this.x, this.y - 4, 230, (i - (n - 1) / 2) * 12);
        this.shoot('clock_hand', this.x, this.y - 4, vx, vy, { rotate: true, trail: 'gold' });
      }
      Sfx.play('throw');
      this.finish(1300);
    });
  }

  sand() {
    this.mode = 'cast';
    this.setTexture('timemaster2');
    const a = this.arena;
    const camTop = this.scene.cameras.main.scrollY;
    const n = this.enraged ? 14 : 10;
    for (let i = 0; i < n; i++) {
      this.later(200 + i * 110, () => {
        const x = i % 3 === 0 ? this.player.x + Phaser.Math.Between(-10, 10) : Phaser.Math.Between(a.left + 8, a.right - 8);
        this.shoot('sand', x, camTop - 4, 0, 90, { gravity: 220, hitsLow: true });
      });
    }
    this.later(200 + n * 110, () => this.finish(1200));
  }
}

Object.assign(BOSS_CLASSES, {
  hauntedTree: HauntedTree, gateGuard: GateGuard, giantAlien: GiantAlien,
  alienKing: AlienKing, superComputer: SuperComputer, masterOfTime: MasterOfTime,
});
