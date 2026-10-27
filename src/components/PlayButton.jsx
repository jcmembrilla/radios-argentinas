/**
 * PlayButton — botón de encendido con dial de sintonía.
 *
 * Modelo de una radio real: el dial y el botón son cosas distintas.
 *  - El BOTÓN es el encendido: solo alterna play/pausa. Su ícono
 *    refleja el estado real — ⏸ mientras suena, ▶ pausado o apagado.
 *  - El DIAL es la sintonía: cada emisora tiene su lugar en la escala
 *    (360° / n emisoras) y solo gira cuando cambia el selector — ahí
 *    hay un cambio real de radio. Sin cambio de selector, quieto.
 *
 * El dial (CSS puro, sin librerías):
 *  - Escala graduada que rota: ticks finos (cada 10°) + ticks de
 *    emisora (cada 30°) + marca dorada en la posición OFF.
 *  - Aguja lectora FIJA arriba (punto glow): la escala pasa por
 *    debajo, como en un dial real.
 *  - La marca dorada es clave: un anillo uniforme rotado un múltiplo
 *    de su período es indistinguible; el acento hace visible todo
 *    giro, por chico que sea. Queda a medio paso antes de la emisora 1:
 *    al apagarse, el dial "descansa" en OFF con la marca bajo la aguja.
 *  - Overshoot mecánico: cubic-bezier con rebote al asentar (700ms).
 *  - motion-reduce: sin transiciones.
 *
 * Estados visuales:
 *  - playing  → ⏸
 *  - paused   → ▶ (reanudar)
 *  - loading  → spinner (conectando al stream)
 *  - error    → ▶ + escala roja (reintentar)
 *  - idle     → ▶ (sin emisora; dial en OFF, botón deshabilitado)
 */
import { PLAYER_STATE } from '../hooks/useAudio.js';

/** Gradiente de los iconos (blanco arriba → celeste abajo), por-svg (ids únicos). */
const GRADIENT_DEFS = (id) => (
  <defs>
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#f6f6f6" />
      <stop offset="1" stopColor="#74acdf" />
    </linearGradient>
  </defs>
);

/** Easing con rebote: pasa de largo y vuelve a asentar (efecto "clic"). */
const DIAL_TIMING = 'duration-700 ease-[cubic-bezier(.34,1.56,.64,1)]';

export default function PlayButton({
  state,
  onToggle,
  disabled,
  stationIndex = -1,
  stationCount = 1,
}) {
  const isPlaying = state === PLAYER_STATE.PLAYING;
  const isLoading = state === PLAYER_STATE.LOADING;
  const isError = state === PLAYER_STATE.ERROR;

  // --- Sintonía: el ángulo SE DERIVA de la emisora elegida ----------------
  // Girar la escala trae la posición de la emisora bajo la aguja fija.
  // Sin emisora → OFF (marca dorada bajo la aguja, medio paso antes de
  // la emisora 1). Al restaurar la sesión, el render inicial va directo
  // al ángulo final: el dial aparece ya sintonizado, sin animación fake.
  const step = 360 / Math.max(stationCount, 1);
  const dialAngle = stationIndex >= 0 ? -step * stationIndex : step / 2;

  // Ícono = estado real: ⏸ solo mientras suena
  const showPause = isPlaying;

  // La etiqueta describe la ACCIÓN del click; el ícono, el modo actual
  const label = isPlaying
    ? 'Pausar la radio'
    : state === PLAYER_STATE.PAUSED
      ? 'Reanudar la radio'
      : disabled
        ? 'Elegí una radio primero'
        : 'Reproducir la radio';

  return (
    <button
      type="button"
      className={[
        'relative grid size-35 place-items-center rounded-full',
        'bg-gradient-to-b from-white/10 to-white/[0.03] text-fg',
        'shadow-[0_0_40px_-10px_rgba(116,172,223,0.45)]',
        'transition duration-200',
        'hover:shadow-[0_0_55px_-8px_rgba(116,172,223,0.6)]',
        'active:scale-95',
        'disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none',
        'max-[480px]:size-28',
      ].join(' ')}
      onClick={onToggle}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      {/* Escala del dial: rota hasta traer la emisora bajo la aguja */}
      <span
        aria-hidden="true"
        className={`absolute inset-0 transition-transform ${DIAL_TIMING} motion-reduce:transition-none`}
        style={{ transform: `rotate(${dialAngle}deg)` }}
      >
        <svg viewBox="0 0 100 100" className="absolute inset-0 size-full">
          {/* Graduación menor: 36 ticks finos (cada 10°) */}
          <circle
            cx="50"
            cy="50"
            r="47.5"
            fill="none"
            // circunferencia ≈ 298.45 → 8.29 por período (298.45 / 36)
            strokeDasharray="1 7.29"
            strokeLinecap="round"
            strokeWidth="2"
            stroke={isError ? 'rgba(229, 72, 77, 0.3)' : 'rgba(246, 246, 246, 0.14)'}
          />
          {/* Graduación mayor: 12 ticks de emisora (cada 30°) */}
          <circle
            cx="50"
            cy="50"
            r="47.5"
            fill="none"
            // circunferencia ≈ 298.45 → 24.87 por período (298.45 / 12)
            strokeDasharray="2 22.87"
            strokeLinecap="round"
            strokeWidth="3"
            stroke={isError ? '#e5484d' : 'rgba(246, 246, 246, 0.35)'}
          />
          {/* Marca dorada de OFF (medio paso antes de la emisora 1) */}
          <rect
            x="48.5"
            y="2"
            width="3"
            height="8"
            rx="1.5"
            fill="#f6b40e"
            transform="rotate(-15 50 50)"
          />
        </svg>
      </span>

      {/* Aguja lectora: FIJA arriba — la escala gira por debajo */}
      <span aria-hidden="true" className="absolute inset-0">
        <span
          className={[
            'absolute -top-[4px] left-1/2 size-2 -translate-x-1/2 rounded-full',
            isError
              ? 'bg-danger'
              : 'bg-celeste-soft shadow-[0_0_8px_rgba(116,172,223,0.9)]',
          ].join(' ')}
        />
      </span>

      {isLoading ? (
        // Spinner: feedback mientras se conecta con el stream
        <span
          className="size-12 animate-spin rounded-full border-4 border-white/15 border-t-celeste motion-reduce:[animation-duration:2s] max-[480px]:size-10"
          aria-hidden="true"
        />
      ) : (
        // Crossfade ▶/⏸ según el estado real (▶ también al pausar)
        <span className="relative size-14 max-[480px]:size-11">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className={`absolute inset-0 transition-all duration-300 motion-reduce:transition-none ${
              showPause ? 'scale-50 rotate-12 opacity-0' : 'scale-100 rotate-0 opacity-100'
            }`}
          >
            {GRADIENT_DEFS('icon-grad-play')}
            <path d="M8 5v14l11-7z" fill="url(#icon-grad-play)" />
          </svg>
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className={`absolute inset-0 transition-all duration-300 motion-reduce:transition-none ${
              showPause ? 'scale-100 rotate-0 opacity-100' : 'scale-50 -rotate-12 opacity-0'
            }`}
          >
            {GRADIENT_DEFS('icon-grad-pause')}
            <path d="M6 5h4v14H6zM14 5h4v14h-4z" fill="url(#icon-grad-pause)" />
          </svg>
        </span>
      )}
    </button>
  );
}
