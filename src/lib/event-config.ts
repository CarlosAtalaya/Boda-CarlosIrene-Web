/**
 * Configuración central del evento — ÚNICO lugar donde editar datos del evento.
 * Modifica estos valores para actualizar toda la web automáticamente.
 */
export const EVENT_CONFIG = {
  // ── Protagonistas ──────────────────────────────────────────────────
  novios: {
    ella: "Irene",
    el: "Carlos",
    titulo: "Irene & Carlos",
    subtitulo: "Tienen el honor de invitaros a celebrar su unión",
  },

  // ── Fecha y hora ───────────────────────────────────────────────────
  fecha: "20260626",
  fechaFin: "20260627",
  horaInicio: "190000",
  horaFin: "040000",
  /** Fecha en formato legible para mostrar en la UI */
  fechaLegible: "26 de junio de 2026",
  /** Fecha en formato corto para el hero */
  fechaCorta: "26 · 06 · 26",

  // ── Lugar ──────────────────────────────────────────────────────────
  lugar: "Laberinto del Rey",
  lugarDireccion: "Toledo, España",
  coordenadas: "39.863237277761776, -4.00678011642759",
  /** Web oficial del restaurante/venue */
  lugarWeb: "https://www.laberintodelrey.com/",

  // ── Programa del día ──────────────────────────────────────────────
  programa: [
    { hora: "18:30", descripcion: "Llegada y bienvenida de los invitados" },
    { hora: "19:00", descripcion: "Ceremonia civil" },
    { hora: "20:30", descripcion: "Cóctel de bienvenida" },
    { hora: "22:00", descripcion: "Cena de celebración" },
    { hora: "00:00", descripcion: "Baile nupcial y fiesta" },
  ],

  // ── Hoteles recomendados (para invitados de fuera) ───────────────────
  hoteles: [
    { nombre: "Hotel Cigarral El Bosque", enlace: "https://www.cigarralebosque.com/", descripcion: "A 5 min del centro, vistas al Tajo" },
    { nombre: "Parador de Toledo", enlace: "https://www.parador.es/es/paradores/parador-de-toledo", descripcion: "Emblemático, vistas panorámicas" },
    { nombre: "Eugenia de Montijo", enlace: "https://www.eugeniademontijo.com/", descripcion: "Centro histórico, estilo boutique" },
  ],

  // ── Contacto ───────────────────────────────────────────────────────
  contacto: {
    carlos: { numero: "34673153863", mensaje: "Hola, tengo una consulta sobre la boda de Irene y Carlos." },
    irene: { numero: "34658640737", mensaje: "Hola Irene, tengo una consulta sobre la boda." },
  },
  /** @deprecated Usar contacto.carlos */
  whatsappNumero: "34673153863",
  whatsappMensaje: "Hola, tengo una consulta sobre la boda de Irene y Carlos.",

  // ── Textos UI ──────────────────────────────────────────────────────
  textos: {
    rsvpTitulo: "Confirmación de Asistencia",
    rsvpSubtitulo:
      "Por favor, confirma tu asistencia antes del 1 de mayo de 2026.",
    rsvpFechaLimite: "1 de mayo de 2026",
    ubicacionTitulo: "El lugar",
    ubicacionTexto:
      "Una finca excepcional en el corazón de Toledo, rodeada de naturaleza y arquitectura histórica.",
    footerTexto: "Con amor, Irene y Carlos",
    footerCopyright: "26.06.26",
  },
} as const;
