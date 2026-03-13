/**
 * CopyIBANButton — React island mínimo para copiar el IBAN al portapapeles.
 * Solo este componente es React; el resto de la sección de regalos es Astro estático.
 */
import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";

interface Props {
  iban: string;
  titular: string;
  banco: string;
}

export default function CopyIBANButton({ iban, titular, banco }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(iban.replace(/\s/g, ""));
    } catch {
      // Fallback para contextos no seguros
      const el = document.createElement("textarea");
      el.value = iban.replace(/\s/g, "");
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, [iban]);

  return (
    <div className="rounded-xl border border-[#8B4542]/20 bg-white/60 px-6 py-7 text-center space-y-4">
      {/* IBAN */}
      <p
        className="font-serif text-xl sm:text-2xl font-light tracking-widest text-[#2A2A2A] select-all cursor-text"
        aria-label={`IBAN: ${iban}`}
      >
        {iban}
      </p>

      {/* Titular y banco */}
      <p className="font-sans text-sm font-light text-[#2A2A2A]/50">
        {titular}
        {banco && <span className="before:content-['·'] before:mx-2">{banco}</span>}
      </p>

      {/* Botón copiar */}
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copiar número de cuenta IBAN al portapapeles"
        className="inline-flex items-center gap-2 rounded-lg border border-[#8B4542]/30 px-5 py-2.5 font-sans text-sm font-light text-[#8B4542] hover:bg-[#8B4542] hover:text-white hover:border-[#8B4542] transition-all duration-300 touch-manipulation"
      >
        <span aria-live="polite" className="flex items-center gap-2">
          {copied ? (
            <>
              <Check size={14} />
              ¡Copiado!
            </>
          ) : (
            <>
              <Copy size={14} />
              Copiar IBAN
            </>
          )}
        </span>
      </button>
    </div>
  );
}
