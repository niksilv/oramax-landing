// ===== API base (LOCAL + PROD) =====
const API_BASE = window.API_BASE;        // production host (χωρίς extra /api)

// ---------- Helpers ----------
function parseTxt(text){
  const lines = text.trim().split(/\r?\n/);
  const T=[], F=[];
  for(const line of lines){
    const [a,b] = line.trim().split(/[ ,\t]+/);
    if(!a || !b) continue;
    const t = parseFloat(a), f = parseFloat(b);
    if(Number.isFinite(t) && Number.isFinite(f)){ T.push(t); F.push(f); }
  }
  return [T,F];
}
function phaseFold(time, flux, period, t0){
  const folded = time.map((t,i)=>({x:(((t - t0 + 1e6*period)%period)/period), y:flux[i]}));
  folded.sort((a,b)=>a.x-b.x);
  return folded;
}
function shadedShapes(intervals){
  if(!intervals) return [];
  return intervals.map(iv => ({type:'rect', xref:'x', yref:'paper', x0:iv[0], x1:iv[1], y0:0, y1:1, fillcolor:'rgba(0,0,0,0.08)', line:{width:0}}));
}
function renderLC(T, F, intervals){
  if (typeof Plotly === 'undefined') return;
  Plotly.newPlot('lc',[{x:T, y:F, mode:'markers', marker:{size:3}}], {margin:{t:10}, shapes: shadedShapes(intervals)});
}
function centroidBadge(cent, sigmaThr, rhoThr){
  if(!cent || !cent.available) return '';
  const sig = cent.sigma, rho = cent.rho_flux_centroid;
  const beb = (Number.isFinite(sig) && sig >= sigmaThr) && (!Number.isFinite(rho) || rho >= rhoThr);
  return beb ? '<span class="badge badge-beb">BEB</span>' : '<span class="badge badge-ok">OK</span>';
}
function renderCentroidInfo(cent, sigmaThr, rhoThr){
  const el = document.getElementById('centroidBox');
  if(!el) return;
  if(!cent){ el.textContent = ''; return; }
  if(!cent.available){
    el.textContent = `Centroid: ${cent.reason || 'n/a'}`;
    return;
  }
  const parts = [];
  if (Number.isFinite(cent.dr_pix))  parts.push(`Δr = ${cent.dr_pix.toFixed(3)} px`);
  if (Number.isFinite(cent.sigma))   parts.push(`σ = ${cent.sigma.toFixed(2)} (thr ${sigmaThr.toFixed(2)})`);
  if (Number.isFinite(cent.rho_flux_centroid)) parts.push(`ρ = ${cent.rho_flux_centroid.toFixed(2)} (thr ${rhoThr.toFixed(2)})`);
  const txt = parts.join(', ');
  const badge = centroidBadge(cent, sigmaThr, rhoThr);
  el.innerHTML = `Centroid: ${txt} ${badge ? '  ' + badge : ''}`;
}
function renderNeighbors(nei){
  const info = document.getElementById('neighborsInfo');
  const tbl  = document.querySelector('#neighborsTbl tbody');
  const plot = document.getElementById('neighborsPlot');
  if(!info || !tbl || !plot || typeof Plotly === 'undefined') return;

  if(!nei || !nei.available){
    info.textContent = nei?.reason ? ('Gaia: ' + nei.reason) : 'Gaia: n/a';
    tbl.innerHTML=''; Plotly.purge('neighborsPlot'); return;
  }
  const items = nei.items || [];
  const rad = Number(nei.radius_arcsec || 60);
  info.textContent = `radius ${rad}"  ${items.length} sources (circle = 21" TESS pixel)`;
  tbl.innerHTML = '';
  items.slice(0,80).forEach(r=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.sep_arcsec.toFixed(1)}</td><td>${(r.Gmag??'').toString()}</td><td>${(Number.isFinite(r.BP_RP)?r.BP_RP.toFixed(2):'')}</td>`;
    tbl.appendChild(tr);
  });
  const x = items.map(r=>r.dx_arcsec), y = items.map(r=>r.dy_arcsec), s = items.map(r=>Math.max(6, 12 - 0.8*((r.Gmag??15)-10)));
  Plotly.newPlot('neighborsPlot',[
    {x:[0], y:[0], mode:'markers+text', text:['target'], textposition:'top center', marker:{size:10, symbol:'x'}},
    {x:x, y:y, mode:'markers', marker:{size:s}}
  ],{
    margin:{t:10}, xaxis:{title:'East ["]'}, yaxis:{title:'North ["]', scaleanchor:'x', scaleratio:1},
    shapes:[
      {type:'circle',xref:'x',yref:'y',x0:-21,y0:-21,x1:21,y1:21, line:{dash:'dot'}},
      {type:'circle',xref:'x',yref:'y',x0:-rad,y0:-rad,x1:rad,y1:rad, line:{dash:'solid'}}
    ]
  });
}

// ---------- State ----------
let lcTime=[], lcFlux=[], lastcandTable=[], currentTarget='(Uploaded TXT)';
let selectedIdx = 0;
let lastFit = null;
let lastNeighbors = null;
let lastPreproc = null;

// ---------- Threshold helpers ----------
function getThreshold(){ return Math.min(0.99, Math.max(0.5, Number(document.getElementById('thr')?.value || 0.8))); }
function setThrLabel(){ const el = document.getElementById('thrLabel'); if(el) el.textContent = getThreshold().toFixed(2); }
function getSigmaThr(){ return Number(document.getElementById('sigmaThr')?.value || 3.0); }
function getRhoThr(){   return Number(document.getElementById('rhoThr')?.value   || 0.15); }
function setCentroidThrLabels(){
  const s = document.getElementById('sigmaThrLabel'); if(s) s.textContent = getSigmaThr().toFixed(2);
  const r = document.getElementById('rhoThrLabel');   if(r) r.textContent = getRhoThr().toFixed(2);
}
function getNeighborsFlag(){ return !!document.getElementById('gaiaChk')?.checked; }
function getNeighborsRadius(){ return Number(document.getElementById('neiRadius')?.value || 60); }
function setNeighborsLabel(){ const el = document.getElementById('neiRadiusLabel'); if(el) el.textContent = getNeighborsRadius(); }
function updateVetCount(){
  const thr = getThreshold();
  const k = (lastcandTable||[]).filter(c=> (c?.probability ?? 0) >= thr).length;
  const n = (lastcandTable||[]).length;
  const el = document.getElementById('vetCount'); if(el) el.textContent = n ? ` vetted: ${k}/${n}` : '';
}

// ---------- Phase plot (with optional model overlay) ----------
function phaseFoldedTrace(T, F, cand){
  const folded = phaseFold(T, F, cand.period, cand.t0);
  return {x: folded.map(d=>d.x), y: folded.map(d=>d.y)};
}
function renderPF(T, F, cand){
  if (typeof Plotly === 'undefined') return;
  if(!cand) { Plotly.purge('pf'); return; }
  const pf = phaseFoldedTrace(T, F, cand);
  const traces = [{x: pf.x, y: pf.y, mode:'markers', marker:{size:3}, name:'data'}];
  if(lastFit && Math.abs(lastFit.params.period - cand.period) < 1e-6){
    const mf = lastFit.model_curve;
    const mfold = phaseFold(mf.time, mf.flux, lastFit.params.period, lastFit.params.t0);
    traces.push({x: mfold.map(d=>d.x), y: mfold.map(d=>d.y), mode:'lines', line:{width:2}, name:'model'});
  }
  Plotly.newPlot('pf', traces, {xaxis:{title:'Phase [0,1)'}, margin:{t:10}});
}

// ---------- Table rendering ----------
function renderTable(candidates){
  const tbody = document.querySelector('#candTable tbody, #cands tbody'); if(!tbody) return; tbody.innerHTML='';
  const thr = getThreshold(), sThr = getSigmaThr(), rThr = getRhoThr();
  candidates.forEach((c, i)=>{
    const tr = document.createElement('tr'); tr.className = 'clickable'; tr.dataset.idx = i;
    if ((c?.probability ?? 0) >= thr) tr.classList.add('vetted');
    const snr  = (c.fit && Number.isFinite(c.fit.snr)) ? c.fit.snr.toFixed(1) : '';
    const dbic = (c.fit && Number.isFinite(c.fit.delta_bic)) ? c.fit.delta_bic.toFixed(1) : '';
    const badge = centroidBadge(c.centroid, sThr, rThr);
    tr.innerHTML = `<td>${i+1}</td><td>${c.period.toFixed(6)}</td><td>${c.duration.toFixed(6)}</td>
                    <td>${(+c.depth).toExponential(2)}</td><td>${c.power.toFixed(3)}</td>
                    <td class='prob'>${(100*c.probability).toFixed(1)}%</td>
                    <td>${snr}</td><td>${dbic}</td>
                    <td>${Math.round(c.vetting.odd_even_diff_ppm)}</td>
                    <td>${c.vetting.has_secondary_like ? 'Yes' : 'No'}</td>
                    <td>${badge}</td>`;
    tr.onclick = ()=> selectCandidate(i);
    tbody.appendChild(tr);
  });
  updateVetCount();
}{
  const tbody = document.querySelector('#candTable tbody'); if(!tbody) return; tbody.innerHTML='';
  const thr = getThreshold(), sThr = getSigmaThr(), rThr = getRhoThr();
  candidates.forEach((c, i)=>{
    const tr = document.createElement('tr'); tr.className = 'clickable'; tr.dataset.idx = i;
    if ((c?.probability ?? 0) >= thr) tr.classList.add('vetted');
    const snr  = (c.fit && Number.isFinite(c.fit.snr)) ? c.fit.snr.toFixed(1) : '';
    const dbic = (c.fit && Number.isFinite(c.fit.delta_bic)) ? c.fit.delta_bic.toFixed(1) : '';
    const badge = centroidBadge(c.centroid, sThr, rThr);
    tr.innerHTML = `<td>${i+1}</td><td>${c.period.toFixed(6)}</td><td>${c.duration.toFixed(6)}</td>
                    <td>${(+c.depth).toExponential(2)}</td><td>${c.power.toFixed(3)}</td>
                    <td class='prob'>${(100*c.probability).toFixed(1)}%</td>
                    <td>${snr}</td><td>${dbic}</td>
                    <td>${Math.round(c.vetting.odd_even_diff_ppm)}</td>
                    <td>${c.vetting.has_secondary_like ? 'Yes' : 'No'}</td>
                    <td>${badge}</td>`;
    tr.onclick = ()=> selectCandidate(i);
    tbody.appendChild(tr);
  });
  updateVetCount();
}
function selectCandidate(i){
  selectedIdx = i;
  const cand = lastcandTable[i];
  renderPF(lcTime, lcFlux, cand);
  renderLC(lcTime, lcFlux, cand?.windows ? cand.windows.intervals : []);
  renderCentroidInfo(cand?.centroid, getSigmaThr(), getRhoThr());
  const box = document.getElementById('fitBox'); if(box) box.style.display='none';
  lastFit = null;
}
function renderAll(T, F, candidates, neighbors){
  lcTime=T; lcFlux=F; lastcandTable=candidates||[]; selectedIdx=0;
  lastNeighbors = neighbors || null;
  renderLC(T,F, lastcandTable[0]?.windows?.intervals || []);
  renderPF(T,F, lastcandTable[0]);
  renderCentroidInfo(lastcandTable[0]?.centroid, getSigmaThr(), getRhoThr());
  renderTable(lastcandTable);
  renderNeighbors(neighbors);
}

// ---------- Source toggle ----------
function toggleInputs(){
  const src = document.getElementById('sourceSel')?.value || 'mast_spoc';
  const tic = document.getElementById('tic') || document.getElementById('ticInput');
  const url = document.getElementById('urlInput');
  if (src === 'url'){
    if (tic) tic.style.display = 'none';
    if (url) url.style.display = 'inline-block';
  } else {
    if (tic) tic.style.display = 'inline-block';
    if (url) url.style.display = 'none';
  }
} else {
    if (tic) tic.style.display = 'inline-block';
    if (url) url.style.display = 'none';
  }
}

// ---------- Fetch & Detect ----------
async function fetchBtn(){
  const status = document.getElementById('status');
  try{
    if(status) status.textContent = 'Fetching...';

    const source  = document.getElementById('sourceSel')?.value || 'mast_spoc';   // mast_spoc | mast_qlp | url
    const missionRaw = document.getElementById('missionSel')?.value || 'auto';
    const mission = (missionRaw === 'auto') ? undefined : missionRaw;

    const ticEl   = document.getElementById('tic') || document.getElementById('ticInput');
    const target  = (ticEl?.value || '').trim();
    const urlVal  = (document.getElementById('urlInput')?.value || '').trim();
    const url     = (source === 'url') ? urlVal : '';

    if (source !== 'url' && !target){
      if(status) status.textContent=''; alert('Δώσε ένα TIC/target.'); return;
    }

    const kpeaks  = Number(document.getElementById('kpeaks')?.value || 3);
    const detrend = document.getElementById('detrendSel')?.value || 'flatten';
    const quality = !!document.getElementById('qualityChk')?.checked;
    const remove_outliers = !!document.getElementById('outlierChk')?.checked;
    const sigma   = Number(document.getElementById('sigmaVal')?.value || 5);
    const centroid= !!document.getElementById('centroidChk')?.checked;

    const neighbors = getNeighborsFlag?.() ?? !!document.getElementById('gaiaChk')?.checked;
    const neighbors_radius = getNeighborsRadius?.() ?? Number(document.getElementById('neiRadius')?.value || 60);

    const payload = { source, target, url, kpeaks, detrend, quality, remove_outliers, sigma, centroid, neighbors, neighbors_radius };
    if (mission !== undefined) payload.mission = mission;

    const res = await fetch(`${API_BASE}/fetch_detect`, {
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)
    });

    let data = null; try { data = await res.json(); } catch { data = null; }
    if(!res.ok || (data && data.error)){
      const msg = (data && (data.detail || data.error)) || `fetch_detect failed: ${res.status}`;
      throw new Error(msg);
    }
    if(!data) throw new Error('Empty response');

    // *** ΝΕΟΙ ΕΛΕΓΧΟΙ: δεν προχωράμε αν δεν έχει έρθει τίποτα χρήσιμο ***
    if (!Array.isArray(data.time) || data.time.length === 0)
      throw new Error('No light curve returned (time array empty).');

    if (!Array.isArray(data.flux) || data.flux.length === 0)
      throw new Error('No light curve returned (flux array empty).');

    // candidates μπορεί να είναι άδειο χωρίς να είναι σφάλμα, αλλά ενημέρωσε τον χρήστη
    if (!Array.isArray(data.candidates)) data.candidates = [];

    currentTarget = data.target || target || urlVal;
    lastPreproc   = data.preprocess || null;

    renderAll(data.time, data.flux, data.candidates, data.neighbors);

    if (data.candidates.length === 0) {
      if(status) status.textContent = 'Done (no candidates)';
    } else {
      if(status) status.textContent = 'Done';
    }
  } catch(e){
    if(status) status.textContent = 'Error';
    console.error(e);
    alert(e.message || 'fetch failed');
  }
}

    const kpeaks  = Number(document.getElementById('kpeaks')?.value || 3);
    const detrend = document.getElementById('detrendSel')?.value || 'flatten';
    const quality = !!document.getElementById('qualityChk')?.checked;
    const remove_outliers = !!document.getElementById('outlierChk')?.checked;
    const sigma   = Number(document.getElementById('sigmaVal')?.value || 5);
    const centroid= !!document.getElementById('centroidChk')?.checked;

    const neighbors = getNeighborsFlag();
    const neighbors_radius = getNeighborsRadius();

    const body = JSON.stringify({ source, mission, target, url, kpeaks, detrend, quality, remove_outliers, sigma, centroid, neighbors, neighbors_radius });
    const res = await fetch(`${API_BASE}/fetch_detect`, { method:'POST', headers:{'Content-Type':'application/json'}, body });
    let data = null; try { data = await res.json(); } catch { data = null; }
    if(!res.ok || (data && data.error)){
      const msg = (data && (data.detail || data.error)) || `fetch_detect failed: ${res.status}`;
      throw new Error(msg);
    }
    if(!data){ throw new Error('Empty response'); }

    currentTarget = data.target || target || urlVal;
    lastPreproc = data.preprocess || null;
    renderAll(data.time, data.flux, data.candidates, data.neighbors);
    if(status) status.textContent = 'Done';
  } catch(e){ if(status) status.textContent = 'Error'; console.error(e); alert(e.message || 'fetch failed'); }
});
    const res = await fetch(`${API_BASE}/fetch_detect`, { method:'POST', headers:{'Content-Type':'application/json'}, body });
    if(!res.ok){ throw new Error(`fetch_detect failed: ${res.status}`); }
    const data = await res.json();
    if(data.error){ alert(data.error); if(status) status.textContent=''; return; }
    currentTarget = data.target || target || url;
    lastPreproc = data.preprocess || null;
    renderAll(data.time, data.flux, data.candidates, data.neighbors);
    if(status) status.textContent = 'Done';
  } catch(e){ if(status) status.textContent = 'Error'; console.error(e); }
}

// ---------- Upload TXT/CSV ----------
async function runUpload(){
  const status = document.getElementById('statusUp');
  try{
    if(status) status.textContent = 'Running...';
    const file = document.getElementById('file')?.files?.[0];
    if(!file){ alert('Choose a .txt or .csv first'); if(status) status.textContent=''; return; }
    const txt = await file.text();
    const [T,F] = parseTxt(txt);
    const form = new FormData(); form.append('file', new Blob([txt], {type:'text/plain'}), 'lc.txt');

    // Προσαρμογή στο backend: predict-file
    const res = await fetch(`${API_BASE}/predict-file?kpeaks=3`, {method:'POST', body: form});
    if(!res.ok){ throw new Error(`predict-file failed: ${res.status}`); }
    const data = await res.json();
    if(data.error){ alert(data.error); if(status) status.textContent=''; return; }
    currentTarget='(Uploaded TXT)';
    lastPreproc = {source:'upload'};
    lastNeighbors = null;
    renderAll(T,F,data.candidates, null);
    if(status) status.textContent = 'Done';
  } catch(e){ if(status) status.textContent = 'Error'; console.error(e); }
}

// ---------- Export CSV ----------
function buildCsvRows(candTable){
  const rows = [];
  rows.push(["target","idx","period_d","duration_d","depth","power","P_planet","SNR","delta_BIC","odd_even_ppm","secondary_ppm","has_secondary","midtimes_sample","centroid_dr_pix","centroid_sigma","centroid_rho","centroid_suspect_beb"]);
  candTable.forEach((c,i)=>{
    const mids = (c.windows?.midtimes||[]).slice(0,5).join("|");
    const cent = c.centroid || {};
    rows.push([currentTarget, i+1, c.period, c.duration, c.depth, c.power, c.probability,
               (c.fit?.snr ?? ""), (c.fit?.delta_bic ?? ""),
               Math.round(c.vetting.odd_even_diff_ppm), Math.round(c.vetting.secondary_depth_ppm),
               c.vetting.has_secondary_like, mids,
               (cent.dr_pix ?? ""), (cent.sigma ?? ""), (cent.rho_flux_centroid ?? ""), (cent.suspect_beb ?? "")]);
  });
  return rows;
}
function exportCsv(rows, name){
  const csv = rows.map(r=>r.join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], {type:"text/csv"}));
  a.download = name; a.click();
}

// --- ΒΟΗΘΗΤΙΚΑ ΓΙΑ ΤΙΣ ΠΡΟΤΑΣΕΙΣ ---
function normalizeSuggestData(data) {
  const raw = Array.isArray(data) ? data : (data?.items ?? data?.results ?? data?.suggestions ?? data?.data ?? []);
  return (raw || []).map(it => {
    if (typeof it === 'string') return { value: it, label: it };
    const value = it.value ?? it.tic ?? it.id ?? it.name ?? it.target ?? '';
    const label = it.label ?? it.display ?? (it.tic ? `TIC ${it.tic}` : (it.name ?? value));
    return { value, label };
  });
}
function ensureSuggestDom() {
  const input = document.getElementById('tic');
  if (!input) return { input: null };
  // Απενεργοποίηση native datalist για να μην εμφανίζεται διπλό dropdown
  try {
    input.removeAttribute('list');
    const old = document.getElementById('suggList');
    if (old) old.remove();
  } catch(_) {}
  input.setAttribute('autocomplete', 'off');
  return { input };
}
// ---------- Autocomplete ----------
function debounce(fn, ms){ let t; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args), ms); }; }

const updateSuggest = debounce(async ()=>{
  const input = document.getElementById('tic') || document.getElementById('ticInput');
  if (!input) return;

  // αν Source=url μην κάνεις suggest
  const src = document.getElementById('sourceSel')?.value || 'mast_spoc';
  if (src === 'url') { hideSuggest(); return; }

  let raw = (input.value || '').trim();
  if (!raw) { hideSuggest(); return; }

  // A) μόνο ψηφία => q="TIC <digits>" & contains=1
  const onlyDigits = /^\d{2,}$/.test(raw);
  // B) "TIC <digits>" => contains=1
  const ticDigits  = /^TIC\s*\d{2,}$/i.test(raw);

  let q = raw;
  if (onlyDigits) q = `TIC ${raw}`;

  // domain ΜΟΝΟ αν είναι ρητά TESS/Kepler
  const mission = document.getElementById('missionSel')?.value || 'auto';
  const domParam = (mission === 'TESS') ? '&domain=TESS'
                 : (mission === 'Kepler') ? '&domain=Kepler' : '';
  const containsParam = (onlyDigits || ticDigits) ? '&contains=1' : '';

  try{
    const r = await fetch(`${API_BASE}/suggest?q=${encodeURIComponent(q)}${domParam}&limit=10${containsParam}`, {
      headers: { 'Accept': 'application/json' }
    });
    let list = [];
    if (r.ok) list = normalizeSuggestData(await r.json());
    if (list.length) showSuggest(list, input); else hideSuggest();
  }catch { hideSuggest(); }
}, 220);


// ---------- Transit Fit ----------
async function runFit(){
  const fitStatus = document.getElementById('fitStatus');
  const fitBox = document.getElementById('fitBox');
  try{
    if(!lastcandTable.length){ alert('Run detect first'); return; }
    const cand = lastcandTable[selectedIdx];
    if(!cand){ alert('Select a candidate'); return; }
    if(fitStatus) fitStatus.textContent = 'Fitting...';
    const method = document.getElementById('fitMethod')?.value || 'batman';
    const bootstrap = Number(document.getElementById('fitBoot')?.value || 80);
    const body = JSON.stringify({ time: lcTime, flux: lcFlux, candidate: { period: cand.period, t0: cand.t0, duration: cand.duration }, method, bootstrap });
    const res = await fetch(`${API_BASE}/fit_transit`, { method:'POST', headers:{'Content-Type':'application/json'}, body });
    if(!res.ok){ throw new Error(`fit_transit failed: ${res.status}`); }
    const data = await res.json();
    if(data.error){ alert(data.error); if(fitStatus) fitStatus.textContent=''; return; }
    lastFit = { params: data.params, model_curve: data.model_curve };
    renderPF(lcTime, lcFlux, cand);
    const p = data.params || {}; const u = data.uncertainties || {};
    function fmt(v, s){ if(v==null || !isFinite(v)) return ''; return (s!=null && isFinite(s)) ? `${v.toFixed(4)}  ${s.toFixed(4)}` : v.toFixed(4); }
    if (fitBox) {
      fitBox.innerHTML = `
      <div><b>Method:</b> ${data.method}${data.note?` (${data.note})`:''}</div>
      <div><b>Rp/R:</b> ${fmt(p.rp_rs, u.rp_rs)}  <b>b:</b> ${fmt(p.b, u.b)}  <b>a/R:</b> ${fmt(p.a_rs, u.a_rs)}</div>
      <div class="muted">P=${p.period?.toFixed? p.period.toFixed(6):p.period} d, t0=${p.t0?.toFixed? p.t0.toFixed(6):p.t0}</div>`;
      fitBox.style.display='block';
    }
    if(fitStatus) fitStatus.textContent = 'Done';
  }catch(e){ console.error(e); if(fitStatus) fitStatus.textContent = 'Error'; }
}

// ---------- PDF report ----------
async function runPdf(){
  try{
    if(!lastcandTable.length){ alert('Run detect first'); return; }
    const cand = lastcandTable[selectedIdx];
    const meta = { target: currentTarget, source: document.getElementById('sourceSel')?.value, mission: document.getElementById('missionSel')?.value };
    const payload = {
      meta,
      preprocess: lastPreproc || {},
      time: lcTime, flux: lcFlux,
      candidate: cand,
      neighbors: lastNeighbors || {},
      fit_method: document.getElementById('fitMethod')?.value
    };
    const res = await fetch(`${API_BASE}/report_pdf`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    if(!res.ok){ const j = await res.json().catch(()=>({error:"unknown"})); alert(j.error || "report failed"); return; }
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Oramax_Vetting_${(currentTarget||'target').toString().replace(/\s+/g,'_')}.pdf`;
    a.click();
  }catch(e){ console.error(e); alert("report failed"); }
}

