// Friends that travel with you: the pegasus mount and pets. None of them can
// be hurt, and enemies never aim at them. They don't use physics; they just
// follow the player around.

// The pegasus. Modes:
//   follow - flies near you, waiting (it can't be hurt)
//   ridden - you're on its back (hits take its hearts first)
//   resting- lost all its hearts; flies off and comes back later
class Pegasus extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'pegasus1');
    scene.add.existing(this);
    this.setDepth(9).play('pegasus_fly');
    this.hearts = PEGASUS.hearts;
    this.mode = 'follow';
    this.returnAt = 0;
    this.t = Math.random() * 10;
  }

  update(time, delta) {
    const pl = this.scene.player;
    this.t += delta / 1000;
    if (this.mode === 'ridden') {
      const b = pl.body;
      this.setPosition(b.center.x - pl.facing * 3, b.bottom - 8).setFlipX(pl.facing < 0).setAlpha(pl.alpha);
      if (b.blocked.down) {
        if (this.anims.isPlaying && Math.abs(b.velocity.x) < 5) this.anims.stop();
        if (!this.anims.isPlaying && Math.abs(b.velocity.x) >= 5) this.play('pegasus_fly');
        if (!this.anims.isPlaying) this.setTexture('pegasus2');
      } else if (!this.anims.isPlaying) {
        this.play('pegasus_fly');
      }
      return;
    }
    if (!this.anims.isPlaying) this.play('pegasus_fly');
    this.setAlpha(1);
    if (this.mode === 'resting') {
      if (time > this.returnAt) {
        this.mode = 'follow';
        this.hearts = PEGASUS.hearts;
        const cam = this.scene.cameras.main;
        this.setPosition(cam.scrollX + 20, cam.scrollY - 20);
        Sfx.play('neigh');
      } else {
        this.y -= delta * 0.12;
        return;
      }
    }
    // Hover behind and above the player.
    const tx = pl.x - pl.facing * 26;
    const ty = pl.y - 34 + Math.sin(this.t * 3) * 4;
    this.x += (tx - this.x) * Math.min(1, delta * 0.004);
    this.y += (ty - this.y) * Math.min(1, delta * 0.004);
    this.setFlipX(pl.x < this.x);
  }

  rest(time) {
    this.mode = 'resting';
    this.returnAt = time + PEGASUS.restTime;
  }
}

