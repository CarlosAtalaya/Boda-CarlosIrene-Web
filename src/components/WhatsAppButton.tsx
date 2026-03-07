/**
 * Botón flotante o en footer para contactar por WhatsApp.
 * Usa wa.me con número y texto preconfigurado.
 */
import { MessageCircle } from "lucide-react";
import { EVENT_CONFIG } from "../lib/event-config";

export default function WhatsAppButton({ flotante = true }: { flotante?: boolean }) {
  const url = `https://wa.me/${EVENT_CONFIG.whatsappNumero}?text=${encodeURIComponent(EVENT_CONFIG.whatsappMensaje)}`;

  if (flotante) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 hover:shadow-xl"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="h-7 w-7" />
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-lg border border-[#25D366]/50 bg-[#25D366]/10 px-4 py-2 font-sans text-[#1A1A1A] transition hover:bg-[#25D366]/20"
    >
      <MessageCircle className="h-5 w-5 text-[#25D366]" />
      ¿Dudas? Escríbenos por WhatsApp
    </a>
  );
}
