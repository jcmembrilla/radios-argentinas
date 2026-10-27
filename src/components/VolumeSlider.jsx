/**
 * VolumeSlider — control de volumen (input range nativo).
 *
 * Centrado: el contenedor mide EXACTAMENTE lo que el track (w-50), así el
 * track queda centrado bajo el botón por el flex del player; el % flota
 * fuera del flujo (absolute) para no desplazarlo.
 *
 * El track se "llena" de celeste hasta el porcentaje actual mediante un
 * gradiente inline; el pulgar vive en global.css (.range-field).
 */
export default function VolumeSlider({ volume, onChange }) {
  const percentage = Math.round(volume * 100);

  // Relleno dinámico: celeste hasta `percentage`, gris después
  const fill = `linear-gradient(to right, var(--color-celeste) ${percentage}%, rgba(255,255,255,0.15) ${percentage}%)`;

  return (
    <div className="relative w-50 max-[480px]:w-40">
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={(event) => onChange(parseFloat(event.target.value))}
        style={{ background: fill }}
        className="range-field h-1.5 w-full cursor-pointer rounded-full"
        aria-label="Volumen"
      />
      <output
        className="absolute top-1/2 -right-12 -translate-y-1/2 text-[0.85rem] tabular-nums text-white/70"
        aria-hidden="true"
      >
        {percentage}%
      </output>
    </div>
  );
}
