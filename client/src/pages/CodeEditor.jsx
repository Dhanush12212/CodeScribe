import React, { useState, useRef, useEffect, useCallback } from "react";
import { Editor } from "@monaco-editor/react";
import LanguageSelector from "../components/UI/LanguageSelector";
import { CODE_SNIPPETS, LANGUAGE_IDS, THEMES } from "../constants";
import { socket } from "../socket/socket";
import { ChevronDown } from "lucide-react";
import ActionView from "./ActionView";
import axios from "axios";
import { API_URL } from "../../config";
import AIPromptModal from "../components/UI/AIPromptModel";

function CodeEditor({ roomId }) {
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("java");
  const [languageId, setLanguageId] = useState(LANGUAGE_IDS["java"]);
  const [theme, setTheme] = useState("vs-dark");
  const [themeOpen, setThemeOpen] = useState(false);
  const [isDebugging, setIsDebugging] = useState(false);
  const [promptShow, setPromptShow] = useState(false);
  const [AIPrompt, setAIPrompt] = useState("");
  const [fontSize, setFontSize] = useState(() => {
    if (window.innerWidth >= 1024) return 15;
    if (window.innerWidth >= 768) return 14;
    return 12;
  });

  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const themeRef = useRef(null);
  const senderId = useRef(Date.now() + Math.random());
  const latestCodeRef = useRef("");
  const isRemoteUpdate = useRef(false);

  const handleDebug = async () => {
    const currentCode = editorRef.current?.getValue();
    if (!currentCode?.trim()) return alert("No code to debug!");
    setIsDebugging(true);

    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/codeAssistant/debug`,
        { code: currentCode, language },
        { withCredentials: true }
      );

      const { debuggedCode } = response.data;

      if (response.status === 200 && debuggedCode) {
        isRemoteUpdate.current = true;
        editorRef.current.setValue(debuggedCode);   
        latestCodeRef.current = debuggedCode;
        setTimeout(() => (isRemoteUpdate.current = false), 100);
      } else {
        alert("Debugging failed. No valid response from AI.");
      }
    } catch (error) {
      console.error("Error while debugging:", error);
      alert("Something went wrong while debugging. Please try again.");
    } finally {
      setIsDebugging(false);
      setLoading(false);
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

    socket.on("languageChange", ({ roomId: updatedRoomId, language: newLang }) => {
      if (updatedRoomId === roomId) {
        setLanguage(newLang);
        setLanguageId(LANGUAGE_IDS[newLang]);
        const newCode = CODE_SNIPPETS[newLang];

        if (editorRef.current) {
          isRemoteUpdate.current = true;
          editorRef.current.setValue(newCode); 
          latestCodeRef.current = newCode;
          setTimeout(() => (isRemoteUpdate.current = false), 100);
        }
      }
    });

    socket.on("updatedCode", ({ roomId: updatedRoomId, code, senderId: remoteId }) => {
      if (updatedRoomId === roomId && remoteId !== localSenderId && code !== latestCodeRef.current) {
        const editor = editorRef.current;
        if (!editor) return;

        const cursor = editor.getPosition();
        isRemoteUpdate.current = true;

        latestCodeRef.current = code;
        editor.setValue(code); 

        try {
          editor.getAction("editor.action.formatDocument").run();
        } catch (e) {}

        if (cursor) editor.setPosition(cursor);
        setTimeout(() => (isRemoteUpdate.current = false), 100);
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

    if (editorRef.current) {
      isRemoteUpdate.current = true;
      editorRef.current.setValue(newCode);
      latestCodeRef.current = newCode;
      setTimeout(() => (isRemoteUpdate.current = false), 100);
    }

    socket.emit("languageChange", { roomId, language: selectedLanguage, senderId: senderId.current });
  };

  const onSelectTheme = (selectedTheme) => {
    setTheme(selectedTheme);
    setThemeOpen(false);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setFontSize(16);
      else if (window.innerWidth >= 768) setFontSize(14);
      else setFontSize(12);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const onMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    editor.focus();
    const initialCode = CODE_SNIPPETS[language] ?? "";
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.shiftKey && e.ctrlKey && (e.key === "S" || e.key === "s")) {
        e.preventDefault();
        setPromptShow(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleAICodeEdit = async () => {
    setPromptShow(false);

    try {
      setLoading(true);
      const editor = editorRef.current;
      if (!editor) return alert("Editor not initialized yet.");

      const currentCode = editor.getValue();
      if (!currentCode?.trim()) return alert("No code found in editor.");

      const res = await axios.post(
        `${API_URL}/codeAssistant/AIPrompt`,
        { prompt: AIPrompt, code: currentCode },
        { withCredentials: true }
      );

      const updatedCode = res?.data?.updatedCode ?? currentCode;

      isRemoteUpdate.current = true;

      editor.setValue(updatedCode); 

      try {
        editor.getAction("editor.action.formatDocument").run();
      } catch (e) {}

      latestCodeRef.current = updatedCode;

      socket.emit("updatedCode", {
        roomId,
        code: updatedCode,
        senderId: senderId.current,
      });

      setTimeout(() => (isRemoteUpdate.current = false), 100);
      setLoading(false);
    } catch (error) {
      console.error("AI Code Update Error:", error.message || error);
      alert("AI Code update failed. Please try again.");
    }
  };

  return (
    <div className="w-full flex flex-col custom-xl:flex-row gap-4 items-stretch transition-all duration-300">
      <div className="relative w-full custom-xl:w-3/4 mt-3 mb-20 h-[60vh] md:h-[70vh] custom-xl:h-[90vh] bg-gray-900 rounded-lg">

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-50 text-white rounded-lg h-[98vh]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
            <span className="ml-3 text-lg">Modifying Code..</span>
          </div>
        )}
        
        <div className="flex gap-4 mb-2 items-center p-2">
          <LanguageSelector language={language} onSelect={onSelectLanguage} />

          {/* Theme Selector */}
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

          {/* Debug Button */}
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
          options={{
            minimap: { enabled: false },
            wordWrap: "on",
            fontSize: fontSize,
            scrollBeyondLastLine: false,
          }}
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

      {promptShow && (
        <AIPromptModal
          AIPrompt={AIPrompt}
          setAIPrompt={setAIPrompt}
          onCancel={() => setPromptShow(false)}
          onSubmit={handleAICodeEdit}
        />
      )}
      

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
