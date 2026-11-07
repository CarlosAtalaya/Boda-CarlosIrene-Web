/**
 * RSVPForm — Cuaderno de confirmación de asistencia en 3 pasos sobre papel de algodón.
 * Conserva intacta toda la validación Zod, estructura de payload de Firestore y modo simulación local.
 */
import { useState, useCallback } from "react";
import { collection, addDoc } from "firebase/firestore";
import { Plus, Trash2, ChevronRight, ChevronLeft, Check, AlertCircle, X } from "lucide-react";
import {
  rsvpFormSchema,
  toFirestorePayload,
  ALERGIAS_OPCIONES,
  type InvitadoForm,
} from "../../lib/rsvp-schema";
import { getFirestoreDb } from "../../lib/firebase";
import AddToCalendarButton from "../AddToCalendarButton";
import WatercolorCard from "../ui/WatercolorCard";
import { EVENT_CONFIG } from "../../lib/event-config";

// ── Helpers ─────────────────────────────────────────────────────────

function isMockMode(): boolean {
  const key = import.meta.env.PUBLIC_FIREBASE_API_KEY;
  return !key || typeof key !== "string" || key.trim() === "";
}

const INVITADO_VACIO: InvitadoForm = {
  nombre: "",
  confirmado: true,
  dieta: { alergias: [], notas_medicas: "" },
  es_acompañante: false,
};

// ── Toast ────────────────────────────────────────────────────────────

type ToastType = "error" | "success" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

