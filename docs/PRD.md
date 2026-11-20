# PRD · Petits pas

> Product Requirements Document : le *quoi* et le *pourquoi*. **Source de vérité pour les règles métier.**
> On ne le modifie qu'après une décision, notée au §11.

## 1. Contexte

Beaucoup de gens veulent installer de petites habitudes quotidiennes : boire de l'eau, marcher, lire dix pages. Les applications existantes sont souvent lourdes, pleines de notifications et demandent un compte.

## 2. Problème à résoudre

On oublie ses habitudes en cours de journée, et on ne sait pas, le soir, ce qu'on a fait ou non.

## 3. Utilisateurs

| Profil | Besoin principal | Contexte d'usage |
| --- | --- | --- |
| Personne qui veut installer une routine | Cocher ce qu'elle a fait aujourd'hui, en quelques secondes | Sur mobile, plusieurs fois par jour |

## 4. Périmètre

### 4.1 Dans la V1

- Ajouter une habitude, la cocher pour aujourd'hui, la supprimer.
- Filtrer les habitudes à faire et celles faites aujourd'hui.
- Voir combien d'habitudes sont faites aujourd'hui.

### 4.2 Hors périmètre

- Compte utilisateur et synchronisation entre appareils : pas de backend en V1.
- Notifications et rappels.
- Historique détaillé et graphiques.

## 5. Exigences

### 5.1 Règles métier

| ID | Règle | Exemple |
| --- | --- | --- |
| RM-01 | Une habitude est « faite aujourd'hui » si sa dernière validation date d'aujourd'hui | Validée hier à 22 h : à faire aujourd'hui |
| RM-02 | Chaque nouveau jour, toutes les habitudes redeviennent « à faire », sans action de l'utilisatrice | — |
| RM-03 | On peut annuler la validation du jour | Cochée par erreur, puis décochée |
| RM-04 | « Aujourd'hui » se calcule avec la date locale de l'appareil, pas en UTC | — |

### 5.2 Règles de données et de validation

| ID | Donnée | Règle |
| --- | --- | --- |
| RD-01 | Nom de l'habitude | Obligatoire, 60 caractères maximum, espaces en début et fin retirés |
| RD-02 | Doublons | Interdits : deux habitudes ne peuvent pas avoir le même nom, sans tenir compte des majuscules |

### 5.3 Exigences fonctionnelles

| ID | Besoin | Critères d'acceptation | Priorité |
| --- | --- | --- | --- |
| EX-001 | En tant qu'utilisatrice, je veux ajouter une habitude, afin de la suivre | Un champ « Nom de l'habitude » avec un label visible ; un nom vide, trop long ou déjà utilisé affiche une erreur sous le champ et garde le focus dessus ; un ajout réussi place l'habitude en bas de la liste, vide le champ et annonce « Habitude ajoutée » | Haute |
| EX-002 | Je veux voir mes habitudes, afin de savoir ce qui reste à faire | Chaque habitude affiche son nom et son état du jour ; liste vide : « Aucune habitude pour l'instant. Ajoutez la première. » | Haute |
| EX-003 | Je veux cocher une habitude pour aujourd'hui, afin de suivre ma journée | Chaque habitude a une case à cocher dont le label est son nom ; cocher ou décocher est immédiat et annoncé | Haute |
| EX-004 | Je veux supprimer une habitude, afin de garder une liste utile | Bouton « Supprimer » dont le nom accessible contient le nom de l'habitude ; l'habitude disparaît, la suppression est annoncée, le focus va sur l'habitude suivante ou sur le titre de la liste | Moyenne |
| EX-005 | Je veux filtrer mes habitudes, afin de voir ce qui reste | Filtres Toutes, À faire, Faites aujourd'hui ; le filtre actif est indiqué (`aria-pressed`) ; le nombre de résultats est annoncé ; un filtre sans résultat affiche un message dédié | Moyenne |
| EX-006 | Je veux voir ma progression du jour, afin de rester motivée | « X habitudes sur Y faites aujourd'hui » en haut de page, mis à jour à chaque changement | Moyenne |
| EX-007 | Je veux retrouver mes habitudes en revenant, afin de ne rien perdre | Après un rechargement, les habitudes et les validations du jour sont là ; si le stockage est indisponible, l'app fonctionne quand même et le signale discrètement | Haute |

> Une exigence = un identifiant stable. Le code, les commits et le plan d'implémentation y renvoient.

## 6. Exigences non fonctionnelles

| Domaine | Exigence |
| --- | --- |
| Accessibilité | RGAA : labels visibles, tout au clavier avec focus visible, contraste du texte d'au moins 4,5:1, messages de statut annoncés (`role="status"`), un seul `h1` |
| Éco-conception | Aucune dépendance, aucune image ; poids total de la page inférieur à 100 Ko |
| Responsive | Utilisable dès 320 px de large, cases faciles à toucher (44 px minimum) |
| Sécurité | Les textes saisis sont affichés avec `textContent`, jamais `innerHTML` |
| RGPD | Les données restent dans le navigateur ; rien n'est envoyé à un serveur |

## 7. Indicateurs de succès

- L'app est en ligne sur GitHub Pages à la fin de la journée.
- Score d'accessibilité Lighthouse d'au moins 95.

## 8. Hypothèses

- Une seule personne utilise l'app par navigateur.

## 9. Risques

| Risque | Probabilité | Parade |
| --- | --- | --- |
| Erreur de date autour de minuit (UTC au lieu de l'heure locale) | Moyenne | RM-04 ; tester en changeant la date de validation dans le stockage |
| Perte des données si l'utilisatrice vide les données de son navigateur | Moyenne | Accepté en V1 (voir §11) |

## 10. Questions ouvertes

- [ ] Faut-il pouvoir réordonner les habitudes ? Par défaut : non en V1.

## 11. Journal des décisions

| Date | Décision | Pourquoi | Impacts |
| --- | --- | --- | --- |
| 2026-11-20 | Pas de backend : données dans le `localStorage` | Livrer la V1 en une journée | `BACKEND_SCHEMA.md` décrit le stockage local |
| 2026-11-20 | Pas de notifications | Réduire le périmètre, rester sobre | — |
| 2026-11-20 | Exception à « aucune image » (§6) : un favicon SVG de moins de 300 octets | Sans icône déclarée, le navigateur demande `/favicon.ico`, reçoit une 404 et l'écrit dans la console (Lighthouse, bonnes pratiques : 96) | `favicon.svg` à la racine ; ses couleurs reprennent les tokens, écrites en dur car un SVG externe ne lit pas les variables CSS |

## Pour aller plus loin (si vous êtes en avance)

- EX-008 : afficher la série de jours consécutifs pour chaque habitude.
- EX-009 : renommer une habitude.
