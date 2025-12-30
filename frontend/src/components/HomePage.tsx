import { useNavigate } from 'react-router-dom';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="landing-root">
      <div className="landing-hero">
        
        <h1 className="landing-title">Technical Portfolio</h1>
        
        <p className="landing-subtitle">
          Full-Stack Developer | DevOps Engineer | DevSecOps | Systems Administrator
        </p>
        
        <div className="landing-description">
          <p className="landing-features">
            <strong>DevOpsNotes</strong> is my comprehensive technical portfolio showcasing 
            end-to-end software delivery expertise. This project demonstrates my ability to design, 
            build, deploy, and maintain production-grade full-stack applications using modern 
            DevOps practices.
          </p>
          
          <p className="landing-features">
            Built with <strong>React + TypeScript</strong> (frontend), <strong>Node.js + Express</strong> 
            (backend), and <strong>MongoDB</strong> (database), the app features a complete blog/forum 
            system with user authentication, rich markdown editor, real-time comments, article CRUD 
            operations, and tag-based filtering.
          </p>
          
          <p className="landing-features">
            Deployed using <strong>Docker containers</strong>, <strong>GitLab CI/CD pipelines</strong>, 
            <strong>Nginx reverse proxy</strong>, and IaC principles. The infrastructure includes 
            container orchestration readiness and security hardening best practices.
          </p>
          
          <p>
            🔧 Explore the live application, inspect the clean codebase, contribute through 
            comments and forum discussions, or fork the project on GitLab. This is production-ready 
            code demonstrating real-world skills across the full software delivery lifecycle.
          </p>
        </div>

        <div className="landing-buttons">
          <button
            className="btn btn-primary landing-btn"
            onClick={() => navigate('/articles')}
          >
            Explore Portfolio
          </button>
          
          <button
            className="btn btn-light landing-btn"
            onClick={() => navigate('/login')}
          >
            👤 Sign In
          </button>
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
