import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Credenciales de ejemplo (después vendrán del backend)
const ADMIN_CREDENTIALS = {
  email: 'admin@reposteria.com',
  password: 'Admin123!'
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Verificar si hay sesión guardada al cargar
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const userData = localStorage.getItem('admin_user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  // Iniciar sesión
  const login = async (email, password) => {
    // Simular llamada a API (después conectaremos con backend)
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
          const userData = {
            id: 1,
            name: 'Administrador',
            email: email,
            role: 'admin'
          };
          
          // Guardar en localStorage
          localStorage.setItem('admin_token', 'fake-jwt-token');
          localStorage.setItem('admin_user', JSON.stringify(userData));
          
          setIsAuthenticated(true);
          setUser(userData);
          toast.success('🎉 ¡Bienvenido Administrador!');
          resolve(userData);
        } else {
          toast.error('❌ Credenciales incorrectas');
          reject(new Error('Credenciales inválidas'));
        }
      }, 1000);
    });
  };

  // Cerrar sesión
  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setIsAuthenticated(false);
    setUser(null);
    toast.success('👋 Sesión cerrada');
  };

  // Verificar si el usuario está autenticado
  const checkAuth = () => {
    return isAuthenticated;
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      loading,
      login,
      logout,
      checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};