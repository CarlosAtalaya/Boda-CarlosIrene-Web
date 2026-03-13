# Tareas de nuevas funcionalidades — Boda Carlos & Irene

> Documento de referencia técnica para agente IA.
> Generado el 13/03/2026. Stack: Astro 5 + React 19 + TypeScript strict + Tailwind CSS v4 + Firebase 11 + Firestore.
> Consultar `.cursorrules` para reglas de implementación obligatorias del proyecto.

---

## Contexto del proyecto

### Orden actual de secciones en `src/pages/index.astro`

```
HeroSection → ProgramaSection → UbicacionSection → RSVPSection → MusicaSection → HotelesSection → FooterSection
```

### Sistema de diseño (paleta y tipografía)

| Token | Hex | Uso |
|---|---|---|
| Crema / Fondo | `#F9F8F6` | Background global, inputs |
| Crema alt | `#F3EFEA` | Secciones alternas, footer |
| Burdeos | `#8B4542` | Acentos, bordes, iconos, CTA |
| Rosado empolvado | `#D9C5C5` | Bordes suaves, acentos secundarios |
| Texto | `#2A2A2A` | Texto principal |

- Fuente serif: **Cormorant Garamond** (títulos, eyebrows)
- Fuente sans: **Inter** (body, UI, botones)
- Clases de animación disponibles: `.reveal-up`, `.reveal-fade`, `.reveal-line` (scroll-driven, sin JS)
- Clases de botón: `.btn-primary`
- Clases de input: `.input-editorial`

### Regla de oro de componentes

- Si un componente **no necesita `useState` ni event listeners** → archivo `.astro`
- Si necesita interactividad → archivo `.tsx` montado desde un wrapper `.astro` con `client:load`
- Solo Lucide-react para iconos
- TypeScript strict, prohibido `any`
- Mobile-first obligatorio

---

## TAREA 1 — Tira de fotos de la pareja (`PhotoStrip`)

### Objetivo

Añadir una galería discreta y elegante con las fotos de la pareja, que aporte calidez personal sin romper el estilo editorial. Posicionada entre `HeroSection` y `ProgramaSection`.

### Imágenes disponibles

Ubicadas en `public/fotos-nuestras/`:

```
IMG-20260312-WA0004.jpg  (147 KB)
IMG-20260312-WA0005.jpg  (202 KB)
IMG-20260312-WA0006.jpg  (220 KB)
IMG-20260312-WA0007.jpg  (361 KB)
IMG-20260312-WA0008.jpg  (127 KB)
```

No se deben renombrar; leerlas directamente con sus nombres actuales o crear una utilidad similar a `venue-images.ts`.

### Archivos a crear

#### `src/lib/couple-images.ts` (nuevo, patrón idéntico a `venue-images.ts`)

Función `getCoupleImageUrls(): string[]` que:
- Lee el directorio `public/fotos-nuestras/` con `fs.readdirSync`
- Filtra extensiones `.jpg`, `.jpeg`, `.webp`, `.png`
- Ordena alfabéticamente (o numéricamente por el sufijo)
- Devuelve rutas relativas tipo `/fotos-nuestras/IMG-20260312-WA0004.jpg`
- Si el directorio no existe o está vacío devuelve `[]`

#### `src/components/wedding/PhotoStrip.astro` (nuevo, componente estático)

Componente Astro (sin JS en cliente). Recibe `images: string[]` desde `index.astro`.

**Si `images.length === 0`**: no renderiza nada (sección invisible).

**Diseño (móvil-primero)**:

```
[Sección sin id de ancla, no aparece en Navbar]

Estructura HTML:
<section class="py-0 overflow-hidden bg-[#F9F8F6]">
  <!-- Tira horizontal deslizable -->
  <div class="flex gap-1 sm:gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-none px-4 sm:px-0">
    <!-- Por cada imagen: -->
    <div class="snap-center flex-shrink-0 w-[72vw] sm:w-[28vw] max-w-[340px]">
      <div class="aspect-[3/4] overflow-hidden">
        <img src={img} alt="Irene y Carlos" class="w-full h-full object-cover reveal-fade" loading="lazy" />
      </div>
    </div>
  </div>
</section>
```

