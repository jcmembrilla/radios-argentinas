/**
 * ============================================================
 *  useAlmanac — fecha y clima automático, sin pedirle nada al usuario
 * ============================================================
 *
 *  Flujo (100% en el cliente, sin prompts de permisos):
 *    1. La fecha es local del dispositivo: disponible siempre.
 *    2. Cache en localStorage con TTL de 30 min → recargar no re-golpea
 *       las APIs.
 *    3. ipwho.is  → detecta lat/lon por IP (gratis, sin API key, HTTPS).
 *       ¿Por qué IP y no GPS? La API de geolocalización SIEMPRE muestra
 *       un prompt de permiso; por IP es invisible para el usuario.
 *    4. Open-Meteo → clima actual por coordenadas (gratis, sin API key,
 *       HTTPS). Los códigos WMO se traducen a español en WeatherIcon.
 *
 *  Degradación elegante:
 *    - IP falla  → queda solo la fecha.
 *    - Clima falla → queda solo la fecha.
 *    Nunca se rompe nada y no se muestran errores al usuario.
 */
import { useEffect, useState } from 'react';

const CACHE_KEY = 'ra:almanac';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutos

/** Traducción de códigos WMO de Open-Meteo a español + icono. */
export const WMO_CONDITIONS = {
  0: { label: 'Despejado', icon: 'sun' },
  1: { label: 'Casi despejado', icon: 'sun-cloud' },
  2: { label: 'Parcialmente nublado', icon: 'sun-cloud' },
  3: { label: 'Nublado', icon: 'cloud' },
  45: { label: 'Niebla', icon: 'fog' },
  48: { label: 'Niebla', icon: 'fog' },
  51: { label: 'Llovizna', icon: 'rain' },
  53: { label: 'Llovizna', icon: 'rain' },
  55: { label: 'Llovizna', icon: 'rain' },
  61: { label: 'Lluvia', icon: 'rain' },
  63: { label: 'Lluvia', icon: 'rain' },
  65: { label: 'Lluvia intensa', icon: 'rain' },
  66: { label: 'Lluvia helada', icon: 'rain' },
  67: { label: 'Lluvia helada', icon: 'rain' },
  71: { label: 'Nieve', icon: 'snow' },
  73: { label: 'Nieve', icon: 'snow' },
  75: { label: 'Nieve intensa', icon: 'snow' },
  77: { label: 'Granos de nieve', icon: 'snow' },
  80: { label: 'Chaparrones', icon: 'rain' },
  81: { label: 'Chaparrones', icon: 'rain' },
  82: { label: 'Chaparrones fuertes', icon: 'rain' },
  85: { label: 'Nevadas', icon: 'snow' },
  86: { label: 'Nevadas', icon: 'snow' },
  95: { label: 'Tormenta', icon: 'storm' },
  96: { label: 'Tormenta con granizo', icon: 'storm' },
  99: { label: 'Tormenta con granizo', icon: 'storm' },
};

/**
 * Formatea la fecha en español: "Martes, 27 de octubre".
 * @param {Date} date
 * @returns {string}
 */
function formatDate(date) {
  const s = date.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Obtiene fecha y clima actuales.
 * @returns {{ date: string, temp: number | null, condition: { label: string, icon: string } | null } | null}
 *          null durante el primer render (evita mismatch de hidratación:
 *          la fecha se calcula del lado del cliente, no en el build).
 */
export function useAlmanac() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;

    // La fecha se muestra de inmediato; el clima llega después (o nunca).
    setData({ date: formatDate(new Date()), temp: null, condition: null });

    async function loadWeather() {
      // --- 1. Cache fresca: ni siquiera consultamos las APIs ------------
      try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null');
        if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
          if (!cancelled) {
            setData({
              date: formatDate(new Date()),
              temp: cached.temp,
              condition: cached.condition,
            });
          }
          return;
        }
      } catch {
        // localStorage no disponible: seguimos igual
      }

      // --- 2. ipwho.is → coordenadas por IP (invisible para el usuario) -
      let coords;
      try {
        const res = await fetch('https://ipwho.is/');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const geo = await res.json();
        if (geo.success === false || geo.latitude == null) {
          throw new Error('ubicación no disponible');
        }
        coords = { latitude: geo.latitude, longitude: geo.longitude };
      } catch (error) {
        console.warn('Almanaque: sin ubicación, queda solo la fecha.', error);
        return;
      }

      // --- 3. Open-Meteo → clima actual --------------------------------
      try {
        const url = new URL('https://api.open-meteo.com/v1/forecast');
        url.searchParams.set('latitude', String(coords.latitude));
        url.searchParams.set('longitude', String(coords.longitude));
        url.searchParams.set('current', 'temperature_2m,weather_code,is_day');
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const wx = await res.json();

        const temp = Math.round(wx.current.temperature_2m);
        const code = wx.current.weather_code;
        const isDay = wx.current.is_day === 1;

        // De noche, "Despejado" con luna suena mejor que "Soleado"
        let condition = WMO_CONDITIONS[code] ?? { label: 'Despejado', icon: 'sun' };
        if (!isDay && (code === 0 || code === 1)) {
          condition = { label: 'Despejado', icon: 'moon' };
        }

        if (!cancelled) {
          setData({ date: formatDate(new Date()), temp, condition });
          try {
            localStorage.setItem(
              CACHE_KEY,
              JSON.stringify({ fetchedAt: Date.now(), temp, condition }),
            );
          } catch {}
        }
      } catch (error) {
        console.warn('Almanaque: sin clima, queda solo la fecha.', error);
      }
    }

    loadWeather();
    return () => {
      cancelled = true;
    };
  }, []);

  return data;
}
