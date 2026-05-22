import type { EvenementSuivi, Reservation } from "../types";
import { NOMS, PRENOMS } from "./constants";
import { genererCreneaux, reference } from "../lib/helpers";

/* =============================================================================
   Jeu de données simulé
   ---------------------------------------------------------------------------
   En production, ces données proviendraient de l'API Symfony / MySQL.
   Ici, elles sont générées en mémoire au démarrage de l'application et
   illustrent volontairement tous les états possibles d'un dossier :
   à venir, en instruction, pièces manquantes, transmis à Libreville,
   en fabrication, retour vers Paris, disponible, retrait planifié.
   ========================================================================== */

/** Champs obligatoires à fournir lors de la création d'une réservation. */
type ResaSeed = Partial<Reservation> &
  Pick<Reservation, "nom" | "prenom" | "email" | "date" | "creneau">;

/** Raccourci d'écriture pour un événement de l'historique. */
const ev = (
  date: string,
  etape: EvenementSuivi["etape"],
  note?: string,
): EvenementSuivi => ({ date, etape, ...(note ? { note } : {}) });

/**
 * Construit la liste des réservations initiales.
 * @param duree durée des créneaux (détermine le remplissage des journées).
 */
export function donneesInitiales(duree: number): Reservation[] {
  const creneaux = genererCreneaux(duree);
  const res: Reservation[] = [];
  let prochainId = 1;

  // Fabrique une réservation avec des valeurs par défaut raisonnables.
  const make = (o: ResaSeed): Reservation => {
    const id = prochainId++;
    return {
      id,
      reference: reference(id),
      typeDemande: "premiere",
      numeroPasseport: "",
      telephone: "06 12 34 56 78",
      statut: "confirme",
      emailValide: true,
      dateRetrait: null,
      creneauRetrait: null,
      historique: [],
      ...o,
    };
  };

  /* ---- Dossiers FUTURS (rendez-vous à venir, historique vide) ---- */

  // Mardi 19 mai : journée de DÉPÔT entièrement réservée -> apparaîtra grisée.
  creneaux.forEach((c, i) => {
    res.push(
      make({
        nom: NOMS[i % NOMS.length],
        prenom: PRENOMS[i % PRENOMS.length],
        email: `citoyen${i + 1}@exemple.ga`,
        typeDemande: i % 2 ? "renouvellement" : "premiere",
        date: "2026-05-19",
        creneau: c,
      }),
    );
  });

  // Mercredi 20 mai : 3 créneaux pris (journée partiellement remplie).
  ["09:00", "10:00", "11:30"].forEach((c, i) => {
    res.push(
      make({
        nom: NOMS[(i + 4) % NOMS.length],
        prenom: PRENOMS[(i + 5) % PRENOMS.length],
        email: `citoyen2${i}@exemple.ga`,
        date: "2026-05-20",
        creneau: c,
      }),
    );
  });

  /* ---- Dossiers EN COURS DE TRAITEMENT (historiques variés) ---- */

  // GAB-2026-00012 — Passeport disponible, en attente de planification du retrait.
  res.push(
    make({
      nom: "Ndong",
      prenom: "Carine",
      email: "carine.ndong@exemple.ga",
      typeDemande: "renouvellement",
      numeroPasseport: "20GA45678",
      date: "2026-05-06",
      creneau: "10:30",
      statut: "passeport_arrive",
      historique: [
        ev("2026-05-06T10:30", "dossier_depose"),
        ev("2026-05-06T12:00", "instruction"),
        ev("2026-05-07T16:00", "transmis_libreville"),
        ev("2026-05-08T09:00", "fabrication"),
        ev("2026-05-15T10:00", "retour_paris"),
        ev("2026-05-18T11:00", "disponible"),
      ],
    }),
  );

  // GAB-2026-00013 — Retrait déjà planifié pour le vendredi 22 mai.
  res.push(
    make({
      nom: "Mba",
      prenom: "Landry",
      email: "landry.mba@exemple.ga",
      date: "2026-05-08",
      creneau: "09:30",
      statut: "retrait_planifie",
      dateRetrait: "2026-05-22",
      creneauRetrait: "10:00",
      historique: [
        ev("2026-05-08T09:30", "dossier_depose"),
        ev("2026-05-08T11:00", "instruction"),
        ev("2026-05-09T16:00", "transmis_libreville"),
        ev("2026-05-11T09:00", "fabrication"),
        ev("2026-05-13T10:00", "retour_paris"),
        ev("2026-05-15T11:00", "disponible"),
        ev("2026-05-15T16:00", "retrait_planifie"),
      ],
    }),
  );

  // GAB-2026-00014 — En cours d'instruction.
  res.push(
    make({
      nom: "Bivigou",
      prenom: "Sylvia",
      email: "sylvia.bivigou@exemple.ga",
      typeDemande: "premiere",
      date: "2026-05-04",
      creneau: "09:00",
      historique: [
        ev("2026-05-04T09:00", "dossier_depose"),
        ev("2026-05-04T10:30", "instruction"),
      ],
    }),
  );

  // GAB-2026-00015 — Pièces manquantes (blocage).
  res.push(
    make({
      nom: "Ovono",
      prenom: "Hervé",
      email: "herve.ovono@exemple.ga",
      typeDemande: "renouvellement",
      numeroPasseport: "18GA12345",
      date: "2026-05-05",
      creneau: "09:30",
      historique: [
        ev("2026-05-05T09:30", "dossier_depose"),
        ev("2026-05-05T11:00", "instruction"),
        ev(
          "2026-05-07T14:00",
          "pieces_manquantes",
          "Justificatif de domicile de moins de 3 mois manquant et copie de l'acte de naissance illisible.",
        ),
      ],
    }),
  );

  // GAB-2026-00016 — Dossier transmis à Libreville.
  res.push(
    make({
      nom: "Bekale",
      prenom: "Murielle",
      email: "murielle.bekale@exemple.ga",
      typeDemande: "premiere",
      date: "2026-04-28",
      creneau: "10:00",
      historique: [
        ev("2026-04-28T10:00", "dossier_depose"),
        ev("2026-04-28T12:00", "instruction"),
        ev("2026-04-30T16:00", "transmis_libreville"),
      ],
    }),
  );

  // GAB-2026-00017 — En cours de fabrication à Libreville.
  res.push(
    make({
      nom: "Nguema",
      prenom: "Yannick",
      email: "yannick.nguema@exemple.ga",
      typeDemande: "renouvellement",
      numeroPasseport: "17GA98765",
      date: "2026-04-21",
      creneau: "09:30",
      historique: [
        ev("2026-04-21T09:30", "dossier_depose"),
        ev("2026-04-21T11:00", "instruction"),
        ev("2026-04-23T16:00", "transmis_libreville"),
        ev("2026-04-25T09:00", "fabrication"),
      ],
    }),
  );

  // GAB-2026-00018 — Passeport en transit retour vers Paris.
  res.push(
    make({
      nom: "Ondo",
      prenom: "Aimée",
      email: "aimee.ondo@exemple.ga",
      typeDemande: "premiere",
      date: "2026-04-14",
      creneau: "10:30",
      historique: [
        ev("2026-04-14T10:30", "dossier_depose"),
        ev("2026-04-14T12:00", "instruction"),
        ev("2026-04-16T16:00", "transmis_libreville"),
        ev("2026-04-20T09:00", "fabrication"),
        ev("2026-05-15T10:00", "retour_paris"),
      ],
    }),
  );

  return res;
}