**Especificaciones de estilo**:
- Sin título ni texto (la sección habla por sí sola)
- Fondo `#F9F8F6` (igual que el Hero para fusión visual suave)
- `padding-top: 0` y `padding-bottom: clamp(2rem, 4vw, 4rem)` para que quede adosado al Hero
- Fotos recortadas `aspect-[3/4]` con `object-cover object-center`
- En móvil: tira horizontal con `overflow-x-auto snap-x snap-mandatory`, cada foto ocupa `~72vw`
- En escritorio (`sm:`): 3 fotos visibles simultáneamente, `~28vw` cada una, sin scroll (si hay 5 imágenes, mostrar solo las 3 primeras en escritorio o hacer el contenedor más ancho)
- Animación: `reveal-fade` en cada `<img>` con `animation-delay` escalonado (0ms, 100ms, 200ms, 300ms, 400ms) usando inline style `style="animation-delay: {i * 100}ms"`
- Sin bordes, sin sombras, minimalista
- Thin separator abajo: `<div class="w-12 h-px bg-[#8B4542] opacity-30 mx-auto mt-6 mb-2" />`

**Accesibilidad**:
- `role="region"` con `aria-label="Fotos de Irene y Carlos"`
- Las imágenes tienen `alt="Irene y Carlos"` (genérico, discreto)

#### Modificar `src/pages/index.astro`

```astro
// Añadir imports:
import { getCoupleImageUrls } from '../lib/couple-images';
import PhotoStrip from '../components/wedding/PhotoStrip.astro';

// En el frontmatter:
const coupleImages = getCoupleImageUrls();

// En el template, entre HeroSection y ProgramaSection:
<HeroSection />
<PhotoStrip images={coupleImages} />  <!-- NUEVO -->
<ProgramaSection />
```

#### Modificar `.cursorrules` (sección arquitectura)

Añadir `PhotoStrip.astro` al árbol de ficheros en `src/components/wedding/`.

### Consideraciones técnicas

- `getCoupleImageUrls()` se ejecuta en build-time (Astro SSG), no en cliente
- No añadir dependencias nuevas; usar `node:fs` y `node:path` como en `venue-images.ts`
- No crear página ni ancla de Navbar para esta sección
- Si se quieren añadir más fotos en el futuro, solo hay que dejarlas en `public/fotos-nuestras/`

---

## TAREA 2 — Sección de regalo / número de cuenta (`RegalosSection`)

### Objetivo

Añadir una sección nueva con el IBAN de los novios para que los invitados puedan hacer una transferencia como regalo. Tono discreto y cálido, con botón de copiar al portapapeles.

### Posición en el orden de secciones

Entre `RSVPSection` y `MusicaSection`:

```
HeroSection → ProgramaSection → UbicacionSection → RSVPSection → RegalosSection [NUEVO] → MusicaSection → HotelesSection → FooterSection
```

### Datos pendientes de confirmar con el usuario

- **IBAN**: a rellenar (placeholder: `ES00 0000 0000 0000 0000 0000`)
- **Nombre del titular**: a rellenar (ej. `Carlos García e Irene López`)
- **Nombre del banco** (opcional): a rellenar (ej. `Banco Santander`)
- **Destino del regalo** (opcional, para el texto): ej. `luna de miel`, `nuevo hogar`, `nueva vida juntos`

Estos datos **deben añadirse a `src/lib/event-config.ts`** siguiendo la regla de fuente única de verdad. Nunca hardcodear en el componente.

### Modificar `src/lib/event-config.ts`

Añadir el campo `regalos` al objeto `EVENT_CONFIG`:

```typescript
regalos: {
  iban: "ES00 0000 0000 0000 0000 0000",       // PENDIENTE DE CONFIRMAR
  titular: "Carlos García e Irene López",        // PENDIENTE DE CONFIRMAR
  banco: "Banco Santander",                      // PENDIENTE DE CONFIRMAR (puede dejarse "" para ocultar)
  destino: "nuestra luna de miel y nuevo hogar", // PENDIENTE DE CONFIRMAR
},
```

### Archivos a crear

#### `src/components/wedding/RegalosSection.astro` (nuevo, wrapper estático)

