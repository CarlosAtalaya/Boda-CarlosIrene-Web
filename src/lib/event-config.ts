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
  horaFin: "050000",
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
    { hora: "19:00", descripcion: "Ceremonia civil" },
    { hora: "20:00", descripcion: "Cóctel de bienvenida" },
    { hora: "21:30", descripcion: "Cena de celebración" },
    { hora: "00:00", descripcion: "Fiesta con barra libre" },
  ],

  // ── Hoteles recomendados (para invitados de fuera) ───────────────────
  hoteles: [
    {
      nombre: "Hotel Princesa Galiana",
      enlace: "http://hotelprincesagaliana.com/",
      descripcion: "El más cercano al lugar de la celebración",
      direccion: "P.º de la Rosa, 58, 45006 Toledo",
      telefono: "925 257 200",
      coordenadas: "39.86213069950938, -4.012770656862215",
    },
    {
      nombre: "Hotel Medina",
      enlace: "https://www.hotelmedina.com/?utm_source=google&utm_medium=business&utm_campaign=maps",
      descripcion: "En el casco histórico",
      direccion: "Bajada Desamparados, 2, 45003 Toledo",
      telefono: "925 699 999",
      coordenadas: "39.86170031159682, -4.021746230857924",
    },
    {
      nombre: "Hotel Zentral Mayoral",
      enlace: "http://www.hotelzentraltoledo.com/",
      descripcion: "Frente a la estación de autobuses, a 250 m del casco antiguo",
      direccion: "Av. Castilla-La Mancha, 3, 45003 Toledo",
      telefono: "925 216 000",
      coordenadas: "39.865045180943525, -4.020575877388362",
    },
  ],

  // ── Contacto ───────────────────────────────────────────────────────
  contacto: {
    carlos: { numero: "34673153863", mensaje: "Hola Carlos, tengo una consulta sobre la boda." },
    irene: { numero: "34658640737", mensaje: "Hola Irene, tengo una consulta sobre la boda." },
  },
  /** @deprecated Usar contacto.carlos */
  whatsappNumero: "34673153863",
  whatsappMensaje: "Hola, tengo una consulta sobre la boda de Irene y Carlos.",

  // ── Puerta de acceso (código de invitación) ────────────────────────
  accessGate: {
    titulo: "Acceso a la invitación",
    mensaje:
      "Introduce el código de acceso que figura en tu invitación para acceder a la web.",
    placeholder: "Código de acceso",
    boton: "Entrar",
    errorMensaje: "Código incorrecto. Por favor, inténtalo de nuevo.",
  },

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
