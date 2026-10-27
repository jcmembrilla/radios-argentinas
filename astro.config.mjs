// ============================================================
//  Configuración de Astro — Radios Argentinas
// ============================================================
//  Integraciones:
//  - react: habilita islas de React (el reproductor se hidrata client:load)
//  - vitePWA: service worker + manifest (app instalable, controles de lock screen)
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import pwa from '@vite-pwa/astro';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Tailwind v4 se integra como plugin de Vite (sin integración de Astro)
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    react(),
    pwa({
      // El SW se actualiza solo: la próxima visita toma la nueva versión
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: 'Radios Argentinas',
        short_name: 'Radios AR',
        description:
          'Escuchá en vivo las principales radios AM y FM de Argentina.',
        lang: 'es',
        theme_color: '#0b0b0b',
        background_color: '#0b0b0b',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precachea el app shell (HTML/CSS/JS/imgs) para que la UI
        // cargue incluso sin conexión. La lista de radios va embebida en la
        // página (importada en build time), así que tampoco necesita caché.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Los streams de radio NO se cachean: son en vivo y de otro origen.
        // Workbox solo intercepta URLs que coinciden con sus rutas; todo lo
        // demás (cross-origin, media) pasa directo a la red.
        navigateFallback: '/index.html',
      },
    }),
  ],
});
