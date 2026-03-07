import { EVENT_CONFIG } from "./event-config";

export function getGoogleCalendarUrl(): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Boda de ${EVENT_CONFIG.novios.ella} y ${EVENT_CONFIG.novios.el}`,
    dates: `${EVENT_CONFIG.fecha}T${EVENT_CONFIG.horaInicio}/${EVENT_CONFIG.fechaFin}T${EVENT_CONFIG.horaFin}`,
    details: `${EVENT_CONFIG.novios.ella} y ${EVENT_CONFIG.novios.el} tienen el honor de invitaros a celebrar su unión.`,
    location: `${EVENT_CONFIG.lugar}, ${EVENT_CONFIG.lugarDireccion}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
