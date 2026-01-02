import { useCallback, RefObject } from 'react';

interface TextToolbarProps {
  content: string;
  setContent: (content: string) => void;
  textAreaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export default function TextToolbar({ content, setContent, textAreaRef }: TextToolbarProps) {
  
  const wrapSelection = useCallback((prefix: string, suffix: string = prefix) => {
    const textarea = textAreaRef.current;
    if (!textarea) return;

    // Récupération des positions du curseur directement sur l'élément DOM
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const selectedText = content.slice(start, end);
    const before = content.slice(0, start);
    const after = content.slice(end);

    const newContent = before + prefix + selectedText + suffix + after;
    
    // Mise à jour de l'état
    setContent(newContent);

    // Repositionnement du curseur et focus
    // Le setTimeout permet d'attendre que React mette à jour le DOM
    setTimeout(() => {
      textarea.focus();
      // Si on a sélectionné du texte, on garde la sélection incluant les nouveaux symboles
      // Sinon, on place le curseur entre les deux symboles (ex: entre **)
      textarea.setSelectionRange(
        start + prefix.length,
        end + prefix.length
      );
    }, 0);
  }, [content, setContent, textAreaRef]);

  return (
    <div className="text-toolbar" style={{
      display: 'flex', gap: '8px', margin: '10px 0', padding: '8px',
      background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '8px'
    }}>
      <button type="button" onClick={() => wrapSelection('**')} title="Gras">𝐁</button>
      <button type="button" onClick={() => wrapSelection('*')} title="Italique"><i>I</i></button>
      <button type="button" onClick={() => wrapSelection('<u>', '</u>')} title="Souligné"><u>U</u></button>
      <button type="button" onClick={() => wrapSelection('`')} title="Code Inline">`</button>
      <button type="button" onClick={() => wrapSelection('### ', '')} title="Titre H3">H₃</button>
      <button type="button" onClick={() => wrapSelection('- ', '')} title="Liste à puces">•</button>
    </div>
  );
}