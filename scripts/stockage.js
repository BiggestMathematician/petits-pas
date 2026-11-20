// Lecture et écriture du localStorage, avec repli en mémoire (TRD §3, ADR-002, BACKEND_SCHEMA §2).
// Seul fichier autorisé à toucher au localStorage.

import { NOM_MAX } from './habitudes.js';

/** Clé unique de stockage (BACKEND_SCHEMA §1). */
const CLE = 'petits-pas:v1';
const CLE_TEST = 'petits-pas:test';

const FORMAT_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Vérifie qu'une entrée relue a la forme décrite dans BACKEND_SCHEMA §1. */
function estHabitudeValide(entree) {
  if (typeof entree !== 'object' || entree === null) return false;
  const { id, nom, faitLe, creeLe } = entree;
  return (
    typeof id === 'string' && id !== '' &&
    typeof nom === 'string' && nom.trim() !== '' && nom.length <= NOM_MAX && nom === nom.trim() &&
    (faitLe === null || (typeof faitLe === 'string' && FORMAT_DATE.test(faitLe))) &&
    typeof creeLe === 'string' && creeLe !== ''
  );
}

/**
 * Ne garde que les habitudes valides, sans doublon d'identifiant ni de nom (RD-02).
 * En cas de doublon, la première habitude, la plus ancienne, est conservée.
 */
function nettoyer(donnees) {
  if (!Array.isArray(donnees)) return [];
  const ids = new Set();
  const noms = new Set();
  const habitudes = [];
  for (const entree of donnees) {
    if (!estHabitudeValide(entree)) continue;
    const nomCle = entree.nom.toLocaleLowerCase('fr');
    if (ids.has(entree.id) || noms.has(nomCle)) continue;
    ids.add(entree.id);
    noms.add(nomCle);
    // On ne recopie que les champs connus.
    habitudes.push({ id: entree.id, nom: entree.nom, faitLe: entree.faitLe, creeLe: entree.creeLe });
  }
  return habitudes;
}

/** Teste que le stockage accepte une écriture (il peut être bloqué ou plein). */
function stockageDisponible() {
  try {
    window.localStorage.setItem(CLE_TEST, CLE_TEST);
    window.localStorage.removeItem(CLE_TEST);
    return true;
  } catch {
    return false;
  }
}

/**
 * Charge les habitudes (EX-007).
 * Renvoie { habitudes, disponible }. Une valeur illisible donne une liste vide, sans planter.
 */
export function charger() {
  if (!stockageDisponible()) {
    return { habitudes: [], disponible: false };
  }
  try {
    const brut = window.localStorage.getItem(CLE);
    if (brut === null) return { habitudes: [], disponible: true };
    return { habitudes: nettoyer(JSON.parse(brut)), disponible: true };
  } catch {
    // JSON illisible : on repart d'une liste vide (BACKEND_SCHEMA §2).
    return { habitudes: [], disponible: true };
  }
}

/** Enregistre toute la liste. Renvoie false si l'écriture a échoué. */
export function enregistrer(habitudes) {
  try {
    window.localStorage.setItem(CLE, JSON.stringify(habitudes));
    return true;
  } catch {
    return false;
  }
}
