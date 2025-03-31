const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);  

const mapa = require('./mapa.js');

const listSpawns = newListSpawns();

function newListSpawns() {
    const list = []; // Cria um array vazio

    for (let x = 0; x < 40; x++) {
        for (let y = 0; y < 40; y++) {
            if (mapa[y][x] === 1) {
                // Adiciona as coordenadas ao array
                list.push({ x: x, y: y });
            }
        }
    }

    return list;
}

// Listas de adjetivos e substantivos
const adjetivos = ['Furioso', 'Vingador', 'Mestre', 'Invencível', 'Feliz', 'Triste', 'Corajoso', 'Engraçado', 'Mágico', 'Rápido'];
const substantivos = ['Panda', 'Cavalo', 'Abacaxi', 'Biscoito', 'Gato', 'Salsicha', 'Balde', 'Peixe', 'Pirata', 'Cachorro'];
const listaNomesJogadores = new Set();
const listCode = new Set();
let bancoResistencia = 8;



const jogadores = {};  // Armazena todos os jogadores


for (let i=0; i < 10; i++) {
    let code = generateId();

    jogadores[code] = {
        id: null,
        name: gerarNomeAleatorio(),
        color: null,
        corpo: listSpawns[Math.floor(Math.random() * listSpawns.length)],
        resistencia: 0,
        passos: 0,
        jogadas: rodadaAtual(),
        comDado: !temJogadorComDado(jogadores),
        casaPassada: null
    }
}

app.use(express.static('public'));  // Servir os arquivos estáticos da pasta 'public'

io.on('connection', (socket) => {
    
    const room = "sala_geral";
    socket.join(room);

    const count = io.sockets.adapter.rooms.get(room)?.size || 0;
    console.log(`Clientes na ${room}: ${count}`);

    // Para carregar a página descktop
    io.emit('atualizarJogadores', jogadores); 

    // Emitir lista para o controle
    io.emit('code', Object.keys(jogadores).find(key => jogadores[key] === null) || null);
    socket.on('code-200', (code) => {
        
    });
    
    // Recepção da página mobile
    socket.on('criarJogador', (id) => { criarJogador(socket, id) });
    socket.on('editarNome', (novoNome) => { editarNome(socket, novoNome) });
    socket.on('mover', (direcao) => { moverJogador(socket, direcao) });
    socket.on('jogarDado', () => { jogarDado(socket) });

    socket.on('configurarResistencia', (dados)=>{
        const { chave, acao } = dados;

        if(acao=='+' && bancoResistencia > 0) {
            jogadores[chave].resistencia++;
            bancoResistencia--;
        }

        if(acao=='-' && bancoResistencia <= 8) {
            jogadores[chave].resistencia--;
            bancoResistencia++;
        }

        io.emit('atualizarJogadores', jogadores);

    });
    
    // Quando o jogador se desconectar
    socket.on('disconnect', () => { jogadorDesconectado(socket) });
});



function criarJogador(socket, id) {
    
    const chave = buscarChavePorId(id);

    if (!jogadores[chave]) {
        jogadores[socket.id] = {
            id: id,

            name: gerarNomeAleatorio(),
            color: gerarCorAleatoria(),
            corpo: listSpawns[Math.floor(Math.random() * listSpawns.length)],
            resistencia: 0,
            passos: 0,
            jogadas: rodadaAtual(),
            comDado: !temJogadorComDado(jogadores),
            casaPassada: null
        }

        io.emit('atualizarJogadores', jogadores);  

    } else {

        jogadores[socket.id] = JSON.parse(JSON.stringify(jogadores[chave]));
        delete(jogadores[chave])
        jogadores[socket.id].id = id;
        jogadores[socket.id].name = gerarNomeAleatorio();
        jogadores[socket.id].resistencia = 0;
        jogadores[socket.id].color = gerarCorAleatoria();
        jogadores[socket.id].jogadas = rodadaAtual(),
        jogadores[socket.id].comDado = !temJogadorComDado(jogadores);
        jogadores[socket.id].passos = 0;

        io.emit('atualizarJogadores', jogadores); 
    }

    io.emit('definirCor', jogadores[socket.id]);
    
    console.log(`[${socket.id}] Novo jogador conectado: ${jogadores[socket.id].name}`);
}

