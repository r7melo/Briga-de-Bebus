// Posições iniciais dos dois personagens
let posX1 = 0, posY1 = 0;
let posX2 = 0, posY2 = 0;

let squareSize = 50;   // Tamanho dos personagens
const mapSize = 2000;   // Tamanho do mapa
const gameContainer = document.getElementById("gameContainer");
const map = document.getElementById("map");
const character1 = document.getElementById("character1");
const character2 = document.getElementById("character2");

// Função para mover os personagens
function moveCharacter1(dx, dy) {
    posX1 = Math.max(0, Math.min(mapSize - squareSize, posX1 + dx));
    posY1 = Math.max(0, Math.min(mapSize - squareSize, posY1 + dy));
    character1.style.left = `${posX1}px`;
    character1.style.top = `${posY1}px`;
    
    updateMapPosition();
}

function moveCharacter2(dx, dy) {
    posX2 = Math.max(0, Math.min(mapSize - squareSize, posX2 + dx));
    posY2 = Math.max(0, Math.min(mapSize - squareSize, posY2 + dy));
    character2.style.left = `${posX2}px`;
    character2.style.top = `${posY2}px`;
    
    updateMapPosition2();
}

// Função para calcular a posição do mapa
function updateMapPosition() {
    const offsetX = Math.max(-mapSize + gameContainer.clientWidth, Math.min(0, -(posX1 - gameContainer.clientWidth / 2)));
    const offsetY = Math.max(-mapSize + gameContainer.clientHeight, Math.min(0, -(posY1 - gameContainer.clientHeight / 2)));
    map.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
}

function updateMapPosition2() {
    const offsetX = Math.max(-mapSize + gameContainer.clientWidth, Math.min(0, -(posX2 - gameContainer.clientWidth / 2)));
    const offsetY = Math.max(-mapSize + gameContainer.clientHeight, Math.min(0, -(posY2 - gameContainer.clientHeight / 2)));
    map.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
}

// Detectando teclas pressionadas
document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp") moveCharacter1(0, -squareSize);
    if (event.key === "ArrowDown") moveCharacter1(0, squareSize);
    if (event.key === "ArrowLeft") moveCharacter1(-squareSize, 0);
    if (event.key === "ArrowRight") moveCharacter1(squareSize, 0);

    if (event.key === "w") moveCharacter2(0, -squareSize);
    if (event.key === "s") moveCharacter2(0, squareSize);
    if (event.key === "a") moveCharacter2(-squareSize, 0);
    if (event.key === "d") moveCharacter2(squareSize, 0);
});

// Ação de dois cliques na tela do jogo
gameContainer.addEventListener("dblclick", function(event) {
    toggleFullscreen();
 });

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

