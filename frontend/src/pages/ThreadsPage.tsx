import { useEffect, useState } from 'react';
import { ForumThread } from '../types/forum';
import { getThreads } from '../api/forum';
import { Link } from 'react-router-dom';
import '../styles/ThreadsPage.css';

export default function ThreadsPage() {
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

  const filteredThreads = threads.filter((t) => {
    const term = searchTerm.toLowerCase();
    return (
      t.title.toLowerCase().includes(term) ||
      t.content.toLowerCase().includes(term) ||
      (t.authorPseudo ?? '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="forum-container">
      <header className="forum-header">
        <div className="header-title">
          <h1>DevOpsNotes Forum</h1>
          <p className="subtitle">Discutez infrastructure, automatisation et cloud</p>
        </div>

        <div className="header-actions">
          <div className="search-wrapper">
            <input
              type="text"
              className="forum-search-input"
              placeholder="Rechercher un sujet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link to="/forum/new" className="btn btn-primary">
            + Nouveau sujet
          </Link>
        </div>
      </header>

      {loading && <div className="forum-state">Chargement des discussions...</div>}
      {error && <div className="forum-state error-text">⚠️ {error}</div>}

      {!loading && !error && (
        <div className="threads-section">
          <div className="threads-stats">
            {filteredThreads.length} discussion{filteredThreads.length > 1 ? 's' : ''} trouvée{filteredThreads.length > 1 ? 's' : ''}
          </div>

          {filteredThreads.length === 0 ? (
            <div className="forum-empty-state">
              <p>Aucun résultat pour votre recherche.</p>
            </div>
          ) : (
            <div className="thread-list">
              {filteredThreads.map((thread) => (
                <div key={thread._id} className="thread-item">
                  <div className="thread-main">
                    <Link to={`/forum/${thread._id}`} className="thread-title-link">
                      <h2>{thread.title}</h2>
                    </Link>
                    <div className="thread-metadata">
                      <span className="thread-author">Par <strong>{thread.authorPseudo || 'Anonyme'}</strong></span>
                      <span className="separator">•</span>
                      <span className="thread-date">
                        {new Date(thread.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {thread.tags && thread.tags.length > 0 && (
                      <div className="thread-tags">
                        {thread.tags.map((tag) => (
                          <span key={tag} className="tag-pill">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* On peut imaginer ajouter thread.replyCount plus tard */}
                  <div className="thread-stats-side">
                    <div className="stat-box">
                      <span className="stat-value">{thread.comments?.length || 0}</span>
                      <span className="stat-label">réponses</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      <div className="forum-footer">
        <Link to="/articles" className="back-link">← Retour aux articles</Link>
      </div>
    </div>
  );
}