
import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  value, 
  onChange, 
  language = 'javascript', 
  height = '300px' 
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstance = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (editorRef.current) {
      editorInstance.current = monaco.editor.create(editorRef.current, {
        value,
        language,
        theme: 'vs-dark',
        fontSize: 14,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
      });

      editorInstance.current.onDidChangeModelContent(() => {
        if (editorInstance.current) {
          onChange(editorInstance.current.getValue());
        }
      });
    }

    return () => {
      if (editorInstance.current) {
        editorInstance.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (editorInstance.current && editorInstance.current.getValue() !== value) {
      editorInstance.current.setValue(value);
    }
  }, [value]);

  return <div ref={editorRef} style={{ height }} className="border rounded-md" />;
};

export default CodeEditor;
