import { useCallback } from 'react';

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
      textarea.focus();
      // On place le curseur de manière intelligente selon qu'il y a une sélection ou non
      const newCursorPos = start + prefix.length + (selectedText.length > 0 ? selectedText.length : 0);
      textarea.setSelectionRange(
        start + prefix.length,
        newCursorPos
      );
    }, 0);
  }, [content, setContent, textAreaRef]);

  return (
    <div className="text-toolbar" style={{
      display: 'flex', gap: '8px', margin: '10px 0', padding: '8px',
      background: '#2d2d2d', border: '1px solid #444', borderRadius: '8px',
      flexWrap: 'wrap'
    }}>
      {/* Formatage de texte */}
      <button type="button" style={btnStyle} onClick={() => wrapSelection('**')} title="Gras">𝐁</button>
      <button type="button" style={btnStyle} onClick={() => wrapSelection('*')} title="Italique"><i>I</i></button>
      <button type="button" style={btnStyle} onClick={() => wrapSelection('<u>', '</u>')} title="Souligné"><u>U</u></button>
      
      <div style={separatorStyle} />

      {/* Alignement (HTML requis pour le Markdown) */}
      <button type="button" style={btnStyle} onClick={() => wrapSelection('<div align="center">\n', '\n</div>')} title="Centrer">Align Center</button>
      <button type="button" style={btnStyle} onClick={() => wrapSelection('<div style="text-align: justify">\n', '\n</div>')} title="Justifier">Justify</button>
      <button type="button" style={btnStyle} onClick={() => wrapSelection('<div align="right">\n', '\n</div>')} title="Aligner à droite">Align Right</button>

      <div style={separatorStyle} />

      {/* Blocs et listes */}
      <button type="button" style={btnStyle} onClick={() => wrapSelection('### ', '')} title="Titre H3">H₃</button>
      <button type="button" style={btnStyle} onClick={() => wrapSelection('- ', '')} title="Liste à puces">•</button>
      <button type="button" style={btnStyle} onClick={() => wrapSelection('```yaml\n', '\n```')} title="Code YAML">YAML</button>
    </div>
  );
}

// Quelques styles rapides pour l'interface
const btnStyle = {
  padding: '4px 10px',
  background: '#3d3d3d',
  color: 'white',
  border: '1px solid #555',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '13px'
};

const separatorStyle = {
  width: '1px',
  height: '20px',
  background: '#555',
  margin: '0 4px'
};