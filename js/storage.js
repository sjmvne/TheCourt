/**
 * ============================================================
 * THE COURT — Storage Manager v1.3
 * ============================================================
 * Persistenza su localStorage per regole, etichette, archivio.
 * v1.3: Labels extended to { text, color } objects.
 * ============================================================
 */

const STORAGE_KEYS = {
  RULES: 'court_rules',
  LABELS: 'court_labels',
  ARCHIVE: 'court_archive',
  INITIALIZED: 'court_v13_initialized',
};

/* ── Palette colori etichette ───────────────────────────── */
const LABEL_COLORS = [
  '#5e5ce6', // indigo
  '#30d158', // green
  '#ff453a', // red
  '#ff9f0a', // orange
  '#ffd60a', // yellow
  '#64d2ff', // cyan
  '#bf5af2', // purple
  '#ff2d55', // pink
  '#d4a856', // gold
  '#98989f', // neutral
];

/* ── Regole di default — Gen Z Edition ─────────────────── */
const DEFAULT_RULES = [

  /* ═══════════════ 🟩 GREEN FLAGS ═══════════════ */

  // Impatto Alto — Da sposare ieri
  { id: 'g1',  text: 'Yapping da Hyperfixation: ha una passione nerd totalizzante e gli brillano gli occhi quando ne parla a macchinetta', value: 10 },
  { id: 'g2',  text: 'Memoria da Elefante: si ricorda un dettaglio microscopico detto di sfuggita tre settimane fa', value: 10 },
  { id: 'g3',  text: 'Intelligenza Emotiva: sa comunicare come si sente, non ghostizza e magari va in terapia', value: 8 },
  { id: 'g4',  text: 'Mascolinità decostruita: non va in crisi se deve tenere la borsa rosa della tua amica in pubblico', value: 8 },
  { id: 'g5',  text: 'Consapevolezza Psicologica: sa qual è il suo stile di attaccamento e ci scherza con autoironia', value: 7 },
  { id: 'g6',  text: 'Golden Retriever Energy: genuinamente felice di vederti, complimenti senza secondi fini, zero giochetti tossici', value: 6 },

  // Impatto Medio — Vibe check superato
  { id: 'g7',  text: 'Ha hobby veri e sani: non solo palestra e FIFA. Bouldering, lettura, ceramica — ha una vita sua', value: 5 },
  { id: 'g8',  text: 'Il "Tech Support" umile: le ha sistemato un problema col PC senza farla sentire una stupida', value: 5 },
  { id: 'g9',  text: 'Condivisione dello stesso neurone: scambio di meme fluido, umorismo dark al punto giusto', value: 4 },
  { id: 'g10', text: 'Estetica "Soft Boy": anelli d\'argento, tote bag in tessuto o smalto nero (bonus se glielo fa fare lei)', value: 4 },
  { id: 'g11', text: 'Animal Whisperer: chiede il permesso prima di accarezzare il gatto. Se l\'animale lo approva, la sentenza è quasi vinta', value: 4 },
  { id: 'g12', text: 'Skincare e Igiene: usa la crema idratante, niente bagnoschiuma 3-in-1 del supermercato, unghie pulite', value: 3 },
  { id: 'g13', text: 'Curatore di Vibe: ha una playlist Spotify per ogni momento della giornata (titoli in minuscolo)', value: 3 },
  { id: 'g14', text: 'Yapping costruttivo: sa spiegare tutta la lore di un videogioco o evento storico in modo affascinante', value: 3 },

  // Impatto Basso — Scioglie il cuore
  { id: 'g15', text: '"Acts of Service" spontanei: teoria della buccia d\'arancia, ti versa l\'acqua, si ricorda il tuo caffè', value: 2 },
  { id: 'g16', text: 'È "amico delle donne": amicizie femminili sane e platoniche, niente discorsi da "bro" denigratori', value: 2 },
  { id: 'g17', text: 'Guida da manuale: una mano rilassata sul volante, ma rispetta i limiti e non urla dal finestrino', value: 2 },
  { id: 'g18', text: 'Idratazione consapevole: gira con borraccia termica o ordina un matcha latte senza crisi di mascolinità', value: 1 },

  /* ═══════════════ 🟥 RED FLAGS ═══════════════ */

  // Impatto Alto — Evacuazione immediata, chiamate la SWAT
  { id: 'r1',  text: '"Alpha Male" Podcast Listener: usa "high value man", chiede il body count al primo appuntamento', value: -10 },
  { id: 'r2',  text: 'Il Mammone Tossico: paragona il cibo del ristorante a quello di sua madre. Al primo appuntamento.', value: -10 },
  { id: 'r3',  text: 'Seguiti Instagram inquietanti: 1200 seguiti, 1150 modelle di Instagram/OF, lui ha 150 follower', value: -10 },
  { id: 'r4',  text: 'Weaponized Incompetence: fa finta di non saper cucinare un uovo sperando che tu diventi sua madre', value: -8 },
  { id: 'r5',  text: 'L\'Hater di professione: critica tutto ciò che è mainstream (Taylor Swift, l\'oroscopo) per sentirsi superiore', value: -8 },
  { id: 'r6',  text: 'Il Crypto Bro persistente: ti spiega NFT e mindset come se stesse girando un reel motivazionale', value: -8 },
  { id: 'r7',  text: 'Ironia paravento: battuta passivo-aggressiva sulle amiche e poi "Eddai, stavo scherzando, come sei permalosa!"', value: -7 },

  // Impatto Medio — Cringe e Ick
  { id: 'r8',  text: 'Zero Digital Footprint (o Footprint inquietante): non ha social oppure segue solo modelle e mette like sospetti', value: -5 },
  { id: 'r9',  text: '"Devil\'s Advocate": deve fare l\'avvocato del diavolo su QUALSIASI argomento, trasformando tutto in dibattito', value: -4 },
  { id: 'r10', text: 'L\'Ick dello Zaino: ha corso per prendere il bus con lo zaino che rimbalzava in modo tragicomico (l\'Ick non perdona)', value: -4 },
  { id: 'r11', text: 'Dietologia non richiesta: commenta cosa stai mangiando o ordina per te "Faccio io, so cosa ti piace"', value: -4 },
  { id: 'r12', text: 'Disastro Tessile: fantasmini bianchi con scarpe scure, o caviglie scoperte in inverno con il mocassino', value: -3 },
  { id: 'r13', text: 'Esibizionista da Palestra: foto degli addominali allo specchio mandate senza che nessuno gliel\'avesse chiesto', value: -3 },

  // Impatto Basso — Fastidi da limare
  { id: 'r14', text: 'Risposte a monosillabi: tu mandi un audio di 2 minuti pieno di gossip e lui risponde "Ahahah ci sta"', value: -2 },
  { id: 'r15', text: 'Stile "Finance Bro" fuori contesto: gilet imbottito da stagista di Wall Street all\'aperitivo con 30 gradi', value: -2 },
  { id: 'r16', text: 'Emoji da Boomer: usa 😂 invece del 💀 o del 😭 per dire che qualcosa fa ridere', value: -2 },
  { id: 'r17', text: 'Nota Vocale molesta: tiene il telefono orizzontale davanti alla bocca come se stesse mangiando un tramezzino', value: -1 },
];

