/**
 * WeatherHistory — Histórico meteorológico del día de la boda.
 * Datos servidos desde src/data/weather-history.json (estáticos, sin llamadas API).
 * Gráfico SVG generado sin librerías externas.
 */
import weatherData from "../data/weather-history.json";

interface YearData {
  year: number;
  tempMax: number;
  tempMin: number;
  tempMean: number;
  precip: number;
  weatherCode: number;
}

interface Props {
  month: number;
  day: number;
  venueName: string;
  venueCity: string;
}

function weatherLabel(code: number): string {
  if (code === 0) return "Despejado";
  if (code <= 2) return "Parcialmente nublado";
  if (code === 3) return "Nublado";
  if (code <= 49) return "Niebla";
  if (code <= 59) return "Llovizna";
  if (code <= 69) return "Lluvia";
  if (code <= 79) return "Nieve";
  if (code <= 84) return "Chubascos";
  if (code <= 99) return "Tormenta";
  return "Variable";
}

function weatherIcon(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 2) return "⛅";
  if (code === 3) return "☁️";
  if (code <= 49) return "🌫️";
  if (code <= 59) return "🌦️";
  if (code <= 69) return "🌧️";
  if (code <= 79) return "❄️";
  if (code <= 84) return "🌧️";
  return "⛈️";
}

