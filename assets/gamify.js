/* ============================================================
   Paiement Décrypté – couche de progression (séries, points, badges)
   ------------------------------------------------------------
   Principes (non négociables) :
   - localStorage uniquement, clé « pd_game ». Rien ne quitte l'appareil.
   - Aucun envoi à la télémétrie : aucun événement ni champ ajouté.
   - Aucun classement, aucun compte, aucune comparaison entre visiteurs.
   - Sobre : texte, pas d'émoji, pas d'animation, pas d'ombre.
   - Jamais bloquant : tout est dans des try/catch.
   Dépend de progress.js (window.PDProgress), chargé avant.
   ============================================================ */
(function () {
  'use strict';

  // Épisodes publiés. À mettre à jour à chaque publication (publication.md, étape 8).
  var EPISODES = ['s1e01', 's1e02', 's1e03', 's1e04', 's1e05', 's1e06', 's1e07', 's1e08'];
  var KEY = 'pd_game';
  var EN = /^en/i.test(document.documentElement.lang || '');

  var T = EN ? {
    mine: 'Your progress', done: 'episodes completed', pts: 'points', streak: 'day streak',
    days1: 'day', daysN: 'days', badges: 'Badges', reset: 'Erase my progress',
    resetConfirm: 'Erase progress, points and badges stored in this browser?',
    thisEp: 'This episode', total: 'Total', serie: 'Streak', newBadge: 'New badge',
    completed: 'Completed', resume: 'Resume · screen', again: 'Replay',
    ctaResume: 'Resume the episode', ctaAgain: 'Replay the episode', heroResume: 'Resume episode', heroStart: 'Start episode',
    note: 'Stored in your browser only. Nothing is sent anywhere.',
    b: {
      first: ['First episode', 'You completed your first episode.'],
      perfect: ['Perfect run', 'An episode finished with 4 out of 4.'],
      streak3: ['3-day streak', 'Three consecutive days with an episode completed.'],
      season: ['Season 1 complete', 'Every published episode of the season completed.']
    }
  } : {
    mine: 'Votre parcours', done: 'épisodes terminés', pts: 'points', streak: 'jours de suite',
    days1: 'jour', daysN: 'jours', badges: 'Badges', reset: 'Effacer ma progression',
    resetConfirm: 'Effacer la progression, les points et les badges enregistrés dans ce navigateur ?',
    thisEp: 'Cet épisode', total: 'Total', serie: 'Série', newBadge: 'Nouveau badge',
    completed: 'Terminé', resume: 'Reprendre · écran', again: 'Refaire',
    ctaResume: 'Reprendre l’épisode', ctaAgain: 'Refaire l’épisode', heroResume: 'Reprendre l’épisode', heroStart: 'Commencer l’épisode',
    note: 'Enregistré dans votre navigateur uniquement. Rien n\'est envoyé.',
    b: {
      first: ['Premier épisode', 'Vous avez terminé votre premier épisode.'],
      perfect: ['Sans faute', 'Un épisode terminé avec 4 bonnes réponses sur 4.'],
      streak3: ['Série de 3 jours', 'Trois jours de suite avec un épisode terminé.'],
      season: ['Saison 1 complète', 'Tous les épisodes publiés de la saison terminés.']
    }
  };

  /* ---------- stockage ---------- */
  function load() {
    try {
      var g = JSON.parse(localStorage.getItem(KEY) || '{}');
      g.best = g.best || {}; g.days = g.days || []; g.badges = g.badges || [];
      return g;
    } catch (_) { return { best: {}, days: [], badges: [] }; }
  }
  function store(g) { try { localStorage.setItem(KEY, JSON.stringify(g)); } catch (_) {} }

  function slug(ep) { return String(ep || '').replace(/-en$/, ''); }
  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }
  function dayNum(s) { var p = s.split('-'); return Math.round(Date.UTC(+p[0], +p[1] - 1, +p[2]) / 864e5); }

  /* série = jours consécutifs, en partant d'aujourd'hui ou d'hier */
  function streak(days) {
    if (!days.length) return 0;
    var set = {}, i;
    days.forEach(function (d) { set[dayNum(d)] = 1; });
    var n = dayNum(today());
    if (!set[n]) n -= 1;
    var c = 0;
    while (set[n]) { c++; n--; }
    return c;
  }

  /* points d'un épisode : 10 par bonne réponse + 20 pour l'avoir terminé ; on garde le meilleur essai */
  function epPoints(score) { return (score || 0) * 10 + 20; }
  function total(g) { var t = 0; for (var k in g.best) t += g.best[k].pts; return t; }

  function completedSlugs() {
    var done = {};
    try {
      var all = JSON.parse(localStorage.getItem('pd_progress') || '{}');
      for (var k in all) if (all[k] && all[k].completed) done[slug(k)] = all[k];
    } catch (_) {}
    return done;
  }

  /* ---------- attribution à la fin d'un épisode ---------- */
  function award(ep, data) {
    var g = load(), s = slug(ep), earned = [];
    var pts = epPoints(data.score);
    var firstEver = !Object.keys(g.best).length;
    if (!g.best[s] || pts > g.best[s].pts) g.best[s] = { pts: pts, score: data.score || 0 };
    var t = today();
    if (g.days.indexOf(t) < 0) g.days.push(t);
    g.days = g.days.slice(-60);

    function give(id) { if (g.badges.indexOf(id) < 0) { g.badges.push(id); earned.push(id); } }
    if (firstEver) give('first');
    if ((data.score || 0) >= 4) give('perfect');
    if (streak(g.days) >= 3) give('streak3');
    var done = completedSlugs(); done[s] = true;
    if (EPISODES.every(function (e) { return done[e]; })) give('season');
    store(g);
    return { g: g, pts: g.best[s].pts, earned: earned };
  }

  /* ---------- styles (inline, aucun ombre, jetons de la charte) ---------- */
  function css() {
    if (document.getElementById('pd-game-css')) return;
    var st = document.createElement('style'); st.id = 'pd-game-css';
    st.textContent =
      '.pd-game{background:#fff;border:1px solid #D8DEE9;border-radius:12px;padding:14px 16px;margin:14px 0;font-size:14px;line-height:1.5;color:#0E1B2C}' +
      '.pd-game h3{font-family:"Bricolage Grotesque",sans-serif;font-size:16px;margin:0 0 6px}' +
      '.pd-game .row{display:flex;flex-wrap:wrap;gap:6px 18px;color:#4A5A70}' +
      '.pd-game .row b{color:#0E1B2C}' +
      '.pd-game ul{list-style:none;margin:8px 0 0;padding:0}' +
      '.pd-game li{margin-top:4px}' +
      '.pd-game li b{color:#0C6B4E}' +
      '.pd-game .note{font-size:12px;color:#4A5A70;margin:8px 0 0}' +
      '.pd-game button{background:none;border:0;padding:0;font:inherit;font-size:12px;color:#1F4FD8;text-decoration:underline;cursor:pointer;padding:10px 0}' +
      '.pd-state{display:block;font-size:12px;font-weight:600;color:#0C6B4E;margin-top:8px}' +
      '.pd-state.resume{color:#1F4FD8}';
    document.head.appendChild(st);
  }

  function plural(n) { return n + ' ' + (n === 1 ? T.days1 : T.daysN); }

  /* ---------- écran de score ---------- */
  function renderReward(r) {
    try {
      css();
      var anchor = document.getElementById('recaplist') || document.getElementById('scoreval');
      if (!anchor || document.getElementById('pd-reward')) return;
      var g = r.g, el = document.createElement('div');
      el.className = 'pd-game'; el.id = 'pd-reward'; el.setAttribute('role', 'status');
      var html = '<div class="row"><span>' + T.thisEp + ' : <b>' + r.pts + ' ' + T.pts + '</b></span>' +
        '<span>' + T.total + ' : <b>' + total(g) + ' ' + T.pts + '</b></span>' +
        '<span>' + T.serie + ' : <b>' + plural(streak(g.days)) + '</b></span></div>';
      if (r.earned.length) {
        html += '<ul>' + r.earned.map(function (id) {
          return '<li><b>' + T.newBadge + ' · ' + T.b[id][0] + '</b> – ' + T.b[id][1] + '</li>';
        }).join('') + '</ul>';
      }
      el.innerHTML = html;
      anchor.parentNode.insertBefore(el, anchor.nextSibling);
    } catch (_) {}
  }

  /* ---------- accueil ---------- */
  function renderHome() {
    try {
      var section = document.getElementById('formation') || document.getElementById('training');
      if (!section) return;
      var g = load(), done = completedSlugs(), n = 0;
      EPISODES.forEach(function (e) { if (done[e]) n++; });
      var prog = {};
      try { prog = JSON.parse(localStorage.getItem('pd_progress') || '{}'); } catch (_) {}

      // état par carte
      var cards = section.querySelectorAll('a.card.episode');
      Array.prototype.forEach.call(cards, function (a) {
        var m = (a.getAttribute('href') || '').match(/(s1e\d+)\.html/);
        if (!m) return;
        var s = m[1], d = prog[s] || prog[s + '-en'], tag = null, label = null;
        if (d && d.completed) {
          tag = [T.completed + ' · ' + (d.score != null ? d.score + '/4' : ''), ''];
          label = T.ctaAgain;
        } else if (d && d.screen > 0) {
          tag = [T.resume + ' ' + d.screen, 'resume'];
          label = T.ctaResume;
        }
        var cta = a.querySelector('.card-cta');
        if (cta && label) cta.textContent = label;
        if (tag) {
          var sp = document.createElement('span'); sp.className = 'pd-state ' + tag[1]; sp.textContent = tag[0];
          a.appendChild(sp);
        }
      });

      // bouton d'accueil : épisode en cours, sinon prochain épisode non terminé
      var hero = document.querySelector('[data-hero-cta]');
      if (hero) {
        var next = null, i;
        for (i = 0; i < EPISODES.length; i++) { if (!done[EPISODES[i]]) { next = EPISODES[i]; break; } }
        if (!next) hero.style.display = 'none';
        else if (n > 0 || (prog[next] && prog[next].screen > 0)) {
          hero.setAttribute('href', 'episodes/' + next + '.html');
          hero.textContent = ((prog[next] && prog[next].screen > 0) ? T.heroResume : T.heroStart) + ' ' + parseInt(next.slice(-2), 10);
        }
      }

      if (!n && !g.badges.length) return;   // rien à montrer à un nouveau visiteur
      css();
      var box = document.createElement('div'); box.className = 'pd-game';
      var h = '<h3>' + T.mine + '</h3><div class="row"><span><b>' + n + ' / ' + EPISODES.length + '</b> ' + T.done + '</span>' +
        '<span><b>' + total(g) + '</b> ' + T.pts + '</span>' +
        (streak(g.days) > 0 ? '<span><b>' + plural(streak(g.days)) + '</b> ' + (EN ? 'streak' : 'de série') + '</span>' : '') + '</div>';
      if (g.badges.length) {
        h += '<ul>' + g.badges.map(function (id) { return '<li><b>' + T.b[id][0] + '</b> – ' + T.b[id][1] + '</li>'; }).join('') + '</ul>';
      }
      h += '<p class="note">' + T.note + '</p><button type="button" id="pd-reset">' + T.reset + '</button>';
      box.innerHTML = h;
      var grid = section.querySelector('.grid');
      (grid || section).parentNode.insertBefore(box, grid || null);
      document.getElementById('pd-reset').addEventListener('click', function () {
        if (!window.confirm(T.resetConfirm)) return;
        try { localStorage.removeItem('pd_progress'); localStorage.removeItem(KEY); } catch (_) {}
        location.reload();
      });
    } catch (_) {}
  }

  /* ---------- branchement sur PDProgress.save, sans toucher aux épisodes ---------- */
  var P = window.PDProgress;
  if (P && typeof P.save === 'function') {
    var orig = P.save;
    P.save = function (ep, data) {
      orig.apply(P, arguments);
      try { if (data && data.completed === true) renderReward(award(ep, data)); } catch (_) {}
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderHome);
  else renderHome();

  window.PDGame = { load: load, streak: function () { return streak(load().days); }, total: function () { return total(load()); } };
})();
