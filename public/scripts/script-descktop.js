
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
fundo.src = '../images/background.png';
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

    if(jogadores){
        Object.entries(jogadores).forEach(([id, jogador]) => {
        
            if(jogador.nome){
                ctx.fillStyle = jogador.cor;
    
                ctx.fillRect((jogador.corpo.x* tamanhoQuadrado)+5, (jogador.corpo.y * tamanhoQuadrado)+5, tamanhoQuadrado-10, tamanhoQuadrado-10);
                
            }
            
        });
    }
    
}

function atualizarListaJogadores(jogadores) {
    const playerList = document.getElementById('playerList');
    playerList.innerHTML = ''; // Limpar a lista antes de atualizar

    Object.entries(jogadores).forEach(([id, jogador]) => {
        if (jogador.nome) {

            jogador.resistencia;
            const li = document.createElement('li');
            li.style.backgroundColor = jogador.cor;
            li.style.color = jogador.cor;
            li.classList.add("player-list");
            li.setAttribute("data-resistencia", (jogador.resistencia * 12.5) || 100); // Define resistência inicial

            // Criando o nome do jogador
            const nomeSpan = document.createElement('span');
            nomeSpan.textContent = `${jogador.nome}`;
            li.appendChild(nomeSpan);

            // Criando a barra de resistência
            const resistenciaBarra = document.createElement('div');
            resistenciaBarra.classList.add("resistencia-barra");
            resistenciaBarra.style.width = ((jogador.resistencia * 12.5) || 100) + "%";
            li.appendChild(resistenciaBarra);

            // Se a resistência for 0, deixar a barra da cor do jogador
            if (jogador.resistencia === 0) {
                resistenciaBarra.style.backgroundColor = jogador.cor;
            }

            // Se o jogador tiver comDado: true, adicionar classe "selected"
            if (jogador.comDado) {
                li.classList.add('selected');
            }

            // Criando os botões de aumentar e diminuir resistência
            const btnAumentar = document.createElement('button');
            btnAumentar.textContent = '+';
            btnAumentar.style.marginLeft = '10px';
            btnAumentar.addEventListener('click', () => {
                // Aqui estamos pegando a chave do jogador no objeto jogadores
                const chaveJogador = Object.keys(jogadores).find(key => jogadores[key].id === jogador.id);
                
                // Emite o evento 'configurarResistencia' com a chave e a ação
                socket.emit('configurarResistencia', { chave: chaveJogador, acao: '+' });
            });

            const btnDiminuir = document.createElement('button');
            btnDiminuir.textContent = '-';
            btnDiminuir.style.marginLeft = '5px';
            btnDiminuir.addEventListener('click', () => {
                // Aqui estamos pegando a chave do jogador no objeto jogadores
                const chaveJogador = Object.keys(jogadores).find(key => jogadores[key].id === jogador.id);
                
                // Emite o evento 'configurarResistencia' com a chave e a ação
                socket.emit('configurarResistencia', { chave: chaveJogador, acao: '-' });
            });

            // Adicionando os botões ao li
            const botaoContainer = document.createElement('div');
            botaoContainer.style.display = 'flex';
            botaoContainer.style.alignItems = 'center';
            botaoContainer.style.marginLeft = 'auto'; // Alinha os botões à direita
            botaoContainer.appendChild(btnAumentar);
            botaoContainer.appendChild(btnDiminuir);

            li.appendChild(botaoContainer);
            playerList.appendChild(li);
        }
    });
}



// Função para abrir o modal
function openModal(message) {
    document.getElementById('modalMessage').innerText = message; // Atualiza a mensagem no modal
    document.getElementById('modal').style.display = 'flex'; // Exibe o modal
}

//#region MODAL
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

// Defina o link fixo
const linkFixo = "http://10.0.0.121:3000";

// Gerar QR Code automaticamente ao carregar a página
new QRCode(document.getElementById("qrcode"), {
    text: linkFixo,
    width: 200,
    height: 200
});

