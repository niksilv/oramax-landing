<!-- oramax-ml-toggle.js -->
<script>
(function(){
  const KEY = 'OramaxML.method';

  function getMethod(){
    try { return (localStorage.getItem(KEY) || 'BLS').toUpperCase(); }
    catch(_) { return 'BLS'; }
  }

  function setMethod(m){
    // ενημέρωσε localStorage
    try { localStorage.setItem(KEY, m.toUpperCase()); } catch(_){}

    // συμβατότητα με index.html που κοιτάει window.OramaxML.method
    try {
      window.OramaxML = window.OramaxML || {};
      window.OramaxML.method = m.toUpperCase();
    } catch(_){}

    // ενημέρωσε το UI (storage event ή fallback)
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

    // αρχική τιμή label + global
    const lbl = document.getElementById('mlToggleLabel');
    const cur = getMethod();
    if (lbl) lbl.textContent = cur;
    try {
      window.OramaxML = window.OramaxML || {};
      window.OramaxML.method = cur;
    } catch(_){}

    if (typeof window.updateMlBadge === 'function') window.updateMlBadge();
  }

  document.addEventListener('DOMContentLoaded', bind);
})();
</script>
