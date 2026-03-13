/**
 * URLs de imágenes de la pareja.
 * Lee desde public/fotos-nuestras/ — prioriza WebP, fallback a jpg/jpeg/png.
 * Orden numérico (01, 02, …). Mismo patrón que venue-images.ts.
 */
import fs from "node:fs";
import path from "node:path";

const PHOTOS_DIR = path.join(process.cwd(), "public/fotos-nuestras");

/** Obtiene URLs de imágenes de la pareja ordenadas numéricamente. */
export function getCoupleImageUrls(): string[] {
  try {
    const files = fs.readdirSync(PHOTOS_DIR);
    const images = files.filter((f) =>
      [".webp", ".jpg", ".jpeg", ".png"].includes(path.extname(f).toLowerCase())
    );
    return images
      .sort((a, b) => {
        const na = parseInt(path.basename(a).replace(/\D/g, ""), 10) || 0;
        const nb = parseInt(path.basename(b).replace(/\D/g, ""), 10) || 0;
        return na - nb || a.localeCompare(b);
      })
      .map((f) => `/fotos-nuestras/${f}`);
  } catch {
    return [];
  }
}
