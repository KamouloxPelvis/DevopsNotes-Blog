import { useCallback } from 'react';

interface TextToolbarProps {
  content: string;
  setContent: (content: string) => void;
  cursorStart: number;
  cursorEnd: number;
}

export default function TextToolbar({ content, setContent, cursorStart, cursorEnd }: TextToolbarProps) {
  const wrapSelection = useCallback((prefix: string, suffix: string = prefix) => {
    const selectedText = content.slice(cursorStart, cursorEnd);
    const newContent = content.slice(0, cursorStart) + prefix + selectedText + suffix + content.slice(cursorEnd);
    setContent(newContent);
  }, [content, setContent, cursorStart, cursorEnd]);

  return (
    <div className="text-toolbar" style={{
      display: 'flex', gap: '8px', margin: '10px 0', padding: '8px',
      background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '8px'
    }}>
      <button type="button" onClick={() => wrapSelection('**')} title="Bold">𝐁</button>
      <button type="button" onClick={() => wrapSelection('*')} title="Italic">𝐼</button>
      <button type="button" onClick={() => wrapSelection('<u>', '</u>')} title="Underline">𝐔</button>
      <button type="button" onClick={() => wrapSelection('`')} title="Code">`{}</button>
      <button type="button" onClick={() => wrapSelection('### ')} title="H3">H₃</button>
      <button type="button" onClick={() => wrapSelection('- ')} title="List">•</button>
    </div>
  );
}
