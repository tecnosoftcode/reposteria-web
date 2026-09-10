import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTruck, FaCreditCard, FaShieldAlt, FaWhatsapp } from 'react-icons/fa';
import ProductCarousel from '../components/products/ProductCarousel';
import { getProducts, getCategories } from '../services/api';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar productos y categorías desde el backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories()
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
        setError(null);
      } catch (err) {
        console.error('Error cargando datos:', err);
        setError('No se pudieron cargar los productos');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Función para obtener ícono de categoría
  const getCategoryIcon = (category) => {
    return category.icono || '🍰';
  };

  // ==========================================
  // MOSTRAR LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="home-page">
        <section className="hero-section">
          <div className="hero-bg-wrapper">
            <img 
              src="/images/torta.jpg" 
              alt="Torta de fondo" 
              className="hero-bg-img"
            />
          </div>
          <div className="hero-content">
            <div className="hero-logo-container">
              <img 
                src="/images/logo-scarletv2.png"
                alt="Scarlet Sweet Shop - Pastelería Fina" 
                className="hero-logo-image"
              />
            </div>
            <p>Sabores que endulzan tu vida, hechos con amor y los mejores ingredientes</p>
            <div className="hero-buttons">
              <Link to="/productos" className="btn-primary">Ver Productos</Link>
              <a href="https://wa.me/573001234567" target="_blank" rel="noopener noreferrer" className="btn-secondary">
                <FaWhatsapp /> Contáctanos
              </a>
            </div>
          </div>
          <div className="hero-decoration">
            <div className="floating-cake">🎂</div>
            <div className="floating-cake">🧁</div>
            <div className="floating-cake">🍰</div>
            <div className="floating-cake">🍩</div>
          </div>
        </section>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <p>Cargando productos...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // MOSTRAR ERROR
  // ==========================================
  if (error) {
    return (
      <div className="home-page">
        <section className="hero-section">
          <div className="hero-bg-wrapper">
            <img 
              src="/images/torta.jpg" 
              alt="Torta de fondo" 
              className="hero-bg-img"
            />
          </div>
          <div className="hero-content">
            <div className="hero-logo-container">
              <img 
                src="/images/logo-scarletv2.png" 
                alt="Scarlet Sweet Shop - Pastelería Fina" 
                className="hero-logo-image"
              />
            </div>
            <p>Sabores que endulzan tu vida, hechos con amor y los mejores ingredientes</p>
            <div className="hero-buttons">
              <Link to="/productos" className="btn-primary">Ver Productos</Link>
              <a href="https://wa.me/573001234567" target="_blank" rel="noopener noreferrer" className="btn-secondary">
                <FaWhatsapp /> Contáctanos
              </a>
            </div>
          </div>
          <div className="hero-decoration">
            <div className="floating-cake">🎂</div>
            <div className="floating-cake">🧁</div>
            <div className="floating-cake">🍰</div>
            <div className="floating-cake">🍩</div>
          </div>
        </section>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <h2>❌ Error</h2>
          <p>{error}</p>
          <p style={{ fontSize: '0.9rem', color: 'gray' }}>
            💡 Asegúrate de que el backend esté corriendo
          </p>
          <button 
            className="btn-primary" 
            onClick={() => window.location.reload()}
            style={{ marginTop: '1rem' }}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // MOSTRAR PÁGINA COMPLETA
  // ==========================================
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-wrapper">
          <img 
            src="/images/torta.jpg" 
            alt="Torta de fondo" 
            className="hero-bg-img"
          />
        </div>
        
        <div className="hero-content">
          <div className="hero-logo-container">
            <img 
              src="/images/logo-scarletv2.png" 
              alt="Scarlet Sweet Shop - Pastelería Fina" 
              className="hero-logo-image"
            />
          </div>
          <p>Sabores que endulzan tu vida, hechos con amor y los mejores ingredientes</p>
          <div className="hero-buttons">
            <Link to="/productos" className="btn-primary">
              Ver Productos
            </Link>
            <a 
              href="https://wa.me/573001234567" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              <FaWhatsapp /> Contáctanos
            </a>
          </div>
        </div>
        <div className="hero-decoration">
          <div className="floating-cake">🎂</div>
          <div className="floating-cake">🧁</div>
          <div className="floating-cake">🍰</div>
          <div className="floating-cake">🍩</div>
        </div>
      </section>

      {/* Categorías en Carrusel */}
      <section className="carousel-container">
        <div className="carousel-header" style={{ justifyContent: 'center' }}>
          <h2 className="carousel-title-main">Nuestras Delicias</h2>
        </div>
        
        {categories.length > 0 ? (
          categories.map(category => (
            <ProductCarousel 
              key={category.id}
              products={products}
              category={category} 
              icon={category.icono || '🍰'}
            />
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>No hay categorías disponibles. Agrega categorías desde el panel de administración.</p>
            <Link to="/admin/dashboard" className="btn-primary" style={{ marginTop: '1rem' }}>
              Ir al panel admin
            </Link>
          </div>
        )}

        {/* DEBUG: Mostrar cuántos productos hay */}
        <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'gray', marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
          <strong>📊 Depuración:</strong> Total productos: {products.length} | Categorías: {categories.map(c => c.nombre).join(', ')}
        </div>
      </section>

      {/* Beneficios */}
      <section className="benefits-section">
        <h2 className="section-title">¿Por qué elegirnos?</h2>
        <p className="section-subtitle">Calidad y sabor en cada bocado</p>
        <div className="benefits-grid">
          <div className="benefit-item">
            <FaTruck className="benefit-icon" />
            <h3>Envíos a Domicilio</h3>
            <p>Entregamos en toda la ciudad</p>
          </div>
          <div className="benefit-item">
            <FaCreditCard className="benefit-icon" />
            <h3>Pago Seguro</h3>
            <p>Aceptamos todos los medios de pago</p>
          </div>
          <div className="benefit-item">
            <FaShieldAlt className="benefit-icon" />
            <h3>Calidad Garantizada</h3>
            <p>Ingredientes frescos y naturales</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;