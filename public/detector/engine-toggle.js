/* OramaX engine toggle + GAIA safe fetch */
(function(){
  function ensureEngineUI(){
    if (document.getElementById("engineSelect")) return;
    var box = document.createElement("div");
    box.id = "oramax-topright";
    box.style.position = "fixed"; box.style.top = "12px"; box.style.right = "12px";
    box.style.zIndex = "1000"; box.style.background = "rgba(11,16,32,0.92)";
    box.style.color = "#fff"; box.style.padding = "6px 10px"; box.style.border = "1px solid #223";
    box.style.borderRadius = "8px"; box.style.display = "flex"; box.style.alignItems = "center";
    box.style.gap = "8px"; box.style.boxShadow = "0 2px 10px rgba(0,0,0,0.35)";
    var label = document.createElement("label");
    label.setAttribute("for","engineSelect"); label.textContent = "Method"; label.style.fontSize = "12px"; label.style.opacity = "0.85";
    var sel = document.createElement("select"); sel.id = "engineSelect"; sel.style.padding = "4px 8px"; sel.style.fontSize = "12px";
    var optB = document.createElement("option"); optB.value = "bls"; optB.textContent = "BLS";
    var optC = document.createElement("option"); optC.value = "cnn"; optC.textContent = "CNN";
    sel.appendChild(optB); sel.appendChild(optC);
    var KEY = "oramax_engine"; var init = localStorage.getItem(KEY) || "bls"; sel.value = init;
    sel.addEventListener("change", function __fix__(){
      localStorage.setItem(KEY, sel.value);
      window.dispatchEvent(new CustomEvent("oramax-engine-change", { detail: { engine: sel.value } }));
    });
    box.appendChild(label); box.appendChild(sel); document.body.appendChild(box);
  }

  var origFetch = window.fetch.bind(window);
  window.lastMeta = window.lastMeta || {}; window.lastPfold = window.lastPfold || {};
  window.lastPreprocess = window.lastPreprocess || {}; window.lastCandidates = window.lastCandidates || [];
  window.lastNeighbors = window.lastNeighbors || {};

  function _isML(url){ return /\/ml\/score_lightcurve\b/.test(url); }
  function _isPDF(url){ return /\/report_pdf\b|\/report\/pdf\b/.test(url); }
  function _isGaia(url){ return /\/gaia_neighbors\b/.test(url); }

  function normalizeGaiaUrl(uStr){
    // 1) φτιάξε absolute URL για το SW scope
    if (/^detector\/api\/gaia_neighbors\b/.test(uStr)) uStr = "/" + uStr;
    var u = new URL(uStr, location.origin);

    // 2) Αν δείχνει απευθείας στο fly.dev -> ξαναστείλ’ το στο SW route
    if (/oramax-exoplanet-api\.fly\.dev\/exoplanet\/gaia_neighbors\b/.test(u.href)) {
      var repl = new URL("/detector/api/gaia_neighbors", location.origin);
      u.searchParams.forEach((v,k)=>repl.searchParams.set(k,v));
      u = repl;
    }

    // 3) Αν κατά λάθος έγινε /detector/detector/api/... καθάρισέ το
    u.pathname = u.pathname.replace(/\/detector\/(?:detector\/)+/g, "/detector/");
    return u.toString();
  }

  function extractGaiaParams(uStr){
    var u = new URL(uStr, location.origin);
    return {
      target: u.searchParams.get("target") || u.searchParams.get("tic") || "",
      radius: Number(u.searchParams.get("radius") || "60") || 60
    };
  }

  async function gaiaFallbackViaDetect(target, radius){
    var API = (window.API_BASE || "https://oramax-exoplanet-api.fly.dev/exoplanet");
    var body = JSON.stringify({
      source: 'mast_spoc', mission: 'TESS', target,
      kpeaks: 0, detrend: 'none', quality: false, remove_outliers: false,
      neighbors: true, neighbors_radius: radius, centroid: false
    });
    var r = await origFetch(API + "/fetch_detect", {
      method: "POST", headers: { "Content-Type": "application/json" }, body
    });
    if (!r.ok) throw new Error("HTTP " + r.status);
    var j = await r.json();
    var nei = j.neighbors || j;
    var items = Array.isArray(nei) ? nei : (nei && Array.isArray(nei.items) ? nei.items : []);
    return { available: items.length > 0, radius_arcsec: (nei.radius_arcsec || radius), items, reason: items.length?undefined:"empty" };
  }

  window.fetch = async function(url, options){
    try{
      var isStr = typeof url === "string";
      if(!isStr) return origFetch(url, options);

      var isML = _isML(url);
      var isPDF = _isPDF(url);
      var isGaia = _isGaia(url);

      // inject engine στο ML
      if (isML && options && typeof options.body === "string") {
        var sel = document.getElementById("engineSelect");
        var engine = sel ? sel.value : (localStorage.getItem("oramax_engine") || "bls");
        try{
          var payload = JSON.parse(options.body||"{}");
          payload.engine = engine;
          options.body = JSON.stringify(payload);
        }catch(e){}
      }

      // --- GAIA: canonicalize URL ώστε να περνάει από τον SW ---
      if (isGaia) {
        url = normalizeGaiaUrl(url);
      }

      var resp = await origFetch(url, options);

      // --- GAIA: αν 404 ή άλλο σφάλμα, κάνε Fallback μέσω /fetch_detect ---
      if (isGaia && (!resp || !resp.ok)) {
        try{
          var p = extractGaiaParams(url);
          var safe = await gaiaFallbackViaDetect(p.target, p.radius);
          // ενημέρωσε και τα "τελευταία" για PDF enrichment
          window.lastNeighbors = safe;
          return new Response(JSON.stringify(safe), {
            status: 200, headers: { "Content-Type": "application/json", "X-Oramax-Client": "gaia-fallback" }
          });
        }catch(e){}
      }

      // αποθήκευση ML αποτελεσμάτων
      if (isML) {
        try{
          var data = await resp.clone().json();
          window.lastMeta       = data.meta || {};
          window.lastPfold      = data.pfold || {};
          window.lastPreprocess = data.preprocess || {};
          window.lastCandidates = data.candidates || [];
          window.lastNeighbors  = data.neighbors || {};
        }catch(e){}
      }

      // εμπλουτισμός PDF body (αν πάει server-side)
      if (isPDF && options && typeof options.body === "string") {
        try{
          var p2 = JSON.parse(options.body||"{}");
          p2.meta       = window.lastMeta       || p2.meta       || {};
          p2.pfold      = window.lastPfold      || p2.pfold      || {};
          p2.preprocess = window.lastPreprocess || p2.preprocess || {};
          p2.candidates = window.lastCandidates || p2.candidates || [];
          p2.neighbors  = window.lastNeighbors  || p2.neighbors  || {};
          options.body = JSON.stringify(p2);
        }catch(e){}
      }

      return resp;
    } finally {
      ensureEngineUI();
    }
  };

  document.addEventListener("DOMContentLoaded", ensureEngineUI);
})();
console.log("engine-toggle (paths+top-right) loaded");
