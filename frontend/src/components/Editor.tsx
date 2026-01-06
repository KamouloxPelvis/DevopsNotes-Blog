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
import styles from '../styles/Editor.module.css';

interface EditorProps {
  value: string;
  onChange: (html: string) => void;
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!editor) return null;

  // Gestion de l'upload d'image vers Cloudflare R2 via API
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file); // 'file' doit matcher le backend

  try {
    // Appel à /api/upload
    const res = await api.post('/upload', formData);
    
    // Si r2Service renvoie bien l'URL publique Cloudflare
    const r2Url = res.data.imageUrl; 
    
    console.log("Image insérée depuis R2 :", r2Url);
    editor?.chain().focus().setImage({ src: r2Url }).run();
  } catch (err) {
    console.error("Erreur de transfert vers R2");
  }
};

  return (
    <div className={styles.toolbar}>
      {/* Group 1: Style de texte */}
      <div className={styles.group}>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? styles.active : ''}
          title="Gras"
        >
          <b>G</b>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? styles.active : ''}
          title="Italique"
        >
          <i>I</i>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? styles.active : ''}
          title="Souligné"
        >
          <u>S</u>
        </button>
        <input
          type="color"
          onInput={(e) => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
          value={editor.getAttributes('textStyle').color || '#ffffff'}
          className={styles.colorPicker}
          title="Couleur du texte"
        />
      </div>

      <span className={styles.divider} />

      {/* Group 2: Titres */}
      <div className={styles.group}>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? styles.active : ''}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? styles.active : ''}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? styles.active : ''}
        >
          H3
        </button>
      </div>

      <span className={styles.divider} />

      {/* Group 3: Alignement */}
      <div className={styles.group}>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={editor.isActive({ textAlign: 'left' }) ? styles.active : ''}
        >
          ⬅
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={editor.isActive({ textAlign: 'center' }) ? styles.active : ''}
        >
          ↔
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={editor.isActive({ textAlign: 'right' }) ? styles.active : ''}
        >
          ➡
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={editor.isActive({ textAlign: 'justify' }) ? styles.active : ''}
        >
          ≡
        </button>
      </div>

      <span className={styles.divider} />

      {/* Group 4: Blocs & Médias */}
      <div className={styles.group}>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive('codeBlock') ? styles.active : ''}
        >
          Code
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Uploader une image vers R2"
        >
          🖼️ Image
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
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      ResizeImage.configure({
      // On peut ajouter des classes par défaut ici
    }),
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
    <div className={styles.editorWrapper}>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className={styles.editorContent} />
    </div>
  );
}