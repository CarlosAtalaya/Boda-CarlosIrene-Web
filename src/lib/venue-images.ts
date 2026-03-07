/**
 * URLs de imágenes del lugar (Laberinto del Rey).
 * Lee desde public/fotos-restaurante/urls-imagenes.txt (URLs de Google Maps)
 * o usa imágenes locales en public/fotos-restaurante/*.jpg si existen.
 */
import fs from "node:fs";
import path from "node:path";

const TXT_PATH = path.join(process.cwd(), "public/fotos-restaurante/urls-imagenes.txt");
const PHOTOS_DIR = path.join(process.cwd(), "public/fotos-restaurante");

/** Extrae el ID de foto de Google de una URL de Maps */
function extractGooglePhotoId(url: string): string | null {
  const match = url.match(/1s([A-Za-z0-9_-]+)!/);
  return match ? match[1] : null;
}

/** Construye URL directa de imagen de Google (tamaño 800px ancho) */
function buildGoogleImageUrl(photoId: string): string {
  return `https://lh3.googleusercontent.com/p/${photoId}=w800-h600`;
}

/** Obtiene URLs de imágenes: prioriza locales, fallback a Google */
export function getVenueImageUrls(): string[] {
  const localImages: string[] = [];
  try {
    const files = fs.readdirSync(PHOTOS_DIR);
    for (const f of files) {
      const ext = path.extname(f).toLowerCase();
      if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
        localImages.push(`/fotos-restaurante/${f}`);
      }
    }
  } catch {
    // Directorio no existe o no readable
  }

  if (localImages.length > 0) {
    return localImages.sort();
  }

  // Fallback: extraer de urls-imagenes.txt
  try {
    const content = fs.readFileSync(TXT_PATH, "utf-8");
    const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
    const seen = new Set<string>();
    const urls: string[] = [];
    for (const line of lines) {
      const id = extractGooglePhotoId(line);
      if (id && !seen.has(id)) {
        seen.add(id);
        urls.push(buildGoogleImageUrl(id));
      }
    }
    return urls;
  } catch {
    return [];
  }
}
