/**
 * RadioSelector — selector de emisoras.
 * El <option> placeholder (value="") representa "sin radio elegida":
 * mientras esté seleccionado, el botón de play queda deshabilitado.
 * select-arrow (global.css) agrega la flecha custom sin imagen extra.
 */
export default function RadioSelector({ radios, selectedUrl, onChange }) {
  return (
    <label>
      <span className="sr-only">Elegí una radio</span>
      <select
        className="select-arrow h-10 w-55 max-w-[80vw] cursor-pointer rounded-[10px] border border-[#ddd] bg-white py-1 pl-10 pr-9 text-base font-bold text-[#333] hover:border-[#ccc] focus:border-celeste focus:outline-none"
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