```astro
---
import { EVENT_CONFIG } from '../../lib/event-config';
import CopyIBANButton from './CopyIBANButton.tsx';

const { iban, titular, banco, destino } = EVENT_CONFIG.regalos;
---

<section id="regalos" class="py-16 sm:py-20 px-4 sm:px-6 bg-[#F9F8F6]">
  <div class="mx-auto max-w-xl">

    <!-- Eyebrow -->
    <div class="text-center mb-8">
      <p class="font-sans text-[0.7rem] sm:text-xs tracking-[0.35em] uppercase text-[#8B4542] mb-3 reveal-fade">
        El mejor regalo
      </p>
      <h2 class="font-serif text-2xl sm:text-3xl font-light text-[#2A2A2A] mb-2 reveal-up">
        Vuestra presencia es el mayor de los regalos
      </h2>
      <div class="w-12 h-px bg-[#8B4542] mx-auto mb-4 reveal-line" />
      <p class="font-sans font-light text-[#2A2A2A]/60 text-sm sm:text-base reveal-fade">
        Si además queréis contribuir a {destino}, con mucho cariño os dejamos nuestros datos:
      </p>
    </div>

    <!-- Tarjeta IBAN -->
    <CopyIBANButton iban={iban} titular={titular} banco={banco} client:load />

  </div>
</section>
```

#### `src/components/wedding/CopyIBANButton.tsx` (nuevo, React island)

Este es el único componente React, solo para la interacción de copiar. Recibe `iban`, `titular`, `banco` como props.

**Estado interno**: `copied: boolean` (controla el feedback visual del botón)

**Comportamiento del botón Copiar**:
1. Al hacer clic: `navigator.clipboard.writeText(iban)` → `setCopied(true)` → `setTimeout(() => setCopied(false), 2500)`
2. Estado `copied=true`: el icono cambia de `Copy` a `Check`, el texto cambia a "¡Copiado!"
3. Sin librerías externas; solo Lucide `Copy` y `Check`

**Diseño de la tarjeta**:

```tsx
<div class="rounded-xl border border-[#8B4542]/20 bg-white/60 px-6 py-6 text-center space-y-4">
  
  {/* IBAN — fuente serif grande */}
  <p class="font-serif text-xl sm:text-2xl font-light tracking-wider text-[#2A2A2A] select-all">
    {iban}
  </p>

  {/* Titular */}
  <p class="font-sans text-sm font-light text-[#2A2A2A]/60">
    {titular}
    {banco && <span> · {banco}</span>}
  </p>

  {/* Botón copiar */}
  <button
    onClick={handleCopy}
    className="btn-primary inline-flex items-center gap-2 rounded-lg border border-[#8B4542]/30 px-5 py-2.5 font-sans text-sm font-light text-[#8B4542] hover:bg-[#8B4542] hover:text-white transition-all duration-300"
  >
    {copied ? <Check size={14} /> : <Copy size={14} />}
    {copied ? "¡Copiado!" : "Copiar IBAN"}
  </button>

</div>
```

**Accesibilidad**:
- `aria-label` en el botón: `"Copiar número de cuenta IBAN al portapapeles"`
- `aria-live="polite"` en el texto del botón para anunciar el cambio a lectores de pantalla

#### Modificar `src/pages/index.astro`

```astro
import RegalosSection from '../components/wedding/RegalosSection.astro';

// En el template:
<RSVPSection />
<RegalosSection />  <!-- NUEVO -->
<MusicaSection />
```

#### Añadir al Navbar en `src/components/Navbar.tsx`

Añadir el enlace de navegación `"Regalos"` apuntando a `#regalos` en la lista de anclas del Navbar, respetando el orden visual de las secciones.

#### Modificar `.cursorrules`

Actualizar:
1. Árbol de ficheros: añadir `RegalosSection.astro` y `CopyIBANButton.tsx`
2. Orden de secciones: incluir `RegalosSection` entre RSVP y Música
3. `event-config.ts`: documentar el campo `regalos`

### Consideraciones técnicas

