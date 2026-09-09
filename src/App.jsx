import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';

// ===== COMPONENTES PÚBLICOS (CLIENTES) =====
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import WhatsAppButton from './components/common/WhatsAppButton';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetail from './pages/ProductDetail';
import CheckoutPage from './pages/CheckoutPage';

// ===== COMPONENTES DE ADMINISTRACIÓN =====
import LoginPage from './pages/admin/LoginPage';
import AdminPage from './pages/admin/AdminPage';
import OrdersPage from './pages/admin/OrdersPage';
import DashboardPage from './pages/admin/DashboardPage';
import UsersPage from './pages/admin/UsersPage';
import CategoriesPage from './pages/admin/CategoriesPage'; // 🔥 NUEVO CATEGORÍAS

// ===== 🔥 FIREBASE NOTIFICATIONS =====
import { requestPermission, listenForMessages } from './firebase/config';

// ============================================
// ESTILOS GLOBALES
// ============================================
import './styles/global.css';

// ============================================
// ESTILOS DE COMPONENTES
// ============================================
import './styles/components/navbar.css';
import './styles/components/footer.css';
import './styles/components/whatsapp.css';
import './styles/components/cart-modal.css';
import './styles/components/product-card.css';

// ============================================
// ESTILOS DE PÁGINAS
// ============================================
import './styles/pages/home.css';
import './styles/pages/products.css';
import './styles/pages/product-detail.css';
import './styles/pages/checkout.css';
import './styles/pages/orders.css';
import './styles/pages/dashboard.css';

// ============================================
// ESTILOS DE ADMIN
// ============================================
import './styles/admin/admin-layout.css';
import './styles/admin/admin-products.css';
import './styles/admin/admin-orders.css';
import './styles/admin/admin-login.css';

function App() {
  // ============================================
  // 🔥 INICIALIZAR NOTIFICACIONES PUSH
  // ============================================
  useEffect(() => {
    const initNotifications = async () => {
      try {
        // 1. Registrar Service Worker
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          console.log('✅ Service Worker registrado');
        }
        
        // 2. Solicitar permiso y obtener token
        const token = await requestPermission();
        if (token) {
          console.log('✅ Token FCM obtenido:', token);
        }
        
        // 3. Escuchar mensajes en primer plano
        listenForMessages();
        
      } catch (error) {
        console.error('❌ Error inicializando notificaciones:', error);
      }
    };
    
    initNotifications();
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="app-container">
            <Routes>
              {/* ============================================
                  RUTAS PÚBLICAS - PARA CLIENTES
                  ============================================ */}
              {/* Home */}
              <Route path="/" element={
                <>
                  <Navbar />
                  <main className="main-content">
                    <HomePage />
                  </main>
                  <Footer />
                  <WhatsAppButton />
                </>
              } />
              
              {/* Productos */}
              <Route path="/productos" element={
                <>
                  <Navbar />
                  <main className="main-content">
                    <ProductsPage />
                  </main>
                  <Footer />
                  <WhatsAppButton />
                </>
              } />
              
              {/* Detalle Producto */}
              <Route path="/producto/:id" element={
                <>
                  <Navbar />
                  <main className="main-content">
                    <ProductDetail />
                  </main>
                  <Footer />
                  <WhatsAppButton />
                </>
              } />
              
              {/* Checkout */}
              <Route path="/checkout" element={
                <>
                  <Navbar />
                  <main className="main-content">
                    <CheckoutPage />
                  </main>
                  <Footer />
                  <WhatsAppButton />
                </>
              } />

              {/* ============================================
                  RUTAS DE ADMINISTRACIÓN - SOLO ADMIN
                  ============================================ */}
              {/* Login del Admin */}
              <Route path="/admin/login" element={<LoginPage />} />

              {/* Panel de Admin (protegido) */}
              <Route path="/admin" element={<ProtectedRoute />}>
                <Route path="dashboard" element={<AdminLayout />}>
                  <Route index element={<DashboardPage />} />
                </Route>
                <Route path="products" element={<AdminLayout />}>
                  <Route index element={<AdminPage />} />
                </Route>
                <Route path="orders" element={<AdminLayout />}>
                  <Route index element={<OrdersPage />} />
                </Route>
                <Route path="users" element={<AdminLayout />}>
                  <Route index element={<UsersPage />} />
                </Route>
                <Route path="categories" element={<AdminLayout />}> {/* 🔥 NUEVO CATEGORÍAS */}
                  <Route index element={<CategoriesPage />} />
                </Route>
              </Route>

              {/* Redirección 404 */}
              <Route path="*" element={
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  minHeight: '60vh',
                  padding: '2rem',
                  textAlign: 'center'
                }}>
                  <span style={{ fontSize: '4rem' }}>🔍</span>
                  <h1 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>404 - Página no encontrada</h1>
                  <p style={{ color: 'var(--text-secondary)' }}>Lo sentimos, la página que buscas no existe.</p>
                  <a href="/" className="btn-primary" style={{ marginTop: '1rem' }}>
                    Volver al inicio
                  </a>
                </div>
              } />
            </Routes>

            {/* Toaster global */}
            <Toaster 
              position="bottom-right"
              toastOptions={{
                style: {
                  background: '#1a1a1a',
                  color: '#fff',
                  borderRadius: '10px',
                  padding: '1rem',
                  border: '1px solid rgba(255,45,117,0.2)',
                },
                duration: 3000,
              }}
            />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;