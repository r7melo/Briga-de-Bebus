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


socket.emit('criarJogador', dispositivoId); 

socket.on('definirCor', (jogador) => {

    if(jogador.id == dispositivoId){
        document.querySelectorAll("button").forEach(btn => {
            btn.style.backgroundColor = jogador.color;
        });

        document.getElementById('nomeJogador').value = jogador.name;
    }
});

socket.on('resultadoDado', (jogador) => {

    if(jogador.id == dispositivoId && jogador.name != null){

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


// Escuta o evento 'listCodes' enviado pelo servidor
socket.on('listCodes', (playerIds) => {
    const select = document.getElementById("playerSelect");
    select.innerHTML = ""; // Limpa as opções anteriores

    playerIds.forEach(id => {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = `Jogador ${id}`;
        select.appendChild(option);
    });
});

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
