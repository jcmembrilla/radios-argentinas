/**
 * ============================================================
 *  useAudio — máquina de estados del reproductor
 * ============================================================
 *
 *  Encapsula el elemento <audio> y deriva el estado de la UI a partir de
 *  los eventos reales del elemento (playing, waiting, error). Esto elimina
 *  los bugs de estados desincronizados de la versión vanilla, donde el
 *  estado se invertía a mano (`isPlaying = !isPlaying`).
 *
 *  Estados:
 *    idle    → sin radio elegida todavía
 *    loading → conectando al stream / buffering
 *    playing → sonando
 *    paused  → en pausa con radio cargada
 *    error   → el stream falló (radio caída o red)
 */
import { useCallback, useEffect, useRef, useState } from 'react';

export const PLAYER_STATE = {
  IDLE: 'idle',
  LOADING: 'loading',
  PLAYING: 'playing',
  PAUSED: 'paused',
  ERROR: 'error',
};

/**
 * Gestiona el ciclo de vida del audio.
 * @returns {{
 *   state: string,          Estado actual del reproductor
 *   play: (url: string) => Promise<void>,
 *   pause: () => void,
 *   toggle: (url: string) => void,  Alterna play/pause
 *   volume: number,         Volumen actual (0 a 1)
 *   setVolume: (v: number) => void,
 * }}
 */
export function useAudio() {
  /** Referencia estable al elemento <audio> (se crea una sola vez). */
  const audioRef = useRef(null);
  const [state, setState] = useState(PLAYER_STATE.IDLE);
  const [volume, setVolumeState] = useState(1);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'none'; // no descargue nada hasta que el usuario pida
    audioRef.current = audio;

    // El estado se deriva de eventos REALES del elemento:
    // - 'playing': el stream ya está sonando de verdad
    // - 'waiting': se está cortando el buffering → volver a "cargando"
    // - 'error': el stream falló
    const onPlaying = () => setState(PLAYER_STATE.PLAYING);
    const onWaiting = () =>
      setState((s) => (s === PLAYER_STATE.PLAYING ? PLAYER_STATE.LOADING : s));
    const onError = () => {
      // Ignorar errores con src vacío (estado inicial del elemento)
      if (audio.currentSrc || audio.src) setState(PLAYER_STATE.ERROR);
    };

    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('error', onError);
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  /**
   * Reproduce la radio en `url`.
   * Si el navegador bloquea el autoplay o el stream no responde, el estado
   * queda en `error` para que la UI lo refleje.
   * @param {string} url - URL del stream (debe venir trimmeada).
   */
  const play = useCallback(async (url) => {
    const audio = audioRef.current;
    if (!audio || !url) return;

    if (audio.src !== url) audio.src = url;
    setState(PLAYER_STATE.LOADING);
    try {
      await audio.play();
      // El evento 'playing' confirma la reproducción real
    } catch {
      setState(PLAYER_STATE.ERROR);
    }
  }, []);

  /** Pausa el stream y refleja el estado en la UI. */
  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setState(PLAYER_STATE.PAUSED);
  }, []);

  /** Alterna entre reproducir y pausar para la radio en `url`. */
  const toggle = useCallback(
    (url) => {
      if (state === PLAYER_STATE.PLAYING || state === PLAYER_STATE.LOADING) {
        pause();
      } else {
        play(url);
      }
    },
    [state, play, pause],
  );

  /** Ajusta el volumen (0 a 1). */
  const setVolume = useCallback((v) => {
    const clamped = Math.min(1, Math.max(0, v));
    setVolumeState(clamped);
    if (audioRef.current) audioRef.current.volume = clamped;
  }, []);

  return { state, play, pause, toggle, volume, setVolume };
}
