import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { CartContext } from '../../context/CartContext';
import { FaShoppingCart, FaHeart, FaRegHeart } from 'react-icons/fa';
import { useState } from 'react';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const [isFavorite, setIsFavorite] = useState(false);

  // Normalizar datos
  const id = product.id;
  const name = product.nombre || product.name || 'Producto sin nombre';
  const price = parseFloat(product.precio || product.price) || 0;
  const description = product.descripcion || product.description || '';
  const image = product.imagen || product.image || 'https://via.placeholder.com/400x300/FFE4E1/8B4513?text=Producto';
  const discount = parseInt(product.descuento || product.discount) || 0;
  const inStock = (product.en_stock !== false && product.inStock !== false);
  const category = product.categoria_nombre || product.category || '';

  // Manejar agregar al carrito
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!inStock) {
      toast.error('❌ Producto agotado');
      return;
    }

    const cartItem = {
      id: id,
      name: name,
      price: price,
      image: image,
      description: description,
      quantity: 1
    };

    addToCart(cartItem);
  };

  // Manejar favorito
  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? '❤️ Eliminado de favoritos' : '❤️ Agregado a favoritos');
  };

  return (
    <div className={`product-card-modern ${!inStock ? 'out-of-stock' : ''}`}>
      <Link to={`/producto/${id}`} className="product-card-link">
        {/* Imagen con precio superpuesto */}
        <div className="product-card-image-modern">
          <img src={image} alt={name} loading="lazy" />
          
          {/* Badge de descuento */}
          {discount > 0 && (
            <span className="discount-badge-modern">-{discount}%</span>
          )}
          
          {/* Botón favorito */}
          <button 
            className="favorite-btn-modern"
            onClick={handleFavorite}
            aria-label="Agregar a favoritos"
          >
            {isFavorite ? <FaHeart /> : <FaRegHeart />}
          </button>

          {/* ⭐ PRECIO SOBRE LA IMAGEN - ESQUINA INFERIOR DERECHA */}
          <div className="price-overlay">
            <span className="price-overlay-current">${price.toFixed(2)}</span>
            {discount > 0 && (
              <span className="price-overlay-old">
                ${(price / (1 - discount / 100)).toFixed(2)}
              </span>
            )}
          </div>

          {/* Estado de stock */}
          {!inStock && (
            <div className="stock-overlay">
              <span>Agotado</span>
            </div>
          )}
        </div>

        {/* Información del producto */}
        <div className="product-card-info-modern">
          <div className="product-card-header">
            <h3 className="product-card-name">{name}</h3>
            <span className="product-card-category">{category}</span>
          </div>
          
          <p className="product-card-description-modern">
            {description.length > 60 ? description.substring(0, 60) + '...' : description}
          </p>

          <div className="product-card-actions-modern">
            <button 
              className={`add-to-cart-modern ${!inStock ? 'disabled' : ''}`}
              onClick={handleAddToCart}
              disabled={!inStock}
            >
              <FaShoppingCart />
              <span>{inStock ? 'Agregar' : 'Agotado'}</span>
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;