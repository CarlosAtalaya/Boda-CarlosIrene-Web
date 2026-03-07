/**
 * Botón para añadir el evento al Google Calendar.
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
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-[#C5A059] bg-[#C5A059]/10 px-6 py-3 font-sans text-[#1A1A1A] transition hover:bg-[#C5A059]/20 ${className}`}
    >
      <Calendar className="h-5 w-5 text-[#C5A059]" />
      Añadir al calendario
    </a>
  );
}
