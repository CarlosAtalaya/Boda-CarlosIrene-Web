/**
 * Configuración central del evento — ÚNICO lugar donde editar datos del evento.
 * Modifica estos valores para actualizar toda la web automáticamente.
 */
export const EVENT_CONFIG = {
  // ── Protagonistas ──────────────────────────────────────────────────
  novios: {
    ella: "Paloma",
    el: "Jose",
    titulo: "Paloma & Jose",
    subtitulo: "Tienen la ilusión de invitaros a celebrar su boda",
  },

  // ── Fecha y hora ───────────────────────────────────────────────────
  fecha: "20270918",
  fechaFin: "20270919",
  horaInicio: "183000",
  horaFin: "050000",
  /** Fecha en formato legible para mostrar en la UI */
  fechaLegible: "18 de septiembre de 2027",
  /** Fecha en formato corto para el hero */
  fechaCorta: "18 · 09 · 27",

  // ── Lugar ──────────────────────────────────────────────────────────
  lugar: "Quinta Monteguerra",
  lugarDireccion: "Ctra. Herencia CR-1341, km 12,6 · Alcázar de San Juan, Ciudad Real",
  coordenadas: "39.23625786133547, -3.3133013197136947",
  /** Web oficial del restaurante/venue */
  lugarWeb: "http://www.quintamonteguerra.com/",

  // ── Programa del día ──────────────────────────────────────────────
  programa: [
    { hora: "18:30", descripcion: "Llegada y bienvenida entre encinas" },
    { hora: "19:00", descripcion: "Ceremonia civil en los jardines" },
    { hora: "20:00", descripcion: "Cóctel de bienvenida en el Patio Encina" },
    { hora: "21:30", descripcion: "Cena de celebración en el salón" },
    { hora: "00:00", descripcion: "Baile nupcial y fiesta bajo las estrellas" },
  ],

  // ── Contacto ───────────────────────────────────────────────────────
  contacto: {
    paloma: { numero: "34600000000", mensaje: "Hola Paloma, tengo una consulta sobre la boda." },
    jose: { numero: "34600000000", mensaje: "Hola Jose, tengo una consulta sobre la boda." },
  },

  // ── Puerta de acceso (código de invitación) ────────────────────────
  accessGate: {
    titulo: "Invitación personal",
    mensaje:
      "Introduce la clave escrita en tu sobre de invitación para abrir el cuaderno de nuestra boda.",
    placeholder: "Clave de la invitación",
    boton: "Abrir invitación",
    errorMensaje: "La clave no coincide. Por favor, revísala e inténtalo de nuevo.",
  },

  // ── Regalos / número de cuenta ────────────────────────────────────
  // Prioridad: PUBLIC_IBAN (variable de entorno) > valor hardcodeado aquí.
  regalos: {
    /** IBAN: se lee de PUBLIC_IBAN en .env si existe, sino usa este valor de fallback */
    iban: import.meta.env.PUBLIC_IBAN || "ES00 0000 0000 0000 0000 0000",
    /** Nombre del titular de la cuenta */
    titular: "Paloma y Jose",
    /** Nombre del banco (dejar vacío "" para ocultar) */
    banco: "",
    /** Texto que describe el destino del regalo */
    destino: "nuestro próximo gran viaje juntos y nuestro hogar",
  },

  // ── Textos UI ──────────────────────────────────────────────────────
  textos: {
    rsvpTitulo: "Confirmación de Asistencia",
    rsvpSubtitulo:
      "Por favor, confírmanos si podrás acompañarnos antes del 18 de agosto de 2027.",
    rsvpFechaLimite: "18 de agosto de 2027",
    ubicacionTitulo: "Dónde & Cuándo",
    ubicacionTexto:
      "Un caserío manchego restaurado con mimo y rodeado de 250 hectáreas de encinas centenarias, donde la arquitectura rústica de cal y azul cobalto se funde con la serenidad del campo.",
    footerTexto: "Con todo nuestro cariño, Paloma y Jose",
    footerCopyright: "18 · 09 · 2027 · Quinta Monteguerra",
  },
} satisfies Record<string, unknown>;
