// src/components/ArticleDetail.tsx
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getAuthToken } from '../api/auth';
import { RelatedArticles } from './RelatedArticles';
import { useAllArticles } from '../hooks/useAllArticles';
import { Article } from '../types/articles';

type RouteParams = {
  slug: string;
};

type Comment = {
  _id: string;
  authorName: string;
  content: string;
  createdAt: string;
};

export default function ArticleDetail() {
  
  const { slug } = useParams<RouteParams>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loadingArticle, setLoadingArticle] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isAdmin = !!getAuthToken();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentBody, setCommentBody] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const { articles: allArticles, 
    loading: loadingAllArticles } = useAllArticles();  
  
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:5000/api';

  useEffect(() => {
    if (!slug) return;

    fetch(`${API_URL}/articles/${slug}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Erreur HTTP');
        return res.json();
      })
      .then((data: Article) => setArticle(data))
      .catch((err: any) => setError(err.message))
      .finally(() => setLoadingArticle(false));

    fetch(`${API_URL}/articles/${slug}/comments`)
    .then((res) => {
      if (!res.ok) return [];
      return res.json();
    })
    .then((data: Comment[]) => setComments(data))
    .catch(() => {});
  }, [slug, API_URL]);

  if (loadingArticle) return <p>Loading...</p>;
  if (error) return <p>Error : {error}</p>;
  if (!article) return <p>Can't find this article</p>;

  async function handleDelete() {
    if (!slug) return;

    const confirmDelete = window.confirm('Do you really want to delete this article ?');
    if (!confirmDelete) return;

    try {
      const token = getAuthToken();

      const res = await fetch(`${API_URL}/articles/${slug}`, {
        method: 'DELETE',
        headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

      if (!res.ok && res.status !== 204) {
        throw new Error('Erreur HTTP');
      }

      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleSubmitComment(e: React.FormEvent) {
  e.preventDefault();
  if (!slug) return;

  setSubmitting(true);
  setCommentError(null);

  try {
    const res = await fetch(
      `${API_URL}/articles/${slug}/comments`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: commentAuthor,
          content: commentBody,
        }),
      }
    );

    if (!res.ok) throw new Error('Error posting comment');

    const created: Comment = await res.json();
    setComments((prev) => [created, ...prev]);
    setCommentAuthor('');
    setCommentBody('');
  } catch (err: any) {
    setCommentError(err.message);
  } finally {
    setSubmitting(false);
  }
}

function handleReplyTo(author: string) {
  setCommentBody((prev) =>
    prev
      ? `${prev}\n@${author} `
      : `@${author} `
  );
  // scroll au formulaire plus tard ?
} 
  return (
    <div>
      {article.imageUrl && (
        <div className="article-detail-image">
          <img
            src={`${API_URL}${article.imageUrl}`}
            alt={article.title}
          />
        </div>
      )}
      <h1>{article.title}</h1>
      <p>{article.content}</p>
      <section className="comments">
        <h3>Comments ({comments.length})</h3>
        <form className="comment-form" onSubmit={handleSubmitComment}>
          {commentError && <p className="form-error">Erreur : {commentError}</p>}

          <div className="form-field">
            <label htmlFor="comment-name">Name</label>
            <input
              id="comment-name"
              value={commentAuthor}
              onChange={(e) => setCommentAuthor(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="comment-body">Comment</label>
            <textarea
              id="comment-body"
              rows={3}
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              required
            />
          </div>
          <div className="comment-actions-row">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Sending…' : 'Post comment'}
            </button>

            <Link to="/articles" className="btn btn-secondary">
              ← Back to the list
            </Link>
          </div>
        </form>
        <ul className="comment-list">
          {comments.map((c) => (
            <li key={c._id} className="comment-item">
              <p className="comment-meta">
                <strong>{c.authorName}</strong>{' '}
                <span>{new Date(c.createdAt).toLocaleString()}</span>
              </p>
              <p>{c.content}</p>
              <button
                type="button"
                className="btn btn-link btn-sm comment-reply-btn"
                onClick={() => handleReplyTo(c.authorName)}
              >
                Reply
              </button>
            </li>
          ))}
          {comments.length === 0 && <p>No comments yet.</p>}
        </ul>
      </section>
      <p>
        <Link to="/" className="btn btn-secondary">
          ← Back to the list
        </Link>{' '}
          {isAdmin && (
          <>
            <Link to={`/articles/${article.slug}/edit`} className="btn btn-primary">
              Edit
            </Link>{' '}
            <button type="button" className="btn btn-danger" onClick={handleDelete}>
              Delete
            </button>
          </>
        )}
      </p>
       {!loadingAllArticles && article && (
          <RelatedArticles 
            currentArticle={article} 
            allArticles={allArticles} 
          />
        )}
    );
  </div>
)};
