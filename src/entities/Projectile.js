// Shared projectile used by player weapons, enemies and bosses.
// opts: { group, texture, dir, speed, vx, vy, gravity, spin, rotate, pierce,
//         hitsLow, damage, knockback, lifetime, trail }
//   vx, vy  - starting velocity (default: speed * dir sideways)
//   gravity - downward acceleration for arcing shots (throwing axe, boulders)
//   spin    - degrees per second (throwing axe, shuriken)
//   rotate  - point the sprite along its velocity (arrows, shards)
//   pierce  - flies through enemies, hitting each one once
//   hitsLow - still hits a crouching player (falling rocks, ground tremors)
//   trail   - particle trail: true / 'fire', 'crystal' or 'shadow'
//   homing  - steer toward this enemy (or, if true, the nearest one)
//   freeze  - ms an enemy it hits stays frozen (ice wand)
//   ghost   - flies through walls
//   collects- picks up coins and gems it touches
//   sweeps  - wipes out enemy shots it touches
//   fromPet - fired by a pet (for daily tasks)
// Enemy shots stand still while time is stopped.
class Projectile extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y, opts) {
    super(scene, x, y, opts.texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    opts.group.add(this);

    this.damage = opts.damage;
    this.knockback = opts.knockback || 40;
    this.dir = opts.dir;
    this.trail = opts.trail === true ? 'fire' : (opts.trail || null);
    this.spin = opts.spin || 0;
    this.rotateToVelocity = !!opts.rotate;
    this.pierce = !!opts.pierce;
    this.hitsLow = !!opts.hitsLow;
    this.homing = opts.homing || null;
    this.freeze = opts.freeze || 0;
    this.ghost = !!opts.ghost;
    this.collects = !!opts.collects;
    this.sweeps = !!opts.sweeps;
    this.fromPet = !!opts.fromPet;
    this.hostile = opts.group === scene.enemyProjectiles;
    this.stopped = null;
    this.hits = new Set();
    this.dieAt = scene.time.now + opts.lifetime;

    this.setDepth(8);
    if (!this.rotateToVelocity) this.setFlipX(opts.dir < 0);
    this.body.setAllowGravity(false);
    this.body.setSize(Math.max(4, this.width - 2), Math.max(3, this.height - 2));
    this.body.setVelocity(opts.vx !== undefined ? opts.vx : opts.speed * opts.dir, opts.vy || 0);
    if (opts.gravity) this.body.setAccelerationY(opts.gravity);
    if (this.rotateToVelocity) this.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x);

    if (this.trail === 'fire') {
      scene.tweens.add({ targets: this, scale: { from: 0.8, to: 1.15 }, duration: 80, yoyo: true, repeat: -1 });
    }
  }

  update(time, delta) {
    if (!this.active) return;
    if (this.hostile && this.holdStill(time, delta)) return;
    if (time > this.dieAt) {
      this.destroy();
      return;
    }
    if (this.homing) this.steer(delta);
    if (this.spin) this.angle += this.spin * delta / 1000;
    if (this.rotateToVelocity) this.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x);
    if (this.trail) this.scene.fx(this.trail, this.x - this.dir * 3, this.y, 1);
  }

  // Time stop: freeze in mid-air, then carry on afterwards. Returns true while stopped.
  holdStill(time, delta) {
    const b = this.body;
    if (this.scene.timeStopped(time)) {
      if (!this.stopped) {
        this.stopped = { vx: b.velocity.x, vy: b.velocity.y, ay: b.acceleration.y };
        b.setVelocity(0, 0);
        b.setAcceleration(0, 0);
        this.setTint(0xc0b0ff);
      }
      this.dieAt += delta;
      return true;
    }
    if (this.stopped) {
      b.setVelocity(this.stopped.vx, this.stopped.vy);
      b.setAccelerationY(this.stopped.ay);
      this.stopped = null;
      this.clearTint();
    }
    return false;
  }

  // Turn toward the target, keeping the same speed.
  steer(delta) {
    let target = this.homing;
    if (target === true || !target.active || target.dying) {
      target = this.scene.nearestEnemy(this.x, this.y, 260);
      if (!target) return;
      if (this.homing !== true) this.homing = target;
    }
    const v = this.body.velocity;
    const speed = v.length() || 150;
    const want = Math.atan2(target.body.center.y - this.y, target.x - this.x);
    const cur = Math.atan2(v.y, v.x);
    const turn = Phaser.Math.Angle.Wrap(want - cur);
    const max = 5 * delta / 1000;
    const a = cur + Phaser.Math.Clamp(turn, -max, max);
    this.body.setVelocity(Math.cos(a) * speed, Math.sin(a) * speed);
    this.dir = Math.cos(a) < 0 ? -1 : 1;
    if (!this.rotateToVelocity) this.setFlipX(this.dir < 0);
  }

  // Hit a wall or a target.
  impact() {
    if (!this.active) return;
    this.scene.fx(this.trail || 'spark', this.x, this.y, this.trail ? 8 : 4);
    Sfx.play('impact');
    this.destroy();
  }
}

