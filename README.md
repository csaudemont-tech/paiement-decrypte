# Paiement Décrypté — site de diffusion

Micro-formations interactives de vulgarisation paiement, ~5 minutes par épisode.
Site 100 % statique : aucun serveur, aucune base de données à maintenir.

## Structure

```
paiement-decrypte/
├── index.html          landing : promesse + épisodes + formulaire email
├── episodes/
│   └── s1e01.html      S1E01 · Les schemes de paiement (v3, autonome)
│   └── s01.html        redirection vers s1e01.html (ancien lien du test collègues)
├── assets/             (session 2 : telemetry.js + progress.js)
└── README.md
```

## Déploiement — GitHub Pages, pas à pas (~15 min)

⚠️ Compte GitHub **perso**, jamais celui du travail. Le repo sera **public**
(GitHub Pages gratuit l'exige) : n'y mettre que du contenu destiné à être publié.

1. **Créer le repo** : github.com → bouton **New repository** →
   nom : `paiement-decrypte` → visibilité : **Public** → ne rien cocher d'autre → **Create**.
2. **Envoyer les fichiers** (sans ligne de commande) : dans le repo vide,
   lien **uploading an existing file** → glisser-déposer `index.html`, `README.md`
   et le dossier `episodes/` (glisser le dossier entier depuis l'explorateur) →
   **Commit changes**.
3. **Activer Pages** : onglet **Settings** → menu **Pages** →
   Source : **Deploy from a branch** → Branch : `main`, dossier `/ (root)` → **Save**.
4. **Attendre ~2 min**, puis ouvrir :
   `https://<ton-pseudo>.github.io/paiement-decrypte/`
   → vérifier sur **téléphone** : landing OK, épisode S1E01 jouable de bout en bout.

Chaque mise à jour = re-glisser le fichier modifié (ou `git push`) : le site
se redéploie tout seul en ~1 min.

## Télémétrie (session 2 — fait)

`assets/telemetry.js` émet des événements **anonymes, sans cookie** :
`ep_start`, `screen_view`/`screen_time` (temps par écran), `quiz_answer`
(bonne/mauvaise), `interactive_used`, `drop` (abandon + dernier écran vu),
`complete` (score + temps), `resume`, `share`.
Tant que `ENDPOINT` est vide dans `telemetry.js`, les événements s'affichent
seulement dans la console du navigateur (F12) — rien n'est envoyé.
`assets/progress.js` gère la reprise d'épisode en localStorage (bouton
« Reprendre où j'en étais » sur la cover).

## Plus tard (ne pas faire maintenant)

- **Session 3** : créer le Google Sheet + Apps Script, coller l'URL de
  déploiement dans `ENDPOINT` (en tête de `assets/telemetry.js`).
- **Session 4** : remplacer le formulaire placeholder de `index.html`
  (marqueur `KIT_FORM` dans le code) par l'endpoint Kit.
- **Session 5 — domaine** : acheter `paiement-decrypte.fr` (OVH ou Gandi, ~8 €/an) →
  chez le registrar, créer un enregistrement **CNAME** `www` →
  `<ton-pseudo>.github.io` (+ 4 enregistrements **A** de l'apex vers les IP
  GitHub Pages, données dans Settings → Pages) → dans le repo :
  Settings → Pages → **Custom domain** : `paiement-decrypte.fr` →
  cocher **Enforce HTTPS** une fois le certificat émis (~1 h).

## Règles du repo (garde-fous projet)

- Aucun matériel employeur, jamais — le repo est public.
- Un épisode = un fichier HTML autonome dans `episodes/`. Pas de framework,
  pas de build : ce qui est dans le repo est ce qui est servi.
- Nommage des épisodes (acté 2026-08-07) : `s<saison>e<numéro>` — slug
  `s1e01.html`, tag télémétrie `s1e01` (`s1e01-en` pour /en/), numérotation
  remise à zéro à chaque saison. Ne jamais réutiliser un ancien slug :
  l'ancien `s01.html` reste en redirection.
- La télémétrie reste anonyme (pas de cookie, pas d'identifiant) —
  ne pas « améliorer » ça sans revoir le point RGPD du cadrage.
