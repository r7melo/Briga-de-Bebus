// Variáveis iniciais
let squareSize = 25; // Inicialmente cada quadrado tem 25px
let zoomScale = 1; // Escala inicial do mapa
const zoomInSize = 100; // Tamanho do quadrado ao máximo do zoom
const zoomThreshold = 50; // Distância da borda para iniciar o zoom
const mapSize = 1000; // Tamanho total do mapa
let posX = 0, posY = 0; // Posições iniciais do personagem
const character = document.getElementById('character'); // Referência do personagem
const map = document.getElementById('map'); // Referência do mapa


character.id = 'character';
map.appendChild(character); // Adiciona o personagem no mapa

// Função para desenhar o mapa com os quadrados
function drawMap() {
    for (let x = 0; x < mapSize; x += 25) {
        for (let y = 0; y < mapSize; y += 25) {
            let square = document.createElement('div');
            square.classList.add('square');
            square.style.left = `${x}px`;
            square.style.top = `${y}px`;
            map.appendChild(square);
        }
    }
}

// Função para mover o personagem
function moveCharacter(dx, dy) {
    // Atualiza a posição do personagem, com limites de movimento
    posX = Math.max(0, Math.min(mapSize - squareSize, posX + dx)); // Limite de 0 a mapSize - squareSize
    posY = Math.max(0, Math.min(mapSize - squareSize, posY + dy)); // Limite de 0 a mapSize - squareSize

    // Atualiza a posição do personagem na tela
    character.style.left = `${posX}px`;
    character.style.top = `${posY}px`;

    // Verifica se o personagem atingiu a área onde o zoom deve ser aplicado
    if (posX > zoomThreshold && posX < mapSize - zoomThreshold && posY > zoomThreshold && posY < mapSize - zoomThreshold) {
        // Começa a aplicar o zoom (aumentando o tamanho dos quadrados e a escala do mapa)
        squareSize = zoomInSize; // Aumenta o tamanho do quadrado
        zoomScale = 4; // Aumenta a escala do mapa (100px quadrados)
    } else {
        // Reverte para o zoom normal
        squareSize = 25; // Tamanho normal do quadrado
        zoomScale = 1; // Escala normal do mapa
    }

    // Ajusta a visualização do mapa
    map.style.transform = `scale(${zoomScale})`;

    // Ajusta a posição do mapa para centralizar no personagem com base no zoom
    const mapOffsetX = (mapSize - squareSize * zoomScale) / 2 - posX * (zoomScale - 1);
    const mapOffsetY = (mapSize - squareSize * zoomScale) / 2 - posY * (zoomScale - 1);
    map.style.transform = `scale(${zoomScale}) translate(${mapOffsetX}px, ${mapOffsetY}px)`;
}

// Inicia o mapa e desenha os quadrados
drawMap();

// Função para movimentar com as teclas
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowUp') {
        moveCharacter(0, -25);
    } else if (e.key === 'ArrowDown') {
        moveCharacter(0, 25);
    } else if (e.key === 'ArrowLeft') {
        moveCharacter(-25, 0);
    } else if (e.key === 'ArrowRight') {
        moveCharacter(25, 0);
    }
});

// Lógica para o botão de expandir/minimizar
const zoomButton = document.getElementById('zoom-toggle');
let zoomedIn = false;

// Alterando o comportamento do botão
zoomButton.addEventListener('click', function() {
    zoomedIn = !zoomedIn; // Alterna o estado de zoom
    if (zoomedIn) {
        map.classList.add('zoomed');  // Ativa o zoom
        zoomButton.textContent = 'Minimizar';  // Muda o texto do botão
    } else {
        map.classList.remove('zoomed');  // Desativa o zoom
        zoomButton.textContent = 'Expandir';  // Muda o texto do botão
    }
});

// Lógica para o botão de tela cheia
const fullscreenButton = document.getElementById('fullscreen-toggle');

// Função para entrar em modo tela cheia
function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

fullscreenButton.addEventListener('click', toggleFullScreen);
