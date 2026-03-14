/**
 * ============================================================
 * THE COURT — Editor Module v1.3
 * ============================================================
 * Gestisce la pagina "Editor Regolamento":
 *   - CRUD per le regole (con swipe-to-delete)
 *   - CRUD per le etichette (con swipe-to-delete)
 *   - Modale per aggiunta/modifica regole
 *   - Slider -10/+10 con opzione "Numero manuale"
 * ============================================================
 */

class EditorManager {

  constructor() {
    this.rulesList    = document.getElementById('editorRulesList');
    this.labelsList   = document.getElementById('editorLabelsList');
    this.addRuleBtn   = document.getElementById('addRuleBtn');
    this.addLabelBtn  = document.getElementById('addLabelBtn');
    this.newLabelInput = document.getElementById('newLabelInput');
    this.resetAllBtn  = document.getElementById('resetAllBtn');

    // Modale regola
    this.ruleModal       = document.getElementById('ruleModal');
    this.ruleModalTitle  = document.getElementById('ruleModalTitle');
    this.ruleText        = document.getElementById('ruleText');
    this.ruleValueSlider = document.getElementById('ruleValueSlider');
    this.sliderValue     = document.getElementById('sliderValue');
    this.ruleManualCheck = document.getElementById('ruleManualCheck');
    this.ruleManualValue = document.getElementById('ruleManualValue');
    this.sliderContainer = document.getElementById('sliderContainer');
    this.saveRuleBtn     = document.getElementById('saveRuleBtn');
    this.cancelRuleBtn   = document.getElementById('cancelRuleBtn');

    this._editingRuleId = null;
    this._bindEvents();
  }

