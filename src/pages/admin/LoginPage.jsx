import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error de login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="login-container">
        {/* Logo */}
        <div className="login-header">
          <div className="login-logo">🍰</div>
          <h1>Repostería Delicias</h1>
          <p>Panel de Administración</p>
        </div>

        {/* Formulario de login */}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Correo Electrónico</label>
            <div className="input-with-icon">
              <FaUser className="input-icon" />
              <input
                type="email"
                placeholder="admin@reposteria.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <div className="input-with-icon">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="login-options">
            <label className="remember-me">
              <input type="checkbox" /> Recordarme
            </label>
            <a href="#" className="forgot-password">¿Olvidaste tu contraseña?</a>
          </div>

          <button 
            type="submit" 
            className="login-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Ingresando...' : '🔐 Iniciar Sesión'}
          </button>
        </form>

        <div className="login-footer">
          <p>Credenciales de prueba:</p>
          <small>Email: admin@reposteria.com</small>
          <small>Contraseña: Admin123!</small>
        </div>
      </div>

      {/* Decoración de fondo */}
      <div className="login-background">
        <div className="bg-cake">🎂</div>
        <div className="bg-cake">🧁</div>
        <div className="bg-cake">🍰</div>
        <div className="bg-cake">🍩</div>
      </div>
    </div>
  );
};

export default LoginPage;