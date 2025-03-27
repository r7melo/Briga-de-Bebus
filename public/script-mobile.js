
document.addEventListener("DOMContentLoaded", function() {
    function entrarEmTelaCheia() {
        let elem = document.documentElement;
        if (elem.requestFullscreen) elem.requestFullscreen();
        else if (elem.mozRequestFullScreen) elem.mozRequestFullScreen();
        else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
        else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
    }
    entrarEmTelaCheia();
});

screen.orientation.lock("portrait").catch(err => console.log(err));

const socket = io();  // Conectar-se ao servidor
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playerList = document.getElementById('playerList');

const tamanhoQuadrado = 25;
const largura = canvas.width / tamanhoQuadrado;
const altura = canvas.height / tamanhoQuadrado;


const fundo = new Image();
fundo.src = 'background.png';

socket.emit('criarJogador', 0); 

fundo.onload = function() {

    document.getElementById('nomeJogador').addEventListener('input', function() {
        const nomeJogador = document.getElementById('nomeJogador').value.trim();
        if (nomeJogador) {
            socket.emit('editarNome', nomeJogador); 
        }
    });

};

socket.on('definirCor', (jogador) => {

    if(jogador.id == socket.id){
        document.querySelectorAll("button").forEach(btn => {
            btn.style.backgroundColor = jogador.cor;
        });
    }
});

socket.on('resultadoDado', (jogador) => {

    if(jogador.id == socket.id){

        const dadoButton = document.getElementById("dado");
        dadoButton.innerText = jogador.passos;
        
        if (jogador.passos === '🎲') {
            dadoButton.disabled = false;
        } else {
            dadoButton.disabled = true;
        }

    }
});


function desenharJogo(jogadores) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(fundo, 0, 0, canvas.width, canvas.height);

    jogadores.forEach(cobra => {
        ctx.fillStyle = cobra.cor;
        cobra.corpo.forEach(parte => {
            ctx.fillRect(parte.x * tamanhoQuadrado, parte.y * tamanhoQuadrado, tamanhoQuadrado, tamanhoQuadrado);
        });
    });
}

function atualizarListaJogadores(jogadores) {
    playerList.innerHTML = '';  // Limpar a lista atual

    jogadores.forEach(jogador => {
        const li = document.createElement('li');
        li.textContent = jogador.id + " - " + jogador.cor;  // Exibe o ID e a cor do jogador
        playerList.appendChild(li);
    });
}


document.getElementById('up').addEventListener('click', function() {mover('cima');});
document.getElementById('down').addEventListener('click', function() {mover('baixo');});
document.getElementById('left').addEventListener('click', function() {mover('esquerda');});
document.getElementById('right').addEventListener('click', function() {mover('direita');});
document.getElementById('dado').addEventListener('click', function() { socket.emit('jogarDado'); });

function mover(direcao) {
    socket.emit('mover', direcao);
}



