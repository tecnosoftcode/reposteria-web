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

      <Swiper
        modules={[Pagination, Autoplay]}
        spaceBetween={16}
        slidesPerView="auto"        // 🔥 Cambiado de 1 a "auto"
        centeredSlides={false}
        pagination={{ clickable: true }}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        className="carousel-swiper"
      >
        {categoryProducts.map((product) => {
          const productName = product.nombre || product.name;
          const productImage = product.imagen || product.image;
          const productPrice = product.precio || product.price;
          const productId = product.id;

          return (
            <SwiperSlide key={productId} className="carousel-slide" style={{ width: 'auto' }}>
              <div className="product-card-shop" style={{ width: '280px' }}>  {/* 🔥 Tamaño fijo */}
                <Link to={`/producto/${productId}`} className="product-link">
                  <div className="product-image-wrapper">
                    <img 
                      src={productImage} 
                      alt={productName}
                      className="product-image"
                      loading="lazy"
                    />
                    {product.descuento > 0 && (
                      <div className="product-badge">-{product.descuento}%</div>
                    )}
                  </div>
                </Link>
                
                <div className="product-info-shop">
                  <Link to={`/producto/${productId}`} className="product-name-link-shop">
                    <h3>{productName}</h3>
                  </Link>
                  <div className="product-footer-shop">
                    <span className="price-shop">${Number(productPrice).toFixed(2)}</span>
                    <button 
                      className="add-to-cart-btn-shop"
                      onClick={(e) => {
                        e.preventDefault();
                        const cartProduct = {
                          id: productId,
                          name: productName,
                          price: productPrice,
                          image: productImage,
                          category: category
                        };
                        addToCart(cartProduct);
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default ProductCarousel;