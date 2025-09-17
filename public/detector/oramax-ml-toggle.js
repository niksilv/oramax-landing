(function(){
  const KEY = 'OramaxML.method';

  function getMethod(){
    try { return (localStorage.getItem(KEY) || 'BLS').toUpperCase(); }
    catch(_) { return 'BLS'; }
  }

  function setMethod(m){
    try { localStorage.setItem(KEY, m.toUpperCase()); } catch(_){}
    try {
      window.dispatchEvent(new StorageEvent('storage', { key: KEY, newValue: m.toUpperCase() }));
    } catch(_){
      if (typeof window.updateMlBadge === 'function') window.updateMlBadge();
    }
  }

  function bind(){
    const btn = document.getElementById('mlToggleBtn') || document.querySelector('[data-ml-toggle]');
    if(!btn) return;

    btn.addEventListener('click', function(){
      const cur = getMethod();
      const next = (cur === 'CNN') ? 'BLS' : 'CNN';
      setMethod(next);
      const lbl = document.getElementById('mlToggleLabel');
      if (lbl) lbl.textContent = next;
    });

    const lbl = document.getElementById('mlToggleLabel');
    if (lbl) lbl.textContent = getMethod();
    if (typeof window.updateMlBadge === 'function') window.updateMlBadge();
  }

  document.addEventListener('DOMContentLoaded', bind);
})();