/* ── Etichette di default (con colori) ─────────────────── */
const DEFAULT_LABELS = [
  { text: 'Conoscenza',               color: '#98989f' },
  { text: 'New Entry',                color: '#64d2ff' },
  { text: 'Mr Antipatia',             color: '#ff453a' },
  { text: 'Mr Simpatia',              color: '#30d158' },
  { text: 'Puttana/Puttano',          color: '#ff2d55' },
  { text: 'Da Rivedere',              color: '#ff9f0a' },
  { text: 'Ghosting Autorizzato',     color: '#98989f' },
  { text: 'Fuckboy Alert',            color: '#ff453a' },
  { text: 'Casanova dei Poveri',      color: '#ff9f0a' },
  { text: 'Red Flag Ambulante 🚩',    color: '#ff2d55' },
  { text: 'Potenziale Keeper 💎',     color: '#30d158' },
  { text: 'Golden Retriever Boy 🐕',  color: '#ffd60a' },
  { text: 'Crypto Bro 📈',            color: '#5e5ce6' },
  { text: 'Il Mammone 👩‍👦',            color: '#bf5af2' },
];


/* ── Classe StorageManager ─────────────────────────────── */
class StorageManager {

  constructor() {
    if (!this._get(STORAGE_KEYS.INITIALIZED)) {
      this.seedDefaults();
    } else {
      // Migrate labels dal vecchio formato stringa al nuovo {text,color}
      this._migrateLabels();
    }
  }

