const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require("socket.io");
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// AQUI ESTÁ A MUDANÇA: Use a porta do ambiente se estiver disponível, senão use 3000
const PORT = process.env.PORT || 3000; 
const MESSAGES_FILE = 'messages.json';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '')));

// Rota principal para a página de login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

const DADOS_ACESSO = {
    'princesa': '220923',
    'xuxu': '220923'
};

app.post('/login', (req, res) => {
    const { apelido, senha } = req.body;
    const apelidoMinusculo = apelido.toLowerCase();

    if (DADOS_ACESSO[apelidoMinusculo] && DADOS_ACESSO[apelidoMinusculo] === senha) {
        console.log(`Login bem-sucedido para o usuário: ${apelido}`);
        res.status(200).json({ success: true, message: 'Login bem-sucedido.' });
    } else {
        console.log(`Tentativa de login falhou para o apelido: ${apelido}`);
        res.status(401).json({ success: false, message: 'Apelido ou senha incorretos.' });
    }
});

function loadMessages() {
    try {
        const data = fs.readFileSync(MESSAGES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Erro ao ler o arquivo de mensagens:', err);
        return [];
    }
}

function saveMessage(message) {
    const messages = loadMessages();
    messages.push(message);
    try {
        fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf8');
    } catch (err) {
        console.error('Erro ao salvar a mensagem:', err);
    }
}

io.on('connection', (socket) => {
    console.log('Um usuário conectado.');
    socket.emit('load messages', loadMessages());

    socket.on('chat message', (msg) => {
        console.log('Mensagem recebida:', msg);
        saveMessage(msg);
        io.emit('chat message', msg);
    });

    socket.on('disconnect', () => {
        console.log('Um usuário desconectou.');
    });
});

server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});