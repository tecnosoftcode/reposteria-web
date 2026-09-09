import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaBars, FaTimes, FaHome, FaBox, FaList, FaChartBar, FaUsers, FaTags, FaCog, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import OrderNotification from './OrderNotification';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    // Cerrar menús al cambiar de ruta
    useEffect(() => {
        setMenuOpen(false);
        setUserMenuOpen(false);
    }, [location.pathname]);

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
                    <button 
                        className="menu-toggle-admin" 
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        {menuOpen ? <FaTimes /> : <FaBars />}
                    </button>
                </div>

                {menuOpen && (
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
                )}

                <div className="admin-nav-actions">
                    <OrderNotification />
                    
                    <div className="admin-nav-user">
                        <button 
                            className="user-menu-trigger" 
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                        >
                            <FaUserCircle className="user-avatar-icon" />
                        </button>
                        
                        {userMenuOpen && (
                            <div className="user-dropdown-menu">
                                <div className="user-dropdown-header">
                                    <span className="user-avatar">👤</span>
                                    <span className="user-dropdown-name">{user?.name || 'Administrador'}</span>
                                </div>
                                <Link to="/" className="logout-btn">
                                    <FaHome /> Ver tienda
                                </Link>
                                <button className="logout-btn" onClick={logout}>
                                    <FaSignOutAlt /> Cerrar Sesión
                                </button>
                            </div>
                        )}
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