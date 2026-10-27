/**
 * VolumeSlider — control de volumen (input range nativo).
 *
 * El track se "llena" de celeste hasta el porcentaje actual mediante un
 * gradiente inline (los pseudo-elementos del thumb viven en global.css,
 * clase .range-field: son lo único que las utilidades no pueden tocar).
 */
export default function VolumeSlider({ volume, onChange }) {
  const percentage = Math.round(volume * 100);

  // Relleno dinámico: celeste hasta `percentage`, gris después
  const fill = `linear-gradient(to right, var(--color-celeste) ${percentage}%, rgba(255,255,255,0.15) ${percentage}%)`;

  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={(event) => onChange(parseFloat(event.target.value))}
        style={{ background: fill }}
        className="range-field h-1.5 w-50 max-w-[55vw] cursor-pointer rounded-full max-[480px]:w-40"
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
