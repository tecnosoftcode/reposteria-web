const multer = require('multer');
const ImageKit = require('imagekit');

// ==========================================
// 🔥 CONFIGURAR IMAGEKIT
// ==========================================
const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

// ==========================================
// 🔥 USAR MEMORIA (no disco) PARA SUBIR A IMAGEKIT
// ==========================================
const storage = multer.memoryStorage();

// ==========================================
// FILTRO PARA IMÁGENES
// ==========================================
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp',
        'image/heic', 'image/heif',  // Formatos de iPhone
        'image/bmp', 'image/tiff'    // Otros formatos comunes
    ];
    if (allowedTypes.includes(file.mimetype)) {
        console.log('✅ Tipo de archivo permitido:', file.mimetype);
        cb(null, true);
    } else {
        console.log('❌ Tipo de archivo no permitido:', file.mimetype);
        cb(new Error('Solo se permiten imágenes (JPEG, PNG, JPG, GIF, WEBP, HEIC)'), false);
    }
};

// ==========================================
// CONFIGURAR MULTER
// ==========================================
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 15 * 1024 * 1024 // 15MB
    },
    fileFilter: fileFilter
});

// ==========================================
// 🔥 FUNCIÓN PARA SUBIR A IMAGEKIT
// ==========================================
upload.uploadToImageKit = async (file) => {
    try {
        // Generar nombre único
        const ext = file.originalname.split('.').pop() || 'jpg';
        const filename = `producto-${Date.now()}-${Math.round(Math.random() * 1E9)}.${ext}`;

        console.log('📸 Subiendo a ImageKit:', filename);
        console.log('📸 Tamaño:', (file.size / 1024).toFixed(2), 'KB');
        console.log('📸 Tipo:', file.mimetype);

        // Subir el buffer a ImageKit
        const result = await imagekit.upload({
            file: file.buffer,           // Buffer de la imagen (en memoria)
            fileName: filename,          // Nombre del archivo
            folder: '/reposteria-productos', // Carpeta en ImageKit
            useUniqueFileName: true      // Evitar duplicados
        });

        console.log('✅ Imagen subida a ImageKit:', result.url);

        return {
            url: result.url,
            fileId: result.fileId,
            name: result.name
        };
    } catch (error) {
        console.error('❌ Error subiendo a ImageKit:', error);
        throw error;
    }
};

module.exports = upload;