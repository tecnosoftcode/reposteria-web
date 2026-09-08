import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { FaShoppingCart, FaWhatsapp, FaStar, FaStarHalf, FaTruck, FaClock, FaHeart, FaRegHeart } from 'react-icons/fa';
import { getProductById } from '../services/api';
import toast from 'react-hot-toast';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedFlavor, setSelectedFlavor] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [customTheme, setCustomTheme] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Cargar producto desde el backend
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProductById(id);
        
        if (data) {
          setProduct(data);
          if (data.sizes && data.sizes.length > 0) {
            setSelectedSize(data.sizes[0]);
          }
          if (data.flavors && data.flavors.length > 0) {
            setSelectedFlavor(data.flavors[0]);
          }
          if (data.themes && data.themes.length > 0) {
            setSelectedTheme(data.themes[0]);
          }
        } else {
          setError('Producto no encontrado');
        }
      } catch (err) {
        console.error('Error cargando producto:', err);
        setError('Error al cargar el producto');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id]);

  // Preparar imágenes para la galería
  const getGalleryImages = () => {
    if (!product) return [];
    
    const images = [];
    
    // Imagen principal
    if (product.imagen || product.image) {
      images.push(product.imagen || product.image);
    }
    
    // Imágenes adicionales (simuladas para demo)
    const additionalImages = [
      'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1578985545062-69928b1d9589?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&h=600&fit=crop'
    ];
    
    // Si hay imágenes adicionales, agregarlas
    if (product.imagenes_adicionales) {
      product.imagenes_adicionales.forEach(img => {
        images.push(img);
      });
    }
    
    return images;
  };

  // Manejar agregar al carrito
  const handleAddToCart = () => {
    if (!product) return;

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error('Por favor selecciona un tamaño');
      return;
    }
    if (product.flavors && product.flavors.length > 0 && !selectedFlavor) {
      toast.error('Por favor selecciona un sabor');
      return;
    }
    if (product.themes && product.themes.length > 0 && !selectedTheme) {
      toast.error('Por favor selecciona un tema');
      return;
    }

    const cartItem = {
      id: product.id,
      name: product.nombre || product.name,
      price: parseFloat(product.precio || product.price) || 0,
      image: product.imagen || product.image,
      description: product.descripcion || product.description,
      quantity,
      selectedSize,
      selectedFlavor,
      selectedTheme: selectedTheme === 'Personalizado' ? customTheme : selectedTheme,
    };

    addToCart(cartItem, quantity);
    setIsAddingToCart(true);
    setTimeout(() => setIsAddingToCart(false), 2000);
  };

  // Renderizar estrellas
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`star-${i}`} />);
    }
    if (hasHalfStar) {
      stars.push(<FaStarHalf key="half-star" />);
    }
    return stars;
  };

  // Estado de carga
  if (loading) {
    return (
      <div className="product-detail-loading">
        <div className="loading-spinner">🍰</div>
        <p>Cargando producto...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-not-found">
        <h2>❌ Producto no encontrado</h2>
        <p>Lo sentimos, el producto que buscas no está disponible.</p>
        <Link to="/productos" className="btn-primary">Ver productos</Link>
      </div>
    );
  }

  const enStock = product.en_stock !== false && product.inStock !== false;
  const nombre = product.nombre || product.name;
  const precio = parseFloat(product.precio || product.price) || 0;
  const descripcion = product.descripcion || product.description || 'Sin descripción';
  const sizes = product.sizes || [];
  const flavors = product.flavors || [];
  const themes = product.themes || [];
  const descuento = parseInt(product.descuento) || 0;
  const galleryImages = getGalleryImages();

  return (
    <div className="product-detail-page">
      {/* Migas de pan */}
      <div className="breadcrumb">
        <Link to="/">Inicio</Link>
        <span>›</span>
        <Link to="/productos">Productos</Link>
        <span>›</span>
        <span>{nombre}</span>
      </div>

      <div className="product-detail-container">
        {/* Galería de imágenes con Swiper */}
        <div className="product-gallery">
          <div className="gallery-swiper-container">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              loop={galleryImages.length > 1}
              className="gallery-swiper"
            >
              {galleryImages.length > 0 ? (
                galleryImages.map((img, index) => (
                  <SwiperSlide key={index}>
                    <div className="gallery-slide">
                      <img src={img} alt={`${nombre} - ${index + 1}`} />
                      {descuento > 0 && index === 0 && (
                        <span className="discount-badge-large">-{descuento}%</span>
                      )}
                    </div>
                  </SwiperSlide>
                ))
              ) : (
                <SwiperSlide>
                  <div className="gallery-slide">
                    <img 
                      src="https://via.placeholder.com/600x400/FFE4E1/8B4513?text=Producto" 
                      alt={nombre} 
                    />
                  </div>
                </SwiperSlide>
              )}
            </Swiper>
          </div>
          
          {/* Botón favorito */}
          <button 
            className="favorite-btn"
            onClick={() => setIsFavorite(!isFavorite)}
            style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10 }}
          >
            {isFavorite ? <FaHeart color="#FF6B6B" /> : <FaRegHeart />}
          </button>
        </div>

        {/* Información del producto */}
        <div className="product-info">
          <h1 className="product-name">{nombre}</h1>
          
          {/* Calificación */}
          <div className="product-rating">
            <span className="stars">{renderStars(4.5)}</span>
            <span className="rating-value">4.5</span>
            <span className="reviews-count">(128 reseñas)</span>
          </div>

          {/* Precio */}
          <div className="product-pricing">
            <span className="current-price">${precio.toFixed(2)}</span>
            {descuento > 0 && (
              <>
                <span className="old-price">${(precio / (1 - descuento / 100)).toFixed(2)}</span>
                <span className="discount-save">
                  Ahorra ${((precio * descuento) / 100).toFixed(2)}
                </span>
              </>
            )}
          </div>

          {/* Descripción */}
          <div className="product-description">
            <p>{descripcion}</p>
          </div>

          {/* Estado de stock */}
          <div className="stock-status-container">
            {enStock ? (
              <span className="in-stock">✅ Disponible</span>
            ) : (
              <span className="out-stock">❌ Agotado</span>
            )}
          </div>

          {/* Opciones de personalización */}
          <div className="product-customization">
            {sizes.length > 0 && (
              <div className="customization-group">
                <label>Tamaño</label>
                <div className="options-grid">
                  {sizes.map(size => (
                    <button
                      key={size}
                      className={`option-btn ${selectedSize === size ? 'active' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {flavors.length > 0 && (
              <div className="customization-group">
                <label>Sabor</label>
                <div className="options-grid">
                  {flavors.map(flavor => (
                    <button
                      key={flavor}
                      className={`option-btn ${selectedFlavor === flavor ? 'active' : ''}`}
                      onClick={() => setSelectedFlavor(flavor)}
                    >
                      {flavor}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {themes.length > 0 && (
              <div className="customization-group">
                <label>Tema o Decoración</label>
                <div className="options-grid">
                  {themes.map(theme => (
                    <button
                      key={theme}
                      className={`option-btn ${selectedTheme === theme ? 'active' : ''}`}
                      onClick={() => setSelectedTheme(theme)}
                    >
                      {theme === 'Personalizado' ? '🎨 Personalizado' : theme}
                    </button>
                  ))}
                </div>
                {selectedTheme === 'Personalizado' && (
                  <div className="custom-theme-input">
                    <label>Describe tu idea:</label>
                    <textarea
                      placeholder="Ej: Torta con temática de Minion, colores amarillo y azul..."
                      value={customTheme}
                      onChange={(e) => setCustomTheme(e.target.value)}
                      rows="3"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cantidad y acciones */}
          <div className="product-actions">
            <div className="quantity-selector">
              <button 
                className="quantity-btn"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={!enStock}
              >
                -
              </button>
              <span className="quantity-value">{quantity}</span>
              <button 
                className="quantity-btn"
                onClick={() => setQuantity(quantity + 1)}
                disabled={!enStock}
              >
                +
              </button>
            </div>

            <button 
              className={`add-to-cart-main ${isAddingToCart ? 'added' : ''}`}
              onClick={handleAddToCart}
              disabled={isAddingToCart || !enStock}
            >
              <FaShoppingCart />
              {isAddingToCart ? '¡Agregado!' : (enStock ? 'Agregar al carrito' : 'Agotado')}
            </button>

            <Link 
              to={`https://wa.me/573001234567?text=Hola, me interesa ${nombre}`}
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-order"
            >
              <FaWhatsapp /> Pedir por WhatsApp
            </Link>
          </div>

          {/* Información adicional */}
          <div className="product-extra-info">
            <div className="info-item">
              <FaClock />
              <div>
                <strong>Tiempo de preparación:</strong>
                <span>24 horas de anticipación</span>
              </div>
            </div>
            <div className="info-item">
              <FaTruck />
              <div>
                <strong>Entrega:</strong>
                <span>Entrega a domicilio</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;