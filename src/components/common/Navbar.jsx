import { Link, useLocation } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaBars, FaTimes, FaChevronDown } from 'react-icons/fa';
import { useState, useContext, useEffect } from 'react';
import { CartContext } from '../../context/CartContext';
import { getCategories, getProducts } from '../../services/api';
import CartModal from '../cart/CartModal';

const Navbar = () => {
  const { cartCount } = useContext(CartContext);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // 🔥 Cargar categorías Y productos dinámicamente
  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, productsData] = await Promise.all([
          getCategories(),
          getProducts()
        ]);
        setCategories(categoriesData);
        setProducts(productsData);
      } catch (err) {
        console.error('Error cargando datos del navbar:', err);
      }
    };
    loadData();
  }, []);

  // 🔥 FILTRAR SOLO CATEGORÍAS CON PRODUCTOS
  const categoriesWithProducts = categories.filter(cat =>
    products.some(p => Number(p.categoria_id) === Number(cat.id))
  );

  // 🔥 Cerrar menú al cambiar de ruta
  useEffect(() => {
    setIsMenuOpen(false);
    setIsCategoriesOpen(false);
  }, [location.pathname]);

  // 🔥 Detectar scroll para achicar el navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 🔥 Detectar si un enlace está activo
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          {/* Logo */}
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
            <li>
              <Link 
                to="/" 
                className={location.pathname === '/' ? 'active' : ''}
              >
                Inicio
              </Link>
            </li>
            <li>
              <Link 
                to="/productos" 
                className={isActive('/productos') ? 'active' : ''}
              >
                Productos
              </Link>
            </li>

            {/* 🔥 SOLO MOSTRAR CATEGORÍAS CON PRODUCTOS */}
            {categoriesWithProducts.length > 0 && (
              <li className="nav-categories">
                <span 
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                  className={isCategoriesOpen ? 'active' : ''}
                >
                  Categorías 
                  <FaChevronDown className={`chevron ${isCategoriesOpen ? 'open' : ''}`} />
                </span>
                <ul className={`dropdown ${isCategoriesOpen ? 'open' : ''}`}>
                  {categoriesWithProducts.map(cat => (
                    <li key={cat.id}>
                      <Link 
                        to={`/productos?categoria=${cat.id}`}
                        onClick={() => setIsCategoriesOpen(false)}
                      >
                        {cat.icono || '🍰'} {cat.nombre}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            )}
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