// backend/src/controllers/settingsController.js
const fs = require('fs');
const path = require('path');

// Ruta del archivo de configuración
const settingsFile = path.join(__dirname, '../../settings.json');

// Obtener configuración
exports.getSettings = async (req, res) => {
    try {
        if (fs.existsSync(settingsFile)) {
            const data = fs.readFileSync(settingsFile, 'utf8');
            res.json(JSON.parse(data));
        } else {
            res.json({ delivery_price: 0, payment_methods: [] });
        }
    } catch (error) {
        console.error('Error obteniendo configuración:', error);
        res.status(500).json({ error: 'Error al obtener configuración' });
    }
};

// Guardar configuración
exports.updateSettings = async (req, res) => {
    try {
        const { delivery_price, payment_methods } = req.body;
        
        // Crear objeto de configuración
        const settings = {
            delivery_price: delivery_price || 0,
            payment_methods: payment_methods || []
        };
        
        // Guardar en archivo JSON
        fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
        
        res.json({ message: 'Configuración guardada exitosamente' });
    } catch (error) {
        console.error('Error guardando configuración:', error);
        res.status(500).json({ error: 'Error al guardar configuración' });
    }
};