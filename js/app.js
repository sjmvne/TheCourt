/**
 * ============================================================
 * THE COURT — Main Application Controller v1.2
 * ============================================================
 * Flow: Home (intro + soggetto + giuria) → Checklist → Verdetto → Summary → Archivio
 * Fixes: archive deletion, font alignment (header always logo), judges field.
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
    this.homeJudgesInput  = document.getElementById('homeJudges');
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

    // Render iniziale
    this.renderArchive();
    editor.renderRules();
    editor.renderLabels();
  }

  /* ─── HOME ───────────────────────────────────────────── */

  _bindHome() {
    this.startProcessBtn.addEventListener('click', () => {
      const name = this.homeSubjectInput.value.trim();
      if (!name) {
        showToast('⚠️ Inserisci il nome dell\'imputato/a');
        this.homeSubjectInput.focus();
        return;
      }

      // Salva sessione corrente
      this.currentSubjectName = name;
      this.currentJudges = this.homeJudgesInput.value.trim();

      // Reset checklist e naviga
      this._resetChecklist();
      this.renderChecklist();
      this.navigateTo('main');
    });
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
      opt.value = label;
      opt.textContent = label;
      this.subjectLabel.appendChild(opt);
    });
  }

  _saveSubject() {
    const entry = {
      name:   this.subjectName.value.trim() || this.currentSubjectName || 'Sconosciuto/a',
      judges: this.currentJudges,
      score:  this.currentScore,
      label:  this.subjectLabel.value,
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
      const labelBadge = entry.label
        ? `<span class="archive-label-badge">${this._escapeHtml(entry.label)}</span>`
        : '';
      const notesHtml = entry.notes
        ? `<p class="archive-card-notes">"${this._escapeHtml(entry.notes)}"</p>`
        : '';
      const judgesHtml = entry.judges
        ? `<p class="archive-card-judges">Giuria: ${this._escapeHtml(entry.judges)}</p>`
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
      `;

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
