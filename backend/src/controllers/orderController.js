const Order = require('../models/Order');
const { sendNewOrderNotification } = require('../socket');
const notificationController = require('./notificationController');
const telegramService = require('../services/telegram');

// ==========================================
// CREAR PEDIDO
// ==========================================
const createOrder = async (req, res) => {
    try {
        const orderData = req.body;
        
        console.log('📝 orderData COMPLETO:', JSON.stringify(orderData, null, 2));
        console.log('📝 orderData.items:', JSON.stringify(orderData.items, null, 2));
        
        if (!orderData.cliente || !orderData.items || orderData.items.length === 0) {
            return res.status(400).json({ 
                error: 'Faltan datos: cliente y productos son obligatorios' 
            });
        }

        const result = await Order.create(orderData);
        
        // Obtener el pedido completo con detalles
        const order = await Order.getById(result.pedidoId);
        
        // 🔥 ENVIAR NOTIFICACIÓN EN TIEMPO REAL (Socket.io)
        sendNewOrderNotification({
            pedidoId: result.pedidoId,
            cliente: orderData.cliente,
            total: orderData.total,
            items: orderData.items.length,
            timestamp: new Date().toISOString()
        });

        // 🔥 ENVIAR NOTIFICACIÓN PUSH (FCM) A ADMINISTRADORES
        await notificationController.sendNewOrderNotification({
            id: result.pedidoId,
            customerName: orderData.cliente.nombre || 'Cliente'
        });

        // 🔥 ENVIAR NOTIFICACIÓN A TELEGRAM (con ID del pedido)
        console.log('📝 Enviando a Telegram - cliente:', JSON.stringify(orderData.cliente, null, 2));
        console.log('📝 Enviando a Telegram - items:', JSON.stringify(orderData.items, null, 2));
        console.log('📝 Enviando a Telegram - total:', orderData.total);
        console.log('📝 Enviando a Telegram - pedidoId:', result.pedidoId);
        
        await telegramService.sendNewOrderTelegram({
            id: result.pedidoId,           // 🔥 AGREGADO: ID del pedido para el enlace
            cliente: orderData.cliente,
            items: orderData.items,
            total: orderData.total
        });
        
        console.log('📦 Nuevo pedido creado:', result.pedidoId);
        
        res.status(201).json({ 
            message: 'Pedido creado exitosamente',
            pedidoId: result.pedidoId,
            clienteId: result.clienteId
        });
    } catch (error) {
        console.error('❌ Error en createOrder:', error);
        res.status(500).json({ error: 'Error al crear pedido' });
    }
};

// ==========================================
// OBTENER TODOS LOS PEDIDOS
// ==========================================
const getOrders = async (req, res) => {
    try {
        const orders = await Order.getAll();
        res.json(orders);
    } catch (error) {
        console.error('❌ Error en getOrders:', error);
        res.status(500).json({ error: 'Error al obtener pedidos' });
    }
};

// ==========================================
// OBTENER PEDIDO POR ID
// ==========================================
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.getById(id);
        
        if (!order) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }
        
        res.json(order);
    } catch (error) {
        console.error('❌ Error en getOrderById:', error);
        res.status(500).json({ error: 'Error al obtener pedido' });
    }
};

// ==========================================
// ACTUALIZAR ESTADO DEL PEDIDO
// ==========================================
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        
        console.log('📝 Recibiendo actualización:', { id, estado });
        
        const estadosValidos = ['pendiente', 'confirmado', 'preparando', 'enviado', 'entregado', 'cancelado'];
        if (!estadosValidos.includes(estado)) {
            return res.status(400).json({ error: 'Estado no válido' });
        }

        const updated = await Order.updateStatus(id, estado);
        if (!updated) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }
        
        // 🔥 ENVIAR NOTIFICACIÓN PUSH DE CAMBIO DE ESTADO
        await notificationController.sendOrderStatusNotification(id, estado);
        
        // 🔥 ENVIAR NOTIFICACIÓN A TELEGRAM (cambio de estado)
        await telegramService.sendOrderStatusTelegram(id, estado, 'Cliente');
        
        res.json({ message: 'Estado actualizado correctamente' });
    } catch (error) {
        console.error('❌ Error en updateOrderStatus:', error);
        res.status(500).json({ error: 'Error al actualizar estado' });
    }
};

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus
};