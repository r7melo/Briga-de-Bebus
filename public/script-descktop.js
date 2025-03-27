
const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playerList = document.getElementById('playerList');
const nomeInput = document.getElementById('nomeInput');
const salvarButton = document.getElementById('salvarButton');
const inputContainer = document.getElementById('inputContainer');
const tamanhoQuadrado = 25;
let jogadorNome = '';
let jogadorValido = false;

const fundo = new Image();
fundo.src = 'background.png';
ctx.clearRect(0, 0, canvas.width, canvas.height);
ctx.drawImage(fundo, 0, 0, canvas.width, canvas.height);

// Escuta a atualização da lista de jogadores do servidor
socket.on('atualizarJogadores', (jogadores) => {
    desenharJogo(jogadores);
    atualizarListaJogadores(jogadores);
});

function desenharJogo(jogadores) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(fundo, 0, 0, canvas.width, canvas.height);

    Object.entries(jogadores).forEach(([id, jogador]) => {
        
        if(jogador.nome){
            ctx.fillStyle = jogador.cor;
            ctx.fillRect((jogador.corpo.x* tamanhoQuadrado)+5, (jogador.corpo.y * tamanhoQuadrado)+5, tamanhoQuadrado-10, tamanhoQuadrado-10);
            
        }
        
    });
}

function atualizarListaJogadores(jogadores) {
    playerList.innerHTML = '';  // Limpar a lista antes de atualizar

    Object.entries(jogadores).forEach(([id, jogador]) => {
        if(jogador.nome){
            const li = document.createElement('li');
            li.textContent = `${jogador.nome}`;
            li.style.backgroundColor = jogador.cor;  // Aplicar cor do jogador
            li.style.color = "#fff";

            // Adiciona um event listener para o clique no item da lista
            li.addEventListener('click', () => {

                socket.emit('darDado', id); 
            });

            playerList.appendChild(li);
        }
    });
}

