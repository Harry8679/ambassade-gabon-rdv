import { useId } from "react";
import type { CSSProperties } from "react";

interface DrapeauProps {
  /** Hauteur en pixels. La largeur est calculée selon le ratio officiel 4:3. */
  hauteur?: number;
  /** Style additionnel (utile pour les marges depuis le parent). */
  style?: CSSProperties;
}

export function Drapeau({ hauteur = 36, style }: DrapeauProps) {
  const id = useId();
  const clipId = `drapeau-gabon-${id}`;
  const largeur = (hauteur * 4) / 3;

  return (
    <svg
      width={largeur}
      height={hauteur}
      viewBox="0 0 120 90"
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
          <rect width="120" height="90" rx="4" ry="4" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect width="120" height="30" y="0" fill="#009639" />
        <rect width="120" height="30" y="30" fill="#FCD116" />
        <rect width="120" height="30" y="60" fill="#3A75C4" />
      </g>
    </svg>
  );
}