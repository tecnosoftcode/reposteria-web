// backend/src/controllers/settingsController.js
const db = require('../config/database').pool;

// Obtener configuración
exports.getSettings = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM settings LIMIT 1');
        res.json(rows[0] || {});
    } catch (error) {
        console.error('Error obteniendo configuración:', error);
        res.status(500).json({ error: 'Error al obtener configuración' });
    }
};

// Guardar configuración
exports.updateSettings = async (req, res) => {
    try {
        const { delivery_price, payment_methods } = req.body;
        
        // Convertir métodos de pago a JSON string
        const paymentMethodsJson = JSON.stringify(payment_methods || []);
        
        // Verificar si ya existe una configuración
        const [existing] = await db.query('SELECT id FROM settings LIMIT 1');
        
        if (existing.length > 0) {
            await db.query(
                'UPDATE settings SET delivery_price = ?, payment_methods = ? WHERE id = ?',
                [delivery_price || 0, paymentMethodsJson, existing[0].id]
            );
        } else {
            await db.query(
                'INSERT INTO settings (delivery_price, payment_methods) VALUES (?, ?)',
                [delivery_price || 0, paymentMethodsJson]
            );
        }
        
        res.json({ message: 'Configuración guardada exitosamente' });
    } catch (error) {
        console.error('Error guardando configuración:', error);
        res.status(500).json({ error: 'Error al guardar configuración' });
    }
};