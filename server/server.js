const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const jogadores = {};  // Armazena todos os jogadores

app.use(express.static('public'));  // Servir os arquivos estáticos da pasta 'public'

io.on('connection', (socket) => {
    console.log('Novo jogador conectado:', socket.id);

    

    // Espera o nome ser enviado para o jogador ser considerado
    socket.on('novoJogador', (nome) => {
        // Verifica se já existe algum jogador com o mesmo nome
        const jogadorExistente = Object.values(jogadores).find(jogador => jogador.id == nome);

        if (jogadorExistente) {
            // Envia uma resposta para o cliente informando que o nome já existe
            socket.emit('erroNome', 'Este nome já está em uso! Escolha outro nome.');
        } else {
            // Caso o nome seja único, cria o novo jogador
            jogadores[socket.id] = {
                id: socket.id,
                nome: nome,  // Agora o nome é atribuído corretamente
                corpo: [{ x: 1, y: 1 }],
                direcao: 'direita',
            };

            console.log(`Jogador ${nome} entrou no jogo!`);
            io.emit('atualizarJogadores', Object.values(jogadores));  // Atualiza todos os jogadores com o novo nome
        }
    });


    // Quando um jogador se move
    socket.on('moverCobra', (jogador) => {
        if(jogador.nome != null){
            jogadores[socket.id] = jogador;
            io.emit('atualizarJogadores', Object.values(jogadores));  // Enviar a atualização para todos os jogadores
        }
    });

    // Quando o jogador se desconectar
    socket.on('disconnect', () => {
        console.log('Jogador desconectado:', socket.id);
        delete jogadores[socket.id];
        io.emit('atualizarJogadores', Object.values(jogadores));  // Atualizar todos os jogadores
    });
});


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
