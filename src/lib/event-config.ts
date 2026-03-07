/**
 * Configuración central del evento.
 * Modifica estos valores según el lugar y datos reales de la boda.
 */
export const EVENT_CONFIG = {
  /** Coordenadas para Google Maps (lat,lng) */
  coordenadas: "39.863237277761776, -4.00678011642759",
  /** Nombre del lugar de la celebración */
  lugar: "Laberinto del Rey, Toledo",
  /** Número de WhatsApp sin + (ej: 34600000000) */
  whatsappNumero: "34673153863",
  /** Mensaje predefinido para wa.me */
  whatsappMensaje:
    "Hola, tengo una consulta sobre la boda de Irene y Carlos.",
  /** Fecha en formato YYYYMMDD para Google Calendar */
  fecha: "20260626",
  /** Hora inicio (HHMMSS): 19:00 */
  horaInicio: "190000",
  /** Hora fin (HHMMSS): 4:00 AM del día siguiente */
  horaFin: "040000",
  /** Fecha fin cuando el evento termina al día siguiente */
  fechaFin: "20260627",
} as const;
