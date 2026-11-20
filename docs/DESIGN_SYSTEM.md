# DESIGN_SYSTEM · Petits pas

> Tokens et composants. Règle d'or : jamais de valeur en dur, et on réutilise un composant avant d'en créer un.

## 1. Tokens

Fichier source : `styles/tokens.css`

### 1.1 Couleurs

Les contrastes sont calculés selon la formule WCAG, sur le fond de page `--color-bg` et sur blanc. Seuil RGAA : 4,5:1 pour le texte, 3:1 pour les bordures et les composants d'interface.

| Token | Valeur | Usage | Contraste |
| --- | --- | --- | --- |
| `--color-bg` | `#f7f5f0` | Fond de la page | — |
| `--color-surface` | `#ffffff` | Fond des cartes, du champ et des lignes d'habitude | — |
| `--color-text` | `#1c1c1c` | Texte courant, titres | 15,6:1 sur fond · 17:1 sur blanc |
| `--color-text-muted` | `#595959` | Date du jour, note de stockage, états vides | 6,4:1 sur fond · 7:1 sur blanc |
| `--color-primary` | `#1f4e5f` | Bouton principal, filtre actif, case cochée, anneau de focus | 8,3:1 sur fond · 9,1:1 sur blanc |
| `--color-primary-hover` | `#163a47` | Survol du bouton principal | 11,1:1 sur fond · 12,1:1 sur blanc |
| `--color-on-primary` | `#ffffff` | Texte posé sur `--color-primary` | 9,1:1 |
| `--color-border` | `#767676` | Bordure du champ, des cases et des boutons secondaires | 4,2:1 sur fond · 4,5:1 sur blanc |
| `--color-success` | `#2e6b34` | Mention « Fait », message « Tout est fait » | 5,9:1 sur fond · 6,4:1 sur blanc |
| `--color-error` | `#b3261e` | Message d'erreur, bordure du champ en erreur | 6:1 sur fond · 6,5:1 sur blanc |

La couleur n'est jamais le seul indice : une habitude faite a aussi sa case cochée et la mention « Fait », et une erreur a aussi un texte.

### 1.2 Espacements

| Token | Valeur |
| --- | --- |
| `--space-1` | `0.25rem` |
| `--space-2` | `0.5rem` |
| `--space-3` | `0.75rem` |
| `--space-4` | `1rem` |
| `--space-6` | `1.5rem` |
| `--space-8` | `2rem` |

### 1.3 Typographie

| Token | Valeur | Usage |
| --- | --- | --- |
| `--font-family` | `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` | Tout le texte (police système, rien à télécharger) |
| `--font-size-sm` | `0.875rem` | Date, note de stockage, message d'erreur |
| `--font-size-md` | `1rem` | Texte courant, champs, boutons |
| `--font-size-lg` | `1.25rem` | Titres `h2` |
| `--font-size-xl` | `1.75rem` | Titre `h1` |
| `--font-weight-normal` | `400` | Texte courant |
| `--font-weight-bold` | `700` | Titres, progression |
| `--line-height` | `1.5` | Tout le texte |

### 1.4 Formes et dimensions

| Token | Valeur | Usage |
| --- | --- | --- |
| `--radius-sm` | `0.25rem` | Cases à cocher |
| `--radius-md` | `0.5rem` | Boutons, champ, lignes d'habitude |
| `--border-width` | `1px` | Bordures |
| `--focus-width` | `3px` | Épaisseur de l'anneau de focus |
| `--focus-offset` | `2px` | Écart entre l'élément et l'anneau de focus |
| `--target-min` | `2.75rem` | Hauteur et largeur minimales d'une cible tactile (44 px, PRD §6) |
| `--checkbox-size` | `1.5rem` | Taille visuelle de la case ; la zone cliquable reste à `--target-min` grâce au label |
| `--content-max` | `40rem` | Largeur maximale du contenu |

## 2. Composants

| Composant | Fichier | Variantes | Règles d'accessibilité |
| --- | --- | --- | --- |
| Bouton | `components/button.css` | primaire (« Ajouter »), secondaire (filtres), discret (« Supprimer ») | `<button>` natif ; focus visible ; hauteur ≥ `--target-min` ; libellé explicite ; pour « Supprimer », le nom accessible contient le nom de l'habitude |
| Champ de formulaire | `components/form.css` | texte (le seul champ de la V1), état erreur | Label visible ; erreur sous le champ, reliée par `aria-describedby`, avec `aria-invalid="true"` ; `maxlength` non bloquant (on affiche l'erreur plutôt que de tronquer) |
| Filtres | `components/filters.css` | bouton à bascule actif ou inactif | `role="group"` nommé « Filtrer les habitudes » ; `<button>` secondaires avec `aria-pressed` ; l'état actif se voit autrement que par la couleur (fond plein et texte en gras) ; les boutons passent à la ligne sur mobile |
| Ligne d'habitude | `components/habit-item.css` | à faire, faite aujourd'hui | `<li>` ; `<input type="checkbox">` natif entouré d'un `<label>` qui contient le nom ; sous le nom, une ligne `aria-hidden` avec la mention « Fait » ou « À faire » (la case porte déjà l'état) et « Série de N jours », reliée à la case par `aria-describedby` ; la zone du label fait au moins `--target-min` ; bouton « Supprimer » discret à droite, avec `aria-label="Supprimer <nom>"` |
| Message de statut | `styles/base.css` (`.visually-hidden`) | — | Une seule zone `role="status"`, présente dès le chargement, dont on remplace le texte à chaque action ; masquée visuellement, car chaque action a déjà un retour visible (liste, case, erreur sous le champ, état vide) |
| Note discrète | `styles/base.css` | stockage indisponible, états vides | Texte `--color-text-muted`, `--font-size-sm` ; contraste ≥ 4,5:1 |

## 3. Règles d'usage

- Un seul bouton primaire par écran : « Ajouter ».
- Le focus est toujours visible : `outline: var(--focus-width) solid var(--color-primary)` avec `outline-offset: var(--focus-offset)`, sur `:focus-visible`. On ne fait jamais de `outline: none` sans le remplacer.
- La couleur n'est jamais le seul porteur d'information (état fait, erreur, filtre actif).
- On utilise les éléments HTML natifs (`button`, `input type="checkbox"`, `label`) avant tout rôle ARIA.
- Toute taille de texte est en `rem`, pour respecter le zoom du navigateur.
- Mobile d'abord : la mise en page tient en une colonne dès 320 px, sans défilement horizontal.
- Pas d'image, pas d'icône seule, pas de police web (éco-conception, PRD §6).
- Les animations restent sobres et respectent `prefers-reduced-motion`.
