// backend/src/controllers/productController.js
const Product = require('../models/Product');

// ==========================================
// OBTENER TODOS LOS PRODUCTOS
// ==========================================
const getProducts = async (req, res) => {
    try {
        console.log('📦 Obteniendo productos...');
        const products = await Product.getAll();
        console.log('✅ Productos obtenidos:', products.length);
        res.json(products);
    } catch (error) {
        console.error('❌ Error en getProducts:', error.message);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
};

// ==========================================
// OBTENER PRODUCTO POR ID
// ==========================================
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.getById(id);
        
        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        res.json(product);
    } catch (error) {
        console.error('❌ Error en getProductById:', error.message);
        res.status(500).json({ error: 'Error al obtener producto' });
    }
};

// ==========================================
// CREAR PRODUCTO
// ==========================================
const createProduct = async (req, res) => {
    try {
        console.log('📦 Creando producto...');
        console.log('📝 Body:', req.body);

        const productData = req.body;
        
        if (!productData.nombre || !productData.precio) {
            return res.status(400).json({ 
                error: 'Faltan datos: nombre y precio son obligatorios' 
            });
        }

        if (req.file) {
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            productData.imagen = `${baseUrl}/uploads/${req.file.filename}`;
        }

        const id = await Product.create(productData);
        const newProduct = await Product.getById(id);
        res.status(201).json(newProduct);
    } catch (error) {
        console.error('❌ Error en createProduct:', error.message);
        res.status(500).json({ error: 'Error al crear producto' });
    }
};

// ==========================================
// ACTUALIZAR PRODUCTO
// ==========================================
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const productData = req.body;
        
        if (req.file) {
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            productData.imagen = `${baseUrl}/uploads/${req.file.filename}`;
        }

        const updated = await Product.update(id, productData);
        if (!updated) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        const product = await Product.getById(id);
        res.json(product);
    } catch (error) {
        console.error('❌ Error en updateProduct:', error.message);
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
};

// ==========================================
// ELIMINAR PRODUCTO
// ==========================================
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Product.delete(id);
        
        if (!deleted) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        console.error('❌ Error en deleteProduct:', error.message);
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
};

// ==========================================
// BUSCAR PRODUCTOS
// ==========================================
const searchProducts = async (req, res) => {
    try {
        const { q, categoria } = req.query;
        const products = await Product.search(q, categoria);
        res.json(products);
    } catch (error) {
        console.error('❌ Error en searchProducts:', error.message);
        res.status(500).json({ error: 'Error al buscar productos' });
    }
};

// ==========================================
// OBTENER PRODUCTOS POR CATEGORÍA
// ==========================================
const getProductsByCategory = async (req, res) => {
    try {
        const { categoriaId } = req.params;
        const products = await Product.getByCategory(categoriaId);
        res.json(products);
    } catch (error) {
        console.error('❌ Error en getProductsByCategory:', error.message);
        res.status(500).json({ error: 'Error al obtener productos por categoría' });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    getProductsByCategory
};