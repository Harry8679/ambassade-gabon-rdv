import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Mode, Reservation, TypeDemande } from "../types";
import { VERT, JAUNE, BLEU } from "../data/constants";
import { labelDate, maintenantIso, reference } from "../lib/helpers";
import { Stepper } from "./Stepper";
import { Calendrier } from "./Calendrier";
import { GrilleCreneaux } from "./GrilleCreneaux";
import { Champ, Ligne } from "./Widgets";
import { Suivi } from "./Suivi";

/* =============================================================================
   ESPACE CITOYEN
   ---------------------------------------------------------------------------
   Trois parcours :
   - « Déposer un dossier »   : démarche -> jour -> créneau -> formulaire.
   - « Récupérer mon passeport » : référence -> vendredi -> créneau.
   - « Suivre mon dossier »   : référence -> timeline d'avancement.
   ========================================================================== */

/** Les différents écrans du parcours citoyen. */
type EtapeCitoyen =
  | "accueil"
  | "type"
  | "retrait"
  | "recherche_suivi"
  | "calendrier"
  | "creneau"
  | "formulaire"
  | "recap"
  | "confirmation"
  | "suivi";

/** Données saisies dans le formulaire de dépôt. */
interface FormulaireCitoyen {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  numeroPasseport: string;
}

const FORM_VIDE: FormulaireCitoyen = {
  nom: "",
  prenom: "",
  email: "",
  telephone: "",
  numeroPasseport: "",
};

interface EspaceCitoyenProps {
  reservations: Reservation[];
  setReservations: Dispatch<SetStateAction<Reservation[]>>;
  dureeCreneaux: number;
  envoyerEmail: (destinataire: string, sujet: string) => void;
}

