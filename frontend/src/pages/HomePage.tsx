import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();
  const [lang, setLang] = useState<'FR' | 'EN'>('FR');

  // Contenu textuel pour faciliter la maintenance
  const content = {
    FR: {
      title: "Portfolio Technique & Hub DevSecOps",
      subtitle: "Architecture Cloud | Automatisation CI/CD | Sécurité Kubernetes",
      description1: "est une plateforme full-stack conçue pour démontrer une expertise end-to-end dans le cycle de vie logiciel (SDLC). Plus qu'une simple vitrine, c'est un laboratoire vivant qui a pour vocation d'intégrer les meilleures pratiques d'architecteur sécurisée et d'automatisation.",
      description2: (
              <>
                <strong>Points clés :</strong><br />
                • <strong>Architecture Stateless :</strong> Découplage total des médias via Cloudflare R2 (S3-compatible) et base de données managée MongoDB Atlas.<br />
                • <strong>Pipeline CI/CD Robuste :</strong> Automatisation complète du build et du déploiement sur VPS via GitLab CI/CD et Docker.<br />
                • <strong>Performance & Sécurité :</strong> Score Lighthouse avoisinant les 100/100, protection par Cloudflare (SSL Full Strict) et gestion d'emails transactionnels avec Resend.<br />
                • <strong>Stack Technique :</strong> Node.js (TypeScript), React, Nginx, Docker Compose.<br /><br />
                Un projet conçu pour illustrer les meilleures pratiques DevOps et DevSecOps, de la conteneurisation à l'optimisation des performances CDN, avec des technos légère mais puissantes et robustes pour une application micro-services.
              </>
            ),      
      explore: "Explorer le Portfolio",
      repo: "Repo Projet GitLab",
      powered: "Powered by"
    },
    EN: {
      title: "Technical Portfolio & DevSecOps Hub",
      subtitle: "Cloud Architecture | CI/CD Automation | Kubernetes Security",
      description1: "is a full-stack platform built to demonstrate end-to-end expertise in the Software Development Life Cycle (SDLC). More than a portfolio, it's a living lab integrating security and automation best practices.",
      description2: (
              <>
                <strong>Key Highlights:</strong><br />
                • <strong>Stateless Architecture:</strong> Total media decoupling via Cloudflare R2 (S3-compatible) and MongoDB Atlas managed database.<br />
                • <strong>Robust CI/CD Pipeline:</strong> Full build and deployment automation on VPS via GitLab CI/CD and Docker.<br />
                • <strong>Performance & Security:</strong> Lighthouse scores near 100/100, Cloudflare protection (SSL Full Strict), and transactional email management with Resend.<br />
                • <strong>Tech Stack:</strong> Node.js (TypeScript), React, Nginx, Docker Compose.<br /><br />
                A project designed to showcase DevOps and DevSecOps best practices, from containerization to CDN performance optimization with lightweight yet powerful and robust technologies for a microservices application..
              </>
            ),      
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
            href="https://gitlab.com/portfolio-kamal-guidadou/DevOps-DevSecOps/projet-demo-devops-v1" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-outline-dark landing-btn gitlab-btn"
          >
            <img src="/logos/gitlab.png" alt="GitLab" style={{ width: '20px', marginRight: '8px' }} />
            {t.repo}
          </a>
          
          {/* Bloc d'authentification supprimé pour éviter les doublons avec le PageLayout */}
        </div>
      </div>

      <div className="landing-powered">
        <p className="landing-powered-title">{t.powered}</p>
        <div className="landing-tech-grid">
          <img src="/logos/react.webp" alt="React" title="React 18 + TypeScript" />
          <img src="/logos/node.webp" alt="Node.js" title="Node.js 20 + Express" />
          <img src="/logos/mongodb.webp" alt="MongoDB" title="MongoDB + Mongoose" />
          <img src="/logos/docker.webp" alt="Docker" title="Docker Containerization" />
          <img src="/logos/gitlab.webp" alt="GitLab" title="GitLab CI/CD Pipelines" />
        </div>
      </div>
    </div>
  )};