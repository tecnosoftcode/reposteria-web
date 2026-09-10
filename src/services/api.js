import axios from 'axios';

const API_URL = 'https://reposteria-backend-motu.onrender.com/api';

// 🔥 Credenciales de ImageKit
const IMAGEKIT_PUBLIC_KEY = 'public_2XtjuJWt/m3Pcrj/4nFJ/jvaQnQ=';
const IMAGEKIT_URL_ENDPOINT = 'https://ik.imagekit.io/scarletsweetshop';
const IMAGEKIT_AUTH_ENDPOINT = `${API_URL}/imagekit/auth`;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// ==========================================
// 🔥 SUBIR IMAGEN A IMAGEKIT (DIRECTO DESDE FRONTEND)
// ==========================================
export const uploadToImageKit = async (file) => {
    try {
        console.log('📸 Subiendo a ImageKit:', file.name, (file.size / 1024).toFixed(2), 'KB');

        // 1. Obtener token de autenticación del backend
        const authResponse = await api.get('/imagekit/auth');
        const { token, expire, signature } = authResponse.data;

        // 2. Crear FormData para ImageKit
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileName', `producto-${Date.now()}-${Math.round(Math.random() * 1E9)}.jpg`);
        formData.append('publicKey', IMAGEKIT_PUBLIC_KEY);
        formData.append('signature', signature);
        formData.append('expire', expire);
        formData.append('token', token);
        formData.append('folder', '/reposteria-productos');
        formData.append('useUniqueFileName', 'true');

        // 3. Subir directo a ImageKit
        const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al subir a ImageKit');
        }

        console.log('✅ Imagen subida a ImageKit:', data.url);
        return data.url;
    } catch (error) {
        console.error('❌ Error subiendo a ImageKit:', error);
        throw error;
    }
};

// ==========================================
// PRODUCTOS
// ==========================================

export const getProducts = async () => {
    try {
        const response = await api.get('/products');
        return response.data;
    } catch (error) {
        console.error('Error al obtener productos:', error);
        throw error;
    }
};

export const getProductById = async (id) => {
    try {
        const response = await api.get(`/products/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener producto:', error);
        throw error;
    }
};

// 🔥 createProduct ahora recibe un objeto normal (no FormData)
export const createProduct = async (productData) => {
    try {
        const response = await api.post('/products', productData);
        return response.data;
    } catch (error) {
        console.error('Error al crear producto:', error);
        throw error;
    }
};

// 🔥 updateProduct ahora recibe un objeto normal (no FormData)
export const updateProduct = async (id, productData) => {
    try {
        const response = await api.put(`/products/${id}`, productData);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        throw error;
    }
};

export const deleteProduct = async (id) => {
    try {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        throw error;
    }
};

export const searchProducts = async (query, categoria = null) => {
    try {
        let url = `/products/search?q=${query}`;
        if (categoria) {
            url += `&categoria=${categoria}`;
        }
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Error al buscar productos:', error);
        throw error;
    }
};

// ==========================================
// PEDIDOS
// ==========================================

export const createOrder = async (orderData) => {
    try {
        const response = await api.post('/orders', orderData);
        return response.data;
    } catch (error) {
        console.error('Error al crear pedido:', error);
        throw error;
    }
};

export const getOrders = async () => {
    try {
        const response = await api.get('/orders');
        return response.data;
    } catch (error) {
        console.error('Error al obtener pedidos:', error);
        throw error;
    }
};

export const getOrderById = async (id) => {
    try {
        const response = await api.get(`/orders/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener pedido:', error);
        throw error;
    }
};

export const updateOrderStatus = async (id, estado) => {
    try {
        const response = await api.put(`/orders/${id}/status`, { estado });
        return response.data;
    } catch (error) {
        console.error('Error al actualizar estado:', error);
        throw error;
    }
};

// ==========================================
// USUARIOS
// ==========================================

export const getUsers = async () => {
    try {
        const response = await api.get('/users');
        return response.data;
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        throw error;
    }
};

export const createUser = async (userData) => {
    try {
        const response = await api.post('/users', userData);
        return response.data;
    } catch (error) {
        console.error('Error al crear usuario:', error);
        throw error;
    }
};

export const updateUser = async (id, userData) => {
    try {
        const response = await api.put(`/users/${id}`, userData);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        throw error;
    }
};

export const updateUserPassword = async (id, password) => {
    try {
        const response = await api.put(`/users/${id}/password`, { password });
        return response.data;
    } catch (error) {
        console.error('Error al actualizar contraseña:', error);
        throw error;
    }
};

export const deleteUser = async (id) => {
    try {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        throw error;
    }
};

// ==========================================
// CATEGORÍAS
// ==========================================

export const getCategories = async () => {
    try {
        const response = await api.get('/categories');
        return response.data;
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        throw error;
    }
};

export const createCategory = async (categoryData) => {
    try {
        const response = await api.post('/categories', categoryData);
        return response.data;
    } catch (error) {
        console.error('Error al crear categoría:', error);
        throw error;
    }
};

export const updateCategory = async (id, categoryData) => {
    try {
        const response = await api.put(`/categories/${id}`, categoryData);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar categoría:', error);
        throw error;
    }
};

export const deleteCategory = async (id) => {
    try {
        const response = await api.delete(`/categories/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al eliminar categoría:', error);
        throw error;
    }
};

// ==========================================
// CONFIGURACIÓN
// ==========================================

export const getSettings = async () => {
    try {
        const response = await api.get('/settings');
        return response.data;
    } catch (error) {
        console.error('Error al obtener configuración:', error);
        throw error;
    }
};

export const updateSettings = async (settingsData) => {
    try {
        const response = await api.put('/settings', settingsData);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar configuración:', error);
        throw error;
    }
};

// ==========================================
// RESEÑAS
// ==========================================

export const getProductReviews = async (productId) => {
    try {
        const response = await api.get(`/reviews/product/${productId}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener reseñas:', error);
        throw error;
    }
};

export const getProductRating = async (productId) => {
    try {
        const response = await api.get(`/reviews/product/${productId}/rating`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener rating:', error);
        throw error;
    }
};

export const createReview = async (productId, reviewData) => {
    try {
        const response = await api.post(`/reviews/product/${productId}`, reviewData);
        return response.data;
    } catch (error) {
        console.error('Error al crear reseña:', error);
        throw error;
    }
};

export const getAllReviews = async () => {
    try {
        const response = await api.get('/reviews');
        return response.data;
    } catch (error) {
        console.error('Error al obtener todas las reseñas:', error);
        throw error;
    }
};

export const deleteReview = async (id) => {
    try {
        const response = await api.delete(`/reviews/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al eliminar reseña:', error);
        throw error;
    }
};

export default api;