export function EspaceCitoyen({
  reservations,
  setReservations,
  dureeCreneaux,
  envoyerEmail,
}: EspaceCitoyenProps) {
  const [etape, setEtape] = useState<EtapeCitoyen>("accueil");
  const [mode, setMode] = useState<Mode>("depot");
  const [typeDemande, setTypeDemande] = useState<TypeDemande | null>(null);
  const [dateSel, setDateSel] = useState<string | null>(null);
  const [creneauSel, setCreneauSel] = useState<string | null>(null);
  const [form, setForm] = useState<FormulaireCitoyen>(FORM_VIDE);
  const [dossierRetrait, setDossierRetrait] = useState<Reservation | null>(null);
  const [dossierSuivi, setDossierSuivi] = useState<Reservation | null>(null);
  const [refSaisie, setRefSaisie] = useState("");
  const [erreurRef, setErreurRef] = useState("");
  const [nouvelleResa, setNouvelleResa] = useState<Reservation | null>(null);

  // Synchronise le dossier affiché en suivi avec les mises à jour de l'admin.
  const dossierSuiviActuel = dossierSuivi
    ? reservations.find((r) => r.id === dossierSuivi.id) ?? dossierSuivi
    : null;

  // Réinitialise tout le parcours.
  const recommencer = () => {
    setEtape("accueil");
    setMode("depot");
    setTypeDemande(null);
    setDateSel(null);
    setCreneauSel(null);
    setForm(FORM_VIDE);
    setDossierRetrait(null);
    setDossierSuivi(null);
    setRefSaisie("");
    setErreurRef("");
    setNouvelleResa(null);
  };

  // Étape calendrier -> validation du jour choisi.
  const validerJour = (iso: string) => {
    setDateSel(iso);
    setCreneauSel(null);
    setEtape("creneau");
  };

  // Enregistre la demande de dépôt et déclenche l'email de confirmation.
  const soumettreDemande = () => {
    if (!typeDemande || !dateSel || !creneauSel) return;
    const id = Math.max(...reservations.map((r) => r.id)) + 1;
    const resa: Reservation = {
      id,
      reference: reference(id),
      typeDemande,
      nom: form.nom,
      prenom: form.prenom,
      email: form.email,
      telephone: form.telephone,
      numeroPasseport: form.numeroPasseport,
      date: dateSel,
      creneau: creneauSel,
      statut: "a_valider",
      emailValide: false,
      dateRetrait: null,
      creneauRetrait: null,
      historique: [],
    };
    setReservations((prev) => [...prev, resa]);
    setNouvelleResa(resa);
    envoyerEmail(
      form.email,
      "Confirmez votre adresse email pour valider le rendez-vous",
    );
    setEtape("confirmation");
  };

  // Simule le clic du citoyen sur le lien reçu par email (double opt-in).
  const confirmerEmail = () => {
    if (!nouvelleResa) return;
    const id = nouvelleResa.id;
    setReservations((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, emailValide: true, statut: "confirme" } : r,
      ),
    );
    setNouvelleResa((r) =>
      r ? { ...r, emailValide: true, statut: "confirme" } : r,
    );
  };

  // Recherche un dossier par numéro de référence (parcours retrait).
  const chercherDossier = () => {
    const d = reservations.find(
      (r) => r.reference.toLowerCase() === refSaisie.trim().toLowerCase(),
    );
    if (!d) {
      setErreurRef("Aucun dossier ne correspond à cette référence.");
      return;
    }
    if (d.statut === "retrait_planifie") {
      setErreurRef("Un rendez-vous de retrait est déjà planifié pour ce dossier.");
      return;
    }
    if (d.statut !== "passeport_arrive") {
      setErreurRef(
        "Votre passeport n'est pas encore disponible. Vous recevrez un email dès son arrivée.",
      );
      return;
    }
    setErreurRef("");
    setDossierRetrait(d);
    setEtape("calendrier");
  };

  // Recherche un dossier par numéro de référence (parcours suivi).
  const chercherSuivi = () => {
    const d = reservations.find(
      (r) => r.reference.toLowerCase() === refSaisie.trim().toLowerCase(),
    );
    if (!d) {
      setErreurRef("Aucun dossier ne correspond à cette référence.");
      return;
    }
    setErreurRef("");
    setDossierSuivi(d);
    setEtape("suivi");
  };

  // Valide le rendez-vous de retrait choisi.
  const validerRetrait = () => {
    if (!dossierRetrait || !dateSel || !creneauSel) return;
    const id = dossierRetrait.id;
    setReservations((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              statut: "retrait_planifie",
              dateRetrait: dateSel,
              creneauRetrait: creneauSel,
              historique: [
                ...r.historique,
                { date: maintenantIso(), etape: "retrait_planifie" },
              ],
            }
          : r,
      ),
    );
    envoyerEmail(
      dossierRetrait.email,
      "Confirmation du rendez-vous de retrait du passeport",
    );
    setNouvelleResa({
      ...dossierRetrait,
      dateRetrait: dateSel,
      creneauRetrait: creneauSel,
    });
    setEtape("confirmation");
  };

  /* --------------------------- Rendu ---------------------------------- */
  return (
    <div className="gab-citoyen">
      {etape !== "accueil" && (
        <button className="gab-retour" onClick={recommencer}>
          ← Accueil
        </button>
      )}

      {/* ---------- ACCUEIL : trois services ---------- */}
      {etape === "accueil" && (
        <>
          <div className="gab-hero">
            <span className="gab-kicker">Démarches consulaires</span>
            <h2>Votre passeport gabonais, sans file d'attente</h2>
            <p>
              Réservez en ligne le dépôt de votre dossier, planifiez la
              récupération de votre passeport ou suivez l'avancement de votre
              demande. Service réservé aux ressortissants gabonais résidant en
              France.
            </p>
          </div>
          <div className="gab-services">
            <button
              className="gab-service"
              onClick={() => {
                setMode("depot");
                setEtape("type");
              }}
            >
              <div className="gab-service-ic" style={{ background: VERT }}>
                1
              </div>
              <h3>Déposer un dossier</h3>
              <p>
                Première demande ou renouvellement de passeport. Rendez-vous du
                lundi au jeudi.
              </p>
              <span className="gab-service-go">Prendre rendez-vous →</span>
            </button>

            <button
              className="gab-service"
              onClick={() => {
                setMode("retrait");
                setEtape("retrait");
              }}
            >
              <div className="gab-service-ic" style={{ background: BLEU }}>
                2
              </div>
              <h3>Récupérer mon passeport</h3>
              <p>
                Votre passeport est arrivé ? Choisissez un vendredi pour venir
                le retirer.
              </p>
              <span className="gab-service-go">Planifier le retrait →</span>
            </button>

            <button
              className="gab-service"
              onClick={() => setEtape("recherche_suivi")}
            >
              <div
                className="gab-service-ic"
                style={{ background: JAUNE, color: "#7a5b00" }}
              >
                3
              </div>
              <h3>Suivre mon dossier</h3>
              <p>
                Instruction, transmission à Libreville, fabrication, retour à
                Paris : suivez chaque étape.
              </p>
              <span className="gab-service-go">Voir l'avancement →</span>
            </button>
          </div>
        </>
      )}

      {/* ---------- ÉTAPE : type de demande ---------- */}
      {etape === "type" && (
        <section className="gab-card">
          <Stepper actif={1} mode="depot" />
          <h3 className="gab-h3">Quelle démarche souhaitez-vous effectuer ?</h3>
          <div className="gab-choix">
            {(
              [
                [
                  "premiere",
                  "Première demande",
                  "Vous n'avez jamais possédé de passeport gabonais.",
                ],
                [
                  "renouvellement",
                  "Renouvellement",
                  "Votre passeport est expiré ou arrive à expiration.",
                ],
              ] as [TypeDemande, string, string][]
            ).map(([val, titre, desc]) => (
              <button
                key={val}
                className={`gab-choix-item ${typeDemande === val ? "sel" : ""}`}
                onClick={() => setTypeDemande(val)}
              >
                <span className="gab-radio" />
                <span>
                  <strong>{titre}</strong>
                  <em>{desc}</em>
                </span>
              </button>
            ))}
          </div>
          <button
            className="gab-btn gab-btn-primaire"
            disabled={!typeDemande}
            onClick={() => setEtape("calendrier")}
          >
            Continuer
          </button>
        </section>
      )}

      {/* ---------- ÉTAPE : recherche dossier (retrait) ---------- */}
      {etape === "retrait" && (
        <section className="gab-card gab-card-etroite">
          <h3 className="gab-h3">Récupération de passeport</h3>
          <p className="gab-muted">
            Saisissez le numéro de référence figurant dans l'email vous informant
            que votre passeport est disponible.
          </p>
          <label className="gab-label">Numéro de référence du dossier</label>
          <input
            className="gab-input"
            placeholder="Ex. GAB-2026-00042"
            value={refSaisie}
            onChange={(e) => setRefSaisie(e.target.value)}
          />
          <p className="gab-astuce">
            Démo : utilisez la référence <code>GAB-2026-00012</code> (passeport
            arrivé).
          </p>
          {erreurRef && <p className="gab-erreur">{erreurRef}</p>}
          <button className="gab-btn gab-btn-primaire" onClick={chercherDossier}>
            Rechercher mon dossier
          </button>
        </section>
      )}

      {/* ---------- ÉTAPE : recherche dossier (suivi) ---------- */}
      {etape === "recherche_suivi" && (
        <section className="gab-card gab-card-etroite">
          <h3 className="gab-h3">Suivre mon dossier</h3>
          <p className="gab-muted">
            Saisissez votre numéro de référence pour consulter l'état
            d'avancement de votre passeport.
          </p>
          <label className="gab-label">Numéro de référence du dossier</label>
          <input
            className="gab-input"
            placeholder="Ex. GAB-2026-00042"
            value={refSaisie}
            onChange={(e) => setRefSaisie(e.target.value)}
          />
          <p className="gab-astuce">
            Démo : <code>GAB-2026-00014</code> (instruction),{" "}
            <code>00015</code> (pièces manquantes), <code>00016</code> (transmis
            à Libreville), <code>00017</code> (fabrication), <code>00018</code>{" "}
            (retour Paris), <code>00012</code> (disponible).
          </p>
          {erreurRef && <p className="gab-erreur">{erreurRef}</p>}
          <button className="gab-btn gab-btn-primaire" onClick={chercherSuivi}>
            Afficher l'avancement
          </button>
        </section>
      )}

      {/* ---------- ÉTAPE : suivi (timeline) ---------- */}
      {etape === "suivi" && dossierSuiviActuel && (
        <Suivi dossier={dossierSuiviActuel} />
      )}

      {/* ---------- ÉTAPE : calendrier ---------- */}
      {etape === "calendrier" && (
        <section className="gab-card">
          <Stepper actif={2} mode={mode} />
          <h3 className="gab-h3">
            {mode === "depot"
              ? "Choisissez un jour pour le dépôt de votre dossier"
              : "Choisissez un vendredi pour retirer votre passeport"}
          </h3>
          <p className="gab-muted">
            {mode === "depot"
              ? "Les dépôts ont lieu du lundi au jeudi. Une journée complète apparaît grisée."
              : "Les retraits ont lieu uniquement le vendredi."}
          </p>
          <Calendrier
            mode={mode}
            reservations={reservations}
            dureeCreneaux={dureeCreneaux}
            dateSel={dateSel}
            onSelect={validerJour}
          />
        </section>
      )}

      {/* ---------- ÉTAPE : créneau horaire ---------- */}
      {etape === "creneau" && dateSel && (
        <section className="gab-card">
          <Stepper actif={3} mode={mode} />
          <h3 className="gab-h3">Choisissez un horaire — {labelDate(dateSel)}</h3>
          <GrilleCreneaux
            mode={mode}
            date={dateSel}
            reservations={reservations}
            dureeCreneaux={dureeCreneaux}
            creneauSel={creneauSel}
            onSelect={setCreneauSel}
          />
          <div className="gab-actions">
            <button
              className="gab-btn gab-btn-clair"
              onClick={() => setEtape("calendrier")}
            >
              ← Changer de jour
            </button>
            <button
              className="gab-btn gab-btn-primaire"
              disabled={!creneauSel}
              onClick={() => setEtape(mode === "depot" ? "formulaire" : "recap")}
            >
              Continuer
            </button>
          </div>
        </section>
      )}

      {/* ---------- ÉTAPE : formulaire (dépôt) ---------- */}
      {etape === "formulaire" && dateSel && (
        <section className="gab-card">
          <Stepper actif={4} mode="depot" />
          <h3 className="gab-h3">Vos informations</h3>
          <div className="gab-recap-mini">
            {typeDemande === "premiere" ? "Première demande" : "Renouvellement"} ·{" "}
            {labelDate(dateSel)} · {creneauSel}
          </div>
          <div className="gab-grille-form">
            <Champ
              label="Nom"
              v={form.nom}
              on={(v) => setForm({ ...form, nom: v })}
            />
            <Champ
              label="Prénom"
              v={form.prenom}
              on={(v) => setForm({ ...form, prenom: v })}
            />
            <Champ
              label="Adresse email"
              type="email"
              v={form.email}
              on={(v) => setForm({ ...form, email: v })}
              large
            />
            <Champ
              label="Téléphone"
              v={form.telephone}
              on={(v) => setForm({ ...form, telephone: v })}
            />
            {typeDemande === "renouvellement" && (
              <Champ
                label="N° du passeport actuel"
                v={form.numeroPasseport}
                on={(v) => setForm({ ...form, numeroPasseport: v })}
              />
            )}
          </div>
          <p className="gab-rgpd">
            Vos données sont utilisées uniquement pour le traitement de votre
            rendez-vous, conformément au RGPD.
          </p>
          <div className="gab-actions">
            <button
              className="gab-btn gab-btn-clair"
              onClick={() => setEtape("creneau")}
            >
              ← Retour
            </button>
            <button
              className="gab-btn gab-btn-primaire"
              disabled={!form.nom || !form.prenom || !form.email}
              onClick={soumettreDemande}
            >
              Valider ma demande
            </button>
          </div>
        </section>
      )}

      {/* ---------- ÉTAPE : récap retrait ---------- */}
      {etape === "recap" && dossierRetrait && dateSel && (
        <section className="gab-card gab-card-etroite">
          <h3 className="gab-h3">Confirmer le retrait</h3>
          <div className="gab-recap-bloc">
            <Ligne k="Dossier" v={dossierRetrait.reference} />
            <Ligne
              k="Titulaire"
              v={`${dossierRetrait.prenom} ${dossierRetrait.nom}`}
            />
            <Ligne k="Date de retrait" v={labelDate(dateSel)} />
            <Ligne k="Horaire" v={creneauSel ?? ""} />
          </div>
          <div className="gab-actions">
            <button
              className="gab-btn gab-btn-clair"
              onClick={() => setEtape("creneau")}
            >
              ← Retour
            </button>
            <button className="gab-btn gab-btn-primaire" onClick={validerRetrait}>
              Confirmer le rendez-vous
            </button>
          </div>
        </section>
      )}

      {/* ---------- ÉTAPE : confirmation ---------- */}
      {etape === "confirmation" && nouvelleResa && (
        <section className="gab-card gab-card-etroite gab-confirme">
          {mode === "depot" ? (
            <>
              <div
                className="gab-check"
                style={{ background: nouvelleResa.emailValide ? VERT : JAUNE }}
              >
                {nouvelleResa.emailValide ? "✓" : "✉"}
              </div>
              {!nouvelleResa.emailValide ? (
                <>
                  <h3 className="gab-h3">Vérifiez votre adresse email</h3>
                  <p className="gab-muted">
                    Un email a été envoyé à <strong>{nouvelleResa.email}</strong>.
                    Votre rendez-vous ne sera{" "}
                    <strong>définitivement validé</strong> qu'après avoir cliqué
                    sur le lien de confirmation.
                  </p>
                  <button className="gab-btn gab-btn-bleu" onClick={confirmerEmail}>
                    Simuler le clic sur le lien de l'email
                  </button>
                </>
              ) : (
                <>
                  <h3 className="gab-h3">Rendez-vous confirmé</h3>
                  <p className="gab-muted">
                    Votre adresse a été vérifiée. Conservez bien votre numéro de
                    dossier : il vous servira pour la récupération du passeport.
                  </p>
                </>
              )}
              <div className="gab-recap-bloc">
                <Ligne k="Référence" v={nouvelleResa.reference} fort />
                <Ligne
                  k="Démarche"
                  v={
                    nouvelleResa.typeDemande === "premiere"
                      ? "Première demande"
                      : "Renouvellement"
                  }
                />
                <Ligne
                  k="Dépôt"
                  v={`${labelDate(nouvelleResa.date)} à ${nouvelleResa.creneau}`}
                />
                <Ligne
                  k="Statut"
                  v={
                    nouvelleResa.emailValide
                      ? "Confirmé"
                      : "En attente de validation email"
                  }
                />
              </div>
            </>
          ) : (
            <>
              <div className="gab-check" style={{ background: BLEU }}>
                ✓
              </div>
              <h3 className="gab-h3">Retrait planifié</h3>
              <p className="gab-muted">
                Un email de confirmation a été envoyé à{" "}
                <strong>{nouvelleResa.email}</strong>. Présentez-vous muni d'une
                pièce d'identité.
              </p>
              <div className="gab-recap-bloc">
                <Ligne k="Référence" v={nouvelleResa.reference} fort />
                <Ligne
                  k="Retrait"
                  v={`${labelDate(nouvelleResa.dateRetrait ?? "")} à ${
                    nouvelleResa.creneauRetrait ?? ""
                  }`}
                />
              </div>
            </>
          )}
          <button className="gab-btn gab-btn-clair" onClick={recommencer}>
            Retour à l'accueil
          </button>
        </section>
      )}
    </div>
  );
}
