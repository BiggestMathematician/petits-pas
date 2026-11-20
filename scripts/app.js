// Point d'entrée : événements, rendu du DOM, messages (TRD §3).
// Seul fichier autorisé à toucher au DOM. Rendu avec createElement et textContent, jamais innerHTML.

import {
  validerNom,
  creerHabitude,
  ajouterHabitude,
  basculerFait,
  supprimerHabitude,
  estFaiteAujourdhui,
  dateLocale,
  dateEnLettres,
  progression,
  texteProgression,
  FILTRES,
  filtrer,
  texteNombreAffichees,
} from './habitudes.js';
import { charger, enregistrer } from './stockage.js';

/** Délai entre l'effacement et l'écriture d'un message, pour qu'un même texte soit réannoncé. */
const DELAI_ANNONCE_MS = 100;

const MESSAGES = {
  listeVide: 'Aucune habitude pour l’instant. Ajoutez la première.',
  filtreVide: 'Aucune habitude dans cette catégorie.',
  ajoutee: 'Habitude ajoutée',
  supprimee: 'Habitude supprimée',
  faite: (nom) => `Bravo : ${nom} est fait`,
  toutFait: 'Tout est fait pour aujourd’hui.',
  aFaire: (nom) => `${nom} est de nouveau à faire`,
  stockageIndisponible:
    'Le stockage de ce navigateur est indisponible : vos habitudes ne seront pas conservées après la fermeture de la page.',
};

// État en mémoire, chargé depuis le localStorage (EX-007).
let habitudes = [];
// Filtre actif (EX-005). Non conservé : l'app s'ouvre toujours sur « Toutes ».
let filtreActif = FILTRES.toutes;

const elements = {
  form: document.getElementById('form-ajout'),
  champNom: document.getElementById('nom-habitude'),
  aideNom: document.getElementById('aide-nom'),
  erreurNom: document.getElementById('erreur-nom'),
  liste: document.getElementById('liste-habitudes'),
  etatListe: document.getElementById('etat-liste'),
  message: document.getElementById('message'),
  noteStockage: document.getElementById('note-stockage'),
  dateDuJour: document.getElementById('date-du-jour'),
  progression: document.getElementById('progression'),
  toutFait: document.getElementById('tout-fait'),
  titreHabitudes: document.getElementById('titre-habitudes'),
  filtres: document.getElementById('filtres'),
};

/** Affiche la note discrète quand le stockage ne fonctionne pas (EX-007). */
function signalerStockageIndisponible() {
  elements.noteStockage.textContent = MESSAGES.stockageIndisponible;
  elements.noteStockage.hidden = false;
}

/** Enregistre la liste ; en cas d'échec, l'app continue en mémoire et le signale. */
function sauvegarder() {
  if (!enregistrer(habitudes)) {
    signalerStockageIndisponible();
  }
}

/** Annonce un message dans la zone role="status", partagée par toutes les actions. */
let minuteurAnnonce;
function annoncer(texte) {
  clearTimeout(minuteurAnnonce);
  elements.message.textContent = '';
  minuteurAnnonce = setTimeout(() => {
    elements.message.textContent = texte;
  }, DELAI_ANNONCE_MS);
}

/** Affiche l'erreur sous le champ, la relie au champ et garde le focus dessus (EX-001). */
function afficherErreur(texte) {
  elements.erreurNom.textContent = `Erreur : ${texte}`;
  elements.erreurNom.hidden = false;
  elements.champNom.setAttribute('aria-invalid', 'true');
  elements.champNom.setAttribute('aria-describedby', `${elements.aideNom.id} ${elements.erreurNom.id}`);
  elements.champNom.focus();
  annoncer(elements.erreurNom.textContent);
}

function effacerErreur() {
  elements.erreurNom.textContent = '';
  elements.erreurNom.hidden = true;
  elements.champNom.removeAttribute('aria-invalid');
  elements.champNom.setAttribute('aria-describedby', elements.aideNom.id);
}

/** Identifiant de la case à cocher d'une habitude. */
function idCase(habitude) {
  return `case-${habitude.id}`;
}

/**
 * Construit la ligne d'une habitude (EX-002, EX-003) :
 * une case à cocher dont le label est le nom, et l'état du jour en toutes lettres.
 */
