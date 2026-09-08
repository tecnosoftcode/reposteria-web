import { useState, useEffect } from 'react';
import { FaBell, FaTimes, FaShoppingCart, FaUser, FaClock } from 'react-icons/fa';
import { onNewOrder, offNewOrder, connectSocket } from '../../services/socket';
import toast from 'react-hot-toast';

const OrderNotification = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // Conectar al socket
        connectSocket();

        // Escuchar nuevos pedidos
        onNewOrder((orderData) => {
            const newNotification = {
                id: Date.now(),
                ...orderData,
                read: false,
                timestamp: new Date()
            };

            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);

            // 🔔 Mostrar toast de notificación
            toast.custom((t) => (
                <div 
                    className={`notification-toast ${t.visible ? 'show' : ''}`}
                    onClick={() => {
                        toast.dismiss(t.id);
                        setIsOpen(true);
                    }}
                >
                    <div className="notification-toast-icon">🛒</div>
                    <div className="notification-toast-content">
                        <strong>¡Nuevo pedido!</strong>
                        <p>{orderData.cliente.nombre} {orderData.cliente.apellido} - ${orderData.total.toFixed(2)}</p>
                        <small>{orderData.items} productos</small>
                    </div>
                    <button onClick={() => toast.dismiss(t.id)} className="notification-toast-close">
                        <FaTimes />
                    </button>
                </div>
            ), {
                duration: 8000,
                position: 'top-right'
            });
        });

        return () => {
            offNewOrder();
        };
    }, []);

    const markAllAsRead = () => {
        setNotifications(prev => 
            prev.map(n => ({ ...n, read: true }))
        );
        setUnreadCount(0);
    };

    const markAsRead = (id) => {
        setNotifications(prev => 
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const clearAll = () => {
        setNotifications([]);
        setUnreadCount(0);
    };

    return (
        <>
            {/* Botón de notificaciones */}
            <button 
                className="notification-bell"
                onClick={() => setIsOpen(!isOpen)}
            >
                <FaBell />
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                )}
            </button>

            {/* Panel de notificaciones */}
            {isOpen && (
                <div className="notification-panel">
                    <div className="notification-panel-header">
                        <h3>📢 Notificaciones</h3>
                        <div className="notification-panel-actions">
                            {unreadCount > 0 && (
                                <button onClick={markAllAsRead} className="mark-all-btn">
                                    Marcar todas como leídas
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button onClick={clearAll} className="clear-all-btn">
                                    <FaTimes /> Limpiar
                                </button>
                            )}
                            <button onClick={() => setIsOpen(false)} className="close-panel-btn">
                                <FaTimes />
                            </button>
                        </div>
                    </div>

                    {notifications.length === 0 ? (
                        <div className="notification-empty">
                            <span>🔔</span>
                            <p>No hay notificaciones</p>
                        </div>
                    ) : (
                        <div className="notification-list">
                            {notifications.map(notification => (
                                <div 
                                    key={notification.id}
                                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className="notification-icon">
                                        <FaShoppingCart />
                                    </div>
                                    <div className="notification-content">
                                        <div className="notification-title">
                                            <strong>Nuevo pedido #{notification.pedidoId}</strong>
                                            {!notification.read && <span className="unread-dot">●</span>}
                                        </div>
                                        <p>
                                            {notification.cliente.nombre} {notification.cliente.apellido}
                                        </p>
                                        <p className="notification-details">
                                            <span className="notification-items">
                                                {notification.items} productos
                                            </span>
                                            <span className="notification-total">
                                                ${notification.total.toFixed(2)}
                                            </span>
                                        </p>
                                        <small className="notification-time">
                                            <FaClock /> {new Date(notification.timestamp).toLocaleTimeString()}
                                        </small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default OrderNotification;