/**
 * WeatherWidget — Previsión meteorológica para el día de la boda.
 * Usa Open-Meteo /v1/forecast (gratuito, sin API key).
 * Se monta como React island client:load.
 *
 * Lógica de estados:
 *  - days > 16  → cuenta atrás, sin previsión disponible
 *  - 0 ≤ days ≤ 16 → previsión real del día vía /v1/forecast
 *  - days < 0   → oculto (ya pasó)
 *
 * testDateISO: si se pasa, simula que "hoy" es esa fecha (solo para pruebas).
 */
import { useState, useEffect } from "react";

interface Props {
  lat: number;
  lon: number;
  weddingDateISO: string;   // "2026-06-26"
  venueName: string;
  testDateISO?: string;     // solo para pruebas: simula "hoy" con otra fecha
}

interface DayForecast {
  tempMax: number;
  tempMin: number;
  precipProb: number;
  weatherCode: number;
}

function weatherInfo(code: number): { label: string; icon: string } {
  if (code === 0)  return { label: "Cielo despejado",        icon: "☀️" };
  if (code <= 2)   return { label: "Parcialmente nublado",   icon: "⛅" };
  if (code === 3)  return { label: "Nublado",                icon: "☁️" };
  if (code <= 49)  return { label: "Niebla",                 icon: "🌫️" };
  if (code <= 59)  return { label: "Llovizna",               icon: "🌦️" };
  if (code <= 69)  return { label: "Lluvia",                 icon: "🌧️" };
  if (code <= 79)  return { label: "Nieve",                  icon: "❄️" };
  if (code <= 84)  return { label: "Chubascos",              icon: "🌧️" };
  if (code <= 99)  return { label: "Tormenta",               icon: "⛈️" };
  return { label: "Variable", icon: "🌤️" };
}

function daysUntil(weddingISO: string, todayISO?: string): number {
  const base = todayISO ? new Date(todayISO + "T00:00:00") : new Date();
  base.setHours(0, 0, 0, 0);
  const target = new Date(weddingISO + "T00:00:00");
  return Math.round((target.getTime() - base.getTime()) / 86_400_000);
}

export default function WeatherWidget({ lat, lon, weddingDateISO, venueName, testDateISO }: Props) {
  const [forecast, setForecast] = useState<DayForecast | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);

  const days = daysUntil(weddingDateISO, testDateISO);
  const canFetch = days >= 0 && days <= 16;

  useEffect(() => {
    if (!canFetch) { setLoading(false); return; }

    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lon}` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode` +
      `&timezone=Europe%2FMadrid` +
      `&start_date=${weddingDateISO}&end_date=${weddingDateISO}`;

    fetch(url, { referrerPolicy: "no-referrer" })
      .then((r) => r.json())
      .then((data) => {
        const d = data.daily;
        if (!d?.temperature_2m_max?.[0]) { setError(true); return; }
        setForecast({
          tempMax:     Math.round(d.temperature_2m_max[0]),
          tempMin:     Math.round(d.temperature_2m_min[0]),
          precipProb:  d.precipitation_probability_max[0] ?? 0,
          weatherCode: d.weathercode[0] ?? 0,
        });
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [canFetch, lat, lon, weddingDateISO]);

  if (days < 0) return null;

  const info = forecast ? weatherInfo(forecast.weatherCode) : null;

  return (
    <div className="mt-8 rounded-xl border border-[#8B4542]/15 bg-white/50 px-5 py-4 sm:px-6 sm:py-5">
      <p className="font-sans text-[0.65rem] tracking-[0.3em] uppercase text-[#8B4542] mb-3">
        Previsión del tiempo · {venueName}
      </p>

      {/* Más de 16 días → cuenta atrás */}
      {days > 16 && (
        <div className="flex items-center gap-3">
          <span className="text-2xl select-none">🗓️</span>
          <div>
            <p className="font-serif text-base text-[#2A2A2A]">
              Quedan <strong>{days}</strong> días para la boda
            </p>
            <p className="font-sans font-light text-[#2A2A2A]/50 text-xs mt-0.5">
              La previsión estará disponible cuando queden 16 días o menos
            </p>
          </div>
        </div>
      )}

      {/* Dentro de la ventana de 16 días */}
      {canFetch && loading && (
        <p className="font-sans font-light text-[#2A2A2A]/40 text-sm animate-pulse py-1">
          Consultando previsión…
        </p>
      )}

      {canFetch && error && (
        <p className="font-sans font-light text-[#2A2A2A]/50 text-sm">
          No se pudo obtener la previsión. Inténtalo de nuevo más tarde.
        </p>
      )}

      {canFetch && !loading && info && forecast && (
        <div className="flex items-start gap-4">
          <span className="text-3xl leading-none select-none mt-0.5" aria-hidden="true">
            {info.icon}
          </span>
          <div className="flex-1">
            <p className="font-serif text-xl text-[#2A2A2A] leading-tight">{info.label}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5">
              <span className="font-sans font-light text-[#2A2A2A]/70 text-sm">
                <strong className="font-normal text-[#2A2A2A]">{forecast.tempMax}°</strong> máx
                &nbsp;/&nbsp;
                <strong className="font-normal text-[#2A2A2A]">{forecast.tempMin}°</strong> mín
              </span>
              <span className="font-sans font-light text-[#2A2A2A]/70 text-sm">
                💧 {forecast.precipProb}% prob. lluvia
              </span>
            </div>
            <p className="font-sans font-light text-[#2A2A2A]/35 text-[0.65rem] mt-2">
              Actualizado en tiempo real · Open-Meteo
            </p>
          </div>
        </div>
      )}

      {/* Indicador de modo prueba */}
      {testDateISO && (
        <p className="mt-3 font-sans text-[0.6rem] text-amber-500/70 border-t border-amber-200/50 pt-2">
          🧪 Modo prueba — simulando fecha: {testDateISO}
        </p>
      )}
    </div>
  );
}
