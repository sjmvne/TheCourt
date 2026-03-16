/**
 * ============================================================
 * THE COURT — Main Application Controller v1.3
 * ============================================================
 * Flow: Home (intro + soggetto + giuria) → Checklist → Verdetto → Summary → Archivio
 * v1.3: archive accordion, cta particles, label color support, judges array.
 * ============================================================
 */

/* ── Toast globale ─────────────────────────────────────── */
function showToast(message, duration = 2200) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
}


/* ── App Controller ────────────────────────────────────── */
class App {

  constructor() {
    // Stato sessione corrente
    this.selectedRules    = new Set();
    this.currentScore     = 10;
    this.BASE_SCORE       = 10;
    this.currentSubjectName = '';
    this.currentJudges      = '';
    this.judgesArray        = [];

    // Views
    this.views = {
      home:    document.getElementById('view-home'),
      main:    document.getElementById('view-main'),
      archive: document.getElementById('view-archive'),
      editor:  document.getElementById('view-editor'),
      credits: document.getElementById('view-credits'),
    };
    this.currentView = 'home';

    // Header (il logo resta sempre fisso, nessun cambio titolo)
    this.headerTitle = document.getElementById('headerTitle');

    // Sidebar
    this.hamburgerBtn   = document.getElementById('hamburgerBtn');
    this.sidebar        = document.getElementById('sidebar');
    this.sidebarOverlay = document.getElementById('sidebarOverlay');
    this.sidebarClose   = document.getElementById('sidebarClose');
    this.sidebarLinks   = document.querySelectorAll('.sidebar-link');

    // Home
    this.homeSubjectInput = document.getElementById('homeSubjectName');
    this.homeJudgesInput  = document.getElementById('homeJudgesInput');
    this.homeJudgesList   = document.getElementById('homeJudgesList');
    this.addJudgeBtn      = document.getElementById('addJudgeBtn');
    this.startProcessBtn  = document.getElementById('startProcessBtn');

    // Checklist
    this.greenFlagsList = document.getElementById('greenFlagsList');
    this.redFlagsList   = document.getElementById('redFlagsList');

    // Verdict
    this.verdictBtn = document.getElementById('verdictBtn');

    // Summary
    this.summaryModal      = document.getElementById('summaryModal');
    this.summaryScoreBadge = document.getElementById('summaryScoreBadge');
    this.subjectName       = document.getElementById('subjectName');
    this.subjectLabel      = document.getElementById('subjectLabel');
    this.subjectNotes      = document.getElementById('subjectNotes');
    this.saveSubjectBtn    = document.getElementById('saveSubjectBtn');
    this.discardSubjectBtn = document.getElementById('discardSubjectBtn');

    // Archive
    this.archiveList  = document.getElementById('archiveList');
    this.archiveEmpty = document.getElementById('archiveEmpty');

    this._init();
  }

  /* ─── Init ───────────────────────────────────────────── */

  _init() {
    this._bindHome();
    this._bindNavigation();
    this._bindSidebar();
    this._bindVerdict();
    this._bindSummary();
    this._initLabelColorPicker();

    // Render iniziale
    this.renderArchive();
    editor.renderRules();
    editor.renderLabels();
  }

  /* ─── HOME ───────────────────────────────────────────── */

