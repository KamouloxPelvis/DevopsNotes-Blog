import { useNavigate } from 'react-router-dom';
import './HomePage.css'; // si tu préfères séparer le CSS

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="landing-root">
      <div className="landing-hero">
        <h1 className="landing-title">DevOpsNotes • Hands‑on DevOps lab</h1>

        <p className="landing-subtitle">
          This project is a personal DevOps sandbox: design, build and deploy a full‑stack blog
          and forum while practicing CI/CD, containers, orchestration and infrastructure as code.
        </p>
        <p className="landing-subtitle">
          Use this app to experiment with real‑world workflows: writing technical articles,
          discussing issues in the forum and validating the full delivery pipeline.
        </p>

        <div className="landing-buttons">
          <button
            className="btn btn-light landing-btn"
            onClick={() => navigate('/articles')}
          >
            Visitor
          </button>

          <button
            className="btn btn-primary landing-btn"
            onClick={() => navigate('/member-login')}
          >
            Member
          </button>

          <button
            className="btn btn-outline landing-btn"
            onClick={() => navigate('/login')}
          >
            Administrator
          </button>
        </div>
      </div>

      <div className="landing-powered">
        <p className="landing-powered-title">This app is powered by</p>
        <div className="landing-tech-grid">
          <img src="/logos/gitlab.png" alt="GitLab" />
          <img src="/logos/vscode.png" alt="Visual Code Studio" />
          <img src="/logos/typescript.png" alt="TypeScript" />
          <img src="/logos/mongodb.png" alt="MongoDB" />
          <img src="/logos/express.png" alt="Express" />
          <img src="/logos/react.png" alt="React" />
          <img src="/logos/node.png" alt="Node.js" />
          <img src="/logos/docker.png" alt="Docker" />
          <img src="/logos/nginx.png" alt="Nginx" />
          <img src="/logos/kubernetes.png" alt="Kubernetes" />
          <img src="/logos/terraform.png" alt="Terraform" />

        </div>
      </div>
    </div>
  );
}
