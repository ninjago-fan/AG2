const PLAYER_CFG = {
  runSpeed: 118,
  jumpVelocity: -350,   // ~4 tiles high
  airJumpVelocity: -310, // double jump, a little weaker
  jumpCut: 0.45,        // releasing Up early cuts the jump short
  jumpBuffer: 110,      // ms a jump press is remembered before landing
  coyoteTime: 80,       // ms after walking off a ledge that still counts as on the ground
  invulnerable: 1000,   // ms of invincibility after taking damage
  hurtStun: 200,
  crouchSpeed: 0.35,    // fraction of run speed while crouching
  dashSpeed: 330,
  dashTime: 160,        // ms; you can't be hurt while dashing
  dashCooldown: 700,
  bounceSpeed: 170,     // sideways speed when bouncing off a corner or rune wall
};

class Player extends Phaser.Physics.Arcade.Sprite {
  // tex: texture prefix from ensurePlayerTextures() (skin + armor).
  constructor(scene, x, y, tex) {
    super(scene, x, y, tex + '_idle');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.tex = tex;
    this.body.setSize(8, 14).setOffset(2, 1 + PLAYER_PAD);
    this.body.setMaxVelocity(400, 520);
    this.setDepth(10);

    this.facing = 1;
    this.dead = false;
    this.frozen = false;
    this.invulnUntil = 0;
    this.stunUntil = 0;
    this.nextAttack = 0;
    this.attackPoseUntil = 0;
    this.jumpPressedAt = -10000;
    this.jumping = false;
    this.jumpsUsed = 0;
    this.lastOnFloor = 0;
    this.crouching = false;
    this.dashing = false;
    this.dashUntil = 0;
    this.nextDash = 0;
    this.nextGhost = 0;
    this.airDashUsed = false;
    this.stoneUntil = 0;
    this.shieldUntil = 0;   // shield potion
    this.frenzyUntil = 0;   // frenzy potion
    this.riding = false;    // on the pegasus
    this.bubble = scene.add.circle(x, y, 13, 0x4dd2ff, 0.22).setStrokeStyle(1, 0xb8f0ff).setDepth(11).setVisible(false);
  }

  get state() { return this.scene.state; }

  canBeTargeted() { return !this.dead && !this.frozen; }

  stoneActive(time) { return time < this.stoneUntil; }

  // ctl: a Controls object (keyboard and touch buttons).
  update(time, ctl) {
    if (this.dead) return;
    const body = this.body;
    const onFloor = body.blocked.down;
    if (this.frozen) {
      if (this.dashing) this.endDash();
      body.setVelocityX(0);
      this.setAlpha(1);
      this.showFrame(onFloor, false, time);
      return;
    }

    const bonus = GameState.bonuses(this.state);

    if (onFloor) {
      this.lastOnFloor = time;
      this.jumpsUsed = 0;
      this.airDashUsed = false;
    } else if (this.jumpsUsed === 0 && time - this.lastOnFloor > PLAYER_CFG.coyoteTime) {
      this.jumpsUsed = 1;   // walked off a ledge: the ground jump is gone
    }

    // Dash (D): a quick burst in the direction you face. Once per air time.
    if (this.dashing && time >= this.dashUntil) this.endDash();
    if (!this.dashing && ctl.pressed('dash') && time >= this.nextDash && time >= this.stunUntil
        && (onFloor || !this.airDashUsed)) {
      this.startDash(time, ctl, onFloor);
    }
    if (this.dashing) {
      body.setVelocity(this.facing * PLAYER_CFG.dashSpeed, 0);
      if (time > this.nextGhost) this.ghost(time);
      this.setFlipX(this.facing < 0);
      this.showFrame(onFloor, true, time);
      return;
    }

    // Crouch (Down): only on the ground. Flying shots pass over you.
    this.setCrouch(ctl.down('down') && onFloor && !this.riding);

    let move = 0;
    if (ctl.down('left')) move -= 1;
    if (ctl.down('right')) move += 1;
    if (time >= this.stunUntil) {
      const speed = (PLAYER_CFG.runSpeed + bonus.speed) * (this.crouching ? PLAYER_CFG.crouchSpeed : 1) * (this.riding ? PEGASUS.speed : 1);
      body.setVelocityX(move * speed);
      if (move !== 0) this.facing = move;
    }
    this.setFlipX(this.facing < 0);

    // Jump (Up). A press just before landing still counts. In the air, a
    // press uses one of your extra jumps (double jump, triple with the upgrade).
    const canGroundJump = onFloor || (this.jumpsUsed === 0 && time - this.lastOnFloor <= PLAYER_CFG.coyoteTime);
    if (ctl.pressed('up')) {
      if (!canGroundJump && this.jumpsUsed > 0 && this.jumpsUsed < this.maxJumps()) {
        this.jumpsUsed++;
        body.setVelocityY(PLAYER_CFG.airJumpVelocity);
        this.jumping = true;
        this.jumpPressedAt = -10000;
        this.scene.fx('spark', this.x, body.bottom, 6);
        Sfx.play(this.riding ? 'boomerang' : 'doubleJump');
        this.scene.trackDaily('jump');
      } else {
        this.jumpPressedAt = time;
      }
    }
    if (canGroundJump && time - this.jumpPressedAt <= PLAYER_CFG.jumpBuffer) {
      this.setCrouch(false);
      body.setVelocityY(PLAYER_CFG.jumpVelocity);
      this.jumpPressedAt = -10000;
      this.jumpsUsed = 1;
      this.jumping = true;
      Sfx.play('jump');
      this.scene.trackDaily('jump');
    }
    if (this.jumping && !ctl.down('up') && body.velocity.y < 0) {
      body.setVelocityY(body.velocity.y * PLAYER_CFG.jumpCut);
      this.jumping = false;
    }
    if (body.velocity.y >= 0) this.jumping = false;

    // Attack (hold to keep attacking at the weapon's rate).
    if (ctl.down('attack') && time >= this.nextAttack) this.attack(time, bonus);

    // Flicker while invincible; grey while Stone Skin is on.
    this.setAlpha(time < this.invulnUntil && Math.floor(time / 70) % 2 ? 0.3 : 1);
    if (this.stoneActive(time)) this.setTint(0xb8a888);
    else if (time < this.frenzyUntil) this.setTint(Math.floor(time / 100) % 2 ? 0xff9a6a : 0xffffff);
    else this.clearTint();
    this.updateBubble(time);
    this.showFrame(onFloor, move !== 0, time);
  }