function creerLigne(habitude, aujourdhui) {
  const faite = estFaiteAujourdhui(habitude, aujourdhui);

  const ligne = document.createElement('li');
  ligne.className = faite ? 'habit-item habit-item--done' : 'habit-item';
  ligne.dataset.id = habitude.id;

  const label = document.createElement('label');
  label.className = 'habit-item__label';

  const caseACocher = document.createElement('input');
  caseACocher.type = 'checkbox';
  caseACocher.className = 'habit-item__checkbox';
  caseACocher.id = idCase(habitude);
  caseACocher.checked = faite;

  const nom = document.createElement('span');
  nom.className = 'habit-item__name';
  nom.textContent = habitude.nom;

  // Repère visuel sous le nom : l'état est déjà annoncé par la case, on ne le lit pas deux fois.
  const etat = document.createElement('span');
  etat.className = 'habit-item__state';
  etat.setAttribute('aria-hidden', 'true');
  etat.textContent = faite ? 'Fait' : 'À faire';

  const texte = document.createElement('span');
  texte.className = 'habit-item__text';
  texte.append(nom, etat);

  label.append(caseACocher, texte);

  // Nom accessible « Supprimer Boire 1,5 L d'eau » : le libellé visible, complété du nom (EX-004).
  const supprimer = document.createElement('button');
  supprimer.type = 'button';
  supprimer.className = 'button button--quiet habit-item__delete';
  supprimer.id = `supprimer-${habitude.id}`;
  supprimer.textContent = 'Supprimer';
  // Le nom accessible commence par le libellé visible (RGAA, critère 6.1 / WCAG 2.5.3).
  supprimer.setAttribute('aria-label', `Supprimer ${habitude.nom}`);

  ligne.append(label, supprimer);
  return ligne;
}

/** Position (parmi les lignes affichées) de la ligne qui contient l'élément, ou -1. */
function positionDansListe(element) {
  const ligne = element?.closest?.('.habit-item');
  return ligne ? [...elements.liste.children].indexOf(ligne) : -1;
}

/**
 * Place le focus sur l'habitude affichée à cette position,
 * sinon sur le titre « Mes habitudes » (EX-004, et quand une habitude sort du filtre).
 */
function focaliserPosition(position) {
  const ligne = elements.liste.children[position];
  const cible = ligne ? ligne.querySelector('.habit-item__checkbox') : elements.titreHabitudes;
  cible.focus();
}

/** Habitudes visibles avec le filtre actif (EX-005). */
function habitudesAffichees() {
  return filtrer(habitudes, filtreActif);
}

/** Redessine la liste et ses états vides (EX-002, EX-005), en gardant le focus là où il était. */
function afficherListe() {
  const focusDansListe = elements.liste.contains(document.activeElement);
  const idFocus = focusDansListe ? document.activeElement.id : null;
  const positionFocus = focusDansListe ? positionDansListe(document.activeElement) : -1;

  const aujourdhui = dateLocale();
  const affichees = habitudesAffichees();
  elements.liste.replaceChildren(...affichees.map((habitude) => creerLigne(habitude, aujourdhui)));

  if (focusDansListe) {
    const memeElement = idFocus && document.getElementById(idFocus);
    // L'élément a disparu (habitude sortie du filtre) : on passe à la suivante.
    if (memeElement) memeElement.focus();
    else focaliserPosition(positionFocus);
  }

  const etatVide = habitudes.length === 0 ? MESSAGES.listeVide : MESSAGES.filtreVide;
  const vide = affichees.length === 0;
  elements.liste.hidden = vide;
  elements.etatListe.textContent = vide ? etatVide : '';
  elements.etatListe.hidden = !vide;
}

/** Met à jour l'état des boutons de filtre (aria-pressed). */
function afficherFiltres() {
  for (const bouton of elements.filtres.querySelectorAll('[data-filtre]')) {
    bouton.setAttribute('aria-pressed', String(bouton.dataset.filtre === filtreActif));
  }
}

/** En-tête : date du jour en toutes lettres et progression (EX-006). */
function afficherEnTete() {
  const maintenant = new Date();
  const date = document.createElement('time');
  date.dateTime = dateLocale(maintenant);
  date.textContent = dateEnLettres(maintenant);
  elements.dateDuJour.replaceChildren(date);

  const etat = progression(habitudes);
  // Liste vide : pas de « 0 habitude sur 0 », l'état vide de la liste suffit.
  elements.progression.textContent = etat.total > 0 ? texteProgression(etat) : '';
  elements.progression.hidden = etat.total === 0;
  elements.toutFait.hidden = !etat.toutEstFait;
}

