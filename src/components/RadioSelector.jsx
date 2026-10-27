/**
 * RadioSelector — selector de emisoras.
 * El <option> placeholder (value="") representa "sin radio elegida":
 * mientras esté seleccionado, el botón de play queda deshabilitado.
 */
export default function RadioSelector({ radios, selectedUrl, onChange }) {
  return (
    <label className="selector">
      <span className="sr-only">Elegí una radio</span>
      <select
        className="selector__select"
        value={selectedUrl}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Elegí una radio"
      >
        <option value="">Elegí tu radio</option>
        {radios.map((radio) => (
          <option key={radio.key} value={radio.url}>
            {radio.name}
          </option>
        ))}
      </select>
    </label>
  );
}
