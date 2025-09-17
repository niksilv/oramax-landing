(() => {
  console.log("[ORAMAX] toggle script loaded");
  const style = document.createElement('style');
  style.textContent = `
    #ormx-cnn-btn { position: fixed; right: 18px; bottom: 18px; z-index: 9999;
      padding: 10px 14px; border-radius: 12px; border: 1px solid #ccc; background: #fff;
      box-shadow: 0 4px 14px rgba(0,0,0,.12); cursor: pointer; font: 14px system-ui,-apple-system,Segoe UI,Roboto; }
    #ormx-cnn-panel { position: fixed; right: 18px; bottom: 70px; z-index: 9999; width: 320px; background:#fff;
      border:1px solid #ddd; border-radius: 12px; padding: 12px; box-shadow: 0 8px 30px rgba(0,0,0,.18); display:none; font: 13px system-ui,-apple-system,Segoe UI,Roboto;}
    #ormx-cnn-panel input, #ormx-cnn-panel select, #ormx-cnn-panel button, #ormx-cnn-panel textarea {
      width:100%; margin-top:6px; padding:8px; border-radius:8px; border:1px solid #ccc; font-size: 13px; }
    #ormx-cnn-toast { position: fixed; left: 50%; transform: translateX(-50%); bottom: 18px; background:#333; color:#fff;
      padding:8px 12px; border-radius:8px; font-size:13px; display:none; z-index:9999; }
    #ormx-cnn-panel .row { display:flex; gap:8px } #ormx-cnn-panel .row > * { flex:1 }
  `;
  document.head.appendChild(style);

  // Αν για κάποιο λόγο δεν υπάρχει body ακόμα, εκτέλεσέ το στο DOMContentLoaded
  const onReady = () => {
    if (!document.body) return;
    const btn = document.createElement('button');
    btn.id = 'ormx-cnn-btn'; btn.textContent = 'CNN (beta)';
    document.body.appendChild(btn);

    const panel = document.createElement('div');
    panel.id = 'ormx-cnn-panel';
    panel.innerHTML = `
      <div style="font-weight:600; margin-bottom:6px;">Exoplanet CNN scorer</div>
      <div class="row">
        <input id="ormx-tic" placeholder='Target e.g. "TIC 307210830"' />
        <select id="ormx-mission"><option value="TESS" selected>TESS</option><option value="Kepler">Kepler</option></select>
      </div>
      <button id="ormx-use-series">Χρήση τρέχουσας σειράς (αν υπάρχει)</button>
      <textarea id="ormx-time" rows="3" placeholder="Προαιρετικά: JSON array time [..]"></textarea>
      <textarea id="ormx-flux" rows="3" placeholder="Προαιρετικά: JSON array flux [..]"></textarea>
      <button id="ormx-run">Run CNN</button>
      <div id="ormx-res" style="margin-top:8px; font-size:13px; color:#333;"></div>`;
    document.body.appendChild(panel);

    const toast = document.createElement('div'); toast.id = 'ormx-cnn-toast'; document.body.appendChild(toast);
    const showToast = (msg, ms=2500) => { toast.textContent = msg; toast.style.display='block'; setTimeout(()=>toast.style.display='none', ms); };

    function discoverSeries() {
      let time=null, flux=null;
      if (window.DETECTOR_TIME && window.DETECTOR_FLUX) { time=window.DETECTOR_TIME; flux=window.DETECTOR_FLUX; }
      else if (window.time && window.flux && Array.isArray(window.time) && Array.isArray(window.flux)) { time=window.time; flux=window.flux; }
      return { time, flux };
    }
    async function callAPI(payload) {
      const url = "window.API_BASEml/score_lightcurve";
      const r = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
      if (!r.ok) throw new Error(\`HTTP \${r.status}\`); return r.json();
    }
    const parseJSON = txt => { try { return JSON.parse(txt); } catch { return null; } };

    btn.addEventListener('click', () => { panel.style.display = (panel.style.display==='none'||!panel.style.display)?'block':'none'; });
    panel.querySelector('#ormx-use-series').addEventListener('click', () => {
      const {time,flux} = discoverSeries();
      if (time && flux) {
        panel.querySelector('#ormx-time').value = JSON.stringify(time.slice(0,5000));
        panel.querySelector('#ormx-flux').value = JSON.stringify(flux.slice(0,5000));
        showToast('Βρέθηκε σειρά από το UI', 2000);
      } else { showToast('Δεν βρέθηκε διαθέσιμη σειρά στο UI. Γράψε Target ή επικόλλησε time/flux.', 3500); }
    });
    panel.querySelector('#ormx-run').addEventListener('click', async () => {
      const tic = panel.querySelector('#ormx-tic').value.trim();
      const mission = panel.querySelector('#ormx-mission').value;
      const timeTxt = panel.querySelector('#ormx-time').value.trim();
      const fluxTxt = panel.querySelector('#ormx-flux').value.trim();
      const time = timeTxt ? parseJSON(timeTxt) : null; const flux = fluxTxt ? parseJSON(fluxTxt) : null;
      if ((time && !flux) || (!time && flux)) { showToast('Δώσε και time και flux ή άσε και τα δύο κενά', 4000); return; }
      const payload = { engine:"cnn" };
      if (time && flux) { payload.time=time; payload.flux=flux; }
      else if (tic) { payload.target=tic; payload.mission=mission; }
      else { showToast('Δώσε Target ή time/flux', 3000); return; }
      panel.querySelector('#ormx-run').disabled = true; panel.querySelector('#ormx-res').textContent = 'Running...';
      try {
        const data = await callAPI(payload);
        if (!data.ok) throw new Error(data.error||'unknown_error');
        const p = data.prob ?? (data.candidates && data.candidates[0] && data.candidates[0].p_planet);
        panel.querySelector('#ormx-res').innerHTML = `
          <div><b>prob:</b> ${p!=null ? Number(p).toFixed(3) : 'n/a'}</div>
          <div><b>period:</b> ${data.period ?? 'n/a'}</div>
          <div><b>t0:</b> ${data.t0 ?? 'n/a'}</div>
          <div><b>duration:</b> ${data.duration ?? 'n/a'}</div>`;
        showToast('CNN infer ολοκληρώθηκε', 2200);
      } catch(e) {
        panel.querySelector('#ormx-res').textContent = 'Error: ' + (e.message || e);
        showToast('Σφάλμα στο CNN call', 2200);
      } finally { panel.querySelector('#ormx-run').disabled = false; }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})();


