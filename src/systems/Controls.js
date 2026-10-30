// Input: the keyboard, plus on-screen buttons when playing on an iPad.
// The game asks Controls for actions ('left', 'attack', 'pegasus', ...)
// instead of reading keys directly, so a key and a touch button do the same.

// The device is chosen every time the game starts (DeviceScene).
const InputMode = {
  get ipad() { return Profile.get().controls === 'ipad'; },
  set(mode) {
    Profile.get().controls = mode;
    Profile.save();
  },
};

const KEY_BINDINGS = (() => {
  const b = {
    left: ['LEFT'], right: ['RIGHT'], up: ['UP'], down: ['DOWN'],
    attack: ['SPACE', 'J'], dash: ['D'], pause: ['ESC'], shaders: ['V'],
    pegasus: ['P'], nextWeapon: ['TAB'],
  };
  RUNE_ORDER.forEach(r => { b['rune_' + r] = [RUNES[r].key]; });
  WEAPON_ORDER.forEach(w => { b['weapon_' + w] = []; });
  Object.entries(WEAPON_HOTKEYS).forEach(([k, w]) => b['weapon_' + w].push(k));
  const digits = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'ZERO'];
  WEAPON_ORDER.slice(0, 10).forEach((w, i) => b['weapon_' + w].push(digits[i]));
  return b;
})();

class Controls {
  constructor(scene) {
    const kb = scene.input.keyboard;
    this.keys = {};
    Object.entries(KEY_BINDINGS).forEach(([action, names]) => {
      this.keys[action] = names.map(n => kb.addKey(Phaser.Input.Keyboard.KeyCodes[n]));
    });
    this.touch = {};    // action -> { down, just }
  }

  // Held right now (key or button).
  down(action) {
    const t = this.touch[action];
    return (t && t.down) || (this.keys[action] || []).some(k => k.isDown);
  }

  // Pressed since the last time we asked. Each action should be asked once per frame.
  pressed(action) {
    let hit = false;
    (this.keys[action] || []).forEach(k => { if (Phaser.Input.Keyboard.JustDown(k)) hit = true; });
    const t = this.touch[action];
    if (t && t.just) {
      t.just = false;
      hit = true;
    }
    return hit;
  }

  // On-screen buttons.
  press(action) {
    const t = this.touch[action] || (this.touch[action] = { down: false, just: false });
    if (!t.down) t.just = true;
    t.down = true;
  }

  release(action) {
    if (this.touch[action]) this.touch[action].down = false;
  }

  reset() {
    Object.values(this.keys).forEach(list => list.forEach(k => k.reset()));
    this.touch = {};
  }
}

// A tappable/clickable button for menus: a box with a pixel-text label.
// Returns { box, text, setLabel(str), setActive(bool), destroy() }.
function makeButton(scene, x, y, w, h, label, onTap, opts = {}) {
  const color = opts.color !== undefined ? opts.color : 0x2a2a4a;
  const box = scene.add.rectangle(x, y, w, h, color, opts.alpha !== undefined ? opts.alpha : 0.85)
    .setStrokeStyle(1, opts.stroke !== undefined ? opts.stroke : 0x8a8aaa)
    .setInteractive({ useHandCursor: true });
  const text = pixelText(scene, x, y, label, { origin: 0.5, scale: opts.scale || 1, tint: opts.tint });
  if (opts.depth !== undefined) { box.setDepth(opts.depth); text.setDepth(opts.depth + 1); }
  if (opts.scrollFactor !== undefined) { box.setScrollFactor(opts.scrollFactor); text.setScrollFactor(opts.scrollFactor); }
  box.on('pointerdown', () => {
    Sfx.unlock();
    box.setFillStyle(0x5a5a8a, 1);
    scene.time.delayedCall(90, () => { if (box.active) box.setFillStyle(color, opts.alpha !== undefined ? opts.alpha : 0.85); });
    onTap();
  });
  return {
    box, text,
    setLabel(str) { text.setText(String(str).toUpperCase()); return this; },
    setVisible(v) { box.setVisible(v); text.setVisible(v); if (v) box.setInteractive(); else box.disableInteractive(); return this; },
    destroy() { box.destroy(); text.destroy(); },
  };
}
