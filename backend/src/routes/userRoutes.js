const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Rutas CRUD para usuarios
router.get('/', userController.getUsers);           // Listar todos
router.post('/', userController.createUser);        // Crear nuevo
router.put('/:id', userController.updateUser);      // Editar datos
router.put('/:id/password', userController.updatePassword); // Cambiar contraseña
router.delete('/:id', userController.deleteUser);   // Eliminar

module.exports = router;