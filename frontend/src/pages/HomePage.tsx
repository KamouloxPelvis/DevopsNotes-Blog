import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();
  const [lang, setLang] = useState<'FR' | 'EN'>('FR');
  
  const isAuthenticated = !!localStorage.getItem('devopsnotes_token');

  // Contenu textuel pour faciliter la maintenance
  const content = {
    FR: {
      title: "Portfolio Technique & Hub DevSecOps",
      subtitle: "Architecture Cloud | Automatisation CI/CD | Sécurité Kubernetes",
      description1: "est une plateforme full-stack conçue pour démontrer une expertise end-to-end dans le cycle de vie logiciel (SDLC). Plus qu'une simple vitrine, c'est un laboratoire vivant intégrant les meilleures pratiques de sécurité et d'automatisation.",
      description2: "L'infrastructure repose sur une stack React/Node.js/MongoDB, entièrement conteneurisée. Actuellement en transition vers un cluster k3s (Lightweight Kubernetes) pour une orchestration optimisée sur VPS Kamatera. La sécurité est au cœur du projet : gestion DNS/WAF via Cloudflare et intégration de scans de vulnérabilités dans mes pipelines.",
      explore: "Explorer le Portfolio",
      repo: "Repo Projet GitLab",
      powered: "Powered by"
    },
    EN: {
      title: "Technical Portfolio & DevSecOps Hub",
      subtitle: "Cloud Architecture | CI/CD Automation | Kubernetes Security",
      description1: "is a full-stack platform built to demonstrate end-to-end expertise in the Software Development Life Cycle (SDLC). More than a portfolio, it's a living lab integrating security and automation best practices.",
      description2: "The infrastructure runs on a containerized React/Node.js/MongoDB stack. Currently migrating to a k3s (Lightweight Kubernetes) cluster for optimized orchestration on Kamatera VPS. Security is core: DNS/WAF management via Cloudflare and vulnerability scanning integrated into CI/CD pipelines.",
      explore: "Explore Portfolio",
      repo: "GitLab Project Repo",
      powered: "Powered by"
    }
  };

  const t = content[lang];

  return (
    <div className="landing-root">
      {/* Sélecteur de langue en haut à droite */}
      <div className="lang-selector">
        <button aria-label="Sélectionner la langue française" onClick={() => setLang('FR')} className={lang === 'FR' ? 'active' : ''}>🇫🇷 FR</button>
        <button aria-label="Sélectionner la langue anglaise" onClick={() => setLang('EN')} className={lang === 'EN' ? 'active' : ''}>🇺🇸 EN</button>
      </div>

      <div className="landing-hero">
        <h1 className="landing-title">{t.title}</h1>
        <p className="landing-subtitle">{t.subtitle}</p>
        
        <div className="landing-description">
          <p className="landing-features">
            <strong>DevOpsNotes </strong> {t.description1}
          </p> 
          <p>
            {t.description2}
          </p>
        </div>

        <p className="beta-notice">
          ⚠️ <strong>Note :</strong> Cette plateforme est actuellement en <strong>phase bêta</strong>. 
          Des optimisations sur l'infrastructure et l'interface sont en cours de déploiement.
        </p>
        
        <div className="landing-buttons">
          <button
            aria-label="Aller vers la page d'articles"
            className="btn btn-primary landing-btn"
            onClick={() => navigate('/articles')}
          >
            🚀 {t.explore}
          </button>

          {/* Bouton GitLab avec lien externe */}
          <a 
            href="https://gitlab.com/votre-username/votre-repo" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-outline-dark landing-btn gitlab-btn"
          >
            <img src="/logos/gitlab.png" alt="GitLab" style={{ width: '20px', marginRight: '8px' }} />
            {t.repo}
          </a>
          
          {!isAuthenticated && (
            <div className="auth-group">
              <button aria-label='Se connecter' className="btn btn-light landing-btn" onClick={() => navigate('/login')}>
                👤 Sign In
              </button>
              <button aria-label="S'inscrire" className="btn btn-outline-primary landing-btn signup-btn" onClick={() => navigate('/signup')}>
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="landing-powered">
        <p className="landing-powered-title">{t.powered}</p>
        <div className="landing-tech-grid">
          <img src="/logos/react.png" alt="React" title="React 18 + TypeScript" />
          <img src="/logos/node.png" alt="Node.js" title="Node.js 20 + Express" />
          <img src="/logos/mongodb.png" alt="MongoDB" title="MongoDB + Mongoose" />
          <img src="/logos/docker.png" alt="Docker" title="Docker Containerization" />
          <img src="/logos/gitlab.png" alt="GitLab" title="GitLab CI/CD Pipelines" />
          <img src="/logos/kubernetes.png" alt="Kubernetes" title="k3s Orchestration" />
          <img src="/logos/terraform.png" alt="Terraform" title="Infrastructure as Code" />
        </div>
      </div>
    </div>
  )
}