/**
 * RSVPForm — Formulario multi-paso (3 steps) de alta gama.
 *
 * Step 1: Confirmación de asistencia del invitado principal.
 * Step 2: Gestión dinámica de acompañantes.
 * Step 3: Alergias y restricciones por persona.
 * Success: Pantalla de éxito con AddToCalendar como recompensa visual.
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
    error: "border-red-200 bg-red-50 text-red-800",
    success: "border-[#8B4542]/30 bg-[#8B4542]/10 text-[#2A2A2A]",
    info: "border-blue-200 bg-blue-50 text-blue-800",
  };
  const Icon = type === "error" ? AlertCircle : Check;

  return (
    <div
      className={`toast-enter fixed left-1/2 z-[100] -translate-x-1/2 flex items-center gap-3 rounded-xl border px-5 py-3.5 shadow-lg ${colors[type]}`}
      style={{ bottom: "calc(7rem + env(safe-area-inset-bottom, 0px))" }}
      role="alert"
    >
      <Icon size={15} className="flex-shrink-0" />
      <p className="font-sans text-sm font-light leading-snug max-w-[260px]">
        {message}
      </p>
      <button
        onClick={onClose}
        className="ml-2 flex-shrink-0 p-2 -m-2 opacity-60 hover:opacity-100 transition-opacity touch-manipulation"
        aria-label="Cerrar notificación"
      >
        <X size={13} />
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
              className={`step-dot w-8 h-8 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-sans font-medium transition-all duration-500 min-w-[2rem] min-h-[2rem] ${
                i < current
                  ? "completed bg-[#2A2A2A] text-[#F9F8F6]"
                  : i === current
                  ? "active bg-[#8B4542] text-white"
                  : "bg-[#2A2A2A]/10 text-[#2A2A2A]/40"
              }`}
            >
              {i < current ? <Check size={12} /> : i + 1}
            </div>
            <span
              className={`font-sans text-[0.6rem] tracking-wide uppercase transition-colors duration-300 hidden sm:block ${
                i === current ? "text-[#8B4542]" : "text-[#2A2A2A]/40"
              }`}
            >
              {labels[i]}
            </span>
          </div>
          {i < total - 1 && (
            <div
              className={`w-10 sm:w-16 h-px mx-1 mb-4 transition-all duration-500 ${
                i < current ? "bg-[#2A2A2A]/40" : "bg-[#2A2A2A]/10"
              }`}
            />
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
      <div className="text-center space-y-2">
        <h3
          className="font-serif font-light text-[#2A2A2A]"
          style={{ fontSize: "var(--text-heading-md)" }}
        >
          ¿Asistirás a la celebración?
        </h3>
        <p
          className="font-sans font-light text-[#2A2A2A]/60"
          style={{ fontSize: "var(--text-body)" }}
        >
          Por favor, indica tu nombre y confirma tu asistencia.
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="nombre-principal"
          className="block font-sans text-xs tracking-widest uppercase text-[#2A2A2A]/60"
        >
          Nombre completo
        </label>
        <input
          id="nombre-principal"
          type="text"
          value={principal.nombre}
          onChange={(e) => onChange("nombre", e.target.value)}
          className="input-editorial w-full rounded-xl border border-[#8B4542]/25 bg-white/70 px-4 py-3.5 font-sans font-light text-[#2A2A2A] placeholder:text-[#2A2A2A]/30 focus:border-[#8B4542] focus:outline-none focus:bg-white"
          style={{ fontSize: "var(--text-body)" }}
          placeholder="Introduce tu nombre y apellidos"
          autoComplete="name"
        />
        {error && (
          <p className="text-xs text-red-500 flex items-center gap-1.5">
            <AlertCircle size={11} /> {error}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <p className="font-sans text-xs tracking-widest uppercase text-[#2A2A2A]/60">
          Confirmación
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: true, label: "Sí, asistiré", icon: "✓" },
            { value: false, label: "No podré asistir", icon: "×" },
          ].map(({ value, label, icon }) => (
            <button
              key={String(value)}
              type="button"
              onClick={() => onChange("confirmado", value)}
              className={`relative rounded-xl border px-4 py-4 font-sans font-light text-sm transition-all duration-300 ${
                principal.confirmado === value
                  ? value
                    ? "border-[#8B4542] bg-[#8B4542]/10 text-[#2A2A2A] shadow-sm"
                    : "border-[#2A2A2A]/30 bg-[#2A2A2A]/5 text-[#2A2A2A]"
                  : "border-[#2A2A2A]/10 bg-transparent text-[#2A2A2A]/50 hover:border-[#2A2A2A]/20"
              }`}
            >
              <span
                className={`block text-xl mb-1 font-serif ${
                  value ? "text-[#8B4542]" : "text-[#2A2A2A]/40"
                }`}
              >
                {icon}
              </span>
              {label}
            </button>
          ))}
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
      <div className="text-center space-y-2">
        <h3
          className="font-serif font-light text-[#2A2A2A]"
          style={{ fontSize: "var(--text-heading-md)" }}
        >
          ¿Vendrás acompañado?
        </h3>
        <p
          className="font-sans font-light text-[#2A2A2A]/60"
          style={{ fontSize: "var(--text-body)" }}
        >
          Añade el nombre de cada acompañante.
        </p>
      </div>

      {/* En móvil: sin scroll interno (iOS oculta la barra en contenedores anidados); desde sm, caja con scroll */}
      <div className="space-y-3 sm:max-h-64 sm:overflow-y-auto sm:pr-1 sm:[-webkit-overflow-scrolling:touch]">
        {acompañantes.map((ac, i) => (
          <div
            key={i}
            className="guest-card flex items-center gap-3 rounded-xl border border-[#8B4542]/20 bg-white/60 px-4 py-3"
          >
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#8B4542]/15 flex items-center justify-center">
              <span className="font-serif text-xs text-[#8B4542]">{i + 1}</span>
            </div>
            <input
              type="text"
              value={ac.nombre}
              onChange={(e) => onChange(i, "nombre", e.target.value)}
              className="flex-1 bg-transparent font-sans font-light text-[#2A2A2A] placeholder:text-[#2A2A2A]/30 focus:outline-none"
              style={{ fontSize: "var(--text-body)" }}
              placeholder={`Nombre del acompañante ${i + 1}`}
            />
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="flex-shrink-0 rounded-lg p-1.5 text-[#2A2A2A]/30 transition-all duration-200 hover:bg-red-50 hover:text-red-400"
              aria-label="Eliminar acompañante"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      {errors["acompañantes"] && (
        <p className="text-xs text-red-500 flex items-center gap-1.5">
          <AlertCircle size={11} /> {errors["acompañantes"]}
        </p>
      )}

      <button
        type="button"
        onClick={onAdd}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-dashed border-[#8B4542]/30 py-3.5 font-sans font-light text-[#8B4542] transition-all duration-300 hover:border-[#8B4542] hover:bg-[#8B4542]/5"
        style={{ fontSize: "var(--text-small)" }}
      >
        <Plus size={14} />
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
      <div className="text-center space-y-2">
        <h3
          className="font-serif font-light text-[#2A2A2A]"
          style={{ fontSize: "var(--text-heading-md)" }}
        >
          Alergias y restricciones
        </h3>
        <p
          className="font-sans font-light text-[#2A2A2A]/60"
          style={{ fontSize: "var(--text-body)" }}
        >
          Para que el menú sea perfecto para todos.
        </p>
      </div>

      <div className="space-y-3 sm:max-h-80 sm:overflow-y-auto sm:pr-1 sm:[-webkit-overflow-scrolling:touch]">
        {todos.map((persona, i) => (
          <div
            key={i}
            className="rounded-xl border border-[#8B4542]/15 overflow-hidden"
          >
            {/* Cabecera acordeón */}
            <button
              type="button"
              onClick={() => setExpandido(expandido === i ? -1 : i)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white/50 hover:bg-[#8B4542]/5 transition-colors duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#8B4542]/15 flex items-center justify-center flex-shrink-0">
                  <span className="font-serif text-xs text-[#8B4542]">
                    {persona.nombre ? persona.nombre.charAt(0).toUpperCase() : "?"}
                  </span>
                </div>
                <span
                  className="font-sans font-light text-[#2A2A2A] text-left truncate min-w-0 max-w-[140px] sm:max-w-[160px]"
                  style={{ fontSize: "var(--text-body)" }}
                >
                  {persona.nombre || `Persona ${i + 1}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {persona.dieta.alergias.length > 0 && (
                  <span className="rounded-full bg-[#8B4542]/20 px-2 py-0.5 font-sans text-[0.65rem] text-[#8B4542]">
                    {persona.dieta.alergias.length}
                  </span>
                )}
                <ChevronRight
                  size={14}
                  className={`text-[#2A2A2A]/40 transition-transform duration-300 ${
                    expandido === i ? "rotate-90" : ""
                  }`}
                />
              </div>
            </button>

            {/* Contenido desplegable */}
            {expandido === i && (
              <div className="step-panel px-4 pb-4 pt-3 bg-white/30 space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {ALERGIAS_OPCIONES.map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 transition-all duration-200 ${
                        persona.dieta.alergias.includes(opt.id)
                          ? "border-[#8B4542]/40 bg-[#8B4542]/10"
                          : "border-[#2A2A2A]/8 bg-white/50 hover:border-[#8B4542]/20"
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all duration-200 ${
                          persona.dieta.alergias.includes(opt.id)
                            ? "bg-[#8B4542] border-[#8B4542]"
                            : "border-[#2A2A2A]/20"
                        }`}
                      >
                        {persona.dieta.alergias.includes(opt.id) && (
                          <Check size={9} className="text-white" />
                        )}
                      </div>
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={persona.dieta.alergias.includes(opt.id)}
                        onChange={() => onToggleAlergia(i, opt.id)}
                      />
                      <span
                        className="font-sans font-light text-[#2A2A2A] leading-tight"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>

                <input
                  type="text"
                  value={persona.dieta.notas_medicas}
                  onChange={(e) => onChangeNotas(i, e.target.value)}
                  className="input-editorial w-full rounded-xl border border-[#8B4542]/20 bg-white/60 px-3.5 py-2.5 font-sans font-light text-[#2A2A2A] placeholder:text-[#2A2A2A]/30 focus:border-[#8B4542] focus:outline-none"
                  style={{ fontSize: "0.8rem" }}
                  placeholder="Otras alergias o enfermedades alimentarias…"
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
    <div className="step-panel space-y-8 text-center py-6">
      {/* Icono animado */}
      <div className="mx-auto w-16 h-16 rounded-full border-2 border-[#8B4542] flex items-center justify-center">
        <Check size={28} className="text-[#8B4542]" />
      </div>

      {/* Logo */}
      <img
        src="/branding-logo.png"
        alt="Logo boda"
        width="80"
        height="80"
        className="w-16 h-16 object-contain mx-auto opacity-70"
      />

      <div className="space-y-2">
        <h3
          className="font-serif font-light text-[#2A2A2A]"
          style={{ fontSize: "var(--text-heading-md)" }}
        >
          Gracias por confirmar
        </h3>
        <p
          className="font-sans font-light text-[#2A2A2A]/60 max-w-xs mx-auto"
          style={{ fontSize: "var(--text-body)" }}
        >
          Hemos recibido tu respuesta. Nos vemos el{" "}
          <span className="text-[#8B4542]">{EVENT_CONFIG.fechaLegible}</span>.
        </p>
      </div>

      <div className="divider-gold w-32 mx-auto" />

      <div className="space-y-4">
        <p
          className="font-sans font-light text-[#2A2A2A]/70 max-w-sm mx-auto"
          style={{ fontSize: "var(--text-body)" }}
        >
          ¿Vienes de fuera y necesitas ayuda para encontrar alojamiento?{" "}
          <a
            href="#hoteles"
            className="text-[#8B4542] underline underline-offset-2 hover:no-underline transition-colors"
          >
            Consulta nuestras recomendaciones de hoteles
          </a>
          .
        </p>

        <div className="space-y-3">
          <p
            className="font-sans text-xs tracking-widest uppercase text-[#2A2A2A]/40"
          >
            Guarda la fecha
          </p>
          <AddToCalendarButton />
        </div>
      </div>
    </div>
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

  // ── Paso 1: validar y avanzar
  const handleNextStep1 = () => {
    if (!principal.nombre.trim()) {
      setErrores({ nombre: "Por favor, introduce tu nombre completo." });
      return;
    }
    setErrores({});
    setStep(1);
  };

  // ── Paso 2: siempre válido, avanzar
  const handleNextStep2 = () => {
    const invalid = acompañantes.some((a) => !a.nombre.trim());
    if (invalid) {
      setErrores({ acompañantes: "Por favor, completa el nombre de todos los acompañantes." });
      return;
    }
    setErrores({});
    setStep(2);
  };

  // ── Submit final
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
      console.log("[RSVP Mock] Datos capturados:", JSON.stringify(payload, null, 2));
      setTimeout(() => setEstado("ok"), 800);
      return;
    }

    try {
      const db = getFirestoreDb();
      await addDoc(collection(db, "respuestas_boda"), payload);
      setEstado("ok");
    } catch (err) {
      console.error(err);
      setEstado("idle");
      showToast("No se pudo guardar la respuesta. Por favor, inténtalo de nuevo.", "error");
    }
  };

  // ── Handlers acompañantes
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

  // ── Handler alergias todos los invitados
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
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="rounded-2xl border border-[#8B4542]/15 bg-white/50 backdrop-blur-sm p-4 sm:p-10 shadow-sm shadow-[#8B4542]/5 overflow-x-hidden">

        {/* Header del formulario */}
        <div className="text-center mb-8 space-y-1">
          {isMockMode() && (
            <span className="inline-block rounded-full bg-[#8B4542]/15 px-3 py-1 font-sans text-[0.65rem] tracking-wide text-[#8B4542] mb-3">
              Modo simulación · sin Firebase
            </span>
          )}
          <h2
            className="font-serif font-light text-[#2A2A2A]"
            style={{ fontSize: "var(--text-heading-lg)" }}
          >
            {EVENT_CONFIG.textos.rsvpTitulo}
          </h2>
          <p
            className="font-sans font-light text-[#2A2A2A]/50"
            style={{ fontSize: "var(--text-small)" }}
          >
            Antes del {EVENT_CONFIG.textos.rsvpFechaLimite}
          </p>
        </div>

        {/* Step indicator */}
        <StepIndicator current={step} total={3} labels={STEP_LABELS} />
        {/* En móvil: labels abreviados para evitar overflow */}

        {/* Contenido por paso */}
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

        {/* Navegación — en móvil: botones apilados para evitar overflow; touch targets 44px; pb-safe para teclado virtual */}
        <div className="mt-10 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pb-[env(safe-area-inset-bottom,0px)]">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex min-h-[44px] w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-[#2A2A2A]/15 px-5 py-3 font-sans font-light text-[#2A2A2A]/60 transition-all duration-200 hover:border-[#2A2A2A]/30 hover:text-[#2A2A2A] touch-manipulation"
              style={{ fontSize: "var(--text-small)" }}
            >
              <ChevronLeft size={14} /> Anterior
            </button>
          ) : (
            <div className="hidden sm:block" />
          )}

          {step < 2 ? (
            <button
              type="button"
              onClick={step === 0 ? handleNextStep1 : handleNextStep2}
              className="btn-primary flex min-h-[44px] w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#2A2A2A] px-8 py-3 font-sans font-light text-[#F9F8F6] touch-manipulation"
              style={{ fontSize: "var(--text-small)" }}
            >
              <span className="inline-flex items-center gap-2 shrink-0">Siguiente <ChevronRight size={14} /></span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={estado === "enviando"}
              className="btn-primary flex min-h-[44px] w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#2A2A2A] px-6 sm:px-8 py-3 font-sans font-light text-[#F9F8F6] disabled:opacity-50 touch-manipulation"
              style={{ fontSize: "var(--text-small)" }}
            >
              {estado === "enviando" ? (
                <span className="inline-flex items-center gap-2 shrink-0">
                  <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Enviando…
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 shrink-0">
                  <span className="sm:hidden">Confirmar</span>
                  <span className="hidden sm:inline">Confirmar asistencia</span>
                  <Check size={14} className="flex-shrink-0" />
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
