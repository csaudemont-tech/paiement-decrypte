/* ============================================================
   pd-toolbar.js  –  la barre permanente, version C (compacte).
   Générée par build_toolbar.py depuis outils_catalogue.py.
   NE PAS MODIFIER À LA MAIN : régénérer.

   Emploi, sur une page d'outil :
     <script src="/assets/js/pd-toolbar.js" data-tool="flux-tlv"></script>

   Une ligne quelle que soit la taille du catalogue : la position
   courante à gauche, un bouton qui ouvre tout le reste. Le catalogue
   complet reste à un clic, sans repasser par l'index.
   ============================================================ */
(function () {
  'use strict';

  var TOOLS  = [{"g":"emv","u":"flux-tlv","ue":"tlv-stream","l":"/outils/flux-tlv/","le":"/en/tools/tlv-stream/","n":"Lire un flux TLV","ne":"Read a TLV stream","s":"Flux TLV","se":"TLV stream"},{"g":"emv","u":"decoder-un-tag","ue":"decode-a-tag","l":null,"le":null,"n":"Décoder un tag","ne":"Decode a tag","s":"Décoder un tag","se":"Decode a tag"},{"g":"emv","u":"construire-un-tag","ue":"build-a-tag","l":null,"le":null,"n":"Construire un tag","ne":"Build a tag","s":"Construire un tag","se":"Build a tag"},{"g":"emv","u":null,"ue":null,"l":null,"le":null,"n":"Vérifier un cryptogramme","ne":"Check a cryptogram","s":"","se":""},{"g":"nexo","u":"configuration-terminal","ue":"terminal-configuration","l":"/outils/nexo-config-decoder.html","le":"/en/outils/nexo-config-decoder.html","n":"Lire une configuration","ne":"Read a configuration","s":"Configuration","se":"Configuration"},{"g":"nexo","u":"comparer-configurations","ue":"compare-configurations","l":"/outils/comparer-configurations/","le":"/en/tools/compare-configurations/","n":"Comparer deux configurations","ne":"Compare two configurations","s":"Comparer","se":"Compare"},{"g":"nexo","u":"chercher-un-champ","ue":"look-up-a-field","l":null,"le":null,"n":"Chercher un champ","ne":"Look up a field","s":"Chercher un champ","se":"Look up a field"},{"g":"nexo","u":"ecrire-une-valeur","ue":"write-a-value","l":null,"le":null,"n":"Écrire une valeur","ne":"Write a value","s":"Écrire une valeur","se":"Write a value"},{"g":"nexo","u":"message-acquereur","ue":"acquirer-message","l":null,"le":null,"n":"Comprendre un message acquéreur","ne":"Understand an acquirer message","s":"Message acquéreur","se":"Acquirer message"},{"g":"nexo","u":null,"ue":null,"l":null,"le":null,"n":"Lire un message caisse","ne":"Read a till message","s":"","se":""},{"g":"iso","u":null,"ue":null,"l":null,"le":null,"n":"Lire un bitmap","ne":"Read a bitmap","s":"","se":""},{"g":"iso","u":null,"ue":null,"l":null,"le":null,"n":"Découper un message","ne":"Split a message","s":"","se":""},{"g":"conv","u":"convertir-un-format","ue":"convert-a-format","l":"/outils/convertir-un-format/","le":"/en/tools/convert-a-format/","n":"Convertir un format","ne":"Convert a format","s":"Convertir","se":"Convert"},{"g":"conv","u":null,"ue":null,"l":null,"le":null,"n":"Décoder BCD et dates","ne":"Decode BCD and dates","s":"","se":""},{"g":"ctrl","u":"luhn","ue":"luhn","l":"/outils/luhn/","le":"/en/tools/luhn/","n":"Contrôler un numéro de carte","ne":"Check a card number","s":"Luhn","se":"Luhn"},{"g":"ctrl","u":null,"ue":null,"l":null,"le":null,"n":"Générer un numéro de test","ne":"Generate a test number","s":"","se":""},{"g":"dico","u":"rangement-nexo","ue":"nexo-filing","l":null,"le":null,"n":"Comprendre le rangement nexo","ne":"Understand nexo filing","s":"Rangement","se":"Filing"},{"g":"dico","u":"lexique","ue":"glossary","l":"/lexique/","le":"/en/glossary/","n":"Chercher un mot","ne":"Look up a word","s":"Lexique","se":"Glossary"},{"g":"dico","u":null,"ue":null,"l":null,"le":null,"n":"Chercher un code MCC, devise ou pays","ne":"Look up an MCC, currency or country code","s":"","se":""}];
  var GROUPS = {"emv":["EMV","EMV"],"nexo":["nexo","nexo"],"iso":["ISO 8583","ISO 8583"],"conv":["Conversions","Conversions"],"ctrl":["Contrôles","Checks"],"dico":["Dictionnaires","Dictionaries"]};
  var LABELS = {"fr":{"all":"Tous les outils","close":"Fermer","soon":"à venir","index":"Voir la boîte à outils","aria":"Les outils"},"en":{"all":"All tools","close":"Close","soon":"coming","index":"See the toolkit","aria":"The tools"}};
  var BASE   = {"fr": "/outils/", "en": "/en/tools/"};
  var CSS    = ".pdbar{--pd-ink:#0E1B2C;--pd-soft:#4A5A70;--pd-cobalt:#1F4FD8;--pd-mint:#17B587;\n  --pd-mint-deep:#0E9270;--pd-coral:#E85C4A;--pd-line:#D8DEE9;\n  position:relative;display:flex;gap:9px;align-items:center;flex-wrap:wrap;\n  font-family:'Instrument Sans',system-ui,sans-serif;margin:0 0 22px}\n.pdbar *{box-sizing:border-box}\n.pdbar-cur{display:inline-flex;align-items:center;gap:7px;font-family:'JetBrains Mono',monospace;\n  font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:var(--pd-soft);\n  background:#FBFCFE;border:1px solid var(--pd-line);border-radius:9px;padding:7px 12px;\n  max-width:100%;min-width:0}\n.pdbar-cur a{color:var(--pd-soft);text-decoration:none;border-bottom:1px dotted var(--pd-line)}\n.pdbar-cur a:hover{color:var(--pd-cobalt);border-bottom-color:var(--pd-cobalt)}\n.pdbar-cur b{color:var(--pd-ink);font-weight:700;overflow:hidden;text-overflow:ellipsis;\n  white-space:nowrap;min-width:0}\n.pdbar-cur .sep{opacity:.5}\n.pdbar-btn{appearance:none;border:1px solid var(--pd-line);background:#fff;cursor:pointer;\n  font:inherit;font-size:13px;font-weight:600;color:var(--pd-ink);padding:8px 14px;\n  border-radius:9px;display:inline-flex;align-items:center;gap:7px}\n.pdbar-btn:hover{border-color:var(--pd-cobalt);color:var(--pd-cobalt)}\n.pdbar-btn:focus-visible{outline:3px solid var(--pd-cobalt);outline-offset:2px}\n.pdbar-btn svg{width:11px;height:11px;stroke:currentColor;fill:none;stroke-width:2.4;\n  transition:transform .16s ease}\n.pdbar-btn[aria-expanded=\"true\"] svg{transform:rotate(180deg)}\n.pdbar-panel{position:absolute;top:calc(100% + 8px);left:0;right:0;z-index:60;background:#fff;\n  border:1px solid var(--pd-line);border-radius:14px;box-shadow:0 14px 34px rgba(14,27,44,.17);\n  padding:16px;display:none;gap:16px;grid-template-columns:1fr}\n@media (min-width:620px){ .pdbar-panel{grid-template-columns:repeat(2,1fr)} }\n@media (min-width:900px){ .pdbar-panel{grid-template-columns:repeat(3,1fr)} }\n.pdbar.open .pdbar-panel{display:grid}\n.pdbar-panel h2{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.11em;\n  text-transform:uppercase;color:var(--pd-cobalt);margin:0 0 6px;font-weight:500}\n.pdbar-panel a{display:block;font-size:13.5px;color:var(--pd-ink);text-decoration:none;\n  padding:6px 9px;border-radius:8px;line-height:1.35}\n.pdbar-panel a:hover{background:#F2F5FA}\n.pdbar-panel a:focus-visible{outline:2px solid var(--pd-cobalt);outline-offset:-1px}\n.pdbar-panel a[aria-current]{background:#EAF7F2;color:var(--pd-mint-deep);font-weight:600}\n.pdbar-panel span.pdbar-soon{display:block;font-size:13.5px;color:var(--pd-soft);opacity:.55;\n  padding:6px 9px;line-height:1.35}\n.pdbar-panel span.pdbar-soon i{font-style:normal;font-family:'JetBrains Mono',monospace;\n  font-size:9.5px;letter-spacing:.07em;text-transform:uppercase;color:var(--pd-coral)}\n.pdbar-foot{grid-column:1/-1;border-top:1px solid var(--pd-line);padding-top:11px;margin-top:2px}\n.pdbar-foot a{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:600;\n  color:var(--pd-cobalt);padding:0}\n.pdbar-foot a:hover{background:transparent;text-decoration:underline}";

  var me = document.currentScript;
  if (!me) return;
  var slug = me.getAttribute('data-tool') || '';
  var lang = (document.documentElement.lang || 'fr').slice(0, 2).toLowerCase();
  if (!BASE[lang]) lang = 'fr';
  var L = LABELS[lang], base = BASE[lang];

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function nameOf(t)  { return lang === 'fr' ? t.n  : t.ne; }
  function shortOf(t) { return lang === 'fr' ? t.s  : t.se; }
  function slugOf(t)  { return lang === 'fr' ? t.u  : t.ue; }
  /* l'adresse vient du catalogue, jamais du slug : un outil peut avoir un
     slug (ou il ira) sans avoir de page (ou il est). */
  function hrefOf(t)  { return lang === 'fr' ? t.l  : t.le; }
  function groupOf(g) { return lang === 'fr' ? GROUPS[g][0] : GROUPS[g][1]; }

  /* la feuille n'est posée qu'une fois, même si la barre l'était deux fois */
  if (!document.getElementById('pdbar-css')) {
    var st = document.createElement('style');
    st.id = 'pdbar-css';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  var cur = null;
  for (var i = 0; i < TOOLS.length; i++) {
    if (slugOf(TOOLS[i]) === slug) { cur = TOOLS[i]; break; }
  }

  /* ---- la pastille de position ---- */
  var head = '';
  if (cur) {
    head = '<span class="pdbar-cur">' +
             '<a href="' + base + '#' + cur.g + '">' + esc(groupOf(cur.g)) + '</a>' +
             '<span class="sep">&middot;</span>' +
             '<b>' + esc(shortOf(cur) || nameOf(cur)) + '</b>' +
           '</span>';
  }

  /* ---- le catalogue complet, par groupe ---- */
  var cols = '';
  Object.keys(GROUPS).forEach(function (g) {
    var rows = '';
    TOOLS.forEach(function (t) {
      var u = hrefOf(t);
      if (t.g !== g) return;
      if (!u) {
        rows += '<span class="pdbar-soon">' + esc(nameOf(t)) +
                ' <i>' + L.soon + '</i></span>';
      } else if (t === cur) {
        rows += '<a href="' + u + '" aria-current="page">' + esc(nameOf(t)) + '</a>';
      } else {
        rows += '<a href="' + u + '">' + esc(nameOf(t)) + '</a>';
      }
    });
    cols += '<div><h2>' + esc(groupOf(g)) + '</h2>' + rows + '</div>';
  });

  var bar = document.createElement('nav');
  bar.className = 'pdbar';
  bar.setAttribute('aria-label', L.aria);
  bar.innerHTML =
    head +
    '<button type="button" class="pdbar-btn" aria-expanded="false" aria-controls="pdbar-panel">' +
      esc(L.all) +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 9 7 7 7-7"/></svg>' +
    '</button>' +
    '<div class="pdbar-panel" id="pdbar-panel">' + cols +
      '<div class="pdbar-foot"><a href="' + base + '">' + esc(L.index) + ' &rarr;</a></div>' +
    '</div>';

  me.parentNode.insertBefore(bar, me);

  var btn = bar.querySelector('.pdbar-btn');

  function open(v) {
    bar.classList.toggle('open', v);
    btn.setAttribute('aria-expanded', v ? 'true' : 'false');
  }
  btn.addEventListener('click', function () {
    open(!bar.classList.contains('open'));
  });
  /* Échap referme et rend le focus : sans ça, le panneau piège le clavier. */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && bar.classList.contains('open')) {
      open(false); btn.focus();
    }
  });
  document.addEventListener('click', function (e) {
    if (!bar.contains(e.target)) open(false);
  });
  /* un clic sur un lien du panneau navigue : inutile de le refermer,
     mais on le fait pour le cas d'un lien vers la page courante */
  bar.querySelector('.pdbar-panel').addEventListener('click', function (e) {
    if (e.target.closest('a')) open(false);
  });
})();
