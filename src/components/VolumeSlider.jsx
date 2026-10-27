/**
 * VolumeSlider — control de volumen (input range nativo estilizado).
 * Muestra el porcentaje al costado. El estilo del track/thumb vive en
 * global.css (necesita prefijos -webkit/-moz).
 */
export default function VolumeSlider({ volume, onChange }) {
  const percentage = Math.round(volume * 100);

  return (
    <div className="volume">
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={(event) => onChange(parseFloat(event.target.value))}
        className="volume__slider"
        aria-label="Volumen"
      />
      <output className="volume__value" aria-hidden="true">
        {percentage}%
      </output>
    </div>
  );
}
