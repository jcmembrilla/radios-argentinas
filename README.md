# 📻 Radios Argentinas

> Reproductor web de radios AM/FM de Argentina en vivo. Simple, liviano y al instante.

![Netlify](https://img.shields.io/badge/deploy-Netlify-00C7B7?logo=netlify&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)

## 🌐 Demo

La aplicación está disponible en producción: **[radiosarg.netlify.app](https://radiosarg.netlify.app/)**

## ✨ Características

- 🎙️ **Streaming en vivo** de las principales radios AM y FM de Argentina (AM 750, Rivadavia, La Red, Radio Mitre, Aspen y más).
- ▶️ **Reproductor simple**: un botón para reproducir/pausar, control de volumen y selector de emisoras.
- 📡 **Datos desacoplados**: la lista de radios vive en un JSON editable, sin tocar el código.
- 🪶 **Ligera**: sin frameworks ni dependencias de runtime, solo HTML, CSS y JavaScript.

## 🛠️ Tecnologías

| Herramienta | Uso |
|---|---|
| [Vite](https://vite.dev/) | Bundler y servidor de desarrollo |
| HTML5 + CSS3 | Estructura y estilos |
| JavaScript (ES Modules) | Lógica del reproductor, sin frameworks |
| [Netlify](https://www.netlify.com/) | Hosting y deploy automático |

## 🚀 Instalación

Requisitos previos: [Node.js](https://nodejs.org/) 18 o superior y Git.

```bash
# 1. Clonar el repositorio
git clone https://github.com/jcmembrilla/radios-argentinas.git
cd radios-argentinas

# 2. Instalar dependencias
npm install

# 3. Levantar el servidor de desarrollo
npm run dev
```

La app queda disponible en `http://localhost:5173`.

## 📜 Scripts disponibles

| Comando | Acción |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Genera la versión de producción en `dist/` |
| `npm run preview` | Sirve localmente la build de producción para verificarla |

## 📁 Estructura del proyecto

```
radios-argentinas/
├── public/
│   ├── radios.json          # Lista de radios (nombre + URL del stream)
│   └── mic.png              # Favicon
├── src/
│   ├── index.js             # Lógica del reproductor (play, volumen, selector)
│   ├── style.css            # Estilos de la aplicación
│   └── assets/
│       └── images/          # Íconos y fondo de la app
├── index.html               # Página principal
├── netlify.toml             # Configuración de build para Netlify
├── ARCHITECTURE.md          # Documentación de arquitectura
└── package.json
```

## 🔧 Configuración

### Agregar o quitar radios

La lista de emisoras vive en [`public/radios.json`](public/radios.json). Para agregar una radio, sumá un objeto al array con este formato:

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

Luego hacé push y el deploy automático de Netlify publica la nueva radio.

## 📦 Deploy

El sitio se despliega automáticamente en [Netlify](https://www.netlify.com/) en cada push a `main`:

1. Netlify ejecuta `npm install` y `npm run build`.
2. Publica el contenido de `dist/`.
3. La configuración vive en [`netlify.toml`](netlify.toml).

## 🤝 Contribuir

Las sugerencias son bienvenidas, especialmente **nuevas radios**:

1. Hacé un fork del proyecto.
2. Creá una rama con tu cambio (`git checkout -b nueva-radio`).
3. Agregá la emisora a `public/radios.json` siguiendo el formato de la sección anterior.
4. Abrí un Pull Request describiendo la radio agregada.

## 📄 Licencia

Este proyecto está bajo la licencia [MIT](LICENSE).
