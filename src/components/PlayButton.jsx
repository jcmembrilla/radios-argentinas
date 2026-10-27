/**
 * PlayButton — botón perilla de radio con dial de detents.
 *
 * Comportamiento de "modo radio":
 *  - ▶ solo en idle/error (pide una acción al usuario).
 *  - Una vez elegida la emisora, ⏸ se mantiene esté sonando o en pausa:
 *    el botón indica que la radio está "prendida", y el mismo click
 *    alterna (como una perilla en ON).
 *
 * El dial (CSS puro, sin librerías):
 *  - Anillo de ticks (detents): círculo SVG punteado que rota 30° por
 *    press — los ticks "encastran" en la próxima posición.
 *  - Aguja (muesca celeste): gira 180° por press, como un selector.
 *  - Overshoot mecánico: cubic-bezier con rebote al asentar (700ms).
 *  - motion-reduce: sin transiciones.
 *
 * Estados visuales:
 *  - playing  → ⏸ visible + dial girando por press
 *  - paused   → ⏸ visible (modo radio en pausa)
 *  - loading  → spinner (conectando al stream)
 *  - error    → ▶ + dial rojo (reintentar)
 *  - default  → ▶
 */
import { useState } from 'react';
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

export default function PlayButton({ state, onToggle, disabled }) {
  const isPlaying = state === PLAYER_STATE.PLAYING;
  const isLoading = state === PLAYER_STATE.LOADING;
  const isError = state === PLAYER_STATE.ERROR;

  // Modo radio: emisora elegida y el botón en ON (sonando o pausado)
  const inRadioMode = isPlaying || state === PLAYER_STATE.PAUSED;

  // Dial: 12 detents → el anillo avanza 30° por press; la aguja gira 180°
  const [dialAngle, setDialAngle] = useState(0);
  const [needleAngle, setNeedleAngle] = useState(0);

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
      onClick={() => {
        setDialAngle((a) => a + 30);
        setNeedleAngle((a) => a + 180);
        onToggle();
      }}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      {/* Anillo de detents: círculo punteado (12 ticks), rota 30° por press */}
      <span
        aria-hidden="true"
        className={`absolute inset-0 transition-transform ${DIAL_TIMING} motion-reduce:transition-none`}
        style={{ transform: `rotate(${dialAngle}deg)` }}
      >
        <svg viewBox="0 0 100 100" className="absolute inset-0 size-full">
          <circle
            cx="50"
            cy="50"
            r="47.5"
            fill="none"
            // 12 marcas: circunferencia ≈ 298.5 → dasharray 1 + 23.87 por tick
            strokeDasharray="1 23.87"
            strokeLinecap="round"
            strokeWidth="2.5"
            stroke={isError ? '#e5484d' : 'rgba(246, 246, 246, 0.25)'}
          />
        </svg>
      </span>

      {/* Aguja (muesca celeste): gira 180° por press, como selector */}
      <span
        aria-hidden="true"
        className={`absolute inset-0 transition-transform ${DIAL_TIMING} motion-reduce:transition-none`}
        style={{ transform: `rotate(${needleAngle}deg)` }}
      >
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
        // Crossfade play↔pausa (⏸ permanece visible en modo radio)
        <span className="relative size-14 max-[480px]:size-11">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className={`absolute inset-0 transition-all duration-300 motion-reduce:transition-none ${
              inRadioMode ? 'scale-50 rotate-12 opacity-0' : 'scale-100 rotate-0 opacity-100'
            }`}
          >
            {GRADIENT_DEFS('icon-grad-play')}
            <path d="M8 5v14l11-7z" fill="url(#icon-grad-play)" />
          </svg>
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className={`absolute inset-0 transition-all duration-300 motion-reduce:transition-none ${
              inRadioMode ? 'scale-100 rotate-0 opacity-100' : 'scale-50 -rotate-12 opacity-0'
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
