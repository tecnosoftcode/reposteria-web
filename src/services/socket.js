import { io } from 'socket.io-client';

// 🔥 URL correcta de Render con HTTPS
const SOCKET_URL = 'https://reposteria-backend-motu.onrender.com';

let socket = null;

export const connectSocket = () => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'], // 🔥 Agregar polling como fallback
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            secure: true // 🔥 Usar HTTPS
        });
        
        socket.on('connect', () => {
            console.log('🔌 Conectado al servidor de notificaciones');
        });
        
        socket.on('disconnect', () => {
            console.log('🔌 Desconectado del servidor de notificaciones');
        });
        
        socket.on('connect_error', (error) => {
            console.error('❌ Error de conexión Socket.io:', error.message);
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