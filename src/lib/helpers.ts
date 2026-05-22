import { HEURE_DEBUT, HEURE_FIN, MOIS_FR } from "../data/constants";
import type { EtapeSuivi, Reservation } from "../types";

/* =============================================================================
   Fonctions utilitaires
   ========================================================================== */

/**
 * Génère la liste des créneaux horaires d'une journée (matinée 09:00 – 13:00).
 * @param dureeMin durée d'un créneau en minutes (paramétrée par l'admin).
 */
export function genererCreneaux(dureeMin: number): string[] {
  const creneaux: string[] = [];
  for (let t = HEURE_DEBUT * 60; t + dureeMin <= HEURE_FIN * 60; t += dureeMin) {
    const h = String(Math.floor(t / 60)).padStart(2, "0");
    const m = String(t % 60).padStart(2, "0");
    creneaux.push(`${h}:${m}`);
  }
  return creneaux;
}

/** Convertit une Date en chaîne ISO (YYYY-MM-DD). */
export function isoDate(d: Date): string {
  const mois = String(d.getMonth() + 1).padStart(2, "0");
  const jour = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mois}-${jour}`;
}

/** Formate une date ISO en libellé lisible (« 19 mai 2026 »). */
export function labelDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return `${d.getDate()} ${MOIS_FR[d.getMonth()]} ${d.getFullYear()}`;
}

/** Formate une date/heure ISO (« 19 mai 2026 à 10:30 »). */
export function formatDateHeure(iso: string): string {
  const d = new Date(iso);
  const heure = String(d.getHours()).padStart(2, "0");
  const minute = String(d.getMinutes()).padStart(2, "0");
  return `${d.getDate()} ${MOIS_FR[d.getMonth()]} ${d.getFullYear()} à ${heure}:${minute}`;
}

/**
 * Construit la grille d'un mois pour le calendrier.
 * Les cases nulles correspondent au décalage du 1er jour (semaine lun → dim).
 */
export function cellulesCalendrier(annee: number, mois: number): (Date | null)[] {
  const nbJours = new Date(annee, mois + 1, 0).getDate();
  let decalage = new Date(annee, mois, 1).getDay() - 1;
  if (decalage < 0) decalage = 6;
  const cells: (Date | null)[] = Array<Date | null>(decalage).fill(null);
  for (let j = 1; j <= nbJours; j++) cells.push(new Date(annee, mois, j));
  return cells;
}

/** Construit un numéro de référence de dossier (GAB-2026-00042). */
export function reference(id: number): string {
  return `GAB-2026-${String(id).padStart(5, "0")}`;
}

/** Renvoie l'étape la plus récente d'un dossier (null si jamais commencé). */
export function etapeActuelle(r: Reservation): EtapeSuivi | null {
  if (r.historique.length === 0) return null;
  return r.historique[r.historique.length - 1].etape;
}

/** Date/heure ISO « YYYY-MM-DDTHH:mm » du moment présent. */
export function maintenantIso(): string {
  const d = new Date();
  return (
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` +
    `-${String(d.getDate()).padStart(2, "0")}` +
    `T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
  );
}
