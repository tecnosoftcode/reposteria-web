import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { CartContext } from '../../context/CartContext';

import 'swiper/css';
import 'swiper/css/pagination';

const ProductCarousel = ({ products, category }) => {
  const { addToCart } = useContext(CartContext);
  
  const normalizedCategory = category.trim().toLowerCase();
  
  const categoryProducts = products.filter(p => {
    const productCategory = (p.categoria_nombre || p.category || p.categoria || '')
      .trim()
      .toLowerCase();
    return productCategory === normalizedCategory;
  });

  if (categoryProducts.length === 0) return null;

  const isSingleProduct = categoryProducts.length === 1;

  // Renderizar tarjeta de producto
  const renderProductCard = (product) => {
    const productName = product.nombre || product.name;
    const productImage = product.imagen || product.image;
    const productPrice = product.precio || product.price;
    const productDesc = product.descripcion || product.description;
    const productId = product.id;
    const discount = parseInt(product.descuento || product.discount) || 0;
    const inStock = (product.en_stock !== false && product.inStock !== false);

    return (
      <div className="product-card-shop-modern">
        <Link to={`/producto/${productId}`} className="product-link">
          <div className="product-image-wrapper-modern">
            <img 
              src={productImage} 
              alt={productName}
              className="product-image-modern"
              loading="lazy"
            />
            
            {discount > 0 && (
              <div className="discount-badge-modern">-{discount}%</div>
            )}

            {/* ⭐ PRECIO SOBRE LA IMAGEN - ESQUINA INFERIOR DERECHA */}
            <div className="price-overlay-modern">
              <span className="price-overlay-current">${Number(productPrice).toFixed(2)}</span>
              {discount > 0 && (
                <span className="price-overlay-old">
                  ${(Number(productPrice) / (1 - discount / 100)).toFixed(2)}
                </span>
              )}
            </div>

            {!inStock && (
              <div className="stock-overlay-modern">
                <span>Agotado</span>
              </div>
            )}
          </div>

          <div className="product-info-shop-modern">
            <div className="product-header-modern">
              <h3 className="product-name-modern">{productName}</h3>
              <span className="product-category-modern">{category}</span>
            </div>
            <p className="product-description-modern">
              {productDesc && productDesc.length > 50 
                ? productDesc.substring(0, 50) + '...' 
                : productDesc}
            </p>
            <button 
              className="add-to-cart-modern-shop"
              onClick={(e) => {
                e.preventDefault();
                const cartProduct = {
                  id: productId,
                  name: productName,
                  price: productPrice,
                  image: productImage,
                  description: productDesc,
                  category: category
                };
                addToCart(cartProduct);
              }}
              disabled={!inStock}
            >
              {inStock ? 'Agregar' : 'Agotado'}
            </button>
          </div>
        </Link>
      </div>
    );
  };

  return (
    <div className="carousel-container">
      <div className="carousel-header">
        <h2 className="carousel-title">
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </h2>
        <Link to={`/productos?categoria=${category}`} className="view-all-btn">
          Ver todos →
        </Link>
      </div>

      {isSingleProduct ? (
        <div className="single-product-wrapper">
          {categoryProducts.map(product => renderProductCard(product))}
        </div>
      ) : (
        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={16}
          slidesPerView="auto"
          centeredSlides={false}
          pagination={{ clickable: true }}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          className="carousel-swiper"
        >
          {categoryProducts.map((product) => (
            <SwiperSlide key={product.id} className="carousel-slide" style={{ width: 'auto' }}>
              {renderProductCard(product)}
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
};

export default ProductCarousel;