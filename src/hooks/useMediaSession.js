/**
 * ============================================================
 *  useMediaSession — controles en la pantalla de bloque
 * ============================================================
 *
 *  Integra la Media Session API para que, en el celular, la radio aparezca
 *  como reproductor del sistema: título de la emisora en el lock screen y
 *  botones play/pause del hardware/auriculares funcionales.
 *
 *  No-op en navegadores sin soporte (desktop la mayoría ya lo tiene).
 */
import { useEffect } from 'react';
import { PLAYER_STATE } from './useAudio.js';

/**
 * Sincroniza el estado del reproductor con el sistema operativo.
 * @param {object} params
 * @param {string} params.stationName - Nombre de la radio actual.
 * @param {string} params.state       - Estado del player (PLAYER_STATE).
 * @param {() => void} params.onPlay  - Acción para el botón play del SO.
 * @param {() => void} params.onPause - Acción para el botón pause del SO.
 */
export function useMediaSession({ stationName, state, onPlay, onPause }) {
  // Metadatos + handlers de los botones del sistema
  useEffect(() => {
    if (!('mediaSession' in navigator)) return undefined;

    const mediaSession = navigator.mediaSession;
    mediaSession.metadata = new window.MediaMetadata({
      title: stationName || 'Radios Argentinas',
      artist: 'En vivo · AM/FM',
      album: 'Radios Argentinas',
      artwork: [
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    });

    mediaSession.setActionHandler('play', onPlay);
    mediaSession.setActionHandler('pause', onPause);

    return () => {
      mediaSession.setActionHandler('play', null);
      mediaSession.setActionHandler('pause', null);
    };
  }, [stationName, onPlay, onPause]);

  // Estado de reproducción visible en el lock screen
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.playbackState =
      state === PLAYER_STATE.PLAYING ? 'playing' : 'paused';
  }, [state]);
}
