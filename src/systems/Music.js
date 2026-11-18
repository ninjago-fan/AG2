// Step-sequencer that plays the SONGS (src/data/music.js) with Web Audio, sharing
// Sfx's AudioContext. Scenes call play(song) / stop() / pause() / resume(), or
// Music.forScene(scene, song) to play while that scene runs. Songs loop forever.
// Notes are scheduled a little ahead of time so playback stays steady even when
// a frame runs long.

const Music = {
  song: null,
  out: null,          // music master gain
  reverb: null,       // shared reverb send
  trackNodes: null,   // per track { dry, send }
  playing: false,     // music wanted (GameScene is running)
  paused: false,
  step: 0,            // next step to schedule
  nextTime: 0,        // AudioContext time of that step
  timer: null,
  stopTimer: null,
  volume: 0.55,

  LOOKAHEAD: 0.12,    // seconds of audio scheduled in advance
  TICK_MS: 25,

  // Play a song while this scene runs. Going between scenes that use the same
  // song (a level restart, menu -> wardrobe) keeps it going without a restart.
  forScene(scene, song) {
    this.play(song);
    scene.events.once('shutdown', () => this.stop());
  },

  play(song) {
    // A scene change shuts one scene down and creates the next right away.
    // Cancel the pending stop so a shared song keeps going.
    clearTimeout(this.stopTimer);
    this.stopTimer = null;
    if (this.playing && this.song === song) {
      if (this.paused) this.resume();
      return;
    }
    if (this.playing) this.stopNow();
    this.paused = false;
    this.song = song;
    this.playing = true;
    this.step = 0;
    this.nextTime = 0;
    this.ensureTimer();
  },

  // Stop shortly after, unless start() is called again first.
  stop() {
    clearTimeout(this.stopTimer);
    this.stopTimer = setTimeout(() => this.stopNow(), 150);
  },

  stopNow() {
    this.playing = false;
    this.paused = false;
    clearInterval(this.timer);
    this.timer = null;
    if (this.out) {
      // Fade out whatever is already scheduled, then swap in a fresh bus.
      const ctx = Sfx.ctx, old = this.out;
      old.gain.setTargetAtTime(0, ctx.currentTime, 0.08);
      setTimeout(() => old.disconnect(), 600);
      this.out = null;
      this.trackNodes = null;
    }
  },

  pause() {
    if (!this.playing || this.paused) return;
    this.paused = true;
    if (this.out) this.out.gain.setTargetAtTime(0, Sfx.ctx.currentTime, 0.03);
  },

  resume() {
    if (!this.playing || !this.paused) return;
    this.paused = false;
    this.nextTime = 0; // pick up from the saved step, starting now
    if (this.out) this.out.gain.setTargetAtTime(this.volume, Sfx.ctx.currentTime, 0.03);
  },

  ensureTimer() {
    if (!this.timer) this.timer = setInterval(() => this.tick(), this.TICK_MS);
  },

  // ---------------------------------------------------------------- audio graph

  build() {
    const ctx = Sfx.ctx;
    this.out = ctx.createGain();
    this.out.gain.value = this.volume;
    // Big chords (many notes at once) would clip; the compressor tames them.
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 6;
    this.out.connect(comp);
    comp.connect(ctx.destination);

    if (!this.reverbBuf) this.reverbBuf = this.makeImpulse(ctx, 1.6);
    this.reverb = ctx.createConvolver();
    this.reverb.buffer = this.reverbBuf;
    this.reverb.connect(this.out);

    this.trackNodes = this.song.tracks.map(t => {
      const dry = ctx.createGain();
      dry.gain.value = t.volume;
      let node = dry;
      if (ctx.createStereoPanner) {
        const p = ctx.createStereoPanner();
        p.pan.value = t.pan || 0;
        dry.connect(p);
        node = p;
      }
      node.connect(this.out);
      const send = ctx.createGain();
      send.gain.value = t.reverb || 0;
      dry.connect(send);
      send.connect(this.reverb);
      return { dry };
    });

    // Index notes by step so each tick is a quick lookup.
    this.byStep = this.song.tracks.map(t => {
      const m = {};
      t.notes.forEach(n => { (m[n[0]] = m[n[0]] || []).push(n); });
      return m;
    });
  },

  makeImpulse(ctx, secs) {
    const len = Math.floor(ctx.sampleRate * secs);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    }
    return buf;
  },

  // ---------------------------------------------------------------- scheduler

  tick() {
    if (!this.playing) return;
    const ctx = Sfx.ctx;
    if (!ctx || ctx.state !== 'running' || this.paused) return;
    if (!this.out) this.build();

    const stepDur = 60 / this.song.bpm / 4;
    // Start (or catch up after a stall/pause) from now instead of bursting notes.
    if (this.nextTime < ctx.currentTime) this.nextTime = ctx.currentTime + 0.05;

    while (this.nextTime < ctx.currentTime + this.LOOKAHEAD) {
      let t = this.nextTime;
      if (this.song.swing && this.step % 2 === 1) t += stepDur * this.song.swing * 0.5;
      this.song.tracks.forEach((track, i) => {
        const notes = this.byStep[i][this.step];
        if (notes) notes.forEach(n => this.playNote(track, this.trackNodes[i].dry, n, t, stepDur));
      });
      this.nextTime += stepDur;
      this.step = (this.step + 1) % this.song.steps;
    }
  },

  playNote(track, dest, n, t, stepDur) {
    const [, p, l, v] = n;
    if (track.type === 'drums') this.drum(track.rows[p], v, t, dest);
    else this.synth(track.instrument, p, l * stepDur, v, t, dest);
  },

  // ---------------------------------------------------------------- instruments

  env(g, t, peak, attack, decay) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  },

  osc(type, f0, f1, t, dur, vol, dest, attack = 0.002) {
    const ctx = Sfx.ctx;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    this.env(g, t, vol, attack, dur);
    o.connect(g); g.connect(dest);
    o.start(t); o.stop(t + attack + dur + 0.05);
    return o;
  },

  noise(t, dur, vol, freq, type, dest, q = 1) {
    const ctx = Sfx.ctx;
    const src = ctx.createBufferSource();
    src.buffer = Sfx.noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain();
    this.env(g, t, vol, 0.001, dur);
    src.connect(f); f.connect(g); g.connect(dest);
    src.start(t); src.stop(t + dur + 0.05);
  },

  // Several oscillators ([type, harmonic, level]) sharing one envelope: decays
  // over `decay` seconds, cut short with a quick release at `len`.
  voice(parts, f, t, v, attack, len, decay, dest, tremolo = 0) {
    const ctx = Sfx.ctx;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + attack);
    g.gain.setTargetAtTime(0.0001, t + attack, decay / 4);
    g.gain.setTargetAtTime(0.0001, t + len, 0.04);
    g.connect(dest);
    const end = t + len + 0.25;
    let target = g;
    if (tremolo) {
      const tg = ctx.createGain(), lfo = ctx.createOscillator(), depth = ctx.createGain();
      tg.connect(g); target = tg;
      lfo.frequency.value = tremolo; depth.gain.value = 0.15;
      lfo.connect(depth); depth.connect(tg.gain);
      lfo.start(t); lfo.stop(end);
    }
    parts.forEach(([type, h, lvl]) => {
      const o = ctx.createOscillator(), og = ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(f * h, t);
      og.gain.value = lvl;
      o.connect(og); og.connect(target);
      o.start(t); o.stop(end);
    });
  },

  drum(name, v, t, dest) {
    switch (name) {
      case 'kick':  this.osc('sine', 150, 45, t, 0.28, 0.9 * v, dest); this.osc('triangle', 300, 60, t, 0.04, 0.3 * v, dest); break;
      case 'snare': this.noise(t, 0.16, 0.45 * v, 1800, 'bandpass', dest, 0.7); this.osc('triangle', 220, 160, t, 0.08, 0.3 * v, dest); break;
      case 'hatC':  this.noise(t, 0.04, 0.22 * v, 8000, 'highpass', dest); break;
      case 'hatO':  this.noise(t, 0.22, 0.2 * v, 7000, 'highpass', dest); break;
      case 'clap':
        [0, 0.012, 0.024].forEach(d => this.noise(t + d, 0.03, 0.3 * v, 1500, 'bandpass', dest, 1.2));
        this.noise(t + 0.03, 0.14, 0.3 * v, 1500, 'bandpass', dest, 1.2);
        break;
      case 'tomL':  this.osc('sine', 140, 80, t, 0.25, 0.6 * v, dest); break;
      case 'tomH':  this.osc('sine', 220, 130, t, 0.2, 0.55 * v, dest); break;
      case 'crash': this.noise(t, 1.0, 0.25 * v, 5000, 'highpass', dest); break;
    }
  },

  synth(inst, midi, dur, v, t, dest) {
    const f = 440 * Math.pow(2, (midi - 69) / 12);
    if (inst === 'pluck') {
      // Bright attack that decays quickly, through a closing lowpass.
      const ctx = Sfx.ctx;
      const o = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(f, t);
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(f * 8, t);
      lp.frequency.exponentialRampToValueAtTime(f * 1.5, t + 0.25);
      const len = Math.min(Math.max(dur, 0.12), 0.6);
      this.env(g, t, 0.35 * v, 0.003, len);
      o.connect(lp); lp.connect(g); g.connect(dest);
      o.start(t); o.stop(t + len + 0.05);
    } else if (inst === 'piano') {
      // Hammer attack, slow natural decay; let go at the end of the note.
      const len = Math.min(Math.max(dur, 0.15), 2.5);
      this.voice([['triangle', 1, 0.22], ['sine', 2, 0.06], ['sine', 3, 0.025]], f, t, v, 0.003, len, Math.min(len * 2, 3), dest);
    } else if (inst === 'epiano') {
      // Soft sine tine with a short bell overtone.
      const len = Math.min(Math.max(dur, 0.15), 2);
      this.voice([['sine', 1, 0.28], ['sine', 4, 0.05]], f, t, v, 0.004, len, 1.2, dest, 6);
      this.osc('sine', f * 7, null, t, 0.08, 0.03 * v, dest);
    } else if (inst === 'flute') {
      // Breathy sine with gentle vibrato.
      const ctx = Sfx.ctx;
      const o = ctx.createOscillator(), g = ctx.createGain();
      const lfo = ctx.createOscillator(), lg = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(f, t);
      lfo.frequency.value = 5;
      lg.gain.value = f * 0.006;
      lfo.connect(lg); lg.connect(o.frequency);
      const hold = Math.max(dur * 0.95, 0.06);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.3 * v, t + 0.03);
      g.gain.setValueAtTime(0.3 * v, t + hold);
      g.gain.exponentialRampToValueAtTime(0.0001, t + hold + 0.08);
      o.connect(g); g.connect(dest);
      o.start(t); o.stop(t + hold + 0.1);
      lfo.start(t); lfo.stop(t + hold + 0.1);
      this.noise(t, 0.05, 0.04 * v, f * 2, 'bandpass', dest, 2);
    } else if (inst === 'bass') {
      // Sawtooth through a lowpass that snaps shut.
      const ctx = Sfx.ctx;
      const o = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(f, t);
      lp.type = 'lowpass';
      lp.Q.value = 4;
      lp.frequency.setValueAtTime(f * 10, t);
      lp.frequency.exponentialRampToValueAtTime(f * 2, t + 0.12);
      const hold = Math.max(dur * 0.9, 0.05);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.4 * v, t + 0.004);
      g.gain.setValueAtTime(0.4 * v, t + hold);
      g.gain.exponentialRampToValueAtTime(0.0001, t + hold + 0.05);
      o.connect(lp); lp.connect(g); g.connect(dest);
      o.start(t); o.stop(t + hold + 0.08);
    } else {
      // 'chip' and anything unknown: square wave held for the note length.
      const ctx = Sfx.ctx;
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'square';
      o.frequency.setValueAtTime(f, t);
      const hold = Math.max(dur * 0.9, 0.03);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.18 * v, t + 0.004);
      g.gain.setValueAtTime(0.18 * v, t + hold);
      g.gain.exponentialRampToValueAtTime(0.0001, t + hold + 0.04);
      o.connect(g); g.connect(dest);
      o.start(t); o.stop(t + hold + 0.06);
    }
  },
};
