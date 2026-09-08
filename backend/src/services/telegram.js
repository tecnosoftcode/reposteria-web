// backend/src/services/telegram.js
const axios = require('axios');
require('dotenv').config();

// Configuración
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

console.log('📋 Configuración de Telegram:');
console.log('   TELEGRAM_BOT_TOKEN:', TELEGRAM_BOT_TOKEN ? '✅ Configurado' : '❌ FALTA');
console.log('   TELEGRAM_CHAT_ID:', TELEGRAM_CHAT_ID ? '✅ Configurado' : '❌ FALTA');

/**
 * Enviar mensaje por Telegram
 */
async function sendTelegramMessage(message, options = {}) {
  try {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error('❌ Faltan configuraciones de Telegram');
      return null;
    }

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const payload = {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML',
      ...options
    };

    const response = await axios.post(url, payload);
    console.log('✅ Mensaje enviado a Telegram');
    return response.data;
  } catch (error) {
    console.error('❌ Error enviando mensaje a Telegram:', error.response?.data?.description || error.message);
    return null;
  }
}

/**
 * Enviar notificación de nuevo pedido
 */
async function sendNewOrderTelegram(orderData) {
  console.log('📝 Telegram - orderData recibido:', JSON.stringify(orderData, null, 2));
  
  // Extraer datos del cliente
  const cliente = orderData.cliente || {};
  const nombre = cliente.nombre || cliente.name || 'Cliente';
  const telefono = cliente.telefono || cliente.phone || cliente.celular || 'No especificado';
  
  // Extraer items
  const items = orderData.items || [];
  const totalItems = items.length;
  
  console.log('📝 Telegram - Items:', JSON.stringify(items, null, 2));
  
  // Calcular total si no viene
  let total = orderData.total || 0;
  
  // Construir detalle de productos
  let detalle = '';
  if (items.length > 0) {
    items.forEach((item, i) => {
      console.log(`📝 Item ${i}:`, JSON.stringify(item, null, 2));
      
      // Intentar obtener el nombre del producto
      const nombreProducto = item.nombre || item.name || item.producto_nombre || item.producto || item.titulo || `Producto ${i+1}`;
      
      // Intentar obtener cantidad
      const cantidad = item.cantidad || item.quantity || item.cant || 1;
      
      // Intentar obtener precio unitario
      const precioUnitario = item.precio || item.price || item.precio_unitario || 0;
      
      // Intentar obtener subtotal
      const subtotal = item.subtotal || item.total || item.sub_total || (precioUnitario * cantidad) || 0;
      
      detalle += `  ${i+1}. ${nombreProducto} x${cantidad} = $${Number(subtotal).toFixed(2)}\n`;
    });
  } else {
    detalle = '  Sin detalles de productos';
  }

  const message = `
🆕 <b>¡NUEVO PEDIDO!</b>

🧑 <b>Cliente:</b> ${nombre}
📞 <b>Teléfono:</b> ${telefono}
📦 <b>Productos:</b> ${totalItems} items
💰 <b>Total:</b> $${Number(total).toFixed(2)}

📝 <b>Detalle:</b>
${detalle}

🔗 <a href="https://t.me/Usupatriz">Ver pedido</a>
`;

  console.log('📝 Telegram - Mensaje final:', message);
  return await sendTelegramMessage(message);
}

/**
 * Enviar notificación de cambio de estado
 */
async function sendOrderStatusTelegram(orderId, status, customerName) {
  const statusEmojis = {
    pending: '⏳',
    confirmed: '✅',
    preparing: '👨‍🍳',
    ready: '📦',
    delivered: '🚚',
    cancelled: '❌'
  };

  const statusMessages = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    preparing: 'En preparación',
    ready: 'Listo para retirar',
    delivered: 'Entregado',
    cancelled: 'Cancelado'
  };

  const message = `
🔄 <b>Actualización de pedido</b>

${statusEmojis[status] || '📌'} <b>Estado:</b> ${statusMessages[status] || status}
🧑 <b>Cliente:</b> ${customerName || 'Cliente'}
📋 <b>Pedido #:</b> ${orderId}

🔗 <a href="https://t.me/Usupatriz">Ver detalles</a>
`;

  return await sendTelegramMessage(message);
}

module.exports = {
  sendTelegramMessage,
  sendNewOrderTelegram,
  sendOrderStatusTelegram
};