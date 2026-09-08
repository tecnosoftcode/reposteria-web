import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Autoplay } from 'swiper/modules';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { CartContext } from '../../context/CartContext';

// Importar estilos de Swiper
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

const ProductCarousel = ({ products, category }) => {
  const { addToCart } = useContext(CartContext);
  
  // Normalizar categoría para comparar
  const normalizedCategory = category.trim().toLowerCase();
  
  // Filtrar productos por categoría (usando categoria_nombre de la BD)
  const categoryProducts = products.filter(p => {
    const productCategory = (p.categoria_nombre || p.category || p.categoria || '')
      .trim()
      .toLowerCase();
    return productCategory === normalizedCategory;
  });

  // Si no hay productos en esta categoría, no mostrar nada
  if (categoryProducts.length === 0) {
    console.warn(`⚠️ No hay productos para la categoría: "${category}" (normalizada: "${normalizedCategory}")`);
    return null;
  }


  return (
    <div className="carousel-3d-container">
      {/* Encabezado de la categoría */}
      <div className="carousel-header">
        <h2 className="carousel-title">
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </h2>
        <Link to={`/productos?categoria=${category}`} className="view-all-btn">
          Ver todos →
        </Link>
      </div>

      {/* Carrusel 3D con Swiper */}
      <Swiper
        effect={'coverflow'}
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={'auto'}
        coverflowEffect={{
          rotate: 50,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: true,
        }}
        pagination={{ 
          clickable: true,
          dynamicBullets: true,
        }}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        modules={[EffectCoverflow, Pagination, Autoplay]}
        className="swiper-3d"
        breakpoints={{
          320: {
            slidesPerView: 1,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 2,
            spaceBetween: 30,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 40,
          },
        }}
      >
        {categoryProducts.map((product) => {
          // Adaptar propiedades de la BD
          const productName = product.nombre || product.name;
          const productImage = product.imagen || product.image;
          const productPrice = product.precio || product.price;
          const productDesc = product.descripcion || product.description;
          const productId = product.id;

          return (
            <SwiperSlide key={productId} className="swiper-slide-3d">
              <div className="product-card-3d">
                <Link to={`/producto/${productId}`} className="product-link">
                  <div className="product-image-wrapper">
                    <img 
                      src={productImage} 
                      alt={productName}
                      className="product-image-3d"
                      loading="lazy"
                    />
                    {product.descuento > 0 && (
                      <div className="product-badge">-{product.descuento}%</div>
                    )}
                  </div>
                </Link>
                
                <div className="product-info-3d">
                  <Link to={`/producto/${productId}`} className="product-name-link">
                    <h3>{productName}</h3>
                  </Link>
                  <p className="product-description">{productDesc}</p>
                  
                  <div className="product-price-3d">
                    <div className="price-container">
                      <span className="price">${Number(productPrice).toFixed(2)}</span>
                    </div>
                    <button 
                      className="add-to-cart-btn"
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
                      aria-label="Agregar al carrito"
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