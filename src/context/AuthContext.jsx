import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = 'https://reposteria-backend-motu.onrender.com/api';

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
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const userData = response.data.user;
      
      // Guardar en localStorage
      localStorage.setItem('admin_token', response.data.token);
      localStorage.setItem('admin_user', JSON.stringify(userData));
      
      setIsAuthenticated(true);
      setUser(userData);
      toast.success('🎉 ¡Bienvenido Administrador!');
      return userData;
    } catch (error) {
      console.error('Error al intentar login:', error);
      toast.error('❌ Credenciales incorrectas');
      throw new Error('Credenciales inválidas');
    }
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