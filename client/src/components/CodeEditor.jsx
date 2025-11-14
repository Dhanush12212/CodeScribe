import React, { useState, useRef, useEffect, useCallback } from "react";
import { Editor } from "@monaco-editor/react";
import LanguageSelector from "./LanguageSelector";
import { CODE_SNIPPETS, LANGUAGE_IDS } from "../constants";
import { socket } from "../socket/socket";
import { ChevronDown } from "lucide-react";
import ActionView from "../pages/ActionView";
import axios from "axios";
import { API_URL } from "../../config";
import AIPromptModal from "./Actions/AIPromptModel";

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
  const [promptShow, setPromptShow] = useState(false);
  const [AIPrompt, setAIPrompt] = useState("");
  const [fontSize, setFontSize] = useState(() => {
    if (window.innerWidth >= 1024) return 16;
    if (window.innerWidth >= 768) return 14;
    return 12;
  });

  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const themeRef = useRef(null);
  const senderId = useRef(Date.now() + Math.random());
  const latestCodeRef = useRef("");
  const isRemoteUpdate = useRef(false);

  // ----------------------
  // Helper: Apply flexible line-by-line diffs
  // ----------------------
  const applyLineByLineUpdate = (editor, monaco, newCode) => {
    if (!editor || !monaco) return;
    const model = editor.getModel();
    if (!model) return;

    const oldCode = model.getValue();
    if (oldCode === newCode) return;

    const oldLines = oldCode.split("\n");
    const newLines = newCode.split("\n");
    const edits = [];

    const maxLines = Math.max(oldLines.length, newLines.length);

    // Build edits in contiguous chunks where lines differ — this is more resilient
    let i = 0;
    while (i < maxLines) {
      const oldLine = oldLines[i] ?? null;
      const newLine = newLines[i] ?? null;

      if (oldLine === newLine) {
        i++;
        continue;
      }

      // start of difference chunk
      let j = i + 1;
      while (j < maxLines) {
        const o = oldLines[j] ?? null;
        const n = newLines[j] ?? null;
        if (o === n) break;
        j++;
      }

      // compute range to replace in editor (lines i .. j-1)
      const startLineNumber = i + 1;

      // determine endLineNumber & endColumn (if line exists in oldLines)
      let endLineNumber = Math.min(j, oldLines.length);
      let endColumn = 1;
      if (endLineNumber > 0 && endLineNumber <= oldLines.length) {
        endColumn = oldLines[endLineNumber - 1]?.length + 1 || 1;
      } else {
        // insertion at end — place end at startLineNumber
        endLineNumber = startLineNumber;
        endColumn = 1;
      }

      // text to insert
      const replacementText = newLines.slice(i, j).join("\n");

      edits.push({
        range: new monaco.Range(startLineNumber, 1, endLineNumber, endColumn),
        text: replacementText,
      });

      i = j;
    }

    if (edits.length > 0) {
      editor.executeEdits("remote-update", edits);
    }
  };

  // ----------------------
  // Debug Function
  // ----------------------
  const handleDebug = async () => {
    const currentCode = editorRef.current?.getValue();
    if (!currentCode?.trim()) return alert("No code to debug!");
    setIsDebugging(true);

    try {
      const response = await axios.post(
        `${API_URL}/codeAssistant/debug`,
        { code: currentCode, language },
        { withCredentials: true }
      );

      const { debuggedCode } = response.data;
      if (response.status === 200 && debuggedCode) {
        // Apply line-by-line update from AI
        isRemoteUpdate.current = true;
        applyLineByLineUpdate(editorRef.current, monacoRef.current, debuggedCode);
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
    }
  };

  // ----------------------
  // Socket Setup
  // ----------------------
  useEffect(() => {
    if (!roomId) return;
    if (!socket.connected) socket.connect();

    socket.once("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit("joinRoom", roomId);
    });

    const localSenderId = senderId.current;

    // Language change from remote
    socket.on("languageChange", ({ roomId: updatedRoomId, language: newLang }) => {
      if (updatedRoomId === roomId) {
        setLanguage(newLang);
        const newCode = CODE_SNIPPETS[newLang];
        if (editorRef.current) {
          isRemoteUpdate.current = true;
          editorRef.current.setValue(newCode);
          latestCodeRef.current = newCode;
          setTimeout(() => (isRemoteUpdate.current = false), 100);
        }
      }
    });

    // Updated code from remote
    socket.on("updatedCode", ({ roomId: updatedRoomId, code, senderId: remoteId }) => {
      if (updatedRoomId === roomId && remoteId !== localSenderId && code !== latestCodeRef.current) {
        const editor = editorRef.current;
        const monaco = monacoRef.current;
        if (!editor || !monaco) return;

        // preserve cursor
        const cursor = editor.getPosition();
        isRemoteUpdate.current = true;
        latestCodeRef.current = code;

        // apply flexible line-by-line update
        applyLineByLineUpdate(editor, monaco, code);

        // format to keep structure similar for everyone
        try {
          editor.getAction("editor.action.formatDocument").run();
        } catch (e) {
          // formatting might fail for unsupported languages or if formatter is not available
        }

        if (cursor) editor.setPosition(cursor);
        setTimeout(() => (isRemoteUpdate.current = false), 100);
      }
    });

    return () => {
      socket.off("languageChange");
      socket.off("updatedCode");
    };
  }, [roomId]);

  // ----------------------
  // Editor Change Handler
  // ----------------------
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

  // ----------------------
  // Language & Theme
  // ----------------------
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

    // emit structured payload that the backend/other clients can understand
    socket.emit("languageChange", { roomId, language: selectedLanguage, senderId: senderId.current });
  };

  const onSelectTheme = (selectedTheme) => {
    setTheme(selectedTheme);
    setThemeOpen(false);
  };

  // ----------------------
  // Resize Handler
  // ----------------------
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setFontSize(16);
      else if (window.innerWidth >= 768) setFontSize(14);
      else setFontSize(12);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ----------------------
  // Editor Mount
  // ----------------------
  const onMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    editor.focus();
    const initialCode = CODE_SNIPPETS[language] ?? "";
    editor.setValue(initialCode);
    latestCodeRef.current = initialCode;
  };

  // ----------------------
  // Theme Dropdown Close
  // ----------------------
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (themeRef.current && !themeRef.current.contains(event.target)) {
        setThemeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ----------------------
  // Keyboard Shortcut
  // ----------------------
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

  // ----------------------
  // AI Code Edit
  // ----------------------
  const handleAICodeEdit = async () => {
    setPromptShow(false);

    try {
      const editor = editorRef.current;
      const monaco = monacoRef.current;
      if (!editor || !monaco) return alert("Editor not initialized yet.");
      const currentCode = editor.getValue();
      if (!currentCode?.trim()) return alert("No code found in editor.");

      const res = await axios.post(
        `${API_URL}/codeAssistant/AIPrompt`,
        { prompt: AIPrompt, code: currentCode },
        { withCredentials: true }
      );

      const updatedCode = res?.data?.updatedCode ?? currentCode;
      console.log("AI Code Received:", updatedCode?.slice(0, 100));

      isRemoteUpdate.current = true;

      // Safely apply flexible line-by-line updates
      applyLineByLineUpdate(editor, monaco, updatedCode);

      try {
        editor.getAction("editor.action.formatDocument").run();
      } catch (e) {
        // ignore formatting errors
      }

      latestCodeRef.current = updatedCode;

      // Broadcast the change to others
      socket.emit("updatedCode", {
        roomId,
        code: updatedCode,
        senderId: senderId.current,
      });

      setTimeout(() => {
        isRemoteUpdate.current = false;
      }, 100);

      console.log("AI Updated Code Applied Successfully!");
    } catch (error) {
      console.error("AI Code Update Error:", error.message || error);
      alert("AI Code update failed. Please try again.");
    }
  };

  return (
    <div className="w-full flex flex-col custom-xl:flex-row gap-4 items-stretch transition-all duration-300">
      <div className="w-full custom-xl:w-3/4 mt-3 mb-20 h-[60vh] md:h-[70vh] custom-xl:h-[90vh] bg-gray-900 rounded-lg">
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
