/**
 * ============================================================
 * THE COURT — Verdict Animation Engine v1.3 (Mind-Blowing)
 * ============================================================
 * ~15s cinematic sequence with procedural sound effects.
 *
 *   Phase 1:  Blackout + rumble                     (0 – 1s)
 *   Phase 2:  "ORDINE IN AULA" text + glow          (1 – 3s)
 *   Phase 3:  Gavel rise + whoosh                    (3 – 3.8s)
 *   Phase 4:  Triple slam (thuds + shake + flash)    (3.8 – 6.5s)
 *   Phase 5:  Cracks spread + crack sound            (6.5 – 7s)
 *   Phase 6:  Dissolve (dramatic silence)            (7 – 7.8s)
 *   Phase 7:  "IL VERDETTO" + reveal chord           (7.8 – 9s)
 *   Phase 8:  Score roulette + tension + ticks       (9 – 12.5s)
 *   Phase 9:  SCORE EXPLODE + final chord + burst    (12.5 – 13.5s)
 *   Phase 10: Subtitle + exit                        (13.5 – 15s)
 * ============================================================
 */

class VerdictEngine {

  constructor() {
    this.overlay     = document.getElementById('verdictOverlay');
    this.stage       = document.getElementById('verdictStage');
    this.textOrder   = document.getElementById('verdictTextOrder');
    this.textIntro   = document.getElementById('verdictTextIntro');
    this.textVerdict = document.getElementById('verdictTextVerdict');
    this.gavel       = document.getElementById('verdictGavel');
    this.flash       = document.getElementById('verdictFlash');
    this.cracks      = document.getElementById('verdictCracks');
    this.scoreCont   = document.getElementById('verdictScoreContainer');
    this.scoreNum    = document.getElementById('verdictScoreNumber');
    this.scoreSub    = document.getElementById('verdictScoreSub');
    this.particles   = document.getElementById('verdictParticles');
    this.glowRing    = document.getElementById('verdictGlowRing');

    this._rouletteFrame = null;
  }

  /* ─── Main Cinematic Sequence ────────────────────────── */

  async play(finalScore, onComplete) {
    this._resetAll();
    this.overlay.classList.add('active');

    // ── Phase 1: BLACKOUT + RUMBLE ──────────────────
    sfx.playRumble(6);
    await this._wait(1000);

    // ── Phase 2: "ORDINE IN AULA" ───────────────────
    this.textOrder.classList.add('animate');
    // Ambient particles during text
    this._spawnAmbientParticles(20, 2000);
    await this._wait(2200);
    this.textOrder.classList.add('fade-out');
    await this._wait(600);

    // ── Phase 3: GAVEL RISE ─────────────────────────
    sfx.playWhoosh();
    this.gavel.classList.add('animate-rise');
    await this._wait(700);

    // ── Phase 4: TRIPLE SLAM ────────────────────────

    // Slam 1 — light
    this.gavel.classList.remove('animate-rise');
    this.gavel.classList.add('animate-raise');
    await this._wait(350);
    sfx.playWhoosh();
    await this._wait(80);
    this.gavel.classList.remove('animate-raise');
    this.gavel.classList.add('animate-slam');
    sfx.playThud(0.6);
    this.flash.classList.add('flash-light');
    this._shake('light');
    this._vibrate([80]);
    await this._wait(550);
    this.flash.className = 'verdict-flash';

    // Slam 2 — medium
    this.gavel.classList.remove('animate-slam');
    this.gavel.classList.add('animate-raise');
    await this._wait(300);
    sfx.playWhoosh();
    await this._wait(80);
    this.gavel.classList.remove('animate-raise');
    this.gavel.classList.add('animate-slam');
    sfx.playThud(1.0);
    this.flash.classList.add('flash-medium');
    this._shake('medium');
    this._vibrate([120, 40, 80]);
    await this._wait(550);
    this.flash.className = 'verdict-flash';

    // Slam 3 — HEAVY (the culmination)
    this.gavel.classList.remove('animate-slam');
    this.gavel.classList.add('animate-raise');
    await this._wait(450);
    sfx.playWhoosh();
    await this._wait(100);
    this.gavel.classList.remove('animate-raise');
    this.gavel.classList.add('animate-slam');
    sfx.playThud(1.6);
    this.flash.classList.add('flash-heavy');
    this._shake('heavy');
    this._vibrate([200, 60, 200, 60, 120]);
    await this._wait(200);

    // ── Phase 5: CRACKS ─────────────────────────────
    sfx.playCrack();
    this._spawnCracks();
    await this._wait(600);
    this.flash.className = 'verdict-flash';

    // ── Phase 6: DISSOLVE ───────────────────────────
    this.gavel.classList.add('fade-out');
    this.cracks.style.transition = 'opacity 0.6s ease';
    this.cracks.style.opacity = '0';
    await this._wait(800);

    // ── Phase 7: "IL VERDETTO" ──────────────────────
    sfx.playReveal();
    this.textVerdict.classList.add('animate');
    this._spawnAmbientParticles(15, 1500);
    await this._wait(1500);
    this.textVerdict.classList.add('fade-out');
    await this._wait(500);

    // ── Phase 8: SCORE ROULETTE ─────────────────────
    sfx.playTension(3);
    this.scoreCont.classList.add('animate');
    await this._roulette(finalScore);

    // ── Phase 9: SCORE EXPLODE ──────────────────────
    sfx.playFinalChord(finalScore >= 0);
    this.scoreNum.classList.add('explode');
    this._vibrate([100]);
    this._spawnParticles(finalScore);
    this._flashGlowRing(finalScore);
    this._screenPulse(finalScore);
    await this._wait(1200);

    // ── Phase 10: SUBTITLE + EXIT ───────────────────
    this._setScoreSubtitle(finalScore);
    this.scoreSub.classList.add('show');
    await this._wait(2500);

    // Exit
    this.overlay.classList.remove('active');
    await this._wait(600);
    this._resetAll();

    if (onComplete) onComplete(finalScore);
  }

