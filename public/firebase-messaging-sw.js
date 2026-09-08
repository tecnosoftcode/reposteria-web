// public/firebase-messaging-sw.js
// Importar scripts de Firebase (CDN)
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// 🔥 TU CONFIGURACIÓN DE FIREBASE (LA MISMA QUE ANTES)
const firebaseConfig = {
  apiKey: "AIzaSyA92Kshp5powXHAGAjXErGC9oS6MrO52uE",
  authDomain: "reposteria-scarlet.firebaseapp.com",
  projectId: "reposteria-scarlet",
  storageBucket: "reposteria-scarlet.firebasestorage.app",
  messagingSenderId: "986566211666",
  appId: "1:986566211666:web:f9d462ff406c373deb478b",
  measurementId: "G-00728XRZV0"
};

// Inicializar Firebase en el Service Worker
firebase.initializeApp(firebaseConfig);

// Obtener instancia de messaging
const messaging = firebase.messaging();

// Manejador de mensajes en background
messaging.onBackgroundMessage((payload) => {
  console.log('📨 Mensaje en background:', payload);
  
  const { title, body } = payload.notification || {};
  
  // Mostrar notificación
  self.registration.showNotification(title || 'Nuevo pedido', {
    body: body || 'Tienes un nuevo pedido',
    icon: '/images/logo-scarlet.png',
    badge: '/images/logo-scarlet.png',
    vibrate: [200, 100, 200],
    data: payload.data || {}
  });
});