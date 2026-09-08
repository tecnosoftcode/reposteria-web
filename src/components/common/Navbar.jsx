import { Link } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaBars, FaTimes } from 'react-icons/fa';
import { useState, useContext } from 'react';
import { CartContext } from '../../context/CartContext';
import CartModal from '../cart/CartModal';

const Navbar = () => {
  const { cartCount } = useContext(CartContext);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          {/* Logo - FORZADO */}
          <Link to="/" className="navbar-logo">
            <span className="logo-icon">🦢</span>
            <span className="logo-text">
              <span className="logo-swan">S</span>carlet
              <span className="logo-sub">SWEET SHOP</span>
            </span>
          </Link>

          {/* Menú Hamburguesa */}
          <button 
            className="menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>

          {/* Menú de navegación */}
          <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <li><Link to="/" onClick={() => setIsMenuOpen(false)}>Inicio</Link></li>
            <li><Link to="/productos" onClick={() => setIsMenuOpen(false)}>Productos</Link></li>
            <li className="nav-categories">
              <span>Categorías ▾</span>
              <ul className="dropdown">
                <li><Link to="/productos?categoria=tortas" onClick={() => setIsMenuOpen(false)}>🎂 Tortas</Link></li>
                <li><Link to="/productos?categoria=marquesas" onClick={() => setIsMenuOpen(false)}>🍫 Marquesas</Link></li>
                <li><Link to="/productos?categoria=quesillos" onClick={() => setIsMenuOpen(false)}>🍮 Quesillos</Link></li>
                <li><Link to="/productos?categoria=postres" onClick={() => setIsMenuOpen(false)}>🧁 Postres</Link></li>
              </ul>
            </li>
          </ul>

          {/* Acciones derecha */}
          <div className="nav-actions">
            <button 
              className="cart-button"
              onClick={() => setIsCartOpen(true)}
            >
              <FaShoppingCart />
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
              )}
            </button>
            <Link to="/admin/login" className="user-button">
              <FaUser />
            </Link>
          </div>
        </div>
      </nav>

      {/* Modal del carrito */}
      {isCartOpen && (
        <CartModal 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
        />
      )}
    </>
  );
};

export default Navbar;