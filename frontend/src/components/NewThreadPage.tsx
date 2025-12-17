// frontend/src/pages/NewThreadPage.tsx
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createThread } from '../api/forum';

export default function NewThreadPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const tagsArray =
        tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean) || [];
      await createThread({ title, content, tags: tagsArray });
      navigate('/forum');
    } catch (err: any) {
      setError(err.message || 'Failed to create thread');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-card">
      <h1>New thread</h1>
      <form className="form-vertical" onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}

        <label>
          Title
          <input
            type="text"
            placeholder="Ex: Problèmes de build Docker en CI GitLab"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>

        <label>
          Content
          <textarea
            placeholder="Décris ton contexte, ta stack (Dockerfile, GitLab CI, runners, etc.)…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            required
          />
        </label>

        <label>
          Tags (comma separated)
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="devops,docker,terraform"
          />
        </label>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating...' : 'Create thread'}
        </button>
      </form>
    </div>
  );
}

