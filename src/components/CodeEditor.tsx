
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
    if (editorRef.current && !editorInstance.current) {
      // Configure Monaco Editor worker
      self.MonacoEnvironment = {
        getWorkerUrl: function (moduleId, label) {
          if (label === 'json') {
            return './monaco-editor/esm/vs/language/json/json.worker.js';
          }
          if (label === 'css' || label === 'scss' || label === 'less') {
            return './monaco-editor/esm/vs/language/css/css.worker.js';
          }
          if (label === 'html' || label === 'handlebars' || label === 'razor') {
            return './monaco-editor/esm/vs/language/html/html.worker.js';
          }
          if (label === 'typescript' || label === 'javascript') {
            return './monaco-editor/esm/vs/language/typescript/ts.worker.js';
          }
          return './monaco-editor/esm/vs/editor/editor.worker.js';
        }
      };

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
        editorInstance.current = null;
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
