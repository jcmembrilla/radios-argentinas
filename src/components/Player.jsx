/**
 * ============================================================
 *  Player — isla de React (única parte interactiva de la app)
 * ============================================================
 *
 *  Orquesta los sub-componentes y conecta la UI con los hooks:
 *  - useAudio: máquina de estados del stream
 *  - useMediaSession: controles del sistema operativo
 *
 *  La lista de radios llega como prop desde Astro (importada en build
 *  time desde src/data/radios.json): cero requests en el navegador.
 *
 *  Persistencia: guarda radio elegida y volumen en localStorage y los
 *  restaura en la próxima visita.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import PlayButton from './PlayButton.jsx';
import VolumeSlider from './VolumeSlider.jsx';
import RadioSelector from './RadioSelector.jsx';
import { PLAYER_STATE, useAudio } from '../hooks/useAudio.js';
import { useMediaSession } from '../hooks/useMediaSession.js';

const STORAGE_KEYS = {
  radio: 'ra:radio',
  volume: 'ra:volume',
};

/** Contenido de la línea de estado según el estado del player y la radio elegida. */
function statusContent(state, radioName) {
  switch (state) {
    case PLAYER_STATE.PLAYING:
      return (
        <>
          Escuchando <span className="text-celeste">{radioName}</span>
        </>
      );
    case PLAYER_STATE.LOADING:
      return (
        <>
          Conectando con <span className="text-celeste">{radioName}</span>…
        </>
      );
    case PLAYER_STATE.PAUSED:
      return 'En pausa';
    case PLAYER_STATE.ERROR:
      return (
        <>
          No se pudo conectar con <span className="text-celeste">{radioName}</span>
        </>
      );
    default:
      return 'Elegí una radio para empezar';
  }
}

export default function Player({ radios }) {
  const { state, play, pause, select, toggle, volume, setVolume } = useAudio();

  // Radio elegida: '' = ninguna. Se setea post-hidratación desde
  // localStorage para evitar mismatches de hidratación con el SSR de Astro.
  const [selectedUrl, setSelectedUrl] = useState('');

  // --- Restauración de preferencias (una vez, al montar) -----------------
  useEffect(() => {
    try {
      const savedUrl = localStorage.getItem(STORAGE_KEYS.radio);
      if (savedUrl && radios.some((r) => r.streamUrl === savedUrl)) {
        setSelectedUrl(savedUrl);
      }
      const savedVolume = localStorage.getItem(STORAGE_KEYS.volume);
      if (savedVolume !== null) setVolume(parseFloat(savedVolume));
    } catch {
      // localStorage puede fallar en modo privado: la app funciona igual
    }
  }, [radios, setVolume]);

  // --- Persistencia de cambios -------------------------------------------
  useEffect(() => {
    if (selectedUrl) {
      try {
        localStorage.setItem(STORAGE_KEYS.radio, selectedUrl);
      } catch {}
    }
  }, [selectedUrl]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.volume, String(volume));
    } catch {}
  }, [volume]);

  // --- Datos derivados ----------------------------------------------------
  const selectedRadio = useMemo(
    () => radios.find((r) => r.streamUrl === selectedUrl),
    [radios, selectedUrl],
  );

  // Índice de la emisora elegida en la lista (-1 si no hay): posiciona el
  // dial del PlayButton (cada emisora tiene su lugar en la escala).
  const stationIndex = radios.indexOf(selectedRadio);

  const handleToggle = useCallback(() => {
    toggle(selectedUrl);
  }, [toggle, selectedUrl]);

  /**
   * El selector es quien maneja el cambio de emisora:
   * actualiza la selección y le pasa la decisión a useAudio (select),
   * que reproduce la nueva si la radio estaba prendida.
   */
  const handleSelect = useCallback(
    (url) => {
      setSelectedUrl(url);
      select(url);
    },
    [select],
  );

  const handlePlay = useCallback(() => {
    if (selectedUrl) play(selectedUrl);
  }, [play, selectedUrl]);

  // --- Media Session (lock screen / auriculares) --------------------------
  useMediaSession({
    stationName: selectedRadio?.name,
    state,
    onPlay: handlePlay,
    onPause: pause,
  });

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Encendido + dial de sintonía: el dial refleja la emisora elegida;
          deshabilitado hasta elegir una radio */}
      <PlayButton
        state={state}
        onToggle={handleToggle}
        disabled={!selectedUrl}
        stationIndex={stationIndex}
        stationCount={radios.length}
      />

      <VolumeSlider volume={volume} onChange={setVolume} />

      <RadioSelector
        radios={radios}
        selectedUrl={selectedUrl}
        onChange={handleSelect}
      />

      {/* Estado para lectores de pantalla y feedback visual */}
      <p className="min-h-6 text-[0.95rem] text-white/70" role="status" aria-live="polite">
        {statusContent(state, selectedRadio?.name ?? '')}
      </p>

      {/* Género de la emisora (del catálogo): solo si tiene uno */}
      {selectedRadio?.genre && (
        <p className="-mt-4 text-[0.8rem] text-white/45">{selectedRadio.genre}</p>
      )}
    </div>
  );
}
