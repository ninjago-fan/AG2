// Mobs of the later levels.

// Turn around at walls and platform edges. Returns the (possibly new) direction.
function patrolDir(enemy, dir) {
  const b = enemy.body;
  if (b.blocked.left) dir = 1;
  else if (b.blocked.right) dir = -1;
  if (b.blocked.down) {
    const aheadX = dir > 0 ? b.right + 2 : b.left - 2;
    if (!enemy.scene.layer.getTileAtWorldXY(aheadX, b.bottom + 4)) dir *= -1;
  }
  return dir;
}

// Big and slow. Walks its platform and smashes its club when you get close,
// sending small shockwaves along the ground.
class Ogre extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'ogre', 'ogre1');
    this.body.setSize(12, 16).setOffset(2, 2);
    this.dir = -1;
    this.nextSmash = scene.time.now + 1000;
    this.smashing = false;
  }

  knock(dir, force) {
    super.knock(dir, force * this.def.knockResist);
  }

  tick(time) {
    if (time < this.stunUntil || this.smashing) return;
    const b = this.body;
    const d = this.def;
    const player = this.scene.player;
    const dx = player.x - this.x;
    if (player.canBeTargeted() && Math.abs(dx) < d.smashRange && Math.abs(player.y - this.y) < 30 && time > this.nextSmash) {
      this.smash(time, dx < 0 ? -1 : 1);
      return;
    }
    if (player.canBeTargeted() && Math.abs(dx) < 150 && Math.abs(player.y - this.y) < 40) this.dir = dx < 0 ? -1 : 1;
    this.dir = patrolDir(this, this.dir);
    b.setVelocityX(this.dir * d.speed * this.diff.enemySpeed);
    this.setFlipX(this.dir < 0);
  }

  smash(time, dir) {
    this.smashing = true;
    this.nextSmash = time + this.def.smashEvery * this.diff.fireRate;
    this.body.setVelocityX(0);
    this.setFlipX(dir < 0);
    this.setTexture('ogre2');
    this.scene.time.delayedCall(420, () => {
      if (!this.active || this.dying) return;
      this.setTexture('ogre1');
      this.smashing = false;
      if (this.isHeld()) return;
      Sfx.play('slam');
      this.scene.cameras.main.shake(120, 0.006);
      this.scene.fx('rock', this.x + dir * 10, this.body.bottom, 8);
      [-1, 1].forEach(d => new Projectile(this.scene, this.x + d * 12, this.body.bottom - 5, {
        group: this.scene.enemyProjectiles, texture: 'tremor', dir: d, speed: 150,
        damage: 1, hitsLow: true, lifetime: 700,
      }));
    });
  }
}

// Patrols in a suit and sunglasses and fires laser shots when you're in range.
class FedGuard extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'fedGuard', 'guard1');
    this.body.setSize(8, 14).setOffset(2, 1);
    this.dir = -1;
    this.nextShot = scene.time.now + 900 + Math.random() * 600;
    this.windingUp = false;
  }

  tick(time) {
    if (time < this.stunUntil) return;
    const b = this.body;
    const d = this.def;
    const player = this.scene.player;
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const inRange = player.canBeTargeted() && Math.abs(dx) < d.range && Math.abs(dy) < 40;
    if (this.windingUp) {
      b.setVelocityX(0);
      return;
    }
    if (inRange) {
      b.setVelocityX(0);
      this.setFlipX(dx < 0);
      if (time > this.nextShot) this.shoot(dx < 0 ? -1 : 1);
      return;
    }
    this.dir = patrolDir(this, this.dir);
    b.setVelocityX(this.dir * d.speed * this.diff.enemySpeed);
    this.setFlipX(this.dir < 0);
  }

  shoot(dir) {
    const d = this.def;
    this.windingUp = true;
    this.setTexture('guard_shoot');
    this.scene.time.delayedCall(d.windup, () => {
      if (!this.active || this.dying) return;
      this.windingUp = false;
      this.setTexture('guard1');
      this.nextShot = this.scene.time.now + d.fireRate * this.diff.fireRate;
      if (this.isHeld()) return;
      new Projectile(this.scene, this.x + dir * 8, this.y - 1, {
        group: this.scene.enemyProjectiles, texture: 'laser', dir,
        speed: d.laserSpeed * this.diff.enemySpeed, damage: d.damage, lifetime: 2000,
      });
      Sfx.play('laser');
    });
  }
}

