# BACKEND_SCHEMA · Petits pas

> **Aucun backend en V1** (PRD §11). Les données vivent dans le `localStorage` du navigateur. N'ajoute ni serveur, ni base de données, ni API.

## 1. Stockage local

- **Clé** : `petits-pas:v2`
- **Valeur** : un tableau JSON d'habitudes, dans l'ordre d'ajout.

| Champ | Type | Obligatoire | Description |
| --- | --- | --- | --- |
| id | texte | Oui | Identifiant unique, par exemple `crypto.randomUUID()` |
| nom | texte | Oui | 60 caractères maximum, unique sans tenir compte des majuscules (RD-01, RD-02) |
| jours | tableau de textes | Oui | Dates locales `AAAA-MM-JJ` de la **série en cours** seulement (RM-05), triées, sans doublon, consécutives. Tableau vide si l'habitude n'a pas de série en cours |
| creeLe | texte | Oui | Date et heure de création, au format ISO |

Exemple, le 20 novembre, pour une habitude faite les 18, 19 et 20 :

```json
[
  { "id": "9c1e", "nom": "Boire 1,5 L d'eau", "jours": ["2026-11-18", "2026-11-19", "2026-11-20"], "creeLe": "2026-11-18T08:05:00.000Z" }
]
```

Rien d'autre n'est stocké, tout se calcule à partir de `jours` et de la date locale du jour (RM-04) :

- **fait aujourd'hui** (RM-01) : la dernière date de `jours` est aujourd'hui ;
- **série** (RM-05) : la longueur de `jours` si sa dernière date est aujourd'hui ou hier, sinon 0.

**Élagage** : au chargement et à chaque coche, on ne garde que la suite de dates consécutives qui se termine aujourd'hui ou hier. Une série cassée est vidée : les anciennes séries ne sont pas conservées (PRD §11).

## 2. Règles d'accès au stockage

- Toute lecture et toute écriture du `localStorage` passent par un `try/catch` : s'il est indisponible, l'app continue en mémoire (EX-007).
- Une valeur illisible est ignorée : on repart d'une liste vide, sans planter.
- Les données relues sont revalidées : dates mal formées, doublons et désordre dans `jours` sont corrigés.

## 3. Migration depuis `petits-pas:v1`

La V1 stockait `faitLe` (dernière date de validation, ou `null`) à la place de `jours`.

- Au chargement, si `petits-pas:v2` n'existe pas et que `petits-pas:v1` existe, chaque habitude est convertie : `jours = faitLe ? [faitLe] : []`.
- Le résultat est écrit dans `petits-pas:v2`, puis `petits-pas:v1` est supprimée.
- Si l'écriture échoue, `petits-pas:v1` est gardée, et l'app continue avec les données converties en mémoire.

## 4. Données personnelles (RGPD)

| Donnée | Pourquoi on la garde | Durée de conservation |
| --- | --- | --- |
| Noms des habitudes | Afficher la liste | Jusqu'à ce que l'utilisatrice les supprime ou vide les données de son navigateur |
| Dates de la série en cours | Afficher l'état du jour et la série | Effacées dès que la série se casse ; sinon comme ci-dessus |

Aucune donnée ne quitte le navigateur.
