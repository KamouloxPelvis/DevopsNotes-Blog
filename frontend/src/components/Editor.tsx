import { useRef } from 'react'; 
import api from '../api/axios';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Image from '@tiptap/extension-image';  
import ResizeImage from 'tiptap-extension-resize-image';
import { useToast } from '../context/ToastContext';

// On n'importe plus le .module.css pour utiliser les classes globales du ArticleModPage.css

interface EditorProps {
  value: string;
  onChange: (html: string) => void;
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  if (!editor) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/upload', formData);
      const fileKey = res.data.imageUrl;
      const publicUrl = "https://resources.devopsnotes.org";
      const fullUrl = `${publicUrl}/${fileKey}`;
      
      editor?.chain().focus().setImage({ src: fullUrl }).run();
    } catch (err) {
      showToast("Erreur de transfert vers R2", 'error');
    }
  };

  return (
    <div className="text-toolbar">
      {/* Groupe 1 : Style */}
      <div className="toolbar-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`toolbar-btn ${editor.isActive('bold') ? 'active' : ''}`}
          title="Gras"
        >
          <b>G</b>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`toolbar-btn ${editor.isActive('italic') ? 'active' : ''}`}
          title="Italique"
        >
          <i>I</i>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`toolbar-btn ${editor.isActive('underline') ? 'active' : ''}`}
          title="Souligné"
        >
          <u>S</u>
        </button>
        <input
          type="color"
          onInput={(e) => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
          value={editor.getAttributes('textStyle').color || '#4f46e5'}
          className="toolbar-color-picker"
          title="Couleur du texte"
        />
      </div>

      <span className="toolbar-separator" />

      {/* Groupe 2 : Titres */}
      <div className="toolbar-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`toolbar-btn ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`toolbar-btn ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`toolbar-btn ${editor.isActive('heading', { level: 3 }) ? 'active' : ''}`}
        >
          H3
        </button>
      </div>

      <span className="toolbar-separator" />

      {/* Groupe 3 : Alignement */}
      <div className="toolbar-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`toolbar-btn ${editor.isActive({ textAlign: 'left' }) ? 'active' : ''}`}
        >
          ⬅
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`toolbar-btn ${editor.isActive({ textAlign: 'center' }) ? 'active' : ''}`}
        >
          ↔
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`toolbar-btn ${editor.isActive({ textAlign: 'right' }) ? 'active' : ''}`}
        >
          ➡
        </button>
      </div>

      <span className="toolbar-separator" />

      {/* Groupe 4 : Code & Image */}
      <div className="toolbar-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`toolbar-btn ${editor.isActive('codeBlock') ? 'active' : ''}`}
          title="Code Block"
        >
          Code
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="toolbar-btn"
          title="Uploader une image"
        >
          🖼️
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};

export default function TiptapEditor({ value, onChange }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Image.configure({
        HTMLAttributes: { class: 'editor-image' },
      }),
      ResizeImage,
      TextAlign.configure({
        types: ['heading', 'paragraph', 'image'],
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="editor-wrapper-v2">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="main-textarea-tiptap" />
    </div>
  );
}