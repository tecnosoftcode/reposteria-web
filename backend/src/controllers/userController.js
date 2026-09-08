const db = require('../config/database').pool;
const bcrypt = require('bcryptjs');

// Obtener todos los usuarios
exports.getUsers = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, nombre, email, rol, created_at FROM usuarios ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error obteniendo usuarios:', error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
};

// Crear nuevo usuario
exports.createUser = async (req, res) => {
    const { nombre, email, password, rol } = req.body;
    if (!nombre || !email || !password) {
        return res.status(400).json({ error: 'Nombre, email y password son obligatorios' });
    }
    try {
        const hash = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
            [nombre, email, hash, rol || 'cliente']
        );
        res.status(201).json({ id: result.insertId, nombre, email, rol: rol || 'cliente' });
    } catch (error) {
        console.error('Error creando usuario:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Este email ya está registrado' });
        }
        res.status(500).json({ error: 'Error al crear usuario' });
    }
};

// Editar usuario (sin cambiar contraseña)
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { nombre, email, rol } = req.body;
    try {
        await db.query(
            'UPDATE usuarios SET nombre = ?, email = ?, rol = ? WHERE id = ?',
            [nombre, email, rol, id]
        );
        res.json({ message: 'Usuario actualizado correctamente' });
    } catch (error) {
        console.error('Error actualizando usuario:', error);
        res.status(500).json({ error: 'Error al actualizar usuario' });
    }
};

// Cambiar contraseña
exports.updatePassword = async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;
    if (!password) {
        return res.status(400).json({ error: 'La contraseña es obligatoria' });
    }
    try {
        const hash = await bcrypt.hash(password, 10);
        await db.query('UPDATE usuarios SET password = ? WHERE id = ?', [hash, id]);
        res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        console.error('Error actualizando contraseña:', error);
        res.status(500).json({ error: 'Error al actualizar contraseña' });
    }
};

// Eliminar usuario
exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM usuarios WHERE id = ?', [id]);
        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error('Error eliminando usuario:', error);
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
};