  maxJumps() { return GameState.maxJumps(this.state) + (this.riding ? PEGASUS.extraJumps : 0); }

  // Shield potion bubble; it blinks when it's about to pop.
  updateBubble(time) {
    const left = this.shieldUntil - time;
    this.bubble.setVisible(left > 0 && !this.dead && (left > 1500 || Math.floor(time / 100) % 2 === 0));
    this.bubble.setPosition(this.x, this.body.center.y);
  }

  // Get on or off the pegasus. While riding, the body reaches down to the
  // pegasus' hooves, so the platform rules apply to the horse's feet.
  setRiding(on) {
    if (on === this.riding) return;
    this.setCrouch(false);
    this.riding = on;
    if (on) {
      this.y -= 8;
      this.body.setSize(10, 22).setOffset(1, 1 + PLAYER_PAD);
    } else {
      this.body.setSize(8, 14).setOffset(2, 1 + PLAYER_PAD);
    }
  }

  destroy(fromScene) {
    if (this.bubble) this.bubble.destroy();
    super.destroy(fromScene);
  }

  setCrouch(on) {
    if (on === this.crouching) return;
    this.crouching = on;
    if (on) this.body.setSize(8, 9).setOffset(2, 6 + PLAYER_PAD);
    else this.body.setSize(8, 14).setOffset(2, 1 + PLAYER_PAD);
  }

  startDash(time, ctl, onFloor) {
    if (ctl.down('left') !== ctl.down('right')) this.facing = ctl.down('left') ? -1 : 1;
    this.setCrouch(false);
    this.dashing = true;
    this.dashUntil = time + PLAYER_CFG.dashTime;
    this.nextDash = this.dashUntil + GameState.dashCooldown(this.state);
    if (!onFloor) this.airDashUsed = true;
    this.jumping = false;
    this.body.setAllowGravity(false);
    Sfx.play('dash');
    this.scene.trackDaily('dash');
  }

  endDash() {
    this.dashing = false;
    this.body.setAllowGravity(true);
    this.body.setVelocityX(this.body.velocity.x * 0.4);
  }

  // Fading after-image left behind while dashing.
  ghost(time) {
    this.nextGhost = time + 30;
    const g = this.scene.add.image(this.x, this.y, this.texture.key).setFlipX(this.flipX)
      .setAlpha(0.5).setTintFill(0x80c8ff).setDepth(9);
    this.scene.tweens.add({ targets: g, alpha: 0, duration: 200, onComplete: () => g.destroy() });
  }

  // Knocked back by a corner or a locked rune wall (harmless).
  bounce(vx, vy) {
    if (this.dashing) this.endDash();
    this.body.setVelocity(vx, vy);
    this.stunUntil = this.scene.time.now + 180;
    this.jumping = false;
    Sfx.play('bounce');
  }

  attack(time, bonus) {
    const key = this.state.weapon;
    const w = WEAPONS[key];
    const level = GameState.weaponLevel(this.state, key);
    const frenzy = time < this.frenzyUntil ? 0.5 : 1;
    this.nextAttack = time + w.cooldown * (1 - bonus.haste) * FORGE.speed(level) * frenzy;
    this.attackPoseUntil = time + 120;
    const damage = w.damage + bonus.power + FORGE.damage(level);
    if (w.style === 'melee') this.scene.startMelee(w, damage);
    else this.scene.fireWeapon(w, damage);
    Sfx.play(w.sfx);
  }

  showFrame(onFloor, moving, time) {
    let key;
    if (this.dashing) key = 'dash';
    else if (this.crouching) key = 'crouch';
    else if (time < this.attackPoseUntil) key = 'attack';
    else if (!onFloor) key = 'jump';
    else if (moving) key = 'run';
    if (key === 'run') {
      this.play(this.tex + '_run', true);
    } else {
      if (this.anims.isPlaying) this.anims.stop();
      this.setTexture(this.tex + '_' + (key || 'idle'));
    }
  }

  isInvulnerable(time) {
    return this.dead || this.frozen || this.dashing || time < this.invulnUntil || this.stoneActive(time) || time < this.shieldUntil;
  }

  // Knockback and invincibility after a hit. HP is handled by the scene.
  onHurt(time, fromX) {
    this.invulnUntil = time + PLAYER_CFG.invulnerable;
    this.stunUntil = time + PLAYER_CFG.hurtStun;
    const dir = this.x < fromX ? -1 : 1;
    this.setCrouch(false);
    this.body.setVelocity(dir * 110, -160);
    this.jumping = false;
  }
}
