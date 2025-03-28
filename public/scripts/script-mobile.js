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


// Função para gerar um identificador único
function gerarIdUnico() {
    return 'usuario-' + Math.random().toString(36);
}

// Verifica se já existe um ID no localStorage
let dispositivoId = localStorage.getItem('dispositivoId');

// Se não existir, gera um novo ID e armazena no localStorage
if (!dispositivoId) {
    dispositivoId = gerarIdUnico();
    localStorage.setItem('dispositivoId', dispositivoId);  // Armazenar o ID gerado
}

// Exibe o ID único
console.log("ID do dispositivo: ", dispositivoId);


const socket = io();  // Conectar-se ao servidor
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playerList = document.getElementById('playerList');

const tamanhoQuadrado = 25;
const largura = canvas.width / tamanhoQuadrado;
const altura = canvas.height / tamanhoQuadrado;


const fundo = new Image();
fundo.src = 'background.png';

socket.emit('criarJogador', dispositivoId); 

socket.on('definirCor', (jogador) => {

    if(jogador.id == dispositivoId){
        document.querySelectorAll("button").forEach(btn => {
            btn.style.backgroundColor = jogador.cor;
        });

        document.getElementById('nomeJogador').value = jogador.nome;
    }
});

socket.on('resultadoDado', (jogador) => {

    if(jogador.id == dispositivoId && jogador.nome != null){

        const dadoButton = document.getElementById("dado");
        dadoButton.innerText = jogador.passos;
        
        if (jogador.passos == 0) {
            dadoButton.disabled = false;
            dadoButton.innerText = '🎲';

        } else {
            dadoButton.disabled = true;
        }

    }
});


document.getElementById('nomeJogador').addEventListener('input', editarNomeJogador);

document.getElementById('up').addEventListener('click', ()=> moverJogador('cima'));
document.getElementById('down').addEventListener('click', ()=> moverJogador('baixo'));
document.getElementById('left').addEventListener('click', ()=> moverJogador('esquerda'));
document.getElementById('right').addEventListener('click', ()=> moverJogador('direita'));
document.getElementById('dado').addEventListener('click', renovarDispositivoId);
document.getElementById('dado').addEventListener('click', jogarDado);

function moverJogador(direcao) {
    socket.emit('mover', direcao);
}

function jogarDado() {
    socket.emit('jogarDado');
}

function editarNomeJogador() {
    const nomeJogador = document.getElementById('nomeJogador').value.trim();
    if (nomeJogador) {
        socket.emit('editarNome', nomeJogador); 
    }
}

function renovarDispositivoId() {
    const nomeJogador = document.getElementById('nomeJogador').value.trim();
        
    if (nomeJogador === 'reset') {
        localStorage.clear();
        alert('Dados resetados!');
        location.reload();
    }
}
