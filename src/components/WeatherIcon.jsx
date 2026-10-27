/**
 * WeatherIcon — íconos del clima en SVG inline (estilo trazo minimalista).
 * Se recolorean con CSS (currentColor) y no agregan requests.
 *
 * Íconos disponibles (mapa en useAlmanac.js → WMO_CONDITIONS):
 *   sun · moon · sun-cloud · cloud · fog · rain · snow · storm
 */

// Nube "elevada" (base común para lluvia/nieve/tormenta/niebla)
const CLOUD_HIGH =
  'M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242';

// Nube completa (nublado)
const CLOUD_FULL = 'M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z';

const ICON_PATHS = {
  // Sol: círculo + 8 rayos
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </>
  ),
  // Luna creciente
  moon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />,
  // Sol con nube (parcialmente nublado)
  'sun-cloud': (
    <>
      <path d="M12 2v2M4.93 4.93l1.41 1.41M20 12h2M19.07 4.93l-1.41 1.41M15.947 12.65a4 4 0 0 0-5.925-4.128" />
      <path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z" />
    </>
  ),
  // Nube completa
  cloud: <path d={CLOUD_FULL} />,
  // Niebla: nube + líneas de niebla
  fog: (
    <>
      <path d={CLOUD_HIGH} />
      <path d="M3 18h18M6 21h12" />
    </>
  ),
  // Lluvia: nube + gotas
  rain: (
    <>
      <path d={CLOUD_HIGH} />
      <path d="M16 14v6M8 14v6M12 16v6" />
    </>
  ),
  // Nieve: nube + copos
  snow: (
    <>
      <path d={CLOUD_HIGH} />
      <path d="M8 14v4M12 16v4M16 14v4" />
    </>
  ),
  // Tormenta: nube + rayo
  storm: (
    <>
      <path d={CLOUD_HIGH} />
      <path d="m13 12-3 5h4l-3 5" />
    </>
  ),
};

/**
 * @param {object} props
 * @param {string} props.icon     - Clave del ícono (WMO_CONDITIONS.icon)
 * @param {string} [props.className] - Clases Tailwind para tamaño/color
 */
export default function WeatherIcon({ icon, className = 'size-4' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICON_PATHS[icon] ?? ICON_PATHS.sun}
    </svg>
  );
}
