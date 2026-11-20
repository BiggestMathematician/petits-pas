# BACKEND_SCHEMA · Petits pas

> **Aucun backend en V1** (PRD §11). Les données vivent dans le `localStorage` du navigateur. N'ajoute ni serveur, ni base de données, ni API.

## 1. Stockage local

- **Clé** : `petits-pas:v1`
- **Valeur** : un tableau JSON d'habitudes, dans l'ordre d'ajout.

| Champ | Type | Obligatoire | Description |
| --- | --- | --- | --- |
| id | texte | Oui | Identifiant unique, par exemple `crypto.randomUUID()` |
| nom | texte | Oui | 60 caractères maximum, unique sans tenir compte des majuscules (RD-01, RD-02) |
| faitLe | texte ou `null` | Oui | Date locale de la dernière validation, au format `AAAA-MM-JJ` ; `null` si jamais validée, ou si la validation du jour a été annulée (RM-03) |
| creeLe | texte | Oui | Date et heure de création, au format ISO |

Exemple :

```json
[
  { "id": "9c1e", "nom": "Boire 1,5 L d'eau", "faitLe": "2026-11-20", "creeLe": "2026-11-20T08:05:00.000Z" }
]
```

L'état « fait aujourd'hui » n'est pas stocké : il se calcule en comparant `faitLe` à la date locale du jour (RM-01, RM-04).

## 2. Règles d'accès au stockage

- Toute lecture et toute écriture du `localStorage` passent par un `try/catch` : s'il est indisponible, l'app continue en mémoire (EX-007).
- Une valeur illisible est ignorée : on repart d'une liste vide, sans planter.

## 3. Données personnelles (RGPD)

| Donnée | Pourquoi on la garde | Durée de conservation |
| --- | --- | --- |
| Noms des habitudes et dates de validation | Afficher la journée | Jusqu'à ce que l'utilisatrice les supprime ou vide les données de son navigateur |

Aucune donnée ne quitte le navigateur.
