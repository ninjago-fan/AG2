// GameScene, continued: the magic wands, the newer rune powers, magic items
// and the pegasus. Kept in its own file so GameScene.js stays readable.

Object.assign(GameScene.prototype, {
  // Time rune / time freeze apple: every enemy and enemy shot stands still.
  timeStopped(time = this.time.now) {
    return time < this.timeStopUntil;
  },

  stopTime(ms) {
    this.timeStopUntil = Math.max(this.timeStopUntil, this.time.now + ms);
    Sfx.play('timeStop');
    this.cameras.main.flash(250, 200, 180, 255);
    this.enemies.getChildren().forEach(e => e.restoreTint && e.restoreTint());
    this.time.delayedCall(ms + 20, () => this.enemies.getChildren().forEach(e => e.active && e.restoreTint()));
  },

  // ------------------------------------------------------------ wands

  // Earth wand: every mob standing on your platform loses half its health.
  // Bosses only lose a slice of their health.
  quake(weapon) {
    const pl = this.player;
    const b = pl.body;
    // The platform: the solid row under your feet (or the first one below you).
    let tx = Math.floor(b.center.x / TILE);
    let row = -1;
    for (let y = Math.floor((b.bottom - 2) / TILE) + 1; y < LEVEL_ROWS; y++) {
      if (this.layer.getTileAt(tx, y)) { row = y; break; }
    }
    if (row < 0) {
      Sfx.play('error');
      this.message(pl.x, pl.y - 14, 'NO GROUND TO SHAKE', 0xff8080);
      return;
    }
    // Spread left and right along that row while it stays solid with open air above.
    let left = tx, right = tx;
    while (this.layer.getTileAt(left - 1, row) && !this.layer.getTileAt(left - 1, row - 1)) left--;
    while (this.layer.getTileAt(right + 1, row) && !this.layer.getTileAt(right + 1, row - 1)) right++;
    const surface = row * TILE;
    const x0 = left * TILE, x1 = (right + 1) * TILE;

    this.cameras.main.shake(350, 0.014);
    for (let x = x0 + 8; x < x1; x += 16) {
      this.time.delayedCall(Math.abs(x - pl.x) * 0.8, () => this.fx('rock', x, surface, 4));
    }
    this.enemies.getChildren().slice().forEach(e => {
      if (!e.active || e.dying || e.caught || (e.isBoss && !e.awake)) return;
      if (e.x < x0 || e.x > x1) return;
      if (Math.abs(e.body.bottom - surface) > 40) return;
      const dmg = e.isBoss ? Math.max(3, Math.round(e.maxHp * 0.08)) : Math.max(1, Math.floor(e.hp / 2));
      this.time.delayedCall(Math.abs(e.x - pl.x) * 0.8, () => {
        if (!e.active || e.dying) return;
        e.hurt(dmg, e.x < pl.x ? -1 : 1, 60);
        if (e.active && !e.dying && !e.isBoss) e.body.setVelocityY(-180);
      });
    });
  },

  // Lightning wand: a bolt that jumps from mob to mob, visiting every mob that
  // was on screen when you cast it. It ignores walls and grabs any coins and
  // gems along its path.
  castLightning(weapon, damage) {
    const pl = this.player;
    const view = this.cameras.main.worldView;
    const remaining = this.enemies.getChildren().filter(e => e.active && !e.dying && !e.caught
      && !(e.isBoss && (!e.awake || e.untouchable)) && view.contains(e.x, e.y));
    const path = [];
    let cur = { x: pl.x + pl.facing * 6, y: pl.body.top + 6 };
    while (remaining.length) {
      remaining.sort((a, b) => Phaser.Math.Distance.Between(cur.x, cur.y, a.x, a.y) - Phaser.Math.Distance.Between(cur.x, cur.y, b.x, b.y));
      const e = remaining.shift();
      path.push(e);
      cur = e;
    }
    // Nobody around: the bolt shoots straight ahead to the edge of the screen.
    if (!path.length) path.push({ x: pl.facing > 0 ? view.right : view.left, y: pl.body.top + 6, empty: true });

    const g = this.add.graphics().setDepth(18);
    let from = { x: pl.x + pl.facing * 6, y: pl.body.top + 6 };
    path.forEach((stop, i) => {
      this.time.delayedCall(i * 70, () => {
        const to = { x: stop.x, y: stop.empty ? stop.y : stop.y };
        this.drawBolt(g, from, to);
        this.grabAlong(from, to);
        if (!stop.empty && stop.active && !stop.dying) {
          stop.hurt(damage, to.x < from.x ? -1 : 1, 60);
          this.fx('zap', to.x, to.y, 8);
        }
        from = to;
      });
    });
    this.cameras.main.flash(80, 255, 255, 200);
    this.tweens.add({ targets: g, alpha: 0, delay: path.length * 70 + 120, duration: 200, onComplete: () => g.destroy() });
  },

  drawBolt(g, a, b) {
    const steps = Math.max(2, Math.round(Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y) / 10));
    const pts = [a];
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      pts.push({ x: a.x + (b.x - a.x) * t + Phaser.Math.Between(-4, 4), y: a.y + (b.y - a.y) * t + Phaser.Math.Between(-4, 4) });
    }
    pts.push(b);
    [[3, 0xffcd3a, 0.6], [1, 0xffffff, 1]].forEach(([w, color, alpha]) => {
      g.lineStyle(w, color, alpha);
      g.beginPath();
      g.moveTo(pts[0].x, pts[0].y);
      pts.slice(1).forEach(p => g.lineTo(p.x, p.y));
      g.strokePath();
    });
  },

  // Collect every coin and gem near the line from a to b.
  grabAlong(a, b) {
    const line = new Phaser.Geom.Line(a.x, a.y, b.x, b.y);
    this.pickups.getChildren().slice().forEach(item => {
      if (!item.active || (item.kind !== 'coin' && item.kind !== 'gem')) return;
      const p = Phaser.Geom.Line.GetNearestPoint(line, new Phaser.Geom.Point(item.x, item.y));
      const onSegment = Math.min(a.x, b.x) - 8 <= p.x && p.x <= Math.max(a.x, b.x) + 8
        && Math.min(a.y, b.y) - 8 <= p.y && p.y <= Math.max(a.y, b.y) + 8;
      if (onSegment && Phaser.Math.Distance.Between(p.x, p.y, item.x, item.y) < 12) this.collect(item);
    });
  },

  // Void wand: while it's your weapon a void circle surrounds you. Any mob
  // that touches it loses 3/4 of its health (bosses: a small slice), at most
  // once a second. Attacking makes the circle pulse bigger for a moment.
  updateVoid(time) {
    const on = this.state.weapon === 'voidWand' && !this.dead && !this.completing;
    this.voidRing.setVisible(on);
    if (!on) return;
    const w = WEAPONS.voidWand;
    const pulse = time < this.voidPulseUntil;
    const r = pulse ? w.pulseRadius : w.radius + Math.sin(time / 150) * 1.5;
    const pl = this.player;
    this.voidRing.setPosition(pl.x, pl.body.center.y).setRadius(r);
    this.voidRing.setStrokeStyle(pulse ? 2 : 1, 0xb44cff, 0.9);
    if (Math.random() < 0.3) {
      const a = Math.random() * Math.PI * 2;
      this.fx('shadow', pl.x + Math.cos(a) * r, pl.body.center.y + Math.sin(a) * r, 1);
    }
    const circle = new Phaser.Geom.Circle(pl.x, pl.body.center.y, r);
    this.enemies.getChildren().slice().forEach(e => {
      if (!e.active || e.dying || e.caught || (e.isBoss && (!e.awake || e.untouchable))) return;
      if (e.voidHitAt && time < e.voidHitAt) return;
      const eb = e.body;
      if (!Phaser.Geom.Intersects.CircleToRectangle(circle, new Phaser.Geom.Rectangle(eb.x, eb.y, eb.width, eb.height))) return;
      e.voidHitAt = time + 1000;
      const dmg = e.isBoss ? Math.max(2, Math.round(e.maxHp * 0.05)) : Math.max(1, Math.ceil(e.hp * 0.75));
      Sfx.play('voidHit');
      this.fx('shadow', e.x, e.y, 10);
      e.hurt(dmg, e.x < pl.x ? -1 : 1, 120);
    });
  },

  pulseVoid(weapon) {
    this.voidPulseUntil = this.time.now + 400;
    this.fx('shadow', this.player.x, this.player.body.center.y, 16);
  },

  // ------------------------------------------------------------ newer runes

  castRune(rune, def, time) {
    const pl = this.player;
    const power = GameState.bonuses(this.state).power;
    if (rune === 'water') {
      // A wave rolls forward along the ground.
      Sfx.play('wave');
      const y = pl.body.bottom - 9;
      const wave = new Projectile(this, pl.x + pl.facing * 12, y, {
        group: this.playerProjectiles, texture: 'wave', dir: pl.facing, speed: 230,
        pierce: true, ghost: true, sweeps: true, trail: 'water',
        damage: def.damage + power, knockback: 320, lifetime: 1300,
      });
      wave.body.setSize(20, 16);
    } else if (rune === 'ice') {
      // Frost nova: freeze everything nearby.
      Sfx.play('freeze');
      const ring = this.add.circle(pl.x, pl.body.center.y, 6, 0xb8f0ff, 0.5).setDepth(19).setStrokeStyle(2, 0xffffff);
      this.tweens.add({ targets: ring, scale: def.radius / 6, alpha: 0, duration: 350, onComplete: () => ring.destroy() });
      this.enemies.getChildren().slice().forEach(e => {
        if (!e.active || e.dying || (e.isBoss && !e.awake)) return;
        if (Phaser.Math.Distance.Between(pl.x, pl.y, e.x, e.y) > def.radius) return;
        e.hurt(def.damage, e.x < pl.x ? -1 : 1, 0);
        if (e.active && !e.dying) {
          e.immobilize(def.freeze, 'ice');
          this.fx('ice', e.x, e.y, 8);
          this.trackDaily('freeze');
        }
      });
    } else if (rune === 'light') {
      const s = this.state;
      Sfx.play('heal');
      s.hp = Math.min(s.maxHp, s.hp + def.heal);
      s.armorHp = GameState.armorPoints(s);
      if (this.pegasus) this.pegasus.hearts = PEGASUS.hearts;
      this.cameras.main.flash(300, 255, 250, 200);
      this.fx('gold', pl.x, pl.y, 24);
      this.floatText(pl.x, pl.y - 8, '+' + def.heal + ' HP', 0x80ff80);
    } else if (rune === 'undead') {
      // Friendly ghosts that hunt down mobs.
      Sfx.play('ghost');
      for (let i = 0; i < def.ghosts; i++) {
        const a = -Math.PI / 2 + (i - (def.ghosts - 1) / 2) * 0.6;
        new Projectile(this, pl.x, pl.y - 6, {
          group: this.playerProjectiles, texture: 'ghost', dir: Math.cos(a) < 0 ? -1 : 1,
          vx: Math.cos(a) * 140, vy: Math.sin(a) * 140, homing: true, ghost: true, trail: 'ghost',
          damage: def.damage + power, knockback: 100, lifetime: 4000,
        }).setAlpha(0.85);
      }
    } else if (rune === 'time') {
      this.stopTime(def.duration);
    } else if (rune === 'air') {
      // Sky leap: shoot up into the air with all your jumps back.
      Sfx.play('wind');
      if (pl.dashing) pl.endDash();
      pl.body.setVelocityY(def.leap);
      pl.jumpsUsed = 1;
      pl.airDashUsed = false;
      pl.jumping = false;
      this.fx('smoke', pl.x, pl.body.bottom, 12);
      this.enemyProjectiles.getChildren().slice().forEach(p => {
        if (Phaser.Math.Distance.Between(pl.x, pl.y, p.x, p.y) < 80) p.impact();
      });
    }
  },

  // ------------------------------------------------------------ items

  useItem(key, x, y) {
    const def = ITEMS[key];
    const pl = this.player;
    const time = this.time.now;
    Sfx.play('item');
    this.trackDaily('item');
    this.banner(def.text, def.name, 900);
    if (key === 'shieldPotion') {
      pl.shieldUntil = time + def.duration;
      Sfx.play('shield');
    } else if (key === 'frenzyPotion') {
      pl.frenzyUntil = time + def.duration;
      this.fx('fire', pl.x, pl.y, 16);
    } else if (key === 'explodePotion') {
      this.explode(pl.x, pl.body.center.y, def.radius, def.damage + GameState.bonuses(this.state).power, 300);
    } else if (key === 'timeApple') {
      this.stopTime(def.duration);
    }
  },

  // ------------------------------------------------------------ pegasus

  togglePegasus(time) {
    const peg = this.pegasus;
    const pl = this.player;
    if (!peg) {
      Sfx.play('error');
      this.message(pl.x, pl.y - 14, 'BUY THE PEGASUS IN THE SHOP', 0xff8080);
      return;
    }
    if (peg.mode === 'ridden') {
      pl.setRiding(false);
      peg.mode = 'follow';
      peg.setPosition(pl.x - pl.facing * 10, pl.y - 6);
      Sfx.play('neigh');
      return;
    }
    if (peg.mode === 'resting') {
      Sfx.play('error');
      this.message(pl.x, pl.y - 14, 'THE PEGASUS IS RESTING', 0xff8080);
      return;
    }
    if (pl.crouching || pl.dashing) return;
    pl.setRiding(true);
    peg.mode = 'ridden';
    Sfx.play('neigh');
    this.fx('spark', pl.x, pl.y, 12);
    this.trackDaily('ride');
  },

  // A hit while riding takes one of the pegasus' hearts. When they run out it
  // throws you off and flies away to rest.
  hurtPegasus(time, fromX) {
    const peg = this.pegasus;
    const pl = this.player;
    peg.hearts--;
    Sfx.play('neigh');
    this.fx('spark', pl.x, pl.body.bottom - 6, 8);
    this.cameras.main.shake(120, 0.008);
    if (peg.hearts <= 0) {
      pl.setRiding(false);
      peg.rest(time);
      this.banner('THE PEGASUS FLEW AWAY', 'IT WILL BE BACK AFTER A REST', 1400);
    }
    pl.onHurt(time, fromX);
  },
});
