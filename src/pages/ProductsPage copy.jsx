import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/products/ProductCard';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import { getProducts } from '../services/api';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState(null);

  // ==========================================
  // CARGAR PRODUCTOS DESDE EL BACKEND
  // ==========================================
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProducts();
        setProducts(data);
        setFilteredProducts(data);
      } catch (err) {
        console.error('Error cargando productos:', err);
        setError('Error al cargar productos. Asegúrate de que el backend esté corriendo.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // ==========================================
  // OBTENER CATEGORÍAS ÚNICAS
  // ==========================================
  const categories = ['todos', ...new Set(
    products.map(p => p.categoria_nombre || p.category || '').filter(Boolean)
  )];

  // ==========================================
  // OBTENER ÍCONO DE CATEGORÍA
  // ==========================================
  const getCategoryIcon = (category) => {
    const icons = {
      'todos': '📦',
      'tortas': '🎂',
      'marquesas': '🍫',
      'quesillos': '🧀',
      'postres': '🍮'
    };
    return icons[category] || '📦';
  };

  // ==========================================
  // FILTRAR PRODUCTOS
  // ==========================================
  useEffect(() => {
    let filtered = [...products];

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(p => {
        const name = (p.nombre || p.name || '').toLowerCase();
        const desc = (p.descripcion || p.description || '').toLowerCase();
        return name.includes(term) || desc.includes(term);
      });
    }

    // Filtrar por categoría
    const categoryFromUrl = searchParams.get('categoria');
    let activeCategory = selectedCategory;
    if (categoryFromUrl && categoryFromUrl !== 'todos') {
      activeCategory = categoryFromUrl;
      setSelectedCategory(categoryFromUrl);
    }

    if (activeCategory !== 'todos') {
      filtered = filtered.filter(p => {
        const cat = p.categoria_nombre || p.category || '';
        return cat === activeCategory;
      });
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, searchParams]);

  // ==========================================
  // MANEJAR CAMBIO DE CATEGORÍA
  // ==========================================
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category === 'todos') {
      setSearchParams({});
    } else {
      setSearchParams({ categoria: category });
    }
    setShowFilters(false);
  };

  // ==========================================
  // LIMPIAR FILTROS
  // ==========================================
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('todos');
    setSearchParams({});
    setShowFilters(false);
  };

  // ==========================================
  // RENDER - LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="products-page">
        <div className="products-header">
          <h1>🛍️ Nuestros Productos</h1>
          <p>Cargando productos...</p>
        </div>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <p>Cargando productos...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER - ERROR
  // ==========================================
  if (error) {
    return (
      <div className="products-page">
        <div className="products-header">
          <h1>🛍️ Nuestros Productos</h1>
          <p>Error al cargar productos</p>
        </div>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <h2>❌ Error</h2>
          <p>{error}</p>
          <p style={{ fontSize: '0.9rem', color: 'gray' }}>
            💡 Asegúrate de que el backend esté corriendo en http://localhost:5000
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
  // RENDER - PÁGINA COMPLETA
  // ==========================================
  return (
    <div className="products-page">
      {/* Header */}
      <div className="products-header">
        <h1>🛍️ Nuestros Productos</h1>
        <p>Descubre nuestra selección de delicias artesanales</p>
      </div>

      {/* Toolbar */}
      <div className="products-toolbar">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>
              <FaTimes />
            </button>
          )}
        </div>
        <button className="filter-toggle" onClick={() => setShowFilters(!showFilters)}>
          <FaFilter /> Filtros
        </button>
      </div>

      {/* Content */}
      <div className="products-content">
        {/* Filters Panel */}
        <aside className={`filters-panel ${showFilters ? 'active' : ''}`}>
          <div className="filters-header">
            <h3>Filtrar por</h3>
            <button className="close-filters" onClick={() => setShowFilters(false)}>
              <FaTimes />
            </button>
          </div>

          <div className="filter-group">
            <h4>Categorías</h4>
            <ul className="category-list">
              {categories.map(category => (
                <li key={category}>
                  <button
                    className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(category)}
                  >
                    <span className="category-icon">{getCategoryIcon(category)}</span>
                    <span className="category-name">
                      {category === 'todos' ? 'Todos los productos' : 
                       category.charAt(0).toUpperCase() + category.slice(1)}
                    </span>
                    <span className="category-count">
                      {category === 'todos' 
                        ? products.length 
                        : products.filter(p => (p.categoria_nombre || p.category || '') === category).length}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <button className="clear-filters-btn" onClick={clearFilters}>
            Limpiar filtros
          </button>
        </aside>

        {/* Products Grid */}
        <div className="products-grid-container">
          <div className="products-count">
            Mostrando {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}
          </div>

          {filteredProducts.length > 0 ? (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="no-products">
              <span className="no-products-icon">🔍</span>
              <h3>No encontramos productos</h3>
              <p>Prueba con otros términos o filtros</p>
              <button className="btn-primary" onClick={clearFilters}>
                Ver todos los productos
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;