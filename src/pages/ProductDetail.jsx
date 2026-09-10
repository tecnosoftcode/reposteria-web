import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { FaShoppingCart, FaWhatsapp, FaStar, FaStarHalf, FaTruck, FaClock, FaHeart, FaRegHeart, FaUser, FaPaperPlane } from 'react-icons/fa';
import { getProductById, getProductReviews, getProductRating, createReview } from '../services/api';
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

  // 🔥 ESTADOS PARA RESEÑAS
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState({ total_reviews: 0, average_rating: 0 });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [newReview, setNewReview] = useState({
    nombre_cliente: '',
    email_cliente: '',
    rating: 5,
    comentario: ''
  });

  // 🔥 Cargar producto, reseñas y rating
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [productData, reviewsData, ratingData] = await Promise.all([
          getProductById(id),
          getProductReviews(id),
          getProductRating(id)
        ]);

        if (productData) {
          setProduct(productData);
          if (productData.sizes && productData.sizes.length > 0) {
            setSelectedSize(productData.sizes[0]);
          }
          if (productData.flavors && productData.flavors.length > 0) {
            setSelectedFlavor(productData.flavors[0]);
          }
          if (productData.themes && productData.themes.length > 0) {
            setSelectedTheme(productData.themes[0]);
          }
        } else {
          setError('Producto no encontrado');
        }

        setReviews(reviewsData || []);
        setRating(ratingData || { total_reviews: 0, average_rating: 0 });
      } catch (err) {
        console.error('Error cargando producto:', err);
        setError('Error al cargar el producto');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadData();
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

  // 🔥 ENVIAR RESEÑA
  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!newReview.nombre_cliente.trim()) {
      toast.error('Por favor ingresa tu nombre');
      return;
    }
    if (!newReview.comentario.trim()) {
      toast.error('Por favor escribe un comentario');
      return;
    }

    try {
      setIsSubmittingReview(true);
      await createReview(id, newReview);
      toast.success('¡Gracias por tu reseña! 🎉');

      // Recargar reseñas y rating
      const [reviewsData, ratingData] = await Promise.all([
        getProductReviews(id),
        getProductRating(id)
      ]);
      setReviews(reviewsData || []);
      setRating(ratingData || { total_reviews: 0, average_rating: 0 });

      // Resetear formulario
      setNewReview({
        nombre_cliente: '',
        email_cliente: '',
        rating: 5,
        comentario: ''
      });
      setShowReviewForm(false);
    } catch (error) {
      console.error('Error enviando reseña:', error);
      toast.error('Error al enviar la reseña');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Renderizar estrellas (solo visual)
  const renderStars = (ratingValue, size = '1.2rem') => {
    const stars = [];
    const fullStars = Math.floor(ratingValue || 0);
    const hasHalfStar = (ratingValue || 0) % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`star-${i}`} style={{ fontSize: size }} />);
    }
    if (hasHalfStar) {
      stars.push(<FaStarHalf key="half-star" style={{ fontSize: size }} />);
    }
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaStar key={`empty-${i}`} style={{ fontSize: size, opacity: 0.3 }} />);
    }
    return stars;
  };

  // 🔥 Selector de estrellas (para el formulario)
  const renderStarSelector = () => {
    return (
      <div className="star-selector">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            className={`star-btn ${newReview.rating >= star ? 'active' : ''}`}
            onClick={() => setNewReview({ ...newReview, rating: star })}
          >
            <FaStar />
          </button>
        ))}
      </div>
    );
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
          
          {/* 🔥 CALIFICACIÓN DINÁMICA */}
          <div className="product-rating">
            <span className="stars">{renderStars(rating.average_rating || 0)}</span>
            <span className="rating-value">
              {rating.average_rating ? rating.average_rating.toFixed(1) : '0.0'}
            </span>
            <span className="reviews-count">
              ({rating.total_reviews} {rating.total_reviews === 1 ? 'reseña' : 'reseñas'})
            </span>
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

      {/* ==========================================
          SECCIÓN DE RESEÑAS
          ========================================== */}
      <section className="reviews-section">
        <div className="reviews-header">
          <h2 className="reviews-title">
            💬 Reseñas ({rating.total_reviews})
          </h2>
          <button 
            className="btn-primary write-review-btn"
            onClick={() => setShowReviewForm(!showReviewForm)}
          >
            {showReviewForm ? 'Cancelar' : '✍️ Escribir reseña'}
          </button>
        </div>

        {/* 🔥 FORMULARIO DE RESEÑA */}
        {showReviewForm && (
          <form className="review-form" onSubmit={handleSubmitReview}>
            <h3>✍️ Deja tu reseña</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Tu nombre *</label>
                <input
                  type="text"
                  value={newReview.nombre_cliente}
                  onChange={(e) => setNewReview({ ...newReview, nombre_cliente: e.target.value })}
                  placeholder="Ej: María González"
                  required
                />
              </div>
              <div className="form-group">
                <label>Tu email (opcional)</label>
                <input
                  type="email"
                  value={newReview.email_cliente}
                  onChange={(e) => setNewReview({ ...newReview, email_cliente: e.target.value })}
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Tu calificación *</label>
              {renderStarSelector()}
            </div>

            <div className="form-group">
              <label>Tu comentario *</label>
              <textarea
                value={newReview.comentario}
                onChange={(e) => setNewReview({ ...newReview, comentario: e.target.value })}
                placeholder="Cuéntanos qué te pareció el producto..."
                rows="4"
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary submit-review-btn"
              disabled={isSubmittingReview}
            >
              <FaPaperPlane /> {isSubmittingReview ? 'Enviando...' : 'Enviar reseña'}
            </button>
          </form>
        )}

        {/* 🔥 LISTA DE RESEÑAS */}
        <div className="reviews-list">
          {reviews.length > 0 ? (
            reviews.map(review => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div className="review-user">
                    <span className="review-avatar">
                      <FaUser />
                    </span>
                    <div>
                      <strong className="review-name">{review.nombre_cliente}</strong>
                      <span className="review-date">{formatDate(review.created_at)}</span>
                    </div>
                  </div>
                  <div className="review-stars">
                    {renderStars(review.rating, '1rem')}
                  </div>
                </div>
                <p className="review-comment">{review.comentario}</p>
              </div>
            ))
          ) : (
            <div className="no-reviews">
              <span className="no-reviews-icon">💬</span>
              <h3>Sé el primero en opinar</h3>
              <p>Comparte tu experiencia con este producto</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;