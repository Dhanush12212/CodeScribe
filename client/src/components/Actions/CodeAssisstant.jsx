import React, { useState, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { API_URL } from "../../../config";

function CodeAssistant() {
  const [query, setQuery] = useState("");
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef(null);
  const scrollRef = useRef(null);

  // 🌀 Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [responses]);

  // 🚀 Ask AI
  const handleAsk = async () => {
    if (!query.trim()) return;

    const userMessage = { role: "user", content: query };
    setResponses((prev) => [...prev, userMessage]);
    setQuery("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/codeAssistant/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: query }),
      });

      const data = await res.json();
      const explanation = (data.explanation || "").trim();
      const code = (data.code || "").trim();

      setResponses((prev) => [
        ...prev,
        {
          role: "assistant",
          explanation,
          code,
        },
      ]);
    } catch (error) {
      console.error("❌ Error fetching AI response:", error);
      setResponses((prev) => [
        ...prev,
        {
          role: "assistant",
          explanation: "⚠️ Something went wrong. Please try again.",
          code: "",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 🧾 Auto-resize textarea
  const handleInput = (e) => {
    setQuery(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "36px";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div
      className="relative h-[92vh] flex flex-col justify-between text-white"
      style={{
        backgroundColor: "#111827",
        border: "1px solid #374151",
        overflowX: "hidden",
      }}
    >
      {/* 💬 Chat Section */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col items-center space-y-5 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900"
      >
        {responses.length > 0 ? (
          responses.map((msg, i) => (
            <div
              key={i}
              className={`w-full flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-2xl w-full rounded-2xl p-4 text-sm leading-relaxed shadow-md flex flex-col space-y-3 ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-100"
                }`}
              > 
                {msg.role === "user" && (
                  <p className="whitespace-pre-wrap text-base font-medium">
                    {msg.content}
                  </p>
                )}
 
                {msg.role === "assistant" && (
                  <div className="flex flex-col space-y-3">
                    {/* 🧠 Explanation */}
                    {msg.explanation && (
                      <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 shadow-inner">
                        <p className="text-yellow-400 font-semibold mb-2">
                          🧠 Explanation
                        </p>
                        <p className="text-gray-300 whitespace-pre-wrap text-sm tracking-wide leading-relaxed text-justify break-words">
                          {msg.explanation
                            .replace(/[{}"]/g, " ")
                            .replace(/\s{2,}/g, " ")
                            .replace(/([a-z])([A-Z])/g, "$1 $2")}
                        </p>
                      </div>
                    )}

                    {/* 💻 Code */}
                    {msg.code && (
                      <div className="bg-[#0d1117] p-4 rounded-xl border border-gray-700 shadow-inner overflow-x-auto">
                        <p className="text-blue-400 font-semibold mb-2">
                          💻 Code
                        </p>
                        <pre
                          className="text-green-400 text-sm whitespace-pre-wrap font-mono leading-6"
                          style={{
                            backgroundColor: "#0d1117",
                            borderRadius: "8px",
                            padding: "8px",
                            overflowX: "auto",
                          }}
                        >
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
          <p className="text-gray-500 text-center mt-5">
            Ask something to generate or debug code...
          </p>
        )}

        {/* ⏳ Loading bubble */}
        {loading && (
          <div className="flex justify-center">
            <div className="bg-gray-800 text-gray-300 px-3 py-2 rounded-2xl flex items-center gap-2">
              <Loader2 className="animate-spin h-4 w-4" />
              <span>Generating...</span>
            </div>
          </div>
        )}
      </div>

      {/* 📝 Input Section */}
      <div
        className="p-3 flex items-end gap-2 sticky bottom-0"
        style={{ backgroundColor: "#1f2937", borderTop: "1px solid #374151" }}
      >
        <textarea
          ref={textareaRef}
          value={query}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Type your question..."
          className="flex-1 outline-none text-white rounded-md px-3 py-3 resize-none overflow-hidden text-base"
          style={{
            backgroundColor: "#374151",
            border: "1px solid #4b5563",
            height: "36px",
          }}
        />
        <button
          onClick={handleAsk}
          disabled={loading}
          className={`text-white px-5 py-2.5 rounded-md flex items-center justify-center gap-2 mb-1 shadow-md ${
            loading ? "opacity-80 cursor-not-allowed" : ""
          }`}
          style={{ backgroundColor: "#2563eb" }}
        >
          {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Go"}
        </button>
      </div>
    </div>
  );
}

export default CodeAssistant;
