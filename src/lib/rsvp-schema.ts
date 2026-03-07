/**
 * Esquema Zod para validación del formulario RSVP colectivo.
 */
import { z } from "zod";

/** Opciones de alergias/restricciones dietéticas */
export const ALERGIAS_OPCIONES = [
  { id: "celiaco", label: "Celíaco" },
  { id: "lactosa", label: "Intolerante a la Lactosa" },
  { id: "vegano", label: "Vegano/Vegetariano" },
  { id: "embarazada", label: "Embarazada (protocolo específico)" },
] as const;

export type AlergiaId = (typeof ALERGIAS_OPCIONES)[number]["id"];

const dietaSchema = z.object({
  alergias: z.array(z.string()),
  notas_medicas: z.string(),
});

const invitadoSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").trim(),
  confirmado: z.boolean(),
  dieta: dietaSchema,
  es_acompañante: z.boolean(),
});

export const rsvpFormSchema = z.object({
  invitados: z
    .array(invitadoSchema)
    .min(1, "Debe haber al menos un invitado")
    .refine(
      (inv) => inv.every((i) => i.nombre.trim().length > 0),
      "Todos los invitados deben tener nombre"
    )
    .refine(
      (inv) => inv.some((i) => i.confirmado === true || i.confirmado === false),
      "Debe indicarse la asistencia de al menos un invitado"
    ),
});

export type InvitadoForm = z.infer<typeof invitadoSchema>;
export type RSVPFormData = z.infer<typeof rsvpFormSchema>;

/** Convierte los datos del formulario al formato Firestore */
export function toFirestorePayload(data: RSVPFormData) {
  return {
    invitados: data.invitados.map((i) => ({
      nombre: i.nombre.trim(),
      confirmado: i.confirmado,
      dieta: {
        alergias: i.dieta.alergias,
        notas_medicas: i.dieta.notas_medicas.trim(),
      },
      es_acompañante: i.es_acompañante,
    })),
    createdAt: new Date().toISOString(),
  };
}
