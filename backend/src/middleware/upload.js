const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crear carpeta uploads si no existe
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('📁 Carpeta uploads creada en:', uploadDir);
}

// Configurar almacenamiento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log('📁 Guardando en:', uploadDir);
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const filename = `product-${uniqueSuffix}${ext}`;
        console.log('📸 Nombre del archivo:', filename);
        cb(null, filename);
    }
});

// Filtro para solo imágenes
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp',
        'image/heic', 'image/heif',  // 🔥 Formatos de iPhone
        'image/bmp', 'image/tiff'    // 🔥 Otros formatos comunes
    ];
    if (allowedTypes.includes(file.mimetype)) {
        console.log('✅ Tipo de archivo permitido:', file.mimetype);
        cb(null, true);
    } else {
        console.log('❌ Tipo de archivo no permitido:', file.mimetype);
        cb(new Error('Solo se permiten imágenes (JPEG, PNG, JPG, GIF, WEBP, HEIC)'), false);
    }
};

// Configurar multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 15 * 1024 * 1024 // 🔥 15MB (para fotos de teléfono)
    },
    fileFilter: fileFilter
});

module.exports = upload;