import { useState } from "react";
import type { Reservation, Toast } from "./types";
import { VERT, JAUNE, BLEU } from "./data/constants";
import { donneesInitiales } from "./data/seed";
import { EspaceCitoyen } from "./components/EspaceCitoyen";
import { EspaceAdmin } from "./components/EspaceAdmin";

/* =============================================================================
   AMBASSADE DU GABON EN FRANCE — Prise de rendez-vous passeport
   ---------------------------------------------------------------------------
   Composant racine : gère la vue active (citoyen / admin), la durée des
   créneaux (pilotée par l'admin), la liste des réservations et les
   notifications « email envoyé ».
   ========================================================================== */

/** Vue active de l'application. */
type Vue = "citoyen" | "admin";

/** Durée initiale d'un créneau, en minutes. */
const DUREE_INITIALE = 30;

export default function App() {
  const [vue, setVue] = useState<Vue>("citoyen");
  const [dureeCreneaux, setDureeCreneaux] = useState<number>(DUREE_INITIALE);
  const [reservations, setReservations] = useState<Reservation[]>(() =>
    donneesInitiales(DUREE_INITIALE),
  );
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Simule l'envoi d'un email : affiche une notification temporaire.
  const envoyerEmail = (destinataire: string, sujet: string) => {
    const toast: Toast = {
      id: Date.now() + Math.random(),
      destinataire,
      sujet,
    };
    setToasts((prev) => [...prev, toast]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== toast.id)),
      6500,
    );
  };

  return (
    <div className="gab-app">
      <div className="gab-tricolore" />

      <header className="gab-header">
        <div className="gab-header-in">
          <div className="gab-brand">
            <div className="gab-blason" aria-hidden="true">
              <span style={{ background: VERT }} />
              <span style={{ background: JAUNE }} />
              <span style={{ background: BLEU }} />
            </div>
            <div>
              <h1>Ambassade de la République gabonaise en France</h1>
              <p>Service des passeports — Prise de rendez-vous en ligne</p>
            </div>
          </div>
          <div className="gab-switch">
            <button
              className={vue === "citoyen" ? "on" : ""}
              onClick={() => setVue("citoyen")}
            >
              Espace citoyen
            </button>
            <button
              className={vue === "admin" ? "on" : ""}
              onClick={() => setVue("admin")}
            >
              Administration
            </button>
          </div>
        </div>
      </header>

      <main className="gab-main">
        {vue === "citoyen" ? (
          <EspaceCitoyen
            reservations={reservations}
            setReservations={setReservations}
            dureeCreneaux={dureeCreneaux}
            envoyerEmail={envoyerEmail}
          />
        ) : (
          <EspaceAdmin
            reservations={reservations}
            setReservations={setReservations}
            dureeCreneaux={dureeCreneaux}
            setDureeCreneaux={setDureeCreneaux}
            envoyerEmail={envoyerEmail}
          />
        )}
      </main>

      <footer className="gab-footer">
        Prototype de démonstration — République gabonaise · Union · Travail ·
        Justice
      </footer>

      {/* Notifications simulant les emails envoyés */}
      <div className="gab-toasts">
        {toasts.map((t) => (
          <div className="gab-toast" key={t.id}>
            <strong>Email envoyé</strong>
            <span>à {t.destinataire}</span>
            <em>{t.sujet}</em>
          </div>
        ))}
      </div>
    </div>
  );
}
