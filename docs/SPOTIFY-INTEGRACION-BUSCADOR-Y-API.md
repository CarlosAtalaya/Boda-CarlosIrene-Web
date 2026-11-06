# Spotify en la web de la boda — decisión y líneas futuras

Este documento fija **qué opción descartamos**, **qué usamos ahora** y **qué puede explorar un agente de IA o un desarrollador** más adelante, sin volver a asumir la integración “pro” con backend propio.

---

## 1. Decisión actual: no usar Web API + backend en Firebase

**No vamos a implementar** el camino “buscador + Spotify Web API + Cloud Functions / servidor propio” descrito en guías genéricas de integración.

Motivos típicos en proyectos como este:

- **Firebase** exige **plan Blaze** (facturación) para **Cloud Functions** con llamadas salientes a APIs externas, **Secret Manager**, etc. En **Spark** no es viable desplegar esa solución tal cual.
- Añade **complejación** (secretos, OAuth de refresh token, despliegues de functions separados del Hosting) para un sitio estático de invitación.

**Conclusión:** la web sigue en **Hosting estático + variables de entorno** en build; no hay API propia de Spotify en este repositorio como requisito.

---

## 2. Comportamiento esperado en el código (enfoque colaborativo)

Hoy el modelo útil sin backend es:

- **`PUBLIC_SPOTIFY_PLAYLIST_ID`** — ID público de la playlist (estable en la URL canónica de Spotify).
- **`PUBLIC_SPOTIFY_PLAYLIST_COLLAB_URL`** — enlace para que los invitados **añadan canciones como colaboradores** (suele llevar parámetros tipo `?si=` / `?pt=`). **Ese enlace puede caducar**; cuando Spotify lo invalide, hay que **sustituir el valor** y **volver a desplegar** (o regenerar el build con CI).

El formulario de **recomendaciones en texto** (Firestore) puede seguir como respaldo si el enlace colaborativo falla.

---

## 3. Objetivo futuro: mantener actualizado `PUBLIC_SPOTIFY_PLAYLIST_COLLAB_URL`

**Problema:** el valor de `PUBLIC_SPOTIFY_PLAYLIST_COLLAB_URL` **no** lo expone Spotify con un API estable pensado para “dame siempre el último enlace de invitación colaborativa”. Caduca o cambia según políticas de Spotify.

**Dirección a explorar (para un agente de IA o un script externo):** automatizar **en la medida legal y técnica posible** la **obtención de un enlace nuevo** cuando el antiguo deje de funcionar, y actualizar el valor que acaba en el despliegue.

### 3.1. Ideas de investigación (no implementadas aquí)

1. **Scraping / automatización del cliente de Spotify**  
   Investigar si un flujo controlado (p. ej. sesión autenticada, headless browser, o extracción desde la UI de “Invitar colaboradores”) puede **leer** el enlace actual.  
   **Obligatorio revisar:** [Términos de servicio de Spotify](https://www.spotify.com/legal/) y políticas de desarrolladores; el scraping agresivo o la automatización pueden **estar prohibidos** o ser **frágiles** (cambios de DOM, bloqueos, captchas).

2. **Notificación manual asistida**  
   Si la automatización no es viable, un script que **solo avise** (correo, Telegram, Slack) cuando la URL de la playlist devuelva error o redirección rara, para que un humano **pegue el nuevo enlace** en `.env` / GitHub Secrets.

3. **Playwright / Puppeteer en job programado** (fuera de Firebase Hosting estático)  
   Ejecutar en **GitHub Actions**, **PC local**, o **VM** con credenciales en secretos; **nunca** commitear cookies ni tokens.

4. **Revalidación en build**  
   En CI, un paso opcional que compruebe si la URL responde 200/redirect esperable; si falla, **fallar el build** o abrir issue para no publicar un enlace muerto sin aviso.

### 3.2. Riesgos y límites

- **Legal / ToS:** priorizar cumplimiento frente a “scraping” ciego.
- **Mantenimiento:** cualquier selector de UI se rompe cuando Spotify cambia la web.
- **Seguridad:** no guardar contraseñas de Spotify en el repo; usar secretos del CI o almacenes seguros.

---

## 4. Qué no cubre este documento

- No sustituye la documentación oficial de [Spotify Web API](https://developer.spotify.com/documentation/web-api).
- No asume que se habilitará Blaze ni Functions en Firebase.

---

## 5. Checklist mínimo cuando caduque el enlace colaborativo

1. **Spotify** → playlist → menú → **Invitar colaboradores** → copiar enlace.
2. Actualizar **`PUBLIC_SPOTIFY_PLAYLIST_COLLAB_URL`** (GitHub Secrets / `.env` local según flujo).
3. **`npm run build`** y despliegue de Hosting (o pipeline que ya uséis).

---

*Documento orientativo para el proyecto Boda Carlos & Irene. Actualizar cuando se elija una estrategia concreta de automatización.*
