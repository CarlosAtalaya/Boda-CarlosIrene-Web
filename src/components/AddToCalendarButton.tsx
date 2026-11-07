/**
 * Botón artesanal para añadir el evento a Google Calendar.
 */
import { Calendar } from "lucide-react";
import { getGoogleCalendarUrl } from "../lib/calendar";

interface Props {
  className?: string;
}

export default function AddToCalendarButton({ className = "" }: Props) {
  const url = getGoogleCalendarUrl();

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn-watercolor-ghost min-h-[46px] px-7 py-3 font-serif text-xs uppercase tracking-[0.18em] text-[#2B2B29] inline-flex items-center justify-center gap-2 touch-manipulation ${className}`}
    >
      <Calendar className="h-4 w-4 text-[#3B539A]" strokeWidth={1.5} />
      <span>Guardar en Calendario</span>
    </a>
  );
}
