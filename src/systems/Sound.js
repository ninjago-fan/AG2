// Tiny Web Audio synth. Every sound is generated in code; there are no audio files.
// The AudioContext is created on the first key press (browsers require a user gesture).

const Sfx = {
  ctx: null,
  master: null,
  noiseBuf: null,

  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.22;
      this.master.connect(this.ctx.destination);

      const len = Math.floor(this.ctx.sampleRate * 0.5);
      this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  },

  tone(f0, f1, dur, type = 'square', vol = 0.3, delay = 0) {
    const t = this.ctx.currentTime + delay;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g);
    g.connect(this.master);
    o.start(t);
    o.stop(t + dur + 0.02);
  },

  noise(dur, vol = 0.3, freq = 1200, filter = 'lowpass', delay = 0) {
    const t = this.ctx.currentTime + delay;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const f = this.ctx.createBiquadFilter();
    f.type = filter;
    f.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f);
    f.connect(g);
    g.connect(this.master);
    src.start(t);
    src.stop(t + dur + 0.02);
  },

  notes(freqs, step, type = 'square', vol = 0.25, len = null) {
    freqs.forEach((f, i) => this.tone(f, null, len || step * 1.2, type, vol, i * step));
  },

  play(name) {
    if (!this.ctx || this.ctx.state !== 'running') return;
    switch (name) {
      case 'jump':       this.tone(280, 620, 0.12, 'square', 0.18); break;
      case 'swingFast':  this.noise(0.06, 0.25, 4000, 'highpass'); break;
      case 'swing':      this.noise(0.10, 0.30, 2500, 'bandpass'); break;
      case 'swingHeavy': this.noise(0.18, 0.40, 700); this.tone(130, 60, 0.18, 'sawtooth', 0.2); break;
      case 'bow':        this.tone(900, 300, 0.08, 'triangle', 0.3); break;
      case 'fire':       this.noise(0.15, 0.30, 900); this.tone(220, 520, 0.12, 'sawtooth', 0.1); break;
      case 'enemyShot':  this.tone(600, 250, 0.10, 'triangle', 0.22); break;
      case 'impact':     this.noise(0.05, 0.15, 2500); break;
      case 'hit':        this.tone(240, 110, 0.08, 'square', 0.22); this.noise(0.05, 0.2, 3000); break;
      case 'enemyDie':   this.tone(420, 70, 0.25, 'square', 0.22); this.noise(0.2, 0.2, 1500); break;
      case 'hurt':       this.tone(170, 70, 0.25, 'sawtooth', 0.3); break;
      case 'death':      this.notes([440, 330, 247, 165], 0.12, 'square', 0.25); break;
      case 'coin':       this.tone(988, null, 0.06, 'square', 0.18); this.tone(1319, null, 0.14, 'square', 0.18, 0.06); break;
      case 'potion':     this.notes([523, 659, 784], 0.07, 'triangle', 0.3); break;
      case 'heart':      this.notes([392, 523, 659, 784, 1047], 0.07, 'square', 0.2); break;
      case 'weapon':     this.notes([330, 440, 554, 659], 0.08, 'square', 0.22); break;
      case 'chest':      this.notes([523, 659, 784, 1047, 784, 1047, 1319], 0.1, 'square', 0.22); break;
      case 'select':     this.tone(660, null, 0.05, 'square', 0.18); break;
      case 'confirm':    this.notes([660, 990], 0.06, 'square', 0.2); break;
      case 'pause':      this.notes([520, 390], 0.06, 'triangle', 0.25); break;
      case 'doubleJump': this.tone(420, 900, 0.12, 'square', 0.15); break;
      case 'dash':       this.noise(0.14, 0.3, 1800, 'bandpass'); this.tone(500, 180, 0.12, 'sawtooth', 0.1); break;
      case 'bounce':     this.tone(260, 520, 0.09, 'triangle', 0.25); break;
      case 'throw':      this.noise(0.09, 0.25, 3000, 'bandpass'); break;
      case 'explosion':  this.noise(0.5, 0.5, 600); this.tone(120, 40, 0.4, 'sawtooth', 0.3); break;
      case 'armor':      this.tone(900, 600, 0.08, 'triangle', 0.25); this.noise(0.05, 0.2, 5000, 'highpass'); break;
      case 'gem':        this.tone(1568, null, 0.06, 'triangle', 0.22); this.tone(2093, null, 0.12, 'triangle', 0.22, 0.06); break;
      case 'rune':       this.notes([523, 784, 1047, 1568, 2093], 0.09, 'triangle', 0.28); break;
      case 'secret':     this.notes([392, 494, 587, 784], 0.07, 'square', 0.16); break;
      case 'power':      this.notes([262, 392, 523, 784], 0.05, 'sawtooth', 0.16); this.noise(0.3, 0.2, 1200); break;
      case 'portal':     this.notes([262, 330, 392, 523, 659, 784, 1047], 0.06, 'triangle', 0.25); break;
      case 'slam':       this.noise(0.35, 0.5, 400); this.tone(90, 40, 0.35, 'square', 0.3); break;
      case 'bossRoar':   this.tone(110, 55, 0.8, 'sawtooth', 0.35); this.noise(0.6, 0.3, 400); break;
      case 'bossDie':    this.notes([392, 330, 262, 196, 131], 0.14, 'sawtooth', 0.25); this.noise(1.0, 0.4, 500); break;
      case 'buy':        this.notes([784, 1047, 1319], 0.06, 'square', 0.2); break;
      case 'error':      this.tone(160, 110, 0.15, 'square', 0.2); break;
      case 'freeze':     this.tone(1800, 900, 0.12, 'triangle', 0.2); this.noise(0.12, 0.15, 6000, 'highpass'); break;
      case 'frozen':     this.notes([1568, 1319, 1047], 0.04, 'triangle', 0.18); break;
      case 'quake':      this.noise(0.6, 0.5, 300); this.tone(70, 35, 0.6, 'sawtooth', 0.3); break;
      case 'wind':       this.noise(0.8, 0.3, 900, 'bandpass'); this.tone(300, 600, 0.6, 'sine', 0.08); break;
      case 'zap':        this.noise(0.2, 0.35, 5000, 'highpass'); this.tone(1200, 200, 0.2, 'sawtooth', 0.15); break;
      case 'void':       this.tone(90, 180, 0.3, 'sine', 0.3); this.tone(180, 60, 0.3, 'triangle', 0.15); break;
      case 'voidHit':    this.tone(400, 80, 0.2, 'sine', 0.3); break;
      case 'boomerang':  this.noise(0.12, 0.2, 2000, 'bandpass'); this.tone(500, 700, 0.1, 'triangle', 0.1); break;
      case 'catch':      this.tone(700, 1000, 0.06, 'triangle', 0.18); break;
      case 'stun':       this.notes([1319, 988, 1319, 988], 0.05, 'square', 0.12); break;
      case 'neigh':      this.tone(700, 1100, 0.15, 'sawtooth', 0.15); this.tone(1100, 500, 0.3, 'sawtooth', 0.15, 0.15); break;
      case 'laser':      this.tone(1400, 300, 0.12, 'square', 0.15); break;
      case 'plasma':     this.tone(300, 900, 0.15, 'sine', 0.25); break;
      case 'glitch':     this.noise(0.08, 0.3, 3000, 'bandpass'); this.tone(80, 2000, 0.05, 'square', 0.1, 0.04); break;
      case 'timeStop':   this.notes([1047, 784, 523, 262], 0.08, 'triangle', 0.25); break;
      case 'item':       this.notes([523, 784, 659, 1047], 0.06, 'triangle', 0.25); break;
      case 'shield':     this.tone(400, 1200, 0.3, 'sine', 0.25); break;
      case 'heal':       this.notes([523, 659, 784, 1047, 1319], 0.06, 'sine', 0.3); break;
      case 'ghost':      this.tone(500, 300, 0.4, 'sine', 0.2); this.tone(510, 290, 0.4, 'sine', 0.2); break;
      case 'wave':       this.noise(0.7, 0.4, 700, 'lowpass'); break;
      case 'task':       this.notes([784, 988, 1175, 1568], 0.07, 'square', 0.18); break;
      case 'type':       this.tone(900, null, 0.02, 'square', 0.05); break;
    }
  },
};

window.addEventListener('keydown', () => Sfx.unlock());
window.addEventListener('pointerdown', () => Sfx.unlock());
window.addEventListener('touchstart', () => Sfx.unlock());
