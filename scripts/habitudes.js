// Logique pure : validation, dates, filtres, progression (TRD §3).
// Ne touche ni au DOM ni au localStorage : reçoit des données, en renvoie.

/** Longueur maximale d'un nom d'habitude (RD-01). */
export const NOM_MAX = 60;

/** Compare deux noms sans tenir compte des majuscules (RD-02). */
function memeNom(a, b) {
  return a.toLocaleLowerCase('fr') === b.toLocaleLowerCase('fr');
}

/**
 * Valide un nom saisi (RD-01, RD-02).
 * Renvoie { ok: true, nom } avec le nom nettoyé, ou { ok: false, erreur }.
 */
export function validerNom(saisie, habitudes) {
  const nom = String(saisie ?? '').trim();

  if (nom === '') {
    return { ok: false, erreur: 'Saisissez le nom de l’habitude.' };
  }
  if (nom.length > NOM_MAX) {
    return {
      ok: false,
      erreur: `Le nom doit faire ${NOM_MAX} caractères maximum (il en fait ${nom.length}).`,
    };
  }
  if (habitudes.some((habitude) => memeNom(habitude.nom, nom))) {
    return { ok: false, erreur: `L’habitude « ${nom} » existe déjà.` };
  }
  return { ok: true, nom };
}

/** Crée une habitude conforme à BACKEND_SCHEMA §1, jamais validée. */
export function creerHabitude(nom, maintenant = new Date()) {
  return {
    id: crypto.randomUUID(),
    nom,
    faitLe: null,
    creeLe: maintenant.toISOString(),
  };
}

/** Ajoute une habitude en bas de la liste, sans modifier la liste reçue (EX-001). */
export function ajouterHabitude(habitudes, habitude) {
  return [...habitudes, habitude];
}

/**
 * Date locale au format AAAA-MM-JJ (RM-04, ADR-004).
 * Jamais toISOString() : elle renvoie la date UTC, fausse autour de minuit.
 */
export function dateLocale(date = new Date()) {
  const annee = date.getFullYear();
  const mois = String(date.getMonth() + 1).padStart(2, '0');
  const jour = String(date.getDate()).padStart(2, '0');
  return `${annee}-${mois}-${jour}`;
}

/** Une habitude est faite aujourd'hui si sa dernière validation date d'aujourd'hui (RM-01). */
export function estFaiteAujourdhui(habitude, aujourdhui = dateLocale()) {
  return habitude.faitLe === aujourdhui;
}

/** Retire une habitude, sans modifier la liste reçue (EX-004). */
export function supprimerHabitude(habitudes, id) {
  return habitudes.filter((habitude) => habitude.id !== id);
}

/** Filtres disponibles (EX-005). La valeur est celle de l'attribut data-filtre des boutons. */
export const FILTRES = Object.freeze({
  toutes: 'toutes',
  aFaire: 'a-faire',
  faites: 'faites',
});

/** Ne garde que les habitudes du filtre demandé (EX-005). Un filtre inconnu affiche tout. */
export function filtrer(habitudes, filtre, aujourdhui = dateLocale()) {
  switch (filtre) {
    case FILTRES.aFaire:
      return habitudes.filter((habitude) => !estFaiteAujourdhui(habitude, aujourdhui));
    case FILTRES.faites:
      return habitudes.filter((habitude) => estFaiteAujourdhui(habitude, aujourdhui));
    default:
      return habitudes;
  }
}

/** « 2 habitudes affichées », « 1 habitude affichée » (EX-005). */
export function texteNombreAffichees(nombre) {
  const pluriel = nombre > 1;
  return `${nombre} habitude${pluriel ? 's' : ''} affichée${pluriel ? 's' : ''}`;
}

/** Compte les habitudes faites aujourd'hui (EX-006). */
export function progression(habitudes, aujourdhui = dateLocale()) {
  const faites = habitudes.filter((habitude) => estFaiteAujourdhui(habitude, aujourdhui)).length;
  return { faites, total: habitudes.length, toutEstFait: habitudes.length > 0 && faites === habitudes.length };
}

/**
 * Texte de la progression : « 2 habitudes sur 3 faites aujourd'hui » (EX-006).
 * L'accord suit le premier nombre : « 1 habitude sur 3 faite », « 0 habitude sur 3 faite ».
 */
export function texteProgression({ faites, total }) {
  const pluriel = faites > 1;
  return `${faites} habitude${pluriel ? 's' : ''} sur ${total} faite${pluriel ? 's' : ''} aujourd’hui`;
}

/** Date du jour en toutes lettres : « Vendredi 20 novembre 2026 ». */
export function dateEnLettres(date = new Date()) {
  const texte = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}

/**
 * Coche ou décoche une habitude pour aujourd'hui (EX-003, RM-03), sans modifier la liste reçue.
 * Décocher annule la validation du jour : faitLe repasse à null.
 */
export function basculerFait(habitudes, id, fait, aujourdhui = dateLocale()) {
  return habitudes.map((habitude) =>
    habitude.id === id ? { ...habitude, faitLe: fait ? aujourdhui : null } : habitude,
  );
}
