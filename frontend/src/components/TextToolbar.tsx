import { useCallback } from 'react';
import { 
  Bold, Italic, Underline, 
  AlignCenter, AlignJustify, AlignRight, 
  Heading3, List, Terminal 
} from 'lucide-react'; // Importation des icônes

interface TextToolbarProps {
  content: string;
  setContent: (content: string) => void;
  textAreaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export default function TextToolbar({ content, setContent, textAreaRef }: TextToolbarProps) {
  
  const wrapSelection = useCallback((prefix: string, suffix: string = prefix) => {
    const textarea = textAreaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const selectedText = content.slice(start, end);
    const before = content.slice(0, start);
    const after = content.slice(end);

    const newContent = before + prefix + selectedText + suffix + after;
    
    setContent(newContent);

    setTimeout(() => {
      if (textarea) {
        const scrollTop = textarea.scrollTop; // Sauvegarde la position du scroll
        textarea.focus();
        const newCursorPos = start + prefix.length + (selectedText.length > 0 ? selectedText.length : 0);
        textarea.setSelectionRange(start + prefix.length, newCursorPos);
        textarea.scrollTop = scrollTop; // Restaure le scroll
      }
    }, 0);
  }, [content, setContent, textAreaRef]);

  return (
    <div className="text-toolbar" style={toolbarStyle}>
      {/* Groupe : Style de texte */}
      <div style={groupStyle}>
        <button type="button" style={btnStyle} onClick={(e) => { e.preventDefault(); wrapSelection('**') }} title="Gras"><Bold size={18} /></button>
        <button type="button" style={btnStyle} onClick={(e) => { e.preventDefault(); wrapSelection('*') }} title="Italique"><Italic size={18} /></button>
        <button type="button" style={btnStyle} onClick={(e) => { e.preventDefault(); wrapSelection('<u>', '</u>') }} title="Souligné"><Underline size={18} /></button>
      </div>

      <div style={separatorStyle} />

      {/* Groupe : Alignement */}
      <div style={groupStyle}>
        <button type="button" style={btnStyle} onClick={(e) => { e.preventDefault(); wrapSelection('<div align="center">\n', '\n</div>') }} title="Centrer"><AlignCenter size={18} /></button>
        <button type="button" style={btnStyle} onClick={(e) => { e.preventDefault(); wrapSelection('<div style="text-align: justify">\n', '\n</div>') }} title="Justifier"><AlignJustify size={18} /></button>
        <button type="button" style={btnStyle} onClick={(e) => { e.preventDefault(); wrapSelection('<div align="right">\n', '\n</div>') }} title="Aligner à droite"><AlignRight size={18} /></button>
      </div>

      <div style={separatorStyle} />

      {/* Groupe : Structure */}
      <div style={groupStyle}>
        <button type="button" style={btnStyle} onClick={() => wrapSelection('### ', '')} title="Titre H3"><Heading3 size={18} /></button>
        <button type="button" style={btnStyle} onClick={() => wrapSelection('- ', '')} title="Liste à puces"><List size={18} /></button>
        <button type="button" style={btnStyle} onClick={() => wrapSelection('```yaml\n', '\n```')} title="Code YAML"><Terminal size={18} /></button>
      </div>
    </div>
  );
}

// Styles CSS-in-JS pour la cohérence
const toolbarStyle: React.CSSProperties = {
  display: 'flex', 
  gap: '4px', 
  margin: '10px 0', 
  padding: '6px',
  background: '#2d2d2d', 
  border: '1px solid #444', 
  borderRadius: '8px',
  alignItems: 'center',
  flexWrap: 'wrap'
};

const groupStyle: React.CSSProperties = {
  display: 'flex',
  gap: '4px'
};

const btnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '34px',
  height: '34px',
  background: 'transparent',
  color: '#e0e0e0',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'background 0.2s'
};

const separatorStyle: React.CSSProperties = {
  width: '1px',
  height: '24px',
  background: '#444',
  margin: '0 8px'
};