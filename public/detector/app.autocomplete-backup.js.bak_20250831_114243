/* injected: API_BASE for JS */
const API_BASE = (typeof window!=="undefined" && window.API_BASE)
  ? window.API_BASE
  : ((location && location.hostname==="api.oramax.space")
      ? "/exoplanet/api"
      : "https://api.oramax.space/exoplanet/api");
/* Exoplanet Detector  static UI glue (autocomplete, fetch&detect, plots, table)
   Works with Next/Vercel rewrites at /api/<api_prefix>/...
*/
(() => {
  const S = {
    base: "/api",        // will become "/api" + api_prefix from /api/health
    prefix: "",          // e.g. "/exoplanet"
    get root() { return this.base + (this.prefix || ""); },
    busy: false,
    lastDetect: null,
  };

  // ---------- tiny DOM helpers ----------
  const $  = (q) => document.querySelector(q);
  const $$ = (q) => Array.from(document.querySelectorAll(q));
  const val = (id) => (document.getElementById(id)?.value ?? "").trim();
  const num = (id, d=0) => {
    const x = parseFloat(val(id));
    return Number.isFinite(x) ? x : d;
  };
  const bool = (id) => !!document.getElementById(id)?.checked;
  const fmt = (x, n=3) => (x==null || x==="") ? "" : Number(x).toFixed(n);

  const endpoint = (p) => `${S.root}${p}`;
  const jsonPost = async (p, body) => {
    const r = await fetch(endpoint(p), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body ?? {}),
    });
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    return r.json();
  };

  // ---------- health -> discover api_prefix ----------
  async function initHealth() {
    try {
      const r = await fetch("/api/health");
      const j = await r.json();
      S.prefix = j.api_prefix || "/exoplanet";
      const out = $("#healthOut");
      if (out) out.value = JSON.stringify(j);
      const dot = $("#healthDot");
      if (dot) dot.textContent = j.ok ? "OK" : "ERR";
    } catch (e) {
      console.warn("health error", e);
    }
  }

  // ---------- autocomplete (datalist) ----------
  function ensureDatalist() {
    let dl = document.getElementById("ticList");
    if (!dl) {
      dl = document.createElement("datalist");
      dl.id = "ticList";
      const input = $("#tic");
      if (input) input.setAttribute("list", "ticList");
      input?.insertAdjacentElement("afterend", dl);
    }
    return dl;
  }

  async function runSuggest(q) {
    if (!q || q.length < 2) return;
    try {
      const r = await fetch(endpoint("/suggest") + `?q=${encodeURIComponent(q)}`);
      const j = await r.json();
      const items = (j.items || j.suggestions || [])
        .map(it => {
          if (typeof it === "string") return it;
          return it.label || it.name || it.title || it.id || it.tic || "";
        })
        .filter(Boolean);
      const dl = ensureDatalist();
      dl.innerHTML = "";
      items.slice(0, 30).forEach(s => {
        const opt = document.createElement("option");
        opt.value = s;
        dl.appendChild(opt);
      });
    } catch (e) {
      console.warn("suggest error", e);
    }
  }

  function wireAutocomplete() {
    const input = $("#tic");
    if (!input) return;
    input.addEventListener("input", () => runSuggest(input.value));
    input.addEventListener("focus", () => runSuggest(input.value));
  }

  // ---------- gather form controls ----------
  function gatherPayload() {
    return {
      target: val("tic"),

      // Source/Mission/Processing
      source:        val("sourceSel"),
      mission:       val("missionSel"),
      k_peaks:       parseInt(val("kpeaks") || "3", 10),
      detrend:       val("detrendSel"),
      quality_mask:  bool("qualityChk"),
      remove_outliers: bool("outlierChk"),
      sigma_clip:    num("sigmaVal", 5),

      // Vetting thresholds
      p_thr:               num("thr", 0.80),
      centroid_sigma_thr:  num("sigmaThr", 3.0),
      rho_thr:             num("rhoThr", 0.15),
      gaia_radius_arcsec:  num("gaiaRad", 3.0),

      // optional toggles
      centroid_vetting: bool("centroidChk"),
      gaia_neighbors:   bool("gaiaChk"),
    };
  }

  // ---------- plots ----------
  function plotLC(x, y) {
    const el = $("#lc");
    if (!el || !window.Plotly) return;
    const data = [{ x, y, mode: "markers", type: "scattergl", marker: { size: 4 } }];
    const layout = { margin: { t: 10 }, xaxis: { title: "Time" }, yaxis: { title: "Flux" } };
    Plotly.newPlot(el, data, layout, {displayModeBar:false, responsive:true});
  }

  function plotPhaseFolded(phaseX, phaseY) {
    const el = $("#pf");
    if (!el || !window.Plotly) return;
    const data = [{ x: phaseX, y: phaseY, mode: "markers", type: "scattergl", marker: { size: 4 } }];
    const layout = { margin: { t: 10 }, xaxis: { title: "Phase" }, yaxis: { title: "Flux" } };
    Plotly.newPlot(el, data, layout, {displayModeBar:false, responsive:true});
  }

  // ---------- table ----------
  function renderCandidates(list) {
    const tbl = $("#candTable");
    if (!tbl) return;
    const hdr = `
      <thead>
        <tr><th>#</th><th>Period (d)</th><th>Duration (d)</th><th>Depth</th><th>Power</th></tr>
      </thead>
    `;
    const rows = (list || []).map((c, i) => {
      const P = c.period ?? c.P;
      const D = c.duration ?? c.D;
      const depth = c.depth ?? c.depth_ppm ?? c.depth_frac ?? "";
      const pow = c.power ?? c.SDE ?? c.snr ?? "";
      const bg = c.vetted ? ' style="background:#eaffea"' : "";
      return `<tr data-idx="${i}"${bg}><td>${i+1}</td><td>${fmt(P,6)}</td><td>${fmt(D,5)}</td><td>${depth}</td><td>${pow}</td></tr>`;
    }).join("");
    tbl.innerHTML = hdr + `<tbody>${ rows || `<tr><td colspan="5">No candidates yet. Try Fetch & Detect.</td></tr>` }</tbody>`;

    // click to select candidate (if phase-folded series exists in API result)
    $$(`#candTable tbody tr`).forEach(tr => {
      tr.addEventListener("click", () => {
        const idx = parseInt(tr.getAttribute("data-idx") || "0", 10);
        const c = (S.lastDetect?.candidates || [])[idx];
        const ph = c?.phase || c?.phase_x || c?.x || null;
        const fy = c?.flux  || c?.phase_y || c?.y || null;
        if (ph && fy) plotPhaseFolded(ph, fy);
      });
    });
  }

  // ---------- result unification ----------
  function extractLC(r) {
    // Accept: {lc:{time,flux}} or {lc:{x,y}} or {time,flux}
    const lc = r.lc || r.lightcurve || r;
    const x = lc.time || lc.t || lc.x || [];
    const y = lc.flux || lc.y || [];
    return { x, y };
  }

  // ---------- actions ----------
  async function onFetchDetect() {
    if (S.busy) return;
    const btn = $("#fetchBtn");
    try {
      S.busy = true;
      if (btn) { btn.disabled = true; btn.textContent = "Working..."; }

      const payload = gatherPayload();
      const r = await jsonPost("/fetch_detect", payload);
      S.lastDetect = r;

      // Light Curve (raw)
      const { x, y } = extractLC(r);
      if (x?.length && y?.length) plotLC(x, y);

      // Candidates
      renderCandidates(r.candidates || r.cands || []);

      // Phase-folded if given at top-level
      if (r.phase?.x && r.phase?.y) plotPhaseFolded(r.phase.x, r.phase.y);

    } catch (e) {
      console.error("fetch_detect error", e);
      alert("fetch_detect failed: " + e.message);
    } finally {
      S.busy = false;
      if (btn) { btn.disabled = false; btn.textContent = "Fetch & Detect"; }
    }
  }

  // ---------- init ----------
  function wireUI() {
    $("#fetchBtn")?.addEventListener("click", onFetchDetect);

    // live labels for sliders
    const binds = [
      ["thr",       "#thrVal"],
      ["sigmaThr",  "#sigmaLabel"],
      ["rhoThr",    "#rhoLabel"],
      ["gaiaRad",   "#gaiaLabel"],
      ["sigmaVal",  "#sigmaOut"],
    ];
    binds.forEach(([id, sel]) => {
      const el = document.getElementById(id), out = document.querySelector(sel);
      if (el && out) {
        const upd = () => (out.textContent = el.value);
        el.addEventListener("input", upd); upd();
      }
    });
  }

  window.addEventListener("DOMContentLoaded", async () => {
    await initHealth();
    wireAutocomplete();
    wireUI();
  });
})();

/* injected: normalizeSuggest + renderSuggest wrapper */
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