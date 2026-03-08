/**
 * VenueGallery — Carrusel de fotos del lugar.
 * Una imagen a la vez con flechas para navegar. Estilo editorial burdeos/crema.
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
      <div className="aspect-[4/5] w-full bg-[#F3EFEA] flex items-center justify-center border border-[#D9C5C5] p-2">
        <span className="font-serif text-lg text-[#8B4542] italic">Fotos del lugar</span>
      </div>
    );
  }

  return (
    <div className="relative w-full border border-[#D9C5C5] p-2 group">
      <div className="aspect-[4/5] w-full overflow-hidden bg-[#F3EFEA] relative">
        <img
          key={current}
          src={images[current]}
          alt={`${lugar} — Foto ${current + 1} de ${total}`}
          className="w-full h-full object-cover object-center transition-opacity duration-300"
          loading={current === 0 ? "eager" : "lazy"}
          fetchpriority={current === 0 ? "high" : undefined}
        />

        {/* Flechas — visible en hover y siempre en touch */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                goPrev();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center bg-[#F9F8F6]/90 hover:bg-[#F9F8F6] border border-[#8B4542]/40 text-[#8B4542] transition-all duration-300 opacity-80 hover:opacity-100 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#8B4542] focus:ring-offset-2"
              aria-label="Foto anterior"
            >
              <ChevronLeft size={24} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                goNext();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center bg-[#F9F8F6]/90 hover:bg-[#F9F8F6] border border-[#8B4542]/40 text-[#8B4542] transition-all duration-300 opacity-80 hover:opacity-100 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#8B4542] focus:ring-offset-2"
              aria-label="Siguiente foto"
            >
              <ChevronRight size={24} strokeWidth={1.5} />
            </button>
          </>
        )}

        {/* Contador discreto */}
        {total > 1 && (
          <span className="absolute bottom-3 right-3 z-10 font-sans text-xs text-white/90 bg-black/40 px-2 py-1">
            {current + 1} / {total}
          </span>
        )}

        {/* Overlay suave al hover */}
        <div className="absolute inset-0 bg-black/5 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>

      {/* Enlace a la web del lugar */}
      <a
        href={lugarWeb}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 block text-center font-serif text-sm text-[#8B4542] italic hover:underline"
      >
        Conocer el lugar
      </a>
    </div>
  );
}
