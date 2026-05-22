import { useState } from "react";
import type { Mode, Reservation } from "../types";
import { AUJOURDHUI, JOURS_FR, MOIS_FR } from "../data/constants";
import { cellulesCalendrier, genererCreneaux, isoDate } from "../lib/helpers";

/* =============================================================================
   Calendrier mensuel
   ---------------------------------------------------------------------------
   - Dépôt  : jours cliquables du lundi au jeudi.
   - Retrait: jours cliquables le vendredi uniquement.
   - Une journée dont tous les créneaux sont pris devient grisée et non cliquable.
   ========================================================================== */

interface CalendrierProps {
  mode: Mode;
  reservations: Reservation[];
  dureeCreneaux: number;
  dateSel: string | null;
  onSelect: (iso: string) => void;
}

export function Calendrier({
  mode,
  reservations,
  dureeCreneaux,
  dateSel,
  onSelect,
}: CalendrierProps) {
  // Mois affiché (par défaut : mai 2026).
  const [mois, setMois] = useState<{ annee: number; mois: number }>({
    annee: 2026,
    mois: 4,
  });

  const cells = cellulesCalendrier(mois.annee, mois.mois);
  const totalCreneaux = genererCreneaux(dureeCreneaux).length;

  // Une journée est complète si tous ses créneaux sont déjà réservés.
  const estComplet = (iso: string): boolean => {
    const pris = reservations.filter((r) =>
      mode === "depot" ? r.date === iso : r.dateRetrait === iso,
    ).length;
    return pris >= totalCreneaux;
  };

  // Le service est-il ouvert ce jour-là ? (lun-jeu pour le dépôt, ven pour le retrait)
  const jourOuvre = (d: Date): boolean => {
    const j = d.getDay();
    return mode === "depot" ? j >= 1 && j <= 4 : j === 5;
  };

  const estPasse = (d: Date): boolean => d < AUJOURDHUI;

  // On ne peut pas remonter avant le mois courant.
  const moisMin = mois.annee === 2026 && mois.mois <= 4;

  const moisPrecedent = () =>
    setMois((m) => ({
      annee: m.mois === 0 ? m.annee - 1 : m.annee,
      mois: m.mois === 0 ? 11 : m.mois - 1,
    }));

  const moisSuivant = () =>
    setMois((m) => ({
      annee: m.mois === 11 ? m.annee + 1 : m.annee,
      mois: m.mois === 11 ? 0 : m.mois + 1,
    }));

  return (
    <div className="gab-cal">
      <div className="gab-cal-nav">
        <button disabled={moisMin} onClick={moisPrecedent}>
          ‹
        </button>
        <strong>
          {MOIS_FR[mois.mois]} {mois.annee}
        </strong>
        <button onClick={moisSuivant}>›</button>
      </div>

      <div className="gab-cal-grille">
        {JOURS_FR.map((j) => (
          <div key={j} className="gab-cal-jour-tete">
            {j}
          </div>
        ))}

        {cells.map((d, i) => {
          if (!d) return <div key={`vide-${i}`} />;

          const iso = isoDate(d);
          const ouvert = jourOuvre(d) && !estPasse(d);
          const complet = ouvert && estComplet(iso);
          const dispo = ouvert && !complet;

          const classes = [
            "gab-cal-case",
            !ouvert ? "ferme" : "",
            complet ? "complet" : "",
            dispo ? "dispo" : "",
            dateSel === iso ? "sel" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={iso}
              disabled={!dispo}
              onClick={() => dispo && onSelect(iso)}
              className={classes}
            >
              <span className="gab-cal-num">{d.getDate()}</span>
              {complet && <span className="gab-cal-tag">Complet</span>}
              {dispo && <span className="gab-cal-pt" />}
            </button>
          );
        })}
      </div>

      <div className="gab-legende">
        <span>
          <i className="lg-dispo" /> Disponible
        </span>
        <span>
          <i className="lg-complet" /> Complet
        </span>
        <span>
          <i className="lg-ferme" /> Fermé
        </span>
      </div>
    </div>
  );
}
