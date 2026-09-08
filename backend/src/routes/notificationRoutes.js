// backend/src/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const Token = require('../models/Token');

// Registrar token (público - cualquiera puede registrar su token)
router.post('/register', notificationController.registerToken);

// Eliminar token - VERSIÓN SIMPLIFICADA (sin auth por ahora)
router.delete('/unregister', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, error: 'Token requerido' });
    }
    await Token.deleteToken(token);
    res.json({ success: true, message: 'Token eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Enviar notificación a todos - VERSIÓN SIMPLIFICADA (sin auth por ahora)
router.post('/broadcast', async (req, res) => {
  try {
    const { title, body, data } = req.body;
    
    if (!title || !body) {
      return res.status(400).json({ success: false, error: 'Título y cuerpo son requeridos' });
    }
    
    const result = await notificationController.sendToAll(title, body, data || {});
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;