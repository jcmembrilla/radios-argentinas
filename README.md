# 📻 Radios Argentinas

> Reproductor web de radios AM/FM de Argentina en vivo. Simple, liviano, instalable en tu celular.

![Netlify](https://img.shields.io/badge/deploy-Netlify-00C7B7?logo=netlify&logoColor=white)
![Astro](https://img.shields.io/badge/Astro-5.x-BC52EE?logo=astro&logoColor=white)
![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)
![PWA](https://img.shields.io/badge/PWA-instalable-5A0FC8?logo=pwa&logoColor=white)
![TypeScript](https://img.shields.io/badge/TS%20config-3178C6?logo=typescript&logoColor=white)

## 🌐 Demo

La aplicación está disponible en producción: **[radiosarg.netlify.app](https://radiosarg.netlify.app/)**

## ✨ Características

- 🎙️ **Streaming en vivo** de las principales radios AM y FM de Argentina (AM 750, Rivadavia, La Red, Radio Mitre, Aspen y más).
- ▶️ **Reproductor confiable**: máquina de estados basada en eventos reales del audio, con spinner de conexión y avisos de error si una radio cae.
- 📱 **PWA instalable**: agregala a la pantalla de inicio de tu celular y controlá la reproducción desde la pantalla de bloque (Media Session API).
- 💾 **Preferencias recordadas**: guarda tu radio y tu volumen para la próxima visita.
- 📡 **Catálogo desacoplado**: la lista de radios vive en un JSON editable, sin tocar el código.
- ⚡ **Rápida**: HTML estático renderizado con Astro; solo el reproductor se hidrata como isla de React.

## 🛠️ Tecnologías

| Herramienta | Uso |
|---|---|
| [Astro 5](https://astro.build/) | Framework del sitio: HTML estático en build time |
| [React 19](https://react.dev/) | Isla del reproductor (única parte interactiva) |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) | Service worker + manifest (app instalable) |
| CSS | Estilos, sin preprocesadores ni frameworks de UI |
| [Netlify](https://www.netlify.com/) | Hosting y deploy automático |

## 🚀 Instalación

Requisitos previos: [Node.js](https://nodejs.org/) 18.17 o superior y Git.

```bash
# 1. Clonar el repositorio
git clone https://github.com/jcmembrilla/radios-argentinas.git
cd radios-argentinas

# 2. Instalar dependencias
npm install

# 3. Levantar el servidor de desarrollo
npm run dev
```

La app queda disponible en `http://localhost:4321`.

## 📜 Scripts disponibles

| Comando | Acción |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Genera la versión de producción en `dist/` (incluye service worker) |
| `npm run preview` | Sirve localmente la build de producción para verificarla |

## 📁 Estructura del proyecto

```
radios-argentinas/
├── public/                  # Archivos servidos tal cual
│   ├── favicon.svg          # Favicon (micrófono, SVG)
│   └── icons/               # Íconos PWA y apple-touch-icon
├── src/
│   ├── data/
│   │   └── radios.json      # Catálogo de radios (se importa en build time)
│   ├── hooks/
│   │   ├── useAudio.js      # Máquina de estados del reproductor
│   │   └── useMediaSession.js  # Controles de pantalla de bloque
│   ├── components/          # Isla de React: Player y sub-componentes
│   │   ├── Player.jsx
│   │   ├── PlayButton.jsx
│   │   ├── VolumeSlider.jsx
│   │   └── RadioSelector.jsx
│   ├── layouts/
│   │   └── BaseLayout.astro # Head (SEO, OG, PWA), footer y fecha
│   ├── pages/
│   │   └── index.astro      # Página principal (estática)
│   └── styles/
│       └── global.css       # Estilos globales
├── astro.config.mjs         # Configuración de Astro + integraciones
├── netlify.toml             # Configuración de build para Netlify
├── ARCHITECTURE.md          # Documentación de arquitectura
└── package.json
```

## 🔧 Configuración

### Agregar o quitar radios

La lista de emisoras vive en [`src/data/radios.json`](src/data/radios.json). Para agregar una radio, sumá un objeto al array con este formato:

```json
{
  "key": 13,
  "name": "Nombre de la radio",
  "url": "https://servidor.com/stream.aac"
}
```

- **`key`**: identificador numérico único, correlativo.
- **`name`**: nombre visible en el selector.
- **`url`**: URL directa del stream (formatos soportados por el navegador: MP3, AAC, ICEcast, HLS). Sin espacios al inicio o al final.

La lista se importa en build time, así que al hacer push el deploy automático de Netlify reconstruye el sitio y publica la nueva radio.

## 📦 Deploy

El sitio se despliega automáticamente en [Netlify](https://www.netlify.com/) en cada push a `main`:

1. Netlify ejecuta `npm install` y `npm run build`.
2. Publica el contenido de `dist/` (páginas estáticas + service worker).
3. La configuración vive en [`netlify.toml`](netlify.toml).

## 🤝 Contribuir

Las sugerencias son bienvenidas, especialmente **nuevas radios**:

1. Hacé un fork del proyecto.
2. Creá una rama con tu cambio (`git checkout -b nueva-radio`).
3. Agregá la emisora a `src/data/radios.json` siguiendo el formato de la sección anterior.
4. Abrí un Pull Request describiendo la radio agregada.

## 📄 Licencia

Este proyecto está bajo la licencia [MIT](LICENSE).
