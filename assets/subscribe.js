/* ============================================================
   Paiement Décrypté – inscription newsletter (Kit)
   ------------------------------------------------------------
   Envoie l'email au formulaire Kit n°9768048 (double opt-in).
   L'email part UNIQUEMENT vers Kit – jamais vers la télémétrie :
   la séparation identité / mesure est un choix RGPD du cadrage.
   Réponses gérées : success (confirmation à l'écran),
   quarantined (redirection vers la vérification anti-bot Kit),
   erreur (message + bouton réactivé).
   ============================================================ */
window.PDSubscribe = (function () {
  'use strict';

  var ACTION = 'https://app.kit.com/forms/9768048/subscriptions';

  function bind(form, onDone) {
    if (!form) return;
    // data-kit-form="NNN" sur le <form> permet de viser un autre formulaire Kit
    // (ex. segmentation EN plus tard) sans toucher à ce fichier.
    var action = form.dataset && form.dataset.kitForm
      ? 'https://app.kit.com/forms/' + form.dataset.kitForm + '/subscriptions'
      : ACTION;
    // Libellés/messages surchargables par attributs data-* (pages EN).
    var L = {
      sending: form.dataset.sending || 'Envoi…',
      sent: form.dataset.sent || 'Envoyé ✓',
      invalid: form.dataset.msgInvalid || 'Entrez une adresse email valide.',
      rejected: form.dataset.msgRejected || 'Inscription impossible, vérifiez l’adresse et réessayez.',
      network: form.dataset.msgNetwork || 'Impossible d’envoyer, vérifiez votre connexion et réessayez.'
    };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('input[type="email"]');
      var btn = form.querySelector('button[type="submit"], button');
      var email = (input && input.value || '').trim();
      if (!email || email.indexOf('@') < 1) {
        onDone(false, L.invalid);
        return;
      }
      var oldLabel = btn.textContent;
      btn.disabled = true;
      btn.textContent = L.sending;

      var fd = new FormData();
      fd.append('email_address', email);

      fetch(action, { method: 'POST', body: fd, headers: { 'Accept': 'application/json' } })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (res.status === 'quarantined' && res.url) {
            // Vérification anti-bot Kit : on y envoie le visiteur.
            window.location.href = res.url;
            return;
          }
          if (res.errors && res.errors.messages && res.errors.messages.length) {
            btn.disabled = false; btn.textContent = oldLabel;
            onDone(false, L.rejected);
            return;
          }
          btn.textContent = L.sent;
          onDone(true);
        })
        .catch(function () {
          btn.disabled = false; btn.textContent = oldLabel;
          onDone(false, L.network);
        });
    });
  }

  return { bind: bind };
})();