// ---------- Wire-up ----------
document.addEventListener('DOMContentLoaded', ()=>{
  setThrLabel(); setCentroidThrLabels(); setNeighborsLabel();
  toggleInputs();

  const srcSel = document.getElementById('sourceSel'); if(srcSel) srcSel.addEventListener('change', toggleInputs);
  const ticInp = document.getElementById('tic'); if(ticInp) ticInp.addEventListener('input', updateSuggest);

  (document.getElementById('fetchBtn') || document.getElementById('runFetch'))?.addEventListener('click', fetchBtn);
  const upbtn = document.getElementById('runUpload'); if(upbtn) upbtn.addEventListener('click', runUpload);

  const exp = document.getElementById('exportBtn'); if(exp) exp.addEventListener('click', ()=>{
    if(!lastcandTable.length){ alert("Run Detect first."); return; }
    exportCsv(buildCsvRows(lastcandTable), `oramax_candidates_${(currentTarget||'target').toString().replace(/\s+/g,'_')}.csv`);
  });
  const expV = document.getElementById('exportVettedBtn'); if(expV) expV.addEventListener('click', ()=>{
    if(!lastcandTable.length){ alert("Run Detect first."); return; }
    const thr = getThreshold();
    const vetted = lastcandTable.filter(c => (c?.probability ?? 0) >= thr);
    if(!vetted.length){ alert(`No candidates with P ≥ ${thr.toFixed(2)}`); return; }
    const rows = buildCsvRows(vetted);
    rows.unshift(["threshold", thr]);
    exportCsv(rows, `oramax_vetted_${(currentTarget||'target').toString().replace(/\s+/g,'_')}_p${thr.toFixed(2)}.csv`);
  });

  const thr = document.getElementById('thr'); if(thr) thr.addEventListener('input', ()=>{ setThrLabel(); renderTable(lastcandTable||[]); });
  const sT = document.getElementById('sigmaThr'); if(sT) sT.addEventListener('input', ()=>{ setCentroidThrLabels(); renderTable(lastcandTable||[]); renderCentroidInfo(lastcandTable[selectedIdx]?.centroid, getSigmaThr(), getRhoThr()); });
  const rT = document.getElementById('rhoThr'); if(rT) rT.addEventListener('input', ()=>{ setCentroidThrLabels(); renderTable(lastcandTable||[]); renderCentroidInfo(lastcandTable[selectedIdx]?.centroid, getSigmaThr(), getRhoThr()); });
  const gR = document.getElementById('neiRadius'); if(gR) gR.addEventListener('input', ()=>{ setNeighborsLabel(); });

  const fit = document.getElementById('fitBtn'); if(fit) fit.addEventListener('click', runFit);
  const pdf = document.getElementById('pdfBtn'); if(pdf) pdf.addEventListener('click', runPdf);
});

