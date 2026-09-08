import { createContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // 🔥 Función para normalizar precio
  const normalizePrice = (price) => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(num) ? 0 : num;
  };

  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      
      // 🔥 Asegurar que el precio sea número
      const normalizedProduct = {
        ...product,
        price: normalizePrice(product.price)
      };

      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...normalizedProduct, quantity }];
    });
    toast.success(`🎉 ¡${product.name} añadido al carrito!`);
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
    toast.success('🗑️ Producto eliminado del carrito');
  };

  const updateQuantity = (id, quantity) => {
    if (quantity === 0) {
      removeFromCart(id);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    toast.success('🛒 Carrito vaciado');
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
      const quantity = typeof item.quantity === 'string' ? parseInt(item.quantity) : item.quantity;
      return total + (price || 0) * (quantity || 0);
    }, 0);
  };

  const cartCount = cart.reduce((count, item) => {
    const quantity = typeof item.quantity === 'string' ? parseInt(item.quantity) : item.quantity;
    return count + (quantity || 0);
  }, 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};