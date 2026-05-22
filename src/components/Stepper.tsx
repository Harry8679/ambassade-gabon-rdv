import type { Mode } from "../types";

/* =============================================================================
   Indicateur d'étapes du parcours citoyen
   ========================================================================== */

interface StepperProps {
  /** Numéro de l'étape courante (1 à 4). */
  actif: number;
  mode: Mode;
}

export function Stepper({ actif, mode }: StepperProps) {
  const etapes =
    mode === "depot"
      ? ["Démarche", "Jour", "Horaire", "Informations"]
      : ["Dossier", "Jour", "Horaire", "Confirmation"];

  return (
    <div className="gab-stepper">
      {etapes.map((e, i) => (
        <div key={e} className={`gab-step ${i + 1 <= actif ? "fait" : ""}`}>
          <span>{i + 1}</span>
          {e}
        </div>
      ))}
    </div>
  );
}
