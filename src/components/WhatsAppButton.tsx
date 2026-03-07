/**
 * Botón de WhatsApp — versión flotante y de footer.
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
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-[#25D366]/30 transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-[#25D366]/40"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle size={26} />
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2.5 rounded-full border border-[#25D366]/40 bg-[#25D366]/8 px-6 py-3 font-sans font-light text-[#1A1A1A] transition-all duration-300 hover:border-[#25D366] hover:bg-[#25D366]/15"
      style={{ fontSize: "var(--text-small)" }}
    >
      <MessageCircle size={14} className="text-[#25D366]" />
      ¿Dudas? Escríbenos por WhatsApp
    </a>
  );
}