  _bindEvents() {
    this.addRuleBtn.addEventListener('click', () => this.openRuleModal());

    this.addLabelBtn.addEventListener('click', () => this._addLabel());
    this.newLabelInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this._addLabel();
    });

    this.ruleValueSlider.addEventListener('input', () => this._updateSliderDisplay());

    this.ruleManualCheck.addEventListener('change', () => {
      const manual = this.ruleManualCheck.checked;
      this.sliderContainer.style.display = manual ? 'none' : 'flex';
      this.ruleManualValue.style.display = manual ? 'block' : 'none';
    });

    this.saveRuleBtn.addEventListener('click', () => this._saveRule());
    this.cancelRuleBtn.addEventListener('click', () => this.closeRuleModal());

    this.resetAllBtn.addEventListener('click', () => {
      storage.resetAll();
      this.renderRules();
      this.renderLabels();
      showToast('Impostazioni ripristinate');
    });
  }

  /* ─── Render Regole (con swipe-to-delete) ─────────────── */

  renderRules() {
    const rules = storage.getRules();
    this.rulesList.innerHTML = '';

    if (rules.length === 0) {
      this.rulesList.innerHTML = '<p style="color:var(--text-tertiary);font-size:0.85rem;padding:12px">Nessuna regola. Aggiungine una!</p>';
      return;
    }

    rules.forEach(rule => {
      const isPositive = rule.value >= 0;
      const sign = isPositive ? '+' : '';
      const bgColor = isPositive ? 'var(--green-dim)' : 'var(--red-dim)';
      const textColor = isPositive ? 'var(--green)' : 'var(--red)';

      // Swipe wrapper
      const wrapper = document.createElement('div');
      wrapper.classList.add('swipe-wrapper', 'editor-swipe-wrapper');

      // Content (swipeable)
      const item = document.createElement('div');
      item.classList.add('editor-rule-item', 'swipe-content');
      item.innerHTML = `
        <span class="editor-rule-text">${this._escapeHtml(rule.text)}</span>
        <span class="editor-rule-value" style="background:${bgColor};color:${textColor}">${sign}${rule.value}</span>
        <button class="editor-rule-btn edit" aria-label="Modifica">✏️</button>
      `;

      // Edit handler
      item.querySelector('.edit').addEventListener('click', (e) => {
        e.stopPropagation();
        this.openRuleModal(rule);
      });

      wrapper.appendChild(item);
      this.rulesList.appendChild(wrapper);

      // Initialize swipe-to-delete
      initSwipe(wrapper, item, () => {
        storage.deleteRule(rule.id);
        this.renderRules();
        showToast('Regola eliminata');
      });
    });
  }

  /* ─── Render Etichette (con swipe-to-delete) ──────────── */

  renderLabels() {
    const labels = storage.getLabels();
    this.labelsList.innerHTML = '';

    if (labels.length === 0) {
      this.labelsList.innerHTML = '<p style="color:var(--text-tertiary);font-size:0.85rem;padding:12px">Nessuna etichetta.</p>';
      return;
    }

    labels.forEach(label => {
      const wrapper = document.createElement('div');
      wrapper.classList.add('swipe-wrapper', 'editor-swipe-wrapper');

      const item = document.createElement('div');
      item.classList.add('editor-label-item', 'swipe-content');
      item.innerHTML = `<span class="editor-label-text">${this._escapeHtml(label)}</span>`;

      wrapper.appendChild(item);
      this.labelsList.appendChild(wrapper);

      initSwipe(wrapper, item, () => {
        storage.deleteLabel(label);
        this.renderLabels();
        showToast('Etichetta eliminata');
      });
    });
  }

  /* ─── Modale Regola ──────────────────────────────────── */

  openRuleModal(existingRule = null) {
    this._editingRuleId = existingRule ? existingRule.id : null;
    this.ruleModalTitle.textContent = existingRule ? 'Modifica Regola' : 'Nuova Regola';

    this.ruleText.value = existingRule ? existingRule.text : '';

    const value = existingRule ? existingRule.value : 0;
    const isOutOfRange = value < -10 || value > 10;

    if (isOutOfRange) {
      this.ruleManualCheck.checked = true;
      this.sliderContainer.style.display = 'none';
      this.ruleManualValue.style.display = 'block';
      this.ruleManualValue.value = value;
      this.ruleValueSlider.value = 0;
    } else {
      this.ruleManualCheck.checked = false;
      this.sliderContainer.style.display = 'flex';
      this.ruleManualValue.style.display = 'none';
      this.ruleValueSlider.value = value;
      this.ruleManualValue.value = '';
    }

    this._updateSliderDisplay();
    this.ruleModal.classList.add('active');
    setTimeout(() => this.ruleText.focus(), 200);
  }

  closeRuleModal() {
    this.ruleModal.classList.remove('active');
    this._editingRuleId = null;
  }

  _saveRule() {
    const text = this.ruleText.value.trim();
    if (!text) { showToast('⚠️ Inserisci il testo della regola'); return; }

    let value;
    if (this.ruleManualCheck.checked) {
      value = parseInt(this.ruleManualValue.value, 10);
      if (isNaN(value)) { showToast('⚠️ Inserisci un valore numerico valido'); return; }
    } else {
      value = parseInt(this.ruleValueSlider.value, 10);
    }

    if (this._editingRuleId) {
      storage.updateRule(this._editingRuleId, text, value);
      showToast('Regola aggiornata');
    } else {
      storage.addRule(text, value);
      showToast('Regola aggiunta');
    }

    this.closeRuleModal();
    this.renderRules();
  }

  _addLabel() {
    const label = this.newLabelInput.value.trim();
    if (!label) return;
    if (storage.getLabels().includes(label)) { showToast('⚠️ Etichetta già esistente'); return; }
    storage.addLabel(label);
    this.newLabelInput.value = '';
    this.renderLabels();
    showToast('Etichetta aggiunta');
  }

  _updateSliderDisplay() {
    const val = parseInt(this.ruleValueSlider.value, 10);
    const sign = val >= 0 ? '+' : '';
    this.sliderValue.textContent = `${sign}${val}`;
    this.sliderValue.style.color = val > 0 ? 'var(--green)' : val < 0 ? 'var(--red)' : 'var(--text-secondary)';
  }

  _escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

const editor = new EditorManager();
