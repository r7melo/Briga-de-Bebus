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

    socket.on('criarJogador', (id) => {

        const chave = buscarChavePorId(id);

        if (!jogadores[chave]) {
            jogadores[socket.id] = {
                id: id,
                nome: id,
                cor: gerarCorAleatoria(),
                corpo: lista[Math.floor(Math.random() * lista.length)],
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
            jogadores[socket.id].nome = id;
            jogadores[socket.id].cor = gerarCorAleatoria();
            jogadores[socket.id].jogadas = rodadaAtual(),
            jogadores[socket.id].comDado = !temJogadorComDado(jogadores);
            jogadores[socket.id].passos = 0;

            io.emit('atualizarJogadores', jogadores); 
        }

    
        console.log('\n'+rodadaAtual());
        Object.entries(jogadores).forEach(([chave, jogador]) => {
            console.log(`Chave: ${chave}, ID: ${jogador.id}, Jogadas: ${jogador.jogadas}`);
        });
        

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

        if (jogadores[socket.id] && jogadores[socket.id].nome != null && jogadores[socket.id].nome != ''){

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
                
    
                if ((mapa[y][x] != 0) && (jogadores[socket.id].casaPassada != direcao) && (jogador.passos > 0)) {
    
                    jogador.passos--;
                    jogadores[socket.id] = jogador;
                    
                    if (jogador.passos == 0) {
                        jogadores[socket.id].comDado = false;
                        proximo_jogador = passarDado();
                        jogadores[proximo_jogador].comDado = true;
                    }
    
                    io.emit('resultadoDado', jogador);
                    io.emit('atualizarJogadores', jogadores);
                    
    
                }
                
            }
        }
        
    });

    socket.on('jogarDado', () => {

        if (jogadores[socket.id] && jogadores[socket.id].comDado && jogadores[socket.id].nome != '' && jogadores[socket.id].nome != null){
        
            dado = jogarDado()
            jogadores[socket.id].passos = dado;
            jogadores[socket.id].jogadas++;
            io.emit('resultadoDado', jogadores[socket.id]);

        }
    });
    

    // Quando o jogador se desconectar
    socket.on('disconnect', () => {

        if(jogadores[socket.id]) {

            if(jogadores[socket.id].comDado){
                proximo_jogador = passarDado();

                if (proximo_jogador && jogadores[proximo_jogador]) {
                    jogadores[proximo_jogador].comDado = true;
                }
                
                jogadores[socket.id].comDado = false;
            }

            
            
            jogadores[socket.id].nome = "";
            io.emit('atualizarJogadores', jogadores);  // Atualizar todos os jogadores
            console.log('Jogador desconectado:', socket.id);
            
        }

    });
});

function jogarDado() {
    return Math.floor(Math.random() * 6) + 1;
}

function passarDado() {
    return Object.keys(jogadores).filter(id => jogadores[id].nome && jogadores[id].nome.trim() !== '').sort((a, b) => jogadores[a].jogadas - jogadores[b].jogadas)[0];
}

function rodadaAtual() {
    const chave = Object.keys(jogadores).filter(id => jogadores[id].nome && jogadores[id].nome.trim() !== '').sort((a, b) => jogadores[b].jogadas - jogadores[a].jogadas)[0];
    if(jogadores[chave]) return jogadores[chave].jogadas-1;
    else return 0;
}


function temJogadorComDado(jogadores) {
    return !!(jogadores && Object.values(jogadores).some(jogador => jogador.comDado && jogador.nome && jogador.nome.trim() !== ''));
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
