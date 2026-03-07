/**
 * Formulario RSVP colectivo.
 * Permite confirmar asistencia y añadir acompañantes con alergias/restricciones.
 *
 * CHECKLIST DE VERIFICACIÓN (POC):
 * [ ] Añadir acompañantes: botón "Añadir acompañante" crea nuevos campos
 * [ ] Eliminar acompañantes: icono papelera en cada acompañante (no en principal)
 * [ ] Validación nombre vacío: no debe permitir enviar sin nombre completo
 * [ ] Google Maps: botón "Ver en Google Maps" abre URL con coordenadas
 * [ ] WhatsApp: botón flotante y footer abren wa.me con mensaje predefinido
 * [ ] Add to Calendar: tras confirmar RSVP, genera evento 26/06/2026
 */
import { useState, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
import { Plus, Trash2 } from "lucide-react";
import {
  rsvpFormSchema,
  toFirestorePayload,
  ALERGIAS_OPCIONES,
  type InvitadoForm,
  type RSVPFormData,
} from "../../lib/rsvp-schema";
import { getFirestoreDb } from "../../lib/firebase";
import AddToCalendarButton from "../AddToCalendarButton";

/** Modo simulación: true si Firebase no está configurado (.env vacío) */
function isMockMode(): boolean {
  const key = import.meta.env.PUBLIC_FIREBASE_API_KEY;
  return !key || typeof key !== "string" || key.trim() === "";
}

const INVITADO_INICIAL: InvitadoForm = {
  nombre: "",
  confirmado: false,
  dieta: { alergias: [], notas_medicas: "" },
  es_acompañante: false,
};

const CHECKLIST = [
  "Añadir acompañantes: botón 'Añadir acompañante' crea nuevos campos",
  "Eliminar acompañantes: icono papelera en cada acompañante (no en principal)",
  "Validación nombre vacío: no debe permitir enviar sin nombre completo",
  "Google Maps: botón 'Ver en Google Maps' abre URL con coordenadas",
  "WhatsApp: botón flotante y footer abren wa.me con mensaje predefinido",
  "Add to Calendar: tras confirmar RSVP, genera evento 26/06/2026",
];

export default function RSVPForm() {
  useEffect(() => {
    console.log("%c[Boda POC] Checklist de verificación:", "font-weight: bold; color: #C5A059");
    CHECKLIST.forEach((item, i) => console.log(`  [ ] ${i + 1}. ${item}`));
  }, []);

  const [invitados, setInvitados] = useState<InvitadoForm[]>([
    { ...INVITADO_INICIAL, es_acompañante: false },
  ]);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok" | "error">(
    "idle"
  );

  useEffect(() => {
    if (isMockMode()) {
      console.log(
        "%c[POC] Checklist de verificación:\n" +
          "  [ ] Añadir acompañantes dinámicamente\n" +
          "  [ ] Eliminar acompañantes (icono papelera)\n" +
          "  [ ] Validar: no enviar sin nombre\n" +
          "  [ ] Google Maps: abre URL con coordenadas\n" +
          "  [ ] WhatsApp: wa.me con mensaje predefinido\n" +
          "  [ ] Add to Calendar: evento 26/06/2026",
        "color: #C5A059; font-weight: bold;"
      );
    }
  }, []);

  const añadirAcompañante = () => {
    setInvitados((prev) => [
      ...prev,
      { ...INVITADO_INICIAL, es_acompañante: true },
    ]);
  };

  const eliminarInvitado = (idx: number) => {
    if (invitados.length <= 1) return;
    setInvitados((prev) => prev.filter((_, i) => i !== idx));
  };

  const actualizarInvitado = (
    idx: number,
    campo: keyof InvitadoForm,
    valor: string | boolean | { alergias: string[]; notas_medicas: string }
  ) => {
    setInvitados((prev) =>
      prev.map((inv, i) =>
        i === idx ? { ...inv, [campo]: valor } : inv
      )
    );
  };

  const toggleAlergia = (idx: number, alergiaId: string) => {
    setInvitados((prev) =>
      prev.map((inv, i) => {
        if (i !== idx) return inv;
        const actuales = inv.dieta.alergias;
        const nuevas = actuales.includes(alergiaId)
          ? actuales.filter((a) => a !== alergiaId)
          : [...actuales, alergiaId];
        return {
          ...inv,
          dieta: { ...inv.dieta, alergias: nuevas },
        };
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrores({});
    const data: RSVPFormData = { invitados };

    const result = rsvpFormSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const path = err.path.join(".");
        fieldErrors[path] = err.message;
      });
      setErrores(fieldErrors);
      return;
    }

    setEstado("enviando");
    const payload = toFirestorePayload(result.data);

    if (isMockMode()) {
      // POC: sin .env configurado → simular éxito y loguear datos
      console.log("[RSVP Mock] Datos capturados:", JSON.stringify(payload, null, 2));
      setEstado("ok");
      return;
    }

    try {
      const db = getFirestoreDb();
      await addDoc(collection(db, "respuestas_boda"), payload);
      setEstado("ok");
    } catch (err) {
      console.error(err);
      setEstado("error");
      setErrores({ submit: "No se pudo guardar. Inténtelo de nuevo." });
    }
  };

  if (estado === "ok") {
    return (
      <div className="space-y-6 rounded-xl border border-[#C5A059]/30 bg-[#F9F7F2] p-8 text-center">
        <p className="font-serif text-xl text-[#1A1A1A]">
          Gracias por confirmar. Hemos recibido su respuesta.
        </p>
        <p className="font-sans text-sm text-[#1A1A1A]/70">
          Nos vemos el 26 de junio de 2026.
        </p>
        <AddToCalendarButton className="mt-4" />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-10 rounded-xl border border-[#C5A059]/20 bg-white/50 p-6 shadow-sm sm:p-8"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-serif text-2xl text-[#1A1A1A] sm:text-3xl">
          Confirmación de asistencia
        </h2>
        {isMockMode() && (
          <span className="rounded bg-[#C5A059]/20 px-2 py-1 font-sans text-xs text-[#1A1A1A]/70">
            Modo simulación (sin Firebase)
          </span>
        )}
      </div>

      {invitados.map((inv, idx) => (
        <fieldset
          key={idx}
          className="space-y-4 rounded-lg border border-[#C5A059]/15 p-4 sm:p-6"
        >
          <div className="flex items-center justify-between">
            <legend className="font-serif text-lg text-[#1A1A1A]">
              {inv.es_acompañante ? `Acompañante ${idx}` : "Invitado principal"}
            </legend>
            {invitados.length > 1 && (
              <button
                type="button"
                onClick={() => eliminarInvitado(idx)}
                className="rounded p-1 text-[#1A1A1A]/60 transition hover:bg-[#C5A059]/10 hover:text-[#1A1A1A]"
                aria-label="Eliminar invitado"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          <div>
            <label
              htmlFor={`nombre-${idx}`}
              className="mb-1 block font-sans text-sm font-medium text-[#1A1A1A]"
            >
              Nombre completo
            </label>
            <input
              id={`nombre-${idx}`}
              type="text"
              value={inv.nombre}
              onChange={(e) => actualizarInvitado(idx, "nombre", e.target.value)}
              className="w-full rounded-lg border border-[#C5A059]/30 bg-[#F9F7F2] px-3 py-2 font-sans text-[#1A1A1A] placeholder:text-[#1A1A1A]/40 focus:border-[#C5A059] focus:outline-none focus:ring-1 focus:ring-[#C5A059]/50"
              placeholder="Nombre y apellidos"
            />
            {errores[`invitados.${idx}.nombre`] && (
              <p className="mt-1 text-sm text-red-600">
                {errores[`invitados.${idx}.nombre`]}
              </p>
            )}
          </div>

          <div>
            <span className="mb-2 block font-sans text-sm font-medium text-[#1A1A1A]">
              ¿Asistirá?
            </span>
            <div className="flex gap-6">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name={`confirmado-${idx}`}
                  checked={inv.confirmado === true}
                  onChange={() => actualizarInvitado(idx, "confirmado", true)}
                  className="h-4 w-4 border-[#C5A059] text-[#C5A059] focus:ring-[#C5A059]"
                />
                <span className="font-sans text-[#1A1A1A]">Sí</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name={`confirmado-${idx}`}
                  checked={inv.confirmado === false}
                  onChange={() => actualizarInvitado(idx, "confirmado", false)}
                  className="h-4 w-4 border-[#C5A059] text-[#C5A059] focus:ring-[#C5A059]"
                />
                <span className="font-sans text-[#1A1A1A]">No</span>
              </label>
            </div>
          </div>

          <div>
            <span className="mb-2 block font-sans text-sm font-medium text-[#1A1A1A]">
              Alergias y restricciones
            </span>
            <div className="space-y-2">
              {ALERGIAS_OPCIONES.map((opt) => (
                <label
                  key={opt.id}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <input
                    type="checkbox"
                    checked={inv.dieta.alergias.includes(opt.id)}
                    onChange={() => toggleAlergia(idx, opt.id)}
                    className="h-4 w-4 rounded border-[#C5A059]/50 text-[#C5A059] focus:ring-[#C5A059]"
                  />
                  <span className="font-sans text-sm text-[#1A1A1A]">
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-3">
              <input
                type="text"
                value={inv.dieta.notas_medicas}
                onChange={(e) =>
                  actualizarInvitado(idx, "dieta", {
                    ...inv.dieta,
                    notas_medicas: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-[#C5A059]/30 bg-[#F9F7F2] px-3 py-2 font-sans text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/40 focus:border-[#C5A059] focus:outline-none focus:ring-1 focus:ring-[#C5A059]/50"
                placeholder="Otras alergias o enfermedades alimentarias"
              />
            </div>
          </div>
        </fieldset>
      ))}

      <button
        type="button"
        onClick={añadirAcompañante}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#C5A059]/40 py-3 font-sans text-sm text-[#C5A059] transition hover:border-[#C5A059] hover:bg-[#C5A059]/5"
      >
        <Plus className="h-4 w-4" />
        Añadir acompañante
      </button>

      {errores.submit && (
        <p className="text-center text-sm text-red-600">{errores.submit}</p>
      )}

      <button
        type="submit"
        disabled={estado === "enviando"}
        className="w-full rounded-lg bg-[#1A1A1A] py-3 font-serif text-lg text-[#F9F7F2] transition hover:bg-[#1A1A1A]/90 disabled:opacity-60"
      >
        {estado === "enviando" ? "Enviando…" : "Enviar confirmación"}
      </button>
    </form>
  );
}
