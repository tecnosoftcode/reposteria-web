const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
require('dotenv').config();

const { testConnection } = require('./config/database');
const { initializeSocket } = require('./socket');

// Importar rutas
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const notificationRoutes = require('./routes/notificationRoutes'); // 🔥 NUEVO

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ==========================================
// RUTAS
// ==========================================
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes); // 🔥 NUEVO

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: '🚀 Servidor funcionando con MySQL + XAMPP',
        timestamp: new Date().toISOString()
    });
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(500).json({ 
        error: 'Algo salió mal en el servidor',
        message: err.message 
    });
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================
const PORT = process.env.PORT || 5000;

async function startServer() {
    console.log('🔄 Verificando conexión a MySQL...');
    const dbConnected = await testConnection();
    
    if (dbConnected) {
        // Crear servidor HTTP
        const server = http.createServer(app);
        
        // Inicializar Socket.io
        initializeSocket(server);
        console.log('🔌 Socket.io inicializado');
        
        server.listen(PORT, () => {
            console.log(`🚀 Servidor en http://localhost:${PORT}`);
            console.log(`📡 Health: http://localhost:${PORT}/api/health`);
            console.log(`📦 Productos: http://localhost:${PORT}/api/products`);
            console.log(`🛒 Pedidos: http://localhost:${PORT}/api/orders`);
            console.log(`📨 Notificaciones: http://localhost:${PORT}/api/notifications`); // 🔥 NUEVO
        });
    } else {
        console.log('❌ No se pudo iniciar el servidor');
        process.exit(1);
    }
}

startServer();

module.exports = app;