// Pets. Each kind has its own trick:
//   coconut - walks behind you and lobs coconuts
//   phoenix - flies above you and shoots little fireballs
//   rhino   - runs behind you and charges at mobs that come close
class Pet extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, kind) {
    super(scene, x, y, PETS[kind].texture);
    scene.add.existing(this);
    this.kind = kind;
    this.def = PETS[kind];
    this.setDepth(9);
    this.nextAct = scene.time.now + 1000;
    this.charge = null;
    this.t = 0;
    if (kind === 'phoenix') this.play('phoenix_fly');
  }

  get player() { return this.scene.player; }

  update(time, delta) {
    const scene = this.scene;
    const pl = this.player;
    this.t += delta / 1000;
    if (this.kind === 'phoenix') {
      const tx = pl.x - pl.facing * 10;
      const ty = pl.y - 30 + Math.sin(this.t * 4) * 3;
      this.follow(tx, ty, delta, 0.006);
      this.setFlipX(pl.facing < 0);
    } else if (this.charge) {
      this.updateCharge(time, delta);
      return;
    } else {
      const tx = pl.x - pl.facing * (this.kind === 'rhino' ? 26 : 18);
      this.follow(tx, this.groundY(tx), delta, 0.005);
      this.setFlipX(pl.x < this.x);
      if (this.kind === 'rhino') {
        const moving = Math.abs(tx - this.x) > 3;
        if (moving && !this.anims.isPlaying) this.play('rhino_run');
        else if (!moving && this.anims.isPlaying) this.anims.stop();
      } else if (time > this.nextAct - 1200) {
        this.setTexture('pet_monkey1');
      }
    }
    // Too far behind (fell, or the player ran ahead): pop back next to them.
    if (Phaser.Math.Distance.Between(this.x, this.y, pl.x, pl.y) > 220) {
      this.setPosition(pl.x - pl.facing * 16, pl.y - 10);
      scene.fx('smoke', this.x, this.y, 6);
    }
    if (time > this.nextAct && !pl.dead && !scene.completing) this.act(time);
  }

  follow(tx, ty, delta, rate) {
    this.x += (tx - this.x) * Math.min(1, delta * rate);
    this.y += (ty - this.y) * Math.min(1, delta * rate * 1.5);
  }

  // Where a walking pet's feet go: on the ground under x, or level with the
  // player if there's a pit there.
  groundY(x) {
    const top = this.scene.groundTop(x);
    const pl = this.player;
    const floor = top < this.scene.worldH && top >= pl.body.bottom - 40 ? top : pl.body.bottom;
    return floor - this.height / 2;
  }

  act(time) {
    const d = this.def;
    const target = this.scene.nearestEnemy(this.x, this.y, d.range);
    if (!target) return;
    this.nextAct = time + d.every;
    const scene = this.scene;
    if (this.kind === 'coconut') {
      // Lob a coconut that lands on the target.
      const t = 0.7, g = 600;
      const tx = target.x, ty = target.body.center.y;
      const vx = (tx - this.x) / t;
      const vy = ((ty - this.y) - 0.5 * g * t * t) / t;
      new Projectile(scene, this.x, this.y - 4, {
        group: scene.playerProjectiles, texture: 'coconut', dir: vx < 0 ? -1 : 1,
        vx, vy, gravity: g, spin: 500, damage: d.damage, knockback: 90, lifetime: 1600, fromPet: true,
      });
      this.setTexture('pet_monkey2').setFlipX(tx < this.x);
      Sfx.play('throw');
    } else if (this.kind === 'phoenix') {
      const a = Math.atan2(target.body.center.y - this.y, target.x - this.x);
      new Projectile(scene, this.x, this.y, {
        group: scene.playerProjectiles, texture: 'fireball_small', dir: Math.cos(a) < 0 ? -1 : 1,
        vx: Math.cos(a) * 220, vy: Math.sin(a) * 220, damage: d.damage, knockback: 50,
        lifetime: 1200, trail: 'fire', homing: target, fromPet: true,
      });
      Sfx.play('fire');
    } else if (Math.abs(target.y - this.y) < 30 && !target.isBoss) {
      // Rhino charge along the ground.
      this.charge = { target, dir: target.x < this.x ? -1 : 1, until: time + 700, hit: false };
      this.setFlipX(this.charge.dir < 0);
      this.play('rhino_run');
      Sfx.play('dash');
    } else if (target.isBoss && Math.abs(target.x - this.x) < 60) {
      this.charge = { target, dir: target.x < this.x ? -1 : 1, until: time + 500, hit: false };
      this.play('rhino_run');
    }
  }

  updateCharge(time, delta) {
    const c = this.charge;
    this.x += c.dir * 260 * delta / 1000;
    const ground = this.groundY(this.x);
    if (Math.abs(ground - this.y) < 30) this.y = ground;
    if (Math.random() < 0.5) this.scene.fx('smoke', this.x - c.dir * 6, this.y + 4, 1);
    const box = this.getBounds();
    if (!c.hit) {
      this.scene.enemies.getChildren().forEach(e => {
        if (c.hit || !e.active || e.dying || (e.isBoss && !e.awake)) return;
        if (!Phaser.Geom.Intersects.RectangleToRectangle(box, e.getBounds())) return;
        c.hit = true;
        e.hurt(this.def.damage, c.dir, 260);
        this.scene.trackDaily('petHit');
        this.scene.cameras.main.shake(80, 0.005);
      });
    }
    if (time > c.until || c.hit) {
      this.charge = null;
      this.anims.stop();
      this.setTexture('pet_rhino1');
    }
  }
}
