// backend/src/models/Settings.js
const db = require('../config/database');

class Settings {
    static async createTable() {
        try {
            await db.pool.query(`
                CREATE TABLE IF NOT EXISTS settings (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    delivery_price DECIMAL(10,2) DEFAULT 0,
                    payment_methods JSON,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);
            console.log('✅ Tabla settings creada');
        } catch (error) {
            console.error('❌ Error creando tabla:', error.message);
        }
    }

    static async get() {
        const [rows] = await db.pool.query('SELECT * FROM settings LIMIT 1');
        return rows[0] || null;
    }

    static async save(data) {
        const [existing] = await db.pool.query('SELECT id FROM settings LIMIT 1');
        
        const paymentMethodsJson = JSON.stringify(data.payment_methods || []);
        
        if (existing.length > 0) {
            await db.pool.query(
                'UPDATE settings SET delivery_price = ?, payment_methods = ? WHERE id = ?',
                [data.delivery_price || 0, paymentMethodsJson, existing[0].id]
            );
        } else {
            await db.pool.query(
                'INSERT INTO settings (delivery_price, payment_methods) VALUES (?, ?)',
                [data.delivery_price || 0, paymentMethodsJson]
            );
        }
    }
}

module.exports = Settings;