function editarNome(socket, novoNome) {
    // Verifica se o jogador existe antes de tentar modificar o nome
    if (jogadores[socket.id]) {
        // Verifica se já existe algum jogador com o mesmo nome
        const jogadorExistente = Object.values(jogadores).find(jogador => jogador.name === novoNome);

        if (!jogadorExistente) {
            // Atribui o novo nome ao jogador
            jogadores[socket.id].name = novoNome;
            io.emit('atualizarJogadores', jogadores);  // Atualiza todos os jogadores com o novo nome
        } else {
            // Caso já exista um jogador com o mesmo name
            socket.emit('erroNome', 'Já existe um jogador com esse nome');
        }
    } else {
        // Caso o jogador não exista no objeto jogadores
        socket.emit('erroNome', 'Jogador não encontrado');
    }
}

function moverJogador(socket, direcao){

    if (jogadores[socket.id] && jogadores[socket.id].name != null && jogadores[socket.id].name != ''){

        let jogador = JSON.parse(JSON.stringify(jogadores[socket.id]));

        // Verifica qual direção foi recebida
        if (jogador) {

            switch(direcao) {
                case 'cima':
                    jogador.corpo.y--; // Move para cima, diminui o valor de y
                    jogador.casaPassada = 'baixo';
                    break;
                case 'baixo':
                    jogador.corpo.y++; // Move para baixo, aumenta o valor de y
                    jogador.casaPassada = 'cima';
                    break;
                case 'esquerda':
                    jogador.corpo.x--; // Move para a esquerda, diminui o valor de x
                    jogador.casaPassada = 'direita';
                    break;
                case 'direita':
                    jogador.corpo.x++; // Move para a direita, aumenta o valor de x
                    jogador.casaPassada = 'esquerda';
                    break;
            }
            
            const x = jogador.corpo.x;
            const y = jogador.corpo.y;

            const colididos = verificaColisao(jogador, jogadores);

            colididos.forEach(id => {
                if (jogadores[id].resistencia > 0) {
                    jogadores[id].resistencia -= 1;  // Reduz 1 ponto de resistência
                    jogador.resistencia++;
                }
            });


            if ((mapa[y][x] != 0) && (jogadores[socket.id].casaPassada != direcao) && (jogador.passos > 0)) {

                jogador.passos--;
                jogadores[socket.id] = jogador;
                
                if (jogador.passos == 0) {
                    
                    jogadores[socket.id].comDado = false;
                    proximo_jogador = passarDado();
                    jogadores[proximo_jogador].comDado = true;

                    switch(mapa[y][x]) {
                        case 2: // bar

                            if (jogador.resistencia < (Math.floor(Math.random() * 8) + 1)) {

                                if (bancoResistencia > 0) {
                                    jogador.resistencia++;
                                    bancoResistencia--;
    
                                }

                                let msg = `Jogador ${jogador.name} tome uma dose.`;
                                
                                if (5 > (Math.floor(Math.random() * 9))){
                                    let i = (Math.floor(Math.random() * 9) + 1)

                                    switch(i){
                                        case 1:
                                            msg = `Jogador ${jogador.name} tome uma culher de pimenta.`;
                                            break;
                                        case 2:
                                            msg = `Jogador ${jogador.name} tome uma chinelada na mão.`;
                                            break;
                                        case 3:
                                            msg = `Jogador ${jogador.name} mostre a bunda.`;
                                            break;
                                        case 4:
                                            msg = `Jogador ${jogador.name} chinelo na bunda.`;
                                            break;
                                        case 5:
                                            msg = `Jogador ${jogador.name} tomar dose com alguém.`;
                                            break;
                                        case 6:
                                            msg = `Jogador ${jogador.name} coloque gelo no saco.`;
                                            break;
                                        case 7:
                                            msg = `Jogador ${jogador.name} coloque pasta na cara.`;
                                            break;
                                        case 8:
                                            msg = `Jogador ${jogador.name} raspe uma parte do troco para baixo.`;
                                            break;
                                        case 9:
                                            msg = `Jogador ${jogador.name} dance de cueca.`;
                                            break;
                                    }
                                }

                                io.emit('acaoJogador', msg); 
                            }

                            break;

                        case 3: // mercado
                
                            var msg = `Jogador ${jogador.name} compre algo.`;

                            io.emit('acaoJogador', msg); 
                            break;

                        case 4: //cabaré

                            var msg = `Jogador ${jogador.name} comece a dançar.`;
                            io.emit('acaoJogador', msg); 
                            break;
                        
                        case 5: //hotdog

                            var msg = `Jogador ${jogador.name} coma algo.`;
                            io.emit('acaoJogador', msg); 
                            break;

                    }
                }

                io.emit('resultadoDado', jogador);
                io.emit('atualizarJogadores', jogadores);
                

            }
            
        }
    }    
}

