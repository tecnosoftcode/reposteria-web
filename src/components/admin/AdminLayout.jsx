import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUserCircle, FaSignOutAlt, FaHome, FaBox, FaList, FaChartBar, FaUsers, FaTags, FaCog } from 'react-icons/fa';
import OrderNotification from './OrderNotification';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    // Función para saber si un enlace está activo
    const isActive = (path) => {
        return location.pathname === `/admin/${path}` || 
               (path === 'dashboard' && location.pathname === '/admin/dashboard');
    };

    return (
        <div className="admin-layout">
            <nav className="admin-nav">
                <div className="admin-nav-brand">
                    <span>🍰</span>
                    <span>Panel Admin</span>
                </div>

                <div className="admin-nav-links">
                    <Link 
                        to="/admin/dashboard" 
                        className={`admin-nav-link ${isActive('dashboard') ? 'active' : ''}`}
                    >
                        <FaChartBar /> Dashboard
                    </Link>
                    <Link 
                        to="/admin/products" 
                        className={`admin-nav-link ${isActive('products') ? 'active' : ''}`}
                    >
                        <FaList /> Productos
                    </Link>
                    <Link 
                        to="/admin/orders" 
                        className={`admin-nav-link ${isActive('orders') ? 'active' : ''}`}
                    >
                        <FaBox /> Pedidos
                    </Link>
                    <Link 
                        to="/admin/users" 
                        className={`admin-nav-link ${isActive('users') ? 'active' : ''}`}
                    >
                        <FaUsers /> Usuarios
                    </Link>
                    <Link 
                        to="/admin/categories" 
                        className={`admin-nav-link ${isActive('categories') ? 'active' : ''}`}
                    >
                        <FaTags /> Categorías
                    </Link>
                    <Link 
                        to="/admin/settings" 
                        className={`admin-nav-link ${isActive('settings') ? 'active' : ''}`}
                    >
                        <FaCog /> Configuración
                    </Link>
                </div>

                <div className="admin-nav-actions">
                    <OrderNotification />
                    
                    <div className="admin-nav-user">
                        <div className="user-info">
                            <span className="user-avatar">👤</span>
                            <span>{user?.name || 'Administrador'}</span>
                        </div>
                        <Link to="/" className="logout-btn">
                            <FaHome /> Ver tienda
                        </Link>
                        <button className="logout-btn" onClick={logout}>
                            <FaSignOutAlt /> Cerrar Sesión
                        </button>
                    </div>
                </div>
            </nav>

            <div className="admin-content">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;