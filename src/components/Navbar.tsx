/**
 * Navbar — Cabecera fija minimalista inspirada en plantilla editorial.
 * Logo integrado de forma orgánica, enlaces suaves, menú móvil.
 */
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { EVENT_CONFIG } from "../lib/event-config";

const NAV_LINKS = [
  { href: "#hero", label: "Inicio" },
  { href: "#programa", label: "Programa" },
  { href: "#ubicacion", label: "Ubicación" },
  { href: "#rsvp", label: "Asistencia" },
] as const;

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { novios, fechaCorta } = EVENT_CONFIG;

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#F9F8F6]/90 backdrop-blur-md border-b border-[#E8E3D9]"
      role="navigation"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 sm:h-24">
          {/* Logo + monograma — integración orgánica */}
          <a
            href="#hero"
            className="flex items-center gap-3 group"
            aria-label={`${novios.ella} y ${novios.el} — Inicio`}
          >
            <img
              src="/branding-logo.png"
              alt=""
              width="48"
              height="48"
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain opacity-80 group-hover:opacity-100 transition-opacity"
              loading="eager"
            />
            <span className="font-serif text-xl sm:text-2xl font-light tracking-wide text-[#2A2A2A] hidden sm:inline">
              {novios.ella}
              <span className="italic text-[#8B4542] mx-1">&</span>
              {novios.el}
            </span>
          </a>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="font-sans text-xs uppercase tracking-[0.2em] text-[#2A2A2A]/70 hover:text-[#8B4542] transition-colors duration-300"
              >
                {label}
              </a>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-3 -mr-2 -my-2 min-w-[48px] min-h-[48px] flex items-center justify-center text-[#2A2A2A] hover:text-[#8B4542] transition-colors"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {isMenuOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#F9F8F6] border-t border-[#E8E3D9]">
          <div className="px-4 py-6 flex flex-col items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={() => setIsMenuOpen(false)}
                className="font-sans text-sm uppercase tracking-[0.2em] text-[#2A2A2A]/80 hover:text-[#8B4542] transition-colors py-4 min-h-[48px] flex items-center justify-center w-full"
              >
                {label}
              </a>
            ))}
            <p className="font-serif text-xs text-[#8B4542] italic mt-2">{fechaCorta}</p>
          </div>
        </div>
      )}
    </nav>
  );
}
