# TRD · Petits pas

> Technical Requirements Document : le *comment*. **Source de vérité pour les choix techniques.**
> Une nouvelle décision technique = un nouvel ADR au §5, jamais une modification silencieuse.

## 1. Stack

| Couche | Choix | Version |
| --- | --- | --- |
| Front | HTML, CSS et JavaScript natifs (modules ES), sans framework ni étape de build | — |
| Back | Aucun en V1 : données dans le `localStorage` (PRD §11) | — |
| Hébergement | GitHub Pages, branche `main`, dossier racine | — |

## 2. Commandes

| Usage | Commande |
| --- | --- |
| Lancer en local | `npx serve .` (ou, sans Node : `python3 -m http.server 8000`) |
| Tests | Aucun outil : tests manuels, voir §7 |
| Lint | Aucun outil : HTML vérifié à la main sur validator.w3.org avant la mise en ligne |

> Les modules ES ne se chargent pas en `file://` : ouvrir l'app via le serveur local, pas en double-cliquant sur `index.html`.
> Après une modification d'un script, recharger sans cache (Cmd+Maj+R ou Ctrl+Maj+R) : sinon le navigateur peut garder l'ancienne version d'un module.

## 3. Architecture

```text
app-petits-pas/
├── index.html              structure de l'écran unique (APP_FLOW §3.1)
├── favicon.svg             icône d'onglet, seule image de l'app (PRD §11)
├── styles/
│   ├── tokens.css          tokens du design system, seul endroit où vivent les valeurs
│   └── base.css            reset léger, typographie, mise en page globale
├── components/
│   ├── button.css          boutons (primaire, secondaire, discret)
│   ├── form.css            champ texte, label, message d'erreur
│   ├── filters.css         groupe de filtres à bascule
│   └── habit-item.css      ligne d'habitude (case + nom + supprimer)
├── scripts/
│   ├── habitudes.js        logique pure : validation, dates, filtres, progression
│   ├── stockage.js         lecture et écriture du localStorage, avec repli en mémoire
│   └── app.js              point d'entrée : événements, rendu du DOM, messages
└── docs/
```

- Tout s'exécute côté client. Il n'y a aucun code serveur.
- `habitudes.js` ne touche ni au DOM ni au `localStorage` : il reçoit des données et en renvoie.
- `stockage.js` est le seul fichier qui lit ou écrit le `localStorage` (BACKEND_SCHEMA §2).
- `app.js` est le seul fichier qui touche au DOM. Il construit les éléments avec `createElement` et `textContent`, jamais `innerHTML`.
- Un fichier CSS de composant n'utilise que des tokens de `styles/tokens.css`.

## 4. Conventions

- Nommage : fichiers en kebab-case ; classes CSS en BEM (`habit-item__name`, `button--primary`) ; fonctions JS en camelCase.
- Commits : `type(EX-xxx): description`, par exemple `feat(EX-001): formulaire d'ajout d'une habitude`.
- Langue du code et des commentaires : français, avec les noms de champs de BACKEND_SCHEMA (`nom`, `faitLe`, `creeLe`).

## 5. Décisions techniques (ADR)

### ADR-001 · Pas de framework ni de build

- **Contexte** : une seule page, sept exigences, une journée pour livrer, un poids de page inférieur à 100 Ko (PRD §6).
- **Décision** : HTML, CSS et JavaScript natifs, chargés en modules ES. Aucune dépendance, aucun bundler.
- **Alternatives écartées** : React ou Vue (poids, outillage, aucun besoin de composants réactifs à cette échelle) ; Vite (une étape de build inutile pour trois scripts).
- **Conséquences** : rien à installer et un site déployable tel quel. En revanche, le rendu du DOM s'écrit à la main et la page doit être servie en HTTP (pas en `file://`).

### ADR-002 · Stockage dans le `localStorage`

