// Lecture et écriture du localStorage, avec repli en mémoire (TRD §3, ADR-002, ADR-005, BACKEND_SCHEMA).
// Seul fichier autorisé à toucher au localStorage.

import { NOM_MAX } from './habitudes.js';

/** Clé de stockage (BACKEND_SCHEMA §1) et ancienne clé à migrer (BACKEND_SCHEMA §3). */
const CLE = 'petits-pas:v2';
const CLE_V1 = 'petits-pas:v1';
const CLE_TEST = 'petits-pas:test';

const FORMAT_DATE = /^\d{4}-\d{2}-\d{2}$/;

function estDate(valeur) {
  return typeof valeur === 'string' && FORMAT_DATE.test(valeur);
}

/** Vérifie les champs communs à v1 et v2 (BACKEND_SCHEMA §1). */
function aLesChampsCommuns(entree) {
  if (typeof entree !== 'object' || entree === null) return false;
  const { id, nom, creeLe } = entree;
  return (
    typeof id === 'string' && id !== '' &&
    typeof nom === 'string' && nom.trim() !== '' && nom.length <= NOM_MAX && nom === nom.trim() &&
    typeof creeLe === 'string' && creeLe !== ''
  );
}

/** Dates valides, triées et sans doublon. Renvoie null si le champ n'est pas un tableau. */
function nettoyerJours(jours) {
  if (!Array.isArray(jours)) return null;
  return [...new Set(jours.filter(estDate))].sort();
}

/** Convertit une entrée v2 relue, ou renvoie null si elle est invalide. */
function lireEntreeV2(entree) {
  if (!aLesChampsCommuns(entree)) return null;
  const jours = nettoyerJours(entree.jours);
  if (jours === null) return null;
  return { id: entree.id, nom: entree.nom, jours, creeLe: entree.creeLe };
}

/** Convertit une entrée v1 (faitLe) en v2 (jours), ou renvoie null si elle est invalide. */
function lireEntreeV1(entree) {
  if (!aLesChampsCommuns(entree)) return null;
  const { faitLe } = entree;
  if (faitLe !== null && !estDate(faitLe)) return null;
  return { id: entree.id, nom: entree.nom, jours: faitLe ? [faitLe] : [], creeLe: entree.creeLe };
}

/**
 * Ne garde que les entrées valides, sans doublon d'identifiant ni de nom (RD-02).
 * En cas de doublon, la première habitude, la plus ancienne, est conservée.
 */
function nettoyer(donnees, lireEntree) {
  if (!Array.isArray(donnees)) return [];
  const ids = new Set();
  const noms = new Set();
  const habitudes = [];
  for (const brute of donnees) {
    const habitude = lireEntree(brute);
    if (!habitude) continue;
    const nomCle = habitude.nom.toLocaleLowerCase('fr');
    if (ids.has(habitude.id) || noms.has(nomCle)) continue;
    ids.add(habitude.id);
    noms.add(nomCle);
    habitudes.push(habitude);
  }
  return habitudes;
}

/** Lit une clé et la parse. Renvoie undefined si la clé n'existe pas, null si elle est illisible. */
function lireJson(cle) {
  const brut = window.localStorage.getItem(cle);
  if (brut === null) return undefined;
  try {
    return JSON.parse(brut);
  } catch {
    return null;
  }
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

/** Enregistre toute la liste. Renvoie false si l'écriture a échoué. */
export function enregistrer(habitudes) {
  try {
    window.localStorage.setItem(CLE, JSON.stringify(habitudes));
    return true;
  } catch {
    return false;
  }
}

/** Migration v1 → v2 (BACKEND_SCHEMA §3). La clé v1 n'est supprimée qu'après une écriture réussie. */
function migrerDepuisV1(donneesV1) {
  const habitudes = nettoyer(donneesV1, lireEntreeV1);
  if (enregistrer(habitudes)) {
    try {
      window.localStorage.removeItem(CLE_V1);
    } catch {
      // Sans gravité : la clé v1 sera ignorée tant que la v2 existe.
    }
  }
  return habitudes;
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
    const donnees = lireJson(CLE);
    if (donnees !== undefined) {
      return { habitudes: nettoyer(donnees, lireEntreeV2), disponible: true };
    }
    const donneesV1 = lireJson(CLE_V1);
    if (donneesV1 !== undefined) {
      return { habitudes: migrerDepuisV1(donneesV1), disponible: true };
    }
    return { habitudes: [], disponible: true };
  } catch {
    // Lecture impossible : on repart d'une liste vide (BACKEND_SCHEMA §2).
    return { habitudes: [], disponible: true };
  }
}
