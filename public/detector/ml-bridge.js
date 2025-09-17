// Απλή γέφυρα μεταξύ score_lightcurve και report/pdf
window.ORAMAX_ML = {
  engine: localStorage.getItem('oramax_engine') || 'bls',
  lastScore: null,  // θα κρατάει {engine, meta, pfold, candidates...}
  setEngine(e) {
    this.engine = (e || 'bls');
    localStorage.setItem('oramax_engine', this.engine);
  },
  rememberScore(resp) {
    // αποθήκευσε μόνο τα χρήσιμα για το PDF
    try {
      this.lastScore = {
        engine: resp.engine || this.engine,
        meta: resp.meta || (resp.candidates && resp.candidates[0] && resp.candidates[0].meta) || null,
        pfold: resp.pfold || null,
        candidates: resp.candidates || null
      };
    } catch (e) {}
  },
  injectIntoPdfPayload(payload) {
    // πρόσθεσε meta/pfold αν υπάρχει CNN result
    const s = this.lastScore || {};
    if (!payload.meta && s && s.meta) payload.meta = s.meta;
    if (!payload.pfold && s && s.pfold) payload.pfold = s.pfold;
    return payload;
  }
};







