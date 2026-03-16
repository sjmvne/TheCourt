/**
 * ============================================================
 * THE COURT — Editor Module v1.4
 * ============================================================
 * v1.4:
 *   - Rule text field → textarea (multiriga)
 *   - Manual value → pulsanti +/- colorati
 *   - Labels → oggetti {text, color}, color picker a palette
 * ============================================================
 */

class EditorManager {

  constructor() {
    this.rulesList     = document.getElementById('editorRulesList');
    this.labelsList    = document.getElementById('editorLabelsList');
    this.addRuleBtn    = document.getElementById('addRuleBtn');
    this.addLabelBtn   = document.getElementById('addLabelBtn');
    this.newLabelInput = document.getElementById('newLabelInput');
    this.resetAllBtn   = document.getElementById('resetAllBtn');

    // Modale regola
    this.ruleModal         = document.getElementById('ruleModal');
    this.ruleModalTitle    = document.getElementById('ruleModalTitle');
    this.ruleText          = document.getElementById('ruleText');
    this.ruleValueSlider   = document.getElementById('ruleValueSlider');
    this.sliderValue       = document.getElementById('sliderValue');
    this.ruleManualCheck   = document.getElementById('ruleManualCheck');
    this.sliderContainer   = document.getElementById('sliderContainer');
    this.manualControls    = document.getElementById('manualValueControls');
    this.manualDisplay     = document.getElementById('manualValueDisplay');
    this.manualMinus       = document.getElementById('manualMinus');
    this.manualPlus        = document.getElementById('manualPlus');
    this.saveRuleBtn       = document.getElementById('saveRuleBtn');
    this.cancelRuleBtn     = document.getElementById('cancelRuleBtn');

    this._editingRuleId  = null;
    this._manualValue    = 0;
    this._selectedColor  = '#98989f';

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
      this.manualControls.style.display  = manual ? 'flex' : 'none';
    });

    // +/- buttons
    this.manualMinus.addEventListener('click', () => {
      this._manualValue--;
      this._updateManualDisplay();
    });
    this.manualPlus.addEventListener('click', () => {
      this._manualValue++;
      this._updateManualDisplay();
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
      item.innerHTML = `
        <span class="label-color-dot" style="background:${this._escapeHtml(label.color || '#98989f')}"></span>
        <span class="editor-label-text">${this._escapeHtml(label.text)}</span>
      `;

      wrapper.appendChild(item);
      this.labelsList.appendChild(wrapper);

      initSwipe(wrapper, item, () => {
        storage.deleteLabel(label.text);
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
      this.manualControls.style.display  = 'flex';
      this._manualValue = value;
      this._updateManualDisplay();
      this.ruleValueSlider.value = 0;
    } else {
      this.ruleManualCheck.checked = false;
      this.sliderContainer.style.display = 'flex';
      this.manualControls.style.display  = 'none';
      this.ruleValueSlider.value = value;
      this._manualValue = 0;
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
      value = this._manualValue;
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
    const text = this.newLabelInput.value.trim();
    if (!text) return;
    if (storage.getLabels().find(l => l.text === text)) {
      showToast('⚠️ Etichetta già esistente');
      return;
    }
    storage.addLabel(text, this._selectedColor);
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

  _updateManualDisplay() {
    const val = this._manualValue;
    const sign = val >= 0 ? '+' : '';
    this.manualDisplay.textContent = `${sign}${val}`;
    this.manualDisplay.style.color = val > 0 ? 'var(--green)' : val < 0 ? 'var(--red)' : 'var(--text-secondary)';
    this.manualMinus.style.opacity = '1';
    this.manualPlus.style.opacity  = '1';
  }

  _escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

const editor = new EditorManager();
