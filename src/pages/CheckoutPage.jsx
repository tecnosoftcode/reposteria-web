import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { FaTrash, FaPlus, FaMinus, FaWhatsapp, FaCreditCard, FaMoneyBill, FaCheckCircle } from 'react-icons/fa';
import { createOrder, getSettings } from '../services/api';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [settings, setSettings] = useState(null);
  
  // 🔥 IMPORTANTE: Guardar copia del carrito para la confirmación
  const [orderItems, setOrderItems] = useState([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderSubtotal, setOrderSubtotal] = useState(0);
  const [orderShipping, setOrderShipping] = useState(0);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    instrucciones: '',
    metodoPago: 'efectivo'
  });

  // 🔥 Cargar configuración de la tienda
  useEffect(() => {
    getSettings().then(setSettings).catch(console.error);
  }, []);

  // Calcular totales
  const subtotal = getCartTotal();
  
  // 🔥 Usar el precio de delivery configurado por el admin
  const shipping = settings ? parseFloat(settings.delivery_price) || 0 : 5.00;
  const total = subtotal + shipping;

  // ==========================================
  // VALIDAR FORMULARIO
  // ==========================================
  const validateForm = () => {
    const required = ['nombre', 'apellido', 'telefono', 'direccion', 'ciudad'];
    const missing = required.filter(field => !formData[field].trim());
    
    if (missing.length > 0) {
      toast.error('Por favor completa todos los campos requeridos');
      return false;
    }

    if (formData.telefono.length < 10) {
      toast.error('Número de teléfono inválido');
      return false;
    }

    return true;
  };

  // ==========================================
  // ENVIAR PEDIDO
  // ==========================================
  const handleSubmitOrder = async () => {
    if (!validateForm()) return;

    // 🔥 Guardar copia del carrito ANTES de vaciarlo
    const itemsCopy = cart.map(item => ({
      ...item,
      quantity: item.quantity
    }));
    
    setOrderItems(itemsCopy);
    setOrderSubtotal(subtotal);
    setOrderShipping(shipping);
    setOrderTotal(total);

    setIsSubmitting(true);

    try {
      const orderData = {
        cliente: {
          nombre: formData.nombre.trim(),
          apellido: formData.apellido.trim(),
          email: formData.email.trim() || null,
          telefono: formData.telefono.trim(),
          direccion: formData.direccion.trim(),
          ciudad: formData.ciudad.trim()
        },
        items: itemsCopy.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          selectedSize: item.selectedSize || null,
          selectedFlavor: item.selectedFlavor || null,
          selectedTheme: item.selectedTheme || null
        })),
        total: total,
        metodo_pago: formData.metodoPago,
        instrucciones: formData.instrucciones.trim() || null
      };

      const response = await createOrder(orderData);
      setOrderId(response.pedidoId);
      
      // 🔥 Limpiar carrito DESPUÉS de guardar los datos
      clearCart();
      
      // Ir a confirmación
      setStep(3);
      toast.success('🎉 ¡Pedido realizado con éxito!');
    } catch (error) {
      console.error('Error al crear pedido:', error);
      toast.error('Error al crear pedido: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // RENDER - PASO 1 (CARRITO)
  // ==========================================
  const renderCartStep = () => (
    <div className="checkout-cart">
      <h2>🛒 Tu Pedido</h2>
      <p className="checkout-subtitle">Revisa los productos que has seleccionado</p>

      {cart.length === 0 ? (
        <div className="checkout-empty-cart">
          <h3>Tu carrito está vacío</h3>
          <Link to="/productos" className="btn-primary">Ver productos</Link>
        </div>
      ) : (
        <>
          <div className="cart-items-list">
            {cart.map(item => (
              <div key={item.id} className="cart-item-checkout">
                <div className="cart-item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="cart-item-details">
                  <h4>{item.name}</h4>
                  <div className="cart-item-meta">
                    {item.selectedSize && <span>{item.selectedSize}</span>}
                    {item.selectedFlavor && <span>{item.selectedFlavor}</span>}
                    {item.selectedTheme && <span>{item.selectedTheme}</span>}
                  </div>
                </div>
                <div className="cart-item-actions">
                  <div className="quantity-control">
                    <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      <FaMinus />
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <FaPlus />
                    </button>
                  </div>
                  <button className="remove-item-btn" onClick={() => removeFromCart(item.id)}>
                    <FaTrash />
                  </button>
                </div>
                <div className="cart-item-total">${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Envío</span>
              <span>{shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="checkout-actions">
            <Link to="/productos" className="btn-secondary">Seguir comprando</Link>
            <button className="btn-primary" onClick={() => setStep(2)}>
              Continuar con datos →
            </button>
          </div>
        </>
      )}
    </div>
  );

  // ==========================================
  // RENDER - PASO 2 (DATOS DEL CLIENTE)
  // ==========================================
  const renderCustomerData = () => (
    <div className="checkout-customer">
      <h2>📋 Datos del Pedido</h2>
      <p className="checkout-subtitle">Completa tus datos para realizar el pedido</p>

      <form className="customer-form" onSubmit={(e) => e.preventDefault()}>
        <div className="form-row">
          <div className="form-group">
            <label>Nombre *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              placeholder="Tu nombre"
              required
            />
          </div>
          <div className="form-group">
            <label>Apellido *</label>
            <input
              type="text"
              name="apellido"
              value={formData.apellido}
              onChange={(e) => setFormData({...formData, apellido: e.target.value})}
              placeholder="Tu apellido"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="correo@ejemplo.com"
            />
          </div>
          <div className="form-group">
            <label>Teléfono *</label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={(e) => setFormData({...formData, telefono: e.target.value})}
              placeholder="3001234567"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Dirección *</label>
          <input
            type="text"
            name="direccion"
            value={formData.direccion}
            onChange={(e) => setFormData({...formData, direccion: e.target.value})}
            placeholder="Calle 123 #45-67"
            required
          />
        </div>

        <div className="form-group">
          <label>Ciudad *</label>
          <input
            type="text"
            name="ciudad"
            value={formData.ciudad}
            onChange={(e) => setFormData({...formData, ciudad: e.target.value})}
            placeholder="Bogotá"
            required
          />
        </div>

        <div className="form-group">
          <label>Instrucciones especiales</label>
          <textarea
            name="instrucciones"
            value={formData.instrucciones}
            onChange={(e) => setFormData({...formData, instrucciones: e.target.value})}
            placeholder="Ej: Entregar en la portería, no tiene timbre..."
            rows="3"
          />
        </div>

        {/* Método de pago */}
        <div className="form-group">
          <label>Método de pago *</label>
          <div className="payment-methods">
            <label className={`payment-option ${formData.metodoPago === 'efectivo' ? 'active' : ''}`}>
              <input
                type="radio"
                name="metodoPago"
                value="efectivo"
                checked={formData.metodoPago === 'efectivo'}
                onChange={(e) => setFormData({...formData, metodoPago: e.target.value})}
              />
              <FaMoneyBill />
              <span>Efectivo</span>
            </label>
            <label className={`payment-option ${formData.metodoPago === 'pago_movil' ? 'active' : ''}`}>
              <input
                type="radio"
                name="metodoPago"
                value="pago_movil"
                checked={formData.metodoPago === 'pago_movil'}
                onChange={(e) => setFormData({...formData, metodoPago: e.target.value})}
              />
              <span>📱 Pago Móvil</span>
            </label>
            <label className={`payment-option ${formData.metodoPago === 'transferencia' ? 'active' : ''}`}>
              <input
                type="radio"
                name="metodoPago"
                value="transferencia"
                checked={formData.metodoPago === 'transferencia'}
                onChange={(e) => setFormData({...formData, metodoPago: e.target.value})}
              />
              <FaCreditCard />
              <span>Transferencia</span>
            </label>
          </div>

          {/* 🔥 Mostrar datos según método seleccionado */}
          {formData.metodoPago === 'efectivo' && (
            <p style={{ marginTop: '0.5rem', color: 'gray', fontSize: '0.9rem' }}>
              💵 Acordar con el vendedor
            </p>
          )}

          {formData.metodoPago === 'pago_movil' && (
            <div className="payment-method-details">
              <h4>📱 Datos para Pago Móvil</h4>
              {settings?.payment_methods?.filter(m => m.type === 'pago_movil').length > 0 ? (
                settings.payment_methods.filter(m => m.type === 'pago_movil').map((method, index) => (
                  <div key={index} className="payment-method-info">
                    <strong>Banco:</strong> {method.banco}<br />
                    <strong>Teléfono:</strong> {method.telefono}<br />
                    <strong>Cédula:</strong> {method.cedula}
                  </div>
                ))
              ) : (
                <p style={{ color: 'gray' }}>No hay datos de Pago Móvil configurados.</p>
              )}
            </div>
          )}

          {formData.metodoPago === 'transferencia' && (
            <div className="payment-method-details">
              <h4>🏦 Datos para Transferencia</h4>
              {settings?.payment_methods?.filter(m => m.type === 'transferencia').length > 0 ? (
                settings.payment_methods.filter(m => m.type === 'transferencia').map((method, index) => (
                  <div key={index} className="payment-method-info">
                    <strong>Número de cuenta:</strong> {method.numero_cuenta}<br />
                    <strong>Cédula:</strong> {method.cedula}<br />
                    <strong>Teléfono:</strong> {method.telefono}
                  </div>
                ))
              ) : (
                <p style={{ color: 'gray' }}>No hay datos de Transferencia configurados.</p>
              )}
            </div>
          )}
        </div>

        <div className="checkout-actions">
          <button type="button" className="btn-secondary" onClick={() => setStep(1)}>
            ← Volver al carrito
          </button>
          <button 
            type="button"
            className="btn-primary"
            onClick={handleSubmitOrder}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Procesando...' : '✅ Realizar pedido'}
          </button>
        </div>
      </form>
    </div>
  );

  // ==========================================
  // RENDER - PASO 3 (CONFIRMACIÓN)
  // ==========================================
  const renderConfirmation = () => {
    const itemsToShow = orderItems.length > 0 ? orderItems : cart;
    const totalToShow = orderTotal > 0 ? orderTotal : total;
    const subtotalToShow = orderSubtotal > 0 ? orderSubtotal : subtotal;
    const shippingToShow = orderShipping > 0 ? orderShipping : shipping;

    return (
      <div className="checkout-confirmation">
        <div className="confirmation-icon">🎉</div>
        <h2>¡Pedido realizado con éxito!</h2>
        <p>Gracias por tu compra. Hemos recibido tu pedido.</p>
        
        {orderId && (
          <p style={{ fontSize: '0.9rem', color: 'gray' }}>
            Número de pedido: <strong>#{orderId}</strong>
          </p>
        )}

        <div className="confirmation-details">
          <div className="confirmation-card">
            <h4>📋 Resumen del pedido</h4>
            <div className="confirmation-items">
              {itemsToShow.map(item => (
                <div key={item.id} className="confirmation-item">
                  <span>{item.name} x{item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="confirmation-total">
              <div className="totals-row">
                <span>Subtotal</span>
                <span>${subtotalToShow.toFixed(2)}</span>
              </div>
              <div className="totals-row">
                <span>Envío</span>
                <span>{shippingToShow === 0 ? 'Gratis' : `$${shippingToShow.toFixed(2)}`}</span>
              </div>
              <div className="totals-row" style={{ borderTop: '2px solid #f0ebe6', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                <strong>Total</strong>
                <strong style={{ color: 'var(--primary)' }}>${totalToShow.toFixed(2)}</strong>
              </div>
            </div>
          </div>
          
          <div className="confirmation-card">
            <h4>📞 Información de entrega</h4>
            <p><strong>Cliente:</strong> {formData.nombre} {formData.apellido}</p>
            <p><strong>Teléfono:</strong> {formData.telefono}</p>
            <p><strong>Dirección:</strong> {formData.direccion}, {formData.ciudad}</p>
            <p><strong>Pago:</strong> {formData.metodoPago.charAt(0).toUpperCase() + formData.metodoPago.slice(1)}</p>
            {formData.instrucciones && (
              <p><strong>Instrucciones:</strong> {formData.instrucciones}</p>
            )}
          </div>
        </div>

        <div className="confirmation-actions">
          <p>Te contactaremos para confirmar tu pedido</p>
          <div className="confirmation-buttons">
            <a 
              href={`https://wa.me/573001234567?text=Hola,%20mi%20pedido%20%23${orderId || ''}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              <FaWhatsapp /> Contactar por WhatsApp
            </a>
            <Link to="/" className="btn-primary">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // RENDER PRINCIPAL
  // ==========================================
  return (
    <div className="checkout-page">
      <div className="checkout-steps">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>
          <span className="step-number">1</span>
          <span className="step-label">Carrito</span>
        </div>
        <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
        <div className={`step ${step >= 2 ? 'active' : ''}`}>
          <span className="step-number">2</span>
          <span className="step-label">Datos</span>
        </div>
        <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
        <div className={`step ${step >= 3 ? 'active' : ''}`}>
          <span className="step-number">3</span>
          <span className="step-label">Confirmación</span>
        </div>
      </div>

      {step === 1 && renderCartStep()}
      {step === 2 && renderCustomerData()}
      {step === 3 && renderConfirmation()}
    </div>
  );
};

export default CheckoutPage;