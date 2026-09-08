const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// ==========================================
// RUTAS PÚBLICAS (clientes)
// ==========================================
router.post('/', orderController.createOrder);

// ==========================================
// RUTAS ADMIN
// ==========================================
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);
router.put('/:id/status', orderController.updateOrderStatus);

// ✅ IMPORTANTE: Exportar el router
module.exports = router;