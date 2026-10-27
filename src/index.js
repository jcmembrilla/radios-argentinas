/**
 * ============================================================
 *  Radios Argentinas — lógica del reproductor
 * ============================================================
 *
 *  Responsabilidades de este módulo:
 *    1. Cargar la lista de radios desde /radios.json y poblar el <select>.
 *    2. Controlar la reproducción (play/pause), el volumen y los cambios de radio.
 *    3. Mostrar la fecha actual en el footer.
 *
 *  Pieza central: un elemento <audio> oculto que reproduce los streams.
 *  La app nunca toca los bytes de audio: solo apunta el <audio> a la URL
 *  del stream y el navegador hace el resto.
 */

// Iconos play/pause (Vite los resuelve como URLs finales tras el build)
import playIcon from './assets/images/play.png';
import pauseIcon from './assets/images/pause.png';

// ---------------------------------------------------------------------------
// Referencias al DOM y estado interno
// ---------------------------------------------------------------------------

const audioElement = new Audio();
const playPauseButton = document.getElementById('play-pause-button');
const playPauseIcon = document.getElementById('play-pause-icon');
const volumeSlider = document.getElementById('volume-slider');
const radioSelector = document.getElementById('radio-selector');
const fechaActualElement = document.getElementById('fecha-actual');

/** Indica si hay una radio reproduciéndose en este momento. */
let isPlaying = false;

/**
 * Sincroniza el ícono del botón con el estado de reproducción.
 * Único punto donde se cambia el ícono: evita estados inconsistentes.
 * @param {boolean} playing - true si está sonando, false si está en pausa.
 */
function setPlayingState(playing) {
  isPlaying = playing;
  playPauseIcon.src = playing ? pauseIcon : playIcon;
}

// ---------------------------------------------------------------------------
// Carga del catálogo de radios
// ---------------------------------------------------------------------------

/**
 * Carga /radios.json y llena el selector de radios.
 * Cada opción usa la URL del stream como `value` y el nombre como texto visible.
 * @returns {Promise<void>}
 */
async function loadRadios() {
  try {
    const response = await fetch('/radios.json');

    // fetch NO lanza error ante un 404/500: hay que validarlo a mano
    if (!response.ok) {
      throw new Error(`Respuesta HTTP ${response.status}`);
    }

    const radios = await response.json();

    for (const radio of radios) {
      const option = document.createElement('option');
      // .trim(): normaliza espacios accidentales en el JSON
      option.value = radio.url.trim();
      option.textContent = radio.name;
      radioSelector.appendChild(option);
    }
  } catch (error) {
    console.error('No se pudo cargar la lista de radios:', error);
  }
}

// ---------------------------------------------------------------------------
// Reproducción
// ---------------------------------------------------------------------------

/**
 * Inicia la reproducción de la radio seleccionada.
 * Apunta el <audio> a la URL elegida y reproduce; si el navegador bloquea
 * el autoplay o el stream falla, vuelve al estado de pausa.
 * @returns {Promise<void>}
 */
async function play() {
  const selectedUrl = radioSelector.value;

  // Sin radio elegida no hay nada que reproducir.
  // IMPORTANTE: salir sin tocar isPlaying evita el bug de "doble click",
  // donde el estado se invertía aunque no se estuviera reproduciendo nada.
  if (!selectedUrl) return;

  audioElement.src = selectedUrl;

  try {
    await audioElement.play();
    setPlayingState(true);
  } catch (error) {
    console.error('No se pudo iniciar la reproducción:', error);
    setPlayingState(false);
  }
}

/** Pausa la reproducción y actualiza el ícono. */
function pause() {
  audioElement.pause();
  setPlayingState(false);
}

// Botón central: alterna entre reproducir y pausar
playPauseButton.addEventListener('click', () => {
  if (isPlaying) {
    pause();
  } else {
    play();
  }
});

// Slider de volumen: "input" responde en vivo mientras se arrastra
// (antes se usaba "change", que solo dispara al soltar)
volumeSlider.addEventListener('input', (event) => {
  audioElement.volume = parseFloat(event.target.value);
});

// Cambio de radio: apunta el <audio> al nuevo stream.
// Si estaba sonando, la nueva radio arranca automáticamente
// (no hace falta volver a apretar play).
radioSelector.addEventListener('change', (event) => {
  const selectedUrl = event.target.value;

  if (!selectedUrl) return;

  audioElement.src = selectedUrl;

  if (isPlaying) {
    play();
  }
  // Si estaba en pausa, se mantiene el ícono de play:
  // el usuario decide cuándo escuchar.
});

// Si el stream falla (radio caída, corte de red), volver al estado de pausa
// para que el botón quede consistente con lo que realmente suena.
audioElement.addEventListener('error', () => {
  console.error('Error en el stream de audio.');
  setPlayingState(false);
});

// Carga inicial de las radios
loadRadios();

// ---------------------------------------------------------------------------
// Fecha del footer
// ---------------------------------------------------------------------------

/**
 * Escribe la fecha actual en el footer con formato d/m/aaaa.
 */
function mostrarFechaActual() {
  const fecha = new Date();
  const dia = fecha.getDate();
  const mes = fecha.getMonth() + 1; // los meses van de 0 a 11
  const año = fecha.getFullYear();

  fechaActualElement.textContent = `${dia}/${mes}/${año}`;
}

mostrarFechaActual();
