// backend/src/controllers/categoryController.js
const db = require('../config/database').pool;

// Obtener todas las categorías
exports.getCategories = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM categorias ORDER BY id ASC');
        res.json(rows);
    } catch (error) {
        console.error('Error obteniendo categorías:', error);
        res.status(500).json({ error: 'Error al obtener categorías' });
    }
};

// Crear nueva categoría
exports.createCategory = async (req, res) => {
    const { nombre, icono } = req.body;
    if (!nombre) {
        return res.status(400).json({ error: 'Nombre es obligatorio' });
    }
    try {
        const [result] = await db.query(
            'INSERT INTO categorias (nombre, icono) VALUES (?, ?)',
            [nombre, icono || null]
        );
        res.status(201).json({ id: result.insertId, nombre, icono: icono || null });
    } catch (error) {
        console.error('Error creando categoría:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Esta categoría ya existe' });
        }
        res.status(500).json({ error: 'Error al crear categoría' });
    }
};

// Editando categoría
exports.updateCategory = async (req, res) => {
    const { id } = req.params;
    const { nombre, icono } = req.body;
    if (!nombre) {
        return res.status(400).json({ error: 'Nombre es obligatorio' });
    }
    try {
        await db.query(
            'UPDATE categorias SET nombre = ?, icono = ? WHERE id = ?',
            [nombre, icono || null, id]
        );
        res.json({ message: 'Categoría actualizada' });
    } catch (error) {
        console.error('Error actualizando categoría:', error);
        res.status(500).json({ error: 'Error al actualizar categoría' });
    }
};

// Eliminar categoría
exports.deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        // Verificar si hay productos en esta categoría
        const [products] = await db.query('SELECT COUNT(*) as count FROM productos WHERE categoria_id = ?', [id]);
        if (products[0].count > 0) {
            return res.status(400).json({ error: 'No se puede eliminar: hay productos en esta categoría' });
        }
        await db.query('DELETE FROM categorias WHERE id = ?', [id]);
        res.json({ message: 'Categoría eliminada' });
    } catch (error) {
        console.error('Error eliminando categoría:', error);
        res.status(500).json({ error: 'Error al eliminar categoría' });
    }
};