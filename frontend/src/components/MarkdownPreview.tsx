import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import '../styles/MarkdownPreview.css';

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
          line-height: 1.5;
        }
        .markdown-preview-container p {
          margin-bottom: 0.8rem; /* Réduit l'espace après chaque paragraphe */
          margin-top: 0;
        }
        .markdown-preview-container h1, 
        .markdown-preview-container h2, 
        .markdown-preview-container h3 {
          margin-top: 1.5rem;   /* Garde un espace sain avant les titres */
          margin-bottom: 0.5rem; /* Réduit l'espace après les titres */
        }
        /* Style pour les divs de formatage injectées via les boutons */
        .markdown-preview-container div[align="center"] { text-align: center; }
        .markdown-preview-container div[align="right"] { text-align: right; }
        .markdown-preview-container div[style*="text-align: justify"] { text-align: justify; }
      `}</style>
    </div>
  );
}