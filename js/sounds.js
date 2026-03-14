/**
 * ============================================================
 * THE COURT — Sound Engine (Web Audio API)
 * ============================================================
 * Genera effetti sonori procedurali senza file audio esterni.
 * Lazy-init (richiede interazione utente per AudioContext).
 * ============================================================
 */

class SoundEngine {

  constructor() {
    this.ctx = null;
  }

  _init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  /* ─── Deep impact — colpo di martello ────────────────── */
  playThud(intensity = 1) {
    this._init();
    const t = this.ctx.currentTime;

    // Sub-bass boom
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(55 * intensity, t);
    osc.frequency.exponentialRampToValueAtTime(18, t + 0.35);
    gain.gain.setValueAtTime(Math.min(0.7 * intensity, 1), t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.45);

    // Impact noise burst
    this._playNoise(0.12 * intensity, 0.12);
  }

  /* ─── Whoosh — movimento veloce ──────────────────────── */
  playWhoosh() {
    this._init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(900, t + 0.25);

    filter.type = 'bandpass';
    filter.frequency.value = 600;
    filter.Q.value = 0.6;

    gain.gain.setValueAtTime(0.03, t);
    gain.gain.linearRampToValueAtTime(0.1, t + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(filter).connect(gain).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.35);
  }

  /* ─── Cracking — vetro che si rompe ──────────────────── */
  playCrack() {
    this._init();
    this._playNoise(0.35, 0.35);

    const t = this.ctx.currentTime;
    // High crackle
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(2000, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.2);
    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  /* ─── Low rumble — tensione sotto ────────────────────── */
  playRumble(duration = 2.5) {
    this._init();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const osc2 = this.ctx.createOscillator();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(28, t);
    osc.frequency.linearRampToValueAtTime(22, t + duration);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(35, t);
    osc2.frequency.linearRampToValueAtTime(30, t + duration);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.linearRampToValueAtTime(0.25, t + duration * 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain).connect(this.ctx.destination);
    osc2.connect(gain);
    osc.start(t);
    osc2.start(t);
    osc.stop(t + duration);
    osc2.stop(t + duration);
  }

  /* ─── Reveal — accordo ascendente drammatico ─────────── */
  playReveal() {
    this._init();
    const t = this.ctx.currentTime;
    [330, 415, 494, 660].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, t + i * 0.06);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.15 + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.8);
      osc.connect(gain).connect(this.ctx.destination);
      osc.start(t + i * 0.06);
      osc.stop(t + 2);
    });
  }

  /* ─── Tick — singolo click per roulette ──────────────── */
  playTick() {
    this._init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 600 + Math.random() * 600;
    gain.gain.setValueAtTime(0.04, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  /* ─── Tension rise — tensione che sale ───────────────── */
  playTension(duration = 2.5) {
    this._init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + duration);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(100, t);
    filter.frequency.exponentialRampToValueAtTime(2000, t + duration);

    gain.gain.setValueAtTime(0.02, t);
    gain.gain.linearRampToValueAtTime(0.12, t + duration * 0.8);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(filter).connect(gain).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + duration);
  }

  /* ─── Final chord — accordo finale maestoso ──────────── */
  playFinalChord(isPositive) {
    this._init();
    const t = this.ctx.currentTime;

    // Positive = major chord, negative = minor
    const freqs = isPositive
      ? [261, 329, 392, 523, 659]
      : [261, 311, 392, 523, 622];

    freqs.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.setValueAtTime(0.15, t + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 2.5);
      osc.connect(gain).connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 2.5);
    });

    // Shimmer
    this._playNoise(0.03, 0.3);
  }

  /* ─── Delete whoosh (swipe) ──────────────────────────── */
  playDelete() {
    this._init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.2);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  /* ─── Noise burst helper ─────────────────────────────── */
  _playNoise(volume, duration) {
    const t = this.ctx.currentTime;
    const len = this.ctx.sampleRate * duration;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    src.connect(gain).connect(this.ctx.destination);
    src.start(t);
  }
}

const sfx = new SoundEngine();
