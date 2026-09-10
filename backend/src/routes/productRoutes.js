const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// ==========================================
// RUTAS PÚBLICAS (cualquier usuario puede ver)
// ==========================================

// Obtener todos los productos
router.get('/', productController.getProducts);

// Buscar productos
router.get('/search', productController.searchProducts);

// Obtener productos por categoría
router.get('/category/:categoriaId', productController.getProductsByCategory);

// Obtener producto por ID (con detalles)
router.get('/:id', productController.getProductById);

// ==========================================
// 🔥 RUTAS ADMIN (SIN MULTER, JSON directo)
// ==========================================

// Crear producto (el frontend ya sube la imagen a ImageKit)
router.post('/', productController.createProduct);

// Actualizar producto (el frontend ya sube la imagen a ImageKit)
router.put('/:id', productController.updateProduct);

// Eliminar producto
router.delete('/:id', productController.deleteProduct);

module.exports = router;