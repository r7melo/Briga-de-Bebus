const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);  

const mapa = require('./mapa.js');

const lista = [
    {x: 20, y: 26},
    {x: 19, y: 26},
    {x: 18, y: 26},
    {x: 17, y: 26},
    {x: 18, y: 9},
    {x: 19, y: 9},
    {x: 20, y: 9},
    {x: 21, y: 9},
    {x: 22, y: 9},
];


const jogadores = {};  // Armazena todos os jogadores

app.use(express.static('public'));  // Servir os arquivos estáticos da pasta 'public'


io.on('connection', (socket) => {

    io.emit('atualizarJogadores', jogadores); 

    socket.on('criarJogador', (e) => {

        jogadores[socket.id] = {
            id: socket.id,
            nome: null,
            cor: gerarCorAleatoria(),
            corpo: lista[Math.floor(Math.random() * lista.length)],
            passos: 0,
            jogadas: 0,
            comDado: !temJogadorComDado(jogadores),
            casaPassada: null
        }
    
        io.emit('definirCor', jogadores[socket.id]);
        

        console.log('Novo jogador conectado:', socket.id);
    });
    
    // Espera o nome ser enviado para o jogador ser considerado
    socket.on('editarNome', (novoNome) => {
        // Verifica se o jogador existe antes de tentar modificar o nome
        if (jogadores[socket.id]) {
            // Verifica se já existe algum jogador com o mesmo nome
            const jogadorExistente = Object.values(jogadores).find(jogador => jogador.nome === novoNome);

            if (!jogadorExistente) {
                // Atribui o novo nome ao jogador
                jogadores[socket.id].nome = novoNome;
                io.emit('atualizarJogadores', jogadores);  // Atualiza todos os jogadores com o novo nome
            } else {
                // Caso já exista um jogador com o mesmo nome
                socket.emit('erroNome', 'Já existe um jogador com esse nome');
            }
        } else {
            // Caso o jogador não exista no objeto jogadores
            socket.emit('erroNome', 'Jogador não encontrado');
        }
    });


    // Quando um jogador se move
    socket.on('mover', (direcao) => {

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
            

            if ((mapa[y][x] == 1) && (jogadores[socket.id].casaPassada != direcao) && (jogador.passos > 0)) {

                jogador.passos--;
                jogadores[socket.id] = jogador;
                
                if (jogador.passos == 0) {
                    jogador.passos = '🎲'
                    proximo_jogador = passarDado();
                    jogadores[proximo_jogador].comDado = true;
                }

                io.emit('resultadoDado', jogador);
                io.emit('atualizarJogadores', jogadores);


            }
            
        }
    });

    socket.on('jogarDado', (direcao) => {
        if (jogadores[socket.id] && jogadores[socket.id].comDado) {
        
            dado = jogarDado()
            jogadores[socket.id].passos = dado;
            jogadores[socket.id].comDado = false;
            jogadores[socket.id].jogadas++;
            io.emit('resultadoDado', jogadores[socket.id]);

        }
    });
    

    socket.on('darDado', (id) => {
        if (jogadores[id]) {
            jogadores[id].comDado = true;
        }
    });

    // Quando o jogador se desconectar
    socket.on('disconnect', () => {
        console.log('Jogador desconectado:', socket.id);
        delete jogadores[socket.id];
        io.emit('atualizarJogadores', jogadores);  // Atualizar todos os jogadores
    });
});

function jogarDado() {
    return Math.floor(Math.random() * 6) + 1;
}

function passarDado() {
    return Object.keys(jogadores).reduce((menorId, id) => jogadores[id].jogadas < jogadores[menorId].jogadas ? id : menorId, Object.keys(jogadores)[0]);
}

function temJogadorComDado(jogadores) {
    return !!(jogadores && Object.values(jogadores).some(jogador => jogador.comDado));
}




// Função de gerar cor aleatória
function gerarCorAleatoria() {
    const letras = '0123456789ABCDEF';
    let cor = '#';
    for (let i = 0; i < 6; i++) {
        cor += letras[Math.floor(Math.random() * 16)];
    }
    return cor;
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
