import { 
  FaInstagram, FaFacebook, FaWhatsapp, FaTiktok, 
  FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, 
  FaChevronRight, FaArrowUp 
} from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>🍰 ScarletSweetShop</h4>
          <p>Sabores artesanales hechos con amor y los mejores ingredientes.</p>
          <div className="social-links">
            <a href="https://instagram.com/tu-usuario" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="https://facebook.com/tu-usuario" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FaFacebook />
            </a>
            <a href="https://wa.me/584147602181" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <FaWhatsapp />
            </a>
            <a href="https://tiktok.com/@tu-usuario" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <FaTiktok />
            </a>
          </div>
        </div>
        
        <div className="footer-section">
          <h4>Contacto</h4>
          <p><FaPhone className="footer-icon" /> 0414 - 7602181</p>
          <p><FaEnvelope className="footer-icon" /> scarletsweetshop@gmail.com</p>
          <p><FaMapMarkerAlt className="footer-icon" /> Tucupita, Delta Amacuro</p>
          <p><FaClock className="footer-icon" /> Lun-Sáb: 8am - 8pm</p>
        </div>

        <div className="footer-section">
          <h4>Desarrollado por</h4>
          <p><b>Hector Patriz</b></p>
          <p><FaEnvelope className="footer-icon" /> tecnosoftcode@gmail.com</p>
          <p><FaPhone className="footer-icon" /> 0412-0689503</p>
          <p><FaMapMarkerAlt className="footer-icon" /> Tucupita, Delta Amacuro</p>
        </div>

        <div className="footer-section">
          <h4>Enlaces Rápidos</h4>
          <p><a href="/productos"><FaChevronRight className="footer-arrow" /> Nuestros Productos</a></p>
          <p><a href="/admin"><FaChevronRight className="footer-arrow" /> Administrador</a></p>
          <p><a href="/terminos"><FaChevronRight className="footer-arrow" /> Términos y Condiciones</a></p>
          <p><a href="/privacidad"><FaChevronRight className="footer-arrow" /> Política de Privacidad</a></p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>© {currentYear} ScarletSweetShop. Todos los derechos reservados.</p>
        <p className="footer-credit">Diseñado con ❤️ en Venezuela</p>
      </div>

      {/* Back to top */}
      <button className="back-to-top" onClick={scrollToTop} aria-label="Volver arriba">
        <FaArrowUp />
      </button>
    </footer>
  );
};

export default Footer;