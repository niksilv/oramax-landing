"use client";

import Script from "next/script";

const html17b = `
<style>
  header.nav, header.nav a, header a { position: relative !important; z-index: 1000 !important; pointer-events: auto !important; }
</style>

<div id="ox17b">
  <style>
    #ox17b{ --card:#fff; --border:#e5e7eb; --muted:#666;
           font-family: system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;
           margin:24px; background:#fafafa; color:#111; position: relative; z-index: 1; }
    #ox17b h1{ font-size:22px; margin-bottom:18px; }
    #ox17b h3{ margin:0 0 10px 0; font-size:16px; }
    #ox17b .card{ background:var(--card); border:1px solid var(--border); border-radius:16px; padding:16px; margin-bottom:16px; box-shadow:0 4px 12px rgba(0,0,0,.04); }
    #ox17b .row{ display:flex; gap:16px; flex-wrap:wrap; }
    #ox17b .col{ flex:1; min-width:360px; }
    #ox17b table{ width:100%; border-collapse:collapse; }
    #ox17b th, #ox17b td{ padding:8px 10px; border-bottom:1px solid #eee; text-align:left; font-size:13px; }
    #ox17b th{ background:#f7f7f7; font-weight:600; }
    #ox17b .prob{ font-weight:700; }
    #ox17b input, #ox17b select, #ox17b button{ padding:8px 10px; border:1px solid #ddd; border-radius:10px; font-size:13px; background:#fff; }
    #ox17b input[type=text]{ min-width:260px; }
    #ox17b button{ cursor:pointer; background:#111; color:#fff; border-color:#111; }
    #ox17b button:disabled{ opacity:.7; cursor:not-allowed; }
    #ox17b tr.clickable:hover{ background:#f7f7f7; cursor:pointer; }
    #ox17b .muted{ color:var(--muted); font-size:12.5px; }
    #ox17b .inline{ display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
    #ox17b summary{ cursor:pointer; }
    #ox17b tr.vetted{ background:#eaffea !important; }
    #ox17b .badge{ display:inline-block; padding:2px 8px; border-radius:999px; font-size:12px; border:1px solid #ddd; background:#fff; }
    #ox17b .badge-ok{ background:#e6ffed; border-color:#b3ffcc; color:#006622; }
    #ox17b .badge-beb{ background:#ffe6e6; border-color:#ffb3b3; color:#b30000; }
    #ox17b .note{ font-size:12.5px; color:#333; }
    #ox17b .kv{ font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; background:#f7f7f7; border:1px solid #eee; border-radius:10px; padding:8px; }
    #ox17b #lc, #ox17b #pf { position: relative; overflow: hidden; }
    #ox17b .js-plotly-plot, #ox17b .plotly, #ox17b .modebar-container { position: relative !important; overflow: hidden !important; z-index: 1 !important; pointer-events: auto !important; }
  </style>

  <h1>Orama X  Exoplanet Detector</h1>

  <div class="card">
    <h3>Live Fetch & Detect (select source)</h3>
    <div class="inline" style="margin-bottom:8px;">
      <label>Source</label>
      <select id="sourceSel">
        <option value="mast_spoc">MAST  SPOC (PDCSAP)</option>
        <option value="mast_qlp">MAST  QLP</option>
        <option value="url">External CSV/TXT URL</option>
      </select>

      <label>Mission</label>
      <select id="missionSel">
        <option value="auto">auto</option>
        <option value="TESS">TESS</option>
        <option value="Kepler">Kepler</option>
        <option value="K2">K2</option>
      </select>

      <label>k-peaks</label>
      <input type="number" id="kpeaks" value="3" min="1" max="5" style="width:70px"/>

      <label>Detrend</label>
      <select id="detrendSel">
        <option value="flatten" selected>flatten</option>
        <option value="none">none</option>
      </select>

      <label><input type="checkbox" id="qualityChk" checked/> quality mask</label>
      <label><input type="checkbox" id="outlierChk" checked/> remove outliers</label>

      <label>σ</label>
      <input type="number" id="sigmaVal" value="5" step="0.5" style="width:70px"/>

      <label><input type="checkbox" id="centroidChk"/> Centroid vetting (TESSCut)</label>
      <label><input type="checkbox" id="gaiaChk"/> Gaia neighbors</label>
    </div>

    <div class="inline" style="margin-bottom:8px;">
      <span class="badge">Planet threshold</span>
      <input type="range" id="thr" min="0.50" max="0.99" step="0.01" value="0.80" style="width:180px"/>
      <span class="muted">p  <b id="thrLabel">0.80</b></span>
      <span class="muted" id="vetCount"></span>

      <span class="badge">Centroid σ-thr</span>
      <input type="range" id="sigmaThr" min="1" max="10" step="0.5" value="3" style="width:160px"/>
      <span class="muted"><b id="sigmaThrLabel">3.0</b></span>

      <span class="badge">ρ-thr</span>
      <input type="range" id="rhoThr" min="0.00" max="0.50" step="0.01" value="0.15" style="width:160px"/>
      <span class="muted"><b id="rhoThrLabel">0.15</b></span>

      <span class="badge">Gaia radius ["]</span>
      <input type="range" id="neiRadius" min="20" max="120" step="5" value="60" style="width:160px"/>
      <span class="muted"><b id="neiRadiusLabel">60</b></span>
    </div>

    <div class="inline">
      <input type="text" id="ticInput" list="targetList" placeholder='TIC 307210830 (for MAST)' />
      <datalist id="targetList"></datalist>

      <input type="text" id="urlInput" placeholder="https://.../lightcurve.csv (time,flux)" style="display:none; min-width:400px;" />
      <button id="runFetch">Fetch & Detect</button>
      <button id="exportCsv">Export CSV</button>
      <button id="exportVettedCsv" title="Export only candidates with P  threshold">Export Vetted CSV</button>

      <span class="muted" id="status"></span>
    </div>

    <div class="inline" style="margin-top:8px;">
      <span class="badge">Fit method</span>
      <select id="fitMethod">
        <option value="batman">batman</option>
        <option value="trapezoid">trapezoid</option>
      </select>
      <span class="badge">bootstrap N</span>
      <input type="number" id="fitBoot" value="80" min="0" max="400" step="20" style="width:90px"/>
      <button id="fitBtn">Fit transit (selected)</button>

      <button id="pdfBtn" title="Create a PDF vetting report for the current target">Download PDF report</button>
      <span class="muted" id="fitStatus"></span>
    </div>
    <div id="fitBox" class="kv" style="margin-top:8px; display:none;"></div>
  </div>

  <details>
    <summary><b>Advanced: Upload custom light curve (TXT/CSV)</b></summary>
    <div class="card" style="margin-top:10px;">
      <h3>Upload TXT (2 columns: time, flux)</h3>
      <input type="file" id="file" accept=".txt,.csv"/>
      <button id="runUpload">Detect</button>
      <span class="muted" id="statusUp"></span>
    </div>
  </details>

  <div class="row">
    <div class="col card">
      <h3>Light Curve</h3>
      <div id="lc" style="height:380px;"></div>
    </div>
    <div class="col card">
      <h3>Phase-Folded (selected candidate)</h3>
      <div id="pf" style="height:340px;"></div>
      <div id="centroidBox" class="muted" style="margin-top:8px;"></div>
    </div>
  </div>

  <div class="card">
    <h3>Candidates <span class="muted">(green = vetted with P  threshold; badge = centroid test)</span></h3>
    <table id="cands"><thead>
      <tr>
        <th>#</th><th>Period (d)</th><th>Duration (d)</th><th>Depth</th><th>Power</th><th>P(planet)</th>
        <th>SNR</th><th>ΔBIC</th><th>OddEven Δ (ppm)</th><th>Secondary?</th><th>Centroid</th>
      </tr>
    </thead><tbody></tbody></table>
  </div>

  <div class="card">
    <h3>Neighbors (Gaia DR3)</h3>
    <div id="neighborsPlot" style="height:320px;"></div>
    <div class="muted" id="neighborsInfo"></div>
    <table id="neighborsTbl" style="margin-top:8px;"><thead>
      <tr><th>sep ["]</th><th>Gmag</th><th>BPRP</th></tr>
    </thead><tbody></tbody></table>
  </div>
</div>
`;

