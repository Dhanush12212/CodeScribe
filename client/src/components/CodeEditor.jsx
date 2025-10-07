import { Editor } from '@monaco-editor/react';
import React, { useState, useRef, useEffect } from 'react';
import LanguageSelector from './LanguageSelector';
import { CODE_SNIPPETS } from '../constants';
import Output from './Output';
import { socket } from '../socket/socket';

const THEMES = [
  { label: "Dark", value: "vs-dark" },
  { label: "Light", value: "light" },
  { label: "High Contrast Dark", value: "hc-black" },
  { label: "High Contrast Light", value: "hc-light" },
  { label: "Monokai", value: "monokai" }, 
];

function CodeEditor({ roomId }) {
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('vs-dark');
  const [value, setValue] = useState(CODE_SNIPPETS['javascript']);
  const editorRef = useRef(null);

  useEffect(() => {
    socket.connect();
    socket.emit('joinRoom', roomId);

    socket.on('languageChange', ({ roomId: updatedRoomId, language }) => {
      if (updatedRoomId === roomId) {
        setLanguage(language);
        setValue(CODE_SNIPPETS[language]);
      }
    });

    socket.on('updatedCode', ({ roomId: updatedRoomId, code }) => {
      if (updatedRoomId === roomId && code !== value) {
        setValue(code);
      }
    });

    return () => {
      socket.off('languageChange');
      socket.off('updatedCode');
    };
  }, [roomId, value]);

  const onSelectLanguage = (selectedLanguage) => {
    setLanguage(selectedLanguage);
    setValue(CODE_SNIPPETS[selectedLanguage]);
    socket.emit('languageChange', { roomId, selectedLanguage });
  };

  const onSelectTheme = (selectedTheme) => {
    setTheme(selectedTheme);
  };

  const handleOnChange = (newCode) => {
    setValue(newCode);
    socket.emit('updatedCode', { roomId, newCode });
  };

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  return (
    <div className="w-full flex flex-col md:flex-row gap-4 items-stretch">
      
      {/* Code Editor */}
      <div className="w-full lg:w-3/4 mt-3 mb-20 h-[60vh] md:h-[70vh] lg:h-[90vh]">
        <div className="flex gap-4 mb-2">
          <LanguageSelector language={language} onSelect={onSelectLanguage} />

          {/* Theme Selector Dropdown */}
          <select
            value={theme}
            onChange={(e) => onSelectTheme(e.target.value)}
            className="bg-gray-800 text-white text-sm px-2 py-1 rounded-lg border-gray-600 focus:outline-none hover:bg-gray-700 transition-colors duration-200 shadow-sm w-36 h-10 mt-9"
          >
            {THEMES.map((t) => (
              <option key={t.value} value={t.value} className="bg-gray-800 text-white">
                {t.label}
              </option>
            ))}
          </select>

        </div>

        <Editor
          options={{ minimap: { enabled: false } }}
          height="100%"
          theme={theme}
          value={value}
          language={language}
          onMount={onMount}
          onChange={handleOnChange}
        />
      </div>
      
      {/* Output Panel */}
      <div className="w-full lg:w-1/2 h-screen md:h-[70vh] lg:h-[100vh] border-gray-700">
        <Output editorRef={editorRef} language={language} />
      </div>
    </div>
  );
}

export default CodeEditor;
