# 🏗️ Arquitectura — Radios Argentinas

Este documento describe la arquitectura de la aplicación, las decisiones técnicas tomadas y cómo evolucionó el proyecto. Está pensado para que cualquier persona pueda entender qué hace cada pieza y por qué está donde está.

## Índice

1. [Visión general](#-visión-general)
2. [Stack y decisiones técnicas](#-stack-y-decisiones-técnicas)
3. [Estructura del proyecto](#-estructura-del-proyecto)
4. [Flujo de datos](#-flujo-de-datos)
5. [Máquina de estados del reproductor](#-máquina-de-estados-del-reproductor)
6. [Arquitectura PWA](#-arquitectura-pwa)
7. [Pipeline de deploy](#-pipeline-de-deploy)
8. [Historial de arquitectura](#-historial-de-arquitectura)

---

## 🔭 Visión general

Radios Argentinas es una **aplicación web estática de una sola página** para escuchar radios argentinas en vivo, instalable como PWA. No tiene backend propio: el catálogo de emisoras se resuelve en build time y el audio se transmite directo desde los CDN de cada radio (StreamTheWorld, MDStrm, ICEcast, etc.).

```
┌───────────────────────────── Navegador ─────────────────────────────┐
│                                                                      │
│  HTML estático (Astro)                                               │
│      │                                                               │
│      ├─► Isla React <Player> ──► useAudio ──► <audio> oculto         │
│      │        (radios via props, sin fetch)          │               │
│      └─► Service Worker (app shell offline)          │               │
│                                                      │               │
└──────────────────────────────────────────────────────┼───────────────┘
                                                       ▼
                                        CDN de streaming de cada radio
```

**Características del sistema:**

- **100% estática**: se aloja en cualquier CDN, no requiere servidor de aplicaciones.
- **Sin base de datos**: el "catálogo" de radios es un JSON versionado en el repo, importado en build time (el navegador nunca lo descarga por separado).
- **Streaming directo**: el navegador reproduce los streams vía el elemento `<audio>` nativo; la app nunca toca los bytes de audio.
- **PWA**: instalable, con controles de reproducción en pantalla de bloque.

## 🧰 Stack y decisiones técnicas

| Decisión | Alternativa descartada | Motivo |
|---|---|---|
| Astro para el shell estático | SPA (React/Vue "bare") | La página es contenido estático: Astro la genera en build time con SEO perfecto y cero JS innecesario. |
| Isla de React solo para el player | Todo el sitio en React | El único componente con estado real es el reproductor. `client:load` hidrata solo esa pieza; el resto es HTML puro. |
| Radios importadas en build time (`import radios from '../data/radios.json'`) | `fetch` en runtime | Cero requests, cero flash de contenido vacío. Agregar una radio = editar JSON + push (el deploy reconstruye). |
| Eventos del `<audio>` como fuente de verdad | Estado invertido a mano (`isPlaying = !isPlaying`) | Elimina bugs de estados desincronizados (ej.: doble click necesario para reproducir). |
| Elemento `<audio>` nativo | Librerías de player (HLS.js, Howler) | Los streams usados son AAC/MP3/ICEcast, reproducibles nativamente; HLS.js solo sería necesario con manifiestos `.m3u8`. |
| SVG inline para íconos | PNGs (`play.png`, `pause.png`) | Se recolorean con CSS, escalan sin blur y ahorran 2 requests. |
| Workbox (vía `@vite-pwa/astro`) en modo `generateSW` | Service worker escrito a mano | Configuración declarativa, precache automático del app shell con hash de versiones. |
| Netlify | Vercel, GitHub Pages | Deploy automático desde `main`, dominio propio, SSL y CDN global sin costo. |
| Vite (directo) | — | Reemplazado por Astro 5, que internamente usa Vite y además resuelve el render estático y las islas. |
| Tailwind v4 (`@tailwindcss/vite`) | CSS plano con clases BEM | Estilos co-localizados en cada componente, tokens centralizados en `@theme`, CSS final tree-shakeado (12.6 KB con todo el sitio). La integración `@astrojs/tailwind` está deprecada: v4 se integra como plugin de Vite. |
| Capa custom mínima en `global.css` | Todo en utilidades | Solo lo no expresable: fondo con imagen + overlay (`bg-flag`), flecha del select (`select-arrow`) y pseudo-elementos del slider (`.range-field`). |

## 📂 Estructura del proyecto

```
radios-argentinas/
├── public/                  # Archivos servidos tal cual (sin procesar)
│   ├── favicon.svg          # Favicon vectorial
│   └── icons/               # Íconos PWA (192/512) y apple-touch-icon
├── src/
│   ├── data/radios.json     # Catálogo: única fuente de verdad de emisoras
│   ├── hooks/
│   │   ├── useAudio.js      # Máquina de estados + elemento <audio>
│   │   └── useMediaSession.js  # Controles del sistema operativo
│   ├── components/          # Isla de React
│   │   ├── Player.jsx       # Orquestador (estado, persistencia, datos)
│   │   ├── PlayButton.jsx   # Botón central (SVG: play/pause/spinner)
│   │   ├── VolumeSlider.jsx # Volumen con % visible
│   │   └── RadioSelector.jsx# <select> de emisoras
│   ├── layouts/BaseLayout.astro  # <head> (SEO/OG/PWA), footer, fecha
│   ├── pages/index.astro    # Página única, HTML estático
│   └── styles/global.css    # Tokens @theme, utilidades custom, foco global
├── astro.config.mjs         # Integraciones: react, PWA (manifest, SW), Tailwind
├── netlify.toml             # command + publish para Netlify
├── ARCHITECTURE.md          # Este documento
└── package.json
```

### Responsabilidades por archivo

| Archivo | Responsabilidad |
|---|---|
| `src/pages/index.astro` | Genera el HTML estático; importa el catálogo y lo pasa como prop a la isla. |
| `src/layouts/BaseLayout.astro` | SEO, Open Graph, favicon, manifest, registro del SW, footer y fecha actual. |
| `src/components/Player.jsx` | Orquesta la isla: sincroniza estado, restaura/guarda preferencias, arma el mensaje de estado. |
| `src/hooks/useAudio.js` | Ciclo de vida del `<audio>` y estados `idle/loading/playing/paused/error` derivados de eventos reales. |
| `src/hooks/useMediaSession.js` | Metadatos y handlers play/pause para la pantalla de bloque y auriculares. |
| `src/data/radios.json` | Catálogo de emisoras: `key`, `name`, `url`. |
| `src/styles/global.css` | Tokens Tailwind (`@theme`), foco de teclado global y utilidades custom (`bg-flag`, `select-arrow`, thumb del slider). |
| `astro.config.mjs` | Integraciones React/PWA y plugin de Vite de Tailwind. |

## 🔄 Flujo de datos

```mermaid
sequenceDiagram
    participant Build as Build (Netlify)
    participant B as Navegador
    participant R as Isla React (Player)
    participant ST as Stream de la radio

    Build->>Build: import radios.json (build time)
    Build->>B: HTML estático con <Player radios=[...]>

    Note over B: El navegador NO fetcha radios.json

    B->>R: Hidratación (client:load)
    R->>R: localStorage → restaura radio y volumen
    U->>R: Elige radio + click en play
    R->>ST: audio.play() contra la URL del stream
    ST-->>R: Stream en vivo (continuo)
    R-->>B: 'playing' event → estado = playing
    R->>B: MediaSession → controles en lock screen
```

**Puntos clave:**

- El catálogo **viaja embebido** en el HTML: la isla lo recibe como prop serializada.
- El audio **nunca pasa por la app**: el `<audio>` se conecta directo al CDN de la radio, así que el consumo de ancho de banda del sitio es despreciable.
- Cambiar de radio solo reasigna `src` del `<audio>`; no hay peticiones intermedias.
- Preferencias (`ra:radio`, `ra:volume` en `localStorage`) se restauran post-hidratación para evitar mismatches con el HTML server-rendered.

## 🎛️ Máquina de estados del reproductor

El hook `useAudio` deriva el estado de los **eventos reales** del elemento `<audio>`:

```mermaid
stateDiagram-v2
    [*] --> Idle : carga inicial
    Idle --> Loading : play (con radio elegida)
    Loading --> Playing : evento 'playing'
    Playing --> Loading : evento 'waiting' (buffering)
    Playing --> Paused : pause() del usuario
    Loading --> Error : excepción en play()
    Error --> Idle : click en play (reintenta)
    Paused --> Loading : play (misma u otra radio)
```

**Reglas:**

- Sin radio elegida el botón está **deshabilitado** (no existe el "estado invertido sin nada sonando").
- `loading` es explícito: el botón muestra un **spinner** mientras conecta.
- Si el stream falla, el estado pasa a `error`, el botón se pinta con borde rojo y la línea de estado avisa; `click` reintenta.
- El `service worker` no interfiere con los streams: son cross-origin y Workbox solo maneja sus rutas registradas.

## 📡 Arquitectura PWA

Configurada íntegramente en [`astro.config.mjs`](astro.config.mjs) vía `@vite-pwa/astro`:

| Pieza | Archivo | Rol |
|---|---|---|
| Manifest | `dist/manifest.webmanifest` (generado) | Nombre, íconos, colores, `display: standalone` → instalable |
| Service Worker | `dist/sw.js` (generado, modo `generateSW`) | Precache del app shell: la UI carga incluso sin conexión |
| Registro | `dist/registerSW.js` (referenciado en `BaseLayout`) | `autoUpdate`: la próxima visita toma la versión nueva |
| Íconos | `public/icons/icon-{192,512}.png` | Instalación en Android/desktop; `apple-touch-icon` para iOS |
| Media Session | `useMediaSession.js` | Controles y metadatos en la pantalla de bloque |

**Qué se cachea y qué no:**

- ✅ Precache: HTML, CSS, JS, SVG, PNG, WebP del app shell (~259 KB).
- ❌ Streams de radio: en vivo y cross-origin, pasan directo a la red (Workbox solo intercepta sus rutas registradas).
- ℹ️ La lista de radios no se cachea por separado: va embebida en el HTML, que sí está precacheado.

> **Nota de implementación:** `@vite-pwa/astro` genera `manifest.webmanifest` y `registerSW.js` pero no los inyecta en el HTML producido por Astro; por eso `BaseLayout.astro` los referencia manualmente (`<link rel="manifest">` + `<script src="/registerSW.js">`).

## 🚢 Pipeline de deploy

```mermaid
flowchart LR
    A[git push a main] --> B[Netlify detecta el push]
    B --> C[npm install]
    C --> D[npm run build - Astro]
    D --> E[Publica dist/ en CDN]
    E --> F[radiosarg.netlify.app]
```

- Configuración: [`netlify.toml`](netlify.toml) define `command` y `publish`.
- Cada push a `main` genera un deploy; los Pull Requests generan previews automáticos.

## 📜 Historial de arquitectura

| Versión | Stack | Cambios |
|---|---|---|
| v1 | HTML + CSS + JS vanilla, Vite, Netlify | App funcional básica. Bugs de estado en el player, sin SEO, deploy mal configurado. |
| v1.5 | v1 + fixes | Estado del player corregido, meta tags, `netlify.toml` arreglado, JSDoc completo. Ver commit `fix:` en el historial. |
| v2 (actual) | Astro 5 + isla de React + PWA | Render estático con SEO, máquina de estados por eventos, catálogo en build time, PWA instalable con Media Session, assets optimizados (SVG, WebP, -67% de peso del fondo). |
| v2.1 | + Tailwind v4 | Migración completa de estilos a utilidades: tokens en `@theme`, capa custom reducida a lo no expresable (fondo, flecha del select, thumb del slider). CSS final tree-shakeado: 12.6 KB. |
