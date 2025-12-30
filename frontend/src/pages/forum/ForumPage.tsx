// frontend/src/pages/ForumPage.tsx
import { useEffect, useState } from 'react';
import { ForumThread } from '../../types/forum';
import { getThreads } from '../../api/forum';
import { Link } from 'react-router-dom';

export default function ForumPage() {
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');

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

  const term = searchTerm.toLowerCase();

  const filteredThreads = threads.filter((t) => {
    if (!term) return true;
    return (
      t.title.toLowerCase().includes(term) ||
      t.content.toLowerCase().includes(term) ||
      (t.authorPseudo ?? '').toLowerCase().includes(term)
    );
  });

  return (
  <div className="page-card">
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
      }}
    >
      <h1>DevOpsNotes<br/>Forum</h1>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <input
            type="text"
            className="forum-search-input"
            placeholder="Search threads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        <Link to="/articles" className="btn btn-light">
          ← Back to articles
        </Link>

        <Link to="/forum/new" className="btn btn-primary">
          New thread
        </Link>
      </div>
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
        {filteredThreads.map((thread) => (
          <li key={thread._id} className="thread-card">
            <Link to={`/forum/${thread._id}`}>
              <h2>{thread.title}</h2>
            </Link>
            <p className="thread-meta">
            {thread.authorPseudo && (
              <>
                Created by <strong>{thread.authorPseudo}</strong> ·{' '}
              </>
            )}
            {new Date(thread.createdAt).toLocaleString()}
          </p>
            {thread.tags?.length ? (
              <div className="thread-tags" style={{ marginTop: '1rem' }}>
                {thread.tags?.map((tag) => (
                  <span key={tag} className="tag-pill">
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    )}
  </div>
)};