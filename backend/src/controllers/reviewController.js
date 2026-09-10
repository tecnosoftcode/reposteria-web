// backend/src/controllers/reviewController.js
const db = require('../config/database').pool;

// ==========================================
// OBTENER RESEÑAS DE UN PRODUCTO
// ==========================================
exports.getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        const [rows] = await db.query(
            `SELECT 
                id,
                producto_id,
                nombre_cliente,
                rating,
                comentario,
                created_at
            FROM reviews
            WHERE producto_id = ? AND aprobado = 1
            ORDER BY created_at DESC`,
            [productId]
        );

        res.json(rows);
    } catch (error) {
        console.error('Error obteniendo reseñas:', error);
        res.status(500).json({ error: 'Error al obtener reseñas' });
    }
};

// ==========================================
// OBTENER PROMEDIO DE ESTRELLAS DE UN PRODUCTO
// ==========================================
exports.getProductRating = async (req, res) => {
    try {
        const { productId } = req.params;

        const [rows] = await db.query(
            `SELECT 
                COUNT(*) as total_reviews,
                COALESCE(AVG(rating), 0) as average_rating
            FROM reviews
            WHERE producto_id = ? AND aprobado = 1`,
            [productId]
        );

        const result = rows[0];

        res.json({
            total_reviews: parseInt(result.total_reviews) || 0,
            average_rating: parseFloat(result.average_rating) || 0
        });
    } catch (error) {
        console.error('Error obteniendo rating:', error);
        res.status(500).json({ error: 'Error al obtener rating' });
    }
};

// ==========================================
// CREAR NUEVA RESEÑA
// ==========================================
exports.createReview = async (req, res) => {
    try {
        const { productId } = req.params;
        const { nombre_cliente, email_cliente, rating, comentario } = req.body;

        // Validaciones
        if (!nombre_cliente || !nombre_cliente.trim()) {
            return res.status(400).json({ error: 'El nombre es obligatorio' });
        }
        if (!comentario || !comentario.trim()) {
            return res.status(400).json({ error: 'El comentario es obligatorio' });
        }
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'El rating debe ser entre 1 y 5' });
        }

        // Verificar que el producto existe
        const [product] = await db.query(
            'SELECT id FROM productos WHERE id = ?',
            [productId]
        );

        if (product.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        // Insertar la reseña
        const [result] = await db.query(
            `INSERT INTO reviews 
                (producto_id, nombre_cliente, email_cliente, rating, comentario, aprobado)
            VALUES (?, ?, ?, ?, ?, 1)`,
            [
                productId,
                nombre_cliente.trim(),
                email_cliente?.trim() || null,
                parseInt(rating),
                comentario.trim()
            ]
        );

        res.status(201).json({
            message: '¡Gracias por tu reseña!',
            id: result.insertId
        });
    } catch (error) {
        console.error('Error creando reseña:', error);
        res.status(500).json({ error: 'Error al crear reseña' });
    }
};

// ==========================================
// ELIMINAR UNA RESEÑA (solo admin)
// ==========================================
exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            'DELETE FROM reviews WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Reseña no encontrada' });
        }

        res.json({ message: 'Reseña eliminada correctamente' });
    } catch (error) {
        console.error('Error eliminando reseña:', error);
        res.status(500).json({ error: 'Error al eliminar reseña' });
    }
};

// ==========================================
// OBTENER TODAS LAS RESEÑAS (solo admin)
// ==========================================
exports.getAllReviews = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT 
                r.*,
                p.nombre as producto_nombre
            FROM reviews r
            LEFT JOIN productos p ON r.producto_id = p.id
            ORDER BY r.created_at DESC`
        );

        res.json(rows);
    } catch (error) {
        console.error('Error obteniendo todas las reseñas:', error);
        res.status(500).json({ error: 'Error al obtener reseñas' });
    }
};