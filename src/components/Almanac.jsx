/**
 * Almanaque — pill del footer con fecha y clima actual.
 *
 * Renderiza la fecha al instante (local del dispositivo) y suma
 * temperatura + condición cuando llegan (o nunca, si fallan las APIs:
 * ver useAlmanac.js). Isla client:idle: no compite con el player.
 */
import { useAlmanac } from '../hooks/useAlmanac.js';
import WeatherIcon from './WeatherIcon.jsx';

export default function Almanac() {
  const almanac = useAlmanac();

  if (!almanac) return null;

  const { date, temp, condition } = almanac;

  return (
    <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[0.85rem] text-white/70">
      <span>{date}</span>
      {/* El clima es opcional: si no hay datos, la pill muestra solo la fecha */}
      {temp !== null && condition && (
        <>
          <span aria-hidden="true" className="text-white/25">
            ·
          </span>
          <span className="font-medium text-fg">{temp}°</span>
          <span>{condition.label}</span>
          <WeatherIcon icon={condition.icon} className="size-4 text-celeste" />
        </>
      )}
    </p>
  );
}
