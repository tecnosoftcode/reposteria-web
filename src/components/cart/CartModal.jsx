import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { FaTimes, FaTrash, FaPlus, FaMinus, FaShoppingCart } from 'react-icons/fa';

const CartModal = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useContext(CartContext);
  
  if (!isOpen) return null;

  // 🔥 Calcular totales con manejo de strings
  const subtotal = getCartTotal();
  const shipping = subtotal > 50 ? 0 : 5.00;
  const total = subtotal + shipping;

  // Cerrar al hacer clic fuera del modal
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 🔥 Función segura para formatear precio
  const formatPrice = (price) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numPrice) ? 0 : numPrice;
  };

  // 🔥 Función para calcular total de un item
  const getItemTotal = (item) => {
    const price = formatPrice(item.price);
    const quantity = typeof item.quantity === 'string' ? parseInt(item.quantity) : item.quantity;
    return price * (quantity || 0);
  };

  return (
    <div className="cart-modal-overlay" onClick={handleOverlayClick}>
      <div className="cart-modal">
        {/* Header */}
        <div className="cart-modal-header">
          <h2>
            <FaShoppingCart /> Mi Carrito
            <span className="cart-item-count">{cart.length} items</span>
          </h2>
          <button className="cart-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Contenido */}
        {cart.length === 0 ? (
          <div className="cart-empty">
            <span className="empty-cart-icon">🛒</span>
            <h3>Tu carrito está vacío</h3>
            <p>¡Explora nuestros productos y encuentra tu delicia favorita!</p>
            <Link to="/productos" className="btn-primary" onClick={onClose}>
              Ver productos
            </Link>
          </div>
        ) : (
          <>
            {/* Lista de items */}
            <div className="cart-items">
              {cart.map(item => {
                // 🔥 Normalizar datos del item
                const itemPrice = formatPrice(item.price);
                const itemQuantity = typeof item.quantity === 'string' ? parseInt(item.quantity) : item.quantity;
                const itemTotal = itemPrice * (itemQuantity || 0);

                return (
                  <div key={item.id} className="cart-item">
                    <img src={item.image} alt={item.name} className="cart-item-image" />
                    
                    <div className="cart-item-info">
                      <h4>{item.name}</h4>
                      {item.selectedSize && (
                        <span className="cart-item-meta">Tamaño: {item.selectedSize}</span>
                      )}
                      {item.selectedFlavor && (
                        <span className="cart-item-meta">Sabor: {item.selectedFlavor}</span>
                      )}
                      {item.selectedTheme && (
                        <span className="cart-item-meta">Tema: {item.selectedTheme}</span>
                      )}
                      <span className="cart-item-price">${itemPrice.toFixed(2)} c/u</span>
                    </div>

                    <div className="cart-item-controls">
                      <div className="quantity-control">
                        <button 
                          className="qty-btn"
                          onClick={() => updateQuantity(item.id, itemQuantity - 1)}
                        >
                          <FaMinus />
                        </button>
                        <span className="qty-value">{itemQuantity}</span>
                        <button 
                          className="qty-btn"
                          onClick={() => updateQuantity(item.id, itemQuantity + 1)}
                        >
                          <FaPlus />
                        </button>
                      </div>
                      <button 
                        className="remove-btn"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <FaTrash />
                      </button>
                    </div>

                    <div className="cart-item-total">
                      ${itemTotal.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Resumen */}
            <div className="cart-summary-modal">
              <button className="clear-cart-btn" onClick={clearCart}>
                Vaciar carrito
              </button>

              <div className="cart-totals">
                <div className="totals-row">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="totals-row">
                  <span>Envío</span>
                  <span>{shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="totals-row total">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="cart-actions">
                <button className="btn-secondary" onClick={onClose}>
                  Seguir comprando
                </button>
                <Link to="/checkout" className="btn-primary" onClick={onClose}>
                  Ir a pagar →
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartModal;