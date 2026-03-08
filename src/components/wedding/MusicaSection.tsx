/**
 * MusicaSection — Recomendaciones musicales (títulos/artistas para la pista).
 * Sección independiente: cualquier persona puede enviar sin identificarse.
 * Colección Firestore: recomendaciones_musicales
 */
import { useState, useCallback } from "react";
import { collection, addDoc } from "firebase/firestore";
import { Music, Check, AlertCircle, X } from "lucide-react";
import { getFirestoreDb } from "../../lib/firebase";

function isMockMode(): boolean {
  const key = import.meta.env.PUBLIC_FIREBASE_API_KEY;
  return !key || typeof key !== "string" || key.trim() === "";
}

type ToastType = "error" | "success";

function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: ToastType;
  onClose: () => void;
}) {
  const colors: Record<ToastType, string> = {
    error: "border-red-200 bg-red-50 text-red-800",
    success: "border-[#8B4542]/30 bg-[#8B4542]/10 text-[#2A2A2A]",
  };
  const Icon = type === "error" ? AlertCircle : Check;

  return (
    <div
      className={`toast-enter fixed left-1/2 z-[100] -translate-x-1/2 flex items-center gap-3 rounded-xl border px-5 py-3.5 shadow-lg ${colors[type]}`}
      style={{ bottom: "calc(7rem + env(safe-area-inset-bottom, 0px))" }}
      role="alert"
    >
      <Icon size={15} className="flex-shrink-0" />
      <p className="font-sans text-sm font-light leading-snug max-w-[260px]">{message}</p>
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

export default function MusicaSection() {
  const [sugerencias, setSugerencias] = useState("");
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok">("idle");
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = useCallback((message: string, type: ToastType = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const texto = sugerencias.trim();
    if (!texto) {
      showToast("Escribe al menos una canción o artista.");
      return;
    }

    setEstado("enviando");

    if (isMockMode()) {
      console.log("[Música Mock] Recomendación:", texto);
      setTimeout(() => {
        setEstado("ok");
        setSugerencias("");
      }, 600);
      return;
    }

    try {
      const db = getFirestoreDb();
      await addDoc(collection(db, "recomendaciones_musicales"), {
        sugerencias: texto,
        createdAt: new Date().toISOString(),
      });
      setEstado("ok");
      setSugerencias("");
    } catch (err) {
      console.error(err);
      setEstado("idle");
      showToast("No se pudo enviar. Por favor, inténtalo de nuevo.", "error");
    }
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <section id="musica" className="py-12 sm:py-16 px-4 sm:px-6 bg-[#F3EFEA]">
        <div className="mx-auto max-w-xl">
          <div className="text-center mb-6">
            <p className="font-sans text-[0.7rem] sm:text-xs tracking-[0.35em] uppercase text-[#8B4542] mb-3">
              La fiesta
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#2A2A2A] mb-2">
              ¡La guinda del pastel!
            </h2>
            <div className="w-12 h-px bg-[#8B4542] mx-auto mb-4" />
            <p className="font-sans font-light text-[#2A2A2A]/60 text-sm sm:text-base">
              ¿Qué canción no puede faltar en la pista? Sugiérenos títulos o artistas que te harían
              bailar seguro.
            </p>
          </div>

          {estado === "ok" ? (
            <div className="rounded-xl border border-[#8B4542]/20 bg-white/60 px-6 py-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-[#8B4542]/15 flex items-center justify-center mb-3">
                <Check size={22} className="text-[#8B4542]" />
              </div>
              <p className="font-sans font-light text-[#2A2A2A]">
                ¡Gracias! Hemos recibido tu recomendación.
              </p>
              <button
                type="button"
                onClick={() => setEstado("idle")}
                className="mt-4 font-sans text-sm text-[#8B4542] underline underline-offset-2 hover:no-underline"
              >
                Enviar otra
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl border border-[#8B4542]/20 bg-white/60 p-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#8B4542]/15 flex items-center justify-center">
                  <Music size={20} className="text-[#8B4542]" />
                </div>
                <textarea
                  value={sugerencias}
                  onChange={(e) => setSugerencias(e.target.value)}
                  rows={2}
                  className="input-editorial flex-1 bg-transparent font-sans font-light text-[#2A2A2A] placeholder:text-[#2A2A2A]/30 focus:outline-none resize-none"
                  style={{ fontSize: "var(--text-body)" }}
                  placeholder="Canciones o artistas que te harían bailar…"
                  disabled={estado === "enviando"}
                />
              </div>
              <button
                type="submit"
                disabled={estado === "enviando"}
                className="btn-primary flex w-full min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#2A2A2A] px-6 py-3 font-sans font-light text-[#F9F8F6] disabled:opacity-50 touch-manipulation"
                style={{ fontSize: "var(--text-small)" }}
              >
                {estado === "enviando" ? (
                  <>
                    <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Enviando…
                  </>
                ) : (
                  <>
                    Enviar recomendación <Check size={14} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
