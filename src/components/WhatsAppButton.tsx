/**
 * WhatsAppButton — Botón artesanal en acuarela Verde Olivo (#58693B / #8A9A5B)
 * para hablar directamente con Paloma o Jose en el cierre de la invitación.
 */
import { MessageCircle } from "lucide-react";
import { EVENT_CONFIG } from "../lib/event-config";

export type ContactoPersona = keyof typeof EVENT_CONFIG.contacto;

interface WhatsAppButtonProps {
  flotante?: boolean;
  contacto?: ContactoPersona;
  bottomOffset?: number;
}

export default function WhatsAppButton({
  flotante = false,
  contacto = "paloma",
  bottomOffset = 0,
}: WhatsAppButtonProps) {
  const entry = EVENT_CONFIG.contacto[contacto];
  const { numero, mensaje } = entry;
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
  const label = contacto === "paloma" ? EVENT_CONFIG.novios.ella : EVENT_CONFIG.novios.el;

  if (flotante) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed right-6 z-50 flex h-14 w-14 min-w-[56px] min-h-[56px] items-center justify-center watercolor-mask bg-[#58693B] text-[#F4F6F8] transition-transform duration-300 hover:scale-105 touch-manipulation"
        style={{ bottom: `calc(24px + ${bottomOffset}px + env(safe-area-inset-bottom, 0px))` }}
        aria-label={`Escribir a ${label} por WhatsApp`}
      >
        <MessageCircle size={24} strokeWidth={1.5} />
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-watercolor-ghost min-h-[46px] px-7 py-3 font-serif text-xs uppercase tracking-[0.18em] text-[#2B2B29] inline-flex items-center justify-center gap-2.5 touch-manipulation"
    >
      <MessageCircle size={15} className="text-[#58693B]" strokeWidth={1.6} />
      <span>Hablar con {label}</span>
    </a>
  );
}
