import { useEffect, useRef } from 'react';
import EditorJS, { OutputData } from '@editorjs/editorjs';
import ImageTool from '@editorjs/image';

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
          image: {
            class: ImageTool,
            config: {
              endpoints: {
                byFile: `${process.env.REACT_APP_API_URL}/upload`, // Ton API qui envoie vers R2
              }
            }
          }
        },
      });
    }
    return () => {
      ejInstance.current?.destroy();
      ejInstance.current = null;
    };
  }, [initialData, onChange]);

  return <div id="editorjs" style={{ border: '1px solid #ccc', minHeight: '300px' }} />;
}