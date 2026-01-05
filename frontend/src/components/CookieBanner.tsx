import { useState, useEffect } from 'react';
import '../styles/Cke.css';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('devopsnotes_cke_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const closeBanner = () => {
    localStorage.setItem('devopsnotes_cke_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div 
      className="cke-banner" 
      style={{ display: 'block' }}
    >
      <div className="cke-content">
        <p>
          🛡️ <strong>Sécurité & Confidentialité :</strong> Ce site utilise uniquement des 
          cookies techniques sécurisés (HTTPOnly & SameSite) pour votre authentification. 
          Aucun tracker publicitaire n'est utilisé, conformément au RGPD.
        </p>
        <button className="cke-close" onClick={closeBanner}>
          Compris !
        </button>
      </div>
    </div>
  );
}