const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// ==========================================
// RUTAS PÚBLICAS (cualquiera puede ver y crear reseñas)
// ==========================================

// Obtener reseñas de un producto
router.get('/product/:productId', reviewController.getProductReviews);

// Obtener promedio de estrellas de un producto
router.get('/product/:productId/rating', reviewController.getProductRating);

// Crear nueva reseña
router.post('/product/:productId', reviewController.createReview);

// ==========================================
// RUTAS ADMIN (solo el admin puede ver todas y eliminar)
// ==========================================

// Obtener TODAS las reseñas (para moderación)
router.get('/', reviewController.getAllReviews);

// Eliminar una reseña
router.delete('/:id', reviewController.deleteReview);

module.exports = router;