function jogarDado(socket) {

    if (jogadores[socket.id] && jogadores[socket.id].comDado && jogadores[socket.id].name != '' && jogadores[socket.id].name != null){
        
        dado = Math.floor(Math.random() * 6) + 1;
        jogadores[socket.id].passos = dado;
        jogadores[socket.id].jogadas++;
        io.emit('resultadoDado', jogadores[socket.id]);

    }
}

function passarDado() {
    return Object.keys(jogadores).filter(id => jogadores[id].name && jogadores[id].name.trim() !== '').sort((a, b) => jogadores[a].jogadas - jogadores[b].jogadas)[0];
}

function rodadaAtual() {
    const chave = Object.keys(jogadores).filter(id => jogadores[id].name && jogadores[id].name.trim() !== '').sort((a, b) => jogadores[b].jogadas - jogadores[a].jogadas)[0];
    if(jogadores[chave]) return jogadores[chave].jogadas;
    else return 0;
}

function temJogadorComDado(jogadores) {
    return !!(jogadores && Object.values(jogadores).some(jogador => jogador.comDado && jogador.name && jogador.name.trim() !== ''));
}

// Função de gerar cor aleatória
function gerarCorAleatoria() {
    const letras = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letras[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Função para buscar a chave de um jogador baseado no id
function buscarChavePorId(id) {
    // Itera sobre as entradas (chave, valor) do objeto jogadores
    const entrada = Object.entries(jogadores).find(([chave, jogador]) => jogador.id === id);
    
    // Se encontrado, retorna a chave
    if (entrada) {
        return entrada[0]; // A chave está no primeiro elemento da entrada
    }

    return null; // Se não encontrado, retorna null
}

function jogadorDesconectado(socket) {

    if(jogadores[socket.id]) {

        if(jogadores[socket.id].comDado){
            proximo_jogador = passarDado();

            if (proximo_jogador && jogadores[proximo_jogador]) {
                jogadores[proximo_jogador].comDado = true;
            }
            
            jogadores[socket.id].comDado = false;
        }

        
        listaNomesJogadores.delete(jogadores[socket.id].name);
        jogadores[socket.id].name = "";
        io.emit('atualizarJogadores', jogadores);  // Atualizar todos os jogadores
        console.log(`[${socket.id}] Jogador desconectado: ${jogadores[socket.id].name}`);
        
    }
}

function generateId() {
    const i = () => String.fromCharCode(65 + Math.floor(Math.random() * 26));
    return i() + i() + i();
}

// Função para gerar um nome aleatório
function gerarNomeAleatorio() {
    const adjetivo = adjetivos[Math.floor(Math.random() * adjetivos.length)];
    const substantivo = substantivos[Math.floor(Math.random() * substantivos.length)];
    const nomeGerado = `${substantivo} ${adjetivo}`;

    if (listaNomesJogadores.has(nomeGerado)) {
        return gerarNomeAleatorio();
    }

    listaNomesJogadores.add(nomeGerado);
    return nomeGerado;
}

function verificaColisao(jogadorAtual, listaJogadores) {
    const { x, y } = jogadorAtual.corpo;

    return Object.entries(listaJogadores)
        .filter(([id, jogador]) => jogador !== jogadorAtual && jogador.corpo.x === x && jogador.corpo.y === y)
        .map(([id, _]) => id);  // Retorna apenas as chaves (IDs) dos jogadores colididos
}


// Função para pegar o IP local da máquina
const getLocalIP = () => {
    const interfaces = os.networkInterfaces();
    for (const interfaceName in interfaces) {
        for (const iface of interfaces[interfaceName]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address; // Retorna o IP da máquina
            }
        }
    }
    return '127.0.0.1'; // Retorna o IP de localhost se não encontrar
};

server.listen(3000, () => {
    console.log(`Servidor rodando em ${getLocalIP()}:3000`);
});