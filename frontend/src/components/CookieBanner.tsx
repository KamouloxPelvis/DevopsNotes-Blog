import { useState, useEffect } from 'react';
import '../styles/CookieBanner.css'; // Vérifie bien que ce chemin est exact

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('devopsnotes_cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const closeBanner = () => {
    localStorage.setItem('devopsnotes_cookie_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div 
      className="cookie-banner" 
      style={{ display: 'block' }} // Sécurité supplémentaire
    >
      <div className="cookie-content">
        <p>
          🛡️ <strong>Sécurité & Confidentialité :</strong> Ce site utilise uniquement des 
          cookies techniques sécurisés (HTTPOnly & SameSite) pour votre authentification. 
          Aucun tracker publicitaire n'est utilisé, conformément au RGPD.
        </p>
        <button className="cookie-close" onClick={closeBanner}>
          Compris !
        </button>
      </div>
    </div>
  );
}