  /* ─── Screen Shake ──────────────────────────────────── */

  _shake(intensity) {
    this.stage.classList.remove('shake-light', 'shake-medium', 'shake-heavy');
    void this.stage.offsetWidth;
    this.stage.classList.add(`shake-${intensity}`);
    const dur = intensity === 'heavy' ? 500 : intensity === 'medium' ? 400 : 300;
    setTimeout(() => this.stage.classList.remove(`shake-${intensity}`), dur);
  }

  /* ─── Glow Ring flash ───────────────────────────────── */

  _flashGlowRing(score) {
    if (!this.glowRing) return;
    const color = score >= 5 ? 'var(--green)' : score >= 0 ? 'var(--gold)' : 'var(--red)';
    this.glowRing.style.borderColor = color;
    this.glowRing.style.boxShadow = `0 0 80px ${color}, 0 0 160px ${color}`;
    this.glowRing.classList.add('animate');
    setTimeout(() => {
      this.glowRing.classList.remove('animate');
      this.glowRing.style.cssText = '';
    }, 1500);
  }

  /* ─── Background pulse ─────────────────────────────── */

  _screenPulse(score) {
    const color = score >= 5
      ? 'rgba(48, 209, 88, 0.12)'
      : score >= 0
        ? 'rgba(255, 214, 10, 0.08)'
        : 'rgba(255, 69, 58, 0.14)';
    const bg = this.overlay.querySelector('.verdict-bg');
    bg.style.transition = 'background 0.25s ease';
    bg.style.background = color;
    setTimeout(() => {
      bg.style.transition = 'background 1s ease';
      bg.style.background = '#000';
    }, 400);
  }

  /* ─── Cracks ────────────────────────────────────────── */

  _spawnCracks() {
    this.cracks.innerHTML = '';
    this.cracks.style.opacity = '1';
    this.cracks.style.transition = '';

    const count = 16;
    for (let i = 0; i < count; i++) {
      const line = document.createElement('div');
      line.classList.add('crack-line');
      const angle = (360 / count) * i + (Math.random() - 0.5) * 25;
      const length = 60 + Math.random() * 220;
      line.style.setProperty('--crack-length', `${length}px`);
      line.style.transform = `rotate(${angle}deg)`;
      line.style.animationDelay = `${Math.random() * 0.12}s`;
      this.cracks.appendChild(line);
      requestAnimationFrame(() => line.classList.add('animate'));
    }
  }

  /* ─── Score Roulette (with ticks) ───────────────────── */

