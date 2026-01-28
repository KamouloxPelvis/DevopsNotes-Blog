import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();
  const [lang, setLang] = useState<'FR' | 'EN'>('FR');

  const content = {
    FR: {
      title: "Portfolio Technique & Hub DevSecOps",
      subtitle: "Architecture Cloud | Automatisation CI/CD | Sécurité Cloud-native",
      description1: "est une plateforme full-stack conçue pour démontrer une expertise end-to-end dans le cycle de vie logiciel (SDLC). Plus qu'une simple vitrine, c'est un laboratoire vivant qui a pour vocation d'intégrer les meilleures pratiques d'architecture sécurisée et d'automatisation.",
      description2: (
        <>
          Un projet conçu pour illustrer les meilleures pratiques DevOps et DevSecOps, de la conteneurisation à l'optimisation des performances CDN, avec des technos légères mais puissantes et robustes pour une application micro-services.
        </>
      ),      
      notice: "Des opérations de maintenance évolutive sur l'infrastructure et l'interface peuvent entraîner des indisponibilités temporaires.",
      explore: "Explorer le Portfolio",
      repo: "Repo Projet GitLab",
      powered: "Powered by"
    },
    EN: {
      title: "Technical Portfolio & DevSecOps Hub",
      subtitle: "Cloud Architecture | CI/CD Automation | Cloud-native Security",
      description1: "is a full-stack platform built to demonstrate end-to-end expertise in the Software Development Life Cycle (SDLC). More than a portfolio, it's a living lab integrating security and automation best practices.",
      description2: (
        <>
          A project designed to showcase DevOps and DevSecOps best practices, from containerization to CDN performance optimization with lightweight yet powerful and robust technologies for a microservices application.
        </>
      ),
      notice: "Ongoing infrastructure and UI optimizations may result in occasional service interruptions.",
      explore: "Explore Portfolio",
      repo: "GitLab Project Repo",
      powered: "Powered by"
    }
  };

  const t = content[lang];

  return (
    <div className="landing-root">
      <div className="lang-selector">
        <button aria-label="FR" onClick={() => setLang('FR')} className={lang === 'FR' ? 'active' : ''}>🇫🇷 FR</button>
        <button aria-label="EN" onClick={() => setLang('EN')} className={lang === 'EN' ? 'active' : ''}>🇺🇸 EN</button>
      </div>

      <div className="landing-hero">
        <h1 className="landing-title">{t.title}</h1>
        <p className="landing-subtitle">{t.subtitle}</p>
        
        <div className="landing-description">
          <p className="landing-features">
            <strong>DevOpsNotes </strong> {t.description1}
          </p> 
          <div className="key-points-container">
            {t.description2}
          </div>
        </div>

        <p className="beta-notice">
          ⚠️ <strong>Note :</strong> {t.notice}
        </p>
        
        <div className="landing-buttons">
          <button className="btn btn-primary landing-btn" onClick={() => navigate('/articles')}>
            🚀 {t.explore}
          </button>

          <a 
            href="https://gitlab.com/portfolio-kamal-guidadou/DevOps-DevSecOps/projet-demo-devops-v1" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-outline-dark landing-btn gitlab-btn"
          >
            <img src="/logos/gitlab.png" alt="GitLab" style={{ width: '20px', marginRight: '8px' }} />
            {t.repo}
          </a>
        </div>
      </div>

      <div className="landing-powered">
        <p className="landing-powered-title">{t.powered}</p>
        <div className="landing-tech-grid">
          <img src="/logos/react.webp" alt="React" title="React 19 + TypeScript" />
          <img src="/logos/node.webp" alt="Node.js" title="Node.js 20 + Express Backend" />
          <img src="/logos/mongodb.webp" alt="MongoDB" title="MongoDB + Mongoose Cloud Database" />
          <img src="/logos/docker.webp" alt="Docker" title="Docker Containerization" />
          <img src="/logos/kubernetes.webp" alt="Kubernetes" title="Kubernetes / k3s : Orchestration" />
          <img src="/logos/gitlab.webp" alt="GitLab" title="GitLab Repository and CI/CD Pipelines" />
          <img src="/logos/cf.webp" alt="Cloudflare" title="CDN, R2 & Security" />
          <img src="/logos/ingress.webp" alt="Ingress" title="Ingress : HTTP traffic manager" />
          <img src="/logos/nginx.webp" alt="ginx" title="Reverse-Proxy Nginx" />
          <img src="/logos/gcloud.webp" alt="Google Cloud" title="Google Cloud APIs" />
          <img src="/logos/kamatera.webp" alt="Kamatera" title="VPS Kamatera" />
          <img src="/logos/sentry.webp" alt="Sentry" title="Sentry Telemetry and Monitoring" />
        </div>
      </div>
    </div>
  );
}