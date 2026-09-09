import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../components/products/ProductCard';
import { FaSearch, FaTimes, FaTh } from 'react-icons/fa';
import { getProducts, getCategories } from '../services/api';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [error, setError] = useState(null);

  // ==========================================
  // CARGAR PRODUCTOS Y CATEGORÍAS
  // ==========================================
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories()
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
        const categoryFromUrl = searchParams.get('categoria') || 'todos';
        setSelectedCategory(categoryFromUrl);
        applyFilters(productsData, '', categoryFromUrl);
      } catch (err) {
        console.error('Error cargando datos:', err);
        setError('Error al cargar productos.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ==========================================
  // FUNCIÓN PARA APLICAR FILTROS
  // ==========================================
  const applyFilters = (productList, term, category) => {
    let filtered = [...productList];

    if (term && term.trim()) {
      const search = term.toLowerCase().trim();
      filtered = filtered.filter(p => {
        const name = (p.nombre || p.name || '').toLowerCase();
        const desc = (p.descripcion || p.description || '').toLowerCase();
        return name.includes(search) || desc.includes(search);
      });
    }

    if (category && category !== 'todos') {
      filtered = filtered.filter(p => {
        const cat = p.categoria_id;
        return cat === category;
      });
    }

    setFilteredProducts(filtered);
  };

  // ==========================================
  // MANEJAR CAMBIO DE CATEGORÍA
  // ==========================================
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category === 'todos') {
      setSearchParams({}, { replace: true });
    } else {
      setSearchParams({ categoria: category }, { replace: true });
    }
    applyFilters(products, searchTerm, category);
  };

  // ==========================================
  // MANEJAR BÚSQUEDA
  // ==========================================
  const handleSearch = (term) => {
    setSearchTerm(term);
    applyFilters(products, term, selectedCategory);
  };

  // ==========================================
  // LIMPIAR FILTROS
  // ==========================================
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('todos');
    setSearchParams({}, { replace: true });
    applyFilters(products, '', 'todos');
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
  // RENDER - PÁGINA COMPLETA
  // ==========================================
  return (
    <div className="products-page">
      {/* Header con logo */}
      <div className="products-header">
        <div className="products-header-content">
          <Link to="/" className="products-logo-link">
            <img 
              src="/images/logo-scarlet.png" 
              alt="Scarlet Sweet Shop - Pastelería Fina" 
              className="products-logo-image"
            />
          </Link>
          <div className="products-header-text">
            <h1>🛍️ Nuestros Productos</h1>
            <p>Descubre nuestra selección de delicias artesanales</p>
          </div>
        </div>
      </div>

      {/* Filtros en línea */}
      <div className="products-filters-inline">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => handleSearch('')}>
              <FaTimes />
            </button>
          )}
        </div>

        <div className="category-filters">
          {['todos', ...categories.map(cat => cat.id)].map(categoryId => {
            const cat = categories.find(c => c.id === categoryId);
            const label = categoryId === 'todos' ? 'Todos' : (cat ? cat.nombre : '');
            const icon = categoryId === 'todos' ? '📦' : (cat ? cat.icono || '🍰' : '');
            
            return (
              <button
                key={categoryId}
                className={`category-filter-btn ${selectedCategory === categoryId ? 'active' : ''}`}
                onClick={() => handleCategoryChange(categoryId)}
              >
                <span className="cat-icon">{icon}</span>
                <span className="cat-name">{label}</span>
                <span className="cat-count">
                  {categoryId === 'todos' 
                    ? products.length 
                    : products.filter(p => p.categoria_id === categoryId).length}
                </span>
              </button>
            );
          })}
        </div>

        {/* 🔥 Solo el botón de cuadrícula, sin lista */}
        <div className="view-actions">
          <span className="view-label">Vista:</span>
          <button 
            className={`view-toggle active`}
            aria-label="Vista en cuadrícula"
            disabled
          >
            <FaTh />
          </button>
        </div>
      </div>

      {/* Contador y productos */}
      <div className="products-grid-container">
        <div className="products-count">
          Mostrando {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}
          {selectedCategory !== 'todos' && (
            <button className="clear-filter-btn" onClick={clearFilters}>
              × Limpiar filtro
            </button>
          )}
        </div>

        {filteredProducts.length > 0 ? (
          <div className="products-grid">
            {filteredProducts.map((product) => (
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
  );
};

export default ProductsPage;