(function(){
  function ensureEngineUI(){
    var controls = document.querySelector("#detector-controls") || document.body;
    if (document.getElementById("engineSelect")) return;
    var row = document.createElement("div");
    row.style.marginTop = "8px";
    row.innerHTML = '<label for="engineSelect" style="margin-right:8px">Method:</label>\
<select id="engineSelect"><option value="bls" selected>BLS</option><option value="cnn">CNN</option></select>';
    controls.appendChild(row);
  }

  var origFetch = window.fetch.bind(window);
  window.lastMeta = window.lastMeta || {};
  window.lastPfold = window.lastPfold || {};
  window.lastPreprocess = window.lastPreprocess || {};
  window.lastCandidates = window.lastCandidates || [];
  window.lastNeighbors = window.lastNeighbors || {};

  window.fetch = async function(url, options){
    try {
      var isStr = (typeof url === "string");
      if (isStr) {
        var isML  = url.indexOf("/exoplanet/ml/score_lightcurve") !== -1;
        var isPDF = url.indexOf("/exoplanet/report/pdf") !== -1;

        // inject engine into ML request
        if (isML && options && typeof options.body === "string") {
          var sel = document.getElementById("engineSelect");
          var engine = sel ? sel.value : "bls";
          try {
            var payload = JSON.parse(options.body || "{}");
            payload.engine = engine;
            options.body = JSON.stringify(payload);
          } catch(e){}
        }

        var resp = await origFetch(url, options);

        // capture ML response for PDF enrichment
        if (isML) {
          try {
            var cloned = resp.clone();
            var data = await cloned.json();
            window.lastMeta       = data.meta || {};
            window.lastPfold      = data.pfold || {};
            window.lastPreprocess = data.preprocess || {};
            window.lastCandidates = data.candidates || [];
            window.lastNeighbors  = data.neighbors || {};
          } catch(e){}
        }

        // enrich PDF body
        if (isPDF && options && typeof options.body === "string") {
          try {
            var payload2 = JSON.parse(options.body || "{}");
            payload2.meta       = window.lastMeta       || payload2.meta       || {};
            payload2.pfold      = window.lastPfold      || payload2.pfold      || {};
            payload2.preprocess = window.lastPreprocess || payload2.preprocess || {};
            payload2.candidates = window.lastCandidates || payload2.candidates || [];
            payload2.neighbors  = window.lastNeighbors  || payload2.neighbors  || {};
            options.body = JSON.stringify(payload2);
          } catch(e){}
        }

        return resp;
      }
      return origFetch(url, options);
    } finally {
      ensureEngineUI();
    }
  };

  document.addEventListener("DOMContentLoaded", ensureEngineUI);
})();

console.log('engine-toggle loaded');








