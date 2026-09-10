// backend/src/controllers/settingsController.js
const db = require('../config/database').pool;

// Obtener configuración
exports.getSettings = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM settings LIMIT 1');
        
        if (rows.length === 0) {
            // Si no hay fila, devolver valores por defecto
            return res.json({ 
                delivery_price: 0, 
                payment_methods: [] 
            });
        }
        
        const settings = rows[0];
        
        // 🔥 Convertir payment_methods de JSON string a objeto
        let paymentMethods = [];
        try {
            paymentMethods = typeof settings.payment_methods === 'string'
                ? JSON.parse(settings.payment_methods)
                : (settings.payment_methods || []);
        } catch (e) {
            paymentMethods = [];
        }
        
        res.json({
            delivery_price: parseFloat(settings.delivery_price) || 0,
            payment_methods: paymentMethods
        });
    } catch (error) {
        console.error('Error obteniendo configuración:', error);
        res.status(500).json({ error: 'Error al obtener configuración' });
    }
};

// Guardar configuración
exports.updateSettings = async (req, res) => {
    try {
        const { delivery_price, payment_methods } = req.body;
        
        const deliveryPrice = parseFloat(delivery_price) || 0;
        const paymentMethodsJson = JSON.stringify(payment_methods || []);
        
        // Verificar si ya existe una fila
        const [existing] = await db.query('SELECT id FROM settings LIMIT 1');
        
        if (existing.length > 0) {
            // Actualizar
            await db.query(
                'UPDATE settings SET delivery_price = ?, payment_methods = ? WHERE id = ?',
                [deliveryPrice, paymentMethodsJson, existing[0].id]
            );
        } else {
            // Insertar nueva fila
            await db.query(
                'INSERT INTO settings (delivery_price, payment_methods) VALUES (?, ?)',
                [deliveryPrice, paymentMethodsJson]
            );
        }
        
        res.json({ message: 'Configuración guardada exitosamente' });
    } catch (error) {
        console.error('Error guardando configuración:', error);
        res.status(500).json({ error: 'Error al guardar configuración' });
    }
};