  _roulette(finalScore) {
    return new Promise(resolve => {
      const duration  = 3200;
      const startTime = performance.now();
      const range     = Math.max(30, Math.abs(finalScore) + 20);
      let tickCounter = 0;

      const animate = (now) => {
        const elapsed  = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 3.5);

        if (progress < 1) {
          const randomness = (1 - eased) * range;
          const offset = (Math.random() - 0.5) * 2 * randomness;
          const displayVal = Math.round(finalScore + offset);

          // Decimals for drama
          if (progress < 0.5) {
            const d = Math.floor(Math.random() * 100).toString().padStart(2, '0');
            this.scoreNum.textContent = `${displayVal}.${d}`;
          } else if (progress < 0.8) {
            const d = Math.floor(Math.random() * 10);
            this.scoreNum.textContent = `${displayVal}.${d}`;
          } else {
            this.scoreNum.textContent = `${displayVal}`;
          }

          this._colorizeScore(displayVal);

          // Tick sounds (getting slower)
          tickCounter++;
          const tickInterval = Math.floor(2 + eased * 8);
          if (tickCounter % tickInterval === 0) sfx.playTick();

          const nextDelay = 20 + eased * 140;
          this._rouletteFrame = setTimeout(() => {
            requestAnimationFrame(animate);
          }, nextDelay);
        } else {
          this.scoreNum.textContent = finalScore >= 0 ? `+${finalScore}` : `${finalScore}`;
          this._colorizeScore(finalScore);
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  /* ─── Colorize ──────────────────────────────────────── */

  _colorizeScore(val) {
    if (val >= 15)      this.scoreNum.style.color = '#30d158';
    else if (val >= 8)  this.scoreNum.style.color = '#32d74b';
    else if (val >= 3)  this.scoreNum.style.color = '#ffd60a';
    else if (val >= 0)  this.scoreNum.style.color = '#ff9f0a';
    else if (val >= -5) this.scoreNum.style.color = '#ff453a';
    else                this.scoreNum.style.color = '#ff2d55';
  }

  /* ─── Subtitle ──────────────────────────────────────── */

  _setScoreSubtitle(score) {
    let text = '';
    if (score >= 20)       text = '🌟 MIRACOLO. Sposalo/a ieri.';
    else if (score >= 15)  text = '💎 Keeper certificato/a dal Tribunale';
    else if (score >= 10)  text = '✅ Il comitato approva. Per ora.';
    else if (score >= 5)   text = '🤔 Potrebbe andare peggio... forse.';
    else if (score >= 0)   text = '⚠️ Procedere con estrema cautela';
    else if (score >= -5)  text = '🚩 Il Tribunale sconsiglia vivamente';
    else if (score >= -50) text = '☠️ CONDANNATO/A. Scappa. Subito.';
    else                   text = '💀 ERGASTOLO SENZA APPELLO!';
    this.scoreSub.textContent = text;
  }

  /* ─── Particles (score reveal) ──────────────────────── */

  _spawnParticles(score) {
    const count = 60;
    const colors = score >= 5
      ? ['#30d158', '#32d74b', '#d4a856', '#f0d080', '#fff']
      : score >= 0
        ? ['#ffd60a', '#ff9f0a', '#d4a856', '#fff', '#fbbf24']
        : ['#ff453a', '#ff6961', '#ff2d55', '#fff', '#ff9f0a'];

    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.classList.add('particle');

      const angle    = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.7;
      const distance = 80 + Math.random() * 350;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;
      const size  = 2 + Math.random() * 6;
      const color = colors[Math.floor(Math.random() * colors.length)];

      p.style.cssText = `
        left:${cx}px; top:${cy}px;
        width:${size}px; height:${size}px;
        background:${color};
        box-shadow: 0 0 ${size*3}px ${color};
        border-radius:${Math.random()>0.5?'50%':'2px'};
      `;

      const dur = 600 + Math.random() * 1000;
      p.animate([
        { transform:'translate(0,0) scale(1) rotate(0)', opacity:1 },
        { transform:`translate(${dx}px,${dy}px) scale(0) rotate(${Math.random()*720-360}deg)`, opacity:0 },
      ], { duration:dur, easing:'cubic-bezier(0,0.8,0.5,1)', fill:'forwards' });

      this.particles.appendChild(p);
      setTimeout(() => p.remove(), dur + 50);
    }
  }

  /* ─── Ambient particles (floating) ──────────────────── */

  _spawnAmbientParticles(count, duration) {
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.classList.add('particle');
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      const size = 1 + Math.random() * 3;
      p.style.cssText = `
        left:${x}px; top:${y}px;
        width:${size}px; height:${size}px;
        background: rgba(212,168,86,0.6);
        border-radius: 50%;
      `;
      p.animate([
        { transform: 'translateY(0) scale(0)', opacity: 0 },
        { transform: `translateY(${-30 - Math.random()*60}px) scale(1)`, opacity: 0.8, offset: 0.3 },
        { transform: `translateY(${-60 - Math.random()*80}px) scale(0.5)`, opacity: 0 },
      ], { duration: duration * (0.6 + Math.random() * 0.4), delay: Math.random() * duration * 0.5, fill: 'forwards' });
      this.particles.appendChild(p);
      setTimeout(() => p.remove(), duration + 500);
    }
  }

  /* ─── Vibration ─────────────────────────────────────── */

  _vibrate(pattern) {
    if (navigator.vibrate) navigator.vibrate(pattern);
  }

  /* ─── Utilities ─────────────────────────────────────── */

  _wait(ms) { return new Promise(r => setTimeout(r, ms)); }

  _resetAll() {
    if (this._rouletteFrame) { clearTimeout(this._rouletteFrame); this._rouletteFrame = null; }
    this.textOrder.className   = 'verdict-text-order';
    this.textIntro.className   = 'verdict-text-intro';
    this.textVerdict.className = 'verdict-text-verdict';
    this.gavel.className       = 'verdict-gavel';
    this.flash.className       = 'verdict-flash';
    this.scoreCont.className   = 'verdict-score-container';
    this.scoreNum.className    = 'verdict-score-number';
    this.scoreSub.className    = 'verdict-score-sub';
    this.scoreNum.textContent  = '0';
    this.scoreNum.style.color  = '';
    this.scoreSub.textContent  = '';
    this.particles.innerHTML   = '';
    this.cracks.innerHTML      = '';
    this.cracks.style.opacity  = '1';
    this.cracks.style.transition = '';
    this.stage.classList.remove('shake-light','shake-medium','shake-heavy');
    if (this.glowRing) { this.glowRing.className = 'verdict-glow-ring'; this.glowRing.style.cssText = ''; }
    const bg = this.overlay.querySelector('.verdict-bg');
    if (bg) { bg.style.background = '#000'; bg.style.transition = ''; }
  }
}

const verdict = new VerdictEngine();