  _get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error(`[StorageManager] Errore lettura "${key}":`, e);
      return null;
    }
  }

  _set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`[StorageManager] Errore scrittura "${key}":`, e);
    }
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  seedDefaults() {
    this._set(STORAGE_KEYS.RULES, DEFAULT_RULES);
    this._set(STORAGE_KEYS.LABELS, DEFAULT_LABELS);
    if (!this._get(STORAGE_KEYS.ARCHIVE)) {
      this._set(STORAGE_KEYS.ARCHIVE, []);
    }
    this._set(STORAGE_KEYS.INITIALIZED, true);
  }

  /* ─── Migration: string labels → {text, color} ─────── */
  _migrateLabels() {
    const raw = this._get(STORAGE_KEYS.LABELS);
    if (!Array.isArray(raw) || raw.length === 0) return;
    if (typeof raw[0] === 'string') {
      const migrated = raw.map(l => ({ text: l, color: '#98989f' }));
      this._set(STORAGE_KEYS.LABELS, migrated);
    }
  }

  /* ─── RULES ───────────────────────────────────────────── */

  getRules()        { return this._get(STORAGE_KEYS.RULES) || []; }
  saveRules(rules)  { this._set(STORAGE_KEYS.RULES, rules); }

  addRule(text, value) {
    const rules = this.getRules();
    rules.push({ id: this.generateId(), text, value: parseInt(value, 10) });
    this.saveRules(rules);
    return rules;
  }

  updateRule(id, text, value) {
    const rules = this.getRules();
    const idx = rules.findIndex(r => r.id === id);
    if (idx !== -1) {
      rules[idx] = { ...rules[idx], text, value: parseInt(value, 10) };
      this.saveRules(rules);
    }
    return rules;
  }

  deleteRule(id) {
    const rules = this.getRules().filter(r => r.id !== id);
    this.saveRules(rules);
    return rules;
  }

  /* ─── LABELS ──────────────────────────────────────────── */

  getLabels()         { return this._get(STORAGE_KEYS.LABELS) || []; }
  saveLabels(labels)  { this._set(STORAGE_KEYS.LABELS, labels); }

  addLabel(text, color) {
    const labels = this.getLabels();
    if (!labels.find(l => l.text === text)) {
      labels.push({ text, color: color || '#98989f' });
      this.saveLabels(labels);
    }
    return labels;
  }

  deleteLabel(text) {
    const labels = this.getLabels().filter(l => l.text !== text);
    this.saveLabels(labels);
    return labels;
  }

  getLabelColors() { return LABEL_COLORS; }

  /* ─── ARCHIVE ─────────────────────────────────────────── */

  getArchive() { return this._get(STORAGE_KEYS.ARCHIVE) || []; }

  addToArchive(entry) {
    const archive = this.getArchive();
    archive.unshift({
      id: this.generateId(),
      name: entry.name || 'Sconosciuto/a',
      judges: entry.judges || '',
      score: entry.score,
      label: entry.label || null,   // { text, color } or null
      notes: entry.notes || '',
      selectedRules: entry.selectedRules || [],
      date: new Date().toISOString(),
    });
    this._set(STORAGE_KEYS.ARCHIVE, archive);
    return archive;
  }

  deleteFromArchive(id) {
    const archive = this.getArchive().filter(e => e.id !== id);
    this._set(STORAGE_KEYS.ARCHIVE, archive);
    return archive;
  }

  resetAll() {
    localStorage.removeItem(STORAGE_KEYS.RULES);
    localStorage.removeItem(STORAGE_KEYS.LABELS);
    localStorage.removeItem(STORAGE_KEYS.ARCHIVE);
    localStorage.removeItem(STORAGE_KEYS.INITIALIZED);
    this.seedDefaults();
  }
}

const storage = new StorageManager();
