
const API_BASE = window.API_BASE;
/* AUTOCOMPLETE_V3 + neighbors bridge (utf8) */
(function () {
  function qs(s) { return document.querySelector(s); }

  async function suggestApi(q) {
    const sSel = document.querySelector('#source,select[name="source"]');
    const source = sSel ? (sSel.value || 'MAST_SPOC') : 'MAST_SPOC';
    const url = `/api/suggest?source=${encodeURIComponent(source)}&q=${encodeURIComponent(q)}`;

    const res = await fetch(url, { cache: 'no-store' });
    const j = await res.json().catch(() => ({ items: [] }));
    const arr = Array.isArray(j.items) ? j.items : [];

    // value = σκέτος αριθμός (για dropdown), label = “TIC <num>”
    return arr.map(it => {
      const id = String(it.id || it.label || '').trim();
      const num = id.replace(/^TIC\s+/i, '').trim();
      const lab = (it.label || id).replace(/^TIC\s+/i, 'TIC ');
      return { value: num, label: lab };
    });
  }

  function ensureDatalist(input) {
    let dl = document.getElementById('suggList');
    if (!dl) {
      dl = document.createElement('datalist');
      dl.id = 'suggList';
      document.body.appendChild(dl);
    }
    input.setAttribute('list', 'suggList');
    return dl;
  }

  function findSearchInput() {
    return document.getElementById('tic')
      || document.querySelector('input[name="tic"]')
      || document.querySelector('input[name="target"]')
      || document.querySelector('input[type="search"]')
      || document.querySelector('input[type="text"]');
  }

  function setupAutocomplete() {
    const el = findSearchInput();
    if (!el) return;

    const dl = ensureDatalist(el);
    let last = '';

    el.addEventListener('input', async () => {
      const s = el.value.trim();
      if (s.length < 2 || s === last) return;
      last = s;
      try {
        const items = await suggestApi(s);
        dl.innerHTML = items
          .map(x => `<option value="${x.value}">${x.label}</option>`)
          .join('');
      } catch (e) {
        console.warn('suggest fail', e);
      }
    });
  }

  // Αν πατηθεί Fetch & Detect και το input είναι σκέτος αριθμός, βάλε “TIC <num>”
  document.addEventListener('click', function (ev) {
    const t = ev.target;
    if (!t) return;
    const text = (t.textContent || '').trim().toLowerCase();
    if (text === 'fetch & detect' || t.id === 'fetch-detect' || t.dataset.role === 'fetch-detect') {
      const inp = findSearchInput();
      if (!inp) return;
      const v = (inp.value || '').trim();
      if (/^\d/.test(v)) inp.value = 'TIC ' + v;
    }
  }, true);

  // Ζωγράφισε Neighbors (table + plot) όταν έρθει αποτέλεσμα detect
  function drawNeighbors(r) {
    const tbl = document.getElementById('neighborsTable');
    const plotEl = document.getElementById('neighborsPlot');
    const n = (r && (r.neighbors || r.nei || {})) || {};

    const tableHtml =
      n.table_html ||
      r.neighbors_table_html ||
      r.neigh_table_html ||
      r.table_html;

    if (tbl && tableHtml) tbl.innerHTML = tableHtml;

    const pts = n.points || r.neighbors_points || r.neigh_points || r.points || [];
    if (plotEl && Array.isArray(pts) && pts.length && typeof Plotly !== 'undefined') {
      Plotly.newPlot(
        plotEl,
        [{ x: pts.map(p => p.sep), y: pts.map(p => p.gmag), mode: 'markers', marker: { size: 6 } }],
        { margin: { t: 10 }, xaxis: { title: 'sep ["]' }, yaxis: { title: 'Gmag' } },
        { displayModeBar: false, responsive: true }
      );
    }
  }

  // Αν υπάρχει ήδη applyDetectResult, τύλιξέ την για να περάσουν οι Neighbors
  const oldApply = window.applyDetectResult;
  window.applyDetectResult = function (r) {
    try { drawNeighbors(r || {}); } catch (e) { /* no-op */ }
    if (typeof oldApply === 'function') return oldApply.apply(this, arguments);
  };

  document.addEventListener('DOMContentLoaded', setupAutocomplete);
})();


function normalizeSuggest(list){
  return (list||[]).map(function(it){
    const title = it.title || it.label || it.text || it.subtitle
      || (it.tic ? ("TIC " + it.tic) : "") || it.value || "";
    const subtitle = it.subtitle || it.note
      || (it.domain && (it.id||it.tic) ? (it.domain + " " + (it.id||it.tic)) : "")
      || "";
    const value = it.value || subtitle || (it.tic ? ("TIC " + it.tic) : "") || title;
    return Object.assign({}, it, { title, subtitle, value });
  });
}
(function(){
  const g = (typeof window!=="undefined") ? window : this;
  if (g && typeof g.renderSuggest === "function"){
    const _orig = g.renderSuggest;
    g.renderSuggest = function(data){
      try{ data = Array.isArray(data && data.items) ? data.items : data; }catch(e){}
      return _orig(normalizeSuggest(data));
    };
  }
})();

