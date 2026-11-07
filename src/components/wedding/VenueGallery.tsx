/**
 * VenueGallery — Álbum ilustrado de Quinta Monteguerra.
 * El marco doble a plumilla abraza directamente la fotografía de forma centrada y simétrica,
 * con una aguada suave de acuarela equilibrada en los cuatro costados.
 */
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface VenueGalleryProps {
  images: string[];
  lugar: string;
  lugarWeb: string;
}

export default function VenueGallery({ images, lugar, lugarWeb }: VenueGalleryProps) {
  const [current, setCurrent] = useState(0);
  const total = images.length;

  const goNext = () => setCurrent((i) => (i + 1) % total);
  const goPrev = () => setCurrent((i) => (i - 1 + total) % total);

  useEffect(() => {
    if (total <= 1) return undefined;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrent((i) => (i + 1) % total);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrent((i) => (i - 1 + total) % total);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [total]);

  if (total === 0) {
    return (
      <div className="aspect-[4/3] w-full flex items-center justify-center p-6">
        <span className="font-hand text-2xl text-[#3B539A]">Quinta Monteguerra</span>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-lg mx-auto flex flex-col items-center group">
      {/* Contenedor principal centrado de la lámina fotográfica */}
      <div className="relative w-full aspect-[4/3] p-2.5 sm:p-3.5">
        {/* Aguada de acuarela centrada y equilibrada en los 4 lados detrás del marco */}
        <div
          className="pointer-events-none absolute -inset-2 bg-[#DFB98C]/30 watercolor-card-shape watercolor-edge pigment-multiply"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -inset-1 bg-[#B8CDE3]/25 watercolor-card-shape watercolor-edge pigment-multiply"
          aria-hidden="true"
        />

        {/* Marco doble bocetado a mano en tinta #2B2B29 y azul cobalto #3B539A centrado sobre la foto */}
        <svg
          className="pointer-events-none absolute inset-0 w-full h-full overflow-visible z-20"
          viewBox="0 0 400 300"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M 6 8 C 135 4, 265 10, 394 6 C 397 100, 393 200, 395 292 C 265 296, 135 290, 5 294 C 3 200, 8 100, 6 8 Z"
            fill="none"
            stroke="#2B2B29"
            strokeWidth="1.25"
            strokeOpacity="0.48"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M 10 5 C 140 9, 260 3, 390 9 C 393 105, 396 195, 391 290 C 260 293, 130 296, 9 290 C 7 195, 4 105, 10 5 Z"
            fill="none"
            stroke="#3B539A"
            strokeWidth="0.95"
            strokeOpacity="0.32"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Fotografía encajada simétricamente dentro del marco de tinta */}
        <div className="w-full h-full overflow-hidden relative watercolor-card-shape bg-[#F4F6F8] z-10">
          <img
            key={current}
            src={images[current]}
            alt={`${lugar} — Imagen ${current + 1} de ${total}`}
            className="w-full h-full object-cover object-center transition-all duration-500 contrast-[0.97] sepia-[0.06]"
            loading={current === 0 ? "eager" : "lazy"}
            fetchPriority={current === 0 ? "high" : undefined}
          />

          {/* Velo sutil de papel cálido para integrar la fotografía al lienzo */}
          <div
            className="pointer-events-none absolute inset-0 bg-[#DFB98C]/10 mix-blend-multiply"
            aria-hidden="true"
          />

          {/* Flechas de navegación centradas verticalmente */}
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  goPrev();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center watercolor-mask bg-[#F4F6F8]/90 text-[#2B2B29] hover:text-[#3B539A] border border-[#2B2B29]/30 transition-transform duration-200 hover:scale-105 focus:outline-none cursor-pointer"
                aria-label="Fotografía anterior de la finca"
              >
                <ChevronLeft size={20} strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  goNext();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center watercolor-mask bg-[#F4F6F8]/90 text-[#2B2B29] hover:text-[#3B539A] border border-[#2B2B29]/30 transition-transform duration-200 hover:scale-105 focus:outline-none cursor-pointer"
                aria-label="Siguiente fotografía de la finca"
              >
                <ChevronRight size={20} strokeWidth={1.5} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Pie de foto manuscrito centrado debajo del marco */}
      <div className="mt-3 w-full flex items-center justify-between px-3 relative z-20">
        <a
          href={lugarWeb}
          target="_blank"
          rel="noopener noreferrer"
          className="font-hand text-2xl text-[#3B539A] hover:text-[#58693B] transition-colors"
        >
          {lugar} · Caserío y encinar
        </a>
        {total > 1 && (
          <span className="font-hand text-xl text-[#2B2B29]/75">
            lámina {current + 1} de {total}
          </span>
        )}
      </div>
    </div>
  );
}
