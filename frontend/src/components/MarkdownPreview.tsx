import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export default function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
  return (
    <div className={`markdown-preview-container ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]} // <--- Permet d'interpréter le HTML (centrage, etc.)
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
      
      <style>{`
        .markdown-preview-container {
          white-space: pre-wrap; /* Respecte les sauts de ligne simples */
          word-break: break-word;
          line-height: 1.6;
        }
        /* Style pour les divs de formatage injectées via les boutons */
        .markdown-preview-container div[align="center"] { text-align: center; }
        .markdown-preview-container div[align="right"] { text-align: right; }
        .markdown-preview-container div[style*="text-align: justify"] { text-align: justify; }
      `}</style>
    </div>
  );
}