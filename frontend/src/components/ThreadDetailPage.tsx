import { useEffect, useState, FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getThread } from '../api/forum';
import { ForumThread } from '../types/forum';
import { getReplies, createReply } from '../api/forum';
import { Reply } from '../types/forum';
import { getAuthToken } from '../api/auth';

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

    useEffect(() => {
        if (!id) return;
        (async () => {
        try {
            const data = await getThread(id);
            setThread(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load thread');
        } finally {
            setLoading(false);
        }
        })();
    }, [id]);

    // charger les replies
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

    async function handleSubmitReply(e: FormEvent) {
        e.preventDefault();
        if (!id) return;
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

  if (loading) return <div className="page-card">Loading thread...</div>;
  if (error) return <div className="page-card">Error: {error}</div>;
  if (!thread) return <div className="page-card">Thread not found.</div>;

  return (
    <div className="page-card">
      <Link to="/forum" className="btn btn-light">
        ← Back to forum
      </Link>

      <h1 style={{ marginTop: '1rem' }}>{thread.title}</h1>
      <p className="thread-meta">
        {new Date(thread.createdAt).toLocaleString()}
      </p>

      <p style={{ marginTop: '1rem', whiteSpace: 'pre-line' }}>
        {thread.content}
      </p>

      {thread.tags?.length > 0 && (
        <div className="thread-tags" style={{ marginTop: '1rem' }}>
          {thread.tags.map((tag) => (
            <span key={tag} className="tag-pill">
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="replies-section">
        <h2>Replies</h2>

        {replies.length === 0 && <p className="replies-empty">No replies yet.</p>}

        {replies.length > 0 && (
            <ul className="replies-list">
            {replies.map((r) => (
                <li key={r._id} className="reply-card">
                <p>{r.content}</p>
                <span className="reply-meta">
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