/** Redessine tout l'écran à partir de l'état. */
function afficher() {
  afficherEnTete();
  afficherFiltres();
  afficherListe();
}

/** Ajout d'une habitude (EX-001, RD-01, RD-02). */
function surAjout(evenement) {
  evenement.preventDefault();

  const resultat = validerNom(elements.champNom.value, habitudes);
  if (!resultat.ok) {
    afficherErreur(resultat.erreur);
    return;
  }

  const nouvelle = creerHabitude(resultat.nom);
  habitudes = ajouterHabitude(habitudes, nouvelle);
  sauvegarder();
  // Une nouvelle habitude est « à faire » : si le filtre la cache, on revient à « Toutes »
  // pour que l'ajout se voie (la zone de statut est masquée visuellement).
  if (!filtrer([nouvelle], filtreActif).length) {
    filtreActif = FILTRES.toutes;
  }
  afficher();

  effacerErreur();
  elements.champNom.value = '';
  elements.champNom.focus();
  annoncer(MESSAGES.ajoutee);
}

/** Cocher ou décocher une habitude pour aujourd'hui (EX-003, RM-01 à RM-04). */
function surCoche(evenement) {
  const caseACocher = evenement.target;
  if (!caseACocher.matches('.habit-item__checkbox')) return;

  const id = caseACocher.closest('.habit-item').dataset.id;
  const habitude = habitudes.find((h) => h.id === id);
  if (!habitude) return;
  const position = positionDansListe(caseACocher);

  habitudes = basculerFait(habitudes, id, caseACocher.checked);
  sauvegarder();
  afficher();
  // La liste est redessinée : on retrouve la nouvelle case. Avec un filtre,
  // l'habitude cochée peut avoir disparu : le focus passe alors à la suivante.
  const nouvelleCase = document.getElementById(idCase(habitude));
  if (nouvelleCase) nouvelleCase.focus();
  else focaliserPosition(position);

  if (!caseACocher.checked) {
    annoncer(MESSAGES.aFaire(habitude.nom));
  } else if (progression(habitudes).toutEstFait) {
    annoncer(`${MESSAGES.faite(habitude.nom)}. ${MESSAGES.toutFait}`);
  } else {
    annoncer(MESSAGES.faite(habitude.nom));
  }
}

/**
 * Supprimer une habitude (EX-004).
 * Le focus va sur l'habitude suivante, sinon sur le titre « Mes habitudes ».
 */
function surSuppression(evenement) {
  const bouton = evenement.target.closest('.habit-item__delete');
  if (!bouton) return;

  const id = bouton.closest('.habit-item').dataset.id;
  if (!habitudes.some((h) => h.id === id)) return;
  // Position parmi les habitudes affichées : la « suivante » est celle qu'on voit (filtre compris).
  const position = positionDansListe(bouton);

  habitudes = supprimerHabitude(habitudes, id);
  sauvegarder();
  afficher();
  focaliserPosition(position);
  annoncer(MESSAGES.supprimee);
}

/** Changer de filtre (EX-005) : état aria-pressed, liste filtrée, nombre annoncé. */
function surFiltre(evenement) {
  const bouton = evenement.target.closest('[data-filtre]');
  if (!bouton || !Object.values(FILTRES).includes(bouton.dataset.filtre)) return;

  filtreActif = bouton.dataset.filtre;
  afficher();

  const nombre = habitudesAffichees().length;
  if (nombre > 0) annoncer(texteNombreAffichees(nombre));
  else annoncer(habitudes.length === 0 ? MESSAGES.listeVide : MESSAGES.filtreVide);
}

/**
 * Au retour sur la page (onglet ou appli remis au premier plan), on redessine :
 * si le jour a changé, les habitudes redeviennent « à faire » (RM-02).
 */
function surRetourSurLaPage() {
  if (document.visibilityState === 'visible') {
    afficher();
  }
}

/** Démarrage : on recharge les habitudes enregistrées (EX-007). */
function demarrer() {
  const { habitudes: enregistrees, disponible } = charger();
  habitudes = enregistrees;
  if (!disponible) {
    signalerStockageIndisponible();
  }
  elements.form.addEventListener('submit', surAjout);
  elements.liste.addEventListener('change', surCoche);
  elements.liste.addEventListener('click', surSuppression);
  elements.filtres.addEventListener('click', surFiltre);
  document.addEventListener('visibilitychange', surRetourSurLaPage);
  afficher();
}

demarrer();
