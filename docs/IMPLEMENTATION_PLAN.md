# IMPLEMENTATION_PLAN · Petits pas

> Phases, lots, gates et Definition of Done. L'agent travaille un lot à la fois, et un lot n'est fini que lorsque sa Definition of Done est remplie.

## 1. Phases

| Phase | Objectif | Gate pour passer à la suite |
| --- | --- | --- |
| 0 · Fondations | Structure des fichiers, tokens, page vide accessible | La page s'ouvre via `npx serve .` sans erreur dans la console ; PRD et TRD relus |
| 1 · MVP | Toutes les exigences EX-001 à EX-007, les « Haute » d'abord | Chaque exigence passe ses critères d'acceptation, testés à la main et au clavier |
| 2 · Finitions | Audit RGAA, éco-conception, responsive | Aucune non-conformité bloquante ; Lighthouse accessibilité ≥ 95 ; page < 100 Ko ; utilisable à 320 px |
| 3 · Mise en ligne | Déploiement sur GitHub Pages | Validation humaine avant le push ; test de persistance refait en ligne |
| 4 · Pour aller plus loin | Exigences ajoutées après la V1 (PRD §11) | Mêmes critères que la phase 1, et les données v1 déjà en ligne restent lisibles |

## 2. Lots

| Lot | Phase | Contenu | Exigences | Statut |
| --- | --- | --- | --- | --- |
| L0.1 | 0 | Arborescence du TRD §3 ; `styles/tokens.css` (tous les tokens du DESIGN_SYSTEM) et `styles/base.css` ; `index.html` avec `lang="fr"`, la CSP, le `h1`, les deux `h2`, les zones vides de l'APP_FLOW §3.1 et la zone `role="status"` ; scripts vides branchés en modules | — | Fait, à relire |
| L1.1 | 1 | Ajout et liste : `validerNom` dans `habitudes.js` (vide, plus de 60 caractères, doublon sans tenir compte des majuscules, espaces retirés) ; formulaire avec erreur reliée ; rendu de la liste en `textContent` ; état « liste vide » ; message « Habitude ajoutée » | EX-001, EX-002, RD-01, RD-02 | Fait, à relire |
| L1.2 | 1 | Persistance : `stockage.js` (clé `petits-pas:v1`, `try/catch`, revalidation des données relues, repli en mémoire, note discrète si le stockage est indisponible) | EX-007 | Fait, à relire |
| L1.3 | 1 | Cocher : `dateLocale()` et `estFaiteAujourdhui()` (ADR-004) ; case à cocher par habitude ; cocher et décocher sont enregistrés et annoncés | EX-003, RM-01 à RM-04 | Fait, à relire |
| L1.4 | 1 | Progression : « X habitudes sur Y faites aujourd'hui » dans l'en-tête, mise à jour à chaque changement ; état « Tout est fait pour aujourd'hui » ; date du jour en toutes lettres (APP_FLOW §3.1) | EX-006 | Fait, à relire |
| L1.5 | 1 | Supprimer : bouton dont le nom accessible contient le nom de l'habitude ; message « Habitude supprimée » ; focus sur l'habitude suivante, ou sur le titre « Mes habitudes » (`tabindex="-1"`) | EX-004 | Fait, à relire |
| L1.6 | 1 | Filtres : Toutes, À faire, Faites aujourd'hui ; `aria-pressed` ; annonce du nombre d'habitudes affichées ; état « Aucune habitude dans cette catégorie » | EX-005 | Fait, à relire |
| L2.1 | 2 | Audit RGAA avec le skill `audit-rgaa`, puis correctifs ; Lighthouse ; poids de la page ; test à 320 px et des cibles de 44 px ; validation HTML W3C | PRD §6 | Fait, à relire (Lighthouse : 100 dans les quatre catégories après l'ajout du favicon ; HTML validé par tidy 5.8) |
| L3.1 | 3 | Dépôt GitHub, publication sur Pages (TRD §8) ; test en ligne : ajouter, cocher, recharger | PRD §7 | Fait : https://biggestmathematician.github.io/petits-pas/ |
| L4.1 | 4 | Série de jours consécutifs : champ `jours`, stockage v2 et migration depuis v1, élagage, affichage « Série de N jours » relié à la case, annonce à partir de 2 jours | EX-008, RM-05 | Fait, à relire (en local, pas encore en ligne) |

> Un lot doit tenir en une conversation, soit 10 à 15 minutes. Trop gros ? Découpez-le.
> L'ordre suit le conseil du tuto : l'ajout et la liste ensemble, puis la persistance tout de suite, pour ne pas perdre les données de test.

## 3. Definition of Done

Un lot est terminé quand :

- [ ] Tous les critères d'acceptation des exigences liées sont remplis
- [ ] Les tests manuels du TRD §7 concernés par le lot passent, à la souris et au clavier seul
- [ ] Aucune erreur dans la console du navigateur
- [ ] Le skill d'audit RGAA ne signale aucune non-conformité bloquante
- [ ] Aucune valeur en dur : uniquement des tokens
- [ ] Aucune dépendance ajoutée sans justification
- [ ] Aucun `innerHTML` ; chemins relatifs uniquement
- [ ] Les docs sont à jour (APP_FLOW, ADR si nouvelle décision, statut du lot ci-dessus)
- [ ] Le commit cite l'identifiant de l'exigence
- [ ] Une relecture humaine a validé le code