- **Contexte** : pas de backend en V1 (PRD §11) ; les habitudes doivent survivre à un rechargement (EX-007).
- **Décision** : une seule clé `petits-pas:v1`, qui contient le tableau JSON décrit dans BACKEND_SCHEMA. On l'écrit en entier à chaque changement. Chaque accès passe par un `try/catch` ; en cas d'échec, l'app continue en mémoire et affiche une note discrète.
- **Alternatives écartées** : IndexedDB (API plus lourde, sans gain pour quelques dizaines d'habitudes) ; un backend (hors périmètre).
- **Conséquences** : rien ne quitte le navigateur (RGPD), et c'est simple. En revanche, les données sont perdues si l'utilisatrice vide son navigateur (risque accepté, PRD §9) et il n'y a pas de synchronisation entre appareils. Le `v1` de la clé permet de migrer plus tard.

### ADR-003 · Déploiement sur GitHub Pages

- **Contexte** : un site statique, à mettre en ligne gratuitement le jour même (PRD §7).
- **Décision** : GitHub Pages, publication depuis la branche `main`, dossier `/ (root)`. `index.html` est à la racine et tous les chemins sont relatifs (`./styles/tokens.css`).
- **Alternatives écartées** : Netlify ou Vercel (compte en plus, sans gain ici).
- **Conséquences** : l'app est servie en HTTPS, ce qui convient à `crypto.randomUUID()`. Un chemin absolu (`/styles/…`) casserait le site, car il est servi sous `/<nom-du-depot>/`.

### ADR-004 · « Aujourd'hui » en date locale, calculé et non stocké

- **Contexte** : RM-01, RM-02 et RM-04. `toISOString()` renvoie une date UTC, fausse autour de minuit en France (risque du PRD §9).
- **Décision** : `dateLocale()` construit `AAAA-MM-JJ` à partir de `getFullYear()`, `getMonth() + 1` et `getDate()`. Une habitude est faite aujourd'hui si `faitLe === dateLocale()`. Rien n'est remis à zéro dans le stockage : le changement de jour suffit.
- **Alternatives écartées** : stocker un booléen `fait` et le remettre à zéro chaque jour (il faut détecter le changement de jour, ce qui est fragile) ; une bibliothèque de dates (une dépendance inutile).
- **Conséquences** : la remise à zéro quotidienne est automatique, même si l'app reste fermée plusieurs jours. Si l'onglet reste ouvert après minuit, la liste est redessinée quand la page redevient visible (`visibilitychange`), par exemple quand on rouvre le navigateur sur mobile le lendemain. Si la page reste affichée au premier plan pendant minuit, l'affichage n'est à jour qu'à la prochaine action, ce qui est accepté en V1. Décocher remet `faitLe` à `null` : la validation précédente n'est pas conservée (aucun historique en V1, PRD §4.2).

## 6. Sécurité

- Aucun secret : l'app n'en a pas besoin.
- Pas de serveur : toute entrée est validée côté client (RD-01, RD-02). Les données relues du `localStorage` sont aussi revalidées : on écarte toute entrée dont la forme ne correspond pas à BACKEND_SCHEMA.
- Aucun `innerHTML` : les noms d'habitudes sont affichés avec `textContent`.
- CSP dans une balise `<meta>` de `index.html` : `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'`. Donc aucun script ni style en ligne.

## 7. Tests

- Tests manuels, critère d'acceptation par critère d'acceptation, à la fin de chaque lot. On les fait aussi au clavier seul.
- Navigateurs : Firefox et Chrome sur ordinateur, plus la vue responsive à 320 px.
- Cas à tester à chaque fois que la logique de date ou de stockage change :
  - **Changement de jour (RM-01, RM-02)** : dans les DevTools (Application › Local Storage), remplacer `faitLe` par la date d'hier, puis recharger. L'habitude doit être à faire.
  - **Stockage illisible** : remplacer la valeur de `petits-pas:v1` par `abc`, puis recharger. L'app repart d'une liste vide, sans erreur.
  - **Stockage indisponible (EX-007)** : navigation privée avec le stockage bloqué. L'app fonctionne et affiche la note discrète.
- Avant la mise en ligne : skill `audit-rgaa`, Lighthouse (accessibilité ≥ 95) et poids de la page < 100 Ko (onglet Réseau).

## 8. Déploiement

- Où : GitHub Pages, depuis `main`, dossier `/ (root)` (ADR-003).
- Comment : `git push` sur `main`. Pages publie en une à deux minutes.
- Qui valide : une relecture humaine avant tout push (AGENTS.md). Après la publication, on refait le test de persistance en ligne : ajouter une habitude, recharger, elle doit être là.
