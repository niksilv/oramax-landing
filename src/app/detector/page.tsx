"use client";

import Script from "next/script";

const html17b = `
<style>
  /* Keep nav links clickable */
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
      {/* Ensure Plotly is on window before our script runs */}
      <Script src="https://cdn.plot.ly/plotly-2.26.0.min.js" strategy="beforeInteractive" />
      <div dangerouslySetInnerHTML={{ __html: html17b }} />
      {/* Inline boot script (no external dependency) */}
      <Script id="predictor-17b-inline" strategy="afterInteractive">{`
      (function(){
        const log = (...a)=>console.log('[17B]', ...a);
        const err = (...a)=>console.error('[17B]', ...a);
        const $ = (id)=>document.getElementById(id);
        const setText=(id,txt)=>{ const el=$(id); if(el) el.textContent=txt; };

        function bindSlider(sliderId, labelId, fmt){
          const s = $(sliderId); const l = $(labelId);
          if(!s||!l) return;
          const show=()=>{ const v=parseFloat(s.value); l.textContent=fmt?fmt(v):String(v); };
          s.addEventListener('input', show); show(); // init immediately
        }

        function setupBasicUI(){
          // sliders / labels
          bindSlider('thr','thrLabel', v=>v.toFixed(2));
          bindSlider('sigmaThr','sigmaThrLabel', v=>v.toFixed(1));
          bindSlider('rhoThr','rhoThrLabel', v=>v.toFixed(2));
          bindSlider('neiRadius','neiRadiusLabel', v=>v.toFixed(0));

          // source switch
          const srcSel=$('sourceSel'), urlInput=$('urlInput'), ticInput=$('ticInput');
          if(srcSel && urlInput && ticInput){
            srcSel.addEventListener('change', ()=>{
              const isUrl=srcSel.value==='url';
              urlInput.style.display = isUrl ? 'inline-block' : 'none';
              ticInput.style.display  = isUrl ? 'none' : 'inline-block';
            });
          }
        }

        // Minimal plots to confirm wiring
        function plotTest(){
          try{
            if(!window.Plotly) return;
            const x=Array.from({length:80}, (_,i)=>i/10);
            const y=x.map(t=>Math.sin(t));
            window.Plotly.newPlot('lc',[{x,y,mode:'lines'}],{margin:{t:10}},
              {displayModeBar:false,responsive:true});
          }catch(e){ err('plot test',e); }
        }

        // Wire buttons with harmless stubs so βλέπεις activity άμεσα
        function setupButtons(){
          $('runFetch')?.addEventListener('click', ()=>{
            setText('status','Working...');
            setTimeout(()=>{ setText('status','Done'); plotTest(); }, 300);
          });
          $('exportCsv')?.addEventListener('click', ()=> alert('Export CSV stub'));
          $('exportVettedCsv')?.addEventListener('click', ()=> alert('Export Vetted CSV stub'));
          $('runUpload')?.addEventListener('click', ()=> alert('Upload Detect stub'));
          $('fitBtn')?.addEventListener('click', ()=> alert('Fit Transit stub'));
          $('pdfBtn')?.addEventListener('click', ()=> alert('PDF report stub'));
        }

        function boot(){
          setupBasicUI();
          setupButtons();
          log('inline predictor booted');
        }

        if(document.readyState==='loading'){
          document.addEventListener('DOMContentLoaded', boot);
        }else{
          boot();
        }
      })();
      `}</Script>
    </>
  );
}
