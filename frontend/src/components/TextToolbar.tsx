import { useCallback } from 'react';
import { 
  Bold, Italic, Underline, 
  AlignCenter, AlignJustify, AlignRight, 
  Heading3, List, Terminal 
} from 'lucide-react';

interface TextToolbarProps {
  content: string;
  setContent: (content: string) => void;
  textAreaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export default function TextToolbar({ content, setContent, textAreaRef }: TextToolbarProps) {
  
  const wrapSelection = useCallback((prefix: string, suffix: string = prefix) => {
    const textarea = textAreaRef.current;
    if (!textarea) return;

    const currentScrollPos = textarea.scrollTop;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.slice(start, end);
    const before = content.slice(0, start);
    const after = content.slice(end);

    setContent(before + prefix + selectedText + suffix + after);

    requestAnimationFrame(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.scrollTop = currentScrollPos;
    });
  }, [content, setContent, textAreaRef]);

  return (
    <div className="text-toolbar">
      <div className="toolbar-group">
        <button type="button" className="toolbar-btn" onClick={(e) => { e.preventDefault(); wrapSelection('**') }} title="Gras"><Bold size={18} /></button>
        <button type="button" className="toolbar-btn" onClick={(e) => { e.preventDefault(); wrapSelection('*') }} title="Italique"><Italic size={18} /></button>
        <button type="button" className="toolbar-btn" onClick={(e) => { e.preventDefault(); wrapSelection('<u>', '</u>') }} title="Souligné"><Underline size={18} /></button>
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        <button type="button" className="toolbar-btn" onClick={(e) => { e.preventDefault(); wrapSelection('<div align="center">\n', '\n</div>') }} title="Centrer"><AlignCenter size={18} /></button>
        <button type="button" className="toolbar-btn" onClick={(e) => { e.preventDefault(); wrapSelection('<div style="text-align: justify">\n', '\n</div>') }} title="Justifier"><AlignJustify size={18} /></button>
        <button type="button" className="toolbar-btn" onClick={(e) => { e.preventDefault(); wrapSelection('<div align="right">\n', '\n</div>') }} title="Aligner à droite"><AlignRight size={18} /></button>
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        <button type="button" className="toolbar-btn" onClick={() => wrapSelection('### ', '')} title="Titre H3"><Heading3 size={18} /></button>
        <button type="button" className="toolbar-btn" onClick={() => wrapSelection('- ', '')} title="Liste à puces"><List size={18} /></button>
        <button type="button" className="toolbar-btn" onClick={() => wrapSelection('```yaml\n', '\n```')} title="Code YAML"><Terminal size={18} /></button>
      </div>
    </div>
  );
}