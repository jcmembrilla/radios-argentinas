//Import iconos play y pause
import playButoon from './assets/images/play.png';
import pauseButoon from './assets/images/pause.png';


const audioElement = document.createElement('audio');
const playPauseButton = document.getElementById('play-pause-button');
const playPauseIcon = document.getElementById('play-pause-icon');
const volumeSlider = document.getElementById('volume-slider');
const radioSelector = document.getElementById('radio-selector');

// Función para cargar el archivo JSON y poblar el selector
async function loadRadios() {
    const response = await fetch('/radios.json');
    const data = await response.json();

    for (const radio of data) {
        const newOption = document.createElement('option');
        newOption.value = radio.url;
        newOption.textContent = radio.name;
        radioSelector.appendChild(newOption);
    }
}

// Carga inicial de las radios
loadRadios();

let isPlaying = false;

playPauseButton.addEventListener('click', () => {
    if (isPlaying) {
        audioElement.pause();
        playPauseIcon.src = playButoon; // Actualizar la imagen para el estado de pausa
    } else {
        const selectedUrl = radioSelector.value;
        if (selectedUrl) {
            audioElement.src = selectedUrl;
            audioElement.play();
            playPauseIcon.src = pauseButoon; // Actualizar la imagen para el estado de reproducción
        }
    }
    isPlaying = !isPlaying;
});

volumeSlider.addEventListener('change', (event) => {
    audioElement.volume = parseFloat(event.target.value);
});

radioSelector.addEventListener('change', (event) => {
    const selectedUrl = event.target.value;
    if (selectedUrl) {
        audioElement.src = selectedUrl;
        isPlaying = false; // Restablecer el estado de reproducción
        playPauseIcon.src = playButoon; // Mostra el boton de play simpre que se cambia de radio
    }
});


//Fecha
const fecha = new Date();
const añoActual = fecha.getFullYear();
const hoy = fecha.getDate();
const mesActual = fecha.getMonth() + 1;

const fechaActualElement = document.getElementById('fecha-actual');

fechaActualElement.textContent = `${hoy}/${mesActual}/${añoActual}`;
