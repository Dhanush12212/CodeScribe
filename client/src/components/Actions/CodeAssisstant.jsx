import React, { useState, useRef, useEffect } from "react";
import { Loader2, Copy } from "lucide-react";
import { API_URL } from "../../../config";
import { Session, Local } from "../../utils/storage";

function CodeAssistant() {
  const [query, setQuery] = useState("");
  const [responses, setResponses] = useState(() => {
    const roomId = Local.get("roomId");
    return Session.get(`assistant_history_${roomId}`) || [];
  });
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef(null);
  const scrollRef = useRef(null);
  useEffect(() => textareaRef.current?.focus(), []);
  const [roomId] = useState(() => Local.get("roomId") || "");
  useEffect(() => {
    if (!roomId) return;
    Session.set(`assistant_history_${roomId}`, responses);
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [responses, roomId]);

  const handleAsk = async () => {
    if (!query.trim()) return;

    const userMessage = { role: "user", content: query };
    setResponses((prev) => [...prev, userMessage]);

    setQuery("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "36px"; 
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/codeAssistant/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ prompt: query }),
      });

      const data = await res.json();
      const explanation = (data.explanation || "").trim();
      const code = (data.code || "").trim();

      setResponses((prev) => [...prev, { role: "assistant", explanation: "", code: "" }]);

      const words = explanation.split(" ");
      let currentText = "";
      let index = 0;

      const stream = setInterval(() => {
        if (index < words.length) {
          currentText += (index > 0 ? " " : "") + words[index];
          setResponses((prev) => {
            const updated = [...prev];
            updated[updated.length - 1].explanation = currentText;
            return updated;
          });
          index++;
        } else {
          clearInterval(stream);
          setTimeout(() => {
            setResponses((prev) => {
              const updated = [...prev];
              updated[updated.length - 1].code = code;
              return updated;
            });
          }, 300);
        }
      }, 40);
    } catch (error) {
      setResponses((prev) => [
        ...prev,
        { role: "assistant", explanation: "Something went wrong. Please try again.", code: "" },
      ]);
    } finally {
      setLoading(false);
    }
  };


  const handleInput = (e) => {
    setQuery(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "36px";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const copyCode = (text) => {
    if (!text) return;
    try {
      navigator.clipboard.writeText(text);
    } catch (err) {}
  };

  return (
    <div
      className="relative h-[91vh] flex flex-col justify-between text-white"
      style={{ backgroundColor: "#111827", border: "1px solid #374151", overflowX: "hidden" }}
    >
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col items-center space-y-5 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900"
      >
        {responses.length > 0 ? (
          responses.map((msg, i) => (
            <div key={i} className={`w-full flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`${
                  msg.role === "user"
                    ? "bg-blue-600 text-white ml-auto max-w-md"
                    : "bg-gray-800 text-gray-100 max-w-2xl"
                } rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-md flex flex-col space-y-4`}
              >
                {msg.role === "user" && (
                  <p className="whitespace-pre-wrap text-sm sm:text-base font-medium">{msg.content}</p>
                )}
                {msg.role === "assistant" && (
                  <div className="flex flex-col space-y-4">
                    {msg.explanation && (
                      <div className="bg-gray-900 p-4 rounded-xl" style={{ border: "1px solid #374151" }}>
                        <h3 className="text-yellow-400 font-semibold mb-2 text-sm sm:text-base">🧠 Explanation</h3>
                        <p className="text-gray-300 whitespace-pre-wrap text-xs sm:text-sm leading-relaxed">
                          {msg.explanation}
                        </p>
                      </div>
                    )}
                    {msg.code && (
                      <div
                        className="bg-[#0d1117] p-4 rounded-xl overflow-x-auto relative"
                        style={{ border: "1px solid #374151" }}
                      >
                        <h3 className="text-blue-400 font-semibold mb-2 flex items-center justify-between text-sm sm:text-base">
                          <span>💻 Code</span>
                          <button
                            onClick={() => {
                              copyCode(msg.code);
                              setResponses((prev) => {
                                const updated = [...prev];
                                updated[i].copied = true;
                                return updated;
                              });
                              setTimeout(() => {
                                setResponses((prev) => {
                                  const updated = [...prev];
                                  updated[i].copied = false;
                                  return updated;
                                });
                              }, 1500);
                            }}
                            className="text-gray-400 hover:text-gray-200"
                          >
                            <Copy size={16} />
                          </button>
                        </h3>
                        <pre className="text-green-400 text-xs sm:text-sm whitespace-pre font-mono leading-6">
                          <code>{msg.code}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 mt-5 space-y-2 text-xs sm:text-sm">
            <p>Ask something to generate or explain code...</p>
            <p className="text-gray-400">
              Press: <span className="text-blue-400 font-medium">Ctrl + Shift + S</span> for AI Code Edit
            </p>
          </div>
        )}

        {loading && (
          <div className="flex justify-center">
            <div className="bg-gray-800 text-gray-300 px-3 py-2 rounded-2xl flex items-center gap-2 text-xs sm:text-sm">
              <Loader2 className="animate-spin h-4 w-4" />
              <span>Generating...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 flex items-end gap-2 sticky bottom-0" style={{ backgroundColor: "#1f2937", borderTop: "1px solid #374151" }}>
        <textarea
          ref={textareaRef}
          value={query}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Type your question..."
          className="flex-1 outline-none text-white rounded-md px-3 py-3 resize-none text-sm sm:text-base"
          style={{ backgroundColor: "#374151", border: "1px solid #4b5563", height: "36px" }}
        />
        <button
          onClick={handleAsk}
          disabled={loading}
          className="text-white px-5 py-2.5 rounded-md flex items-center justify-center gap-2 text-sm sm:text-base"
          style={{ backgroundColor: "#2563eb" }}
        >
          {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Go"}
        </button>
      </div>
    </div>
  );
}

export default CodeAssistant;
