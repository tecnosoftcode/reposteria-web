// backend/src/models/Product.js
const db = require('../config/database');

class Product {
    // ==========================================
    // OBTENER TODOS LOS PRODUCTOS
    // ==========================================
    static async getAll() {
        const [rows] = await db.pool.query(`
            SELECT p.*, c.nombre as categoria_nombre, c.icono as categoria_icono
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            ORDER BY p.created_at DESC
        `);
        
        // 🔥 CONVERTIR TIPOS para evitar errores en la app móvil
        return rows.map(row => ({
            ...row,
            id: Number(row.id),
            precio: Number(row.precio),
            descuento: Number(row.descuento || 0),
            en_stock: row.en_stock === 1 || row.en_stock === true,
            destacado: row.destacado === 1 || row.destacado === true,
            categoria_id: Number(row.categoria_id),
        }));
    }

    // ==========================================
    // OBTENER PRODUCTO POR ID
    // ==========================================
    static async getById(id) {
        const [rows] = await db.pool.query(`
            SELECT p.*, c.nombre as categoria_nombre, c.icono as categoria_icono
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            WHERE p.id = ?
        `, [id]);

        if (rows.length === 0) return null;

        const product = rows[0];

        const [sizes] = await db.pool.query(`
            SELECT t.nombre FROM tamanos t
            JOIN producto_tamanos pt ON t.id = pt.tamano_id
            WHERE pt.producto_id = ?
        `, [id]);

        const [flavors] = await db.pool.query(`
            SELECT s.nombre FROM sabores s
            JOIN producto_sabores ps ON s.id = ps.sabor_id
            WHERE ps.producto_id = ?
        `, [id]);

        const [themes] = await db.pool.query(`
            SELECT t.nombre FROM temas t
            JOIN producto_temas pt ON t.id = pt.tema_id
            WHERE pt.producto_id = ?
        `, [id]);

        return {
            ...product,
            id: Number(product.id),
            precio: Number(product.precio),
            descuento: Number(product.descuento || 0),
            en_stock: product.en_stock === 1 || product.en_stock === true,
            destacado: product.destacado === 1 || product.destacado === true,
            categoria_id: Number(product.categoria_id),
            sizes: sizes.map(s => s.nombre),
            flavors: flavors.map(f => f.nombre),
            themes: themes.map(t => t.nombre)
        };
    }

    // ==========================================
    // CREAR PRODUCTO
    // ==========================================
    static async create(data) {
        const { 
            nombre, descripcion, precio, descuento, 
            imagen, categoria_id, en_stock, destacado,
            sizes, flavors, themes
        } = data;

        const [result] = await db.pool.query(
            `INSERT INTO productos 
            (nombre, descripcion, precio, descuento, imagen, categoria_id, en_stock, destacado)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [nombre, descripcion, precio, descuento || 0, imagen, categoria_id, en_stock !== false, destacado || false]
        );

        const productId = result.insertId;

        if (sizes && sizes.length > 0) {
            for (const sizeName of sizes) {
                let [sizeRows] = await db.pool.query(
                    'SELECT id FROM tamanos WHERE nombre = ?',
                    [sizeName]
                );
                let sizeId;
                if (sizeRows.length === 0) {
                    const [newSize] = await db.pool.query(
                        'INSERT INTO tamanos (nombre, precio_extra) VALUES (?, 0)',
                        [sizeName]
                    );
                    sizeId = newSize.insertId;
                } else {
                    sizeId = sizeRows[0].id;
                }
                await db.pool.query(
                    'INSERT INTO producto_tamanos (producto_id, tamano_id) VALUES (?, ?)',
                    [productId, sizeId]
                );
            }
        }

        if (flavors && flavors.length > 0) {
            for (const flavorName of flavors) {
                let [flavorRows] = await db.pool.query(
                    'SELECT id FROM sabores WHERE nombre = ?',
                    [flavorName]
                );
                let flavorId;
                if (flavorRows.length === 0) {
                    const [newFlavor] = await db.pool.query(
                        'INSERT INTO sabores (nombre) VALUES (?)',
                        [flavorName]
                    );
                    flavorId = newFlavor.insertId;
                } else {
                    flavorId = flavorRows[0].id;
                }
                await db.pool.query(
                    'INSERT INTO producto_sabores (producto_id, sabor_id) VALUES (?, ?)',
                    [productId, flavorId]
                );
            }
        }

        if (themes && themes.length > 0) {
            for (const themeName of themes) {
                let [themeRows] = await db.pool.query(
                    'SELECT id FROM temas WHERE nombre = ?',
                    [themeName]
                );
                let themeId;
                if (themeRows.length === 0) {
                    const [newTheme] = await db.pool.query(
                        'INSERT INTO temas (nombre) VALUES (?)',
                        [themeName]
                    );
                    themeId = newTheme.insertId;
                } else {
                    themeId = themeRows[0].id;
                }
                await db.pool.query(
                    'INSERT INTO producto_temas (producto_id, tema_id) VALUES (?, ?)',
                    [productId, themeId]
                );
            }
        }

        return productId;
    }

    // ==========================================
    // ACTUALIZAR PRODUCTO
    // ==========================================
    static async update(id, data) {
        const { 
            nombre, descripcion, precio, descuento, 
            imagen, categoria_id, en_stock, destacado 
        } = data;

        const [result] = await db.pool.query(
            `UPDATE productos 
            SET nombre = ?, descripcion = ?, precio = ?, descuento = ?,
                imagen = ?, categoria_id = ?, en_stock = ?, destacado = ?
            WHERE id = ?`,
            [nombre, descripcion, precio, descuento || 0, imagen, categoria_id, en_stock !== false, destacado || false, id]
        );

        return result.affectedRows > 0;
    }

    // ==========================================
    // ELIMINAR PRODUCTO
    // ==========================================
    static async delete(id) {
        const [result] = await db.pool.query('DELETE FROM productos WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    // ==========================================
    // BUSCAR PRODUCTOS
    // ==========================================
    static async search(term, categoria_id = null) {
        let query = `
            SELECT p.*, c.nombre as categoria_nombre, c.icono as categoria_icono
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            WHERE (p.nombre LIKE ? OR p.descripcion LIKE ?)
        `;
        const params = [`%${term}%`, `%${term}%`];

        if (categoria_id) {
            query += ' AND p.categoria_id = ?';
            params.push(categoria_id);
        }

        query += ' ORDER BY p.created_at DESC';

        const [rows] = await db.pool.query(query, params);
        
        return rows.map(row => ({
            ...row,
            id: Number(row.id),
            precio: Number(row.precio),
            descuento: Number(row.descuento || 0),
            en_stock: row.en_stock === 1 || row.en_stock === true,
            destacado: row.destacado === 1 || row.destacado === true,
            categoria_id: Number(row.categoria_id),
        }));
    }

    // ==========================================
    // OBTENER PRODUCTOS POR CATEGORÍA
    // ==========================================
    static async getByCategory(categoria_id) {
        const [rows] = await db.pool.query(`
            SELECT p.*, c.nombre as categoria_nombre, c.icono as categoria_icono
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            WHERE p.categoria_id = ?
            ORDER BY p.created_at DESC
        `, [categoria_id]);
        
        return rows.map(row => ({
            ...row,
            id: Number(row.id),
            precio: Number(row.precio),
            descuento: Number(row.descuento || 0),
            en_stock: row.en_stock === 1 || row.en_stock === true,
            destacado: row.destacado === 1 || row.destacado === true,
            categoria_id: Number(row.categoria_id),
        }));
    }
}

module.exports = Product;