/**
 * PlayButton — botón central de play/pause.
 * Reemplaza a los dos PNG de la versión vanilla por SVG inline:
 * se recolorea con CSS y ahorra dos requests.
 *
 * Estados visuales:
 *  - playing  → icono pausa
 *  - loading  → spinner (conectando al stream)
 *  - error    → icono play con borde rojo
 *  - default  → icono play
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
      className={`play-button${isError ? ' play-button--error' : ''}`}
      onClick={onToggle}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      {isLoading ? (
        <span className="play-button__spinner" aria-hidden="true" />
      ) : isPlaying ? (
        // Icono de pausa
        <svg viewBox="0 0 24 24" aria-hidden="true" className="play-button__icon">
          <path d="M6 5h4v14H6zM14 5h4v14h-4z" fill="currentColor" />
        </svg>
      ) : (
        // Icono de play
        <svg viewBox="0 0 24 24" aria-hidden="true" className="play-button__icon">
          <path d="M8 5v14l11-7z" fill="currentColor" />
        </svg>
      )}
    </button>
  );
}
