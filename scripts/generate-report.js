/**
 * Genera un HTML con pestañas para ver recomendaciones musicales y respuestas boda.
 *
 * Uso:
 *   node scripts/generate-report.js
 *   node scripts/generate-report.js [ruta-recomendaciones.json] [ruta-respuestas.json]
 *
 * Por defecto usa los JSON más recientes en scripts/export/
 * El HTML se genera en scripts/export/informe-respuestas.html
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const EXPORT_DIR = join(__dirname, "export");

function getLatestJson(prefix) {
  if (!existsSync(EXPORT_DIR)) return null;
  const files = readdirSync(EXPORT_DIR)
    .filter((f) => f.startsWith(prefix) && f.endsWith(".json"))
    .sort()
    .reverse();
  return files[0] ? join(EXPORT_DIR, files[0]) : null;
}

function loadJson(pathOrNull) {
  if (!pathOrNull || !existsSync(pathOrNull)) return [];
  const raw = readFileSync(pathOrNull, "utf-8");
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function formatDate(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function escapeHtml(s) {
  if (s == null || s === undefined) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtml(recomendaciones, respuestas) {
  const recRows = recomendaciones
    .map(
      (r) => `
    <tr>
      <td class="cell-id">${escapeHtml(r.id)}</td>
      <td>${escapeHtml(r.sugerencias ?? "")}</td>
      <td class="cell-date">${formatDate(r.createdAt)}</td>
    </tr>`
    )
    .join("");

  const respRows = respuestas.flatMap((r) => {
    const invitados = r.invitados ?? [];
    if (invitados.length === 0) {
      return `<tr>
        <td class="cell-id">${escapeHtml(r.id)}</td>
        <td>—</td>
        <td>—</td>
        <td>—</td>
        <td>—</td>
        <td class="cell-date">${formatDate(r.createdAt)}</td>
      </tr>`;
    }
    let principalActual = "";
    return invitados.map((inv, i) => {
      const esPrincipal = !inv.es_acompañante;
      if (esPrincipal) principalActual = inv.nombre ?? "";
      const alergias = Array.isArray(inv.dieta?.alergias)
        ? inv.dieta.alergias.join(", ")
        : "";
      const notas = inv.dieta?.notas_medicas ?? "";
      const confirmado = inv.confirmado ? "Sí" : "No";
      const rowClass = esPrincipal ? "row-principal" : "row-acompañante";
      const nombreCell = esPrincipal
        ? `<span class="nombre-principal">${escapeHtml(inv.nombre ?? "")}</span>`
        : `<span class="nombre-acompañante">↳ ${escapeHtml(inv.nombre ?? "")}</span><span class="acompaña-de">acompaña a ${escapeHtml(principalActual)}</span>`;
      const isFirstInGroup = esPrincipal || (i > 0 && !invitados[i - 1].es_acompañante);
      const groupClass = isFirstInGroup ? " group-start" : "";
      return `<tr class="${rowClass}${groupClass}">
        <td class="cell-id">${i === 0 ? escapeHtml(r.id) : ""}</td>
        <td class="cell-nombre">${nombreCell}</td>
        <td>${escapeHtml(confirmado)}</td>
        <td>${escapeHtml(alergias)}</td>
        <td>${escapeHtml(notas)}</td>
        <td class="cell-date">${i === 0 ? formatDate(r.createdAt) : ""}</td>
      </tr>`;
    });
  });

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Informe · Respuestas Boda</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: Georgia, 'Times New Roman', serif;
      background: #F9F8F6;
      color: #2A2A2A;
      margin: 0;
      padding: 2rem 1rem;
      line-height: 1.5;
    }
    .wrap { max-width: 900px; margin: 0 auto; }
    h1 {
      font-size: 1.5rem;
      font-weight: 400;
      letter-spacing: 0.1em;
      color: #8B4542;
      margin-bottom: 1.5rem;
      text-transform: uppercase;
    }
    .tabs {
      display: flex;
      gap: 0;
      border-bottom: 2px solid #E8E3D9;
      margin-bottom: 1.5rem;
    }
    .tab {
      padding: 0.75rem 1.25rem;
      cursor: pointer;
      background: transparent;
      border: none;
      font: inherit;
      color: #2A2A2A;
      opacity: 0.6;
      letter-spacing: 0.05em;
      transition: opacity 0.2s;
    }
    .tab:hover { opacity: 0.9; }
    .tab.active {
      opacity: 1;
      color: #8B4542;
      border-bottom: 2px solid #8B4542;
      margin-bottom: -2px;
    }
    .panel { display: none; }
    .panel.active { display: block; }
    .stats {
      font-size: 0.85rem;
      color: #2A2A2A;
      opacity: 0.7;
      margin-bottom: 1rem;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      box-shadow: 0 2px 8px rgba(139, 69, 66, 0.06);
    }
    th, td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid #E8E3D9;
    }
    th {
      font-weight: 500;
      font-size: 0.75rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #8B4542;
      background: #F9F8F6;
    }
    tr:hover td { background: #F9F8F6; }
    .cell-id { font-size: 0.7rem; color: #999; font-family: monospace; }
    .cell-date { font-size: 0.85rem; color: #666; white-space: nowrap; }
    .row-principal { background: #FDFCFB; }
    .row-principal.group-start { border-left: 3px solid #8B4542; }
    .row-acompañante { background: #F9F8F6; }
    .row-acompañante td { padding-left: 1.5rem; }
    .cell-nombre { display: flex; flex-direction: column; gap: 0.2rem; }
    .nombre-principal { font-weight: 600; color: #2A2A2A; }
    .nombre-acompañante { color: #2A2A2A; }
    .acompaña-de { font-size: 0.75rem; color: #8B4542; opacity: 0.85; font-style: italic; }
    .empty {
      text-align: center;
      padding: 3rem;
      color: #999;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Informe de respuestas</h1>

    <div class="tabs">
      <button type="button" class="tab active" data-tab="musica">Recomendaciones musicales</button>
      <button type="button" class="tab" data-tab="boda">Respuestas boda</button>
    </div>

    <div id="panel-musica" class="panel active">
      <p class="stats">${recomendaciones.length} recomendación(es)</p>
      ${
        recomendaciones.length === 0
          ? '<p class="empty">No hay recomendaciones.</p>'
          : `
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Sugerencias</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>${recRows}</tbody>
      </table>`
      }
    </div>

    <div id="panel-boda" class="panel">
      <p class="stats">${respuestas.length} respuesta(s) · ${respuestas.reduce(
        (n, r) => n + (r.invitados?.length ?? 0),
        0
      )} invitado(s)</p>
      ${
        respuestas.length === 0
          ? '<p class="empty">No hay respuestas.</p>'
          : `
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Confirmado</th>
            <th>Alergias / dieta</th>
            <th>Notas médicas</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>${respRows}</tbody>
      </table>`
      }
    </div>
  </div>

  <script>
    document.querySelectorAll('.tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('panel-' + btn.dataset.tab).classList.add('active');
      });
    });
  </script>
</body>
</html>`;
}

// ── main ──
const args = process.argv.slice(2);
const pathRec = args[0] || getLatestJson("recomendaciones_musicales");
const pathResp = args[1] || getLatestJson("respuestas_boda");

const recomendaciones = loadJson(pathRec);
const respuestas = loadJson(pathResp);

if (recomendaciones.length === 0 && respuestas.length === 0) {
  console.error(
    "❌ No se encontraron datos. Ejecuta antes: npm run export-firestore\n" +
      "   O pasa rutas: node scripts/generate-report.js [recomendaciones.json] [respuestas.json]"
  );
  process.exit(1);
}

const htmlPath = join(EXPORT_DIR, "informe-respuestas.html");
const html = buildHtml(recomendaciones, respuestas);
writeFileSync(htmlPath, html, "utf-8");

console.log(`✅ Informe generado: ${htmlPath}`);
console.log(`   Recomendaciones: ${recomendaciones.length} · Respuestas: ${respuestas.length}`);
