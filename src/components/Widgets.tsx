import { VERT, JAUNE, BLEU } from "../data/constants";
import type { Statut } from "../types";

/* =============================================================================
   Petits composants d'interface réutilisables
   ========================================================================== */

interface ChampProps {
  label: string;
  v: string;
  on: (valeur: string) => void;
  type?: string;
  large?: boolean;
}

/** Champ de formulaire (libellé + input). */
export function Champ({ label, v, on, type = "text", large = false }: ChampProps) {
  return (
    <div className={large ? "gab-champ-large" : ""}>
      <label className="gab-label">{label}</label>
      <input
        className="gab-input"
        type={type}
        value={v}
        onChange={(e) => on(e.target.value)}
      />
    </div>
  );
}

interface LigneProps {
  k: string;
  v: string;
  fort?: boolean;
}

/** Ligne « clé / valeur » d'un bloc récapitulatif. */
export function Ligne({ k, v, fort = false }: LigneProps) {
  return (
    <div className="gab-ligne">
      <span>{k}</span>
      <strong className={fort ? "gab-fort" : ""}>{v}</strong>
    </div>
  );
}

interface KpiProps {
  n: number;
  t: string;
  c: string;
}

/** Indicateur chiffré du tableau de bord admin. */
export function Kpi({ n, t, c }: KpiProps) {
  return (
    <div className="gab-kpi">
      <div className="gab-kpi-n" style={{ color: c }}>
        {n}
      </div>
      <div className="gab-kpi-t">{t}</div>
      <div className="gab-kpi-barre" style={{ background: c }} />
    </div>
  );
}

/** Correspondance statut -> [libellé, couleur de fond, couleur de texte]. */
const BADGES: Record<Statut, [string, string, string]> = {
  a_valider: ["Email non confirmé", JAUNE, "#7a5b00"],
  confirme: ["Confirmé", VERT, "#fff"],
  passeport_arrive: ["Passeport arrivé", BLEU, "#fff"],
  retrait_planifie: ["Retrait planifié", "#1f2937", "#fff"],
};

/** Étiquette colorée représentant le statut d'un dossier. */
export function Badge({ statut }: { statut: Statut }) {
  const [txt, bg, fg] = BADGES[statut];
  return (
    <span className="gab-badge" style={{ background: bg, color: fg }}>
      {txt}
    </span>
  );
}