// Hops around and fires slow plasma balls straight at you.
class Alien extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'alien', 'alien1');
    this.body.setSize(10, 13).setOffset(1, 1);
    this.dir = -1;
    this.nextHop = scene.time.now + 600 + Math.random() * 900;
    this.nextShot = scene.time.now + 1200 + Math.random() * 900;
  }

  tick(time) {
    if (time < this.stunUntil) return;
    const b = this.body;
    const d = this.def;
    const player = this.scene.player;
    const dx = player.x - this.x;
    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    this.setFlipX(dx < 0);
    if (player.canBeTargeted() && dist < d.range && time > this.nextShot) {
      const a = Math.atan2(player.body.center.y - this.y, dx);
      const speed = d.plasmaSpeed * this.diff.enemySpeed;
      new Projectile(this.scene, this.x, this.y - 2, {
        group: this.scene.enemyProjectiles, texture: 'plasma', dir: dx < 0 ? -1 : 1,
        vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, damage: d.damage, lifetime: 2600,
      });
      Sfx.play('plasma');
      this.nextShot = time + d.fireRate * this.diff.fireRate;
    }
    if (!b.blocked.down) return;
    b.setVelocityX(0);
    this.setTexture('alien1');
    if (time < this.nextHop) return;
    if (Math.abs(dx) < 200) this.dir = dx < 0 ? -1 : 1;
    const airTime = -2 * d.hopVelocity / 1000;
    const landX = this.x + this.dir * d.hopSpeed * airTime;
    if (!this.scene.layer.getTileAtWorldXY(landX, b.bottom + 4)) this.dir *= -1;
    b.setVelocity(this.dir * d.hopSpeed * this.diff.enemySpeed, d.hopVelocity);
    this.setTexture('alien2');
    this.nextHop = time + d.hopEvery;
  }
}

// Carries a shield: hits from the front only do half damage. Charges at you
// with its spear when you get close.
class AlienGuard extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'alienGuard', 'aguard1');
    this.body.setSize(10, 16).setOffset(3, 1);
    this.dir = -1;
    this.chargeUntil = 0;
    this.nextCharge = scene.time.now + 1500;
  }

  get facing() { return this.flipX ? -1 : 1; }

  hurt(damage, dir, knockback) {
    // A hit travelling toward the guard's face lands on the shield.
    if (dir === -this.facing && !this.isHeld()) {
      damage = Math.max(1, Math.floor(damage / 2));
      knockback *= 0.3;
      this.scene.fx('spark', this.x + this.facing * 6, this.y, 4);
    }
    super.hurt(damage, dir, knockback);
  }

  tick(time) {
    if (time < this.stunUntil) return;
    const b = this.body;
    const d = this.def;
    const player = this.scene.player;
    const dx = player.x - this.x;
    const sameLevel = Math.abs(player.y - this.y) < 30;
    if (time < this.chargeUntil) {
      this.dir = patrolDir(this, this.dir);
      b.setVelocityX(this.dir * d.chargeSpeed * this.diff.enemySpeed);
      this.setFlipX(this.dir < 0);
      return;
    }
    this.setTexture('aguard1');
    if (player.canBeTargeted() && sameLevel && Math.abs(dx) < d.chargeRange) {
      this.dir = dx < 0 ? -1 : 1;
      if (time > this.nextCharge) {
        this.chargeUntil = time + 600;
        this.nextCharge = time + 2200 * this.diff.fireRate;
        this.setTexture('aguard2');
        Sfx.play('dash');
      }
    }
    this.dir = patrolDir(this, this.dir);
    b.setVelocityX(this.dir * d.speed * this.diff.enemySpeed);
    this.setFlipX(this.dir < 0);
  }
}

