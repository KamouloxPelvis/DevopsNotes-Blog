import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();
  
  // Vérification de l'état de connexion
  const isAuthenticated = !!localStorage.getItem('devopsnotes_token');

  return (
    <div className="landing-root">
      <div className="landing-hero">
        <h1 className="landing-title">Technical Portfolio</h1>
        <p className="landing-subtitle">
          Sys Admin | DevOps | DevSecOps Blog and Community Center
        </p>
        
        <div className="landing-description">
          <p className="landing-features">
            <strong>DevOpsNotes</strong> is my comprehensive technical portfolio showcasing 
            end-to-end software delivery expertise and DevOps skills. From infrastructure as code with 
            Terraform to CI/CD pipelines with GitLab, containerization with Docker, and orchestration 
            with Kubernetes, this platform highlights my ability to build, deploy, and manage robust
            applications in cloud environments.
        </p> 
          <p>
            Explore articles, tutorials, and a community forum 
            where I share insights and best practices on DevOps, cloud computing, and automation.
          </p>
          
          {/* ... Garde tes autres paragraphes ici ... */}
        </div>

        <div className="landing-buttons">
          <button
            className="btn btn-primary landing-btn"
            onClick={() => navigate('/articles')}
          >
            Explore Portfolio
          </button>
          
          {/* Affichage conditionnel des boutons Auth */}
          {!isAuthenticated && (
            <>
              <button
                className="btn btn-light landing-btn"
                onClick={() => navigate('/login')}
              >
                👤 Sign In
              </button>

              <button
                className="btn btn-outline-primary landing-btn signup-btn"
                onClick={() => navigate('/signup')}
              >
                🚀 Sign Up
              </button>
            </>
          )}
        </div>
      </div>

      <div className="landing-powered">
        <p className="landing-powered-title">This app is powered by</p>
        <div className="landing-tech-grid">
          <img src="/logos/react.png" alt="React" title="React 18 + TypeScript" />
          <img src="/logos/node.png" alt="Node.js" title="Node.js 20 + Express" />
          <img src="/logos/mongodb.png" alt="MongoDB" title="MongoDB + Mongoose" />
          <img src="/logos/docker.png" alt="Docker" title="Docker Containerization" />
          <img src="/logos/gitlab.png" alt="GitLab" title="GitLab CI/CD Pipelines" />
          <img src="/logos/kubernetes.png" alt="Kubernetes" title="K8s Orchestration Ready" />
          <img src="/logos/terraform.png" alt="Terraform" title="Infrastructure as Code" />
        </div>
      </div>
    </div>
  );
}