/**
 * Sección de ubicación con botón que abre Google Maps.
 */
import { MapPin } from "lucide-react";
import { EVENT_CONFIG } from "../lib/event-config";

export default function LocationSection() {
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(EVENT_CONFIG.coordenadas)}`;

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-xl px-6 text-center">
        <h2 className="font-serif text-2xl text-[#1A1A1A] sm:text-3xl">
          Ubicación
        </h2>
        <p className="mt-4 font-sans text-[#1A1A1A]/80">
          {EVENT_CONFIG.lugar}
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-lg border border-[#C5A059] bg-transparent px-6 py-3 font-sans text-[#1A1A1A] transition hover:bg-[#C5A059]/10"
        >
          <MapPin className="h-5 w-5 text-[#C5A059]" />
          Ver en Google Maps
        </a>
      </div>
    </section>
  );
}
