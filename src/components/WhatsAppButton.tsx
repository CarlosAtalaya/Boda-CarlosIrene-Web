/**
 * Botón de WhatsApp — versión flotante y de footer.
 * Soporta contacto de Carlos o Irene.
 */
import { MessageCircle } from "lucide-react";
import { EVENT_CONFIG } from "../lib/event-config";

type ContactoPersona = "carlos" | "irene";

interface WhatsAppButtonProps {
  flotante?: boolean;
  contacto?: ContactoPersona;
  /** Desplazamiento vertical para FAB (ej. segundo botón flotante) */
  bottomOffset?: number;
}

export default function WhatsAppButton({
  flotante = true,
  contacto = "carlos",
  bottomOffset = 0,
}: WhatsAppButtonProps) {
  const { numero, mensaje } = EVENT_CONFIG.contacto[contacto];
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
  const label = contacto === "carlos" ? "Carlos" : "Irene";

  if (flotante) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed right-6 z-50 flex h-14 w-14 min-w-[56px] min-h-[56px] items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-[#25D366]/30 transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-[#25D366]/40 touch-manipulation"
        style={{ bottom: `calc(24px + ${bottomOffset}px + env(safe-area-inset-bottom, 0px))` }}
        aria-label={`Contactar a ${label} por WhatsApp`}
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
      className="inline-flex min-h-[44px] items-center justify-center gap-2.5 rounded-full border border-[#25D366]/40 bg-[#25D366]/8 px-6 py-3 font-sans font-light text-[#2A2A2A] transition-all duration-300 hover:border-[#25D366] hover:bg-[#25D366]/15 touch-manipulation"
      style={{ fontSize: "var(--text-small)" }}
    >
      <MessageCircle size={14} className="text-[#25D366]" />
      Hablar con {label}
    </a>
  );
}
