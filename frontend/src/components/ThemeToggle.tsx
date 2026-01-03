import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  // Au chargement, on vérifie si l'utilisateur avait déjà choisi un thème
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.body.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark ? 'dark' : 'light';
    setIsDark(!isDark);
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme); // On s'en souvient pour la prochaine visite
  };

  return (
    <button 
      onClick={toggleTheme} 
      className="btn-theme-toggle"
      title={isDark ? "Passer au mode clair" : "Passer au mode sombre"}
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--toolbar-border)',
        color: 'var(--primary)',
        cursor: 'pointer',
        padding: '8px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease'
      }}
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}