/**
 * AccessGate — Pantalla de acceso por código.
 * Barrera de seguridad para la web de boda. Solo código, sin usuarios.
 * Si PUBLIC_ACCESS_CODE está vacío, el gate se desactiva (desarrollo).
 *
 * Duración de sesión (siguiendo OWASP Session Management):
 * - sessionStorage: sesión termina al cerrar la pestaña.
 * - Timeout absoluto: 7 días desde primer acceso. Limita exposición de pestañas
 *   abiertas compartidas. Recomendado por OWASP para apps de bajo riesgo.
 */
import { useState, useEffect } from "react";
import { Lock } from "lucide-react";
import { EVENT_CONFIG } from "../lib/event-config";

const STORAGE_KEY = "boda_access_unlocked";

/** 7 días en ms — timeout absoluto OWASP para apps de bajo riesgo */
const ABSOLUTE_TIMEOUT_MS = 7 * 24 * 60 * 60 * 1000;

function getExpectedCode(): string {
  const v = import.meta.env.PUBLIC_ACCESS_CODE;
  if (v === undefined || v === null) return "";
  return String(v).trim();
}

function isGateEnabled(): boolean {
  return getExpectedCode().length > 0;
}

function isUnlockedStored(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    // Formato legacy "1" — migrar a nuevo formato
    if (raw === "1") {
      setUnlocked();
      return true;
    }
    const data = JSON.parse(raw) as { u?: number; t?: number };
    if (typeof data !== "object" || !data?.t) return false;
    const elapsed = Date.now() - data.t;
    if (elapsed >= ABSOLUTE_TIMEOUT_MS) {
      sessionStorage.removeItem(STORAGE_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function setUnlocked(): void {
  try {
    const payload = JSON.stringify({ u: 1, t: Date.now() });
    sessionStorage.setItem(STORAGE_KEY, payload);
  } catch {
    // Ignore
  }
}

interface AccessGateProps {
  children: React.ReactNode;
}

export default function AccessGate({ children }: AccessGateProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    const gateOn = isGateEnabled();
    const stored = isUnlockedStored();
    if (import.meta.env.DEV) {
      console.log("[AccessGate] PUBLIC_ACCESS_CODE definido:", gateOn, "| sessionStorage unlock:", stored);
    }
    if (!gateOn) {
      setIsUnlocked(true);
      return;
    }
    setIsUnlocked(stored);
  }, [isHydrated]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setIsSubmitting(true);

    const expected = getExpectedCode();
    if (!expected) {
      setIsUnlocked(true);
      setIsSubmitting(false);
      return;
    }

    const trimmed = code.trim();
    if (trimmed === expected) {
      setUnlocked();
      setIsUnlocked(true);
      setCode("");
    } else {
      setError(true);
      setCode("");
    }
    setIsSubmitting(false);
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[#F5F1EB] flex items-center justify-center">
        <div className="animate-pulse text-[#8B4542]" aria-hidden="true">
          <Lock size={32} strokeWidth={1.5} />
        </div>
      </div>
    );
  }

  if (isUnlocked) {
    return <>{children}</>;
  }

  const { titulo, mensaje, placeholder, boton, errorMensaje } =
    EVENT_CONFIG.accessGate;

  return (
    <div
      className="fixed inset-0 z-[100] min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 bg-[#F5F1EB] paper-texture"
      role="dialog"
      aria-modal="true"
      aria-labelledby="access-gate-title"
      aria-describedby="access-gate-desc"
    >
      {/* Orbes decorativos (como HeroSection) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#D9C5C5] mix-blend-multiply filter blur-[100px] opacity-40" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#8B4542] mix-blend-multiply filter blur-[100px] opacity-[0.22]" />
      </div>

      {/* Logo sutil */}
      <figure className="absolute top-8 right-8 z-10 opacity-20" aria-hidden="true">
        <img
          src="/branding-logo.png"
          alt=""
          width="64"
          height="64"
          className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
        />
      </figure>

      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* Icono y títulos */}
        <div className="flex justify-center mb-8">
          <div className="rounded-full border border-[#8B4542]/40 p-4 bg-[#F9F8F6]/80">
            <Lock size={28} className="text-[#8B4542]" strokeWidth={1.5} aria-hidden="true" />
          </div>
        </div>
        <h1
          id="access-gate-title"
          className="font-serif text-3xl sm:text-4xl font-light text-center text-[#2A2A2A] mb-4"
        >
          {EVENT_CONFIG.novios.titulo}
        </h1>
        <p
          id="access-gate-desc"
          className="font-sans text-sm uppercase tracking-[0.3em] text-[#8B4542] text-center mb-2"
        >
          {titulo}
        </p>
        <p className="font-sans text-[#2A2A2A]/80 text-center text-sm sm:text-base mb-10 max-w-sm mx-auto">
          {mensaje}
        </p>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="access-code" className="sr-only">
              {placeholder}
            </label>
            <input
              id="access-code"
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError(false);
              }}
              placeholder={placeholder}
              autoComplete="one-time-code"
              autoFocus
              disabled={isSubmitting}
              className="input-editorial w-full px-6 py-4 bg-[#F9F8F6] border border-[#E8E3D9] rounded-sm text-[#2A2A2A] placeholder:text-[#2A2A2A]/50 font-sans text-center tracking-[0.2em] uppercase text-sm focus:outline-none focus:border-[#8B4542] disabled:opacity-60 transition-colors"
              aria-invalid={error}
              aria-describedby={error ? "code-error" : undefined}
            />
            {error && (
              <p
                id="code-error"
                className="mt-2 text-sm text-[#8B4542] font-sans text-center"
                role="alert"
              >
                {errorMensaje}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !code.trim()}
            className="btn-primary w-full min-h-[52px] flex items-center justify-center border border-[#2A2A2A] bg-transparent text-[#2A2A2A] font-sans text-xs uppercase tracking-[0.2em] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Comprobando…" : boton}
          </button>
        </form>

        {/* Separador */}
        <div className="w-px h-12 bg-[#2A2A2A]/20 mx-auto mt-12" />
      </div>
    </div>
  );
}
