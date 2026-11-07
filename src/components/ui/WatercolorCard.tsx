/**
 * WatercolorCard — Contenedor reutilizable con aguada de acuarela y borde bocetado a mano.
 * Reemplaza las cards digitales estándar (cero box-shadow, cero bordes rectos).
 */
import React from "react";

export type PigmentWash = "paper" | "sky" | "olive" | "albero" | "cobalt";

interface WatercolorCardProps {
  children: React.ReactNode;
  wash?: PigmentWash;
  className?: string;
  as?: "div" | "article" | "section";
}

const WASH_STYLES: Record<PigmentWash, string> = {
  paper: "bg-[#EAECEF]/70",
  sky: "bg-[#B8CDE3]/28",
  olive: "bg-[#8A9A5B]/20",
  albero: "bg-[#DFB98C]/26",
  cobalt: "bg-[#3B539A]/14",
};

export default function WatercolorCard({
  children,
  wash = "paper",
  className = "",
  as: Tag = "div",
}: WatercolorCardProps) {
  return (
    <Tag className={`relative isolate p-6 sm:p-8 ${className}`}>
      {/* Mancha de aguada orgánica integrada al papel con multiply */}
      <div
        className={`pointer-events-none absolute inset-0 watercolor-card-shape watercolor-edge pigment-multiply ${WASH_STYLES[wash]}`}
        aria-hidden="true"
      />

      {/* Marco doble trazado a plumilla en tinta #2B2B29 y azul cobalto #3B539A */}
      <svg
        className="pointer-events-none absolute inset-0 w-full h-full overflow-visible"
        viewBox="0 0 400 260"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M 6 8 C 130 2, 270 11, 394 5 C 398 88, 392 175, 395 253 C 265 258, 135 250, 5 255 C 2 170, 9 85, 6 8 Z"
          fill="none"
          stroke="#2B2B29"
          strokeWidth="1.15"
          strokeOpacity="0.34"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M 9 5 C 140 9, 260 3, 391 9 C 395 92, 397 170, 392 250 C 260 253, 130 257, 8 251 C 6 168, 3 88, 9 5 Z"
          fill="none"
          stroke="#3B539A"
          strokeWidth="0.85"
          strokeOpacity="0.24"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Contenido de la nota sobre el pliego */}
      <div className="relative z-10">{children}</div>
    </Tag>
  );
}
