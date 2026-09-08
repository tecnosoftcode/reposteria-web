// backend/src/controllers/notificationController.js
const Token = require('../models/Token');

// Importar Firebase Admin (puede ser null si no se inicializó)
let admin;
try {
  admin = require('../config/firebase');
  if (!admin) {
    console.error('❌ Firebase Admin no está disponible');
  } else {
    console.log('✅ Firebase Admin cargado correctamente');
  }
} catch (error) {
  console.error('❌ Error cargando Firebase:', error.message);
  admin = null;
}

// Registrar token
const registerToken = async (req, res) => {
  try {
    console.log('📝 Body recibido:', req.body);
    
    const { token } = req.body;
    const userId = req.user?.id || null;

    if (!token) {
      return res.status(400).json({ 
        success: false, 
        error: 'Token es requerido' 
      });
    }

    const result = await Token.saveToken(token, userId);
    console.log('✅ Token guardado en DB:', result);

    res.json({
      success: true,
      message: 'Token registrado exitosamente'
    });
  } catch (error) {
    console.error('❌ Error en registerToken:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Enviar notificación a un dispositivo
const sendToDevice = async (token, title, body, data = {}) => {
  try {
    if (!admin) {
      console.error('❌ Firebase Admin no inicializado');
      return null;
    }

    const message = {
      notification: { title, body },
      data: data,
      token: token,
    };

    const response = await admin.messaging().send(message);
    console.log('✅ Notificación enviada a dispositivo:', response);
    return response;
  } catch (error) {
    console.error('❌ Error enviando notificación:', error);
    throw error;
  }
};

// Enviar a todos los dispositivos
const sendToAll = async (title, body, data = {}) => {
  try {
    if (!admin) {
      console.error('❌ Firebase Admin no inicializado, omitiendo notificaciones FCM');
      return { successCount: 0, failureCount: 0, error: 'Firebase no disponible' };
    }

    const tokens = await Token.getAllTokens();
    
    if (tokens.length === 0) {
      console.log('⚠️ No hay tokens registrados');
      return { successCount: 0, failureCount: 0 };
    }

    const response = await admin.messaging().sendEachForMulticast({
      notification: { title, body },
      data: data,
      tokens: tokens
    });

    console.log(`✅ Notificaciones FCM enviadas: ${response.successCount} de ${tokens.length}`);
    
    // Eliminar tokens inválidos
    if (response.failureCount > 0) {
      for (let i = 0; i < response.responses.length; i++) {
        if (!response.responses[i].success) {
          await Token.deleteToken(tokens[i]);
        }
      }
    }

    return response;
  } catch (error) {
    console.error('❌ Error enviando notificaciones FCM:', error.message);
    return { successCount: 0, failureCount: 0, error: error.message };
  }
};

// Enviar notificación de nuevo pedido
const sendNewOrderNotification = async (orderData) => {
  const title = '📦 ¡Nuevo pedido!';
  const body = `Nuevo pedido #${orderData.id || 'nuevo'} de ${orderData.customerName || 'cliente'}`;
  const data = {
    type: 'new_order',
    orderId: String(orderData.id || ''),
    click_action: '/admin/orders'
  };

  return await sendToAll(title, body, data);
};

// Enviar notificación de cambio de estado
const sendOrderStatusNotification = async (orderId, status, customerToken = null) => {
  const statusMessages = {
    pending: '⏳ Pedido pendiente',
    confirmed: '✅ Pedido confirmado',
    preparing: '👨‍🍳 Pedido en preparación',
    ready: '📦 Pedido listo',
    delivered: '🚚 Pedido entregado',
    cancelled: '❌ Pedido cancelado'
  };

  const title = '🔄 Actualización de pedido';
  const body = statusMessages[status] || `Estado: ${status}`;
  const data = {
    type: 'order_status',
    orderId: String(orderId),
    status: status,
    click_action: '/orders'
  };

  if (customerToken) {
    return await sendToDevice(customerToken, title, body, data);
  }
  
  return await sendToAll(title, body, data);
};

module.exports = {
  registerToken,
  sendToDevice,
  sendToAll,
  sendNewOrderNotification,
  sendOrderStatusNotification
};