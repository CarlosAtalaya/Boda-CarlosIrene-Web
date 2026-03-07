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
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-[#8B4542] bg-[#8B4542]/10 px-6 py-3 font-sans text-[#1A1A1A] transition hover:bg-[#8B4542]/20 touch-manipulation ${className}`}
    >
      <Calendar className="h-5 w-5 text-[#8B4542]" />
      Añadir al calendario
    </a>
  );
}
