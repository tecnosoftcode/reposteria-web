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
const userRoutes = require('./routes/userRoutes'); // 🔥 NUEVO USUARIOS

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos (Imágenes subidas)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ==========================================
// RUTAS API
// ==========================================
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes); // 🔥 RUTA USUARIOS

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: '🚀 Servidor funcionando con MySQL + XAMPP',
        timestamp: new Date().toISOString()
    });
});

// ==========================================
// SERVIR EL FRONTEND (VITE / REACT) - CORREGIDO
// ==========================================
// La carpeta 'dist' se genera en la raíz del proyecto (un nivel arriba de backend)
const distPath = path.join(__dirname, '../../dist');
app.use(express.static(distPath));

// Cualquier ruta que no sea /api, enviar el index.html (para React Router)
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
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
    
    // Intenta conectar a la base de datos, pero NO detengas el servidor si falla en Render
    let dbConnected = false;
    try {
        dbConnected = await testConnection();
    } catch (error) {
        console.error('❌ Error al probar la conexión a la base de datos:', error.message);
    }
    
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
        console.log(`📨 Notificaciones: http://localhost:${PORT}/api/notifications`);
        console.log(`👥 Usuarios: http://localhost:${PORT}/api/users`); // 🔥 NUEVO
        
        if (dbConnected) {
            console.log('✅ Base de datos conectada correctamente.');
        } else {
            console.log('⚠️  ADVERTENCIA: La base de datos NO está conectada. El servidor sigue corriendo, pero las funciones de datos fallarán.');
        }
    });
}

startServer();

module.exports = app;