const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Rutas CRUD para categorías
router.get('/', categoryController.getCategories);
router.post('/', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;