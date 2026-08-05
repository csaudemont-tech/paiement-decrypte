/* ============================================================
   Paiement Décrypté — progression locale
   ------------------------------------------------------------
   localStorage uniquement : la progression vit dans LE navigateur
   du visiteur, rien ne quitte son appareil. Pas de compte, pas de
   synchronisation — c'est un confort de reprise, une donnée jetable.
   ============================================================ */
window.PDProgress = (function () {
  'use strict';
  var KEY = 'pd_progress';

  function all() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); }
    catch (_) { return {}; }
  }
  function save(ep, data) {
    try {
      var a = all();
      a[ep] = Object.assign({}, a[ep] || {}, data, { at: Date.now() });
      localStorage.setItem(KEY, JSON.stringify(a));
    } catch (_) { /* stockage plein ou bloqué : tant pis, jamais bloquant */ }
  }
  function load(ep) { return all()[ep] || null; }
  function clear(ep) {
    try {
      var a = all(); delete a[ep];
      localStorage.setItem(KEY, JSON.stringify(a));
    } catch (_) {}
  }
  return { save: save, load: load, clear: clear };
})();
