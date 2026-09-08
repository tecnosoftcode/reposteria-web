const { pool } = require('../config/database');

class Order {
    // ==========================================
    // CREAR PEDIDO COMPLETO
    // ==========================================
    static async create(orderData) {
        const { 
            cliente, 
            items, 
            total, 
            metodo_pago, 
            instrucciones 
        } = orderData;

        let connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();

            // 1. Crear cliente
            const [clienteResult] = await connection.query(
                `INSERT INTO clientes 
                (nombre, apellido, email, telefono, direccion, ciudad)
                VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    cliente.nombre,
                    cliente.apellido,
                    cliente.email || null,
                    cliente.telefono,
                    cliente.direccion,
                    cliente.ciudad
                ]
            );

            const clienteId = clienteResult.insertId;

            // 2. Crear pedido
            const [pedidoResult] = await connection.query(
                `INSERT INTO pedidos 
                (cliente_id, total, metodo_pago, instrucciones, estado)
                VALUES (?, ?, ?, ?, 'pendiente')`,
                [clienteId, total, metodo_pago, instrucciones || null]
            );

            const pedidoId = pedidoResult.insertId;

            // 3. Crear detalles del pedido
            for (const item of items) {
                await connection.query(
                    `INSERT INTO detalles_pedido 
                    (pedido_id, producto_id, cantidad, precio_unitario, subtotal,
                     tamano_seleccionado, sabor_seleccionado, tema_seleccionado)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        pedidoId,
                        item.id,
                        item.quantity || 1,
                        item.price,
                        (item.quantity || 1) * item.price,
                        item.selectedSize || null,
                        item.selectedFlavor || null,
                        item.selectedTheme || null
                    ]
                );
            }

            await connection.commit();
            return { pedidoId, clienteId };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // ==========================================
    // OBTENER TODOS LOS PEDIDOS
    // ==========================================
    static async getAll() {
        const [rows] = await pool.query(`
            SELECT p.*, 
                   c.nombre as cliente_nombre, 
                   c.apellido as cliente_apellido,
                   c.telefono as cliente_telefono,
                   c.direccion as cliente_direccion,
                   c.ciudad as cliente_ciudad
            FROM pedidos p
            LEFT JOIN clientes c ON p.cliente_id = c.id
            ORDER BY p.created_at DESC
        `);
        return rows;
    }

    // ==========================================
    // OBTENER PEDIDO POR ID (CON DETALLES)
    // ==========================================
    static async getById(id) {
        const [pedidoRows] = await pool.query(`
            SELECT p.*, 
                   c.nombre as cliente_nombre, 
                   c.apellido as cliente_apellido,
                   c.email as cliente_email,
                   c.telefono as cliente_telefono,
                   c.direccion as cliente_direccion,
                   c.ciudad as cliente_ciudad
            FROM pedidos p
            LEFT JOIN clientes c ON p.cliente_id = c.id
            WHERE p.id = ?
        `, [id]);

        if (pedidoRows.length === 0) return null;

        const pedido = pedidoRows[0];

        const [detalles] = await pool.query(`
            SELECT d.*, 
                   pr.nombre as producto_nombre,
                   pr.imagen as producto_imagen
            FROM detalles_pedido d
            LEFT JOIN productos pr ON d.producto_id = pr.id
            WHERE d.pedido_id = ?
        `, [id]);

        return {
            ...pedido,
            detalles
        };
    }

    // ==========================================
    // ACTUALIZAR ESTADO DEL PEDIDO
    // ==========================================
    static async updateStatus(id, estado) {
        const [result] = await pool.query(
            'UPDATE pedidos SET estado = ? WHERE id = ?',
            [estado, id]
        );
        return result.affectedRows > 0;
    }

    // ==========================================
    // OBTENER PEDIDOS POR CLIENTE
    // ==========================================
    static async getByCliente(clienteId) {
        const [rows] = await pool.query(`
            SELECT * FROM pedidos 
            WHERE cliente_id = ? 
            ORDER BY created_at DESC
        `, [clienteId]);
        return rows;
    }
}

module.exports = Order;