- `CopyIBANButton.tsx` es un React island mínimo. Su único propósito es el `onClick` de copiar.
- El IBAN usa `select-all` de Tailwind para que también se pueda seleccionar con un clic en móvil
- Si `banco` está vacío (`""`), el nombre del banco no se renderiza (renderizado condicional)
- Fallback si `navigator.clipboard` no está disponible (contexto no seguro): mostrar un `alert()` con el IBAN, o simplemente ignorar el error con try/catch

---

## TAREA 3 — Integración Spotify en sección de música

### Objetivo

Mejorar la sección de música añadiendo dos elementos complementarios al formulario de texto libre existente:
1. **Buscador de canciones** con resultados reales de Spotify (portada, artista, título)
2. **Embed de la playlist de la boda** para que los invitados puedan escucharla directamente

El formulario de texto libre actual (`MusicaSection.tsx`) **se mantiene** como fallback para invitados sin Spotify.

### Decisión de arquitectura: sin OAuth de usuario

La opción elegida es **Client Credentials Flow** (sin login del invitado):
- Se usa el token de aplicación de Spotify (no del usuario)
- La búsqueda de canciones funciona sin que el invitado se autentique
- Las sugerencias con metadatos de Spotify se guardan en Firestore igual que antes
- Los novios añaden manualmente a la playlist las canciones sugeridas (proceso curado)
- **No se requiere backend adicional** — el token se obtiene desde el cliente con `client_credentials`

> ⚠️ Limitación conocida: el Client Credentials token se expira cada 60 minutos. La solución recomendada es refrescarlo automáticamente desde el cliente antes de cada búsqueda, ya que las credenciales son `PUBLIC_` y están expuestas al cliente igualmente. Para uso en producción con más seguridad, considerar una Firebase Function como proxy.

### Variables de entorno nuevas (añadir a `.env` y `.env.example`)

```env
# Spotify — Registrar app en https://developer.spotify.com/dashboard
# Usar "Client Credentials Flow" (sin login de usuario)
PUBLIC_SPOTIFY_CLIENT_ID=
PUBLIC_SPOTIFY_CLIENT_SECRET=
# ID de la playlist pública de la boda (extraer de la URL de Spotify)
PUBLIC_SPOTIFY_PLAYLIST_ID=
```

Actualizar también `src/env.d.ts` para tipar las nuevas variables:

```typescript
interface ImportMetaEnv {
  // ...existentes...
  readonly PUBLIC_SPOTIFY_CLIENT_ID: string;
  readonly PUBLIC_SPOTIFY_CLIENT_SECRET: string;
  readonly PUBLIC_SPOTIFY_PLAYLIST_ID: string;
}
```

### Setup previo (manual, por el usuario)

1. Crear cuenta en [Spotify for Developers](https://developer.spotify.com/dashboard)
2. Crear nueva App → obtener `Client ID` y `Client Secret`
3. En la app de Spotify, crear una playlist pública "Boda Carlos & Irene" → copiar su ID de la URL
4. Añadir `http://localhost:4321` como Redirect URI en la configuración de la app (aunque no se use OAuth, es requisito)
5. Rellenar las tres variables en `.env`

### Archivos a crear

#### `src/lib/spotify.ts` (nuevo)

Módulo de utilidades para la API de Spotify. Solo se ejecuta en cliente.

```typescript
const CLIENT_ID = import.meta.env.PUBLIC_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.PUBLIC_SPOTIFY_CLIENT_SECRET;

/** Obtiene un access token usando Client Credentials Flow */
export async function getSpotifyToken(): Promise<string> {
  const credentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error("Spotify auth failed");
  const data = await res.json();
  return data.access_token as string;
}

export interface SpotifyTrack {
  id: string;
  uri: string;
  name: string;
  artists: string;   // "Artista 1, Artista 2"
  albumName: string;
  coverUrl: string;  // imagen 64x64
  previewUrl: string | null;
}

/** Busca canciones por query libre. Devuelve máx. 6 resultados. */
export async function searchTracks(query: string, token: string): Promise<SpotifyTrack[]> {
  const params = new URLSearchParams({ q: query, type: "track", limit: "6", market: "ES" });
  const res = await fetch(`https://api.spotify.com/v1/search?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Spotify search failed");
  const data = await res.json();
  return (data.tracks.items as SpotifyTrackRaw[]).map((item) => ({
    id: item.id,
    uri: item.uri,
    name: item.name,
    artists: item.artists.map((a) => a.name).join(", "),
    albumName: item.album.name,
    coverUrl: item.album.images.find((img) => img.width <= 100)?.url ?? item.album.images.at(-1)?.url ?? "",
    previewUrl: item.preview_url,
  }));
}