function Toast({ message, type, onClose }: ToastProps) {
  const colors: Record<ToastType, string> = {
    error: "border-[#B88655] bg-[#F4F6F8] text-[#2B2B29]",
    success: "border-[#58693B] bg-[#F4F6F8] text-[#2B2B29]",
    info: "border-[#3B539A] bg-[#F4F6F8] text-[#2B2B29]",
  };
  const Icon = type === "error" ? AlertCircle : Check;

  return (
    <div
      className={`toast-enter fixed left-1/2 z-[100] -translate-x-1/2 flex items-center gap-3 watercolor-card-shape border px-5 py-3.5 ${colors[type]}`}
      style={{ bottom: "calc(7rem + env(safe-area-inset-bottom, 0px))" }}
      role="alert"
    >
      <Icon size={16} className="flex-shrink-0 text-[#3B539A]" />
      <p className="font-serif text-base leading-snug max-w-[260px]">
        {message}
      </p>
      <button
        onClick={onClose}
        className="ml-2 flex-shrink-0 p-2 -m-2 opacity-60 hover:opacity-100 transition-opacity touch-manipulation"
        aria-label="Cerrar notificación"
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ── Step Indicator ───────────────────────────────────────────────────

interface StepIndicatorProps {
  current: number;
  total: number;
  labels: string[];
}

function StepIndicator({ current, total, labels }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8 sm:mb-10 overflow-x-auto pb-2 -mx-2 px-2">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center flex-shrink-0">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`step-dot w-8 h-8 flex items-center justify-center text-sm font-serif transition-all min-w-[2rem] min-h-[2rem] ${
                i < current
                  ? "completed"
                  : i === current
                  ? "active"
                  : "bg-[#B8CDE3]/35 text-[#2B2B29]/60 border border-[#2B2B29]/20"
              }`}
            >
              {i < current ? <Check size={13} /> : i + 1}
            </div>
            <span
              className={`font-serif text-xs tracking-wider uppercase transition-colors hidden sm:block ${
                i === current ? "text-[#3B539A] font-medium" : "text-[#2B2B29]/50"
              }`}
            >
              {labels[i]}
            </span>
          </div>
          {i < total - 1 && (
            <svg
              viewBox="0 0 60 6"
              className="w-10 sm:w-16 h-2 mx-1.5 mb-4 overflow-visible"
              aria-hidden="true"
            >
              <path
                d="M 2 3 C 20 1, 40 5, 58 3"
                fill="none"
                stroke={i < current ? "#58693B" : "#2B2B29"}
                strokeOpacity={i < current ? "0.7" : "0.22"}
                strokeWidth="1.4"
                strokeDasharray="4 4"
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Step 1: Confirmación ─────────────────────────────────────────────

interface Step1Props {
  principal: InvitadoForm;
  onChange: (field: keyof InvitadoForm, value: string | boolean) => void;
  error?: string;
}

function Step1({ principal, onChange, error }: Step1Props) {
  return (
    <div className="step-panel space-y-8">
      <div className="text-center space-y-1">
        <h3
          className="font-serif text-[#2B2B29]"
          style={{ fontSize: "var(--text-heading-md)" }}
        >
          ¿Asistirás a la celebración?
        </h3>
        <p
          className="font-serif italic text-[#2B2B29]/70"
          style={{ fontSize: "var(--text-body)" }}
        >
          Escribe tu nombre y apellidos sobre la línea de tinta y confirma tu asistencia.
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="nombre-principal"
          className="block font-hand text-2xl text-[#3B539A]"
        >
          Nombre y apellidos
        </label>
        <input
          id="nombre-principal"
          type="text"
          value={principal.nombre}
          onChange={(e) => onChange("nombre", e.target.value)}
          className="input-ink-line w-full px-2 py-3 font-serif text-[#2B2B29] placeholder:text-[#2B2B29]/35"
          style={{ fontSize: "var(--text-body-lg)" }}
          placeholder="Ej. María Gómez Pérez"
          autoComplete="name"
        />
        {error && (
          <p className="text-sm text-[#B88655] font-serif italic flex items-center gap-1.5 pt-1">
            <AlertCircle size={13} /> {error}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <p className="font-hand text-2xl text-[#3B539A]">
          Respuesta
        </p>
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: true, label: "Sí, os acompañaré", icon: "✓" },
            { value: false, label: "No podré asistir", icon: "×" },
          ].map(({ value, label, icon }) => {
            const selected = principal.confirmado === value;
            return (
              <button
                key={String(value)}
                type="button"
                onClick={() => onChange("confirmado", value)}
                className={`relative watercolor-card-shape border px-4 py-4 font-serif text-base transition-all ${
                  selected
                    ? value
                      ? "border-[#3B539A] bg-[#B8CDE3]/40 text-[#2B2B29]"
                      : "border-[#B88655] bg-[#DFB98C]/35 text-[#2B2B29]"
                    : "border-[#2B2B29]/20 bg-transparent text-[#2B2B29]/60 hover:border-[#3B539A]/50"
                }`}
              >
                <span
                  className={`block text-2xl mb-1 font-hand ${
                    value ? "text-[#3B539A]" : "text-[#B88655]"
                  }`}
                >
                  {icon}
                </span>
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Step 2: Acompañantes ─────────────────────────────────────────────

interface Step2Props {
  acompañantes: InvitadoForm[];
  onAdd: () => void;
  onRemove: (i: number) => void;
  onChange: (i: number, field: keyof InvitadoForm, value: string | boolean) => void;
  errors: Record<string, string>;
}

function Step2({ acompañantes, onAdd, onRemove, onChange, errors }: Step2Props) {
  return (
    <div className="step-panel space-y-6">
      <div className="text-center space-y-1">
        <h3
          className="font-serif text-[#2B2B29]"
          style={{ fontSize: "var(--text-heading-md)" }}
        >
          ¿Vendrás acompañado?
        </h3>
        <p
          className="font-serif italic text-[#2B2B29]/70"
          style={{ fontSize: "var(--text-body)" }}
        >
          Si vienes con pareja, familia o niños, anota aquí sus nombres.
        </p>
      </div>

      <div className="space-y-3 sm:max-h-64 sm:overflow-y-auto sm:pr-1">
        {acompañantes.map((ac, i) => (
          <div
            key={i}
            className="guest-card flex items-center gap-3 watercolor-card-shape border border-[#2B2B29]/20 bg-[#B8CDE3]/15 px-4 py-2.5"
          >
            <div className="flex-shrink-0 w-7 h-7 watercolor-mask bg-[#3B539A]/15 flex items-center justify-center">
              <span className="font-hand text-lg text-[#3B539A]">{i + 1}</span>
            </div>
            <input
              type="text"
              value={ac.nombre}
              onChange={(e) => onChange(i, "nombre", e.target.value)}
              className="input-ink-line flex-1 py-1.5 font-serif text-[#2B2B29] placeholder:text-[#2B2B29]/40"
              style={{ fontSize: "var(--text-body)" }}
              placeholder={`Nombre del acompañante ${i + 1}`}
            />
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="flex-shrink-0 p-2 text-[#2B2B29]/45 hover:text-[#B88655] transition-colors"
              aria-label="Eliminar acompañante"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      {errors["acompañantes"] && (
        <p className="text-sm text-[#B88655] font-serif italic flex items-center gap-1.5">
          <AlertCircle size={13} /> {errors["acompañantes"]}
        </p>
      )}

      <button
        type="button"
        onClick={onAdd}
        className="flex w-full items-center justify-center gap-2 watercolor-card-shape border border-dashed border-[#3B539A]/45 py-3.5 font-serif text-[#3B539A] transition-colors hover:border-[#3B539A] hover:bg-[#B8CDE3]/20"
        style={{ fontSize: "var(--text-body)" }}
      >
        <Plus size={15} />
        Añadir acompañante
      </button>
    </div>
  );
}

// ── Step 3: Alergias ────────────────────────────────────────────────

interface Step3Props {
  todos: InvitadoForm[];
  onToggleAlergia: (personaIdx: number, alergiaId: string) => void;
  onChangeNotas: (personaIdx: number, notas: string) => void;
}

function Step3({ todos, onToggleAlergia, onChangeNotas }: Step3Props) {
  const [expandido, setExpandido] = useState<number>(0);

  return (
    <div className="step-panel space-y-5">
      <div className="text-center space-y-1">
        <h3
          className="font-serif text-[#2B2B29]"
          style={{ fontSize: "var(--text-heading-md)" }}
        >
          Alergias y menú
        </h3>
        <p
          className="font-serif italic text-[#2B2B29]/70"
          style={{ fontSize: "var(--text-body)" }}
        >
          Indícanos cualquier intolerancia o preferencia alimentaria para cuidar cada detalle en cocina.
        </p>
      </div>

      <div className="space-y-3 sm:max-h-80 sm:overflow-y-auto sm:pr-1">
        {todos.map((persona, i) => (
          <div
            key={i}
            className="watercolor-card-shape border border-[#2B2B29]/25 overflow-hidden bg-[#F4F6F8]/70"
          >
            <button
              type="button"
              onClick={() => setExpandido(expandido === i ? -1 : i)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#B8CDE3]/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 watercolor-mask bg-[#8A9A5B]/30 flex items-center justify-center flex-shrink-0">
                  <span className="font-hand text-lg text-[#58693B]">
                    {persona.nombre ? persona.nombre.charAt(0).toUpperCase() : "?"}
                  </span>
                </div>
                <span
                  className="font-serif text-[#2B2B29] text-left truncate min-w-0 max-w-[160px] sm:max-w-[220px]"
                  style={{ fontSize: "var(--text-body)" }}
                >
                  {persona.nombre || `Invitado ${i + 1}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {persona.dieta.alergias.length > 0 && (
                  <span className="watercolor-mask bg-[#3B539A]/15 px-2.5 py-0.5 font-serif text-xs text-[#3B539A]">
                    {persona.dieta.alergias.length}
                  </span>
                )}
                <ChevronRight
                  size={15}
                  className={`text-[#2B2B29]/50 transition-transform duration-300 ${
                    expandido === i ? "rotate-90" : ""
                  }`}
                />
              </div>
            </button>

            {expandido === i && (
              <div className="step-panel px-4 pb-4 pt-2 space-y-4 border-t border-dashed border-[#2B2B29]/15">
                <div className="grid grid-cols-2 gap-2">
                  {ALERGIAS_OPCIONES.map((opt) => {
                    const checked = persona.dieta.alergias.includes(opt.id);
                    return (
                      <label
                        key={opt.id}
                        className={`flex cursor-pointer items-center gap-2 watercolor-card-shape border p-2.5 transition-colors ${
                          checked
                            ? "border-[#3B539A] bg-[#B8CDE3]/35"
                            : "border-[#2B2B29]/15 bg-transparent hover:border-[#3B539A]/40"
                        }`}
                      >
                        <div
                          className={`flex-shrink-0 w-4 h-4 watercolor-mask border flex items-center justify-center ${
                            checked
                              ? "bg-[#3B539A] border-[#3B539A]"
                              : "border-[#2B2B29]/35"
                          }`}
                        >
                          {checked && <Check size={10} className="text-[#F4F6F8]" />}
                        </div>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={checked}
                          onChange={() => onToggleAlergia(i, opt.id)}
                        />
                        <span className="font-serif text-xs sm:text-sm text-[#2B2B29] leading-tight">
                          {opt.label}
                        </span>
                      </label>
                    );
                  })}
                </div>

                <input
                  type="text"
                  value={persona.dieta.notas_medicas}
                  onChange={(e) => onChangeNotas(i, e.target.value)}
                  className="input-ink-line w-full px-2 py-2 font-serif text-sm text-[#2B2B29] placeholder:text-[#2B2B29]/45"
                  placeholder="Otras alergias o notas alimentarias…"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Success Screen ───────────────────────────────────────────────────

function SuccessScreen() {
  return (
    <WatercolorCard wash="sky" className="step-panel text-center py-10 space-y-6">
      <div className="mx-auto w-16 h-16 watercolor-mask bg-[#8A9A5B]/35 border border-[#58693B] flex items-center justify-center boil-line">
        <Check size={28} className="text-[#58693B]" strokeWidth={1.6} />
      </div>

      <div className="space-y-2">
        <p className="font-hand text-3xl text-[#3B539A]">
          ¡Qué alegría contar contigo!
        </p>
        <h3
          className="font-serif text-[#2B2B29]"
          style={{ fontSize: "var(--text-heading-md)" }}
        >
          Respuesta anotada en nuestro cuaderno
        </h3>
        <p
          className="font-serif italic text-[#2B2B29]/75 max-w-xs mx-auto"
          style={{ fontSize: "var(--text-body)" }}
        >
          Nos vemos el{" "}
          <span className="text-[#3B539A] font-medium not-italic">{EVENT_CONFIG.fechaLegible}</span>{" "}
          en {EVENT_CONFIG.lugar}.
        </p>
      </div>

      <div className="divider-ink w-32 mx-auto" />

      <div className="space-y-3 pt-2">
        <p className="font-hand text-2xl text-[#58693B]">
          Reserva la fecha en tu agenda
        </p>
        <AddToCalendarButton />
      </div>
    </WatercolorCard>
  );
}

// ── Main Component ───────────────────────────────────────────────────

export default function RSVPForm() {
  const [step, setStep] = useState(0);
  const [principal, setPrincipal] = useState<InvitadoForm>({
    ...INVITADO_VACIO,
    es_acompañante: false,
  });
  const [acompañantes, setAcompañantes] = useState<InvitadoForm[]>([]);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok">("idle");
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = useCallback((message: string, type: ToastType = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const todosInvitados = [principal, ...acompañantes];

  const handleNextStep1 = () => {
    if (!principal.nombre.trim()) {
      setErrores({ nombre: "Por favor, escribe tu nombre completo." });
      return;
    }
    setErrores({});
    setStep(1);
  };

  const handleNextStep2 = () => {
    const invalid = acompañantes.some((a) => !a.nombre.trim());
    if (invalid) {
      setErrores({ acompañantes: "Por favor, completa el nombre de todos los acompañantes." });
      return;
    }
    setErrores({});
    setStep(2);
  };

  const handleSubmit = async () => {
    const data = { invitados: todosInvitados };
    const result = rsvpFormSchema.safeParse(data);

    if (!result.success) {
      showToast("Por favor, revisa los campos obligatorios.");
      return;
    }

    setEstado("enviando");
    const payload = toFirestorePayload(result.data);

    if (isMockMode()) {
      console.log("[RSVP Simulación Local] Respuesta registrada:", JSON.stringify(payload, null, 2));
      setTimeout(() => setEstado("ok"), 650);
      return;
    }

    try {
      const db = getFirestoreDb();
      await addDoc(collection(db, "respuestas_boda"), payload);
      setEstado("ok");
    } catch (err) {
      console.error(err);
      setEstado("idle");
      showToast("No se pudo guardar la respuesta. Inténtalo de nuevo.", "error");
    }
  };

  const addAcompañante = () => {
    setAcompañantes((prev) => [...prev, { ...INVITADO_VACIO, es_acompañante: true }]);
  };

  const removeAcompañante = (i: number) => {
    setAcompañantes((prev) => prev.filter((_, idx) => idx !== i));
  };

  const updateAcompañante = (i: number, field: keyof InvitadoForm, value: string | boolean) => {
    setAcompañantes((prev) =>
      prev.map((a, idx) => (idx === i ? { ...a, [field]: value } : a))
    );
  };

  const toggleAlergia = (personaIdx: number, alergiaId: string) => {
    if (personaIdx === 0) {
      const actuales = principal.dieta.alergias;
      const nuevas = actuales.includes(alergiaId)
        ? actuales.filter((a) => a !== alergiaId)
        : [...actuales, alergiaId];
      setPrincipal((p) => ({ ...p, dieta: { ...p.dieta, alergias: nuevas } }));
    } else {
      const i = personaIdx - 1;
      setAcompañantes((prev) =>
        prev.map((a, idx) => {
          if (idx !== i) return a;
          const actuales = a.dieta.alergias;
          const nuevas = actuales.includes(alergiaId)
            ? actuales.filter((al) => al !== alergiaId)
            : [...actuales, alergiaId];
          return { ...a, dieta: { ...a.dieta, alergias: nuevas } };
        })
      );
    }
  };

  const changeNotas = (personaIdx: number, notas: string) => {
    if (personaIdx === 0) {
      setPrincipal((p) => ({ ...p, dieta: { ...p.dieta, notas_medicas: notas } }));
    } else {
      const i = personaIdx - 1;
      setAcompañantes((prev) =>
        prev.map((a, idx) =>
          idx === i ? { ...a, dieta: { ...a.dieta, notas_medicas: notas } } : a
        )
      );
    }
  };

  if (estado === "ok") return <SuccessScreen />;

  const STEP_LABELS = ["Asistencia", "Acompañantes", "Menú"];

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <WatercolorCard wash="paper" className="overflow-x-hidden">
        {/* Cabecera del pliego */}
        <div className="text-center mb-8 space-y-1">
          {isMockMode() && (
            <span className="inline-block watercolor-mask bg-[#B8CDE3]/45 px-3.5 py-1 font-serif italic text-xs text-[#3B539A] mb-2">
              Modo prueba local · sin conexión a Firebase
            </span>
          )}
          <h2
            className="font-serif text-[#2B2B29]"
            style={{ fontSize: "var(--text-heading-lg)" }}
          >
            {EVENT_CONFIG.textos.rsvpTitulo}
          </h2>
          <p className="font-hand text-2xl text-[#58693B]">
            Rogamos confirmación antes del {EVENT_CONFIG.textos.rsvpFechaLimite}
          </p>
        </div>

        <StepIndicator current={step} total={3} labels={STEP_LABELS} />

        {step === 0 && (
          <Step1
            principal={principal}
            onChange={(field, value) => setPrincipal((p) => ({ ...p, [field]: value }))}
            error={errores.nombre}
          />
        )}
        {step === 1 && (
          <Step2
            acompañantes={acompañantes}
            onAdd={addAcompañante}
            onRemove={removeAcompañante}
            onChange={updateAcompañante}
            errors={errores}
          />
        )}
        {step === 2 && (
          <Step3
            todos={todosInvitados}
            onToggleAlergia={toggleAlergia}
            onChangeNotas={changeNotas}
          />
        )}

        {/* Navegación entre pasos */}
        <div className="mt-10 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pb-[env(safe-area-inset-bottom,0px)]">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="btn-watercolor-ghost min-h-[46px] w-full sm:w-auto px-6 py-3 font-serif text-xs uppercase tracking-[0.18em] touch-manipulation"
            >
              <span className="inline-flex items-center gap-2">
                <ChevronLeft size={14} /> Anterior
              </span>
            </button>
          ) : (
            <div className="hidden sm:block" />
          )}

          {step < 2 ? (
            <button
              type="button"
              onClick={step === 0 ? handleNextStep1 : handleNextStep2}
              className="btn-watercolor min-h-[46px] w-full sm:w-auto px-8 py-3 font-serif text-xs uppercase tracking-[0.2em] text-[#F4F6F8] touch-manipulation"
            >
              <span className="inline-flex items-center gap-2 shrink-0">
                Siguiente <ChevronRight size={14} />
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={estado === "enviando"}
              className="btn-watercolor min-h-[46px] w-full sm:w-auto px-8 py-3 font-serif text-xs uppercase tracking-[0.2em] text-[#F4F6F8] disabled:opacity-50 touch-manipulation"
            >
              {estado === "enviando" ? (
                <span className="inline-flex items-center gap-2 shrink-0">
                  Enviando…
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 shrink-0">
                  <span>Confirmar Asistencia</span>
                  <Check size={14} className="flex-shrink-0" />
                </span>
              )}
            </button>
          )}
        </div>
      </WatercolorCard>
    </>
  );
}
