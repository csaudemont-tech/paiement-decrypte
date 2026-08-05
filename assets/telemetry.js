/* ============================================================
   Paiement Décrypté — télémétrie anonyme
   ------------------------------------------------------------
   RÈGLES (ne pas modifier sans revoir le point RGPD du cadrage) :
   - Aucun cookie, aucun stockage persistant, aucun identifiant
     personnel. `visit` est un jeton aléatoire qui ne vit que le
     temps de la page : il groupe les événements d'UN passage,
     il ne peut pas relier deux visites entre elles.
   - ENDPOINT vide = mode console (les événements s'affichent
     dans la console du navigateur, rien n'est envoyé).
   - Session 3 : coller ici l'URL du déploiement Apps Script.
   ============================================================ */
window.PD = (function () {
  'use strict';

  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbyQjYEwoQ_8DNw8GYq05Lo1PyLZ5ex978MQCAJsW889n1kbM0UOzjMNy9cxv3Vvhxf1SQ/exec'; // branché en session 3

  var EP = (document.body && document.body.dataset.ep) || 'unknown';
  var visit = Math.random().toString(36).slice(2, 10);
  var t0 = Date.now();
  var lastScreen = null;
  var lastScreenAt = t0;
  var completed = false;

  function send(e, d) {
    var payload = {
      ep: EP,            // épisode (ex. "s01")
      v: visit,          // jeton de passage (éphémère)
      t: Date.now() - t0,// ms depuis l'ouverture
      e: e,              // nom de l'événement
      d: d || {}         // détails
    };
    if (!ENDPOINT) {
      try { console.log('[PD telemetry]', JSON.stringify(payload)); } catch (_) {}
      return;
    }
    try {
      var body = JSON.stringify(payload);
      if (navigator.sendBeacon) {
        navigator.sendBeacon(ENDPOINT, body);
      } else {
        fetch(ENDPOINT, {
          method: 'POST', body: body, keepalive: true,
          mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }
        });
      }
    } catch (_) { /* la télémétrie ne casse jamais l'épisode */ }
  }

  /* Écran affiché : mesure aussi le temps passé sur le précédent. */
  function screen(name) {
    var now = Date.now();
    if (lastScreen !== null) {
      send('screen_time', { screen: lastScreen, ms: now - lastScreenAt });
    }
    lastScreen = name;
    lastScreenAt = now;
    send('screen_view', { screen: name });
  }

  /* Fin d'épisode atteinte (écran score). */
  function complete(d) {
    completed = true;
    send('complete', d || {});
  }

  /* Abandon : à la fermeture de l'onglet, on note le dernier écran vu.
     sendBeacon est conçu exactement pour ce moment-là. */
  window.addEventListener('pagehide', function () {
    if (lastScreen !== null) {
      send('screen_time', { screen: lastScreen, ms: Date.now() - lastScreenAt });
    }
    if (!completed) send('drop', { screen: lastScreen });
  });

  return { track: send, screen: screen, complete: complete };
})();
