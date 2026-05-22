import { useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { EtapeSuivi, EvenementSuivi, Reservation } from "../types";
import {
  LIBELLES_ETAPES,
  PIPELINE,
  VERT,
  JAUNE,
  BLEU,
} from "../data/constants";
import {
  etapeActuelle,
  genererCreneaux,
  labelDate,
  maintenantIso,
} from "../lib/helpers";
import { Kpi, Ligne } from "./Widgets";

/* =============================================================================
   ESPACE ADMINISTRATION
   ---------------------------------------------------------------------------
   - Suivi des demandes (filtre jour + recherche).
   - Avancement de l'étape de traitement (instruction, transmis Libreville,
     fabrication, retour Paris, disponible). Quand l'étape passe à
     « disponible », le citoyen reçoit un email automatiquement.
   - Signalement de pièces manquantes (avec note).
   - Liste des retraits planifiés.
   - Paramétrage de la durée des créneaux.
   ========================================================================== */

type OngletAdmin = "depots" | "retraits" | "params";

const DUREES = [15, 20, 30, 45];

/**
 * Renvoie les étapes qu'un administrateur peut ajouter ensuite à un dossier
 * compte tenu de son état courant.
 */
function etapesPossiblesPourSuite(historique: EvenementSuivi[]): EtapeSuivi[] {
  const courante: EtapeSuivi | null =
    historique.length > 0 ? historique[historique.length - 1].etape : null;

  // Dossier qui vient d'être confirmé : aucune étape encore. On commence par le dépôt.
  if (courante === null) return ["dossier_depose"];

  // Cas particulier : pièces manquantes — la résolution renvoie en instruction.
  if (courante === "pieces_manquantes") return ["instruction"];

  // Après « disponible », c'est au citoyen de planifier son retrait.
  if (courante === "disponible") return [];

  // Cas standard : étape suivante du pipeline.
  const i = PIPELINE.indexOf(courante);
  if (i === -1 || i === PIPELINE.length - 1) return [];

  const suivantes: EtapeSuivi[] = [PIPELINE[i + 1]];

  // Pièces manquantes peuvent être signalées entre dépôt et transmission.
  if (courante === "dossier_depose" || courante === "instruction") {
    suivantes.push("pieces_manquantes");
  }

  return suivantes;
}

interface EspaceAdminProps {
  reservations: Reservation[];
  setReservations: Dispatch<SetStateAction<Reservation[]>>;
  dureeCreneaux: number;
  setDureeCreneaux: Dispatch<SetStateAction<number>>;
  envoyerEmail: (destinataire: string, sujet: string) => void;
}

export function EspaceAdmin({
  reservations,
  setReservations,
  dureeCreneaux,
  setDureeCreneaux,
  envoyerEmail,
}: EspaceAdminProps) {
  const [onglet, setOnglet] = useState<OngletAdmin>("depots");
  const [filtreDate, setFiltreDate] = useState("");
  const [recherche, setRecherche] = useState("");

  // Indicateurs chiffrés.
  const kpis = useMemo(
    () => ({
      total: reservations.length,
      aValider: reservations.filter((r) => r.statut === "a_valider").length,
      enCours: reservations.filter(
        (r) =>
          r.statut === "confirme" && etapeActuelle(r) !== null,
      ).length,
      aRetirer: reservations.filter((r) => r.statut === "passeport_arrive")
        .length,
      retraits: reservations.filter((r) => r.statut === "retrait_planifie")
        .length,
    }),
    [reservations],
  );

  // Ajoute un événement à l'historique d'un dossier (cœur de l'admin).
  const avancerEtape = (r: Reservation, etape: EtapeSuivi) => {
    let note: string | undefined;
    if (etape === "pieces_manquantes") {
      const saisie = window.prompt("Préciser les pièces manquantes :");
      if (saisie === null) return; // annulation
      note = saisie || undefined;
    }
    const evenement: EvenementSuivi = {
      date: maintenantIso(),
      etape,
      ...(note ? { note } : {}),
    };
    setReservations((prev) =>
      prev.map((res) =>
        res.id === r.id
          ? {
              ...res,
              historique: [...res.historique, evenement],
              // L'étape « disponible » fait basculer le statut métier.
              statut: etape === "disponible" ? "passeport_arrive" : res.statut,
            }
          : res,
      ),
    );
    if (etape === "disponible") {
      envoyerEmail(
        r.email,
        `Passeport disponible — dossier ${r.reference}. Planifiez votre retrait un vendredi.`,
      );
    }
  };

  // Liste filtrée des dépôts.
  const depots = reservations
    .filter((r) =>
      ["a_valider", "confirme", "passeport_arrive"].includes(r.statut),
    )
    .filter((r) => (filtreDate ? r.date === filtreDate : true))
    .filter((r) => {
      const q = recherche.toLowerCase().trim();
      if (!q) return true;
      return (
        `${r.nom} ${r.prenom}`.toLowerCase().includes(q) ||
        r.reference.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => (a.date + a.creneau).localeCompare(b.date + b.creneau));

  const retraits = reservations
    .filter((r) => r.statut === "retrait_planifie")
    .sort((a, b) =>
      `${a.dateRetrait}${a.creneauRetrait}`.localeCompare(
        `${b.dateRetrait}${b.creneauRetrait}`,
      ),
    );

  return (
    <div className="gab-admin">
      <div className="gab-admin-tete">
        <h2>Tableau de bord — Service des passeports</h2>
        <p className="gab-muted">
          Suivi des dépôts, des retraits et paramétrage des créneaux.
        </p>
      </div>

      <div className="gab-kpis">
        <Kpi n={kpis.total} t="Dossiers" c={VERT} />
        <Kpi n={kpis.aValider} t="Emails non confirmés" c={JAUNE} />
        <Kpi n={kpis.enCours} t="En cours de traitement" c="#0c1b2a" />
        <Kpi n={kpis.aRetirer} t="Passeports à retirer" c={BLEU} />
        <Kpi n={kpis.retraits} t="Retraits planifiés" c="#1f2937" />
      </div>

      <div className="gab-onglets">
        {(
          [
            ["depots", "Demandes & traitement"],
            ["retraits", "Retraits planifiés"],
            ["params", "Paramètres"],
          ] as [OngletAdmin, string][]
        ).map(([k, l]) => (
          <button
            key={k}
            className={onglet === k ? "on" : ""}
            onClick={() => setOnglet(k)}
          >
            {l}
          </button>
        ))}
      </div>

      {/* ----- Onglet dépôts & traitement ----- */}
      {onglet === "depots" && (
        <section className="gab-card">
          <div className="gab-filtres">
            <div>
              <label className="gab-label">Filtrer par jour de dépôt</label>
              <input
                type="date"
                className="gab-input"
                value={filtreDate}
                onChange={(e) => setFiltreDate(e.target.value)}
              />
            </div>
            <div className="gab-grow">
              <label className="gab-label">Rechercher (nom ou référence)</label>
              <input
                className="gab-input"
                placeholder="Ex. Obame ou GAB-2026-00003"
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
              />
            </div>
            {(filtreDate || recherche) && (
              <button
                className="gab-btn gab-btn-clair gab-btn-bas"
                onClick={() => {
                  setFiltreDate("");
                  setRecherche("");
                }}
              >
                Réinitialiser
              </button>
            )}
          </div>

          <table className="gab-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Citoyen</th>
                <th>Dépôt</th>
                <th>Étape actuelle</th>
                <th>Faire avancer</th>
              </tr>
            </thead>
            <tbody>
              {depots.map((r) => {
                const courante = etapeActuelle(r);
                const suivantes = etapesPossiblesPourSuite(r.historique);
                return (
                  <tr key={r.id}>
                    <td className="gab-mono">{r.reference}</td>
                    <td>
                      <strong>{r.nom.toUpperCase()}</strong> {r.prenom}
                      <div className="gab-sous">
                        {r.typeDemande === "premiere"
                          ? "Première demande"
                          : "Renouvellement"}
                      </div>
                    </td>
                    <td>
                      {labelDate(r.date)}
                      <div className="gab-sous">{r.creneau}</div>
                    </td>
                    <td>
                      {r.statut === "a_valider" ? (
                        <span className="gab-pill gab-pill-jaune">
                          Email non confirmé
                        </span>
                      ) : courante ? (
                        <span
                          className={`gab-pill ${
                            courante === "pieces_manquantes"
                              ? "gab-pill-rouge"
                              : courante === "disponible"
                                ? "gab-pill-bleu"
                                : "gab-pill-vert"
                          }`}
                        >
                          {LIBELLES_ETAPES[courante].titre}
                        </span>
                      ) : (
                        <span className="gab-mini-muted">Pas encore commencé</span>
                      )}
                    </td>
                    <td>
                      {r.statut === "a_valider" ? (
                        <span className="gab-mini-muted">
                          En attente du citoyen
                        </span>
                      ) : suivantes.length === 0 ? (
                        <span className="gab-mini-muted">
                          {courante === "disponible"
                            ? "En attente RDV retrait"
                            : "—"}
                        </span>
                      ) : (
                        <select
                          className="gab-select"
                          value=""
                          onChange={(e) => {
                            const v = e.target.value as EtapeSuivi | "";
                            if (v) avancerEtape(r, v);
                          }}
                        >
                          <option value="">Faire avancer…</option>
                          {suivantes.map((et) => (
                            <option key={et} value={et}>
                              → {LIBELLES_ETAPES[et].titre}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                );
              })}
              {depots.length === 0 && (
                <tr>
                  <td colSpan={5} className="gab-vide">
                    Aucun dossier pour ces critères.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}

      {/* ----- Onglet retraits ----- */}
      {onglet === "retraits" && (
        <section className="gab-card">
          <table className="gab-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Citoyen</th>
                <th>Date de retrait</th>
                <th>Créneau</th>
              </tr>
            </thead>
            <tbody>
              {retraits.map((r) => (
                <tr key={r.id}>
                  <td className="gab-mono">{r.reference}</td>
                  <td>
                    <strong>{r.nom.toUpperCase()}</strong> {r.prenom}
                  </td>
                  <td>{r.dateRetrait ? labelDate(r.dateRetrait) : "—"}</td>
                  <td>{r.creneauRetrait ?? "—"}</td>
                </tr>
              ))}
              {retraits.length === 0 && (
                <tr>
                  <td colSpan={4} className="gab-vide">
                    Aucun retrait planifié.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}

      {/* ----- Onglet paramètres ----- */}
      {onglet === "params" && (
        <section className="gab-card gab-card-etroite">
          <h3 className="gab-h3">Durée des créneaux</h3>
          <p className="gab-muted">
            La durée choisie détermine le nombre de créneaux proposés aux
            citoyens chaque jour (plage 09:00 – 13:00).
          </p>
          <div className="gab-duree-choix">
            {DUREES.map((d) => (
              <button
                key={d}
                className={`gab-duree ${dureeCreneaux === d ? "sel" : ""}`}
                onClick={() => setDureeCreneaux(d)}
              >
                {d} min
                <em>{genererCreneaux(d).length} créneaux / jour</em>
              </button>
            ))}
          </div>
          <div className="gab-info-bloc">
            <Ligne k="Jours de dépôt" v="Lundi, mardi, mercredi, jeudi" />
            <Ligne k="Jours de retrait" v="Vendredi uniquement" />
            <Ligne k="Plage horaire" v="09:00 – 13:00" />
          </div>
        </section>
      )}
    </div>
  );
}
