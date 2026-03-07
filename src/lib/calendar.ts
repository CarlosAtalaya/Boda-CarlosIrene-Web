import { EVENT_CONFIG } from "./event-config";

/**
 * Genera la URL de Google Calendar para añadir el evento de la boda.
 * Fecha: 26-06-2026
 */
export function getGoogleCalendarUrl(options?: {
  titulo?: string;
  descripcion?: string;
  lugar?: string;
  fecha?: string;
  fechaFin?: string;
  horaInicio?: string;
  horaFin?: string;
}): string {
  const titulo = options?.titulo ?? "Boda de Irene y Carlos";
  const descripcion =
    options?.descripcion ??
    "Irene y Carlos tienen el honor de invitaros a celebrar su unión.";
  const lugar = options?.lugar ?? EVENT_CONFIG.lugar;
  const fecha = options?.fecha ?? EVENT_CONFIG.fecha;
  const fechaFin = options?.fechaFin ?? EVENT_CONFIG.fechaFin;
  const horaInicio = options?.horaInicio ?? EVENT_CONFIG.horaInicio;
  const horaFin = options?.horaFin ?? EVENT_CONFIG.horaFin;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: titulo,
    dates: `${fecha}T${horaInicio}/${fechaFin}T${horaFin}`,
    details: descripcion,
    location: lugar,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