export default function Detector17B() {
  return (
    <>
      {/* Plotly first */}
      <Script src="https://cdn.plot.ly/plotly-2.26.0.min.js" strategy="beforeInteractive" />
      <div dangerouslySetInnerHTML={{ __html: html17b }} />
      {/* Full inline logic */}
      <Script id="predictor-17b-inline" strategy="afterInteractive">{`
      (function(){
        const log = (...a)=>console.log('[17B]', ...a);
        const err = (...a)=>console.error('[17B]', ...a);
        const $ = (id)=>document.getElementById(id);
        const setText=(id,txt)=>{ const el=$(id); if(el) el.textContent=txt; };

        // ---- Bind sliders to labels ----
        function bindSlider(sliderId, labelId, fmt){
          const s = $(sliderId); const l = $(labelId);
          if(!s||!l) return;
          const show=()=>{ const v=parseFloat(s.value); l.textContent=fmt?fmt(v):String(v); };
          s.addEventListener('input', show); show();
        }

        // ---- Suggest (autocomplete) ----
        let suggestTimer=null;
        function setupSuggest(){
          const inp = $('ticInput'); const list = $('targetList');
          if(!inp || !list) return;
          inp.addEventListener('input', ()=>{
            const q = inp.value.trim();
            if(q.length<3) return;
            clearTimeout(suggestTimer);
            suggestTimer = setTimeout(async ()=>{
              try{
                const r = await fetch('/api/suggest?q='+encodeURIComponent(q)+'&limit=10',{method:'GET'});
                if(!r.ok){ throw new Error('suggest '+r.status); }
                const js = await r.json();
                const items = js.items ?? js.suggestions ?? js ?? [];
                list.innerHTML = items.map(it=>{
                  const v = (it.id ?? it.value ?? it.label ?? it.tic ?? it.name ?? it).toString();
                  return '<option value="'+v.replace(/"/g,'&quot;')+'">';
                }).join('');
              }catch(e){ err('suggest', e); }
            }, 200);
          });
        }

        // ---- Plot helpers ----
        function plotLC(time, flux){
          if(!window.Plotly) return;
          const el = $('lc'); if(!el) return;
          const data = [{ x: time, y: flux, mode:'markers', marker:{ size:3 }, name:'flux' }];
          const layout = { margin:{l:40,r:10,t:10,b:30}, xaxis:{title:'time'}, yaxis:{title:'flux'} };
          window.Plotly.newPlot(el, data, layout, {displayModeBar:false, responsive:true});
        }
        function plotPF(phase, flux){
          if(!window.Plotly) return;
          const el = $('pf'); if(!el) return;
          const data = [{ x: phase, y: flux, mode:'markers', marker:{ size:3 }, name:'folded' }];
          const layout = { margin:{l:40,r:10,t:10,b:30}, xaxis:{title:'phase'}, yaxis:{title:'flux'} };
          window.Plotly.newPlot(el, data, layout, {displayModeBar:false, responsive:true});
        }

        // ---- Table render ----
        function renderCandidates(arr){
          const tb = document.querySelector('#cands tbody'); if(!tb) return;
          tb.innerHTML = '';
          const thr = parseFloat(($('thr')?.value)||'0.8');
          let vetted=0;
          (arr||[]).forEach((c,i)=>{
            const p = c.p_planet ?? c.p ?? c.prob ?? null;
            const tr = document.createElement('tr');
            tr.className = 'clickable' + (p!=null && p>=thr ? ' vetted' : '');
            tr.onclick = ()=>{ if(c.folded?.phase && c.folded?.flux) plotPF(c.folded.phase, c.folded.flux); };
            const centroidBadge = (c.centroid && (c.centroid.pass===true || c.centroid.ok===true))
              ? '<span class="badge badge-ok">OK</span>'
              : (c.centroid ? '<span class="badge badge-beb">Shift</span>' : '');
            const pd = (x, n)=> (x&&x.toFixed) ? x.toFixed(n) : (x ?? '');
            tr.innerHTML = [
              i+1,
              pd(c.period ?? c.P, 6),
              pd(c.duration ?? c.D, 5),
              c.depth ?? c.depth_ppm ?? c.depth_frac ?? '',
              c.power ?? c.SDE ?? '',
              (p!=null? '<span class="prob">'+(p*100).toFixed(1)+'%</span>' : ''),
              c.snr ?? c.SNR ?? '',
              c.delta_bic ?? c.dBIC ?? '',
              c.odd_even_ppm ?? '',
              c.secondary ?? '',
              centroidBadge
            ].map(x=>'<td>'+x+'</td>').join('');
            tb.appendChild(tr);
            if(p!=null && p>=thr) vetted++;
          });
          setText('vetCount', vetted? ('vetted: '+vetted): '');
        }

        // ---- State ----
        let last = { target:null, lc:null, pf:null, cands:[], neighbors:null, centroid:null };

        // ---- Fetch & Detect ----
        async function runFetchDetect(){
          const source = $('sourceSel')?.value || 'mast_spoc';
          const mission = $('missionSel')?.value || 'auto';
          const body = {
            source,
            mission,
            target: $('ticInput')?.value?.trim() || null,
            url: $('urlInput')?.value?.trim() || null,
            options: {
              kpeaks: Number($('kpeaks')?.value)||3,
              detrend: $('detrendSel')?.value||'flatten',
              sigma: Number($('sigmaVal')?.value)||5,
              quality: Boolean(($('qualityChk') as HTMLInputElement)?.checked),
              outliers: Boolean(($('outlierChk') as HTMLInputElement)?.checked),
              centroid: Boolean(($('centroidChk') as HTMLInputElement)?.checked),
              gaia: Boolean(($('gaiaChk') as HTMLInputElement)?.checked),
              centroid_sigma_thr: Number($('sigmaThr')?.value)||3,
              centroid_rho_thr: Number($('rhoThr')?.value)||0.15,
              neighbors_radius: Number($('neiRadius')?.value)||60,
              prob_thr: Number($('thr')?.value)||0.8,
            }
          };
          if(source==='url' && !body.url){ setText('status','Please provide a CSV/TXT URL'); return; }
          if(source!=='url' && !body.target){ setText('status','Please provide a target (e.g., TIC ...)'); return; }

          setText('status','Working...');
          try{
            const r = await fetch('/api/fetch_detect', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)});
            const js = await r.json();
            if(!r.ok) throw new Error(js?.error || r.statusText);
            handleDetectResult(js);
            setText('status','Done');
          }catch(e){ setText('status','Error'); alert('fetch_detect: '+(e as Error).message); }
        }

        function handleDetectResult(js){
          const lc = js.lc || js.lightcurve || js.raw || null;
          const time = lc?.time || lc?.t || js.time;
          const flux = lc?.flux || lc?.y || js.flux;
          if(Array.isArray(time) && Array.isArray(flux)) plotLC(time, flux);

          const folded = js.pf || js.folded || null;
          if(folded?.phase && folded?.flux) plotPF(folded.phase, folded.flux);

          const cands = js.cands || js.candidates || [];
          last = {
            target: js.target || js.id || $('ticInput')?.value,
            lc: { time, flux },
            pf: folded,
            cands,
            neighbors: js.neighbors||null,
            centroid: js.centroid||null,
          };
          renderCandidates(cands);
          // neighbors (optional)
          try{
            const np = $('neighborsPlot'); const nt = $('neighborsTbl')?.querySelector('tbody'); const ni = $('neighborsInfo');
            if(last.neighbors?.points && window.Plotly && np){
              const d = last.neighbors.points;
              window.Plotly.newPlot(np, [{
                x: d.map(p=>p.sep), y: d.map(p=>p.gmag), mode:'markers', marker:{size:6}, name:'Gaia'
              }], { margin:{t:10}, xaxis:{title:'sep [" ]'}, yaxis:{title:'Gmag'} }, {displayModeBar:false,responsive:true});
            }
            if(nt && Array.isArray(last.neighbors?.points)){
              nt.innerHTML = last.neighbors.points.map(p=>'<tr><td>'+p.sep+'</td><td>'+p.gmag+'</td><td>'+(p.bprp??'')+'</td></tr>').join('');
            }
            if(ni && last.neighbors?.info){ ni.textContent = String(last.neighbors.info); }
          }catch(e){ /* ignore neighbors errors */ }
        }

        // ---- Upload detect ----
        async function runUpload(){
          const file = (document.getElementById('file') as HTMLInputElement)?.files?.[0];
          if(!file){ setText('statusUp','Choose a file'); return; }
          const txt = await file.text();
          setText('statusUp','Working...');
          try{
            const r = await fetch('/api/detect', { method:'POST', headers:{'Content-Type':'text/plain'}, body: txt });
            const js = await r.json();
            if(!r.ok) throw new Error(js?.error || r.statusText);
            handleDetectResult(js);
            setText('statusUp','Done');
          }catch(e){ setText('statusUp','Error'); alert('detect: '+(e as Error).message); }
        }

        // ---- Export CSVs ----
        function download(filename, text){
          const blob = new Blob([text], {type:'text/csv;charset=utf-8'});
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href=url; a.download=filename;
          document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 0);
        }
        function exportAll(){
          if(!last?.lc?.time || !last?.lc?.flux){ alert('No lightcurve'); return; }
          const header = 'time,flux\n';
          const rows = last.lc.time.map((t,i)=>[t,last.lc.flux[i]].join(',')).join('\n');
          download((last.target||'lightcurve')+'.csv', header+rows);
        }
        function exportVetted(){
          const thr = Number(($('thr') as HTMLInputElement)?.value)||0.8;
          const header = 'index,period,duration,depth,power,prob\n';
          const rows = (last.cands||[])
            .filter(c=> (c.p_planet ?? c.p ?? c.prob ?? 0) >= thr )
            .map((c,i)=>[i+1, c.period ?? c.P ?? '', c.duration ?? c.D ?? '', c.depth ?? '', c.power ?? '', c.p_planet ?? c.p ?? c.prob ?? ''].join(','))
            .join('\n');
          if(!rows){ alert('No vetted candidates'); return; }
          download((last.target||'candidates')+'_vetted.csv', header+rows);
        }

        // ---- Fit transit ----
        async function runFit(){
          const cand = (last.cands||[])[0]; // first or selected
          if(!cand){ alert('Select a candidate (click row)'); return; }
          setText('fitStatus','Fitting...');
          try{
            const r = await fetch('/api/fit_transit', { method:'POST', headers:{'Content-Type':'application/json'},
              body: JSON.stringify({ target: last.target, candidate: cand, method: ($('fitMethod') as HTMLSelectElement)?.value || 'batman', bootstrap: Number(($('fitBoot') as HTMLInputElement)?.value)||80 })
            });
            const js = await r.json();
            if(!r.ok) throw new Error(js?.error || r.statusText);
            const box = $('fitBox'); if(box){ box.style.display='block'; box.innerHTML='<b>Fit params</b><br/><pre>'+JSON.stringify(js.params ?? js, null, 2)+'</pre>'; }
            const f = js.folded || js.pf; if(f?.phase && f?.flux) plotPF(f.phase, f.flux);
            setText('fitStatus','Done');
          }catch(e){ setText('fitStatus','Error'); alert('fit_transit: '+(e as Error).message); }
        }

        // ---- PDF report ----
        async function runPdf(){
          try{
            const r = await fetch('/api/report_pdf?target='+encodeURIComponent(String(last.target||'')));
            if(!r.ok) throw new Error(await r.text());
            const blob = await r.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href=url; a.download=(String(last.target||'report'))+'.pdf';
            document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 0);
          }catch(e){ alert('report_pdf: '+(e as Error).message); }
        }

        // ---- Wiring ----
        function setupUI(){
          bindSlider('thr','thrLabel', v=>v.toFixed(2));
          bindSlider('sigmaThr','sigmaThrLabel', v=>v.toFixed(1));
          bindSlider('rhoThr','rhoThrLabel', v=>v.toFixed(2));
          bindSlider('neiRadius','neiRadiusLabel', v=>v.toFixed(0));

          const srcSel=$('sourceSel'), urlInput=$('urlInput'), ticInput=$('ticInput');
          if(srcSel && urlInput && ticInput){
            srcSel.addEventListener('change', ()=>{
              const isUrl=srcSel.value==='url';
              urlInput.style.display = isUrl ? 'inline-block' : 'none';
              ticInput.style.display  = isUrl ? 'none' : 'inline-block';
            });
          }

          $('runFetch')?.addEventListener('click', runFetchDetect);
          $('exportCsv')?.addEventListener('click', exportAll);
          $('exportVettedCsv')?.addEventListener('click', exportVetted);
          $('runUpload')?.addEventListener('click', runUpload);
          $('fitBtn')?.addEventListener('click', runFit);
          $('pdfBtn')?.addEventListener('click', runPdf);

          setupSuggest();
        }

        function boot(){
          setupUI();
          log('inline predictor (full) booted');
        }
        if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', boot); } else { boot(); }
      })();
      `}</Script>
    </>
  );
}
