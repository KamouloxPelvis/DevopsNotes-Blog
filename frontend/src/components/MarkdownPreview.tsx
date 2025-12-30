interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export default function MarkdownPreview({ content, className = '' }: MarkdownPreviewProps) {
  const renderMarkdown = (text: string) => {
    if (!text) return ''; // ✅ ANTI-CRASH
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code style="background:#f1f3f4;padding:2px 4px;border-radius:3px">$1</code>')
      .replace(/### (.*$)/gm, '<h3 style="color:#2c3e50;margin:15px 0 8px;font-size:1.3em">$1</h3>')
      .replace(/## (.*$)/gm, '<h2 style="color:#34495e;margin:20px 0 10px;font-size:1.5em">$1</h2>')
      .replace(/^[-*•] (.*$)/gm, '<li style="margin:5px 0;padding-left:20px">$1</li>')
      .replace(/<u>(.*?)<\/u>/g, '<u style="text-decoration:underline">$1</u>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>');
  };

  return (
    <div className={`markdown-preview ${className}`} style={{
      background: 'transparent', // ✅ FIX
      border: 'none', // ✅ FIX
      padding: '0', // ✅ FIX
      borderRadius: '0', // ✅ FIX
      minHeight: 'auto', // ✅ FIX
      margin: '0', // ✅ FIX
      lineHeight: 1.4,
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
    </div>
  );
}
