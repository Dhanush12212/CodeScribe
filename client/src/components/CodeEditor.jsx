import { Editor } from '@monaco-editor/react';
import React, { useState, useRef, useEffect } from 'react';
import LanguageSelector from './LanguageSelector';
import { CODE_SNIPPETS } from '../constants';
import ActionPanel from "./ActionPanel";
import { socket } from '../socket/socket';
import { ChevronDown } from 'lucide-react';

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
  const [themeOpen, setThemeOpen] = useState(false);
  const editorRef = useRef(null);
  const themeRef = useRef(null);

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
    setThemeOpen(false);
  };

  const handleOnChange = (newCode) => {
    e.preventDefault
    setValue(newCode);
    socket.emit('updatedCode', { roomId, newCode });
  };

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };
 
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (themeRef.current && !themeRef.current.contains(event.target)) {
        setThemeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full flex flex-col md:flex-row gap-4 items-stretch">
      {/* Code Editor */}
      <div className="w-full lg:w-3/4 mt-3 mb-20 h-[60vh] md:h-[70vh] lg:h-[90vh]">
        <div className="flex gap-4 mb-2 items-center">
          <LanguageSelector language={language} onSelect={onSelectLanguage} />
 
          <div ref={themeRef} className="relative inline-block text-left">
            <button
              onClick={() => setThemeOpen(!themeOpen)}
              className="inline-flex justify-between items-center px-4 py-2 w-44 bg-gray-800 text-white rounded-md shadow hover:bg-gray-700 focus:outline-none"
            >
              {THEMES.find((t) => t.value === theme)?.label || 'Select Theme'}
              <ChevronDown
                className={`ml-2 h-4 w-4 transition-transform duration-200 ${themeOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {themeOpen && (
              <ul className="absolute mt-2 w-44 rounded-md shadow-lg bg-gray-900 ring-1 ring-black ring-opacity-5 z-10 max-h-60 overflow-y-auto animate-fadeIn">
                {THEMES.map((t) => (
                  <li
                    key={t.value}
                    onClick={() => onSelectTheme(t.value)}
                    className={`cursor-pointer px-1 py-2 text-sm md:text-base font-semibold transition-colors duration-150 ${
                      theme === t.value
                        ? 'bg-gray-800 text-blue-400'
                        : 'text-gray-200 hover:bg-gray-800 hover:text-blue-400'
                    }`}
                  >
                    {t.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
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

      {/* Action Panel */}
      <div className="w-full lg:w-1/2 h-screen md:h-[70vh] lg:h-[100vh] border-gray-700">
        <ActionPanel editorRef={editorRef} language={language} />
      </div>

 
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.15s ease-out;
        }
      `}</style>
    </div>
  );
}

export default CodeEditor;