// Tipos internos para el mapeo (no exportados)
interface SpotifyTrackRaw { /* ... */ }
```

#### `src/components/wedding/MusicaSection.tsx` (MODIFICAR el existente)

Añadir dos nuevos modos al componente existente. La lógica actual del formulario de texto libre se conserva intacta.

**Nuevo estado**:
```typescript
type Tab = "buscar" | "sugerir";
const [activeTab, setActiveTab] = useState<Tab>("buscar");
const [searchQuery, setSearchQuery] = useState("");
const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
const [searching, setSearching] = useState(false);
const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
```

**Nueva función**: `handleSearch` — debounced (300ms) que llama a `getSpotifyToken()` + `searchTracks()`.

**Nueva función**: `handleSelectTrack(track: SpotifyTrack)` — guarda en Firestore con metadatos enriquecidos:
```typescript
await addDoc(collection(db, "recomendaciones_musicales"), {
  sugerencias: `${track.name} — ${track.artists}`,
  spotifyUri: track.uri,
  spotifyTrackId: track.id,
  albumName: track.albumName,
  coverUrl: track.coverUrl,
  createdAt: new Date().toISOString(),
  source: "spotify_search",
});
```

**Nueva función**: `isMockModeSpotify(): boolean` — devuelve `true` si `PUBLIC_SPOTIFY_CLIENT_ID` está vacío.

**Diseño del buscador (dentro del tab "Buscar en Spotify")**:

```
┌─────────────────────────────────────────────┐
│ 🔍 [input] Busca una canción o artista…      │
└─────────────────────────────────────────────┘

