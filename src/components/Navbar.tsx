/**
 * Navbar — Índice editorial ligero sobre papel de algodón.
 * Con trazos de tinta hechos a mano que se dibujan al pasar el cursor.
 */
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { EVENT_CONFIG } from "../lib/event-config";

const NAV_LINKS = [
  { href: "#hero",      label: "Inicio"     },
  { href: "#ubicacion", label: "El Lugar"   },
  { href: "#programa",  label: "Programa"   },
  { href: "#rsvp",      label: "Asistencia" },
  { href: "#regalos",   label: "Detalle"    },
  { href: "#faq",       label: "Dudas"      },
] as const;

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { novios, fechaCorta } = EVENT_CONFIG;

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-colors duration-300 bg-[#F4F6F8]/88 backdrop-blur-sm"
      role="navigation"
      aria-label="Índice de la invitación"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Monograma caligráfico en tinta viva */}
          <a
            href="#hero"
            className="flex items-center gap-3 group"
            aria-label={`${novios.ella} y ${novios.el} — Inicio`}
          >
            <span className="relative flex items-center justify-center w-10 h-10">
              <svg
                viewBox="0 0 44 44"
                className="w-10 h-10 overflow-visible"
                aria-hidden="true"
              >
                <ellipse
                  cx="22"
                  cy="22"
                  rx="18"
                  ry="15"
                  fill="#B8CDE3"
                  fillOpacity="0.45"
                  className="group-hover:fill-[#DFB98C] transition-colors"
                />
                <path
                  d="M 6 22 C 6 11, 14 5, 23 6 C 33 7, 39 14, 38 23 C 37 33, 29 39, 20 38 C 11 37, 5 30, 6 22 Z"
                  fill="none"
                  stroke="#2B2B29"
                  strokeWidth="1"
                  strokeOpacity="0.45"
                />
              </svg>
              <span className="absolute font-hand text-xl text-[#2B2B29] tracking-tighter">
                P<span className="text-[#3B539A] text-sm mx-0.5">&amp;</span>J
              </span>
            </span>

            <span className="font-hand text-2xl sm:text-3xl text-[#2B2B29] hidden sm:inline">
              {novios.ella}
              <span className="font-serif italic text-lg text-[#3B539A] mx-1.5">&amp;</span>
              {novios.el}
            </span>
          </a>

          {/* Enlaces de escritorio con subrayado orgánico en tinta */}
          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="group relative py-1 font-serif text-sm tracking-[0.18em] uppercase text-[#2B2B29]/80 hover:text-[#3B539A] transition-colors"
              >
                <span>{label}</span>
                <svg
                  viewBox="0 0 80 6"
                  className="w-full h-1.5 overflow-visible mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M 2 3.5 C 24 1, 52 5.5, 78 2.5"
                    fill="none"
                    stroke="#3B539A"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </a>
            ))}
          </div>

          {/* Botón menú móvil */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-3 -mr-2 min-w-[48px] min-h-[48px] flex items-center justify-center text-[#2B2B29] hover:text-[#3B539A] transition-colors"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Cerrar índice" : "Abrir índice"}
          >
            {isMenuOpen ? <X size={24} strokeWidth={1.4} /> : <Menu size={24} strokeWidth={1.4} />}
          </button>
        </div>
      </div>

      {/* Trazo de tinta inferior en lugar de border-b recto */}
      <svg
        viewBox="0 0 1200 6"
        className="w-full h-1.5 block overflow-visible pointer-events-none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M 0 3 C 300 1, 600 5, 900 2.5 C 1050 1.5, 1150 4, 1200 3"
          fill="none"
          stroke="#2B2B29"
          strokeWidth="0.9"
          strokeOpacity="0.18"
        />
      </svg>

      {/* Desplegable móvil con textura de pliego */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#F4F6F8]/95 backdrop-blur-md pb-6 pt-2 px-6 shadow-none">
          <div className="flex flex-col items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={() => setIsMenuOpen(false)}
                className="font-serif text-base uppercase tracking-[0.2em] text-[#2B2B29]/85 hover:text-[#3B539A] py-3 min-h-[48px] flex items-center justify-center w-full"
              >
                {label}
              </a>
            ))}
            <div className="divider-ink w-24 my-2" />
            <p className="font-hand text-xl text-[#3B539A]">{fechaCorta}</p>
          </div>
        </div>
      )}
    </nav>
  );
}