  _bindHome() {
    this.addJudgeBtn.addEventListener('click', () => {
      const name = this.homeJudgesInput.value.trim();
      if (!name) return;
      this.judgesArray.push(name);
      this.homeJudgesInput.value = '';
      this._renderJudges();
    });

    this.homeJudgesInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.addJudgeBtn.click();
      }
    });

    this.startProcessBtn.addEventListener('click', (e) => {
      const name = this.homeSubjectInput.value.trim();
      if (!name) {
        showToast('⚠️ Inserisci il nome dell\'imputato/a');
        this.homeSubjectInput.focus();
        return;
      }

      // Se c'è del testo nell'input giuria che non è stato aggiunto, lo aggiungiamo
      const pendingJudge = this.homeJudgesInput.value.trim();
      if (pendingJudge) {
        this.judgesArray.push(pendingJudge);
        this.homeJudgesInput.value = '';
        this._renderJudges();
      }

      // CTA particles burst
      this._burstCtaParticles(e);

      // Salva sessione corrente
      this.currentSubjectName = name;
      this.currentJudges = this.judgesArray.join(', ');

      // Reset checklist e naviga (con piccolo delay per godere l'animazione)
      setTimeout(() => {
        this._resetChecklist();
        this.renderChecklist();
        this.navigateTo('main');
      }, 250);
    });
  }

  _renderJudges() {
    this.homeJudgesList.innerHTML = '';

    if (this.judgesArray.length === 0) {
      this.homeJudgesList.style.display = 'none';
      return;
    }

    this.homeJudgesList.style.display = 'flex';

    this.judgesArray.forEach((judge, idx) => {
      const item = document.createElement('div');
      item.classList.add('editor-label-item');
      item.innerHTML = `
        <span class="editor-label-text">${this._escapeHtml(judge)}</span>
        <button class="editor-rule-btn delete" type="button" aria-label="Rimuovi">✕</button>
      `;

      const btn = item.querySelector('.editor-rule-btn');
      btn.addEventListener('click', () => {
        this.judgesArray.splice(idx, 1);
        this._renderJudges();
      });

      this.homeJudgesList.appendChild(item);
    });
  }

  /* ─── CTA Particles ──────────────────────────────────── */

  _burstCtaParticles(clickEvent) {
    const btn = this.startProcessBtn;
    const container = btn.querySelector('.cta-wow-particles');
    if (!container) return;

    const rect = btn.getBoundingClientRect();
    const colors = ['#d4a856', '#f0d080', '#bf5af2', '#7d7aff', '#30d158', '#ffffff'];

    for (let i = 0; i < 24; i++) {
      const p = document.createElement('div');
      const angle = (Math.PI * 2 * i) / 24;
      const dist  = 30 + Math.random() * 60;
      const dx    = Math.cos(angle) * dist;
      const dy    = Math.sin(angle) * dist;
      const size  = 2 + Math.random() * 4;
      const color = colors[Math.floor(Math.random() * colors.length)];

      p.style.cssText = `
        position:absolute;
        left:50%; top:50%;
        width:${size}px; height:${size}px;
        background:${color};
        border-radius:50%;
        pointer-events:none;
        box-shadow:0 0 ${size*2}px ${color};
      `;

      p.animate([
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0)`, opacity: 0 },
      ], { duration: 500 + Math.random() * 300, easing: 'cubic-bezier(0,0.8,0.5,1)', fill: 'forwards' });

      container.appendChild(p);
      setTimeout(() => p.remove(), 850);
    }
  }

  /* ─── Label Color Picker (Editor) ────────────────────── */

  _initLabelColorPicker() {
    const picker = document.getElementById('labelColorPicker');
    if (!picker) return;
    const colors = storage.getLabelColors();
    let selected = colors[0];

    colors.forEach(color => {
      const swatch = document.createElement('div');
      swatch.className = 'label-color-swatch' + (color === selected ? ' selected' : '');
      swatch.style.background = color;
      swatch.title = color;
      swatch.addEventListener('click', () => {
        picker.querySelectorAll('.label-color-swatch').forEach(s => s.classList.remove('selected'));
        swatch.classList.add('selected');
        selected = color;
        editor._selectedColor = color;
      });
      picker.appendChild(swatch);
    });

    // Set default selection
    editor._selectedColor = selected;
  }

  /* ─── Navigazione ────────────────────────────────────── */

  _bindNavigation() {
    this.sidebarLinks.forEach(link => {
      link.addEventListener('click', () => {
        const viewName = link.dataset.view;
        this.navigateTo(viewName);
        this.closeSidebar();
      });
    });
  }

  navigateTo(viewName) {
    if (!this.views[viewName]) return;

    // Attiva solo la view corretta
    Object.entries(this.views).forEach(([name, el]) => {
      el.classList.toggle('active', name === viewName);
    });

    // Aggiorna sidebar link attivo
    this.sidebarLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.view === viewName);
    });

    // Hook: quando si va all'editor, ri-renderizza
    if (viewName === 'editor') {
      editor.renderRules();
      editor.renderLabels();
    }

    // Hook: checklist potrebbe avere regole nuove
    if (viewName === 'main') {
      this.renderChecklist();
    }

    // Hook: archivio
    if (viewName === 'archive') {
      this.renderArchive();
    }

    // Hook: home → reset form
    if (viewName === 'home') {
      this.homeSubjectInput.value = '';
      this.homeJudgesInput.value = '';
      this.judgesArray = [];
      this._renderJudges();
    }

    this.currentView = viewName;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ─── Sidebar ────────────────────────────────────────── */

  _bindSidebar() {
    this.hamburgerBtn.addEventListener('click', () => this.toggleSidebar());
    this.sidebarClose.addEventListener('click', () => this.closeSidebar());
    this.sidebarOverlay.addEventListener('click', () => this.closeSidebar());
  }

  toggleSidebar() {
    if (this.sidebar.classList.contains('active')) this.closeSidebar();
    else this.openSidebar();
  }

  openSidebar() {
    this.sidebar.classList.add('active');
    this.sidebarOverlay.classList.add('active');
    this.hamburgerBtn.classList.add('active');
  }

  closeSidebar() {
    this.sidebar.classList.remove('active');
    this.sidebarOverlay.classList.remove('active');
    this.hamburgerBtn.classList.remove('active');
  }

  /* ─── Checklist ──────────────────────────────────────── */

  renderChecklist() {
    const rules = storage.getRules();
    const greenFlags = rules.filter(r => r.value >= 0);
    const redFlags = rules.filter(r => r.value < 0);

    this.greenFlagsList.innerHTML = '';
    this.redFlagsList.innerHTML = '';

    greenFlags.forEach(rule => {
      this.greenFlagsList.appendChild(this._createChecklistItem(rule, 'green'));
    });

    redFlags.forEach(rule => {
      this.redFlagsList.appendChild(this._createChecklistItem(rule, 'red'));
    });
  }

  _createChecklistItem(rule, type) {
    const item = document.createElement('div');
    item.classList.add('checklist-item');
    const isSelected = this.selectedRules.has(rule.id);

    if (isSelected) {
      item.classList.add(type === 'green' ? 'selected-green' : 'selected-red');
    }

    const sign = rule.value >= 0 ? '+' : '';
    const colorClass = rule.value >= 0 ? 'positive' : 'negative';

    item.innerHTML = `
      <div class="checklist-check">${isSelected ? '✓' : ''}</div>
      <span class="checklist-text">${this._escapeHtml(rule.text)}</span>
      <span class="checklist-value ${colorClass}">${sign}${rule.value}</span>
    `;

    item.addEventListener('click', () => {
      this._toggleRule(rule, item, type);
    });

    return item;
  }

  _toggleRule(rule, element, type) {
    const isSelected = this.selectedRules.has(rule.id);

    if (isSelected) {
      this.selectedRules.delete(rule.id);
      element.classList.remove('selected-green', 'selected-red');
      element.querySelector('.checklist-check').textContent = '';
    } else {
      this.selectedRules.add(rule.id);
      element.classList.add(type === 'green' ? 'selected-green' : 'selected-red');
      element.querySelector('.checklist-check').textContent = '✓';
    }

    this._recalculateScore();
  }

  _recalculateScore() {
    const rules = storage.getRules();
    let total = this.BASE_SCORE;
    this.selectedRules.forEach(id => {
      const rule = rules.find(r => r.id === id);
      if (rule) total += rule.value;
    });
    this.currentScore = total;
  }

  /* ─── Verdict ────────────────────────────────────────── */

  _bindVerdict() {
    this.verdictBtn.addEventListener('click', () => {
      this._recalculateScore();
      verdict.play(this.currentScore, (finalScore) => {
        this._showSummary(finalScore);
      });
    });
  }

  /* ─── Summary ────────────────────────────────────────── */

  _bindSummary() {
    this.saveSubjectBtn.addEventListener('click', () => this._saveSubject());
    this.discardSubjectBtn.addEventListener('click', () => this._closeSummary());
  }

  _showSummary(score) {
    // Badge
    const sign = score >= 0 ? '+' : '';
    this.summaryScoreBadge.textContent = `${sign}${score}`;

    if (score >= 8) {
      this.summaryScoreBadge.style.background = 'var(--green-dim)';
      this.summaryScoreBadge.style.borderColor = 'var(--green)';
      this.summaryScoreBadge.style.color = 'var(--green)';
    } else if (score >= 0) {
      this.summaryScoreBadge.style.background = 'var(--gold-dim)';
      this.summaryScoreBadge.style.borderColor = 'var(--gold)';
      this.summaryScoreBadge.style.color = 'var(--gold)';
    } else {
      this.summaryScoreBadge.style.background = 'var(--red-dim)';
      this.summaryScoreBadge.style.borderColor = 'var(--red)';
      this.summaryScoreBadge.style.color = 'var(--red)';
    }

    // Popola labels
    this._populateLabelSelect();

    // Pre-fill con il nome dall'home page
    this.subjectName.value = this.currentSubjectName;
    this.subjectLabel.value = '';
    this.subjectNotes.value = '';

    this.summaryModal.classList.add('active');
  }

  _populateLabelSelect() {
    const labels = storage.getLabels();
    this.subjectLabel.innerHTML = '<option value="">— Seleziona —</option>';
    labels.forEach(label => {
      const opt = document.createElement('option');
      opt.value = JSON.stringify(label);   // store {text,color} as JSON string
      opt.textContent = label.text;
      this.subjectLabel.appendChild(opt);
    });
  }

  _saveSubject() {
    // Parse label option value
    let labelObj = null;
    if (this.subjectLabel.value) {
      try { labelObj = JSON.parse(this.subjectLabel.value); } catch (_) { labelObj = null; }
    }

    const entry = {
      name:   this.subjectName.value.trim() || this.currentSubjectName || 'Sconosciuto/a',
      judges: this.currentJudges,
      score:  this.currentScore,
      label:  labelObj,
      notes:  this.subjectNotes.value.trim(),
      selectedRules: Array.from(this.selectedRules),
    };

    storage.addToArchive(entry);
    this._closeSummary();
    showToast('💾 Sentenza archiviata!');

    // Torna alla home per una nuova sessione
    setTimeout(() => this.navigateTo('home'), 300);
  }

  _closeSummary() {
    this.summaryModal.classList.remove('active');
  }

  _resetChecklist() {
    this.selectedRules.clear();
    this.currentScore = this.BASE_SCORE;
  }

  /* ─── Archive ────────────────────────────────────────── */

  renderArchive() {
    const archive = storage.getArchive();
    this.archiveList.innerHTML = '';

    if (archive.length === 0) {
      this.archiveEmpty.style.display = 'block';
      return;
    }

    this.archiveEmpty.style.display = 'none';

    archive.forEach((entry, idx) => {
      // Swipe wrapper
      const wrapper = document.createElement('div');
      wrapper.classList.add('swipe-wrapper');
      wrapper.style.animationDelay = `${idx * 0.05}s`;

      const sign = entry.score >= 0 ? '+' : '';
      let scoreClass = 'score-neutral';
      if (entry.score >= 8) scoreClass = 'score-positive';
      else if (entry.score < 0) scoreClass = 'score-negative';

      const dateStr = this._formatDate(entry.date);

      // Label badge with color
      let labelBadge = '';
      if (entry.label) {
        const lbl = typeof entry.label === 'string'
          ? { text: entry.label, color: '#98989f' }
          : entry.label;
        const dot = `<span class="label-color-dot" style="background:${this._escapeHtml(lbl.color || '#98989f')}"></span>`;
        labelBadge = `<span class="archive-label-badge">${dot}${this._escapeHtml(lbl.text)}</span>`;
      }

      const notesHtml = entry.notes
        ? `<p class="archive-card-notes">"${this._escapeHtml(entry.notes)}"</p>`
        : '';
      const judgesHtml = entry.judges
        ? `<p class="archive-card-judges">Giuria: ${this._escapeHtml(entry.judges)}</p>`
        : '';

      // Build accordion flags from selectedRules
      let accordionHtml = '';
      if (entry.selectedRules && entry.selectedRules.length > 0) {
        const allRules = storage.getRules();
        const selected = entry.selectedRules
          .map(id => allRules.find(r => r.id === id))
          .filter(Boolean);
        const green = selected.filter(r => r.value >= 0);
        const red   = selected.filter(r => r.value < 0);

        let rows = '';
        green.forEach(r => {
          rows += `<div class="archive-flag-row">
            <span class="archive-flag-icon">✅</span>
            <span class="archive-flag-text">${this._escapeHtml(r.text)}</span>
            <span class="archive-flag-value positive">+${r.value}</span>
          </div>`;
        });
        red.forEach(r => {
          rows += `<div class="archive-flag-row">
            <span class="archive-flag-icon">🚩</span>
            <span class="archive-flag-text">${this._escapeHtml(r.text)}</span>
            <span class="archive-flag-value negative">${r.value}</span>
          </div>`;
        });

        accordionHtml = `<div class="archive-accordion" id="acc-${entry.id}">
          <div class="archive-accordion-inner">${rows}</div>
        </div>`;
      }

      const hasFlagDetails = entry.selectedRules && entry.selectedRules.length > 0;
      const tapHint = hasFlagDetails
        ? `<p class="archive-card-tap">▼ Dettagli</p>`
        : '';

      // Card content (swipeable)
      const card = document.createElement('div');
      card.classList.add('archive-card', 'swipe-content');
      card.innerHTML = `
        <div class="archive-card-header">
          <span class="archive-card-name">${this._escapeHtml(entry.name)}</span>
          <span class="archive-card-score ${scoreClass}">${sign}${entry.score}</span>
        </div>
        <div class="archive-card-meta">
          ${labelBadge}
          <span class="archive-card-date">${dateStr}</span>
        </div>
        ${judgesHtml}
        ${notesHtml}
        ${tapHint}
        ${accordionHtml}
      `;

      // Accordion toggle
      if (hasFlagDetails) {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
          const acc = card.querySelector('.archive-accordion');
          const hint = card.querySelector('.archive-card-tap');
          if (!acc) return;
          const isOpen = acc.classList.toggle('open');
          if (hint) hint.textContent = isOpen ? '▲ Chiudi' : '▼ Dettagli';
        });
      }

      wrapper.appendChild(card);
      this.archiveList.appendChild(wrapper);

      // Initialize swipe-to-delete
      initSwipe(wrapper, card, () => {
        storage.deleteFromArchive(entry.id);
        this.renderArchive();
        showToast('Soggetto eliminato');
      });
    });
  }

  /* ─── Utility ────────────────────────────────────────── */

  _formatDate(isoString) {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('it-IT', {
        day: '2-digit', month: 'short', year: 'numeric',
      });
    } catch { return ''; }
  }

  _escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}


/* ── Boot ──────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
