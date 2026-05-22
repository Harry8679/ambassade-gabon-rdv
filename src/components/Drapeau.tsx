import { useId } from "react";
import type { CSSProperties } from "react";

/* =============================================================================
   Drapeau de la République gabonaise — version emblème circulaire
   ---------------------------------------------------------------------------
   Les trois bandes officielles (vert, jaune, bleu) sont rognées dans un
   cercle. `hauteur` correspond au diamètre, donc la largeur est identique.
   ========================================================================== */

interface DrapeauProps {
  /** Diamètre du logo en pixels (le drapeau est circulaire). */
  hauteur?: number;
  /** Style additionnel (utile pour les marges depuis le parent). */
  style?: CSSProperties;
}

export function Drapeau({ hauteur = 40, style }: DrapeauProps) {
  const id = useId();
  const clipId = `drapeau-gabon-${id}`;

  return (
    <svg
      width={hauteur}
      height={hauteur}
      viewBox="0 0 90 90"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Drapeau de la République gabonaise"
      style={{
        display: "block",
        flexShrink: 0,
        filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.18))",
        ...style,
      }}
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx="45" cy="45" r="45" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect width="90" height="30" y="0" fill="#009639" />
        <rect width="90" height="30" y="30" fill="#FCD116" />
        <rect width="90" height="30" y="60" fill="#3A75C4" />
      </g>
    </svg>
  );
}