// Thrown by the Bombs weapon. Bounces along, then explodes when the fuse runs
// out or as soon as it touches an enemy.
class Bomb extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y, dir, weapon, damage) {
    super(scene, x, y, 'bomb');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    scene.bombs.add(this);

    this.weapon = weapon;
    this.damage = damage;
    this.explodeAt = scene.time.now + weapon.fuse;
    this.setDepth(8);
    this.body.setSize(7, 7).setOffset(1, 2);
    this.body.setBounce(0.45);
    this.body.setVelocity(dir * weapon.speed, weapon.lift);
  }

  update(time, delta) {
    if (!this.active) return;
    const left = this.explodeAt - time;
    if (left <= 0) {
      this.explode();
      return;
    }
    // Blink faster as the fuse burns down.
    if (Math.floor(time / (left < 400 ? 50 : 130)) % 2) this.setTintFill(0xffffff);
    else this.clearTint();
    this.angle += this.body.velocity.x * delta / 400;
    if (this.body.blocked.down) this.body.velocity.x *= 0.92;
  }

  explode() {
    if (!this.active) return;
    const w = this.weapon;
    this.scene.explode(this.x, this.y, w.radius, this.damage, w.knockback);
    this.destroy();
  }
}

// The Boom-arang: flies out, slows down, turns around and flies back to you.
// Cuts through every mob (once each way), ignores walls, and grabs coins.
class Boomerang extends Projectile {
  constructor(scene, x, y, vx, vy, weapon, damage) {
    super(scene, x, y, {
      group: scene.playerProjectiles, texture: weapon.projectile, dir: vx < 0 ? -1 : 1,
      vx, vy, spin: 1100, pierce: true, ghost: true, collects: true,
      damage, knockback: weapon.knockback, lifetime: weapon.lifetime,
    });
    this.startX = x;
    this.startY = y;
    this.range = weapon.range;
    this.speed = Math.hypot(vx, vy);
    this.returning = false;
    this.nextWhoosh = 0;
  }

  update(time, delta) {
    if (!this.active) return;
    const player = this.scene.player;
    if (time > this.dieAt || player.dead) {
      this.destroy();
      return;
    }
    this.angle += this.spin * delta / 1000;
    if (time > this.nextWhoosh) {
      this.nextWhoosh = time + 260;
      Sfx.play('boomerang');
    }
    if (!this.returning && Phaser.Math.Distance.Between(this.x, this.y, this.startX, this.startY) >= this.range) {
      this.returning = true;
      this.hits.clear();      // it can hit everything again on the way back
    }
    if (this.returning) {
      const tx = player.x, ty = player.body.center.y;
      const d = Phaser.Math.Distance.Between(this.x, this.y, tx, ty);
      if (d < 10) {
        Sfx.play('catch');
        this.scene.trackDaily('catch');
        this.destroy();
        return;
      }
      const speed = Math.min(this.speed * 1.1, this.body.velocity.length() + 900 * delta / 1000);
      this.body.setVelocity((tx - this.x) / d * speed, (ty - this.y) / d * speed);
    }
  }

  // Walls don't stop it, and hitting a mob doesn't either.
  impact() {}
}

