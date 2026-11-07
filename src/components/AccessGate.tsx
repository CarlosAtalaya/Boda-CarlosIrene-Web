/**
 * AccessGate — Sobre artesanal de papel de algodón con sello en tinta viva.
 * Si PUBLIC_ACCESS_CODE está vacío, el gate se desactiva automáticamente.
 */
import { useState, useEffect } from "react";
import { EVENT_CONFIG } from "../lib/event-config";
import WatercolorCard from "./ui/WatercolorCard";

const STORAGE_KEY = "boda_access_unlocked";
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
  const [isWashingOut, setIsWashingOut] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    const gateOn = isGateEnabled();
    const stored = isUnlockedStored();
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
    if (trimmed.toLowerCase() === expected.toLowerCase()) {
      setUnlocked();
      setIsWashingOut(true);
      setTimeout(() => {
        setIsUnlocked(true);
        setCode("");
        setIsSubmitting(false);
      }, 550);
    } else {
      setError(true);
      setCode("");
      setIsSubmitting(false);
    }
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center">
        <span className="font-hand text-3xl text-[#3B539A] animate-pulse">
          {EVENT_CONFIG.novios.titulo}
        </span>
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
      className={`fixed inset-0 z-[100] min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 bg-[#F4F6F8] watercolor-canvas transition-all duration-500 ${
        isWashingOut ? "opacity-0 blur-md scale-105" : "opacity-100"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="access-gate-title"
      aria-describedby="access-gate-desc"
    >
      <div className="relative z-10 w-full max-w-md mx-auto">
        <WatercolorCard wash="sky" className="text-center">
          {/* Sello botánico en tinta y cobalto */}
          <div className="flex justify-center mb-6">
            <svg viewBox="0 0 80 80" className="w-16 h-16 overflow-visible boil-line" aria-hidden="true">
              <circle
                cx="40"
                cy="40"
                r="32"
                fill="#DFB98C"
                fillOpacity="0.35"
                filter="url(#watercolor-edge)"
              />
              <circle
                cx="40"
                cy="40"
                r="28"
                fill="none"
                stroke="#3B539A"
                strokeWidth="1.2"
                strokeDasharray="6 4"
              />
              <text
                x="40"
                y="47"
                textAnchor="middle"
                className="font-hand text-2xl fill-[#2B2B29]"
              >
                P&amp;J
              </text>
            </svg>
          </div>

          <h1
            id="access-gate-title"
            className="font-hand text-5xl sm:text-6xl text-[#2B2B29] mb-2"
          >
            {EVENT_CONFIG.novios.titulo}
          </h1>

          <p
            id="access-gate-desc"
            className="font-serif text-xs uppercase tracking-[0.28em] text-[#3B539A] mb-3"
          >
            {titulo}
          </p>

          <p className="font-serif text-[#2B2B29]/80 text-base sm:text-lg mb-8 max-w-sm mx-auto leading-relaxed">
            {mensaje}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                className="input-ink-line w-full px-4 py-3 text-[#2B2B29] placeholder:text-[#2B2B29]/45 font-serif text-center tracking-[0.22em] uppercase text-base disabled:opacity-60"
                aria-invalid={error}
                aria-describedby={error ? "code-error" : undefined}
              />
              {error && (
                <p
                  id="code-error"
                  className="mt-3 text-sm text-[#B88655] font-serif italic text-center"
                  role="alert"
                >
                  {errorMensaje}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !code.trim()}
              className="btn-watercolor w-full min-h-[50px] font-serif text-xs sm:text-sm uppercase tracking-[0.22em] disabled:opacity-45 disabled:cursor-not-allowed"
            >
              <span>{isSubmitting ? "Abriendo sobre…" : boton}</span>
            </button>
          </form>
        </WatercolorCard>
      </div>
    </div>
  );
}
