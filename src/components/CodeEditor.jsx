import Editor from '@monaco-editor/react';
import { useState, useRef } from 'react';

export default function CodeEditor({ language, value, onChange, theme = 'vs-dark' }) {
  const editorRef = useRef(null);
  const [isEditorReady, setIsEditorReady] = useState(false);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    setIsEditorReady(true);

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      console.log('Save shortcut triggered');
    });
  };

  const editorOptions = {
    fontSize: 14,
    fontFamily: 'Consolas, "Courier New", monospace',
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    wordWrap: 'on',
    lineNumbers: 'on',
    renderWhitespace: 'selection',
    bracketPairColorization: {
      enabled: true
    },
    suggestOnTriggerCharacters: true,
    quickSuggestions: true,
    formatOnPaste: true,
    formatOnType: true
  };

  return (
    <div className="monaco-editor-wrapper">
      {!isEditorReady && (
        <div className="editor-loading">Loading editor...</div>
      )}
      <Editor
        height="100%"
        language={language}
        value={value}
        onChange={onChange}
        theme={theme}
        options={editorOptions}
        onMount={handleEditorDidMount}
      />
    </div>
  );
}
