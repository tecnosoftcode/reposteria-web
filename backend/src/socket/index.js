const { Server } = require('socket.io');

let io = null;

function initializeSocket(server) {
    io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log('🔌 Cliente conectado:', socket.id);

        socket.on('disconnect', () => {
            console.log('🔌 Cliente desconectado:', socket.id);
        });
    });

    return io;
}

function getIo() {
    if (!io) {
        throw new Error('Socket.io no inicializado');
    }
    return io;
}

function sendNewOrderNotification(orderData) {
    if (io) {
        io.emit('new-order', orderData);
        console.log('📢 Notificación de nuevo pedido enviada');
    }
}

module.exports = {
    initializeSocket,
    getIo,
    sendNewOrderNotification
};