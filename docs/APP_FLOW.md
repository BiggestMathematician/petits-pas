# APP_FLOW · Petits pas

> Routes, écrans, et ce que fait chaque clic.

## 1. Plan des routes

| Route | Écran | Accès | Exigences |
| --- | --- | --- | --- |
| `index.html` | Ma journée (écran unique) | Public | EX-001 à EX-007 |

## 2. Parcours principal

1. L'utilisatrice ouvre l'app : elle voit sa progression du jour, le formulaire d'ajout et ses habitudes.
2. Elle ajoute « Boire 1,5 L d'eau » : l'habitude apparaît, à faire.
3. Dans la journée, elle coche ce qu'elle a fait : la progression se met à jour.
4. Le soir, elle filtre sur « À faire » pour voir ce qui reste.
5. Le lendemain, toutes ses habitudes sont de nouveau à faire.

## 3. Écrans

### 3.1 Ma journée

- **Rôle** : suivre ses habitudes du jour sur une seule page.
- **Zones, dans l'ordre de lecture** :
  1. En-tête : `h1` « Petits pas », date du jour en toutes lettres, progression « X habitudes sur Y faites aujourd'hui » (EX-006).
  2. Formulaire « Ajouter une habitude » : Nom de l'habitude, bouton « Ajouter » (EX-001).
  3. Filtres : Toutes, À faire, Faites aujourd'hui (EX-005).
  4. Liste des habitudes : case à cocher avec le nom, bouton « Supprimer » (EX-002 à EX-004).
  5. Zone de messages `role="status"`, partagée par toutes les actions.

| Action | Résultat |
| --- | --- |
| Clic sur « Ajouter », nom vide, trop long ou déjà pris | Erreur sous le champ, reliée par `aria-describedby`, focus sur le champ |
| Clic sur « Ajouter », nom valide | Habitude ajoutée à faire, champ vidé, focus sur le champ, message « Habitude ajoutée » ; si le filtre « Faites aujourd'hui » est actif, on repasse sur « Toutes » pour que l'habitude ajoutée soit visible |
| Case cochée | Habitude faite aujourd'hui, progression mise à jour, message « Bravo : Boire 1,5 L d'eau est fait » |
| Case décochée | Validation du jour annulée, progression mise à jour, message annoncé |
| Clic sur « Supprimer » | Habitude retirée, message « Habitude supprimée », focus sur l'habitude suivante ou sur le titre de la liste |
| Clic sur un filtre | Liste filtrée, bouton actif en `aria-pressed="true"`, message « 2 habitudes affichées » |

**États à prévoir**

- Liste vide : « Aucune habitude pour l'instant. Ajoutez la première. »
- Tout est fait : « Tout est fait pour aujourd'hui. »
- Filtre sans résultat : « Aucune habitude dans cette catégorie. »
- Stockage indisponible : l'app fonctionne, et une note discrète indique que les habitudes ne seront pas conservées.

**Accessibilité**

- Un seul `h1`, puis `h2` pour « Ajouter une habitude » et « Mes habitudes ».
- Ordre de tabulation : formulaire, filtres, puis habitudes.
- Le nom accessible du bouton de suppression contient le nom de l'habitude : « Supprimer Boire 1,5 L d'eau ».
