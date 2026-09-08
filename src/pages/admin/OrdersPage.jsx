import { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus } from '../../services/api';
import { FaEye, FaCheck, FaClock, FaTruck, FaBox, FaTimes, FaSearch } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { onNewOrder, offNewOrder } from '../../services/socket';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [updating, setUpdating] = useState(false);

    // 🔥 ESTADOS CON SUS RESPECTIVOS ICONOS Y COLORES
    const estados = {
        pendiente: { 
            label: 'Pendiente', 
            color: '#F57C00', 
            bg: '#FFF3E0',
            icon: <FaClock /> 
        },
        confirmado: { 
            label: 'Confirmado', 
            color: '#1976D2', 
            bg: '#E3F2FD',
            icon: <FaCheck /> 
        },
        preparando: { 
            label: 'Preparando', 
            color: '#6A1B9A', 
            bg: '#F3E5F5',
            icon: <FaBox /> 
        },
        enviado: { 
            label: 'Enviado', 
            color: '#388E3C', 
            bg: '#E8F5E9',
            icon: <FaTruck /> 
        },
        entregado: { 
            label: 'Entregado', 
            color: '#2E7D32', 
            bg: '#E8F5E9',
            icon: <FaCheck /> 
        },
        cancelado: { 
            label: 'Cancelado', 
            color: '#C62828', 
            bg: '#FFEBEE',
            icon: <FaTimes /> 
        }
    };

    // ==========================================
    // CARGAR PEDIDOS
    // ==========================================
    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await getOrders();
            console.log('📦 Pedidos cargados:', data);
            setOrders(data);
        } catch (error) {
            console.error('Error cargando pedidos:', error);
            toast.error('Error al cargar pedidos');
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // ESCUCHAR NUEVOS PEDIDOS
    // ==========================================
    useEffect(() => {
        loadOrders();

        onNewOrder((orderData) => {
            toast.success(`📦 Nuevo pedido #${orderData.pedidoId} recibido`);
            loadOrders();
        });

        return () => {
            offNewOrder();
        };
    }, []);

    // ==========================================
    // ACTUALIZAR ESTADO - 🔥 CORREGIDO
    // ==========================================
    const handleUpdateStatus = async (id, nuevoEstado) => {
        if (updating) return;
        
        try {
            setUpdating(true);
            console.log(`🔄 Actualizando pedido ${id} a: ${nuevoEstado}`);
            
            await updateOrderStatus(id, nuevoEstado);
            
            // 🔥 CERRAR MODAL PRIMERO
            setShowModal(false);
            setSelectedOrder(null);
            
            // 🔥 RECARGAR PEDIDOS DESPUÉS DE CERRAR EL MODAL
            await loadOrders();
            
            toast.success(`✅ Pedido #${id} actualizado a: ${estados[nuevoEstado]?.label}`);
        } catch (error) {
            console.error('Error actualizando estado:', error);
            toast.error('Error al actualizar estado');
        } finally {
            setUpdating(false);
        }
    };

    // ==========================================
    // VER DETALLE
    // ==========================================
    const viewOrderDetails = (order) => {
        setSelectedOrder(order);
        setShowModal(true);
    };

    // ==========================================
    // CERRAR MODAL
    // ==========================================
    const closeModal = () => {
        setShowModal(false);
        setSelectedOrder(null);
    };

    // ==========================================
    // FILTRAR PEDIDOS
    // ==========================================
    const filteredOrders = orders.filter(order => {
        const matchFilter = filter === 'todos' || order.estado === filter;
        const matchSearch = 
            (order.cliente_nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.cliente_apellido || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.id.toString().includes(searchTerm);
        return matchFilter && matchSearch;
    });

    // ==========================================
    // CONTAR POR ESTADO
    // ==========================================
    const counts = {
        todos: orders.length,
        pendiente: orders.filter(o => o.estado === 'pendiente').length,
        confirmado: orders.filter(o => o.estado === 'confirmado').length,
        preparando: orders.filter(o => o.estado === 'preparando').length,
        enviado: orders.filter(o => o.estado === 'enviado').length,
        entregado: orders.filter(o => o.estado === 'entregado').length,
        cancelado: orders.filter(o => o.estado === 'cancelado').length
    };

    // ==========================================
    // RENDER
    // ==========================================
    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                <p>Cargando pedidos...</p>
            </div>
        );
    }

    return (
        <div className="orders-page">
            {/* Header */}
            <div className="orders-header">
                <h1>📋 Gestión de Pedidos</h1>
                <p>Administra los pedidos de tus clientes</p>
            </div>

            {/* Estadísticas */}
            <div className="orders-stats">
                <div className="stat-card" onClick={() => setFilter('todos')} style={{ cursor: 'pointer' }}>
                    <span className="stat-value">{counts.todos}</span>
                    <span className="stat-label">Total Pedidos</span>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #F57C00', cursor: 'pointer' }} onClick={() => setFilter('pendiente')}>
                    <span className="stat-value">{counts.pendiente}</span>
                    <span className="stat-label">⏳ Pendientes</span>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #1976D2', cursor: 'pointer' }} onClick={() => setFilter('confirmado')}>
                    <span className="stat-value">{counts.confirmado}</span>
                    <span className="stat-label">✅ Confirmados</span>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #2E7D32', cursor: 'pointer' }} onClick={() => setFilter('entregado')}>
                    <span className="stat-value">{counts.entregado}</span>
                    <span className="stat-label">📦 Entregados</span>
                </div>
            </div>

            {/* Toolbar */}
            <div className="orders-toolbar">
                <div className="search-container">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar por cliente o número de pedido..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <select 
                    className="filter-select"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="todos">📋 Todos</option>
                    <option value="pendiente">⏳ Pendientes</option>
                    <option value="confirmado">✅ Confirmados</option>
                    <option value="preparando">📦 Preparando</option>
                    <option value="enviado">🚚 Enviado</option>
                    <option value="entregado">🎯 Entregados</option>
                    <option value="cancelado">❌ Cancelados</option>
                </select>
            </div>

            {/* Tabla */}
            <div className="orders-table-container">
                {filteredOrders.length === 0 ? (
                    <div className="orders-empty">
                        <span>📭</span>
                        <p>No hay pedidos</p>
                    </div>
                ) : (
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th># Pedido</th>
                                <th>Cliente</th>
                                <th>Total</th>
                                <th>Pago</th>
                                <th>Estado</th>
                                <th>Fecha</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(order => {
                                const estadoInfo = estados[order.estado] || estados.pendiente;
                                return (
                                    <tr key={order.id}>
                                        <td className="order-id">#{order.id}</td>
                                        <td>
                                            <div className="order-client">
                                                <strong>{order.cliente_nombre} {order.cliente_apellido}</strong>
                                                <small>{order.cliente_telefono}</small>
                                            </div>
                                        </td>
                                        <td className="order-total">${Number(order.total).toFixed(2)}</td>
                                        <td className="order-payment">{order.metodo_pago}</td>
                                        <td>
                                            <span 
                                                className={`order-status ${order.estado}`}
                                                style={{ 
                                                    background: estadoInfo.bg,
                                                    color: estadoInfo.color,
                                                    padding: '0.3rem 0.8rem',
                                                    borderRadius: '20px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '600',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.3rem'
                                                }}
                                            >
                                                {estadoInfo.icon} {estadoInfo.label}
                                            </span>
                                        </td>
                                        <td className="order-date">
                                            {new Date(order.created_at).toLocaleDateString()}
                                            <small>{new Date(order.created_at).toLocaleTimeString()}</small>
                                        </td>
                                        <td>
                                            <button 
                                                className="view-order-btn"
                                                onClick={() => viewOrderDetails(order)}
                                            >
                                                <FaEye /> Ver
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ==========================================
                MODAL - 🔥 CORREGIDO
                ========================================== */}
            {showModal && selectedOrder && (
                <div className="order-modal-overlay" onClick={closeModal}>
                    <div className="order-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="order-modal-header">
                            <h2>📋 Pedido #{selectedOrder.id}</h2>
                            <button className="modal-close" onClick={closeModal}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="order-modal-body">
                            {/* Cliente */}
                            <div className="order-info-section">
                                <h3>👤 Cliente</h3>
                                <div className="order-info-grid">
                                    <div>
                                        <strong>Nombre:</strong> {selectedOrder.cliente_nombre} {selectedOrder.cliente_apellido}
                                    </div>
                                    <div>
                                        <strong>Teléfono:</strong> {selectedOrder.cliente_telefono}
                                    </div>
                                    <div>
                                        <strong>Dirección:</strong> {selectedOrder.cliente_direccion}
                                    </div>
                                    <div>
                                        <strong>Ciudad:</strong> {selectedOrder.cliente_ciudad}
                                    </div>
                                    <div>
                                        <strong>Método de pago:</strong> {selectedOrder.metodo_pago}
                                    </div>
                                    <div>
                                        <strong>Estado actual:</strong> 
                                        <span 
                                            className={`order-status ${selectedOrder.estado}`}
                                            style={{ 
                                                background: (estados[selectedOrder.estado]?.bg || '#FFF3E0'),
                                                color: estados[selectedOrder.estado]?.color || '#F57C00',
                                                padding: '0.3rem 0.8rem',
                                                borderRadius: '20px',
                                                fontSize: '0.8rem',
                                                fontWeight: '600',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.3rem',
                                                marginLeft: '0.5rem'
                                            }}
                                        >
                                            {estados[selectedOrder.estado]?.icon} {estados[selectedOrder.estado]?.label}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Productos */}
                            <div className="order-info-section">
                                <h3>🛒 Productos</h3>
                                <div className="order-products">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Producto</th>
                                                <th>Cantidad</th>
                                                <th>Precio unit.</th>
                                                <th>Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedOrder.detalles && selectedOrder.detalles.length > 0 ? (
                                                selectedOrder.detalles.map((detalle, index) => (
                                                    <tr key={index}>
                                                        <td>{detalle.producto_nombre || 'Producto'}</td>
                                                        <td>{detalle.cantidad}</td>
                                                        <td>${Number(detalle.precio_unitario).toFixed(2)}</td>
                                                        <td>${Number(detalle.subtotal).toFixed(2)}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" style={{ textAlign: 'center', color: 'gray' }}>
                                                        No hay detalles disponibles
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                    <div className="order-total-section">
                                        <span>Total: <strong>${Number(selectedOrder.total).toFixed(2)}</strong></span>
                                    </div>
                                </div>
                            </div>

                            {/* Cambiar estado */}
                            <div className="order-info-section">
                                <h3>📊 Cambiar Estado</h3>
                                <div className="order-status-buttons">
                                    {Object.keys(estados).map(key => {
                                        const estado = estados[key];
                                        const isActive = selectedOrder.estado === key;
                                        return (
                                            <button
                                                key={key}
                                                className={`status-btn ${isActive ? 'active' : ''}`}
                                                style={{ 
                                                    background: isActive ? estado.color : 'transparent',
                                                    color: isActive ? 'white' : estado.color,
                                                    borderColor: estado.color,
                                                    border: `2px solid ${estado.color}`,
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '20px',
                                                    cursor: updating ? 'not-allowed' : 'pointer',
                                                    transition: 'all 0.3s ease',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.3rem',
                                                    fontSize: '0.85rem',
                                                    opacity: updating ? 0.6 : 1
                                                }}
                                                onClick={() => handleUpdateStatus(selectedOrder.id, key)}
                                                disabled={updating || isActive}
                                            >
                                                {estado.icon} {estado.label}
                                                {isActive && ' ✅'}
                                            </button>
                                        );
                                    })}
                                </div>
                                {updating && (
                                    <p style={{ marginTop: '0.5rem', color: 'gray', fontSize: '0.9rem' }}>
                                        ⏳ Actualizando estado...
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersPage;