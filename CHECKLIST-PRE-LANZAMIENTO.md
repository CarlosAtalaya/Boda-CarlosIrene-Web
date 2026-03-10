# Checklist de verificación antes de enviar la web a invitados

Este documento detalla cómo comprobar que la web de boda funciona correctamente antes de compartirla.

---

## 1. Configurar GitHub Secrets (obligatorio para CI/CD)

El build en GitHub Actions **no tiene acceso** al archivo `.env` (está en `.gitignore`). Las variables deben estar en **GitHub Secrets**.

### Pasos

1. Ve a tu repo en GitHub: **Settings → Secrets and variables → Actions**
2. Crea los siguientes **Repository secrets**:

| Secret | Valor (cópialo de tu `.env` local) |
|--------|------------------------------------|
| `PUBLIC_ACCESS_CODE` | `IYC26JN26` (o el código que uses) |
| `PUBLIC_FIREBASE_API_KEY` | `AIzaSy...` |
| `PUBLIC_FIREBASE_AUTH_DOMAIN` | `boda-carlosirene-26jn.firebaseapp.com` |
| `PUBLIC_FIREBASE_PROJECT_ID` | `boda-carlosirene-26jn` |
| `PUBLIC_FIREBASE_STORAGE_BUCKET` | `boda-carlosirene-26jn.firebasestorage.app` |
| `PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `495494742517` |
| `PUBLIC_FIREBASE_APP_ID` | `1:495494742517:web:684ab87a4028b388fda0bc` |

3. **FIREBASE_SERVICE_ACCOUNT_BODA_CARLOSIRENE_26JN** ya debe existir (para el deploy). Si no, créalo desde Firebase Console → Project Settings → Service accounts.

4. Haz un **push a `main`** para que se ejecute el workflow con los nuevos secrets.

---

## 2. Verificar que el código de acceso funciona

Después del deploy:

1. Abre la web en **ventana de incógnito** (para evitar `sessionStorage` antiguo):  
   https://boda-carlosirene-26jn.web.app
2. **Debe aparecer** la pantalla de acceso con el campo para introducir el código.
3. Introduce el código (`IYC26JN26` o el configurado).
4. Si es correcto, deberías ver la web completa (Hero, Programa, etc.).

Si no aparece el gate → revisa que `PUBLIC_ACCESS_CODE` esté en GitHub Secrets y que el último deploy haya terminado.

---

## 3. Verificar que Firebase está activo (no modo simulación)

1. En la sección **"Confirmación de Asistencia"**, **NO** debe aparecer el texto:  
   `Modo simulación · sin Firebase`
2. Si aparece, significa que `PUBLIC_FIREBASE_API_KEY` (u otra variable) no llegó al build. Revisa los secrets.

---

## 4. Verificar escrituras en Firestore

### RSVP (colección `respuestas_boda`)

1. Rellena el formulario de asistencia completo:
   - Nombre completo
   - Confirmar asistencia (Sí/No)
   - Si sí: añade acompañantes si quieres
   - Menú: alergias/restricciones si aplica
2. Envía el formulario.
3. Deberías ver la pantalla de éxito con el botón "Añadir al calendario".
4. En **Firebase Console** → Firestore → colección `respuestas_boda`, debe aparecer un nuevo documento con:
   - Campo `invitados` (array)
   - Campo `createdAt` (timestamp)

### Recomendaciones musicales (colección `recomendaciones_musicales`)

1. En la sección "La fiesta", escribe una sugerencia (ej. "Hotel California - Eagles").
2. Pulsa "Enviar recomendación".
3. En Firestore → `recomendaciones_musicales`, debe aparecer un documento con `sugerencias` y `createdAt`.

---

## 5. Comprobar reglas de Firestore

En Firebase Console → Firestore → **Rules**:

- `respuestas_boda`: `allow create: if true;` (y `read: if false`)
- `recomendaciones_musicales`: `allow create: if true;`

Si las reglas están correctas pero no se escriben datos, el problema suele ser que el build sigue en modo simulación (variables no inyectadas).

---

## 6. Probar en local antes de desplegar

```bash
npm run build
npm run preview
```

Abre `http://localhost:4321`. Con `.env` configurado localmente:
- Debe pedir código de acceso si `PUBLIC_ACCESS_CODE` tiene valor.
- No debe mostrar "Modo simulación".
- El formulario debe escribir en Firestore.

---

## Resumen rápido

| Comprobar | Cómo |
|-----------|------|
| Código de acceso | Incógnito → debe aparecer gate |
| Sin "Modo simulación" | Sección RSVP → no debe verse el mensaje |
| RSVP → Firestore | Completar formulario → revisar `respuestas_boda` |
| Música → Firestore | Enviar sugerencia → revisar `recomendaciones_musicales` |
| Secrets en GitHub | Settings → Secrets → 7 variables `PUBLIC_*` |

Si todo lo anterior pasa, la web está lista para enviar a los invitados.