// The air wand's tornado. Rolls forward, sucks up mobs (not bosses) and enemy
// shots, spins them around, and at the end throws the mobs high and far.
class Tornado extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, dir, weapon, damage) {
    super(scene, x, y, 'tornado1');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(9).play('tornado_spin');
    this.body.setAllowGravity(false);
    this.body.setSize(14, 20);
    this.body.setVelocityX(dir * weapon.speed);
    this.dir = dir;
    this.damage = damage;
    this.endAt = scene.time.now + weapon.lifetime;
    this.carried = [];        // enemies swirling inside
    this.shots = [];          // enemy shots swirling inside
    this.nextBossHit = 0;
    this.spinAngle = 0;
    this.done = false;
    scene.tornadoes.push(this);
  }

  update(time, delta) {
    if (this.done) return;
    const scene = this.scene;
    this.spinAngle += delta * 0.012;
    this.y = scene.groundTop(this.x) < scene.worldH ? Math.min(this.y, scene.groundTop(this.x) - 11) : this.y;
    if (Math.random() < 0.3) scene.fx('smoke', this.x + Phaser.Math.Between(-6, 6), this.y + 10, 1);
    const rect = this.getBounds();

    scene.enemies.getChildren().forEach(e => {
      if (!e.active || e.dying || e.caught) return;
      if (!Phaser.Geom.Intersects.RectangleToRectangle(rect, e.getBounds())) return;
      if (e.isBoss) {
        if (time > this.nextBossHit && e.awake) {
          this.nextBossHit = time + 350;
          e.hurt(1, this.dir, 0);
        }
        return;
      }
      e.caught = this;
      e.body.setAllowGravity(false);
      e.body.setVelocity(0, 0);
      this.carried.push(e);
    });
    scene.enemyProjectiles.getChildren().forEach(p => {
      if (!p.active || p.caughtBy) return;
      if (!Phaser.Geom.Intersects.RectangleToRectangle(rect, p.getBounds())) return;
      p.caughtBy = this;
      p.body.setVelocity(0, 0);
      p.body.setAcceleration(0, 0);
      p.dieAt = Infinity;
      p.hostile = false;
      p.damage = 0;
      this.shots.push(p);
    });

    // Spin everything around inside the funnel.
    const swirl = (obj, i, n) => {
      const a = this.spinAngle + (i / Math.max(1, n)) * Math.PI * 2;
      obj.x = this.x + Math.cos(a) * (6 + (i % 3) * 2);
      obj.y = this.y - 4 - ((i * 6 + time * 0.03) % 14);
    };
    this.carried = this.carried.filter(e => e.active && !e.dying);
    this.carried.forEach((e, i) => { swirl(e, i, this.carried.length); e.angle += delta * 0.6; });
    this.shots = this.shots.filter(p => p.active);
    this.shots.forEach((p, i) => swirl(p, i + 1, this.shots.length + 1));

    const view = scene.cameras.main.worldView;
    if (time > this.endAt || this.x < view.left - 20 || this.x > view.right + 20) this.release();
  }

  // Throw everything out: mobs fly up and away, shots fizzle.
  release() {
    if (this.done) return;
    this.done = true;
    const scene = this.scene;
    const time = scene.time.now;
    this.carried.forEach(e => {
      if (!e.active || e.dying) return;
      e.caught = null;
      e.angle = 0;
      if (e.collidesWithTiles) e.body.setAllowGravity(true);
      e.hurt(this.damage, this.dir, 0);
      if (!e.active || e.dying) return;
      e.body.setVelocity(this.dir * Phaser.Math.Between(240, 320), -Phaser.Math.Between(300, 380));
      e.stunUntil = time + 1500;
      scene.trackDaily('fling');
    });
    this.shots.forEach(p => { if (p.active) p.impact(); });
    scene.fx('smoke', this.x, this.y, 14);
    scene.tornadoes = scene.tornadoes.filter(t => t !== this);
    this.scene.tweens.add({ targets: this, alpha: 0, scaleY: 0.2, duration: 200, onComplete: () => this.destroy() });
  }
}
