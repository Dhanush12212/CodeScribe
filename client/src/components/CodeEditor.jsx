import { Editor } from "@monaco-editor/react";
import React, { useState, useRef, useEffect, useCallback } from "react";
import LanguageSelector from "./LanguageSelector";
import { CODE_SNIPPETS, LANGUAGE_IDS } from "../constants";
import { socket } from "../socket/socket";
import { ChevronDown } from "lucide-react";
import ActionView from "../pages/ActionView";
import axios from "axios";
import { API_URL } from "../../config";

const THEMES = [
  { label: "Dark", value: "vs-dark" },
  { label: "Light", value: "light" },
  { label: "High Contrast Dark", value: "hc-black" },
  { label: "High Contrast Light", value: "hc-light" },
  { label: "Monokai", value: "monokai" },
];

function CodeEditor({ roomId }) {
  const [language, setLanguage] = useState("java");
  const [languageId, setLanguageId] = useState(LANGUAGE_IDS["java"]);
  const [theme, setTheme] = useState("vs-dark");
  const [themeOpen, setThemeOpen] = useState(false);
  const [isDebugging, setIsDebugging] = useState(false);

  const editorRef = useRef(null);
  const themeRef = useRef(null);
  const senderId = useRef(Date.now() + Math.random());
  const latestCodeRef = useRef("");
  const isRemoteUpdate = useRef(false);  
 
  const handleDebug = async () => {
    const currentCode = editorRef.current?.getValue();
    if (!currentCode?.trim()) return alert("No code to debug!");
    setIsDebugging(true);

    try {
      const response = await axios.post(`${API_URL}/codeAssistant/debug`, {
        code: currentCode,
        language,
        },
        { withCredentials: true }
      );

      const { debuggedCode } = response.data;
      if (response.status === 200 && debuggedCode) {
        editorRef.current.setValue(debuggedCode);
      } else {
        alert("Debugging failed. No valid response from AI.");
      }
    } catch (error) {
      console.error("Error while debugging:", error);
      alert("Something went wrong while debugging. Please try again.");
    } finally {
      setIsDebugging(false);
    }
  };
 
  useEffect(() => {
    if (!roomId) return;

    if (!socket.connected) socket.connect();
 
    socket.once("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit("joinRoom", roomId);
    });

    const localSenderId = senderId.current;
 
    socket.on("languageChange", ({ roomId: updatedRoomId, language }) => {
      if (updatedRoomId === roomId) {
        setLanguage(language);
        const newCode = CODE_SNIPPETS[language];
        editorRef.current?.setValue(newCode);
        latestCodeRef.current = newCode;
      }
    });
 
    socket.on("updatedCode", ({ roomId: updatedRoomId, code, senderId: remoteId }) => {
      if (
        updatedRoomId === roomId &&
        remoteId !== localSenderId &&
        code !== latestCodeRef.current
      ) {
        const editor = editorRef.current;
        if (!editor) return; 
        const cursor = editor.getPosition();
        isRemoteUpdate.current = true;   
        latestCodeRef.current = code;
        editor.setValue(code);
        if (cursor) editor.setPosition(cursor); 
        setTimeout(() => {
          isRemoteUpdate.current = false;
        }, 50);
      }
    });

    return () => {
      socket.off("languageChange");
      socket.off("updatedCode"); 
    };
  }, [roomId]);

 
  const handleOnChange = useCallback(
    (newCode) => {
      if (!newCode || isRemoteUpdate.current) return;
      latestCodeRef.current = newCode;
      socket.emit("updatedCode", {
        roomId,
        code: newCode,
        senderId: senderId.current,
      });
    },
    [roomId]
  ); 
  

  const onSelectLanguage = (selectedLanguage, id) => {
    setLanguage(selectedLanguage);
    setLanguageId(id);
    const newCode = CODE_SNIPPETS[selectedLanguage];
    editorRef.current?.setValue(newCode);
    socket.emit("languageChange", { roomId, selectedLanguage });
  };
 
  const onSelectTheme = (selectedTheme) => {
    setTheme(selectedTheme);
    setThemeOpen(false);
  };
 
  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
    const initialCode = CODE_SNIPPETS[language];
    editor.setValue(initialCode);
    latestCodeRef.current = initialCode;
  };
 
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (themeRef.current && !themeRef.current.contains(event.target)) {
        setThemeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full flex flex-col custom-xl:flex-row gap-4 items-stretch transition-all duration-300">
      <div className="w-full custom-xl:w-3/4 mt-3 mb-20 h-[60vh] md:h-[70vh] custom-xl:h-[90vh] bg-gray-900 rounded-lg">
        <div className="flex gap-4 mb-2 items-center p-2">
          <LanguageSelector language={language} onSelect={onSelectLanguage} />

          <div ref={themeRef} className="relative inline-block text-left">
            <button
              onClick={() => setThemeOpen(!themeOpen)}
              className="inline-flex justify-between items-center px-4 py-2 w-44 bg-gray-800 text-white rounded-md shadow hover:bg-gray-700 focus:outline-none"
            >
              {THEMES.find((t) => t.value === theme)?.label || "Select Theme"}
              <ChevronDown
                className={`ml-2 h-4 w-4 transition-transform duration-200 ${
                  themeOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {themeOpen && (
              <ul className="absolute mt-2 w-44 rounded-md shadow-lg bg-gray-900 ring-1 ring-black ring-opacity-5 z-10 max-h-60 overflow-y-auto animate-fadeIn">
                {THEMES.map((t) => (
                  <li
                    key={t.value}
                    onClick={() => onSelectTheme(t.value)}
                    className={`cursor-pointer px-2 py-2 text-sm md:text-base font-medium transition-colors duration-150 ${
                      theme === t.value
                        ? "bg-gray-800 text-blue-400"
                        : "text-gray-200 hover:bg-gray-800 hover:text-blue-400"
                    }`}
                  >
                    {t.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            onClick={handleDebug}
            disabled={isDebugging}
            className={`ml-auto text-white px-4 py-2 rounded-md transition-all duration-200 ${
              isDebugging
                ? "bg-gray-700 cursor-not-allowed"
                : "bg-gray-800 hover:bg-blue-700"
            }`}
          >
            {isDebugging ? "Debugging..." : "Debug"}
          </button>
        </div>

        <Editor
          options={{ minimap: { enabled: false } }}
          height="100%"
          theme={theme}
          language={language}
          onMount={onMount}
          onChange={handleOnChange}
        />
      </div>

      <div className="w-full custom-xl:w-1/2 h-[70vh] custom-xl:h-[90vh] bg-gray-900 rounded-lg">
        <ActionView editorRef={editorRef} language={language} languageId={languageId} />
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.15s ease-out; }
        @media (min-width: 1200px) {
          .custom-xl\\:flex-row { flex-direction: row !important; }
          .custom-xl\\:w-3\\/4 { width: 75% !important; }
          .custom-xl\\:w-1\\/2 { width: 50% !important; }
          .custom-xl\\:h-\\[90vh\\] { height: 90vh !important; }
        }
      `}</style>
    </div>
  );
}

export default CodeEditor;
