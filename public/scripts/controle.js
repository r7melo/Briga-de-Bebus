// Função para alternar entre expandir e minimizar
function toggleFullScreen() {
    const gameContainer = document.getElementById('game-container');
    const expandIcon = document.getElementById('expand-icon');
    const minimizeIcon = document.getElementById('minimize-icon');
    
    // Verifica se o jogo já está em tela cheia
    if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement) {
        // Ativa o modo tela cheia
        if (gameContainer.requestFullscreen) {
            gameContainer.requestFullscreen();
        } else if (gameContainer.mozRequestFullScreen) { // Firefox
            gameContainer.mozRequestFullScreen();
        } else if (gameContainer.webkitRequestFullscreen) { // Chrome, Safari
            gameContainer.webkitRequestFullscreen();
        }
        
        // Muda o ícone para minimizar
        expandIcon.style.display = 'none';
        minimizeIcon.style.display = 'inline';
    } else {
        // Sai do modo tela cheia
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { // Firefox
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { // Chrome, Safari
            document.webkitExitFullscreen();
        }
        
        // Muda o ícone para expandir
        expandIcon.style.display = 'inline';
        minimizeIcon.style.display = 'none';
    }
}

// Detecta se o modo tela cheia foi encerrado
document.addEventListener('fullscreenchange', () => {
    const expandIcon = document.getElementById('expand-icon');
    const minimizeIcon = document.getElementById('minimize-icon');
    
    if (document.fullscreenElement) {
        expandIcon.style.display = 'none';
        minimizeIcon.style.display = 'inline';
    } else {
        expandIcon.style.display = 'inline';
        minimizeIcon.style.display = 'none';
    }
});
