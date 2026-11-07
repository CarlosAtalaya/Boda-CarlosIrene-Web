# Guía para seguir con la web de Paloma y Jose

Esta carpeta es la web de la boda. Ya tiene un primer diseño (papel, acuarela y letra escrita a mano). Tú no tienes que saber programar para retocarla: lo normal es abrir la carpeta en Cursor y pedirle a la IA, en castellano, qué quieres cambiar.

La rama en la que está este diseño se llama **`pp/transformacion-web-pp`**.

La rama **`main`** es otra web distinta (la de Carlos e Irene). No trabajes ahí.

---

## 1. Qué puedes cambiar, y en qué archivo

Abre el archivo, dile a la IA qué quieres, y deja que ella edite. Si solo quieres cambiar un texto, también puedes buscarlo y sustituirlo tú.

| Si quieres cambiar… | Abre este archivo |
| --- | --- |
| Nombres, fecha, hora, lugar, dirección, programa del día, WhatsApp, IBAN y frases generales | `src/lib/event-config.ts` |
| Las fotos de Quinta Monteguerra | La carpeta `public/fotos-quinta-monteguerra` |
| Colores y tipo de letra de toda la web | `src/styles/global.css` |
| El menú de arriba (Inicio, El Lugar, Programa…) | `src/components/Navbar.tsx` |
| La primera pantalla grande, con los nombres | `src/components/wedding/HeroSection.astro` |
| La sección «Dónde y cuándo» | `src/components/wedding/UbicacionSection.astro` |
| El marco y las flechas de las fotos | `src/components/wedding/VenueGallery.tsx` |
| El programa del día (las horas y los iconos) | `src/components/wedding/ProgramaSection.astro` |
| Los dibujos que hay entre secciones | `src/components/wedding/WatercolorInterlude.astro` |
| El título de la confirmación de asistencia | `src/components/wedding/RSVPSection.astro` |
| El formulario de confirmar asistencia | `src/components/forms/RSVPForm.tsx` |
| La sección del regalo y el número de cuenta | `src/components/wedding/RegalosSection.astro` |
| El botón de copiar el IBAN | `src/components/wedding/CopyIBANButton.tsx` |
| Las preguntas frecuentes | `src/components/wedding/FAQSection.astro` |
| El final de la página y los botones de WhatsApp | `src/components/wedding/FooterSection.astro` |
| El orden de las secciones (qué va antes y qué va después) | `src/pages/index.astro` |

### Fotos

Las fotos van en `public/fotos-quinta-monteguerra`, con nombres `01.jpg`, `02.jpg`, `03.jpg`… La web las ordena por ese número.

Para cambiar una foto: sustituye el archivo manteniendo el mismo nombre. Para añadir una, llama al archivo nuevo `11.jpg` (el siguiente número). Para quitar una, borra el archivo.

### Colores

En `src/styles/global.css`, cerca del principio, están los colores con nombre. Si cambias el código de color, cambia en toda la web:

- Papel: `#F4F6F8`
- Azul cielo: `#7FA1C3` y `#B8CDE3`
- Azul fuerte (botones): `#3B539A`
- Verde: `#58693B` y `#8A9A5B`
- Arena / ocre: `#DFB98C` y `#B88655`
- Texto: `#2B2B29`

### Textos que casi siempre querrás tocar

En `src/lib/event-config.ts` están, entre otros:

- `novios` (Paloma y Jose)
- `fechaLegible` y `fechaCorta`
- `lugar`, `lugarDireccion` y `coordenadas`
- `programa` (hora y descripción de cada momento)
- `contacto` (números y mensajes de WhatsApp)
- `regalos` (IBAN y titular)
- `textos` (frases de la confirmación, del lugar y del pie de página)

Las preguntas frecuentes están escritas dentro de `src/components/wedding/FAQSection.astro`, no en ese archivo de configuración.

### Qué es mejor no tocar a mano

El formulario de asistencia guarda los datos con una estructura fija. Si lo reescribes entero se puede romper. Pide cambios de aspecto (colores, textos, botones) y di explícitamente que no se toque la lógica de guardado.

Firebase (la base de datos) está apagado a propósito. En tu ordenador el formulario funciona en modo prueba: se ve la pantalla de «respuesta anotada», pero no se guarda en internet. Eso se conectará más adelante.

---

## 2. Instalar lo necesario en Windows

Hacen falta dos programas. Instálalos una sola vez.

### Git Bash

Git Bash es la ventanita negra donde escribes los comandos de Git.