// Rolls along, stops, charges up and fires a fast laser beam.
class Robot extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'robot', 'robot1');
    this.body.setSize(12, 13).setOffset(1, 1);
    this.dir = -1;
    this.nextShot = scene.time.now + 1200 + Math.random() * 800;
    this.charging = false;
    this.play('robot_roll');
  }

  knock(dir, force) {
    super.knock(dir, force * this.def.knockResist);
  }

  tick(time) {
    if (time < this.stunUntil || this.charging) return;
    const b = this.body;
    const d = this.def;
    const player = this.scene.player;
    const dx = player.x - this.x;
    if (player.canBeTargeted() && Math.abs(dx) < d.range && Math.abs(player.y - this.y) < 40 && time > this.nextShot) {
      this.charge(dx < 0 ? -1 : 1);
      return;
    }
    this.dir = patrolDir(this, this.dir);
    b.setVelocityX(this.dir * d.speed * this.diff.enemySpeed);
    this.setFlipX(this.dir < 0);
    if (!this.anims.isPlaying) this.play('robot_roll');
  }

  charge(dir) {
    const d = this.def;
    this.charging = true;
    this.body.setVelocityX(0);
    this.setFlipX(dir < 0);
    this.anims.stop();
    this.setTexture('robot_shoot');
    this.scene.tweens.add({ targets: this, alpha: 0.6, duration: 80, yoyo: true, repeat: 2 });
    this.scene.time.delayedCall(d.windup, () => {
      if (!this.active || this.dying) return;
      this.charging = false;
      this.setTexture('robot1');
      this.nextShot = this.scene.time.now + d.fireRate * this.diff.fireRate;
      if (this.isHeld()) return;
      new Projectile(this.scene, this.x + dir * 14, this.y - 3, {
        group: this.scene.enemyProjectiles, texture: 'laser_beam', dir,
        speed: d.laserSpeed * this.diff.enemySpeed, damage: d.damage, lifetime: 1600,
      });
      Sfx.play('laser');
    });
  }
}

// A broken piece of time. Flickers, then blinks right next to you.
class Glitch extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'glitch', 'glitch1');
    this.body.setSize(10, 12).setOffset(1, 1);
    this.dir = -1;
    this.nextBlink = scene.time.now + 1500 + Math.random() * 1500;
    this.blinking = false;
    this.play({ key: 'glitch_flicker', startFrame: Phaser.Math.Between(0, 3) });
  }

  tick(time) {
    if (time < this.stunUntil || this.blinking) return;
    const b = this.body;
    const d = this.def;
    const player = this.scene.player;
    const dx = player.x - this.x;
    const near = player.canBeTargeted() && Math.abs(dx) < 220 && Math.abs(player.y - this.y) < 120;
    if (near && time > this.nextBlink) {
      this.blink();
      return;
    }
    if (near && Math.abs(player.y - this.y) < 30) this.dir = dx < 0 ? -1 : 1;
    this.dir = patrolDir(this, this.dir);
    b.setVelocityX(this.dir * d.speed * this.diff.enemySpeed * (near ? 1 : 0.4));
    this.setFlipX(this.dir < 0);
  }

  // Vanish, then reappear on solid ground near the player (on screen).
  blink() {
    const scene = this.scene;
    const player = scene.player;
    const view = scene.cameras.main.worldView;
    this.nextBlink = scene.time.now + this.def.blinkEvery * this.diff.fireRate;
    const spots = [];
    [-1, 1].forEach(side => [56, 72, 88].forEach(off => {
      const x = player.x + side * off;
      const top = scene.groundTop(x);
      if (x > view.left + 12 && x < view.right - 12 && top < scene.worldH && Math.abs(top - player.body.bottom) < 48) spots.push([x, top]);
    }));
    if (!spots.length) return;
    const [x, top] = Phaser.Utils.Array.GetRandom(spots);
    this.blinking = true;
    this.body.setVelocity(0, 0);
    Sfx.play('glitch');
    scene.fx('glitch', this.x, this.y, 10);
    scene.tweens.add({
      targets: this, alpha: 0, duration: 150,
      onComplete: () => {
        if (!this.active || this.dying) return;
        this.x = x;
        this.placeOnGround(top);
        this.body.reset(this.x, this.y);
        scene.fx('glitch', this.x, this.y, 10);
        scene.tweens.add({
          targets: this, alpha: 1, duration: 250,
          onComplete: () => { this.blinking = false; },
        });
      },
    });
  }
}

Object.assign(ENEMY_CLASSES, { ogre: Ogre, fedGuard: FedGuard, alien: Alien, alienGuard: AlienGuard, robot: Robot, glitch: Glitch });
