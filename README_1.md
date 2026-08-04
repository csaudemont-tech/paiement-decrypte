# Paiement Décrypté — site de diffusion

Micro-formations interactives de vulgarisation paiement, ~5 minutes par épisode.
Site 100 % statique : aucun serveur, aucune base de données à maintenir.

## Structure

```
paiement-decrypte/
├── index.html          landing : promesse + épisodes + formulaire email
├── episodes/
│   └── s01.html        S01 · Les schemes de paiement (v3, autonome)
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
   → vérifier sur **téléphone** : landing OK, épisode S01 jouable de bout en bout.

Chaque mise à jour = re-glisser le fichier modifié (ou `git push`) : le site
se redéploie tout seul en ~1 min.

## Plus tard (ne pas faire maintenant)

- **Session 2** : `assets/telemetry.js` (événements anonymes) + `assets/progress.js`
  (progression localStorage), intégrés au template épisode.
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
- La télémétrie reste anonyme (pas de cookie, pas d'identifiant) —
  ne pas « améliorer » ça sans revoir le point RGPD du cadrage.
