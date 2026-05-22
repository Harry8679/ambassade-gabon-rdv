/* =============================================================================
   Constantes de l'application
   ========================================================================== */

/** Couleurs officielles du drapeau gabonais. */
export const VERT = "#009639";
export const JAUNE = "#FCD116";
export const BLEU = "#3A75C4";

/** Date de référence du prototype (18 mai 2026, un lundi). */
export const AUJOURDHUI = new Date(2026, 4, 18);

/** Plage horaire d'ouverture du service (heures pleines). */
export const HEURE_DEBUT = 9; // 09:00
export const HEURE_FIN = 13; // 13:00

export const MOIS_FR = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

/** Jours de la semaine, semaine commençant le lundi. */
export const JOURS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

/** Données fictives utilisées pour pré-remplir la démo. */
export const PRENOMS = [
  "Steeve", "Andréa", "Paulin", "Carine", "Brice", "Nadège",
  "Hervé", "Sylvia", "Landry", "Murielle", "Yannick", "Aimée",
];

export const NOMS = [
  "Mvé", "Obame", "Ndong", "Mintsa", "Boukandou", "Nzé",
  "Ovono", "Bekale", "Mba", "Nguema", "Ondo", "Bivigou",
];

/* -------------------------------------------------------------------------
   Suivi de dossier — libellés et pipeline
   ------------------------------------------------------------------------- */

import type { EtapeSuivi } from "../types";

/** Ordre canonique des étapes de la timeline de suivi. */
export const PIPELINE: EtapeSuivi[] = [
  "dossier_depose",
  "instruction",
  "transmis_libreville",
  "fabrication",
  "retour_paris",
  "disponible",
  "retrait_planifie",
  "retire",
];

/** Libellés et descriptions de chaque étape de suivi. */
export const LIBELLES_ETAPES: Record<
  EtapeSuivi,
  { titre: string; description: string }
> = {
  dossier_depose: {
    titre: "Dossier déposé",
    description: "Vos pièces ont été remises au service consulaire.",
  },
  instruction: {
    titre: "En cours d'instruction",
    description:
      "L'agent consulaire vérifie l'éligibilité et la complétude de votre dossier.",
  },
  pieces_manquantes: {
    titre: "Pièces manquantes",
    description:
      "Une ou plusieurs pièces doivent être complétées pour poursuivre l'instruction.",
  },
  transmis_libreville: {
    titre: "Transmis à Libreville",
    description: "Votre dossier a été envoyé au Gabon pour la fabrication du passeport.",
  },
  fabrication: {
    titre: "En fabrication",
    description: "Le passeport est en cours de personnalisation à Libreville.",
  },
  retour_paris: {
    titre: "Retour vers Paris",
    description: "Le passeport est en transit vers l'ambassade.",
  },
  disponible: {
    titre: "Disponible à l'ambassade",
    description:
      "Votre passeport est arrivé. Planifiez votre retrait un vendredi.",
  },
  retrait_planifie: {
    titre: "Retrait planifié",
    description: "Votre rendez-vous de retrait est confirmé.",
  },
  retire: {
    titre: "Passeport retiré",
    description: "Dossier clôturé. Bon voyage !",
  },
};
