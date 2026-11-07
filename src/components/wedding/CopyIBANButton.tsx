/**
 * CopyIBANButton — Etiqueta de papel prensado con acuarela de albero y borde a plumilla.
 */
import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import WatercolorCard from "../ui/WatercolorCard";

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
    <WatercolorCard wash="albero" className="text-center space-y-4">
      <p className="font-hand text-2xl text-[#3B539A]">
        Titular: {titular}
        {banco && <span className="before:content-['·'] before:mx-2">{banco}</span>}
      </p>

      <p
        className="font-serif text-xl sm:text-2xl tracking-[0.14em] text-[#2B2B29] select-all cursor-text py-1"
        aria-label={`IBAN: ${iban}`}
      >
        {iban}
      </p>

      <div className="pt-2">
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copiar número de cuenta IBAN al portapapeles"
          className="btn-watercolor min-h-[44px] px-7 py-2.5 font-serif text-xs uppercase tracking-[0.2em] text-[#F4F6F8] touch-manipulation"
        >
          <span aria-live="polite" className="flex items-center gap-2">
            {copied ? (
              <>
                <Check size={14} />
                ¡Copiado al portapapeles!
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
    </WatercolorCard>
  );
}
