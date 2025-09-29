// === Simple front-end controller for the local API ===
const API = "http://127.0.0.1:8000";

const state = {
  source: "mast_spoc",
  mission: "TESS",
  target: "",
  candidates: [],
  selectedIdx: null,
  lastFetch: null,
  lastPredict: null,
};

function toFixedOrDash(x, n = 2) {
  return (x === null || x === undefined || Number.isNaN(+x)) ? "—" : (+x).toFixed(n);
}

function normalizePhase(ph) {
  // [-0.5,0.5] -> [0,1)
  return ph.map(p => ((p + 1) % 1));
}

// ---------- Plots ----------
function renderLightCurve(time, flux) {
  const trace = { x: time, y: flux, mode: "markers", type: "scattergl", marker: { size: 3 } };
  const layout = {
    margin: { l: 60, r: 10, t: 10, b: 50 },
    xaxis: { title: "Time [BTJD]" },
    yaxis: { title: "Flux" },
  };
  Plotly.react("lcPlot", [trace], layout, { responsive: true });
}

function renderPhaseFold(ph, flux, model) {
  if (!Array.isArray(ph) || !Array.isArray(flux) || ph.length !== flux.length) {
    Plotly.purge("phasePlot");
    return;
  }
  const phase = normalizePhase(ph);
  const idx = Array.from(phase.keys()).sort((a, b) => phase[a] - phase[b]);
  const x = idx.map(i => phase[i]);
  const y = idx.map(i => flux[i]);

  const traces = [{
    x, y, mode: "markers", type: "scattergl", marker: { size: 3 }, name: "data"
  }];

  if (Array.isArray(model) && model.length === flux.length) {
    const m = idx.map(i => model[i]);
    traces.push({ x, y: m, mode: "lines", type: "scatter", name: "model", line: { width: 2 } });
  }

  const layout = {
    margin: { l: 60, r: 10, t: 10, b: 50 },
    xaxis: { title: "Phase [0,1]" },
    yaxis: { title: "Flux" },
    showlegend: false
  };
  Plotly.react("phasePlot", traces, layout, { responsive: true });
}

// ---------- Candidates ----------
function renderCandidates(cands) {
  state.candidates = cands || [];
  state.selectedIdx = null;

  const tbody = document.querySelector("#candsBody");
  if (!tbody) return;

  if (!state.candidates.length) { tbody.innerHTML = ""; return; }

  tbody.innerHTML = state.candidates.map((c, i) => `
    <tr class="cand-row" data-i="${i}">
      <td>${i + 1}</td>
      <td>${toFixedOrDash(c.period, 6)}</td>
      <td>${toFixedOrDash(c.duration, 3)}</td>
      <td>${toFixedOrDash(c.depth, 6)}</td>
      <td>${toFixedOrDash(c.power, 4)}</td>
      <td>${toFixedOrDash(c.p_planet, 3)}</td>
      <td>${toFixedOrDash(c.snr, 2)}</td>
      <td>${toFixedOrDash(c.delta_bic, 1)}</td>
      <td>${toFixedOrDash(c.odd_even_delta_ppm, 0)}</td>
      <td>${c.secondary ? "Yes" : "No"}</td>
      <td>${c.centroid_ok === true ? "✓" : c.centroid_ok === false ? "✗" : "—"}</td>
    </tr>
  `).join("");

  tbody.onclick = async (ev) => {
    const tr = ev.target.closest("tr.cand-row");
    if (!tr) return;
    await selectCandidate(+tr.dataset.i);
  };
}

async function selectCandidate(i) {
  document.querySelectorAll("#candsBody tr").forEach(tr => tr.classList.remove("selected"));
  const selTr = document.querySelector(`#candsBody tr[data-i="${i}"]`);
  if (selTr) selTr.classList.add("selected");

  state.selectedIdx = i;
  const c = state.candidates[i];
  if (!c) return;

  const body = {
    source: state.source,
    mission: state.mission,
    target: state.target,
    period: +c.period,
    duration: +c.duration,
    t0: +c.t0
  };

  const res = await fetch(`${API}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const pred = await res.json();
  state.lastPredict = pred;

  renderPhaseFold(pred.phase, pred.flux, pred.model);
}

async function onFitSelected() {
  if (state.selectedIdx == null) {
    if (state.candidates.length) await selectCandidate(0);
    return;
  }
  await selectCandidate(state.selectedIdx);
}

// ---------- Neighbors ----------
function renderNeighborsBlock(neigh) {
  const tbody = document.querySelector("#neighborsBody");
  if (!tbody) return;
  if (!neigh || !neigh.available || !Array.isArray(neigh.items)) { tbody.innerHTML = ""; return; }
  const rows = [...neigh.items].sort((a,b)=>(a.sep_arcsec||1e9)-(b.sep_arcsec||1e9));
  tbody.innerHTML = rows.map(r => `
    <tr>
      <td>${toFixedOrDash(r.sep_arcsec,2)}</td>
      <td>${toFixedOrDash(r.Gmag,2)}</td>
      <td>${toFixedOrDash(r.BP_RP,2)}</td>
    </tr>
  `).join("");
}

// ---------- Fetch ----------
async function onFetchAndDetect() {
  const target = document.querySelector("#target").value.trim();
  if (!target) return;

  state.target = target;

  const body = {
    source: state.source,
    mission: state.mission,
    target,
    kpeaks: 3,
    detrend: "flatten",
    remove_outliers: true,
    pplanet_threshold: 0.3,
    neighbors: true,
    neighbors_radius: 60
  };

  const res = await fetch(`${API}/fetch_detect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    console.error("fetch_detect HTTP", res.status, await res.text());
    return;
  }

  const data = await res.json();
  state.lastFetch = data;

  if (Array.isArray(data.time) && Array.isArray(data.flux)) renderLightCurve(data.time, data.flux);
  if (data.pfold && Array.isArray(data.pfold.phase)) renderPhaseFold(data.pfold.phase, data.pfold.flux, data.pfold.model);
  else Plotly.purge("phasePlot");

  renderCandidates(data.candidates || []);
  renderNeighborsBlock(data.neighbors);
}

// Expose
window.onFetchAndDetect = onFetchAndDetect;
window.onFitSelected = onFitSelected;









