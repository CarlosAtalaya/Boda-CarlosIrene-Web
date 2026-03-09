# Web de Boda — Irene & Carlos

Web de boda de alta distinción y protocolo en España. Estilo editorial, paleta burdeos/crema. Desplegada en Firebase Hosting con Firestore como backend.

## Stack tecnológico

- **Framework**: Astro 5.x (SSG)
- **UI interactiva**: React 19 + `@astrojs/react` (islas)
- **Estilos**: Tailwind CSS v4 (`@tailwindcss/vite`)
- **Backend**: Firebase 11 — Firestore + Hosting
- **Validación**: Zod 3.x
- **Iconografía**: Lucide-react

## Estructura del proyecto

```
├── public/
│   ├── branding-logo.png          # Logo principal del evento
│   └── fotos-restaurante/         # Imágenes del venue (o urls-imagenes.txt con enlaces Google Maps)
├── src/
│   ├── components/
│   │   ├── wedding/               # Secciones de la web
│   │   │   ├── HeroSection.astro
│   │   │   ├── ProgramaSection.astro
│   │   │   ├── UbicacionSection.astro
│   │   │   ├── RSVPSection.astro
│   │   │   ├── MusicaSection.astro + MusicaSection.tsx
│   │   │   ├── HotelesSection.astro
│   │   │   └── FooterSection.astro
│   │   ├── forms/
│   │   │   └── RSVPForm.tsx       # Formulario multi-paso (3 pasos)
│   │   ├── AddToCalendarButton.tsx
│   │   ├── WhatsAppButton.tsx
│   │   └── Navbar.tsx
│   ├── layouts/
│   │   └── Layout.astro
│   ├── lib/
│   │   ├── event-config.ts        # Fuente de verdad del evento (editar aquí)
│   │   ├── rsvp-schema.ts         # Zod + ALERGIAS_OPCIONES + toFirestorePayload
│   │   ├── firebase.ts
│   │   ├── calendar.ts            # URL Google Calendar
│   │   ├── venue-images.ts        # Imágenes del lugar (local o Google)
│   │   └── ...
│   ├── pages/
│   │   └── index.astro
│   └── styles/
│       └── global.css             # @theme, tipografía fluida, animaciones
├── firestore.rules
├── firebase.json
└── package.json
```

## Flujo de la web

1. **Hero** — Invitación, nombres, fecha, CTA a RSVP
2. **Programa** — Timeline del día
3. **Ubicación** — Dónde & Cuándo, galería del lugar, enlaces Maps/web
4. **RSVP** — Confirmación de asistencia (nombre, acompañantes, alergias/restricciones)
5. **Música** — Recomendaciones de canciones (sin identificar al remitente)
6. **Hoteles** — Recomendaciones para invitados de fuera
7. **Footer** — Logo, contacto (Carlos e Irene vía WhatsApp)

## Colecciones Firestore

| Colección | Uso |
|-----------|-----|
| `respuestas_boda` | Confirmaciones RSVP (invitados, alergias, etc.) |
| `recomendaciones_musicales` | Sugerencias de canciones (anónimas) |

## Configuración

### Variables de entorno (`.env`)

```
PUBLIC_ACCESS_CODE=              # Código de acceso para la web (vacío = gate desactivado)
PUBLIC_FIREBASE_API_KEY=
PUBLIC_FIREBASE_AUTH_DOMAIN=
PUBLIC_FIREBASE_PROJECT_ID=
PUBLIC_FIREBASE_STORAGE_BUCKET=
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
PUBLIC_FIREBASE_APP_ID=
```

- **PUBLIC_ACCESS_CODE**: Si está definido, los visitantes deben introducir este código para acceder. Vacío = sin barrera (útil en desarrollo). La sesión expira al cerrar la pestaña y, como máximo, a los 7 días desde el primer acceso (siguiendo recomendaciones OWASP para apps de bajo riesgo).
- Sin credenciales Firebase, el modo simulación activa `console.log` en lugar de escribir en Firestore.

### Fuente de verdad del evento

Todo el contenido editable está en `src/lib/event-config.ts`:

- Novios, fecha, lugar, programa
- Hoteles recomendados (nombre, enlace, descripción, dirección, teléfono, coordenadas)
- Contacto WhatsApp (Carlos e Irene por separado)
- Textos UI

## Comandos

| Comando | Acción |
|---------|--------|
| `npm install` | Instalar dependencias |
| `npm run dev` | Desarrollo en `http://localhost:4321` (o IP de red con `--host`) |
| `npm run build` | Build de producción en `./dist/` |
| `npm run preview` | Preview del build local |
| `firebase deploy` | Desplegar a Firebase (Hosting + Firestore rules) |

## Despliegue

```bash
npm run build
firebase deploy
```

El contenido estático se sirve desde Firebase Hosting; Firestore almacena RSVP y recomendaciones musicales.

## Seguridad (headers y buenas prácticas)

La web incluye headers HTTP de seguridad configurados para mitigar riesgos detectados por OWASP ZAP:

| Header | Propósito |
|--------|-----------|
| **Content-Security-Policy** | Mitiga XSS e inyección de datos; restringe orígenes de scripts, estilos, imágenes y fuentes |
| **X-Frame-Options: DENY** | Protección anti-clickjacking |
| **X-Content-Type-Options: nosniff** | Evita MIME-sniffing |
| **Cross-Origin-Embedder-Policy** | Aísla el documento de recursos cross-origin no autorizados |
| **Cross-Origin-Opener-Policy** | Previene fugas de datos entre ventanas |
| **Cross-Origin-Resource-Policy** | Protección frente a ataques tipo Spectre |
| **Permissions-Policy** | Desactiva APIs del navegador no usadas (cámara, micrófono, etc.) |

- **Producción**: headers definidos en `firebase.json` (Firebase Hosting).
- **Desarrollo**: headers inyectados por `src/middleware.ts` (servidor Astro).

Las fuentes (Cormorant Garamond, Inter) se sirven localmente vía `@fontsource` para evitar dependencias externas y cumplir Subresource Integrity (SRI).
