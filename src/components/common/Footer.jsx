import { FaInstagram, FaFacebook, FaWhatsapp, FaTiktok } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>🍰 Repostería Delicias</h4>
          <p>Sabores artesanales hechos con amor y los mejores ingredientes.</p>
          <div className="social-links">
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FaFacebook />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <FaWhatsapp />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <FaTiktok />
            </a>
          </div>
        </div>
        
        <div className="footer-section">
          <h4>Contacto</h4>
          <p>📞 +57 300 123 4567</p>
          <p>📧 info@reposteriadelicias.com</p>
          <p>📍 Calle 123 #45-67, Bogotá</p>
          <p>🕐 Lun-Sáb: 8am - 8pm</p>
        </div>
        
        <div className="footer-section">
          <h4>Enlaces Rápidos</h4>
          <p><a href="/productos">Nuestros Productos</a></p>
          <p><a href="/admin">Administrador</a></p>
          <p><a href="#">Términos y Condiciones</a></p>
          <p><a href="#">Política de Privacidad</a></p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>© 2026 Repostería Delicias. Todos los derechos reservados. | Hecho con ❤️</p>
      </div>
    </footer>
  );
};

export default Footer;