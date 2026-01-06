import { useEffect, useRef } from 'react';
import EditorJS, { OutputData } from '@editorjs/editorjs';
import ImageTool from '@editorjs/image';
import Header from '@editorjs/header'; // Recommandé pour structurer les articles
import List from '@editorjs/list';    

interface EditorProps {
  initialData?: OutputData;
  onChange: (data: OutputData) => void;
}

export default function Editor({ initialData, onChange }: EditorProps) {
  const ejInstance = useRef<EditorJS | null>(null);

  useEffect(() => {
    if (!ejInstance.current) {
      ejInstance.current = new EditorJS({
        holder: 'editorjs',
        data: initialData,
        onChange: async () => {
          const content = await ejInstance.current?.save();
          if (content) onChange(content);
        },
        tools: {
          header: Header,
          list: List,
          image: {
            class: ImageTool as any,
            config: {
              endpoints: {
                // MISE À JOUR : On utilise la route spécifique Editor.js et le préfixe /api
                byFile: `${process.env.REACT_APP_API_URL}/upload-editorjs`, 
              },
              field: 'image', // Doit correspondre à multer côté backend
            }
          }
        },
      });
    }
    
    return () => {
      // On détruit l'instance proprement lors du démontage pour éviter les doublons
      if (ejInstance.current) {
        ejInstance.current.destroy();
        ejInstance.current = null;
      }
    };
    // On retire initialData et onChange des dépendances pour éviter les resets intempestifs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  return <div id="editorjs" style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', minHeight: '400px', backgroundColor: '#fff' }} />;
}