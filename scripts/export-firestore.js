/**
 * Exporta las colecciones recomendaciones_musicales y respuestas_boda a JSON y CSV.
 *
 * Uso:
 *   node scripts/export-firestore.js
 *
 * Requisitos:
 *   - Firebase Admin SDK: npm install firebase-admin
 *   - Cuenta de servicio: Firebase Console → Configuración del proyecto → Cuentas de servicio
 *     → Generar nueva clave privada (descarga JSON)
 *   - Variable de entorno o archivo: GOOGLE_APPLICATION_CREDENTIALS=ruta/al/archivo.json
 *     O en .env.local: GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json
 *
 * Los archivos se generan en ./scripts/export/
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "export");
const CRED_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!CRED_PATH || !existsSync(CRED_PATH)) {
  console.error(
    "❌ Define GOOGLE_APPLICATION_CREDENTIALS apuntando al JSON de la cuenta de servicio.\n" +
      "   Ejemplo: $env:GOOGLE_APPLICATION_CREDENTIALS=\"C:\\ruta\\firebase-service-account.json\"\n" +
      "   Luego: node scripts/export-firestore.js"
  );
  process.exit(1);
}

// Inicializar Firebase Admin
initializeApp({ credential: cert(CRED_PATH) });
const db = getFirestore();

/** Convierte Timestamp de Firestore a ISO string */
function serializeDoc(doc) {
  const data = doc.data();
  const out = { id: doc.id, ...data };
  for (const [k, v] of Object.entries(out)) {
    if (v && typeof v.toDate === "function") out[k] = v.toDate().toISOString();
    if (v && typeof v === "object" && !Array.isArray(v) && v !== null) {
      for (const [k2, v2] of Object.entries(v)) {
        if (v2 && typeof v2.toDate === "function")
          out[k][k2] = v2.toDate().toISOString();
      }
    }
  }
  return out;
}

/** Objeto plano a fila CSV (escapa comas y comillas) */
function objToCsvRow(obj) {
  return Object.values(obj).map((v) => {
    const s = String(v ?? "");
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  });
}

/** Array de objetos a CSV */
function toCSV(arr, headers) {
  const h = headers || (arr[0] ? Object.keys(arr[0]) : []);
  const rows = [h.join(","), ...arr.map((o) => objToCsvRow(o).join(","))];
  return rows.join("\n");
}

/** Convierte objetos anidados a filas planas para CSV (respuestas_boda) */
function flattenRespuesta(doc) {
  const { id, invitados = [], createdAt } = doc;
  const rows = [];
  for (let i = 0; i < invitados.length; i++) {
    const inv = invitados[i];
    const alergiasStr = Array.isArray(inv.dieta?.alergias)
      ? inv.dieta.alergias.join("; ")
      : "";
    rows.push({
      id,
      createdAt,
      invitado_index: i + 1,
      nombre: inv.nombre ?? "",
      confirmado: inv.confirmado ?? false,
      alergias: alergiasStr,
      notas_medicas: inv.dieta?.notas_medicas ?? "",
      es_acompañante: inv.es_acompañante ?? false,
    });
  }
  return rows;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

  // ── recomendaciones_musicales ──
  const recSnap = await db.collection("recomendaciones_musicales").get();
  const recomendaciones = recSnap.docs.map(serializeDoc);

  const recJsonPath = join(OUT_DIR, `recomendaciones_musicales_${timestamp}.json`);
  writeFileSync(recJsonPath, JSON.stringify(recomendaciones, null, 2), "utf-8");
  console.log(`✅ recomendaciones_musicales: ${recomendaciones.length} docs → ${recJsonPath}`);

  const recCsv = toCSV(
    recomendaciones.map((d) => ({
      id: d.id,
      sugerencias: d.sugerencias ?? "",
      createdAt: d.createdAt ?? "",
    }))
  );
  const recCsvPath = join(OUT_DIR, `recomendaciones_musicales_${timestamp}.csv`);
  writeFileSync(recCsvPath, recCsv, "utf-8");
  console.log(`✅ recomendaciones_musicales CSV → ${recCsvPath}`);

  // ── respuestas_boda ──
  const respSnap = await db.collection("respuestas_boda").get();
  const respuestas = respSnap.docs.map(serializeDoc);

  const respJsonPath = join(OUT_DIR, `respuestas_boda_${timestamp}.json`);
  writeFileSync(respJsonPath, JSON.stringify(respuestas, null, 2), "utf-8");
  console.log(`✅ respuestas_boda: ${respuestas.length} docs → ${respJsonPath}`);

  const rowsFlat = respuestas.flatMap(flattenRespuesta);
  const respCsv = toCSV(rowsFlat);
  const respCsvPath = join(OUT_DIR, `respuestas_boda_${timestamp}.csv`);
  writeFileSync(respCsvPath, respCsv, "utf-8");
  console.log(`✅ respuestas_boda CSV (${rowsFlat.length} filas) → ${respCsvPath}`);

  console.log("\n📁 Archivos en:", OUT_DIR);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
