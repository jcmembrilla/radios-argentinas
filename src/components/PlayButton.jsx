/**
 * PlayButton — botón central de play/pause.
 *
 * Dirección de arte v3: círculo glass con aro celeste y glow al hover;
 * iconos con gradiente blanco→celeste. SVG inline (cero imágenes) +
 * spinner mientras conecta.
 *
 * Estados visuales:
 *  - playing  → icono pausa
 *  - loading  → spinner (conectando al stream)
 *  - error    → borde rojo, sin glow
 *  - default  → icono play
 *
 *  Tamaños: 140px base, 110px en pantallas ≤ 480px.
 */
import { PLAYER_STATE } from '../hooks/useAudio.js';

/** Gradiente compartido por los iconos (blanco arriba → celeste abajo). */
const ICON_GRADIENT = (
  <defs>
    <linearGradient id="icon-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#f6f6f6" />
      <stop offset="1" stopColor="#74acdf" />
    </linearGradient>
  </defs>
);

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
        // Círculo glass con aro celeste + glow sutil
        'grid size-35 place-items-center rounded-full border border-celeste/40',
        'bg-gradient-to-b from-white/10 to-white/[0.03] text-fg',
        'shadow-[0_0_40px_-10px_rgba(116,172,223,0.45)]',
        'transition duration-200',
        // Hover: glow más intenso; press: se achica levemente
        'hover:border-celeste hover:shadow-[0_0_55px_-8px_rgba(116,172,223,0.6)]',
        'active:scale-95',
        'disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none',
        // Pantallas chicas
        'max-[480px]:size-28',
        // Error: borde rojo, el glow se apaga
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
          className="size-12 animate-spin rounded-full border-4 border-white/15 border-t-celeste motion-reduce:[animation-duration:2s] max-[480px]:size-10"
          aria-hidden="true"
        />
      ) : isPlaying ? (
        // Icono de pausa
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-14 max-[480px]:size-11">
          {ICON_GRADIENT}
          <path d="M6 5h4v14H6zM14 5h4v14h-4z" fill="url(#icon-grad)" />
        </svg>
      ) : (
        // Icono de play
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-14 max-[480px]:size-11">
          {ICON_GRADIENT}
          <path d="M8 5v14l11-7z" fill="url(#icon-grad)" />
        </svg>
      )}
    </button>
  );
}
