// backend/src/config/database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'reposteria_db',
    port: process.env.DB_PORT || 3306,
    charset: 'utf8mb4', // 🔥 ESTO HACE QUE LOS EMOJIS SE GUARDEN BIEN
    waitForConnections: true,
    connectionLimit: 3,           // 🔥 BAJADO DE 10 A 3
    queueLimit: 0,
    idleTimeout: 60000         // 🔥 Cerrar conexiones inactivas después de 60s
});

async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conectado a MySQL (Clever Cloud en Render)');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Error conectando a MySQL:', error.message);
        return false;
    }
}

module.exports = { pool, testConnection };