// --- Script pour le Lecteur Radio Global ---
document.addEventListener('DOMContentLoaded', () => {
    const audioEl = document.getElementById('retAudio');
    const playIcon = document.getElementById('playIcon');
    const radioStatus = document.getElementById('radioStatus');
    const radioWidget = document.getElementById('radioWidget');
    
    // Volume Éléments
    const volSlider = document.getElementById('volSlider');
    const volumeContainer = document.getElementById('volumeContainer');
    const muteIcon = document.getElementById('muteIcon');
    
    if (!audioEl || !radioWidget) return;

    // Initialiser le volume
    audioEl.volume = volSlider.value;
    let previousVolume = audioEl.volume;

    // Rendre la fonction globale
    window.toggleRadio = function() {
        if (audioEl.paused) {
            audioEl.play();
            playIcon.innerHTML = '⏸';
            radioStatus.innerText = 'En direct';
            radioWidget.classList.add('playing');
        } else {
            audioEl.pause();
            playIcon.innerHTML = '▶';
            radioStatus.innerText = 'En pause';
            radioWidget.classList.remove('playing');
        }
    };

    // Empêcher le clic sur le bloc volume de déclencher le bouton Play/Pause
    volumeContainer.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // Gérer le changement de volume via le slider
    volSlider.addEventListener('input', function(e) {
        const currentVal = e.target.value;
        audioEl.volume = currentVal;
        
        // Mise à jour de l'icône selon le niveau
        if (currentVal == 0) {
            muteIcon.innerText = '🔇';
        } else if (currentVal < 0.5) {
            muteIcon.innerText = '🔉';
        } else {
            muteIcon.innerText = '🔊';
        }
    });

    // Rendre globale
    window.toggleMute = function() {
        if (audioEl.volume > 0) {
            // Mute
            previousVolume = audioEl.volume;
            audioEl.volume = 0;
            volSlider.value = 0;
            muteIcon.innerText = '🔇';
        } else {
            // Unmute
            audioEl.volume = previousVolume > 0 ? previousVolume : 0.5;
            volSlider.value = audioEl.volume;
            muteIcon.innerText = audioEl.volume < 0.5 ? '🔉' : '🔊';
        }
    };
});