function BarChart({ data }: { data: YearData[] }) {
  const W = 560;
  const H = 160;
  const PAD = { top: 20, right: 16, bottom: 32, left: 32 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const maxTemp = Math.max(...data.map((d) => d.tempMax), 40);
  const minTemp = Math.min(...data.map((d) => d.tempMin), 10);
  const range = maxTemp - minTemp || 1;
  const barW = Math.floor(chartW / data.length) - 4;

  function yPos(val: number) {
    return PAD.top + chartH - ((val - minTemp) / range) * chartH;
  }

  const refTemps = [minTemp, Math.round((minTemp + maxTemp) / 2), maxTemp];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full max-w-2xl"
      aria-label="Gráfico de temperaturas históricas"
      role="img"
    >
      {refTemps.map((t) => (
        <g key={t}>
          <line
            x1={PAD.left} x2={W - PAD.right}
            y1={yPos(t)} y2={yPos(t)}
            stroke="#2A2A2A" strokeOpacity="0.07" strokeWidth="1"
          />
          <text
            x={PAD.left - 4} y={yPos(t) + 4}
            textAnchor="end" fontSize="9"
            fill="#2A2A2A" fillOpacity="0.4" fontFamily="sans-serif"
          >
            {t}°
          </text>
        </g>
      ))}

      {data.map((d, i) => {
        const x = PAD.left + i * (chartW / data.length) + 2;
        const yMax = yPos(d.tempMax);
        const yMin = yPos(d.tempMin);
        const hasRain = d.precip > 0.5;
        const color = hasRain ? "#7BA7BC" : "#8B4542";

        return (
          <g key={d.year}>
            <rect
              x={x} y={yMax}
              width={barW} height={Math.max(yMin - yMax, 2)}
              fill={color} fillOpacity="0.25" rx="2"
            />
            <rect
              x={x + barW * 0.25} y={yPos(d.tempMean) - 2}
              width={barW * 0.5} height="4"
              fill={color} fillOpacity="0.8" rx="1"
            />
            <text
              x={x + barW / 2} y={H - PAD.bottom + 14}
              textAnchor="middle" fontSize="9"
              fill="#2A2A2A" fillOpacity="0.5" fontFamily="sans-serif"
            >
              {d.year}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function WeatherHistory({ month, day, venueName, venueCity }: Props) {
  const data = weatherData as YearData[];
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");

  const avgMax = Math.round(data.reduce((s, d) => s + d.tempMax, 0) / data.length);
  const avgMin = Math.round(data.reduce((s, d) => s + d.tempMin, 0) / data.length);
  const rainDays = data.filter((d) => d.precip > 0.5).length;

  return (
    <div className="space-y-10">
      <div className="text-center space-y-1">
        <p className="font-sans text-[0.65rem] tracking-[0.35em] uppercase text-[#8B4542]">
          Histórico meteorológico
        </p>
        <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#2A2A2A]">
          {dd}/{mm} en {venueCity}
        </h2>
        <p className="font-sans font-light text-[#2A2A2A]/50 text-sm">
          {venueName} · últimos {data.length} años
        </p>
        <div className="w-10 h-px bg-[#8B4542] mx-auto mt-3" />
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Temp. máx. media", value: `${avgMax}°C`, icon: "🌡️" },
          { label: "Temp. mín. media", value: `${avgMin}°C`, icon: "🌙" },
          { label: "Días con lluvia",  value: `${rainDays} de ${data.length}`, icon: "💧" },
          { label: "Prob. de lluvia",  value: `${Math.round((rainDays / data.length) * 100)}%`, icon: "☂️" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[#8B4542]/15 bg-white/50 px-4 py-4 text-center"
          >
            <div className="text-2xl mb-1 select-none">{stat.icon}</div>
            <p className="font-serif text-xl text-[#2A2A2A]">{stat.value}</p>
            <p className="font-sans font-light text-[#2A2A2A]/45 text-[0.65rem] mt-0.5 leading-snug">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Gráfico */}
      <div>
        <p className="font-sans text-[0.65rem] tracking-[0.2em] uppercase text-[#2A2A2A]/40 mb-3">
          Temperatura máx / mín cada año
          <span className="ml-3 inline-flex gap-3">
            <span><span className="inline-block w-2 h-2 rounded-sm bg-[#8B4542]/50 mr-1" />Seco</span>
            <span><span className="inline-block w-2 h-2 rounded-sm bg-[#7BA7BC]/50 mr-1" />Lluvia</span>
          </span>
        </p>
        <BarChart data={data} />
      </div>

      {/* Tabla — orden descendente: años más recientes primero */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-sans font-light text-sm border-collapse">
          <thead>
            <tr className="border-b border-[#8B4542]/15">
              {["Año","Máx","Mín","Lluvia","Tiempo"].map((h) => (
                <th key={h} className="pb-2 pr-4 font-normal text-[#2A2A2A]/40 text-xs tracking-widest uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...data].reverse().map((d) => (
              <tr key={d.year} className="border-b border-[#8B4542]/08 hover:bg-white/40 transition-colors">
                <td className="py-2.5 pr-4 font-serif text-base text-[#2A2A2A]">{d.year}</td>
                <td className="py-2.5 pr-4 text-[#8B4542]">{d.tempMax}°</td>
                <td className="py-2.5 pr-4 text-[#2A2A2A]/60">{d.tempMin}°</td>
                <td className="py-2.5 pr-4 text-[#2A2A2A]/60">{d.precip > 0.5 ? `${d.precip} mm` : "—"}</td>
                <td className="py-2.5 text-[#2A2A2A]/70">
                  <span className="mr-1.5 select-none">{weatherIcon(d.weatherCode)}</span>
                  {weatherLabel(d.weatherCode)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Conclusión */}
      <p className="font-sans font-light text-[#2A2A2A]/50 text-sm text-center border-t border-[#8B4542]/10 pt-6">
        En los últimos {data.length} años, el {dd}/{mm} en {venueCity} ha tenido
        una temperatura máxima media de{" "}
        <strong className="font-normal text-[#2A2A2A]">{avgMax}°C</strong> y ha llovido
        en <strong className="font-normal text-[#2A2A2A]">{rainDays} de {data.length}</strong> ocasiones.
      </p>

      <p className="font-sans font-light text-[#2A2A2A]/25 text-[0.65rem] text-center">
        Datos históricos: Open-Meteo · ERA5 reanalysis · 2015–2024
      </p>
    </div>
  );
}
