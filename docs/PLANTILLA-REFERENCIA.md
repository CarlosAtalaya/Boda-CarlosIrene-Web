# Síntesis: Contexto del Repositorio + Plantilla de Referencia

> Documento de referencia para integrar el estilo de la plantilla Gemini (Canva) en la estructura técnica del repositorio Boda-Web, sin volcar código ni romper la arquitectura existente.

---

## 1. Contexto del Repositorio (.cursorrules)

### Stack técnico (estricto)
- **Astro 5.x** (SSG), **TypeScript** estricto, **Tailwind v4** (`@theme` en `global.css`)
- **React** solo para islas interactivas (`client:load`): RSVPForm, WhatsAppButton, AddToCalendarButton
- **Firebase 11** (Firestore + Hosting), **Zod** para validación
- **Lucide-react** para iconos; sin estado global

### Arquitectura canónica
```
src/components/wedding/  → HeroSection, ProgramaSection, UbicacionSection, RSVPSection, FooterSection (.astro)
src/components/forms/    → RSVPForm.tsx (multi-paso, Zod, Firestore)
src/lib/event-config.ts → ÚNICA fuente de verdad (nunca hardcodear)
```

### Sistema de diseño (implementado)
| Token      | Hex       | Uso                    |
|------------|-----------|------------------------|
| Crema      | `#F9F7F2` | Fondo global           |
| Oro Mate   | `#C5A059` | Acentos, CTA, bordes   |
| Oro Claro  | `#E8D4A8` | Hover                  |
| Oro Oscuro | `#9A7A3A` | Degradados             |
| Carbono    | `#1A1A1A` | Texto                  |
| Verde WA   | `#25D366` | Solo botón WhatsApp    |

- **Tipografía**: Cormorant Garamond (serif) + Inter (sans)
- **Variables CSS**: `--text-display`, `--text-heading-xl`, etc. (tipografía fluida)
- **Logo**: `/public/branding-logo.png` — debe aparecer de forma sutil en secciones clave

### Despliegue
- `firebase deploy` — sin pasos extra
- Firebase Hosting compatible con free tier de Google Cloud

---

## 2. Síntesis de la Plantilla Gemini (plantilla-ejemplo-canvas)

### Lo que aporta la plantilla (referencia visual)
| Elemento        | Descripción                                                                 |
|-----------------|-----------------------------------------------------------------------------|
| **Nav fija**    | Minimalista, altura ~24 (h-24), backdrop-blur, borde sutil, enlaces uppercase tracking |
| **Hero**        | Tipográfico, "Save the Date" como eyebrow, nombres grandes + "&" en cursiva, línea vertical, fecha + lugar, CTA "Confirmar Asistencia", scroll indicator |
| **Decoración**  | Paper texture (SVG noise), orbes blur suaves (mix-blend-multiply)           |
| **Programa**    | Timeline vertical con iconos (Heart, GlassWater, Utensils, Music), línea conectora, alternancia izq/der |
| **Ubicación**   | Grid 2 cols, texto + iconos (Calendar, Clock, MapPin), placeholder mapa con bordes decorativos |
| **RSVP**        | Formulario simple (no multi-paso) — **no usar**, el repo tiene RSVPForm.tsx completo |
| **Footer**      | Fondo oscuro (#2A2A2A), monograma, "¡Nos vemos pronto!"                     |

### Paleta de la plantilla (solo referencia)
- Crema: `#F9F8F6` (≈ repo `#F9F7F2`)
- Burdeos: `#8B4542` (plantilla) — **repo usa oro #C5A059** (mantener)
- Texto: `#2A2A2A` (≈ repo `#1A1A1A`)
- Acento suave: `#D9C5C5` (rosado empolvado) — opcional para variaciones

### Lo que NO tiene la plantilla (y el repo sí)
- Logo de branding integrado
- `event-config.ts` como fuente de verdad
- RSVP multi-paso con Zod + Firestore
- AddToCalendarButton, WhatsAppButton
- Scroll-driven animations (CSS nativo)
- Grain overlay, clases `.divider-gold`, `.logo-ambient`

---

## 3. Mapeo: Plantilla → Repositorio

### Adaptar (inspiración, no copia)
| De la plantilla        | Aplicar en repo                                      |
|------------------------|------------------------------------------------------|
| Nav fija minimalista   | Crear `Navbar.astro` con logo + enlaces, backdrop-blur |
| Hero tipográfico       | Refinar `HeroSection.astro`: eyebrow "Save the Date", CTA "Confirmar Asistencia" |
| Paper texture / orbes  | Opcional: añadir en hero (ya hay círculos dorados)   |
| Timeline del programa  | `ProgramaSection.astro` ya existe — revisar estilo timeline |
| Footer oscuro          | `FooterSection.astro` — fondo carbono, monograma     |

### Adoptado (paleta plantilla)
- **Crema**: `#F9F8F6` (fondo principal), `#F3EFEA` (secciones alternas)
- **Burdeos**: `#8B4542` (acento principal, bordes, CTA)
- **Texto**: `#2A2A2A` (gris carbón)
- **Rosado empolvado**: `#D9C5C5` (bordes sutiles, orbes decorativos)
- **Borde**: `#E8E3D9` (nav, formularios)

### Mantener (no tocar)
- Cormorant Garamond + Inter
- `event-config.ts`, `rsvp-schema.ts`, `firebase.ts`
- RSVPForm.tsx (multi-paso, Zod, Firestore)
- LocationSection / UbicacionSection con Google Maps
- WhatsAppButton, AddToCalendarButton

### Integrar (obligatorio)
- **Logo** en nav y hero (plantilla usa monograma "C & I" — repo debe usar `branding-logo.png`)

---

## 4. Checklist para primera versión estable

- [ ] **Navbar**: fija, con logo, enlaces a #hero, #programa, #ubicacion, #rsvp, menú móvil
- [ ] **Hero**: logo + nombres + fecha + CTA "Confirmar Asistencia" (href="#rsvp")
- [ ] **Programa**: timeline con datos de `event-config.programa`
- [ ] **Ubicación**: lugar, mapa, AddToCalendar
- [ ] **RSVP**: RSVPForm con client:load
- [ ] **Footer**: oscuro, logo/monograma, WhatsApp
- [ ] **Layout**: grain overlay, meta tags, fuentes
- [ ] **index.astro**: orquestar todas las secciones (HeroSection, ProgramaSection, etc.)
- [ ] **Validación**: `event-config` como única fuente, sin hardcodeo
- [ ] **Despliegue**: `firebase deploy` sin errores

---

## 5. Resumen ejecutivo

**Objetivo**: Primera versión funcional y estable para desplegar en Google Cloud (Firebase Hosting free tier).

**Estrategia**: Usar la plantilla como **referencia visual** (cabecera, estilo, estructura de secciones) sin volcar su código. Mantener la arquitectura Astro, el sistema de diseño oro, el logo, y la calidad técnica del repositorio.

**Próximo paso**: Implementar Navbar inspirada en plantilla + asegurar que `index.astro` use todos los componentes `wedding/` con el flujo correcto.
