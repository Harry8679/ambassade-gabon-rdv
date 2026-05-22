/* =============================================================================
   Types métier de l'application
   ========================================================================== */

/** Nature de la démarche du citoyen. */
export type TypeDemande = "premiere" | "renouvellement";

/** Statut macro du dossier (cycle de vie côté rendez-vous). */
export type Statut =
  | "a_valider" // dossier créé, email non encore confirmé
  | "confirme" // email confirmé, rendez-vous de dépôt validé
  | "passeport_arrive" // le passeport est disponible à l'ambassade
  | "retrait_planifie"; // le citoyen a choisi un vendredi de retrait

/** Type de rendez-vous en cours dans le parcours citoyen. */
export type Mode = "depot" | "retrait";

/* -------------------------------------------------------------------------
   Suivi de dossier
   ------------------------------------------------------------------------- */

/** Étapes possibles dans le traitement d'un passeport. */
export type EtapeSuivi =
  | "dossier_depose" // les pièces ont été remises à l'ambassade
  | "instruction" // vérification par l'agent consulaire
  | "pieces_manquantes" // événement bloquant : pièces à compléter
  | "transmis_libreville" // envoi du dossier au Gabon
  | "fabrication" // personnalisation du passeport à Libreville
  | "retour_paris" // passeport en transit retour vers l'ambassade
  | "disponible" // passeport prêt à être retiré
  | "retrait_planifie" // rendez-vous de retrait pris par le citoyen
  | "retire"; // passeport remis au citoyen — dossier clôturé

/** Événement horodaté du journal d'un dossier. */
export interface EvenementSuivi {
  /** Date ISO « YYYY-MM-DDTHH:mm » de l'événement. */
  date: string;
  etape: EtapeSuivi;
  /** Précision optionnelle (ex. « Justificatif de domicile manquant »). */
  note?: string;
}

/** Un dossier complet : suit le citoyen du dépôt jusqu'au retrait. */
export interface Reservation {
  id: number;
  reference: string;
  typeDemande: TypeDemande;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  numeroPasseport: string;
  /** Date ISO (YYYY-MM-DD) du rendez-vous de dépôt. */
  date: string;
  /** Créneau horaire du dépôt (HH:MM). */
  creneau: string;
  statut: Statut;
  emailValide: boolean;
  /** Date ISO du retrait (null tant que non planifié). */
  dateRetrait: string | null;
  /** Créneau horaire du retrait (null tant que non planifié). */
  creneauRetrait: string | null;
  /** Journal des étapes franchies par le dossier. */
  historique: EvenementSuivi[];
}

/** Notification visuelle simulant l'envoi d'un email. */
export interface Toast {
  id: number;
  destinataire: string;
  sujet: string;
}
