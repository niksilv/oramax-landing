/**
 * OramaX ML Toggle + Badge (SAFE)
 * Exports: window.updateMlBadge, window.setMlEnabled, window.getMlEnabled
 */
(function () {
  var LS_KEY = "oramax_ml_enabled";
  var state = false;
  try { state = localStorage.getItem(LS_KEY) === "1"; } catch(e){}

  function ensureBadge() {
    var el = document.getElementById("ml-badge");
    if (!el) {
      el = document.createElement("span");
      el.id = "ml-badge";
      el.style.cssText = "display:inline-block;margin-left:8px;padding:2px 8px;border-radius:12px;font:12px/18px system-ui,sans-serif;background:#eee;color:#333;vertical-align:middle;";
      (document.querySelector("[data-ml-badge-host]")||document.body).appendChild(el);
    }
    return el;
  }

  function updateMlBadge() {
    var el = ensureBadge();
    el.textContent = state ? "ML: ON" : "ML: OFF";
    el.style.background = state ? "#c6f6d5" : "#eee";
    el.style.color = state ? "#065f46" : "#333";
  }

  function setMlEnabled(next) {
    state = !!next;
    try { localStorage.setItem(LS_KEY, state ? "1" : "0"); } catch(e){}
    updateMlBadge();
    try { window.dispatchEvent(new CustomEvent("oramax:ml-toggle", { detail: { enabled: state } })); } catch (_) {}
  }

  function getMlEnabled() { return !!state; }

  window.updateMlBadge = updateMlBadge;
  window.setMlEnabled  = setMlEnabled;
  window.getMlEnabled  = getMlEnabled;

  function wire() {
    var cb = document.querySelector("#ml-toggle, [data-ml-toggle]");
    if (cb) {
      var isCheckbox = (cb.type === "checkbox");
      if (isCheckbox) cb.checked = state;
      cb.addEventListener("click", function(){ setMlEnabled(isCheckbox ? cb.checked : !state); });
    }
    updateMlBadge();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wire);
  else wire();
})();

