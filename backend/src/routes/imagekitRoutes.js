const express = require('express');
const router = express.Router();
const ImageKit = require('imagekit');

// 🔥 Configurar ImageKit
const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

// ==========================================
// 🔥 OBTENER TOKEN DE AUTENTICACIÓN
// ==========================================
router.get('/auth', (req, res) => {
    try {
        console.log('🔐 Generando token de ImageKit...');
        
        const authenticationParameters = imagekit.getAuthenticationParameters();
        
        console.log('✅ Token generado:', {
            token: authenticationParameters.token.substring(0, 20) + '...',
            expire: authenticationParameters.expire
        });
        
        res.json(authenticationParameters);
    } catch (error) {
        console.error('❌ Error generando token de ImageKit:', error);
        res.status(500).json({ error: 'Error generando token' });
    }
});

module.exports = router;