Resultados (grid 2 columnas en sm, 1 en xs):
┌──────┬──────────────────────┐
│ [img]│ Nombre canción       │
│ 64px │ Artistas · Álbum     │
│      │           [Sugerir ✓]│
└──────┴──────────────────────┘
```

Cada resultado es una tarjeta: `border border-[#8B4542]/20 bg-white/60 rounded-xl p-3 flex gap-3`.
La imagen de portada es `48px × 48px` con `rounded`.
Botón "Sugerir esta canción" lanza `handleSelectTrack(track)`.

**Tabs de navegación** (encima del buscador/formulario):

```
[ Buscar en Spotify | Sugerir por texto ]
```

Estilo: dos botones `font-sans text-sm` con borde inferior activo en burdeos. El tab activo tiene `border-b-2 border-[#8B4542] text-[#8B4542]`, el inactivo tiene `text-[#2A2A2A]/40`.

**Condición de renderizado del buscador**: si `isMockModeSpotify()` devuelve `true`, el tab "Buscar en Spotify" muestra un mensaje: *"El buscador de Spotify no está configurado. Usa la opción de texto libre."*

#### `src/components/wedding/MusicaSection.astro` (MODIFICAR el wrapper)

Añadir, **debajo** del React island `MusicaSection.tsx`, el embed de Spotify:

```astro
---
import { EVENT_CONFIG } from '../../lib/event-config';
const playlistId = import.meta.env.PUBLIC_SPOTIFY_PLAYLIST_ID;
---

<!-- React island existente -->
<MusicaSectionIsland client:load />

<!-- Embed Spotify (solo si hay playlist configurada) -->
{playlistId && (
  <div class="mx-auto max-w-xl px-4 pb-12 sm:pb-16">
    <p class="font-sans text-[0.7rem] tracking-[0.35em] uppercase text-[#8B4542] text-center mb-4">
      Nuestra playlist
    </p>
    <iframe
      src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`}
      width="100%"
      height="352"
      frameBorder="0"
      allowFullScreen
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      class="rounded-xl"
      title="Playlist de la boda de Irene y Carlos"
    />
  </div>
)}
```

El parámetro `theme=0` fuerza el tema claro del embed de Spotify.

#### Modificar `src/middleware.ts` (Content Security Policy)

El embed de Spotify requiere añadir dominios a la CSP:

```
frame-src: 'self' https://open.spotify.com
connect-src: añadir https://api.spotify.com https://accounts.spotify.com
img-src: añadir https://i.scdn.co (portadas de álbumes)
```

Verificar que el middleware actual tiene estos dominios; si no, añadirlos.

#### Modificar `.cursorrules`

Actualizar:
1. Árbol de ficheros: añadir `src/lib/spotify.ts`
2. Sección de integraciones externas: documentar Spotify Client Credentials
3. Variables de entorno: documentar las tres nuevas variables `PUBLIC_SPOTIFY_*`

### Estructura de datos en Firestore

Las recomendaciones enviadas desde el buscador quedan en `recomendaciones_musicales` con estos campos adicionales (retrocompatible con el esquema existente):

```typescript
{
  sugerencias: string,         // "Nombre canción — Artistas" (texto legible)
  spotifyUri?: string,         // "spotify:track:4iV5W9uYEdYUVa79Axb7Rh"
  spotifyTrackId?: string,     // "4iV5W9uYEdYUVa79Axb7Rh"
  albumName?: string,
  coverUrl?: string,
  createdAt: string,           // ISO 8601
  source?: "spotify_search" | "text_form",  // para distinguir origen
}
```

Los campos con `?` son opcionales. Los documentos del formulario de texto libre antiguo siguen siendo válidos (no tienen `source`, se tratan como texto libre).

---

## Resumen de cambios por archivo

| Archivo | Acción | Tarea |
|---|---|---|
| `src/lib/couple-images.ts` | CREAR | 1 |
| `src/components/wedding/PhotoStrip.astro` | CREAR | 1 |
| `src/lib/event-config.ts` | MODIFICAR — añadir `regalos` | 2 |
| `src/components/wedding/RegalosSection.astro` | CREAR | 2 |
| `src/components/wedding/CopyIBANButton.tsx` | CREAR | 2 |
| `src/lib/spotify.ts` | CREAR | 3 |
| `src/components/wedding/MusicaSection.tsx` | MODIFICAR — añadir buscador y tabs | 3 |
| `src/components/wedding/MusicaSection.astro` | MODIFICAR — añadir embed playlist | 3 |
| `src/pages/index.astro` | MODIFICAR — insertar PhotoStrip y RegalosSection | 1, 2 |
| `src/components/Navbar.tsx` | MODIFICAR — añadir enlace "Regalos" → `#regalos` | 2 |
| `src/middleware.ts` | MODIFICAR — ampliar CSP para Spotify | 3 |
| `.env` y `.env.example` | MODIFICAR — añadir variables Spotify | 3 |
| `src/env.d.ts` | MODIFICAR — tipar variables Spotify | 3 |
| `.cursorrules` | MODIFICAR — actualizar árbol y documentación | 1, 2, 3 |

---

## Orden de implementación recomendado

1. **Tarea 1** (PhotoStrip) — Sin dependencias externas. Solo lectura de archivos locales y CSS. Riesgo bajo.
2. **Tarea 2** (RegalosSection) — Requiere confirmar IBAN y titular con el usuario antes de editar `event-config.ts`.
3. **Tarea 3** (Spotify) — Requiere que el usuario cree la app en Spotify Dashboard y proporcione las credenciales. Implementar primero el embed (solo `PUBLIC_SPOTIFY_PLAYLIST_ID`) y luego el buscador.

---

## Preguntas pendientes de respuesta del usuario

| # | Pregunta | Bloquea |
|---|---|---|
| 1 | ¿Cuál es el IBAN? | Tarea 2 (no se puede completar sin él) |
| 2 | ¿Nombre del titular de la cuenta? | Tarea 2 |
| 3 | ¿Nombre del banco? (opcional, puede omitirse) | Tarea 2 |
| 4 | ¿Texto del destino del regalo? (ej. "luna de miel") | Tarea 2 |
| 5 | ¿Tenéis ya una playlist de Spotify para la boda? ¿O hay que crearla? | Tarea 3 |
| 6 | ¿Queréis el buscador de Spotify o solo el embed de la playlist? | Tarea 3 |
