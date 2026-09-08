import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

let socket = null;

export const connectSocket = () => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5
        });
        
        socket.on('connect', () => {
            console.log('🔌 Conectado al servidor de notificaciones');
        });
        
        socket.on('disconnect', () => {
            console.log('🔌 Desconectado del servidor de notificaciones');
        });
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export const onNewOrder = (callback) => {
    const socketInstance = connectSocket();
    socketInstance.on('new-order', callback);
};

export const offNewOrder = () => {
    const socketInstance = connectSocket();
    socketInstance.off('new-order');
};

export default socket;