/**
 * PlayButton — botón perilla de radio.
 *
 * Comportamiento de "modo radio":
 *  - ▶ solo en idle/error (pide una acción al usuario).
 *  - Una vez elegida la emisora, ⏸ se mantiene esté sonando o en pausa:
 *    el botón indica que la radio está "prendida", y el mismo click
 *    alterna (como una perilla en ON).
 *
 * Animación (CSS puro, sin librerías):
 *  - Muesca celeste en el aro que gira 72° por press (5 posiciones/vuelta),
 *    como el dial de una radio antigua.
 *  - Crossfade play↔pausa con mini-rotación.
 *  - motion-reduce: sin transiciones.
 *
 * Estados visuales:
 *  - playing  → ⏸ visible + muesca girando por press
 *  - paused   → ⏸ visible (modo radio en pausa)
 *  - loading  → spinner (conectando al stream)
 *  - error    → ▶ + aro rojo (reintentar)
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

export default function PlayButton({ state, onToggle, disabled }) {
  const isPlaying = state === PLAYER_STATE.PLAYING;
  const isLoading = state === PLAYER_STATE.LOADING;
  const isError = state === PLAYER_STATE.ERROR;

  // Modo radio: emisora elegida y el botón en ON (sonando o pausado)
  const inRadioMode = isPlaying || state === PLAYER_STATE.PAUSED;

  // Perilla: cada press gira la muesca 72° (5 posiciones por vuelta)
  const [notchAngle, setNotchAngle] = useState(0);

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
        setNotchAngle((a) => a + 72);
        onToggle();
      }}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      {/* Aro de la perilla: la muesca gira 72° por cada press.
          (el aro gira con la muesca; al ser uniforme, solo la muesca
          parece moverse — como un dial real) */}
      <span
        aria-hidden="true"
        className={[
          'absolute inset-0 rounded-full border transition-[transform,border-color]',
          'duration-500 ease-out motion-reduce:transition-none',
          isError ? 'border-danger' : 'border-celeste/40',
        ].join(' ')}
        style={{ transform: `rotate(${notchAngle}deg)` }}
      >
        <span
          className={[
            'absolute -top-[3px] left-1/2 size-1.5 -translate-x-1/2 rounded-full',
            isError
              ? 'bg-danger'
              : 'bg-celeste-soft shadow-[0_0_6px_rgba(116,172,223,0.9)]',
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
