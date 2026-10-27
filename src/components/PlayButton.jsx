/**
 * PlayButton — botón central de play/pause.
 * SVG inline (play/pause) + spinner mientras conecta: cero imágenes PNG.
 *
 * Estados visuales:
 *  - playing  → icono pausa
 *  - loading  → spinner (conectando al stream)
 *  - error    → icono play con borde rojo
 *  - default  → icono play
 *
 *  Tamaños: 140px base, 110px en pantallas ≤ 480px.
 */
import { PLAYER_STATE } from '../hooks/useAudio.js';

export default function PlayButton({ state, onToggle, disabled }) {
  const isPlaying = state === PLAYER_STATE.PLAYING;
  const isLoading = state === PLAYER_STATE.LOADING;
  const isError = state === PLAYER_STATE.ERROR;

  const label = isPlaying
    ? 'Pausar la radio'
    : disabled
      ? 'Elegí una radio primero'
      : 'Reproducir la radio';

  return (
    <button
      type="button"
      className={[
        // Círculo con borde sutil + feedback de hover y press
        'grid size-35 place-items-center rounded-full border-2 border-white/25',
        'bg-white/5 text-fg transition',
        'hover:border-white/50 hover:bg-white/12 active:scale-96',
        'disabled:cursor-not-allowed disabled:opacity-45',
        // Pantallas chicas
        'max-[480px]:size-28',
        // Error: borde rojo hasta reintentar
        isError ? 'border-danger' : '',
      ].join(' ')}
      onClick={onToggle}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      {isLoading ? (
        // Spinner: feedback mientras se conecta con el stream
        <span
          className="size-12 animate-spin rounded-full border-4 border-white/25 border-t-celeste motion-reduce:[animation-duration:2s] max-[480px]:size-10"
          aria-hidden="true"
        />
      ) : isPlaying ? (
        // Icono de pausa
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-14 max-[480px]:size-11">
          <path d="M6 5h4v14H6zM14 5h4v14h-4z" fill="currentColor" />
        </svg>
      ) : (
        // Icono de play
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-14 max-[480px]:size-11">
          <path d="M8 5v14l11-7z" fill="currentColor" />
        </svg>
      )}
    </button>
  );
}
