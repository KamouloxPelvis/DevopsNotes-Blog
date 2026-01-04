    import { useState, useEffect } from 'react';
    import '../styles/CookieBanner.css';

    export default function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Vérifie si l'utilisateur a déjà pris connaissance du bandeau
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
        <div className="cookie-banner">
        <div className="cookie-content">
            <p>
            <strong>🛡️ Sécurité & Confidentialité :</strong> Ce site utilise uniquement des cookies 
            techniques sécurisés (HTTPOnly & SameSite) pour votre authentification. 
            Aucun tracker publicitaire n'est utilisé, conformément au RGPD (Réglement Général sur la Protection des
            Données : https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng).
            </p>
            <button className="cookie-close" onClick={closeBanner} aria-label="Fermer">
            &times;
            </button>
        </div>
        </div>
    );
    }