import { FaWhatsapp } from 'react-icons/fa';

const WhatsAppButton = () => {
  const phoneNumber = '04120689503'; // Cambia por tu número
  const message = 'Hola, estoy interesado en sus productos de repostería.';
  
  return (
    <a 
      href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      aria-label="Contactar por WhatsApp"
    >
      <FaWhatsapp />
    </a>
  );
};

export default WhatsAppButton;