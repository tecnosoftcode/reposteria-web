// backend/src/controllers/notificationController.js
const db = require('../config/database').pool;
const { getMessaging } = require('firebase-admin/messaging');

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

    // 🔥 GUARDAR TOKEN DIRECTAMENTE EN LA BASE DE DATOS usando el pool
    const [result] = await db.execute(
      'INSERT INTO tokens (token, user_id, updated_at) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE updated_at = NOW(), user_id = COALESCE(?, user_id)',
      [token, userId, userId]
    );
    
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
    const messaging = getMessaging();
    const message = {
      notification: { title, body },
      data: data,
      token: token,
    };

    const response = await messaging.send(message);
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
    const messaging = getMessaging();
    const [tokensRows] = await db.execute('SELECT token FROM tokens');
    const tokens = tokensRows.map(row => row.token);
    
    if (tokens.length === 0) {
      console.log('⚠️ No hay tokens registrados');
      return { successCount: 0, failureCount: 0 };
    }

    const response = await messaging.sendEachForMulticast({
      notification: { title, body },
      data: data,
      tokens: tokens
    });

    console.log(`✅ Notificaciones FCM enviadas: ${response.successCount} de ${tokens.length}`);
    
    // Eliminar tokens inválidos
    if (response.failureCount > 0) {
      for (let i = 0; i < response.responses.length; i++) {
        if (!response.responses[i].success) {
          await db.execute('DELETE FROM tokens WHERE token = ?', [tokens[i]]);
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