// --- Custom suggest dropdown (fallback if datalist is not visible) ---
let __SUGG_OPEN=false, __suggData=[];
function ensureSuggestMenu(){
  let m = document.getElementById('suggMenu');
  if(!m){
    m = document.createElement('div');
    m.id = 'suggMenu';
    m.style.position='absolute';
    m.style.zIndex='9999';
    m.style.background='#fff';
    m.style.border='1px solid #e5e7eb';
    m.style.borderRadius='8px';
    m.style.boxShadow='0 10px 24px rgba(0,0,0,.12)';
    m.style.maxHeight='240px';
    m.style.overflow='auto';
    m.style.display='none';
    document.body.appendChild(m);
  }
  return m;
}
function placeSuggestMenu(input){
  const r=input.getBoundingClientRect();
  const m=ensureSuggestMenu();
  m.style.left=(window.scrollX + r.left)+ 'px';
  m.style.top =(window.scrollY + r.bottom + 4)+ 'px';
  m.style.width = r.width+'px';
}
function showSuggest(list, input){
  const m=ensureSuggestMenu();
  placeSuggestMenu(input);
  m.innerHTML = list.map((s,i)=>`<div class="sugg-item" data-i="${i}" style="padding:6px 10px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${(s.label||s.value||'').toString()}</div>`).join('');
  Array.from(m.children).forEach(el=>{
    el.addEventListener('mousedown', (e)=>{ // mousedown για να εκτελείται πριν χαθεί το focus
      const i = +e.currentTarget.getAttribute('data-i');
      applySuggestion(list[i], input);
      hideSuggest();
      e.preventDefault();
    });
  });
  m.style.display='block';
  __SUGG_OPEN=true; __suggData=list;
}
function hideSuggest(){ const m=document.getElementById('suggMenu'); if(m) m.style.display='none'; __SUGG_OPEN=false; }
function applySuggestion(s, input){ if(!s) return; input.value = s.value || s.label || ''; input.dispatchEvent(new Event('change', {bubbles:true})); }

// global listeners for placement/closing
window.addEventListener('resize', ()=>{ const i=document.getElementById('tic'); if(i) placeSuggestMenu(i); });
window.addEventListener('scroll', ()=>{ const i=document.getElementById('tic'); if(i && __SUGG_OPEN) placeSuggestMenu(i); }, true);
document.addEventListener('click', (e)=>{ const m=document.getElementById('suggMenu'); const i=document.getElementById('tic'); if(!m||!i) return; if(e.target!==i && !m.contains(e.target)) hideSuggest(); });


