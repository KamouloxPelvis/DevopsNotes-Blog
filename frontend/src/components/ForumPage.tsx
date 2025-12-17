// frontend/src/pages/ForumPage.tsx
import { useEffect, useState } from 'react';
import { ForumThread } from '../types/forum';
import { getThreads } from '../api/forum';
import { getAuthToken } from '../api/auth';
import { Link } from 'react-router-dom';

export default function ForumPage() {
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isAuthenticated = !!getAuthToken();

  useEffect(() => {
    (async () => {
      try {
        const data = await getThreads();
        setThreads(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load threads');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="forum-container">
      <div className="forum-header">
        <h1>DevOps Forum</h1>
        <Link to="/" className="btn btn-light">
          ← Back to articles
        </Link>
        {isAuthenticated && (
          <Link to="/forum/new" className="btn btn-primary">
            New thread
          </Link>
        )}
      </div>

      {loading && <p>Loading threads...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && threads.length === 0 && (
        <p className="forum-empty">
          No threads yet. Be the first to start a discussion on Docker, CI/CD or Terraform.
        </p>
      )}

      {!loading && !error && threads.length > 0 && (
        <ul className="thread-card-list">
          {threads.map((thread) => (
            <li key={thread._id} className="thread-card">
              <Link to={`/forum/${thread._id}`}>
                <h2>{thread.title}</h2>
              </Link>
              <p className="thread-meta">
                {new Date(thread.createdAt).toLocaleString()}
              </p>
              {thread.tags?.length > 0 && (
                <div className="thread-tags">
                  {thread.tags.map((tag) => (
                    <span key={tag} className="tag-pill">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

