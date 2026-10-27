/**
 * RadioSelector — selector de emisoras.
 *
 * Glass oscuro (bg-white/5 + blur) para integrarse con el fondo;
 * la flecha celeste vive en la utilidad `select-arrow` (global.css)
 * y `.select-field` oscurece las opciones del dropdown nativo.
 *
 * El <option> placeholder (value="") representa "sin radio elegida":
 * mientras esté seleccionado, el botón de play queda deshabilitado.
 */
export default function RadioSelector({ radios, selectedUrl, onChange }) {
  return (
    <label>
      <span className="sr-only">Elegí una radio</span>
      <select
        className="select-field select-arrow appearance-none h-10 w-55 max-w-[80vw] cursor-pointer rounded-xl border border-white/10 bg-white/5 py-1 pl-10 pr-9 text-base font-bold text-fg backdrop-blur-sm hover:border-white/25 focus:border-celeste focus:outline-none max-[480px]:w-44"
        value={selectedUrl}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Elegí una radio"
      >
        <option value="">Elegí tu radio</option>
        {radios.map((radio) => (
          <option key={radio.id} value={radio.streamUrl}>
            {radio.dial ? `${radio.name} · ${radio.dial}` : radio.name}
          </option>
        ))}
      </select>
    </label>
  );
}
