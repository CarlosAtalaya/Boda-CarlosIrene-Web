/**
 * URLs de imágenes del lugar (Quinta Monteguerra).
 * Lee las fotografías locales en public/fotos-quinta-monteguerra/*.{webp,jpg,jpeg,png}
 * con fallback a las 10 imágenes seleccionadas de Quinta Monteguerra.
 */
import fs from "node:fs";
import path from "node:path";

const PHOTOS_DIR = path.join(process.cwd(), "public/fotos-quinta-monteguerra");

const FALLBACK_QUINTA_URLS = [
  "http://quintamonteguerra.com/wp-content/uploads/2015/09/gallery-big-01.jpg",
  "http://quintamonteguerra.com/wp-content/uploads/2015/09/gallery-big-02.jpg",
  "http://quintamonteguerra.com/wp-content/uploads/2015/09/gallery-big-05.jpg",
  "http://quintamonteguerra.com/wp-content/uploads/2015/08/gallery-big-08.jpg",
  "http://quintamonteguerra.com/wp-content/uploads/2015/09/gallery-big-06.jpg",
  "http://quintamonteguerra.com/wp-content/uploads/2015/08/gallery-big-15.jpg",
  "http://quintamonteguerra.com/wp-content/uploads/2015/08/gallery-big-18.jpg",
  "http://quintamonteguerra.com/wp-content/uploads/2015/08/gallery-big-17.jpg",
  "http://quintamonteguerra.com/wp-content/uploads/2015/08/gallery-big-19.jpg",
  "http://quintamonteguerra.com/wp-content/uploads/2015/10/gallery-big-28.jpg",
];

/** Obtiene URLs de imágenes: prioriza locales en /fotos-quinta-monteguerra, ordenadas numéricamente (01, 02, …) */
export function getVenueImageUrls(): string[] {
  const localImages: string[] = [];
  try {
    const files = fs.readdirSync(PHOTOS_DIR);
    for (const f of files) {
      const ext = path.extname(f).toLowerCase();
      if ([".webp", ".jpg", ".jpeg", ".png"].includes(ext)) {
        localImages.push(`/fotos-quinta-monteguerra/${f}`);
      }
    }
  } catch {
    // Directorio no existe o no readable
  }

  if (localImages.length > 0) {
    return localImages.sort((a, b) => {
      const na = parseInt(path.basename(a).replace(/\D/g, ""), 10) || 0;
      const nb = parseInt(path.basename(b).replace(/\D/g, ""), 10) || 0;
      return na - nb || a.localeCompare(b);
    });
  }

  return FALLBACK_QUINTA_URLS;
}
