import type { Reservation } from "../types";
import { LIBELLES_ETAPES, PIPELINE } from "../data/constants";
import {
  etapeActuelle,
  formatDateHeure,
  labelDate,
} from "../lib/helpers";

/* =============================================================================
   Timeline de suivi d'un dossier
   ---------------------------------------------------------------------------
   Affiche le pipeline ordonné, marque les étapes franchies (avec leur date),
   met en évidence l'étape courante (en jaune), et signale en alerte les
   pièces manquantes lorsque c'est le statut actuel.
   ========================================================================== */

interface SuiviProps {
  dossier: Reservation;
}

export function Suivi({ dossier }: SuiviProps) {
  const courante = etapeActuelle(dossier);

  // Date la plus récente associée à chaque étape franchie.
  const dates = new Map<string, string>();
  dossier.historique.forEach((e) => dates.set(e.etape, e.date));

  // Dernier événement « pièces manquantes » (sa note précise ce qui manque).
  const evtPiecesManquantes = [...dossier.historique]
    .reverse()
    .find((e) => e.etape === "pieces_manquantes");

  // Alerte visible uniquement si pièces manquantes EST l'état courant.
  const alertePieces = courante === "pieces_manquantes";

  return (
    <section className="gab-card">
      <div className="gab-suivi-tete">
        <div>
          <span className="gab-suivi-ref">{dossier.reference}</span>
          <h3 className="gab-h3">
            {dossier.prenom} {dossier.nom}
          </h3>
        </div>
        <span className="gab-suivi-type">
          {dossier.typeDemande === "premiere"
            ? "Première demande"
            : "Renouvellement"}
        </span>
      </div>

      {alertePieces && (
        <div className="gab-alerte">
          <strong>⚠ Pièces manquantes</strong>
          <p>
            {evtPiecesManquantes?.note ??
              "Contactez le service consulaire pour compléter votre dossier."}
          </p>
        </div>
      )}

      {dossier.historique.length === 0 ? (
        <p className="gab-muted">
          Votre rendez-vous de dépôt est planifié le{" "}
          <strong>{labelDate(dossier.date)}</strong> à{" "}
          <strong>{dossier.creneau}</strong>. Le suivi commencera après le
          dépôt effectif de votre dossier.
        </p>
      ) : (
        <ol className="gab-timeline">
          {PIPELINE.map((etape) => {
            const franchie = dates.has(etape);
            const estCourante = courante === etape;
            const date = dates.get(etape);
            const lib = LIBELLES_ETAPES[etape];
            const classes = [
              "gab-tl-item",
              franchie ? "fait" : "",
              estCourante ? "courant" : "",
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <li key={etape} className={classes}>
                <div className="gab-tl-pt">✓</div>
                <div className="gab-tl-contenu">
                  <div className="gab-tl-ligne">
                    <strong>{lib.titre}</strong>
                    {date && <em>{formatDateHeure(date)}</em>}
                  </div>
                  <p>{lib.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
