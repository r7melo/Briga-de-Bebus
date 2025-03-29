const socket = io();
const playerList = document.getElementById('playerList');
let squareSize = 50;   // Tamanho dos personagens
const mapSize = 2000;   // Tamanho do mapa

// Escuta a atualização da lista de jogadores do servidor
socket.on('atualizarJogadores', (players) => {
    drawCharecters(players);
    updateListPlayers(players);
});

function drawCharecters(players) {
    
    const map = document.getElementById("map");
    
    // Remove todos os personagens antes de redesenhar
    document.querySelectorAll('.character').forEach(char => char.remove());

    if(players){

        Object.entries(players).forEach(([id, player]) => {
        
            if(player.name){

                
                
                const character = document.createElement('div');
                character.classList.add('character');
                character.id = player.id;
                character.style.backgroundColor = player.color;

                moveCharacter(character, player);

                if (player.casaPassada === 'cima') {
                    character.style.transform = 'rotate(0deg)'; // Indo para baixo
                } else if (player.casaPassada === 'baixo') {
                    character.style.transform = 'rotate(180deg)'; // Indo para cima (sem rotação)
                } else if (player.casaPassada === 'esquerda') {
                    character.style.transform = 'rotate(-90deg)'; // Indo para a direita
                } else if (player.casaPassada === 'direita') {
                    character.style.transform = 'rotate(90deg)'; // Indo para a esquerda
                }                

                map.append(character);

            }
            
        });
    }
    
}


function updateListPlayers(players) {
    const playerList = document.getElementById("playerList"); // Certifique-se de que o elemento existe
    
    if (!playerList) {
        console.error("Elemento playerList não encontrado!");
        return;
    }

    playerList.innerHTML = ''; // Limpar a lista antes de atualizar

    Object.entries(players).forEach(([id, player]) => {
        if (player.name) {
            const li = document.createElement('li');
            li.style.backgroundColor = player.color;
            li.style.color = player.color;
            li.classList.add("player-list");

            // Define a resistência inicial
            const resistenciaValor = player.resistencia !== undefined ? player.resistencia * 12.5 : 100;
            li.setAttribute("data-resistencia", resistenciaValor);

            // Criando o nome do jogador
            const nomeSpan = document.createElement('span');
            nomeSpan.textContent = `${player.name}`;
            li.appendChild(nomeSpan);

            // Criando a barra de resistência
            const resistenciaBarra = document.createElement('div');
            resistenciaBarra.classList.add("resistencia-barra");
            resistenciaBarra.style.width = `${resistenciaValor}%`;
            resistenciaBarra.style.height = "10px";
            resistenciaBarra.style.backgroundColor = player.resistencia === 0 ? player.color : "#4CAF50"; // Verde quando há resistência
            
            li.appendChild(resistenciaBarra);

            // Se o jogador tiver comDado: true, adicionar classe "selected"
            if (player.comDado) {
                li.classList.add('selected');
            }

            // Criando os botões de aumentar e diminuir resistência
            const btnAumentar = document.createElement('button');
            btnAumentar.textContent = '+';
            btnAumentar.classList.add("btn-resistencia");
            btnAumentar.addEventListener('click', () => {
                const chaveplayer = Object.keys(players).find(key => players[key].id === player.id);
                socket.emit('configurarResistencia', { chave: chaveplayer, acao: '+' });
            });

            const btnDiminuir = document.createElement('button');
            btnDiminuir.textContent = '-';
            btnDiminuir.classList.add("btn-resistencia");
            btnDiminuir.addEventListener('click', () => {
                const chaveplayer = Object.keys(players).find(key => players[key].id === player.id);
                socket.emit('configurarResistencia', { chave: chaveplayer, acao: '-' });
            });

            // Adicionando os botões ao li
            const botaoContainer = document.createElement('div');
            botaoContainer.style.display = 'flex';
            botaoContainer.style.gap = '5px';
            botaoContainer.style.marginLeft = 'auto'; // Alinha os botões à direita
            botaoContainer.appendChild(btnAumentar);
            botaoContainer.appendChild(btnDiminuir);

            li.appendChild(botaoContainer);
            playerList.appendChild(li);

            console.log(players)
        }
    });
}



// Função para mover os personagens
function moveCharacter(character, player) {

    const posX = player.corpo.x * squareSize;
    const posY = player.corpo.y * squareSize;

    character.style.left = `${posX}px`;
    character.style.top = `${posY}px`;
    
    
    if (player.comDado) {

        if (player.passos > 0) 
            updateMapPosition(posX, posY);

        else setTimeout(() => {
            updateMapPosition(posX, posY);
        }, 2000);

    }

}

// Função para calcular a posição do mapa
function updateMapPosition(posX, posY) {

    const offsetX = Math.max(-mapSize + gameContainer.clientWidth, Math.min(0, -(posX - gameContainer.clientWidth / 2)));
    const offsetY = Math.max(-mapSize + gameContainer.clientHeight, Math.min(0, -(posY - gameContainer.clientHeight / 2)));
    map.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

}



//#region MODAL
// Função para abrir o modal
function openModal(message) {
    document.getElementById('modalMessage').innerText = message; // Atualiza a mensagem no modal
    document.getElementById('modal').style.display = 'flex'; // Exibe o modal
}

// Função para fechar o modal
function closeModal() {
    document.getElementById('modal').style.display = 'none'; // Oculta o modal
}

// Escutando o evento 'acaoJogador' do socket
socket.on('acaoJogador', (msg) => {
    openModal(msg); // Exibe o modal com a mensagem
});

// Evento para fechar o modal ao pressionar qualquer tecla
document.addEventListener('keydown', function() {
    closeModal(); // Fecha o modal quando qualquer tecla for pressionada
});

// Evento para fechar o modal ao clicar fora dele
window.addEventListener('click', function(event) {
    // Verifica se o clique foi fora do modal
    let modal = document.getElementById('modal');
    if (event.target === modal) { // Se o clique foi na área externa do modal
        closeModal(); // Fecha o modal
    }
});
//#endregion

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

