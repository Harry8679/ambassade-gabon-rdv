import type { Mode, Reservation } from "../types";
import { genererCreneaux } from "../lib/helpers";

/* =============================================================================
   Grille des créneaux horaires d'une journée
   ---------------------------------------------------------------------------
   Les créneaux déjà réservés sont affichés en gris et non cliquables.
   ========================================================================== */

interface GrilleCreneauxProps {
  mode: Mode;
  date: string;
  reservations: Reservation[];
  dureeCreneaux: number;
  creneauSel: string | null;
  onSelect: (creneau: string) => void;
}

export function GrilleCreneaux({
  mode,
  date,
  reservations,
  dureeCreneaux,
  creneauSel,
  onSelect,
}: GrilleCreneauxProps) {
  const creneaux = genererCreneaux(dureeCreneaux);

  // Liste des créneaux déjà pris pour cette date.
  const pris = reservations
    .filter((r) => (mode === "depot" ? r.date === date : r.dateRetrait === date))
    .map((r) => (mode === "depot" ? r.creneau : r.creneauRetrait));

  return (
    <div className="gab-creneaux">
      {creneaux.map((c) => {
        const occupe = pris.includes(c);
        return (
          <button
            key={c}
            disabled={occupe}
            className={`gab-creneau ${occupe ? "occupe" : ""} ${
              creneauSel === c ? "sel" : ""
            }`}
            onClick={() => onSelect(c)}
          >
            {c}
            {occupe && <em>Réservé</em>}
          </button>
        );
      })}
    </div>
  );
}
