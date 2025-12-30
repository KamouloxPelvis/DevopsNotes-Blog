// frontend/src/pages/EditThreadPage.tsx
import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAuthToken } from '../api/auth';
import { updateThread, getThread } from '../api/forum';
import TextToolbar from '../components/TextToolbar';
import MarkdownPreview from '../components/MarkdownPreview';

type RouteParams = {
  id: string;
};

export default function EditThreadPage() {
  const { id } = useParams<RouteParams>();
  const navigate = useNavigate();
  const token = getAuthToken();

  // States identiques NewThreadPage + cursor
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Cursor states
  const [cursorStart, setCursorStart] = useState(0);
  const [cursorEnd, setCursorEnd] = useState(0);

  // Load thread
  useEffect(() => {
  if (!id) return;
  
  getThread(id)
    .then((data) => {
      setTitle(data.title);
      setContent(data.content);
      setTags(data.tags?.join(', ') || '');
    })
    .catch((err: any) => setError(err.message))
    .finally(() => setLoading(false));
}, [id]);

  const handleTagsChange = (value: string) => {
    setTags(value);
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setUpdating(true);

    try {
      const tagsArray = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await updateThread(id!, { title, content, tags: tagsArray }, token || undefined);
      navigate('/forum');
    } catch (err: any) {
      setError(err.message || 'Failed to update thread');
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <div className="page-card">Loading...</div>;
  if (error) return <div className="page-card"><p className="error">{error}</p></div>;

  return (
    <div className="page-card">
      <h1>Edit thread</h1>
      <form className="form-vertical" onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}

        <label>
          Title
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>

        <label>
          Content
          <textarea
            value={content}
            rows={8}
            onChange={(e) => {
              setContent(e.target.value);
              setCursorStart(e.target.selectionStart || 0);
              setCursorEnd(e.target.selectionEnd || 0);
            }}
            onSelect={(e) => {
              setCursorStart(e.currentTarget.selectionStart || 0);
              setCursorEnd(e.currentTarget.selectionEnd || 0);
            }}
            required
          />
        </label>

        {/* Toolbar + Preview */}
        <div style={{ margin: '10px 0' }}>
          <TextToolbar 
            content={content} 
            setContent={setContent}
            cursorStart={cursorStart}
            cursorEnd={cursorEnd}
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label>Preview</label>
          <MarkdownPreview content={content} />
        </div>

        <label>
          Tags (comma separated)
          <input
            type="text"
            value={tags}
            onChange={(e) => handleTagsChange(e.target.value)}
            placeholder="devops,docker,terraform"
          />
        </label>

        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={updating}
        >
          {updating ? 'Updating...' : 'Update thread'}
        </button>
      </form>
    </div>
  );
}
