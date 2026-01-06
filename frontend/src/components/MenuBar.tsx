import React from 'react';
import { Editor } from '@tiptap/react';

interface MenuBarProps {
  editor: Editor | null;
}

export const MenuBar: React.FC<MenuBarProps> = ({ editor }) => {
  if (!editor) return null;

  // Configuration des boutons avec un typage strict
  const buttons = [
    { 
      label: 'Gras', 
      action: () => editor.chain().focus().toggleBold().run(), 
      isActive: editor.isActive('bold') 
    },
    { 
      label: 'Italique', 
      action: () => editor.chain().focus().toggleItalic().run(), 
      isActive: editor.isActive('italic') 
    },
    { 
      label: 'H1', 
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), 
      isActive: editor.isActive('heading', { level: 1 }) 
    },
  ];

  return (
    <div className="menu-bar" style={{ borderBottom: '1px solid #ccc', padding: '8px', gap: '8px', display: 'flex' }}>
      {buttons.map((btn, i) => (
        <button
          key={i}
          type="button"
          onClick={btn.action}
          style={{
            fontWeight: btn.isActive ? 'bold' : 'normal',
            backgroundColor: btn.isActive ? '#eee' : 'transparent',
            padding: '4px 8px',
            cursor: 'pointer'
          }}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
};