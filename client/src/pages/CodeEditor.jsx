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
import { Local, Session } from "../utils/storage";
import { useSearchParams, useNavigate } from "react-router-dom";

function CodeEditor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("java");
  const [languageId, setLanguageId] = useState(LANGUAGE_IDS["java"]);
  const [theme, setTheme] = useState(() => Local.get("editor-theme") || "vs-dark");
  const [themeOpen, setThemeOpen] = useState(false);
  const [isDebugging, setIsDebugging] = useState(false);
  const [promptShow, setPromptShow] = useState(false);
  const [AIPrompt, setAIPrompt] = useState("");
  const [access, setAccess] = useState(null);
  const [token, setToken] = useState(null);
  const [roomId, setRoomId] = useState(null);

  const isLanguageChange = useRef(false);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const themeRef = useRef(null);
  const senderId = useRef(Date.now() + Math.random());
  const latestCodeRef = useRef("");
  const isRemoteUpdate = useRef(false);
  const initialLoad = useRef(true);

  const [fontSize, setFontSize] = useState(() => {
    if (window.innerWidth >= 1024) return 15;
    if (window.innerWidth >= 768) return 14;
    return 12;
  });
  const savedCode = Session.get(`editor-code-${roomId ?? "default"}`);

  useEffect(() => {
    Local.set("editor-theme", theme);
  }, [theme]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1400) {
        setFontSize(16);
      } else if (window.innerWidth >= 1024) {
        setFontSize(15);
      } else if (window.innerWidth >= 768) {
        setFontSize(14);
      } else {
        setFontSize(12);
      }
    };

    handleResize();  
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

 
  useEffect(() => {
    const t = searchParams.get("token");
    if (!t) {  
      navigate("/");
      return;
    }
    setToken(t);

    async function validate() {
      try { 
        const res = await axios.get(`${API_URL}/room/validateRoomAccess?token=${encodeURIComponent(t)}`, {
          withCredentials: true,
        }); 
        setAccess(res.data.access);
        setRoomId(res.data.roomId); 
 
        Local.set("lastToken", t);
 
        if (!socket.connected) socket.connect();
        socket.once("connect", () => { 
          socket.emit("createRoom", { roomId: res.data.roomId, code: "", language: "javascript" });
          socket.emit("joinRoom", res.data.roomId);
        });
      } catch (err) { 
        navigate("/");
      }
    }

    validate(); 
  }, [searchParams]);
 
  useEffect(() => {
    if (!roomId) return;

    socket.on("languageChange", ({ roomId: updatedRoomId, language: newLang }) => {
      if (updatedRoomId !== roomId) return;
      setLanguage(newLang);
      setLanguageId(LANGUAGE_IDS[newLang]);
      if (!isLanguageChange.current) {
        const newCode = CODE_SNIPPETS[newLang];
        if (editorRef.current) {
          isRemoteUpdate.current = true;
          editorRef.current.setValue(newCode);
          latestCodeRef.current = newCode;
          Session.set(`editor-code-${roomId}`, newCode);
          setTimeout(() => (isRemoteUpdate.current = false), 100);
        }
      }
    });

    socket.on("updatedCode", ({ roomId: updatedRoomId, code, senderId: remoteId }) => {
      if (initialLoad.current) return;
      if (updatedRoomId !== roomId || remoteId === senderId.current) return;
      const editor = editorRef.current;
      if (!editor) return;
      const cursor = editor.getPosition();
      isRemoteUpdate.current = true;
      editor.setValue(code);
      latestCodeRef.current = code;
      Session.set(`editor-code-${roomId}`, code);
      if (cursor) editor.setPosition(cursor);
      setTimeout(() => (isRemoteUpdate.current = false), 120);
    });

    return () => {
      socket.off("languageChange");
      socket.off("updatedCode");
    };
  }, [roomId]);
 
  const onMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    initialLoad.current = true;
    setTimeout(() => {
      const initialCode = savedCode ?? CODE_SNIPPETS[language];
      initialLoad.current = false;
      editor.setValue(initialCode);
      latestCodeRef.current = initialCode;
      if (roomId) Session.set(`editor-code-${roomId}`, initialCode);
      editor.focus();
    }, 500);
  };

  const handleOnChange = useCallback(
    (newCode) => {
      if (access !== "write") return;
      if (isRemoteUpdate.current || typeof newCode !== "string") return;
      latestCodeRef.current = newCode;
      if (roomId) Session.set(`editor-code-${roomId}`, newCode);
      socket.emit("updatedCode", {
        roomId,
        code: newCode,
        senderId: senderId.current,
      });
    },
    [roomId, access]
  );
 
  const handleDebug = async () => {
    const currentCode = editorRef.current?.getValue();
    if (!currentCode?.trim()) return;

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
        if (roomId) Session.set(`editor-code-${roomId}`, debuggedCode);
        setTimeout(() => (isRemoteUpdate.current = false), 120);
      }
    } finally {
      setIsDebugging(false);
      setLoading(false);
    }
  };

  const handleAICodeEdit = async () => {
    setPromptShow(false);
    try {
      setLoading(true);
      const currentCode = editorRef.current?.getValue();
      if (!currentCode?.trim()) return;

      const res = await axios.post(
        `${API_URL}/codeAssistant/AIPrompt`,
        { prompt: AIPrompt, code: currentCode },
        { withCredentials: true }
      );

      const updatedCode = res?.data?.updatedCode ?? currentCode;
      isRemoteUpdate.current = true;
      editorRef.current.setValue(updatedCode);
      latestCodeRef.current = updatedCode;
      if (roomId) Session.set(`editor-code-${roomId}`, updatedCode);

      socket.emit("updatedCode", {
        roomId,
        code: updatedCode,
        senderId: senderId.current,
      });

      setTimeout(() => (isRemoteUpdate.current = false), 120);
      setLoading(false);
    } catch {
      setLoading(false);
    }
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
          <LanguageSelector language={language} onSelect={(sel, id) => {
            if (access !== "write") return;  
            isLanguageChange.current = true;
            setLanguage(sel);
            setLanguageId(id);
            const newCode = CODE_SNIPPETS[sel];
            isRemoteUpdate.current = true;
            editorRef.current.setValue(newCode);
            latestCodeRef.current = newCode;
            if (roomId) Session.set(`editor-code-${roomId}`, newCode);
            setTimeout(() => (isRemoteUpdate.current = false), 120);
            socket.emit("languageChange", { roomId, language: sel, senderId: senderId.current });
            setTimeout(() => { isLanguageChange.current = false; }, 200);
          }} />

          <div ref={themeRef} className="relative inline-block text-left">
            <button
              onClick={() => setThemeOpen(!themeOpen)}
              className="inline-flex justify-between items-center px-4 py-2 w-44 bg-gray-800 text-white rounded-md shadow hover:bg-gray-700"
            >
              {(() => {
                const label = THEMES.find((t) => t.value === theme)?.label || "Select Theme";
                return label.length > 10 ? label.slice(0, 12) + "..." : label;
              })()}

              <ChevronDown
                className={`ml-2 h-4 w-4 transition-transform duration-200 ${themeOpen ? "rotate-180" : ""}`}
              />
            </button>

            {themeOpen && (
              <ul className="absolute mt-2 w-44 rounded-md shadow-lg bg-gray-900 ring-1 ring-black ring-opacity-5 z-10 max-h-60 overflow-y-auto animate-fadeIn">
                {THEMES.map((t) => (
                  <li
                    key={t.value}
                    onClick={() => { setTheme(t.value); setThemeOpen(false); }}
                    className={`cursor-pointer px-2 py-2 text-sm md:text-base font-medium transition-colors ${
                      theme === t.value ? "bg-gray-800 text-blue-400" : "text-gray-200 hover:bg-gray-800 hover:text-blue-400"
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
            disabled={isDebugging || access !== "write"}
            className={`ml-auto text-white px-4 py-2 rounded-md transition ${isDebugging ? "bg-gray-700 cursor-not-allowed" : "bg-gray-800 hover:bg-blue-700"}`}
          >
            {isDebugging ? "Debugging..." : "Debug"}
          </button>
        </div>

        <Editor
          key={access ?? "no-access"}
          options={{
            minimap: { enabled: false },
            wordWrap: "on",
            fontSize: fontSize,
            scrollBeyondLastLine: false,
            readOnly: access !== "write",
          }}
          height="100%"
          theme={theme}
          language={language}
          onMount={onMount}
          onChange={handleOnChange}
        />
      </div>

      <div className="w-full custom-xl:w-1/2 h-[70vh] custom-xl:h-[90vh] bg-gray-900 rounded-lg">
        <ActionView editorRef={editorRef} language={language} languageId={languageId} roomId={roomId} access={access} />
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
