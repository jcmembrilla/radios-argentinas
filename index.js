//Array de radios
const options = [
    {
        key: 2,
        name: "AM 750",
        url: "https://us-b5-p-e-kj2-audio.cdn.mdstrm.com/live-audio-aw-bkp/6237761f64b72676f05cf6ab"
    },
    {
        key: 3,
        name: "Rivadavia",
        url: "https://playerservices.streamtheworld.com/api/livestream-redirect/RIVADAVIAAAC.aac"
    },
    {
        key: 4,
        name: "Rock & Pop",
        url: " https://playerservices.streamtheworld.com/api/livestream-redirect/ROCKANDPOPAAC.aac"
    },
    {
        key: 5,
        name: "Radio Uno",
        url: " https://playerservices.streamtheworld.com/api/livestream-redirect/UNOAAC.aac"
    },
    {
        key: 6,
        name: "La Red",
        url: "https://playerservices.streamtheworld.com/api/livestream-redirect/LA_RED_AM910AAC.aac"
    },
    {
        key: 7,
        name: "Continental",
        url: "https://20833.live.streamtheworld.com/CONTINENTALAAC.aac"
    },
    {
        key: 8,
        name: "La 100",
        url: "https://playerservices.streamtheworld.com/api/livestream-redirect/FM999_56.mp3"
    },
    {
        key: 9,
        name: "El Destape",
        url: "https://ipanel.instream.audio/8004/stream"
    },
    {
        key: 10,
        name: "Radio Mitre",
        url: "http://buecrplb01.cienradios.com.ar/Mitre790.aac"
    },
    {
        key: 12,
        name: "La 990",
        url: "https://playerservices.streamtheworld.com/api/livestream-redirect/AM990AAC.aac"
    },
    {
        key: 14,
        name: "Aspen",
        url: "https://mdstrm.com/audio/60a2745ff943100826374a70/icecast.audio"
    },
    {
        key: 16,
        name: "Cultura",
        url: "https://usa5.fastcast4u.com/proxy/radiocultura?mp=/1"
    }


]

//Import iconos play y pause
import playButoon from './Images/play.png';
import pasueButoon from './Images/pause.png';


const audioElement = document.createElement('audio');
const playPauseButton = document.getElementById('play-pause-button');
const playPauseIcon = document.getElementById('play-pause-icon');
const volumeSlider = document.getElementById('volume-slider');
const radioSelector = document.getElementById('radio-selector');

// Poblar el selector de radios con las opciones
for (const option of options) {
    const newOption = document.createElement('option');
    newOption.value = option.url;
    newOption.textContent = option.name;
    radioSelector.appendChild(newOption);
}

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
            playPauseIcon.src = pasueButoon; // Actualizar la imagen para el estado de reproducción
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
