import { useEffect, useState, FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getThread } from '../api/forum';
import { ForumThread } from '../types/forum';
import { getReplies, createReply } from '../api/forum';
import { Reply } from '../types/forum';
import { getAuthToken, getCurrentUser  } from '../api/auth';

export default function ThreadDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [thread, setThread] = useState<ForumThread | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [replies, setReplies] = useState<Reply[]>([]);
    const [replyContent, setReplyContent] = useState('');
    const [replyError, setReplyError] = useState<string | null>(null);
    const [replyLoading, setReplyLoading] = useState(false);
    const isAuthenticated = !!getAuthToken();
    const currentUser = getCurrentUser();
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState('');
    const canEditOrDelete =
    !!thread &&
    !!currentUser &&
    (currentUser.role === 'admin' ||
    (thread.authorId && (thread.authorId as any).toString?.() === currentUser.id));

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        if (!id) return;
        (async () => {
        try {
            const data = await getThread(id);
            setThread(data);
            setEditContent(data.content);
        } catch (err: any) {
            setError(err.message || 'Failed to load thread');
        } finally {
            setLoading(false);
        }
        })();
    }, [id]);

    // charger les 
    useEffect(() => {
    if (!id) return;
    (async () => {
        try {
        const data = await getReplies(id);
        setReplies(data);
        } catch {
        // silencieux pour l’instant
        }
    })();
    }, [id]);

    // Réponse au post
    async function handleSubmitReply(e: FormEvent) {
        e.preventDefault();
        if (!id) return;

        const trimmed = replyContent.trim();
        if(!trimmed) {
        setReplyError('You have to type something in order to reply ;)');
        return;
        }
        
        setReplyError(null);
        setReplyLoading(true);
        try {
            const newReply = await createReply(id, replyContent);
            setReplies((prev) => [...prev, newReply]);
            setReplyContent('');
        } catch (err: any) {
            setReplyError(err.message || 'Failed to post reply');
        } finally {
            setReplyLoading(false);
        }
    }

    // Edition
    async function handleSaveEdit(e: FormEvent) {
      e.preventDefault();
      if (!id) return;

      try {
        const res = await fetch(`${API_URL}/forum/threads/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getAuthToken()}`,
          },
          body: JSON.stringify({ content: editContent }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || 'Failed to update thread');
        }

        const updated = await res.json();
        setThread(updated);
        setIsEditing(false);
      } catch (err: any) {
        setError(err.message || 'Failed to update thread');
      }
    }

  // Suppression
    async function handleDeleteThread() {
      if (!id) return;
      if (!window.confirm('Delete this thread?')) return;

      try {
        const res = await fetch(`${API_URL}/forum/threads/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || 'Failed to delete thread');
        }

        window.history.back(); // ou navigate('/forum')
      } catch (err: any) {
        setError(err.message || 'Failed to delete thread');
      }
    }

  if (loading) return <div className="page-card">Loading thread...</div>;
  if (error) return <div className="page-card">Error: {error}</div>;
  if (!thread) return <div className="page-card">Thread not found.</div>;

  return (
    <div className="page-card">
     <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Link to="/forum" className="btn btn-light">
          ← Back to forum
        </Link>

        {canEditOrDelete && (
          <div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsEditing((v) => !v)}
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
            <button
              type="button"
              className="btn btn-danger"
              style={{ marginLeft: '0.5rem' }}
              onClick={handleDeleteThread}
            >
              Delete
            </button>
          </div>
        )}
      </div>


      <h1 style={{ marginTop: '1rem' }}>{thread.title}</h1>
      <p className="thread-meta">
        {thread.authorPseudo && (
          <>
            Created by <strong>{thread.authorPseudo}</strong> ·{' '}
          </>
        )}
        {new Date(thread.createdAt).toLocaleString()}
        {thread.editedAt && (
          <> • Thread edited at {new Date(thread.editedAt).toLocaleString()}</>
        )}
      </p>

      {!isEditing ? (
        <p style={{ marginTop: '1rem', whiteSpace: 'pre-line' }}>
          {thread.content}
        </p>
      ) : (
        <form
          onSubmit={handleSaveEdit}
          className="reply-form"
          style={{ marginTop: '1rem' }}
        >
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={5}
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{ marginTop: '0.5rem' }}
          >
            Save changes
          </button>
        </form>
      )}  

      {thread.tags?.length ? (
        <div className="thread-tags" style={{ marginTop: '1rem' }}>
          {thread.tags?.map((tag) => (
            <span key={tag} className="tag-pill">
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      <div className="replies-section">
        <h2>Replies</h2>

        {replies.length === 0 && <p className="replies-empty">No replies yet.</p>}

        {replies.length > 0 && (
          <ul className="replies-list">
            {replies.map((r) => (
              <li key={r._id} className="reply-card">
                <p>{r.content}</p>
                <span className="reply-meta">
                  {r.authorPseudo && (
                    <>
                      Author: <strong>{r.authorPseudo}</strong> ·{' '}
                    </>
                  )}
                  {new Date(r.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}

        {isAuthenticated && (
            <form className="reply-form" onSubmit={handleSubmitReply}>
            {replyError && <p className="error">{replyError}</p>}
            <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={3}
                placeholder="Add a reply..."
            />
            <button type="submit" className="btn btn-primary" disabled={replyLoading}>
                {replyLoading ? 'Posting...' : 'Reply'}
            </button>
            </form>
        )}
        </div>
    </div>
  );
}
