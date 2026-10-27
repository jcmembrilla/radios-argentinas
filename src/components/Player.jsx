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

/** Mensaje de estado según el estado del player y la radio elegida. */
function statusMessage(state, radioName) {
  switch (state) {
    case PLAYER_STATE.PLAYING:
      return `Escuchando ${radioName}`;
    case PLAYER_STATE.LOADING:
      return `Conectando con ${radioName}…`;
    case PLAYER_STATE.PAUSED:
      return 'En pausa';
    case PLAYER_STATE.ERROR:
      return `No se pudo conectar con ${radioName}`;
    default:
      return 'Elegí una radio para empezar';
  }
}

export default function Player({ radios }) {
  const { state, play, pause, toggle, volume, setVolume } = useAudio();

  // Radio elegida: '' = ninguna. Se setea post-hidratación desde
  // localStorage para evitar mismatches de hidratación con el SSR de Astro.
  const [selectedUrl, setSelectedUrl] = useState('');

  // --- Restauración de preferencias (una vez, al montar) -----------------
  useEffect(() => {
    try {
      const savedUrl = localStorage.getItem(STORAGE_KEYS.radio);
      if (savedUrl && radios.some((r) => r.url === savedUrl)) {
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
    () => radios.find((r) => r.url === selectedUrl),
    [radios, selectedUrl],
  );

  const handleToggle = useCallback(() => {
    toggle(selectedUrl);
  }, [toggle, selectedUrl]);

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
      {/* Botón play/pause: deshabilitado hasta elegir una radio */}
      <PlayButton
        state={state}
        onToggle={handleToggle}
        disabled={!selectedUrl}
      />

      <VolumeSlider volume={volume} onChange={setVolume} />

      <RadioSelector
        radios={radios}
        selectedUrl={selectedUrl}
        onChange={setSelectedUrl}
      />

      {/* Estado para lectores de pantalla y feedback visual */}
      <p className="min-h-6 text-[0.95rem] text-white/70" role="status" aria-live="polite">
        {statusMessage(state, selectedRadio?.name ?? '')}
      </p>
    </div>
  );
}
