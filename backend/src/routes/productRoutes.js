const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const upload = require('../middleware/upload');

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
// RUTAS ADMIN (solo el admin puede modificar)
// ==========================================

// Crear producto (con subida de imagen)
router.post('/', upload.single('imagen'), productController.createProduct);

// Actualizar producto (con subida de imagen)
router.put('/:id', upload.single('imagen'), productController.updateProduct);

// Eliminar producto
router.delete('/:id', productController.deleteProduct);

module.exports = router;