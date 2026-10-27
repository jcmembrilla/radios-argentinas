/**
 * VolumeSlider — control de volumen (input range nativo).
 * - Base del track con utilidades; el pulgar vive en global.css
 *   (.range-field: pseudo-elementos ::-webkit/::-moz).
 * - Muestra el porcentaje al costado.
 */
export default function VolumeSlider({ volume, onChange }) {
  const percentage = Math.round(volume * 100);

  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={(event) => onChange(parseFloat(event.target.value))}
        className="range-field h-1.5 w-50 max-w-[55vw] cursor-pointer rounded-full bg-white/25 max-[480px]:w-40"
        aria-label="Volumen"
      />
      <output
        className="min-w-9 text-[0.85rem] tabular-nums text-white/70"
        aria-hidden="true"
      >
        {percentage}%
      </output>
    </div>
  );
}
