// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// 🔥 TU CONFIGURACIÓN DE FIREBASE (Copia la que te dio Firebase)
const firebaseConfig = {
  apiKey: "AIzaSyA92Kshp5powXHAGAjXErGC9oS6MrO52uE",
  authDomain: "reposteria-scarlet.firebaseapp.com",
  projectId: "reposteria-scarlet",
  storageBucket: "reposteria-scarlet.firebasestorage.app",
  messagingSenderId: "986566211666",
  appId: "1:986566211666:web:f9d462ff406c373deb478b",
  measurementId: "G-00728XRZV0"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// ==========================================
// FUNCIONES DE NOTIFICACIONES
// ==========================================

// Solicitar permiso y obtener token
export const requestPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('✅ Permiso concedido para notificaciones');
      
      // 🔥 CAMBIA ESTA VAPID KEY POR LA TUYA
      const token = await getToken(messaging, {
        vapidKey: 'BAyuR_vabg4_s5lxG4ObnNUuLS9UVgrnw-jymyvWcDW17tz-SYSA0GsAC7SfdIJY-0bPmXN3QfsAfS2A8zukTkg'
      });
      
      console.log('✅ Token FCM:', token);
      
      // Guardar token en el backend (después crearemos esta ruta)
      await saveTokenToServer(token);
      
      return token;
    } else {
      console.log('❌ Permiso denegado para notificaciones');
      return null;
    }
  } catch (error) {
    console.error('❌ Error solicitando permiso:', error);
    return null;
  }
};

// Guardar token en el backend
const saveTokenToServer = async (token) => {
  try {
    const response = await fetch('https://reposteria-backend-motu.onrender.com/api/notifications/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
    
    if (response.ok) {
      console.log('✅ Token guardado en el backend');
    }
  } catch (error) {
    console.error('❌ Error guardando token:', error);
  }
};

// Escuchar mensajes cuando la app está abierta
export const listenForMessages = () => {
  onMessage(messaging, (payload) => {
    console.log('📨 Mensaje recibido:', payload);
    
    // Mostrar notificación en la interfaz
    showNotification(payload);
  });
};

// Mostrar notificación en la interfaz
const showNotification = (payload) => {
  const { title, body } = payload.notification || {};
  
  // Si el navegador soporta notificaciones
  if (Notification.permission === 'granted') {
    new Notification(title || 'Nuevo pedido', {
      body: body || 'Tienes un nuevo pedido',
      icon: '/images/logo-scarlet.png'
    });
  }
};

export default messaging;