1. Entra en [https://git-scm.com/download/win](https://git-scm.com/download/win).
2. Descarga **Git for Windows** y ábrelo.
3. En el instalador puedes dejar todas las opciones como vienen y pulsar Next hasta el final.
4. Cuando acabe, en el menú Inicio busca **Git Bash** y ábrelo.

### Node.js (trae npm)

`npm` es la herramienta que instala las librerías de la web y la arranca. Viene dentro de Node.js. No se instala aparte.

1. Entra en [https://nodejs.org](https://nodejs.org).
2. Descarga la versión **LTS** (la recomendada, el botón de la izquierda).
3. Instálala dejando las opciones por defecto. Asegúrate de que queda marcada la casilla de añadir Node al PATH, que suele venir marcada.
4. Cierra Git Bash si lo tenías abierto y ábrelo otra vez.
5. Comprueba que funciona escribiendo esto y pulsando Enter:

```bash
node -v
npm -v
```

Tienen que salir dos números de versión, por ejemplo `v22...` y `10...`. Si dice que no reconoce el comando, cierra Git Bash, ábrelo de nuevo y prueba otra vez.

---

## 3. Cuenta de GitHub y permiso para entrar al proyecto

GitHub es donde está guardada la copia de la web.

1. Entra en [https://github.com/signup](https://github.com/signup) y crea una cuenta gratuita.
2. Elige un nombre de usuario y apúntalo.
3. Escríbele a Carlos ese nombre de usuario para que te añada como colaborador del repositorio **Boda-CarlosIrene-Web**.
4. Te llegará un correo de GitHub. Ábrelo y acepta la invitación. Sin ese paso, el ordenador no podrá descargar el proyecto.

El proyecto está en:

[https://github.com/CarlosAtalaya/Boda-CarlosIrene-Web](https://github.com/CarlosAtalaya/Boda-CarlosIrene-Web)

---

## 4. Bajar el proyecto y colocarte en la rama correcta

Abre **Git Bash**.

Ve a la carpeta donde quieres guardar la web. Por ejemplo, Documentos:

```bash
cd /c/Users/TU_USUARIO/Documents
```

Cambia `TU_USUARIO` por el nombre de tu usuario de Windows.

Descarga el proyecto:

```bash
git clone https://github.com/CarlosAtalaya/Boda-CarlosIrene-Web.git
```

GitHub te pedirá usuario y contraseña la primera vez. La contraseña no es la de la web: en GitHub hay que usar un **Personal Access Token**. Si te lo pide y no sabes crearlo, dile a Carlos o pídeselo a Cursor: «ayúdame a crear un token de GitHub para clonar».

Entra en la carpeta:

```bash
cd Boda-CarlosIrene-Web
```

Al clonar, Git te deja en `main`. Cambia a la rama del diseño nuevo:

```bash
git checkout pp/transformacion-web-pp
```

Comprueba que estás en la rama buena. Tiene que poner `pp/transformacion-web-pp`:

```bash
git branch
```

La rama activa es la que lleva un asterisco.

Si algún día `git checkout` dice que no encuentra la rama, actualiza y vuelve a intentarlo:

```bash
git fetch origin
git checkout pp/transformacion-web-pp
```

---

## 5. Arrancar la web en tu ordenador

Estos comandos se escriben dentro de la carpeta `Boda-CarlosIrene-Web`, en Git Bash.

La primera vez, y también cada vez que alguien añada una librería nueva:

```bash
npm install
```

Tarda un poco. Es normal. Cuando termine, arranca la página:

```bash
npm run dev
```

Abre el navegador en [http://localhost:4321](http://localhost:4321).

Esa ventana de Git Bash tiene que seguir abierta mientras miras la web. Para pararla, pulsa `Ctrl + C`.

Otros comandos útiles:

```bash
npm run build
```

Comprueba que la web se puede generar sin errores. Úsalo antes de dar por bueno un cambio grande.

```bash
npm run preview
```

Sirve para ver el resultado de `npm run build`. Antes tiene que haber funcionado el build.

Si la página se ve rara después de bajar cambios nuevos, vuelve a ejecutar `npm install` y luego `npm run dev`.

---

## 6. Cómo retocar el diseño con Cursor

1. Instala Cursor desde [https://cursor.com](https://cursor.com).
2. Abre Cursor y elige **File → Open Folder**.
3. Selecciona la carpeta `Boda-CarlosIrene-Web`.
4. En el chat, pide el cambio en castellano y di en qué parte de la página está.

Ejemplo de petición:

> En la primera pantalla, quiero el fondo un poco más azul y la frase «Nos casamos» más pequeña. No cambies los nombres ni la fecha. El archivo es HeroSection.

Antes de pedir algo, ten `npm run dev` en marcha y mira la página en el navegador. Así ves el resultado al momento: al guardar, la página se recarga sola.

---

## 7. Guardar tus cambios y subirlos

Cuando algo te guste y quieras dejarlo guardado en GitHub, en Git Bash, dentro de la carpeta del proyecto:

```bash
git status
git add .
git commit -m "Describo aquí qué he cambiado"
git push
```

`git status` enseña qué archivos has tocado. `git push` los sube a la rama en la que estás. Comprueba antes, con `git branch`, que el asterisco está en `pp/transformacion-web-pp` y no en `main`.

Si `git push` dice que tienes que identificarte, es el mismo usuario y token del paso de clonar.
